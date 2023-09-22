import React from "react";
// import spotifyLogo from "../images/spotify-logo.png";
// import musicIcon from "../images/music-icon.png";

function HomePage() {
  return (
    <div style={{ color: "#aeaeae", textAlign: "center" }}>
      <h1>Welcome to Soundmates</h1>
      <p>
        Discover the magic of music matchmaking! Our website connects you with
        friends who share your music taste, so you can explore and enjoy your
        favorite tracks together.
      </p>
      <div>
        <img
          src={"/images/spotify-logo.png"}
          alt="Spotify Logo"
          style={{ width: "100px", height: "100px" }}
        />
        <img
          src={"/images/music-icon.png"}
          alt="Music Icon"
          style={{ width: "100px", height: "100px", margin: "0 20px" }}
        />
      </div>
      <p>
        Whether you're looking for new music recommendations, want to see what
        your friends are listening to, or simply want to share your musical
        journey, Spotify Music Match has got you covered.
      </p>
      <p>
        To get started, log in with your Spotify account and let the music
        adventure begin!
      </p>

      <p>
        Made with ❤️ by Bernie Graves
        <br />
        Visit my personal website to see some other projects I've worked on:
        <br />
        <a
          href="https://bernie-graves.github.io/"
          target="_blank"
          rel="noopener noreferrer"
        >
          https://bernie-graves.github.io/
        </a>
      </p>
    </div>
  );
}

export default HomePage;
