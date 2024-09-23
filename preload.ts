import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  getEligibleRoles : (clientId : string, tenantId : string) => ipcRenderer.invoke('getEligibleRoles', clientId, tenantId)  
})