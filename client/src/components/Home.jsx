import Button from '@mui/material/Button';
import config from '../config.js'
import logo from './img/logo.png';
import Image from 'react-bootstrap/Image';

function generateRandomString(length) {
    let text = '';
    let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

async function generateCodeChallenge(codeVerifier) {
    function base64encode(string) {
        return btoa(String.fromCharCode.apply(null, new Uint8Array(string)))
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');
    }

    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    const digest = await window.crypto.subtle.digest('SHA-256', data);

    return base64encode(digest);
}

export default function Home() {
    console.log("URI : " + config.CLIENT_ID);
    console.log("URI : " + config.REDIRECT_URI);

    const handleClick = () => {
        let codeVerifier = generateRandomString(128);

        console.log("URI : " + config.CLIENT_ID);
        console.log("URI : " + config.REDIRECT_URI);
        generateCodeChallenge(codeVerifier).then(codeChallenge => {
            let state = generateRandomString(16);
            let scope = 'user-read-private user-top-read user-library-modify'; // to change

            localStorage.setItem('code_verifier', codeVerifier);

            let args = new URLSearchParams({
                response_type: 'code',
                client_id: config.CLIENT_ID,
                scope: scope,
                redirect_uri: config.REDIRECT_URI,
                state: state,
                code_challenge_method: 'S256',
                code_challenge: codeChallenge
            });

            window.location = 'https://accounts.spotify.com/authorize?' + args;
        });
    }

    return (
        <div className='custom-outer-div'>
            <Button variant="link" onClick={handleClick}>
                <div className='custom-inner-div'>
                    <h1 className='mb-3'>Spinder</h1>
                    <Image style={{animation: `spin 8s linear infinite`}} className="custom-logo-home" src={logo} alt="logo" />
                    <i className='d-block mt-4 custom-subtitle'>Click to get started</i>
                </div>
            </Button>
        </div >
    )
}