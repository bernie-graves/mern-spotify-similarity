import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { fetchSpecificUserData, fetchUserData } from "../helpers/api";
import "../styles/buttons.css";
import "../styles/card.css";
import "../styles/texts.css";

function AddFriendsPage() {
  // Initialize state variables for the page
  const [senderID, setSenderID] = useState("");
  const [senderName, setSenderName] = useState("");
  const [senderImageURL, setSenderImageURL] = useState("");
  const [recieverID, setRecieverID] = useState("");
  const [recieverName, setRecieverName] = useState("");
  const [authState, setAuthState] = useState("");

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Get URL parameters and set states
    const queryParams = new URLSearchParams(location.search);
    setSenderID(queryParams.get("sender_userID"));
    setAuthState(queryParams.get("auth_state"));

    // Fetch sender user data if authorized codes match
    if (authState === Cookies.get("authState")) {
      // Fetch sender's user data
      fetchSpecificUserData(senderID)
        .then((senderUserData) => {
          setSenderName(senderUserData.displayName);
          setSenderImageURL(senderUserData.profileImageUrl);
        })
        .catch((error) => {
          console.error("Error fetching sender's user data:", error);
        });

      // Fetch receiver's user data
      fetchUserData()
        .then((receiverUserData) => {
          setRecieverID(receiverUserData.id);
          setRecieverName(receiverUserData.displayName);
        })
        .catch((error) => {
          console.error("Error fetching current user data:", error);
        });
    }
  }, [location.search, senderID, authState]);

  // Function to handle the "Confirm" button click
  const handleConfirmClick = () => {
    // Make a GET request to /api/spotify/complete_friend_request with sender_userID as a query parameter
    fetch(`/api/spotify/complete_friend_request?sender_userID=${senderID}`)
      .then((response) => {
        if (response.ok) {
          // Handle success
          console.log("Friend request confirmed successfully.");

          // Redirect the user to /friends_similarity
          navigate(
            `/friend_similarity?user_1=${senderID}&user_2=${recieverID}`
          );
        } else {
          // Handle errors
          console.error("Error confirming friend request.");
        }
      })
      .catch((error) => {
        console.error("Error confirming friend request:", error);
      });
  };

  return (
    <div style={{ color: "whitesmoke", textAlign: "center" }}>
      <h1>Friend Request</h1>
      {authState === Cookies.get("authState") && (
        <img
          src={senderImageURL}
          alt="Sender's Profile"
          className="profile-picture-large" // Add a class for the profile image
        />
      )}
      <h3>{senderName} wants to be friends with you!</h3>

      <p className="light-text">
        By accepting, they will be able to see your top songs, artists and
        genres.
      </p>
      {authState === Cookies.get("authState") ? (
        <div>
          {/* "Add Friend" button */}
          <button
            onClick={handleConfirmClick}
            className="friend-button add-friend-button" // Add classes for styling
          >
            Add Friend
          </button>
          <br />
          {/* "Cancel" button */}
          <button
            onClick={() => navigate("/")}
            className="friend-button cancel-button" // Add classes for styling
          >
            Cancel
          </button>
        </div>
      ) : (
        <div>
          <p>You are not allowed to add the other user.</p>
          <button
            onClick={() => navigate("/")}
            className="friend-button cancel-button" // Add classes for styling
          >
            Back to Home
          </button>
        </div>
      )}
    </div>
  );
}

export default AddFriendsPage;
