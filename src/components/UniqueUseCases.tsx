
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Calendar } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";

interface UniqueUseCase {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  linked_item_id?: string | null;
  category_slug?: string | null;
}

const UniqueUseCases = () => {
  const [useCases, setUseCases] = useState<UniqueUseCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [relatedItems, setRelatedItems] = useState<Record<string, any[]>>({});
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUseCases = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('unique_use_cases')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        setUseCases(data || []);
        
        // Fetch related items for each use case
        if (data && data.length > 0) {
          await fetchRelatedItemsForUseCases(data);
        }
      } catch (error) {
        console.error("Error fetching unique use cases:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUseCases();
  }, []);

  // Fetch related items based on title keywords
  const fetchRelatedItemsForUseCases = async (cases: UniqueUseCase[]) => {
    try {
      const relatedItemsMap: Record<string, any[]> = {};
      
      for (const useCase of cases) {
        // Extract keywords from the title
        const keywords = useCase.title
          .toLowerCase()
          .split(' ')
          .filter(word => word.length > 3)
          .slice(0, 3); // Take up to 3 significant words
        
        if (keywords.length > 0) {
          // Search for items matching these keywords in title or description
          const query = keywords.map(keyword => 
            `title.ilike.%${keyword}% or description.ilike.%${keyword}%`
          ).join(' or ');
          
          const { data } = await supabase
            .from('items')
            .select('*')
            .eq('is_available', true)
            .or(query)
            .limit(4);
          
          relatedItemsMap[useCase.id] = data || [];
        }
      }
      
      setRelatedItems(relatedItemsMap);
    } catch (error) {
      console.error("Error fetching related items:", error);
    }
  };

  // If there are no use cases yet, populate with some default examples
  useEffect(() => {
    const insertDefaultUseCases = async () => {
      if (useCases.length === 0 && !loading) {
        const defaultUseCases = [
          {
            title: "Rent a friend to go to a wedding",
            description: "Need a plus-one for a wedding or social event? Rent a friendly companion who can accompany you and make your experience more enjoyable.",
            image_url: "https://images.unsplash.com/photo-1519741497674-611481863552?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
          },
          {
            title: "Borrow a golden retriever for a weekend",
            description: "Experience the joy of having a furry friend without the long-term commitment. Perfect for a fun weekend, photoshoots, or to cheer someone up.",
            image_url: "https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
          },
          {
            title: "Hire a chef and rent their kitchen set too",
            description: "Get a professional chef to cook in your home using their professional-grade cooking equipment. Perfect for special occasions or learning new recipes.",
            image_url: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
          }
        ];

        try {
          const { error } = await supabase
            .from('unique_use_cases')
            .insert(defaultUseCases);
          
          if (error) throw error;
          
          // Fetch again to get the inserted data with IDs
          const { data } = await supabase
            .from('unique_use_cases')
            .select('*')
            .order('created_at', { ascending: false });
          
          setUseCases(data || []);
          
          // Fetch related items for these default use cases
          if (data && data.length > 0) {
            await fetchRelatedItemsForUseCases(data);
          }
        } catch (error) {
          console.error("Error inserting default use cases:", error);
        }
      }
    };

    insertDefaultUseCases();
  }, [useCases.length, loading]);

  const handleExploreClick = (useCaseId: string) => {
    if (relatedItems[useCaseId]?.length > 0) {
      // If there are related items, navigate to search with filters
      const useCase = useCases.find(uc => uc.id === useCaseId);
      if (useCase) {
        const keywords = useCase.title.split(' ').slice(0, 3).join(' ');
        navigate(`/search?q=${encodeURIComponent(keywords)}`);
      }
    } else {
      // If no related items, show option to list an item
      if (user) {
        toast({
          title: "No related items found",
          description: "Would you like to be the first to list this type of item?",
          action: (
            <Button 
              variant="outline" 
              onClick={() => navigate("/list-item")}
            >
              List an Item
            </Button>
          ),
        });
      } else {
        toast({
          title: "Sign in required",
          description: "Please sign in to list items or browse similar listings",
          action: (
            <Button 
              variant="outline" 
              onClick={() => navigate("/auth")}
            >
              Sign In
            </Button>
          ),
        });
      }
    }
  };

  const handleRentNow = (useCaseId: string) => {
    const items = relatedItems[useCaseId];
    
    // If we have related items, navigate to the first one
    if (items && items.length > 0) {
      navigate(`/item/${items[0].id}`);
    } else {
      // If no items yet, suggest creating a listing
      if (user) {
        toast({
          title: "Create a listing",
          description: "Be the first to offer this type of rental",
          action: (
            <Button 
              variant="outline" 
              onClick={() => navigate("/list-item")}
            >
              Create Listing
            </Button>
          ),
        });
      } else {
        toast({
          title: "Sign in required",
          description: "Please sign in to rent or list items",
          action: (
            <Button 
              variant="outline" 
              onClick={() => navigate("/auth")}
            >
              Sign In
            </Button>
          ),
        });
      }
    }
  };

  return (
    <div className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center mb-8">
          <Sparkles className="h-6 w-6 text-brand-500 mr-2" />
          <h2 className="text-2xl md:text-3xl font-bold text-center">Unique Rental Ideas</h2>
        </div>
        
        <p className="text-center text-gray-600 max-w-2xl mx-auto mb-8">
          Discover creative and unexpected ways people are using our platform. Get inspired by these unique rental and service ideas!
        </p>
        
        {loading ? (
          <div className="flex justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {useCases.map((useCase) => (
              <Card key={useCase.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                {useCase.image_url && (
                  <div className="aspect-[3/2] overflow-hidden">
                    <img 
                      src={useCase.image_url} 
                      alt={useCase.title}
                      className="w-full h-full object-cover transition-transform hover:scale-105"
                    />
                  </div>
                )}
                <CardContent className="p-6">
                  <h3 className="font-bold text-xl mb-2">{useCase.title}</h3>
                  <p className="text-gray-600 mb-4">{useCase.description}</p>
                  
                  <div className="space-y-3">
                    {relatedItems[useCase.id] && relatedItems[useCase.id].length > 0 && (
                      <div className="text-sm text-gray-500 mb-2">
                        {relatedItems[useCase.id].length} related {relatedItems[useCase.id].length === 1 ? 'listing' : 'listings'} available
                      </div>
                    )}
                    
                    <Button 
                      variant="default" 
                      className="w-full mb-2"
                      onClick={() => handleRentNow(useCase.id)}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      Rent Now
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => handleExploreClick(useCase.id)}
                    >
                      Explore Similar Listings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UniqueUseCases;
