import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
const [major, minor] = process.versions.node.split(".").map(Number);
const compatible =
  major > 22 || (major === 22 && minor >= 12) || (major === 20 && minor >= 19);
const bundled = join(
  homedir(),
  ".cache",
  "codex-runtimes",
  "codex-primary-runtime",
  "dependencies",
  "node",
  "bin",
  process.platform === "win32" ? "node.exe" : "node",
);
const runtime = compatible
  ? process.execPath
  : existsSync(bundled)
    ? bundled
    : null;
if (!runtime) {
  console.error(
    "Este projeto requer Node 22.12+ (ou 20.19+). O runtime local do Codex não foi encontrado.",
  );
  process.exit(1);
}
const [command, ...args] = process.argv.slice(2);
const env = {
  ...process.env,
  PATH: `${dirname(runtime)}${process.platform === "win32" ? ";" : ":"}${process.env.PATH || ""}`,
};
function run(file, parameters) {
  const result = spawnSync(runtime, [resolve(file), ...parameters], {
    stdio: "inherit",
    env,
  });
  if (result.error) {
    console.error(result.error.message);
    process.exit(1);
  }
  if (result.status !== 0) process.exit(result.status ?? 1);
}
if (command === "build") {
  run("node_modules/typescript/bin/tsc", ["-b"]);
  run("node_modules/vite/bin/vite.js", ["build"]);
} else if (command === "vite") run("node_modules/vite/bin/vite.js", args);
else if (command === "lint") run("node_modules/eslint/bin/eslint.js", ["."]);
else if (command === "typecheck")
  run("node_modules/typescript/bin/tsc", ["--noEmit"]);
else {
  console.error("Comando local desconhecido.");
  process.exit(1);
}
