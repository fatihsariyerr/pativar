import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const distDir = path.join(root, 'dist');
const ssrEntryUrl = pathToFileURL(path.join(root, 'dist-server/entry-server.js')).href;

const routes = [
  '/',
  '/ilanlar',
  '/paketler',
  '/iletisim',
  '/gizlilik',
  '/kullanim-sartlari',
];

async function prerender() {
  const template = fs.readFileSync(path.join(distDir, 'index.html'), 'utf-8');
  const { render } = await import(ssrEntryUrl);

  for (const url of routes) {
    try {
      const { html: appHtml, helmet } = render(url);

      let pageHtml = template;

      // 1. Inject rendered app HTML
      pageHtml = pageHtml.replace(
        '<div id="root"></div>',
        `<div id="root">${appHtml}</div>`
      );

      // 2. Inject title tag after <head> opening
      if (helmet?.title) {
        const titleStr = helmet.title.toString();
        if (titleStr) {
          pageHtml = pageHtml.replace('<head>', `<head>\n  ${titleStr}`);
        }
      }

      // 3. Inject meta (description, robots, og:*, twitter:*), canonical link, and JSON-LD
      const headParts = [
        helmet?.meta?.toString() || '',
        helmet?.link?.toString() || '',
        helmet?.script?.toString() || '',
      ].filter(s => s.trim());

      if (headParts.length > 0) {
        pageHtml = pageHtml.replace('</head>', `  ${headParts.join('\n  ')}\n</head>`);
      }

      // 4. Write output file
      const outPath = url === '/'
        ? path.join(distDir, 'index.html')
        : path.join(distDir, url.slice(1), 'index.html');

      fs.mkdirSync(path.dirname(outPath), { recursive: true });
      fs.writeFileSync(outPath, pageHtml, 'utf-8');

      console.log(`✓ Prerendered: ${url}`);
    } catch (err) {
      console.error(`✗ Failed to prerender ${url}:`, err.message);
    }
  }

  console.log('\nPrerendering complete!');
}

prerender().catch(err => {
  console.error('Prerender error:', err);
  process.exit(1);
});
