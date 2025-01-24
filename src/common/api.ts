import { clipboard } from 'electron'

class API {
  public copyText(text: string) {
    clipboard.writeText(text)
    return { success: true } // 返回操作结果
  }
}
export const api = new API()
