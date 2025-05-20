
-- Create storage bucket for item images
INSERT INTO storage.buckets (id, name, public) VALUES ('item-images', 'Item Images', true);

-- Create storage bucket for user avatars
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'User Avatars', true);

-- Set up storage policies
CREATE POLICY "Anyone can view item images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'item-images');

CREATE POLICY "Anyone can view avatars"
ON storage.objects
FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Authenticated users can upload item images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'item-images' AND auth.uid() = owner);

CREATE POLICY "Authenticated users can upload avatars"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars' AND auth.uid() = owner);

CREATE POLICY "Users can update their own item images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'item-images' AND auth.uid() = owner);

CREATE POLICY "Users can update their own avatars"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars' AND auth.uid() = owner);

CREATE POLICY "Users can delete their own item images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'item-images' AND auth.uid() = owner);

CREATE POLICY "Users can delete their own avatars"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'avatars' AND auth.uid() = owner);
