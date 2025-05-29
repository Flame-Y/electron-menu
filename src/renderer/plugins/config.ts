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
    pluginType: 'ui',
    indexPath: './plugins/screenshot/index.html',
    preload: './plugins/screenshot/preload.js'
  },
  // {
  //   id: 'ocr',
  //   name: 'OCR',
  //   pluginType: 'system',
  //   indexPath: './plugins/ocr/index.html',
  //   preload: './plugins/ocr/preload.js'
  // }，
  {
    id: 'my-plugin',
    name: '我的插件',
    pluginType: 'ui',
    indexPath: './plugins/my-plugin/index.html',
    preload: './plugins/my-plugin/preload.js'
  }
]
