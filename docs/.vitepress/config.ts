import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "KiraAI",
  description: "KiraAI Digital Life Platform",
  base: '/',
  ignoreDeadLinks: true,
  head: [
    // ['link', { rel: 'icon', type: 'image/svg+xml', href: '/logo.svg' }],
    ['meta', { name: 'theme-color', content: '#3eaf7c' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:title', content: 'KiraAI - Digital Life Platform' }],
    ['meta', { property: 'og:description', content: 'Powerful, flexible, and extensible AI digital life with Agent capabilities' }],
  ],

  locales: {
    // 默认语言（英语），对应根目录 `/`
    root: {
      label: 'English',
      lang: 'en', // HTML 的 lang 属性
      title: 'KiraAI',
      description: 'KiraAI Digital Life Platform',
      themeConfig: {
        nav: [
          { text: 'Home', link: '/' },
          { text: 'Guide', link: '/guide/introduction' },
          { text: 'Deployment', link: '/deployment/windows' },
          { text: 'Development', link: '/development/guide' },
          { text: 'GitHub', link: 'https://github.com/xxynet/KiraAI', target: '_blank' }
        ],
        footer: {
          message: 'AGPL 3.0 License',
          copyright: `Copyright © ${new Date().getFullYear()} KiraAI`
        },
        outline: {
          level: 'deep',
          label: 'Page Navigation'
        },
        lastUpdated: {
          text: 'Last Updated',
          formatOptions: {
            dateStyle: 'short',
            timeStyle: 'medium'
          }
        },
        docFooter: {
          prev: 'Previous',
          next: 'Next'
        },
        darkModeSwitchLabel: 'Dark Mode',
        sidebarMenuLabel: 'Menu',
        returnToTopLabel: 'Return to Top',
        sidebar: [
          {
            text: 'Introduction',
            collapsed: false,
            items: [
              { text: 'What is KiraAI', link: '/guide/introduction' },
              { text: 'Quick Start', link: '/guide/quickstart' },
              { text: 'Community', link: '/guide/community' },
            ]
          },
          {
            text: 'Deployment',
            collapsed: false,
            items: [
              { text: 'Windows', link: '/deployment/windows' },
              { text: 'Linux', link: '/deployment/linux' },
              { text: 'Docker', link: '/deployment/docker' },
              { text: 'Zeabur', link: '/deployment/zeabur' },
              { text: 'Termux', link: '/deployment/termux' },
            ]
          },
          {
            text: 'Configuration',
            collapsed: false,
            items: [
              { text: 'Adapter', link: '/configuration/adapter' },
              { text: 'Provider', link: '/configuration/provider' },
            ]
          },
          {
            text: 'Usage',
            collapsed: false,
            items: [
              { text: 'WebUI', link: '/usage/webui' },
              {
                text: 'Features',
                collapsed: false,
                items: [
                  { text: 'Plugins', link: '/usage/features/plugins' },
                  { text: 'MCP', link: '/usage/features/mcp' },
                  { text: 'Skills', link: '/usage/features/skills' },
                ]
              }
            ]
          },
          {
            text: 'Development',
            collapsed: false,
            items: [
              { text: 'Plugin Development', link: '/development/plugins' },
              { text: 'Provider Development', link: '/development/providers' },
              { text: 'Adapter Development', link: '/development/adapters' },
              { text: 'API Reference', link: '/development/api' },
            ]
          }
        ],
      }
    },

    zh: {
      label: '简体中文',
      lang: 'zh', 
      link: '/zh/',
      title: 'KiraAI',
      description: 'KiraAI数字生命搭建平台',
      themeConfig: {
        nav: [
          { text: '首页', link: '/zh/' },
          { text: '指南', link: '/zh/guide/introduction' },
          { text: '部署教程', link: '/zh/deployment/windows' },
          { text: '开发指南', link: '/zh/development/guide' },
          { text: 'GitHub', link: 'https://github.com/xxynet/KiraAI', target: '_blank' }
        ],
        footer: {
          message: 'AGPL 3.0 License',
          copyright: `Copyright © ${new Date().getFullYear()} KiraAI`
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
        darkModeSwitchLabel: '深色模式',
        sidebarMenuLabel: '菜单',
        returnToTopLabel: '返回顶部',
        sidebar: [
          {
            text: '介绍',
            collapsed: false,
            items: [
              { text: '什么是KiraAI', link: '/zh/guide/introduction' },
              { text: '快速开始', link: '/zh/guide/quickstart' },
              { text: '社区', link: '/zh/guide/community' },
            ]
          },
          {
            text: '部署',
            collapsed: false,
            items: [
              { text: 'Windows', link: '/zh/deployment/windows' },
              { text: 'Linux', link: '/zh/deployment/linux' },
              { text: 'Docker', link: '/zh/deployment/docker' },
              { text: 'Zeabur', link: '/zh/deployment/zeabur' },
              { text: 'Termux', link: '/zh/deployment/termux' },
            ]
          },
          {
            text: '配置',
            collapsed: false,
            items: [
              { text: '适配器', link: '/zh/configuration/adapter' },
              { text: '提供商', link: '/zh/configuration/provider' },
            ]
          },
          {
            text: '使用',
            collapsed: false,
            items: [
              { text: 'WebUI', link: '/zh/usage/webui' },
              {
                text: '附加功能',
                collapsed: false,
                items: [
                  { text: '插件', link: '/zh/usage/features/plugins' },
                  { text: 'MCP', link: '/zh/usage/features/mcp' },
                  { text: 'Skills', link: '/zh/usage/features/skills' },
                ]
              }
            ]
          },
          {
            text: '开发',
            collapsed: false,
            items: [
              { text: '插件开发', link: '/zh/development/plugins' },
              { text: '提供商开发', link: '/zh/development/providers' },
              { text: '适配器开发', link: '/zh/development/adapters' },
              { text: 'API参考', link: '/zh/development/api' },
            ]
          }
        ],
      }
    }
  },

  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    // logo: '/logo.svg',
    
    // 全局导航栏将由locales下的配置覆盖
    nav: [],

    // 全局侧边栏将由locales下的配置覆盖
    sidebar: [],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/xxynet/KiraAI' }
    ],

    search: {
      provider: 'local'
    },
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
