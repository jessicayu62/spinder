import React, { useState, useEffect, useRef } from "react";
import axios from 'axios';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import PlayerCard from "./Card";
// const style = {
//     position: 'absolute',
//     top: '50%',
//     left: '50%',
//     transform: 'translate(-50%, -50%)',
//     width: 400,
//     bgcolor: 'background.paper',
//     border: '2px solid #000',
//     boxShadow: 24,
//     p: 4,
// };
const SCANNABLESURL = 'https://scannables.scdn.co/uri/plain/png/00FFFFFF/black/640/';

export default function Player() {
    const [recommendations, setRecommendations] = useState(undefined);
    const [currentTrackIndex, setCurrentTrackIndex] = useState();
    const [openModal, setOpenModal] = useState(false);
    const [audio, setAudio] = useState('');
    const [trackURI, setTrackURI] = useState(null);
    const audioRef = useRef()
    const [firstTime, setIsFirstTime] = useState(true);

    const updateSong = (source) => {
        setAudio(source);
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.load();
            audioRef.current.play();
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
            setOpenModal(true)

            setCurrentTrackIndex(0)
            updateSong(recommendations.data.tracks[0].preview_url)
            setTrackURI(SCANNABLESURL + recommendations.data.tracks[0].uri)
            // if (recommendations.data.tracks[0].preview_url) {
            //     setCurrentTrackIndex(0)
            //     updateSong(recommendations.data.tracks[0].preview_url)
            //     setTrackURI(SCANNABLESURL + recommendations[currentTrackIndex].uri)
            // } else {
            //     let count = 1;
            //     let reachedEnd = false
            //     while (!recommendations[currentTrackIndex + count].preview_url) {
            //         count++;
            //         if (currentTrackIndex + count >= recommendations.length) {
            //             reachedEnd = true;
            //             setCurrentTrackIndex(currentTrackIndex + count)
            //             break;
            //         }
            //     }
            //     if (!reachedEnd) {
            //         updateSong(recommendations[currentTrackIndex + count].preview_url)
            //     }
            //     setCurrentTrackIndex(currentTrackIndex + count)
            // }
        } catch (error) {
            if (error.name !== "AbortError") {
                console.log(error)
            }
        }
    }

    useEffect(() => {
        const abortController = new AbortController();
        fetchRecommendations();
        console.log('i fire once');
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
        }
    }

    const handleReject = () => {
        prepNextTrack();
    }

    const handleLike = async () => {
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

    return (
        recommendations ?
            (currentTrackIndex < recommendations.length ?
                <div>
                    {firstTime ?
                        <Modal
                            show={openModal}
                            onHide={() => {
                                setOpenModal(false)
                                updateSong(audio)
                            }}
                            size="md"
                            aria-labelledby="contained-modal-title-vcenter"
                            centered
                        >
                            <Modal.Header closeButton>
                                <Modal.Title id="contained-modal-title-vcenter">
                                    Spinder
                                </Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                <p>
                                    Click X to skip song or + to add to your Spotify Liked Songs
                                </p>
                            </Modal.Body>
                            <Modal.Footer>
                                <Button
                                    className='custom-btn'
                                    onClick={() => {
                                        setOpenModal(false)
                                        updateSong(audio)
                                        setIsFirstTime(false)
                                    }}>Start listening!</Button>
                            </Modal.Footer>
                        </Modal> :
                        null
                    }

                    <PlayerCard track={recommendations[currentTrackIndex]} audio={audio} audioRef={audioRef} trackURI={trackURI} reject={handleReject} like={handleLike}/>
                    {/* <img
                        src={recommendations[currentTrackIndex].album.images[0].url}
                        alt={recommendations[currentTrackIndex].album.name + " album cover"}
                    />
                    <audio controls="controls" ref={audioRef}>
                        <source src={audio} type="audio/mpeg" />
                    </audio>
                    <p>{recommendations[currentTrackIndex].name} by {recommendations[currentTrackIndex].artists[0].name}</p>

                    <Button
                        className='custom-btn'
                        onClick={handleReject}>
                        Nope, next!
                    </Button>

                    <Button
                        className='custom-btn'
                        onClick={handleLike}>
                        Add to Library
                    </Button>

                    {trackURI ? <img src={trackURI} alt='track spotify code' /> : null} */}

                </div>

                : (
                    <div>
                        <p>No more tracks...</p>
                        <Button
                            className='custom-btn'
                            onClick={
                                () => {
                                    fetchRecommendations()
                                    setRecommendations(undefined)
                                }
                            }>
                            Generate more recs
                        </Button>
                    </div>
                ))
            :
            (
                <div>
                    <p>Loading...</p>
                </div>
            )
    )
}