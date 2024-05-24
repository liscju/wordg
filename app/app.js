// main.js

const { app, BrowserWindow, screen, dialog, ipcMain} = require('electron');
const path = require('path');
const fs = require('fs');

const settingsPath = path.join(app.getPath('userData'), 'Settings.json');


function createWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  const mainWindow = new BrowserWindow({
    width: 600,
    height: 400,
    x: width - 600, // Set the x position to be the width of the screen minus the window width
    y: height - 400, // Set the y position to be the height of the screen minus the window height
    webPreferences: {
      nodeIntegration: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'main.html'));

  ipcMain.on('open-file-dialog', () => {
    dialog
      .showOpenDialog({properties: ['openFile']})
      .then((result) => {
        if (!result.canceled) {
          fs.readFile(result.filePaths[0], 'utf8', (err, data) => {
            if (err) {
              dialog.showErrorBox('Error', 'Unable to open file:' + err.message);
              mainWindow.webContents.send('file-read-error', path);
              return;
            }
            mainWindow.webContents.send('file-opened', result.filePaths[0], data);
          })
        }
      })
  });

  ipcMain.on('load-settings', (event) => {
    fs.readFile(settingsPath, 'utf8', (err, data) => {
      if (err) {
        dialog.showErrorBox('Error', 'Unable to load settings:' + err.message);
        return;
      }
      try {
        json = JSON.parse(data);
        event.reply('settings-loaded', json);
      } catch (error) {
        dialog.showErrorBox('Error', 'Unable to parse settings:' + error.message);
      }
    });
  });

  ipcMain.on('store-settings', (event, settingsData) => {
    fs.writeFile(settingsPath, JSON.stringify(settingsData, null, 2), 'utf8', (err) => {
      if (err) {
        dialog.showErrorBox('Error', 'Unable to store settings:' + err.message);
        return;
      }
    });
  });

  ipcMain.on('open-file', (event, path) => {
    fs.readFile(path, 'utf8', (err, data) => {
      if (err) {
        dialog.showErrorBox('Error', 'Unable to open file:' + err.message);
        mainWindow.webContents.send('file-read-error', path);
        return;
      }
      mainWindow.webContents.send('file-opened', path, data);
    })
  });

  ipcMain.on('close-application', () => {
    app.quit();
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
