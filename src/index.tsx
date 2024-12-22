import React from 'react';
import {createRoot} from 'react-dom/client';
import Login from './components/login';
import Table from './components/table';
import {Route, Routes, BrowserRouter, HashRouter} from 'react-router-dom';

if(!process.env.NODE_ENV || process.env.NODE_ENV === 'development')
{
const routing = (
  <BrowserRouter>
    <Routes>    
      <Route path='/' Component={Login}/>
      <Route path='/table' Component={Table}/>          
    </Routes>
  </BrowserRouter>
)
}
else{
  const routing = (
    <HashRouter>
      <Routes>    
        <Route path='/' Component={Login}/>
        <Route path='/table' Component={Table}/>          
      </Routes>
    </HashRouter>
  ) 
}

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(routing);

// const root = ReactDOM.createRoot(
//   document.getElementById('root') as HTMLElement
// );
// routing.render(
//   <React.StrictMode>
//     <Router/>
//   </React.StrictMode>
// );

