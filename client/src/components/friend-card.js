import React from "react";
import PropTypes from "prop-types";
// import ProfilePlaceholder from "/images/profile-placeholder.png";

import "../styles/card.css"; // You can create a separate CSS file for styling

function FriendCard({ friendID, displayName, profileImageUrl, onClick }) {
  return (
    <div className="friend-card" onClick={onClick}>
      <div className="friend-info">
        <div className="display-name">{displayName}</div>
        <div className="friend-id">{friendID}</div>
      </div>
      <div className="profile-image">
        {profileImageUrl === null ? (
          <img src={"/images/profile-placeholder.png"} alt={displayName} />
        ) : (
          <img src={profileImageUrl} alt={displayName} />
        )}
      </div>
    </div>
  );
}

FriendCard.propTypes = {
  friendID: PropTypes.string.isRequired,
  displayName: PropTypes.string.isRequired,
  profileImageUrl: PropTypes.string,
  onClick: PropTypes.func.isRequired, // Define onClick as a required function prop
};

export default FriendCard;
