import React from "react";
import './App.css';
import config from './config.js'
import Button from '@mui/material/Button';

function App() {
  // const [data, setData] = React.useState(null);
  const url = `https://accounts.spotify.com/authorize?client_id=${config.CLIENT_ID}&response_type=code&redirect_uri=${config.REDIRECT_URI}`

  // React.useEffect(() => {
  //   fetch("/login")
  //     // .then((res) => res.json())
  //     // .then((data) => setData(data.message));
  // }, []);
  
  const handleLogin = () => {
    window.location.href = url;
    const urlParams = new URLSearchParams(window.location.search);
    let code = urlParams.get('code');
    console.log(code);
  }

  return (
    <div className="App">
      <header className="App-header">
        <Button onClick={handleLogin} variant="outlined">
          Login
        </Button>
      </header>
    </div>
  );
}

export default App;
