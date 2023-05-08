import express from "express";
import config from './config.js';
import bodyParser from "body-parser";
import fetch from 'node-fetch';

const PORT = process.env.PORT || 3001;

const app = express();

// create application/json parser
const jsonParser = bodyParser.json()

var access_token;

app.post('/callback', jsonParser, async (req, res) => {
    const body = new URLSearchParams({
        grant_type: 'authorization_code',
        code: req.body.code,
        redirect_uri: config.REDIRECT_URI,
        client_id: config.CLIENT_ID,
        code_verifier: req.body.code_verifier
    });

    fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: body
    })
        .then(response => { return response.json() })
        .then(data => {
            if (data.access_token) {
                access_token = data.access_token;
            }
        })
        .catch(error => {
            console.error('Error:', error);
            res.status(res.statusCode).send('Failed to create access token');
        });
    res.status(res.statusCode).end();
});

const getTop = async (type, limit, results) => {
    const body = new URLSearchParams({
        time_range: 'short_term',
        limit: limit,
    });

    await fetch(`https://api.spotify.com/v1/me/top/${type}?${body}`, {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + access_token
        },
    })
        .then(response => response.json())
        .then(data => {
            data.items.forEach(item => results.push(item.id))
            return data;
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

app.get('/recommendations', (req, res) => {
    const top_artists = [];
    const top_tracks = [];

    const promiseCollection = [];
    const fetchArtists = getTop("artists", 3, top_artists);
    const fetchTracks = getTop("tracks", 2, top_tracks);

    promiseCollection.push(fetchArtists, fetchTracks);
    Promise.all(promiseCollection).then(() => {
        const body = new URLSearchParams({
            limit: 10,
            market: 'US',
            seed_artists: top_artists.join(','),
            seed_tracks: top_tracks.join(','),
        });

        fetch(`https://api.spotify.com/v1/recommendations?${body}`, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + access_token
            },
        })
            .then(response => response.json())
            .then(data => {
                res.json(data)
            })
            .catch(error => {
                console.error('Error:', error);
            });
    })
});

app.put('/like', jsonParser, async (req, res) => {
    const body = new URLSearchParams({
        ids: req.body.id,
    })

    await fetch(`https://api.spotify.com/v1/me/tracks?${body}`, {
        method: 'PUT',
        headers: {
            'Authorization': 'Bearer ' + access_token,
            'Content-Type': 'application/json'
        },
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error('Something went wrong');
            }
        })
        .catch((error) => {
            console.log(error)
        });
    res.status(res.statusCode).end();
});

app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});