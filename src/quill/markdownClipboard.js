import Quill, { Delta } from 'quill';
import CodeBlock from 'quill/formats/code.js';
import { MarkdownToQuill, blockHandler } from 'md-to-quill-delta';

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
          return new Delta(mdDelta.ops);
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
