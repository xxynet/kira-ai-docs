# manifest.json

描述插件的基本信息，**必须存在**，否则插件将以文件夹名作为 `plugin_id`。

```json
{
  "display_name": "我的插件",
  "plugin_id": "my_plugin",
  "version": "1.0",
  "author": "Your Name",
  "description": "插件功能描述",
  "repo": "https://github.com/...",
  "locales": {
    "en/zh": {
      "display_name": "我的插件",
      "description": "插件功能描述"
    }
  }
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
| `locales`      | 按语言代码（如 `zh`）提供本地化覆盖，支持字段：`display_name`、`description` | 否   |

> `locales` 字段允许为 `display_name` 和 `description` 提供翻译值，WebUI 会根据用户语言偏好自动显示对应语言的版本。