const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getSources: () => ipcRenderer.invoke('desktop:getSources'),
  selectSourceMenu: () => ipcRenderer.invoke('desktop:selectSourceMenu'),
  showSaveDialog: (defaultName) => ipcRenderer.invoke('dialog:saveFile', defaultName),
  saveFile: (path, data) => ipcRenderer.send('file:save', path, data)
});
