import {useState} from 'react';
import '../App.css';

function Login() {
  //Constants
  const defaultClientIdText = '68f0ecbf-8e17-4ae2-a92a-275a7f02ea33';
  const defaultTenantIdText = '24d2489e-7bb3-4339-94a2-207bb2a75abc';
  
  //State defining
  const [clientIdText, setClientIdText] = useState(defaultClientIdText)
  const [tenantIdText, setTenantIdText] = useState(defaultTenantIdText)
  function handleClientIdChange(textInput:string)
  {
    setClientIdText(textInput ?? '');
  }
  function handleTenantIdChange(textInput:string)
  {
    setTenantIdText(textInput ?? '');
  }
  
  //main
  return (      
    <div className='login-body'>          
      <div className='flexbox-row-center'>      
        <div className = 'flexitem-margins-text'>
      <label>Enter your app/clientId :
      <div className = 'flexitem-margins-textbox'>
        <input className='textbox' type='text' title='clientId' id='clientId' onChange={e => handleClientIdChange(e.target.value)} placeholder='Enter you clientId' defaultValue = {defaultClientIdText}></input>            
      </div>
      </label>
      </div>      
      </div>
      <div className='flexbox-row-center'>
        <div className = 'flexitem-margins-text'>
      <label>Enter your tenantId :
      <div className = 'flexitem-margins-textbox'>
        <input className='textbox' type='text' title='tenantId' id='tenantId' onChange={ e => handleTenantIdChange(e.target.value)} placeholder='Enter you tenantId' defaultValue = {defaultTenantIdText}></input>
      </div>
      </label>
      </div>      
      </div>      
        <div className ='flexbox-row-center'>
      <button className='flexbutton' type='submit' onClick= {async e =>  {console.log("started react"); await window.electronAPI.getEligibleRoles(clientIdText, tenantIdText); console.log('finished react;');setClientIdText('Sucess')}}>Get roles</button>              
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
