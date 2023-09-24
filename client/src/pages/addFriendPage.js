import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { fetchSpecificUserData, fetchUserData } from "../helpers/api";
import "../styles/buttons.css";
import "../styles/card.css";
import "../styles/texts.css";

function AddFriendsPage() {
  // Initialize state variables for the page
  const [senderID, setSenderID] = useState("");
  const [senderName, setSenderName] = useState("");
  const [senderImageURL, setSenderImageURL] = useState("");
  const [receiverID, setReceiverID] = useState("");

  // only set to true if unauthorized token tries to add
  const [unsuccessfulAdd, setUnsuccessfulAdd] = useState(false);
  const [friendToken, setFriendToken] = useState("");

  const location = useLocation();
  const navigate = useNavigate();

  // Fetch sender user data
  useEffect(() => {
    async function fetchSenderUserData() {
      try {
        const senderUserData = await fetchSpecificUserData(senderID);
        setSenderName(senderUserData.displayName);
        setSenderImageURL(senderUserData.profileImageUrl);
      } catch (error) {
        console.error("Error fetching sender's user data:", error);
      }
    }

    if (senderID && !unsuccessfulAdd) {
      fetchSenderUserData();
    }
  }, [senderID, unsuccessfulAdd]);

  // Fetch receiver user data
  useEffect(() => {
    async function fetchReceiverUserData() {
      try {
        const receiverUserData = await fetchUserData();
        setReceiverID(receiverUserData.id);
      } catch (error) {
        console.error("Error fetching current user data:", error);
      }
    }

    fetchReceiverUserData();
  }, []);

  // Get URL parameters and set states
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    setSenderID(queryParams.get("sender_userID"));
    setFriendToken(queryParams.get("friend_token"));
  }, [location.search]);

  // Function to handle the "Confirm" button click
  const handleConfirmClick = () => {
    // Make a GET request to /api/spotify/complete_friend_request with sender_userID as a query parameter
    fetch(
      `${process.env.REACT_APP_BACKEND_URI}/api/spotify/complete_friend_request?sender_userID=${senderID}&friend_token=${friendToken}`,
      {
        method: "GET",
        credentials: "include",
      }
    )
      .then((response) => {
        if (response.ok) {
          // Handle success
          console.log("Friend request confirmed successfully.");

          // Redirect the user to /friends_similarity
          navigate(
            `/friend_similarity?user_1=${senderID}&user_2=${receiverID}`
          );
        } else {
          // Handle errors
          console.error("Error confirming friend request.");

          // set unsuccessful state
          setUnsuccessfulAdd(true);
        }
      })
      .catch((error) => {
        console.error("Error confirming friend request:", error);
      });
  };

  return (
    <div style={{ color: "whitesmoke", textAlign: "center" }}>
      <h1>Friend Request</h1>
      {!unsuccessfulAdd && (
        <img
          src={senderImageURL}
          alt="Sender's Profile"
          className="profile-picture-large" // Add a class for the profile image
        />
      )}
      <h3>{senderID} wants to be friends with you!</h3>

      <p className="light-text">
        By accepting, they will be able to see your top songs, artists and
        genres.
      </p>
      {!unsuccessfulAdd ? (
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
          <p>
            You are not authorized to add the other user. Please ask them for a
            new link!
          </p>
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
