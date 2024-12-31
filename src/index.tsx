import React, { ReactElement } from 'react';
import {createRoot} from 'react-dom/client';
import Login from './components/login';
import Table from './components/table';
import {Route, Routes, BrowserRouter, HashRouter} from 'react-router-dom';

var routing : ReactElement<Element>;
if(!process.env.NODE_ENV || process.env.NODE_ENV === 'development')
{
routing = (
  <BrowserRouter>
    <Routes>    
      <Route path='/' Component={ Login }/>
      <Route path='/table' Component={ Table }/>          
    </Routes>
  </BrowserRouter>
)
}
else{
  routing = (
    <HashRouter>
      <Routes>    
        <Route path='/' Component={ Login }/>
        <Route path='/table' Component={ Table }/>          
      </Routes>
    </HashRouter>
  ) 
}

const root = createRoot(document.getElementById('root')!);
root.render(routing);

