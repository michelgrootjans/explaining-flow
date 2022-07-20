const fs = require('fs').promises;
const browserify = require('browserify');
const path = require('path');
const promisify = require('util').promisify;

async function bundle() {
  await fs.mkdir('dist', { recursive: true, force:true });
  const sourceFiles = await getSourceFiles();
  const bundle = await createBundle(sourceFiles);
  await fs.writeFile(path.join('dist', 'index.js'), bundle, 'utf8');
}

async function createBundle(files) {
  const b = browserify();
  files.forEach(f=> b.add(f));
  var doBundle = promisify(b.bundle.bind(b));
  var buf = await doBundle()
  return buf;
}

async function getSourceFiles() {
  const files = await fs.readdir('src');
  const jsFiles = files.filter(f=> f.endsWith('.js'));
  return jsFiles.map(f=> path.join('src', f));
}

bundle();