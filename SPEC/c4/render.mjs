import { readdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const dir = dirname(fileURLToPath(import.meta.url));
const kroki = (process.env.KROKI_URL ?? "https://kroki.io").replace(/\/$/, "");
const formats = ["svg", "png"];

const files = (await readdir(dir)).filter((name) => name.endsWith(".puml")).sort();
if (files.length === 0) {
  throw new Error(`No .puml files in ${dir}`);
}

for (const name of files) {
  const source = await readFile(join(dir, name));
  for (const format of formats) {
    const response = await fetch(`${kroki}/plantuml/${format}`, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        Accept: format === "svg" ? "image/svg+xml" : "image/png",
      },
      body: source,
    });
    const buffer = Buffer.from(await response.arrayBuffer());
    const looksOk =
      format === "svg"
        ? buffer.toString("utf8").includes("<svg")
        : buffer.length > 100 && buffer[0] === 0x89 && buffer[1] === 0x50;
    if (!response.ok || !looksOk) {
      throw new Error(
        `${name} (${format}): Kroki ${response.status}\n${buffer.toString("utf8").slice(0, 500)}`,
      );
    }
    const out = name.replace(/\.puml$/, `.${format}`);
    await writeFile(join(dir, out), buffer);
    console.log(`wrote ${out} (${buffer.length} bytes)`);
  }
}
