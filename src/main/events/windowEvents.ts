import { BrowserWindow, ipcMain } from 'electron'

export function setupWindowEvents(win: BrowserWindow): void {
  const operation = {
    minimize: () => {
      win.focus()
      win.minimize()
    },
    maximize: () => {
      win.isMaximized() ? win.unmaximize() : win.maximize()
    },
    close: () => {
      win.close()
    }
  }

  ipcMain.on('detach:service', async (_, arg: { type: string }) => {
    operation[arg.type]()
  })
}
