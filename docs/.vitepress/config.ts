import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "KiraAI",
  description: "KiraAI官方文档",
  base: '/',
  ignoreDeadLinks: true,
  head: [
    // ['link', { rel: 'icon', type: 'image/svg+xml', href: '/logo.svg' }],
    ['meta', { name: 'theme-color', content: '#3eaf7c' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:title', content: 'KiraAI - AI数字生命搭建平台' }],
    ['meta', { property: 'og:description', content: '强大、灵活、可扩展的AI数字生命，支持 Agent 能力' }],
  ],

  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    // logo: '/logo.svg',
    
    nav: [
      { text: '首页', link: '/' },
      { text: '指南', link: '/guide/introduction' },
      { text: '部署教程', link: '/deployment/windows' },
      { text: '开发指南', link: '/development/guide' },
      { text: 'GitHub', link: 'https://github.com/xxynet/KiraAI', target: '_blank' }
    ],

    sidebar: [
      {
        text: '介绍',
        collapsible: true,
        items: [
          { text: '什么是KiraAI', link: '/guide/introduction' },
          { text: '快速开始', link: '/guide/quickstart' },
        ]
      },
      {
        text: '部署',
        collapsible: true,
        items: [
          { text: 'Windows', link: '/deployment/windows' },
          { text: 'Linux', link: '/deployment/linux' },
          { text: 'Docker', link: '/deployment/docker' },
          { text: 'Zeabur', link: '/deployment/zeabur' },
        ]
      },
      {
        text: '配置',
        collapsible: true,
        items: [
          { text: '适配器', link: '/configuration/adapter' },
          { text: '提供商', link: '/configuration/provider' },
        ]
      },
      {
        text: '使用',
        collapsible: true,
        items: [
          { text: 'WebUI', link: '/usage/webui' },
          {
            text: '附加功能',
            collapsible: true,
            items: [
              { text: '插件', link: '/usage/features/plugins' },
              { text: 'MCP', link: '/usage/features/mcp' },
              { text: 'Skills', link: '/usage/features/skills' },
            ]
          }
        ]
      },
      {
        text: '开发',
        collapsible: true,
        items: [
          { text: '插件开发', link: '/development/plugins' },
          { text: '提供商开发', link: '/development/providers' },
          { text: '适配器开发', link: '/development/adapters' },
          { text: 'API参考', link: '/development/api' },
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/xxynet/KiraAI' }
    ],

    footer: {
      message: 'AGPL 3.0 License',
      copyright: `Copyright © ${new Date().getFullYear()} KiraAI`
    },

    search: {
      provider: 'local'
    },

    outline: {
      level: 'deep',
      label: '页面导航'
    },

    lastUpdated: {
      text: '最后更新',
      formatOptions: {
        dateStyle: 'short',
        timeStyle: 'medium'
      }
    },

    docFooter: {
      prev: '上一页',
      next: '下一页'
    },

    darkModeSwitchLabel: '切换深色模式',
    sidebarMenuLabel: '菜单',
    returnToTopLabel: '返回顶部'
  },

  markdown: {
    lineNumbers: true,
    toc: {
      level: [1, 2, 3]
    }
  },

  lastUpdated: true,

  vite: {
    server: {
      port: 5173,
      host: true
    }
  }
})
