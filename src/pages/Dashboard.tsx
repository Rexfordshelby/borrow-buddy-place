
import { useState } from "react";
import { Routes, Route, Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import UserListings from "@/components/dashboard/UserListings";
import UserBookings from "@/components/dashboard/UserBookings";
import UserRentals from "@/components/dashboard/UserRentals";
import UserProfile from "@/components/dashboard/UserProfile";
import UserWishlist from "@/components/dashboard/UserWishlist";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  Package, Calendar, User, Heart, LogOut, MessageSquare,
} from "lucide-react";

const Dashboard = () => {
  const { signOut, profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.pathname.split('/').pop() || 'listings');

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    navigate(`/dashboard/${value}`);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border p-6 sticky top-6">
              <div className="flex items-center mb-6">
                <div className="h-12 w-12 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-bold text-xl">
                  {profile?.full_name?.charAt(0) || profile?.username?.charAt(0) || 'U'}
                </div>
                <div className="ml-3">
                  <h3 className="font-bold">{profile?.full_name || profile?.username}</h3>
                  <p className="text-sm text-gray-500">{profile?.email}</p>
                </div>
              </div>

              <div className="space-y-2 mb-6">
                <Button 
                  variant={activeTab === 'listings' ? 'default' : 'ghost'} 
                  onClick={() => handleTabChange('listings')}
                  className="w-full justify-start"
                >
                  <Package className="h-4 w-4 mr-2" />
                  My Listings
                </Button>
                <Button 
                  variant={activeTab === 'bookings' ? 'default' : 'ghost'} 
                  onClick={() => handleTabChange('bookings')}
                  className="w-full justify-start"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  My Bookings
                </Button>
                <Button 
                  variant={activeTab === 'rentals' ? 'default' : 'ghost'} 
                  onClick={() => handleTabChange('rentals')}
                  className="w-full justify-start"
                >
                  <Package className="h-4 w-4 mr-2" />
                  My Rentals
                </Button>
                <Button 
                  variant={activeTab === 'wishlist' ? 'default' : 'ghost'} 
                  onClick={() => handleTabChange('wishlist')}
                  className="w-full justify-start"
                >
                  <Heart className="h-4 w-4 mr-2" />
                  Wishlist
                </Button>
                <Button 
                  variant={activeTab === 'messages' ? 'default' : 'ghost'} 
                  onClick={() => handleTabChange('messages')}
                  className="w-full justify-start"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Messages
                </Button>
                <Button 
                  variant={activeTab === 'profile' ? 'default' : 'ghost'} 
                  onClick={() => handleTabChange('profile')}
                  className="w-full justify-start"
                >
                  <User className="h-4 w-4 mr-2" />
                  Profile Settings
                </Button>
              </div>

              <Button 
                variant="outline" 
                className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
                onClick={signOut}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="mb-6">
              <Tabs value={activeTab} onValueChange={handleTabChange} className="hidden sm:block">
                <TabsList className="grid grid-cols-6 w-full">
                  <TabsTrigger value="listings">Listings</TabsTrigger>
                  <TabsTrigger value="bookings">Bookings</TabsTrigger>
                  <TabsTrigger value="rentals">Rentals</TabsTrigger>
                  <TabsTrigger value="wishlist">Wishlist</TabsTrigger>
                  <TabsTrigger value="messages">Messages</TabsTrigger>
                  <TabsTrigger value="profile">Profile</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <Routes>
              <Route path="/" element={<UserListings />} />
              <Route path="/listings" element={<UserListings />} />
              <Route path="/bookings" element={<UserBookings />} />
              <Route path="/rentals" element={<UserRentals />} />
              <Route path="/wishlist" element={<UserWishlist />} />
              <Route path="/messages" element={
                <div className="bg-white rounded-lg border p-8 text-center">
                  <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-bold mb-2">Messages Coming Soon</h3>
                  <p className="text-gray-500 mb-6">
                    Our messaging system will be available soon. Stay tuned!
                  </p>
                  <Button onClick={() => handleTabChange('listings')}>
                    View My Listings
                  </Button>
                </div>
              } />
              <Route path="/profile" element={<UserProfile />} />
            </Routes>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
