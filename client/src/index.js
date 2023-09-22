import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import "bootstrap/dist/css/bootstrap.min.css";

import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import HomePage from "./pages/home";
import FavesPage from "./pages/faves";
import SharePage from "./pages/sharePage";
import FriendsPage from "./pages/friendsPage";
import AddFriendsPage from "./pages/addFriendPage";
import FriendsSimilarityPage from "./pages/friendSimilarityPage";
import MyNavbar from "./components/navbar";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <div className="App">
      <MyNavbar />
      <div className="app-content">
        <App />
        <Router>
          <Routes>
            <Route path="/" Component={HomePage} />
            <Route path="/faves" Component={FavesPage} />
            <Route path="/friends" Component={FriendsPage} />
            <Route path="/share" Component={SharePage} />
            <Route path="/add_friend" Component={AddFriendsPage} />
            <Route
              path="/friend_similarity"
              Component={FriendsSimilarityPage}
            />
          </Routes>
        </Router>
      </div>
    </div>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
