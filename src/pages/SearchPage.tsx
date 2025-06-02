import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, X, MapPin, Calendar } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ItemCard from "@/components/ItemCard";
import SearchFilters from "@/components/SearchFilters";
import LocationSearchFilter from "@/components/search/LocationSearchFilter";
import { toast } from "@/components/ui/use-toast";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [items, setItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter states
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "");
  const [showOnlyItems, setShowOnlyItems] = useState(false);
  const [showOnlyServices, setShowOnlyServices] = useState(false);
  const [maxDistance, setMaxDistance] = useState(25);
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [sortBy, setSortBy] = useState("newest");
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [availabilityDate, setAvailabilityDate] = useState<Date | null>(null);

  useEffect(() => {
    fetchCategories();
    handleSearch({ preventDefault: () => {} } as any);
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name");

      if (error) throw error;
      setCategories(data || []);
    } catch (error: any) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let query = supabase
        .from("items")
        .select("*")
        .eq("is_available", true);

      // Text search
      if (searchQuery.trim()) {
        query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,location.ilike.%${searchQuery}%`);
      }

      // Category filter
      if (selectedCategory) {
        const category = categories.find(c => c.slug === selectedCategory);
        if (category) {
          query = query.eq("category_id", category.id);
        }
      }

      // Item type filters
      if (showOnlyItems && !showOnlyServices) {
        query = query.eq("is_service", false);
      } else if (showOnlyServices && !showOnlyItems) {
        query = query.eq("is_service", true);
      }

      // Price range filter
      if (priceRange[0] > 0 || priceRange[1] < 1000) {
        query = query.gte("price", priceRange[0]).lte("price", priceRange[1]);
      }

      // Availability date filter
      if (availabilityDate) {
        const dateStr = availabilityDate.toISOString().split('T')[0];
        query = query.contains("availability_calendar", [dateStr]);
      }

      // Sorting
      switch (sortBy) {
        case "price_low":
          query = query.order("price", { ascending: true });
          break;
        case "price_high":
          query = query.order("price", { ascending: false });
          break;
        case "rating":
          query = query.order("created_at", { ascending: false }); // Fallback since rating might not be directly available
          break;
        case "proximity":
          if (userLocation) {
            // Note: This is a simplified distance calculation
            // In production, you'd want to use PostGIS for accurate geo queries
            query = query.order("created_at", { ascending: false });
          }
          break;
        default:
          query = query.order("created_at", { ascending: false });
      }

      const { data, error } = await query.limit(50);

      if (error) throw error;

      // Process items to add profiles and ratings
      let processedItems = data || [];

      if (userLocation && maxDistance < 100) {
        processedItems = processedItems.filter(item => {
          if (!item.latitude || !item.longitude) return true;
          const distance = calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            item.latitude,
            item.longitude
          );
          return distance <= maxDistance;
        });
      }

      // Add profiles and ratings
      const itemsWithData = await Promise.all(
        processedItems.map(async (item) => {
          // Fetch user profile
          const { data: profile } = await supabase
            .from("profiles")
            .select("username, full_name, avatar_url, rating")
            .eq("id", item.user_id)
            .single();

          // Fetch reviews
          const { data: reviews } = await supabase
            .from("reviews")
            .select("rating")
            .eq("item_id", item.id);

          // Handle potential profile data issues
          let userRating = 4.5; // Default rating
          if (profile?.rating) {
            userRating = profile.rating;
          }

          const avgRating = reviews && reviews.length > 0
            ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
            : userRating;

          return {
            ...item,
            profiles: profile,
            rating: avgRating,
            review_count: reviews?.length || 0
          };
        })
      );

      setItems(itemsWithData);
    } catch (error: any) {
      console.error("Search error:", error);
      toast({
        title: "Search Error",
        description: "Failed to search items. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const handleLocationSearch = (location: string, radius: number) => {
    setMaxDistance(radius);
    // Here you would typically geocode the location to get coordinates
    toast({
      title: "Location Search",
      description: `Searching within ${radius}km of ${location}`,
    });
    handleSearch({ preventDefault: () => {} } as any);
  };

  const handleFilterReset = () => {
    setSelectedCategory("");
    setShowOnlyItems(false);
    setShowOnlyServices(false);
    setMaxDistance(25);
    setPriceRange([0, 1000]);
    setSortBy("newest");
    setUserLocation(null);
    setAvailabilityDate(null);
    handleSearch({ preventDefault: () => {} } as any);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 bg-gray-50">
        <div className="container mx-auto px-4 py-6">
          {/* Search Header */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="search"
                    placeholder="Search for items, services, or locations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button type="submit" disabled={loading}>
                  {loading ? "Searching..." : "Search"}
                </Button>
                <Sheet open={showFilters} onOpenChange={setShowFilters}>
                  <SheetTrigger asChild>
                    <Button variant="outline">
                      <Filter className="h-4 w-4 mr-2" />
                      Filters
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-80 overflow-y-auto">
                    <SheetHeader>
                      <SheetTitle>Search Filters</SheetTitle>
                    </SheetHeader>
                    <SearchFilters
                      selectedCategory={selectedCategory}
                      showOnlyItems={showOnlyItems}
                      setShowOnlyItems={setShowOnlyItems}
                      showOnlyServices={showOnlyServices}
                      setShowOnlyServices={setShowOnlyServices}
                      maxDistance={maxDistance}
                      setMaxDistance={setMaxDistance}
                      priceRange={priceRange}
                      setPriceRange={setPriceRange}
                      sortBy={sortBy}
                      setSortBy={setSortBy}
                      userLocation={userLocation}
                      setUserLocation={setUserLocation}
                      handleFilterReset={handleFilterReset}
                      handleSearch={handleSearch}
                      setShowFilters={setShowFilters}
                      categories={categories}
                    />
                  </SheetContent>
                </Sheet>
              </div>
              
              <LocationSearchFilter
                onLocationSearch={handleLocationSearch}
                className="w-full"
              />
            </form>
          </div>

          {/* Results */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">
              {searchQuery ? `Search results for "${searchQuery}"` : "Browse all items"}
            </h2>
            <Badge variant="outline">
              {items.length} {items.length === 1 ? "result" : "results"}
            </Badge>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <Card key={i} className="overflow-hidden animate-pulse">
                  <div className="h-48 bg-gray-200"></div>
                  <CardContent className="p-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : items.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {items.map((item) => (
                <ItemCard
                  key={item.id}
                  id={item.id}
                  title={item.title}
                  price={item.price}
                  priceUnit={item.price_unit}
                  imageUrl={item.image_url || "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&auto=format&fit=crop&q=80"}
                  location={item.location}
                  rating={item.rating}
                  reviewCount={item.review_count}
                  category={item.categories?.name || "Uncategorized"}
                  isVerified={item.is_verified}
                  isService={item.is_service}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No results found</h3>
              <p className="text-gray-600 mb-6">
                Try adjusting your search terms or filters
              </p>
              <Button onClick={handleFilterReset}>
                Clear all filters
              </Button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SearchPage;
