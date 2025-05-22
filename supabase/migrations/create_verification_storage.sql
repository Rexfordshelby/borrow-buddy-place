
-- Create a storage bucket for verification documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('verification', 'verification', false)
ON CONFLICT (id) DO NOTHING;

-- Add security policies for the verification bucket
CREATE POLICY "Users can upload their own verification documents"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'verification' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can view their own verification documents"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'verification' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can update their own verification documents" 
ON storage.objects FOR UPDATE TO authenticated 
USING (bucket_id = 'verification' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete their own verification documents" 
ON storage.objects FOR DELETE TO authenticated 
USING (bucket_id = 'verification' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Add policies for admins (adjust as needed for your app's admin role)
CREATE POLICY "Admins can view all verification documents" 
ON storage.objects FOR SELECT TO authenticated 
USING (bucket_id = 'verification' AND auth.role() = 'service_role');
