const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

const DIST = path.join(__dirname, 'dist');

// Clean dist
if (fs.existsSync(DIST)) {
  fs.rmSync(DIST, { recursive: true });
}
fs.mkdirSync(DIST, { recursive: true });

async function build() {
  // Minify JS
  await esbuild.build({
    entryPoints: ['app.js'],
    outfile: 'dist/app.js',
    minify: true,
    target: 'es2020',
  });

  // Minify CSS
  await esbuild.build({
    entryPoints: ['styles.css'],
    outfile: 'dist/styles.css',
    minify: true,
  });

  // Minify service worker
  await esbuild.build({
    entryPoints: ['service-worker.js'],
    outfile: 'dist/service-worker.js',
    minify: true,
    target: 'es2020',
  });

  // Copy static files
  const staticFiles = [
    'index.html',
    'manifest.json',
  ];

  for (const file of staticFiles) {
    fs.copyFileSync(file, path.join(DIST, file));
  }

  // Copy icons directory
  const iconsDir = path.join(DIST, 'icons');
  fs.mkdirSync(iconsDir, { recursive: true });
  for (const file of fs.readdirSync('icons')) {
    fs.copyFileSync(path.join('icons', file), path.join(iconsDir, file));
  }

  // Report sizes
  const files = ['app.js', 'styles.css', 'service-worker.js'];
  console.log('\nBuild complete:\n');
  for (const file of files) {
    const src = fs.statSync(file).size;
    const out = fs.statSync(path.join(DIST, file)).size;
    const pct = ((1 - out / src) * 100).toFixed(0);
    console.log(`  ${file}: ${(src / 1024).toFixed(1)}KB -> ${(out / 1024).toFixed(1)}KB (-${pct}%)`);
  }
  console.log('');
}

build().catch((err) => {
  console.error(err);
  process.exit(1);
});
