import React, { useState } from 'react';
import '../App.css';
import { apiResponse, PIMRoles } from '../interface';

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
    var [apiResponse, updateApiResponse] = useState("Hello");
    window.electronAPI.getPIMRoles((value : PIMRoles[]) =>
    {
        updateGraphApiData(value);        
    }
    );
    
    window.electronAPI.getPIMActivationResponse((response : apiResponse) =>
      {
          updateApiResponse(`API ${response.isSuccess}. ${response.pimRoles.length} roles failed to activate`)
      }
      );

    function checkBoxChecked(id: string){
       let tempGraphData = graphApiData.map((role) => {
        if(role.roleDefinition.id === id)
        {
          role.checked = !role.checked;          
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
      updateApiResponse("test");
      let tempGraphData = graphApiData.map((role) => {
        return {
          roleDefinition : role.roleDefinition,
          checked : false,
          principalId : role.principalId,
          scheduleInfo : role.scheduleInfo
        }      
     })     
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
      <div>
        <input type='text' title = 'apiResponse' value={apiResponse} readOnly></input>
      </div>
        </div>
    );
}
export default Table;