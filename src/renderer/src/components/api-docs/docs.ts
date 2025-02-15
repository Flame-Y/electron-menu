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
  }
]
