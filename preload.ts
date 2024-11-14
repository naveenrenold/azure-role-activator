import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  getEligibleRoles : (clientId : string, tenantId : string) => ipcRenderer.send('getEligibleRoles', clientId, tenantId),
  getPIMRoles : (callback : any) => ipcRenderer.on('getPimRoles', (event, value) => {callback(value)})

})