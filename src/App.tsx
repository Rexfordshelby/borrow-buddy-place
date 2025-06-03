
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { LanguageProvider } from "./context/LanguageContext";
import { ReactQueryProvider } from "./context/ReactQueryContext";
import Home from "./pages/Home";
import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";
import ListItem from "./pages/ListItem";
import ItemDetail from "./pages/ItemDetail";
import UserProfile from "./pages/UserProfile";
import Messages from "./pages/Messages";
import CategoryPage from "./pages/CategoryPage";
import SearchPage from "./pages/SearchPage";
import ErrorBoundary from "./components/ErrorBoundary";
import RealTimeNotifications from "./components/RealTimeNotifications";
import { Toaster } from "./components/ui/toaster";

const App = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setLoading(false), 500);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent mx-auto mb-4"></div>
          <p>Loading BorrowBuddy...</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <LanguageProvider>
        <AuthProvider>
          <ReactQueryProvider>
            <Router>
              <RealTimeNotifications />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/category/:slug" element={<CategoryPage />} />
                <Route path="/dashboard/*" element={<Dashboard />} />
                <Route path="/list-item" element={<ListItem />} />
                <Route path="/list-item/:id" element={<ListItem />} />
                <Route path="/item/:id" element={<ItemDetail />} />
                <Route path="/user/:id" element={<UserProfile />} />
                <Route path="/messages" element={<Messages />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
              <Toaster />
            </Router>
          </ReactQueryProvider>
        </AuthProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
};

export default App;
