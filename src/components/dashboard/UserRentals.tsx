
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";

const UserRentals = () => {
  const { user } = useAuth();
  const [rentals, setRentals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRentals = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('bookings')
          .select(`
            *,
            items(*),
            profiles!bookings_owner_id_fkey(*)
          `)
          .eq('renter_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setRentals(data || []);
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to load rentals",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRentals();
  }, [user]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="w-full animate-pulse">
            <CardContent className="p-6">
              <div className="h-24 bg-gray-200 rounded-md"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (rentals.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="py-12">
            <h3 className="text-lg font-medium mb-2">No Rentals Yet</h3>
            <p className="text-gray-500 mb-6">You haven't rented any items yet.</p>
            <Button onClick={() => window.location.href = "/"}>
              Browse Items
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {rentals.map((rental) => (
        <Card key={rental.id} className="overflow-hidden">
          <CardContent className="p-0">
            <div className="flex flex-col md:flex-row">
              <div className="md:w-1/4">
                <div className="h-48 md:h-full relative">
                  {rental.items?.image_url ? (
                    <img
                      src={rental.items.image_url}
                      alt={rental.items.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      No image
                    </div>
                  )}
                </div>
              </div>
              <div className="p-6 flex-1">
                <div className="flex flex-col md:flex-row justify-between">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">
                      {rental.items?.title}
                    </h3>
                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      <span className="mr-2">Owner:</span>
                      <span className="font-medium">
                        {rental.profiles?.full_name || rental.profiles?.username || "Unknown"}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 mb-4">
                      <Badge variant={rental.status === 'confirmed' ? 'default' : rental.status === 'pending' ? 'outline' : 'secondary'}>
                        {rental.status.charAt(0).toUpperCase() + rental.status.slice(1)}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        ${rental.total_price}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 md:mt-0 text-right">
                    <div className="text-sm text-gray-600 mb-1">
                      {new Date(rental.start_date).toLocaleDateString()} - {new Date(rental.end_date).toLocaleDateString()}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.location.href = `/item/${rental.items?.id}`}
                    >
                      View Item
                    </Button>
                  </div>
                </div>
                <Separator className="my-4" />
                <div className="flex justify-end space-x-2">
                  {rental.status === 'confirmed' && (
                    <Button variant="default" size="sm">
                      Contact Owner
                    </Button>
                  )}
                  {rental.status === 'pending' && (
                    <Button variant="outline" size="sm" className="text-red-500 hover:bg-red-50 hover:text-red-600">
                      Cancel Request
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default UserRentals;
