# Plugin Development Guide

KiraAI has powerful plugin extension capabilities, allowing developers to extend KiraAI's functionality and expand the capabilities of digital life by developing plugins.

## Overview

KiraAI's plugin system is based on an event-driven architecture, allowing plugins to extend the system through three mechanisms:

- **Hook**: Listen to system events such as message arrival and LLM request/response to insert custom logic
- **Tool**: Register callable functions for the LLM
- **Tag**: Register custom XML tag handlers to control message output format

Plugins are placed in the `data/plugins/` directory and are automatically discovered and loaded at startup.

---

## Plugin Directory Structure

```
data/plugins/
└── my_plugin/              # Plugin folder (used as plugin_id unless overridden in manifest.json)
    ├── manifest.json       # Plugin metadata (required)
    ├── main.py             # Plugin entry point (required; plugin.py or __init__.py also accepted)
    ├── schema.json         # Configuration field definitions (optional)
    └── ...                 # Other auxiliary modules
```

> Entry file lookup order: `main.py` → `plugin.py` → `__init__.py`

---

## manifest.json

Describes the plugin's basic information. **Must be present**; otherwise the folder name is used as `plugin_id`.

```json
{
  "display_name": "My Plugin",
  "plugin_id": "my_plugin",
  "version": "1.0",
  "author": "Your Name",
  "description": "Plugin description",
  "repo": "https://github.com/..."
}
```

| Field          | Description                                                  | Required    |
| -------------- | ------------------------------------------------------------ | ----------- |
| `plugin_id`    | Unique plugin ID; determines config filename and data directory | Recommended |
| `display_name` | Plugin name displayed in WebUI                               | No          |
| `version`      | Version number                                               | No          |
| `author`       | Author                                                       | No          |
| `description`  | Plugin description                                           | No          |
| `repo`         | Repository URL                                               | No          |

---

## Plugin Main Class

All plugins must extend `BasePlugin` and implement the `initialize()` and `terminate()` lifecycle methods.

```python
from core.plugin import BasePlugin, PluginContext

class MyPlugin(BasePlugin):
    def __init__(self, ctx: PluginContext, cfg: dict):
        super().__init__(ctx, cfg)
        # self.ctx  -> PluginContext, access to system services
        # self.plugin_cfg  -> dict, plugin configuration (from schema.json or config file)

    async def initialize(self):
        """Called when the plugin is loaded. Initialize resources and register events here."""
        pass

    async def terminate(self):
        """Called when the plugin is unloaded. Release resources and cancel tasks here."""
        pass
```

> The system will only register a plugin's Hooks, Tools, and Tags after `initialize()` completes successfully.

---

## Hook System

Hooks allow plugins to listen to system events using the `@on.<event>()` decorator. Hook functions must be `async` methods.

### Import

```python
from core.plugin import on, Priority
```

### Event Types

:::warning
This project is in active development; the decorator system may change.
:::

| Decorator                | Triggered When                                       | Key Parameters                     |
| ------------------------ | ---------------------------------------------------- | ---------------------------------- |
| `@on.im_message()`       | IM message arrives (earliest)                        | `event: KiraMessageEvent`          |
| `@on.message_buffered()` | Message enters the buffer                            | `event: KiraMessageEvent`          |
| `@on.im_batch_message()` | Messages merged after debounce                       | `event: KiraMessageEvent`          |
| `@on.llm_request()`      | Before sending a request to the LLM (inject prompt) | `event`, `req: LLMRequest`         |
| `@on.llm_response()`     | After raw LLM response is received                   | `event`, `resp: LLMResponse`       |
| `@on.after_xml_parse()`  | After XML parsing (MessageChain available)           | `event`, `chain: MessageChain`     |
| `@on.tool_result()`      | After a tool call returns its result                 | `event`, `result: ToolResult`      |
| `@on.step_result()`      | After each agent step completes                      | `event`, `resp: LLMResponse`       |
| `@on.final_result()`     | After the final message result is generated          | `event`, `chain: MessageChain`     |

### Priority

```python
class Priority(IntEnum):
    SYS_HIGH = 100   # Reserved for system use
    HIGH     = 50    # High priority (e.g. message pre-processing)
    MEDIUM   = 0     # Default
    LOW      = -50   # Low priority (e.g. post-processing)
    SYS_LOW  = -100  # Reserved for system use
```

**Higher number = executed first.** Defaults to `MEDIUM` when not specified.

### Example: Listening to Messages

```python
from core.plugin import on, Priority
from core.chat import KiraMessageEvent
from core.chat.message_elements import Text

class MyPlugin(BasePlugin):
    @on.im_message(priority=Priority.HIGH)
    async def on_message(self, event: KiraMessageEvent, *args, **kwargs):
        # Option 1: message_repr — concatenated repr of all elements (immediately available)
        text = event.message_repr

        # Option 2: extract plain text from chain (Text elements only)
        text = "".join(ele.text for ele in event.message.chain if isinstance(ele, Text))

        if "keyword" in text:
            # Handle logic...
            pass
```

### Message Handling Strategies

Inside an `@on.im_message()` hook, call methods on `event` to control how the message is handled. The default strategy is `discard`. The built-in message plugin sets it to `buffer`, which triggers LLM processing after a configurable number of messages or time.

| Method              | Strategy  | Description                                                                       |
| ------------------- | --------- | --------------------------------------------------------------------------------- |
| `event.trigger()`   | `trigger` | Process immediately, skip debounce, go straight to LLM                            |
| `event.buffer()`    | `buffer`  | Enter the buffer and wait; triggers the `ON_MESSAGE_BUFFERED` hook                |
| `event.flush()`     | `flush`   | Add to buffer and immediately flush all buffered messages for processing           |
| `event.discard()`   | `discard` | Discard this message (remaining hooks in the current phase still run)             |
| `event.stop()`      | —         | Immediately stop all subsequent hooks; message is not propagated further          |

All strategy methods accept an optional `force=True` argument that prevents subsequent hooks from overriding the strategy.

### Example: Injecting a Prompt

```python
from core.plugin import on
from core.provider import LLMRequest
from core.prompt_manager import Prompt

class MyPlugin(BasePlugin):
    @on.llm_request()
    async def inject_prompt(self, event, req: LLMRequest, tag_set, *args, **kwargs):
        # Option 1: append to an existing section
        for p in req.system_prompt:
            if p.name == "tools":
                p.content += "\nYou can use my_tool to..."
                break

        # Option 2: append a new Prompt object
        # name identifies this prompt section; source should be your plugin ID
        req.system_prompt.append(Prompt(
            content="Additional context injected by the plugin: ...",
            name="my_plugin_context",
            source="my_plugin",
        ))
```

> The two options can be combined. Option 1 is suited for appending to well-known sections (e.g. `"tools"`, `"memory"`); Option 2 is suited for inserting a fully independent context block.

---

## Tool Registration

Tools expose callable functions to the LLM. There are two registration methods.

### Method 1: `@register.tool` Decorator

Best for simple tools defined directly as plugin class methods.

```python
from core.plugin import register

class MyPlugin(BasePlugin):
    @register.tool(
        name="my_tool",
        description="Tool description (the LLM uses this to decide when to call it)",
        params={
            "type": "object",
            "properties": {
                "query": {
                    "type": "string",
                    "description": "Query content"
                },
                "limit": {
                    "type": "integer",
                    "description": "Number of results to return, default 10"
                }
            },
            "required": ["query"]
        }
    )
    async def my_tool(self, event: KiraMessageBatchEvent, *_, query: str, limit: int = 10) -> str:
        # Tool logic; return a string result
        return f"Query result: {query}"
```

> `params` follows JSON Schema format (OpenAI tool-calling spec).
> The first parameter is `event: KiraMessageBatchEvent`; tool parameters are passed as keyword arguments. Use `*_` to stay compatible with any future positional parameters.

### Method 2: `BaseTool` Class (for Complex Tools)

Best when tool logic is complex, needs independent encapsulation, or must be reused. Subclass `BaseTool`, then inject it per-request via `req.tool_set.add()` inside an `@on.llm_request()` hook:

```python
from core.utils.tool_utils import BaseTool
from core.provider import LLMRequest
from core.plugin import on

class MySearchTool(BaseTool):
    name = "my_search"
    description = "Search for a keyword and return results"
    parameters = {
        "type": "object",
        "properties": {
            "query": {"type": "string", "description": "Search keyword"}
        },
        "required": ["query"]
    }

    async def execute(self, query: str) -> str:
        # Tool execution logic
        return f"Search result: {query}"


class MyPlugin(BasePlugin):
    @on.llm_request()
    async def add_tools(self, event, req: LLMRequest, tag_set, *args, **kwargs):
        req.tool_set.add(MySearchTool(ctx=self.ctx))
```

> Unlike `@register.tool` (globally registered), `tool_set.add()` applies only to the current request. Use this when you need to conditionally provide a tool based on session context or other runtime conditions.

### Returning Attachments: ToolResult

Tool functions return a string by default. To also return files (images, audio, etc.), return a `ToolResult` object. The LLM can then send the attachment to the user via a `<file>` tag.

```python
from core.provider import ToolResult
from core.chat.message_elements import Image, Record, File

class MyPlugin(BasePlugin):
    @register.tool(
        name="take_screenshot",
        description="Take a screenshot and return the image",
        params={"type": "object", "properties": {}, "required": []}
    )
    async def take_screenshot(self, event: KiraMessageBatchEvent, *_) -> ToolResult:
        path = await self._do_screenshot()  # Returns local file path
        return ToolResult(
            text="Screenshot taken",
            attachments=[Image(path=path)]
        )
```

`ToolResult` fields:

| Field         | Type                              | Description                                   |
| ------------- | --------------------------------- | --------------------------------------------- |
| `text`        | `str`                             | Text description returned to the LLM           |
| `attachments` | `list[Image \| Record \| File]`   | Attachments the LLM can send via `<file>` tag  |

---

## Tag Registration

Tags register custom XML tag handlers that are triggered when the LLM output contains a matching tag. Two methods are available.

### Method 1: `@register.tag` Decorator (Recommended)

```python
from core.plugin import register
from core.chat.message_elements import Text

class MyPlugin(BasePlugin):
    @register.tag(
        name="my_tag",
        description="Tag description, injected into the LLM's tool instructions"
    )
    async def handle_my_tag(self, value: str, **kwargs) -> list:
        # value is the tag content, e.g. <my_tag>value</my_tag>
        # Returns list[BaseMessageElement]
        return [Text(value)]
```

### Method 2: `BaseTag` Class (for Complex or Conditionally Injected Tags)

Best when tag handling logic is heavy or needs independent encapsulation. Subclass `BaseTag`, then inject it per-request via `tag_set.register()` inside an `@on.llm_request()` hook:

```python
from core.tag import BaseTag
from core.provider import LLMRequest
from core.chat.message_elements import Image
from core.plugin import on

class MyTag(BaseTag):
    name = "my_tag"
    description = "Process a custom tag and render it as an image"

    async def handle(self, value: str, **kwargs) -> list:
        # self.ctx is available (passed in at registration time)
        image_path = await self._render(value)
        return [Image(path=image_path)]

    async def _render(self, content: str) -> str:
        # Complex rendering logic...
        return "/tmp/output.png"


class MyPlugin(BasePlugin):
    @on.llm_request()
    async def add_tags(self, event, req: LLMRequest, tag_set, *args, **kwargs):
        tag_set.register(MyTag(ctx=self.ctx))
```

> `tag_set` is the third positional parameter of the `@on.llm_request()` hook, of type `TagSet`. Unlike `@register.tag` (globally registered), this method applies only to the current request — useful for enabling tags conditionally per session or context.

---

## PluginContext API

`self.ctx` provides access to all core system services:

```python
self.ctx.config           # KiraConfig: global configuration
self.ctx.event_bus        # EventBus: event bus
self.ctx.session_mgr      # SessionManager: session management
self.ctx.adapter_mgr      # AdapterManager: adapter management
self.ctx.persona_mgr      # PersonaManager: persona management
self.ctx.provider_mgr     # ProviderManager: model provider management
self.ctx.llm_api          # LLMClient: LLM client
self.ctx.sticker_manager  # StickerManager: sticker management
```

### Get Plugin Data Directory

```python
async def initialize(self):
    data_dir = self.ctx.get_plugin_data_dir()
    # Returns a Path object pointing to data/plugin_data/{plugin_id}/, created automatically
```

### Get LLM Client

```python
# Use the default LLM
llm = self.ctx.get_default_llm_client()

# Use the fast LLM
fast_llm = self.ctx.get_default_fast_llm_client()

# Use a specific model (provider_id:model_id format)
llm = self.ctx.get_llm_client(model_uuid="openai:gpt-4o")
```

### Get Embedding Client

```python
emb = self.ctx.get_default_embedding_client()
```

### Get Another Plugin Instance

```python
other_plugin = self.ctx.get_plugin_inst("other_plugin_id")
```

### Access the Message Buffer

```python
buffer = self.ctx.get_buffer(session_id)
await self.ctx.flush_session_messages(session_id)
```

---

## Configuration System (schema.json)

Define plugin configuration fields via `schema.json`. The system automatically generates a WebUI configuration panel and persists the settings.

### Location

`data/plugins/my_plugin/schema.json`

### Reading Config in Plugin Code

```python
class MyPlugin(BasePlugin):
    async def initialize(self):
        api_key = self.plugin_cfg.get("api_key", "")
        enabled = self.plugin_cfg.get("enabled", True)
        max_count = self.plugin_cfg.get("max_count", 10)
```

### Supported Field Types

| type           | Description                          | Extra Parameters          |
| -------------- | ------------------------------------ | ------------------------- |
| `string`       | Single-line text input               | —                         |
| `integer`      | Integer input                        | —                         |
| `float`        | Float input                          | —                         |
| `sensitive`    | Password-style hidden input (API keys) | —                       |
| `switch`       | Boolean toggle                       | —                         |
| `list`         | Multi-line list (one item per line)  | —                         |
| `enum`         | Dropdown selector                    | `options: [...]`          |
| `json`         | JSON editor                          | —                         |
| `yaml`         | YAML editor                          | —                         |
| `editor`       | Code/text editor                     | `language: "python"`      |
| `textarea`     | Multi-line plain text input          | —                         |
| `markdown`     | Markdown editor                      | —                         |
| `model_select` | Model selector                       | `model_type: "llm"/"tts"` |

### Example schema.json

```json
{
  "api_key": {
    "type": "sensitive",
    "name": "API Key",
    "default": "",
    "hint": "API key for the service"
  },
  "filed_enabled": {
    "type": "switch",
    "name": "Enabled",
    "default": true,
    "hint": "Whether to enable this feature"
  },
  "max_results": {
    "type": "integer",
    "name": "Max Results",
    "default": 10,
    "hint": "Maximum number of results returned per query"
  },
  "mode": {
    "type": "enum",
    "name": "Mode",
    "default": "auto",
    "options": ["auto", "manual", "disabled"],
    "hint": "Operating mode"
  },
  "allowed_sessions": {
    "type": "list",
    "name": "Allowed Sessions",
    "default": [],
    "hint": "Leave empty to allow all sessions; one session ID per line"
  },
  "llm_model": {
    "type": "model_select",
    "name": "Language Model",
    "model_type": "llm",
    "default": "",
    "hint": "Leave empty to use the system default model"
  }
}
```

> Config is saved to `data/config/plugins/{plugin_id}.json` and default values are generated automatically on first initialization.

---

## Data Storage

Store persistent data in the plugin's dedicated data directory to avoid conflicts with other plugins:

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
        # Path: data/plugin_data/my_plugin/

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

---

## Background Tasks

For polling or long-running tasks, use `asyncio.create_task()` and cancel in `terminate()`:

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
                logger.error(f"Background task error: {e}")
            await asyncio.sleep(60)  # Run every 60 seconds
```

---

## Proactive Message Push

Plugins can proactively send messages to a session without waiting for a user trigger, via `ctx.publish_notice()`:

```python
from core.chat import MessageChain
from core.chat.message_elements import Text

class MyPlugin(BasePlugin):
    async def send_notice(self, session_id: str, content: str):
        """
        session_id format: {adapter_name}:{type}:{id}
          - Direct message: "napcat:dm:123456"
          - Group message:  "napcat:gm:654321"
        """
        chain = MessageChain([Text(content)])
        await self.ctx.publish_notice(
            session=session_id,
            chain=chain,
            is_mentioned=True
        )
```

---

## Development Notes

1. **Hook function signature**: Must accept `(self, event, *args, **kwargs)`. Extra parameters (e.g. `req`, `resp`) are passed as positional arguments — use named parameters to receive them.
2. **Tool function signature**: `(self, event: KiraMessageBatchEvent, param1: type, param2: type)` — the first parameter is always the event object that triggered the tool call.
3. **Priority**: `SYS_HIGH` and `SYS_LOW` are reserved for the system. Plugin developers should use `HIGH / MEDIUM / LOW` or custom integers.
4. **Do not block the event loop**: Use `await` for all I/O operations; use `asyncio.to_thread()` for CPU-intensive work.
5. **Clean up in terminate**: Cancel background tasks, close connections — avoid resource leaks.
6. **Config hot-reload**: The system calls `initialize()` again after a config change. Plugins must support re-entrant initialization.
