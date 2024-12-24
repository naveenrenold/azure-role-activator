import { app, BrowserWindow, ipcMain, IpcMainInvokeEvent, net, protocol} from "electron";
import url from 'node:url';
import path from 'node:path';
import { AccountInfo, PublicClientApplication, SilentFlowRequest } from "@azure/msal-node";
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
    //create objects    
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
      apiResponse = {
        isSuccess : true,
        pimRoles : result
      }       
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

  async function activateRolesAsync(event : IpcMainInvokeEvent, roles : PIMRoles[]) : Promise<void>
  {        
    var response :apiResponse = {        
      isSuccess : true,
      pimRoles : []
    };
    var armRoles : PIMRoles[] = [];
    var graphRoles : PIMRoles[] = [];
    if(!roles || roles.length === 0)   
    {
      win.webContents.send('getPIMActivationResponse', response);
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
    
    if(armRoles.length !== 0)
    {
      response = await activateArmRoles(armRoles);
    }
    
    if(graphRoles.length !== 0)
    {
      var graphresponse = await activateGraphRoles(graphRoles);
      response =  {
        isSuccess : response.isSuccess && graphresponse.isSuccess,
        pimRoles : response.pimRoles.concat(graphresponse.pimRoles)
      }
    }
    console.log('Sending to table: ' + response.isSuccess + response.pimRoles.length)
    win.webContents.send('getPIMActivationResponse', response);
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
            Authorization : `Bearer ${graphAccessToken}`,
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
  if(apiResponse.pimRoles.length === 0)
    {
      apiResponse.isSuccess = true;
    }
    console.log(`Checkpoint graph: ${apiResponse.isSuccess}`)
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
      await axios.put(`https://management.azure.com/providers/Microsoft.Subscription/subscriptions/${subcription}/providers/Microsoft.Authorization/roleAssignmentScheduleRequests/${uuidv4()}?api-version=2020-10-01`, request, {
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
    });        
  }
  if(apiResponse.pimRoles.length === 0)
  {
    apiResponse.isSuccess = true;    
  }
  console.log(`Checkpoint armapi: ${apiResponse.isSuccess}`)
  return apiResponse;
}  
   
//functions 
//Create window
const createWindow = async() => {
  win = new BrowserWindow({
   width: 800,
   height: 600,
   webPreferences: {
     webSecurity: true,
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
            win.loadURL(app.isPackaged
              ? url.format({
                  pathname: path.join(__dirname, "index.html"),  //Load home page from localhost or dist
                  protocol: "file:",
                  hash: 'table',
                  slashes: true,
                })
              : "http://localhost:3000/table"); 
                                      
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
//Before app ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'http', privileges: { bypassCSP: true, stream: true, supportFetchAPI: true, standard: true,
    secure: true } }
])
//App ready
app.whenReady().then(() => {
  ipcMain.on("getEligibleRoles", async (event : IpcMainInvokeEvent , clientId, tenantId, subscription) => { await getEligibleRolesAsync(event ,clientId, tenantId, subscription);})     
  ipcMain.on("activateRoles", async (event : IpcMainInvokeEvent , roles : PIMRoles[]) => { await activateRolesAsync(event ,roles);})     
   createWindow();  
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();      
    }  
  });
  console.log("\nCreating le protocol");
  protocol.handle("http", (req) => {
    console.log("\ninside protocol handler\n");
    if(!app.isPackaged)
    {              
      return net.fetch(req, {bypassCustomProtocolHandlers : true}); ;
    }
    else{    
    var urlString  = req.url.slice(8).split("/");
    var urlOutput = url.format({
      pathname: path.join(__dirname, "index.html"),  //Load home page from localhost or dist
      protocol: "file:",
      hash: urlString[1],
      slashes: true,
    });
    console.log("\nURL output :" + urlOutput);
    return net.fetch(urlOutput, {bypassCustomProtocolHandlers : true});
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