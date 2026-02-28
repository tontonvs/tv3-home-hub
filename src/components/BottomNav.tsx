import { useState } from "react";
import { Home, Radio, User } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import AuthSheet from "@/components/AuthSheet";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const navItems = [
  { icon: Home, label: "Home", id: "home", path: "/" },
  { icon: Radio, label: "Watch", id: "live", path: "/live", isLive: true },
  { icon: User, label: "Profile", id: "profile", path: "/" },
];

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showAuth, setShowAuth] = useState(false);
  const { user, profile } = useAuth();
  const activeId = navItems.find((item) => item.path === location.pathname)?.id ?? "home";

  const handleNavClick = (item: typeof navItems[0]) => {
    if (item.id === "profile") {
      setShowAuth(true);
    } else {
      navigate(item.path);
    }
  };

  return (
    <>
      <nav className="fixed bottom-5 left-0 right-0 z-50 flex justify-center px-6">
        <div className="flex items-end gap-1 bg-secondary/60 backdrop-blur-2xl border border-border/20 rounded-2xl px-2 py-1.5 shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
          {navItems.map((item) => {
            const isActive = activeId === item.id;

            if (item.isLive) {
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item)}
                  className="flex flex-col items-center mx-3 -mt-5 mb-0.5"
                >
                  <div
                    className={`relative w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${
                      isActive
                        ? "bg-foreground shadow-[0_0_20px_hsl(var(--foreground)/0.3)]"
                        : "bg-foreground/80 hover:bg-foreground hover:shadow-[0_0_16px_hsl(var(--foreground)/0.2)]"
                    }`}
                  >
                    <Radio className="w-4 h-4 text-background" strokeWidth={2.5} />
                  </div>
                  <span
                    className={`text-[9px] font-bold mt-0.5 transition-all duration-300 ${
                      isActive ? "text-foreground opacity-0" : "text-muted-foreground opacity-100"
                    }`}
                  >
                    {item.label}
                  </span>
                </button>
              );
            }

            // Profile tab: show avatar when logged in
            if (item.id === "profile" && user && profile) {
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item)}
                  className="flex flex-col items-center w-14 py-1.5 rounded-xl transition-all duration-300"
                >
                  <Avatar className="w-5 h-5">
                    <AvatarImage src={profile.avatar_url || "/avatars/default-1.jpg"} />
                    <AvatarFallback className="bg-secondary text-foreground text-[8px] font-bold">
                      {profile.username?.[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span
                    className={`text-[9px] font-semibold mt-0.5 transition-all duration-300 ${
                      isActive ? "opacity-0" : "opacity-100 text-muted-foreground"
                    }`}
                  >
                    {profile.username}
                  </span>
                </button>
              );
            }

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item)}
                className={`flex flex-col items-center w-14 py-1.5 rounded-xl transition-all duration-300 ${
                  isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground/70"
                }`}
              >
                <item.icon className="w-[18px] h-[18px]" strokeWidth={isActive ? 2.5 : 1.5} />
                <span
                  className={`text-[9px] font-semibold mt-0.5 transition-all duration-300 ${
                    isActive ? "opacity-0" : "opacity-100"
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      <AuthSheet open={showAuth} onOpenChange={setShowAuth} />
    </>
  );
};

export default BottomNav;
