// 导入所需模块
import fs from 'fs'
import path from 'path'
import os from 'os'
import child from 'child_process'
import iconv from 'iconv-lite'
import fileIcon from 'extract-file-icon'
import { pinyin } from 'pinyin-pro'

// 添加类型定义
interface AppInfo {
  name: string
  desc: string
  type: string
  icon: string
  keyWords: string[]
  action: string
}

const icondir = path.join(os.tmpdir(), 'ProcessIcon')

// 确保图标目录存在
if (!fs.existsSync(icondir)) {
  fs.mkdirSync(icondir, { recursive: true })
}

// 清理文件名，移除非法字符
function sanitizeFileName(name: string): string {
  return name
    .replace(/[\\/:*?"<>|]/g, '_')
    .replace(/\s+/g, '_')
    .toLowerCase()
}

/**
 * 为应用程序提取图标
 * @param {AppInfo} app - 包含 DisplayIcon 和 LegalName 属性的应用信息
 * @returns {boolean} - 是否成功提取图标
 */
function getIcons(app: AppInfo): boolean {
  if (!app?.desc) return false

  try {
    // 检查路径是否存在且可访问
    if (!fs.existsSync(app.desc) && !app.desc.endsWith('.exe')) {
      console.log(`无效的图标路径: ${app.desc}`)
      return false
    }

    const buffer = fileIcon(app.desc, 32)
    if (!buffer || buffer.length === 0) {
      console.log(`无法从 ${app.desc} 提取图标`)
      return false
    }

    const iconpath = path.join(icondir, `${sanitizeFileName(app.name)}.png`)

    // 同步写入文件以便于调试
    fs.writeFileSync(iconpath, buffer, 'base64')

    // 验证文件大小
    const stats = fs.statSync(iconpath)
    if (stats.size === 0) {
      console.log(`提取的图标文件为空: ${iconpath}`)
      return false
    }

    return true
  } catch (e) {
    console.error(`提取图标失败 (${app.name}): `, e)
    return false
  }
}

/**
 * 执行 PowerShell 命令
 * @param {string} cmd - 要执行的 PowerShell 命令
 * @param {function} callback - 处理标准输出和错误输出的回调函数
 */
function executePowerShell(cmd, callback) {
  const ps = child.spawn('powershell', ['-NoProfile', '-Command', cmd])
  const chunks: string[] = []
  const errorChunks: string[] = []

  ps.stdout.on('data', (chunk) => chunks.push(iconv.decode(chunk, 'cp936')))
  ps.stderr.on('data', (errorChunk) => errorChunks.push(iconv.decode(errorChunk, 'cp936')))

  ps.on('close', () => {
    const stdout = chunks.join('')
    const stderr = errorChunks.join('')
    callback(stdout, stderr)
  })
}

/**
 * 获取已安装应用程序列表
 * @param {function} callback - 处理应用程序列表的回调函数
 */
function getAppList(callback: (apps: AppInfo[]) => void) {
  const filterValues =
    'Select-Object DisplayName,DisplayIcon,UninstallString,DisplayVersion,InstallDate,Publisher,InstallLocation'
  const localMachine = `Get-ItemProperty HKLM:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\* | ${filterValues}`
  const currentUser = `Get-ItemProperty HKCU:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\* | ${filterValues}`
  const wow6432Node = `Get-ItemProperty HKLM:\\SOFTWARE\\Wow6432Node\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\* | ${filterValues}`
  const x64 = process.arch === 'x64' ? `;${wow6432Node}` : ''

  executePowerShell(`${localMachine};${currentUser}${x64}`, (stdout, stderr) => {
    if (stderr) {
      console.error('PowerShell error:', stderr)
      callback([])
      return
    }

    try {
      const apps = stdout
        .trim()
        .replace(/\r\n[ ]{10,}/g, '')
        .split('\r\n\r\n')
        .filter((app) => app.trim()) // 过滤空字符串

      const appList = apps
        .map((app) => {
          const dict: { [key: string]: string } = {}
          app.split('\r\n').forEach((line) => {
            if (line) {
              const [key, ...valueParts] = line.split(/\s+:\s*/)
              const value = valueParts.join(':').trim() // 处理值中可能包含冒号的情况
              if (key && value) dict[key] = value
            }
          })

          if (!dict.DisplayName) return null

          // 将缩写加入到 keyWords 中
          const shortName = dict.DisplayName.split(' ')
            .map((word) => word[0])
            .join('')

          // 如果 DisplayName 有中文，解析出拼音
          let pinyinResult = ''
          let pinyinShortName = ''
          if (dict.DisplayName) {
            // 将原始字符串按空格分割，分别转换拼音后再用原有的空格重新连接
            pinyinResult = dict.DisplayName.split(' ')
              .map((word) => pinyin(word, { toneType: 'none' }).replace(/\s+/g, ''))
              .join(' ')

            pinyinShortName = pinyin(dict.DisplayName, { toneType: 'none' })
              .split(' ')
              .map((word) => word.charAt(0)) // 获取每个拼音的首字母
              .join('') // 连接所有首字母
              .replace(/[^a-zA-Z]/g, '') // 移除非字母字符
          }
          console.log(app.name, dict, dict.DisplayIcon)
          return {
            name: dict.DisplayName,
            desc:
              dict.DisplayIcon?.replace(/^"|"$/g, '') ||
              dict.InstallLocation?.replace(/^"|"$/g, '') ||
              '',
            type: 'app',
            icon: `app-icon://${encodeURIComponent(sanitizeFileName(dict.DisplayName))}`,
            keyWords: [dict.DisplayName, pinyinResult, shortName, pinyinShortName],
            action: getExecutablePath(dict) || dict.DisplayIcon
          }
        })
        .filter((app) => app !== null) // 过滤掉空值

      // 为每个应用提取图标，并处理提取失败的情况
      appList.forEach((app) => {
        const iconSuccess = getIcons(app)
        if (!iconSuccess) {
          // TODO: 如果图标提取失败，使用默认图标
        }
      })
      //过滤没有action的app
      const filteredAppList = appList.filter((app) => app.action)
      callback(filteredAppList)
    } catch (error) {
      console.error('处理应用列表出错:', error)
      callback([])
    }
  })
}

// 新增可执行路径解析函数
function getExecutablePath(dict: { [key: string]: string }): string | null {
  try {
    if (dict.DisplayIcon && dict.DisplayIcon.includes('.exe')) return dict.DisplayIcon
    // 情况1：InstallLocation包含可执行文件路径
    if (dict.InstallLocation) {
      const exeFiles = fs
        .readdirSync(dict.InstallLocation)
        .filter((file) => file.endsWith('.exe') && !file.toLowerCase().includes('uninstall'))

      // 优先选择与应用同名的exe
      const mainExe = exeFiles.find(
        (file) => sanitizeFileName(file) === sanitizeFileName(dict.DisplayName + '.exe')
      )
      if (mainExe) return path.join(dict.InstallLocation, mainExe)

      // 次选：体积最大的exe（通常为主程序）
      if (exeFiles.length > 0) {
        const largestExe = exeFiles.reduce((prev, current) => {
          const prevSize = fs.statSync(path.join(dict.InstallLocation, prev)).size
          const currentSize = fs.statSync(path.join(dict.InstallLocation, current)).size
          return currentSize > prevSize ? current : prev
        })
        return path.join(dict.InstallLocation, largestExe)
      }
    }

    // 情况2：解析UninstallString中的真实路径
    if (dict.UninstallString) {
      const match = dict.UninstallString.match(/"([^"]+\.exe)"/i)
      if (match && fs.existsSync(match[1])) {
        return match[1]
      }
    }

    // 情况3：特殊程序处理（如Steam游戏）
    if (dict.Publisher?.includes('Steam') || dict.InstallLocation?.includes('Steam')) {
      const appId = getSteamAppId(dict.InstallLocation)
      if (appId) return `steam://rungameid/${appId}`
    }
  } catch (e) {
    console.error('路径解析失败:', e)
  }
  return null
}

// 获取Steam游戏ID
function getSteamAppId(installPath: string): string | null {
  const acfFiles = fs.readdirSync(installPath).filter((f) => f.endsWith('.acf'))
  if (acfFiles.length > 0) {
    const acfContent = fs.readFileSync(path.join(installPath, acfFiles[0]), 'utf-8')
    const appIdMatch = acfContent.match(/^\s*"appid"\s+"(\d+)"/m)
    return appIdMatch ? appIdMatch[1] : null
  }
  return null
}
/**
 * 使用卸载命令卸载应用程序
 * @param {string} command - 应用程序的卸载命令
 * @param {function} callback - 处理错误的回调函数
 */
function removeApp(command: string, callback: (error: string | null) => void) {
  const sanitizedCommand = command.replace(/(^[A-z]:\\[\S ]+\\\S+)($| )/, '"$1"$2')
  child.exec(sanitizedCommand, { encoding: 'buffer' }, (err, _stdout, stderr) => {
    if (err) {
      callback(iconv.decode(stderr, 'cp936'))
    } else {
      callback(null)
    }
  })
}

/**
 * 打开应用程序的安装目录
 * @param {string} folderPath - 安装目录路径
 * @param {function} callback - 处理错误或成功的回调函数
 */
function openFolder(folderPath: string, callback: (error: string | null) => void) {
  if (folderPath) {
    child.exec(`explorer.exe ${folderPath}`, { encoding: 'buffer' }, (err, _stdout, stderr) => {
      if (err) {
        callback(iconv.decode(stderr, 'cp936'))
      } else {
        callback(null)
      }
    })
  } else {
    callback('No installation directory found in the registry!')
  }
}

/**
 * 打开文件
 * @param {string} filePath - 文件路径
 */
function openFile(filePath: string, callback: (error: string | null) => void) {
  if (filePath) {
    child.exec(`start "" "${filePath}"`, { encoding: 'buffer' }, (err, _stdout, stderr) => {
      if (err) {
        callback(iconv.decode(stderr, 'cp936'))
      } else {
        callback(null)
      }
    })
  } else {
    callback('File path not found!')
  }
}

// 导出模块函数
export { getAppList, removeApp, openFolder, openFile }
