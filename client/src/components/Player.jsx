import React, { useState, useEffect } from "react";
import axios from 'axios';
import Button from '@mui/material/Button';

export default function Player() {
    const [recommendations, setRecommendations] = useState([]);
    const [currentTrackIndex, setCurrentTrackIndex] = useState();

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
            setCurrentTrackIndex(0)
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

    const handleReject = () => {
        setCurrentTrackIndex(currentTrackIndex + 1)
    }

    const handleLike = async () => {
        try {
            await axios.put('/like', {
                id: recommendations[currentTrackIndex].id,
            })
            console.log("Added to liked songs!")
            setCurrentTrackIndex(currentTrackIndex + 1)
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