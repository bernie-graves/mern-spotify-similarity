import express from "express";
import db from "../db/conn.mjs";

const router = express.Router();

// add API routes to access spotify API here
const PORT = process.env.PORT || 5050;
const CLIENT_ID = process.env.CLIENT_ID;
const SECRET_KEY = process.env.SECRET_KEY;
const RED_URI =
  process.env.RED_URI ||
  `https://server.soundmates-for-spotify.com/api/spotify/redpage`;

const localCookieSettings = {};

const secureCookieSettings = {
  httpOnly: false,
  sameSite: "none",
  secure: true,
};

const cookieSettings = RED_URI.startsWith("https://")
  ? secureCookieSettings
  : localCookieSettings;

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

        const accCookieSettings = cookieSettings;
        accCookieSettings["maxAge"] = data.body["expires_in"] * 1000;

        // Set the new access token in a cookie
        res.cookie("accTkn", newAccTok, accCookieSettings);

        // Add the new access token to the request headers
        req.headers["newAccessToken"] = newAccTok;

        console.log(
          "NEW ACCESS TOKEN FROM req.headers: " + req.headers["newAccessToken"]
        );

        resolve();
      } else {
        console.log("SENT FROM accTknRefreshments middleware");
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
async function fetchTopTracks(spotifyAPI, time_frame, count) {
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
      songID: item.id,
      link: item.external_urls.spotify,
    }));

    return results;
  } catch (error) {
    console.error("Error fetching top tracks:", error);
    throw error; // Rethrow the error to handle it elsewhere if needed
  }
}

// Function to fetch top artists and store in MongoDB
async function fetchTopArtists(spotifyAPI, time_frame, count) {
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
      artistID: item.id,
      link: item.external_urls.spotify,
    }));

    return results;
  } catch (error) {
    console.error("Error fetching top artists:", error);
    throw error; // Rethrow the error to handle it elsewhere if needed
  }
}

// Route to generate a link with a token and store it in the database
async function saveLinkToken(sender_userID, token) {
  try {
    const collection = db.collection("add-friend-tokens");

    // Insert the link and token into the collection
    await collection.insertOne({ senderID: sender_userID, token: token });

    return token;
  } catch (error) {
    console.error("Error generating link token:", error);
    throw error;
  }
}

function generateRandomString(length) {
  let text = "";
  let possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

// Spotify Authentication

// login to spotify
router.get("/login", (req, res) => {
  if (req.query.userId && req.query.redirect_uri) {
    // get query information for friend requests / share
    const senderUserID = req.query.userId;
    // Get the redirectUri from the request query parameters
    const redirectUri = req.query.redirect_uri;
    // Get the token from the share string
    const friend_token = req.query.friend_token;

    // send them through as cookies
    res.cookie("next_uri", redirectUri, cookieSettings);
    res.cookie("sender_userID", senderUserID, cookieSettings);
    res.cookie("friend_token", friend_token, cookieSettings);
  }

  const stateString = generateRandomString(16);
  res.cookie("authState", stateString, cookieSettings);

  const scopes = [
    "user-top-read",
    "user-read-email",
    "playlist-modify-private",
    "playlist-modify-public",
  ];
  const loginLink = spotifyAuthAPI.createAuthorizeURL(scopes, stateString);

  res.redirect(loginLink);
});

router.get("/redpage", async (req, res) => {
  if (req.query.state !== req.cookies["authState"]) {
    // States don't match, send the user away.
    return res.redirect("/");
  }

  const authenticationCode = req.query.code;
  if (authenticationCode) {
    spotifyAuthAPI.authorizationCodeGrant(authenticationCode).then((data) => {
      const accCookieSettings = cookieSettings;
      accCookieSettings["maxAge"] = data.body["expires_in"] * 1000;

      res.cookie("accTkn", data.body["access_token"], accCookieSettings);
      res.cookie("refTkn", data.body["refresh_token"], cookieSettings);

      // Set the access token on the API object to use it in later calls
      spotifyAuthAPI.setAccessToken(data.body["access_token"]);
      spotifyAuthAPI.setRefreshToken(data.body["refresh_token"]);

      // if accesssed with share link, send to a page where you can add friends
      if (req.cookies.next_uri && req.cookies.sender_userID) {
        // get cookies from request
        // used for the sharing/adding friend link
        const next_uri = req.cookies["next_uri"];
        const sender_userID = req.cookies["sender_userID"];
        const friend_token = req.cookies["friend_token"];

        // share link needs to have the user sending the link and
        // an auth state so that not just anyone can add someone
        // if they know their username. Re-using the auth state
        // string created for the spotify api auth
        const next_uri_with_user = `${next_uri}?sender_userID=${sender_userID}&friend_token=${friend_token}`;
        // save the token to the token db
        // check when you go to link if right token
        // const token = saveLinkToken(sender_userID, req.cookies["authState"]);
        res.redirect(next_uri_with_user);
      } else {
        // normal login
        // remove state string and redirect to the favorites page

        res.clearCookie("authState");

        return res.redirect(`${process.env.CLIENT_URI}/faves`);
      }
    });
  }
});

router.get("/log-out", (req, res) => {
  // remove refTKn and accTkn cookies
  res.clearCookie("refTkn");
  res.clearCookie("accTkn");

  res.send("logged out and cookies removed");
});

router.get("/check-if-logged-in", async (req, res) => {
  if (req.cookies.refTkn) {
    return res.send(JSON.stringify({ loggedIn: true }));
  } else {
    return res.send(JSON.stringify({ loggedIn: false }));
  }
});

router.get("/remove-user-data", accTknRefreshments, async (req, res) => {
  // Get access token and refresh if needed
  let accessToken;
  try {
    accessToken = setAccessToken(req);
  } catch (error) {
    console.log("Error with access token in favorites endpoint: " + error);
    return res.status(404).send();
  }

  try {
    const spotifyAPI = new SpotifyWebApi({ accessToken: accessToken });

    // Get user id
    const userID = (await spotifyAPI.getMe()).body.id;

    // get references to collections
    const usersCollection = db.collection("users");
    const userFavsCollection = db.collection("user-favorites");
    const friendTokenCollection = db.collection("add-friend-tokens");

    // queries
    const usersQuery = { id: userID };
    const userFavsQuery = { userID: userID };
    const friendTokenQuery = { senderID: userID };

    // delete users documents from db
    const usersResult = await usersCollection.deleteMany(usersQuery);
    const userFavsResult = await userFavsCollection.deleteMany(userFavsQuery);
    const friendTokenResult = await friendTokenCollection.deleteMany(
      friendTokenQuery
    );

    console.log(`${usersResult.deletedCount} document(s) removed from users.`);
    console.log(
      `${userFavsResult.deletedCount} document(s) removed from user-favorites.`
    );
    console.log(
      `${friendTokenResult.deletedCount} document(s) removed from add-friend-tokens.`
    );

    res.send("removed user data");
  } catch (err) {
    console.error("Error deleting user data: " + err);
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
          userFavs[`songs_${item}`] = await fetchTopTracks(
            spotifyAPI,
            item,
            50
          );
          // Fetch top artists for each time frame
          userFavs[`artists_${item}`] = await fetchTopArtists(
            spotifyAPI,
            item,
            15
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

// Function to check if a date is more than a week ago
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
      res.setHeader("Content-Type", "application/json");
      return res.status(200).send(JSON.stringify(userResult, null, 2));
    } else {
      // If the user document doesn't exist, insert a new one with an empty "friends" array
      userResult.friends = [];
      await usersCollection.insertOne(userResult);
      res.setHeader("Content-Type", "application/json");
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
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      return res.status(200).send(JSON.stringify(existingUser, null, 2));
    } else {
      // If the user document doesn't exist
      const noResult = {
        message: `${requestedUserID} does not exist in our database`,
      };
      res.setHeader("Content-Type", "application/json; charset=utf-8");
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

  console.log("set access token:" + accessToken);

  try {
    // References to Spotify API and MongoDB users collections
    const spotifyAPI = new SpotifyWebApi({ accessToken: accessToken });
    const usersCollection = await db.collection("users");
    const tokenCollection = await db.collection("add-friend-tokens");

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

    // check if token matches what is in db
    const token = req.query.friend_token;
    const tokenQuery = {
      senderID: senderUserID,
      token: token,
    };

    const doc = await tokenCollection.findOne(tokenQuery);

    if (doc && doc.token === token) {
      // authorized to add friend
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
        (currentResult.modifiedCount === 1 ||
          senderResult.modifiedCount === 1) &&
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
    } else {
      // not authorized --- dont have correct auth token from sender
      console.log("Auth Token does not match what is in database");
      return res.status(403).send("Access denied. Invalid token or link.");
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
  let redirectUri = req.query.redirect_uri;

  // Ensure that the redirectUri is provided
  if (!redirectUri) {
    return res.status(400).json({ message: "Missing redirectUri parameter" });
  }

  // generate token and send to db
  const token = generateRandomString(10);
  saveLinkToken(userID, token);

  console.log("Generated Share Link");
  const protocol = req.protocol;
  const host = req.get("host");

  // Construct the share link
  const shareLink = `${protocol}://${host}/api/spotify/login?userId=${userID}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&friend_token=${token}`;

  // Return the shareLink in the response
  return res.json({ shareLink });
});

// endpoint to generate a playlist based on shared interests
router.post("/generate-playlist", accTknRefreshments, async (req, res) => {
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

  // get shared interests
  const body = req.body;
  // shared songs
  const songs = body.songs;

  // shared artists
  const artists = body.artists;

  // shared genres
  const genres = body.genres;

  // users
  const user1 = body.user1;
  const user2 = body.user2;
  const term = body.term;

  // can only have 5 total between songs, artists and genres
  // prioritze in that order
  const preparedData = prepareDataForRecommender(songs, artists, genres);

  // make request to spotify recommender endpoint
  const recommendations = await spotifyAPI.getRecommendations({
    limit: 50,
    market: "US",
    seed_tracks: preparedData.songIds,
    seed_artists: preparedData.artistIds,
    seed_genres: preparedData.genreNames,
  });

  // recommended song objects to return in body for user to view on website
  const recommendedSongs = recommendations.body.tracks.map((song) => ({
    songName: song.name,
    artistNames: song.artists.map((artist) => artist.name),
    albumCover: song.album.images[0].url,
    songID: song.id,
  }));

  // recommended song ids to use to add to playlist
  const recommendedSongIds = recommendations.body.tracks.map(
    (song) => `spotify:track:${song.id}`
  );

  // make playlist
  spotifyAPI
    .createPlaylist(`${user1} and ${user2} Shared Tastes - ${term}`, {
      description: `shared playlist created by Music Match for ${user1} and ${user2} based on shared interests in the ${term}`,
      public: false,
    })
    .then(
      function (data) {
        // add to the playlist
        const playlistId = data.body.id;
        spotifyAPI.addTracksToPlaylist(playlistId, recommendedSongIds).then(
          function (data) {
            console.log("Added tracks to playlist!");
          },
          function (err) {
            console.log(
              "Something went wrong adding recommended tracks to playlist!",
              err
            );
            return res.status(400).json({
              message: "Failed to add songs to playlist",
            });
          }
        );
      },
      function (err) {
        console.log("Failed to create playlist :(", err);
        return res.status(400).json({
          message: "Failed to create playlist",
        });
      }
    );

  // add recommended songs to the playlist

  return res.status(200).json({
    message: "Successfully created playlist",
    playlistSongs: JSON.stringify(recommendedSongs),
  });
});

function prepareDataForRecommender(songs, artists, genres) {
  // Initialize arrays for songIds, artistIds, and genreNames
  const songIds = [];
  const artistIds = [];
  const genreNames = [];

  // Prioritize songs
  for (let i = 0; i < songs.length && songIds.length < 5; i++) {
    songIds.push(songs[i].songID);
  }

  // Fill artistIds if needed
  for (
    let i = 0;
    i < artists.length && artistIds.length + songIds.length < 5;
    i++
  ) {
    artistIds.push(artists[i].artistID);
  }

  // prioritize genres based on product of standardized scores
  const prioritizedGenresArr = prioritizeGenres(genres);

  // Fill genreNames if needed
  for (let i = 0; i < prioritizedGenresArr.length; i++) {
    if (genreNames.length + songIds.length + artistIds.length >= 5) {
      break; // Stop if the total length is 5
    }
    genreNames.push(prioritizedGenresArr[i]);
  }

  // Return the prioritized arrays
  return { songIds, artistIds, genreNames };
}

function prioritizeGenres(genresData) {
  // Extract genre names and pairs of numbers
  const genreNames = Object.keys(genresData);
  const user1Scores = genreNames.map((genre) => genresData[genre][0]);
  const user2Scores = genreNames.map((genre) => genresData[genre][1]);

  const products = [];

  // iterate through standardized scores and multiply
  for (let i = 0; i < user1Scores.length; i++) {
    products.push(user1Scores[i] * user2Scores[i]);
  }

  // Create an array of objects with genre names and standardized products
  const genresWithScores = genreNames.map((genre, index) => ({
    name: genre,
    score: products[index],
  }));

  // Sort genres by their standardized scores in descending order
  genresWithScores.sort((a, b) => b.score - a.score);

  // Return an array of genre names in the sorted order
  const prioritizedGenres = genresWithScores.map(
    (genreWithScore) => genreWithScore.name
  );

  return prioritizedGenres;
}

export default router;
