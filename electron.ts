import { app, BrowserWindow, ipcMain, IpcMainInvokeEvent} from "electron";
import url from 'node:url';
import path from 'node:path';
import { AccountInfo, InteractiveRequest, PublicClientApplication, SilentFlowRequest } from "@azure/msal-node";
import {
  AuthenticationResult,
  AuthorizationUrlRequest,
  Configuration,
  CryptoProvider,
} from "@azure/msal-node";
//import { AuthProvider, AuthProviderCallback, Client } from "@microsoft/microsoft-graph-client";
import axios from "axios";
import { apiResponse, PIMRoles, scheduleInfo} from './src/interface';
import { v4 as uuidv4 } from 'uuid';

////Constants declare
var win : BrowserWindow;
const graphScopes = ["https://graph.microsoft.com/RoleManagement.ReadWrite.Directory"];
const armScopes = ["https://management.azure.com/user_impersonation"];
const redirectUri = "http://localhost:3000/table";
const cryptoProvider = new CryptoProvider();
const pkceCodes = {
  challengeMethod: "S256",
  verifier: "",
  challenge: ""
}
let graphAccessToken = '';
let armAccessToken = '';

////Main event
async function getEligibleRolesAsync(event : IpcMainInvokeEvent, clientId : string, tenantId : string, subscription? : string ) : Promise<void>
  {    
    //log and create objects
    //console.log(`IPC call from react renderer service: ${event.processId} ;args 1: ${clientId} ;args 2: ${tenantId}`);
    const MSAL_CONFIG : Configuration = {
      auth: {
        clientId: clientId,
        authority: `https://login.microsoftonline.com/${tenantId}`
      }
    };
    const pca = new PublicClientApplication(MSAL_CONFIG);

    //get token
    const authResponse = await getTokenInteractive(armScopes, pca);    
    armAccessToken = authResponse.accessToken;
    console.log("\nInteractive token: \n" + armAccessToken)

    var silentflowRequest : SilentFlowRequest =  {
      account : authResponse.account as AccountInfo,
      scopes : graphScopes
   };
    const graphTokenResponse = await pca.acquireTokenSilent(silentflowRequest);
    graphAccessToken = graphTokenResponse.accessToken;
    console.log("\nSilentFlow token:\n " + graphTokenResponse.accessToken)
    //create graph client
    // var client = await getGraphClient(authResponse.accessToken);
    // let roleAssignmentScheduleRequestsapi = await client.api('https://graph.microsoft.com/v1.0/roleManagement/directory/roleEligibilitySchedules').get();    
    let pimRoles : PIMRoles[] = []
    
    // graph api call
    var response = await getGraphRoles();
    if(response.isSuccess)
    {
      console.log('\nGraph api succeeded\n');
      console.log(response.pimRoles);
      pimRoles = pimRoles.concat(response.pimRoles);
    }
    //ARM api call
    if(subscription != null)
    {
      response = await getArmRoles(subscription);      
      if(response.isSuccess)
      {
        console.log('\nArm api succeeded\n');
        console.log(response.pimRoles);
        pimRoles = pimRoles.concat(response.pimRoles);
      }
    }
    console.log('\nPIMRoles Output:\n') 
    console.log(pimRoles)              
    win.webContents.send('getPimRoles', pimRoles);       
  };

  async function getArmRoles(subscription : string) : Promise<apiResponse>
  {
    var apiResponse : apiResponse = {
      isSuccess : false,
      pimRoles : []
    }
    await axios.get<any>(`https://management.azure.com/subscriptions/${subscription}/providers/Microsoft.Authorization/roleEligibilityScheduleInstances?api-version=2020-10-01&$filter=asTarget()`, {
      headers : {
        Authorization : `Bearer ${armAccessToken}`
      }
    }).then((e) => {
      //console.log(e.data.value)
      let result : PIMRoles[] = e.data.value.map(
        (role : any) : PIMRoles =>  {
          return {
            roleDefinition : {
              displayName : role.properties.expandedProperties.roleDefinition.displayName,
              id : role.properties.roleDefinitionId
            },                                
          scope : role.properties.scope,
          roleEligibilityScheduleId : role.properties.roleEligibilityScheduleId,
          principalId : role.properties.principalId          
          };
        }
      )      
      //console.log(result);
      apiResponse = {
        isSuccess : true,
        pimRoles : result
      } 
      //win.webContents.send('getPimRoles', result);
    })    
    .catch((error) => {
      console.log(error)          
    });
    console.log('\nARM api output:\n') 
    console.log(apiResponse.pimRoles) 
    return apiResponse;
  }

  async function getGraphRoles() : Promise<apiResponse>
  {
    var apiResponse : apiResponse = {
      isSuccess : false,
      pimRoles : []
    }
    await axios.get<roleAssignmentScheduleResponse>('https://graph.microsoft.com/v1.0/roleManagement/directory/roleEligibilitySchedules?$expand=roleDefinition', {
          headers : {
            Authorization : `Bearer ${graphAccessToken}`
          }
    }).then((e) => {
      //console.log(e.data.value)
      apiResponse = {
        isSuccess : true,
        pimRoles : e.data.value
      }      
    })
    .catch((error) => {
      console.log(error)
    });
    console.log('\nGraph api output\n:');
    console.log(apiResponse.pimRoles) 
    return apiResponse;
  }

  async function activateRolesAsync(event : IpcMainInvokeEvent, roles : PIMRoles[]) : Promise<apiResponse>
  {
    var response :apiResponse = {        
      isSuccess : false,
      pimRoles : []
    };
    var armRoles : PIMRoles[] = [];
    var graphRoles : PIMRoles[] = [];
    if(!roles || roles.length == 0)   
    {
       return response;
    }
    roles.forEach(
      (e) =>{
        if(!e.scope)
        {
          graphRoles.push(e);
        }
        else{
          armRoles.push(e);
        }
      }
    )
    // var armRoles = roles.filter((e) => {
    //   return e.scope != null
    // })
    // var graphRoles = roles.filter((e) => {
    //   return e.scope == null
    // })
    
    if(armRoles.length != 0)
    {
      response = await activateArmRoles(armRoles);
    }
    
    if(graphRoles.length != 0)
    {
      var graphresponse = await activateGraphRoles(graphRoles);
      response =  {
        isSuccess : response.isSuccess && graphresponse.isSuccess,
        pimRoles : response.pimRoles.concat(graphresponse.pimRoles)
      }
    }
    return response;    
  }
  
async function activateGraphRoles(roles : PIMRoles[]) : Promise<apiResponse>
{  
  var apiResponse : apiResponse = {
    isSuccess : false,
    pimRoles : []
  }    
  for(let i = 0 ;i < roles.length; i++)
    {
      var request :unifiedRoleAssignmentScheduleRequest = {
        action : "selfActivate",
        principalId : roles[i].principalId,
        roleDefinitionId : roles[i].roleDefinition.id,
        directoryScopeId : '/',
        justification : 'role activate',
        scheduleInfo :  {
          startDateTime : new Date().toISOString(),
          expiration : {
          type : "AfterDuration",
          duration : "PT5M"
          }          
        } 
      }
      await axios.post('https://graph.microsoft.com/v1.0/roleManagement/directory/roleAssignmentScheduleRequests', request, {
          headers : {
            Authorization : `Bearer ${armAccessToken}`,
            "Content-Type" : "application/json"
          }
    }).then(() =>{
      console.log(`Graph Role activation requests succeeded for role id : ${roles[i].roleDefinition.id}`);      
    }
    ).catch((error : any) => {        
     console.log(`Failed :( for Graph role id : ${roles[i].roleDefinition.id} with status code ${error.statusCode} and message: ${error.message} and api error : ${error}`);
     apiResponse.pimRoles.push(roles[i]);
     apiResponse.isSuccess = false;
    });        
  }
  return apiResponse;
}

async function activateArmRoles(roles : PIMRoles[]) : Promise<apiResponse>
{    
  var subcription = roles[0].scope?.slice(15)
  var apiResponse : apiResponse = {
    isSuccess : false,
    pimRoles : []
  }    
  for(let i = 0 ;i < roles.length; i++)
    {
      // var request  = {
      //   action : "selfActivate",
      //   principalId : roles[i].principalId,
      //   roleDefinitionId : roles[i].roleDefinition.id,
      //   directoryScopeId : '/',
      //   justification : 'role activate',
      //   scheduleInfo :  {
      //     startDateTime : new Date().toISOString(),
      //     expiration : {
      //     type : "AfterDuration",
      //     duration : "PT5M"
      //     }          
      //   } 
      // }

    var request = { 
        properties: { 
        principalId : roles[i].principalId, 
        roleDefinitionId : roles[i].roleDefinition.id, 
        requestType : "SelfActivate", 
        linkedRoleEligibilityScheduleId : roles[i].roleEligibilityScheduleId, 
        scheduleInfo : { 
            startDateTime: new Date().toISOString(), 
              expiration: { 
                 type: "AfterDuration", 
                 endDateTime : null, 
                 duration : "PT5M" 
            } 
        },
        justification : "activate for test"
      }	
      }

      await axios.post(`https://management.azure.com/providers/Microsoft.Subscription/subscriptions/${subcription}/providers/Microsoft.Authorization/roleAssignmentScheduleRequests/${uuidv4()}?api-version=2020-10-01`, request, {
          headers : {
            Authorization : `Bearer ${armAccessToken}`,
            "Content-Type" : "application/json"
          }
    }).then(() =>{
      console.log(`ARM Role activation requests succeeded for role id : ${roles[i].roleDefinition.id}`);      
    }
    ).catch((error : any) => {        
     console.log(`Failed :( for ARM role id : ${roles[i].roleDefinition.id} with status code ${error.statusCode} and message: ${error.message} and api error : ${error}`);
     apiResponse.pimRoles.push(roles[i]);
     apiResponse.isSuccess = false;
    });        
  }
  return apiResponse;
}
  // async function activateRolesAsync(event : IpcMainInvokeEvent, roles : PIMRoles[]) : Promise<boolean>
  // {    
  //   for(let i = 0 ;i < roles.length; i++)
  //   {
  //     var request :unifiedRoleAssignmentScheduleRequest = {
  //       action : "selfActivate",
  //       principalId : roles[0].principalId,
  //       roleDefinitionId : roles[0].roleDefinition.id,
  //       directoryScopeId : '/',
  //       justification : 'role activate',
  //       scheduleInfo :  {
  //         startDateTime : new Date().toISOString(),
  //         expiration : {
  //         type : "AfterDuration",
  //         duration : "PT5M"
  //         }          
  //       } 
  //     }
  //     await axios.post('https://graph.microsoft.com/v1.0/roleManagement/directory/roleAssignmentScheduleRequests', request, {
  //         headers : {
  //           Authorization : `Bearer ${graphAccessToken}`,
  //           "Content-Type" : "application/json"
  //         }
  //   }).then(() =>{
  //     console.log(`Role activation requests succeeded for role id : ${roles[i].roleDefinition.id}`);        
  //   }
  //   ).catch((error : any) => {        
  //    console.log(`Failed :( for role id : ${roles[i].roleDefinition.id} with status code ${error.statusCode} and message: ${error.message} and api error : ${error}`);
  //    return false;
  //   });    
  // }
  // return true;
  // }
   
////functions 
//Create window
const createWindow = async() => {
  win = new BrowserWindow({
   width: 800,
   height: 600,
   webPreferences: {
     webSecurity: false,
     preload: path.join(__dirname, 'preload.js')  
 }
 }
 );
 win.loadURL(app.isPackaged
   ? url.format({
       pathname: path.join(__dirname, "index.html"),  //Load home page from localhost or dist
       protocol: "file:",
       slashes: true,
     })
   : "http://localhost:3000");     
};

async function listenForAuthCodeAsync(window:BrowserWindow, navigateUrl:string) : Promise<string | null> {
  window.loadURL(navigateUrl);
  return new Promise((resolve,reject)=>{
      window.webContents.on('will-redirect', (event, responseUrl) =>{
          try{              
              const parsedUrl = new URL(responseUrl);
              const authCode = parsedUrl.searchParams.get('code');
              resolve(authCode);
          }catch(err){
              reject(err);
          }
      })
  })
} 

async function getTokenInteractive(scopes : string[], pca : PublicClientApplication) : Promise<AuthenticationResult> {
  const { verifier, challenge } = await cryptoProvider.generatePkceCodes();
  pkceCodes.verifier = verifier;
  pkceCodes.challenge = challenge;

  const authCodeUrlParams: AuthorizationUrlRequest = {
    redirectUri: redirectUri,
    scopes : scopes,
    codeChallenge : pkceCodes.challenge,
    codeChallengeMethod : pkceCodes.challengeMethod    
  };
  const authCodeUrl = await pca.getAuthCodeUrl(authCodeUrlParams);
  const authCode = await listenForAuthCodeAsync(win, authCodeUrl);  
  

  const authResponse =await pca.acquireTokenByCode({
    redirectUri: redirectUri,
    scopes: scopes,
    code: authCode ?? "",
    codeVerifier: pkceCodes.verifier
});
 return authResponse;
//   var account = (await pca.getAllAccounts())[0];
//   console.log('account'+account.homeAccountId);
//   const authResponse = await pca.acquireTokenSilent({    
//     scopes: scopes,
//     account: account 
// }).then((accessTokenResponse) => {
//   console.log('Silent token');
//   return accessTokenResponse;  
// }).catch( async (error) => {
//   console.log(error);
//   console.log('Interactive token');
//   const authResponse =await pca.acquireTokenByCode({
//     redirectUri: redirectUri,
//     scopes: scopes,
//     code: authCode ?? "",
//     codeVerifier: pkceCodes.verifier
// });
//  return authResponse;
// }
// )
// return authResponse;
}



// async function getGraphClient(accessToken : string)
// {   
//   return Client.init(
//     {
//       authProvider: (done : AuthProviderCallback) => {
//         done(null, accessToken);
//     }
//     }
//     );
// }

////Events

//App start

app.whenReady().then(() => {
  ipcMain.on("getEligibleRoles", async (event : IpcMainInvokeEvent , clientId, tenantId, subscription) => { await getEligibleRolesAsync(event ,clientId, tenantId, subscription);})     
  ipcMain.on("activateRoles", async (event : IpcMainInvokeEvent , roles : PIMRoles[]) => { await activateRolesAsync(event ,roles);})     
   createWindow();  
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();      
    }
  });
});

//App closed
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

 export interface unifiedRoleAssignmentScheduleRequest{
  action : string,
  customData? : string,
  principalId : string,
  roleDefinitionId : string,
  directoryScopeId : string,
  appScopeId? : string,
  justification : string,
  scheduleInfo? : scheduleInfo,
  ticketInfo? : any
 }

 
 export interface roleAssignmentScheduleResponse{
  value : PIMRoles[];
 }