# Configuration System (schema.json)

Define plugin configuration fields via `schema.json`. The system automatically generates a WebUI configuration panel and persists the settings.

## Location

`data/plugins/my_plugin/schema.json`

## Reading Config in Plugin Code

```python
class MyPlugin(BasePlugin):
    async def initialize(self):
        api_key = self.plugin_cfg.get("api_key", "")
        enabled = self.plugin_cfg.get("enabled", True)
        max_count = self.plugin_cfg.get("max_count", 10)
```

## Supported Field Types

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

## Example schema.json

```json
{
  "api_key": {
    "type": "sensitive",
    "name": "API Key",
    "default": "",
    "hint": "API key for the service",
    "locales": {
      "zh": { "name": "API 密钥", "hint": "服务的 API 密钥" }
    }
  },
  "filed_enabled": {
    "type": "switch",
    "name": "Enabled",
    "default": true,
    "hint": "Whether to enable this feature",
    "locales": {
      "zh": { "name": "启用", "hint": "是否启用该功能" }
    }
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

## Locales

Each field in `schema.json` supports a `locales` object for providing localized `name` and `hint` values. The key is the locale code (e.g. `zh`), and the value contains `name` and/or `hint` overrides.

```json
{
  "waking_words": {
    "name": "Waking words",
    "type": "list",
    "default": [],
    "hint": "Treat message as mentioned if any wake word appears",
    "locales": {
      "zh": { "name": "唤醒词", "hint": "如果消息中包含任一唤醒词，则视为被提及" }
    }
  }
}
```

| Locale Key | Description                  | Supported Fields       |
| ---------- | ---------------------------- | ---------------------- |
| `zh`       | Chinese (Simplified)         | `name`, `hint`         |
| (any)      | Any ISO 639-1 locale code    | `name`, `hint`         |

> The WebUI will use the localized `name` and `hint` based on the user's language preference, falling back to the top-level `name`/`hint` if no locale match is found.

---

> Config is saved to `data/config/plugins/{plugin_id}.json` and default values are generated automatically on first initialization.