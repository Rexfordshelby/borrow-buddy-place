import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Star, Search, Filter } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

const CategoryPage = () => {
  const { slug } = useParams();
  const [items, setItems] = useState<any[]>([]);
  const [category, setCategory] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [priceRange, setPriceRange] = useState("all");

  useEffect(() => {
    const fetchCategoryAndItems = async () => {
      try {
        // Fetch category info
        const { data: categoryData, error: categoryError } = await supabase
          .from("categories")
          .select("*")
          .eq("slug", slug)
          .single();

        if (categoryError) {
          console.error("Category error:", categoryError);
          // Create mock category if not found
          setCategory({ name: slug?.charAt(0).toUpperCase() + slug?.slice(1), slug });
        } else {
          setCategory(categoryData);
        }

        // Fetch items - for now we'll show mock data since we don't have real items
        // In the future this would filter by category_id
        const mockItems = generateMockItems(slug || '');
        setItems(mockItems);

      } catch (error: any) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "Failed to load category items",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchCategoryAndItems();
    }
  }, [slug]);

  const generateMockItems = (categorySlug: string) => {
    const items = [];
    const itemTemplates = {
      electronics: [
        { title: "MacBook Pro 16\"", price: 80, description: "Latest MacBook Pro for professional work", condition: "Excellent", isService: false },
        { title: "Sony A7 III Camera", price: 120, description: "Professional mirrorless camera", condition: "Very Good", isService: false },
        { title: "iPad Pro 12.9\"", price: 45, description: "Perfect for digital art and productivity", condition: "Good", isService: false },
        { title: "Gaming Setup Complete", price: 150, description: "High-end gaming PC with monitors", condition: "Excellent", isService: false }
      ],
      tools: [
        { title: "Professional Drill Set", price: 35, description: "Complete drill set with bits", condition: "Good", isService: false },
        { title: "Circular Saw", price: 40, description: "Heavy-duty circular saw", condition: "Very Good", isService: false },
        { title: "Tool Box Complete", price: 60, description: "Full set of professional tools", condition: "Excellent", isService: false },
        { title: "Power Washer", price: 55, description: "High-pressure cleaning system", condition: "Good", isService: false }
      ],
      sports: [
        { title: "Mountain Bike", price: 50, description: "High-quality mountain bike for trails", condition: "Very Good", isService: false },
        { title: "Surfboard Set", price: 65, description: "Professional surfboard with accessories", condition: "Good", isService: false },
        { title: "Tennis Racket Pro", price: 25, description: "Professional tennis racket", condition: "Excellent", isService: false },
        { title: "Kayak Double", price: 80, description: "Two-person kayak with paddles", condition: "Very Good", isService: false }
      ],
      vehicles: [
        { title: "Tesla Model 3", price: 200, description: "Electric luxury sedan", condition: "Excellent", isService: false },
        { title: "BMW Motorcycle", price: 150, description: "Adventure touring motorcycle", condition: "Very Good", isService: false },
        { title: "Camping Van", price: 300, description: "Fully equipped camping van", condition: "Good", isService: false },
        { title: "Electric Scooter", price: 35, description: "Fast electric scooter", condition: "Excellent", isService: false }
      ],
      services: [
        { title: "Photography Session", price: 200, description: "Professional photography service", condition: "N/A", isService: true },
        { title: "Personal Training", price: 80, description: "1-on-1 fitness training", condition: "N/A", isService: true },
        { title: "Home Cleaning", price: 120, description: "Deep home cleaning service", condition: "N/A", isService: true },
        { title: "Guitar Lessons", price: 60, description: "Learn guitar with expert", condition: "N/A", isService: true }
      ]
    };

    const templates = itemTemplates[categorySlug as keyof typeof itemTemplates] || itemTemplates.electronics;
    
    templates.forEach((template, index) => {
      items.push({
        id: `${categorySlug}-${index + 1}`,
        title: template.title,
        price: template.price,
        price_unit: template.isService ? 'session' : 'day',
        description: template.description,
        condition: template.condition,
        location: `San Francisco, CA`,
        image_url: null,
        is_service: template.isService,
        is_verified: Math.random() > 0.5,
        rating: (4 + Math.random()).toFixed(1),
        owner: {
          name: `User ${index + 1}`,
          rating: (4 + Math.random()).toFixed(1),
          avatar_url: null
        }
      });
    });

    return items;
  };

  const filteredItems = items.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedItems = [...filteredItems].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'rating':
        return parseFloat(b.rating) - parseFloat(a.rating);
      default:
        return 0;
    }
  });

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <span className="ml-2">Loading items...</span>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <main className="flex-1">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-16">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {category?.name || 'Category'}
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              Discover amazing {category?.name?.toLowerCase()} for rent in your area
            </p>
            <div className="flex items-center text-blue-100">
              <span>{sortedItems.length} items available</span>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Search and Filters */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priceRange} onValueChange={setPriceRange}>
                <SelectTrigger>
                  <SelectValue placeholder="Price range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Prices</SelectItem>
                  <SelectItem value="0-50">$0 - $50</SelectItem>
                  <SelectItem value="50-100">$50 - $100</SelectItem>
                  <SelectItem value="100+">$100+</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Items Grid */}
          {sortedItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {sortedItems.map((item) => (
                <Card key={item.id} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-md">
                  <CardHeader className="p-0">
                    <div className="relative overflow-hidden rounded-t-lg">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.title}
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-48 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center group-hover:from-gray-300 group-hover:to-gray-400 transition-colors duration-300">
                          <span className="text-gray-500 text-sm">No image</span>
                        </div>
                      )}
                      {item.is_verified && (
                        <Badge className="absolute top-2 right-2 bg-green-500 hover:bg-green-600">
                          Verified
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-bold text-lg group-hover:text-blue-600 transition-colors">
                          {item.title}
                        </h3>
                        <p className="text-gray-600 text-sm line-clamp-2">{item.description}</p>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="text-2xl font-bold text-green-600">
                          ${item.price}/{item.price_unit}
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 mr-1" />
                          {item.rating}
                        </div>
                      </div>

                      <div className="flex items-center text-sm text-gray-500 mb-3">
                        <MapPin className="h-4 w-4 mr-1" />
                        {item.location}
                      </div>

                      {!item.is_service && (
                        <div className="text-sm text-gray-600">
                          Condition: <span className="font-medium">{item.condition}</span>
                        </div>
                      )}

                      <Link to={`/item/${item.id}`} className="block">
                        <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                          {item.is_service ? 'Book Service' : 'Rent Now'}
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <Filter className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No items found</h3>
              <p className="text-gray-600 mb-8">Try adjusting your search terms or filters</p>
              <Button onClick={() => setSearchTerm("")}>Clear Search</Button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CategoryPage;
