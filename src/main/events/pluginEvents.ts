import { ipcMain, globalShortcut, BrowserWindow, app } from 'electron'
import { pluginManager } from '../browser/plugin-manager'
import { screenWindow } from '../../../plugins/screenshot/capture'
import { adapterHandler } from '../plugin/adapter-handler'
import path from 'path'

let mainWindow: BrowserWindow | null = null

function toggleWindow(window: BrowserWindow) {
  if (window.isVisible()) {
    window.hide()
  } else {
    window.show()
    window.focus()
  }
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
    const result = await screenWindow()
    return result
  })

  // 更新快捷键
  ipcMain.handle('update-shortcut', async (_, newShortcut: string) => {
    try {
      // 先注销现有快捷键
      globalShortcut.unregisterAll()

      // 注册新快捷键
      const registered = globalShortcut.register(newShortcut, () => {
        if (mainWindow) {
          toggleWindow(mainWindow)
        }
      })

      if (!registered) {
        throw new Error('快捷键注册失败，可能与系统快捷键冲突')
      }

      return { success: true }
    } catch (error) {
      console.error('更新快捷键失败:', error)
      // 如果更新失败，重新注册默认快捷键
      globalShortcut.register('CommandOrControl+Space', () => {
        if (mainWindow) {
          toggleWindow(mainWindow)
        }
      })
      return { success: false, error: error.message }
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
        from: 'npm'
      }))
      console.log('processedPlugins', processedPlugins)
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
