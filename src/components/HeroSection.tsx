
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const HeroSection = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Searching for:", searchTerm, "in category:", category);
    // Implement search functionality
  };

  return (
    <div className="relative bg-gradient-to-r from-brand-700 to-brand-900 text-white">
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl md:text-5xl font-bold mb-6 animate-fade-in">
            Rent Anything, From Anyone
          </h1>
          <p className="text-lg md:text-xl mb-8 text-brand-50 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            Borrow what you need from people in your neighborhood.
            Save money, reduce waste, and connect with your community.
          </p>

          <form
            onSubmit={handleSearch}
            className="relative bg-white rounded-lg p-2 shadow-lg max-w-2xl mx-auto animate-fade-in"
            style={{ animationDelay: "0.4s" }}
          >
            <div className="flex flex-col md:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="What do you need to borrow?"
                  className="pl-10 w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="md:w-1/3">
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="electronics">Electronics</SelectItem>
                    <SelectItem value="tools">Tools & Equipment</SelectItem>
                    <SelectItem value="outdoor">Outdoor Gear</SelectItem>
                    <SelectItem value="vehicles">Vehicles</SelectItem>
                    <SelectItem value="clothing">Clothing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="bg-brand-600 hover:bg-brand-700">
                Search
              </Button>
            </div>
          </form>

          <div className="mt-8 text-sm flex justify-center items-center space-x-4 text-brand-50 animate-fade-in" style={{ animationDelay: "0.6s" }}>
            <span>Popular:</span>
            <Button
              variant="link"
              className="text-brand-50 p-0 hover:text-white"
              onClick={() => setSearchTerm("drone")}
            >
              Drones
            </Button>
            <Button
              variant="link"
              className="text-brand-50 p-0 hover:text-white"
              onClick={() => setSearchTerm("camera")}
            >
              Cameras
            </Button>
            <Button
              variant="link"
              className="text-brand-50 p-0 hover:text-white"
              onClick={() => setSearchTerm("projector")}
            >
              Projectors
            </Button>
            <Button
              variant="link"
              className="text-brand-50 p-0 hover:text-white"
              onClick={() => setSearchTerm("bike")}
            >
              Bikes
            </Button>
          </div>
        </div>
      </div>
      
      {/* Wave shape divider */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          className="fill-white w-full h-[50px]"
        >
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V56.44Z"></path>
        </svg>
      </div>
    </div>
  );
};

export default HeroSection;
