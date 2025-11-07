/*
SPDX-License-Identifier: GPL-2.0-only
*/

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('yunoRecorder', {
  getSources: () => ipcRenderer.invoke('desktop:getSources'),
  selectSourceMenu: () => ipcRenderer.invoke('desktop:selectSourceMenu'),
  showSaveDialog: (defaultName) => ipcRenderer.invoke('dialog:saveFile', defaultName),
  saveFile: (path, data) => ipcRenderer.send('file:save', path, data),
  openURL: (url) => ipcRenderer.invoke('yunoOpenURL', url)
});
