#!/usr/bin/env node

import { mkdir, copyFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = fileURLToPath(new URL('../', import.meta.url));
const outputDirectory = path.join(root, 'tmp', 'tex');

try {
  await mkdir(outputDirectory, { recursive: true });
  for (let pass = 0; pass < 2; pass += 1) {
    const result = spawnSync('pdflatex', [
      '-interaction=nonstopmode',
      '-halt-on-error',
      `-output-directory=${outputDirectory}`,
      'paper/main.tex',
    ], { cwd: root, stdio: 'inherit', shell: false });
    if (result.error) {
      throw new Error(`Cannot run pdflatex. Install a TeX distribution and add pdflatex to PATH: ${result.error.message}`);
    }
    if (result.status !== 0) {
      throw new Error(`pdflatex failed (${result.signal ?? `exit ${result.status}`}). See tmp/tex/main.log.`);
    }
  }
  await copyFile(path.join(outputDirectory, 'main.pdf'), path.join(root, 'paper', 'main.pdf'));
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
