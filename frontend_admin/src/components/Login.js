import React, { useEffect, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import metroLogo from '../assets/logo.jpeg';
import Loader from './Loader';
import './Login.css';
import { loggedIn } from './Main';


function Login() {
  const [hidden, setHidden] = useState(true);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoggedIn, setLogin] = useRecoilState(loggedIn);

  const navigate = useNavigate();

  useEffect(() => {
    if(isLoggedIn) {
      navigate('/')
    }
  }, [isLoggedIn, navigate]);

  useEffect(() => {
    const timeOut = setTimeout(() => setHidden(false), 2000);

    return () => {
      clearTimeout(timeOut);
    };
  }, []);

  const onSubmit = (e) => {
      if(e.keyCode === 13) {
          if(password === 'admin') {
            setLogin(true)
          } else {
              setError('Password not correct!!')
          }
      }
  }
  if(hidden) return <Loader />

  return (
    <div className="login-section">
      <div className="header">
        <img className="image" src={metroLogo} alt="" />
        <div className="heading">WELCOME TO DELHI METRO SMART CARD</div>
      </div>
      <div className="login">
        <div>Login as Admin</div>
        <input onKeyDown={onSubmit} value={password} onChange={(e) => {setError(''); setPassword(e.target.value)}} type='password' placeholder='enter passwrod...'/>
        {error && <div className='error'>{error}</div>}
      </div>
    </div>
  );
}

export default Login;
