#!/usr/bin/env node
/* run-cloudflared-preview.js
   Starts a production-like server (vite build + vite preview) and exposes it via a Cloudflare quick tunnel.
   Goal: make tunnel loads consistently fast and stable (no HMR websockets).

   Usage:
     node ./scripts/run-cloudflared-preview.js

   Optional env:
     VITE_PREVIEW_PORT=4173
     VITE_SKIP_BUILD=1
*/

import fs from 'fs'
import path from 'path'
import https from 'https'
import { spawn } from 'child_process'

const BIN_DIR = path.resolve(process.cwd(), '.bin')
if (!fs.existsSync(BIN_DIR)) fs.mkdirSync(BIN_DIR, { recursive: true })

function getBinaryInfo() {
  const platform = process.platform
  if (platform === 'win32') {
    return {
      file: 'cloudflared.exe',
      url: 'https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe'
    }
  }
  if (platform === 'linux') {
    return {
      file: 'cloudflared',
      url: 'https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64'
    }
  }
  if (platform === 'darwin') {
    return {
      file: 'cloudflared',
      url: 'https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-darwin-amd64'
    }
  }
  throw new Error(`Unsupported platform: ${platform}`)
}

async function downloadBinary(destPath, url) {
  return new Promise((resolve, reject) => {
    console.log('[cloudflared] downloading', url)
    const file = fs.createWriteStream(destPath, { mode: 0o755 })
    https
      .get(url, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return downloadBinary(destPath, res.headers.location).then(resolve).catch(reject)
        }
        if (res.statusCode !== 200) return reject(new Error(`Unexpected status ${res.statusCode}`))
        res.pipe(file)
        file.on('finish', () => file.close(() => resolve()))
      })
      .on('error', (err) => {
        try {
          fs.rmSync(destPath, { force: true })
        } catch {}
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
  await downloadBinary(dest, url)
  try {
    if (process.platform !== 'win32') fs.chmodSync(dest, 0o755)
  } catch {}
  console.log('[cloudflared] downloaded to', dest)
  return dest
}

async function waitForPort(host, port, timeout = 25000) {
  const net = await import('net')
  const start = Date.now()
  return new Promise((resolve, reject) => {
    const tryConnect = () => {
      const socket = new net.Socket()
      socket.setTimeout(2000)
      socket.once('error', () => {
        socket.destroy()
        retry()
      })
      socket.once('timeout', () => {
        socket.destroy()
        retry()
      })
      socket.once('connect', () => {
        socket.destroy()
        resolve(true)
      })
      socket.connect(port, host)
    }
    const retry = () => {
      if (Date.now() - start > timeout) return reject(new Error('timeout'))
      setTimeout(tryConnect, 500)
    }
    tryConnect()
  })
}

function getViteBin() {
  const viteBin = process.platform === 'win32' ? 'vite.cmd' : 'vite'
  return path.resolve(process.cwd(), 'node_modules', '.bin', viteBin)
}

async function run() {
  const binPath = await ensureBinary()

  const previewPort = process.env.VITE_PREVIEW_PORT ? Number(process.env.VITE_PREVIEW_PORT) : 4173
  const skipBuild = process.env.VITE_SKIP_BUILD === '1' || process.env.VITE_SKIP_BUILD === 'true'

  let previewChild = null
  let cloudChild = null

  const killAll = () => {
    try {
      if (cloudChild && !cloudChild.killed) cloudChild.kill('SIGINT')
    } catch {}
    try {
      if (previewChild && !previewChild.killed) previewChild.kill('SIGINT')
    } catch {}
  }

  process.on('SIGINT', () => {
    killAll()
    process.exit(0)
  })

  // Build once for best tunnel performance
  if (!skipBuild) {
    console.log('[tunnel-fast] running `vite build` (production bundle)')
    const vitePath = getViteBin()
    const buildChild = spawn(vitePath, ['build', '--config', 'vite.config.mjs'], {
      stdio: 'inherit',
      shell: true,
      env: Object.assign({}, process.env, {
        NODE_ENV: 'production'
      })
    })
    const buildCode = await new Promise((resolve) => buildChild.on('exit', resolve))
    if (buildCode !== 0) {
      throw new Error(`vite build failed with exit code ${buildCode}`)
    }
  } else {
    console.log('[tunnel-fast] VITE_SKIP_BUILD set: skipping build')
  }

  // Start vite preview
  console.log(`[tunnel-fast] starting vite preview on http://127.0.0.1:${previewPort}`)
  const vitePath = getViteBin()
  previewChild = spawn(vitePath, ['preview', '--host', '127.0.0.1', '--port', String(previewPort), '--strictPort'], {
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: true,
    env: Object.assign({}, process.env, {
      NODE_ENV: 'production'
    })
  })
  previewChild.stdout.setEncoding('utf8')
  previewChild.stderr.setEncoding('utf8')
  previewChild.stdout.on('data', (d) => process.stdout.write(`[preview] ${d}`))
  previewChild.stderr.on('data', (d) => process.stderr.write(`[preview] ${d}`))

  await waitForPort('127.0.0.1', previewPort, 30000)

  // Start cloudflared quick tunnel to preview server
  console.log(`[tunnel-fast] launching Cloudflare quick tunnel -> http://127.0.0.1:${previewPort}`)
  cloudChild = spawn(binPath, ['tunnel', '--url', `http://127.0.0.1:${previewPort}`], {
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: true
  })

  cloudChild.stdout.setEncoding('utf8')
  cloudChild.stderr.setEncoding('utf8')

  let urlFound = false
  const onUrl = (publicUrl) => {
    if (urlFound) return
    urlFound = true
    console.log('[tunnel-fast] Public URL:', publicUrl)
    try {
      const outPath = path.join(process.cwd(), 'public', 'cloudflare-url.json')
      fs.writeFileSync(outPath, JSON.stringify({ url: publicUrl, hmrDisabled: true, mode: 'preview' }, null, 2))
      console.log('[tunnel-fast] wrote public URL to', outPath)
    } catch (e) {
      console.warn('[tunnel-fast] could not write public URL file:', e && e.message)
    }
  }

  const scanForUrl = (chunk) => {
    const all = String(chunk).match(/https?:\/\/[\w\-._~:/?#[\]@!$&'()*+,;=%]+/ig) || []
    const preferred = all.find((u) => /trycloudflare\.com/i.test(u)) || all[0]
    if (preferred) onUrl(preferred)
  }

  cloudChild.stdout.on('data', (d) => {
    process.stdout.write(`[cloudflared] ${d}`)
    scanForUrl(d)
  })
  cloudChild.stderr.on('data', (d) => {
    process.stderr.write(`[cloudflared] ${d}`)
    scanForUrl(d)
  })

  cloudChild.on('exit', (code) => {
    console.log('[cloudflared] exited with code', code)
    killAll()
    process.exit(code ?? 0)
  })

  previewChild.on('exit', (code) => {
    console.log('[preview] exited with code', code)
    killAll()
    process.exit(code ?? 0)
  })
}

run().catch((e) => {
  console.error('[tunnel-fast] failed:', e && e.message ? e.message : e)
  process.exit(1)
})
