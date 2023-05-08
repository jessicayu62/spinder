import React, { useState, useEffect, useRef } from "react";
import axios from 'axios';
import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};

export default function Player() {
    const [recommendations, setRecommendations] = useState([]);
    const [currentTrackIndex, setCurrentTrackIndex] = useState();
    const [openModal, setOpenModal] = useState(false);
    const [audio, setAudio] = useState('');
    const audioRef = useRef()

    const updateSong = (source) => {
        console.log("HERE")
        setAudio(source);
        if (audioRef.current) {
            // console.log("HERE")
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

            if (recommendations.data.tracks[0].preview_url) {
                setCurrentTrackIndex(0)
                updateSong(recommendations.data.tracks[0].preview_url)
            } else {
                let count = 1;
                let reachedEnd = false
                while (!recommendations[currentTrackIndex + count].preview_url) {
                    count++;
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
            }
        } catch (error) {
            if (error.name !== "AbortError") {
                console.log(error)
            }
        }
    }

    useEffect(() => {
        const abortController = new AbortController();
        fetchRecommendations();
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
            console.log("Added to liked songs!")

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
                    <Modal
                        open={openModal}
                        onClose={() => {
                            setOpenModal(false)
                            updateSong(audio)
                        }}
                        aria-labelledby="modal-modal-title"
                        aria-describedby="modal-modal-description"
                    >
                        <Box sx={style}>
                            <Typography id="modal-modal-title" variant="h6" component="h2">
                                Spinder
                            </Typography>
                            <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                                Swipe left to skip song or right to add to your Spotify likes
                            </Typography>
                            <Button variant="contained" onClick={() => {
                                setOpenModal(false)
                                updateSong(audio)
                            }}>
                                Let's start!
                            </Button>
                        </Box>
                    </Modal>
                    <img
                        src={recommendations[currentTrackIndex].album.images[0].url}
                        alt={recommendations[currentTrackIndex].album.name + " album cover"}
                    />
                    <audio controls="controls" ref={audioRef}>
                        <source src={audio} type="audio/mpeg" />
                    </audio>
                    <p>{recommendations[currentTrackIndex].name} by {recommendations[currentTrackIndex].artists[0].name}</p>

                    <Button variant="contained" onClick={handleReject}>
                        Nope, next!
                    </Button>

                    <Button variant="contained" onClick={handleLike}>
                        Add to Library
                    </Button>
                </div>
                : (
                    <div>
                        <p>No more tracks...</p>
                        <Button variant="contained" onClick={fetchRecommendations}>
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