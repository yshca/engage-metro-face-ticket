/* eslint-disable react/jsx-props-no-spreading */
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { atom, useRecoilState, useRecoilValue } from 'recoil';
import Loader from '../components/Loader';
// import {
//   Menu,
//   MenuItem,
//   MenuButton,
// } from '@szhsin/react-menu';
// import '@szhsin/react-menu/dist/index.css';
// import '@szhsin/react-menu/dist/transitions/slide.css';

const balanceData = [{
  amount: 100,
  type: 'DEPOSIT',
  date: 1653592801,
}, {
  amount: 50,
  type: 'TRANSACTION',
  date: 1653592801,
}];

// const balanceDataStyle = {
//   DEPOSIT: 'text-green',
//   TRANSACTION: 'text-red',
// };

export const loggedIn = atom({
  key: 'loggedIn', // unique ID (with respect to other atoms/selectors)
  default: false, // default value (aka initial value)
});

export const curUser = atom({
  key: 'curUser', // unique ID (with respect to other atoms/selectors)
  default: null, // default value (aka initial value)
});

function Dashboard() {
  const [hidden, setHidden] = useState(true);

  const [isLoggedIn, setLogin] = useRecoilState(loggedIn);
  const [user, setUser] = useRecoilState(curUser);

  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login')
    }
  }, [isLoggedIn, navigate]);

  useEffect(() => {
    const timeOut = setTimeout(() => setHidden(false), 2000);

    const getUser = async () => {
      try {
        const res = await fetch("http://localhost:8080/users/account", {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json", 'Accept': 'application/json' },
        })
        const data = await res.json();
        if (data.user) {
          setLogin(true);
          setUser(data.user)
        }

        try {
          const res = await fetch("http://localhost:8080/mask/getUser", {
            method: "GET",
            credentials: "include",
            headers: { "Content-Type": "application/json", 'Accept': 'application/json' },
          })
          const userMask = await res.json()
          if (userMask.mask === null) navigate('/upload')
        } catch (e) {
          navigate('/login')
        }
      }
      catch (e) {
        console.log(e)
        setLogin(false);
      }
    }
    getUser()

    return () => {
      clearTimeout(timeOut);
    };
  }, []);


  const {
    register,
    setValue,
    getValues,
    formState: { errors },
  } = useForm({ mode: 'onChange' });

  const addBalance = async () => {
    try {
      const response = await fetch(
        `http://localhost:8080/users/updateBalance`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: getValues('amount'),
            type: 'Deposit'
          })
        }
      );
      const res = await response.json();
      if (res)
        window.location.reload()
    } catch (e) {
      console.log(e)
    }
  }

  if (hidden) return <Loader />

  return (
    <div className="h-screen flex flex-col bg-cyan-200">
      <div className="h-20 flex items-center justify-end gap-8 mr-20">
        <button type="button" onClick={() => navigate('/history')}>Transaction History</button>
        <button type="button" onClick={() => navigate('/upload')}>Edit Photographs</button>
      </div>
      <div className="flex">
        <div className="flex-[2_2_0%]">
          <div className="flex flex-col items-center">
            <div className="p-4">Hi, {user ? user.email.substr(0, user.email.indexOf('@')) : ''}</div>
            <div>Balance: Rs. {user.currentBalance ? user.currentBalance : 0}</div>
            <div className="m-10">
              <input
                {...register('amount', {
                  required: true,
                  valueAsNumber: true,
                  validate: (value) => value > 0,
                })}
                className="w-64 h-8 m-4 px-2 border-[1px] rounded-md border-black focus:outline-none"
              />
              {errors.amount && <p className="text-sm text-red-600 ml-4">Amount is required.</p>}
              <div className="flex justify-around mt-4 gap-2">
                <button className="border-[1px] rounded-md border-black p-2" type="button" onClick={() => setValue('amount', 100)}>Rs. 100</button>
                <button className="border-[1px] rounded-md border-black p-2" type="button" onClick={() => setValue('amount', 200)}>Rs. 200</button>
                <button className="border-[1px] rounded-md border-black p-2" type="button" onClick={() => setValue('amount', 500)}>Rs. 500</button>
              </div>
            </div>
            <button onClick={() => addBalance()} className="bg-green-400 p-2 rounded-md" type="button" disabled={!!errors.amount}>Make Payment</button>
          </div>
        </div>
        <div className="flex-[1_2_0%]">
          <div className="flex flex-col items-center px-2">
            <div className="p-4">Balance History</div>
            {user?.balanceHistory.map((data) => (
              <div key={data.date} className="py-2 px-4 flex w-full items-center">
                <div className="p-2 flex-[5_2_0%] flex flex-col justify-center">
                  <div>{data.type}</div>
                  <div className="text-xs">{new Date(data.date).toDateString()}</div>
                </div>
                <div className={`flex-[1_2_0%] ${data.type === 'DEPOSIT' ? 'text-green' : 'text-red'}`}>{data.amount}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
