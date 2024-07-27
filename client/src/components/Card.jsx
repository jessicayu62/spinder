import React, { useState, useEffect, useRef } from "react";
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import heart from './img/heart-64.png';
import Image from 'react-bootstrap/Image';

function PlayerCard({ track, audio, audioRef, trackURI, reject, like }) {
    return (
        <Card className='mx-auto custom-card mt-4 mb-4'>
            <Card.Img variant="top" src={track.album.images[0].url} />
            <Card.Body className="pb-0">
                <div className="d-flex justify-content-between pb-4">
                    <Button variant="none" className="custom-like-button" onClick={reject}>
                        <p className="custom-dislike">X</p>
                    </Button>
                    <div>
                        <Card.Title>{track.name}</Card.Title>
                        <Card.Text>
                            {track.artists.map(artist => artist.name).join(', ')}
                        </Card.Text>
                    </div>

                    <Button onClick={like} variant="link" className="custom-like-button">
                        <Image className="custom-like" src={heart} alt="like" />
                    </Button>
                </div>
                <div className="pb-2">
                    <audio controls="controls" ref={audioRef} className="custom-audio">
                        <source src={audio} type="audio/mpeg" />
                    </audio>
                </div>
                {trackURI ? <Card.Img className='custom-track-uri' src={trackURI} alt='track spotify code' /> : null}
            </Card.Body>
        </Card>
    );
}

export default PlayerCard;