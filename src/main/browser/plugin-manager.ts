import { BrowserView, BrowserWindow, app, session } from 'electron'
import path from 'path'

interface Plugin {
  id: string
  name: string
  indexPath: string
  preload?: string
  view?: BrowserView
  from?: 'npm' | 'local'
}

class PluginManager {
  private plugins: Map<string, Plugin>
  private currentWindow: BrowserWindow | null
  private activePlugin: Plugin | null

  constructor() {
    this.plugins = new Map()
    this.currentWindow = null
    this.activePlugin = null
  }

  // 初始化插件管理器
  init(window: BrowserWindow) {
    this.currentWindow = window
  }

  // 注册插件
  registerPlugin(plugin: Plugin) {
    // 处理路径
    console.log('原始插件配置:', plugin)

    const resolvedPlugin = {
      ...plugin,
      // 如果插件来自npm，则不需要拼接路径
      indexPath:
        plugin.from === 'npm'
          ? plugin.indexPath
          : `file://${path.join(app.getAppPath(), plugin.indexPath)}`,
      preload:
        plugin.from === 'npm'
          ? plugin.preload
          : plugin.preload
            ? path.join(app.getAppPath(), plugin.preload)
            : undefined
    }
    console.log('解析后的插件配置:', resolvedPlugin)
    this.plugins.set(plugin.id, resolvedPlugin)
  }

  // 加载插件
  async loadPlugin(pluginId: string) {
    if (!this.currentWindow) {
      throw new Error('Window not initialized')
    }

    // 卸载当前插件
    if (this.activePlugin) {
      await this.unloadPlugin(this.activePlugin.id)
    }
    const plugin = this.plugins.get(pluginId)
    if (!plugin) {
      throw new Error(`Plugin ${pluginId} not found`)
    }
    const ses = session.fromPartition('<' + plugin.id + '>')
    // 通过 session 注入系统 preload
    ses.setPreloads([path.join(__dirname, '../../out/preload/index.js')])
    console.log('ses', path.join(__dirname, '../../out/preload/index.js'))
    try {
      // 创建插件视图
      const view = new BrowserView({
        webPreferences: {
          webSecurity: false,
          nodeIntegration: true,
          contextIsolation: true,
          sandbox: false,
          preload: plugin.preload,
          session: ses
        }
      })
      // 保存视图引用
      plugin.view = view

      // 设置视图
      this.currentWindow.setBrowserView(view)

      const contents = this.getWebContents(view)
      await contents.loadURL(plugin.indexPath)

      // 设置视图位置和大小
      view.setBounds({
        x: 0,
        y: 80,
        width: 600,
        height: 480
      })

      // 注入退出按钮的样式和HTML
      //todo: 插件preload.js没有send方法时的处理
      await contents.insertCSS(`
        .plugin-close-btn {
          position: fixed;
          top: 10px;
          right: 10px;
          padding: 6px 12px;
          background-color: #ef4444;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
          z-index: 9999;
        }
        .plugin-close-btn:hover {
          background-color: #dc2626;
        }
      `)

      await contents.executeJavaScript(`
        const closeBtn = document.createElement('button');
        closeBtn.className = 'plugin-close-btn';
        closeBtn.textContent = '退出插件';
        closeBtn.onclick = () => {
          window.electron.ipcRenderer.send('close-plugin', { pluginId: '${pluginId}' });
        };
        document.body.appendChild(closeBtn);
      `)

      this.activePlugin = plugin
      view.webContents.openDevTools()
      this.setupPluginLifecycleEvents(plugin)
    } catch (error) {
      console.error(`Failed to load plugin ${pluginId}:`, error)
      throw error
    }
  }

  // 卸载插件
  async unloadPlugin(pluginId: string) {
    const plugin = this.plugins.get(pluginId)
    if (!plugin || !plugin.view) return

    if (this.currentWindow) {
      this.currentWindow.removeBrowserView(plugin.view)
    }

    // 清理插件资源
    const contents = this.getWebContents(plugin.view)
    contents.close()
    plugin.view = undefined
    this.activePlugin = null
  }

  // 设置插件事件监听
  private setupPluginLifecycleEvents(plugin: Plugin) {
    if (!plugin.view) return

    const contents = this.getWebContents(plugin.view)
    contents.once('dom-ready', () => {
      console.log(`Plugin ${plugin.name} is ready`)
    })

    contents.once('render-process-gone', () => {
      console.error(`Plugin ${plugin.name} has crashed`)
      this.unloadPlugin(plugin.id)
    })
  }

  // 获取当前活动的插件
  getActivePlugin() {
    return this.activePlugin
  }

  // 获取所有已注册的插件
  getAllPlugins() {
    return Array.from(this.plugins.values())
  }

  // 在类中添加一个获取 webContents 的辅助方法
  private getWebContents(view: BrowserView) {
    return view.webContents
  }

  // 添加一个公共方法
  getCurrentWindow() {
    return this.currentWindow
  }
}

export const pluginManager = new PluginManager()
