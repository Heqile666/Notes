# 笔记仓库使用指南

个人知识库，基于 VitePress + GitHub Pages，push 即自动发布。

- 网站地址：https://heqile666.github.io/Notes/
- 笔记仓库：https://github.com/Heqile666/Notes
- 图床仓库：https://github.com/Heqile666/NotesImgaes

---

## 一、目录结构

```
Notes/
├── docs/                          ← 只有这里面的 .md 会上网站
│   ├── index.md                   ← 网站首页
│   ├── .vitepress/config.mts      ← 站点配置（侧边栏在这里登记）
│   └── notes/                     ← 笔记根目录
│       ├── rendering-features/    ← 「渲染特性」分类
│       │   └── ssao.md
│       └── miku-engine/           ← 「MIKUEngine」分类
│           ├── rhi/
│           │   └── texture-creation.md
│           └── render-graph.md
├── .github/workflows/deploy.yml   ← 自动部署流水线（不用动）
└── package.json
```

**规则**：`docs/notes/` 下的目录 = 侧边栏分类，`.md` 文件 = 一篇笔记。
目录和文件名用英文（会出现在 URL 里），显示名在侧边栏配置里写中文。

---

## 二、日常写笔记流程

### 1. 新增一篇笔记

a. 在对应分类目录下新建 `.md` 文件，例如 `docs/notes/miku-engine/rhi/buffer-creation.md`
b. 打开 `docs/.vitepress/config.mts`，在 `sidebar` 对应分组的 `items` 里加一行：

```ts
{
  text: 'MIKUEngine',
  items: [
    {
      text: 'RHI',
      items: [
        { text: 'Texture资源创建流程', link: '/notes/miku-engine/rhi/texture-creation' },
        { text: 'Buffer资源创建流程', link: '/notes/miku-engine/rhi/buffer-creation' }  // ← 新增
      ]
    },
    { text: 'RenderGraph', link: '/notes/miku-engine/render-graph' }
  ]
}
```

c. push 发布（见第 4 步）

> 链接规则：`/notes/` + 目录路径 + 文件名（**不带 .md 后缀**）。
> 不登记侧边栏也能通过 URL 访问，但侧边栏看不到。

### 2. 新增一个分类

a. `docs/notes/` 下新建目录，例如 `docs/notes/gameplay/`
b. `config.mts` 的 `sidebar` 数组里追加一组：

```ts
{
  text: 'Gameplay',
  items: [
    { text: '技能系统', link: '/notes/gameplay/skill-system' }
  ]
}
```

### 3. 嵌套子分类

分组里再放分组即可，层级不限（参考 MIKUEngine > RHI 的写法）。

### 4. 发布

```
git add .
git commit -m "docs: 新增xxx笔记"
git push
```

push 后流水线自动构建，约 1 分钟生效。在仓库 Actions 标签页可看部署状态。

### 5. 本地预览（push 前检查效果）

```
npm run docs:dev       ← 开发模式，改文件实时刷新，地址 http://localhost:5173
npm run docs:build     ← 构建一次（会检查死链，报错说明有链接写错）
npm run docs:preview   ← 预览构建后的最终效果
```

### 6. 删除 / 重命名笔记

- 删除：删 `.md` 文件 + 删掉 `config.mts` 里对应的登记行，一起 push
- 重命名/移动：改文件位置 + 同步改 `config.mts` 里的 link
- **注意**：如果只删文件忘了删登记，构建会因死链失败（流水线变红）

---

## 三、插图（PicGo 插件）

截图自动上传到图床仓库，插入 CDN 链接，不用手动管理图片。

### 快捷键

| 快捷键 | 作用 |
|---|---|
| `Ctrl+Alt+U` | 上传剪贴板图片（最常用：截图后直接按） |
| `Ctrl+Alt+O` | 手动输入图片路径上传 |
| `Ctrl+Alt+E` | 从文件资源管理器选图上传 |

**日常用法**：截图 → 光标放在 .md 里要插图的位置 → `Ctrl+Alt+U` → 自动插入 `![xxx](https://cdn.jsdelivr.net/...)` 链接。

### 配置位置

配置在 CodeBuddy 用户设置里（`Ctrl+Shift+P` → `Open User Settings (JSON)`）：

```json
"picgo.picBed.current": "github",
"picgo.picBed.github.repo": "Heqile666/NotesImgaes",
"picgo.picBed.github.branch": "main",
"picgo.picBed.github.token": "<你的Token>",
"picgo.picBed.github.path": "img/",
"picgo.picBed.github.customUrl": "https://cdn.jsdelivr.net/gh/Heqile666/NotesImgaes@main"
```

- 想改图片存放目录：改 `path`，例如 `"img/2026/"`
- Token 过期后：GitHub → Settings → Developer settings → Fine-grained tokens 重新生成，替换 `token` 值

### 图片命名规则（可选）

加 `"picgo.customUploadName"` 配置可定制上传文件名，支持变量：

| 变量 | 含义 |
|---|---|
| `${fileName}` | 原始文件名 |
| `${extName}` | 扩展名 |
| `${mdFileName}` | 当前编辑的 md 文件名 |
| `${date}` | 日期 |
| `${dateTime}` | 时间戳 |

例：`"picgo.customUploadName": "${mdFileName}-${dateTime}${extName}"` → `ssao-26-07-30-21-05-33.png`

---

## 四、常见问题

| 问题 | 排查 |
|---|---|
| push 后网站没更新 | 看 Actions 标签页流水线是否变红，点进去看报错 |
| 构建失败（死链） | 有 `.md` 被删/移动但侧边栏还引用着，或 link 拼写与文件路径不符 |
| 页面 404 | 确认文件已提交且 push 成功；新页面首次访问等 1 分钟 |
| 图片上传失败 | Token 过期或填错；图床仓库名改了就同步改 `repo` 和 `customUrl` |
| 网页不显示最新内容 | `Ctrl+F5` 强制刷新（浏览器缓存） |
| 图片刚上传访问不到 | jsDelivr CDN 缓存，等 1~2 分钟 |
