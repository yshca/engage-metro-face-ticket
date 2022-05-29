import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import metroLogo from '../assets/logo.jpeg';
import Loader from '../components/Loader';
import { loggedIn } from './Dashboard';

function Login() {
  const [hidden, setHidden] = useState(true);

  const [isLoggedIn, setLogin] = useRecoilState(loggedIn);

  const navigate = useNavigate();

  useEffect(() => {
    if(isLoggedIn) {
      navigate('/')
    }
  }, [isLoggedIn, navigate]);

  useEffect(() => {
    const timeOut = setTimeout(() => setHidden(false), 2000);
    fetch("http://localhost:8080/users/isLogin", {
      method: "GET",
      credentials: "include",
      headers: { "Content-Type": "application/json", 'Accept': 'application/json' },
    })
                  .then((res) => {
                    console.log(res)
                      if(!res) setLogin(false);

                  })
    return () => {
      clearTimeout(timeOut);
    };
  }, []);

  if(hidden) return <Loader />

  return (
    <div className="bg-cyan-500 h-screen flex flex-col items-center justify-center ">
      <div className="flex gap-4">
        <img className="h-10 w-10" src={metroLogo} alt="" />
        <div className="text-red-700 text-4xl font-bold">WELCOME TO DELHI METRO SMART CARD</div>
      </div>
      <div>
        The users can view all the Top Ups done as he transacts and can use his Debit/Credit Card
        or Net Banking or wallet (Paytm) to pay online for an instant recharge. The easy steps are:
        <ol>
          <li>Login into your dashboard.</li>
          <li>Deposit money through any modes of payment</li>
        </ol>
      </div>
      <div className="bg-white flex flex-col h-[320px] w-80 m-10 items-center p-4 rounded-md">
        <div>Login/Register</div>
        <a href='http://localhost:8080/auth/google?callbackURL=http://localhost:3001'><button type="button">Google</button></a>
      </div>
    </div>
  );
}

export default Login;
