const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getVideoSources: () => ipcRenderer.invoke('desktop:getSources'),
  showSaveDialog: (defaultName) => ipcRenderer.invoke('dialog:saveFile', defaultName),
  selectSourceMenu: () => ipcRenderer.invoke('desktop:selectSourceMenu'),
  saveFile: (filePath, data) => ipcRenderer.send('file:save', filePath, data)
});
