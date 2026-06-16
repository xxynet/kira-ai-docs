# API 注册

`@register.api` 装饰器可以使插件暴露 HTTP REST API 端点，自动集成到 WebUI 的 FastAPI 应用中。所有插件 API 端点都以 `/api/plugin/{plugin_id}/` 为前缀。

## 导入

```python
from core.plugin import register
```

## 装饰器参数

| 参数      | 类型    | 必填 | 默认值 | 说明                                                   |
| --------- | ------- | ---- | ------ | ------------------------------------------------------ |
| `method`  | `str`   | 是   | —      | HTTP 方法: `"GET"`, `"POST"`, `"PUT"`, `"DELETE"`, `"PATCH"` |
| `path`    | `str`   | 是   | —      | 端点路径（如 `"/items"`, `"/users/{user_id}"`）       |
| `auth`    | `bool`  | 否   | `True` | 是否需要 JWT 认证                                       |
| `**kwargs`| dict    | 否   | —      | FastAPI `add_api_route` 方法的其他参数                 |

## 基础用法

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

## 路径参数和查询参数

FastAPI 风格的路径参数（带类型注解）对应路径参数；其他函数参数对应查询参数：

```python
@register.api(method="GET", path="/search", auth=True)
async def search(self, q: str, limit: int = 10, offset: int = 0):
    # q -> 查询参数（必填）
    # limit, offset -> 查询参数（可选）
    return {"query": q, "results": []}
```

## 使用 Pydantic 模型的请求体

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

## 错误处理

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

## 响应模型和文档

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

## 公开端点（无需认证）

```python
@register.api(method="GET", path="/public/info", auth=False)
async def public_info(self):
    return {"version": "1.0.0"}
```

# 页面和静态资源注册

插件可以使用 `@register.page` 和 `@register.static` 装饰器来注册自定义 WebUI 页面和提供静态资源。

## 页面注册

`@register.page` 装饰器注册插件页面。处理函数返回一个 `PluginPage` 对象，描述页面的来源。所有插件页面以 `/page/plugin/{plugin_id}/` 为前缀。

### 导入

```python
from core.plugin import register, PluginPage, PageMenu
```

### 装饰器参数

| 参数    | 类型                    | 必填 | 默认值  | 说明                 |
| ------- | ----------------------- | ---- | ------- | -------------------- |
| `route` | `str`                   | 是   | —       | URL 路径（如 `"/dashboard"`） |
| `auth`  | `bool`                  | 否   | `True`  | 是否需要用户认证     |
| `menu`  | `PageMenu` 或 `dict`    | 否   | `None`  | 侧边栏菜单配置       |

### PluginPage 工厂方法

`PluginPage` 提供三种创建方式：

#### `from_folder` — 推荐

serve 一个目录下的静态文件，适合预构建的 SPA 或纯 HTML 页面。**路径穿越保护**：只能访问插件目录内的文件夹。

```python
@register.page("/dashboard", menu=PageMenu(label="仪表盘", icon="DataAnalysis"))
def dashboard(self):
    return PluginPage.from_folder("./web")
```

#### `from_url` — 重定向

将 iframe 重定向到外部 URL。

```python
@register.page("/external", menu=PageMenu(label="外部页面", icon="Link"))
def external(self):
    return PluginPage.from_url("https://example.com")
```

#### `from_html` — 内联 HTML

serve 一段 HTML 字符串，适合简单页面。

```python
@register.page("/info", menu=PageMenu(label="信息", icon="Document"))
def info_page(self):
    return PluginPage.from_html("""
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><title>Info</title></head>
    <body><h1>插件信息</h1></body>
    </html>
    """)
```

### PageMenu

`PageMenu` 控制页面在 WebUI 侧边栏的显示。省略 `menu` 参数时页面不出现在侧边栏，但仍可通过 URL 访问。

| 参数    | 类型                          | 默认值 | 说明                                     |
| ------- | ----------------------------- | ------ | ---------------------------------------- |
| `label` | `str` 或 `dict[str, str]`    | 必填   | 显示文本，支持多语言 dict                |
| `icon`  | `str`                         | `None` | Element Plus 图标组件名                  |
| `order` | `int`                         | `100`  | 排序值（越小越靠前）                     |

#### 多语言 label

`label` 支持传入 locale dict，WebUI 根据当前语言自动选取，fallback 链：当前语言 → `en` → 第一个可用值。

```python
@register.page("/dashboard", menu=PageMenu(
    label={"zh": "仪表盘", "en": "Dashboard"},
    icon="DataAnalysis",
    order=10
))
def dashboard(self):
    return PluginPage.from_folder("./web")
```

#### dict 兼容

`menu` 也接受普通 dict（自动转换为 `PageMenu`）：

```python
@register.page("/info", menu={"label": "信息", "icon": "Document"})
def info_page(self):
    return PluginPage.from_html("<h1>Hello</h1>")
```

### 使用 PageMenu 对象直接注册

`PluginPage` 对象本身不携带 `auth` 和 `menu`，这些由 decorator 统一控制：

```python
@register.page("/dashboard", auth=False, menu=PageMenu(
    label={"zh": "仪表盘", "en": "Dashboard"},
    icon="DataAnalysis"
))
def dashboard(self):
    return PluginPage.from_folder("./web")
```

### 推荐目录结构

使用 `from_folder` 时，推荐的插件目录结构：

```
my_plugin/
├── manifest.json
├── main.py
└── web/
    ├── index.html
    ├── style.css
    └── app.js
```

```python
@register.page("/", menu=PageMenu(label="我的页面", icon="Box"))
def main_page(self):
    return PluginPage.from_folder("./web")
```

`web/index.html` 会被自动 serve 为页面入口。WebUI 会自动注入 `PluginPageContext` bridge SDK（见下文）。

## PluginPageContext Bridge SDK

通过 `from_folder` 或 `from_html` 提供的页面运行在 WebUI 的 iframe 中。WebUI 会自动注入 `PluginPageContext` bridge SDK，让页面可以获取上下文信息和调用插件 API。

### 使用方式

Bridge SDK 由 WebUI 自动注入，无需手动引入。在页面 JS 中直接使用：

```html
<script>
// 等待 bridge 就绪，获取上下文
window.PluginPageContext.ready().then(function (ctx) {
    console.log(ctx.pluginId)   // 插件 ID
    console.log(ctx.isDark)     // 是否深色模式
    console.log(ctx.locale)     // 当前语言（如 "zh"）
    console.log(ctx.pageRoute)  // 页面路由
})
</script>
```

### API

| 方法                                    | 返回值            | 说明                                     |
| --------------------------------------- | ----------------- | ---------------------------------------- |
| `ready()`                               | `Promise<ctx>`    | 返回 Promise，bridge 就绪后 resolve      |
| `getContext()`                          | `object \| null`  | 同步获取当前 context（未就绪时为 null）  |
| `onContext(fn)`                         | `() => void`      | 监听 context 变化，返回取消监听函数      |
| `onThemeChange(fn)`                     | `() => void`      | 监听主题切换，回调参数 `(isDark: bool)`  |
| `api.get(endpoint, params?)`            | `Promise<any>`    | GET 请求 `/api/plugin/{id}/{endpoint}`   |
| `api.post(endpoint, body?)`             | `Promise<any>`    | POST 请求                                |
| `api.upload(endpoint, file, fieldName?)`| `Promise<any>`    | 上传文件（FormData）                     |
| `api.delete(endpoint)`                  | `Promise<any>`    | DELETE 请求                              |

### 主题适配

Bridge 会自动在 `<html>` 上设置 `data-theme="dark"` 或 `data-theme="light"`。插件页面通过 CSS 适配深色模式：

```css
body { background: #fff; color: #333; }

[data-theme="dark"] body {
    background: #1a1a2e;
    color: #eee;
}
```

也可以在 JS 中监听主题变化：

```javascript
window.PluginPageContext.onThemeChange(function (isDark) {
    document.body.classList.toggle('dark', isDark)
})
```

### 调用插件 API

Bridge 的 `api` 方法直接调用插件注册的 REST API 端点（同源 cookie 认证，无需额外处理）：

```javascript
// 调用 @register.api(method="GET", path="/hello") 注册的端点
window.PluginPageContext.api.get('/hello').then(function (data) {
    console.log(data)
})
```

### 完整示例

```html
<!DOCTYPE html>
<html lang="zh">
<head>
    <meta charset="utf-8">
    <title>My Plugin Page</title>
    <style>
        body { font-family: system-ui; padding: 2rem; background: #f5f5f5; }
        [data-theme="dark"] body { background: #1a1a2e; color: #eee; }
    </style>
</head>
<body>
    <h1 id="title">Loading...</h1>
    <button id="btn">调用 API</button>
    <pre id="result"></pre>

    <script>
        var PPC = window.PluginPageContext

        PPC.ready().then(function (ctx) {
            document.getElementById('title').textContent =
                'Plugin: ' + ctx.pluginId + ' | Locale: ' + ctx.locale
        })

        PPC.onThemeChange(function (isDark) {
            console.log('Theme changed:', isDark ? 'dark' : 'light')
        })

        document.getElementById('btn').addEventListener('click', function () {
            PPC.api.get('/hello').then(function (data) {
                document.getElementById('result').textContent = JSON.stringify(data, null, 2)
            })
        })
    </script>
</body>
</html>
```

## 静态资源注册

`@register.static` 装饰器注册目录以提供静态文件（CSS、JavaScript、图片等）。静态文件无需认证即可公开访问。

### 参数说明

| 参数        | 类型   | 必填 | 默认值 | 说明                                             |
| ----------- | ------ | ---- | ------ | ------------------------------------------------ |
| `path`      | `str`  | 是   | —      | URL 路径前缀（如 `"/static"`）                   |
| `directory` | `str`  | 是   | —      | 本地目录路径（相对于插件根目录）                 |
| `html`      | `bool` | 否   | `False`| 若为 `True`，目录请求时 serve `index.html`      |

### 基础用法

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

### 多个静态目录

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

### SPA 的 HTML 模式

设置 `html=True` 时，访问 `/page/plugin/my_plugin/` 会 serve `dist/index.html`：

```python
@register.static(path="/", directory="dist", html=True)
async def _init_static(self):
    pass
```