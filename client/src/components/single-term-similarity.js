import React, { useState } from "react";
import SimilarityScoreDisplay from "./similarity-score-display";
import SongCard from "./song-card";
import ArtistCard from "./artist-card";
import GenreTable from "./genre-table";
import EmptyCard from "./empty-card";
import "../styles/SingleTermSimilarityDisplay.css";

const SingleTermSimilarityDisplay = ({
  score,
  songs,
  artists,
  genres,
  user1,
  user2,
}) => {
  const [selectedTab, setSelectedTab] = useState("songs");

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
      <div className="left-panel">
        <div className="similarity-score">
          <SimilarityScoreDisplay score={score} radius={75} strokeWidth={10} />
          <h4>Score</h4>
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
