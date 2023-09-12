import React from "react";
import "../styles/song-card.css";

const SongCard = ({ songName, artistNames, albumCover }) => {
  return (
    <div className="song-card">
      <img
        src={albumCover}
        alt={`Album cover for ${songName}`}
        className="album-cover"
      />
      <div className="song-details">
        <h3 className="song-name">{songName}</h3>
        <p className="artist-names">{artistNames.join(", ")}</p>
      </div>
    </div>
  );
};

export default SongCard;


