// Injects PWA manifest + service worker registration into dist/index.html after expo export.
const fs = require('fs');
const p = 'dist/index.html';
let h = fs.readFileSync(p, 'utf8');
const head = `
  <link rel="manifest" href="/manifest.json" />
  <meta name="theme-color" content="#0F5132" />
  <link rel="apple-touch-icon" href="/icons/icon-192.png" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-title" content="Isoko" />`;
const body = `
  <script>if('serviceWorker' in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('/sw.js').catch(()=>{}))}</script>`;
if (!h.includes('manifest.json')) h = h.replace('</head>', head + '\n</head>');
if (!h.includes('serviceWorker')) h = h.replace('</body>', body + '\n</body>');
fs.writeFileSync(p, h);
console.log('PWA injected into', p);
