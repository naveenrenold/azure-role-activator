import {useEffect, useState} from 'react';
import '../App.css';
import { cacheObject } from '../interface';

function Login() {  
       
  //Constants
  // const defaultClientIdText = '68f0ecbf-8e17-4ae2-a92a-275a7f02ea33';
  // const defaultTenantIdText = '24d2489e-7bb3-4339-94a2-207bb2a75abc';
  // const defaultSubscription = 'dd249ddc-44d0-41a8-b0b3-925deb35f39f';


  //State defining
  const [clientIdText, setClientIdText] = useState("")
  const [tenantIdText, setTenantIdText] = useState("")
  const [subscription, setSubscription] = useState("")
  const [rememberMeCheckBox, setRememberMeCheckBox] = useState(false);

  useEffect(
    () => {
      let cache : cacheObject = {clientId : "", tenantId : "", subscription : ""} ;
      async function readCache()
      {        
        cache = (await window.electronAPI.readCache()).value as cacheObject; 
        setClientIdText(cache.clientId);
        setTenantIdText(cache.tenantId);       
        setSubscription(cache.subscription);
      }
      readCache();
      console.log('\nCache in renderer');  
      console.log(cache);
    },
    []
  );    
  // function handleClientIdChange(textInput:string)
  // {
  //   setClientIdText(textInput ?? '');
  // }
  // function handleTenantIdChange(textInput:string)
  // {
  //   setTenantIdText(textInput ?? '');
  // }
  function handleTextChange(textInput:string, updateFunction : Function)
  {
    updateFunction(textInput ?? '');
  }
  
  //main
  return (      
    <div className='login-body'>          
      <div className='flexbox-row-center'>      
        <div className = 'flexitem-margins-text'>
      <label>Enter your app/clientId* :
      <div className = 'flexitem-margins-textbox'>
        <input className='textbox' type='text' value={clientIdText} title='clientId' id='clientId' onChange={e => handleTextChange(e.target.value, setClientIdText)} placeholder='Enter your clientId' defaultValue = {""}></input>            
      </div>
      </label>
      </div>      
      </div>
      <div className='flexbox-row-center'>
        <div className = 'flexitem-margins-text'>
      <label>Enter your tenantId* :
      <div className = 'flexitem-margins-textbox'>
        <input className='textbox' type='text' title='tenantId' value={tenantIdText} id='tenantId' onChange={ e => handleTextChange(e.target.value, setTenantIdText)} placeholder='Enter your tenantId' defaultValue = {""}></input>
      </div>
      </label>
      </div>      
      </div>
      <div className='flexbox-row-center'>
        <div className = 'flexitem-margins-text'>
      <label>Enter your subscription :
      <div className = 'flexitem-margins-textbox'>
        <input className='textbox' type='text' title='subscription' value={subscription} id='subscription' onChange={ e => handleTextChange(e.target.value, setSubscription)} placeholder='Enter your subcription ' defaultValue = {""}></input>
      </div>
      </label>
      </div>      
      </div>      
        <div className ='flexbox-row-center'>
      <button className='flexbutton' type='submit' onClick= {async e =>  {await writeCache(); await window.electronAPI.getEligibleRoles(clientIdText, tenantIdText, subscription); }}>Get roles</button>              
      </div>
      <div className ='flexbox-row-center'>
      <label>
        <input type="checkbox" name='remember checkbox' checked={rememberMeCheckBox} onChange={ e => {setRememberMeCheckBox(!rememberMeCheckBox)}}  title='remember checkbox'/>
        Remember details
        </label>        
      </div>      
    </div>
  );
  async function writeCache()
  {
    if(rememberMeCheckBox)
    {
      let cache : cacheObject = {
        clientId : clientIdText,
        tenantId : tenantIdText,
        subscription : subscription
      }
      await window.electronAPI.writeCache(cache);
    }
  }
}

export default Login;
