import React, { useState, useEffect } from "react";
import "../styles/CircularButton.css";
import SongCard from "../components/song-card";
import ArtistCard from "../components/artist-card";
import "../styles/Tab.css"; // Import the CSS file
import "../styles/scroll-bars.css";
import "../styles/card.css";

function FavesPage() {
  // set up state variables
  const [songData, setSongData] = useState({
    short_term: null,
    medium_term: null,
    long_term: null,
  });
  const [artistData, setArtistData] = useState({
    short_term: null,
    medium_term: null,
    long_term: null,
  });

  const [requestMade, setRequestMade] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("short_term"); // Initialize with the default tab
  const [activeTypeTab, setActiveTypeTab] = useState("artists"); // Initialize with the default tab

  // Function to make the API request
  const fetchUserFavorites = async () => {
    setLoading(true); // Set loading to true when starting the request

    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URI}/api/spotify/favorites`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error(
          "Network response was not ok: Could not fetch user favorites"
        );
      }

      const result = await response.json();

      const parsedResult = {
        artists_long_term: [],
        artists_medium_term: [],
        artists_short_term: [],
        songs_long_term: [],
        songs_medium_term: [],
        songs_short_term: [],
      };

      // Loop through the JSON data to extract the required items
      for (const item of result) {
        if (item.hasOwnProperty("artists_long_term")) {
          parsedResult["artists_long_term"] = item.artists_long_term;
        }
        if (item.hasOwnProperty("artists_medium_term")) {
          parsedResult["artists_medium_term"] = item.artists_medium_term;
        }
        if (item.hasOwnProperty("artists_short_term")) {
          parsedResult["artists_short_term"] = item.artists_short_term;
        }
        if (item.hasOwnProperty("songs_long_term")) {
          parsedResult["songs_long_term"] = item.songs_long_term;
        }
        if (item.hasOwnProperty("songs_medium_term")) {
          parsedResult["songs_medium_term"] = item.songs_medium_term;
        }
        if (item.hasOwnProperty("songs_short_term")) {
          parsedResult["songs_short_term"] = item.songs_short_term;
        }
      }

      // update state vars
      setSongData((prevData) => ({
        ...prevData,
        short_term: parsedResult.songs_short_term,
        medium_term: parsedResult.songs_medium_term,
        long_term: parsedResult.songs_long_term,
      }));

      setArtistData((prevData) => ({
        ...prevData,
        short_term: parsedResult.artists_short_term,
        medium_term: parsedResult.artists_medium_term,
        long_term: parsedResult.artists_long_term,
      }));

      // Update state with the API response data
    } catch (error) {
      console.error("There was a problem with the fetch operation:", error);
    } finally {
      setLoading(false); // Set loading to false when the request is complete
    }
  };

  useEffect(() => {
    fetchUserFavorites();
    setRequestMade(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array ensures this effect runs once, on component mount

  return (
    <header className="App-header">
      <div>
        {loading ? (
          <div>Loading...</div>
        ) : requestMade ? (
          <div>
            <h2 style={{ color: "whitesmoke" }}>Your Favorites:</h2>
            <div
              style={{
                paddingBottom: "10px",
              }}
            >
              <div className="tabs">
                {/* Artists Tab */}
                <button
                  className={`tab ${
                    activeTypeTab === "artists" ? "active" : ""
                  }`}
                  onClick={() => setActiveTypeTab("artists")}
                >
                  Artists
                </button>

                {/* Songs Tab */}
                <button
                  className={`tab ${activeTypeTab === "songs" ? "active" : ""}`}
                  onClick={() => setActiveTypeTab("songs")}
                >
                  Songs
                </button>
              </div>
            </div>
            <div style={{ paddingBottom: "10px" }}>
              <div className="tabs">
                {/* Short Term Tab */}
                <button
                  className={`tab ${
                    activeTab === "short_term" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("short_term")}
                >
                  Short Term
                </button>

                {/* Medium Term Tab */}
                <button
                  className={`tab ${
                    activeTab === "medium_term" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("medium_term")}
                >
                  Medium Term
                </button>

                {/* Long Term Tab */}
                <button
                  className={`tab ${activeTab === "long_term" ? "active" : ""}`}
                  onClick={() => setActiveTab("long_term")}
                >
                  Long Term
                </button>
              </div>
            </div>
            <div className="card-container custom-scrollbar">
              {activeTypeTab === "songs"
                ? songData[activeTab] &&
                  songData[activeTab].map((song, index) => (
                    <SongCard key={index} {...song} />
                  ))
                : songData[activeTab] &&
                  artistData[activeTab].map((artist, index) => (
                    <ArtistCard key={index} {...artist} />
                  ))}
            </div>
          </div>
        ) : (
          <div> Display if no refresh or access token. Please Log in</div>
        )}
      </div>
    </header>
  );
}

export default FavesPage;
