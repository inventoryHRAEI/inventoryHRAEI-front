const puppeteer = require('puppeteer');

(async () => {
  const url = process.argv[2] || 'https://localhost:5173/op/inventario-biomedica';
  console.log('Test URL:', url);

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox','--disable-setuid-sandbox'],
    ignoreHTTPSErrors: true
  });
  const page = await browser.newPage();

  // Emulate a mobile device
  const iPhone = puppeteer.devices['iPhone 8'] || { name: 'iPhone 8' };
  await page.emulate(iPhone);
  // Optionally throttle CPU to emulate weaker device
  try { await page._client.send('Emulation.setCPUThrottlingRate', { rate: 4 }); } catch (e) {}

  page.on('console', msg => {
    try {
      const args = msg.args();
      Promise.all(args.map(a => a.jsonValue())).then(vals => console.log('PAGE LOG>', ...vals));
    } catch (e) {
      console.log('PAGE LOG>', msg.text());
    }
  });

  await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

  // Wait for the test hook to be available
  await page.waitForFunction(() => !!(window.__BIOMED_TEST__ && typeof window.__BIOMED_TEST__.meta === 'function'), { timeout: 20000 }).catch(()=>{});

  const meta = await page.evaluate(() => {
    try { return window.__BIOMED_TEST__ ? window.__BIOMED_TEST__.meta() : null } catch (e) { return { error: String(e) } }
  });
  console.log('META:', meta);

  // Phase 2
  const phase2 = await page.evaluate(() => {
    try { return window.__BIOMED_TEST__ ? window.__BIOMED_TEST__.phase2() : null } catch (e) { return { error: String(e) } }
  });
  console.log('PHASE2 length:', phase2);

  // Phase 3: render 1 item
  const phase3 = await page.evaluate(() => {
    try { return window.__BIOMED_TEST__ ? window.__BIOMED_TEST__.phase3() : null } catch (e) { return { error: String(e) } }
  });
  console.log('PHASE3 result:', phase3);

  // Phase 4: assign all and get assign time
  const phase4 = await page.evaluate(() => {
    try { return window.__BIOMED_TEST__ ? window.__BIOMED_TEST__.phase4() : null } catch (e) { return { error: String(e) } }
  });
  console.log('PHASE4 assign-ms:', phase4);

  // Measure PATCH+PAINT
  const patchPaint = await page.evaluate(async () => {
    try {
      const arr = window.__BIOMED_TEST__ ? (window.__BIOMED_TEST__.lastFetchedItems || []) : [];
      const t0 = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
      // assign shallow copy
      allData.value = arr.slice();
      await nextTick();
      await new Promise(requestAnimationFrame);
      const t1 = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
      return Math.round(t1 - t0);
    } catch (e) { return { error: String(e) } }
  });
  console.log('PATCH+PAINT ms:', patchPaint);

  // Count DOM nodes
  const nodes = await page.evaluate(() => document.getElementsByTagName('*').length);
  console.log('DOM node count:', nodes);

  await browser.close();
  console.log('Done');
})();