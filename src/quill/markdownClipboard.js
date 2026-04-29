import Quill, { Delta } from 'quill';
import CodeBlock from 'quill/formats/code.js';
import { MarkdownToQuill, blockHandler } from 'md-to-quill-delta';
import TableUp, { blotName } from 'quill-table-up';

const TABLEUP_DEFAULT_COL_WIDTH = 100;

/** Quill 默认无 divider blot；库生成的 horizontal rule 会插入无效 embed，改为普通换行 */
const markdownConverter = new MarkdownToQuill({
  blockHandlers: {
    thematicBreak: blockHandler(() => new Delta().insert('\n')),
  },
});

/**
 * 粗略判断是否为 Markdown 源码（避免把普通句子误判为 md）
 */
export function looksLikeMarkdown(text) {
  if (!text || typeof text !== 'string') return false;
  const t = text.trim();
  if (t.length < 2) return false;

  if (/^#{1,6}\s/m.test(t)) return true;
  if (/```[\s\S]*?```/.test(t)) return true;
  if (/^\s*[-*+]\s/m.test(t) || /^\s*\d+\.\s/m.test(t)) return true;
  if (/^\s*[-*]\s\[[ xX]\]/m.test(t)) return true;
  if (/\*\*[^*\n]+\*\*/.test(t) || /__[^_\n]+__/.test(t)) return true;
  if (/\[[^\]]+\]\([^)\s]+\)/.test(t)) return true;
  if (/^>\s/m.test(t)) return true;
  if (/^(?:[-*_]\s*){3,}$/m.test(t)) return true;
  if (/\|[^\n]+\|/.test(t)) return true;
  return false;
}

/**
 * 浏览器把纯文本包成 fragment HTML 时，走 Markdown 比走 HTML 更接近源码语义
 */
export function isPlainTextHtmlWrapper(html, plain) {
  if (!html || !plain) return true;
  try {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const body = doc.body;
    const inner = body.innerText.replace(/\r\n/g, '\n').trimEnd();
    const p = plain.replace(/\r\n/g, '\n').trimEnd();
    if (inner !== p) return false;
    if (body.querySelector('img,table,video,iframe,svg')) return false;
    return true;
  } catch {
    return false;
  }
}

function randomTableId() {
  return Math.random().toString(36).slice(2, 10);
}

function isTableCellEnd(op) {
  return (
    typeof op.insert === 'string' &&
    op.insert.endsWith('\n') &&
    op.attributes?.table
  );
}

function isLineBoundary(op) {
  return typeof op.insert === 'string' && op.insert.includes('\n');
}

function withoutNativeTableAttributes(attributes = {}) {
  const { table, ...rest } = attributes;
  return rest;
}

function normalizeCellOps(ops, value) {
  return ops.map((op) => ({
    ...op,
    attributes: {
      ...withoutNativeTableAttributes(op.attributes),
      [blotName.tableCellInner]: value,
    },
  }));
}

function expandLineBoundaryOps(delta) {
  const ops = [];

  for (const op of delta.ops) {
    if (typeof op.insert !== 'string' || !op.insert.includes('\n')) {
      ops.push(op);
      continue;
    }

    let text = '';
    for (const char of op.insert) {
      if (char !== '\n') {
        text += char;
        continue;
      }

      if (text) {
        ops.push({ ...op, insert: text });
        text = '';
      }
      ops.push({ ...op, insert: '\n' });
    }

    if (text) {
      ops.push({ ...op, insert: text });
    }
  }

  return new Delta(ops);
}

function getTableUpFullOption(quill) {
  return !!quill?.getModule(TableUp.moduleName)?.options?.full;
}

function getTableUpColWidth(colCount, full) {
  return full ? 100 / colCount : TABLEUP_DEFAULT_COL_WIDTH;
}

function createTableUpOps(cells, options = {}) {
  const full = !!options.full;
  const tableId = randomTableId();
  const rows = [];
  let currentRowId = null;

  for (const cell of cells) {
    if (cell.rowId !== currentRowId) {
      rows.push({ rowId: cell.rowId, cells: [] });
      currentRowId = cell.rowId;
    }
    rows[rows.length - 1].cells.push(cell);
  }

  const colCount = Math.max(...rows.map((row) => row.cells.length));
  const colIds = Array.from({ length: colCount }, () => randomTableId());
  const colWidth = getTableUpColWidth(colCount, full);
  const tableOps = colIds.map((colId) => ({
    insert: {
      [blotName.tableCol]: {
        tableId,
        colId,
        width: colWidth,
        full,
      },
    },
  }));

  rows.forEach((row, rowIndex) => {
    row.cells.forEach((cell, colIndex) => {
      const isHead = rowIndex === 0;
      const value = {
        tableId,
        rowId: row.rowId,
        colId: colIds[colIndex],
        rowspan: 1,
        colspan: 1,
        tag: isHead ? 'th' : 'td',
        wrapTag: isHead ? 'thead' : 'tbody',
      };

      tableOps.push(...normalizeCellOps(cell.ops, value));
    });
  });

  return tableOps;
}

function convertMarkdownTablesToTableUp(delta, options = {}) {
  const output = [];
  const tableCells = [];
  let pending = [];

  delta = expandLineBoundaryOps(delta);

  const flushTable = () => {
    if (!tableCells.length) return;
    output.push(...createTableUpOps(tableCells.splice(0), options));
  };

  const flushPending = () => {
    if (!pending.length) return;
    output.push(...pending.splice(0));
  };

  for (const op of delta.ops) {
    pending.push(op);

    if (isTableCellEnd(op)) {
      tableCells.push({
        rowId: op.attributes.table,
        ops: pending.splice(0),
      });
      continue;
    }

    if (isLineBoundary(op)) {
      flushTable();
      flushPending();
    }
  }

  flushTable();
  flushPending();

  return new Delta(output);
}

function createMarkdownClipboard(BaseClipboard) {
  return class MarkdownClipboard extends BaseClipboard {
    convert(payload, formats = {}) {
      const { html, text } = payload;

      if (formats[CodeBlock.blotName]) {
        return super.convert(payload, formats);
      }

      const plain = text ?? '';
      if (
        plain.trim() &&
        looksLikeMarkdown(plain) &&
        isPlainTextHtmlWrapper(html, plain)
      ) {
        try {
          const mdDelta = markdownConverter.convert(plain);
          return convertMarkdownTablesToTableUp(new Delta(mdDelta.ops), {
            full: getTableUpFullOption(this.quill),
          });
        } catch (err) {
          console.warn('md-to-quill-delta failed, fallback to default paste', err);
        }
      }

      return super.convert(payload, formats);
    }
  };
}

/** 须在创建任意 Quill 实例之前调用 */
export function registerMarkdownClipboard() {
  const BaseClipboard = Quill.import('modules/clipboard');
  const MarkdownClipboard = createMarkdownClipboard(BaseClipboard);
  Quill.register('modules/clipboard', MarkdownClipboard, true);
}
