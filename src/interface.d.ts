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
export interface requestSchedule{
    expiration? : expirationPattern,
    recurrence? : any,
    startDateTime? : any
   }
  
   export interface expirationPattern{
    duration? : any,
    endDateTime? : any,
    type? : string
   }
   export interface roleDefinition{
    displayName : string,
    id : string,    
   }
   export interface PIMRoles{
    roleDefinition : roleDefinition,
    scheduleInfo? : scheduleInfo,
    principalId : string,    
    checked? : boolean = false,
    roleEligibilityScheduleId? : string,
    scope? : string
   }

   export interface scheduleInfo {
    startDateTime : string,
      recurrence? : any,
      expiration : expirationPattern
   }

   export interface armRoles{
    displayName : string,
    roleEligibilityScheduleId : string,
    scope : string,
    roleDefinitionId : string,
    principalId : string
   }