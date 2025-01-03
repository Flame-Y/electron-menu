import commonConst from '../../common/utils/commonConst'
import { getAppList } from './win'

let appList: any[] = []

// 初始化应用列表
async function initializeAppList() {
  console.log('初始化搜索...')
  return new Promise<void>((resolve) => {
    if (commonConst.windows()) {
      console.log('Windows 系统，开始加载应用列表...')
      getAppList((apps) => {
        appList = apps
        console.log('应用列表加载完成，找到应用：', apps)
        resolve()
      })
    } else if (commonConst.macOS()) {
      appList = require('./darwin')
      resolve()
    } else if (commonConst.linux()) {
      appList = require('./linux')
      resolve()
    }
  })
}

// 搜索函数
async function searchApps(keyword: string) {
  if (!appList.length) {
    await initializeAppList()
  }

  if (!keyword) return []

  return appList.filter(
    (app) =>
      app.name.toLowerCase().includes(keyword.toLowerCase()) ||
      app.keyWords.some((kw: string) => kw.toLowerCase().includes(keyword.toLowerCase()))
  )
}

// 立即初始化应用列表
initializeAppList().catch((error) => {
  console.error('初始化应用列表失败：', error)
})

export default searchApps
