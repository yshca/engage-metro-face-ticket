import React from 'react';
import loaderImg from '../assets/loader.gif';

function Loader() {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
    }}>
      <img src={loaderImg} alt="" />
    </div>
  );
}

export default Loader;
