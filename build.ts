// import { Glob } from "bun";
import { watch, unlink } from "node:fs/promises";

// const globWGSL = new Glob("src/view/shaders/*.{wgsl}");
// for await (const file of globWGSL.scan()) {
//   const text = (await Bun.file(file).text())
//     .replace(/  /g, " ")
//     .replace(/[\n\r]/g, "\\n\\r");
//   await Bun.write(file.replace(/\.wgsl$/, ".minwgsl"), text);
// }

process.on("SIGINT", () => {
  // close watcher when Ctrl-C is pressed
  console.log("\nExiting build loop...");
  process.exit(0);
});

const build = async () => {
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

  console.log("Done building...");
};

await build();

const watcher = watch(import.meta.dir + "/src", { recursive: true });
for await (const _ of watcher) {
  await build();
}

// const globMinWGSL = new Glob("src/shaders/*.{minwgsl}");
// for await (const file of globMinWGSL.scan()) {
//   await unlink(file);
// }
