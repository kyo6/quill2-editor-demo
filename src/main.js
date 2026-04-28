import { createMockPosts } from './mockPosts.js';
import { ensurePreviewQuill, deltaToPreviewHtml } from './quill/editor.js';
import { createPostList } from './postList.js';
import { createPostEdit } from './postEdit.js';

const posts = createMockPosts();

const previewHost = document.getElementById('preview-quill-host');
if (!previewHost) throw new Error('#preview-quill-host missing');
ensurePreviewQuill(previewHost);

const listRoot = document.getElementById('post-list');
if (!listRoot) throw new Error('#post-list missing');

/** @type {ReturnType<typeof createPostEdit>} */
let postEdit;

const postList = createPostList({
  root: listRoot,
  getPosts: () => posts,
  deltaToPreviewHtml,
  onEdit: (id) => postEdit.open(id),
});

const dialog = document.getElementById('post-dialog');
const titleInput = document.getElementById('post-title-input');
const editorContainer = document.getElementById('modal-editor');
if (!(dialog instanceof HTMLDialogElement) || !titleInput || !editorContainer) {
  throw new Error('post dialog DOM missing');
}

postEdit = createPostEdit({
  dialog,
  titleInput,
  editorContainer,
  getPostById: (id) => posts.find((p) => p.id === id),
  onSaved: () => postList.render(),
});

document.getElementById('btn-cancel')?.addEventListener('click', () => {
  postEdit.cancel();
});

document.getElementById('btn-save')?.addEventListener('click', () => {
  postEdit.save();
});

postList.render();
