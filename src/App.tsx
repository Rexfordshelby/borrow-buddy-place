
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import ItemDetail from "./pages/ItemDetail";
import CategoryPage from "./pages/CategoryPage";
import ListItem from "./pages/ListItem";
import SearchPage from "./pages/SearchPage";
import UserProfile from "./pages/UserProfile";
import Dashboard from "./pages/Dashboard";
import PrivateRoute from "./components/PrivateRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/item/:id" element={<ItemDetail />} />
            <Route path="/category/:slug" element={<CategoryPage />} />
            <Route path="/search" element={<SearchPage />} />
            
            {/* Protected routes */}
            <Route path="/list-item" element={
              <PrivateRoute>
                <ListItem />
              </PrivateRoute>
            } />
            <Route path="/profile/:id" element={<UserProfile />} />
            <Route path="/dashboard/*" element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
