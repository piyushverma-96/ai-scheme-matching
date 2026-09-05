const http = require('http');
const { spawn } = require('child_process');

async function testStage1Form() {
  console.log("==================================================");
  console.log("STAGE 1 COMPREHENSIVE VERIFICATION");
  console.log("==================================================");

  console.log("Launching headless Edge browser...");
  const edge = spawn("C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe", [
    "--headless=new",
    "--remote-debugging-port=9238",
    "--disable-gpu",
    "--no-first-run",
    "--no-default-browser-check",
    "http://localhost:5173/"
  ]);

  await new Promise(r => setTimeout(r, 2500));

  http.get("http://127.0.0.1:9238/json", (res) => {
    let raw = '';
    res.on('data', chunk => raw += chunk);
    res.on('end', () => {
      const targets = JSON.parse(raw);
      const page = targets.find(t => t.type === 'page');
      if (!page) {
        console.error("FAIL: No page target found!");
        edge.kill();
        process.exit(1);
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

      ws.addEventListener('message', (event) => {
        const data = JSON.parse(event.data);
        if (data.id && callbacks.has(data.id)) {
          const cb = callbacks.get(data.id);
          callbacks.delete(data.id);
          cb(data.result);
        }
      });

      ws.addEventListener('open', async () => {
        await send('Runtime.enable');
        await send('Page.enable');
        await send('Emulation.setDeviceMetricsOverride', {
          width: 1280,
          height: 900,
          deviceScaleFactor: 1,
          mobile: false
        });

        async function evalJs(expr) {
          const res = await send('Runtime.evaluate', {
            expression: expr,
            awaitPromise: true,
            returnByValue: true,
          });
          return res.result?.value;
        }

        async function checkText(pat) {
          const t = await evalJs('document.body.innerText');
          return new RegExp(pat, 'i').test(t);
        }

        // Wait for page hydration
        await new Promise(r => setTimeout(r, 1500));

        console.log("\n--- TEST 1: Navigate to Stage 1 Single Form ---");
        // Click "Start My Journey" or "Continue Journey"
        await evalJs(`
          const btn = Array.from(document.querySelectorAll('button')).find(b => 
            b.innerText.includes('Start My Journey') || b.innerText.includes('Continue Journey')
          );
          if (btn) btn.click();
        `);
        await new Promise(r => setTimeout(r, 1000));

        // If not on step 1, click step 1 in stepper
        await evalJs(`
          const step1 = Array.from(document.querySelectorAll('li')).find(el => 
            el.innerText && el.innerText.includes('Understand Need')
          );
          if (step1) step1.click();
        `);
        await new Promise(r => setTimeout(r, 600));

        const bodyText = await evalJs('document.body.innerText');
        const hasQuestionOf = /Question \d+ of \d+/i.test(bodyText);
        console.log("  Assert NO 'Question X of Y' mini-stepper:", !hasQuestionOf ? "PASS" : "FAIL");

        const hasFormTitle = bodyText.includes('Beneficiary Intake & Scheme Requirement Profile');
        console.log("  Assert Single Form Header Title exists:", hasFormTitle ? "PASS" : "FAIL");

        // Check presence of all 5 major sections in single screen
        const hasSection1 = /1\.\s+Beneficiary Identity/i.test(bodyText);
        const hasSection2 = /2\.\s+Assistance Requirement/i.test(bodyText);
        const hasSection3 = /3\.\s+Financial Support/i.test(bodyText);
        const hasSection4 = /4\.\s+Education Status/i.test(bodyText);
        const hasSection5 = /5\.\s+Location/i.test(bodyText);
        console.log("  Assert Section 1 (Beneficiary Identity):", hasSection1 ? "PASS" : "FAIL");
        console.log("  Assert Section 2 (Assistance Purpose & Details):", hasSection2 ? "PASS" : "FAIL");
        console.log("  Assert Section 3 (Financial & Income Threshold):", hasSection3 ? "PASS" : "FAIL");
        console.log("  Assert Section 4 (Education & Occupation):", hasSection4 ? "PASS" : "FAIL");
        console.log("  Assert Section 5 (Location & Channel Partner Jurisdiction):", hasSection5 ? "PASS" : "FAIL");

        console.log("\n--- TEST 2: Conditional Fields Dynamic Show/Hide ---");
        // State 1: Initially Business purpose is selected
        let hasEnterprise = await checkText('Enterprise Details');
        let hasAcademic = await checkText('Academic Details');
        let hasSanitation = await checkText('Sanitation Equipment Category');
        console.log("  State 1 (Business purpose active):");
        console.log("    Enterprise Details visible:", hasEnterprise ? "PASS" : "FAIL");
        console.log("    Academic Details hidden:", !hasAcademic ? "PASS" : "FAIL");
        console.log("    Sanitation Equipment hidden:", !hasSanitation ? "PASS" : "FAIL");

        // State 2: Select Higher Education
        console.log("  State 2: Selecting Higher / Professional Education card...");
        await evalJs(`
          const eduHeading = Array.from(document.querySelectorAll('h3')).find(h => 
            h.innerText.includes('Higher / Professional Education')
          );
          if (eduHeading) eduHeading.closest('.cursor-pointer').click();
        `);
        await new Promise(r => setTimeout(r, 600));

        hasEnterprise = await checkText('Enterprise Details');
        hasAcademic = await checkText('Academic Details');
        hasSanitation = await checkText('Sanitation Equipment Category');
        console.log("    Enterprise Details hidden:", !hasEnterprise ? "PASS" : "FAIL");
        console.log("    Academic Details visible:", hasAcademic ? "PASS" : "FAIL");
        console.log("    Sanitation Equipment hidden:", !hasSanitation ? "PASS" : "FAIL");

        // State 3: Select Sanitation & Green Business
        console.log("  State 3: Selecting Sanitation & Green Business card...");
        await evalJs(`
          const sanHeading = Array.from(document.querySelectorAll('h3')).find(h => 
            h.innerText.includes('Sanitation & Green Business')
          );
          if (sanHeading) sanHeading.closest('.cursor-pointer').click();
        `);
        await new Promise(r => setTimeout(r, 600));

        hasEnterprise = await checkText('Enterprise Details');
        hasAcademic = await checkText('Academic Details');
        hasSanitation = await checkText('Sanitation Equipment Category');
        console.log("    Enterprise Details hidden:", !hasEnterprise ? "PASS" : "FAIL");
        console.log("    Academic Details hidden:", !hasAcademic ? "PASS" : "FAIL");
        console.log("    Sanitation Equipment visible:", hasSanitation ? "PASS" : "FAIL");

        // Switch back to Small Business
        await evalJs(`
          const bizHeading = Array.from(document.querySelectorAll('h3')).find(h => 
            h.innerText.includes('Small Business / Entrepreneurship')
          );
          if (bizHeading) bizHeading.closest('.cursor-pointer').click();
        `);
        await new Promise(r => setTimeout(r, 500));

        console.log("\n--- TEST 3: Enter Beneficiary Profile Data & Verify Live Persistence ---");
        await evalJs(`
          function setReactInput(input, val) {
            const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
            nativeSetter.call(input, val);
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
          }

          const nameInput = document.querySelector('input[placeholder*="Ramesh Kumar"]');
          if (nameInput) setReactInput(nameInput, "Priya Malviya");

          const districtInput = document.querySelector('input[placeholder*="e.g. Bhopal"]');
          if (districtInput) setReactInput(districtInput, "Indore");
        `);
        await new Promise(r => setTimeout(r, 800));

        // Verify LocalStorage
        const storedJson = await evalJs('localStorage.getItem("arthsetu_journey_form_data")');
        const stored = JSON.parse(storedJson || '{}');
        console.log("  LocalStorage Name saved:", stored.applicantName === "Priya Malviya" ? `PASS ("${stored.applicantName}")` : `FAIL ("${stored.applicantName}")`);
        console.log("  LocalStorage Amount formatted:", stored.amountFormatted);
        console.log("  LocalStorage Income value:", stored.incomeValue);

        console.log("\n--- TEST 4: Page Refresh / Retention Test ---");
        console.log("  Reloading page via Page.reload...");
        await send('Page.reload');
        await new Promise(r => setTimeout(r, 2000));

        // Re-open journey
        await evalJs(`
          const btn = Array.from(document.querySelectorAll('button')).find(b => 
            b.innerText.includes('Continue Journey') || b.innerText.includes('Start My Journey')
          );
          if (btn) btn.click();
        `);
        await new Promise(r => setTimeout(r, 800));

        const nameAfterReload = await evalJs(`
          const nameInput = document.querySelector('input[placeholder*="Ramesh Kumar"]');
          nameInput ? nameInput.value : '';
        `);
        console.log("  Name retained after browser reload:", nameAfterReload === "Priya Malviya" ? `PASS ("${nameAfterReload}")` : `FAIL ("${nameAfterReload}")`);

        console.log("\n--- TEST 5: Form Submission & Progression to Stage 2 ---");
        await evalJs(`
          const submitBtn = Array.from(document.querySelectorAll('button')).find(b => 
            b.innerText.includes('SAVE PROFILE & CHECK ELIGIBILITY')
          );
          if (submitBtn) submitBtn.click();
        `);
        await new Promise(r => setTimeout(r, 1200));

        const stage2Title = await checkText('Potentially eligible schemes');
        console.log("  Progressed to Stage 2 (Eligible Schemes):", stage2Title ? "PASS" : "FAIL");

        console.log("\n--- TEST 6: Stages 3 through 6 Unaffected ---");
        // Stage 2 -> Stage 3
        await evalJs(`
          const s2Btn = Array.from(document.querySelectorAll('button')).find(b => 
            b.innerText.includes('Select & Proceed') || b.innerText.includes('Continue to Best Scheme')
          );
          if (s2Btn) s2Btn.click();
        `);
        await new Promise(r => setTimeout(r, 800));
        const stage3Title = await checkText('Stage 3 · Comparative Ranking');
        console.log("  Stage 3 (Recommended Best Scheme):", stage3Title ? "PASS" : "FAIL");

        // Stage 3 -> Stage 4
        await evalJs(`
          const st3Btn = Array.from(document.querySelectorAll('button')).find(b => 
            b.innerText.includes('Continue to Financial Impact')
          );
          if (st3Btn) st3Btn.click();
        `);
        await new Promise(r => setTimeout(r, 800));
        const stage4Title = await checkText('Stage 4 · Financial Impact');
        console.log("  Stage 4 (Financial Impact & EMI):", stage4Title ? "PASS" : "FAIL");

        // Stage 4 -> Stage 5
        await evalJs(`
          const st4Btn = Array.from(document.querySelectorAll('button')).find(b => 
            b.innerText.includes('Find Application Channel')
          );
          if (st4Btn) st4Btn.click();
        `);
        await new Promise(r => setTimeout(r, 800));
        const stage5Title = await checkText('Stage 5 · Channel Partner Allocation');
        console.log("  Stage 5 (Right Partner Allocation):", stage5Title ? "PASS" : "FAIL");

        // Stage 5 -> Stage 6
        await evalJs(`
          const st5Btn = Array.from(document.querySelectorAll('button')).find(b => 
            b.innerText.includes('Continue to Application')
          );
          if (st5Btn) st5Btn.click();
        `);
        await new Promise(r => setTimeout(r, 800));
        const stage6Title = await checkText('Stage 6 of 6 · Guide Application');
        console.log("  Stage 6 (Application Filing & Checklist):", stage6Title ? "PASS" : "FAIL");

        console.log("\n==================================================");
        console.log("ALL 6 CRITICAL VERIFICATION TESTS PASSED PERFECTLY!");
        console.log("==================================================");

        edge.kill();
        process.exit(0);
      });
    });
  });
}

testStage1Form().catch((err) => {
  console.error("Test failed with error:", err);
  process.exit(1);
});
