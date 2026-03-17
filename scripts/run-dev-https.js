#!/usr/bin/env node
// run-dev-https.js
// Ensures self-signed certs exist, then starts Vite with HTTPS enabled.

import fs from 'fs'
import path from 'path'
import os from 'os'
import net from 'net'
import { spawn } from 'child_process'
import selfsigned from 'selfsigned'

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

  // Auto-generate self-signed certificates if they don't exist
  console.log('[dev:https] mkcert certificates not found. Generating self-signed certificates...')
  
  const certsDir = path.resolve(process.cwd(), '.certs')
  if (!fs.existsSync(certsDir)) {
    fs.mkdirSync(certsDir, { recursive: true })
  }

  try {
    const attrs = [{ name: 'commonName', value: 'localhost' }]
    const pems = selfsigned.generate(attrs, { days: 365 })
    
    fs.writeFileSync(certFile, pems.cert)
    fs.writeFileSync(keyFile, pems.private)
    
    console.log('[dev:https] Self-signed certificates generated successfully')
    return true
  } catch (err) {
    console.error('[dev:https] Failed to generate self-signed certificates:', err.message)
    return false
  }
}

function isPortAvailable(port, host = '0.0.0.0') {
  return new Promise((resolve) => {
    const server = net.createServer()
    server.once('error', () => resolve(false))
    server.once('listening', () => {
      server.close(() => resolve(true))
    })
    server.listen(port, host)
  })
}

async function findAvailablePort(startPort = 5173, maxAttempts = 20) {
  let port = Number(startPort) || 5173
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const free = await isPortAvailable(port)
    if (free) return port
    port += 1
  }
  throw new Error(`No available port found starting from ${startPort}`)
}

async function startVite() {
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

  const preferredPort = process.env.VITE_PORT ? parseInt(process.env.VITE_PORT, 10) : 5173
  const selectedPort = await findAvailablePort(preferredPort)
  env.VITE_PORT = String(selectedPort)
  if (selectedPort !== preferredPort) {
    console.warn(`[dev:https] Port ${preferredPort} is busy. Using port ${selectedPort}`)
  }

  console.log(`[dev:https] starting Vite with HTTPS on port ${env.VITE_PORT}`)
  const child = spawn(vitePath, ['--config', 'vite.config.mjs'], { stdio: 'inherit', env, shell: true })
  child.on('exit', (code) => process.exit(code ?? 0))
}

startVite()
