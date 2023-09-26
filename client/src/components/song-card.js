import React from "react";
import "../styles/card.css";

const SongCard = ({ songName, artistNames, albumCover, link }) => {
  return (
    <a href={link} style={{ textDecoration: "none" }}>
      <div className="song-card">
        <img
          src={albumCover}
          alt={`Album cover for ${songName}`}
          className="album-cover"
        />
        <div className="song-details">
          <img
            src="static/images/spotify-logo-big.png"
            alt="Spotify Logo"
            className="spotify-logo-big"
          />
          <h3 className="song-name">{songName}</h3>
          <p className="artist-names">{artistNames.join(", ")}</p>
        </div>
      </div>
    </a>
  );
};

export default SongCard;
