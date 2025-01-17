import path from 'path'
import { spawn } from 'child_process'
import { app } from 'electron'

// 检查进程是否存在
const checkProcess = () => {
  return new Promise((resolve) => {
    const process = spawn('tasklist')
    let output = ''

    process.stdout.on('data', (data) => {
      output += data.toString().toLowerCase()
    })

    process.on('close', () => {
      resolve(output.includes('screencapture.exe'))
    })
  })
}

export const screenWindow = async () => {
  const exePath = path.join(
    app.isPackaged ? process.resourcesPath : path.join(__dirname, '../../resources'),
    'Release/ScreenCapture.exe'
  )
  console.log('截图程序路径:', exePath)
  const isRunning = await checkProcess()
  console.log('截图程序是否在运行:', isRunning)
  if (isRunning) {
    // 如果已运行，则结束进程并等待进程完全结束
    await new Promise((resolve) => {
      const kill = spawn('taskkill', ['/F', '/IM', 'ScreenCapture.exe'])
      kill.on('close', () => {
        console.log('截图程序已结束')
        resolve()
      })
    })
  }

  return new Promise((resolve) => {
    try {
      const screen_window = spawn(exePath, [], {
        cwd: path.dirname(exePath),
        detached: false,
        windowsHide: false
      })

      screen_window.on('close', (code) => {
        console.log('截图退出代码:', code)
        resolve('')
      })

      screen_window.on('error', (err) => {
        console.error('截图程序执行错误:', err)
        resolve('')
      })
    } catch (error) {
      console.error('启动截图程序失败:', error)
      resolve('')
    }
  })
}
