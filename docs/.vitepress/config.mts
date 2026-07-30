import { defineConfig } from 'vitepress'

export default defineConfig({
  // CI 里会通过环境变量注入 /<仓库名>/，本地开发时为 /
  base: process.env.VITEPRESS_BASE || '/',

  lang: 'zh-CN',
  title: '我的笔记',
  description: '个人知识库',
  cleanUrls: true,
  lastUpdated: true,

  markdown: {
    lineNumbers: true
  },

  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: '笔记', link: '/notes/' }
    ],

    sidebar: {
      '/notes/': [
        {
          text: '笔记',
          items: [
            { text: '说明', link: '/notes/' }
          ]
        },
        // 每个 text 分组 = 一个目录节点（可折叠），items 里的 link = 一篇笔记
        // 分组里可以再嵌套分组，层级不限
        {
          text: '渲染特性',
          collapsed: false,
          items: [
            { text: 'SSAO', link: '/notes/rendering-features/ssao' }
          ]
        },
        {
          text: 'MIKUEngine',
          collapsed: false,
          items: [
            {
              text: 'RHI',
              collapsed: false,
              items: [
                { text: 'Texture资源创建流程', link: '/notes/miku-engine/rhi/texture-creation' }
              ]
            },
            { text: 'RenderGraph', link: '/notes/miku-engine/render-graph' }
          ]
        }
      ]
    },

    search: {
      provider: 'local'
    },

    outline: {
      label: '本页目录'
    },

    docFooter: {
      prev: '上一篇',
      next: '下一篇'
    },

    lastUpdated: {
      text: '最后更新'
    },

    returnToTopLabel: '回到顶部',
    sidebarMenuLabel: '菜单',
    darkModeSwitchLabel: '主题'
  }
})
