
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ItemCard from "@/components/ItemCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { Search, SlidersHorizontal, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import SearchFilters from "@/components/SearchFilters";

interface ItemWithDistance {
  id: string;
  title: string;
  price: number;
  price_unit: string;
  location: string;
  image_url: string | null;
  is_verified: boolean;
  is_service: boolean;
  is_available: boolean;
  latitude: number | null;
  longitude: number | null;
  categories: {
    name: string;
    slug: string;
  } | null;
  distance?: number | null;
  rating?: number;
  review_count?: number;
}

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState<ItemWithDistance[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  
  const initialQuery = searchParams.get("q") || "";
  const initialCategory = searchParams.get("category") || "";
  const initialType = searchParams.get("type") || "";
  const initialDistance = searchParams.get("distance") || "25";
  
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [showOnlyServices, setShowOnlyServices] = useState(initialType === "service");
  const [showOnlyItems, setShowOnlyItems] = useState(initialType === "item");
  const [maxDistance, setMaxDistance] = useState(parseInt(initialDistance));
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "newest");
  const [priceRange, setPriceRange] = useState([
    parseInt(searchParams.get("minPrice") || "0"),
    parseInt(searchParams.get("maxPrice") || "1000")
  ]);

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .order('name');
          
        if (error) throw error;
        setCategories(data || []);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  // Calculate distance between two geographic coordinates
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return Infinity;
    
    const R = 3958.8; // Earth's radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    return R * c;
  };

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      
      try {
        let query = supabase
          .from('items')
          .select(`
            *,
            profiles(username, avatar_url),
            categories(name, slug)
          `)
          .eq('is_available', true);
          
        // Apply search filters
        if (initialQuery) {
          query = query.ilike('title', `%${initialQuery}%`);
        }
        
        if (initialCategory) {
          query = query.eq('categories.slug', initialCategory);
        }
        
        // Filter by type (service or item)
        if (initialType === 'service') {
          query = query.eq('is_service', true);
        } else if (initialType === 'item') {
          query = query.eq('is_service', false);
        }

        // Sort order
        if (sortBy === 'price_low') {
          query = query.order('price', { ascending: true });
        } else if (sortBy === 'price_high') {
          query = query.order('price', { ascending: false });
        } else if (sortBy === 'rating') {
          // Sort by rating would go here if we had a rating system
          query = query.order('created_at', { ascending: false });
        } else {
          // Default to newest
          query = query.order('created_at', { ascending: false });
        }
        
        let { data, error } = await query;
        
        if (error) throw error;

        // Client-side filtering for distance and price
        if (data) {
          let filteredData = data as ItemWithDistance[];
          
          // Filter by price
          filteredData = filteredData.filter(item => 
            item.price >= priceRange[0] && 
            item.price <= priceRange[1]
          );
          
          // Filter by distance if user location is available
          if (userLocation) {
            filteredData = filteredData.map(item => {
              if (item.latitude && item.longitude) {
                const distance = calculateDistance(
                  userLocation.latitude,
                  userLocation.longitude,
                  item.latitude,
                  item.longitude
                );
                return {...item, distance};
              }
              return {...item, distance: null};
            });

            // Only show items within the selected max distance
            filteredData = filteredData.filter(item => 
              item.distance === null || item.distance <= maxDistance
            );

            // Sort by proximity if that's the selected sort order
            if (sortBy === 'proximity') {
              filteredData.sort((a, b) => {
                // Handle null distances (push to end)
                if (a.distance === null) return 1;
                if (b.distance === null) return -1;
                return a.distance - b.distance;
              });
            }
          }
          
          setItems(filteredData);
        } else {
          setItems([]);
        }
      } catch (error) {
        console.error("Error searching items:", error);
        toast({
          title: "Error",
          description: "Failed to load search results",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [initialQuery, initialCategory, initialType, maxDistance, priceRange, sortBy, userLocation]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    const params = new URLSearchParams();
    if (searchTerm) {
      params.set("q", searchTerm);
    }
    if (selectedCategory) {
      params.set("category", selectedCategory);
    }
    
    // Set listing type filter
    if (showOnlyServices) {
      params.set("type", "service");
    } else if (showOnlyItems) {
      params.set("type", "item");
    }
    
    // Set distance filter
    params.set("distance", maxDistance.toString());
    
    // Set price range
    params.set("minPrice", priceRange[0].toString());
    params.set("maxPrice", priceRange[1].toString());
    
    // Set sort order
    params.set("sort", sortBy);
    
    setSearchParams(params);
  };

  const handleFilterReset = () => {
    setSearchTerm("");
    setSelectedCategory("");
    setShowOnlyServices(false);
    setShowOnlyItems(false);
    setMaxDistance(25);
    setPriceRange([0, 1000]);
    setSortBy("newest");
    setSearchParams({});
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (selectedCategory) count++;
    if (showOnlyServices || showOnlyItems) count++;
    if (maxDistance !== 25) count++;
    if (priceRange[0] > 0 || priceRange[1] < 1000) count++;
    if (sortBy !== "newest") count++;
    return count;
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <div className="bg-gray-50 py-8">
          <div className="container mx-auto px-4">
            <form onSubmit={handleSearch} className="max-w-4xl mx-auto">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="What do you need to borrow or book?"
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="md:w-1/3">
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.slug}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Sheet open={showFilters} onOpenChange={setShowFilters}>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="md:w-auto w-full justify-between">
                      <span className="flex items-center">
                        <SlidersHorizontal className="h-4 w-4 mr-2" />
                        Filters
                      </span>
                      {getActiveFiltersCount() > 0 && (
                        <Badge className="ml-2 bg-brand-500">{getActiveFiltersCount()}</Badge>
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent>
                    <SheetHeader>
                      <SheetTitle>Search Filters</SheetTitle>
                      <SheetDescription>
                        Refine your search results
                      </SheetDescription>
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
                      handleFilterReset={handleFilterReset}
                      handleSearch={handleSearch}
                      setShowFilters={setShowFilters}
                      categories={categories}
                    />
                  </SheetContent>
                </Sheet>

                <Button type="submit">Search</Button>
              </div>
            </form>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-6">
            {loading ? "Searching..." : (
              items.length > 0 
                ? `${items.length} results found`
                : "No results found"
            )}
          </h1>

          {getActiveFiltersCount() > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {selectedCategory && (
                <Badge variant="outline" className="flex items-center gap-1">
                  Category: {categories.find(c => c.slug === selectedCategory)?.name || selectedCategory}
                  <X 
                    className="h-3 w-3 ml-1 cursor-pointer" 
                    onClick={() => {
                      setSelectedCategory("");
                      handleSearch({ preventDefault: () => {} } as any);
                    }} 
                  />
                </Badge>
              )}
              {showOnlyServices && (
                <Badge variant="outline" className="flex items-center gap-1">
                  Services only
                  <X 
                    className="h-3 w-3 ml-1 cursor-pointer" 
                    onClick={() => {
                      setShowOnlyServices(false);
                      handleSearch({ preventDefault: () => {} } as any);
                    }} 
                  />
                </Badge>
              )}
              {showOnlyItems && (
                <Badge variant="outline" className="flex items-center gap-1">
                  Items only
                  <X 
                    className="h-3 w-3 ml-1 cursor-pointer" 
                    onClick={() => {
                      setShowOnlyItems(false);
                      handleSearch({ preventDefault: () => {} } as any);
                    }} 
                  />
                </Badge>
              )}
              {(priceRange[0] > 0 || priceRange[1] < 1000) && (
                <Badge variant="outline" className="flex items-center gap-1">
                  Price: ${priceRange[0]} - ${priceRange[1]}
                  <X 
                    className="h-3 w-3 ml-1 cursor-pointer" 
                    onClick={() => {
                      setPriceRange([0, 1000]);
                      handleSearch({ preventDefault: () => {} } as any);
                    }} 
                  />
                </Badge>
              )}
              {maxDistance !== 25 && (
                <Badge variant="outline" className="flex items-center gap-1">
                  Within {maxDistance} miles
                  <X 
                    className="h-3 w-3 ml-1 cursor-pointer" 
                    onClick={() => {
                      setMaxDistance(25);
                      handleSearch({ preventDefault: () => {} } as any);
                    }} 
                  />
                </Badge>
              )}
              {sortBy !== "newest" && (
                <Badge variant="outline" className="flex items-center gap-1">
                  Sorted by: {sortBy.replace('_', ' ')}
                  <X 
                    className="h-3 w-3 ml-1 cursor-pointer" 
                    onClick={() => {
                      setSortBy("newest");
                      handleSearch({ preventDefault: () => {} } as any);
                    }} 
                  />
                </Badge>
              )}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleFilterReset}
                className="text-gray-500 text-xs"
              >
                Clear all
              </Button>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
              <span className="ml-2">Searching...</span>
            </div>
          ) : (
            <>
              {items.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-gray-600 mb-4">
                    No items match your search criteria. Try adjusting your filters or search term.
                  </p>
                  <Button variant="outline" onClick={() => setSearchParams({})}>
                    Clear Filters
                  </Button>
                </div>
              ) : (
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
                      rating={item.rating || 4.5} // Use item rating or placeholder
                      reviewCount={item.review_count || 0} // Use item review count or placeholder
                      category={item.categories?.name}
                      isVerified={item.is_verified}
                      isService={item.is_service}
                      distance={item.distance}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SearchPage;
