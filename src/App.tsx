import React from 'react';

function App() {
  return (
    <div>
      <div>
      Enter your app/clientId:<input type='text' title='clientId' placeholder='Enter you clientId'></input>
      Enter your tenantId:<input type='text' title='tenantId' placeholder='Enter you tenantId'></input>
      <button type='submit'>Get roles</button>
      </div>
    </div>
  );
}

export default App;
