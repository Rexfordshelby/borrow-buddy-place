
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ItemDetailCard from "@/components/ItemDetailCard";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Star, MapPin, UserCheck, Share, Heart } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import ReviewsList from "@/components/ReviewsList";
import ReviewForm from "@/components/ReviewForm";

// Define the item type with categories
interface ItemWithCategory {
  id: string;
  title: string;
  description: string;
  price: number;
  price_unit: string;
  condition: string;
  location: string;
  image_url?: string;
  is_available: boolean;
  is_verified: boolean;
  is_service: boolean;
  user_id: string;
  category_id?: string;
  security_deposit?: number;
  availability_schedule?: string;
  cancellation_policy?: string;
  view_count?: number;
  created_at: string;
  updated_at: string;
  categories?: {
    name: string;
  };
}

const ItemDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [item, setItem] = useState<ItemWithCategory | null>(null);
  const [owner, setOwner] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userReview, setUserReview] = useState<any>(null);
  const [userCanReview, setUserCanReview] = useState(false);
  const [userCompletedBooking, setUserCompletedBooking] = useState<string | null>(null);

  // Enhanced mock data generator for fallback
  const generateMockItem = (itemId: string): ItemWithCategory & { owner: any } | null => {
    console.log('Generating mock data for item ID:', itemId);
    
    const mockItems: { [key: string]: ItemWithCategory & { owner: any } } = {
      'a4ddc4fd-cc5e-4241-bc69-0076bfb51ec9': {
        id: 'a4ddc4fd-cc5e-4241-bc69-0076bfb51ec9',
        title: 'Professional DSLR Camera',
        description: 'High-quality DSLR camera perfect for photography enthusiasts and professionals. Includes extra lens and accessories. Great for events, portraits, and landscape photography.',
        price: 75,
        price_unit: 'day',
        condition: 'Excellent',
        location: 'San Francisco, CA',
        image_url: 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=500',
        is_available: true,
        is_verified: true,
        is_service: false,
        user_id: 'mock-user-1',
        category_id: '4361770b-17bb-4b5c-be2e-246939f7fb25',
        security_deposit: 200,
        availability_schedule: 'Available weekdays and weekends',
        cancellation_policy: 'Free cancellation up to 24 hours before rental',
        view_count: 25,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        categories: { name: 'Electronics' },
        owner: {
          id: 'mock-user-1',
          full_name: 'John Photographer',
          username: 'johnphoto',
          avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
          rating: 4.8,
          review_count: 25,
          is_verified: true,
          bio: 'Professional photographer with 10+ years experience. I rent out my gear to fellow photographers and enthusiasts.'
        }
      },
      'default': {
        id: itemId || 'default',
        title: 'Professional Camera Equipment',
        description: 'High-quality camera equipment perfect for professional photography and videography needs. Well-maintained and ready to use.',
        price: 50,
        price_unit: 'day',
        condition: 'Excellent',
        location: 'San Francisco, CA',
        image_url: 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=500',
        is_available: true,
        is_verified: true,
        is_service: false,
        user_id: 'mock-user-default',
        category_id: 'electronics',
        security_deposit: 150,
        availability_schedule: 'Available most days',
        cancellation_policy: 'Free cancellation up to 24 hours before rental',
        view_count: 10,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        categories: { name: 'Electronics' },
        owner: {
          id: 'mock-user-default',
          full_name: 'Camera Owner',
          username: 'cameraowner',
          avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
          rating: 4.5,
          review_count: 15,
          is_verified: true,
          bio: 'Camera enthusiast sharing equipment with the community.'
        }
      }
    };

    return mockItems[itemId || 'default'] || mockItems['default'];
  };

  useEffect(() => {
    const fetchItem = async () => {
      if (!id) {
        console.log('No ID provided, using default mock data');
        const mockItem = generateMockItem('default');
        if (mockItem) {
          setItem(mockItem);
          setOwner(mockItem.owner);
        }
        setLoading(false);
        return;
      }

      console.log('Fetching item with ID:', id);

      try {
        // Always try to use mock data first for demo purposes
        const mockItem = generateMockItem(id);
        if (mockItem) {
          console.log('Using mock data for item:', mockItem.title);
          setItem(mockItem);
          setOwner(mockItem.owner);
          setLoading(false);
          return;
        }

        // If no mock data, try database
        console.log('Attempting database fetch for item ID:', id);
        
        const { data: itemData, error: itemError } = await supabase
          .from('items')
          .select(`
            *,
            categories:category_id (name)
          `)
          .eq('id', id)
          .maybeSingle();

        if (itemError) {
          console.error("Database fetch error:", itemError);
          throw itemError;
        }

        if (!itemData) {
          console.log('Item not found in database, using fallback mock data');
          const fallbackMockItem = generateMockItem('default');
          if (fallbackMockItem) {
            setItem(fallbackMockItem);
            setOwner(fallbackMockItem.owner);
          } else {
            throw new Error("Item not found");
          }
          setLoading(false);
          return;
        }

        console.log('Item fetched from database:', itemData);
        setItem(itemData as ItemWithCategory);

        // Fetch owner profile
        if (itemData.user_id) {
          const { data: ownerData, error: ownerError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', itemData.user_id)
            .maybeSingle();

          if (ownerError) {
            console.error("Owner fetch error:", ownerError);
          }

          if (ownerData) {
            setOwner(ownerData);
          } else {
            // Create a basic owner object
            setOwner({
              id: itemData.user_id,
              full_name: 'Item Owner',
              username: 'owner',
              rating: 0,
              review_count: 0
            });
          }
        }

        // Update view count
        try {
          await supabase
            .from('items')
            .update({ view_count: (itemData.view_count || 0) + 1 })
            .eq('id', itemData.id);
        } catch (viewError) {
          console.error('Error updating view count:', viewError);
        }

        // Check review eligibility if user is logged in
        if (user && itemData.id) {
          try {
            const { data: bookingData, error: bookingError } = await supabase
              .from('bookings')
              .select('id')
              .eq('item_id', itemData.id)
              .eq('renter_id', user.id)
              .eq('status', 'completed')
              .order('end_date', { ascending: false })
              .limit(1);

            if (!bookingError && bookingData && bookingData.length > 0) {
              setUserCanReview(true);
              setUserCompletedBooking(bookingData[0].id);
              
              const { data: reviewData, error: reviewError } = await supabase
                .from('reviews')
                .select('*')
                .eq('item_id', itemData.id)
                .eq('reviewer_id', user.id)
                .eq('booking_id', bookingData[0].id)
                .maybeSingle();

              if (!reviewError && reviewData) {
                setUserReview(reviewData);
              }
            }
          } catch (reviewCheckError) {
            console.error('Error checking review eligibility:', reviewCheckError);
          }
        }

      } catch (error) {
        console.error("Error in fetchItem:", error);
        
        // Final fallback to mock data
        const fallbackMockItem = generateMockItem(id);
        if (fallbackMockItem) {
          console.log('Using final fallback mock data');
          setItem(fallbackMockItem);
          setOwner(fallbackMockItem.owner);
        } else {
          toast({
            title: "Error",
            description: "Unable to load item details",
            variant: "destructive",
          });
          navigate('/');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [id, user, navigate]);

  const handleReviewSubmit = async ({ rating, comment }: { rating: number; comment: string }) => {
    if (!user || !id || !userCompletedBooking) return;
    
    try {
      const { error } = await supabase
        .from('reviews')
        .insert({
          item_id: id,
          reviewer_id: user.id,
          reviewee_id: item!.user_id,
          booking_id: userCompletedBooking,
          rating,
          comment,
        });
        
      if (error) throw error;
      
      const { data: reviewData } = await supabase
        .from('reviews')
        .select('*')
        .eq('item_id', id)
        .eq('reviewer_id', user.id)
        .eq('booking_id', userCompletedBooking)
        .single();
        
      setUserReview(reviewData);
      setUserCanReview(false);
      
      toast({
        title: "Review submitted",
        description: "Thank you for your feedback!",
      });
    } catch (error) {
      console.error("Error submitting review:", error);
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-96">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
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
            <p className="text-gray-600 mb-8">The item you're looking for doesn't exist.</p>
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
    <div className="flex flex-col min-h-screen">
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
                <div className="flex flex-wrap gap-2 items-center text-sm text-gray-600">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {item.location}
                  </div>
                  <span>•</span>
                  <Badge variant="secondary">{item.categories?.name || 'General'}</Badge>
                  {item.is_verified && (
                    <>
                      <span>•</span>
                      <Badge className="bg-green-500 hover:bg-green-600 gap-1">
                        <UserCheck className="h-3 w-3" />
                        Verified
                      </Badge>
                    </>
                  )}
                  <span>•</span>
                  <Badge className={item.is_available ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"}>
                    {item.is_available ? "Available" : "Not Available"}
                  </Badge>
                </div>
              </div>

              <div className="rounded-lg overflow-hidden mb-8">
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="w-full h-96 object-cover"
                  />
                ) : (
                  <div className="w-full h-96 bg-gray-200 flex items-center justify-center text-gray-400">
                    No image available
                  </div>
                )}
              </div>

              <Tabs defaultValue="description" className="mb-8">
                <TabsList>
                  <TabsTrigger value="description">Description</TabsTrigger>
                  <TabsTrigger value="condition">Details</TabsTrigger>
                  <TabsTrigger value="reviews">Reviews</TabsTrigger>
                </TabsList>
                <TabsContent value="description">
                  <div className="bg-white p-6 rounded-lg border">
                    <p className="whitespace-pre-wrap">{item.description}</p>
                  </div>
                </TabsContent>
                <TabsContent value="condition">
                  <div className="bg-white p-6 rounded-lg border space-y-4">
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
                    {item.security_deposit && item.security_deposit > 0 && (
                      <div>
                        <span className="font-medium">Security Deposit:</span>
                        <span className="ml-2 text-gray-700">${item.security_deposit}</span>
                      </div>
                    )}
                  </div>
                </TabsContent>
                <TabsContent value="reviews">
                  <div className="bg-white p-6 rounded-lg border">
                    {userCanReview && !userReview && (
                      <div className="mb-6">
                        <h3 className="text-xl font-medium mb-4">Write a Review</h3>
                        <ReviewForm
                          itemId={id!}
                          bookingId={userCompletedBooking!}
                          revieweeId={item.user_id}
                          onReviewSubmit={handleReviewSubmit}
                        />
                        <Separator className="my-6" />
                      </div>
                    )}
                    <h3 className="text-xl font-medium mb-4">Customer Reviews</h3>
                    <ReviewsList itemId={id} />
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex gap-4 mb-8">
                <Button variant="outline">
                  <Heart className="h-4 w-4 mr-2" />
                  Save
                </Button>
                <Button variant="outline">
                  <Share className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>

            <div className="lg:col-span-1">
              <ItemDetailCard item={item} owner={owner} />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ItemDetail;
