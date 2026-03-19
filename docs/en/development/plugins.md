# Plugin Development Guide

KiraAI has powerful plugin extension capabilities, allowing developers to extend KiraAI's functionality and expand the capabilities of digital life by developing plugins.

## Plugin Basics

### What is a Plugin?

A plugin is an independent functional module that can extend the system's functionality without modifying KiraAI's core code. Plugins can:

- Add new commands and features
- Extend AI capabilities
- Integrate third-party services
- Process specific types of messages
- Implement custom logic

### Plugin Types

KiraAI supports backend plugins developed in Python, which run on the server and can:

1. **Function Expansion**: Add new features and commands
2. **Service Integration**: Connect to external APIs and services
3. **Message Processing**: Customize message processing logic
4. **Memory Enhancement**: Extend AI's memory capabilities

## Development Environment Preparation

### Prerequisites

- Python 3.10+
- Understanding of KiraAI's basic architecture
- Familiarity with Python development
- Understanding of the project's core module structure

### Environment Setup

1. **Clone Project Code**

```bash
git clone https://github.com/xxynet/KiraAI.git
cd KiraAI
```

2. **Create Development Virtual Environment**

```bash
# Create virtual environment
python3 -m venv .venv

# Activate virtual environment
# Ubuntu/Debian/CentOS
source .venv/bin/activate

# Windows
.venv\Scripts\activate
```

3. **Install Development Dependencies**

```bash
pip install -r requirements.txt
```

## Plugin Development Specifications

### Plugin Structure

Each plugin should have its own directory and module structure. The recommended plugin structure is as follows:

```
my_plugin/
├── __init__.py          # Plugin entry file
├── main.py              # Plugin main logic
├── manifest.json        # Plugin manifest file
├── schema.json          # Plugin configuration parameters Schema file
├── requirements.txt     # Plugin dependencies
└── README.md            # Plugin documentation
```

## Decorator System

The decorator system in KiraAI project is mainly used for plugin development, including two types of decorators: event hooks and tool registration.

### Hooks Decorators

:::warning
Note: This project is in active development, and the decorator system may change.
:::

Hooks decorators are provided through the `@on` object and are used to listen to system events:

| Decorator | Event Type | Purpose | Priority Support | Parameters |
|-----------|------------|---------|------------------|------------|
| @on.im_message() | ON_IM_MESSAGE | Handle single message arrival events | Supported | Event object |
| @on.im_batch_message() | ON_IM_BATCH_MESSAGE | Handle batch message events | Supported | Event object |
| @on.llm_request() | ON_LLM_REQUEST | Handle pre-LLM request events | Supported | Event object, Request object |
| @on.llm_response() | ON_LLM_RESPONSE | Handle post-LLM response events | Supported | Event object, Response object |

### Register Decorators

Register decorators are used to register tools, tags, etc. into the system:

```python
@register.tool(name="tool_name", description="description", params={parameter_definition})
async def my_tool(self, event: KiraMessageBatchEvent, **kwargs) -> ToolResult | str:
    """Custom tool implementation"""
    ...
```

### Priority System

All hooks decorators support priority parameters (plugin_handlers.py:10-16):

- Priority.SYS_HIGH (100): System highest priority, executed first. In principle, plugin developers should not use this priority.
- Priority.HIGH (50): Highest priority, executed first.
- Priority.MEDIUM (0): Default priority.
- Priority.LOW (-50): Lowest priority, executed last.
- Priority.SYS_LOW (-100): System lowest priority, executed last. In principle, plugin developers should not use this priority.

### Core Function Implementation

Implement the plugin's core functionality in `main.py` using decorators to listen to events and register tools:

```python
# main.py
from core.plugin import on, register, Priority
from core.plugin import BasePlugin

class MyPlugin(BasePlugin):
    def __init__(self, ctx, cfg):
        super().__init__(ctx, cfg)

    @on.im_message(priority=Priority.MEDIUM)
    async def on_im_message(self, event: KiraMessageEvent):
        """Handle single message arrival event"""
        # Determine message processing strategy, intercept messages, etc.
        ...

    @on.llm_request(priority=Priority.HIGH)
    async def on_llm_req(self, event: KiraMessageBatchEvent, req: LLMRequest):
        """Handle pre-LLM request event"""
        # Format user messages, add timestamps and metadata
        ...

    @register.tool(
        name="my_tool",
        description="My custom tool",
        params={
            "type": "object",
            "properties": {
                "query": {"type": "string", "description": "Query content"}
            },
            "required": ["query"]
        }
    )
    async def my_tool(self, event, query: str) -> str:
        """Custom tool implementation"""
        # Tool logic
        return f"Processing query: {query}"
```

## Notes on Decorator System

- Tools are automatically bound to plugin instances when registered
- Event handlers are executed in order of priority
- All decorators should use asynchronous functions
- Multiple decorators can be used in the same plugin class

## Plugin Registration and Loading

### Registering Plugins

Plugins need to be registered in KiraAI to be loaded and used:

**Automatic Registration**: Place the plugin directory in the `data/plugins/` directory, and the system will automatically load it.

### Plugin Lifecycle

The plugin lifecycle includes:

1. **Initialization**: The `init()` function is called when the plugin is loaded
2. **Running**: The plugin processes messages and commands
3. **Unloading**: The `terminate()` function is called for cleanup when the plugin is unloaded

## Publishing Plugins

## Best Practices

1. **Maintain Plugin Independence**: Plugins should minimize dependencies on core code
2. **Comprehensive Documentation**: Provide detailed README and usage instructions for plugins
3. **Error Handling**: Implement comprehensive error handling and logging
4. **Performance Optimization**: Ensure plugins do not affect the overall system performance
5. **Security Considerations**: Pay attention to the security of handling user input and external data
6. **Version Compatibility**: Consider compatibility with different KiraAI versions

## Conclusion

KiraAI's plugin system provides developers with flexible extension capabilities. By developing plugins, you can add various functions to digital life and create richer interactive experiences.

Happy developing!