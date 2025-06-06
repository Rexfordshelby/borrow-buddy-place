
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { User, Settings, LogOut, MessageSquare, Plus, Package, Heart } from "lucide-react";
import NotificationSystem from "./NotificationSystem";
import LanguageSelector from "./LanguageSelector";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const Navbar = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50 animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center transition-transform hover:scale-105">
              <span className="text-2xl font-bold text-blue-600">BorrowBuddy</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <LanguageSelector />
            
            {user ? (
              <>
                <NotificationSystem />
                
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="hidden sm:flex transition-all hover:bg-brand-50">
                      <Plus className="mr-2 h-4 w-4" />
                      List Item
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0 w-48">
                    <div className="p-2">
                      <Link to="/list-item">
                        <Button variant="ghost" size="sm" className="w-full justify-start">
                          <Package className="mr-2 h-4 w-4" />
                          <span>List an Item</span>
                        </Button>
                      </Link>
                      <Link to="/list-item?type=service">
                        <Button variant="ghost" size="sm" className="w-full justify-start">
                          <MessageSquare className="mr-2 h-4 w-4" />
                          <span>Offer a Service</span>
                        </Button>
                      </Link>
                    </div>
                  </PopoverContent>
                </Popover>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/messages")}
                  className="hidden sm:flex transition-all hover:bg-brand-50"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Messages
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full transition-all hover:bg-brand-50">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={profile?.avatar_url || user.user_metadata?.avatar_url} alt={profile?.full_name || "User"} />
                        <AvatarFallback>
                          {profile?.full_name?.[0] || user.email?.[0].toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <div className="flex flex-col space-y-1 p-2">
                      <p className="text-sm font-medium leading-none">{profile?.full_name || profile?.username || user.email}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate("/dashboard/profile")}>
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/dashboard/listings")}>
                      <Package className="mr-2 h-4 w-4" />
                      <span>My Listings</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/dashboard/wishlist")}>
                      <Heart className="mr-2 h-4 w-4" />
                      <span>Wishlist</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/messages")} className="sm:hidden">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      <span>Messages</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="text-red-600 hover:text-red-700 focus:text-red-700">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" onClick={() => navigate("/auth")} className="transition-all hover:bg-brand-50">
                  Sign In
                </Button>
                <Button onClick={() => navigate("/auth")} className="transition-all hover:bg-brand-700">
                  Sign Up
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
