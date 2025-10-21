const { app, BrowserWindow, ipcMain, dialog, Menu, desktopCapturer } = require('electron');
const path = require('node:path');
const fs = require('fs');

if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = () => {
  // Cria a janela do navegador
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  mainWindow.webContents.openDevTools();
  mainWindow.webContents.session.setPermissionRequestHandler((webContents, permission, callback) => {
  if (permission === 'media') {
      callback(true); // ✅ permite captura de mídia
    } else {
      callback(false);
    }
  });
};

// Permitir captura de áudio do sistema no Chromium interno
app.commandLine.appendSwitch('enable-features', 'WebRTCPipeWireCapturer');
app.commandLine.appendSwitch('enable-webrtc-pipewire-capturer');

// Envia as fontes de vídeo para o renderer
ipcMain.handle('desktop:getSources', async () => {
  const sources = await desktopCapturer.getSources({ types: ['window', 'screen'] });
  return sources;
});

// Mostra a janela de salvar arquivo
ipcMain.handle('dialog:saveFile', async (event, defaultName) => {
  const { filePath } = await dialog.showSaveDialog({
    buttonLabel: 'Salvar vídeo',
    defaultPath: defaultName,
    filters: [
      { name: 'WebM Video', extensions: ['webm'] },
      { name: 'MP4 Video', extensions: ['mp4'] }
    ]
  });
  return filePath;
});

// Salva o arquivo recebido no render
ipcMain.on('file:save', (__, filePath, data) => {
  fs.writeFile(filePath, Buffer.from(data), () => console.log('Vídeo salvo com sucesso!')); 
});

ipcMain.handle('desktop:selectSourceMenu', async () => {
  const sources = await desktopCapturer.getSources({ types:['window', 'screen'] });

  return new Promise((resolve) => {
    const menu = Menu.buildFromTemplate(
      sources.map((source) => ({
        label: source.name,
        click: () => resolve(source)
      }))
    );
    menu.popup();
  });
});

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

