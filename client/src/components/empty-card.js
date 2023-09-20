import React from "react";
import "../styles/card.css";

const EmptyCard = ({ message }) => {
  return (
    <div className="song-card">
      <div className="song-details">
        <h3 className="song-name">{message}</h3>
      </div>
    </div>
  );
};

export default EmptyCard;
