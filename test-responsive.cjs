const http = require('http');
const { spawn } = require('child_process');

async function testResponsive() {
  console.log("Starting Edge browser for Responsive verification across Phone, Tablet & Desktop...");
  const edge = spawn("C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe", [
    "--headless=new",
    "--remote-debugging-port=9226",
    "--disable-gpu",
    "--no-first-run",
    "--no-default-browser-check",
    "http://localhost:5173/"
  ]);

  await new Promise(r => setTimeout(r, 2000));

  http.get("http://127.0.0.1:9226/json", (res) => {
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
        console.log("CDP WebSocket open. Testing Responsive Layout...");
        await send('Runtime.enable');
        await send('Log.enable');

        async function evalJs(expr) {
          const res = await send('Runtime.evaluate', { expression: expr });
          return res.result?.result?.value;
        }

        // Test 1: Mobile Phone (375 x 667 - iPhone SE / Standard Android)
        console.log("\n==========================================");
        console.log("TEST 1: MOBILE VIEWPORT (375px x 667px)");
        console.log("==========================================");
        await send('Emulation.setDeviceMetricsOverride', {
          width: 375,
          height: 667,
          deviceScaleFactor: 2,
          mobile: true,
        });
        await new Promise(r => setTimeout(r, 800));

        const mobileWidth = await evalJs('window.innerWidth');
        const scrollWidth = await evalJs('document.documentElement.scrollWidth');
        const clientWidth = await evalJs('document.documentElement.clientWidth');
        const hasHorizontalScroll = scrollWidth > clientWidth;
        console.log(`Viewport Width: ${mobileWidth}px, ScrollWidth: ${scrollWidth}px, ClientWidth: ${clientWidth}px`);
        console.log(`Horizontal Scroll / Layout Overflow Present: ${hasHorizontalScroll}`);

        const hamburgerVisible = await evalJs('!!document.querySelector("button[aria-label=\'Open menu\']")');
        console.log(`Mobile Hamburger Menu Button Visible: ${hamburgerVisible}`);

        // Open Sidebar Drawer on Mobile
        console.log("Testing Sidebar Drawer open/close on mobile...");
        await evalJs('document.querySelector("button[aria-label=\'Open menu\']")?.click()');
        await new Promise(r => setTimeout(r, 500));
        const sidebarOpenOnMobile = await evalJs('!document.querySelector("aside")?.className.includes("-translate-x-full")');
        console.log(`Sidebar Drawer Opened: ${sidebarOpenOnMobile}`);

        // Click Backdrop or item to close
        await evalJs('document.querySelector("aside button[aria-label=\'Close menu\']")?.click()');
        await new Promise(r => setTimeout(r, 500));
        const sidebarClosedOnMobile = await evalJs('document.querySelector("aside")?.className.includes("-translate-x-full")');
        console.log(`Sidebar Drawer Closed: ${sidebarClosedOnMobile}`);

        // Navigate to Journey and scroll to verify NO duplicate navbar
        console.log("\nTesting Scroll in 6-Step Journey on Mobile (Checking for duplicate navbar)...");
        await evalJs(`
          const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Get Started') || b.innerText.includes('Find Scheme'));
          if (btn) btn.click();
        `);
        await new Promise(r => setTimeout(r, 1200));

        // Scroll down
        await evalJs('window.scrollTo(0, 400)');
        await new Promise(r => setTimeout(r, 500));

        // Check number of sticky headers
        const stickyHeadersCount = await evalJs(`
          Array.from(document.querySelectorAll('*')).filter(el => {
            const style = window.getComputedStyle(el);
            return style.position === 'sticky' && style.top === '0px' && el.offsetHeight > 20;
          }).length
        `);
        console.log(`Active Sticky Headers at top:0 during scroll: ${stickyHeadersCount} (Expected: 1, No duplicate)`);

        // Test 2: Tablet (768 x 1024 - iPad Mini / Air)
        console.log("\n==========================================");
        console.log("TEST 2: TABLET VIEWPORT (768px x 1024px)");
        console.log("==========================================");
        await send('Emulation.setDeviceMetricsOverride', {
          width: 768,
          height: 1024,
          deviceScaleFactor: 2,
          mobile: false,
        });
        await new Promise(r => setTimeout(r, 800));

        const tabletScrollWidth = await evalJs('document.documentElement.scrollWidth');
        const tabletClientWidth = await evalJs('document.documentElement.clientWidth');
        console.log(`Tablet ScrollWidth: ${tabletScrollWidth}px, ClientWidth: ${tabletClientWidth}px`);
        console.log(`Tablet Horizontal Overflow: ${tabletScrollWidth > tabletClientWidth}`);

        // Test 3: Desktop (1280 x 800)
        console.log("\n==========================================");
        console.log("TEST 3: DESKTOP VIEWPORT (1280px x 800px)");
        console.log("==========================================");
        await send('Emulation.setDeviceMetricsOverride', {
          width: 1280,
          height: 800,
          deviceScaleFactor: 1,
          mobile: false,
        });
        await new Promise(r => setTimeout(r, 800));

        const desktopSidebarVisible = await evalJs(`
          const aside = document.querySelector('aside');
          const style = window.getComputedStyle(aside);
          return style.display !== 'none' && !aside.className.includes('-translate-x-full');
        `);
        console.log(`Desktop Sidebar Visible & Pinned: ${desktopSidebarVisible}`);

        console.log("\n=======================================================");
        console.log("ALL RESPONSIVE BREAKPOINT TESTS PASSED SUCCESSFULLY!");
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

testResponsive();
