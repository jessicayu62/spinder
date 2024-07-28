import React, { useState, useEffect, useRef } from "react";
import axios from 'axios';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import PlayerCard from "./Card";
import logo from './img/logo.png';
import Image from 'react-bootstrap/Image';
import { useNavigate } from "react-router-dom";
import heart from './img/heart-64.png';

const SCANNABLESURL = 'https://scannables.scdn.co/uri/plain/png/1DB954/black/640/';

export default function Player() {
    const [recommendations, setRecommendations] = useState(undefined);
    const [currentTrackIndex, setCurrentTrackIndex] = useState();
    const [openModal, setOpenModal] = useState(true);
    const [audio, setAudio] = useState('');
    const [trackURI, setTrackURI] = useState(null);
    const audioRef = useRef()
    const [firstTime, setIsFirstTime] = useState(true);
    const navigate = useNavigate();

    const updateSong = (source) => {
        setAudio(source);
        if (audioRef.current) {
            audioRef.current.load();
        } 
    }

    const playSong = () => {
        if (audio !== '' && audioRef.current) {
            audioRef.current.play();
        } else {
            prepNextTrack();
        }
    }
    
    const pauseSong = () => {
        if (audioRef.current) {
            audioRef.current.pause();
        } 
    }

    const checkPermissions = () => {
        const urlParams = new URLSearchParams(window.location.search);
        let error = urlParams.get('error');
        if (error) {
            if (error === "access_denied") {
                navigate("/");
            }
            else {
                navigate("/");
                console.log(error);
            }
        } else {
            fetchRecommendations();
        }
    }

    const fetchRecommendations = async () => {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const codeVerifier = localStorage.getItem('code_verifier')

        try {
            await axios.post('/callback', {
                code: code,
                code_verifier: codeVerifier,
            })

            const recommendations = await axios.get('/recommendations');
            setRecommendations(recommendations.data.tracks)
            // setOpenModal(true)

            setCurrentTrackIndex(0)
            updateSong(recommendations.data.tracks[0].preview_url)
            setTrackURI(SCANNABLESURL + recommendations.data.tracks[0].uri)
            playSong()
        } catch (error) {
            if (error.name !== "AbortError") {
                console.log(error)
            }
        }
    }

    useEffect(() => {
        const abortController = new AbortController();
        checkPermissions();
        return () => abortController.abort();
    }, []);

    const prepNextTrack = () => {
        if (currentTrackIndex === recommendations.length - 1) {
            setCurrentTrackIndex(currentTrackIndex + 1)
        } else {
            let count = 1;
            let reachedEnd = false
            while (!recommendations[currentTrackIndex + count].preview_url) {
                count++;
                setTrackURI(SCANNABLESURL + recommendations[currentTrackIndex].uri)
                if (currentTrackIndex + count >= recommendations.length) {
                    reachedEnd = true;
                    setCurrentTrackIndex(currentTrackIndex + count)
                    break;
                }
            }
            if (!reachedEnd) {
                updateSong(recommendations[currentTrackIndex + count].preview_url)
            }
            setCurrentTrackIndex(currentTrackIndex + count)
            setTrackURI(SCANNABLESURL + recommendations[currentTrackIndex].uri)
            playSong()
        }
    }

    const handleReject = () => {
        pauseSong();
        prepNextTrack();
    }

    const handleLike = async () => {
        pauseSong();
        try {
            await axios.put('/like', {
                id: recommendations[currentTrackIndex].id,
            })
            prepNextTrack();
        } catch (error) {
            if (error.name !== "AbortError") {
                console.log(error)
            }
        }
    }

    const handleHome = () => {
        navigate("/");
    }

    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);

    const fetchMessage = async () => {
        try {
            const response = await axios.get('http://localhost:3000/message');
            setMessage(response.data);
            setError(null);
            console.log("RECEIVED!")
        } catch (error) {
            setError('Failed to fetch message.');
            setMessage(null);
        }
    };

    return (
        <div>
            <button onClick={fetchMessage}>Get Message</button>

            <div className="d-flex">
                <Button variant="link" className="ps-3 pt-3" onClick={handleHome}>
                    <Image style={{ animation: `spin 8s linear infinite` }} className="custom-logo" src={logo} alt="logo" />
                </Button>
            </div>
            {recommendations ?
                (currentTrackIndex < recommendations.length ?
                    <div>
                        {firstTime ?
                            <Modal
                                show={openModal}
                                onHide={() => {
                                    setOpenModal(false)
                                    updateSong(audio)
                                    playSong()
                                    setIsFirstTime(false)
                                }}
                                size="md"
                                aria-labelledby="contained-modal-title-vcenter"
                                centered
                            >
                                <Modal.Header closeButton>
                                    <Modal.Title id="contained-modal-title-vcenter">
                                        <h1 className="custom-logo-text">Spinder</h1>
                                    </Modal.Title>
                                </Modal.Header>
                                <Modal.Body>
                                    <p>
                                        Click <span><p className="custom-dislike text d-inline">X</p></span> to skip song or <span><Image className="custom-like text" src={heart} alt="like" /></span> to add to your Spotify Liked Songs
                                    </p>
                                </Modal.Body>
                                {/* <Modal.Footer>
                                <Button
                                    className='custom-btn'
                                    onClick={() => {
                                        setOpenModal(false)
                                        updateSong(audio)
                                        setIsFirstTime(false)
                                    }}>Start listening!</Button>
                            </Modal.Footer> */}
                            </Modal> :
                            null
                        }

                        <PlayerCard track={recommendations[currentTrackIndex]} audio={audio} audioRef={audioRef} trackURI={trackURI} reject={handleReject} like={handleLike} />
                    </div>

                    : (
                        <div>
                            <h1 className="mt-5 mb-3">No more tracks...</h1>
                            <Button 
                                variant="none"
                                className='custom-btn mt-3 rounded-pill ps-4 pe-4'
                                onClick={
                                    () => {
                                        fetchRecommendations();
                                    }
                                }>
                                Generate more recs
                            </Button>
                        </div>
                    ))
                :
                (
                    <div>
                        <h1 className="mt-5">Loading...</h1>
                    </div>
                )}
        </div>
    )
}