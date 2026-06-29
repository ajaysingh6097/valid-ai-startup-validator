import React, { useState } from "react";
import { User, Project } from "../types";
import { 
  Compass, 
  Layers, 
  User as UserIcon, 
  LogOut, 
  Menu, 
  X, 
  TrendingUp, 
  ChevronDown, 
  FileText,
  Workflow,
  Image as ImageIcon
} from "lucide-react";

interface NavigationProps {
  currentView: "landing" | "workspace" | "dashboard" | "profile" | "media";
  setView: (view: "landing" | "workspace" | "dashboard" | "profile" | "media") => void;
  user: User | null;
  logout: () => void;
  selectedProject: Project | null;
  projects: Project[];
  selectProject: (project: Project) => void;
}

export default function Navigation({
  currentView,
  setView,
  user,
  logout,
  selectedProject,
  projects,
  selectProject
}: NavigationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showProjDropdown, setShowProjDropdown] = useState(false);

  const navItems = [
    { id: "landing", label: "Overview", icon: Compass },
    ...(user ? [{ id: "workspace", label: "Workspace 01", icon: Layers }] : []),
    ...(user && selectedProject ? [{ id: "dashboard", label: "Validation Hub", icon: TrendingUp }] : []),
    ...(user ? [{ id: "media", label: "Media Hub", icon: ImageIcon }] : []),
    ...(user ? [{ id: "profile", label: "Founder Profile", icon: UserIcon }] : [])
  ] as const;

  return (
    <nav className="sticky top-0 z-50 bg-[#020617]/80 backdrop-blur-md border-b border-slate-800/60" id="main-navigation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center gap-8">
            {/* Logo */}
            <div 
              className="flex items-center gap-2.5 cursor-pointer"
              onClick={() => setView("landing")}
              id="logo-button"
            >
              <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-display font-bold tracking-wider shadow-lg shadow-indigo-500/20">
                V
              </div>
              <div className="flex flex-col">
                <span className="font-display font-bold text-white tracking-tight leading-none text-[17px]">
                  Valid<span className="text-indigo-400">AI</span>
                </span>
                <span className="text-[9px] text-slate-400 font-mono tracking-widest mt-0.5 uppercase">
                  Venture Validator
                </span>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-1" id="desktop-nav-links">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setView(item.id as "landing" | "workspace" | "dashboard" | "profile" | "media");
                      setIsOpen(false);
                    }}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-sm font-medium transition-all ${
                      isActive 
                        ? "text-white bg-slate-800/80 border border-slate-700/60 shadow-inner" 
                        : "text-slate-400 hover:text-white hover:bg-slate-800/40"
                    }`}
                    id={`nav-link-${item.id}`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? "text-indigo-400" : "text-slate-400"}`} />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right menu tools */}
          <div className="hidden md:flex items-center gap-4" id="right-nav-tools">
            {user ? (
              <>
                {/* Active Project Dropdown */}
                {projects.length > 0 && (
                  <div className="relative">
                    <button
                      onClick={() => setShowProjDropdown(!showProjDropdown)}
                      className="flex items-center gap-2 px-3 py-1.5 border border-slate-700/80 rounded-lg text-xs font-medium text-slate-200 hover:bg-slate-800 bg-slate-900/50 shadow-xs"
                      id="nav-project-selector"
                    >
                      <Workflow className="w-3.5 h-3.5 text-slate-400" />
                      <span className="max-w-[120px] truncate">
                        {selectedProject ? selectedProject.name : "Select Venture"}
                      </span>
                      <ChevronDown className="w-3 h-3 text-slate-400" />
                    </button>

                    {showProjDropdown && (
                      <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-lg shadow-2xl py-1 z-50">
                        <div className="px-3 py-1.5 border-b border-slate-800 text-[10px] font-mono tracking-wider text-slate-400 uppercase">
                          Your Active Ventures
                        </div>
                        <div className="max-h-60 overflow-y-auto">
                          {projects.map((p) => (
                            <button
                              key={p.id}
                              onClick={() => {
                                selectProject(p);
                                setView("dashboard");
                                setShowProjDropdown(false);
                              }}
                              className={`w-full text-left px-4 py-2 text-xs flex items-center justify-between transition-colors ${
                                selectedProject?.id === p.id 
                                  ? "bg-slate-800 text-white font-semibold" 
                                  : "text-slate-300 hover:bg-slate-800/50 hover:text-white"
                              }`}
                            >
                              <span className="truncate">{p.name}</span>
                              <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${
                                p.status === "Validated" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium" :
                                p.status === "Failed" ? "bg-rose-500/10 text-rose-400 border border-rose-500/20 font-medium" :
                                p.status === "Validating" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium animate-pulse" :
                                "bg-slate-800 text-slate-400 border border-slate-700"
                              }`}>
                                {p.status}
                              </span>
                            </button>
                          ))}
                        </div>
                        <div className="border-t border-slate-800 p-1">
                          <button
                            onClick={() => {
                              setView("workspace");
                              setShowProjDropdown(false);
                            }}
                            className="w-full text-center py-1.5 text-[11px] font-medium text-indigo-400 hover:text-indigo-300 hover:bg-slate-800/50 rounded-md block"
                          >
                            + Analyze New Idea
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Logged in User Profile controls */}
                <div className="flex items-center gap-3 border-l border-slate-800 pl-4">
                  <div 
                    onClick={() => setView("profile")}
                    className="flex items-center gap-2 cursor-pointer group"
                  >
                    <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-white text-xs font-bold shadow-xs">
                      {user.avatar ? (
                        <img 
                          src={user.avatar} 
                          alt={user.name} 
                          className="w-full h-full rounded-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        user.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-slate-200 group-hover:text-white transition-colors">
                        {user.name}
                      </span>
                      <span className={`text-[9px] px-1.5 py-0.2 rounded-full border leading-none self-start mt-0.5 ${
                        user.subscriptionType === "Enterprise Elite"
                          ? "bg-indigo-500/15 text-indigo-300 border-indigo-500/30"
                          : user.subscriptionType === "Growth Pro"
                          ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                          : "bg-slate-800 text-slate-400 border-slate-700"
                      }`}>
                        {user.subscriptionType}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={logout}
                    className="p-1.5 border border-slate-800 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-all"
                    title="Sign Out"
                    id="logout-button-desktop"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <button
                onClick={() => setView("profile")}
                className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-200 text-slate-950 rounded-lg text-xs font-bold tracking-tight transition-all shadow-xl shadow-white/5"
                id="login-button-desktop"
              >
                Access Platform
              </button>
            )}
          </div>

          {/* Mobile menu toggle */}
          <div className="flex items-center md:hidden" id="mobile-menu-toggle-wrapper">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 border border-slate-800 rounded-lg text-slate-400 hover:text-white bg-slate-900/50"
              id="mobile-menu-button"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {isOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800 px-4 pt-2 pb-4 space-y-3" id="mobile-menu-panel">
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setView(item.id as "landing" | "workspace" | "dashboard" | "profile" | "media");
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                    isActive 
                      ? "text-white bg-slate-800" 
                      : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </div>

          {user ? (
            <div className="border-t border-slate-800 pt-3 flex flex-col gap-3">
              <div className="flex items-center gap-3 px-3">
                <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-white text-xs font-bold border border-slate-700">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-slate-200">{user.name}</span>
                  <span className="text-xs text-slate-400">{user.email}</span>
                </div>
              </div>
              <button
                onClick={() => {
                  logout();
                  setIsOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-rose-500/15 text-rose-400 border border-rose-500/20 hover:bg-rose-500/25 rounded-lg text-sm font-medium transition-all"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setView("profile");
                setIsOpen(false);
              }}
              className="w-full text-center px-4 py-2.5 bg-white text-slate-950 font-bold rounded-lg text-sm shadow-md"
            >
              Access Platform
            </button>
          )}
        </div>
      )}
    </nav>
  );
}
