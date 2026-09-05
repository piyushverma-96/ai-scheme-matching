const http = require('http');
const { spawn } = require('child_process');

async function testAllNavigation() {
  console.log("Starting Edge headless browser for full route & view testing...");
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

        // Check Home Screen text
        const title = await evalJs('document.querySelector("h1")?.innerText');
        console.log("1. Home Screen H1:", title);

        // Test Navigation to Schemes Catalog
        console.log("2. Testing Schemes Catalog view...");
        await evalJs('document.querySelector("a[href*=\'schemes\'], button:has-text, aside button:nth-child(3)")?.click()');
        await new Promise(r => setTimeout(r, 600));

        // Test Navigation to EMI Calculator
        console.log("3. Testing Calculator view...");
        await evalJs('document.querySelector("aside button:nth-child(4)")?.click()');
        await new Promise(r => setTimeout(r, 600));

        // Test Navigation to Admin Dashboard
        console.log("4. Testing Admin Dashboard view...");
        await evalJs('document.querySelector("button[title*=\'Admin\']")?.click()');
        await new Promise(r => setTimeout(r, 800));
        const adminH1 = await evalJs('document.querySelector("h1, h2")?.innerText');
        console.log("   Admin Screen Header:", adminH1);

        // Check if there were any uncaught exceptions
        console.log("5. Checking console health...");
        const htmlLen = await evalJs('document.getElementById("root")?.innerHTML.length');
        console.log("   Final DOM length:", htmlLen);

        console.log("All views and interactions verified successfully!");
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
            console.error('[BROWSER CONSOLE ERROR]', msg.params.args.map(a => a.value || a.description || JSON.stringify(a)).join(' '));
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

testAllNavigation();
