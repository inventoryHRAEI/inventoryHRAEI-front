// generate-selfsigned.js
// Generates a self-signed certificate for localhost and local LAN IPs and writes to ./.certs/
// Usage: node ./scripts/generate-selfsigned.js

import fs from 'fs'
import os from 'os'
import path from 'path'
import selfsigned from 'selfsigned'

const certDir = path.resolve(process.cwd(), '.certs')
if (!fs.existsSync(certDir)) fs.mkdirSync(certDir, { recursive: true })

// Collect hostnames: localhost + local IPv4 addresses
const hosts = new Set(['localhost', '127.0.0.1'])
const nets = os.networkInterfaces()
for (const name of Object.keys(nets)) {
  for (const ni of nets[name]) {
    if (ni.family === 'IPv4' && !ni.internal) hosts.add(ni.address)
  }
}
const altNames = Array.from(hosts)
console.log('[selfsigned] generating cert for:', altNames.join(', '))

const attrs = [{ name: 'commonName', value: 'localhost' }]
const opts = {
  days: 365,
  algorithm: 'sha256',
  extensions: [{ name: 'subjectAltName', altNames: altNames.map((h) => ({ type: 2, value: h })) }]
}
const pems = selfsigned.generate(attrs, opts)

const certFile = path.join(certDir, 'dev-cert.pem')
const keyFile = path.join(certDir, 'dev-key.pem')
fs.writeFileSync(certFile, pems.cert)
fs.writeFileSync(keyFile, pems.private)

// Write dev-hosts.json with HTTPS URLs for local access
try {
  const publicDir = path.resolve(process.cwd(), 'public')
  if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true })
  const urls = Array.from(hosts).map((h) => `https://${h}:5173`)
  const outPath = path.join(publicDir, 'dev-hosts.json')
  fs.writeFileSync(outPath, JSON.stringify({ hosts: urls }, null, 2))
  console.log('[selfsigned] wrote dev-hosts.json ->', outPath)
} catch (e) {
  console.warn('[selfsigned] could not write dev-hosts.json:', e && e.message)
}

console.log('[selfsigned] written:')
console.log('  cert ->', certFile)
console.log('  key  ->', keyFile)
console.log('\nReminder: this certificate is self-signed and NOT trusted by browsers by default.')
console.log('Open the https://<your-ip>:5173 URL in your phone and accept the warning to proceed (or install the cert on the device for a trusted experience).')
