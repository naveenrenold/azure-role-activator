import {useState} from 'react';
import '../App.css';

function Login() {
  //Constants
  const defaultClientIdText = '68f0ecbf-8e17-4ae2-a92a-275a7f02ea33';
  const defaultTenantIdText = '24d2489e-7bb3-4339-94a2-207bb2a75abc';
  const defaultSubscription = 'dd249ddc-44d0-41a8-b0b3-925deb35f39f';
  
  //State defining
  const [clientIdText, setClientIdText] = useState(defaultClientIdText)
  const [tenantIdText, setTenantIdText] = useState(defaultTenantIdText)
  const [subscription, setSubscription] = useState(defaultSubscription)
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
        <input className='textbox' type='text' title='clientId' id='clientId' onChange={e => handleTextChange(e.target.value, setClientIdText)} placeholder='Enter you clientId' defaultValue = {defaultClientIdText}></input>            
      </div>
      </label>
      </div>      
      </div>
      <div className='flexbox-row-center'>
        <div className = 'flexitem-margins-text'>
      <label>Enter your tenantId* :
      <div className = 'flexitem-margins-textbox'>
        <input className='textbox' type='text' title='tenantId' id='tenantId' onChange={ e => handleTextChange(e.target.value, setTenantIdText)} placeholder='Enter you tenantId' defaultValue = {defaultTenantIdText}></input>
      </div>
      </label>
      </div>      
      </div>
      <div className='flexbox-row-center'>
        <div className = 'flexitem-margins-text'>
      <label>Enter your subscription :
      <div className = 'flexitem-margins-textbox'>
        <input className='textbox' type='text' title='subscription' id='subscription' onChange={ e => handleTextChange(e.target.value, setSubscription)} placeholder='Enter you tenantId' defaultValue = {defaultSubscription}></input>
      </div>
      </label>
      </div>      
      </div>      
        <div className ='flexbox-row-center'>
      <button className='flexbutton' type='submit' onClick= {async e =>  { await window.electronAPI.getEligibleRoles(clientIdText, tenantIdText, subscription); }}>Get roles</button>              
      </div>
      <div className ='flexbox-row-center'>
      <label>
        <input type="checkbox" name='remember checkbox' defaultChecked = {false}  title='remember checkbox' placeholder='Remember client and tenant id'/>
        Remember client and tenant id
        </label>
      </div>
    </div>
  );
}

export default Login;
