"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
console.log("preload");
electron_1.contextBridge.exposeInMainWorld('electronAPI', {
    getToken: (clientId, tenantId) => electron_1.ipcRenderer.invoke('getToken', clientId, tenantId)
});
