
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";

const UserWishlist = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [wishlistItems, setWishlistItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishlist = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('wishlists')
          .select(`
            *,
            items(*)
          `)
          .eq('user_id', user.id);

        if (error) throw error;
        setWishlistItems(data || []);
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to load wishlist",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [user]);

  const removeFromWishlist = async (wishlistId: string) => {
    try {
      const { error } = await supabase
        .from('wishlists')
        .delete()
        .eq('id', wishlistId);

      if (error) throw error;

      setWishlistItems(wishlistItems.filter(item => item.id !== wishlistId));
      
      toast({
        title: "Success",
        description: "Item removed from wishlist",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to remove from wishlist",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="overflow-hidden animate-pulse">
            <div className="h-48 bg-gray-200"></div>
            <CardContent className="p-4">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border p-8">
        <Heart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-bold mb-2">Your Wishlist is Empty</h3>
        <p className="text-gray-500 mb-6">
          You haven't added any items to your wishlist yet.
        </p>
        <Button onClick={() => navigate("/")}>
          Browse Items
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {wishlistItems.map((wishlist) => (
        <Card key={wishlist.id} className="overflow-hidden">
          <div 
            className="h-48 bg-cover bg-center cursor-pointer"
            style={{ 
              backgroundImage: wishlist.items?.image_url ? 
                `url(${wishlist.items.image_url})` : 'none',
              backgroundColor: !wishlist.items?.image_url ? '#f3f4f6' : 'transparent'
            }}
            onClick={() => navigate(`/item/${wishlist.items.id}`)}
          >
            {!wishlist.items?.image_url && (
              <div className="h-full flex items-center justify-center text-gray-400">
                No image available
              </div>
            )}
          </div>
          <CardContent className="p-4">
            <h3 className="font-medium mb-2 cursor-pointer hover:underline" onClick={() => navigate(`/item/${wishlist.items.id}`)}>
              {wishlist.items?.title}
            </h3>
            <div className="flex items-center justify-between">
              <span className="font-semibold">
                ${wishlist.items?.price}/{wishlist.items?.price_unit}
              </span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => removeFromWishlist(wishlist.id)} 
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                <Heart className="h-4 w-4 fill-current mr-1" /> Remove
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default UserWishlist;
