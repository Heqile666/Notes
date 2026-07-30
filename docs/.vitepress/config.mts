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
      { text: '笔记', link: '/notes/hello' }
    ],

    sidebar: [
      {
        text: '开始',
        items: [
          { text: '第一篇笔记', link: '/notes/hello' }
        ]
      }
    ],

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
