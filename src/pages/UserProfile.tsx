
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Star, MapPin, MessageCircle } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";
import VerifiedBadge from "@/components/VerifiedBadge";

const UserProfile = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [userItems, setUserItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("listings");

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        // Fetch user profile
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", id)
          .single();

        if (profileError) throw profileError;

        setProfile(profileData);

        // Fetch user's listed items
        const { data: itemsData, error: itemsError } = await supabase
          .from("items")
          .select(`
            *,
            categories:category_id(name)
          `)
          .eq("user_id", id)
          .eq("is_available", true);

        if (itemsError) throw itemsError;

        setUserItems(itemsData || []);
      } catch (error: any) {
        console.error("Error fetching user data:", error);
        toast({
          title: "Error",
          description: "Failed to load user profile",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchUserProfile();
    }
  }, [id]);

  const handleContactUser = () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to contact this user",
      });
      return;
    }

    // Will be implemented later
    toast({
      title: "Coming Soon",
      description: "Messaging functionality will be available soon",
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-96">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <span className="ml-2">Loading profile...</span>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold mb-2">User Not Found</h2>
            <p className="text-gray-600 mb-8">
              The user you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => window.history.back()}>Go Back</Button>
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
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <div className="w-32 h-32 relative rounded-full overflow-hidden border-4 border-white shadow">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.full_name || profile.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <User className="h-12 w-12 text-gray-400" />
                  </div>
                )}
                {profile.is_verified && (
                  <div className="absolute bottom-0 right-0 bg-white p-1 rounded-full shadow">
                    <VerifiedBadge size="md" />
                  </div>
                )}
              </div>
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-2xl font-bold mb-2 flex items-center gap-2 justify-center md:justify-start">
                  {profile.full_name || profile.username || "Anonymous User"}
                  {profile.is_verified && <VerifiedBadge size="sm" />}
                </h1>
                <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-gray-600 mb-4">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 mr-1" />
                    <span>{profile.rating ? profile.rating.toFixed(1) : "New"}</span>
                    <span className="ml-1 text-gray-500">
                      ({profile.review_count || 0} reviews)
                    </span>
                  </div>
                  {profile.is_verified && (
                    <div className="flex items-center text-green-600">
                      <User className="h-4 w-4 mr-1" />
                      <span>Verified User</span>
                    </div>
                  )}
                </div>
                {profile.bio && (
                  <p className="text-gray-600 mb-4 max-w-2xl">{profile.bio}</p>
                )}
                {user?.id !== id && (
                  <Button onClick={handleContactUser}>
                    <MessageCircle className="h-4 w-4 mr-2" /> Contact
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="listings">Listings</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>
          <TabsContent value="listings">
            {userItems.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userItems.map((item) => (
                  <Card key={item.id} className="overflow-hidden">
                    <div
                      className="h-48 bg-cover bg-center cursor-pointer"
                      style={{
                        backgroundImage: item.image_url ? `url(${item.image_url})` : "none",
                        backgroundColor: !item.image_url ? "#f3f4f6" : "transparent",
                      }}
                      onClick={() => window.location.href = `/item/${item.id}`}
                    >
                      {!item.image_url && (
                        <div className="h-full flex items-center justify-center text-gray-400">
                          No image available
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <h3
                        className="font-medium mb-1 cursor-pointer hover:underline"
                        onClick={() => window.location.href = `/item/${item.id}`}
                      >
                        {item.title}
                      </h3>
                      <div className="flex items-center text-sm text-gray-500 mb-2">
                        <MapPin className="h-3 w-3 mr-1" />
                        {item.location}
                      </div>
                      <div className="font-semibold">
                        ${item.price}/{item.price_unit}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg border">
                <h3 className="text-lg font-medium mb-2">No Listings Yet</h3>
                <p className="text-gray-500">
                  {user?.id === id
                    ? "You haven't listed any items yet."
                    : "This user hasn't listed any items yet."}
                </p>
              </div>
            )}
          </TabsContent>
          <TabsContent value="reviews">
            <div className="text-center py-12 bg-white rounded-lg border">
              <h3 className="text-lg font-medium mb-2">No Reviews Yet</h3>
              <p className="text-gray-500">
                {user?.id === id
                  ? "You haven't received any reviews yet."
                  : "This user hasn't received any reviews yet."}
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default UserProfile;
