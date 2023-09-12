import React from "react";
import "../styles/song-card.css";

const ArtistCard = ({ artistName, genres, artistImage }) => {
  return (
    <div className="song-card">
      <img
        src={artistImage}
        alt={`Profile for ${artistName}`}
        className="album-cover"
      />
      <div className="song-details">
        <h3 className="song-name">{artistName}</h3>
        <p className="artist-names">{genres.join(", ")}</p>
      </div>
    </div>
  );
};

export default ArtistCard;
