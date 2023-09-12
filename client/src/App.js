import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import HomePage from "./pages/home";
import FavesPage from "./pages/faves";
import SharePage from "./pages/sharePage";
import FriendsPage from "./pages/friendsPage";
import MyNavbar from "./components/navbar";

function App() {
  return (
    <div className="App">
      <MyNavbar />
      <div className="app-content">
        <Router>
          <Routes>
            {/* Define routes here */}
            <Route path="/" Component={HomePage} />
            <Route path="/faves" Component={FavesPage} />
            <Route path="/friends" Component={FriendsPage} />
            <Route path="/share" Component={SharePage} />
          </Routes>
        </Router>
      </div>
    </div>
  );
}

export default App;
