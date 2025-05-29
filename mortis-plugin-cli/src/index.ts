#!/usr/bin/env node

import chalk from 'chalk'
import inquirer from 'inquirer'
import { createSpinner } from 'nanospinner'
import fs from 'fs-extra'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function main() {
  console.log(chalk.blue('欢迎使用 Mortis Plugin CLI! 🎉\n'))

  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'framework',
      message: '请选择插件开发框架:',
      choices: [
        { name: 'Vue', value: 'vue' },
        { name: 'React', value: 'react' },
        { name: 'Vanilla', value: 'vanilla' }
      ]
    },
    {
      type: 'input',
      name: 'name',
      message: '请输入插件名称:',
      default: 'my-plugin',
      validate: (input) => {
        if (!input) return '插件名称不能为空'
        if (!/^[a-z0-9-]+$/.test(input)) return '插件名称只能包含小写字母、数字和连字符'
        return true
      }
    },
    {
      type: 'input',
      name: 'displayName',
      message: '请输入插件显示名称:',
      default: '我的插件',
      validate: (input) => (input ? true : '显示名称不能为空')
    },
    {
      type: 'input',
      name: 'author',
      message: '请输入作者名称:',
      default: 'Mortis-Cli',
      validate: (input) => (input ? true : '作者名称不能为空')
    },
    {
      type: 'input',
      name: 'description',
      message: '请输入插件描述:',
      default: '这是一个 Mortis 插件'
    }
  ])

  const spinner = createSpinner('正在创建插件项目...').start()

  try {
    // 创建项目目录
    const projectPath = path.join(process.cwd(), '..', 'plugins', answers.name)
    await fs.ensureDir(projectPath)

    // 生成 package.json
    const packageJson = {
      name: answers.name,
      pluginName: answers.displayName,
      version: '1.0.0',
      description: answers.description,
      author: answers.author,
      main: 'index.html',
      preload: 'preload.js',
      pluginType: 'ui',
      features: [
        {
          code: answers.name,
          explain: answers.description,
          cmds: [answers.name]
        }
      ]
    }

    await fs.writeJSON(path.join(projectPath, 'package.json'), packageJson, { spaces: 2 })

    // 根据框架选择复制模板文件
    const templatePath = path.join(__dirname, '../templates', answers.framework)
    await fs.copy(templatePath, projectPath)

    spinner.success({ text: chalk.green('插件项目创建成功! 🎉') })

    console.log('\n运行以下命令开始开发:\n')
    console.log(chalk.cyan(`  cd ${answers.name}`))
    console.log(chalk.cyan('  npm install'))
    console.log(chalk.cyan('  npm run dev\n'))
  } catch (error) {
    spinner.error({ text: chalk.red('创建失败: ' + error.message) })
    process.exit(1)
  }
}

// 处理未捕获的异常
process.on('uncaughtException', (error) => {
  if (error.name === 'ExitPromptError') {
    console.log('\n' + chalk.yellow('已取消创建插件'))
    process.exit(0)
  }
  console.error(chalk.red('发生错误:'), error)
  process.exit(1)
})

main().catch((error) => {
  if (error.name === 'ExitPromptError') {
    console.log('\n' + chalk.yellow('已取消创建插件'))
    process.exit(0)
  }
  console.error(chalk.red('发生错误:'), error)
  process.exit(1)
})
