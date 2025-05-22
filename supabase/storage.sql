
-- Create a private bucket for verification documents
insert into storage.buckets (id, name, public)
values ('verification', 'verification', false);

-- Set up RLS policies for the verification bucket
create policy "Users can upload their own verification documents"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'verification' and
  (auth.uid())::text = (storage.foldername(name))[1]
);

create policy "Users can view their own verification documents"
on storage.objects for select to authenticated
using (
  bucket_id = 'verification' and
  (auth.uid())::text = (storage.foldername(name))[1]
);

create policy "Users can update their own verification documents"
on storage.objects for update to authenticated
using (
  bucket_id = 'verification' and
  (auth.uid())::text = (storage.foldername(name))[1]
);

create policy "Users can delete their own verification documents"
on storage.objects for delete to authenticated
using (
  bucket_id = 'verification' and
  (auth.uid())::text = (storage.foldername(name))[1]
);
