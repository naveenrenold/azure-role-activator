export interface IElectronAPI{
    getEligibleRoles : (clientId : string , tenantId : string) => Promise<PIMRoles[]>
    getPIMRoles : (callback : any) => any
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