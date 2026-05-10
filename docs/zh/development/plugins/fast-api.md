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

插件可以使用 `@register.page` 和 `@register.static` 装饰器来注册自定义 WebUI 页面和提供静态资源。这允许插件提供丰富的交互式用户界面。

## 页面注册

`@register.page` 装饰器注册动态页面端点，serve HTML 内容。所有插件页面都以 `/page/plugin/{plugin_id}/` 为前缀。

### 参数说明

| 参数       | 类型   | 必填 | 默认值 | 说明                                                       |
| --------- | ------ | ---- | ------ | ---------------------------------------------------------- |
| `route`   | `str`  | 是   | —      | URL 路径（如 `"/dashboard"`, `"/{path:path}"`）           |
| `auth`    | `bool` | 否   | `True` | 是否需要用户认证                                           |
| `menu`    | `dict` | 否   | `None` | 侧边栏菜单配置。可选键：`title`, `icon`, `category`, `priority` |

### 处理函数需求

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

### 菜单集成

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

### 单页面应用（SPA）的 catch-all 路由

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

## 带有页面的插件目录结构

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