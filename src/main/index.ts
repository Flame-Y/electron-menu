import {
  app,
  shell,
  BrowserWindow,
  ipcMain,
  protocol,
  globalShortcut,
  Notification
} from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { setupWindowEvents } from './events/windowEvents'
import appSearch from '../core/app-search'
import path from 'path'
import os from 'os'
import { pluginManager } from './browser/plugin-manager'
import { setupPluginEvents } from './events/pluginEvents'
import { pluginConfig } from '../renderer/plugins/config'
import { openFile, openFolder, removeApp } from '../core/app-search/win'
import { api } from '../common/api'
function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 600,
    height: 80,
    show: false,
    frame: false,
    backgroundColor: '#00000000',
    autoHideMenuBar: true,
    transparent: true,
    skipTaskbar: true, // 隐藏任务栏图标
    alwaysOnTop: true, // 始终置顶
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      webviewTag: false
      // webSecurity: false
    }
  })
  setupWindowEvents(mainWindow)

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // 基于 electron-vite cli 的渲染器热重载
  // 开发环境加载远程 URL，生产环境加载本地 HTML 文件
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  // 初始化插件管理器
  pluginManager.init(mainWindow)

  // 立即注册插件
  pluginConfig.forEach((plugin) => {
    pluginManager.registerPlugin(plugin)
  })

  // 设置插件事件，传入主窗口实例
  setupPluginEvents(mainWindow)

  // 注册全局快捷键
  globalShortcut.register('CommandOrControl+Space', () => {
    toggleWindow(mainWindow)
  })

  // 在应用退出时注销快捷键
  app.on('will-quit', () => {
    globalShortcut.unregisterAll()
  })
}

// 切换窗口显示/隐藏的辅助函数
function toggleWindow(window: BrowserWindow) {
  if (window.isVisible()) {
    window.hide()
  } else {
    window.show()
    window.focus()
  }
}

// 当 Electron 完成初始化并准备创建浏览器窗口时调用此方法
// 某些 API 只能在此事件发生后使用
app.whenReady().then(() => {
  // 设置 Windows 应用程序用户模型 ID
  electronApp.setAppUserModelId('com.electron')

  // 在开发环境中默认使用 F12 打开或关闭 DevTools
  // 在生产环境中忽略 CommandOrControl + R
  // 参见 https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  // 注册自定义协议来处理本地图标
  protocol.registerFileProtocol('app-icon', (request, callback) => {
    const iconName = decodeURIComponent(request.url.replace('app-icon://', ''))
    const iconPath = path.join(os.tmpdir(), 'ProcessIcon', `${iconName}.png`)
    callback(iconPath)
  })
  // protocol.handle('app-icon', (request) => {
  //   const url = request.url.replace('app-icon://', '')
  //   return net.fetch('file://' + decodeURIComponent(url))
  // })

  createWindow()

  app.on('activate', function () {
    // 在 macOS 上，当点击 dock 图标并且没有其他窗口打开时，
    // 通常在应用程序中重新创建一个窗口
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// 当所有窗口都被关闭时退出应用，但在 macOS 上除外
// 在 macOS 上，应用程序和菜单栏通常会保持活动状态，
// 直到用户使用 Cmd + Q 显式退出
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// 在此文件中，你可以包含应用程序主进程的其余特定代码
// 你也可以将它们放在单独的文件中，并在此处引入

ipcMain.handle('search-apps', async (_, keyword: string) => {
  try {
    const results = await appSearch(keyword)
    return results
  } catch (error) {
    console.error('搜索应用出错:', error)
    return []
  }
})

// APP快速检索-打开文件
ipcMain.handle('open-file', async (_event, filePath: string) => {
  return new Promise((resolve) => {
    openFile(filePath, (error) => {
      if (error) {
        resolve({ success: false, error })
      } else {
        resolve({ success: true })
      }
    })
  })
})

// 打开文件夹
ipcMain.handle('open-folder', async (_event, folderPath) => {
  console.log(folderPath)

  return new Promise((resolve, reject) => {
    openFolder(folderPath, (error) => {
      if (error) {
        reject(error)
      } else {
        resolve(true)
      }
    })
  })
})

// 卸载应用
ipcMain.handle('remove-app', async (_event, uninstallCommand) => {
  return new Promise((resolve, reject) => {
    removeApp(uninstallCommand, (error) => {
      if (error) {
        reject(error)
      } else {
        resolve(true)
      }
    })
  })
})

ipcMain.handle('resize-window', (_, { width, height }) => {
  const win = BrowserWindow.getFocusedWindow()
  if (win) {
    win.setSize(width, height)
  }
})

ipcMain.handle('get-window-size', () => {
  const win = BrowserWindow.getFocusedWindow()
  if (win) {
    const [width, height] = win.getSize()
    return { width, height }
  }
  return null
})

ipcMain.on('msg-trigger', async (event, { type, data }) => {
  if (type in api) {
    try {
      // 调用映射的 API 方法
      const result = await api[type](data)
      // console.log('result', result)
      event.returnValue = result
    } catch (error) {
      console.error(`Error executing ${type}:`, error)
      event.returnValue = { error: error.message }
    }
  } else {
    console.warn(`API method ${type} not found`)
    event.returnValue = { error: `Method ${type} not found` }
  }
})

// 添加创建 API 文档窗口的函数
function createApiDocsWindow() {
  const apiDocsWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    title: 'Mortis API 手册'
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    apiDocsWindow.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/api-docs.html`)
  } else {
    apiDocsWindow.loadFile(join(__dirname, '../renderer/api-docs.html'))
  }
}

// 监听打开 API 文档的事件
ipcMain.on('open-api-docs', () => {
  createApiDocsWindow()
})

ipcMain.on('show-notification', (_, { title, body, logo = icon }) => {
  console.log('show-notification', title, body, logo)
  if (!Notification.isSupported()) {
    return false
  }
  const notification = new Notification({ title, body, icon: logo, silent: true })
  notification.show()
  return true
})
