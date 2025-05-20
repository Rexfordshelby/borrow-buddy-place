
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ItemCard from "@/components/ItemCard";
import { toast } from "@/components/ui/use-toast";

const CategoryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [category, setCategory] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategory = async () => {
      if (!slug) return;

      setLoading(true);
      try {
        // Fetch category details
        const { data: categoryData, error: categoryError } = await supabase
          .from('categories')
          .select('*')
          .eq('slug', slug)
          .single();

        if (categoryError) throw categoryError;
        setCategory(categoryData);

        // Fetch items in this category
        const { data: itemsData, error: itemsError } = await supabase
          .from('items')
          .select(`
            *,
            profiles(username, avatar_url),
            categories(name)
          `)
          .eq('category_id', categoryData.id)
          .eq('is_available', true)
          .order('created_at', { ascending: false });

        if (itemsError) throw itemsError;
        setItems(itemsData || []);
      } catch (error) {
        console.error("Error fetching category data:", error);
        toast({
          title: "Error",
          description: "Failed to load category data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCategory();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-96">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
            <span className="ml-2">Loading category...</span>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold mb-2">Category Not Found</h2>
            <p className="text-gray-600">The category you're looking for doesn't exist.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <div className="bg-gray-50 py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl font-bold mb-2">{category.name}</h1>
            <p className="text-gray-600 mb-4">Browse {items.length} items available for rent</p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {items.length === 0 ? (
            <div className="text-center py-16">
              <h2 className="text-xl font-medium mb-2">No items available</h2>
              <p className="text-gray-600">There are currently no items in this category.</p>
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
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CategoryPage;
