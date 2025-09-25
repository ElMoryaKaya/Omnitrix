import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
//import OrderPage from "./pages/OrderPage";
import LoginPage from "./pages/LoginPage";
//import AdminPage from "./pages/AdminPage";
import CreateAccountPage from "./pages/CreateAccountPage";
import MapPage from "./pages/MapPage";

const App: React.FC = () => {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<CreateAccountPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/map" element={<MapPage />} />
        </Routes>
      </Router>
    </>
  );
};

export default App;
/*
<Route path="/" element={<OrderPage />} />
<Route path="/admin" element={<AdminPage />} />
<Route path="/create-account" element={<CreateAccountPage />} />
*/
