export const plugins = [
  {
    id: 'screenshot',
    name: '截图',
    description: '截图',
    pluginType: 'ui',
    downloads: 1234,
    author: 'Mortis team',
    category: '工具',
    from: 'offical',
    indexPath: 'src/plugins/screenshot/index.js',
    preload: 'src/plugins/screenshot/preload.js',
    icon: '📸'
  },
  {
    id: 'ocr',
    name: 'OCR',
    description: 'OCR识别',
    pluginType: 'ui',
    downloads: 114,
    author: 'Mortis team',
    category: '效率',
    from: 'offical',
    indexPath: 'src/plugins/ocr/index.js',
    preload: 'src/plugins/ocr/preload.js',
    icon: '🔍'
  },
  {
    id: 'translate',
    name: '翻译',
    description: '翻译',
    pluginType: 'ui',
    downloads: 514,
    author: 'Mortis team',
    category: '工具',
    from: 'offical',
    indexPath: 'src/plugins/translate/index.js',
    preload: 'src/plugins/translate/preload.js',
    icon: '🇬🇧'
  },
  {
    id: 'color-picker',
    name: '取色器',
    description: '取色器',
    pluginType: 'ui',
    downloads: 114,
    author: 'pickMan',
    category: '工具',
    from: 'npm',
    indexPath: 'src/plugins/color-picker/index.js',
    preload: 'src/plugins/color-picker/preload.js',
    icon: '🎨',
    url: 'H:\\Vue project\\design\\electron-menu\\plugins\\color-picker\\dist'
  }
]
