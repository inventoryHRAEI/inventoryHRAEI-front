#!/usr/bin/env node
// run-dev-https.js
// Ensures self-signed certs exist, then starts Vite with HTTPS enabled.

import fs from 'fs'
import path from 'path'
import { spawn } from 'child_process'

const certFile = path.resolve(process.cwd(), '.certs', 'dev-cert.pem')
const keyFile = path.resolve(process.cwd(), '.certs', 'dev-key.pem')

function ensureCerts() {
  if (fs.existsSync(certFile) && fs.existsSync(keyFile)) return true

  console.log('[dev:https] certificates not found. Generating self-signed certs...')
  const nodeCmd = process.platform === 'win32' ? 'node.exe' : 'node'
  const genScript = path.resolve(process.cwd(), 'scripts', 'generate-selfsigned.js')
  const res = spawn(nodeCmd, [genScript], { stdio: 'inherit' })

  return new Promise((resolve) => {
    res.on('exit', (code) => {
      resolve(code === 0)
    })
  })
}

async function startVite() {
  const ok = await ensureCerts()
  if (!ok) {
    console.error('[dev:https] failed to generate certs; aborting')
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
