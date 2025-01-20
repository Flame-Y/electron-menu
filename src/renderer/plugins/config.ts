export const pluginConfig = [
  {
    id: 'demo-plugin',
    name: '示例插件',
    pluginType: 'ui',
    indexPath: './plugins/demo-plugin/index.html',
    preload: './plugins/demo-plugin/preload.js'
  },
  {
    id: 'screenshot',
    name: '截图',
    pluginType: 'system',
    indexPath: './plugins/screenshot/index.html',
    preload: './plugins/screenshot/preload.js'
  }
]
