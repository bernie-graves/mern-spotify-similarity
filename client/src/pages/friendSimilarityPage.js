import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  fetchUserData,
  fetchSpecificUserData,
  fetchSimilarityData,
} from "../helpers/api";

import SimilarityScoreDisplay from "../components/similarity-score-display";

function FriendsSimilarityPage() {
  const [user1_ID, setUser1_ID] = useState();
  const [user1_Name, setUser1_Name] = useState();
  const [user1_ImageURL, setUser1_ImageURL] = useState();
  const [user2_ID, setUser2_ID] = useState();
  const [user2_Name, setUser2_Name] = useState();
  const [user2_ImageURL, setUser2_ImageURL] = useState();
  const [authState, setAuthState] = useState();
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
      try {
        const currentUserData = await fetchUserData();

        if (currentUserData.id === user1_ID_temp) {
          setUser1_Name(currentUserData.displayName);
          setUser1_ImageURL(currentUserData.profileImageUrl);
          setIsUser1(true);
          isUser1_temp = true;
        } else if (currentUserData.id === user2_ID_temp) {
          setUser2_Name(currentUserData.displayName);
          setUser2_ImageURL(currentUserData.profileImageUrl);
          setIsUser2(true);
          isUser2_temp = true;
        } else {
          console.log("Unauthorized user trying to view similarities.");
        }

        if (isUser1_temp) {
          setUser2InUser1FriendsList(
            await currentUserData.friends.some(
              (friend) => friend.id === user2_ID_temp
            )
          );

          const user2Data = await fetchSpecificUserData(user2_ID_temp);
          setUser1InUser2FriendsList(
            await user2Data.friends.some(
              (friend) => friend.id === user1_ID_temp
            )
          );
        }

        if (isUser2_temp) {
          setUser1InUser2FriendsList(
            await currentUserData.friends.some(
              (friend) => friend.id === user1_ID_temp
            )
          );

          const user1Data = await fetchSpecificUserData(user1_ID_temp);
          setUser2InUser1FriendsList(
            await user1Data.friends.some(
              (friend) => friend.id === user2_ID_temp
            )
          );
        }

        const similarity_results = await fetchSimilarityData(
          user1_ID_temp,
          user2_ID_temp
        );
        setShortTermScore(similarity_results.shortTermScore);
        setMediumTermScore(similarity_results.mediumTermScore);
        setLongTermScore(similarity_results.longTermScore);
        setMusicMatchScore(similarity_results.musicMatchScore);

        setLoading(false); // Set loading to false after fetching data
        console.log("USEEFFECT RAN");
      } catch (error) {
        console.error("Error fetching current user data:", error);
      }
    };

    fetchData();
  }, [location.search]);

  if (loading) {
    return <div style={{ color: "whitesmoke" }}>Loading...</div>; // Display loading message
  }

  return (
    <div style={{ color: "whitesmoke" }}>
      {isUser1 || isUser2 ? (
        <h3>
          Hello {isUser1 ? user1_ID : user2_ID}! This is your Music Match page
          with {isUser1 ? user2_ID : user1_ID}
        </h3>
      ) : (
        <div>You are neither of the users supposed to see this page!</div>
      )}
      {user1InUser2FriendsList && user2InUser1FriendsList ? (
        <div>
          <div>
            <div
              style={{
                padding: "50px",
              }}
            >
              <SimilarityScoreDisplay
                score={musicMatchScore}
                radius={100}
                strokeWidth={9}
              />
              <h3 style={{ padding: "10px" }}>Music Match Score</h3>
            </div>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <div style={{ flex: 1, textAlign: "center" }}>
                <SimilarityScoreDisplay
                  score={shortTermScore}
                  radius={60}
                  strokeWidth={6}
                />
                <h5 style={{ padding: "10px" }}>Short Term</h5>
              </div>
              <div style={{ flex: 1, textAlign: "center" }}>
                <SimilarityScoreDisplay
                  score={mediumTermScore}
                  radius={60}
                  strokeWidth={6}
                />
                <h5 style={{ padding: "10px" }}>Medium Term</h5>
              </div>
              <div style={{ flex: 1, textAlign: "center" }}>
                <SimilarityScoreDisplay
                  score={longTermScore}
                  radius={60}
                  strokeWidth={6}
                />
                <h5 style={{ padding: "10px" }}>Long Term</h5>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div>
          You guys are not on each other's friends list. Click the share button
          and share the link with your friend to become friends
        </div>
      )}
    </div>
  );
}

export default FriendsSimilarityPage;
