
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ItemDetailCard from "@/components/ItemDetailCard";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Star, Heart, Share, Shield, User, MessageCircle, UserCheck, ArrowLeft } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

const ItemDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [item, setItem] = useState<any>(null);
  const [owner, setOwner] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        // First try to fetch from database
        const { data, error } = await supabase
          .from("items")
          .select(`
            *,
            categories:category_id(name),
            profiles:user_id(username, full_name, avatar_url, rating, review_count)
          `)
          .eq("id", id)
          .single();

        if (!error && data) {
          setItem(data);
          setOwner(data.profiles);
        } else {
          // If not found in database, use mock data
          const mockItem = generateMockItem(id!);
          if (mockItem) {
            setItem(mockItem);
            setOwner(mockItem.owner);
          }
        }
      } catch (error: any) {
        console.error("Error fetching item:", error);
        // Use mock data as fallback
        const mockItem = generateMockItem(id!);
        if (mockItem) {
          setItem(mockItem);
          setOwner(mockItem.owner);
        } else {
          toast({
            title: "Error",
            description: "Item not found",
            variant: "destructive",
          });
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchItem();
    }
  }, [id]);

  const generateMockItem = (itemId: string) => {
    const mockItems: { [key: string]: any } = {
      'electronics-1': {
        id: 'electronics-1',
        title: 'MacBook Pro 16"',
        description: 'Latest MacBook Pro with M3 Max chip, perfect for professional work, video editing, and development. Includes original charger and carrying case.',
        price: 80,
        price_unit: 'day',
        condition: 'Excellent',
        location: 'San Francisco, CA',
        latitude: 37.7749,
        longitude: -122.4194,
        security_deposit: 500,
        is_verified: true,
        is_service: false,
        availability_schedule: 'Available Monday-Friday, weekends by request',
        cancellation_policy: 'Free cancellation up to 24 hours before rental',
        categories: { name: 'Electronics' },
        owner: {
          id: 'owner-1',
          full_name: 'John Smith',
          username: 'johnsmith',
          avatar_url: null,
          rating: 4.9,
          review_count: 47,
          is_verified: true,
          bio: 'Tech enthusiast and entrepreneur. I take great care of my equipment.'
        }
      },
      'electronics-2': {
        id: 'electronics-2',
        title: 'Sony A7 III Camera',
        description: 'Professional mirrorless camera with full-frame sensor. Perfect for photography and videography. Includes 2 lenses, extra batteries, and memory cards.',
        price: 120,
        price_unit: 'day',
        condition: 'Very Good',
        location: 'San Francisco, CA',
        latitude: 37.7849,
        longitude: -122.4094,
        security_deposit: 800,
        is_verified: true,
        is_service: false,
        availability_schedule: 'Available daily, advance booking recommended',
        cancellation_policy: 'Free cancellation up to 48 hours before rental',
        categories: { name: 'Electronics' },
        owner: {
          id: 'owner-2',
          full_name: 'Sarah Johnson',
          username: 'sarahj',
          avatar_url: null,
          rating: 4.8,
          review_count: 32,
          is_verified: true,
          bio: 'Professional photographer with 10 years experience.'
        }
      },
      'services-1': {
        id: 'services-1',
        title: 'Photography Session',
        description: 'Professional portrait and event photography. Specializing in corporate headshots, family portraits, and special events. All edited photos included.',
        price: 200,
        price_unit: 'session',
        condition: 'N/A',
        location: 'San Francisco, CA',
        latitude: 37.7649,
        longitude: -122.4294,
        security_deposit: 0,
        is_verified: true,
        is_service: true,
        availability_schedule: 'Monday-Saturday, 9AM-7PM',
        cancellation_policy: 'Free cancellation up to 48 hours, 50% refund within 24 hours',
        categories: { name: 'Services' },
        owner: {
          id: 'owner-3',
          full_name: 'Mike Chen',
          username: 'mikephoto',
          avatar_url: null,
          rating: 4.9,
          review_count: 89,
          is_verified: true,
          bio: 'Award-winning photographer with studio in downtown SF.'
        }
      }
    };

    return mockItems[itemId] || null;
  };

  const handleContactOwner = () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to contact the owner",
      });
      navigate("/auth");
      return;
    }

    toast({
      title: "Coming Soon",
      description: "Messaging functionality will be available soon",
    });
  };

  const addToWishlist = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to add items to your wishlist",
      });
      navigate("/auth");
      return;
    }

    try {
      const { error } = await supabase
        .from('wishlists')
        .insert({
          user_id: user.id,
          item_id: id,
        });

      if (error && error.code !== '23505') {
        throw error;
      }

      toast({
        title: "Added to wishlist",
        description: "This item has been added to your wishlist",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add to wishlist",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-96">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
            <span className="ml-2">Loading item details...</span>
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
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold mb-2">Item Not Found</h2>
            <p className="text-gray-600 mb-8">The item you're looking for doesn't exist or has been removed.</p>
            <Button onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
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
        <div className="container mx-auto px-4 py-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to results
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="mb-6">
                <h1 className="text-3xl font-bold mb-2">{item.title}</h1>
                <div className="flex flex-wrap gap-2 items-center text-sm text-gray-600 mb-4">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {item.location}
                  </div>
                  <span>•</span>
                  <Badge variant="secondary">{item.categories?.name}</Badge>
                  {item.is_verified && (
                    <>
                      <span>•</span>
                      <Badge className="bg-green-500 hover:bg-green-600 gap-1">
                        <UserCheck className="h-3 w-3" />
                        Verified
                      </Badge>
                    </>
                  )}
                </div>
              </div>

              <div className="rounded-lg overflow-hidden mb-8 bg-white shadow-md">
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="w-full h-96 object-cover"
                  />
                ) : (
                  <div className="w-full h-96 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <div className="text-6xl mb-4">📷</div>
                      <div>Photo coming soon</div>
                    </div>
                  </div>
                )}
              </div>

              <Tabs defaultValue="description" className="mb-8">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="description">Description</TabsTrigger>
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="reviews">Reviews</TabsTrigger>
                </TabsList>
                <TabsContent value="description">
                  <Card>
                    <CardContent className="p-6">
                      <p className="whitespace-pre-wrap text-gray-700 leading-relaxed">{item.description}</p>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="details">
                  <Card>
                    <CardContent className="p-6 space-y-4">
                      {!item.is_service && (
                        <div>
                          <span className="font-medium">Condition:</span>
                          <span className="ml-2 text-gray-700">{item.condition}</span>
                        </div>
                      )}
                      {item.availability_schedule && (
                        <div>
                          <span className="font-medium">Availability:</span>
                          <span className="ml-2 text-gray-700">{item.availability_schedule}</span>
                        </div>
                      )}
                      {item.cancellation_policy && (
                        <div>
                          <span className="font-medium">Cancellation Policy:</span>
                          <span className="ml-2 text-gray-700">{item.cancellation_policy}</span>
                        </div>
                      )}
                      {item.security_deposit > 0 && (
                        <div>
                          <span className="font-medium">Security Deposit:</span>
                          <span className="ml-2 text-gray-700">${item.security_deposit}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="reviews">
                  <Card>
                    <CardContent className="p-6">
                      <div className="text-center py-8 text-gray-500">
                        <Star className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>No reviews yet. Be the first to review!</p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              <div className="flex gap-4 mb-8">
                <Button variant="outline" onClick={addToWishlist} className="flex-1">
                  <Heart className="h-4 w-4 mr-2" />
                  Save to Wishlist
                </Button>
                <Button variant="outline" className="flex-1">
                  <Share className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>

            <div className="lg:col-span-1">
              <ItemDetailCard item={item} owner={owner} />

              {owner && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                        {owner.avatar_url ? (
                          <img
                            src={owner.avatar_url}
                            alt={owner.full_name || owner.username}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <User className="h-6 w-6 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">
                            {owner.full_name || owner.username}
                          </p>
                          {owner.is_verified && (
                            <UserCheck className="h-4 w-4 text-green-500" />
                          )}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Star className="h-3 w-3 text-yellow-400 fill-yellow-400 mr-1" />
                          {owner.rating || 0} ({owner.review_count || 0} reviews)
                        </div>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {owner.bio && (
                      <p className="text-gray-600 text-sm mb-4">{owner.bio}</p>
                    )}
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={handleContactOwner}
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Contact Owner
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ItemDetails;
