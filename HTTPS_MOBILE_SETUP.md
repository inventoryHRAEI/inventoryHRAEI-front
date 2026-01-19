Testing over HTTPS from mobile (quick setup) ✅

Option A — Temporary HTTPS with localtunnel (recommended, fastest)

1. Start the dev server with the tunnel: from project root run:

   npm run dev:tunnel

2. Wait until you see the printed HTTPS URL in the console, e.g. https://random-subdomain.loca.lt
3. Open that URL on your mobile browser. Camera access will work (HTTPS) and the Maintenance Scanner should be able to request camera permission.

Notes:
- This uses third-party tunnel service (localtunnel) to expose your localhost via HTTPS.
- If you want a static subdomain, set the env var LT_SUBDOMAIN before running, e.g.
  LT_SUBDOMAIN=myname npm run dev:tunnel

Option B — Local HTTPS (mkcert) — more setup, local trust

1. Install mkcert: https://github.com/FiloSottile/mkcert
2. Create and trust local CA on your machine (follow mkcert docs):
   mkcert -install
3. Generate certificate for your machine hostname or local IP:
   mkcert localhost 192.168.x.x
4. Configure Vite to use the generated key and cert (see vite.config.mjs > server.https), then run npm run dev.
5. For mobile to trust the cert, you must install the CA on the mobile device (mkcert docs explain how).

Option C — Temporary HTTPS with ngrok (recommended, no password reminder)

1. Create a free ngrok account and get your auth token here: https://dashboard.ngrok.com/get-started/your-authtoken
2. Put your token in the environment:
   - Windows (PowerShell):
     $env:NGROK_AUTHTOKEN = "your_token"
   - macOS/Linux:
     export NGROK_AUTHTOKEN=your_token

3. Start the dev server with ngrok tunneling:

   npm run dev:ngrok

4. The script will print a public HTTPS URL (e.g. https://abcd-1234.ngrok.io). Open that in your mobile browser and grant camera access.

Notes:
- If you want a reserved subdomain (if your plan supports it), set NGROK_SUBDOMAIN or pass --subdomain=myname to run-ngrok.js
- ngrok avoids the localtunnel password prompt and is more stable for repeated testing.

If you want, I can add an automated helper to generate mkcert certs or automatically detect and guide ngrok setup on your machine.