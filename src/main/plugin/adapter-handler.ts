import fs from 'fs-extra'
import path from 'path'
import { app } from 'electron'
import spawn from 'cross-spawn'
import axios from 'axios'
import { AdapterHandlerOptions, AdapterInfo } from './types'

class AdapterHandler {
  public baseDir: string
  readonly registry: string
  private pluginCaches = {}

  constructor(options: AdapterHandlerOptions) {
    // 修改为正确的外部插件目录
    this.baseDir = path.join(app.getPath('userData'), 'plugins')
    this.registry = options.registry || 'https://registry.npmmirror.com/'
  }

  async getAdapterInfo(adapter: string): Promise<AdapterInfo> {
    const infoPath = path.resolve(this.baseDir, 'node_modules', adapter, 'plugin.json')

    try {
      if (await fs.pathExists(infoPath)) {
        return JSON.parse(await fs.readFile(infoPath, 'utf-8'))
      } else {
        const { data } = await axios.get(`${this.registry}${adapter}/plugin.json`)
        return data
      }
    } catch (error) {
      throw new Error(`Failed to get plugin info: ${error.message}`)
    }
  }

  async install(plugins: string[], options: { isDev: boolean } = { isDev: false }) {
    // 处理本地路径
    if (plugins[0].includes(':\\') || plugins[0].startsWith('/')) {
      // 对于本地路径，强制使用 npm link
      const cmd = 'link'
      try {
        // 先进入插件目录执行 npm link
        await this.execCommand(cmd, [], { cwd: plugins[0] })
        // 然后在插件安装目录执行 npm link package-name
        const packageJson = await fs.readJson(path.join(plugins[0], 'package.json'))
        await this.execCommand(cmd, [packageJson.name])
        return
      } catch (error) {
        throw new Error(`Failed to link local plugin: ${error.message}`)
      }
    }

    // 远程包安装逻辑保持不变
    const cmd = options.isDev ? 'link' : 'install'
    await this.execCommand(cmd, plugins)
  }

  async uninstall(plugins: string[], options: { isDev: boolean } = { isDev: false }) {
    const cmd = options.isDev ? 'unlink' : 'uninstall'
    await this.execCommand(cmd, plugins)
  }

  async list(): Promise<string[]> {
    try {
      // 直接读取 node_modules 目录
      const nodeModulesPath = path.join(this.baseDir, 'node_modules')
      if (!fs.existsSync(nodeModulesPath)) {
        return []
      }

      // 获取所有子目录（排除 . 开头的目录）
      const files = await fs.readdir(nodeModulesPath)
      return files.filter((file) => !file.startsWith('.') && !file.startsWith('@'))
    } catch (error) {
      console.error('Failed to list plugins:', error)
      return []
    }
  }

  private async execCommand(cmd: string, modules: string[]): Promise<any> {
    return new Promise((resolve, reject) => {
      const args = [cmd]
        .concat(cmd !== 'uninstall' && cmd !== 'link' ? modules.map((m) => `${m}@latest`) : modules)
        .concat('--save')
        .concat(`--registry=${this.registry}`)

      const npm = spawn('npm', args, { cwd: this.baseDir })

      let output = ''
      npm.stdout.on('data', (data) => (output += data.toString()))
      npm.stderr.on('data', (data) => (output += data.toString()))

      npm.on('close', (code) => {
        if (code === 0) {
          resolve({ success: true, output })
        } else {
          reject({ success: false, error: output })
        }
      })
    })
  }
}

export const adapterHandler = new AdapterHandler({
  baseDir: path.join(app.getPath('userData'), 'plugins'),
  registry: 'https://registry.npmmirror.com/'
})
