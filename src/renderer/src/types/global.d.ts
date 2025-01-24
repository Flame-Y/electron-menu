interface Window {
  electron: { ipcRenderer: any }
  uiko: {
    copyText: (text: string) => void
  }
}
