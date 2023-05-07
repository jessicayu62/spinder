import React, { useState, useEffect } from "react";
import axios from 'axios';

export default function Player() {
    const [recommendations, setRecommendations] = useState([]);
    // const [code, setCode] = useState('');
    // const [codeVerifier, setCodeVerifier] = useState('');

    // useEffect(() => {
    //     const urlParams = new URLSearchParams(window.location.search);
    //     setCode(urlParams.get('code'));
    //     setCodeVerifier(localStorage.getItem('code_verifier'));
    // }, [])

    // const getCode = () => {
    //     const urlParams = new URLSearchParams(window.location.search);
    //     return urlParams.get('code');
    // }

    // let code_verifier = localStorage.getItem('code_verifier');
    // let code = getCode();

    useEffect(() => {
        const abortController = new AbortController();

        async function fetchRecommendations() {
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
            } catch (error) {
                if (error.name !== "AbortError") {
                console.log(error)
                }
            }
        }

        fetchRecommendations();
        return () => abortController.abort();
    }, []);


    return (
        recommendations ?
            (<div>
                {recommendations.map((rec) => (
                    <p>{rec.name} by {rec.artists[0].name}</p>
                ))}
            </div>)
            :
            (<p>Loading...</p>)

    )
}