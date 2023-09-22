// api.js

export async function generateShareLink() {
  const redirectUri = `${
    process.env.REACT_APP_CLIENT_URI
      ? process.env.REACT_APP_CLIENT_URI
      : process.env.VERCEL_URL
  }/add_friend`;
  const url = `/api/spotify/generate-share-link?redirect_uri=${encodeURIComponent(
    redirectUri
  )}`;

  try {
    const response = await fetch(url, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error(
        `Generate Share Link Request Failed w/ Status: ${response.status}`
      );
    }

    const data = await response.json();
    const shareLink = data.shareLink;
    return shareLink;
  } catch (err) {
    console.error("Error generating share link: ", err);
    throw err;
  }
}

// userData.js

export async function fetchUserData() {
  try {
    const response = await fetch("/api/spotify/user-data");

    if (!response.ok) {
      throw new Error(`Could Not fetch user data. Error: ${response.body}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("There was a problem with the fetch operation:", error);
    throw error;
  }
}

export async function fetchSpecificUserData(userID) {
  try {
    const response = await fetch(
      `/api/spotify/specific-user-data?userID=${userID}`
    );

    if (!response.ok) {
      throw new Error(`Could Not fetch user data. Error: ${response.body}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("There was a problem with the fetch operation:", error);
    throw error;
  }
}

export async function fetchSimilarityData(user1_ID, user2_ID) {
  try {
    const response = await fetch(
      `api/similarity/calculate-similarity?user1_ID=${user1_ID}&user2_ID=${user2_ID}`
    );

    if (!response.ok) {
      throw new Error(
        `Could not fetch user similarity data. Error: ${response.body}`
      );
    }

    const result = await response.json();
    return result;
  } catch (err) {
    console.error("There was an error fetching similarity scores: ", err);
    throw err;
  }
}
