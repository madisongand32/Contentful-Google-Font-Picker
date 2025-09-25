#!/usr/bin/env tsx
import { execSync } from "child_process";
import fs from "fs/promises";
import os from "os";
import path from "path";

type FontEntry = {
  family: string;
  category?: string;
  weights: number[];
  googleUrl?: string;
};

async function exists(filePath: string) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

function buildGoogleUrl(family: string, weights: number[]) {
  if (!weights || weights.length === 0) return undefined;
  const fam = family.replace(/\s+/g, "+");
  const w = weights.join(";");
  return `https://fonts.googleapis.com/css2?family=${fam}:wght@${w}&display=swap`;
}

async function parseMetadata(metadata: string) {
  const nameMatch = metadata.match(/name:\s*"([^"]+)"/);
  const categoryMatch = metadata.match(/category:\s*"([^"]+)"/);

  const weights: number[] = [];
  const fontBlocks = metadata.matchAll(/fonts\s*{[\s\S]*?}/g);
  for (const b of fontBlocks) {
    const block = b[0];
    for (const m of block.matchAll(/weight:\s*(\d+)/g)) {
      const n = Number(m[1]);
      if (!Number.isNaN(n)) weights.push(n);
    }
  }

  if (weights.length === 0) {
    for (const m of metadata.matchAll(/weight:\s*(\d+)/g)) {
      const n = Number(m[1]);
      if (!Number.isNaN(n)) weights.push(n);
    }
  }

  const family = nameMatch ? nameMatch[1] : undefined;
  const category = categoryMatch ? categoryMatch[1] : undefined;

  return {
    family,
    category,
    weights: Array.from(new Set(weights)).sort((a, b) => a - b),
  } as { family?: string; category?: string; weights: number[] };
}

async function findMetadataFiles(root: string) {
  const results: string[] = [];

  async function walk(dir: string, depth = 0) {
    if (depth > 10) return; // guard
    const list = await fs.readdir(dir, { withFileTypes: true }).catch(() => []);
    for (const d of list) {
      const full = path.join(dir, d.name);
      if (d.isDirectory()) {
        await walk(full, depth + 1);
      } else if (d.isFile() && d.name === "METADATA.pb") {
        results.push(full);
      }
    }
  }

  await walk(root);
  return results;
}

async function generate(inputDir: string, outFile: string) {
  const outPath = path.resolve(outFile);

  let repoRoot = path.resolve(inputDir);
  if (!(await exists(repoRoot))) {
    // clone a shallow copy into a temp dir
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "google-fonts-"));
    console.log(
      `Input path ${inputDir} not found; cloning google/fonts into ${tmpDir} (requires git)`
    );
    try {
      execSync(`git clone --depth 1 https://github.com/google/fonts.git "${tmpDir}"`, {
        stdio: "inherit",
      });
      repoRoot = tmpDir;
    } catch (err) {
      console.error("Failed to clone google/fonts:", err);
      throw err;
    }
  }

  const metadataFiles = await findMetadataFiles(repoRoot);
  const entries: FontEntry[] = [];

  for (const metadataPath of metadataFiles) {
    try {
      const content = await fs.readFile(metadataPath, "utf8");
      const parsed = await parseMetadata(content);
      if (!parsed.family) continue;

      const weights = parsed.weights.length > 0 ? parsed.weights : [400];
      const googleUrl = buildGoogleUrl(parsed.family, weights) || undefined;

      entries.push({
        family: parsed.family,
        category: parsed.category,
        weights,
        googleUrl,
      });
    } catch (err) {
      // continue on parse errors
      console.warn(`Skipping ${metadataPath} due to error: ${String(err)}`);
    }
  }

  // dedupe by family
  const map = new Map<string, FontEntry>();
  for (const e of entries) {
    if (!map.has(e.family)) map.set(e.family, e);
  }

  const unique = Array.from(map.values()).sort((a, b) => a.family.localeCompare(b.family));
  const payload = { families: unique };

  await fs.mkdir(path.dirname(outPath), { recursive: true });
  await fs.writeFile(outPath, JSON.stringify(payload, null, 2), "utf8");

  console.log(`Wrote ${unique.length} families to ${outPath}`);
}

async function main() {
  const input = process.argv[2] || path.join(process.cwd(), "fonts");
  const out = process.argv[3] || path.join(process.cwd(), "src", "config", "google-fonts.json");

  console.log(`Scanning ${input} -> ${out}`);
  await generate(input, out);
}

if (require.main === module) {
  main().catch((err) => {
    console.error(err);
    process.exitCode = 1;
  });
}
