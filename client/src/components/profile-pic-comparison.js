import React from "react";
import "../styles/profile-picture.css";

function ProfilePicComparison({ imageUrl1, imageUrl2, user1, user2 }) {
  return (
    <div className="profile-comparison">
      <div>
        <img
          src={imageUrl1 ? imageUrl1 : "/static/images/profile-placeholder.png"}
          alt="Profile 1"
          className="profile-picture-medium"
        />
        <h3>{user1}</h3>
      </div>
      <div className="arrow">&#x2194;</div>
      <div>
        <img
          src={imageUrl2 ? imageUrl2 : "/static/images/profile-placeholder.png"}
          alt="Profile 2"
          className="profile-picture-medium"
        />
        <h3>{user2}</h3>
      </div>
    </div>
  );
}

export default ProfilePicComparison;
