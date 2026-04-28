#!/usr/bin/env node
/* run-cloudflared.js
   Downloads cloudflared (if needed) into .bin and runs an ephemeral tunnel
   Usage: node ./scripts/run-cloudflared.js
*/
import fs from 'fs'
import path from 'path'
import os from 'os'
import { spawn, exec } from 'child_process'
import https from 'https'

const BIN_DIR = path.resolve(process.cwd(), '.bin')
if (!fs.existsSync(BIN_DIR)) fs.mkdirSync(BIN_DIR, { recursive: true })

let startedVite = false

function getBinaryInfo() {
  const platform = process.platform
  const arch = process.arch
  if (platform === 'win32') {
    return { file: 'cloudflared.exe', url: 'https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe' }
  }
  if (platform === 'linux') {
    return { file: 'cloudflared', url: 'https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64' }
  }
  if (platform === 'darwin') {
    return { file: 'cloudflared', url: 'https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-darwin-amd64' }
  }
  throw new Error(`Unsupported platform: ${platform}`)
}

async function downloadBinary(destPath, url) {
  return new Promise((resolve, reject) => {
    console.log('[cloudflared] downloading', url)
    const file = fs.createWriteStream(destPath, { mode: 0o755 })
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        // follow redirect
        return downloadBinary(destPath, res.headers.location).then(resolve).catch(reject)
      }
      if (res.statusCode !== 200) return reject(new Error(`Unexpected status ${res.statusCode}`))
      res.pipe(file)
      file.on('finish', () => {
        file.close(() => resolve())
      })
    }).on('error', (err) => {
      fs.unlinkSync(destPath, { force: true })
      reject(err)
    })
  })
}

async function ensureBinary() {
  const { file, url } = getBinaryInfo()
  const dest = path.join(BIN_DIR, file)
  if (fs.existsSync(dest)) {
    console.log('[cloudflared] found existing binary at', dest)
    return dest
  }
  try {
    await downloadBinary(dest, url)
    if (process.platform !== 'win32') fs.chmodSync(dest, 0o755)
    console.log('[cloudflared] downloaded to', dest)
    return dest
  } catch (e) {
    console.error('[cloudflared] download failed:', e && e.message)
    throw e
  }
}

async function waitForPort(host, port, timeout = 20000) {
  const net = await import('net')
  const start = Date.now()
  return new Promise((resolve, reject) => {
    const tryConnect = () => {
      const s = new net.Socket()
      s.setTimeout(2000)
      s.once('error', () => { s.destroy(); retry() })
      s.once('timeout', () => { s.destroy(); retry() })
      s.once('connect', () => { s.destroy(); resolve(true) })
      s.connect(port, host)
    }
    const retry = () => {
      if (Date.now() - start > timeout) return reject(new Error('timeout'))
      setTimeout(tryConnect, 500)
    }
    tryConnect()
  })
}

async function runCloudflared(binPath) {
  const port = 5173 // Use standard port
  let viteChild = null
  let cloudChild = null

  const startViteWithHost = (cfHost) => {
    if (startedVite) return
    startedVite = true
    const env = Object.assign({}, process.env, { VITE_USE_HTTPS: 'false' })
    if (cfHost) env.VITE_CLOUDFLARE_HOST = cfHost
    console.log(`[cloudflared] starting Vite dev server in HTTP mode on port ${port} (HMR host: ${cfHost || 'local'})`)
    const viteBin = process.platform === 'win32' ? 'vite.cmd' : 'vite'
    const vitePath = path.resolve(process.cwd(), 'node_modules', '.bin', viteBin)
    viteChild = spawn(vitePath, ['--config', 'vite.config.mjs'], { stdio: ['ignore', 'pipe', 'pipe'], env, shell: true })
    viteChild.stdout.setEncoding('utf8')
    viteChild.stderr.setEncoding('utf8')
    viteChild.stdout.on('data', (d) => process.stdout.write(`[vite] ${d}`))
    viteChild.stderr.on('data', (d) => process.stderr.write(`[vite] ${d}`))
    viteChild.on('exit', (code) => {
      console.log('[vite] exited with code', code)
    })
  }

  try {
    console.log(`[cloudflared] ensuring Vite is running (local HMR) before launching tunnel`)
    if (!startedVite) startViteWithHost(null)

    console.log(`[cloudflared] launching tunnel via 'tunnel --url' command to http://127.0.0.1:${port}`)
    // Use 'tunnel --url' for quick ephemeral tunnels (no cert needed)
    cloudChild = spawn(binPath, ['tunnel', '--url', `http://127.0.0.1:${port}`], { stdio: ['ignore', 'pipe', 'pipe'], shell: true })
    cloudChild.stdout.setEncoding('utf8')
    cloudChild.stderr.setEncoding('utf8')

    let publicUrl = null
    let urlFound = false
    const urlTimeout = setTimeout(() => {
      if (!urlFound) console.warn('[cloudflared] public URL not found within timeout')
    }, 30000)

    async function checkPublicUrlHealth(u, timeoutMs = 10000) {
      const httpsLib = await import('https')
      const start = Date.now()
      const maxAttempts = 8
      const attemptDelay = Math.min(1500, Math.max(500, Math.floor(timeoutMs / maxAttempts)))
      for (let i = 0; i < maxAttempts; i++) {
        try {
          const ok = await new Promise((resolve, reject) => {
            const req = httpsLib.request(u, { method: 'HEAD', timeout: 4000 }, (res) => {
              resolve(res.statusCode && res.statusCode < 500)
            })
            req.on('error', (e) => reject(e))
            req.on('timeout', () => { req.destroy(); reject(new Error('timeout')) })
            req.end()
          })
          if (ok) return true
        } catch (e) {
          // ignore and retry
        }
        if (Date.now() - start > timeoutMs) break
        await new Promise(r => setTimeout(r, attemptDelay))
      }
      return false
    }

    cloudChild.stdout.on('data', (d) => {
      process.stdout.write(`[cloudflared] ${d}`)
      // Try to find the public URL from stdout
      if (!urlFound) {
        const match = String(d).match(/https?:\/\/[^\s)]+/i)
        if (match) {
          urlFound = true
          clearTimeout(urlTimeout)
          publicUrl = match[0]
          console.log('[cloudflared] Public URL (stdout):', publicUrl)
          try {
            const outPath = path.join(process.cwd(), 'public', 'cloudflare-url.json')
            fs.writeFileSync(outPath, JSON.stringify({ url: publicUrl, hmrDisabled: false }, null, 2))
            console.log('[cloudflared] wrote public URL to', outPath)
          } catch (err) {
            console.warn('[cloudflared] could not write public URL file:', err && err.message)
          }
        }
      }
    })

    cloudChild.stderr.on('data', (d) => {
      process.stderr.write(`[cloudflared] ${d}`)
      if (!urlFound) {
        const all = String(d).match(/https?:\/\/[^\s)]+/ig) || []
        const preferred = all.find(u => /trycloudflare\.com|ngrok|loca\.lt|localtunnel|ngrok-free\.dev/i.test(u))
        if (preferred) {
          urlFound = true
          clearTimeout(urlTimeout)
          publicUrl = preferred
          console.log('[cloudflared] Public URL (stderr):', publicUrl)
          try {
            const outPath = path.join(process.cwd(), 'public', 'cloudflare-url.json')
            fs.writeFileSync(outPath, JSON.stringify({ url: publicUrl, hmrDisabled: false }, null, 2))
            console.log('[cloudflared] wrote public URL to', outPath)
          } catch (err) {
            console.warn('[cloudflared] could not write public URL file:', err && err.message)
          }
          const host = publicUrl.replace(/^https?:\/\//i, '').replace(/\/$/, '')
          // By default disable HMR for quick tunnels
          const isQuick = /trycloudflare\.com|ngrok-free\.dev|ngrok|loca\.lt/i.test(host)
          if (isQuick && !process.env.VITE_FORCE_ENABLE_HMR) {
            console.warn('[cloudflared] Quick tunnel detected; HMR disabled for stability')
            process.env.VITE_DISABLE_HMR = '1'
            try {
              const outPath = path.join(process.cwd(), 'public', 'cloudflare-url.json')
              fs.writeFileSync(outPath, JSON.stringify({ url: publicUrl, hmrDisabled: true }, null, 2))
            } catch (err) {}
            return
          }
          // Check tunnel health before offering HMR
          checkPublicUrlHealth(publicUrl).then((healthy) => {
            if (!healthy) {
              console.warn('[cloudflared] public URL health check failed; HMR disabled')
              process.env.VITE_DISABLE_HMR = '1'
              try {
                const outPath = path.join(process.cwd(), 'public', 'cloudflare-url.json')
                fs.writeFileSync(outPath, JSON.stringify({ url: publicUrl, hmrDisabled: true }, null, 2))
              } catch (err) {}
              return
            }
            // Healthy tunnel, restart Vite with HMR if forced
            if (process.env.VITE_FORCE_ENABLE_HMR === '1' || process.env.VITE_FORCE_ENABLE_HMR === 'true') {
              console.log('[cloudflared] Restarting Vite with tunnel HMR')
              if (viteChild && !viteChild.killed) {
                viteChild.kill('SIGINT')
                startedVite = false
                setTimeout(() => startViteWithHost(host), 400)
              } else {
                startViteWithHost(host)
              }
            }
          }).catch((e) => {
            console.warn('[cloudflared] health check errored:', e && e.message)
          })
        }
      }
      // Handle tunnel errors
      if (/stream .* canceled by remote/i.test(String(d)) || String(d).includes('Request failed')) {
        console.warn('[cloudflared] Stream error detected; restarting tunnel')
        try { cloudChild.kill('SIGINT') } catch (e) {}
        setTimeout(() => runCloudflared(binPath), 1000)
      }
    })

    cloudChild.on('exit', (code) => {
      console.log('[cloudflared] exited with code', code)
      if (code !== 0 && code !== null) {
        console.log('[cloudflared] Restarting tunnel due to exit code', code)
        setTimeout(() => runCloudflared(binPath), 1000)
      }
    })

    process.on('SIGINT', () => {
      try { if (cloudChild && !cloudChild.killed) cloudChild.kill('SIGINT') } catch (e) {}
      try { if (viteChild && !viteChild.killed) viteChild.kill('SIGINT') } catch (e) {}
      process.exit(0)
    })

    return new Promise((resolve, reject) => {
      cloudChild.on('close', (code) => resolve(code))
    })
  } catch (e) {
    console.error('[cloudflared] failed to launch:', e && e.message)
    if (!startedVite) startViteWithHost(null)
    throw e
  }
}

async function main() {
  const bin = await ensureBinary()
  const port = 5173
  let viteChild = null
  let cloudflaredChild = null
  let startedVite = false

  const startVite = () => {
    if (startedVite) return
    startedVite = true
    const env = Object.assign({}, process.env, { VITE_USE_HTTPS: 'false' })
    console.log(`[dev] Starting Vite on http://localhost:${port}`)
    const viteBin = process.platform === 'win32' ? 'vite.cmd' : 'vite'
    const vitePath = path.resolve(process.cwd(), 'node_modules', '.bin', viteBin)
    viteChild = spawn(vitePath, ['--config', 'vite.config.mjs'], { stdio: 'inherit', env, shell: true })
    viteChild.on('exit', () => {
      process.exit(0)
    })
  }

  // Start Vite immediately (non-blocking)
  startVite()

  // Try to start cloudflared tunnel in background (don't block or fail if it doesn't work)
  try {
    console.log(`[tunnel] Attempting Cloudflare tunnel...`)
    cloudflaredChild = spawn(bin, ['tunnel', '--url', `http://127.0.0.1:${port}`], { 
      stdio: ['ignore', 'pipe', 'pipe'],
      detached: true
    })
    
    cloudflaredChild.stdout.on('data', (d) => {
      const str = String(d)
      console.log(`[tunnel] ${str}`)
      // Try to extract public URL
      const match = str.match(/https?:\/\/[^\s)]+/i)
      if (match) {
        try {
          const outPath = path.join(process.cwd(), 'public', 'cloudflare-url.json')
          fs.writeFileSync(outPath, JSON.stringify({ url: match[0], hmrDisabled: true }, null, 2))
          console.log(`[tunnel] Public URL written to public/cloudflare-url.json`)
        } catch (err) {
          // ignore
        }
      }
    })
    
    cloudflaredChild.stderr.on('data', (d) => {
      const str = String(d)
      // Only log actual errors, not cert warnings
      if (!/cert\.pem|origin certificate|TUNNEL_ORIGIN_CERT/i.test(str)) {
        console.log(`[tunnel] ${str}`)
      }
    })
    
    cloudflaredChild.on('exit', (code) => {
      console.warn(`[tunnel] Disconnected (code ${code}), Vite continues on local`)
    })
  } catch (err) {
    console.warn(`[tunnel] Failed to start (Vite continues local):`, err.message)
  }

  // Keep main process alive
  process.on('SIGINT', () => {
    try { cloudflaredChild?.kill() } catch (e) {}
    try { viteChild?.kill('SIGINT') } catch (e) {}
    process.exit(0)
  })
}

main()
