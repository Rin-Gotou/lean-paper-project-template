import { readFile } from 'node:fs/promises';
import path from 'node:path';
import * as pdfjsLib from '../media/pdfjs/pdf.legacy.min.mjs';

const PAPER_URI_PREFIX = 'lean-paper:';
const REVIEW_STATUSES = new Set(['proposed', 'resolved', 'reviewed']);
const STABLE_ID_PATTERN = /^[A-Za-z][A-Za-z0-9_-]*:[A-Za-z0-9][A-Za-z0-9._-]*$/;

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  '../media/pdfjs/pdf.legacy.worker.min.mjs',
  import.meta.url,
).href;

export async function validateProject(workspaceRoot) {
  const root = path.resolve(workspaceRoot);
  const diagnostics = [];
  const manifestPath = path.join(root, 'lean-paper-viewer.json');
  let manifest = null;

  try {
    const source = await readFile(manifestPath, 'utf8');
    manifest = parseManifest(JSON.parse(source), diagnostics);
  } catch (error) {
    addDiagnostic(
      diagnostics,
      'error',
      'MANIFEST_READ_FAILED',
      `lean-paper-viewer.jsonを読み込めません: ${errorMessage(error)}`,
    );
  }

  const pdfOccurrences = [];
  if (manifest !== null) {
    const pdfPath = resolveWorkspacePath(root, manifest.paper.pdf, 'paper.pdf', diagnostics);
    if (pdfPath !== null) {
      await inspectPdf(pdfPath, pdfOccurrences, diagnostics);
    }
    await inspectLeanFileHints(root, manifest.links, diagnostics);
    compareManifestAndPdf(manifest.links, pdfOccurrences, diagnostics);
  }

  return {
    workspaceRoot: root,
    manifestPath,
    manifest,
    pdfOccurrences,
    diagnostics,
    counts: {
      manifestLinks: manifest?.links.length ?? 0,
      pdfOccurrences: pdfOccurrences.length,
      uniquePdfIds: new Set(pdfOccurrences.map((item) => item.id)).size,
    },
  };
}

export function formatValidationReport(report) {
  const lines = [
    'Lean Paper Viewer validation',
    `Workspace: ${report.workspaceRoot}`,
    `Manifest entries: ${report.counts.manifestLinks}`,
    `PDF link occurrences: ${report.counts.pdfOccurrences}`,
    `Unique PDF IDs: ${report.counts.uniquePdfIds}`,
    '',
  ];

  if (report.diagnostics.length === 0) {
    lines.push('OK: manifest, PDF annotations, and Lean file hints are consistent.');
    return lines.join('\n');
  }

  for (const diagnostic of report.diagnostics) {
    lines.push(`[${diagnostic.severity.toUpperCase()}] ${diagnostic.code}: ${diagnostic.message}`);
  }
  const errors = report.diagnostics.filter((item) => item.severity === 'error').length;
  const warnings = report.diagnostics.filter((item) => item.severity === 'warning').length;
  lines.push('', `Result: ${errors} error(s), ${warnings} warning(s)`);
  return lines.join('\n');
}

function parseManifest(value, diagnostics) {
  if (!isRecord(value)) {
    addDiagnostic(diagnostics, 'error', 'MANIFEST_TYPE', 'manifestのルートはobjectである必要があります。');
    return null;
  }
  if (!isRecord(value.paper)) {
    addDiagnostic(diagnostics, 'error', 'PAPER_TYPE', 'paperはobjectである必要があります。');
    return null;
  }
  if (typeof value.paper.title !== 'string' || value.paper.title.length === 0) {
    addDiagnostic(diagnostics, 'error', 'PAPER_TITLE', 'paper.titleには空でない文字列が必要です。');
  }
  if (typeof value.paper.pdf !== 'string' || value.paper.pdf.length === 0) {
    addDiagnostic(diagnostics, 'error', 'PAPER_PDF', 'paper.pdfには空でない文字列が必要です。');
    return null;
  }
  if (!value.paper.pdf.endsWith('.pdf')) {
    addDiagnostic(diagnostics, 'error', 'PAPER_PDF_EXTENSION', 'paper.pdfは.pdfファイルを指す必要があります。');
  }
  if (!Array.isArray(value.links)) {
    addDiagnostic(diagnostics, 'error', 'LINKS_TYPE', 'linksはarrayである必要があります。');
    return null;
  }

  const links = [];
  for (const [index, item] of value.links.entries()) {
    const location = `links[${index}]`;
    if (!isRecord(item) || !isRecord(item.lean)) {
      addDiagnostic(diagnostics, 'error', 'LINK_TYPE', `${location}の形式が正しくありません。`);
      continue;
    }
    if (
      typeof item.id !== 'string' || item.id.length === 0 ||
      typeof item.label !== 'string' || item.label.length === 0 ||
      typeof item.lean.declaration !== 'string' || item.lean.declaration.length === 0 ||
      typeof item.lean.file !== 'string' || item.lean.file.length === 0
    ) {
      addDiagnostic(diagnostics, 'error', 'LINK_FIELDS', `${location}のid、label、lean.declaration、lean.fileを確認してください。`);
      continue;
    }
    if (!STABLE_ID_PATTERN.test(item.id)) {
      addDiagnostic(
        diagnostics,
        'error',
        'INVALID_LINK_ID',
        `${location}.idはkind:stable-name形式で指定してください: ${item.id}`,
      );
    }
    if (!item.lean.file.endsWith('.lean')) {
      addDiagnostic(diagnostics, 'error', 'LEAN_FILE_EXTENSION', `${location}.lean.fileは.leanファイルを指す必要があります。`);
    }

    let review = null;
    if (!isRecord(item.review) || !REVIEW_STATUSES.has(item.review.status)) {
      addDiagnostic(
        diagnostics,
        'error',
        'REVIEW_STATUS',
        `${location}.review.statusにはproposed、resolved、reviewedのいずれかが必要です。`,
      );
    } else {
      if (item.review.note !== undefined && typeof item.review.note !== 'string') {
        addDiagnostic(diagnostics, 'error', 'REVIEW_NOTE', `${location}.review.noteは文字列で指定してください。`);
      }
      review = {
        status: item.review.status,
        ...(typeof item.review.note === 'string' ? { note: item.review.note } : {}),
      };
      if (review.status === 'proposed') {
        addDiagnostic(diagnostics, 'warning', 'REVIEW_PROPOSED', `${item.id}は人間による対応確認前です。`);
      }
    }

    links.push({
      id: item.id,
      label: item.label,
      lean: {
        declaration: item.lean.declaration,
        file: item.lean.file,
      },
      review,
    });
  }

  const seenIds = new Set();
  const declarationFiles = new Map();
  for (const link of links) {
    if (seenIds.has(link.id)) {
      addDiagnostic(diagnostics, 'error', 'DUPLICATE_MANIFEST_ID', `manifest内でID ${link.id} が重複しています。`);
    }
    seenIds.add(link.id);
    const previousFile = declarationFiles.get(link.lean.declaration);
    if (previousFile !== undefined && previousFile !== link.lean.file) {
      addDiagnostic(
        diagnostics,
        'error',
        'CONFLICTING_FILE_HINTS',
        `${link.lean.declaration}に異なるfileヒントがあります: ${previousFile}, ${link.lean.file}`,
      );
    }
    declarationFiles.set(link.lean.declaration, link.lean.file);
  }

  return {
    paper: {
      title: typeof value.paper.title === 'string' ? value.paper.title : '',
      pdf: value.paper.pdf,
    },
    links,
  };
}

async function inspectPdf(pdfPath, occurrences, diagnostics) {
  let loadingTask;
  try {
    const bytes = new Uint8Array(await readFile(pdfPath));
    loadingTask = pdfjsLib.getDocument({ data: bytes });
    const pdf = await loadingTask.promise;
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber);
      const annotations = await page.getAnnotations({ intent: 'display' });
      for (const annotation of annotations) {
        const rawUrl = typeof annotation.unsafeUrl === 'string'
          ? annotation.unsafeUrl
          : annotation.url;
        if (typeof rawUrl !== 'string' || !rawUrl.startsWith(PAPER_URI_PREFIX)) continue;
        const encodedId = rawUrl.slice(PAPER_URI_PREFIX.length);
        if (encodedId.length === 0) {
          addDiagnostic(diagnostics, 'error', 'EMPTY_PDF_ID', `PDF ${pageNumber}ページに空のlean-paper URIがあります。`);
          continue;
        }
        try {
          const id = decodeURIComponent(encodedId);
          if (id.length === 0) throw new Error('empty ID');
          occurrences.push({ id, page: pageNumber, rawUrl });
        } catch {
          addDiagnostic(diagnostics, 'error', 'INVALID_PDF_ID', `PDF ${pageNumber}ページのURIをdecodeできません: ${rawUrl}`);
        }
      }
    }
  } catch (error) {
    addDiagnostic(diagnostics, 'error', 'PDF_READ_FAILED', `PDFを検査できません: ${errorMessage(error)}`);
  } finally {
    if (loadingTask !== undefined) {
      try {
        await loadingTask.destroy();
      } catch {
        // Validation results are already complete; cleanup failure is non-fatal.
      }
    }
  }
}

async function inspectLeanFileHints(root, links, diagnostics) {
  const fileCache = new Map();
  for (const link of links) {
    const relativeFile = link.lean.file;
    const filePath = resolveWorkspacePath(root, relativeFile, `file hint for ${link.id}`, diagnostics);
    if (filePath === null) continue;

    let source = fileCache.get(filePath);
    if (source === undefined) {
      try {
        source = await readFile(filePath, 'utf8');
        fileCache.set(filePath, source);
      } catch (error) {
        addDiagnostic(diagnostics, 'error', 'LEAN_FILE_READ_FAILED', `${relativeFile}を読み込めません: ${errorMessage(error)}`);
        continue;
      }
    }

    const shortName = link.lean.declaration.split('.').at(-1) ?? link.lean.declaration;
    if (!containsLeanDeclaration(source, shortName)) {
      addDiagnostic(
        diagnostics,
        'error',
        'DECLARATION_NOT_IN_HINTED_FILE',
        `${link.lean.declaration}をfileヒント ${relativeFile} 内で見つけられません。`,
      );
    }
  }
}

function compareManifestAndPdf(links, occurrences, diagnostics) {
  const manifestIds = new Set(links.map((link) => link.id));
  const pdfIds = new Set(occurrences.map((item) => item.id));
  for (const id of manifestIds) {
    if (!pdfIds.has(id)) {
      addDiagnostic(diagnostics, 'error', 'MANIFEST_ID_NOT_IN_PDF', `manifestのID ${id} がPDF内にありません。`);
    }
  }
  for (const id of pdfIds) {
    if (!manifestIds.has(id)) {
      const pages = [...new Set(occurrences.filter((item) => item.id === id).map((item) => item.page))];
      addDiagnostic(diagnostics, 'error', 'PDF_ID_NOT_IN_MANIFEST', `PDFのID ${id}（page ${pages.join(', ')}）に対応表がありません。`);
    }
  }
}

function resolveWorkspacePath(root, relativePath, label, diagnostics) {
  if (path.isAbsolute(relativePath)) {
    addDiagnostic(diagnostics, 'error', 'ABSOLUTE_PATH', `${label}はワークスペース相対パスで指定してください: ${relativePath}`);
    return null;
  }
  const resolved = path.resolve(root, relativePath);
  if (resolved !== root && !resolved.startsWith(`${root}${path.sep}`)) {
    addDiagnostic(diagnostics, 'error', 'PATH_OUTSIDE_WORKSPACE', `${label}がワークスペース外を指しています: ${relativePath}`);
    return null;
  }
  return resolved;
}

function containsLeanDeclaration(source, shortName) {
  const escaped = shortName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(
    `^\\s*(?:@\\[[^\\n]*\\]\\s*)*` +
      `(?:(?:private|protected|noncomputable|unsafe|partial)\\s+)*` +
      `(?:theorem|lemma|def|abbrev|instance|structure|class|inductive|axiom|constant|opaque)\\s+` +
      `${escaped}(?=\\s|[:({\\[])`,
    'm',
  );
  return pattern.test(source);
}

function addDiagnostic(diagnostics, severity, code, message) {
  diagnostics.push({ severity, code, message });
}

function errorMessage(error) {
  return error instanceof Error ? error.message : String(error);
}

function isRecord(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
