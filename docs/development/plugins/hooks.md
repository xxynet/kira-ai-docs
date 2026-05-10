# Hook System

Hooks allow plugins to listen to system events using the `@on.<event>()` decorator. Hook functions must be `async` methods.

## Import

```python
from core.plugin import on, Priority
```

## Event Types

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

## Priority

```python
class Priority(IntEnum):
    SYS_HIGH = 100   # Reserved for system use
    HIGH     = 50    # High priority (e.g. message pre-processing)
    MEDIUM   = 0     # Default
    LOW      = -50   # Low priority (e.g. post-processing)
    SYS_LOW  = -100  # Reserved for system use
```

**Higher number = executed first.** Defaults to `MEDIUM` when not specified.

## Example: Listening to Messages

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

## Message Handling Strategies

Inside an `@on.im_message()` hook, call methods on `event` to control how the message is handled. The default strategy is `discard`. The built-in message plugin sets it to `buffer`, which triggers LLM processing after a configurable number of messages or time.

| Method              | Strategy  | Description                                                                       |
| ------------------- | --------- | --------------------------------------------------------------------------------- |
| `event.trigger()`   | `trigger` | Process immediately, skip debounce, go straight to LLM                            |
| `event.buffer()`    | `buffer`  | Enter the buffer and wait; triggers the `ON_MESSAGE_BUFFERED` hook                |
| `event.flush()`     | `flush`   | Add to buffer and immediately flush all buffered messages for processing           |
| `event.discard()`   | `discard` | Discard this message (remaining hooks in the current phase still run)             |
| `event.stop()`      | —         | Immediately stop all subsequent hooks; message is not propagated further          |

All strategy methods accept an optional `force=True` argument that prevents subsequent hooks from overriding the strategy.

## Example: Injecting a Prompt

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

# Tool Registration

Tools expose callable functions to the LLM. There are two registration methods.

## Method 1: `@register.tool` Decorator

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

## Method 2: `BaseTool` Class (for Complex Tools)

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

## Returning Attachments: ToolResult

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

# Tag Registration

Tags register custom XML tag handlers that are triggered when the LLM output contains a matching tag. Two methods are available.

## Method 1: `@register.tag` Decorator (Recommended)

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

## Method 2: `BaseTag` Class (for Complex or Conditionally Injected Tags)

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