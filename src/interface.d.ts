export interface IElectronAPI{
    getToken : (clientId : string , tenantId : string) => Promise<void>
}

declare global{
    interface Window{
        electronAPI : IElectronAPI
    }
}a