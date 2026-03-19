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

  locales: {
    // 默认语言（中文），对应根目录 `/`
    root: {
      label: '简体中文',
      lang: 'zh', // HTML 的 lang 属性
      title: 'KiraAI',
      description: 'KiraAI数字生命搭建平台',
      themeConfig: {
        nav: [
          { text: '首页', link: '/' },
          { text: '指南', link: '/guide/introduction' },
          { text: '部署教程', link: '/deployment/windows' },
          { text: '开发指南', link: '/development/guide' },
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
        darkModeSwitchLabel: '切换深色模式',
        sidebarMenuLabel: '菜单',
        returnToTopLabel: '返回顶部',
        sidebar: [
          {
            text: '介绍',
            collapsed: false,
            items: [
              { text: '什么是KiraAI', link: '/guide/introduction' },
              { text: '快速开始', link: '/guide/quickstart' },
            ]
          },
          {
            text: '部署',
            collapsed: false,
            items: [
              { text: 'Windows', link: '/deployment/windows' },
              { text: 'Linux', link: '/deployment/linux' },
              { text: 'Docker', link: '/deployment/docker' },
              { text: 'Zeabur', link: '/deployment/zeabur' },
            ]
          },
          {
            text: '配置',
            collapsed: false,
            items: [
              { text: '适配器', link: '/configuration/adapter' },
              { text: '提供商', link: '/configuration/provider' },
            ]
          },
          {
            text: '使用',
            collapsed: false,
            items: [
              { text: 'WebUI', link: '/usage/webui' },
              {
                text: '附加功能',
                collapsed: false,
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
            collapsed: false,
            items: [
              { text: '插件开发', link: '/development/plugins' },
              { text: '提供商开发', link: '/development/providers' },
              { text: '适配器开发', link: '/development/adapters' },
              { text: 'API参考', link: '/development/api' },
            ]
          }
        ],
      }
    },

    en: {
      label: 'English',
      lang: 'en', 
      link: '/en/',
      title: 'KiraAI',
      description: 'KiraAI Digital Life Platform',
      themeConfig: {
        nav: [
          { text: 'Home', link: '/en/' },
          { text: 'Guide', link: '/en/guide/introduction' },
          { text: 'Deployment', link: '/en/deployment/windows' },
          { text: 'Development', link: '/en/development/guide' },
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
        darkModeSwitchLabel: 'Switch to Dark Mode',
        sidebarMenuLabel: 'Menu',
        returnToTopLabel: 'Return to Top',
        sidebar: [
          {
            text: 'Introduction',
            collapsed: false,
            items: [
              { text: 'What is KiraAI', link: '/en/guide/introduction' },
              { text: 'Quick Start', link: '/en/guide/quickstart' },
            ]
          },
          {
            text: 'Deployment',
            collapsed: false,
            items: [
              { text: 'Windows', link: '/en/deployment/windows' },
              { text: 'Linux', link: '/en/deployment/linux' },
              { text: 'Docker', link: '/en/deployment/docker' },
              { text: 'Zeabur', link: '/en/deployment/zeabur' },
            ]
          },
          {
            text: 'Configuration',
            collapsed: false,
            items: [
              { text: 'Adapter', link: '/en/configuration/adapter' },
              { text: 'Provider', link: '/en/configuration/provider' },
            ]
          },
          {
            text: 'Usage',
            collapsed: false,
            items: [
              { text: 'WebUI', link: '/en/usage/webui' },
              {
                text: 'Features',
                collapsed: false,
                items: [
                  { text: 'Plugins', link: '/en/usage/features/plugins' },
                  { text: 'MCP', link: '/en/usage/features/mcp' },
                  { text: 'Skills', link: '/en/usage/features/skills' },
                ]
              }
            ]
          },
          {
            text: 'Development',
            collapsed: false,
            items: [
              { text: 'Plugin Development', link: '/en/development/plugins' },
              { text: 'Provider Development', link: '/en/development/providers' },
              { text: 'Adapter Development', link: '/en/development/adapters' },
              { text: 'API Reference', link: '/en/development/api' },
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
