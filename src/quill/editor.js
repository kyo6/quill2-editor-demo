import Quill, { Delta } from 'quill';
import { registerMarkdownClipboard } from './markdownClipboard.js';
import QuillToolbarTip from 'quill-toolbar-tip';
import TableUp, {
  TableAlign,
  TableVirtualScrollbar,
  TableResizeLine,
  TableResizeScale,
  defaultCustomSelect,
  TableSelection,
  tableMenuTools,
  TableMenuContextmenu,
} from 'quill-table-up';
import 'quill/dist/quill.snow.css';
import 'quill-table-up/index.css';
import 'quill-table-up/table-creator.css';
import 'quill-toolbar-tip/dist/index.css';

Quill.register({ [`modules/${TableUp.moduleName}`]: TableUp }, true);
Quill.register({ [`modules/${QuillToolbarTip.moduleName}`]: QuillToolbarTip }, true);
registerMarkdownClipboard();

const toolbarConfig = [
  ['bold', 'italic', 'underline', 'strike'],
  ['blockquote', 'code-block', 'code'],
  ['link', 'image', 'video', 'formula'],
  [{ list: 'ordered' }, { list: 'bullet' }, { list: 'check' }],
  [{ script: 'sub' }, { script: 'super' }],
  [{ indent: '-1' }, { indent: '+1' }],
  [{ direction: 'rtl' }],
  [{ size: ['small', false, 'large', 'huge'] }],
  [{ header: [1, 2, 3, 4, 5, 6, false] }],
  [{ color: [] }, { background: [] }],
  [{ font: [] }],
  [{ align: [] }],
  [{ [TableUp.toolName]: [] }],
  ['clean'],
];

const lastTableUpTexts = {
  zh: {
    fullCheckboxText: '插入满宽表格',
    customBtnText: '自定义行列数',
    confirmText: '确认',
    cancelText: '取消',
    rowText: '行数',
    colText: '列数',
    notPositiveNumberError: '请输入正整数',
    custom: '自定义',
    clear: '清除',
    transparent: '透明',
    perWidthInsufficient:
      '百分比宽度不足。若继续操作，需要转为固定宽度，是否继续？',
    CopyCell: '复制单元格',
    CutCell: '剪切单元格',
    InsertTop: '向上插入一行',
    InsertRight: '向右插入一列',
    InsertBottom: '向下插入一行',
    InsertLeft: '向左插入一列',
    MergeCell: '合并单元格',
    SplitCell: '拆分单元格',
    DeleteRow: '删除当前行',
    DeleteColumn: '删除当前列',
    DeleteTable: '删除当前表格',
    BackgroundColor: '设置背景颜色',
    BorderColor: '设置边框颜色',
    SwitchWidth: '切换表格宽度',
    InsertCaption: '插入表格标题',
    ToggleTdBetweenTh: '切换表头单元格',
    ConvertTothead: '转换为表头',
    ConvertTotfoot: '转换为表尾',
  },
};

const tableUpConfig = {
  full: true,
  autoMergeCell: true,
  fullSwitch: true,
  icon:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zm0 5h18M10 3v18"/></svg>',
  customSelect: defaultCustomSelect,
  customBtn: true,
  modules: [
    { module: TableVirtualScrollbar },
    { module: TableAlign },
    { module: TableResizeLine },
    {
      module: TableResizeScale,
      options: { blockSize: 12, offset: 6 },
    },
    {
      module: TableSelection,
      options: { selectColor: '#00ff8b4d' },
    },
    {
      module: TableMenuContextmenu,
      options: {
        localstorageKey: 'used-color',
        tipText: true,
        tools: [
          tableMenuTools.InsertCaption,
          tableMenuTools.InsertTop,
          tableMenuTools.InsertRight,
          tableMenuTools.InsertBottom,
          tableMenuTools.InsertLeft,
          tableMenuTools.Break,
          tableMenuTools.MergeCell,
          tableMenuTools.SplitCell,
          tableMenuTools.Break,
          tableMenuTools.DeleteRow,
          tableMenuTools.DeleteColumn,
          tableMenuTools.DeleteTable,
          tableMenuTools.Break,
          tableMenuTools.BackgroundColor,
          tableMenuTools.BorderColor,
          tableMenuTools.Break,
          tableMenuTools.CopyCell,
          tableMenuTools.CutCell,
          tableMenuTools.Break,
          tableMenuTools.SwitchWidth,
          tableMenuTools.Break,
          tableMenuTools.ToggleTdBetweenTh,
          tableMenuTools.ConvertTothead,
          tableMenuTools.ConvertTotfoot,
        ],
        defaultColorMap: [
          [
            'rgb(255, 255, 255)',
            'rgb(0, 0, 0)',
            'rgb(72, 83, 104)',
            'rgb(41, 114, 244)',
            'rgb(0, 163, 245)',
            'rgb(49, 155, 98)',
            'rgb(222, 60, 54)',
            'rgb(248, 136, 37)',
            'rgb(245, 196, 0)',
            'rgb(153, 56, 215)',
          ],
          [
            'rgb(242, 242, 242)',
            'rgb(127, 127, 127)',
            'rgb(243, 245, 247)',
            'rgb(229, 239, 255)',
            'rgb(229, 246, 255)',
            'rgb(234, 250, 241)',
            'rgb(254, 233, 232)',
            'rgb(254, 243, 235)',
            'rgb(254, 249, 227)',
            'rgb(253, 235, 255)',
          ],
        ],
      },
    },
  ],
  texts: lastTableUpTexts.zh,
};

const toolbarTipConfig = {
  defaultTooltipOptions: {
    delay: 150,
    direction: 'top',
  },
  tipTextMap: {
    bold: '加粗',
    italic: '斜体',
    underline: '下划线',
    strike: '删除线',
    blockquote: '引用',
    'code-block': '代码块',
    code: '行内代码',
    link: '链接',
    image: '图片',
    video: '视频',
    formula: '公式',
    clean: '清除格式',
    [TableUp.toolName]: '表格',
    list: {
      values: {
        ordered: '有序列表',
        bullet: '无序列表',
        check: '任务列表',
      },
    },
    script: {
      values: {
        sub: '下标',
        super: '上标',
      },
    },
    indent: {
      values: {
        '-1': '减少缩进',
        '+1': '增加缩进',
      },
    },
    direction: {
      values: {
        rtl: '从右到左',
      },
      onShow(target) {
        return target.classList.contains('ql-active') ? '从右到左' : '从左到右';
      },
    },
    size: {
      values: {
        small: '小字号',
        '': '默认字号',
        large: '大字号',
        huge: '超大字号',
      },
    },
    header: {
      values: {
        '': '正文',
        1: '一级标题',
        2: '二级标题',
        3: '三级标题',
        4: '四级标题',
        5: '五级标题',
        6: '六级标题',
      },
    },
    color: {
      onShow(target, value) {
        return value ? `文字颜色：${value}` : '文字颜色';
      },
    },
    background: {
      onShow(target, value) {
        return value ? `背景颜色：${value}` : '背景颜色';
      },
    },
    font: '字体',
    align: {
      values: {
        '': '左对齐',
        center: '居中对齐',
        right: '右对齐',
        justify: '两端对齐',
      },
    },
  },
};

export function getQuillOptions() {
  return {
    theme: 'snow',
    modules: {
      toolbar: toolbarConfig,
      [TableUp.moduleName]: tableUpConfig,
      [QuillToolbarTip.moduleName]: toolbarTipConfig,
    },
  };
}

function getPreviewQuillOptions() {
  const base = getQuillOptions();
  const { [QuillToolbarTip.moduleName]: _toolbarTip, ...modules } = base.modules;
  return {
    theme: 'snow',
    readOnly: true,
    modules: {
      ...modules,
      toolbar: false,
    },
  };
}

/** @type {Quill | null} */
let previewQuill = null;

export function ensurePreviewQuill(host) {
  if (previewQuill) return previewQuill;
  previewQuill = new Quill(host, getPreviewQuillOptions());
  return previewQuill;
}

export function createModalEditor(container) {
  return new Quill(container, getQuillOptions());
}

export function deltaToPreviewHtml(delta) {
  if (!previewQuill) {
    throw new Error('deltaToPreviewHtml: call ensurePreviewQuill(host) first');
  }
  previewQuill.setContents(delta);
  return previewQuill.getSemanticHTML();
}

export function cloneDelta(delta) {
  return new Delta(JSON.parse(JSON.stringify(delta)));
}

export { Delta, Quill };
