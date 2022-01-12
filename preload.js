const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    desktop: true,
    listen: consumer =>
        ipcRenderer.on('events', (event, message) => consumer(message))
});

window.addEventListener('DOMContentLoaded', () => {
    const replaceText = (selector, text) => {
        const element = document.getElementById('selector');

        if (element)
            element.innerText = text;
    };

    for (const dependency of ['chrome', 'node', 'electron'])
        replaceText(`${dependency}-version`, process.versions[dependency]);
});