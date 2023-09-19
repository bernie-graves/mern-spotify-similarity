import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchUserData, generateShareLink } from "../helpers/api";
import FriendCard from "../components/friend-card.js";
import "../styles/buttons.css";
import "../styles/card.css";

import Modal from "react-bootstrap/Modal"; // Import Modal component

// icon for + button
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faCopy } from "@fortawesome/free-solid-svg-icons";

function FriendsPage() {
  const [userData, setUserData] = useState(null);

  const [showShareModal, setShowShareModal] = useState(false); // State for showing the share modal
  const [shareLink, setShareLink] = useState(""); // State to store the share link
  const navigate = useNavigate(); // Create a history object

  const copyToClipboardFriends = () => {
    // Create a temporary input element to copy text to the clipboard
    const tempInput = document.createElement("input");
    tempInput.value = shareLink;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand("copy");
    document.body.removeChild(tempInput);
    alert("Link copied to clipboard!");
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await fetchUserData();
        setUserData(data);

        const shareLink = await generateShareLink();
        setShareLink(shareLink);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    }

    fetchData();
  }, []);

  return (
    <div>
      <div className="my-friends-row">
        {/* My Friends label and horizontal line */}
        <div className="my-friends-label">
          <h3>My Friends</h3>
          <hr className="line" />
        </div>
        {/* Plus icon button */}
        <button
          className="add-friends-button"
          style={{ paddingTop: "40px" }}
          onClick={() => {
            setShowShareModal(true);
          }}
        >
          <FontAwesomeIcon icon={faPlus} />
        </button>
      </div>
      <hr className="line" />
      <div className="friends-list">
        {/* Map through the 'friends' array and render FriendCard for each friend */}
        {userData &&
          userData.friends.map((friend) => (
            <FriendCard
              key={friend.id}
              friendID={friend.id}
              displayName={friend.displayName}
              profileImageUrl={friend.profileImageUrl}
              onClick={() => {
                navigate(
                  `/friend_similarity?user_1=${userData.id}&user_2=${friend.id}`
                );
              }}
            />
          ))}
      </div>

      {/* Share Modal */}
      <Modal
        show={showShareModal}
        onHide={() => setShowShareModal(false)}
        dialogClassName="dark-theme-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>Share Link</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Share this link with your friends:</p>
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              value={shareLink}
              readOnly
              style={{ borderRadius: "5px" }}
            />
            <div className="input-group-append">
              <button
                className="btn btn-primary"
                onClick={copyToClipboardFriends}
                style={{ marginLeft: "10px" }}
              >
                <FontAwesomeIcon icon={faCopy} /> {/* Copy symbol */}
              </button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default FriendsPage;
