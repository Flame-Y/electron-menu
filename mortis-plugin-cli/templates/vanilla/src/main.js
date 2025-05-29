document.addEventListener('DOMContentLoaded', () => {
  const sendButton = document.getElementById('sendButton')
  sendButton.addEventListener('click', () => {
    window.electron.ipcRenderer.send('show-notification', {
      title: 'Hello Mortis',
      body: `Hello Mortis`
    })
  })
})
