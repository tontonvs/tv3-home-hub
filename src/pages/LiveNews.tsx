import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Settings,
  Maximize,
  Minimize,
  Volume2,
  VolumeX,
} from "lucide-react";

const DEMO_VIDEO_ID = "0tOIeimtNTU";
const qualityOptions = ["Auto", "1080p", "720p", "480p", "360p"];

const LiveNews = () => {
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [showQuality, setShowQuality] = useState(false);
  const [selectedQuality, setSelectedQuality] = useState("Auto");
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(35);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout>>(null);
  const playerRef = useRef<HTMLDivElement>(null);

  const handleTap = () => {
    setShowControls(true);
    setShowQuality(false);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setShowControls(false), 4000);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = ((e.clientX - rect.left) / rect.width) * 100;
    setProgress(Math.max(0, Math.min(100, pct)));
  };

  const toggleFullscreen = useCallback(async () => {
    try {
      if (!isFullscreen) {
        const el = playerRef.current;
        if (el) {
          if (el.requestFullscreen) await el.requestFullscreen();
          try { await (screen.orientation as any)?.lock?.("landscape"); } catch {}
        }
        setIsFullscreen(true);
      } else {
        if (document.fullscreenElement) await document.exitFullscreen();
        try { (screen.orientation as any)?.unlock?.(); } catch {}
        setIsFullscreen(false);
      }
    } catch {
      setIsFullscreen(!isFullscreen);
    }
  }, [isFullscreen]);

  useEffect(() => {
    const handler = () => {
      if (!document.fullscreenElement) {
        setIsFullscreen(false);
        try { (screen.orientation as any)?.unlock?.(); } catch {}
      }
    };
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  const glassBtn = "w-10 h-10 rounded-full bg-secondary/40 backdrop-blur-xl border border-border/20 flex items-center justify-center text-foreground hover:bg-secondary/60 transition-colors";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Video Player */}
      <div
        ref={playerRef}
        className={`relative w-full bg-black flex-shrink-0 ${isFullscreen ? "fixed inset-0 z-[100]" : "aspect-video"}`}
        onClick={handleTap}
      >
        <iframe
          src={`https://www.youtube.com/embed/${DEMO_VIDEO_ID}?autoplay=1&mute=${isMuted ? 1 : 0}&loop=1&playlist=${DEMO_VIDEO_ID}&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1`}
          className="w-full h-full"
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
          style={{ border: 0 }}
        />

        {/* Live badge */}
        <div className="absolute top-4 left-16 flex items-center gap-2 z-10">
          <span className="flex items-center gap-1.5 bg-red-600/90 backdrop-blur-sm px-3 py-1 rounded-full text-foreground text-xs font-bold uppercase tracking-wider">
            <span className="w-2 h-2 bg-foreground rounded-full animate-live-pulse" />
            Live
          </span>
        </div>

        {/* Overlay */}
        {showControls && (
          <div className="absolute inset-0 bg-black/40 flex flex-col justify-between transition-opacity duration-300 pointer-events-auto" onClick={handleTap}>
            {/* Top bar */}
            <div className="flex items-center justify-between px-4 pt-3">
              <button onClick={(e) => { e.stopPropagation(); navigate("/"); }} className={glassBtn}>
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h2 className="font-display text-sm font-bold text-foreground">TV3 Live</h2>
              <button onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted); }} className={glassBtn}>
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
            </div>

            {/* Center controls */}
            <div className="flex items-center justify-center gap-8">
              <button onClick={(e) => { e.stopPropagation(); setProgress(p => Math.max(0, p - 5)); }} className="relative flex flex-col items-center">
                <div className={glassBtn}><RotateCcw className="w-5 h-5" /></div>
                <span className="text-[10px] font-bold text-foreground/70 mt-1">10s</span>
              </button>
              <button onClick={(e) => { e.stopPropagation(); setIsPlaying(!isPlaying); }} className="w-16 h-16 rounded-full bg-secondary/40 backdrop-blur-xl border border-border/20 flex items-center justify-center hover:bg-secondary/60 transition-all hover:scale-110 duration-200">
                {isPlaying ? <Pause className="w-7 h-7 text-foreground" fill="currentColor" /> : <Play className="w-7 h-7 text-foreground ml-1" fill="currentColor" />}
              </button>
              <button onClick={(e) => { e.stopPropagation(); setProgress(p => Math.min(100, p + 2.5)); }} className="relative flex flex-col items-center">
                <div className={glassBtn}><RotateCw className="w-5 h-5" /></div>
                <span className="text-[10px] font-bold text-foreground/70 mt-1">5s</span>
              </button>
            </div>

            {/* Bottom bar */}
            <div className="px-4 pb-3 space-y-2">
              <div className="w-full h-1.5 bg-foreground/20 rounded-full cursor-pointer group" onClick={(e) => { e.stopPropagation(); handleSeek(e); }}>
                <div className="h-full bg-foreground rounded-full relative transition-all" style={{ width: `${progress}%` }}>
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-foreground/70 text-[10px] font-medium">LIVE</span>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <button onClick={(e) => { e.stopPropagation(); setShowQuality(!showQuality); }} className={glassBtn}>
                      <Settings className="w-4 h-4" />
                    </button>
                    {showQuality && (
                      <div className="absolute bottom-12 right-0 bg-secondary/80 backdrop-blur-2xl border border-border/20 rounded-2xl py-2 min-w-[120px] shadow-xl z-20" onClick={(e) => e.stopPropagation()}>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground px-3 pb-1 font-semibold">Quality</p>
                        {qualityOptions.map((q) => (
                          <button key={q} onClick={() => { setSelectedQuality(q); setShowQuality(false); }} className={`w-full text-left px-3 py-1.5 text-sm transition-colors ${selectedQuality === q ? "text-foreground font-semibold bg-foreground/10" : "text-muted-foreground hover:bg-secondary"}`}>{q}</button>
                        ))}
                      </div>
                    )}
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }} className={glassBtn}>
                    {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Info below player */}
      {!isFullscreen && (
        <>
          <div className="px-4 py-4 border-b border-border">
            <h1 className="font-display text-lg font-bold text-foreground">TV3 News — Live Coverage</h1>
            <p className="text-muted-foreground text-sm mt-1">Watch the latest breaking news and updates as they happen</p>
            <div className="flex items-center gap-3 mt-3">
              <span className="flex items-center gap-1.5 bg-red-600/20 text-red-400 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-live-pulse" />
                On Air
              </span>
              <span className="text-muted-foreground text-xs">12.4K watching</span>
            </div>
          </div>
          <div className="px-4 py-4 flex-1">
            <h2 className="font-display text-sm font-bold text-foreground mb-3">Up Next</h2>
            <div className="space-y-3">
              {[
                { time: "14:00", title: "Afternoon News Bulletin" },
                { time: "15:30", title: "Sports Round-Up" },
                { time: "17:00", title: "Evening Headlines" },
              ].map((item) => (
                <div key={item.time} className="flex items-center gap-3 bg-secondary/40 backdrop-blur-xl rounded-xl p-3 border border-border/20">
                  <span className="text-foreground text-xs font-bold font-display w-12">{item.time}</span>
                  <span className="text-foreground/80 text-sm">{item.title}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default LiveNews;
