import { useState } from "react";
import BottomNav from "@/components/BottomNav";
import ShortsFeed from "@/components/ShortsFeed";
import { useBackHandler } from "@/hooks/useBackHandler";
import { Search, XCircle } from "lucide-react";
import tv3Logo from "@/assets/tv3-logo.png";
import news1 from "@/assets/news-1.jpg";
import news2 from "@/assets/news-2.jpg";
import news3 from "@/assets/news-3.jpg";
import news4 from "@/assets/news-4.jpg";

const newsArticles = [
  { image: news1, category: "Breaking", title: "Emergency services respond to major incident in city centre", time: "12 min ago", featured: true },
  { image: news2, category: "Politics", title: "Government announces sweeping new policy reforms ahead of summit", time: "45 min ago", featured: true },
  { image: news3, category: "Sports", title: "National team clinches dramatic last-minute victory in cup final", time: "1 hr ago", featured: true },
  { image: news4, category: "Business", title: "Markets rally as investors react to quarterly earnings reports", time: "2 hrs ago", featured: true },
];

const tabs = ["Top Stories", "Shorts"] as const;

const Index = () => {
  const [activeTab, setActiveTab] = useState<string>("Top Stories");
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useBackHandler();

  const isShorts = activeTab === "Shorts";

  return (
    <div className="min-h-screen bg-black pb-24 text-foreground selection:bg-primary/30">
      {/* Sticky Top Navbar - hidden in Shorts */}
      {!isShorts && (
        <header className="sticky top-0 z-50 transition-all duration-300">
          <div className="bg-black/60 backdrop-blur-xl border-b border-white/5">
            <div className="flex items-center justify-between px-6 pt-6 pb-4 max-w-lg mx-auto">
              <div className="flex items-center gap-6">
                <img src={tv3Logo} alt="TV3" className="h-7 invert brightness-200" />
                <div className="w-px h-6 bg-white/10" />
                <nav className="flex gap-6">
                  {tabs.map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`relative text-[15px] font-bold tracking-tight transition-all duration-200 ${
                        activeTab === tab ? "text-white" : "text-white/40 hover:text-white/70"
                      }`}
                    >
                      {tab}
                      {activeTab === tab && (
                        <span className="absolute -bottom-1 left-0 right-0 h-[3px] bg-white rounded-full shadow-[0_0_12px_rgba(255,255,255,0.5)]" />
                      )}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Search icon */}
              <button
                onClick={() => setShowSearch(!showSearch)}
                className="w-9 h-9 rounded-full bg-secondary/40 backdrop-blur-xl border border-border/20 flex items-center justify-center"
              >
                <Search className="w-4 h-4 text-foreground" />
              </button>
            </div>

            {/* Search bar */}
            {showSearch && (
              <div className="px-6 pb-4 max-w-lg mx-auto">
                <div className="flex items-center gap-2 bg-secondary/40 backdrop-blur-2xl border border-border/20 rounded-full px-4 h-10">
                  <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                    className="flex-1 bg-transparent text-foreground text-sm placeholder:text-muted-foreground focus:outline-none"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery("")} className="flex-shrink-0">
                      <XCircle className="w-4 h-4 text-muted-foreground hover:text-foreground transition-colors" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </header>
      )}

      <main className={isShorts ? "" : "max-w-lg mx-auto"}>
        {activeTab === "Top Stories" && (
          <div className="flex flex-col gap-[2px] bg-white/5">
            {newsArticles
              .filter(a => !searchQuery || a.title.toLowerCase().includes(searchQuery.toLowerCase()) || a.category.toLowerCase().includes(searchQuery.toLowerCase()))
              .map((article, i) => (
              <article key={i} className="relative w-full aspect-[4/5] overflow-hidden cursor-pointer group active:scale-[0.98] transition-transform duration-200">
                <img src={article.image} alt={article.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1.5s] ease-out" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent opacity-40" />
                <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 py-0.5 rounded bg-white/10 backdrop-blur-md border border-white/10 text-[10px] font-black uppercase tracking-widest text-white/90">
                      {article.category}
                    </span>
                    {article.featured && <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />}
                  </div>
                  <h2 className="font-display text-2xl font-bold text-white mt-1.5 leading-[1.15] tracking-tight group-hover:text-primary transition-colors">
                    {article.title}
                  </h2>
                  <div className="flex items-center gap-3 mt-4 text-white/50 text-[11px] font-medium">
                    <span>{article.time}</span>
                    <span className="w-1 h-1 rounded-full bg-white/20" />
                    <span className="uppercase tracking-tighter italic font-bold">TV3 Live</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {isShorts && <ShortsFeed />}
      </main>

      {/* Hide bottom nav when in Shorts */}
      {!isShorts && <BottomNav />}
    </div>
  );
};

export default Index;
