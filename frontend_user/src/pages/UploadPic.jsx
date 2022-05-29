import Webcam from 'react-webcam';
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { detectFaces, drawResults } from '../utils/faceapi';
import { async } from 'q';

const videoConstraints = {
    width: 400,
    height: 400,
    facingMode: 'user',
};

function Camera({ onSave }) {
    return (
        <div className="flex flex-col items-center justify-center">
            <Webcam
                audio={false}
                screenshotFormat="image/jpeg"
                videoConstraints={videoConstraints}
            >
                {({ getScreenshot }) => (
                    <button
                        type="button"
                        className="bg-green-500 mt-2 p-2 rounded-md"
                        onClick={() => {
                            const imageSrc = getScreenshot();
                            onSave(imageSrc);
                        }}
                        aria-label="click pic"
                    >Click</button>
                )}
            </Webcam>
        </div>
    );
}

function UploadPic() {
    const navigate = useNavigate();
    const [img1, setImg1] = useState(null);
    const [img2, setImg2] = useState(null);
    const [showCam1, setShowCam1] = useState(false);
    const [showCam2, setShowCam2] = useState(false);
    const [error, setError] = useState('');

    const imageOne = useRef();
    const imageTwo = useRef();

    useEffect(() => {
        const getMask = async () => {
              try {
                const res = await fetch("http://localhost:8080/mask/getUser", {
                  method: "GET",
                  credentials: "include",
                  headers: { "Content-Type": "application/json", 'Accept': 'application/json' },
                })
                const userMask = await res.json()
                if (userMask.mask !== null) navigate('/')
              } catch (e) {
                navigate('/')
              }
          }
          getMask()
    }, [])

    const getFaces = async () => {
        const faces = await detectFaces(imageOne.current);
        console.log(faces.descriptor)
    };

    const onSubmit = async () => {
        if (!img1 || !img2) {
            setError('Please upload both the images');
        }

        try {

            const faceOne = await detectFaces(imageOne.current);
            const faceTwo = await detectFaces(imageTwo.current);
            const response = await fetch(
              `http://localhost:8080/mask/updateUser`,
              {
                method: "POST",
                credentials: "include",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    descriptors: [faceOne.descriptor, faceTwo.descriptor]
                })
              }
            );
            const res = await response.json();
            console.log(res)
            // if (res)
            //   window.location.reload()
          } catch (e) {
            console.log(e)
            setError(e.message)
          }
    }

    // useEffect(() => {
    //     if (img1)
    //         getFaces();
    // }, [img1, get]);

    // return <Loader />
    return (
        <>
            <div className="h-screen flex flex-col items-center">
                <div className="h-20 flex items-center justify-end gap-8 mr-20">
                    <button type="button">Transaction History</button>
                    <button type="button">Dashboard</button>
                </div>
                <div className="flex items-center justify-center gap-10">
                    <div className="flex flex-col items-center justify-center ">
                        {showCam1 ?
                            <Camera onSave={(img) => {
                                setShowCam1(false);
                                setImg1(img);
                                // console.log(img)
                            }} /> :
                            img1 ?
                                <>
                                    <img className="h-[400px] w-[400px]" src={img1} ref={imageOne} />
                                    <button className="bg-red-500 mt-2 p-2 rounded-md" onClick={() => setImg1(null)}>Delete</button>
                                </>
                                :
                                <>
                                    <div className="h-[400px] w-[400px] bg-gray-200">
                                        <div className="bg-gray-400"></div>
                                    </div>
                                    <button className="bg-green-500 mt-2 p-2 rounded-md" onClick={() => setShowCam1(true)}>Upload Photograph 1</button>
                                </>
                        }
                    </div>

                    <div className="flex flex-col items-center justify-center ">
                        {showCam2 ?
                            <Camera onSave={(img) => {
                                setShowCam2(false);
                                setImg2(img);

                            }} /> :
                            img2 ?
                                <>
                                    <img className="h-[400px] w-[400px]" src={img2} ref={imageTwo} />
                                    <button className="bg-red-500 mt-2 p-2 rounded-md" onClick={() => setImg2(null)}>Delete</button>
                                </>
                                :
                                <>
                                    <div className="h-[400px] w-[400px] bg-gray-200">
                                        <div className="bg-gray-400"></div>
                                    </div>
                                    <button className="bg-green-500 mt-2 p-2 rounded-md" onClick={() => setShowCam2(true)}>Upload Photograph 2</button>
                                </>
                        }
                    </div>
                </div>
                {error && <div className="text-red-600 my-6">{error}</div>}
                <button className="p-2 bg-green-500 rounded-lg max-w-max mt-10" type="button" onClick={() => onSubmit()}>Submit Photos</button>
            </div>
        </>
    );
}

export default UploadPic;
