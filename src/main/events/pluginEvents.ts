import { ipcMain } from 'electron'
import { pluginManager } from '../browser/plugin-manager'
import { screenWindow } from '../../../plugins/screenshot/capture'

export function setupPluginEvents() {
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
}
