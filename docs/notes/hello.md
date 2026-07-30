# 第一篇笔记

这是你的第一篇笔记。在 `docs/notes/` 目录下新建 `.md` 文件即可添加更多笔记。

## 写代码

```cpp
// 支持代码高亮和行号
#include <cstdio>

int main() {
    printf("hello notes\n");
    return 0;
}
```

## 插入图片

推荐把图片传到图床仓库，然后用 jsDelivr 链接引用：

```md
![描述](https://cdn.jsdelivr.net/gh/<你的用户名>/<图床仓库名>@main/图片路径.png)
```

## 提示框

::: tip 提示
VitePress 支持 tip / warning / danger 等容器。
:::

::: warning 注意
新增笔记后，记得在 `docs/.vitepress/config.mts` 的 `sidebar` 里登记，才会出现在侧边栏。
:::
