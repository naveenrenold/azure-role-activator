import React from 'react';
import './App.css';
function App() {
  return (
    <div className='mainDiv'>
      <div className='flexbox-row-center'>
        <div className = 'flexbox-item-default-margins-text'>
      Enter your app/clientId :
      </div>
      <div className = 'flexbox-item-default-margins-textbox'>
        <input type='text' title='clientId' placeholder='Enter you clientId'></input>            
      </div>
      </div>
      <div className='flexbox-row-center'>
        <div className = 'flexbox-item-default-margins-text'>
      Enter your tenantId :
      </div>
      <div className = 'flexbox-item-default-margins-textbox'><input type='text' title='tenantId' placeholder='Enter you tenantId'></input>
      </div>
      </div>      
        <div className ='flexbox-row-center'>
      <button className='flexbutton' type='submit'>Get roles</button>            
      </div>
    </div>
  );
}

export default App;
