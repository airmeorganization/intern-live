-- Create resumes bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('resumes', 'resumes', true)
ON CONFLICT (id) DO NOTHING;

-- RLS for resumes bucket
CREATE POLICY "Public resumes are viewable by everyone" ON storage.objects FOR SELECT USING (bucket_id = 'resumes');
CREATE POLICY "Users can upload their own resumes" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'resumes' AND auth.uid() = owner);
CREATE POLICY "Users can update their own resumes" ON storage.objects FOR UPDATE USING (bucket_id = 'resumes' AND auth.uid() = owner);
CREATE POLICY "Users can delete their own resumes" ON storage.objects FOR DELETE USING (bucket_id = 'resumes' AND auth.uid() = owner);
