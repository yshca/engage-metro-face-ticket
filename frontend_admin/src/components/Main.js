import React, {useEffect} from 'react'
import { NavLink, useNavigate } from 'react-router-dom';
import { atom, useRecoilValue } from 'recoil';

export const loggedIn = atom({
  key: 'loggedIn',
  default: false, 
});

function Main() {
  const stations = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  const isLoggedIn = useRecoilValue(loggedIn);
  const navigate = useNavigate();

  useEffect(() => {
    if(!isLoggedIn) {
      navigate('/login')
    }
  }, [isLoggedIn, navigate]);

  return (
    <div style={{  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyItems: 'center', padding: '20px' }}>
      <h1 style={{ color: '#fff'}}>Please select the current station camera.</h1>
      {stations.map((station) => {
        return <>
          <div style={{ padding: '10px 20px' }} key={station + 'entry'}>
            <NavLink style={{color: '#fff', textDecoration: 'underline'}} to={'/station?num=' + station.toString() + '&type=entry'}>Station {station} : Entry</NavLink>
          </div>
          <div style={{ color: '#fff', padding: '10px 20px' }} key={station + 'exit'}>
            <NavLink style={{color: '#fff', textDecoration: 'underline'}} to={'/station?num=' + station.toString() + '&type=exit'}>Station {station} : Exit</NavLink>
          </div>
        </>
      })}
    </div>
  )
}

export default Main
