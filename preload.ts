import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  authCodeFlow: () => ipcRenderer.invoke('getAuthCode')  
})