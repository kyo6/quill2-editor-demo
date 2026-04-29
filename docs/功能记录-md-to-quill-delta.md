# 功能记录：粘贴板中的 Markdown 转 Quill Delta

## 功能名称
将粘贴板中的 Markdown 内容自动解析为 Quill Delta。

## 功能目标
在编辑器中粘贴 Markdown 文本时，优先识别其为 Markdown 源码，并直接转换成对应的 Quill Delta，避免先走浏览器默认 HTML 粘贴路径再二次还原。

## 适用范围
- 普通文本粘贴中的 Markdown 内容
- 标题、列表、引用、代码块、链接、分隔线等常见 Markdown 语法
- Markdown 表格
- 与 `quill-table-up` 插件兼容的表格粘贴结果

## 入口位置
- [src/quill/markdownClipboard.js](/Users/liuqiang/Projects/quill-editor/packages/quill-v2/src/quill/markdownClipboard.js)
- [src/quill/editor.js](/Users/liuqiang/Projects/quill-editor/packages/quill-v2/src/quill/editor.js)

## 工作方式
### 1. 注册自定义 Clipboard
项目在创建 Quill 实例之前，先注册了自定义的 `modules/clipboard`：

- 原始 Clipboard 仍然保留
- 当检测到粘贴内容像 Markdown 时，走 Markdown 解析分支
- 否则回退到 Quill 默认粘贴逻辑

### 2. Markdown 识别
通过 `looksLikeMarkdown(text)` 进行粗略判断，识别常见 Markdown 特征，例如：

- 标题 `#`
- 代码块
- 列表
- 任务列表
- 粗体 / 斜体 / 链接
- 引用
- 分隔线
- 表格语法 `|`

同时通过 `isPlainTextHtmlWrapper(html, plain)` 判断是否只是浏览器把纯文本包装成了 fragment HTML。  
如果是这种场景，就优先按 Markdown 解析。

### 3. Markdown 转 Delta
实际解析由 `md-to-quill-delta` 完成：

- 普通 Markdown 节点转换为 Quill Delta
- 分隔线 `thematicBreak` 被改写成普通换行，避免插入无效 embed

### 4. TableUp 兼容处理
Markdown 表格在 `md-to-quill-delta` 中默认会生成 Quill 原生 table 结构，这和 `quill-table-up` 的表格 blot 不兼容。  
为解决这个问题，项目在返回 Delta 前做了二次改写：

- 把原始的 `{ table: rowId }` 单元格换行属性转换为 `table-up-cell-inner`
- 补充 `table-up-col` 列信息
- 生成 `table-up` 所需的 table 结构
- 移除原生 table 属性，避免 TableUp 监听到 Quill 原生 table

## 已解决的问题
### 1. TableUp 中 `sortMergeChildren is not a function`
原因是 Markdown 表格最终生成了 Quill 原生 table blot，而 TableUp 的监听逻辑期望拿到的是 TableUp 自己的表格结构。  
对应代码细节：

- 在 `[src/quill/markdownClipboard.js](/Users/liuqiang/Projects/quill-editor/packages/quill-v2/src/quill/markdownClipboard.js)` 中新增了 `convertMarkdownTablesToTableUp(delta)`
- 该函数在返回前会把 `md-to-quill-delta` 产出的原生 table Delta 改写成 TableUp 结构
- 具体做法是：
  - `normalizeCellOps()` 把每个单元格的换行属性从 `table` 替换为 `table-up-cell-inner`
  - `createTableUpOps()` 补齐 `table-up-col` 列信息
  - 每个单元格写入 `tableId`、`rowId`、`colId`、`rowspan`、`colspan`、`tag`、`wrapTag`
- `editor.js` 里仍然先注册 `TableUp`，再注册 `registerMarkdownClipboard()`，保证粘贴时 TableUp 的 blot 已经在 Quill 中生效

这样生成出来的表格会直接落到 TableUp 的 blot 体系里，`Quill.find(TABLE)` 拿到的就是 `TableMainFormat`，不会再落到 Quill 原生 table 对象上。

### 2. Markdown 表格空单元格错位
对于含空列的表格，`md-to-quill-delta` 可能会把多个换行压在同一个 op 里，导致空单元格在转换成 TableUp 结构时丢失。  
对应代码细节：

- 在 `expandTableBoundaryOps(delta)` 中先展开表格单元格边界
- 这里专门处理了 `op.insert` 里包含多个 `\n` 的情况
- 每遇到一个换行，就拆成独立的单元格边界 op，避免 `"\n\n"` 被当成一个单元格
- 拆完之后再进入 `convertMarkdownTablesToTableUp(delta)` 的分组流程
- 分组时通过 `isTableCellEnd(op)` 识别单元格结束，通过 `rowId` 组装行数据

这一步解决了类似下面这类表格中“空长度列丢失”的问题：

```markdown
| sign | 加签结果 | String | 512 | Y | 接口加签验签说明 |
| data | 数据 | Json |     | Y | 业务请求参数，具体值参考API文档 |
```

空列会被保留为一个独立单元格，不会再把后面的 `Y` 和“说明”列挤错位。

## 行为特点
- 仅在判断为 Markdown 时触发
- 非 Markdown 内容仍然走 Quill 默认粘贴
- 表格解析优先保证可编辑性和 TableUp 兼容性
- 不是完整 Markdown 渲染器，属于编辑器粘贴场景下的结构化转换

## 目前边界
- Markdown 识别是启发式判断，不追求 100% 严格语法识别
- 表格转换更偏向常规二维表结构
- 对复杂嵌套表格、极端空白格式、混合 HTML/Markdown 内容，仍建议回退默认粘贴路径

## 验证结果
- `npm run build` 已通过

## 备注
这项能力的核心价值是：用户可以直接粘贴 Markdown，编辑器自动还原成可编辑的 Quill 内容；其中表格会自动适配 `quill-table-up`，保证后续的表格操作能力可用。
