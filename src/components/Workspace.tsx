import React, { useState } from "react";
import { Project } from "../types";
import { 
  Layers, 
  Sparkles, 
  HelpCircle, 
  PlusCircle, 
  Trash2, 
  ArrowRight, 
  Briefcase,
  ExternalLink,
  Loader2,
  Workflow
} from "lucide-react";

interface WorkspaceProps {
  projects: Project[];
  onCreateProject: (data: {
    name: string;
    description: string;
    industry: string;
    targetAudience: string;
    businessModel: string;
  }) => Promise<Project>;
  onSelectProject: (project: Project) => void;
  onDeleteProject: (projectId: string) => void;
}

export default function Workspace({ 
  projects, 
  onCreateProject, 
  onSelectProject, 
  onDeleteProject 
}: WorkspaceProps) {
  // Form states
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [industry, setIndustry] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [businessModel, setBusinessModel] = useState("SaaS Subscription");
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const project = await onCreateProject({
        name,
        description,
        industry,
        targetAudience,
        businessModel
      });

      // Reset form
      setName("");
      setDescription("");
      setIndustry("");
      setTargetAudience("");
      setBusinessModel("SaaS Subscription");
      
      // Select the project to trigger dashboard
      onSelectProject(project);
    } catch (err: any) {
      setError(err.message || "Failed to register project details.");
    } finally {
      setSubmitting(false);
    }
  };

  const industrySuggestions = [
    "AI SaaS", "Fintech", "Green Energy IoT", "Creator Economy", "HealthTech", "PropTech", "E-commerce"
  ];

  const businessModelOptions = [
    "SaaS Subscription",
    "Transactional / Commission",
    "Hardware + SaaS Cloud",
    "Direct Product Sales (E-commerce)",
    "Ad-supported Free Tier",
    "Enterprise Licensing"
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10" id="workspace-root">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Left 2 Columns: Idea Input Workspace */}
        <div className="lg:col-span-2 space-y-8" id="idea-input-workspace">
          <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl relative">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-5 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-800 text-white border border-slate-700 rounded-xl flex items-center justify-center">
                  <Layers className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h2 className="font-display text-xl font-bold text-white tracking-tight">
                    Workspace 01
                  </h2>
                  <p className="text-xs text-slate-400 font-mono mt-0.5 uppercase tracking-wider">
                    Idea Input Workspace
                  </p>
                </div>
              </div>
              <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-300 text-[10px] font-mono font-bold tracking-wider border border-indigo-500/20">
                <Sparkles className="w-3 h-3 text-indigo-400" />
                Venture Intel
              </div>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium rounded-xl">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6" id="venture-input-form">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                {/* Venture Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    Venture Name
                    <HelpCircle className="w-3 h-3 text-slate-500" title="What is the temporary or actual name of your startup?" />
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={60}
                    placeholder="e.g. Project Alpha"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-800 rounded-xl text-xs bg-slate-950/60 focus:bg-slate-950/85 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-white font-medium placeholder:text-slate-600"
                    id="venture-name-input"
                  />
                </div>

                {/* Industry / Sector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    Industry / Sector
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Fintech / SaaS"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-800 rounded-xl text-xs bg-slate-950/60 focus:bg-slate-950/85 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-white font-medium placeholder:text-slate-600"
                    id="venture-industry-input"
                  />
                  {/* Suggestions */}
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {industrySuggestions.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setIndustry(item)}
                        className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700/80 border border-slate-700/40 rounded text-[9px] font-medium text-slate-300 hover:text-white transition-all cursor-pointer"
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Core Concept / Idea Value Proposition
                  </label>
                  <span className="text-[10px] font-mono text-slate-500 font-semibold">
                    {description.length}/400 chars
                  </span>
                </div>
                <textarea
                  required
                  rows={4}
                  maxLength={400}
                  placeholder="Explain exactly what your product does, who uses it, how the underlying technology operates, and what the key value driver is."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-800 rounded-xl text-xs bg-slate-950/60 focus:bg-slate-950/85 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-white leading-relaxed font-medium placeholder:text-slate-600"
                  id="venture-description-input"
                />
                <p className="text-[10px] text-slate-400 leading-normal font-medium italic">
                  Tip: Be descriptive of how the technology operates so the validator models can retrieve highly accurate competitive search indexes.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                {/* Target Audience */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Expected Customer Segment
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Early-stage founders, product managers"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-800 rounded-xl text-xs bg-slate-950/60 focus:bg-slate-950/85 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-white font-medium placeholder:text-slate-600"
                    id="venture-audience-input"
                  />
                </div>

                {/* Proposed Revenue Model */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Proposed Revenue Model
                  </label>
                  <select
                    value={businessModel}
                    onChange={(e) => setBusinessModel(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-800 rounded-xl text-xs bg-slate-950/60 focus:bg-slate-950/85 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-white font-medium"
                    id="venture-model-selector"
                  >
                    {businessModelOptions.map((opt) => (
                      <option key={opt} value={opt} className="bg-slate-900 text-white">{opt}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-850 text-white rounded-xl text-xs font-bold tracking-tight transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-500/25"
                id="venture-submit-button"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    Registering Venture Structure...
                  </>
                ) : (
                  <>
                    <PlusCircle className="w-4 h-4 text-white" />
                    Initialize Venture Analysis
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right 1 Column: Linked Projects Manager */}
        <div className="space-y-6" id="projects-list-sidebar">
          <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-3xl p-6 shadow-2xl relative">
            
            <div className="flex items-center gap-2 border-b border-slate-800 pb-4 mb-4">
              <Briefcase className="w-4 h-4 text-slate-400" />
              <h3 className="font-display font-bold text-white text-sm">
                Linked Ventures
              </h3>
              <span className="ml-auto font-mono text-[10px] bg-slate-800 text-slate-400 border border-slate-700 font-bold px-2 py-0.5 rounded-full">
                {projects.length}
              </span>
            </div>

            {projects.length === 0 ? (
              <div className="py-12 text-center" id="empty-projects-panel">
                <Workflow className="w-8 h-8 text-slate-600 mx-auto mb-3" />
                <p className="text-xs font-semibold text-slate-400">No registered ventures yet.</p>
                <p className="text-[10px] text-slate-500 mt-1">Submit your first idea on the left workspace to begin.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1" id="projects-container">
                {projects.map((project) => (
                  <div 
                    key={project.id}
                    className="p-4 bg-slate-950/40 hover:bg-slate-950/70 border border-slate-850 rounded-2xl flex flex-col justify-between group transition-all duration-200"
                  >
                    <div>
                      <div className="flex items-start justify-between">
                        <h4 
                          onClick={() => onSelectProject(project)}
                          className="text-xs font-bold text-white cursor-pointer hover:text-indigo-400 truncate max-w-[140px]"
                        >
                          {project.name}
                        </h4>
                        <span className={`text-[9px] px-2 py-0.5 rounded-full leading-none border font-semibold ${
                          project.status === "Validated"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : project.status === "Failed"
                            ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                            : project.status === "Validating"
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse"
                            : "bg-slate-800 text-slate-400 border-slate-700"
                        }`}>
                          {project.status}
                        </span>
                      </div>
                      
                      <p className="text-[10px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {project.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-800/60 mt-3.5 pt-2.5">
                      <span className="text-[9px] text-slate-500 font-mono">
                        {new Date(project.createdAt).toLocaleDateString()}
                      </span>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onDeleteProject(project.id)}
                          className="p-1 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-md transition-colors cursor-pointer"
                          title="Delete Venture"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onSelectProject(project)}
                          className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 border border-slate-700 hover:border-slate-600 text-slate-200 hover:text-white rounded-lg text-[10px] font-bold tracking-tight transition-all cursor-pointer"
                        >
                          Open Hub
                          <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
