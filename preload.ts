import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  getToken : (clientId : string, tenantId : string) => ipcRenderer.invoke('getToken', clientId, tenantId)  
})