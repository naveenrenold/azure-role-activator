import { contextBridge, ipcRenderer } from 'electron'
import { PIMRoles } from './electron'

contextBridge.exposeInMainWorld('electronAPI', {
  getEligibleRoles : (clientId : string, tenantId : string) => ipcRenderer.send('getEligibleRoles', clientId, tenantId),
  getPIMRoles : (callback : any) => ipcRenderer.on('getPimRoles', (event, value) => {callback(value)}),
  activateRoles : (roles : PIMRoles[]) => ipcRenderer.send('activateRoles', roles)
})