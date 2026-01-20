const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    exitGame: () => ipcRenderer.send('exit-game'),
    toggleFullscreen: () => ipcRenderer.invoke('toggle-fullscreen'),
    isFullscreen: () => ipcRenderer.invoke('is-fullscreen')
});
