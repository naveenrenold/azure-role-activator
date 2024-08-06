export interface IElectronAPI{
    getToken()
}

declare global{
    interface Window{
        electronApi : IElectronAPI
    }
}