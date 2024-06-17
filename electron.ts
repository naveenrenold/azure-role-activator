
import { app, BrowserWindow, ipcMain, net, protocol} from "electron";
import url from 'node:url';
import path from 'node:path';

var win :BrowserWindow;
protocol.handle(
  'http',
  (req: Request): Promise<Response> => {
    const requestUrl = url.parse(req.url, true);
    return net.fetch(path.normalize(`${__dirname}/${requestUrl.path}`));
  }
);
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
const createWindow = async() => {
   win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      webSecurity: false
  }
  }
  );
  win.loadURL(app.isPackaged
    ? url.format({
        pathname: path.join(__dirname, "index.html"),
        protocol: "file:",
        slashes: true,
      })
    : "http://localhost:3000");  
  ipcMain.handle('authCodeFlow',listenForAuthCode)
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

