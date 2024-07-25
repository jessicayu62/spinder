import React, { useState, useEffect, useRef } from "react";
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';

function PlayerCard({ track, audio, audioRef, trackURI, reject, like }) {
    // const displayArtists = () => {
    //     var artistNames = (() => {
    //         let artistString = '';
    //         for (let i=0; i<track.artists.length; i++) {
    //             artistString += track.artists[i].name + ", ";
    //         }
    //         return artistString;
    //     })
    //     return <Card.Text>
    //     {artistNames}
    //   </Card.Text>
    // }

    return (
        <Card className='custom-card'>
            <Card.Img variant="top" src={track.album.images[0].url} />
            <Card.Body>
                <Card.Title>{track.name}</Card.Title>

                <Card.Text>
                    {track.artists.map(artist => artist.name).join(', ')}
                </Card.Text>
                <Button variant="primary" onClick={reject}>X</Button>
                <Button variant="primary" onClick={like}>+</Button>
                <audio controls="controls" ref={audioRef}>
                    <source src={audio} type="audio/mpeg" />
                </audio>
                {trackURI ? <Card.Img src={trackURI} alt='track spotify code' /> : null}
            </Card.Body>
        </Card>
    );
}

export default PlayerCard;