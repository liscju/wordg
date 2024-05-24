const {ipcRenderer, contextBridge} = require('electron');

contextBridge.exposeInMainWorld('wordg', {
  openDialog() {
    ipcRenderer.send('open-file-dialog');
  },
  onFileOpened(callback) {
    ipcRenderer.on('file-opened', (_, path, content) => {
      callback(path, content);
    });
  },
  openFile(path) {
    ipcRenderer.send('open-file', path);
  },
  loadSettings() {
    ipcRenderer.send('load-settings');
  },
  onSettingsLoaded(callback) {
    ipcRenderer.on('settings-loaded', (_, settings) => {
      callback(settings);
    });
  },
  storeSettings(settings) {
    ipcRenderer.send('store-settings', settings);
  },
  onFileReadError(callback) {
    ipcRenderer.on('file-read-error', (_, path) => {
      callback(path);
    })
  },
  closeApplication() {
    ipcRenderer.send('close-application');
  }
});
