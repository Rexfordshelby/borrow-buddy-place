import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ReactQueryProvider } from "./context/ReactQueryContext";
import Home from "./pages/Home";
import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";
import ListItem from "./pages/ListItem";
import ItemDetails from "./pages/ItemDetails";
import UserProfile from "./pages/UserProfile";
import Messages from "./pages/Messages";
import ErrorBoundary from "./components/ErrorBoundary";

const App = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setLoading(false), 500);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <AuthProvider>
        <ReactQueryProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/dashboard/*" element={<Dashboard />} />
              <Route path="/list-item" element={<ListItem />} />
              <Route path="/item/:id" element={<ItemDetails />} />
              <Route path="/user/:id" element={<UserProfile />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Router>
        </ReactQueryProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;
