import React, { useEffect } from 'react';
import Dashboard from './pages/Dashboard';
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";
import Login from './pages/Login';
import UploadPic from './pages/UploadPic';

import { loadModels } from './utils/faceapi';
import { RecoilRoot } from 'recoil';


function App() {
  useEffect(() => {
    loadModels();
  }, []);

  return <RecoilRoot>
  <BrowserRouter>
  <Routes>
    <Route path="/" element={<Dashboard />} />
    <Route path="login" element={<Login />} />
    <Route path="upload" element={<UploadPic />} />
  </Routes>
</BrowserRouter>
</RecoilRoot>
}

export default App;
