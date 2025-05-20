
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Calendar, Package, AlertCircle } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

const UserBookings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('bookings')
          .select(`
            *,
            items(title, image_url, price_unit),
            profiles!bookings_owner_id_fkey(username, full_name, avatar_url)
          `)
          .eq('renter_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setBookings(data || []);
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to load your bookings",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [user]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
      case 'confirmed':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Confirmed</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
        <span className="ml-2">Loading your bookings...</span>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">My Bookings</h2>
      </div>

      {bookings.length === 0 ? (
        <div className="bg-white rounded-lg border p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-bold mb-2">No Bookings Yet</h3>
          <p className="text-gray-500 mb-6">
            You haven't booked any items yet. Browse items and make your first booking!
          </p>
          <Button onClick={() => navigate('/')}>Browse Items</Button>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div key={booking.id} className="bg-white rounded-lg border overflow-hidden">
              <div className="flex flex-col md:flex-row">
                <div className="md:w-1/4 h-full">
                  {booking.items.image_url ? (
                    <img
                      src={booking.items.image_url}
                      alt={booking.items.title}
                      className="object-cover w-full h-full md:h-40"
                    />
                  ) : (
                    <div className="w-full h-40 bg-gray-200 flex items-center justify-center text-gray-400">
                      <Package className="h-10 w-10" />
                    </div>
                  )}
                </div>
                <div className="p-4 flex-1">
                  <div className="flex flex-col md:flex-row md:items-center mb-2 gap-2 justify-between">
                    <h3 className="font-medium">{booking.items.title}</h3>
                    <div>
                      {getStatusBadge(booking.status)}
                    </div>
                  </div>
                  <div className="flex flex-col md:flex-row md:items-center text-sm text-gray-500 gap-y-2 md:gap-x-4 mb-3">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {format(new Date(booking.start_date), 'MMM d, yyyy')} - {format(new Date(booking.end_date), 'MMM d, yyyy')}
                    </div>
                    <div className="flex items-center">
                      Owner: {booking.profiles.full_name || booking.profiles.username}
                    </div>
                  </div>
                  <div className="flex flex-wrap md:items-center gap-2 mb-2 md:mb-0">
                    <div className="md:mr-auto font-bold text-brand-600">
                      ${booking.total_price} total
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => navigate(`/item/${booking.item_id}`)}
                    >
                      View Item
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserBookings;
