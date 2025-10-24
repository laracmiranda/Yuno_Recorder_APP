const { app, BrowserWindow, ipcMain, dialog, Menu, desktopCapturer } = require('electron');
const path = require('node:path');
const fs = require('fs');

if (require('electron-squirrel-startup')) app.quit();

// Habilita recursos necessários para captura de áudio
app.commandLine.appendSwitch('enable-features', 'AudioServiceSandbox');
app.commandLine.appendSwitch('use-fake-ui-for-media-stream');

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    resizable: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: true,
      allowRunningInsecureContent: false,
      media: true,
    },
  });

  mainWindow.setMenuBarVisibility(false); // Remove o menu
  mainWindow.loadFile(path.join(__dirname, 'index.html'));
};

app.on('web-contents-created', (_, contents) => {
  contents.session.setPermissionRequestHandler((webContents, permission, callback) => {
    if (permission === 'media' || permission === 'audioCapture' || permission === 'videoCapture') {
      callback(true); // Permite acesso
    } else {
      callback(false);
    }
  });
});

// Lista todas as telas e janelas disponíveis
ipcMain.handle('desktop:getSources', async () => {
  const sources = await desktopCapturer.getSources({
    types: ['screen', 'window'],
    fetchWindowIcons: true,
    thumbnailSize: { width: 0, height: 0 }
  });
  return sources;
});

// Exibe menu de seleção de tela
ipcMain.handle('desktop:selectSourceMenu', async () => {
  const sources = await desktopCapturer.getSources({
    types: ['screen', 'window'],
    fetchWindowIcons: true,
    thumbnailSize: { width: 0, height: 0 }
  });

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

// Diálogo de salvar arquivo
ipcMain.handle('dialog:saveFile', async (_, defaultName) => {
  const { filePath } = await dialog.showSaveDialog({
    buttonLabel: 'Salvar vídeo',
    defaultPath: defaultName,
    filters: [{ name: 'Webm Video', extensions: ['webm'] }]
  });
  return filePath;
});

// Salva o vídeo no disco
ipcMain.on('file:save', (_, filePath, data) => {
  fs.writeFile(filePath, Buffer.from(data), () => console.log('🎬 Vídeo salvo com sucesso!'));
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
