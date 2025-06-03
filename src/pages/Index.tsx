
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
        // Fetch categories with item counts
        const { data: categoryData } = await supabase
          .from('categories')
          .select('*')
          .order('name');
        
        // Get item counts for each category
        const categoriesWithCounts = await Promise.all(
          (categoryData || []).map(async (category) => {
            const { count } = await supabase
              .from('items')
              .select('*', { count: 'exact', head: true })
              .eq('category_id', category.id)
              .eq('is_available', true);
            
            return {
              ...category,
              itemCount: count || 0
            };
          })
        );
        
        setCategories(categoriesWithCounts);
        
        // Fetch featured items with profiles and reviews - only available items
        const { data: itemsData } = await supabase
          .from('items')
          .select(`
            *,
            categories:category_id(name, slug),
            profiles:user_id(username, full_name, avatar_url)
          `)
          .eq('is_available', true)
          .order('created_at', { ascending: false })
          .limit(8);
        
        // Calculate ratings for featured items
        const itemsWithRatings = await Promise.all(
          (itemsData || []).map(async (item) => {
            const { data: reviews } = await supabase
              .from('reviews')
              .select('rating')
              .eq('item_id', item.id);

            const avgRating = reviews && reviews.length > 0
              ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
              : 4.5; // Default rating for items without reviews

            return {
              ...item,
              rating: avgRating,
              review_count: reviews?.length || 0
            };
          })
        );
        
        setFeaturedItems(itemsWithRatings);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();

    // Set up real-time listener for new items
    const channel = supabase
      .channel('homepage-items')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'items'
        },
        () => {
          // Refetch data when new items are added
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
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
                  itemCount={category.itemCount}
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
            ) : featuredItems.length > 0 ? (
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
                    rating={item.rating}
                    reviewCount={item.review_count}
                    category={item.categories?.name}
                    isVerified={item.is_verified}
                    isService={item.is_service}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-xl font-semibold mb-2">No items available yet</h3>
                <p className="text-gray-600">Be the first to list an item for rent!</p>
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
