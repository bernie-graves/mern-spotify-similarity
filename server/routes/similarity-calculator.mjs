import express from "express";
import db from "../db/conn.mjs";

const router = express.Router();

// helper functions

// similarity metric for songs and artists
function jaccardSimilarity(array1, array2) {
  const set1 = new Set(array1);
  const set2 = new Set(array2);

  // Calculate the intersection of the two sets
  const intersection = new Set([...set1].filter((x) => set2.has(x)));

  // Calculate the union of the two sets
  const union = new Set([...set1, ...set2]);

  // Calculate the Jaccard Similarity
  const similarity = intersection.size / union.size;

  return similarity;
}

// similarity metric for genres
function calculateCosineSimilarity(user1Genres, user2Genres) {
  // Create a combined list of unique genres from both users
  const allGenres = new Set([
    ...Object.keys(user1Genres),
    ...Object.keys(user2Genres),
  ]);

  // Initialize vectors with zeros
  const vector1 = [];
  const vector2 = [];

  // Populate vectors based on genre counts
  allGenres.forEach((genre) => {
    vector1.push(user1Genres[genre] || 0); // If genre missing, set count to 0
    vector2.push(user2Genres[genre] || 0); // If genre missing, set count to 0
  });

  // Calculate dot product
  let dotProduct = 0;
  let magnitude1 = 0;
  let magnitude2 = 0;

  for (let i = 0; i < allGenres.size; i++) {
    dotProduct += vector1[i] * vector2[i];
    magnitude1 += vector1[i] * vector1[i];
    magnitude2 += vector2[i] * vector2[i];
  }

  magnitude1 = Math.sqrt(magnitude1);
  magnitude2 = Math.sqrt(magnitude2);

  // Calculate cosine similarity
  const similarity = dotProduct / (magnitude1 * magnitude2);

  return similarity;
}

function combineSimilarities(sim1, sim2, sim3, weight1, weight2, weight3) {
  const totWeight = weight1 + weight2 + weight3;

  const combinedSimilarity =
    (weight1 * sim1 + weight2 * sim2 + weight3 * sim3) / totWeight;

  return combinedSimilarity;
}

async function fetchUser(userID) {
  try {
    let collection = await db.collection("user-favorites");

    const query = {
      userID: userID,
      artists_long_term: { $exists: true },
      artists_medium_term: { $exists: true },
      artists_short_term: { $exists: true },
      songs_long_term: { $exists: true },
      songs_medium_term: { $exists: true },
      songs_short_term: { $exists: true },
    };

    const userData = await collection.findOne(query);
    return userData;
  } catch (err) {
    throw err;
  }
}

function parseSongs(songs) {
  const songNames = [];

  songs.forEach((song) => {
    songNames.push(song.songName);
  });

  return songNames;
}

function parseArtists(artists) {
  const artistNames = [];
  const genreCounts = {};

  artists.forEach((artist) => {
    artistNames.push(artist.artistName);

    if (artist.genres && Array.isArray(artist.genres)) {
      artist.genres.forEach((genre) => {
        if (genreCounts.hasOwnProperty(genre)) {
          genreCounts[genre]++;
        } else {
          genreCounts[genre] = 1;
        }
      });
    }
  });

  return [artistNames, genreCounts];
}

// Endpoint to calcualte similarity score between users
// returns short term, medium term, long term and total similarity scores
router.get("/calculate-similarity", async (req, res) => {
  // get users id
  const user1_ID = req.query.user1_ID;
  const user2_ID = req.query.user2_ID;

  // fetch user data
  try {
    const user1Data = await fetchUser(user1_ID);
    const user2Data = await fetchUser(user2_ID);

    // parse the songs to get arrays of song titles
    const user1SongsShortTerm = parseSongs(user1Data.songs_short_term);
    const user1SongsMediumTerm = parseSongs(user1Data.songs_medium_term);
    const user1SongsLongTerm = parseSongs(user1Data.songs_long_term);
    const user2SongsShortTerm = parseSongs(user2Data.songs_short_term);
    const user2SongsMediumTerm = parseSongs(user2Data.songs_medium_term);
    const user2SongsLongTerm = parseSongs(user2Data.songs_long_term);

    // parse the artists names and genres out of the artists arrays
    const [user1ArtistsShortTerm, user1GenresShortTerm] = parseArtists(
      user1Data.artists_short_term
    );
    const [user1ArtistsMediumTerm, user1GenresMediumTerm] = parseArtists(
      user1Data.artists_medium_term
    );
    const [user1ArtistsLongTerm, user1GenresLongTerm] = parseArtists(
      user1Data.artists_long_term
    );
    const [user2ArtistsShortTerm, user2GenresShortTerm] = parseArtists(
      user2Data.artists_short_term
    );
    const [user2ArtistsMediumTerm, user2GenresMediumTerm] = parseArtists(
      user2Data.artists_medium_term
    );
    const [user2ArtistsLongTerm, user2GenresLongTerm] = parseArtists(
      user2Data.artists_long_term
    );

    // calculate jaccard similarity of songs
    const songsShortSimilarity = jaccardSimilarity(
      user1SongsShortTerm,
      user2SongsShortTerm
    );
    const songsMediumSimilarity = jaccardSimilarity(
      user1SongsMediumTerm,
      user2SongsMediumTerm
    );
    const songsLongSimilarity = jaccardSimilarity(
      user1SongsLongTerm,
      user2SongsLongTerm
    );

    // calculate jaccard similarity of artists
    const artistsShortSimilarity = jaccardSimilarity(
      user1ArtistsShortTerm,
      user2ArtistsShortTerm
    );
    const artistsMediumSimilarity = jaccardSimilarity(
      user1ArtistsMediumTerm,
      user2ArtistsMediumTerm
    );
    const artistsLongSimilarity = jaccardSimilarity(
      user1ArtistsLongTerm,
      user2ArtistsLongTerm
    );

    // calculate the cosine similarity of genres
    const genreShortSimilarity = calculateCosineSimilarity(
      user1GenresShortTerm,
      user2GenresShortTerm
    );
    const genreMediumSimilarity = calculateCosineSimilarity(
      user1GenresMediumTerm,
      user2GenresMediumTerm
    );
    const genreLongSimilarity = calculateCosineSimilarity(
      user1GenresLongTerm,
      user2GenresLongTerm
    );

    let combinedShortSimilarity = combineSimilarities(
      songsShortSimilarity,
      artistsShortSimilarity,
      genreShortSimilarity,
      1,
      2,
      3
    );

    let combinedMediumSimilarity = combineSimilarities(
      songsMediumSimilarity,
      artistsMediumSimilarity,
      genreMediumSimilarity,
      1,
      2,
      3
    );

    let combinedLongSimilarity = combineSimilarities(
      songsLongSimilarity,
      artistsLongSimilarity,
      genreLongSimilarity,
      1,
      2,
      3
    );

    combinedShortSimilarity = combinedShortSimilarity * 3;
    combinedMediumSimilarity = combinedMediumSimilarity * 3;
    combinedLongSimilarity = combinedLongSimilarity * 3;

    let combinedTotalSimilarity = combineSimilarities(
      combinedShortSimilarity,
      combinedMediumSimilarity,
      combinedLongSimilarity,
      1,
      2,
      3
    );

    if (combinedTotalSimilarity > 1) {
      combinedTotalSimilarity = 1;
    }

    if (combinedTotalSimilarity > 1) {
      combinedTotalSimilarity = 1;
    }

    if (combinedTotalSimilarity > 1) {
      combinedTotalSimilarity = 1;
    }

    if (combinedTotalSimilarity > 1) {
      combinedTotalSimilarity = 1;
    }

    console.log("Similarity: " + combinedTotalSimilarity);

    // make scores between 0 and 100
    const musicMatchScore = Math.floor(combinedTotalSimilarity * 100);
    const shortTermScore = Math.floor(combinedShortSimilarity * 100);
    const mediumTermScore = Math.floor(combinedMediumSimilarity * 100);
    const longTermScore = Math.floor(combinedLongSimilarity * 100);

    const results = {
      shortTermScore,
      mediumTermScore,
      longTermScore,
      musicMatchScore,
    };

    res.send(JSON.stringify(results, null, 2));
  } catch (err) {
    console.log("Error fetching user data in similarity endpoint: " + err);
    res.status(404).send();
  }
});

export default router;
