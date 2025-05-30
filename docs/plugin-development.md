# 插件开发指南

## 开发环境准备

### 安装 Mortis Plugin CLI

```bash
npm install -g mortis-plugin-cli
```

### 创建新插件

```bash
mortis-plugin create <plugin name>
```

选择你偏好的前端框架：

- Vanilla JavaScript
- Vue 3
- React 18+

## 插件结构

### 基本文件结构

my-plugin/

├── package.json # 插件配置文件

├── index.html # 插件主页面

├── preload.js # 预加载脚本

└── src/

├── main.js # 主逻辑文件

└── style.css # 样式文件

### package.json 配置

```json
{
  "name": "my-plugin",

  "pluginName": "我的插件",

  "version": "1.0.0",

  "description": "插件描述",

  "author": "作者名称",

  "main": "index.html",

  "preload": "preload.js",

  "pluginType": "ui",

  "features": [
    {
      "code": "my-plugin",

      "explain": "插件功能说明",

      "cmds": ["my-plugin", "我的插件"]
    }
  ]
}
```

## 核心 API

### Mortis 全局对象

```js
// 复制文本到剪贴板

window.mortis.copyText('要复制的文本')

// 获取剪贴板图片

const imageData = await window.mortis.getClipboardImage()

// 发送通知

window.mortis.notify('标题', '内容', '图标路径')

// 退出插件

window.mortis.exitPlugin('plugin-name')
```

## 开发最佳实践

## 调试和测试

### 本地调试

```bash
cd my-plugin

npm run dev
```

如果使用Vue/React框架，需要打包为dist后在dist目录下执行

```bash
npm link
```

### 安装到 Mortis

1. 将插件文件夹复制到 Mortis 插件目录

2. 重启 Mortis
3. 在插件列表中查看和测试

## 发布插件

### 发布到 NPM

```bash
npm publish
```

### 在 Mortis 中安装

通过插件市场的开发者选项卡安装已发布的插件。
