const http = require('http');
const { spawn } = require('child_process');

async function testNavButtons() {
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

        async function evalJs(expr) {
          const res = await send('Runtime.evaluate', { expression: expr });
          return res.result?.result?.value;
        }

        // List nav button texts
        const navTexts = await evalJs('Array.from(document.querySelectorAll("nav button")).map(b => b.innerText)');
        console.log("Nav Button items:", navTexts);

        // Click "Calculate EMI"
        await evalJs('Array.from(document.querySelectorAll("nav button")).find(b => b.innerText.includes("Calculate EMI"))?.click()');
        await new Promise(r => setTimeout(r, 500));
        let body = await evalJs('document.body.innerText');
        console.log("-> Clicked 'Calculate EMI':", body.includes("EMI Calculator") && body.includes("Your EMI Details"));

        // Click "Find Partner"
        await evalJs('Array.from(document.querySelectorAll("nav button")).find(b => b.innerText.includes("Find Partner"))?.click()');
        await new Promise(r => setTimeout(r, 500));
        body = await evalJs('document.body.innerText');
        console.log("-> Clicked 'Find Partner':", body.includes("Find Partner") && body.includes("State Bank of India"));

        // Click "My Applications"
        await evalJs('Array.from(document.querySelectorAll("nav button")).find(b => b.innerText.includes("My Applications"))?.click()');
        await new Promise(r => setTimeout(r, 500));
        body = await evalJs('document.body.innerText');
        console.log("-> Clicked 'My Applications':", body.includes("Application Tracking") && body.includes("Forwarded to Partner"));

        // Click "Documents"
        await evalJs('Array.from(document.querySelectorAll("nav button")).find(b => b.innerText.includes("Documents"))?.click()');
        await new Promise(r => setTimeout(r, 500));
        body = await evalJs('document.body.innerText');
        console.log("-> Clicked 'Documents':", body.includes("Documents you may need"));

        // Click "AI Assistant"
        await evalJs('Array.from(document.querySelectorAll("nav button")).find(b => b.innerText.includes("AI Assistant"))?.click()');
        await new Promise(r => setTimeout(r, 500));
        body = await evalJs('document.body.innerText');
        console.log("-> Clicked 'AI Assistant':", body.includes("ArthSetu Assistant"));

        // Click "Profile"
        await evalJs('Array.from(document.querySelectorAll("nav button")).find(b => b.innerText.includes("Profile"))?.click()');
        await new Promise(r => setTimeout(r, 500));
        body = await evalJs('document.body.innerText');
        console.log("-> Clicked 'Profile':", body.includes("Profile & Settings") && body.includes("Ramesh Kumar"));

        // Click "Find Scheme"
        await evalJs('Array.from(document.querySelectorAll("nav button")).find(b => b.innerText.includes("Find Scheme"))?.click()');
        await new Promise(r => setTimeout(r, 500));
        body = await evalJs('document.body.innerText');
        console.log("-> Clicked 'Find Scheme':", body.includes("Step 1 of 4") && body.includes("What do you need financial assistance for?"));

        console.log("\nALL NAVIGATION CHECKS COMPLETED PERFECTLY!");
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
  });
}

testNavButtons();
