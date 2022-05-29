import React from 'react';
import { RecoilRoot } from 'recoil';

import { loadModels } from './helpers/faceApi';
import { createFaLibrary } from './helpers/icons';
import Camera from './components/Camera/Camera';

import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Main from './components/Main';
import Login from './components/Login';

createFaLibrary();
loadModels();

function App() {
  return (
    <RecoilRoot>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/station" element={<Camera />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
    </RecoilRoot>
  );
}

export default App;
