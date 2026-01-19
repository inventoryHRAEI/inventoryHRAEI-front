mkcert local HTTPS setup (dev)

This project includes a helper script to generate development HTTPS certificates using `mkcert`.

Steps (Windows PowerShell):

1. Install mkcert (no payment):
   - Using Chocolatey: `choco install mkcert`
   - Or follow: https://github.com/FiloSottile/mkcert#installation

2. Run the helper (open PowerShell as Administrator):
   .\scripts\setup-mkcert.ps1

   This will create `./.certs/dev-cert.pem` and `./.certs/dev-key.pem` with your local IPs and `localhost`.

3. Create a `.env` file (in `inventoryHRAEI-front` root) and add:

   VITE_USE_HTTPS=true
   VITE_HTTPS_CERT=./.certs/dev-cert.pem
   VITE_HTTPS_KEY=./.certs/dev-key.pem

4. Start dev server with HTTPS:

   npm run dev:https

5. Open the app using your local IP with https, e.g.: `https://192.168.1.5:5173`

Notes:
- mkcert is free and only installs a local CA; browsers will trust the certificates created by it on your machine.
- If you prefer Linux or Mac instructions, see mkcert docs linked above.

Self-signed fallback (no installs required):

If you don't want to install anything, the project includes a fallback generator that creates self-signed certificates (not trusted by browsers) but lets you run HTTPS locally for quick testing:

1. Generate self-signed certs:
   npm run gen:selfsigned

2. Start HTTPS dev server:
   npm run dev:https

3. Open the HTTPS LAN URL shown in the console (e.g., https://192.168.x.y:5173). You'll need to accept the browser warning to proceed.

Tradeoffs:
- Self-signed certs will trigger browser warnings until you explicitly accept or install the cert on the device.
- For a fully trusted, seamless experience on phones, use `mkcert` (recommended), or a cloud tunnel solution like Cloudflare Tunnel (no payment required for small teams).
