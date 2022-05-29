import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getDescriptorsFromDB } from '../../helpers/faceApi';
import Webcam from 'react-webcam';

import './Camera.css';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { loggedIn } from '../Main';

const Camera = () => {
  const camera = useRef();

  const [descriptors, setDiscriptors] = useState([]);
  const [allDesc, setAllDesc] = useState([])
  // console.log(descriptors)
  useEffect(() => {
    const getMasks = async () => {
      try {
        const res = await fetch("http://localhost:8080/mask/getAll", {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json", 'Accept': 'application/json' },
        })
        const data = await res.json();
        // if (data.user) {
        //   setLogin(true);
        //   setUser(data.user)
        // }
        setAllDesc(data.allMasks)
        setDiscriptors(data.allMasks.map((desc) => ({ 'label': desc.email, 'description': desc.descriptors })))
        console.log(data)
      }
      catch (e) {
        console.log(e)
      }
    }
    getMasks()

  }, [])

  const [currPic, setCurrPic] = useState(null);
  const [pin, setPin] = useState('');
  const [entryAllowed, setEntryAllowed] = useState(false);
  const [exitAllowed, setExitAllowed] = useState(false);
  const [entryStn, setEntryStn] = useState(-1);

  let [searchParams,] = useSearchParams();
  const type = searchParams.get('type');
  const stationNum = searchParams.get('num');

  const isLoggedIn = useRecoilValue(loggedIn);
  const navigate = useNavigate();

  const getFaces = async (descriptors) => {
    if (camera.current !== null) {
      console.log(descriptors)
      const res = await getDescriptorsFromDB(camera.current.video, descriptors)

      const filteredRes = res.sort((a, b) => a.distance - b.distance);
      if (filteredRes.length) {
        setCurrPic(filteredRes[0].label)
      }
      else
        setCurrPic(null);
    }
  }
  //, [descriptors]);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login')
    }
  }, [isLoggedIn, navigate]);

  useEffect(() => {
    const checkEntry = async () => {
      try {
        const res = await fetch("http://localhost:8080/users/accountById", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json", 'Accept': 'application/json' },
          body: JSON.stringify({ userId: allDesc.find((desc) => desc.email == currPic)._id })
        }
          )
        const data = await res.json();
        if (data.user.entry == -1) {
          setEntryAllowed(true)
        }
        console.log(data)
      }
      catch (e) {
        console.log(e)
      }
    }
    const checkExit = async () => {
      try {
        const res = await fetch("http://localhost:8080/users/accountById", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json", 'Accept': 'application/json' },
          body: JSON.stringify({ userId: allDesc.find((desc) => desc.email == currPic)._id })
        }
          )
        const data = await res.json();
        if (data.user.entry !== -1) {
          setExitAllowed(true)
          setEntryStn(data.user.entry)
        }
        console.log(data)
      }
      catch (e) {
        console.log(e)
      }
    }
    if (currPic && currPic !== 'unknown' && type === 'entry') {
      // setEntryAllowed(true)
      checkEntry()
    }
    if (currPic && currPic !== 'unknown' && type === 'exit') {
      // setEntryAllowed(true)
      checkExit()
    }
  }, [currPic]);

  useEffect(() => {
    const ticking = setInterval(async () => {
      await getFaces(descriptors);
    }, 4000);
    return () => {
      clearInterval(ticking);
    };
  }, [descriptors]);

  const onEntry = async (e) => {
    if (e.keyCode === 13 && pin === '1234') {
      try {
        const response = await fetch(
          `http://localhost:8080/users/entry`,
          {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              stnNo: stationNum,
              userId: allDesc.find((desc) => desc.email == currPic)._id
            })
          }
        );
        const res = await response.json();
        setCurrPic(null)
        setPin('')
      } catch (e) {
        console.log(e)
      }
    }
  }

  const onExit = async (e) => {
    if (e.keyCode === 13 && pin === '1234') {
      const userId = allDesc.find((desc) => desc.email == currPic)._id;
      try {
        const response = await fetch(
          `http://localhost:8080/users/exit`,
          {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              stnNo: stationNum,
              userId: userId
            })
          }
        );
        const response2 = await fetch(
          `http://localhost:8080/users/updateBalanceById`,
          {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              amount: Math.max(Math.abs(entryStn - stationNum), 1) * 10,
              type: `Travel from Station ${entryStn} to ${stationNum}`,
              userId: userId
            })
          }
        );
        setCurrPic(null)
        setPin('')
        const res = await response.json();
      } catch (e) {
        console.log(e)
      }
    }
  }

  return (
    <div className="camera">
      <header>
        <div className="App__header">
          <h1>
            <span>Delhi Metro | Station {stationNum} - {type.toUpperCase()}</span>
          </h1>
        </div>
      </header>
      <div className="camera__wrapper">
        <Webcam audio={false} ref={camera} width="100%" height="auto" />
      </div>
      {(
        currPic && type === 'entry' ?
          currPic === 'unknown' ? <div>
            <h1>Please register on the portal.</h1>
          </div> : entryAllowed && (<div>
            <h1>Hey {currPic}, Please enter your pin: </h1>
            <input onKeyDown={onEntry} value={pin} onChange={(e) => setPin(e.target.value)} style={{ width: '60px', padding: '4px 4px', outline: 'none', textAlign: 'center', letterSpacing: '2px' }} />
          </div>)
          : currPic && type === 'exit' ? 
          currPic === 'unknown' ? <div>
            <h1>Please register on the portal.</h1>
          </div> : exitAllowed && (<div>
            <h1>Hey {currPic}, Please enter your pin: </h1>
            <input onKeyDown={onExit} value={pin} onChange={(e) => setPin(e.target.value)} style={{ width: '60px', padding: '4px 4px', outline: 'none', textAlign: 'center', letterSpacing: '2px' }} />
          </div>) : <></>
      )}
    </div>
  );
};

export default Camera;
