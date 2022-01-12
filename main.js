const { app, BrowserWindow } = require('electron');
const path = require('path');
const supplier = require('./src/config-supplier');

require('electron-reload')(path.resolve(__dirname, 'build'));

const createWindow = async () => {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
        }
    });

    await win.loadFile('index.html');

    // win.webContents.openDevTools();

    (await supplier()).subscribe((config) => {
        win.webContents.send('events', config);
    }, console.log);

    return win;
};

app.whenReady().then(createWindow);

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0)
        createWindow();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});