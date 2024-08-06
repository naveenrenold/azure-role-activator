import React, {useState} from 'react';
import './App.css';
import {
  AuthenticationResult,
  AuthorizationUrlRequest,
  Configuration,
  CryptoProvider,
} from "@azure/msal-node";
import { PublicClientApplication } from "@azure/msal-node";
import { Client } from "@microsoft/microsoft-graph-client";
import {IpcRenderer} from "electron";
import { app } from 'electron/main';
import { shell } from 'electron/common';
import EventEmitter from 'events';


function App() {
  //State implementation for textbox
  const [clientIdText, setClientIdText] = useState('')
  const [tenantIdText, setTenantIdText] = useState('')
  function handleClientIdChange(textInput:string)
  {
    setClientIdText(textInput ?? '');
  }
  function handleTenantIdChange(textInput:string)
  {
    setTenantIdText(textInput ?? '');
  }
  //window.get roles
  var window =new Window();
  // constants for testing
  const MSAL_CONFIG: Configuration = {
    auth: {
      clientId: "5ad548fe-569a-465f-a98f-188af25d9b47",
      authority: "https://login.microsoftonline.com/b6281daa-0870-4760-9be1-f6b0cd37bfa7"
    }
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
  // }
  return (
    <div className='mainDiv'>
      <div className='flexbox-row-center'>
        <div className = 'flexbox-item-default-margins-text'>
      <label>Enter your app/clientId :
      <div className = 'flexbox-item-default-margins-textbox'>
        <input type='text' title='clientId' id='clientId' onChange={e => handleClientIdChange(e.target.value)} placeholder='Enter you clientId'></input>            
      </div>
      </label>
      </div>      
      </div>
      <div className='flexbox-row-center'>
        <div className = 'flexbox-item-default-margins-text'>
      <label>Enter your tenantId :
      <div className = 'flexbox-item-default-margins-textbox'>
        <input type='text' title='tenantId' id='tenantId' onChange={ e => handleTenantIdChange(e.target.value)} placeholder='Enter you tenantId'></input>
      </div>
      </label>
      </div>      
      </div>      
        <div className ='flexbox-row-center'>
      <button className='flexbutton' type='submit' onClick={window.electronApi.getToken}>Get roles</button>            
      </div>
    </div>
  );
}

export default App;
