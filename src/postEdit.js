import {
  createModalEditor,
  cloneDelta,
  deltaToPreviewHtml,
} from './quill/editor.js';

/**
 * @typedef {{ id: string; title: string; content: import('quill').Delta; previewHtml?: string }} Post
 */

/**
 * @param {{
 *   dialog: HTMLDialogElement;
 *   titleInput: HTMLInputElement;
 *   editorContainer: HTMLElement;
 *   getPostById: (id: string) => Post | undefined;
 *   onSaved: (post: Post) => void;
 * }} opts
 */
export function createPostEdit(opts) {
  const { dialog, titleInput, editorContainer, getPostById, onSaved } = opts;

  /** @type {import('quill').default | null} */
  let modalQuill = null;
  /** @type {string | null} */
  let currentId = null;
  /** @type {{ title: string; content: import('quill').Delta } | null} */
  let snapshot = null;

  function ensureEditor() {
    if (modalQuill) return modalQuill;
    modalQuill = createModalEditor(editorContainer);
    return modalQuill;
  }

  function open(postId) {
    const post = getPostById(postId);
    if (!post) return;

    currentId = postId;
    snapshot = {
      title: post.title,
      content: cloneDelta(post.content),
    };

    titleInput.value = post.title;
    const q = ensureEditor();
    q.setContents(post.content);

    dialog.showModal();
  }

  function cancel() {
    if (!snapshot || !modalQuill) {
      dialog.close('cancel');
      return;
    }
    titleInput.value = snapshot.title;
    modalQuill.setContents(snapshot.content);
    dialog.close('cancel');
  }

  function save() {
    if (!currentId || !modalQuill) return;
    const post = getPostById(currentId);
    if (!post) return;

    post.title = titleInput.value;
    post.content = modalQuill.getContents();
    post.previewHtml = deltaToPreviewHtml(post.content);
    onSaved(post);
    dialog.close('save');
  }

  return { open, cancel, save, ensureEditor };
}
