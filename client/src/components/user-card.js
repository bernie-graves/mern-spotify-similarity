import React from "react";
import "../styles/card.css";

const UserCard = ({ userID, displayName, userImageUrl }) => {
  return (
    <div className="song-card">
      <img
        src={userImageUrl}
        alt={`Profile for ${userID}`}
        className="profile-picture"
      />
      <div className="song-details">
        <h3 className="song-name">{displayName}</h3>
        <p className="artist-names">{userID}</p>
      </div>
    </div>
  );
};

export default UserCard;
