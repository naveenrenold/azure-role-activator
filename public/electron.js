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
const msal_node_1 = require("@azure/msal-node");
const electron_1 = require("electron");
const msal_node_2 = require("@azure/msal-node");
const microsoft_graph_client_1 = require("@microsoft/microsoft-graph-client");
const node_url_1 = __importDefault(require("node:url"));
const node_path_1 = __importDefault(require("node:path"));
const MSAL_CONFIG = {
    auth: {
        clientId: "5ad548fe-569a-465f-a98f-188af25d9b47",
        authority: "https://login.microsoftonline.com/b6281daa-0870-4760-9be1-f6b0cd37bfa7",
    },
};
const scopes = ["User.Read"];
const pca = new msal_node_2.PublicClientApplication(MSAL_CONFIG);
const redirectUri = "http://localhost";
const cryptoProvider = new msal_node_1.CryptoProvider();
const pkceCodes = {
    challengeMethod: "S256",
    verifier: "",
    challenge: "",
};
function getTokenInteractive(authWindow, tokenRequest) {
    return __awaiter(this, void 0, void 0, function* () {
        const { verifier, challenge } = yield cryptoProvider.generatePkceCodes();
        pkceCodes.verifier = verifier;
        pkceCodes.challenge = challenge;
        const authCodeUrlParams = {
            redirectUri: redirectUri,
            scopes: tokenRequest,
            codeChallenge: pkceCodes.challenge,
            codeChallengeMethod: pkceCodes.challengeMethod,
        };
        const authCodeUrl = yield pca.getAuthCodeUrl(authCodeUrlParams);
        electron_1.protocol.handle(redirectUri.split(":")[0], (req) => {
            const requestUrl = node_url_1.default.parse(req.url, true);
            return electron_1.net.fetch(node_path_1.default.normalize(`${__dirname}/${requestUrl.path}`));
        });
        const authCode = yield listenForAuthCode(authCodeUrl, authWindow);
        const authResponse = yield pca.acquireTokenByCode({
            redirectUri: redirectUri,
            scopes: tokenRequest,
            code: authCode !== null && authCode !== void 0 ? authCode : "",
            codeVerifier: pkceCodes.verifier
        });
        return authResponse;
    });
}
function listenForAuthCode(navigateUrl, authWindow) {
    return __awaiter(this, void 0, void 0, function* () {
        authWindow.loadURL(navigateUrl);
        return new Promise((resolve, reject) => {
            authWindow.webContents.on('will-redirect', (event, responseUrl) => {
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
const getGraphClient = (accessToken) => {
    const graphClient = microsoft_graph_client_1.Client.init({
        authProvider: (done) => {
            done(null, accessToken);
        },
    });
    return graphClient;
};
module.exports = getGraphClient;
const createWindow = () => __awaiter(void 0, void 0, void 0, function* () {
    const win = new electron_1.BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            webSecurity: false
        }
    });
    win.loadURL("http://localhost:3000");
});
electron_1.app.whenReady().then(() => {
    createWindow();
    electron_1.app.on("activate", () => {
        if (electron_1.BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});
electron_1.app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        electron_1.app.quit();
    }
});
function started(win) {
    return __awaiter(this, void 0, void 0, function* () {
        const authResult = yield getTokenInteractive(win, scopes);
        win.loadURL("http://localhost:3000");
        const graphClient = getGraphClient(authResult.accessToken);
        console.log(authResult.accessToken);
        const user = yield graphClient.api('/me').get();
        console.log(user);
        console.log('done');
    });
}
