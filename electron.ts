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
const redirectUri = "http://localhost:3000/";
const cryptoProvider = new CryptoProvider();
const pkceCodes = {
  challengeMethod: "S256",
  verifier: "",
  challenge: ""
}
let accessToken = '';

////Main event
async function getEligibleRolesAsync(event : IpcMainInvokeEvent, clientId : string, tenantId : string ) : Promise<PIMRoles[]>
  {    
    //log and create objects
    console.log(`IPC call from react renderer service: ${event.processId} ;args 1: ${clientId} ;args 2: ${tenantId}`);
    const MSAL_CONFIG : Configuration = {
      auth: {
        clientId: clientId,
        authority: `https://login.microsoftonline.com/${tenantId}`
      }
    };
    const pca = new PublicClientApplication(MSAL_CONFIG);

    //get token
    const authResponse = await getTokenInteractive(scopes, pca);
    console.log(authResponse)
    accessToken = authResponse.accessToken;
    
    //create graph client
    // var client = await getGraphClient(authResponse.accessToken);
    // let roleAssignmentScheduleRequests = await client.api('https://graph.microsoft.com/v1.0/roleManagement/directory/roleAssignmentScheduleRequests').select('roleDefinitionId').get();
    //.expand('roleDefinitionId')
	  
    let roleAssignmentScheduleRequests = await axios.get('https://graph.microsoft.com/v1.0/roleManagement/directory/roleEligibilitySchedules', {
          headers : {
            Authorization : `Bearer ${authResponse.accessToken}`
          }
    })
    
    let role: PIMRoles[] = [
    { roleName: 'admin', roleId: 'Contributor'}, ];
    console.log('Get Eligible roles api finished :)')   
    return(role);    
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
  ipcMain.handle("getEligibleRoles", async (event : IpcMainInvokeEvent , clientId, tenantId) => { return await getEligibleRolesAsync(event ,clientId, tenantId);})     
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

export interface PIMRoles{
  roleName : string;
  roleId : string;
 }