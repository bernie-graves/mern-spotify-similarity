import React, { useState } from "react";
import SimilarityScoreDisplay from "./similarity-score-display";
import SongCard from "./song-card";
import ArtistCard from "./artist-card";
import GenreTable from "./genre-table";
import EmptyCard from "./empty-card";
import SpotifyLogo from "../images/spotify-logo.png";
import "../styles/SingleTermSimilarityDisplay.css";
import "../styles/buttons.css";
import "../styles/modals.css";

// bootstrap components
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
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

  const [playlistSongs, setPlaylistSongs] = useState([
    {
      songName: "I See Fire",
      artistNames: ["Ed Sheeran"],
      albumCover:
        "https://i.scdn.co/image/ab67616d0000b27381ef6477bfe32dc55845ef27",
      songID: "1fu5IQSRgPxJL2OTP7FVLW",
    },
    {
      songName: "Jesus, Take the Wheel",
      artistNames: ["Carrie Underwood"],
      albumCover:
        "https://i.scdn.co/image/ab67616d0000b273724bd326692d222c5906b0b0",
      songID: "3lec3CzDPAxsZokPph5w87",
    },
    {
      songName: "All On Me",
      artistNames: ["Devin Dawson"],
      albumCover:
        "https://i.scdn.co/image/ab67616d0000b273b1261197f41e760583df46bb",
      songID: "2mfahQ0EaaZWq4cFNg6A1o",
    },
    {
      songName: "Honky Tonk Man",
      artistNames: ["Dwight Yoakam"],
      albumCover:
        "https://i.scdn.co/image/ab67616d0000b27311725f6fc4f26efec0914c5f",
      songID: "60Vbhlv3GUL8fNt3LLZ1nH",
    },
  ]);

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
        const result = await response.json();
        setPlaylistSongs((prev_state) => [...prev_state, result.playlistSongs]);
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
          <h4
            style={{
              paddingBottom: "10px",
            }}
          >
            Score
          </h4>
          <SimilarityScoreDisplay score={score} radius={75} strokeWidth={10} />

          <button
            className="circular-button"
            onClick={sendGeneratePlaylistRequest}
          >
            <span>Generate Playlist</span>
            <img
              style={{ width: "4.5vh", height: "4.5vh" }}
              src={SpotifyLogo}
              alt="Spotify Logo"
            />
          </button>
        </div>
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
