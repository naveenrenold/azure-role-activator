export interface IElectronAPI{
    getEligibleRoles : (clientId : string , tenantId : string) => Promise<PIMRoles[]>
}

declare global{
    interface Window{
        electronAPI : IElectronAPI
    }
}
export interface PIMRoles{
 roleName : string;
 roleId : string;
}