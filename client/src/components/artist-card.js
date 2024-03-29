import React from "react";
import "../styles/card.css";

const ArtistCard = ({ artistName, genres, artistImage, link }) => {
  return (
    <a href={link} style={{ textDecoration: "none" }}>
      <div className="song-card">
        <img
          src={artistImage}
          alt={`Profile for ${artistName}`}
          className="album-cover"
        />
        <div className="song-details">
          <img
            src="static/images/spotify-logo-big.png"
            alt="Spotify Logo"
            className="spotify-logo-big"
          />
          <h3 className="song-name">{artistName}</h3>
          <p className="artist-names">{genres.join(", ")}</p>
        </div>
      </div>
    </a>
  );
};

export default ArtistCard;
