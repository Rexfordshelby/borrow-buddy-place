
import HeroSection from "@/components/HeroSection";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CategoryCard from "@/components/CategoryCard";
import ItemCard from "@/components/ItemCard";
import UniqueUseCases from "@/components/UniqueUseCases";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [featuredItems, setFeaturedItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      try {
        // Fetch categories
        const { data: categoryData } = await supabase
          .from('categories')
          .select('*')
          .order('name');
        
        setCategories(categoryData || []);
        
        // Fix the query to not use profiles relationship
        const { data: itemsData } = await supabase
          .from('items')
          .select(`
            *,
            categories:category_id(name, slug)
          `)
          .eq('is_available', true)
          .order('created_at', { ascending: false })
          .limit(8);
        
        setFeaturedItems(itemsData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        
        {/* Categories Section */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">Browse Categories</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {categories.map((category) => (
                <CategoryCard
                  key={category.id}
                  title={category.name}
                  icon={category.icon}
                  slug={category.slug}
                  itemCount={0} // Adding the missing itemCount prop
                />
              ))}
            </div>
          </div>
        </section>
        
        {/* Unique Use Cases Section */}
        <UniqueUseCases />
        
        {/* Featured Listings Section */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">Featured Listings</h2>
            {loading ? (
              <div className="flex justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {featuredItems.map((item) => (
                  <ItemCard
                    key={item.id}
                    id={item.id}
                    title={item.title}
                    price={item.price}
                    priceUnit={item.price_unit}
                    imageUrl={item.image_url || "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&auto=format&fit=crop&q=80"}
                    location={item.location}
                    rating={item.rating || 4.5}
                    reviewCount={item.review_count || 0}
                    category={item.categories?.name}
                    isVerified={item.is_verified}
                    isService={item.is_service}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
