import React, { useEffect, useState } from "react";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import Button from "react-bootstrap/Button"; // Import Button component
import Modal from "react-bootstrap/Modal"; // Import Modal component
import Cookies from "js-cookie";
import "../styles/profile-picture.css";
import "../styles/modals.css";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy, faShare } from "@fortawesome/free-solid-svg-icons";

// import helper functions
import { generateShareLink, fetchUserData } from "../helpers/api";

function MyNavbar() {
  const [hasRefTknCookie, setHasRefTknCookie] = useState(false);
  const [user, setUser] = useState({
    displayName: null,
    email: null,
    id: null,
    profileImageUrl: null,
    friends: null,
  });

  const [showShareModal, setShowShareModal] = useState(false); // State for showing the share modal
  const [shareLink, setShareLink] = useState(""); // State to store the share link

  const copyToClipboardNavbar = () => {
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
    const refTknCookie = Cookies.get("loggedIn");
    setHasRefTknCookie(!!refTknCookie);

    const fetchData = async () => {
      try {
        const userData = await fetchUserData();
        setUser((prevData) => ({
          ...prevData,
          ...userData,
        }));

        const shareLink = await generateShareLink();
        setShareLink(shareLink);
      } catch (error) {
        console.error("There was a problem with data retrieval:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <Navbar bg="dark" variant="dark">
      <Container>
        <Navbar.Brand href="/">Soundmates for Spotify</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Nav className="justify-content-end">
          {hasRefTknCookie && (
            <Nav.Link href="/friends" className="ml-lg-2 mr-lg-2">
              Friends
            </Nav.Link>
          )}
          {hasRefTknCookie && (
            <Nav.Link href="/faves" className="ml-lg-2 mr-lg-2">
              Favorites
            </Nav.Link>
          )}
          {hasRefTknCookie && (
            <div>
              {/* Use the Button component and the share icon */}
              <Button
                variant="outline-success"
                style={{
                  borderRadius: "50%",
                  marginLeft: "10px",
                  marginRight: "10px",
                }}
                className="profile-picture"
                onClick={() => {
                  setShowShareModal(true);
                }}
              >
                <FontAwesomeIcon icon={faShare} />
              </Button>
            </div>
          )}
          {hasRefTknCookie && user.profileImageUrl ? (
            <img
              src={user.profileImageUrl}
              className="profile-picture"
              alt="Profile"
            />
          ) : hasRefTknCookie ? (
            <img
              src={"/static/images/profile-placeholder.png"}
              className="profile-picture"
              alt="Profile"
            />
          ) : (
            <div></div>
          )}
        </Nav>
        {!hasRefTknCookie && (
          <a
            href={`${process.env.REACT_APP_BACKEND_URI}/api/spotify/login`}
            className="btn btn-primary"
            style={{
              backgroundColor: "black",
              border: "1px solid #1DB954",
            }}
          >
            Connect{" "}
            <img
              style={{ width: "3.5vh", height: "3.5vh" }}
              src={"/static/images/spotify-logo.png"}
              alt="Spotify Logo"
            />
          </a>
        )}

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
                  onClick={copyToClipboardNavbar}
                  style={{ marginLeft: "10px" }}
                >
                  <FontAwesomeIcon icon={faCopy} /> {/* Copy symbol */}
                </button>
              </div>
            </div>
          </Modal.Body>
        </Modal>
      </Container>
    </Navbar>
  );
}

export default MyNavbar;
