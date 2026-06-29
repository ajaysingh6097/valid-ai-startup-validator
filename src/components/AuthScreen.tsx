import React, { useState } from "react";
import { User } from "../types";
import { 
  KeyRound, 
  Mail, 
  User as UserIcon, 
  Sparkles, 
  Loader2, 
  AlertCircle,
  ShieldCheck,
  Flame
} from "lucide-react";

interface AuthScreenProps {
  onAuthSuccess: (token: string, user: User) => void;
  initialMode?: "login" | "signup";
}

export default function AuthScreen({ onAuthSuccess, initialMode = "login" }: AuthScreenProps) {
  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
    const payload = mode === "login" 
      ? { email, password } 
      : { email, name, password };

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Failed to ${mode}. Please verify your credentials.`);
      }

      onAuthSuccess(data.token, data.user);
    } catch (err: any) {
      setError(err.message || "An unexpected network error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleSandboxLogin = async () => {
    setError(null);
    setLoading(true);

    // Let's create a standard sandbox email/password to log them in or register instantly
    const sandboxEmail = "sandbox.founder@valid.ai";
    const sandboxPassword = "founder_sandbox_123";
    const sandboxName = "Alex the Founder";

    try {
      // First try to login
      let response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: sandboxEmail, password: sandboxPassword })
      });

      let data = await response.json();

      // If login fails (user doesn't exist yet), let's register them
      if (!response.ok) {
        response = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: sandboxEmail, name: sandboxName, password: sandboxPassword })
        });
        data = await response.json();
      }

      if (!response.ok) {
        throw new Error(data.error || "Failed to establish sandbox connection.");
      }

      onAuthSuccess(data.token, data.user);
    } catch (err: any) {
      setError(err.message || "Failed to trigger sandbox session.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-[#020617]" id="auth-screen-root">
      <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-3xl shadow-2xl overflow-hidden relative" id="auth-card">
        {/* Visual blur decorations */}
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-indigo-600/10 blur-2xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-cyan-500/10 blur-2xl pointer-events-none"></div>

        <div className="p-8 sm:p-10 relative">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-850 border border-slate-700 text-indigo-300 text-[10px] font-mono tracking-widest uppercase mb-4 shadow-sm">
              <ShieldCheck className="w-3 h-3 text-indigo-400" />
              Valid AI Gateway
            </div>

            <h2 className="font-display text-2xl font-bold text-white tracking-tight" id="auth-title">
              {mode === "login" ? "System Login" : "Build Your Future"}
            </h2>
            <p className="text-xs text-slate-400 mt-2 font-medium">
              {mode === "login" 
                ? "Access Precision Venture Validation Intelligence." 
                : "Create Your Analytical Workspace to Validate Ventures."}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-2.5 text-xs text-rose-400 animate-fade-in" id="auth-error-panel">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <div className="flex-1 font-medium">{error}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4" id="auth-form">
            {mode === "signup" && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 block">Full Name</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                    <UserIcon className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="Jane Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 border border-slate-800 rounded-xl text-xs bg-slate-950/60 focus:bg-slate-950/85 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-white placeholder:text-slate-600"
                    id="signup-name-input"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 block">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  required
                  placeholder="jane.doe@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 border border-slate-800 rounded-xl text-xs bg-slate-950/60 focus:bg-slate-950/85 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-white placeholder:text-slate-600"
                  id="auth-email-input"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-slate-400 block">Password</label>
                {mode === "login" && (
                  <button 
                    type="button" 
                    className="text-[10px] text-slate-500 hover:text-slate-300 font-medium cursor-pointer"
                    onClick={() => alert("Sandbox environment password recovery. For safety, please use the 'Launch Sandbox' fast-access option below!")}
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                  <KeyRound className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 border border-slate-800 rounded-xl text-xs bg-slate-950/60 focus:bg-slate-950/85 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-white placeholder:text-slate-600"
                  id="auth-password-input"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white rounded-xl text-xs font-bold tracking-tight transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-500/20"
              id="auth-submit-button"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              ) : mode === "login" ? (
                "Authenticate Account"
              ) : (
                "Create Account & Start"
              )}
            </button>
          </form>

          {/* Toggle Screen Mode */}
          <div className="mt-6 text-center">
            <button
              onClick={() => setMode(mode === "login" ? "signup" : "login")}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer"
              id="toggle-auth-mode-button"
            >
              {mode === "login" 
                ? "Don't have an account? Create one now" 
                : "Already registered? Login to access"}
            </button>
          </div>

          {/* Sandbox Fast Track Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-mono tracking-widest">
              <span className="bg-[#0b0f19] px-3 text-slate-500 font-semibold">Developers & Evaluators</span>
            </div>
          </div>

          {/* Sandbox Fast login Button */}
          <button
            onClick={handleSandboxLogin}
            disabled={loading}
            className="w-full py-2.5 bg-slate-950/40 hover:bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-semibold tracking-tight transition-all flex items-center justify-center gap-2 cursor-pointer"
            id="sandbox-auth-button"
          >
            <Flame className="w-4 h-4 text-indigo-400" />
            Launch Sandbox (Pre-seeded Demo Mode)
          </button>
        </div>
      </div>
    </div>
  );
}
