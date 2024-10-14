import {useState} from 'react';
import './Login.css';
import { PIMRoles } from '../interface';

function Login() {
  //Constants
  const defaultClientIdText = '68f0ecbf-8e17-4ae2-a92a-275a7f02ea33';
  const defaultTenantIdText = '24d2489e-7bb3-4339-94a2-207bb2a75abc';
  const initialGraphApiData : PIMRoles[] = [
    {
      roleId : 'Role 1',
      roleName : 'Admin Role'
    },
    {
      roleId : 'Role 2',
      roleName : 'Reader Role'
    }
];
  
let [graphApiData, updateGraphApiData] = useState(initialGraphApiData);
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
    <div className='mainDiv'>      
      <div className='flexbox-row-center'>
        <div className = 'flexbox-item-default-margins-text'>
      <label>Enter your app/clientId :
      <div className = 'flexbox-item-default-margins-textbox'>
        <input type='text' title='clientId' id='clientId' onChange={e => handleClientIdChange(e.target.value)} placeholder='Enter you clientId' defaultValue = {defaultClientIdText}></input>            
      </div>
      </label>
      </div>      
      </div>
      <div className='flexbox-row-center'>
        <div className = 'flexbox-item-default-margins-text'>
      <label>Enter your tenantId :
      <div className = 'flexbox-item-default-margins-textbox'>
        <input type='text' title='tenantId' id='tenantId' onChange={ e => handleTenantIdChange(e.target.value)} placeholder='Enter you tenantId' defaultValue = {defaultTenantIdText}></input>
      </div>
      </label>
      </div>      
      </div>      
        <div className ='flexbox-row-center'>
      <button className='flexbutton' type='submit' onClick= {async e =>  {console.log("started react"); updateGraphApiData(await window.electronAPI.getEligibleRoles(clientIdText, tenantIdText)); console.log('finished react;');setClientIdText('Sucess')}}>Get roles</button>              
      </div>
      <table border={1}>
        <tbody>
        <tr>
        <th>Name</th>
        <th>Mail</th>
        <th>Surname</th>
        </tr>
        {
        graphApiData.map((value,i) => {
          return(
<tr key={i}>
  <td>{value.roleId}</td>
  <td>{value.roleName}</td>
  <td>{''}</td>
</tr>
          )          
        }) 
 }
 </tbody>
      </table>      
    </div>
  );
}

export default Login;
