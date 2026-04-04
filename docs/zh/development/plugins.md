# 插件开发指南

KiraAI拥有强大的插件扩展能力，开发者可以通过开发插件来扩展KiraAI的功能，扩展数字生命的能力边界。

## 概述

KiraAI 的插件系统基于事件驱动架构，允许插件通过以下三种方式扩展系统功能：

- **Hook**：监听消息到达、LLM 请求/响应等系统事件，插入自定义逻辑
- **Tool**：向 LLM 注册可调用的工具函数
- **Tag**：注册自定义 XML 标签处理器，控制消息输出格式

插件放置于 `data/plugins/` 目录下，系统启动时自动发现并加载。

## 插件目录结构

```
data/plugins/
└── my_plugin/              # 插件文件夹（即 plugin_id，除非 manifest.json 中另有指定）
    ├── manifest.json       # 插件元信息（必填）
    ├── main.py             # 插件主入口（必填，也可用 plugin.py 或 __init__.py）
    ├── schema.json         # 配置字段定义（可选，有配置项时填写）
    └── ...                 # 其他辅助模块
```

> 插件加载时按以下顺序查找入口文件：`main.py` → `plugin.py` → `__init__.py`

## manifest.json

描述插件的基本信息，**必须存在**，否则插件将以文件夹名作为 `plugin_id`。

```json
{
  "display_name": "我的插件",
  "plugin_id": "my_plugin",
  "version": "1.0",
  "author": "Your Name",
  "description": "插件功能描述",
  "repo": "https://github.com/..."
}
```

| 字段           | 说明                                      | 必填 |
| -------------- | ----------------------------------------- | ---- |
| `plugin_id`    | 插件唯一 ID，影响配置文件名和数据目录名   | 推荐 |
| `display_name` | WebUI 中显示的插件名称                    | 否   |
| `version`      | 版本号                                    | 否   |
| `author`       | 作者                                      | 否   |
| `description`  | 插件描述                                  | 否   |
| `repo`         | 仓库地址                                  | 否   |

## 插件主类

所有插件必须继承 `BasePlugin` 并实现 `initialize()` 和 `terminate()` 两个生命周期方法。

```python
from core.plugin import BasePlugin, PluginContext

class MyPlugin(BasePlugin):
    def __init__(self, ctx: PluginContext, cfg: dict):
        super().__init__(ctx, cfg)
        # self.ctx  -> PluginContext，访问系统各服务
        # self.plugin_cfg  -> dict，插件配置（来自 schema.json 或配置文件）

    async def initialize(self):
        """插件加载时调用，在此初始化资源、注册事件等"""
        pass

    async def terminate(self):
        """插件卸载时调用，在此释放资源、取消任务等"""
        pass
```

> `initialize()` 执行成功后，系统才会注册该插件的 Hook、Tool、Tag。

## Hook 系统

Hook 允许插件监听系统事件，使用 `@on.<event>()` 装饰器注册。Hook 函数必须是 `async` 方法。

### 导入

```python
from core.plugin import on, Priority
```

### 事件类型

:::warning
本项目处于活跃开发期，装饰器系统可能会有变化。
:::

| 装饰器                   | 触发时机                           | 主要参数                           |
| ------------------------ | ---------------------------------- | ---------------------------------- |
| `@on.im_message()`       | IM 消息到达时（最早）              | `event: KiraMessageEvent`          |
| `@on.message_buffered()` | 消息进入缓冲区后                   | `event: KiraMessageEvent`          |
| `@on.im_batch_message()` | 消息经 debounce 合并后             | `event: KiraMessageEvent`          |
| `@on.llm_request()`      | 向 LLM 发送请求前（注入 Prompt）   | `event`, `req: LLMRequest`         |
| `@on.llm_response()`     | LLM 原始响应返回后                 | `event`, `resp: LLMResponse`       |
| `@on.after_xml_parse()`  | XML 解析完成后（得到 MessageChain）| `event`, `chain: MessageChain`     |
| `@on.tool_result()`      | 工具调用返回结果后                 | `event`, `result: ToolResult`      |
| `@on.step_result()`      | Agent 每步结束后                   | `event`, `resp: LLMResponse`       |
| `@on.final_result()`     | 最终消息结果生成后                 | `event`, `chain: MessageChain`     |

### 优先级

```python
class Priority(IntEnum):
    SYS_HIGH = 100   # 系统保留，勿用
    HIGH     = 50    # 高优先级（消息预处理等）
    MEDIUM   = 0     # 默认
    LOW      = -50   # 低优先级（后置处理等）
    SYS_LOW  = -100  # 系统保留，勿用
```

**数字越大，越先执行。** 未指定时默认为 `MEDIUM`。

### 示例：监听消息

```python
from core.plugin import on, Priority
from core.chat import KiraMessageEvent
from core.chat.message_elements import Text

class MyPlugin(BasePlugin):
    @on.im_message(priority=Priority.HIGH)
    async def on_message(self, event: KiraMessageEvent, *args, **kwargs):
        # 方式一：message_repr，所有元素的 repr 拼接（立即可用）
        text = event.message_repr

        # 方式二：从 chain 中提取纯文本（只取 Text 元素）
        text = "".join(ele.text for ele in event.message.chain if isinstance(ele, Text))

        if "关键词" in text:
            # 处理逻辑...
            pass
```

### 消息处理策略

在 `@on.im_message()` 钩子中，可以通过调用 `event` 上的方法来决定消息的后续处理方式。默认策略为 `discard`（丢弃）。默认消息插件会将其设置为 `buffer`，达到指定数量会时间后会触发 LLM 处理消息。

| 方法                  | 策略      | 说明                                                              |
| --------------------- | --------- | ----------------------------------------------------------------- |
| `event.trigger()`     | `trigger` | 立即处理，跳过 debounce，直接进入 LLM 流程                        |
| `event.buffer()`      | `buffer`  | 进入缓冲区等待，触发 `ON_MESSAGE_BUFFERED` 钩子                   |
| `event.flush()`       | `flush`   | 将当前消息加入缓冲区，并立即刷出所有缓冲消息一起处理              |
| `event.discard()`     | `discard` | 丢弃此消息，不做任何处理（但调用完当前阶段的所有钩子）            |
| `event.stop()`        | —         | 立刻中止后续所有钩子的处理，消息不再继续传递                      |

所有策略方法均接受可选参数 `force=True`，设置后后续钩子无法再覆盖该策略。

### 示例：注入 Prompt

```python
from core.plugin import on
from core.provider import LLMRequest
from core.prompt_manager import Prompt

class MyPlugin(BasePlugin):
    @on.llm_request()
    async def inject_prompt(self, event, req: LLMRequest, tag_set, *args, **kwargs):
        # 方式一：向已有 section 追加字符串内容
        for p in req.system_prompt:
            if p.name == "tools":
                p.content += "\n你可以使用 my_tool 工具来..."
                break

        # 方式二：追加一个新的 Prompt 对象
        # name 为该 Prompt 的名称，source 为来源，建议设置为插件 ID
        req.system_prompt.append(Prompt(
            content="以下是插件注入的额外上下文：...",
            name="my_plugin_context",
            source="my_plugin",
        ))
```

> 两种方式可以混用。方式一适合向已有固定 section（如 `"tools"`、`"memory"`）追加内容；方式二适合插件完整地插入一段独立上下文。

## Tool 注册

Tool 向 LLM 暴露可调用的函数，有两种注册方式。

### 方式一：`@register.tool` 装饰器

适用于逻辑简单、直接写在插件类方法上的工具。

```python
from core.plugin import register

class MyPlugin(BasePlugin):
    @register.tool(
        name="my_tool",
        description="工具的用途说明（LLM 根据此决定是否调用）",
        params={
            "type": "object",
            "properties": {
                "query": {
                    "type": "string",
                    "description": "查询内容"
                },
                "limit": {
                    "type": "integer",
                    "description": "返回条数，默认 10"
                }
            },
            "required": ["query"]
        }
    )
    async def my_tool(self, event: KiraMessageBatchEvent, *_, query: str, limit: int = 10) -> str:
        # 工具逻辑，返回字符串结果
        return f"查询结果：{query}"
```

> `params` 遵循 JSON Schema 格式（OpenAI 工具调用规范）。
> 函数第一个参数为 `event: KiraMessageBatchEvent`，工具参数均通过关键字参数传入。使用 `*_` 兼容未来可能新增的位置参数。

### 方式二：`BaseTool` 类（适合复杂工具）

适用于工具逻辑较复杂、需要独立封装或复用的场景。继承 `BaseTool`，然后在 `@on.llm_request()` 钩子中通过 `req.tool_set.add()` **按需**注入到当次请求：

```python
from core.utils.tool_utils import BaseTool
from core.provider import LLMRequest
from core.plugin import on

class MySearchTool(BaseTool):
    name = "my_search"
    description = "搜索指定关键词并返回结果"
    parameters = {
        "type": "object",
        "properties": {
            "query": {"type": "string", "description": "搜索关键词"}
        },
        "required": ["query"]
    }

    async def execute(self, query: str) -> str:
        # 工具执行逻辑
        return f"搜索结果：{query}"


class MyPlugin(BasePlugin):
    @on.llm_request()
    async def add_tools(self, event, req: LLMRequest, tag_set, *args, **kwargs):
        req.tool_set.add(MySearchTool(ctx=self.ctx))
```

> 与 `@register.tool` 全局注册不同，`tool_set.add()` 只对当次请求生效，适合需要根据条件动态决定是否提供某工具的场景。

### 返回附件：ToolResult

工具函数默认返回字符串，若需要同时返回文件（图片、音频、文件等），可返回 `ToolResult` 对象。LLM 收到结果后，可通过 `<file>` 标签将附件发送给用户。

```python
from core.provider import ToolResult
from core.chat.message_elements import Image, Record, File

class MyPlugin(BasePlugin):
    @register.tool(
        name="take_screenshot",
        description="截图并返回图片",
        params={"type": "object", "properties": {}, "required": []}
    )
    async def take_screenshot(self, event: KiraMessageBatchEvent, *_) -> ToolResult:
        path = await self._do_screenshot()  # 返回本地文件路径
        return ToolResult(
            text="截图完成",
            attachments=[Image(path=path)]
        )
```

`ToolResult` 字段说明：

| 字段          | 类型                              | 说明                                    |
| ------------- | --------------------------------- | --------------------------------------- |
| `text`        | `str`                             | 返回给 LLM 的文字描述                   |
| `attachments` | `list[Image \| Record \| File]`   | 附件列表，LLM 可用 `<file>` 标签发送    |

## Tag 注册

Tag 注册自定义的 XML 标签处理器，当 LLM 输出中包含对应标签时触发，同样有两种方式。

### 方式一：`@register.tag` 装饰器（推荐）

```python
from core.plugin import register
from core.chat.message_elements import Text

class MyPlugin(BasePlugin):
    @register.tag(
        name="my_tag",
        description="标签的描述，会注入到 LLM 的工具说明中"
    )
    async def handle_my_tag(self, value: str, **kwargs) -> list:
        # value 是标签内容，如 <my_tag>value</my_tag>
        # 返回 list[BaseMessageElement]
        return [Text(value)]
```

### 方式二：`BaseTag` 类（适合复杂或按需注入的标签）

适用于标签处理逻辑较重、需要独立封装的场景。继承 `BaseTag`，然后在 `@on.llm_request()` 钩子中通过 `tag_set.register()` **按需**注入到当次请求：

```python
from core.tag import BaseTag
from core.provider import LLMRequest
from core.chat.message_elements import Image
from core.plugin import on

class MyTag(BaseTag):
    name = "my_tag"
    description = "处理自定义标签并渲染为图片"

    async def handle(self, value: str, **kwargs) -> list:
        # self.ctx 可用（注册时传入）
        image_path = await self._render(value)
        return [Image(path=image_path)]

    async def _render(self, content: str) -> str:
        # 复杂渲染逻辑...
        return "/tmp/output.png"


class MyPlugin(BasePlugin):
    @on.llm_request()
    async def add_tags(self, event, req: LLMRequest, tag_set, *args, **kwargs):
        tag_set.register(MyTag(ctx=self.ctx))
```

> `tag_set` 是 `@on.llm_request()` 钩子的第三个位置参数，类型为 `TagSet`。与 `@register.tag` 全局注册不同，此方式只对当次请求生效，适合按会话/条件动态启用标签。


## API 注册

`@register.api` 装饰器可以使插件暴露 HTTP REST API 端点，自动集成到 WebUI 的 FastAPI 应用中。所有插件 API 端点都以 `/api/plugin/{plugin_id}/` 为前缀。

### 导入

```python
from core.plugin import register
```

### 装饰器参数

| 参数      | 类型    | 必填 | 默认值 | 说明                                                   |
| --------- | ------- | ---- | ------ | ------------------------------------------------------ |
| `method`  | `str`   | 是   | —      | HTTP 方法: `"GET"`, `"POST"`, `"PUT"`, `"DELETE"`, `"PATCH"` |
| `path`    | `str`   | 是   | —      | 端点路径（如 `"/items"`, `"/users/{user_id}"`）       |
| `auth`    | `bool`  | 否   | `True` | 是否需要 JWT 认证                                       |
| `**kwargs`| dict    | 否   | —      | FastAPI `add_api_route` 方法的其他参数                 |

### 基础用法

```python
class MyPlugin(BasePlugin):
    @register.api(method="GET", path="/status", auth=True)
    async def get_status(self):
        return {"status": "running"}

    @register.api(method="GET", path="/users/{user_id}", auth=True)
    async def get_user(self, user_id: int):
        return {"user_id": user_id}

    @register.api(method="POST", path="/items", auth=True)
    async def create_item(self, name: str, description: str = ""):
        return {"id": 123, "name": name}
```

**最终路由：**
- `GET /api/plugin/my_plugin/status`
- `GET /api/plugin/my_plugin/users/{user_id}`
- `POST /api/plugin/my_plugin/items`

### 路径参数和查询参数

FastAPI 风格的路径参数（带类型注解）对应路径参数；其他函数参数对应查询参数：

```python
@register.api(method="GET", path="/search", auth=True)
async def search(self, q: str, limit: int = 10, offset: int = 0):
    # q -> 查询参数（必填）
    # limit, offset -> 查询参数（可选）
    return {"query": q, "results": []}
```

### 使用 Pydantic 模型的请求体

对于 POST/PUT 请求，使用 Pydantic 模型进行请求验证：

```python
from pydantic import BaseModel

class CreateUserRequest(BaseModel):
    username: str
    email: str
    age: int | None = None

@register.api(method="POST", path="/users", auth=True)
async def create_user(self, request: CreateUserRequest):
    return {"id": 123, "username": request.username}
```

### 错误处理

使用 FastAPI 的 `HTTPException` 抛出 HTTP 异常：

```python
from fastapi import HTTPException

@register.api(method="GET", path="/users/{user_id}", auth=True)
async def get_user(self, user_id: int):
    user = await self._fetch_user(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")
    return user
```

### 响应模型和文档

指定响应模型以生成自动 OpenAPI 文档：

```python
from pydantic import BaseModel
from typing import List

class UserResponse(BaseModel):
    id: int
    username: str
    email: str

@register.api(
    method="GET",
    path="/users",
    auth=True,
    response_model=List[UserResponse],
    summary="获取所有用户",
    description="返回一个完整的用户列表"
)
async def list_users(self):
    return [{"id": 1, "username": "kira", "email": "kira@example.com"}]
```

### 公开端点（无需认证）

```python
@register.api(method="GET", path="/public/info", auth=False)
async def public_info(self):
    return {"version": "1.0.0"}
```

## 页面和静态资源注册

插件可以使用 `@register.page` 和 `@register.static` 装饰器来注册自定义 WebUI 页面和提供静态资源。这允许插件提供丰富的交互式用户界面。

### 页面注册

`@register.page` 装饰器注册动态页面端点，serve HTML 内容。所有插件页面都以 `/page/plugin/{plugin_id}/` 为前缀。

#### 参数说明

| 参数       | 类型   | 必填 | 默认值 | 说明                                                       |
| --------- | ------ | ---- | ------ | ---------------------------------------------------------- |
| `route`   | `str`  | 是   | —      | URL 路径（如 `"/dashboard"`, `"/{path:path}"`）           |
| `auth`    | `bool` | 否   | `True` | 是否需要用户认证                                           |
| `menu`    | `dict` | 否   | `None` | 侧边栏菜单配置。可选键：`title`, `icon`, `category`, `priority` |

#### 处理函数需求

处理函数必须返回 `HTMLResponse`（或其他 FastAPI Response 类型）：

```python
from fastapi.responses import HTMLResponse

@register.page(route="/dashboard", auth=True)
async def dashboard(self):
    return HTMLResponse("""
    <!DOCTYPE html>
    <html>
    <head><title>仪表板</title></head>
    <body><h1>仪表板</h1></body>
    </html>
    """)
```

**最终路由：** `/page/plugin/my_plugin/dashboard`

#### 菜单集成

通过 `menu` 参数在 WebUI 侧边栏添加导航项：

```python
@register.page(
    route="/settings",
    menu={
        "title": "插件设置",
        "icon": "settings",
        "category": "plugin-pages",
        "priority": 0
    }
)
async def settings_page(self):
    return HTMLResponse("<h1>设置</h1>")
```

若省略 `menu`，页面不会显示在侧边栏中，但仍可通过直接 URL 访问。

#### 单页面应用（SPA）的 catch-all 路由

对于单页面应用，使用 FastAPI 的路径参数来 catch 所有子路由：

```python
@register.page(route="/{plugin_route:path}")
async def spa_entry(self, plugin_route: str = ""):
    # plugin_route 包含子路径（如 "users/profile"）
    # 所有路由返回同样的 HTML，由客户端 JS 路由器处理
    return HTMLResponse("""
    <!DOCTYPE html>
    <html>
    <head>
        <script src="/page/plugin/my_plugin/static/app.js"></script>
    </head>
    <body><div id="app"></div></body>
    </html>
    """)
```

### 静态资源注册

`@register.static` 装饰器注册目录以提供静态文件（CSS、JavaScript、图片等）。静态文件无需认证即可公开访问。

#### 参数说明

| 参数        | 类型   | 必填 | 默认值 | 说明                                             |
| ----------- | ------ | ---- | ------ | ------------------------------------------------ |
| `path`      | `str`  | 是   | —      | URL 路径前缀（如 `"/static"`）                   |
| `directory` | `str`  | 是   | —      | 本地目录路径（相对于插件根目录）                 |
| `html`      | `bool` | 否   | `False`| 若为 `True`，目录请求时 serve `index.html`      |

#### 基础用法

```python
class MyPlugin(BasePlugin):
    @register.static(path="/static", directory="static")
    async def _init_static(self):
        pass

    @register.page(route="/")
    async def main_page(self):
        return HTMLResponse("""
        <!DOCTYPE html>
        <html>
        <head>
            <link rel="stylesheet" href="/page/plugin/my_plugin/static/css/style.css">
        </head>
        <body>
            <h1>我的插件</h1>
            <script src="/page/plugin/my_plugin/static/js/app.js"></script>
        </body>
        </html>
        """)
```

**最终 URL：**
- 页面：`/page/plugin/my_plugin/`
- 静态 CSS：`/page/plugin/my_plugin/static/css/style.css`
- 静态 JS：`/page/plugin/my_plugin/static/js/app.js`

#### 多个静态目录

```python
class MyPlugin(BasePlugin):
    @register.static(path="/css", directory="resources/css")
    @register.static(path="/js", directory="resources/js")
    @register.static(path="/images", directory="resources/images")
    async def _init_static(self):
        pass
```

**最终 URL：**
- `/page/plugin/my_plugin/css/*`
- `/page/plugin/my_plugin/js/*`
- `/page/plugin/my_plugin/images/*`

#### SPA 的 HTML 模式

设置 `html=True` 时，访问 `/page/plugin/my_plugin/` 会 serve `dist/index.html`：

```python
@register.static(path="/", directory="dist", html=True)
async def _init_static(self):
    pass
```

### 带有页面的插件目录结构

一个包含页面和静态资源的典型插件：

```
my_plugin/
├── manifest.json
├── main.py
├── static/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   └── app.js
│   └── images/
│       └── logo.png
└── templates/      (可选，如果使用 Jinja2)
    └── index.html
```

## PluginContext API

`self.ctx` 提供对系统各核心服务的访问：

```python
self.ctx.config           # KiraConfig：全局配置
self.ctx.event_bus        # EventBus：事件总线
self.ctx.session_mgr      # SessionManager：会话管理
self.ctx.adapter_mgr      # AdapterManager：适配器管理
self.ctx.persona_mgr      # PersonaManager：人格管理
self.ctx.provider_mgr     # ProviderManager：模型提供商管理
self.ctx.llm_api          # LLMClient：LLM 客户端
self.ctx.sticker_manager  # StickerManager：贴纸管理
```

### 获取数据目录

```python
async def initialize(self):
    data_dir = self.ctx.get_plugin_data_dir()
    # 返回 data/plugin_data/{plugin_id}/ 的 Path 对象，自动创建
```

### 获取 LLM 客户端

```python
# 使用默认 LLM
llm = self.ctx.get_default_llm_client()

# 使用快速 LLM
fast_llm = self.ctx.get_default_fast_llm_client()

# 使用指定模型（provider_id:model_id 格式）
llm = self.ctx.get_llm_client(model_uuid="openai:gpt-4o")
```

### 获取 Embedding 客户端

```python
emb = self.ctx.get_default_embedding_client()
```

### 获取其他插件实例

```python
other_plugin = self.ctx.get_plugin_inst("other_plugin_id")
```

### 获取消息缓冲区

```python
buffer = self.ctx.get_buffer(session_id)
await self.ctx.flush_session_messages(session_id)
```

## 配置系统（schema.json）

通过 `schema.json` 定义插件的配置字段，系统会自动生成 WebUI 配置界面并持久化配置。

### 位置

`data/plugins/my_plugin/schema.json`

### 配置在插件中的读取

```python
class MyPlugin(BasePlugin):
    async def initialize(self):
        api_key = self.plugin_cfg.get("api_key", "")
        enabled = self.plugin_cfg.get("enabled", True)
        max_count = self.plugin_cfg.get("max_count", 10)
```

### 支持的字段类型

| type           | 说明                           | 额外参数                  |
| -------------- | ------------------------------ | ------------------------- |
| `string`       | 单行文本输入框                 | —                         |
| `integer`      | 整数输入框                     | —                         |
| `float`        | 浮点数输入框                   | —                         |
| `sensitive`    | 密码形式隐藏（用于 API Key 等）| —                         |
| `switch`       | 布尔开关                       | —                         |
| `list`         | 多行列表（每行一条）           | —                         |
| `enum`         | 下拉选项                       | `options: [...]`          |
| `json`         | JSON 编辑器                    | —                         |
| `yaml`         | YAML 编辑器                    | —                         |
| `editor`       | 代码/文本编辑器                | `language: "python"`      |
| `textarea`     | 多行纯文本输入                 | —                         |
| `markdown`     | Markdown 编辑器                | —                         |
| `model_select` | 模型选择器                     | `model_type: "llm"/"tts"` |

### 示例 schema.json

```json
{
  "api_key": {
    "type": "sensitive",
    "name": "API Key",
    "default": "",
    "hint": "服务的 API 密钥"
  },
  "filed_enabled": {
    "type": "switch",
    "name": "启用",
    "default": true,
    "hint": "是否启用xxx"
  },
  "max_results": {
    "type": "integer",
    "name": "最大结果数",
    "default": 10,
    "hint": "每次最多返回的结果条数"
  },
  "mode": {
    "type": "enum",
    "name": "模式",
    "default": "auto",
    "options": ["auto", "manual", "disabled"],
    "hint": "运行模式"
  },
  "allowed_sessions": {
    "type": "list",
    "name": "允许的会话",
    "default": [],
    "hint": "留空表示不限制，每行一个会话 ID"
  },
  "llm_model": {
    "type": "model_select",
    "name": "使用的语言模型",
    "model_type": "llm",
    "default": "",
    "hint": "留空则使用系统默认模型"
  }
}
```

> 配置文件保存在 `data/config/plugins/{plugin_id}.json`，会在插件初始化时自动生成默认值。

## 数据存储

插件应将持久化数据存放到专属数据目录，避免与其他插件冲突：

```python
import json
from pathlib import Path

class MyPlugin(BasePlugin):
    def __init__(self, ctx, cfg):
        super().__init__(ctx, cfg)
        self.data_dir: Path = None
        self.data_file: Path = None

    async def initialize(self):
        self.data_dir = self.ctx.get_plugin_data_dir()
        # 路径：data/plugin_data/my_plugin/

        self.data_file = self.data_dir / "data.json"
        if not self.data_file.exists():
            self.data_file.write_text("{}", encoding="utf-8")

    def load_data(self) -> dict:
        return json.loads(self.data_file.read_text(encoding="utf-8"))

    def save_data(self, data: dict):
        self.data_file.write_text(
            json.dumps(data, ensure_ascii=False, indent=2),
            encoding="utf-8"
        )
```

## 后台任务

需要定时轮询或长期运行的任务，使用 `asyncio.create_task()` 并在 `terminate()` 中取消：

```python
import asyncio

class MyPlugin(BasePlugin):
    def __init__(self, ctx, cfg):
        super().__init__(ctx, cfg)
        self._task: asyncio.Task = None

    async def initialize(self):
        self._task = asyncio.create_task(self._background_loop())

    async def terminate(self):
        if self._task:
            self._task.cancel()
            try:
                await self._task
            except asyncio.CancelledError:
                pass

    async def _background_loop(self):
        while True:
            try:
                await self._do_work()
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"后台任务异常: {e}")
            await asyncio.sleep(60)  # 每 60 秒执行一次
```

## 主动推送消息

插件可以主动向指定会话发送消息（不依赖用户触发），通过 `ctx.publish_notice()` 实现：

```python
from core.chat import MessageChain
from core.chat.message_elements import Text

class MyPlugin(BasePlugin):
    async def send_notice(self, session_id: str, content: str):
        """
        session_id 格式：{adapter_name}:{type}:{id}
          - 私聊: "napcat:dm:123456"
          - 群聊: "napcat:gm:654321"
        """
        chain = MessageChain([Text(content)])
        await self.ctx.publish_notice(
            session=session_id,
            chain=chain,
            is_mentioned=True
        )
```

## 开发注意事项

1. **Hook 函数签名**：必须接受 `(self, event, *args, **kwargs)`，额外参数（如 `req`、`resp`）通过位置参数传入，建议使用具名参数接收。
2. **Tool 函数签名**：`(self, event: KiraMessageBatchEvent, param1: type, param2: type)` — 第一个参数固定为触发该工具调用的事件对象。
3. **优先级**：`SYS_HIGH` 和 `SYS_LOW` 为系统保留，用户插件使用 `HIGH / MEDIUM / LOW` 或自定义整数。
4. **不要阻塞事件循环**：所有 I/O 操作使用 `await`，CPU 密集型任务用 `asyncio.to_thread()`。
5. **terminate 必须清理**：取消后台任务、关闭连接，避免资源泄漏。
6. **配置热重载**：修改配置后系统会重新调用 `initialize()`，插件应支持重入初始化。
