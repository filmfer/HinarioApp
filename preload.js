const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  selectDirectory: () => ipcRenderer.invoke('select-directory'),
  getSavedDirectory: () => ipcRenderer.invoke('get-saved-directory'),
  searchFiles: (query) => ipcRenderer.invoke('search-files', query),
  getDisplays: () => ipcRenderer.invoke('get-displays'),
  playVideo: (videoPath, displayId) => ipcRenderer.invoke('play-video', videoPath, displayId),
  closePlayer: () => ipcRenderer.send('close-player')
});