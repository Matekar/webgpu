// import { Glob } from "bun";
// import { unlink } from "node:fs/promises";

// const globWGSL = new Glob("src/view/shaders/*.{wgsl}");
// for await (const file of globWGSL.scan()) {
//   const text = (await Bun.file(file).text())
//     .replace(/  /g, " ")
//     .replace(/[\n\r]/g, "\\n\\r");
//   await Bun.write(file.replace(/\.wgsl$/, ".minwgsl"), text);
// }

await Bun.build({
  entrypoints: ["./src/index.ts"],
  outdir: "./build",
  target: "browser",
  format: "esm",
  splitting: false,
  minify: true,
  loader: {
    ".wgsl": "text",
  },
});

// const globMinWGSL = new Glob("src/shaders/*.{minwgsl}");
// for await (const file of globMinWGSL.scan()) {
//   await unlink(file);
// }
