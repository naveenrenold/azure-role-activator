export interface IElectronAPI{
    getToken : (clientId : string , tenantId : string) => void
}

declare global{
    interface window{
        electronAPI : IElectronAPI
    }
}