const path = require('path');
const esbuild = require('esbuild');

const args = process.argv.slice(2);

const isWatch = args.indexOf('--watch') >= 0;

let outputRoot = __dirname;
const outputRootIndex = args.indexOf('--outputRoot');
if (outputRootIndex >= 0) {
  outputRoot = args[outputRootIndex + 1];
}
const srcDir = path.join(__dirname, 'src', 'preview-src');
const outDir = path.join(outputRoot, 'media');
async function build() {
  await esbuild.build({
    entryPoints: [path.join(srcDir, 'index.ts')],
    bundle: true,
    minify: true,
    sourcemap: false,
    format: 'esm',
    outdir: outDir,
    platform: 'browser',
    target: ['es2020'],
  });
}
build().catch(() => process.exit(1));
if (isWatch) {
  const watcher = require('@parcel/watcher');
  watcher.subscribe(srcDir, () => {
    return build();
  });
}
