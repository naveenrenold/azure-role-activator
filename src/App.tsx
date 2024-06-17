import {
  AuthenticationResult,
  AuthorizationUrlRequest,
  Configuration,
  CryptoProvider,
} from "@azure/msal-node";
import { PublicClientApplication } from "@azure/msal-node";
import { Client } from "@microsoft/microsoft-graph-client";
import {IpcRenderer} from "electron";

declare global {
  interface Window
  {
      api: any;
  }
  //...
}
function App() {
  const MSAL_CONFIG: Configuration = {
    auth: {
      clientId: "",
      authority:
        "",
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
  async function getTokenInteractive(tokenRequest : string[]) : Promise<AuthenticationResult> {
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
    
  
    const authCode =await window.api.getAuthCode(authCodeUrl);
  
    const authResponse =await pca.acquireTokenByCode({
      redirectUri: redirectUri,
      scopes: tokenRequest,
      code: authCode ?? "",
      codeVerifier: pkceCodes.verifier
  });
  return authResponse;
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
  


  
  async function started(){
    const authResult = await getTokenInteractive(scopes); 
    const graphClient = getGraphClient(authResult.accessToken);  
    console.log(authResult.accessToken)
    const user = await graphClient.api('/me').get();  
    console.log(user)
    console.log('done')
  }
  return (
    <div>
      <div>
      Enter your app/clientId:<input type='text' title='clientId' placeholder='Enter you clientId'></input>
      Enter your tenantId:<input type='text' title='tenantId' placeholder='Enter you tenantId'></input>
      <button type='submit'>Get roles</button>
      </div>
    </div>
  );
}

export default App;
