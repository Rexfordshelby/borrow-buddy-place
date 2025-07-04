
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
import { toast } from "@/hooks/use-toast";

const CategoryPage = () => {
  const { slug } = useParams();
  const [items, setItems] = useState<any[]>([]);
  const [category, setCategory] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [priceRange, setPriceRange] = useState("all");

  const fetchCategoryAndItems = async () => {
    try {
      console.log('Fetching category for slug:', slug);
      
      // Fetch category info
      const { data: categoryData, error: categoryError } = await supabase
        .from("categories")
        .select("*")
        .eq("slug", slug)
        .single();

      if (categoryError) {
        console.error("Category error:", categoryError);
        toast({
          title: "Error",
          description: "Category not found",
          variant: "destructive",
        });
        return;
      }

      console.log('Category found:', categoryData);
      setCategory(categoryData);

      // Fetch items for this category with proper join to profiles
      const { data: itemsData, error: itemsError } = await supabase
        .from("items")
        .select(`
          *,
          profiles!inner(username, full_name, avatar_url, rating, review_count)
        `)
        .eq("category_id", categoryData.id)
        .eq("is_available", true)
        .order("created_at", { ascending: false });

      if (itemsError) {
        console.error("Items error:", itemsError);
        // Try alternative query without profiles join if the first one fails
        const { data: itemsDataAlt, error: itemsErrorAlt } = await supabase
          .from("items")
          .select("*")
          .eq("category_id", categoryData.id)
          .eq("is_available", true)
          .order("created_at", { ascending: false });

        if (itemsErrorAlt) {
          console.error("Alternative items query also failed:", itemsErrorAlt);
          toast({
            title: "Error",
            description: "Failed to load items",
            variant: "destructive",
          });
          return;
        }

        // Fetch profiles separately for items
        const itemsWithProfiles = await Promise.all(
          (itemsDataAlt || []).map(async (item) => {
            const { data: profileData } = await supabase
              .from("profiles")
              .select("username, full_name, avatar_url, rating, review_count")
              .eq("id", item.user_id)
              .single();

            return {
              ...item,
              profiles: profileData
            };
          })
        );

        setItems(itemsWithProfiles);
      } else {
        console.log('Items fetched successfully:', itemsData);
        setItems(itemsData || []);
      }

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

  useEffect(() => {
    if (slug) {
      fetchCategoryAndItems();
    }
  }, [slug]);

  // Set up real-time listener for items
  useEffect(() => {
    if (!category?.id) return;

    const channel = supabase
      .channel('category-items-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'items',
          filter: `category_id=eq.${category.id}`
        },
        (payload) => {
          console.log('Real-time update:', payload);
          // Refetch data when items change
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE' || payload.eventType === 'DELETE') {
            fetchCategoryAndItems();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [category?.id]);

  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPrice = priceRange === "all" || 
      (priceRange === "0-50" && item.price <= 50) ||
      (priceRange === "50-100" && item.price > 50 && item.price <= 100) ||
      (priceRange === "100+" && item.price > 100);

    return matchesSearch && matchesPrice;
  });

  const sortedItems = [...filteredItems].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'rating':
        return (b.profiles?.rating || 0) - (a.profiles?.rating || 0);
      case 'newest':
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
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
                      <Badge className="absolute top-2 left-2 bg-green-500 hover:bg-green-600">
                        Available
                      </Badge>
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
                          {item.profiles?.rating || '4.5'}
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

                      <div className="text-sm text-gray-600">
                        Owner: <span className="font-medium">
                          {item.profiles?.full_name || item.profiles?.username || 'Unknown'}
                        </span>
                      </div>

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
              <Button onClick={() => {
                setSearchTerm("");
                setPriceRange("all");
              }}>Clear Filters</Button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CategoryPage;
