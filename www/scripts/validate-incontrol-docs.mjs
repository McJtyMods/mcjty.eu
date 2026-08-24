import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

const docsDirectory = new URL("../docs/mods/control-mods/", import.meta.url);
const filenames = (await readdir(docsDirectory))
  .filter((name) => name.startsWith("control-mods-20") && name.endsWith(".md"))
  .sort();

let checked = 0;
let failed = false;

for (const filename of filenames) {
  const markdown = await readFile(new URL(filename, docsDirectory), "utf8");
  const lines = markdown.split(/\r?\n/);

  for (let index = 0; index < lines.length; index += 1) {
    // A title identifies a complete, copyable file rather than a small JSON
    // fragment used while explaining an individual field.
    if (
      !lines[index].startsWith("```json") ||
      !lines[index].includes("title=")
    ) {
      continue;
    }

    const startLine = index + 1;
    const block = [];
    index += 1;
    while (index < lines.length && lines[index] !== "```") {
      block.push(lines[index]);
      index += 1;
    }

    checked += 1;
    try {
      JSON.parse(block.join("\n"));
    } catch (error) {
      failed = true;
      const message = error instanceof Error ? error.message : String(error);
      console.error(
        `${join("docs/mods/control-mods", filename)}:${startLine}: ${message}`,
      );
    }
  }
}

if (failed) {
  process.exitCode = 1;
} else {
  console.log(`Validated ${checked} complete In Control JSON examples.`);
}
