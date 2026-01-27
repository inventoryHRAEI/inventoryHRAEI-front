#!/usr/bin/env node
// run-dev-https.js
// Ensures self-signed certs exist, then starts Vite with HTTPS enabled.

import fs from 'fs'
import path from 'path'
import os from 'os'
import { spawn } from 'child_process'

const certFile = path.resolve(process.cwd(), '.certs', 'localhost.pem')
const keyFile = path.resolve(process.cwd(), '.certs', 'localhost-key.pem')

function generateDevHosts() {
  const networkInterfaces = os.networkInterfaces()
  const hosts = []
  
  // Get all IPv4 addresses (excluding internal ones)
  Object.keys(networkInterfaces).forEach(interfaceName => {
    const addresses = networkInterfaces[interfaceName]
    addresses.forEach(addr => {
      if (addr.family === 'IPv4' && !addr.internal) {
        hosts.push(addr.address)
      }
    })
  })
  
  // Always include localhost
  hosts.unshift('localhost')
  
  // Write to public folder for frontend access
  const publicDir = path.resolve(process.cwd(), 'public')
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true })
  }
  
  const devHostsFile = path.resolve(publicDir, 'dev-hosts.json')
  fs.writeFileSync(devHostsFile, JSON.stringify({ hosts }, null, 2))
  
  console.log('[dev:https] Generated dev-hosts.json with network addresses:', hosts)
  return hosts
}

function ensureCerts() {
  if (fs.existsSync(certFile) && fs.existsSync(keyFile)) return true

  console.log('[dev:https] mkcert certificates not found. Please run: npm run mkcert:setup')
  console.log('[dev:https] or generate manually: mkcert -key-file .certs/localhost-key.pem -cert-file .certs/localhost.pem localhost')
  return false
}

function startVite() {
  // Generate network hosts before starting
  generateDevHosts()
  
  const ok = ensureCerts()
  if (!ok) {
    console.error('[dev:https] failed to find mkcert certificates; aborting')
    process.exit(1)
  }

  const viteBin = process.platform === 'win32' ? 'vite.cmd' : 'vite'
  const vitePath = path.resolve(process.cwd(), 'node_modules', '.bin', viteBin)

  const env = Object.assign({}, process.env, {
    VITE_USE_HTTPS: 'true',
    VITE_HTTPS_CERT: certFile,
    VITE_HTTPS_KEY: keyFile
  })

  console.log('[dev:https] starting Vite with HTTPS')
  const child = spawn(vitePath, ['--config', 'vite.config.mjs'], { stdio: 'inherit', env, shell: true })
  child.on('exit', (code) => process.exit(code ?? 0))
}

startVite()
