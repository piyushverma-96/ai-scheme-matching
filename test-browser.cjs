const http = require('http');
const { spawn } = require('child_process');

async function testPage() {
  console.log("Starting Edge headless browser...");
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
      function send(method, params = {}) {
        ws.send(JSON.stringify({ id: msgId++, method, params }));
      }

      ws.addEventListener('open', () => {
        console.log("CDP WebSocket open. Enabling Runtime and Log...");
        send('Runtime.enable');
        send('Log.enable');
        send('Page.enable');
        send('Runtime.evaluate', { expression: 'document.getElementById("root")?.innerHTML || "ROOT_NOT_FOUND"' });
      });

      ws.addEventListener('message', (event) => {
        const msg = JSON.parse(event.data);
        if (msg.method === 'Runtime.consoleAPICalled') {
          console.log('[BROWSER CONSOLE]', msg.params.type, msg.params.args.map(a => a.value || a.description || JSON.stringify(a)).join(' '));
        } else if (msg.method === 'Runtime.exceptionThrown') {
          console.error('[BROWSER EXCEPTION]', msg.params.exceptionDetails.text, msg.params.exceptionDetails.exception?.description || JSON.stringify(msg.params.exceptionDetails));
        } else if (msg.result && msg.result.result) {
          const val = msg.result.result.value || '';
          console.log('[DOM EVAL VALUE LENGTH]:', val.length);
          if (val.length > 0) {
            console.log('[DOM PREVIEW (first 400 chars)]:', val.substring(0, 400));
          }
        }
      });

      setTimeout(() => {
        console.log("Checking DOM after delay...");
        send('Runtime.evaluate', { expression: 'document.getElementById("root")?.innerHTML || "ROOT_EMPTY"' });
      }, 3000);

      setTimeout(() => {
        console.log("Finished test probe.");
        ws.close();
        edge.kill();
        process.exit(0);
      }, 6000);
    });
  }).on('error', (e) => {
    console.error("Failed to connect to CDP:", e.message);
    edge.kill();
  });
}

testPage();
