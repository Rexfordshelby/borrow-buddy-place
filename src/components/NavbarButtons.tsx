
import { useAuth } from "@/context/AuthContext";
import { Link } from "react-router-dom";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, LogOut, Package, Heart, Settings, MessageSquare, Plus } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function NavbarButtons() {
  const { user, profile, signOut } = useAuth();

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Link to="/auth?tab=login">
          <Button variant="outline" size="sm">Sign In</Button>
        </Link>
        <Link to="/auth?tab=signup">
          <Button size="sm">Sign Up</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm">
            <Plus className="mr-2 h-4 w-4" />
            List
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
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarImage src={profile?.avatar_url} alt={profile?.full_name || "User"} />
              <AvatarFallback>
                {profile?.full_name?.[0] || profile?.username?.[0] || "U"}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{profile?.full_name || profile?.username}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {user.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <Link to="/dashboard/listings">
              <DropdownMenuItem>
                <Package className="mr-2 h-4 w-4" />
                <span>My Listings</span>
              </DropdownMenuItem>
            </Link>
            <Link to="/dashboard/wishlist">
              <DropdownMenuItem>
                <Heart className="mr-2 h-4 w-4" />
                <span>Wishlist</span>
              </DropdownMenuItem>
            </Link>
            <Link to="/dashboard/messages">
              <DropdownMenuItem>
                <MessageSquare className="mr-2 h-4 w-4" />
                <span>Messages</span>
              </DropdownMenuItem>
            </Link>
            <Link to="/dashboard/profile">
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Profile Settings</span>
              </DropdownMenuItem>
            </Link>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => signOut()} className="text-red-600 hover:text-red-700 focus:text-red-700">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Sign out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export default NavbarButtons;
