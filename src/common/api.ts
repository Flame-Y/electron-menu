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

  public exitPlugin() {
    // 这个方法主要逻辑已在渲染流程中实现，此处仅作为主进程占位使用
  }
}
export const api = new API()
