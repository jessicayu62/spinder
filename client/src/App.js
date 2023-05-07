import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import React, { useState } from "react";
import Home from './components/Home';
import Player from './components/Player';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>

          <Route path="/" element={<Home/>} />
      
          <Route path="/callback" element={<Player/>} />

        </Routes>
      </div>
    </Router>
  );
}

export default App;
