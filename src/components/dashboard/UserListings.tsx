
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Eye, Pencil, Trash2, AlertCircle } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

const UserListings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchListings = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('items')
          .select('*, categories(name)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setListings(data || []);
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to load your listings",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [user]);

  const deleteItem = async (id: string) => {
    if (!confirm("Are you sure you want to delete this listing?")) return;

    try {
      const { error } = await supabase
        .from('items')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setListings(listings.filter(item => item.id !== id));
      toast({
        title: "Listing deleted",
        description: "Your item has been removed",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete listing",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
        <span className="ml-2">Loading your listings...</span>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">My Listings</h2>
        <Button onClick={() => navigate('/list-item')}>
          <Plus className="h-4 w-4 mr-2" />
          New Listing
        </Button>
      </div>

      {listings.length === 0 ? (
        <div className="bg-white rounded-lg border p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-bold mb-2">No Listings Yet</h3>
          <p className="text-gray-500 mb-6">
            You haven't listed any items for rent yet. Start listing items to earn money!
          </p>
          <Button onClick={() => navigate('/list-item')}>
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Listing
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {listings.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <div className="aspect-[4/3] relative">
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                    No image
                  </div>
                )}
                <div className="absolute top-3 right-3">
                  <Button 
                    variant="secondary" 
                    size="icon" 
                    className="rounded-full bg-white shadow-sm mr-2"
                    onClick={() => navigate(`/item/${item.id}`)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="secondary" 
                    size="icon" 
                    className="rounded-full bg-white shadow-sm mr-2"
                    onClick={() => navigate(`/list-item/${item.id}`)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="icon" 
                    className="rounded-full"
                    onClick={() => deleteItem(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="font-medium mb-1 line-clamp-1">{item.title}</h3>
                <div className="flex items-center justify-between">
                  <span className="text-brand-600 font-bold">${item.price}/{item.price_unit}</span>
                  <span className="text-sm text-gray-500">{item.categories?.name}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserListings;
