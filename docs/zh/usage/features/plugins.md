# 插件系统

KiraAI 支持丰富的插件扩展，让您可以轻松定制和增强 AI 数字生命的功能。

## 什么是插件？

插件是一种模块化的扩展，允许您向 KiraAI 添加新功能，而无需修改核心代码。每个插件都可以提供特定的功能，扩展数字生命的能力边界。

## 插件功能

### 事件钩子（Hook）

插件可以监听消息处理的每个阶段 —— 从接收 IM 消息，到 LLM 处理，再到发送回复。这使得插件能够注入 Prompt、修改响应，并对系统事件做出反应。

### 自定义工具（Tool）

插件可以注册供 LLM 在对话中调用的工具。例如，搜索插件可以注册一个 `web_search` 工具，当 LLM 需要查询信息时即可调用。

### 自定义标签（Tag）

插件可以注册自定义 XML 标签处理器。当 LLM 输出 XML 标签（如 `<sticker>`）时，对应的处理器会将其转换为图片或音频等消息元素。

### REST API 端点

插件可以通过 FastAPI 暴露 HTTP API 端点，使外部系统能够与插件进行交互。

### WebUI 页面

插件可以注册自定义网页，嵌入到 KiraAI 的 WebUI 中，内置主题适配和 Bridge SDK，方便前后端通信。

### 概览 Widget

插件可以在概览仪表盘页面注册动态 Widget —— 包括紧凑的统计卡片和全宽 HTML 卡片。Widget 函数在每次仪表盘刷新时实时调用，通过 Tailwind CSS 内置深色模式支持。

### 配置系统

插件可以通过 `schema.json` 定义配置结构，支持 15 种以上字段类型，在 WebUI 中自动生成设置界面，无需编写任何前端代码。

## 内置插件

KiraAI 自带以下内置插件：

| 插件            | 说明                                             |
| --------------- | ------------------------------------------------ |
| `chat`          | 核心消息路由、缓冲和策略管理                     |
| `kira-ai`       | XML 标签注入和 LLM 响应自动修复                  |
| `memory`        | AI 的长期记忆管理                                |
| `sticker`       | 对话中的表情包/贴纸支持                          |
| `search`        | 为 LLM 提供网页搜索能力                          |
| `file`          | 文件操作（读取、写入、列出）                     |
| `session_tools` | 跨会话感知与管理                                 |

## 插件开发

您可以根据[插件开发指南](/zh/development/plugins/dev-guide)开发自己的插件。

关键文档：

- [开发指南](/zh/development/plugins/dev-guide) — 概览与快速上手
- [manifest.json](/zh/development/plugins/manifest) — 插件元数据与版本管理
- [配置系统](/zh/development/plugins/config-system) — schema.json 与 UI 字段
- [主类](/zh/development/plugins/main-class) — BasePlugin 生命周期
- [Hook 系统](/zh/development/plugins/hooks) — 事件、工具与标签
- [API 注册](/zh/development/plugins/fast-api) — REST API、页面与静态资源
- [插件上下文](/zh/development/plugins/context) — PluginContext API 参考
