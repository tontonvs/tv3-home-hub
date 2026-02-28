import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, User, Palette, Moon, Sun, RefreshCw, LogOut, Globe, Accessibility, HelpCircle, Wifi, Info, Trash2, ChevronRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import AuthSheet from "@/components/AuthSheet";

type Theme = "dark" | "light";

const Settings = () => {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [theme, setTheme] = useState<Theme>("dark");
  const [dataSaver, setDataSaver] = useState(false);
  const [language, setLanguage] = useState("English");

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    // For now just store preference
    localStorage.setItem("tv3_theme", next);
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const handleClearCache = () => {
    if (window.confirm("Clear all cached data? This will reload the app.")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const glassCard = "bg-secondary/40 backdrop-blur-2xl border border-border/20 rounded-2xl overflow-hidden";
  const itemClass = "flex items-center justify-between px-4 py-3.5 active:bg-secondary/60 transition-colors";
  const divider = "h-px bg-border/10 mx-4";

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/60 backdrop-blur-xl border-b border-border/10">
        <div className="flex items-center gap-4 px-4 py-4 max-w-lg mx-auto">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-secondary/40 backdrop-blur-xl border border-border/20 flex items-center justify-center">
            <ArrowLeft className="w-4 h-4 text-foreground" />
          </button>
          <h1 className="text-lg font-bold">Settings</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-6 pb-24">
        {/* Account */}
        <section>
          <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-1 mb-3">Account</h2>
          <div className={glassCard}>
            <button onClick={() => user ? navigate("/settings/account") : setShowAuth(true)} className={itemClass + " w-full"}>
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">Account</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{profile?.username || "Not signed in"}</span>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
            </button>
            <div className={divider} />
            <button onClick={() => {}} className={itemClass + " w-full"}>
              <div className="flex items-center gap-3">
                <RefreshCw className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">Switch Account</span>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
            {user && (
              <>
                <div className={divider} />
                <button onClick={handleLogout} className={itemClass + " w-full"}>
                  <div className="flex items-center gap-3">
                    <LogOut className="w-4 h-4 text-destructive-foreground" />
                    <span className="text-sm text-destructive-foreground">Log Out</span>
                  </div>
                </button>
              </>
            )}
          </div>
        </section>

        {/* Content & Display */}
        <section>
          <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-1 mb-3">Content & Display</h2>
          <div className={glassCard}>
            <button onClick={toggleTheme} className={itemClass + " w-full"}>
              <div className="flex items-center gap-3">
                {theme === "dark" ? <Moon className="w-4 h-4 text-muted-foreground" /> : <Sun className="w-4 h-4 text-muted-foreground" />}
                <span className="text-sm">Appearance</span>
              </div>
              <span className="text-xs text-muted-foreground capitalize">{theme}</span>
            </button>
            <div className={divider} />
            <button onClick={() => {}} className={itemClass + " w-full"}>
              <div className="flex items-center gap-3">
                <Globe className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">Language</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{language}</span>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
            </button>
            <div className={divider} />
            <button onClick={() => {}} className={itemClass + " w-full"}>
              <div className="flex items-center gap-3">
                <Accessibility className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">Accessibility</span>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </section>

        {/* Cache & Mobile */}
        <section>
          <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-1 mb-3">Cache & Mobile</h2>
          <div className={glassCard}>
            <button onClick={() => setDataSaver(!dataSaver)} className={itemClass + " w-full"}>
              <div className="flex items-center gap-3">
                <Wifi className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">Data Saver</span>
              </div>
              <div className={`w-10 h-6 rounded-full transition-colors flex items-center px-0.5 ${dataSaver ? "bg-foreground" : "bg-secondary"}`}>
                <div className={`w-5 h-5 rounded-full transition-transform ${dataSaver ? "translate-x-4 bg-background" : "translate-x-0 bg-muted-foreground"}`} />
              </div>
            </button>
            <div className={divider} />
            <button onClick={handleClearCache} className={itemClass + " w-full"}>
              <div className="flex items-center gap-3">
                <Trash2 className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">Clear Cache</span>
              </div>
            </button>
          </div>
        </section>

        {/* Support & About */}
        <section>
          <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-1 mb-3">Support & About</h2>
          <div className={glassCard}>
            <button onClick={() => {}} className={itemClass + " w-full"}>
              <div className="flex items-center gap-3">
                <HelpCircle className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">Help Center</span>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
            <div className={divider} />
            <button onClick={() => {}} className={itemClass + " w-full"}>
              <div className="flex items-center gap-3">
                <Info className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">About</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">v1.0.0</span>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
            </button>
          </div>
        </section>
      </main>

      <AuthSheet open={showAuth} onOpenChange={setShowAuth} />
    </div>
  );
};

export default Settings;
