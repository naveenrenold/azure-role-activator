export interface IElectronAPI{
    getEligibleRoles : (clientId : string , tenantId : string) => Promise<PIMRoles[]>
    getPIMRoles : (callback : any) => any
    activateRoles : (roles : PIMRoles[]) => boolean
}

declare global{
    interface Window{
        electronAPI : IElectronAPI
    }
}
export interface roleDefinition{
    displayName : string,
    id : string
   }
export interface PIMRoles{
    roleDefinition : roleDefinition,
    scheduleInfo? : any,
    principalId? : string,
    checked? : boolean
}