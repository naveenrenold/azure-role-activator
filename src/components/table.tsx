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
            displayName : 'Admin Role'
          }       
        },
        {
          roleDefinition : 
          {
            id : 'PlaceHolder 2',
            displayName : 'Contibutor Role'
          }
        }
    ];
    let [graphApiData, updateGraphApiData] = useState(initialGraphApiData); 
    window.electronAPI.getPIMRoles((value : PIMRoles[]) =>
    {
        updateGraphApiData(value);
        console.log('received in table')
    }
    )   
    return (
        <div>
            <table border={1}>
        <tbody>
        <tr>
        <th>RoleId</th>
        <th>RoleName</th>
        <th>Activate</th>
        </tr>
        {
        graphApiData.map((value,i) => {
          return(
<tr key={i}>
  <td>{value.roleDefinition?.id}</td>
  <td>{value.roleDefinition?.displayName}</td>
  <td>
    <input type ='checkbox' title = 'table-checkbox' ></input>
  </td>
</tr>
          )          
        }) 
 }
 </tbody>
      </table>
        </div>
    );
}
export default Table;