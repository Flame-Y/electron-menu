interface Window {
  electron: { ipcRenderer: any }
  mortis: {
    copyText: (text: string) => void
    getClipboardImage: () => Promise<string | null>
    exitPlugin: (pluginId: string) => void
  }
}
