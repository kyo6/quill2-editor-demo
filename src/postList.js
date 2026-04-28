/**
 * @typedef {{ id: string; title: string; content: import('quill').Delta; previewHtml?: string }} Post
 */

/**
 * @param {{
 *   root: HTMLElement;
 *   getPosts: () => Post[];
 *   onEdit: (id: string) => void;
 *   deltaToPreviewHtml: (content: Post['content']) => string;
 * }} opts
 */
export function createPostList(opts) {
  const { root, getPosts, onEdit, deltaToPreviewHtml } = opts;

  function previewInnerHtml(post) {
    if (post.previewHtml) return post.previewHtml;
    post.previewHtml = deltaToPreviewHtml(post.content);
    return post.previewHtml;
  }

  function render() {
    const posts = getPosts();
    root.replaceChildren();

    for (const post of posts) {
      const html = previewInnerHtml(post);
      const card = document.createElement('article');
      card.className = 'card post-card';
      card.innerHTML = `
        <header class="post-card-header">
          <h2 class="text-lg font-semibold leading-none">${escapeHtml(post.title)}</h2>
          <button type="button" class="btn" data-action="edit" data-id="${escapeHtml(post.id)}">编辑</button>
        </header>
        <div class="ql-snow post-preview-wrap">
          <div class="ql-editor post-preview">${html}</div>
        </div>
      `;
      root.appendChild(card);
    }

    root.querySelectorAll('[data-action="edit"]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        if (id) onEdit(id);
      });
    });
  }

  return { render };
}

function escapeHtml(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
