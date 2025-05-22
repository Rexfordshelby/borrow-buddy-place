
import { useState, useEffect } from "react";
import { Routes, Route, Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { UserRound, Package, Heart, Calendar, Settings, UserCheck } from "lucide-react";
import UserProfile from "@/components/dashboard/UserProfile";
import UserListings from "@/components/dashboard/UserListings";
import UserBookings from "@/components/dashboard/UserBookings";
import UserRentals from "@/components/dashboard/UserRentals";
import UserWishlist from "@/components/dashboard/UserWishlist";
import UserVerification from "@/components/dashboard/UserVerification";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activePath, setActivePath] = useState("");

  useEffect(() => {
    const path = location.pathname.split("/").pop() || "profile";
    setActivePath(path);
  }, [location]);

  if (!user) {
    return null; // Should be handled by PrivateRoute
  }

  const navItems = [
    {
      label: "My Profile",
      icon: <UserRound className="h-5 w-5 mr-2" />,
      path: "profile",
    },
    {
      label: "My Listings",
      icon: <Package className="h-5 w-5 mr-2" />,
      path: "listings",
    },
    {
      label: "My Bookings",
      icon: <Calendar className="h-5 w-5 mr-2" />,
      path: "bookings",
    },
    {
      label: "My Rentals",
      icon: <Package className="h-5 w-5 mr-2" />,
      path: "rentals",
    },
    {
      label: "Wishlist",
      icon: <Heart className="h-5 w-5 mr-2" />,
      path: "wishlist",
    },
    {
      label: "Verification",
      icon: <UserCheck className="h-5 w-5 mr-2" />,
      path: "verification",
    },
    {
      label: "Settings",
      icon: <Settings className="h-5 w-5 mr-2" />,
      path: "settings",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">My Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg border p-4 sticky top-20">
              <nav className="space-y-1">
                {navItems.map(item => (
                  <Link
                    key={item.path}
                    to={`/dashboard/${item.path}`}
                    className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                      activePath === item.path
                        ? "bg-brand-50 text-brand-600 font-medium"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                ))}
              </nav>

              <Separator className="my-4" />

              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate("/list-item")}
              >
                + List New Item
              </Button>
            </div>
          </div>

          <div className="md:col-span-3">
            <Routes>
              <Route path="/" element={<UserProfile />} />
              <Route path="profile" element={<UserProfile />} />
              <Route path="listings" element={<UserListings />} />
              <Route path="bookings" element={<UserBookings />} />
              <Route path="rentals" element={<UserRentals />} />
              <Route path="wishlist" element={<UserWishlist />} />
              <Route path="verification" element={<UserVerification />} />
              <Route path="settings" element={<div>Settings placeholder</div>} />
            </Routes>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Dashboard;
