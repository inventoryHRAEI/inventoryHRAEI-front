#!/usr/bin/env node
// Small helper that starts a localtunnel to the Vite dev server port (5173 by default)
// Usage: node scripts/run-tunnel.js [--port=5173] [--subdomain=name]

const localtunnel = require('localtunnel')

async function run() {
  const args = process.argv.slice(2)
  const portArg = args.find(a => a.startsWith('--port='))
  const subArg = args.find(a => a.startsWith('--subdomain='))
  const port = portArg ? Number(portArg.split('=')[1]) : (process.env.PORT ? Number(process.env.PORT) : 5173)
  const subdomain = subArg ? subArg.split('=')[1] : process.env.LT_SUBDOMAIN

  try {
    const tunnel = await localtunnel({ port, subdomain })
    console.log('\n✅ localtunnel is running')
    console.log('Open this URL from your mobile device (HTTPS):')
    console.log('  ' + tunnel.url + '\n')
    console.log('To stop the tunnel press Ctrl+C')

    tunnel.on('close', () => {
      console.log('Tunnel closed')
      process.exit(0)
    })

    process.on('SIGINT', async () => {
      await tunnel.close()
      process.exit(0)
    })
  } catch (err) {
    console.error('Failed to start localtunnel:', err.message || err)
    process.exit(1)
  }
}

run()
