import React from 'react';
import loaderImg from '../assets/loader.gif';

function Loader() {
  return (
    <div className="flex items-center justify-center h-screen">
      <img src={loaderImg} alt="" />
    </div>
  );
}

export default Loader;
