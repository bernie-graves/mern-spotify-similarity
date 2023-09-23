// api.js

export async function generateShareLink() {
  const BACKEND_URI =
    process.env.REACT_APP_BACKEND_URI || process.env.RENDER_EXTERNAL_URL;
  const redirectUri = `${
    process.env.REACT_APP_CLIENT_URI
      ? process.env.REACT_APP_CLIENT_URI
      : process.env.RENDER_EXTERNAL_URL
  }/add_friend`;
  const url = `${BACKEND_URI}/api/spotify/generate-share-link?redirect_uri=${encodeURIComponent(
    redirectUri
  )}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      credentials: "include",
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
    const response = await fetch(`${BACKEND_URI}/api/spotify/user-data`, {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) {
      //
      throw new Error(`Could Not fetch user data. Error: ${response.body}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error(
      "There was a problem with the fetch operation in fetchUserData:",
      error
    );
    throw error;
  }
}

export async function fetchSpecificUserData(userID) {
  try {
    const response = await fetch(
      `${BACKEND_URI}/api/spotify/specific-user-data?userID=${userID}`,
      {
        method: "GET",
        credentials: "include",
      }
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
      `${BACKEND_URI}/api/similarity/calculate-similarity?user1_ID=${user1_ID}&user2_ID=${user2_ID}`,
      {
        method: "GET",
        credentials: "include",
      }
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
