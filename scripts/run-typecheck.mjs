import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { spawn, spawnSync } from "node:child_process";

const rootDir = process.cwd();
const isWindows = process.platform === "win32";
const nextCommand = path.join(rootDir, "node_modules", ".bin", isWindows ? "next.cmd" : "next");
const tscCommand = path.join(rootDir, "node_modules", ".bin", isWindows ? "tsc.cmd" : "tsc");
const stubTargets = [
  path.join(rootDir, ".next", "types", "cache-life.d.ts"),
  path.join(rootDir, ".next", "dev", "types", "cache-life.d.ts"),
];

function ensureCacheLifeStubs() {
  for (const filePath of stubTargets) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, "export {}\n");
    }
  }
}

function runSync(command, args) {
  return spawnSync([command, ...args].join(" "), {
    cwd: rootDir,
    stdio: "inherit",
    shell: true,
  });
}

function runAsync(command, args) {
  return spawn([command, ...args].join(" "), {
    cwd: rootDir,
    stdio: "inherit",
    shell: true,
  });
}

const typegen = runSync(nextCommand, ["typegen"]);

if (typegen.status !== 0) {
  process.exit(typegen.status ?? 1);
}

ensureCacheLifeStubs();

const watcher = setInterval(ensureCacheLifeStubs, 50);
const tsc = runAsync(tscCommand, ["--noEmit", "--incremental", "false"]);

tsc.on("close", (code) => {
  clearInterval(watcher);
  process.exit(code ?? 1);
});
