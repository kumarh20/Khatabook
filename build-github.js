import { execSync } from 'node:child_process';
import { copyFileSync, cpSync, existsSync, mkdirSync, writeFileSync, readdirSync } from 'node:fs';
import { resolve, join } from 'node:path';

const rootDir = process.cwd();
const browserDistDir = resolve(rootDir, 'dist/app/browser');
const docsDir = resolve(rootDir, 'docs');

console.log('🚀 Step 1: Building Angular app with base-href="./" for GitHub Pages...');
execSync('npx ng build --base-href=./', { stdio: 'inherit', cwd: rootDir });

if (!existsSync(browserDistDir)) {
  console.error('❌ Build directory dist/app/browser not found!');
  process.exit(1);
}

console.log('📦 Step 2: Preparing /docs folder for GitHub Pages deployment...');
if (!existsSync(docsDir)) {
  mkdirSync(docsDir, { recursive: true });
}

// Copy everything from dist/app/browser to docs/
cpSync(browserDistDir, docsDir, { recursive: true });

// Add .nojekyll in docs (disables Jekyll engine on GitHub Pages so asset hashes and folders load)
writeFileSync(join(docsDir, '.nojekyll'), '');

// Add 404.html in docs (redirects 404s to index.html for SPA client-side routing)
copyFileSync(join(browserDistDir, 'index.html'), join(docsDir, '404.html'));

console.log('🌐 Step 3: Preparing root index.html & assets for direct root deployment...');
// Also place index.html and essential bundle files in root folder
const distFiles = readdirSync(browserDistDir);
for (const file of distFiles) {
  const src = join(browserDistDir, file);
  const dest = join(rootDir, file);
  if (file === 'assets') {
    cpSync(src, dest, { recursive: true });
  } else if (file.endsWith('.js') || file.endsWith('.css') || file.endsWith('.html') || file.endsWith('.ico')) {
    copyFileSync(src, dest);
  }
}

// Root .nojekyll and 404.html
writeFileSync(join(rootDir, '.nojekyll'), '');
copyFileSync(join(browserDistDir, 'index.html'), join(rootDir, '404.html'));

console.log('\n✅ BUILD COMPLETE FOR GITHUB PAGES!');
console.log('----------------------------------------------------');
console.log('📁 1. Root folder index.html & assets are ready.');
console.log('📁 2. /docs folder is also ready with complete bundle & 404.html.');
console.log('----------------------------------------------------');
