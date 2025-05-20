
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, User, Menu, X } from "lucide-react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="border-b bg-white sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-bold text-brand-600">
                BorrowBuddy
              </span>
            </Link>
          </div>

          {/* Desktop search */}
          <div className="hidden md:block flex-1 max-w-md mx-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <Input
                type="search"
                placeholder="Search for items to rent..."
                className="pl-10 w-full"
              />
            </div>
          </div>

          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center space-x-4">
            <Link
              to="/list-item"
              className="text-brand-600 font-medium hover:text-brand-500"
            >
              List Your Item
            </Link>
            <Button variant="outline" size="sm">
              Sign In
            </Button>
            <Button size="sm">Sign Up</Button>
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-md focus:outline-none"
            >
              {isOpen ? (
                <X className="h-6 w-6 text-gray-600" />
              ) : (
                <Menu className="h-6 w-6 text-gray-600" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="md:hidden py-2 space-y-2 animate-fade-in">
            <div className="relative mb-4">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <Input
                type="search"
                placeholder="Search for items to rent..."
                className="pl-10 w-full"
              />
            </div>
            <Link
              to="/list-item"
              className="block px-3 py-2 rounded-md text-base font-medium text-brand-600 hover:bg-gray-50"
            >
              List Your Item
            </Link>
            <div className="pt-4 pb-3 border-t border-gray-200">
              <div className="flex items-center space-x-3 px-4">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-brand-500 flex items-center justify-center">
                    <User className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <Button
                    variant="outline"
                    className="w-full justify-center mb-2"
                  >
                    Sign In
                  </Button>
                  <Button className="w-full justify-center">Sign Up</Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
