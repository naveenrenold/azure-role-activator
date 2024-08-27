"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const node_url_1 = __importDefault(require("node:url"));
const node_path_1 = __importDefault(require("node:path"));
const msal_node_1 = require("@azure/msal-node");
const msal_node_2 = require("@azure/msal-node");
//variables declare
var win;
const scopes = ["User.Read"];
const redirectUri = "http://localhost";
const cryptoProvider = new msal_node_2.CryptoProvider();
const pkceCodes = {
    challengeMethod: "S256",
    verifier: "",
    challenge: ""
};
//App start
electron_1.app.whenReady().then(() => {
    electron_1.ipcMain.handle("getToken", (event, clientId, tenantId) => { getToken(event, clientId, tenantId); });
    createWindow();
    electron_1.app.on("activate", () => {
        if (electron_1.BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});
//Create window
const createWindow = () => __awaiter(void 0, void 0, void 0, function* () {
    win = new electron_1.BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            webSecurity: false,
            preload: node_path_1.default.join(__dirname, 'preload.js')
        }
    });
    //Load home page from localhost or dist
    win.loadURL(electron_1.app.isPackaged
        ? node_url_1.default.format({
            pathname: node_path_1.default.join(__dirname, "index.html"),
            protocol: "file:",
            slashes: true,
        })
        : "http://localhost:3000");
});
function listenForAuthCode(events, navigateUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        win.loadURL(navigateUrl);
        return new Promise((resolve, reject) => {
            win.webContents.on('will-redirect', (event, responseUrl) => {
                try {
                    const parsedUrl = new URL(responseUrl);
                    const authCode = parsedUrl.searchParams.get('code');
                    resolve(authCode);
                }
                catch (err) {
                    reject(err);
                }
            });
        });
    });
}
function getToken(event, clientId, tenantId) {
    console.log('sender:' + event.processId + ';args 1:' + clientId + ';args 2:' + tenantId);
    ////uncomment later
    // const MSAL_CONFIG: Configuration = {
    //   auth: {
    //     clientId: clientId,
    //     authority: `https://login.microsoftonline.com/${tenantId}`
    //   }
    // };
    const MSAL_CONFIG = {
        auth: {
            clientId: "5ad548fe-569a-465f-a98f-188af25d9b47",
            authority: "https://login.microsoftonline.com/b6281daa-0870-4760-9be1-f6b0cd37bfa7"
        }
    };
    const pca = new msal_node_1.PublicClientApplication(MSAL_CONFIG);
}
function getTokenInteractive(tokenRequest, pca) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("before");
        const { verifier, challenge } = yield cryptoProvider.generatePkceCodes();
        console.log("after");
        pkceCodes.verifier = verifier;
        pkceCodes.challenge = challenge;
        const authCodeUrlParams = {
            redirectUri: redirectUri,
            scopes: tokenRequest,
            codeChallenge: pkceCodes.challenge,
            codeChallengeMethod: pkceCodes.challengeMethod,
        };
        const authCodeUrl = yield pca.getAuthCodeUrl(authCodeUrlParams);
        const authResponse = yield pca.acquireTokenByCode({
            redirectUri: redirectUri,
            scopes: tokenRequest,
            code: "",
            codeVerifier: pkceCodes.verifier
        });
        return authResponse;
    });
}
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
electron_1.app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        electron_1.app.quit();
    }
});
