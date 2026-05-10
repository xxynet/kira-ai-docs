# API Registration

The `@register.api` decorator allows plugins to expose HTTP REST API endpoints that are automatically integrated into the WebUI's FastAPI application. All plugin API endpoints are prefixed with `/api/plugin/{plugin_id}/`.

## Import

```python
from core.plugin import register
```

## Decorator Parameters

| Parameter | Type      | Required | Default | Description                                                        |
| --------- | --------- | -------- | ------- | ------------------------------------------------------------------ |
| `method`  | `str`     | Yes      | —       | HTTP method: `"GET"`, `"POST"`, `"PUT"`, `"DELETE"`, `"PATCH"`    |
| `path`    | `str`     | Yes      | —       | Endpoint path (e.g., `"/items"`, `"/users/{user_id}"`)             |
| `auth`    | `bool`    | No       | `True`  | Require JWT authentication                                         |
| `**kwargs`| dict      | No       | —       | Additional arguments passed to FastAPI's `add_api_route` method    |

## Basic Usage

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

**Final Routes:**
- `GET /api/plugin/my_plugin/status`
- `GET /api/plugin/my_plugin/users/{user_id}`
- `POST /api/plugin/my_plugin/items`

## Path Parameters and Query Parameters

FastAPI-style path parameters (with type annotations) become path parameters; other function parameters become query parameters:

```python
@register.api(method="GET", path="/search", auth=True)
async def search(self, q: str, limit: int = 10, offset: int = 0):
    # q -> query parameter (required)
    # limit, offset -> query parameters (optional with defaults)
    return {"query": q, "results": []}
```

## Request Body with Pydantic Models

For POST/PUT requests, use Pydantic models for request validation:

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

## Error Handling

Raise HTTP exceptions using FastAPI's `HTTPException`:

```python
from fastapi import HTTPException

@register.api(method="GET", path="/users/{user_id}", auth=True)
async def get_user(self, user_id: int):
    user = await self._fetch_user(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
```

## Response Models and Documentation

Specify response models for automatic OpenAPI documentation:

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
    summary="Get all users",
    description="Returns a list of all users"
)
async def list_users(self):
    return [{"id": 1, "username": "kira", "email": "kira@example.com"}]
```

## Public Endpoints (No Authentication)

```python
@register.api(method="GET", path="/public/info", auth=False)
async def public_info(self):
    return {"version": "1.0.0"}
```

# Page and Static Registration

Plugins can register custom WebUI pages and serve static resources using `@register.page` and `@register.static` decorators. This allows plugins to provide rich, interactive user interfaces.

## Page Registration

The `@register.page` decorator registers dynamic page endpoints that serve HTML content. All plugin pages are prefixed with `/page/plugin/{plugin_id}/`.

### Parameters

| Parameter | Type         | Required | Default | Description                                                |
| --------- | ------------ | -------- | ------- | ---------------------------------------------------------- |
| `route`   | `str`        | Yes      | —       | URL path (e.g., `"/dashboard"`, `"/{path:path}"`)          |
| `auth`    | `bool`       | No       | `True`  | Require user authentication                                |
| `menu`    | `dict`       | No       | `None`  | Add to sidebar navigation. Keys: `title`, `icon`, `category`, `priority` |

### Handler Requirements

The handler function must return an `HTMLResponse` (or other FastAPI Response types):

```python
from fastapi.responses import HTMLResponse

@register.page(route="/dashboard", auth=True)
async def dashboard(self):
    return HTMLResponse("""
    <!DOCTYPE html>
    <html>
    <head><title>Dashboard</title></head>
    <body><h1>Dashboard</h1></body>
    </html>
    """)
```

**Final Route:** `/page/plugin/my_plugin/dashboard`

### Menu Integration

The `menu` parameter adds a navigation entry to the WebUI sidebar:

```python
@register.page(
    route="/settings",
    menu={
        "title": "Plugin Settings",
        "icon": "settings",
        "category": "plugin-pages",
        "priority": 0
    }
)
async def settings_page(self):
    return HTMLResponse("<h1>Settings</h1>")
```

If `menu` is omitted, the page will not appear in the sidebar but remains accessible via direct URL.

### Single Page App (SPA) with Catch-All Route

For Single Page Applications, use FastAPI's path parameter to catch all sub-routes:

```python
@register.page(route="/{plugin_route:path}")
async def spa_entry(self, plugin_route: str = ""):
    # plugin_route contains the sub-path (e.g., "users/profile")
    # All routes return the same HTML with client-side routing
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

## Static Resource Registration

The `@register.static` decorator registers a directory for serving static files (CSS, JavaScript, images, etc.). Static files are publicly accessible without authentication.

### Parameters

| Parameter   | Type    | Required | Default | Description                                              |
| ----------- | ------- | -------- | ------- | -------------------------------------------------------- |
| `path`      | `str`   | Yes      | —       | URL path prefix (e.g., `"/static"`)                      |
| `directory` | `str`   | Yes      | —       | Local directory path relative to plugin root             |
| `html`      | `bool`  | No       | `False` | If `True`, serve `index.html` for directory requests     |

### Basic Usage

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
            <h1>My Plugin</h1>
            <script src="/page/plugin/my_plugin/static/js/app.js"></script>
        </body>
        </html>
        """)
```

**Final URLs:**
- Page: `/page/plugin/my_plugin/`
- Static CSS: `/page/plugin/my_plugin/static/css/style.css`
- Static JS: `/page/plugin/my_plugin/static/js/app.js`

### Multiple Static Directories

```python
class MyPlugin(BasePlugin):
    @register.static(path="/css", directory="resources/css")
    @register.static(path="/js", directory="resources/js")
    @register.static(path="/images", directory="resources/images")
    async def _init_static(self):
        pass
```

**Final URLs:**
- `/page/plugin/my_plugin/css/*`
- `/page/plugin/my_plugin/js/*`
- `/page/plugin/my_plugin/images/*`

### HTML Mode for SPA

With `html=True`, accessing `/page/plugin/my_plugin/` will serve `dist/index.html`:

```python
@register.static(path="/", directory="dist", html=True)
async def _init_static(self):
    pass
```

## Plugin Page Directory Structure

A typical plugin with pages and static resources:

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
└── templates/      (optional, if using Jinja2)
    └── index.html
```