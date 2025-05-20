
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, LogIn, Package, Calendar, Heart, MessageSquare, Settings, LogOut } from "lucide-react";

const NavbarButtons = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => navigate('/auth')}>
          Log In
        </Button>
        <Button onClick={() => navigate('/auth?tab=signup')}>
          Sign Up
        </Button>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <Button variant="outline" onClick={() => navigate('/list-item')}>
        List an Item
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="rounded-full">
            <span className="sr-only">Open user menu</span>
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.full_name || profile.username || "User"}
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <User className="h-5 w-5" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            {profile?.full_name || profile?.username || user.email}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => navigate('/dashboard/listings')}>
              <Package className="mr-2 h-4 w-4" />
              <span>My Listings</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/dashboard/bookings')}>
              <Calendar className="mr-2 h-4 w-4" />
              <span>My Bookings</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/dashboard/wishlist')}>
              <Heart className="mr-2 h-4 w-4" />
              <span>Wishlist</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/dashboard/messages')}>
              <MessageSquare className="mr-2 h-4 w-4" />
              <span>Messages</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => navigate('/dashboard/profile')}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Profile Settings</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={signOut}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Sign out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default NavbarButtons;
