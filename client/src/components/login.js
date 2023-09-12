import React from "react";
import "../styles/CircularButton.css";

function Login() {
  return (
    <a className="circular-button" href="/api/spotify/login">
      Login with Spotify
    </a>
  );
}

export default Login;
