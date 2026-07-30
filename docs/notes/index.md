# 笔记

这里是我的笔记集合，按目录分类组织。

## 如何添加一篇笔记

1. 在 `docs/notes/` 下按分类建目录，例如 `docs/notes/cpp/`
2. 在目录里新建 `.md` 文件，例如 `docs/notes/cpp/smart-pointer.md`
3. 在 `docs/.vitepress/config.mts` 的 `sidebar` 中登记：

```ts
{
  text: 'C++',
  collapsed: false,
  items: [
    { text: '智能指针', link: '/notes/cpp/smart-pointer' }
  ]
}
```

4. `git add . && git commit -m "docs: xxx" && git push`，自动发布
