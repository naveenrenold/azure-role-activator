export interface IElectronAPI{
    getEligibleRoles : (clientId : string , tenantId : string, subscription? : string) => Promise<PIMRoles[]>
    getPIMRoles : (callback : any) => any
    activateRoles : (roles : PIMRoles[]) => boolean
    getPIMActivationResponse : (callback : any) => any
    async readCache : () => Promise<responseObject<cacheObject>>,
    async writeCache : (cache : cacheObject) => Promise<boolean>
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
    scope? : string,
    isARMRole? : string = false
   }

   export interface scheduleInfo {
    startDateTime : string,
      recurrence? : any,
      expiration : expirationPattern
   }

   export interface apiResponse{
    isSuccess : boolean;
    pimRoles : PIMRoles[];
   }

   export interface cacheObject extends responseObject{
    clientId : string = "",
    tenantId : string = "",
    subscription: string = "",
    checkedRoleIds? : string[]
   }

   export interface responseObject<T>{
    isSuccess : boolean = false,
    value? : T
   }