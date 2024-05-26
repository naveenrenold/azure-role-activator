import {
  AuthenticationResult,
  AuthorizationUrlRequest,
  Configuration,
  CryptoProvider,
} from "@azure/msal-node";
import { app, BrowserWindow, protocol, net } from "electron";
import { PublicClientApplication } from "@azure/msal-node";
import { Client } from "@microsoft/microsoft-graph-client";
import url from 'node:url';
import path from 'node:path';

const MSAL_CONFIG: Configuration = {
  auth: {
    clientId: "5ad548fe-569a-465f-a98f-188af25d9b47",
    authority:
      "https://login.microsoftonline.com/b6281daa-0870-4760-9be1-f6b0cd37bfa7",
  },
};
const scopes= ["User.Read"];
const pca = new PublicClientApplication(MSAL_CONFIG);
const redirectUri = "http://localhost";
const cryptoProvider = new CryptoProvider();
const pkceCodes = {
  challengeMethod: "S256",
  verifier: "",
  challenge: "",
};

interface scopesType{
    scopes: string[]
}

async function getTokenInteractive(authWindow :BrowserWindow, tokenRequest : string[]) : Promise<AuthenticationResult> {
  const { verifier, challenge } = await cryptoProvider.generatePkceCodes();
  pkceCodes.verifier = verifier;
  pkceCodes.challenge = challenge;

  const authCodeUrlParams: AuthorizationUrlRequest = {
    redirectUri: redirectUri,
    scopes: tokenRequest,
    codeChallenge: pkceCodes.challenge,
    codeChallengeMethod: pkceCodes.challengeMethod,
  };
  const authCodeUrl = await pca.getAuthCodeUrl(authCodeUrlParams);
  protocol.handle(
    redirectUri.split(":")[0],
    (req: Request): Promise<Response> => {
      const requestUrl = url.parse(req.url, true);
      return net.fetch(path.normalize(`${__dirname}/${requestUrl.path}`));
    }
  );

  const authCode =await listenForAuthCode(authCodeUrl, authWindow);

  const authResponse =await pca.acquireTokenByCode({
    redirectUri: redirectUri,
    scopes: tokenRequest,
    code: authCode ?? "",
    codeVerifier: pkceCodes.verifier
});
return authResponse;
}

async  function listenForAuthCode(navigateUrl:string , authWindow: BrowserWindow) : Promise<string | null> {
    authWindow.loadURL(navigateUrl);
    return new Promise((resolve,reject)=>{
        authWindow.webContents.on('will-redirect', (event, responseUrl) =>{
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

const getGraphClient = (accessToken : string) =>{
const graphClient = Client.init({
    authProvider : (done) =>{
        done(null,accessToken)
    },

});
return graphClient;
};
module.exports = getGraphClient;


const createWindow = async() => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      webSecurity: false
  }
  }
  );
  win.loadFile("../index.html");  
  const authResult = await getTokenInteractive(win,scopes);
  win.loadFile("../index.html");    
  const graphClient = getGraphClient(authResult.accessToken);  
  console.log(authResult.accessToken)
  const user = await graphClient.api('/me').get();
  console.log(user)
  console.log('done')
};
app.whenReady().then(() => {
  createWindow();  

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();      
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
