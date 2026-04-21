#!/usr/bin/env node
// update-dev-hosts.js
// Updates dev-hosts.json with current network addresses

import fs from 'fs'
import path from 'path'
import os from 'os'

function updateDevHosts() {
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
  const hostData = { hosts, timestamp: Date.now() }
  fs.writeFileSync(devHostsFile, JSON.stringify(hostData, null, 2))
  
  console.log('[update-hosts] Updated with addresses:', hosts)
  return hosts
}

// If called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  updateDevHosts()
}

export default updateDevHosts