
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, User, Star } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

const ItemDetails = () => {
  const { id } = useParams();
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItem = async () => {
      if (!id) return;

      try {
        const { data, error } = await supabase
          .from("items")
          .select(`
            *,
            categories:category_id(name),
            profiles:user_id(username, full_name, avatar_url, rating, review_count)
          `)
          .eq("id", id)
          .single();

        if (error) throw error;
        setItem(data);
      } catch (error: any) {
        console.error("Error fetching item:", error);
        toast({
          title: "Error",
          description: "Failed to load item details",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Item Not Found</h2>
            <p className="text-gray-600">The item you're looking for doesn't exist.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            {item.image_url ? (
              <img
                src={item.image_url}
                alt={item.title}
                className="w-full h-96 object-cover rounded-lg"
              />
            ) : (
              <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-gray-500">No image available</span>
              </div>
            )}
          </div>
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{item.title}</h1>
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="secondary">{item.categories?.name}</Badge>
                {item.is_service && <Badge>Service</Badge>}
              </div>
              <div className="flex items-center text-gray-600 mb-4">
                <MapPin className="h-4 w-4 mr-1" />
                {item.location}
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">
                  ${item.price}/{item.price_unit}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button className="w-full" size="lg">
                  Book Now
                </Button>
              </CardContent>
            </Card>

            <div>
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <p className="text-gray-700">{item.description}</p>
            </div>

            {item.profiles && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      {item.profiles.avatar_url ? (
                        <img
                          src={item.profiles.avatar_url}
                          alt={item.profiles.full_name || item.profiles.username}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <User className="h-6 w-6 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">
                        {item.profiles.full_name || item.profiles.username}
                      </p>
                      <div className="flex items-center text-sm text-gray-600">
                        <Star className="h-3 w-3 text-yellow-400 fill-yellow-400 mr-1" />
                        {item.profiles.rating || 0} ({item.profiles.review_count || 0} reviews)
                      </div>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    Contact Owner
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ItemDetails;
