
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { Star } from "lucide-react";

interface ReviewFormProps {
  itemId: string;
  bookingId: string;
  revieweeId: string;
  onReviewSubmit: (review: { rating: number; comment: string }) => Promise<void>;
}

const ReviewForm = ({
  itemId,
  bookingId,
  revieweeId,
  onReviewSubmit,
}: ReviewFormProps) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast({
        title: "Rating required",
        description: "Please select a rating before submitting",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await onReviewSubmit({ rating, comment });
      // Clear form
      setRating(0);
      setComment("");
      
      toast({
        title: "Review submitted",
        description: "Thank you for your feedback!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit review. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Rating</label>
        <div className="flex items-center">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="text-2xl p-1 focus:outline-none"
            >
              <Star
                className={`h-6 w-6 ${
                  (hoverRating || rating) >= star
                    ? "text-yellow-400 fill-yellow-400"
                    : "text-gray-300"
                }`}
              />
            </button>
          ))}
          <span className="ml-2 text-sm text-gray-500">
            {rating ? `${rating} star${rating !== 1 ? "s" : ""}` : "Select rating"}
          </span>
        </div>
      </div>

      <div>
        <label htmlFor="comment" className="block text-sm font-medium mb-2">
          Comment (optional)
        </label>
        <Textarea
          id="comment"
          placeholder="Share your experience..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
        />
      </div>

      <Button type="submit" disabled={isSubmitting || rating === 0}>
        {isSubmitting ? "Submitting..." : "Submit Review"}
      </Button>
    </form>
  );
};

export default ReviewForm;
