export interface IElectronAPI{
    getEligibleRoles : (clientId : string , tenantId : string) => Promise<void>
}

declare global{
    interface Window{
        electronAPI : IElectronAPI
    }
}a