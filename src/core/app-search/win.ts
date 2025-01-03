// ��������ģ��
const fs = require('fs')
const path = require('path')
const os = require('os')
const child = require('child_process')
const iconv = require('iconv-lite')

// ������Ͷ���
interface AppInfo {
  name: string
  desc: string
  type: string
  icon: string
  keyWords: string[]
  action: string
}

const icondir = path.join(os.tmpdir(), 'ProcessIcon')

// ȷ��ͼ��Ŀ¼����
if (!fs.existsSync(icondir)) {
  fs.mkdirSync(icondir, { recursive: true })
}

// �����ļ������Ƴ��Ƿ��ַ�
function sanitizeFileName(name: string): string {
  return name
    .replace(/[\\/:*?"<>|]/g, '_')
    .replace(/\s+/g, '_')
    .toLowerCase()
}

/**
 * ΪӦ�ó�����ȡͼ��
 * @param {AppInfo} app - ���� DisplayIcon �� LegalName ���Ե�Ӧ����Ϣ
 */
function getIcons(app: AppInfo) {
  if (!app?.desc) return

  try {
    const fileIcon = require('extract-file-icon')
    const buffer = fileIcon(app.desc, 32)
    if (!buffer) return

    const iconpath = path.join(icondir, `${sanitizeFileName(app.name)}.png`)

    fs.access(iconpath, fs.constants.F_OK, (err) => {
      if (err) {
        fs.writeFile(iconpath, buffer, 'base64', (writeErr) => {
          if (writeErr) console.error('Failed to write icon:', writeErr)
        })
      }
    })
  } catch (e) {
    console.error('Failed to extract icon:', e)
  }
}

/**
 * ִ�� PowerShell ����
 * @param {string} cmd - Ҫִ�е� PowerShell ����
 * @param {function} callback - �����׼����ʹ�������Ļص�����
 */
function executePowerShell(cmd, callback) {
  const ps = child.spawn('powershell', ['-NoProfile', '-Command', cmd], { encoding: 'buffer' })
  const chunks = []
  const errorChunks = []

  ps.stdout.on('data', (chunk) => chunks.push(iconv.decode(chunk, 'cp936')))
  ps.stderr.on('data', (errorChunk) => errorChunks.push(iconv.decode(errorChunk, 'cp936')))

  ps.on('close', () => {
    const stdout = chunks.join('')
    const stderr = errorChunks.join('')
    callback(stdout, stderr)
  })
}

/**
 * ��ȡ�Ѱ�װӦ�ó����б�
 * @param {function} callback - ����Ӧ�ó����б�Ļص�����
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
        .filter((app) => app.trim()) // ���˿��ַ���

      const appList = apps
        .map((app) => {
          const dict: { [key: string]: string } = {}
          app.split('\r\n').forEach((line) => {
            if (line) {
              const [key, ...valueParts] = line.split(/\s+:\s*/)
              const value = valueParts.join(':').trim() // ����ֵ�п��ܰ���ð�ŵ����
              if (key && value) dict[key] = value
            }
          })

          if (!dict.DisplayName) return null // ���û����ʾ���ƣ�����

          return {
            name: dict.DisplayName,
            desc: dict.DisplayIcon || dict.InstallLocation || '',
            type: 'app',
            icon: `app-icon://${encodeURIComponent(sanitizeFileName(dict.DisplayName))}`,
            keyWords: [dict.DisplayName],
            action: dict.UninstallString || ''
          }
        })
        .filter((app) => app !== null) // ���˵���ֵ

      // Ϊÿ��Ӧ����ȡͼ��
      appList.forEach(getIcons)

      console.log('�ҵ�Ӧ������:', appList.length) // �������
      callback(appList)
    } catch (error) {
      console.error('����Ӧ���б����:', error)
      callback([])
    }
  })
}

/**
 * ʹ��ж������ж��Ӧ�ó���
 * @param {string} command - Ӧ�ó����ж������
 * @param {function} callback - �������Ļص�����
 */
function removeApp(command, callback) {
  const sanitizedCommand = command.replace(/(^[A-z]:\\[\S ]+\\\S+)($| )/, '\"$1\"$2')
  child.exec(sanitizedCommand, { encoding: 'buffer' }, (err, stdout, stderr) => {
    if (err) {
      callback(iconv.decode(stderr, 'cp936'))
    } else {
      callback(null)
    }
  })
}

/**
 * ��Ӧ�ó���İ�װĿ¼
 * @param {string} folderPath - ��װĿ¼·��
 * @param {function} callback - ��������ɹ��Ļص�����
 */
function openFolder(folderPath, callback) {
  if (folderPath) {
    child.exec(`explorer.exe ${folderPath}`, { encoding: 'buffer' }, (err, stdout, stderr) => {
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

// ����ģ�麯��
export { getAppList, removeApp, openFolder }
