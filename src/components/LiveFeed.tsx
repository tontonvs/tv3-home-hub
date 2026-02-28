import { useNavigate } from "react-router-dom";
import liveFeedImg from "@/assets/live-feed.jpg";
import { Play } from "lucide-react";

const LiveFeed = () => {
  const navigate = useNavigate();

  return (
    <section className="relative w-full aspect-video overflow-hidden cursor-pointer" onClick={() => navigate("/live")}>
      <img
        src={liveFeedImg}
        alt="TV3 Live broadcast"
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />

      <div className="absolute top-4 left-4 flex items-center gap-2">
        <span className="flex items-center gap-1.5 bg-foreground px-3 py-1 rounded-md text-background text-xs font-bold uppercase tracking-wider">
          <span className="w-2 h-2 bg-background rounded-full animate-live-pulse" />
          Live
        </span>
      </div>

      <button className="absolute inset-0 flex items-center justify-center group">
        <div className="w-16 h-16 rounded-full bg-foreground/90 flex items-center justify-center backdrop-blur-sm group-hover:bg-foreground transition-all group-hover:scale-110 duration-200">
          <Play className="w-7 h-7 text-background ml-1" fill="currentColor" />
        </div>
      </button>

      <div className="absolute bottom-4 left-4 right-4">
        <h2 className="font-display text-lg font-bold text-foreground leading-tight">
          TV3 News — Live Coverage
        </h2>
        <p className="text-muted-foreground text-sm mt-1">Watch the latest breaking news and updates</p>
      </div>
    </section>
  );
};

export default LiveFeed;
