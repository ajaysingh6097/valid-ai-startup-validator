import React, { useState, useEffect } from "react";
import { User, Project, ValidationReport } from "./types";
import Navigation from "./components/Navigation";
import LandingPage from "./components/LandingPage";
import AuthScreen from "./components/AuthScreen";
import Workspace from "./components/Workspace";
import Dashboard from "./components/Dashboard";
import StrategicIntelligence from "./components/StrategicIntelligence";
import Roadmap from "./components/Roadmap";
import FounderProfile from "./components/FounderProfile";
import MediaGallery from "./components/MediaGallery";
import { 
  Compass, 
  Layers, 
  TrendingUp, 
  User as UserIcon, 
  Sparkles,
  Workflow,
  AlertCircle,
  TrendingDown,
  Activity,
  Award,
  BookOpen
} from "lucide-react";

export default function App() {
  // Session States
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem("valid_ai_token"));
  const [sessionLoading, setSessionLoading] = useState(true);

  // App Navigation Views
  const [currentView, setView] = useState<"landing" | "workspace" | "dashboard" | "profile" | "media">("landing");
  const [dashboardTab, setDashboardTab] = useState<"overview" | "intelligence" | "roadmap">("overview");

  // Core Data States
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedReport, setSelectedReport] = useState<ValidationReport | null>(null);
  
  const [generalError, setGeneralError] = useState<string | null>(null);

  // --- SESSION VERIFICATION ON MOUNT ---
  useEffect(() => {
    async function checkSession() {
      if (!token) {
        setSessionLoading(false);
        return;
      }

      try {
        const res = await fetch("/api/auth/me", {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          // If user exists, pull their projects list
          await fetchProjects(token);
        } else {
          // Token is stale or invalid, purge
          logout();
        }
      } catch (err) {
        console.error("Session restoration failed:", err);
      } finally {
        setSessionLoading(false);
      }
    }

    checkSession();
  }, [token]);

  // --- API HELPER: FETCH ALL USER PROJECTS ---
  const fetchProjects = async (authToken: string) => {
    try {
      const res = await fetch("/api/projects", {
        headers: { "Authorization": `Bearer ${authToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setProjects(data.projects);

        // Pre-select first project if none selected yet
        if (data.projects.length > 0 && !selectedProject) {
          const firstProj = data.projects[0];
          setSelectedProject(firstProj);
          await fetchReportForProject(firstProj.id, authToken);
        }
      }
    } catch (err) {
      console.error("Failed to fetch projects list:", err);
    }
  };

  // --- API HELPER: FETCH VALIDATION REPORT ---
  const fetchReportForProject = async (projectId: string, authToken: string) => {
    try {
      const res = await fetch(`/api/projects/${projectId}/report`, {
        headers: { "Authorization": `Bearer ${authToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedReport(data.report || null);
      }
    } catch (err) {
      console.error("Failed to fetch project report details:", err);
    }
  };

  // --- AUTH HANDLERS ---
  const handleAuthSuccess = (newToken: string, newUser: User) => {
    localStorage.setItem("valid_ai_token", newToken);
    setToken(newToken);
    setUser(newUser);
    setView("workspace");
    fetchProjects(newToken);
  };

  const logout = () => {
    localStorage.removeItem("valid_ai_token");
    setToken(null);
    setUser(null);
    setProjects([]);
    setSelectedProject(null);
    setSelectedReport(null);
    setView("landing");
  };

  const handleAvatarUpdate = (newAvatarUrl: string) => {
    if (user) {
      setUser({
        ...user,
        avatar: newAvatarUrl
      });
    }
  };

  // --- PROJECT CRUD HANDLERS ---
  const handleCreateProject = async (data: {
    name: string;
    description: string;
    industry: string;
    targetAudience: string;
    businessModel: string;
  }): Promise<Project> => {
    if (!token) throw new Error("Authentication session is required.");

    const res = await fetch("/api/projects", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });

    const body = await res.json();
    if (!res.ok) {
      throw new Error(body.error || "Failed to initialize new project workspace.");
    }

    // Refresh projects list
    await fetchProjects(token);
    return body.project;
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!token) return;
    
    const confirmDelete = window.confirm("Are you absolutely sure you want to delete this venture? All validation reports and roadmaps will be permanently erased.");
    if (!confirmDelete) return;

    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (res.ok) {
        // Clear active selection if deleted
        if (selectedProject?.id === projectId) {
          setSelectedProject(null);
          setSelectedReport(null);
          setDashboardTab("overview");
        }
        await fetchProjects(token);
      } else {
        const body = await res.json();
        alert(body.error || "Failed to delete project.");
      }
    } catch (err) {
      console.error("Error deleting project:", err);
    }
  };

  const handleSelectProject = async (project: Project) => {
    setSelectedProject(project);
    setSelectedReport(null); // clean slate loading state
    setDashboardTab("overview");
    if (token) {
      await fetchReportForProject(project.id, token);
    }
  };

  // --- PROFILE UPDATE HANDLER ---
  const handleUpdateProfile = async (updates: Partial<User>): Promise<User> => {
    if (!token) throw new Error("Authentication session is required.");

    const res = await fetch("/api/auth/profile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(updates)
    });

    const body = await res.json();
    if (!res.ok) {
      throw new Error(body.error || "Failed to compile profile parameters.");
    }

    setUser(body.user);
    return body.user;
  };

  // --- AI SCANNERS TRIGGER HANDLER ---
  const handleTriggerValidate = async (simulate: boolean) => {
    if (!selectedProject || !token) return;

    // Instantly set local status to Validating
    setSelectedProject({
      ...selectedProject,
      status: "Validating"
    });

    try {
      const res = await fetch(`/api/projects/${selectedProject.id}/validate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ simulate })
      });

      const body = await res.json();

      if (!res.ok) {
        // Reset status
        setSelectedProject({
          ...selectedProject,
          status: "Draft"
        });
        
        // Show clean descriptive alert
        alert(body.error || "Failed to generate validation report.");
        return;
      }

      // Success, pull reports
      setSelectedReport(body.report);
      setSelectedProject({
        ...selectedProject,
        status: body.report.score >= 50 ? "Validated" : "Failed"
      });

      // Update in projects listing
      setProjects(prev => prev.map(p => p.id === selectedProject.id ? {
        ...p,
        status: body.report.score >= 50 ? "Validated" : "Failed"
      } : p));

    } catch (err: any) {
      console.error("Validation scanner request failed:", err);
      setSelectedProject({
        ...selectedProject,
        status: "Draft"
      });
      alert("Failed to establish secure validation connection with the server.");
    }
  };

  // --- INTERACTIVE PLAYGROUND TRIGGER FROM LANDING ---
  const handleExploreDemoVenture = async () => {
    // We log the user in using sandbox helper
    setSessionLoading(true);
    const sandboxEmail = "sandbox.founder@valid.ai";
    const sandboxPassword = "founder_sandbox_123";
    const sandboxName = "Alex the Founder";

    try {
      // Login attempt
      let res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: sandboxEmail, password: sandboxPassword })
      });

      let data = await res.json();

      // If missing sandbox, register it first
      if (!res.ok) {
        res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: sandboxEmail, name: sandboxName, password: sandboxPassword })
        });
        data = await res.json();
      }

      if (res.ok) {
        localStorage.setItem("valid_ai_token", data.token);
        setToken(data.token);
        setUser(data.user);
        
        // Fetch projects list
        const projRes = await fetch("/api/projects", {
          headers: { "Authorization": `Bearer ${data.token}` }
        });
        if (projRes.ok) {
          const projData = await projRes.json();
          setProjects(projData.projects);
          
          // Force locate Project Alpha
          const alpha = projData.projects.find((p: Project) => p.name.includes("Project Alpha")) || projData.projects[0];
          if (alpha) {
            setSelectedProject(alpha);
            setView("dashboard");
            setDashboardTab("overview");
            await fetchReportForProject(alpha.id, data.token);
          } else {
            setView("workspace");
          }
        }
      }
    } catch (err) {
      console.error("Sandbox demo bootstrap failed:", err);
      alert("Demo playground is currently restoring. Please feel free to register a direct account instead!");
    } finally {
      setSessionLoading(false);
    }
  };

  // --- RENDER MAIN LAYOUT ---

  if (sessionLoading) {
    return (
      <div className="min-h-screen bg-[#020617] text-slate-200 flex flex-col items-center justify-center space-y-4" id="app-loading-screen">
        <div className="w-10 h-10 border-4 border-slate-800 border-t-indigo-500 rounded-full animate-spin"></div>
        <span className="text-xs text-slate-400 font-mono tracking-widest uppercase">Validating Session...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 flex flex-col relative overflow-hidden" id="app-mount">
      {/* Ambient decorative glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none"></div>
      
      {/* Top Header Navigation */}
      <Navigation
        currentView={currentView}
        setView={setView}
        user={user}
        logout={logout}
        selectedProject={selectedProject}
        projects={projects}
        selectProject={handleSelectProject}
      />

      {/* Main Core Router View Panel */}
      <main className="flex-1" id="main-content-panel">
        
        {currentView === "landing" && (
          <LandingPage
            onExploreDemo={handleExploreDemoVenture}
            onStartAnalysis={(initialIdea) => {
              if (user) {
                // Pre-fill workspace description
                setView("workspace");
              } else {
                setView("profile"); // triggers login/signup
              }
            }}
            userEmail={user?.email}
          />
        )}

        {/* Workspace 01 Inputs */}
        {currentView === "workspace" && (
          user ? (
            <Workspace
              projects={projects}
              onCreateProject={handleCreateProject}
              onSelectProject={handleSelectProject}
              onDeleteProject={handleDeleteProject}
            />
          ) : (
            <AuthScreen onAuthSuccess={handleAuthSuccess} />
          )
        )}

        {/* Validation Hub Overview (Multi-tab) */}
        {currentView === "dashboard" && (
          user ? (
            selectedProject ? (
              <div className="space-y-4" id="validation-hub-root">
                
                {/* Visual Venture Header Bar */}
                <div className="bg-slate-900/50 backdrop-blur-md border-b border-slate-800/60 py-5 sm:py-6 relative z-10" id="dashboard-sub-nav">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5">
                        <span className="text-[10px] font-mono tracking-wider text-indigo-400 font-bold uppercase">Active Blueprint</span>
                        <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full border leading-none font-bold ${
                          selectedProject.status === "Validated" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                          selectedProject.status === "Failed" ? "bg-rose-500/10 text-rose-400 border-rose-500/20" :
                          selectedProject.status === "Validating" ? "bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse" :
                          "bg-slate-800 text-slate-400 border-slate-700"
                        }`}>
                          {selectedProject.status}
                        </span>
                      </div>
                      <h2 className="font-display text-lg sm:text-xl font-black text-white tracking-tight">
                        {selectedProject.name}
                      </h2>
                      <p className="text-xs text-slate-400 leading-relaxed font-semibold max-w-xl">
                        {selectedProject.description}
                      </p>
                    </div>

                    {/* Report Specific actions */}
                    {selectedReport && selectedProject.status !== "Validating" && (
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleTriggerValidate(false)}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold tracking-tight transition-all flex items-center gap-1.5 shadow-lg shadow-indigo-500/15"
                          id="revalidate-button"
                        >
                          <Activity className="w-3.5 h-3.5 text-white" />
                          Re-Validate Venture
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Nested Tab bar anchors */}
                  {selectedReport && selectedProject.status !== "Validating" && (
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-5 flex border-t border-slate-800/60 pt-4 gap-2" id="nested-tab-anchors">
                      {[
                        { id: "overview", label: "Overview Blueprint", icon: Sparkles },
                        { id: "intelligence", label: "Competitive Intelligence", icon: Workflow },
                        { id: "roadmap", label: "Execution Roadmap", icon: TrendingUp }
                      ].map((tab) => {
                        const Icon = tab.icon;
                        const isActive = dashboardTab === tab.id;
                        return (
                          <button
                            key={tab.id}
                            onClick={() => setDashboardTab(tab.id as any)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold tracking-tight transition-all ${
                              isActive 
                                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" 
                                : "text-slate-400 hover:text-white hover:bg-slate-800/40"
                            }`}
                            id={`dashboard-subtab-${tab.id}`}
                          >
                            <Icon className="w-3.5 h-3.5" />
                            {tab.label}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Tab content Router */}
                <div id="dashboard-tab-content-router">
                  {dashboardTab === "overview" && (
                    <Dashboard 
                      project={selectedProject}
                      report={selectedReport}
                      onTriggerValidate={handleTriggerValidate}
                    />
                  )}

                  {dashboardTab === "intelligence" && selectedReport && (
                    <StrategicIntelligence report={selectedReport} />
                  )}

                  {dashboardTab === "roadmap" && selectedReport && (
                    <Roadmap report={selectedReport} />
                  )}
                </div>

              </div>
            ) : (
              <div className="py-25 text-center bg-slate-900/40 border border-slate-800/80 rounded-3xl p-8 max-w-2xl mx-auto my-12 relative overflow-hidden" id="no-selected-project-panel">
                <Workflow className="w-12 h-12 text-indigo-400/80 mx-auto mb-4" />
                <h3 className="font-display font-bold text-white text-base">Select a Venture Blueprint</h3>
                <p className="text-xs text-slate-400 mt-2 max-w-md mx-auto leading-relaxed">Open your builder Workspace to initialize a new venture draft or activate an existing analyzed blueprint to unlock quantitative risk profiling.</p>
                <button
                  onClick={() => setView("workspace")}
                  className="mt-6 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold tracking-tight shadow-lg shadow-indigo-500/15 transition-all inline-block cursor-pointer"
                >
                  Configure Workspaces
                </button>
              </div>
            )
          ) : (
            <AuthScreen onAuthSuccess={handleAuthSuccess} />
          )
        )}

        {/* Founder Profile Workspace */}
        {currentView === "profile" && (
          user ? (
            <FounderProfile
              user={user}
              projects={projects}
              onUpdateProfile={handleUpdateProfile}
              onLogout={logout}
            />
          ) : (
            <AuthScreen onAuthSuccess={handleAuthSuccess} />
          )
        )}

        {/* Media Hub View */}
        {currentView === "media" && (
          user ? (
            <MediaGallery
              token={token || ""}
              user={user}
              onAvatarUpdate={handleAvatarUpdate}
            />
          ) : (
            <AuthScreen onAuthSuccess={handleAuthSuccess} />
          )
        )}

      </main>

      {/* Standard structural footer */}
      <footer className="border-t border-slate-800 bg-slate-950/40 backdrop-blur-md py-6 relative z-10" id="app-footer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500 font-semibold font-mono tracking-wider">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>SYSTEM ACTIVE // ALL SYSTEMS OPERATIONAL</span>
          </div>
          <span>VALID AI © {new Date().getFullYear()} // PRECISION ANALYSIS PLATFORM</span>
        </div>
      </footer>

    </div>
  );
}
