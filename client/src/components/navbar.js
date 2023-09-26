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
import {
  generateShareLink,
  fetchUserData,
  logOut,
  removeUserData,
  checkIfLoggedIn,
} from "../helpers/api";

function MyNavbar() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState({
    displayName: null,
    email: null,
    id: null,
    profileImageUrl: null,
    friends: null,
  });

  const [showShareModal, setShowShareModal] = useState(false); // State for showing the share modal
  const [showProfileModal, setShowProfileModal] = useState(false);
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

  const handleLogout = async () => {
    // Handle the logout action here
    // For example, you can clear cookies, log the user out, etc.
    // Then redirect the user to the login page or wherever you want.

    const logOutResponse = await logOut();

    console.log("Log out response: " + logOutResponse.message);
    setShowProfileModal(false);

    // send to home
    window.location.href = "/";
  };

  const handleRemoveDataAndLogout = async () => {
    // Handle the remove data and logout action here
    // This could involve clearing user data and logging them out
    // Then redirect the user to the login page or wherever you want.

    const removeUserDataMsg = await removeUserData();

    console.log("Remove data response: " + removeUserDataMsg.message);

    const logOutResponse = await logOut();
    console.log("Log out response: " + logOutResponse.message);
    setShowProfileModal(false);

    // send to home
    window.location.href = "/";
  };

  useEffect(() => {
    console.log("Navbar useEffect ran");
    const sessionStorageLoggedIn = sessionStorage.getItem("loggedIn");
    const isLoggedIn = sessionStorageLoggedIn === "true";
    setLoggedIn(isLoggedIn);

    const fetchData = async () => {
      try {
        const loggedIn = await checkIfLoggedIn();

        if (loggedIn) {
          const userData = await fetchUserData();
          setUser((prevData) => ({
            ...prevData,
            ...userData,
          }));

          // if get user data - set logged in to true
          if (userData.id) {
            setLoggedIn(true);
          }
        }
      } catch (error) {
        console.error("There was a problem with data retrieval:", error);
      }
    };

    fetchData();
  }, [loggedIn]);

  return (
    <Navbar bg="dark" variant="dark">
      <Container>
        <Navbar.Brand href="/">
          {" "}
          <img
            src="favicon.ico"
            alt="Logo"
            width="30"
            height="30"
            className="d-inline-block align-top"
          />{" "}
          Soundmates for Spotify
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Nav className="justify-content-end">
          {loggedIn && (
            <Nav.Link href="/friends" className="ml-lg-2 mr-lg-2">
              Friends
            </Nav.Link>
          )}
          {loggedIn && (
            <Nav.Link href="/faves" className="ml-lg-2 mr-lg-2">
              Favorites
            </Nav.Link>
          )}
          {loggedIn && (
            <div>
              {/*share button*/}
              <Button
                variant="outline-success"
                style={{
                  borderRadius: "50%",
                  marginLeft: "10px",
                  marginRight: "10px",
                  color: "#1DB954",
                  borderColor: "#1DB954",
                }}
                className="profile-picture"
                onClick={async () => {
                  try {
                    const shareLink = await generateShareLink();
                    setShareLink(shareLink);
                  } catch (error) {
                    console.error("Error generating share link:", error);
                  }

                  setShowShareModal(true);
                }}
              >
                <FontAwesomeIcon icon={faShare} />
              </Button>
            </div>
          )}
          {loggedIn ? (
            <img
              src={
                user.profileImageUrl || "/static/images/profile-placeholder.png"
              }
              className="profile-picture"
              alt="Profile"
              onClick={() => setShowProfileModal(true)}
            />
          ) : (
            <div></div>
          )}
        </Nav>
        {!loggedIn && (
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
              src="/static/images/spotify-logo.png"
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

        {/* Profile Modal */}
        <Modal
          show={showProfileModal}
          onHide={() => setShowProfileModal(false)}
          dialogClassName="dark-theme-modal"
        >
          <Modal.Header closeButton>
            <Modal.Title>Profile Options</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="d-grid gap-2">
              <Button
                variant="outline-danger"
                onClick={handleRemoveDataAndLogout}
                size="lg"
              >
                Remove All Data and Log Out
              </Button>
              <Button variant="danger" onClick={handleLogout} size="lg">
                Log Out
              </Button>
            </div>
          </Modal.Body>
        </Modal>
      </Container>
    </Navbar>
  );
}

export default MyNavbar;
