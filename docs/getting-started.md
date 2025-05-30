# 快速开始

## 下载安装

### 从 GitHub 下载

```bash
git clone https://github.com/Flame-Y/electron-menu.git
```

### 支持的平台

- Windows 10/11
- macOS 10.14+

## 基本使用

### 应用初始化

```bash
npm i / pnpm i

npm run dev / pnpm dev
```

### 呼出主界面

- 默认快捷键：`Ctrl + Space` (Windows) 或 `Cmd + Space` (macOS)
- 点击系统托盘图标

### 基础操作

1. **搜索功能**：在主界面输入关键词搜索全局应用与已安装插件
2. **插件启动**：点击运行或按绑定好的快捷键启动插件
3. **快捷键**：为常用插件设置专属快捷键

## 内置插件

### 截图工具

- 功能：快速截图并编辑
- 快捷键：`Ctrl + Shift + A`
- 支持：矩形选择、自由绘制、文字标注

### OCR 文字识别

- 功能：从图片中提取文字
- 支持：中英文识别、剪贴板图片处理
- 格式：支持多种图片格式

### 颜色选择器

- 功能：屏幕取色工具
- 格式：HEX、RGB、HSL 多种格式
- 快速复制到剪贴板

## 下一步

- 查看 [插件开发指南](/plugin-development) 创建自己的插件
- 了解 [API 文档](/api-reference) 掌握插件开发接口
- 浏览 [插件市场](/plugin-market) 发现更多实用插件
