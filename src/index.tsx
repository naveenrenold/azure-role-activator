import React from 'react';
import {createRoot} from 'react-dom/client';
import Login from './components/login';
import Table from './components/table';
import {Route, Routes, BrowserRouter} from 'react-router-dom';

const routing = (
  <BrowserRouter>
    <Routes>    
      <Route path='/' Component={Login}/>
      <Route path='/table' Component={Table}/>          
    </Routes>
  </BrowserRouter>
)

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

