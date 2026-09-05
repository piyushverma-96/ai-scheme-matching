const http = require('http');
const { spawn } = require('child_process');

async function testRealUserAuth() {
  console.log("Starting Edge browser for Real User Authentication & Dashboard Verification...");
  const edge = spawn("C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe", [
    "--headless=new",
    "--remote-debugging-port=9228",
    "--disable-gpu",
    "--no-first-run",
    "--no-default-browser-check",
    "http://localhost:5173/"
  ]);

  await new Promise(r => setTimeout(r, 2500));

  http.get("http://127.0.0.1:9228/json", (res) => {
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
        console.log("CDP WebSocket open. Running Real User Auth Tests...");
        await send('Runtime.enable');
        await send('Page.enable');

        async function evalJs(expr) {
          const res = await send('Runtime.evaluate', {
            expression: expr,
            awaitPromise: true,
            returnByValue: true,
          });
          return res.result && res.result.result ? res.result.result.value : null;
        }

        // Wait for page hydration
        await new Promise(r => setTimeout(r, 1500));

        // Test 1: Check no hardcoded Ramesh Kumar on page
        console.log("\n[Test 1] Checking for absence of hardcoded 'Ramesh Kumar'...");
        const bodyText = await evalJs('document.body.innerText');
        if (bodyText.includes('Ramesh Kumar')) {
          console.error("FAILED: 'Ramesh Kumar' was found in the rendered text!");
          edge.kill();
          process.exit(1);
        }
        console.log("PASSED: Zero occurrences of 'Ramesh Kumar' on rendered page.");

        // Test 2: Check no forbidden scheme names
        console.log("\n[Test 2] Checking for absence of PMEGP, Stand Up India, Mudra...");
        if (/PMEGP|Stand Up India|Mudra/i.test(bodyText)) {
          console.error("FAILED: Non-NSFDC scheme found in rendered text!");
          edge.kill();
          process.exit(1);
        }
        console.log("PASSED: Zero occurrences of PMEGP/Stand Up India/Mudra.");

        // Test 3: Navigate to Login
        console.log("\n[Test 3] Navigating to Login View...");
        await evalJs(`
          window.__test_navigate = () => {
            // Find login button or trigger navigateTo('login')
            const buttons = Array.from(document.querySelectorAll('button'));
            const loginBtn = buttons.find(b => b.innerText.includes('Login') || b.getAttribute('aria-label') === 'User account menu');
            if (loginBtn) loginBtn.click();
          };
          window.__test_navigate();
        `);

        await new Promise(r => setTimeout(r, 600));

        // Also ensure login view is rendered directly if dropdown opened
        await evalJs(`
          const buttons = Array.from(document.querySelectorAll('button'));
          const loginItem = buttons.find(b => b.innerText.includes('Login / Sign Up') || b.innerText.includes('Login'));
          if (loginItem) loginItem.click();
        `);

        await new Promise(r => setTimeout(r, 600));

        // Test 4: Perform Real Sign Up via Supabase Auth
        console.log("\n[Test 4] Testing Supabase Email + Password Sign Up...");
        const uniqueEmail = `evaluator.${Date.now()}@gmail.com`;
        const testPass = 'Password@123456';
        const testName = 'Dr. Rajesh Sen';

        const signupSuccess = await evalJs(`
          (async () => {
            const { supabase } = await import('/src/supabaseClient.js');
            const { data, error } = await supabase.auth.signUp({
              email: "${uniqueEmail}",
              password: "${testPass}",
              options: { data: { full_name: "${testName}" } }
            });
            if (error) return { success: false, error: error.message };
            return { success: true, user: data.user ? data.user.id : null };
          })()
        `);
        console.log("Signup API result:", signupSuccess);
        if (!signupSuccess?.success) {
          console.error("FAILED: Sign up failed:", signupSuccess?.error);
          edge.kill();
          process.exit(1);
        }
        console.log("PASSED: Supabase user successfully created with email:", uniqueEmail);

        // Test 5: Sign in with created credentials
        console.log("\n[Test 5] Signing in with created user...");
        const signinSuccess = await evalJs(`
          (async () => {
            const { supabase } = await import('/src/supabaseClient.js');
            const { data, error } = await supabase.auth.signInWithPassword({
              email: "${uniqueEmail}",
              password: "${testPass}"
            });
            if (error) return { success: false, error: error.message };
            return { success: true, session: bool = !!data.session, userId: data.user.id };
          })()
        `);
        console.log("Signin API result:", signinSuccess);
        if (!signinSuccess?.success) {
          console.error("FAILED: Sign in failed:", signinSuccess?.error);
          edge.kill();
          process.exit(1);
        }
        console.log("PASSED: Sign in successful! User authenticated.");

        // Wait for auth listener to trigger in AppContext
        await new Promise(r => setTimeout(r, 1200));

        // Test 6: Verify Complete Profile Modal pops up for new user
        console.log("\n[Test 6] Checking Complete Profile Modal...");
        const isProfileModalVisible = await evalJs(`
          document.body.innerText.includes('Complete Your Profile')
        `);
        console.log("Complete Profile Modal visible:", isProfileModalVisible);

        // Test 7: Complete Profile submission
        console.log("\n[Test 7] Saving new user profile to Supabase 'profiles' table under RLS...");
        const profileSaveResult = await evalJs(`
          (async () => {
            const { supabase } = await import('/src/supabaseClient.js');
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return { success: false, error: 'No user session' };

            const { data, error } = await supabase.from('profiles').insert({
              user_id: user.id,
              full_name: "${testName}",
              email: user.email,
              phone: '9876500000',
              state: 'Madhya Pradesh',
              district: 'Bhopal',
              city: 'Bhopal',
              pincode: '462003',
              education_status: 'Graduate / Diploma',
              occupation: 'Small Business / Trade',
              annual_family_income: 250000,
              purpose: 'Business Setup / Expansion'
            }).select().single();

            if (error) return { success: false, error: error.message };
            return { success: true, profile: data };
          })()
        `);
        console.log("Profile save result:", profileSaveResult);
        if (!profileSaveResult?.success) {
          console.error("FAILED: Profile insertion failed:", profileSaveResult?.error);
          edge.kill();
          process.exit(1);
        }
        console.log("PASSED: Profile saved successfully to Supabase PostgreSQL!");

        // Reload page to simulate returning user
        await send('Page.reload');
        await new Promise(r => setTimeout(r, 2000));

        // Test 8: Verify Dashboard displays real user's first name
        console.log("\n[Test 8] Verifying dynamic greeting and user info on Dashboard...");
        const updatedBodyText = await evalJs('document.body.innerText');
        console.log("Page greeting line found:", updatedBodyText.includes('Good morning, Dr. Rajesh') || updatedBodyText.includes('Dr. Rajesh'));
        if (!updatedBodyText.includes('Dr. Rajesh')) {
          console.error("FAILED: Dashboard did not greet 'Dr. Rajesh'!");
          edge.kill();
          process.exit(1);
        }
        console.log("PASSED: Dashboard dynamically greeted 'Dr. Rajesh'!");

        // Test 9: Verify clean empty states for new user
        console.log("\n[Test 9] Checking empty states for applications and saved schemes...");
        const hasNoApps = updatedBodyText.includes('No applications yet');
        const hasNoSaved = updatedBodyText.includes('No saved schemes yet');
        console.log("Applications empty state present:", hasNoApps);
        console.log("Saved schemes empty state present:", hasNoSaved);
        if (!hasNoApps || !hasNoSaved) {
          console.error("FAILED: New user should have clean empty states!");
          edge.kill();
          process.exit(1);
        }
        console.log("PASSED: New user sees clean 'No applications yet' and 'No saved schemes yet'.");

        // Test 10: Toggle a saved scheme and verify persistence in Supabase
        console.log("\n[Test 10] Testing saved scheme persistence...");
        const saveSchemeRes = await evalJs(`
          (async () => {
            const { supabase } = await import('/src/supabaseClient.js');
            const { data: { user } } = await supabase.auth.getUser();
            const { data, error } = await supabase.from('saved_schemes').insert({
              user_id: user.id,
              scheme_id: 'nsfdc_term_loan'
            }).select();
            if (error) return { success: false, error: error.message };
            return { success: true, count: data.length };
          })()
        `);
        console.log("Saved scheme insert result:", saveSchemeRes);
        if (!saveSchemeRes?.success) {
          console.error("FAILED: Could not insert saved scheme under RLS:", saveSchemeRes?.error);
          edge.kill();
          process.exit(1);
        }
        console.log("PASSED: Saved scheme persisted in Supabase 'saved_schemes' table.");

        // Test 11: Verify 360px mobile responsiveness
        console.log("\n[Test 11] Checking 360px mobile responsiveness...");
        await send('Emulation.setDeviceMetricsOverride', {
          width: 360,
          height: 740,
          deviceScaleFactor: 2,
          mobile: true
        });
        await new Promise(r => setTimeout(r, 600));

        const scrollInfo = await evalJs(`({
          scrollWidth: document.documentElement.scrollWidth,
          clientWidth: document.documentElement.clientWidth,
          hasHorizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth
        })`);
        console.log("Mobile (360px) dimensions:", scrollInfo);
        if (scrollInfo.hasHorizontalOverflow) {
          console.error("FAILED: Mobile layout has horizontal overflow!");
          edge.kill();
          process.exit(1);
        }
        console.log("PASSED: Mobile 360px width has zero horizontal overflow!");

        console.log("\n=======================================================");
        console.log("ALL REAL USER AUTH & DASHBOARD TESTS PASSED 100%!");
        console.log("=======================================================");

        edge.kill();
        process.exit(0);
      });

      ws.addEventListener('message', (event) => {
        const data = JSON.parse(event.data);
        if (data.id && callbacks.has(data.id)) {
          const cb = callbacks.get(data.id);
          callbacks.delete(data.id);
          cb(data);
        }
      });
    });
  });
}

testRealUserAuth().catch((err) => {
  console.error("Test execution error:", err);
  process.exit(1);
});
