import { useState, useEffect, useRef } from "react";
import { Heart, MessageCircle, Share2, Bookmark, Music, Send, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import AuthSheet from "@/components/AuthSheet";
import tv3Logo from "@/assets/tv3-logo.png";

interface Short {
  id: string;
  title: string;
  audio_name: string | null;
  channel_name: string;
  channel_logo_url: string | null;
  video_url: string;
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  username?: string;
  avatar_url?: string;
}

const DEMO_VIDEO_ID = "0tOIeimtNTU";

const ShortsFeed = () => {
  const { user } = useAuth();
  const [shorts, setShorts] = useState<Short[]>([]);
  const [likes, setLikes] = useState<Record<string, boolean>>({});
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});
  const [bookmarks, setBookmarks] = useState<Record<string, boolean>>({});
  const [showAuth, setShowAuth] = useState(false);
  const [commentShortId, setCommentShortId] = useState<string | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchShorts();
  }, []);

  useEffect(() => {
    if (user) {
      fetchUserLikes();
      fetchUserBookmarks();
    }
  }, [user, shorts]);

  const fetchShorts = async () => {
    const { data } = await supabase.from("shorts").select("*").order("created_at", { ascending: false });
    if (data && data.length > 0) {
      setShorts(data);
      for (const s of data) {
        const { count } = await supabase.from("short_likes").select("*", { count: "exact", head: true }).eq("short_id", s.id);
        setLikeCounts(prev => ({ ...prev, [s.id]: count || 0 }));
        const { count: cc } = await supabase.from("short_comments").select("*", { count: "exact", head: true }).eq("short_id", s.id);
        setCommentCounts(prev => ({ ...prev, [s.id]: cc || 0 }));
      }
    } else {
      // Demo placeholder short
      setShorts([{
        id: "demo-1",
        title: "Breaking: Major developments unfold in city centre as crowds gather",
        audio_name: "TV3 News Theme — Original",
        channel_name: "TV3 News",
        channel_logo_url: null,
        video_url: `https://www.youtube.com/embed/${DEMO_VIDEO_ID}?autoplay=1&mute=1&loop=1&playlist=${DEMO_VIDEO_ID}&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1`,
      }]);
    }
  };

  const fetchUserLikes = async () => {
    if (!user) return;
    const { data } = await supabase.from("short_likes").select("short_id").eq("user_id", user.id);
    if (data) {
      const map: Record<string, boolean> = {};
      data.forEach(l => map[l.short_id] = true);
      setLikes(map);
    }
  };

  const fetchUserBookmarks = async () => {
    if (!user) return;
    const { data } = await supabase.from("short_bookmarks").select("short_id").eq("user_id", user.id);
    if (data) {
      const map: Record<string, boolean> = {};
      data.forEach(b => map[b.short_id] = true);
      setBookmarks(map);
    }
  };

  const requireAuth = (action: () => void) => {
    if (!user) { setShowAuth(true); return; }
    action();
  };

  const toggleLike = async (shortId: string) => {
    if (!user) return;
    if (likes[shortId]) {
      await supabase.from("short_likes").delete().eq("user_id", user.id).eq("short_id", shortId);
      setLikes(prev => ({ ...prev, [shortId]: false }));
      setLikeCounts(prev => ({ ...prev, [shortId]: (prev[shortId] || 1) - 1 }));
    } else {
      await supabase.from("short_likes").insert({ user_id: user.id, short_id: shortId });
      setLikes(prev => ({ ...prev, [shortId]: true }));
      setLikeCounts(prev => ({ ...prev, [shortId]: (prev[shortId] || 0) + 1 }));
    }
  };

  const toggleBookmark = async (shortId: string) => {
    if (!user) return;
    if (bookmarks[shortId]) {
      await supabase.from("short_bookmarks").delete().eq("user_id", user.id).eq("short_id", shortId);
      setBookmarks(prev => ({ ...prev, [shortId]: false }));
    } else {
      await supabase.from("short_bookmarks").insert({ user_id: user.id, short_id: shortId });
      setBookmarks(prev => ({ ...prev, [shortId]: true }));
    }
  };

  const openComments = async (shortId: string) => {
    setCommentShortId(shortId);
    if (shortId.startsWith("demo")) { setComments([]); return; }
    const { data } = await supabase.from("short_comments").select("*").eq("short_id", shortId).order("created_at", { ascending: true });
    if (data) {
      const userIds = [...new Set(data.map(c => c.user_id))];
      const { data: profiles } = await supabase.from("profiles").select("user_id, username, avatar_url").in("user_id", userIds);
      const profileMap: Record<string, { username: string; avatar_url: string | null }> = {};
      profiles?.forEach(p => profileMap[p.user_id] = p);
      setComments(data.map(c => ({ ...c, username: profileMap[c.user_id]?.username || "User", avatar_url: profileMap[c.user_id]?.avatar_url })));
    }
  };

  const submitComment = async () => {
    if (!user || !commentShortId || !commentText.trim()) return;
    const { data } = await supabase.from("short_comments").insert({ user_id: user.id, short_id: commentShortId, content: commentText.trim() }).select().single();
    if (data) {
      const { data: p } = await supabase.from("profiles").select("username, avatar_url").eq("user_id", user.id).single();
      setComments(prev => [...prev, { ...data, username: p?.username || "You", avatar_url: p?.avatar_url }]);
      setCommentCounts(prev => ({ ...prev, [commentShortId]: (prev[commentShortId] || 0) + 1 }));
      setCommentText("");
    }
  };

  const handleShare = async (short: Short) => {
    if (navigator.share) {
      await navigator.share({ title: short.title, text: short.title, url: window.location.href });
    }
  };

  const handleScroll = () => {
    if (!containerRef.current) return;
    const idx = Math.round(containerRef.current.scrollTop / containerRef.current.clientHeight);
    setCurrentIndex(idx);
  };

  return (
    <>
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="h-screen overflow-y-scroll snap-y snap-mandatory"
      >
        {shorts.map((short, i) => (
          <div key={short.id} className="relative h-screen snap-start snap-always bg-black">
            {/* Video embed or placeholder */}
            {short.video_url.includes("youtube.com") ? (
              <iframe
                src={short.video_url}
                className="w-full h-full object-cover"
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
                style={{ border: 0, pointerEvents: "none" }}
              />
            ) : (
              <video
                src={short.video_url}
                className="w-full h-full object-cover"
                autoPlay
                muted
                loop
                playsInline
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

            {/* Right side action buttons */}
            <div className="absolute right-3 bottom-28 flex flex-col items-center gap-5 z-10">
              {/* Channel logo */}
              <button className="w-10 h-10 rounded-full bg-secondary/60 backdrop-blur-xl border border-border/20 overflow-hidden mb-2">
                <img src={tv3Logo} alt={short.channel_name} className="w-full h-full object-cover invert brightness-200 p-1.5" />
              </button>

              {/* Like */}
              <button onClick={() => requireAuth(() => toggleLike(short.id))} className="flex flex-col items-center gap-1">
                <div className={`w-10 h-10 rounded-full backdrop-blur-xl border border-border/20 flex items-center justify-center transition-all ${likes[short.id] ? "bg-red-500/80" : "bg-secondary/60"}`}>
                  <Heart className={`w-5 h-5 ${likes[short.id] ? "text-foreground fill-current" : "text-foreground"}`} />
                </div>
                <span className="text-foreground text-[10px] font-bold">{likeCounts[short.id] || 0}</span>
              </button>

              {/* Comment */}
              <button onClick={() => requireAuth(() => openComments(short.id))} className="flex flex-col items-center gap-1">
                <div className="w-10 h-10 rounded-full bg-secondary/60 backdrop-blur-xl border border-border/20 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-foreground" />
                </div>
                <span className="text-foreground text-[10px] font-bold">{commentCounts[short.id] || 0}</span>
              </button>

              {/* Bookmark */}
              <button onClick={() => requireAuth(() => toggleBookmark(short.id))} className="flex flex-col items-center gap-1">
                <div className={`w-10 h-10 rounded-full backdrop-blur-xl border border-border/20 flex items-center justify-center transition-all ${bookmarks[short.id] ? "bg-accent" : "bg-secondary/60"}`}>
                  <Bookmark className={`w-5 h-5 ${bookmarks[short.id] ? "text-foreground fill-current" : "text-foreground"}`} />
                </div>
              </button>

              {/* Share */}
              <button onClick={() => handleShare(short)} className="flex flex-col items-center gap-1">
                <div className="w-10 h-10 rounded-full bg-secondary/60 backdrop-blur-xl border border-border/20 flex items-center justify-center">
                  <Share2 className="w-5 h-5 text-foreground" />
                </div>
              </button>
            </div>

            {/* Bottom info */}
            <div className="absolute bottom-6 left-3 right-16 z-10">
              <p className="text-foreground font-bold text-sm mb-1">@{short.channel_name}</p>
              <p className="text-foreground/90 text-xs leading-relaxed mb-3">{short.title}</p>
              {short.audio_name && (
                <div className="flex items-center gap-2 bg-secondary/40 backdrop-blur-xl rounded-full px-3 py-1.5 border border-border/20 max-w-[80%]">
                  <Music className="w-3 h-3 text-foreground flex-shrink-0" />
                  <div className="overflow-hidden">
                    <span className="text-foreground text-[10px] font-medium whitespace-nowrap inline-block animate-ticker">{short.audio_name}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Comments sheet */}
      {commentShortId && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center">
          <div className="absolute inset-0 bg-background/50 backdrop-blur-sm" onClick={() => setCommentShortId(null)} />
          <div className="relative w-full max-w-lg bg-secondary/80 backdrop-blur-2xl border-t border-border/20 rounded-t-3xl max-h-[60vh] flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/20">
              <h3 className="text-foreground font-bold text-sm">Comments</h3>
              <button onClick={() => setCommentShortId(null)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
              {comments.length === 0 && <p className="text-muted-foreground text-sm text-center py-8">No comments yet. Be the first!</p>}
              {comments.map(c => (
                <div key={c.id} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-secondary overflow-hidden flex-shrink-0">
                    <img src={c.avatar_url || "/avatars/default-1.jpg"} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="text-foreground text-xs font-bold">{c.username}</p>
                    <p className="text-foreground/80 text-xs mt-0.5">{c.content}</p>
                  </div>
                </div>
              ))}
            </div>
            {user ? (
              <div className="px-4 py-3 border-t border-border/20 flex gap-2">
                <input type="text" placeholder="Add a comment..." value={commentText} onChange={e => setCommentText(e.target.value)} onKeyDown={e => e.key === "Enter" && submitComment()} className="flex-1 h-10 rounded-full bg-secondary/60 border border-border/20 px-4 text-foreground text-sm placeholder:text-muted-foreground focus:outline-none" />
                <button onClick={submitComment} disabled={!commentText.trim()} className="w-10 h-10 rounded-full bg-foreground flex items-center justify-center disabled:opacity-30">
                  <Send className="w-4 h-4 text-background" />
                </button>
              </div>
            ) : (
              <div className="px-4 py-3 border-t border-border/20">
                <button onClick={() => setShowAuth(true)} className="w-full h-10 rounded-full bg-foreground text-background text-sm font-semibold">Sign in to comment</button>
              </div>
            )}
          </div>
        </div>
      )}

      <AuthSheet open={showAuth} onOpenChange={setShowAuth} />
    </>
  );
};

export default ShortsFeed;
