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
var win;
electron_1.protocol.handle('http', (req) => {
    const requestUrl = node_url_1.default.parse(req.url, true);
    return electron_1.net.fetch(node_path_1.default.normalize(`${__dirname}/${requestUrl.path}`));
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
const createWindow = () => __awaiter(void 0, void 0, void 0, function* () {
    win = new electron_1.BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            webSecurity: false
        }
    });
    win.loadURL(electron_1.app.isPackaged
        ? node_url_1.default.format({
            pathname: node_path_1.default.join(__dirname, "index.html"),
            protocol: "file:",
            slashes: true,
        })
        : "http://localhost:3000");
    electron_1.ipcMain.handle('authCodeFlow', listenForAuthCode);
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
