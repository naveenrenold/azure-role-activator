import React, { useState } from 'react';
import '../App.css';
import { PIMRoles } from '../interface';

function Table()
{    
    const initialGraphApiData : PIMRoles[] = [
        {
          roleDefinition : 
          {
            id : 'PlaceHolder 1',
            displayName : 'Admin Role',            
          },
          checked : true,
          principalId : "Placeholder 1"
        },
        {
          roleDefinition : 
          {
            id : 'PlaceHolder 2',
            displayName : 'Contibutor Role'
          },
          checked : false,
          principalId : "Placeholder 2"
        }
    ];
    let [graphApiData, updateGraphApiData] = useState(initialGraphApiData); 
    window.electronAPI.getPIMRoles((value : PIMRoles[]) =>
    {
        updateGraphApiData(value);        
    }
    );
    
    function checkBoxChecked(id: string){
       let tempGraphData = graphApiData.map((role) => {
        if(role.roleDefinition.id === id)
        {
          return {
            roleDefinition : role.roleDefinition,
            checked : !role.checked,
            principalId : role.principalId,
            scheduleInfo : role.scheduleInfo
          }
        }
        return role;
       })
       updateGraphApiData(tempGraphData);
    }

    function activateRoles()
    {
      let roles = graphApiData.filter((role) => {
        return role.checked ?? false
      });
      let success = window.electronAPI.activateRoles(roles);
      if(success)
      {
        unCheckBoxes();
      }
    }
    function unCheckBoxes()
    { 
      let tempGraphData = graphApiData.map((role) => {
        return {
          roleDefinition : role.roleDefinition,
          checked : false,
          principalId : role.principalId,
          scheduleInfo : role.scheduleInfo
        }      
     })     
      // graphApiData.forEach((role : PIMRoles) => {
      //   role.checked = false;
      // })
      updateGraphApiData(tempGraphData);
    }

    return (
        <div>
            <table border={1}>
        <tbody>
        <tr>
        {/* <th>PrincipleId</th> */}
        <th>RoleId</th>
        <th>RoleName</th>
        <th>Activate</th>
        </tr>
        {
        graphApiData.map((value,i) => {
          return(
<tr key={i}>
  {/* <td>{value.principalId}</td> */}
  <td>{value.roleDefinition?.id}</td>
  <td>{value.roleDefinition?.displayName}</td>
  <td>
    <input type ='checkbox' title = 'table-checkbox' checked = {value.checked} onChange = { () =>checkBoxChecked(value.roleDefinition.id)}></input>
  </td>
</tr>
          )          
        }) 
 }
 </tbody>
      </table>
      <div>
      <button onClick={e => activateRoles()}>Activate Roles</button>
      <button onClick={e => unCheckBoxes()}>Reset</button>
      </div>
        </div>
    );
}
export default Table;