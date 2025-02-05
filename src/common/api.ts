import { clipboard } from 'electron'

class API {
  public copyText(text: string) {
    clipboard.writeText(text)
    return { success: true } // 返回操作结果
  }

  public getClipboardImage() {
    const image = clipboard.readImage()
    if (!image.isEmpty()) {
      return image.toDataURL()
    }
    return null // 添加返回值
  }
}
export const api = new API()
