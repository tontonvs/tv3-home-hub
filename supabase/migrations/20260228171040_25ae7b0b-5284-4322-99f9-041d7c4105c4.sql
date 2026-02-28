
-- Shorts videos table
CREATE TABLE public.shorts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  audio_name TEXT,
  channel_name TEXT NOT NULL DEFAULT 'TV3 News',
  channel_logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.shorts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Shorts are publicly viewable" ON public.shorts FOR SELECT USING (true);

-- Likes table
CREATE TABLE public.short_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  short_id UUID NOT NULL REFERENCES public.shorts(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, short_id)
);
ALTER TABLE public.short_likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view all likes" ON public.short_likes FOR SELECT USING (true);
CREATE POLICY "Users can like" ON public.short_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unlike" ON public.short_likes FOR DELETE USING (auth.uid() = user_id);

-- Comments table
CREATE TABLE public.short_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  short_id UUID NOT NULL REFERENCES public.shorts(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.short_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Comments are publicly viewable" ON public.short_comments FOR SELECT USING (true);
CREATE POLICY "Users can comment" ON public.short_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments" ON public.short_comments FOR DELETE USING (auth.uid() = user_id);

-- Bookmarks table
CREATE TABLE public.short_bookmarks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  short_id UUID NOT NULL REFERENCES public.shorts(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, short_id)
);
ALTER TABLE public.short_bookmarks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own bookmarks" ON public.short_bookmarks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can bookmark" ON public.short_bookmarks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unbookmark" ON public.short_bookmarks FOR DELETE USING (auth.uid() = user_id);

-- Seed some sample shorts
INSERT INTO public.shorts (title, video_url, audio_name, channel_name, channel_logo_url) VALUES
('Breaking: Major infrastructure project announced for 2026', '', 'Original Audio - TV3 News', 'TV3 News', null),
('Exclusive interview with the Finance Minister', '', 'Original Audio - TV3 News', 'TV3 News', null),
('Top 5 moments from the weekend sports roundup', '', 'Trending Sound 🎵', 'TV3 Sports', null),
('Weather alert: Storm warning for coastal regions', '', 'Original Audio - TV3 News', 'TV3 News', null),
('Behind the scenes at the national museum exhibition', '', 'Museum Vibes ✨', 'TV3 Culture', null);
