type API = {
  name: string
  description: string
  params?: any[]
  returns?: string
}
export const api: API[] = [
  {
    name: 'copyText',
    description: '将文本复制到剪贴板',
    params: [
      {
        name: 'text',
        type: 'string',
        description: '要复制的文本内容'
      }
    ],
    returns: '{ success: boolean }'
  },
  {
    name: 'getClipboardImage',
    description: '获取剪贴板中的图片',
    params: [],
    returns: 'string | null // 返回图片的 Data URL 或 null'
  },
  {
    name: 'exitPlugin',
    description: '退出插件',
    params: [],
    returns: 'null'
  },
  {
    name: 'notify',
    description: '通知',
    params: [
      {
        name: 'title',
        type: 'string',
        description: '通知标题'
      },
      {
        name: 'message',
        type: 'string',
        description: '通知内容'
      },
      {
        name: 'icon',
        type: 'string',
        description: '通知图标'
      }
    ],
    returns: 'null'
  }
]
