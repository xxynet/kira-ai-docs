# manifest.json

Describes the plugin's basic information. **Must be present**; otherwise the folder name is used as `plugin_id`.

```json
{
  "display_name": "My Plugin",
  "plugin_id": "my_plugin",
  "version": "1.0",
  "author": "Your Name",
  "description": "Plugin description",
  "repo": "https://github.com/...",
  "locales": {
    "en/zh": {
      "display_name": "我的插件",
      "description": "插件功能描述"
    }
  }
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
| `locales`      | Localization overrides per locale, keyed by locale code (e.g. `zh`). Supported fields: `display_name`, `description` | No          |

> The `locales` field allows providing translated values for `display_name` and `description`. The WebUI will automatically display the localized version based on the user's language preference.