const puppeteer = require('puppeteer');

(async () => {
  const url = process.argv[2] || 'https://localhost:5173/op/inventario-biomedica';
  console.log('Test URL:', url);

  const fs = require('fs');
  // try common Chrome paths on Windows
  const possible = [
    process.env.CHROME_PATH,
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'
  ].filter(Boolean);
  let execPath = null;
  for (const p of possible) {
    try { if (fs.existsSync(p)) { execPath = p; break } } catch(e){}
  }
  const launchOpts = { headless: true, args: ['--no-sandbox','--disable-setuid-sandbox'], ignoreHTTPSErrors: true };
  if (execPath) launchOpts.executablePath = execPath;
  const browser = await puppeteer.launch(launchOpts);
  const page = await browser.newPage();

  // Emulate a mobile-like viewport and UA
  await page.setViewport({ width: 375, height: 667, isMobile: true, deviceScaleFactor: 2 });
  await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1');
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

  // Install LongTask observer and GBR counter in page context
  await page.evaluate(() => {
    try {
      window.__BIOMED_TEST__ = window.__BIOMED_TEST__ || {};
      window.__BIOMED_TEST__._longTasks = [];
      try {
        const po = new PerformanceObserver(list => {
          list.getEntries().forEach(e => {
            window.__BIOMED_TEST__._longTasks.push({ name: e.name || 'longtask', duration: e.duration, start: e.startTime });
          });
        });
        po.observe({ entryTypes: ['longtask'] });
        window.__BIOMED_TEST__._longTaskObserver = true;
      } catch (e) {
        window.__BIOMED_TEST__._longTaskObserver = false;
      }

      // Monkeypatch getBoundingClientRect to count layout reads
      try {
        window.__BIOMED_TEST__._gbrCount = 0;
        const orig = Element.prototype.getBoundingClientRect;
        Element.prototype.getBoundingClientRect = function () {
          try { window.__BIOMED_TEST__._gbrCount++ } catch (e) {}
          return orig.apply(this, arguments);
        };
        window.__BIOMED_TEST__._gbrHook = true;
      } catch (e) {
        window.__BIOMED_TEST__._gbrHook = false;
      }
    } catch (e) {}
  });

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
  // Phase 5: assign all and wait for paint
  const phase5 = await page.evaluate(async () => {
    try { return window.__BIOMED_TEST__ ? await window.__BIOMED_TEST__.phase5() : null } catch (e) { return { error: String(e) } }
  });
  console.log('PHASE5 (assign+paint) ms:', phase5);

  // Count DOM nodes
  const nodes = await page.evaluate(() => document.getElementsByTagName('*').length);
  console.log('DOM node count:', nodes);

  // Direct full API fetch to check payload size and parse time
  const fullFetch = await page.evaluate(async () => {
    try {
      const t0 = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
      const resp = await fetch('/api/ops/historial-mantenimientos?lite=1');
      const status = resp.status;
      const text = await resp.text();
      const t1 = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
      let len = 0;
      try {
        const j = JSON.parse(text);
        const arr = Array.isArray(j) ? j : (Array.isArray(j && j.data) ? j.data : []);
        len = arr.length;
        return { status, length: len, parseMs: Math.round(t1 - t0) };
      } catch (e) {
        return { status, error: String(e), textLength: text.length, fetchMs: Math.round(t1 - t0) };
      }
    } catch (e) { return { error: String(e) } }
  });
  console.log('FULL FETCH RESULT:', fullFetch);

  // Retrieve the full array and assign it to the app test hook, then measure paint
  const fullArray = await page.evaluate(async () => {
    try {
      const resp = await fetch('/api/ops/historial-mantenimientos?lite=1');
      const j = await resp.json().catch(() => null);
      const arr = Array.isArray(j) ? j : (Array.isArray(j && j.data) ? j.data : []);
      return arr;
    } catch (e) { return { error: String(e) } }
  });

  if (Array.isArray(fullArray)) {
    await page.evaluate((arr) => { try { window.__BIOMED_TEST__.lastFetchedItems = arr } catch (e) {} }, fullArray);
    const phase5full = await page.evaluate(async () => { try { return window.__BIOMED_TEST__ ? await window.__BIOMED_TEST__.phase5() : null } catch (e) { return { error: String(e) } } });
    console.log('PHASE5 full assign+paint ms:', phase5full);
  } else {
    console.log('Could not retrieve full array for phase5 test', fullArray);
  }

  // Collect LongTask and GBR metrics
  const longtaskAndGbr = await page.evaluate(() => {
    try {
      const lt = (window.__BIOMED_TEST__ && window.__BIOMED_TEST__._longTasks) ? window.__BIOMED_TEST__._longTasks.slice(0,100) : [];
      const gbr = (window.__BIOMED_TEST__ && typeof window.__BIOMED_TEST__._gbrCount === 'number') ? window.__BIOMED_TEST__._gbrCount : null;
      return { longTasks: lt, gbrCount: gbr };
    } catch (e) { return { error: String(e) } }
  });
  console.log('LONGTASK+GBR:', longtaskAndGbr);

  await browser.close();
  console.log('Done');
})();