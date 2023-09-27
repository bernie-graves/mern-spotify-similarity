import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet, HelmetProvider } from "react-helmet-async";
import "../styles/buttons.css";

function SharePage() {
  const [shareLink, setShareLink] = useState();
  const [senderID, setSenderID] = useState();

  const navigate = useNavigate();

  useEffect(() => {
    // Get the current URL's search params
    const searchParams = new URLSearchParams(window.location.search);
    const share_link = searchParams.get("share_link");

    const share_link_url = new URL(share_link);
    const senderID_temp = share_link_url.searchParams.get("userId");

    // Set the value of variable1 in the component's state
    if (share_link) {
      setShareLink(share_link);
    }

    if (senderID_temp) {
      setSenderID(senderID_temp);
    }
  }, []);

  return (
    <div>
      {/* Set the title to show in link previews */}
      <HelmetProvider>
        <Helmet>
          <title>Soundmate -- Friend Request</title>
        </Helmet>
      </HelmetProvider>
      <h3
        style={{
          color: "whitesmoke",
          marginTop: "20px",
        }}
      >
        {senderID} sent you a friend request for Soundmates for Spotify
      </h3>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <button
          onClick={() => (window.location.href = shareLink)}
          className="friend-button add-friend-button"
          style={{
            margin: "auto",
            marginTop: "10px",
          }}
        >
          <span>Continue</span>
        </button>
        <button
          onClick={() => navigate("/")}
          className="friend-button cancel-button"
          style={{
            margin: "auto",
            marginTop: "10px",
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export default SharePage;
