import React, { useState, useEffect } from "react";
import SimilarityScoreDisplay from "./similarity-score-display";
import SongCard from "./song-card";
import ArtistCard from "./artist-card";
import GenreTable from "./genre-table";
import EmptyCard from "./empty-card";
// import SpotifyLogo from "../images/spotify-logo.png";
import "../styles/SingleTermSimilarityDisplay.css";
import "../styles/buttons.css";
import "../styles/modals.css";

// bootstrap components
import Modal from "react-bootstrap/Modal";
import Spinner from "react-bootstrap/Spinner";

const SingleTermSimilarityDisplay = ({
  score,
  songs,
  artists,
  genres,
  user1,
  user2,
  term,
}) => {
  const [selectedTab, setSelectedTab] = useState("songs");

  // state vars to handle playlist generation request
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [radius, setRadius] = useState(75); // Default radius for desktop

  useEffect(() => {
    // Check the screen width and set the radius accordingly
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setRadius(50); // Set a smaller radius for mobile
      } else {
        setRadius(75); // Set the default radius for desktop
      }
    };

    // Add a listener to window resize events
    window.addEventListener("resize", handleResize);

    // Call handleResize initially to set the correct radius on component mount
    handleResize();

    // Clean up the event listener on component unmount
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const sendGeneratePlaylistRequest = async () => {
    try {
      setLoading(true);

      // Define your data structure
      const data = {
        songs: songs,
        artists: artists,
        genres: genres,
        user1: user1,
        user2: user2,
        term: term,
      };

      // Send the POST request
      const response = await fetch("/api/spotify/generate-playlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data), // Convert data to JSON string
      });

      if (response.ok) {
        // Request was successful
        // const result = await response.json();
        setSuccess(true);
      } else {
        // Request failed
        console.error("Failed to generate playlist:", response.statusText);
        setSuccess(false);
      }
    } catch (error) {
      console.error("Error sending generate playlist request:", error);
      setSuccess(false);
    } finally {
      setLoading(false);
      setShowModal(true);
    }
  };

  // function to close modal
  const handleClose = () => {
    setShowModal(false);
  };

  let content;

  if (selectedTab === "songs") {
    content = (
      <div>
        {songs.length > 0 ? (
          songs.map((song, index) => (
            <SongCard
              key={index}
              songName={song.songName}
              artistNames={song.artistNames}
              albumCover={song.albumCover}
            />
          ))
        ) : (
          <EmptyCard message={"No Shared Songs :("} />
        )}
      </div>
    );
  } else if (selectedTab === "artists") {
    content = (
      <div>
        {artists.length > 0 ? (
          artists.map((artist, index) => (
            <ArtistCard
              key={index}
              artistName={artist.artistName}
              genres={artist.genres}
              artistImage={artist.artistImage}
            />
          ))
        ) : (
          <EmptyCard message={"No Shared Artists :("} />
        )}
      </div>
    );
  } else if (selectedTab === "genres") {
    content = (
      <div>
        {Object.keys(genres).length > 0 ? (
          <GenreTable genreData={genres} user1={user1} user2={user2} />
        ) : (
          <EmptyCard message={"No Shared Genres :("} />
        )}
      </div>
    );
  }

  return (
    <div className="container">
      <Modal
        show={showModal}
        onHide={handleClose}
        dialogClassName="dark-theme-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>Generate Playlist</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {loading ? (
            <div className="text-center">
              <Spinner animation="border" variant="primary" />
              <p>Loading...</p>
            </div>
          ) : (
            <div className="text-center">
              {success ? (
                <p>
                  Success! Check your spotify library to find your new playlist!
                </p>
              ) : (
                <p>{"Could not create playlist :( Please try again"}</p>
              )}
            </div>
          )}
        </Modal.Body>
      </Modal>
      <div className="left-panel">
        <div className="similarity-score">
          <SimilarityScoreDisplay
            score={score}
            radius={radius}
            strokeWidth={10}
          />
        </div>

        <button
          className="circular-button"
          onClick={sendGeneratePlaylistRequest}
        >
          <span>Generate Playlist</span>
          <img
            style={{ width: "4.5vh", height: "4.5vh" }}
            src={"/images/spotify-logo.png"}
            alt="Spotify Logo"
          />
        </button>
      </div>
      <div className="right-panel">
        <div className="label">Shared Tastes</div>
        <div className="tabs">
          {/* Tabs */}
          <button
            className={`tab ${selectedTab === "songs" ? "active" : ""}`}
            onClick={() => setSelectedTab("songs")}
          >
            Songs
          </button>
          <button
            className={`tab ${selectedTab === "artists" ? "active" : ""}`}
            onClick={() => setSelectedTab("artists")}
          >
            Artists
          </button>
          <button
            className={`tab ${selectedTab === "genres" ? "active" : ""}`}
            onClick={() => setSelectedTab("genres")}
          >
            Genres
          </button>
        </div>
        <div className="content">{content}</div>
      </div>
    </div>
  );
};

export default SingleTermSimilarityDisplay;
