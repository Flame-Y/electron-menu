import { ipcMain, globalShortcut, BrowserWindow, app } from 'electron'
import { pluginManager } from '../browser/plugin-manager'
import { screenWindow } from '../../../plugins/screenshot/capture'
import { adapterHandler } from '../plugin/adapter-handler'
import path from 'path'
import fs from 'fs'

let mainWindow: BrowserWindow | null = null
let currentMainShortcut = 'CommandOrControl+Space'
const pluginShortcutsMap = new Map<string, string>()

function toggleWindow(window: BrowserWindow) {
  if (window.isVisible()) {
    window.hide()
  } else {
    window.show()
    window.focus()
  }
}

// 注册主应用快捷键
function registerMainShortcut(shortcut: string = currentMainShortcut): {
  success: boolean
  error?: string
} {
  try {
    // 先注销当前主应用快捷键
    if (globalShortcut.isRegistered(currentMainShortcut)) {
      globalShortcut.unregister(currentMainShortcut)
    }

    const success = globalShortcut.register(shortcut, () => {
      if (mainWindow) {
        toggleWindow(mainWindow)
      }
    })

    if (success) {
      currentMainShortcut = shortcut
      console.log(`主应用快捷键 ${shortcut} 注册成功`)
      return { success: true }
    } else {
      console.log(`主应用快捷键 ${shortcut} 注册失败`)
      return { success: false, error: '快捷键可能已被其他应用占用' }
    }
  } catch (error) {
    console.error('注册快捷键时出错:', error)
    return { success: false, error: '快捷键格式无效' }
  }
}

// 注册插件快捷键
function registerPluginShortcuts(): void {
  pluginShortcutsMap.forEach((shortcut, pluginId) => {
    if (shortcut && !globalShortcut.isRegistered(shortcut)) {
      try {
        globalShortcut.register(shortcut, () => {
          pluginManager.loadPlugin(pluginId)
        })
        console.log(`插件 ${pluginId} 快捷键 ${shortcut} 注册成功`)
      } catch (error) {
        console.error(`插件 ${pluginId} 快捷键注册失败:`, error)
      }
    }
  })
}

// 初始化快捷键配置
export function initializeShortcuts() {
  // 存储插件快捷键的路径
  const PLUGIN_SHORTCUTS_PATH = path.join(app.getPath('userData'), 'plugin-shortcuts.json')

  // 读取插件快捷键配置
  function loadPluginShortcuts() {
    try {
      if (fs.existsSync(PLUGIN_SHORTCUTS_PATH)) {
        return JSON.parse(fs.readFileSync(PLUGIN_SHORTCUTS_PATH, 'utf-8'))
      }
    } catch (error) {
      console.error('读取插件快捷键配置失败:', error)
    }
    return {}
  }

  // 保存插件快捷键配置
  function savePluginShortcuts(shortcuts: Record<string, string>) {
    try {
      fs.writeFileSync(PLUGIN_SHORTCUTS_PATH, JSON.stringify(shortcuts, null, 2), 'utf-8')
    } catch (error) {
      console.error('保存插件快捷键配置失败:', error)
    }
  }

  // 更新 get-installed-plugins 处理器
  ipcMain.handle('get-installed-plugins', async () => {
    try {
      const plugins = pluginManager.getAllPlugins().map((plugin) => {
        const shortcut = pluginShortcutsMap.get(plugin.id) || ''
        return {
          id: plugin.id,
          name: plugin.name,
          shortcut: shortcut
        }
      })

      console.log('所有插件快捷键映射:', Array.from(pluginShortcutsMap.entries()))
      return plugins
    } catch (error) {
      console.error('获取插件列表失败:', error)
      return []
    }
  })

  // 更新 save-plugin-shortcut 处理器
  ipcMain.handle('save-plugin-shortcut', async (_, { pluginId, shortcut }) => {
    try {
      console.log('save-plugin-shortcut', pluginId, shortcut)
      const shortcuts = loadPluginShortcuts()
      const newShortcuts = {
        ...shortcuts,
        [pluginId]: shortcut
      }
      console.log('newShortcuts', newShortcuts)
      savePluginShortcuts(newShortcuts)

      // 更新内存中的快捷键映射
      pluginShortcutsMap.set(pluginId, shortcut)

      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  })

  // 添加重新加载插件快捷键的处理器
  ipcMain.handle('reload-plugin-shortcuts', async () => {
    try {
      // 从配置文件加载插件快捷键
      const shortcuts = loadPluginShortcuts()
      pluginShortcutsMap.clear()
      Object.entries(shortcuts).forEach(([pluginId, shortcut]) => {
        if (typeof shortcut === 'string') {
          pluginShortcutsMap.set(pluginId, shortcut)
        }
      })

      // 重新注册所有快捷键（包括主应用和插件）
      globalShortcut.unregisterAll()
      registerMainShortcut(currentMainShortcut)
      registerPluginShortcuts()

      return { success: true }
    } catch (error) {
      console.error('重新加载插件快捷键失败:', error)
      return { success: false, error: '重新加载插件快捷键失败' }
    }
  })

  // 加载保存的主应用快捷键配置
  const configPath = path.join(app.getPath('userData'), 'config.json')
  if (fs.existsSync(configPath)) {
    try {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'))
      if (config.shortcut) {
        currentMainShortcut = config.shortcut
      }
    } catch (error) {
      console.error('加载配置失败:', error)
    }
  }

  // 加载插件快捷键
  const shortcuts = loadPluginShortcuts()
  Object.entries(shortcuts).forEach(([pluginId, shortcut]) => {
    if (typeof shortcut === 'string') {
      pluginShortcutsMap.set(pluginId, shortcut)
    }
  })

  // 注册快捷键
  registerMainShortcut(currentMainShortcut)
  registerPluginShortcuts()
}

export function setupPluginEvents(window: BrowserWindow) {
  mainWindow = window

  // 注册插件
  ipcMain.handle('register-plugins', (_, plugins: any[]) => {
    plugins.forEach((plugin) => {
      pluginManager.registerPlugin(plugin)
    })
    return { success: true }
  })

  // 加载插件
  ipcMain.handle('load-plugin', async (_, pluginId: string) => {
    try {
      await pluginManager.loadPlugin(pluginId)
      return { success: true }
    } catch (error) {
      console.error('Failed to load plugin:', error)
      return { success: false, error: error.message }
    }
  })

  // 卸载插件
  ipcMain.handle('unload-plugin', async (_, pluginId: string) => {
    try {
      await pluginManager.unloadPlugin(pluginId)
      return { success: true }
    } catch (error) {
      console.error('Failed to unload plugin:', error)
      return { success: false, error: error.message }
    }
  })

  // 获取插件列表
  ipcMain.handle('get-plugins', () => {
    const plugins = pluginManager.getAllPlugins()
    return plugins
  })

  // 处理来自插件的消息
  ipcMain.on('plugin-message', (_, message) => {
    console.log('主进程收到插件消息:', message)
    try {
      // 可以转发消息到主窗口
      pluginManager.getCurrentWindow()?.webContents.send('plugin-message', message)
      console.log('消息已转发到主窗口')
    } catch (error) {
      console.error('转发消息失败:', error)
    }
  })

  // 处理插件关闭请求
  ipcMain.on('close-plugin', async (_, data) => {
    try {
      await pluginManager.unloadPlugin(data.pluginId)
      // 通知渲染进程插件已关闭
      pluginManager.getCurrentWindow()?.webContents.send('plugin-closed', data.pluginId)
    } catch (error) {
      console.error('关闭插件失败:', error)
    }
  })

  // 处理截图请求
  ipcMain.handle('screenshot:capture', async () => {
    console.log('screenshot:capture')
    const result = await screenWindow()
    return result
  })

  // 更新快捷键
  ipcMain.handle('update-shortcut', async (_, newShortcut: string) => {
    try {
      // 保存快捷键到配置文件
      const configPath = path.join(app.getPath('userData'), 'config.json')
      let config: any = {}

      if (fs.existsSync(configPath)) {
        config = JSON.parse(fs.readFileSync(configPath, 'utf8'))
      }

      config.shortcut = newShortcut
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2))

      return { success: true }
    } catch (error) {
      console.error('保存快捷键配置失败:', error)
      return { success: false, error: '保存配置失败' }
    }
  })

  // 添加重新加载快捷键的处理器
  ipcMain.handle('reload-shortcut', async () => {
    try {
      // 从配置文件读取快捷键
      const configPath = path.join(app.getPath('userData'), 'config.json')
      if (fs.existsSync(configPath)) {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'))
        if (config.shortcut) {
          currentMainShortcut = config.shortcut
        }
      }

      // 重新注册主应用快捷键
      const result = registerMainShortcut(currentMainShortcut)
      // 重新注册插件快捷键
      registerPluginShortcuts()

      return result
    } catch (error) {
      console.error('重新注册快捷键失败:', error)
      return { success: false, error: '重新注册快捷键失败' }
    }
  })

  // 安装插件
  ipcMain.handle('install-plugin', async (_, pluginName: string) => {
    try {
      await adapterHandler.install([pluginName])
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  })

  // 卸载插件
  ipcMain.handle('uninstall-plugin', async (_, pluginName: string) => {
    try {
      await adapterHandler.uninstall([pluginName])
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  })

  // 获取已安装插件列表
  ipcMain.handle('list-installed-plugins', async () => {
    try {
      const plugins = await adapterHandler.list()
      const pluginPath = path.join(app.getPath('userData'), 'plugins')

      // 处理路径拼接
      const processedPlugins = plugins.map((name) => ({
        id: name,
        name,
        indexPath: path.join(pluginPath, 'node_modules', name, 'index.html').replace(/\\/g, '/'),
        preload: path.join(pluginPath, 'node_modules', name, 'preload.js').replace(/\\/g, '/'),
        from: 'npm',
        configPath: fs.existsSync(path.join(pluginPath, 'node_modules', name, 'package.json'))
          ? fs.readFileSync(path.join(pluginPath, 'node_modules', name, 'package.json'), 'utf-8')
          : null
      }))
      processedPlugins.forEach((plugin) => {
        pluginManager.registerPlugin(plugin)
      })
      return {
        success: true,
        plugins: processedPlugins
      }
    } catch (error) {
      return { success: false, error: error.message }
    }
  })

  // 获取插件安装路径
  ipcMain.handle('get-plugin-path', () => {
    return path.join(app.getPath('userData'), 'plugins')
  })
}
