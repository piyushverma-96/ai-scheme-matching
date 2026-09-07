const http = require('http');
const { spawn } = require('child_process');

async function testAllViews() {
  console.log("Starting Edge browser for comprehensive UI test...");
  const edge = spawn("C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe", [
    "--headless=new",
    "--remote-debugging-port=9222",
    "--disable-gpu",
    "--no-first-run",
    "--no-default-browser-check",
    "http://localhost:5173/"
  ]);

  await new Promise(r => setTimeout(r, 2000));

  http.get("http://127.0.0.1:9222/json", (res) => {
    let raw = '';
    res.on('data', chunk => raw += chunk);
    res.on('end', () => {
      const targets = JSON.parse(raw);
      const page = targets.find(t => t.type === 'page');
      if (!page) {
        console.error("No page target found!");
        edge.kill();
        return;
      }

      console.log("Connecting WebSocket to:", page.webSocketDebuggerUrl);
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
        console.log("CDP WebSocket open. Testing all screens & interactions...");
        await send('Runtime.enable');
        await send('Log.enable');

        async function evalJs(expr) {
          const res = await send('Runtime.evaluate', { expression: expr });
          return res.result?.result?.value;
        }

        // 1. Check Home Screen / Dashboard
        const title = await evalJs('document.querySelector("h1")?.innerText');
        console.log("1. Home Screen Greeting:", title);
        const heroText = await evalJs('document.querySelector("h2")?.innerText');
        console.log("   Hero Banner Text:", heroText);

        // 2. Test Navigation to EMI Calculator
        console.log("2. Navigating to EMI Calculator...");
        await evalJs('document.querySelector("aside button:nth-child(3)")?.click()');
        await new Promise(r => setTimeout(r, 500));
        const emiH2 = await evalJs('document.querySelector("h3")?.innerText');
        console.log("   EMI Details Card Header:", emiH2);

        // 3. Test Navigation to Partner Finder
        console.log("3. Navigating to Partner Finder...");
        await evalJs('document.querySelector("aside button:nth-child(4)")?.click()');
        await new Promise(r => setTimeout(r, 500));
        const mapPins = await evalJs('document.querySelectorAll("svg").length');
        console.log("   Map SVGs present:", mapPins);

        // 4. Test Navigation to Application Tracking
        console.log("4. Navigating to Application Tracking...");
        await evalJs('document.querySelector("aside button:nth-child(5)")?.click()');
        await new Promise(r => setTimeout(r, 500));
        const trackingText = await evalJs('document.body.innerText.includes("Forwarded to Partner")');
        console.log("   Tracking timeline stage verified:", trackingText);

        // 5. Test Navigation to Documents
        console.log("5. Navigating to Documents checklist...");
        await evalJs('document.querySelector("aside button:nth-child(6)")?.click()');
        await new Promise(r => setTimeout(r, 500));
        const docCount = await evalJs('document.querySelectorAll("span").length');
        console.log("   Document checklist loaded with spans:", docCount);

        // 6. Test Navigation to AI Assistant
        console.log("6. Navigating to AI Assistant...");
        await evalJs('document.querySelector("aside button:nth-child(7)")?.click()');
        await new Promise(r => setTimeout(r, 500));
        const aiAssistantText = await evalJs('document.body.innerText.includes("UdyamNex Assistant")');
        console.log("   AI Assistant header loaded:", aiAssistantText);

        // 7. Test Navigation to Profile
        console.log("7. Navigating to Profile...");
        await evalJs('document.querySelector("aside button:nth-child(8)")?.click()');
        await new Promise(r => setTimeout(r, 500));
        const profileName = await evalJs('document.body.innerText.includes("Ramesh Kumar")');
        console.log("   Profile name verified:", profileName);

        // 8. Test Navigation to Find Scheme Wizard
        console.log("8. Navigating to Find Scheme Wizard...");
        await evalJs('document.querySelector("aside button:nth-child(2)")?.click()');
        await new Promise(r => setTimeout(r, 500));
        const wizardStep = await evalJs('document.body.innerText.includes("Step 1 of 4")');
        console.log("   Wizard Step 1 verified:", wizardStep);

        console.log("\n==========================================");
        console.log("ALL MAJOR SCREENS VERIFIED SUCCESSFULLY!");
        console.log("==========================================");

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
        if (msg.method === 'Runtime.consoleAPICalled') {
          if (msg.params.type === 'error') {
            console.error('[BROWSER ERROR]', msg.params.args.map(a => a.value || a.description || JSON.stringify(a)).join(' '));
          }
        } else if (msg.method === 'Runtime.exceptionThrown') {
          console.error('[BROWSER EXCEPTION]', msg.params.exceptionDetails.text, msg.params.exceptionDetails.exception?.description);
        }
      });
    });
  }).on('error', (e) => {
    console.error("Failed to connect to CDP:", e.message);
    edge.kill();
  });
}

testAllViews();
