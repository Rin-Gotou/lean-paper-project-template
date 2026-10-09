#!/usr/bin/env node

import path from 'node:path';
import { formatValidationReport, validateProject } from './link-validation-core.mjs';

const args = process.argv.slice(2);
const asJson = args.includes('--json');
const rootArgument = args.find((argument) => argument !== '--json');
const workspaceRoot = path.resolve(rootArgument ?? process.cwd());
const report = await validateProject(workspaceRoot);

if (asJson) {
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
} else {
  process.stdout.write(`${formatValidationReport(report)}\n`);
}

if (report.diagnostics.some((item) => item.severity === 'error')) {
  process.exitCode = 1;
}
