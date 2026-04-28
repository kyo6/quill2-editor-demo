import { Delta } from 'quill';

export function createMockPosts() {
  return [
    {
      id: '1',
      title: '第一篇：Quill 简介',
      content: new Delta()
        .insert('欢迎使用 Quill 富文本编辑器。\n')
        .insert('支持粗体、斜体等样式。', { bold: true, italic: true })
        .insert('\n'),
    },
    {
      id: '2',
      title: '第二篇：列表示例',
      content: new Delta()
        .insert('无序列表：\n')
        .insert('项目一\n', { list: 'bullet' })
        .insert('项目二\n', { list: 'bullet' })
        .insert('项目三\n', { list: 'bullet' }),
    },
    {
      id: '3',
      title: '第三篇：引用',
      content: new Delta()
        .insert('下面是一段引用：\n')
        .insert('模块化让列表、编辑、Quill 各司其职。\n', { blockquote: true })
        .insert('\n'),
    },
  ];
}
