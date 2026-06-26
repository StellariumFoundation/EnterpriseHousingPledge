/**
 * Build script for EHP Enterprise.
 * Uses Bun.build() with the Svelte plugin to bundle the frontend.
 * Handles: JS bundling, asset copying, CSS processing via Tailwind CLI.
 */
import { $ } from "bun";
import { SveltePlugin } from "bun-plugin-svelte";

const isWatch = process.argv.includes("--watch");
const outdir = "./dist";

console.log(`🧱 Building EHP Enterprise...${isWatch ? " (watch mode)" : ""}`);

// Ensure dist/ and subdirectories exist
await $`mkdir -p ${outdir}/assets`.quiet();

// Step 1: Build CSS with Tailwind CLI
console.log("\n📦 Building CSS with Tailwind CLI...");
const cssResult = await $`bunx @tailwindcss/cli -i ./src/index.css -o ${outdir}/assets/styles.css`.nothrow();
if (cssResult.exitCode !== 0) {
  console.error("CSS build failed:", cssResult.stderr.toString());
  process.exit(1);
}
console.log("✅ CSS built");

// Step 2: Bundle JS with Bun (includes Svelte compilation via plugin)
console.log("\n📦 Bundling JS with Bun build...");
const result = await Bun.build({
  entrypoints: ["./src/main.ts"],
  outdir,
  target: "browser",
  assetNaming: "assets/[name].[ext]",
  loader: {
    ".jpg": "file",
    ".png": "file",
    ".svg": "file",
    ".ttf": "file",
  },
  plugins: [SveltePlugin()],
  watch: isWatch,
  sourcemap: isWatch ? "inline" : undefined,
  minify: !isWatch,
});

if (!result.success) {
  console.error("❌ JS build failed:");
  for (const log of result.logs) {
    console.error(`  ${log}`);
  }
  process.exit(1);
}

console.log(`✅ JS built: ${result.outputs.length} files`);
for (const output of result.outputs) {
  const path = output.path.replace(/\\/g, "/");
  const label = path.includes(outdir) ? path.substring(path.indexOf(outdir)) : path;
  console.log(`   ${label} (${output.type})`);
}

// Step 3: Copy static assets
console.log("\n📦 Copying static assets...");

// Font for CSS url() reference
await $`cp src/assets/fonts/neue_frutiger_world_regular.ttf ${outdir}/assets/`.quiet();

// Logo for index.html icon/apple-touch-icon references (Bun's asset loader
// handles JS imports but we want a predictable path for the HTML)
await $`cp src/assets/images/logo.jpg ${outdir}/assets/logo.jpg`.quiet();

// Step 4: Copy index.html
await $`cp index.html ${outdir}/index.html`.quiet();

// Step 5: Copy PWA files from public/
await $`cp public/manifest.json ${outdir}/manifest.json`.quiet();
await $`cp public/sw.js ${outdir}/sw.js`.quiet();

console.log("✅ Assets copied");

if (!isWatch) {
  console.log("\n🎉 Build complete!");
  console.log(`   ${outdir}/index.html`);
  console.log(`   ${outdir}/main.js`);
  console.log(`   ${outdir}/manifest.json`);
  console.log(`   ${outdir}/sw.js`);
  console.log(`   ${outdir}/assets/styles.css`);
  console.log(`   ${outdir}/assets/neue_frutiger_world_regular.ttf`);
} else {
  console.log("\n👀 Watching for changes...");
}
