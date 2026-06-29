import React, { useState } from "react";
import { User, Project } from "../types";
import { 
  User as UserIcon, 
  Linkedin, 
  Globe, 
  Mail, 
  ShieldCheck, 
  Loader2, 
  Sparkles, 
  CreditCard,
  Briefcase,
  Layers,
  Award,
  AlertCircle,
  LogOut
} from "lucide-react";

interface FounderProfileProps {
  user: User;
  projects: Project[];
  onUpdateProfile: (updates: Partial<User>) => Promise<User>;
  onLogout: () => void;
}

export default function FounderProfile({ user, projects, onUpdateProfile, onLogout }: FounderProfileProps) {
  
  // Profile Form States
  const [name, setName] = useState(user.name);
  const [linkedinUrl, setLinkedinUrl] = useState(user.linkedinUrl || "");
  const [websiteUrl, setWebsiteUrl] = useState(user.websiteUrl || "");
  const [businessRole, setBusinessRole] = useState(user.businessRole || "Founder & CEO");
  const [bio, setBio] = useState(user.bio || "");
  
  const [updating, setUpdating] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Upgrade State
  const [tierLoading, setTierLoading] = useState<string | null>(null);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      await onUpdateProfile({
        name,
        linkedinUrl,
        websiteUrl,
        businessRole,
        bio
      });
      setSuccessMsg("Profile parameters compiled successfully.");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to compile profile parameters.");
    } finally {
      setUpdating(false);
    }
  };

  const handleUpgradeTier = async (tier: "Free" | "Growth Pro" | "Enterprise Elite") => {
    setTierLoading(tier);
    try {
      await onUpdateProfile({ subscriptionType: tier });
      setSuccessMsg(`Account subscription elevated to ${tier}!`);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to upgrade subscription.");
    } finally {
      setTierLoading(null);
    }
  };

  const plans = [
    {
      name: "Free",
      price: "$0",
      description: "Basic entry features for validating simple ideation drafts.",
      features: ["3 registered venture workspaces", "Standard text-only validation analysis", "Static SWOT analysis matrices", "Basic Q1 timeline estimations"],
      tierCode: "Free" as const
    },
    {
      name: "Growth Pro",
      price: "$49",
      period: "/mo",
      description: "Comprehensive quantitative intelligence suite for active startup builders.",
      features: ["Unlimited registered workspaces", "Deep AI-crawled competitor tracking", "High-fidelity user persona generation", "Custom additional monetization models", "Interactive Q1-Q4 roadmap plans"],
      tierCode: "Growth Pro" as const,
      badge: "Popular"
    },
    {
      name: "Enterprise Elite",
      price: "$199",
      period: "/mo",
      description: "Scale-ready workspace for venture builders, developers, and studios.",
      features: ["Everything in Growth Pro", "High-priority multi-agent validation queue", "CSV / PDF executive deck exports", "Shared collaborative workspace seats", "Dedicated strategic adviser access"],
      tierCode: "Enterprise Elite" as const,
      badge: "Scale Choice"
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 relative z-10" id="founder-profile-root">
      
      {/* Top Welcome Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-6 mb-2">
        <div>
          <span className="text-[10px] text-indigo-400 font-mono tracking-widest uppercase font-bold">Workspace Configuration</span>
          <h2 className="font-display text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
            Founder Identity Hub
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-semibold mt-1">
            Configure your personal workspace variables, professional bio, and account authentication parameters.
          </p>
        </div>
        <button 
          onClick={onLogout}
          className="px-4 py-2 border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 text-rose-400 hover:text-rose-300 rounded-xl text-xs font-bold tracking-tight transition-all flex items-center gap-1.5 cursor-pointer"
          id="header-logout-button"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign Out of Workspace
        </button>
      </div>

      {/* Top Banner Alert / Welcome */}
      {successMsg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-2xl flex items-center gap-2.5 animate-fade-in" id="profile-success-alert">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold rounded-2xl flex items-center gap-2.5 animate-fade-in" id="profile-error-alert">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Left Column: Personal Information Profile Form */}
        <div className="lg:col-span-2 space-y-8" id="profile-settings-form-container">
          <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
            
            <div className="flex items-center gap-3 border-b border-slate-800 pb-5 mb-6">
              <div className="w-10 h-10 bg-slate-800 border border-slate-700 text-indigo-400 rounded-xl flex items-center justify-center">
                <UserIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-white tracking-tight">
                  Founder Profile
                </h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5 uppercase tracking-wider">
                  Personal Information & Workspace Settings
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-6" id="founder-profile-form">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-800 rounded-xl text-xs bg-slate-950/60 focus:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-200 font-medium"
                    id="profile-name-input"
                  />
                </div>

                {/* Account Email (Immutable) */}
                <div className="space-y-1.5 opacity-75">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    Email Address
                    <span className="text-[9px] font-mono font-bold bg-slate-850 text-slate-400 px-1.5 rounded uppercase border border-slate-750">Immutable</span>
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                      <Mail className="w-3.5 h-3.5" />
                    </span>
                    <input
                      type="email"
                      disabled
                      value={user.email}
                      className="w-full pl-9 pr-4 py-2.5 border border-slate-800/80 rounded-xl text-xs bg-slate-950/40 text-slate-500 cursor-not-allowed font-medium"
                      id="profile-email-readonly"
                    />
                  </div>
                </div>

                {/* Professional Role */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Business / Startup Role</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                      <Briefcase className="w-3.5 h-3.5" />
                    </span>
                    <input
                      type="text"
                      placeholder="Founder & CEO"
                      value={businessRole}
                      onChange={(e) => setBusinessRole(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 border border-slate-800 rounded-xl text-xs bg-slate-950/60 focus:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-200 font-medium"
                      id="profile-role-input"
                    />
                  </div>
                </div>

                {/* LinkedIn Link */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">LinkedIn URL</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                      <Linkedin className="w-3.5 h-3.5" />
                    </span>
                    <input
                      type="url"
                      placeholder="https://linkedin.com/in/username"
                      value={linkedinUrl}
                      onChange={(e) => setLinkedinUrl(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 border border-slate-800 rounded-xl text-xs bg-slate-950/60 focus:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-200 font-medium"
                      id="profile-linkedin-input"
                    />
                  </div>
                </div>
              </div>

              {/* Personal Bio */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Professional Bio & Founder Focus</label>
                <textarea
                  rows={3}
                  placeholder="Tell us about your previous startup exits, operational focus, or specific venture specialties."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-800 rounded-xl text-xs bg-slate-950/60 focus:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-200 leading-relaxed font-medium"
                  id="profile-bio-textarea"
                />
              </div>

              {/* Save button */}
              <button
                type="submit"
                disabled={updating}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white rounded-xl text-xs font-bold tracking-tight transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-500/20"
                id="profile-save-button"
              >
                {updating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    Compiling Profile parameters...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    Compile Profile Changes
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Account Security & Subscription tier details */}
        <div className="space-y-6" id="profile-info-summary-sidebar">
          
          {/* Subscription Summary Panel */}
          <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 rounded-full bg-indigo-500/5 blur-xl pointer-events-none"></div>
            
            <div className="flex items-center gap-2 border-b border-slate-800 pb-4 mb-4">
              <Award className="w-4 h-4 text-indigo-400" />
              <h4 className="font-display font-bold text-white text-sm">
                Subscription Tier
              </h4>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl flex flex-col items-center text-center">
                <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-wider">Active Workspace Plan</span>
                <span className="font-sans font-black text-xl text-white tracking-tight mt-1">
                  {user.subscriptionType}
                </span>
                <span className="text-[10px] text-slate-400 font-semibold mt-1">
                  {user.subscriptionType === "Enterprise Elite" ? "Unlimited Multi-agent priority crawling" : 
                   user.subscriptionType === "Growth Pro" ? "Deep Competitor indices and roadmaps unlocked" : 
                   "Standard single validation workspaces"}
                </span>
              </div>

              {/* Mini Linked projects counter */}
              <div className="flex justify-between items-center px-2 text-xs font-semibold text-slate-400">
                <span>Active Blueprints</span>
                <span className="font-mono text-white bg-slate-850 border border-slate-750 px-2 py-0.5 rounded-full">{projects.length}</span>
              </div>
            </div>
          </div>

          {/* Account Security & Session Panel */}
          <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden" id="profile-session-controls">
            <div className="absolute top-0 right-0 w-16 h-16 rounded-full bg-rose-500/5 blur-xl pointer-events-none"></div>
            
            <div className="flex items-center gap-2 border-b border-slate-800 pb-4 mb-4">
              <UserIcon className="w-4 h-4 text-rose-400" />
              <h4 className="font-display font-bold text-white text-sm">
                Session Controls
              </h4>
            </div>

            <div className="space-y-4">
              <p className="text-[11px] text-slate-400 leading-relaxed font-semibold">
                You are currently signed in as <span className="text-white font-bold">{user.name}</span>. Feel free to sign out of this active browser session securely.
              </p>

              <button
                onClick={onLogout}
                className="w-full py-2.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 hover:border-rose-500/50 text-rose-400 rounded-xl text-xs font-bold tracking-tight transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-rose-950/25"
                id="sidebar-logout-button"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out of Workspace
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* Subscription Pricing Tiers upgrades */}
      <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-8" id="profile-subscription-pricing-plans">
        
        <div className="text-center max-w-xl mx-auto space-y-1.5">
          <span className="text-[10px] text-indigo-400 font-mono tracking-widest uppercase font-bold">Billing Scale</span>
          <h3 className="font-display text-xl sm:text-2xl font-bold text-white tracking-tight">
            Elevate Your Analytical Output
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-semibold">
            Unlock real-time data crawling, collaborative builder workspaces, and multi-agent priority validation loops.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const isCurrent = user.subscriptionType === plan.tierCode;
            const isPro = plan.tierCode !== "Free";
            
            return (
              <div 
                key={plan.name}
                className={`p-6 bg-slate-950/30 border rounded-2xl flex flex-col justify-between relative transition-all duration-300 ${
                  isCurrent 
                    ? "border-indigo-500 ring-1 ring-indigo-500 bg-slate-955/60" 
                    : plan.badge 
                    ? "border-indigo-500/40 hover:border-indigo-500 bg-slate-950/20" 
                    : "border-slate-800 hover:border-slate-700 bg-slate-950/10"
                }`}
              >
                {/* Badge if Popular/Scale */}
                {plan.badge && (
                  <span className="absolute top-0 right-6 -translate-y-1/2 px-2.5 py-0.5 rounded-full bg-indigo-600 text-white text-[9px] font-mono tracking-wider uppercase font-extrabold">
                    {plan.badge}
                  </span>
                )}

                <div className="space-y-5">
                  <div>
                    <span className="text-xs font-bold text-white font-display uppercase tracking-wide block">
                      {plan.name}
                    </span>
                    <div className="flex items-baseline mt-2 text-white">
                      <span className="text-3xl font-black font-display tracking-tight">{plan.price}</span>
                      {plan.period && <span className="text-xs text-slate-500 font-mono font-bold ml-1">{plan.period}</span>}
                    </div>
                    <p className="text-[11px] text-slate-400 leading-normal mt-2.5 font-semibold">
                      {plan.description}
                    </p>
                  </div>

                  {/* Feature list */}
                  <ul className="space-y-2 border-t border-slate-800 pt-4 text-[11px] text-slate-300 font-semibold leading-relaxed">
                    {plan.features.map((feat) => (
                      <li key={feat} className="flex items-start gap-2">
                        <span className="text-indigo-400 font-bold shrink-0">•</span>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-850">
                  {isCurrent ? (
                    <button
                      disabled
                      className="w-full py-2 border border-slate-800 text-slate-500 bg-slate-900/40 rounded-xl text-xs font-bold tracking-tight cursor-not-allowed text-center"
                    >
                      Active Current Plan
                    </button>
                  ) : (
                    <button
                      onClick={() => handleUpgradeTier(plan.tierCode)}
                      disabled={tierLoading !== null}
                      className={`w-full py-2.5 rounded-xl text-xs font-bold tracking-tight transition-all text-center cursor-pointer shadow-xs flex items-center justify-center gap-2 ${
                        isPro 
                          ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20" 
                          : "bg-slate-850 hover:bg-slate-800 border border-slate-750 text-slate-300"
                      }`}
                    >
                      {tierLoading === plan.tierCode ? (
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                      ) : (
                        <>
                          <CreditCard className="w-3.5 h-3.5" />
                          Upgrade to {plan.name}
                        </>
                      )}
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>

      </div>

    </div>
  );
}
