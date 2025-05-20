
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
import { Search } from "lucide-react";

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const initialQuery = searchParams.get("q") || "";
  const initialCategory = searchParams.get("category") || "";
  
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);

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
        
        const { data, error } = await query.order('created_at', { ascending: false });
        
        if (error) throw error;
        setItems(data || []);
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
  }, [initialQuery, initialCategory]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    const params = new URLSearchParams();
    if (searchTerm) {
      params.set("q", searchTerm);
    }
    if (selectedCategory) {
      params.set("category", selectedCategory);
    }
    
    setSearchParams(params);
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
                    placeholder="What do you need to borrow?"
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
                      rating={4.5} // Placeholder rating
                      reviewCount={10} // Placeholder review count
                      category={item.categories?.name}
                      isVerified={item.is_verified}
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
