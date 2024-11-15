import { app, BrowserWindow, ipcMain, IpcMainInvokeEvent} from "electron";
import url from 'node:url';
import path from 'node:path';
import { PublicClientApplication } from "@azure/msal-node";
import {
  AuthenticationResult,
  AuthorizationUrlRequest,
  Configuration,
  CryptoProvider,
} from "@azure/msal-node";
import { AuthProvider, AuthProviderCallback, Client } from "@microsoft/microsoft-graph-client";
import axios from "axios";

////Constants declare
var win : BrowserWindow;
const scopes = ["RoleManagement.ReadWrite.Directory"];
const redirectUri = "http://localhost:3000/table";
const cryptoProvider = new CryptoProvider();
const pkceCodes = {
  challengeMethod: "S256",
  verifier: "",
  challenge: ""
}
let accessToken = '';

////Main event
async function getEligibleRolesAsync(event : IpcMainInvokeEvent, clientId : string, tenantId : string ) : Promise<void>
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
    const authResponse = await getTokenInteractive(scopes, pca);    
    accessToken = authResponse.accessToken;
    console.log(authResponse.accessToken)
    //create graph client
    // var client = await getGraphClient(authResponse.accessToken);
    // let roleAssignmentScheduleRequestsapi = await client.api('https://graph.microsoft.com/v1.0/roleManagement/directory/roleEligibilitySchedules').get();    
	  
    let roleAssignmentScheduleRequests  = (await axios.get<roleAssignmentScheduleResponse>('https://graph.microsoft.com/v1.0/roleManagement/directory/roleEligibilitySchedules?$expand=roleDefinition', {
          headers : {
            Authorization : `Bearer ${authResponse.accessToken}`
          }
    })).data.value;    
    console.log(roleAssignmentScheduleRequests);        
    var graphData = roleAssignmentScheduleRequests;

    var request :unifiedRoleAssignmentScheduleRequest = {
      action : "selfActivate",
      principalId : graphData[0].principalId,
      roleDefinitionId : graphData[0].roleDefinition.id,
      directoryScopeId : '/',
      justification : 'role activate',
      scheduleInfo : graphData[0].scheduleInfo
    }
    
    let roleActivationRequests = await axios.post('https://graph.microsoft.com/v1.0/roleManagement/directory/roleAssignmentScheduleRequests', request, {
          headers : {
            Authorization : `Bearer ${authResponse.accessToken}`,
            "Content-Type" : "application/json"
          }
    }).then(() =>{
      console.log('Role activation requests succeeded : ');      
    }
    ).catch((error : any) => {        
     console.log(`Failed :( with status code ${error.statusCode} and message: ${error.message} and api error : ${error}`);
    });

    // let role: PIMRoles[] = [
    // { displayName: 'admin', roleId: 'Contributor'}, ];
    //console.log('Get Eligible roles api finished :)')   
    win.webContents.send('getPimRoles', graphData);
  };
  
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



async function getGraphClient(accessToken : string)
{   
  return Client.init(
    {
      authProvider: (done : AuthProviderCallback) => {
        done(null, accessToken);
    }
    }
    );
}

////Events

//App start

app.whenReady().then(() => {
  ipcMain.on("getEligibleRoles", async (event : IpcMainInvokeEvent , clientId, tenantId) => { await getEligibleRolesAsync(event ,clientId, tenantId);})     
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
  scheduleInfo : any,
  ticketInfo? : any
 }

 export interface requestSchedule{
  expiration? : expirationPattern,
  recurrence? : any,
  startDateTime? : any
 }

 export interface expirationPattern{
  duration? : string,
  endDateTime? : any,
  type? : string
 }
 export interface roleDefinition{
  displayName : string,
  id : string
 }
 export interface PIMRoles{
  roleDefinition : roleDefinition,
  scheduleInfo : any,
  principalId : string
 }
 export interface roleAssignmentScheduleResponse{
  value : PIMRoles[];
 }

 