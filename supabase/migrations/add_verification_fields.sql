
-- Add verification fields to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS verification_status TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS verification_submitted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP WITH TIME ZONE;

-- Add functions to calculate and update user ratings based on reviews
CREATE OR REPLACE FUNCTION public.update_user_rating()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the reviewee's rating
  UPDATE public.profiles
  SET 
    rating = (
      SELECT AVG(r.rating)::numeric(3,2)
      FROM public.reviews r
      WHERE r.reviewee_id = NEW.reviewee_id
    ),
    review_count = (
      SELECT COUNT(*)
      FROM public.reviews r
      WHERE r.reviewee_id = NEW.reviewee_id
    )
  WHERE id = NEW.reviewee_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for updating user ratings when reviews are added
DROP TRIGGER IF EXISTS update_user_rating_trigger ON public.reviews;
CREATE TRIGGER update_user_rating_trigger
AFTER INSERT OR UPDATE ON public.reviews
FOR EACH ROW EXECUTE FUNCTION public.update_user_rating();
