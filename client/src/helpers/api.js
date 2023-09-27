export async function generateShareLink() {
  const CLIENT_URI =
    process.env.REACT_APP_CLIENT_URI ||
    process.env.RENDER_EXTERNAL_URL ||
    "https://soundmates-for-spotify.com";

  const redirectUri = `${CLIENT_URI}/add_friend`;
  const url = `${
    process.env.REACT_APP_BACKEND_URI
  }/api/spotify/generate-share-link?redirect_uri=${encodeURIComponent(
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

    const returnLink = `${CLIENT_URI}/share?share_link=${encodeURIComponent(
      shareLink
    )}`;
    return returnLink;
  } catch (err) {
    console.error("Error generating share link: ", err);
    throw err;
  }
}

export async function checkIfLoggedIn() {
  try {
    const response = await fetch(
      `${process.env.REACT_APP_BACKEND_URI}/api/spotify/check-if-logged-in`,
      {
        method: "GET",
        credentials: "include",
      }
    );

    const result = await response.json();

    // if logged in, set sessionStorage to true
    if (result.loggedIn) {
      sessionStorage.setItem("loggedIn", "true");
    }

    return result.loggedIn;
  } catch (err) {
    console.log("Error checking if logged in. Returning false");
    return false;
  }
}

export async function fetchUserData() {
  try {
    const response = await fetch(
      `${process.env.REACT_APP_BACKEND_URI}/api/spotify/user-data`,
      {
        method: "GET",
        credentials: "include",
      }
    );

    if (!response.ok) {
      //
      throw new Error(`Could Not fetch user data. Error: ${response.body}`);
    }

    const result = await response.json();

    if (result.id) {
      // result is okay -- going to assume logged in for now
      sessionStorage.setItem("loggedIn", "true");
    }
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
      `${process.env.REACT_APP_BACKEND_URI}/api/spotify/specific-user-data?userID=${userID}`,
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
      `${process.env.REACT_APP_BACKEND_URI}/api/similarity/calculate-similarity?user1_ID=${user1_ID}&user2_ID=${user2_ID}`,
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

// function to log out
export async function logOut() {
  // placeholders
  let removedCookies = false;
  let removedSessionData = false;
  // request to remove cookies (refTkn and accTkn)
  try {
    const response = await fetch(
      `${process.env.REACT_APP_BACKEND_URI}/api/spotify/log-out`,
      {
        method: "GET",
        credentials: "include",
      }
    );

    if (!response.ok) {
      throw new Error(`Could not log out user. Error: ${response.body}`);
    }

    removedCookies = true;
  } catch (err) {
    console.error("There was an error logging out: ", err);
    throw err;
  }

  // delete session storage
  if (sessionStorage.getItem("loggedIn")) {
    sessionStorage.removeItem("loggedIn");
    removedSessionData = true;
  }

  if (removedCookies && removedSessionData) {
    return {
      message: "Successfully Logged Out",
    };
  } else {
    return {
      message: "Could Not Log Out",
    };
  }
}

export async function removeUserData() {
  try {
    const response = await fetch(
      `${process.env.REACT_APP_BACKEND_URI}/api/spotify/remove-user-data`,
      {
        method: "GET",
        credentials: "include",
      }
    );

    if (!response.ok) {
      throw new Error(`Could not remove user data. Error: ${response.text()}`);
    }

    return {
      message: "Removed user data",
    };
  } catch (err) {
    console.log("Could not remove user data: " + err);
    throw err;
  }
}
