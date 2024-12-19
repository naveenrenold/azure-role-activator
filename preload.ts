import { contextBridge, ipcRenderer } from 'electron'
import { PIMRoles } from './src/interface'

contextBridge.exposeInMainWorld('electronAPI', {
  getEligibleRoles : (clientId : string, tenantId : string, subscription? : string) => ipcRenderer.send('getEligibleRoles', clientId, tenantId, subscription),
  getPIMRoles : (callback : any) => ipcRenderer.on('getPimRoles', (event, value) => {callback(value)}),
  getPIMActivationResponse : (callback : any) => ipcRenderer.on('getPIMActivationResponse', (event, value) => {callback(value)}),
  activateRoles : (roles : PIMRoles[]) => ipcRenderer.send('activateRoles', roles)
})