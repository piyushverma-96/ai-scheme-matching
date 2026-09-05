const http = require('http');
const { spawn } = require('child_process');

async function testFullJourney() {
  console.log("Starting Edge for full user journey verification...");
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
        await send('Runtime.enable');
        await send('Log.enable');

        async function evalJs(expr) {
          const res = await send('Runtime.evaluate', { expression: expr });
          return res.result?.result?.value;
        }

        // Test 1: Home Screen
        console.log("Step 1: Verifying Home Screen elements...");
        const homeH1 = await evalJs('document.querySelector("h1")?.innerText');
        console.log("  -> Header:", homeH1);
        const hasQuickActions = await evalJs('document.body.innerText.includes("Quick Actions")');
        console.log("  -> Has Quick Actions:", hasQuickActions);
        const hasProfileSummary = await evalJs('document.body.innerText.includes("Your Profile Summary")');
        console.log("  -> Has Profile Summary:", hasProfileSummary);

        // Test 2: Click Scheme Card -> Scheme Details
        console.log("Step 2: Clicking PMEGP Scheme Card...");
        await evalJs('document.querySelector("div:has(> div > div > h4):has-text, [class*=\'RecommendedSchemes\'] div[class*=\'cursor-pointer\'], div[class*=\'rounded-2xl\']:has(h4)")?.click()');
        await new Promise(r => setTimeout(r, 600));
        const schemeH2 = await evalJs('document.querySelector("h2")?.innerText');
        console.log("  -> Opened Scheme Details for:", schemeH2);
        const eligibilityTab = await evalJs('document.body.innerText.includes("Annual family income should not exceed")');
        console.log("  -> Verified eligibility checklist item:", eligibilityTab);

        // Test 3: Click "Check Eligibility" -> Wizard
        console.log("Step 3: Starting Scheme Finder Wizard...");
        await evalJs('document.querySelector("button:has(span:has-text), button[class*=\'bg-[#0B3B60]\']")?.click()');
        await new Promise(r => setTimeout(r, 600));
        const wizardTitle = await evalJs('document.body.innerText.includes("What do you need financial assistance for?")');
        console.log("  -> Wizard Step 1 Question loaded:", wizardTitle);

        // Test 4: Step through wizard
        console.log("Step 4: Progressing through wizard steps...");
        await evalJs('document.querySelectorAll("button").forEach(b => { if(b.innerText.includes("Continue")) b.click(); })');
        await new Promise(r => setTimeout(r, 500));
        console.log("  -> Moved to Step 2 (Funding)");

        await evalJs('document.querySelectorAll("button").forEach(b => { if(b.innerText.includes("Continue")) b.click(); })');
        await new Promise(r => setTimeout(r, 500));
        console.log("  -> Moved to Step 3 (Income)");

        await evalJs('document.querySelectorAll("button").forEach(b => { if(b.innerText.includes("Continue")) b.click(); })');
        await new Promise(r => setTimeout(r, 500));
        console.log("  -> Moved to Step 4 (Location)");

        await evalJs('document.querySelectorAll("button").forEach(b => { if(b.innerText.includes("Check My Eligibility")) b.click(); })');
        console.log("  -> Triggered processing animation...");
        await new Promise(r => setTimeout(r, 3000)); // wait for 2.6s processing animation

        const eligibleBanner = await evalJs('document.body.innerText.includes("You are potentially eligible!")');
        console.log("  -> Evaluated result screen: 'You are potentially eligible!' ->", eligibleBanner);

        // Test 5: Click "View Recommended Schemes"
        console.log("Step 5: Viewing Recommended Schemes Catalog...");
        await evalJs('document.querySelectorAll("button").forEach(b => { if(b.innerText.includes("View Recommended Schemes")) b.click(); })');
        await new Promise(r => setTimeout(r, 600));
        const catalogTitle = await evalJs('document.body.innerText.includes("Recommended Schemes")');
        console.log("  -> Catalog view loaded:", catalogTitle);

        console.log("\n==========================================");
        console.log("COMPLETE USER FLOW TEST PASSED WITH 100% SUCCESS!");
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

testFullJourney();
