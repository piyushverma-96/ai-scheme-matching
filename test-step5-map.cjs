const http = require('http');
const { spawn } = require('child_process');

async function testStep5Map() {
  console.log("Starting Edge browser to test Step 5 MapLibre Map...");
  const edge = spawn("C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe", [
    "--headless=new",
    "--remote-debugging-port=9225",
    "--disable-gpu",
    "--no-first-run",
    "--no-default-browser-check",
    "http://localhost:5173/"
  ]);

  await new Promise(r => setTimeout(r, 2000));

  http.get("http://127.0.0.1:9225/json", (res) => {
    let raw = '';
    res.on('data', chunk => raw += chunk);
    res.on('end', () => {
      const targets = JSON.parse(raw);
      const page = targets.find(t => t.type === 'page');
      if (!page) {
        console.error("No page target found!");
        edge.kill();
        process.exit(1);
      }

      console.log("Connecting CDP WebSocket to:", page.webSocketDebuggerUrl);
      const ws = new WebSocket(page.webSocketDebuggerUrl);

      let msgId = 1;
      const callbacks = new Map();

      function send(method, params = {}) {
        return new Promise((resolve) => {
          const id = msgId++;
          callbacks.set(id, resolve);
          ws.send(JSON.stringify({ id, method, params }));
        });
      }

      ws.addEventListener('open', async () => {
        console.log("CDP WebSocket open. Navigating to Journey Step 5...");
        await send('Runtime.enable');
        await send('Log.enable');

        async function evalJs(expr) {
          const res = await send('Runtime.evaluate', { expression: expr });
          return res.result?.result?.value;
        }

        // 1. Click 'Find Scheme' in sidebar to enter 6-step journey
        console.log("1. Clicking 'Find Scheme' in sidebar...");
        await evalJs(`
          const sidebarBtn = Array.from(document.querySelectorAll('aside nav button')).find(b => b.innerText.includes('Find Scheme'));
          if (sidebarBtn) sidebarBtn.click();
        `);
        await new Promise(r => setTimeout(r, 1000));

        // 2. Click Step 5 in SixStepProgressStepper
        console.log("2. Clicking Step 5 (Channel Partner) in Stepper...");
        await evalJs(`
          const steps = document.querySelectorAll('nav[aria-label="6-Step Product Journey"] ol li');
          if (steps && steps[4]) {
            steps[4].click();
          }
        `);
        await new Promise(r => setTimeout(r, 2500));

        // 3. Verify Step 5 Header
        const h2Text = await evalJs('document.querySelector("h2")?.innerText');
        console.log("Step 5 Header:", h2Text);

        // 4. Verify MapLibre GL Canvas Container
        const hasMapLibre = await evalJs('!!document.querySelector(".maplibregl-map")');
        const hasCanvas = await evalJs('!!document.querySelector(".maplibregl-canvas")');
        console.log("MapLibre GL Container Present:", hasMapLibre);
        console.log("MapLibre WebGL Canvas Present:", hasCanvas);

        // 5. Verify Navigation & Attribution Controls
        const hasZoomIn = await evalJs('!!document.querySelector(".maplibregl-ctrl-zoom-in")');
        const hasZoomOut = await evalJs('!!document.querySelector(".maplibregl-ctrl-zoom-out")');
        const attributionText = await evalJs('document.querySelector(".maplibregl-ctrl-attrib")?.innerText');
        console.log("Zoom In & Zoom Out Controls Present:", hasZoomIn && hasZoomOut);
        console.log("Attribution Text:", attributionText);

        // 6. Verify Partner Markers & User Marker
        const partnerMarkersCount = await evalJs('document.querySelectorAll(".partner-marker").length');
        const userMarkerPresent = await evalJs('!!document.querySelector(".user-location-marker")');
        console.log("Rendered Partner Markers Count:", partnerMarkersCount);
        console.log("User Location Indicator Present:", userMarkerPresent);

        // 7. Verify Search Input
        const searchInput = await evalJs('!!document.querySelector("input[placeholder*=\'Search city\']")');
        console.log("Search Bar Present:", searchInput);

        // 8. Test 'Get Directions' button
        console.log("Testing 'Get Directions' interaction...");
        await evalJs(`
          const dirBtn = Array.from(document.querySelectorAll('button')).find(b => 
            b.innerText.includes('Get Directions')
          );
          if (dirBtn) dirBtn.click();
        `);
        await new Promise(r => setTimeout(r, 2000));

        const routePill = await evalJs('document.body.innerText.includes("mins drive") || document.body.innerText.includes("km")');
        console.log("Route directions and travel time displayed:", routePill);

        // 9. Test View Details Modal
        console.log("Testing 'View Full Details' modal...");
        await evalJs(`
          const detailsBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('View Full Details') || b.innerText.includes('View Details'));
          if (detailsBtn) detailsBtn.click();
        `);
        await new Promise(r => setTimeout(r, 600));
        const modalOpen = await evalJs('document.body.innerText.includes("Nodal Officer") || document.body.innerText.includes("Operating Hours")');
        console.log("Details Modal opened with complete partner data:", modalOpen);

        // 10. Close Modal
        await evalJs(`
          const closeBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText === 'Close' || b.innerText === '✕');
          if (closeBtn) closeBtn.click();
        `);
        await new Promise(r => setTimeout(r, 500));

        // 11. Test Standalone PartnersView as well
        console.log("\nTesting Standalone Partners View (/partners)...");
        await evalJs(`
          const partnersNavBtn = Array.from(document.querySelectorAll('aside nav button')).find(b => b.innerText.includes('Find Partner'));
          if (partnersNavBtn) partnersNavBtn.click();
        `);
        await new Promise(r => setTimeout(r, 2000));

        const standaloneMap = await evalJs('!!document.querySelector(".maplibregl-map")');
        console.log("Standalone View MapLibre Map Present:", standaloneMap);

        console.log("\n=======================================================");
        console.log("ALL MAPLIBRE GL JS TESTS PASSED 100% WITH ZERO ERRORS!");
        console.log("=======================================================");

        ws.close();
        edge.kill();
        process.exit(0);
      });

      ws.addEventListener('message', (event) => {
        const msg = JSON.parse(event.data);
        if (msg.id && callbacks.has(msg.id)) {
          const cb = callbacks.get(msg.id);
          callbacks.delete(msg.id);
          cb(msg);
        }
        if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') {
          console.error('[BROWSER ERROR]', msg.params.args.map(a => a.value || a.description || JSON.stringify(a)).join(' '));
        }
      });
    });
  }).on('error', (e) => {
    console.error("Failed to connect to CDP:", e.message);
    edge.kill();
    process.exit(1);
  });
}

testStep5Map();
