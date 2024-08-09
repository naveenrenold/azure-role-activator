import { contextBridge, ipcRenderer } from 'electron'
console.log("preload")

contextBridge.exposeInMainWorld('electronAPI', {
  getToken: (clientId : string, tenantId : string) => ipcRenderer.invoke('getToken', clientId, tenantId)  
})