import React, { useState } from 'react';
import '../App.css';
import { PIMRoles } from '../interface';

function Table()
{
    const initialGraphApiData : PIMRoles[] = [
        {
          roleId : 'Placeholder 1',
          roleName : 'Admin Role'
        },
        {
          roleId : 'Placeholder 2',
          roleName : 'Reader Role'
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
export default Table;