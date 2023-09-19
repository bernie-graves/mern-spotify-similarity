import express from "express";
import db from "../db/conn.mjs";

const router = express.Router();

// add API routes to access spotify API here
const PORT = process.env.PORT || 3000;
const CLIENT_ID = process.env.CLIENT_ID;
const SECRET_KEY = process.env.SECRET_KEY;
const RED_URI = process.env.RED_URI || `http://192.168.1.91:${PORT}/redpage`;

// This object is going to be used for authentication alone. We make separate SpotifyWebApis for our actual API calls with access tokens.
import SpotifyWebApi from "spotify-web-api-node";
const spotifyAuthAPI = new SpotifyWebApi({
  clientId: CLIENT_ID,
  clientSecret: SECRET_KEY,
  redirectUri: RED_URI,
});

const accTknRefreshments = (req, res, next) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Check if an access token exists
      if (req.cookies["accTkn"]) {
        resolve();
      } else if (req.cookies["refTkn"]) {
        // Set the refresh token
        spotifyAuthAPI.setRefreshToken(req.cookies["refTkn"]);
        console.log(
          `The refresh token is: ${spotifyAuthAPI.getRefreshToken()}`
        );

        // Refresh the access token
        const data = await spotifyAuthAPI.refreshAccessToken();
        const newAccTok = data.body["access_token"];
        console.log("NEW ACCESS TOKEN OBJECT: " + newAccTok);

        // Set the new access token in a cookie
        res.cookie("accTkn", newAccTok, {
          maxAge: data.body["expires_in"] * 1000,
        });

        // Add the new access token to the request headers
        req.headers["newAccessToken"] = newAccTok;

        console.log(
          "NEW ACCESS TOKEN FROM req.headers: " + req.headers["newAccessToken"]
        );

        resolve();
      } else {
        console.log("no refresh or access token -- please login");
        return res.send();
      }
    } catch (error) {
      console.error("Error in accTknRefreshments middleware:", error);
      reject(error);
    }
  })
    .then(() => {
      next();
    })
    .catch((error) => {
      return res.status(500).send("Internal Server Error");
    });
};

// Helper functions
const setAccessToken = (req) => {
  let accessToken;
  if (req.cookies.accTkn) {
    accessToken = req.cookies.accTkn;
  } else if (req.headers.newAccessToken) {
    accessToken = req.headers.newAccessToken;
  }

  return accessToken;
};

// Function to fetch top tracks and store in MongoDB
async function fetchTopTracksAndStore(
  spotifyAPI,
  time_frame,
  count,
  userID,
  collection
) {
  try {
    const data = await spotifyAPI.getMyTopTracks({
      limit: count,
      time_range: time_frame,
    });

    // Process the data and store it in the database
    const results = data.body.items.map((item) => ({
      songName: item.name,
      artistNames: item.artists.map((artist) => artist.name),
      albumCover: item.album.images[0].url,
    }));

    return results;
  } catch (error) {
    console.error("Error fetching top tracks:", error);
    throw error; // Rethrow the error to handle it elsewhere if needed
  }
}

// Function to fetch top artists and store in MongoDB
async function fetchTopArtistsAndStore(
  spotifyAPI,
  time_frame,
  count,
  userID,
  collection
) {
  try {
    const data = await spotifyAPI.getMyTopArtists({
      limit: count,
      time_range: time_frame,
    });

    // Process the data and store it in the database
    const results = data.body.items.map((item) => ({
      artistName: item.name,
      genres: item.genres,
      artistImage: item.images[0].url,
    }));

    return results;
  } catch (error) {
    console.error("Error fetching top artists:", error);
    throw error; // Rethrow the error to handle it elsewhere if needed
  }
}

// Spotify Authentication

// login to spotify
router.get("/login", (req, res) => {
  const generateRandomString = (length) => {
    let text = "";
    let possible =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (let i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  };

  if (req.query.userId && req.query.redirect_uri) {
    // get query information for friend requests / share
    const senderUserID = req.query.userId;
    // Get the redirectUri from the request query parameters
    const redirectUri = req.query.redirect_uri;

    // send them through as cookies
    res.cookie("next_uri", redirectUri);
    res.cookie("sender_userID", senderUserID);
  }

  const stateString = generateRandomString(16);
  res.cookie("authState", stateString);

  const scopes = ["user-top-read", "user-read-email"];
  const loginLink = spotifyAuthAPI.createAuthorizeURL(scopes, stateString);

  res.redirect(loginLink);
});

router.get("/redpage", (req, res) => {
  if (req.query.state !== req.cookies["authState"]) {
    // States don't match, send the user away.
    return res.redirect("/");
  }

  const authenticationCode = req.query.code;
  if (authenticationCode) {
    spotifyAuthAPI.authorizationCodeGrant(authenticationCode).then((data) => {
      res.cookie("accTkn", data.body["access_token"], {
        maxAge: data.body["expires_in"] * 1000,
      });
      res.cookie("refTkn", data.body["refresh_token"]);

      // Set the access token on the API object to use it in later calls
      spotifyAuthAPI.setAccessToken(data.body["access_token"]);
      spotifyAuthAPI.setRefreshToken(data.body["refresh_token"]);

      // if accesssed with share link, send to a page where you can add friends
      if (req.cookies.next_uri && req.cookies.sender_userID) {
        // get cookies from request
        // used for the sharing/adding friend link
        const next_uri = req.cookies["next_uri"];
        const sender_userID = req.cookies["sender_userID"];

        // share link needs to have the user sending the link and
        // an auth state so that not just anyone can add someone
        // if they know their username. Re-using the auth state
        // string created for the spotify api auth
        const next_uri_with_user = `${next_uri}?sender_userID=${sender_userID}&auth_state=${req.cookies["authState"]}`;
        res.redirect(next_uri_with_user);
      } else {
        // normal login
        // remove state string and redirect to the favorites page

        res.clearCookie("authState");

        return res.redirect("http://192.168.1.91:3000/faves");
      }
    });
  }
});

// Favorites endpoint
router.get("/favorites", accTknRefreshments, async (req, res) => {
  // Get access token and refresh if needed
  let accessToken;
  try {
    accessToken = setAccessToken(req);
  } catch (error) {
    console.log("Error with access token in favorites endpoint: " + error);
    return res.status(404).send();
  }

  const spotifyAPI = new SpotifyWebApi({ accessToken: accessToken });
  const time_frames = ["short_term", "long_term", "medium_term"];

  // Check if data exists in the database
  // Get user id
  const userID = (await spotifyAPI.getMe()).body.id;

  // Check if user id exists in user-favorites collection
  // Reference to db collection
  let collection = await db.collection("user-favorites");
  try {
    // Query to check for documents for this userID
    const query = {
      userID: userID,
    };

    const document = await collection.findOne(query);

    // If document exists and was fetched less than a week ago, return data
    if (
      document &&
      document.fetch_date &&
      isMoreThanWeekAgo(document.fetch_date) === false
    ) {
      // Create an array to store the results
      const results = [];

      // Loop through each time frame and type (songs and artists)
      await Promise.all(
        time_frames.map(async (time_frame) => {
          ["songs", "artists"].forEach(async (type) => {
            const key = `${type}_${time_frame}`;
            if (document[key]) {
              // Create an object for each time frame and type
              const resultItem = {
                [`${type}_${time_frame}`]: document[key],
              };
              results.push(resultItem);
            }
          });
        })
      );

      return res.status(200).send(JSON.stringify(results, null, 2));
    } else {
      // If document doesn't exist or was fetched more than 2 weeks ago
      // fetch from Spotify and save to db

      // Placeholder to store results
      const userFavs = { userID: userID };
      // Fetch favorite songs
      await Promise.all(
        time_frames.map(async (item) => {
          // Fetch top songs for each time frame
          userFavs[`songs_${item}`] = await fetchTopTracksAndStore(
            spotifyAPI,
            item,
            50,
            userID,
            collection
          );
          // Fetch top artists for each time frame
          userFavs[`artists_${item}`] = await fetchTopArtistsAndStore(
            spotifyAPI,
            item,
            15,
            userID,
            collection
          );
        })
      );

      // Insert to database
      try {
        userFavs["fetch_date"] = new Date();
        const result = await collection.updateOne(
          { userID: userID },
          { $set: userFavs },
          { upsert: true }
        );

        if (result.upsertedCount > 0) {
          console.log(
            `Inserted ${result.upsertedCount} document into the collection`
          );
        } else {
          console.log(`Updated existing document in the collection`);
        }

        // Send favorites data back to frontend
        return res.status(200).send(JSON.stringify(userFavs, null, 2));
      } catch (err) {
        console.error("Error inserting or updating document:", err);
        return res.status(404).send();
      }
    }
  } catch (err) {
    console.log("Error in favorites endpoint: " + err);
    return res.status(404).send();
  }
});

// Function to check if a date is more than 2 weeks ago
function isMoreThanWeekAgo(date) {
  const twoWeeksAgo = new Date();
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 7);
  return date < twoWeeksAgo;
}

// endpoint to fetch current users data
router.get("/user-data", accTknRefreshments, async (req, res) => {
  // Get access token and refresh if needed
  let accessToken;
  try {
    accessToken = setAccessToken(req);
  } catch (error) {
    console.log("Error in user-data endpoint: " + error);
    return res.status(404).send();
  }

  const spotifyAPI = new SpotifyWebApi({ accessToken: accessToken });

  // Get the authenticated user's data
  const userData = await spotifyAPI.getMe();

  const displayName = userData.body.display_name;
  const email = userData.body.email;
  const id = userData.body.id;
  const profileImageUrl = userData.body.images[1]
    ? userData.body.images[1].url
    : null;

  // Create an object with the user's data
  const userResult = {
    displayName,
    email,
    id,
    profileImageUrl: profileImageUrl,
  };

  // Reference to the "users" collection in MongoDB
  let usersCollection = await db.collection("users");

  try {
    // Query to check for a document with the same "id"
    const query = { id: userResult.id };

    const existingUser = await usersCollection.findOne(query);

    if (existingUser) {
      // If the user document exists, return it with an added "friends" key
      userResult.friends = existingUser.friends;
      return res.status(200).send(JSON.stringify(userResult, null, 2));
    } else {
      // If the user document doesn't exist, insert a new one with an empty "friends" array
      userResult.friends = [];
      await usersCollection.insertOne(userResult);

      return res.status(200).send(JSON.stringify(userResult, null, 2));
    }
  } catch (err) {
    console.error("Error in user-data endpoint:", err);
    return res.status(500).send("Internal Server Error");
  }
});

// endpoint to fetch specific users data
router.get("/specific-user-data", accTknRefreshments, async (req, res) => {
  // Get access token and refresh if needed
  let accessToken;
  try {
    accessToken = setAccessToken(req);
  } catch (error) {
    console.log("Error in user-data endpoint: " + error);
    return res.status(404).send();
  }

  try {
    // Reference to the "users" collection in MongoDB
    let usersCollection = await db.collection("users");

    // get the requested userID
    const requestedUserID = req.query.userID;

    // Query to check for a document with the same "id"
    const query = { id: requestedUserID };

    const existingUser = await usersCollection.findOne(query);

    if (existingUser) {
      // if specific user exists in db return their doc
      return res.status(200).send(JSON.stringify(existingUser, null, 2));
    } else {
      // If the user document doesn't exist
      const noResult = {
        message: `${requestedUserID} does not exist in our database`,
      };
      return res.status(200).send(JSON.stringify(noResult, null, 2));
    }
  } catch (err) {
    console.error("Error in specific-user-data endpoint:", err);
    return res.status(500).send("Internal Server Error");
  }
});

// endpoint to add friends
router.get("/complete_friend_request", accTknRefreshments, async (req, res) => {
  // make sure the user is authenticated
  // Get access token and refresh if needed
  let accessToken;
  try {
    accessToken = setAccessToken(req);
  } catch (error) {
    console.log("Error in complete_friend_request endpoint: " + error);
    return res.status(404).send();
  }

  try {
    // References to Spotify API and MongoDB users collection
    const spotifyAPI = new SpotifyWebApi({ accessToken: accessToken });
    const usersCollection = await db.collection("users");

    // Get current user id
    const currentUserID = (await spotifyAPI.getMe()).body.id;

    // Get sender user id
    const senderUserID = req.query.sender_userID;

    // Get current user data from db
    const query = { id: currentUserID };
    const currentUser = await usersCollection.findOne(query);

    // Get sender user data from db
    const senderQuery = { id: senderUserID };
    const senderUser = await usersCollection.findOne(senderQuery);

    // Check if the sender is already a friend of the current user
    const senderIsFriendOfCurrentUser = currentUser.friends.some(
      (friend) => friend.id === senderUserID
    );

    // Check if the current user is already a friend of the sender
    const currentUserIsFriendOfSender = senderUser.friends.some(
      (friend) => friend.id === currentUserID
    );

    if (senderIsFriendOfCurrentUser && currentUserIsFriendOfSender) {
      console.log("Both users are already friends.");
      return res.status(200).json({
        message: "Already friends",
        currentUserID,
        senderUserID,
      });
    }

    // Update current user's friends list
    if (!senderIsFriendOfCurrentUser) {
      currentUser.friends.push({
        id: senderUser.id,
        displayName: senderUser.displayName,
        profileImageUrl: senderUser.profileImageUrl,
      });
    }

    // Update sender user's friends list
    if (!currentUserIsFriendOfSender) {
      senderUser.friends.push({
        id: currentUser.id,
        displayName: currentUser.displayName,
        profileImageUrl: currentUser.profileImageUrl,
      });
    }

    // Update current user's db document with the new friends list
    const currentResult = await usersCollection.updateOne(
      { id: currentUserID },
      {
        $set: {
          friends: currentUser.friends,
        },
      },
      { upsert: true }
    );

    // Update sender user's db document with the new friends list
    const senderResult = await usersCollection.updateOne(
      { id: senderUserID },
      {
        $set: {
          friends: senderUser.friends,
        },
      },
      { upsert: true }
    );

    // Check if both users' friends lists were updated successfully
    if (
      (currentResult.modifiedCount === 1 || senderResult.modifiedCount === 1) &&
      !(currentResult.modifiedCount === 0 && senderResult.modifiedCount === 0)
    ) {
      console.log("Both users' friends lists updated successfully.");
      return res.status(200).json({
        message: "Friends added successfully",
        currentUserID,
        senderUserID,
      });
    } else {
      console.log(
        "No document matched the query or the document was not modified for one or both users."
      );
      return res.status(400).json({ error: "Failed to add friends" });
    }
  } catch (err) {
    console.error("Error updating fields:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// endpoint to generate a share link
router.get("/generate-share-link", accTknRefreshments, async (req, res) => {
  // make sure user is authenticated
  // Get access token and refresh if needed
  let accessToken;
  try {
    accessToken = setAccessToken(req);
  } catch (error) {
    console.log("Error in generate-share-link endpoint: " + error);
    return res.status(404).send();
  }

  const spotifyAPI = new SpotifyWebApi({ accessToken: accessToken });

  // Get the authenticated user's id
  const userData = await spotifyAPI.getMe();
  const userID = userData.body.id;

  // Get the redirectUri from the request query parameters
  const redirectUri = req.query.redirect_uri;

  // Ensure that the redirectUri is provided
  if (!redirectUri) {
    return res.status(400).json({ message: "Missing redirectUri parameter" });
  }

  // Construct the share link
  const shareLink = `${
    process.env.CLIENT_URI
  }/api/spotify/login?userId=${userID}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}`;

  // Return the shareLink in the response
  return res.json({ shareLink });
});

export default router;
