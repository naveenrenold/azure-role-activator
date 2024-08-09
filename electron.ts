
import { app, BrowserWindow, ipcMain} from "electron";
import url from 'node:url';
import path from 'node:path';
import { PublicClientApplication } from "@azure/msal-node";
import {
  AuthenticationResult,
  AuthorizationUrlRequest,
  Configuration,
  CryptoProvider,
} from "@azure/msal-node";
import { Client } from "@microsoft/microsoft-graph-client";

var win :BrowserWindow;

//App start
app.whenReady().then(() => {
  // createWindow();  
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
      //ipcMain.handle('getToken', (event, args) => {getToken(args['clientId'], args['tenantId'])})      
    }
  });
});

//Create window
const createWindow = async() => {
  win = new BrowserWindow({
   width: 800,
   height: 600,
   webPreferences: {
     webSecurity: false,
     preload: path.join(__dirname, './public/preload.js')  
 }
 }
 );
 //Load home page from localhost or dist
 win.loadURL(app.isPackaged
   ? url.format({
       pathname: path.join(__dirname, "index.html"),
       protocol: "file:",
       slashes: true,
     })
   : "http://localhost:3000");  
   console.log(path.join(__dirname, './public/preload.js'))
 //ipcMain.handle('authCodeFlow',listenForAuthCode)
};

// why used ??
// protocol.handle(
//   'http',
//   (req: Request): Promise<Response> => {
//     const requestUrl = url.parse(req.url, true);
//     return net.fetch(path.normalize(`${__dirname}/${requestUrl.path}`));
//   }
// );

async function listenForAuthCode(events:Electron.IpcMainInvokeEvent, navigateUrl:string) : Promise<string | null> {
    win.loadURL(navigateUrl);
    return new Promise((resolve,reject)=>{
        win.webContents.on('will-redirect', (event, responseUrl) =>{
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
  // constants for testing
  const MSAL_CONFIG: Configuration = {
    auth: {
      clientId: "5ad548fe-569a-465f-a98f-188af25d9b47",
      authority: "https://login.microsoftonline.com/b6281daa-0870-4760-9be1-f6b0cd37bfa7"
    }
  };

  function getToken(clientId :string , tenantId : string)
  {
    console.log('lol '+clientId+'tid: '+tenantId)
  }
  // const scopes= ["User.Read"];
  // const pca = new PublicClientApplication(MSAL_CONFIG);
  // const redirectUri = "http://localhost";
  // const cryptoProvider = new CryptoProvider();
  // const pkceCodes = {
  //   challengeMethod: "S256",
  //   verifier: "",
  //   challenge: "",
  // };
  // async function getTokenInteractive(tokenRequest : string[]) : Promise<AuthenticationResult> {
  //   console.log("before")
  //   const { verifier, challenge } = await cryptoProvider.generatePkceCodes();
  //   console.log("after")
  //   pkceCodes.verifier = verifier;
  //   pkceCodes.challenge = challenge;

  //   const authCodeUrlParams: AuthorizationUrlRequest = {
  //     redirectUri: redirectUri,
  //     scopes: tokenRequest,
  //     codeChallenge: pkceCodes.challenge,
  //     codeChallengeMethod: pkceCodes.challengeMethod,
  //   };
  //   const authCodeUrl = await pca.getAuthCodeUrl(authCodeUrlParams);
    
  
  //   const authCode =await window.api.getAuthCode(authCodeUrl);
  
  //   const authResponse =await pca.acquireTokenByCode({
  //     redirectUri: redirectUri,
  //     scopes: tokenRequest,
  //     code: authCode ?? "",
  //     codeVerifier: pkceCodes.verifier
  // });
  //  return authResponse;
  // }
    
  // const getGraphClient = (accessToken : string) =>{
  // const graphClient = Client.init({
  //     authProvider : (done) =>{
  //         done(null,accessToken)
  //     },
  
  // });
  // return graphClient;
  // };
  // module.exports = getGraphClient;
  


  
  // async function started(){
  //   const authResult = await getTokenInteractive(scopes); 
  //   const graphClient = getGraphClient(authResult.accessToken);  
  //   console.log(authResult.accessToken)
  //   const user = await graphClient.api('/me').get();  
  //   console.log(user)
  //   console.log('done')


//App closed
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
