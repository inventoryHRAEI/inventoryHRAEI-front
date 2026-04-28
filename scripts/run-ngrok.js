#!/usr/bin/env node
// Starts an ngrok tunnel to the Vite dev server port (5173 by default)
// This helper waits until the local server is reachable then spawns `npx ngrok` which
// avoids library-specific configuration issues seen on some Windows setups.
// Usage:
//   node ./scripts/run-ngrok.js --port=5173 --subdomain=myname
// or set env NGROK_AUTHTOKEN and NGROK_SUBDOMAIN

const { spawn } = require('child_process')
const net = require('net')

async function waitForPort(port, host = '127.0.0.1', timeout = 10000) {
  const start = Date.now()
  return new Promise((resolve, reject) => {
    const tryConnect = () => {
      const s = net.createConnection({ port, host }, () => {
        s.destroy()
        resolve(true)
      })
      s.on('error', () => {
        s.destroy()
        if (Date.now() - start > timeout) return reject(new Error('timeout'))
        setTimeout(tryConnect, 250)
      })
    }
    tryConnect()
  })
}

async function run() {
  const args = process.argv.slice(2)
  const argVal = (name) => {
    const a = args.find(x => x.startsWith(name + '='))
    return a ? a.split('=')[1] : null
  }

  const port = Number(argVal('--port') || process.env.PORT || 5173)
  const authtoken = process.env.NGROK_AUTHTOKEN || argVal('--authtoken')
  const subdomain = process.env.NGROK_SUBDOMAIN || argVal('--subdomain')

  if (authtoken) process.env.NGROK_AUTHTOKEN = authtoken
  if (!process.env.NGROK_AUTHTOKEN) {
    console.warn('\n⚠️  No NGROK_AUTHTOKEN found. The tunnel will still work but you may have limits.');
    console.warn('See: https://dashboard.ngrok.com/get-started/your-authtoken\n')
  }

  console.log(`Waiting for local server on 127.0.0.1:${port}...`)
  try {
    await waitForPort(port, '127.0.0.1', 12000)
  } catch (e) {
    console.error('Timed out waiting for local server on port', port)
    console.error('Make sure `npm run dev` is running and listen on port', port)
    process.exit(1)
  }

  const ngrokArgs = ['ngrok', 'http', `127.0.0.1:${port}`, '--log=stdout']
  if (subdomain) ngrokArgs.push('--subdomain', subdomain)

  console.log('\nSpawning: npx ' + ngrokArgs.join(' '))
  const p = spawn('npx', ngrokArgs, { stdio: 'inherit', shell: true })

  p.on('exit', (code, signal) => {
    console.log('ngrok process exited', code, signal)
    process.exit(code || 0)
  })

  process.on('SIGINT', () => {
    try { p.kill('SIGINT') } catch (e) {}
    process.exit(0)
  })
}

run()
