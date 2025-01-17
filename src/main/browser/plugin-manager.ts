import { BrowserView, BrowserWindow, app } from 'electron'
import path from 'path'
import { WINDOW_HEIGHT, WINDOW_PLUGIN_HEIGHT, WINDOW_WIDTH } from '../../common/constants/common'

interface Plugin {
  id: string
  name: string
  indexPath: string
  preload?: string
  view?: BrowserView
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
      indexPath: `file://${path.join(app.getAppPath(), plugin.indexPath)}`,
      preload: plugin.preload ? path.join(app.getAppPath(), plugin.preload) : undefined
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

    try {
      // 创建插件视图
      const view = new BrowserView({
        webPreferences: {
          webSecurity: false,
          nodeIntegration: true,
          contextIsolation: true,
          sandbox: false,
          preload: plugin.preload
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
        y: WINDOW_HEIGHT,
        width: WINDOW_WIDTH,
        height: WINDOW_PLUGIN_HEIGHT - WINDOW_HEIGHT
      })

      this.activePlugin = plugin
      // 打开browserWindow开发者工具
      view.webContents.openDevTools()
      // 监听插件事件
      this.setupPluginEvents(plugin)
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
  private setupPluginEvents(plugin: Plugin) {
    if (!plugin.view) return

    const contents = this.getWebContents(plugin.view)
    contents.once('dom-ready', () => {
      console.log(`Plugin ${plugin.name} is ready`)
    })

    contents.once('crashed', () => {
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
