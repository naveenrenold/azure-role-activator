import React, {useState} from 'react';
import './App.css';

// import {
//   // AuthenticationResult,
//   // AuthorizationUrlRequest,
//   Configuration,
//   CryptoProvider,
// } from "@azure/msal-node";

// import { Client } from "@microsoft/microsoft-graph-client";
// import {IpcRenderer} from "electron";
// import { app } from 'electron/main';
// import { shell } from 'electron/common';
// import EventEmitter from 'events';


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
  // var window =new Window{
  //   electronApi = 
  // };
  
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
      <button className='flexbutton' type='submit' onClick={e => window.electronAPI.getToken(clientIdText, tenantIdText)}>Get roles</button>            
      </div>
    </div>
  );
}

export default App;
