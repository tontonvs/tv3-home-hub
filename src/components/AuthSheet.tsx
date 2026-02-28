import { useState } from "react";
import { X, ArrowLeft, Camera, Check, LogOut, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface AuthSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type View = "main" | "signup" | "login" | "profile";

const DEFAULT_AVATARS = [
  "/avatars/default-1.jpg",
  "/avatars/default-2.jpg",
  "/avatars/default-3.jpg",
];

const AuthSheet = ({ open, onOpenChange }: AuthSheetProps) => {
  const { user, profile, signOut, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [view, setView] = useState<View>("main");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  if (!open) return null;

  const currentView = user ? "profile" : view;

  const handleSignUp = async () => {
    if (!username.trim() || !password.trim()) {
      setError("Please fill in all fields");
      return;
    }
    if (password.length > 8) {
      setError("Password must not exceed 8 characters");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    setError("");
    const email = `${username.toLowerCase().replace(/\s+/g, "")}@tv3news.app`;
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username } },
    });
    if (signUpError) {
      setError(signUpError.message);
    } else {
      setView("main");
    }
    setLoading(false);
  };

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      setError("Please fill in all fields");
      return;
    }
    setLoading(true);
    setError("");
    const email = `${username.toLowerCase().replace(/\s+/g, "")}@tv3news.app`;
    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (loginError) {
      setError("Invalid username or password");
    }
    setLoading(false);
  };

  const handleOAuth = async (provider: "google" | "apple") => {
    await lovable.auth.signInWithOAuth(provider);
  };

  const handleAvatarSelect = async (url: string) => {
    if (!user) return;
    setSelectedAvatar(url);
    await supabase
      .from("profiles")
      .update({ avatar_url: url })
      .eq("user_id", user.id);
    await refreshProfile();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${user.id}/avatar.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true });
    if (!uploadError) {
      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      await supabase
        .from("profiles")
        .update({ avatar_url: data.publicUrl })
        .eq("user_id", user.id);
      await refreshProfile();
    }
    setUploading(false);
  };

  const handleSignOut = async () => {
    await signOut();
    setView("main");
    onOpenChange(false);
  };

  const resetForm = () => {
    setUsername("");
    setPassword("");
    setError("");
  };

  const renderProfile = () => (
    <>
      <div className="text-center mb-6">
        <div className="relative inline-block mb-3">
          <Avatar className="w-20 h-20 border-2 border-border/30">
            <AvatarImage src={profile?.avatar_url || DEFAULT_AVATARS[0]} />
            <AvatarFallback className="bg-secondary text-foreground text-xl font-bold">
              {profile?.username?.[0]?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <label className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-foreground flex items-center justify-center cursor-pointer hover:bg-foreground/80 transition-colors">
            <Camera className="w-3.5 h-3.5 text-background" />
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
              disabled={uploading}
            />
          </label>
        </div>
        <h2 className="text-lg font-bold text-foreground">{profile?.username}</h2>
      </div>

      <div className="mb-6">
        <p className="text-xs text-muted-foreground mb-3 text-center">Choose a default avatar</p>
        <div className="flex justify-center gap-3">
          {DEFAULT_AVATARS.map((av) => (
            <button
              key={av}
              onClick={() => handleAvatarSelect(av)}
              className={`relative w-12 h-12 rounded-full overflow-hidden border-2 transition-all ${
                profile?.avatar_url === av ? "border-foreground" : "border-border/30 hover:border-foreground/50"
              }`}
            >
              <img src={av} alt="avatar" className="w-full h-full object-cover" />
              {profile?.avatar_url === av && (
                <div className="absolute inset-0 bg-foreground/20 flex items-center justify-center">
                  <Check className="w-4 h-4 text-foreground" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <button
          onClick={() => { onOpenChange(false); navigate("/settings"); }}
          className="w-full h-12 rounded-xl bg-secondary/50 border border-border/20 text-foreground font-medium text-sm flex items-center justify-center gap-2 hover:bg-secondary/80 transition-colors"
        >
          <Settings className="w-4 h-4" />
          Settings
        </button>
        <button
          onClick={handleSignOut}
          className="w-full h-12 rounded-xl bg-secondary/50 border border-border/20 text-foreground font-medium text-sm flex items-center justify-center gap-2 hover:bg-secondary/80 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </>
  );

  const renderForm = (isSignUp: boolean) => (
    <>
      <button
        onClick={() => { setView("main"); resetForm(); }}
        className="absolute top-4 left-4 text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-foreground">
          {isSignUp ? "Create Account" : "Welcome Back"}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {isSignUp ? "Choose a username and password" : "Enter your credentials"}
        </p>
      </div>

      <div className="space-y-3 mb-4">
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full h-12 rounded-xl bg-secondary/50 border border-border/20 px-4 text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-foreground/30 transition-colors"
        />
        <div>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => {
              if (e.target.value.length <= 8) setPassword(e.target.value);
            }}
            maxLength={8}
            className="w-full h-12 rounded-xl bg-secondary/50 border border-border/20 px-4 text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-foreground/30 transition-colors"
          />
          <p className="text-[10px] text-muted-foreground mt-1 px-1">{password.length}/8 characters</p>
        </div>
      </div>

      {error && <p className="text-xs text-destructive-foreground bg-destructive/20 rounded-lg px-3 py-2 mb-4">{error}</p>}

      <button
        onClick={isSignUp ? handleSignUp : handleLogin}
        disabled={loading}
        className="w-full h-12 rounded-xl bg-foreground text-background font-semibold text-sm hover:bg-foreground/90 transition-colors disabled:opacity-50"
      >
        {loading ? "..." : isSignUp ? "Sign Up" : "Log In"}
      </button>
    </>
  );

  const renderMain = () => (
    <>
      <div className="text-center mb-8">
        <h2 className="text-xl font-bold text-foreground">Welcome</h2>
        <p className="text-sm text-muted-foreground mt-1">Sign in to continue</p>
      </div>

      <div className="space-y-3 mb-6">
        <button
          onClick={() => { setView("signup"); resetForm(); }}
          className="w-full h-12 rounded-xl bg-foreground text-background font-semibold text-sm hover:bg-foreground/90 transition-colors"
        >
          Sign Up
        </button>
        <button
          onClick={() => { setView("login"); resetForm(); }}
          className="w-full h-12 rounded-xl bg-transparent border border-border/40 text-foreground font-semibold text-sm hover:bg-secondary/60 transition-colors"
        >
          Log In
        </button>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 h-px bg-border/30" />
        <span className="text-xs text-muted-foreground">or</span>
        <div className="flex-1 h-px bg-border/30" />
      </div>

      <div className="space-y-3">
        <button
          onClick={() => handleOAuth("google")}
          className="w-full h-12 rounded-xl bg-secondary/50 border border-border/20 text-foreground font-medium text-sm flex items-center justify-center gap-3 hover:bg-secondary/80 transition-colors"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Continue with Google
        </button>
        <button
          onClick={() => handleOAuth("apple")}
          className="w-full h-12 rounded-xl bg-secondary/50 border border-border/20 text-foreground font-medium text-sm flex items-center justify-center gap-3 hover:bg-secondary/80 transition-colors"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
          </svg>
          Continue with Apple
        </button>
      </div>
    </>
  );

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-6">
      <div className="absolute inset-0 bg-background/70 backdrop-blur-sm" onClick={() => onOpenChange(false)} />
      <div className="relative w-full max-w-sm bg-secondary/40 backdrop-blur-2xl border border-border/20 rounded-3xl p-8 shadow-[0_16px_64px_rgba(0,0,0,0.5)]">
        <button
          onClick={() => { onOpenChange(false); setView("main"); resetForm(); }}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        {currentView === "profile" && renderProfile()}
        {currentView === "main" && renderMain()}
        {currentView === "signup" && renderForm(true)}
        {currentView === "login" && renderForm(false)}
      </div>
    </div>
  );
};

export default AuthSheet;
