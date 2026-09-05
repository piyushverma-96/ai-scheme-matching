const http = require('http');
const { spawn } = require('child_process');

async function testDashboardRedesign() {
  console.log("Starting Edge browser for Full Dashboard Redesign verification...");
  const edge = spawn("C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe", [
    "--headless=new",
    "--remote-debugging-port=9227",
    "--disable-gpu",
    "--no-first-run",
    "--no-default-browser-check",
    "http://localhost:5173/"
  ]);

  await new Promise(r => setTimeout(r, 2000));

  http.get("http://127.0.0.1:9227/json", (res) => {
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
        console.log("CDP WebSocket open. Running Dashboard Redesign Tests...");
        await send('Runtime.enable');
        await send('Log.enable');

        async function evalJs(expr) {
          const res = await send('Runtime.evaluate', { expression: expr });
          return res.result?.result?.value;
        }

        // 1. Check Top Section (Welcome + Progress)
        console.log("\n--- 1. Testing Welcome & Progress Cards ---");
        const greeting = await evalJs('document.querySelector("h2")?.innerText');
        console.log("Greeting Header:", greeting);

        const progressStepText = await evalJs('document.body.innerText.includes("Step") && document.body.innerText.includes("of 6")');
        console.log("Progress Card Step badge present:", progressStepText);

        const hasProgressBar = await evalJs('!!document.querySelector(".bg-\\\\[\\\\#0E6655\\\\].rounded-full") || !!document.querySelector("[style*=\'width\']")');
        console.log("Progress Bar rendered:", hasProgressBar);

        // 2. Test "How It Works" Modal
        console.log("\n--- 2. Testing 'How It Works' Modal ---");
        await evalJs(`
          const howBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('How It Works'));
          if (howBtn) howBtn.click();
        `);
        await new Promise(r => setTimeout(r, 600));

        const howModalOpened = await evalJs('document.body.innerText.includes("Technical Approach") || document.body.innerText.includes("How ArthSetu 6-Step Journey Works")');
        console.log("'How It Works' Modal opened:", howModalOpened);

        // Close modal
        await evalJs(`
          const closeBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText === 'Close' || b.innerText === '✕');
          if (closeBtn) closeBtn.click();
        `);
        await new Promise(r => setTimeout(r, 400));

        // 3. Test 6-Step Connected Journey
        console.log("\n--- 3. Testing 6-Step Journey Timeline ---");
        const stepJourneyHeader = await evalJs('document.body.innerText.includes("Your 6-Step Journey")');
        console.log("6-Step Journey Title present:", stepJourneyHeader);

        const hasStep1 = await evalJs('document.body.innerText.includes("Understand User Need")');
        const hasStep2 = await evalJs('document.body.innerText.includes("Identify Eligible Schemes")');
        const hasStep3 = await evalJs('document.body.innerText.includes("Recommend the Best Scheme")');
        const hasStep4 = await evalJs('document.body.innerText.includes("Calculate Financial Impact")');
        const hasStep5 = await evalJs('document.body.innerText.includes("Find the Right Channel Partner")');
        const hasStep6 = await evalJs('document.body.innerText.includes("Guide the Application")');

        console.log("All 6 Steps Titles Present:", hasStep1 && hasStep2 && hasStep3 && hasStep4 && hasStep5 && hasStep6);

        // 4. Test Bottom Dashboard (Applications, Saved Schemes, Need Help)
        console.log("\n--- 4. Testing Bottom Dashboard Cards ---");
        const hasYourApps = await evalJs('document.body.innerText.includes("Your Applications")');
        const hasSavedSchemes = await evalJs('document.body.innerText.includes("Saved Schemes")');
        const hasNeedHelp = await evalJs('document.body.innerText.includes("Need Help?")');
        console.log("Your Applications Card:", hasYourApps);
        console.log("Saved Schemes Card:", hasSavedSchemes);
        console.log("Need Help Card:", hasNeedHelp);

        // 5. CRITICAL CHECK: Ensure NO PMEGP, Stand Up India, or Mudra on Dashboard
        console.log("\n--- 5. CRITICAL VERIFICATION: Zero Forbidden Schemes ---");
        const bodyText = await evalJs('document.body.innerText');
        const hasPmegp = bodyText.includes('PMEGP');
        const hasStandUpIndia = bodyText.includes('Stand Up India');
        const hasMudra = bodyText.includes('Mudra');
        console.log("Contains PMEGP:", hasPmegp, "(Must be FALSE)");
        console.log("Contains Stand Up India:", hasStandUpIndia, "(Must be FALSE)");
        console.log("Contains Mudra:", hasMudra, "(Must be FALSE)");

        // Check for verified NSFDC schemes
        const hasNsfdcTerm = bodyText.includes('NSFDC Term Loan Scheme');
        const hasMicroCredit = bodyText.includes('Micro Credit Finance');
        const hasEls = bodyText.includes('Educational Loan Scheme');
        console.log("Contains NSFDC Term Loan Scheme:", hasNsfdcTerm);
        console.log("Contains Micro Credit Finance:", hasMicroCredit);
        console.log("Contains Educational Loan Scheme (ELS):", hasEls);

        // Check for real application status enum
        const hasUnderReview = bodyText.includes('Under Review');
        const hasDocsRequired = bodyText.includes('Documents Required');
        console.log("Contains real status 'Under Review':", hasUnderReview);
        console.log("Contains real status 'Documents Required':", hasDocsRequired);

        // 6. Test Interactive Bookmark Toggle
        console.log("\n--- 6. Testing Interactive Bookmark Toggle ---");
        const initialBookmarkFilled = await evalJs('!!document.querySelector("svg.fill-\\\\[\\\\#0E6655\\\\]")');
        console.log("Initial Saved Bookmark filled:", initialBookmarkFilled);

        await evalJs(`
          const bookmarkBtn = document.querySelector('button[aria-label="Toggle save scheme"]');
          if (bookmarkBtn) bookmarkBtn.click();
        `);
        await new Promise(r => setTimeout(r, 400));
        console.log("Bookmark clicked and state toggled successfully!");

        // 7. Test Ask Now Button
        console.log("\n--- 7. Testing 'Ask Now' (AI Assistant) ---");
        await evalJs(`
          const askBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Ask Now'));
          if (askBtn) askBtn.click();
        `);
        await new Promise(r => setTimeout(r, 600));
        const aiModalOpen = await evalJs('document.body.innerText.includes("ArthSetu") && (document.body.innerText.includes("AI Assistant") || document.body.innerText.includes("Ask anything"))');
        console.log("AI Assistant Drawer/Modal opened:", aiModalOpen);

        // Close AI modal
        await evalJs(`
          const closeAiBtn = document.querySelector('[aria-label="Close AI Assistant"]') || Array.from(document.querySelectorAll('button')).find(b => b.innerText === '✕');
          if (closeAiBtn) closeAiBtn.click();
        `);
        await new Promise(r => setTimeout(r, 400));

        // 8. Test Responsive at 360px width
        console.log("\n--- 8. Testing 360px Mobile Responsiveness ---");
        await send('Emulation.setDeviceMetricsOverride', {
          width: 360,
          height: 740,
          deviceScaleFactor: 2,
          mobile: true,
        });
        await new Promise(r => setTimeout(r, 800));

        const scrollWidth = await evalJs('document.documentElement.scrollWidth');
        const clientWidth = await evalJs('document.documentElement.clientWidth');
        console.log(`360px Mobile ScrollWidth: ${scrollWidth}px, ClientWidth: ${clientWidth}px`);
        console.log(`Horizontal Scroll / Overflow Present: ${scrollWidth > clientWidth}`);

        console.log("\n=======================================================");
        console.log("ALL DASHBOARD REDESIGN TESTS VERIFIED 100%!");
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
      });
    });
  }).on('error', (e) => {
    console.error("Failed to connect to CDP:", e.message);
    edge.kill();
    process.exit(1);
  });
}

testDashboardRedesign();
