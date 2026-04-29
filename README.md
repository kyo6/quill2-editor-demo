# quill-v2

基于 Quill 2 的帖子预览与编辑应用，支持 Markdown 粘贴自动转换和 TableUp 表格编辑。

## 技术栈

- **Quill 2** — 富文本编辑器
- **quill-table-up** — 表格模块（合并/拆分/调整/右键菜单）
- **md-to-quill-delta** — Markdown 转 Quill Delta
- **Vite** — 构建工具
- **Tailwind CSS 4** + **Basecoat CSS** — 样式

## 功能

- 帖子列表展示（Delta → HTML 预览）
- 弹窗编辑帖子（标题 + 富文本正文）
- 粘贴 Markdown 自动识别并转为 Quill Delta
- Markdown 表格自动适配 quill-table-up 结构，粘贴后可直接编辑
- 完整的表格工具栏：插入/删除行列、合并/拆分单元格、背景/边框颜色、宽度切换等

## 项目结构

```
src/
├── main.js                  # 入口：初始化列表、弹窗、事件绑定
├── mockPosts.js             # 模拟帖子数据
├── postList.js              # 帖子列表渲染
├── postEdit.js              # 弹窗编辑逻辑（打开/保存/取消）
├── style.css                # 全局样式
└── quill/
    ├── editor.js            # Quill 配置、工具栏、TableUp、预览实例
    └── markdownClipboard.js # 自定义 Clipboard：Markdown 识别 + 表格改写
```

## 开发

```bash
npm install
npm run dev
```

## 构建

```bash
npm run build
npm run preview
```

## Markdown 粘贴机制

1. 粘贴时通过 `looksLikeMarkdown()` 启发式判断剪贴板文本是否为 Markdown
2. 若是 Markdown 且浏览器仅做了纯文本包装，调用 `md-to-quill-delta` 转换
3. 转换后的表格 Delta 会被 `convertMarkdownTablesToTableUp()` 改写为 quill-table-up 结构
4. 非 Markdown 内容回退 Quill 默认粘贴逻辑

详细记录见 [功能记录-md-to-quill-delta.md](./docs/功能记录-md-to-quill-delta.md)。
