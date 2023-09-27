import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  fetchUserData,
  fetchSpecificUserData,
  fetchSimilarityData,
} from "../helpers/api";

import SimilarityScoreDisplay from "../components/similarity-score-display";
import ProfilePicComparison from "../components/profile-pic-comparison";
import SingleTermSimilarityDisplay from "../components/single-term-similarity";

function FriendsSimilarityPage() {
  const [user1_ID, setUser1_ID] = useState();
  const [user1_ImageURL, setUser1_ImageURL] = useState();
  const [user2_ID, setUser2_ID] = useState();
  const [user2_ImageURL, setUser2_ImageURL] = useState();
  const [isUser1, setIsUser1] = useState();
  const [isUser2, setIsUser2] = useState();
  const [user2InUser1FriendsList, setUser2InUser1FriendsList] = useState();
  const [user1InUser2FriendsList, setUser1InUser2FriendsList] = useState();
  const [loading, setLoading] = useState(true); // Add loading state

  const location = useLocation();

  // similarity score states
  const [musicMatchScore, setMusicMatchScore] = useState(0);
  const [shortTermScore, setShortTermScore] = useState(0);
  const [mediumTermScore, setMediumTermScore] = useState(0);
  const [longTermScore, setLongTermScore] = useState(0);
  const [scoreComment, setScoreComment] = useState("");

  // shared songs, artists and genres
  const [sharedItems, setSharedItems] = useState({
    songsShortTerm: [],
    songsMediumTerm: [],
    songsLongTerm: [],
    artistsShortTerm: [],
    artistsMediumTerm: [],
    artistsLongTerm: [],
    genresShortTerm: {},
    genresMediumTerm: {},
    genresLongTerm: {},
  });

  const [activeTab, setActiveTab] = useState("short_term"); // Initialize with the default tab
  let content;

  useEffect(() => {
    // for all state variables being set here I am also
    // setting a placeholder variable to be used for the
    // logic in useEffect. State variables were not updating
    // when checked in the useEffect block

    const queryParams = new URLSearchParams(location.search);
    setUser1_ID(queryParams.get("user_1"));
    setUser2_ID(queryParams.get("user_2"));

    const user1_ID_temp = queryParams.get("user_1");
    const user2_ID_temp = queryParams.get("user_2");

    let isUser1_temp = false;
    let isUser2_temp = false;

    const fetchData = async () => {
      let user1InUser2FriendsList_temp = false;
      let user2InUser1FriendsList_temp = false;
      try {
        // make sure if new user they're favorites are scraped
        const favesResponse = await fetch(
          `${process.env.REACT_APP_BACKEND_URI}/api/spotify/favorites`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (!favesResponse.ok) {
          throw new Error(
            "Could not update user favorites before loading similarity page"
          );
        }
        const currentUserData = await fetchUserData();

        // find out which user is the current user
        if (currentUserData.id === user1_ID_temp) {
          setUser1_ImageURL(currentUserData.profileImageUrl);
          setIsUser1(true);
          isUser1_temp = true;
        } else if (currentUserData.id === user2_ID_temp) {
          setUser2_ImageURL(currentUserData.profileImageUrl);
          setIsUser2(true);
          isUser2_temp = true;
        } else {
          console.log("Unauthorized user trying to view similarities.");
        }

        try {
          // get both users data
          const user1Data = await fetchSpecificUserData(user1_ID_temp);
          const user2Data = await fetchSpecificUserData(user2_ID_temp);

          // if is user 1 check if in each other friends lists and set state vars for user2
          if (isUser1_temp) {
            user2InUser1FriendsList_temp = await currentUserData.friends.some(
              (friend) => friend.id === user2_ID_temp
            );
            setUser2InUser1FriendsList(user2InUser1FriendsList_temp);

            user1InUser2FriendsList_temp = await user2Data.friends.some(
              (friend) => friend.id === user1_ID_temp
            );
            setUser1InUser2FriendsList(user1InUser2FriendsList_temp);

            setUser2_ImageURL(user2Data.profileImageUrl);
          }

          // if is user 2 check if in each other friends lists and set state vars for user1
          if (isUser2_temp) {
            user1InUser2FriendsList_temp = await currentUserData.friends.some(
              (friend) => friend.id === user1_ID_temp
            );
            setUser1InUser2FriendsList(user1InUser2FriendsList_temp);

            user2InUser1FriendsList_temp = await user1Data.friends.some(
              (friend) => friend.id === user2_ID_temp
            );
            setUser2InUser1FriendsList(user2InUser1FriendsList_temp);

            setUser1_ImageURL(user1Data.profileImageUrl);
          }

          if (user1InUser2FriendsList_temp && user2InUser1FriendsList_temp) {
            const similarity_results = await fetchSimilarityData(
              user1_ID_temp,
              user2_ID_temp
            );
            setShortTermScore(similarity_results.shortTermScore);
            setMediumTermScore(similarity_results.mediumTermScore);
            setLongTermScore(similarity_results.longTermScore);
            setMusicMatchScore(similarity_results.musicMatchScore);

            const score_temp = similarity_results.musicMatchScore;

            if (score_temp < 10) {
              setScoreComment("Silence is golden");
            } else if (score_temp < 20) {
              setScoreComment("Treble in paradise!");
            } else if (score_temp < 30) {
              setScoreComment("Your future is sounding a tad ptichy");
            } else if (score_temp < 40) {
              setScoreComment("No roadtrips for you two");
            } else if (score_temp < 50) {
              setScoreComment("Hope you brought headphones!");
            } else if (score_temp < 60) {
              setScoreComment("Compromise is KEY!");
            } else if (score_temp < 70) {
              setScoreComment("Good enough to live in harmony");
            } else if (score_temp < 80) {
              setScoreComment("Looks like you're EAR-BUDS!");
            } else if (score_temp < 85) {
              setScoreComment("Music Match Made in Heaven!");
            } else if (score_temp < 90) {
              setScoreComment("Totally Tune Twins!");
            } else if (score_temp < 95) {
              setScoreComment("Practically Pitch Perfect!");
            } else {
              setScoreComment("Certified Soundmates!");
            }

            setSharedItems({
              songsShortTerm: similarity_results.sharedSongsShortTerm,
              songsMediumTerm: similarity_results.sharedSongsMediumTerm,
              songsLongTerm: similarity_results.sharedSongsLongTerm,
              artistsShortTerm: similarity_results.sharedArtistsShortTerm,
              artistsMediumTerm: similarity_results.sharedArtistsMediumTerm,
              artistsLongTerm: similarity_results.sharedArtistsLongTerm,
              genresShortTerm: similarity_results.sharedGenresShortTerm,
              genresMediumTerm: similarity_results.sharedGenresMediumTerm,
              genresLongTerm: similarity_results.sharedGenresLongTerm,
            });

            setLoading(false);
          } else {
            setLoading(false);
          }
        } catch (err) {
          // if cant fetch either of the users data just set loading to false
          setLoading(false);
        }
      } catch (error) {
        console.error("Error fetching current user data:", error);
      }
    };

    fetchData();
  }, [location.search]);

  if (loading) {
    return <div style={{ color: "whitesmoke" }}>Loading...</div>; // Display loading message
  }

  if (activeTab === "short_term") {
    content = (
      <div>
        <SingleTermSimilarityDisplay
          score={shortTermScore}
          songs={sharedItems.songsShortTerm}
          artists={sharedItems.artistsShortTerm}
          genres={sharedItems.genresShortTerm}
          user1={isUser1 ? user1_ID : user2_ID}
          user2={isUser1 ? user2_ID : user1_ID}
          term={"Short Term"}
        />
      </div>
    );
  }

  if (activeTab === "medium_term") {
    content = (
      <div>
        <SingleTermSimilarityDisplay
          score={mediumTermScore}
          songs={sharedItems.songsMediumTerm}
          artists={sharedItems.artistsMediumTerm}
          genres={sharedItems.genresMediumTerm}
          user1={isUser1 ? user1_ID : user2_ID}
          user2={isUser1 ? user2_ID : user1_ID}
          term={"Medium Term"}
        />
      </div>
    );
  }

  if (activeTab === "long_term") {
    content = (
      <div>
        <SingleTermSimilarityDisplay
          score={longTermScore}
          songs={sharedItems.songsLongTerm}
          artists={sharedItems.artistsLongTerm}
          genres={sharedItems.genresLongTerm}
          user1={isUser1 ? user1_ID : user2_ID}
          user2={isUser1 ? user2_ID : user1_ID}
          term={"Long Term"}
        />
      </div>
    );
  }

  return (
    <div style={{ color: "whitesmoke" }}>
      {user1InUser2FriendsList &&
      user2InUser1FriendsList &&
      (isUser1 || isUser2) ? (
        <div>
          <div>
            <div
              style={{
                padding: "50px",
              }}
            >
              <h1
                style={{
                  paddingBottom: "40px",
                }}
              >
                Friend Comparison
              </h1>
              <ProfilePicComparison
                imageUrl1={user1_ImageURL}
                imageUrl2={user2_ImageURL}
                user1={user1_ID}
                user2={user2_ID}
              />
              <h3 style={{ padding: "20px" }}>Music Match Score</h3>
              <SimilarityScoreDisplay
                score={musicMatchScore > 100 ? 100 : musicMatchScore}
                radius={100}
                strokeWidth={12}
              />

              <h4 style={{ paddingTop: "15px" }}>{scoreComment}</h4>
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
            <div>{content}</div>
          </div>
        </div>
      ) : (
        <div>
          Make sure you are each others friends If you were previously friends
          and are confused, they may have opted to delete thier data. You can
          use the share button in the navigation bar to send them a new friend
          request.
        </div>
      )}
    </div>
  );
}

export default FriendsSimilarityPage;
