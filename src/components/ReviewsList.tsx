
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Star, User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import VerifiedBadge from "./VerifiedBadge";

interface Review {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  reviewer: {
    id: string;
    full_name: string | null;
    username: string | null;
    avatar_url: string | null;
    is_verified: boolean;
  };
}

interface ReviewsListProps {
  itemId?: string;
  userId?: string;
}

const ReviewsList = ({ itemId, userId }: ReviewsListProps) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const query = supabase
          .from("reviews")
          .select(`
            *,
            reviewer:reviewer_id(
              id,
              full_name,
              username,
              avatar_url,
              is_verified
            )
          `);

        // Filter by item or user
        if (itemId) {
          query.eq("item_id", itemId);
        }
        
        if (userId) {
          query.eq("reviewee_id", userId);
        }

        const { data, error } = await query.order("created_at", { ascending: false });

        if (error) throw error;

        setReviews(data as unknown as Review[] || []);
      } catch (error) {
        console.error("Error fetching reviews:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [itemId, userId]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/5 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <h3 className="text-lg font-medium mb-1">No Reviews Yet</h3>
          <p className="text-gray-500">
            {itemId
              ? "This item hasn't received any reviews yet."
              : "This user hasn't received any reviews yet."}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <Card key={review.id}>
          <CardContent className="p-4">
            <div className="flex items-start space-x-4">
              <Avatar className="h-10 w-10">
                <AvatarImage src={review.reviewer?.avatar_url || undefined} />
                <AvatarFallback>
                  <User className="h-5 w-5 text-gray-400" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center">
                  <h4 className="font-medium">
                    {review.reviewer?.full_name || review.reviewer?.username || "Anonymous"}
                  </h4>
                  {review.reviewer?.is_verified && (
                    <VerifiedBadge size="sm" className="ml-1" />
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1 mb-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${
                          review.rating >= star
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                  </span>
                </div>
                {review.comment && <p className="text-gray-700">{review.comment}</p>}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ReviewsList;
