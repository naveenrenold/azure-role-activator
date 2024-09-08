import React, {useState} from 'react';
import './App.css';

function App() {
  //Constants
  // const defaultClientIdText = '5ad548fe-569a-465f-a98f-188af25d9b47';
  // const defaultTenantIdText = 'b6281daa-0870-4760-9be1-f6b0cd37bfa7';
  const defaultClientIdText = '68f0ecbf-8e17-4ae2-a92a-275a7f02ea33';
  const defaultTenantIdText = '24d2489e-7bb3-4339-94a2-207bb2a75abc';
  const graphApiData = [{
    displayName: 'Naveen Renold',
    givenName: 'Naveen',
    mail: 'naveenrenold1@hotmail.com'
  },
  {
    displayName: 'Naveen Renold',
    givenName: 'Naveen',
    mail: 'naveenrenold1@hotmail.com'
  }
];
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
      <button className='flexbutton' type='submit' onClick={e => window.electronAPI.getToken(clientIdText, tenantIdText)}>Get roles</button>            
      </div>
      <table border={1}>
        <tr>
        <th>Name</th>
        <th>Mail</th>
        <th>Surname</th>
        </tr>
        {
        graphApiData.map(value => {
          return(
<tr>
  <td>{value['displayName']}</td>
  <td>{value['givenName']}</td>
  <td>{value['mail']}</td>
</tr>
          )          
        }) 
 }
      </table>
    </div>
  );
}

export default App;
