# 插件开发指南

KiraAI拥有强大的插件扩展能力，开发者可以通过开发插件来扩展KiraAI的功能，扩展数字生命的能力边界。

## 插件基础

### 什么是插件？

插件是独立的功能模块，可以在不修改KiraAI核心代码的情况下，扩展系统的功能。插件可以：

- 添加新的命令和功能
- 扩展AI的能力
- 集成第三方服务
- 处理特定类型的消息
- 实现自定义逻辑

### 插件类型

KiraAI支持Python开发的后端插件，这些插件运行在服务端，可以：

1. **功能扩展**：添加新的功能和命令
2. **服务集成**：连接外部API和服务
3. **消息处理**：自定义消息的处理逻辑
4. **记忆增强**：扩展AI的记忆能力

## 开发环境准备

### 前置要求

- Python 3.10+
- 了解KiraAI的基本架构
- 熟悉Python开发
- 了解项目的核心模块结构

### 环境设置

1. **克隆项目代码**

```bash
git clone https://github.com/xxynet/KiraAI.git
cd KiraAI
```

2. **创建开发虚拟环境**

```bash
# 创建虚拟环境
python3 -m venv .venv

# 激活虚拟环境
# Ubuntu/Debian/CentOS
source .venv/bin/activate

# Windows
.venv\Scripts\activate
```

3. **安装开发依赖**

```bash
pip install -r requirements.txt
```

## 插件开发规范

### 插件结构

每个插件应该有自己的目录和模块结构。推荐的插件结构如下：

```
my_plugin/
├── __init__.py          # 插件入口文件
├── main.py              # 插件主逻辑
├── manifest.json        # 插件清单文件
├── schema.json          # 插件配置参数Schema文件
├── requirements.txt     # 插件依赖
└── README.md            # 插件说明
```

## 装饰器系统

KiraAI项目中的装饰器系统主要用于插件开发，包含事件钩子（hooks）和工具注册（register）两类装饰器。

### Hooks装饰器

:::warning
注意：本项目处于活跃开发期，装饰器系统可能会有变化。
:::

Hooks装饰器通过 `@on` 对象提供，用于监听系统事件：

| 装饰器 | 事件类型 | 用途 | 优先级 | 参数 |
|--------|----------|------|--------|------|
| @on.im_message() | ON_IM_MESSAGE | 处理单条消息到达事件 | 支持 | 事件对象 |
| @on.im_batch_message() | ON_IM_BATCH_MESSAGE | 处理批量消息事件 | 支持 | 事件对象 |
| @on.llm_request() | ON_LLM_REQUEST | 处理LLM请求前事件 | 支持 | 事件对象, 请求对象 |
| @on.llm_response() | ON_LLM_RESPONSE | 处理LLM响应后事件 | 支持 | 事件对象, 响应对象 |

### Register装饰器

Register装饰器用于注册工具、标签等到系统中：

```python
@register.tool(name="工具名", description="描述", params={参数定义})
async def my_tool(self, event: KiraMessageBatchEvent, **kwargs) -> ToolResult | str:
    """自定义工具实现"""
    ...
```

### 优先级系统

所有hooks装饰器都支持优先级参数（plugin_handlers.py:10-16）：

- Priority.SYS_HIGH (100): 系统最高优先级，最先执行，原则上插件开发者不应该使用此优先级
- Priority.HIGH (50): 最高优先级，最先执行
- Priority.MEDIUM (0): 默认优先级
- Priority.LOW (-50): 最低优先级，最后执行
- Priority.SYS_LOW (-100): 系统最低优先级，最后执行，原则上插件开发者不应该使用此优先级

### 核心功能实现

在`main.py`中实现插件的核心功能，使用装饰器来监听事件和注册工具：

```python
# main.py
from core.plugin import on, register, Priority
from core.plugin import BasePlugin

class MyPlugin(BasePlugin):
    def __init__(self, ctx, cfg):
        super().__init__(ctx, cfg)

    @on.im_message(priority=Priority.MEDIUM)
    async def on_im_message(self, event: KiraMessageEvent):
        """处理单条消息到达事件"""
        # 决定消息处理策略，拦截消息等
        ...

    @on.llm_request(priority=Priority.HIGH)
    async def on_llm_req(self, event: KiraMessageBatchEvent, req: LLMRequest):
        """处理LLM请求前事件"""
        # 格式化用户消息，添加时间戳和元数据
        ...

    @register.tool(
        name="my_tool",
        description="我的自定义工具",
        params={
            "type": "object",
            "properties": {
                "query": {"type": "string", "description": "查询内容"}
            },
            "required": ["query"]
        }
    )
    async def my_tool(self, event, query: str) -> str:
        """自定义工具实现"""
        # 工具逻辑
        return f"处理查询: {query}"
```

## 装饰器系统注意事项

- 工具注册时会自动绑定到插件实例
- 事件处理器按优先级排序执行
- 所有装饰器都应该使用异步函数
- 可以在同一个插件类中使用多个装饰器

## 插件注册与加载

### 注册插件

插件需要在KiraAI中注册才能被加载和使用:

**自动注册**：将插件目录放在`data/plugins/`目录下，系统会自动加载

### 插件生命周期

插件的生命周期包括：

1. **初始化**：插件被加载时调用`init()`函数
2. **运行**：插件处理消息和命令
3. **卸载**：插件被卸载时调用`terminate()`进行清理

## 发布插件

## 最佳实践

1. **保持插件独立性**：插件应该尽量减少对核心代码的依赖
2. **文档完善**：为插件提供详细的README和使用说明
3. **错误处理**：实现完善的错误处理和日志记录
4. **性能优化**：确保插件不会影响系统的整体性能
5. **安全考虑**：注意处理用户输入和外部数据的安全
6. **版本兼容**：考虑插件与不同KiraAI版本的兼容性

## 结语

KiraAI的插件系统为开发者提供了灵活的扩展能力。通过开发插件，您可以为数字生命添加各种功能，创造更加丰富的交互体验。

祝您开发愉快！