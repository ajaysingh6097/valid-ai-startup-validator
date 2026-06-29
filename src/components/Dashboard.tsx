import React, { useState, useEffect } from "react";
import { Project, ValidationReport } from "../types";
import { 
  Shield, 
  AlertTriangle, 
  ArrowUpRight, 
  Flame, 
  Compass, 
  TrendingUp, 
  Users, 
  DollarSign, 
  ChevronRight, 
  Loader2, 
  Sparkles,
  HelpCircle,
  FileText,
  Play
} from "lucide-react";

interface DashboardProps {
  project: Project;
  report: ValidationReport | null;
  onTriggerValidate: (simulate: boolean) => void;
}

export default function Dashboard({ project, report, onTriggerValidate }: DashboardProps) {
  const [loadingMsg, setLoadingMsg] = useState("Crawling competitor databases...");
  const [useSimulation, setUseSimulation] = useState(false);

  // Staggered loading messages to make the loading experience feel authentic and high-fidelity
  useEffect(() => {
    if (project.status === "Validating") {
      const messages = [
        "Initializing strategic multi-agent validator crawler...",
        "Scraping active database registries for regional competitor trends...",
        "Aggregating TAM/SAM/SOM market size indexes...",
        "Synthesizing customer persona behavioral pain points...",
        "Drafting execution SWOT and Q1-Q4 roadmap milestones...",
        "Compiling quantitative venture validation report..."
      ];
      
      let idx = 0;
      const interval = setInterval(() => {
        idx = (idx + 1) % messages.length;
        setLoadingMsg(messages[idx]);
      }, 3500);

      return () => clearInterval(interval);
    }
  }, [project.status]);

  // Loading Screen State
  if (project.status === "Validating") {
    return (
      <div className="max-w-4xl mx-auto py-20 px-4 text-center space-y-8 animate-fade-in" id="loading-screen">
        <div className="relative inline-block">
          <div className="w-20 h-20 rounded-full border-4 border-slate-800 border-t-indigo-500 animate-spin mx-auto"></div>
          <Sparkles className="w-6 h-6 text-indigo-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
        </div>
        
        <div className="space-y-3">
          <h3 className="font-display text-xl font-bold text-white tracking-tight">
            Synthesizing Strategic Intelligence
          </h3>
          <p className="text-sm text-slate-400 font-mono tracking-wide max-w-md mx-auto h-8 flex items-center justify-center">
            {loadingMsg}
          </p>
        </div>

        <div className="max-w-md mx-auto p-4 bg-slate-900/60 border border-slate-800 rounded-2xl text-left text-xs text-slate-400 leading-relaxed">
          <span className="font-bold text-white block mb-1">Analyzing: {project.name}</span>
          {project.description}
        </div>
      </div>
    );
  }

  // Blank state when report doesn't exist yet
  if (!report) {
    return (
      <div className="max-w-3xl mx-auto py-16 px-4" id="empty-report-screen">
        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-3xl p-8 sm:p-12 text-center shadow-2xl space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-indigo-600/10 blur-2xl pointer-events-none"></div>
          
          <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center text-indigo-400 mx-auto border border-slate-700 shadow-xl">
            <Sparkles className="w-7 h-7" />
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <h3 className="font-display text-xl font-bold text-white tracking-tight">
              Ready to Validate: {project.name}
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-medium">
              Venture metadata registered. Execute the multi-dimensional validation scanner to crawl competitors, extract user persona pain points, and generate SWOT matrices.
            </p>
          </div>

          {/* Simulate option check */}
          <div className="max-w-xs mx-auto p-3.5 bg-slate-950/40 border border-slate-850 rounded-xl flex items-center justify-between text-xs text-slate-300">
            <div className="flex flex-col text-left">
              <span className="font-bold text-white">Sandbox Mode</span>
              <span className="text-[10px] text-slate-500 font-medium">Bypasses Gemini API key request</span>
            </div>
            <input
              type="checkbox"
              checked={useSimulation}
              onChange={(e) => setUseSimulation(e.target.checked)}
              className="w-4 h-4 text-indigo-600 bg-slate-950 border-slate-800 rounded focus:ring-indigo-500 cursor-pointer"
            />
          </div>

          <button
            onClick={() => onTriggerValidate(useSimulation)}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold tracking-tight transition-all flex items-center justify-center gap-2 mx-auto cursor-pointer shadow-lg shadow-indigo-500/20"
            id="trigger-validate-button"
          >
            <Play className="w-3.5 h-3.5 fill-white text-white" />
            Execute AI Validation Blueprint
          </button>
        </div>
      </div>
    );
  }

  // Helper to resolve score colors
  const getScoreColor = (score: number) => {
    if (score >= 80) return { ring: "border-emerald-500", text: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", badge: "Validated" };
    if (score >= 50) return { ring: "border-amber-500", text: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20", badge: "Moderate Risk" };
    return { ring: "border-rose-500", text: "text-rose-400", bg: "bg-rose-500/10 border-rose-500/20", badge: "High Risk" };
  };

  const scoreStyle = getScoreColor(report.score);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in relative z-10" id="dashboard-tab-content">
      
      {/* Overview stats panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Validation Score Gauge Block */}
        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col justify-between items-center text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 rounded-full bg-indigo-500/5 blur-xl pointer-events-none"></div>
          
          <div className="w-full flex justify-between items-center border-b border-slate-800 pb-3 mb-4">
            <span className="text-xs font-bold text-slate-500 font-mono tracking-wider uppercase">Validation Index</span>
            <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full border font-bold ${scoreStyle.bg} ${scoreStyle.text}`}>
              {scoreStyle.badge}
            </span>
          </div>

          <div className="relative flex items-center justify-center my-4">
            {/* Circular Ring */}
            <div className={`w-36 h-36 rounded-full border-[10px] ${scoreStyle.ring} flex flex-col items-center justify-center shadow-lg`}>
              <span className="font-sans font-black text-4xl text-white leading-none">
                {report.score}
              </span>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1.5 font-mono">
                Venture score
              </span>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 font-medium leading-relaxed max-w-xs mt-3">
            Quantitative assessment of user demand density, competitor crowdedness index, and product margins feasibility.
          </p>
        </div>

        {/* Strategic CAC / LTV / TAM stats metrics */}
        <div className="lg:col-span-2 bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-4">
              <span className="text-xs font-bold text-slate-500 font-mono tracking-wider uppercase">Venture Financial Metrics</span>
              <DollarSign className="w-4 h-4 text-slate-500" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 my-2">
              <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">Market TAM SAM</span>
                <p className="text-xs font-semibold text-slate-300 mt-1.5 leading-relaxed">
                  {report.marketSizeSummary}
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-slate-950/40 border border-slate-850 rounded-xl">
                  <div>
                    <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest block">Acquisition (CAC)</span>
                    <span className="text-xs font-bold text-white mt-0.5 block">{report.businessModelDetailed.customerAcquisitionCost}</span>
                  </div>
                  <Users className="w-4 h-4 text-slate-500" />
                </div>

                <div className="flex justify-between items-center p-3 bg-slate-950/40 border border-slate-850 rounded-xl">
                  <div>
                    <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest block">Customer Value (LTV)</span>
                    <span className="text-xs font-bold text-white mt-0.5 block">{report.businessModelDetailed.lifetimeValue}</span>
                  </div>
                  <DollarSign className="w-4 h-4 text-slate-500" />
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-3.5 mt-4 flex justify-between items-center">
            <span className="text-[10px] font-bold text-slate-500 font-mono">ESTIMATED PAYBACK INTERVAL</span>
            <span className="text-[11px] font-bold text-indigo-400 font-mono">~ 3.5 MONTHS</span>
          </div>
        </div>
      </div>

      {/* SWOT Analysis Grid */}
      <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl" id="swot-analysis-panel">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-4 mb-6">
          <Shield className="w-5 h-5 text-slate-500" />
          <h3 className="font-display font-bold text-white text-base">
            SWOT Strategic Matrix
          </h3>
          <span className="text-[10px] text-slate-500 font-mono ml-auto uppercase tracking-wider font-semibold">Four Pillar Analysis</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Strengths */}
          <div className="p-5 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl space-y-3.5 hover:border-emerald-500/40 transition-all">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs font-display uppercase tracking-wider">
              <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
              Strengths (Internal)
            </div>
            <ul className="space-y-2.5">
              {report.swot.strengths.map((str, i) => (
                <li key={i} className="text-xs text-slate-300 leading-relaxed flex items-start gap-2 font-medium">
                  <span className="text-emerald-400 font-bold shrink-0 mt-0.5">•</span>
                  {str}
                </li>
              ))}
            </ul>
          </div>

          {/* Weaknesses */}
          <div className="p-5 bg-rose-500/5 border border-rose-500/20 rounded-2xl space-y-3.5 hover:border-rose-500/40 transition-all">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-xs font-display uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              Weaknesses (Internal)
            </div>
            <ul className="space-y-2.5">
              {report.swot.weaknesses.map((weak, i) => (
                <li key={i} className="text-xs text-slate-300 leading-relaxed flex items-start gap-2 font-medium">
                  <span className="text-rose-400 font-bold shrink-0 mt-0.5">•</span>
                  {weak}
                </li>
              ))}
            </ul>
          </div>

          {/* Opportunities */}
          <div className="p-5 bg-indigo-500/5 border border-indigo-500/20 rounded-2xl space-y-3.5 hover:border-indigo-500/40 transition-all">
            <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs font-display uppercase tracking-wider">
              <ArrowUpRight className="w-4 h-4 text-indigo-400 shrink-0" />
              Opportunities (External)
            </div>
            <ul className="space-y-2.5">
              {report.swot.opportunities.map((opp, i) => (
                <li key={i} className="text-xs text-slate-300 leading-relaxed flex items-start gap-2 font-medium">
                  <span className="text-indigo-400 font-bold shrink-0 mt-0.5">•</span>
                  {opp}
                </li>
              ))}
            </ul>
          </div>

          {/* Threats */}
          <div className="p-5 bg-amber-500/5 border border-amber-500/20 rounded-2xl space-y-3.5 hover:border-amber-500/40 transition-all">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs font-display uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              Threats (External)
            </div>
            <ul className="space-y-2.5">
              {report.swot.threats.map((thr, i) => (
                <li key={i} className="text-xs text-slate-300 leading-relaxed flex items-start gap-2 font-medium">
                  <span className="text-amber-400 font-bold shrink-0 mt-0.5">•</span>
                  {thr}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Target Audience User Persona Card & Business Model details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* User Persona Breakdown */}
        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden" id="persona-breakdown-card">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-4 mb-5">
            <Users className="w-5 h-5 text-slate-500" />
            <h3 className="font-display font-bold text-white text-sm sm:text-base">
              Target Audience Persona
            </h3>
          </div>

          <div className="flex flex-col sm:flex-row gap-5 items-start">
            <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-indigo-450 text-xl font-bold font-display shrink-0 shadow-lg">
              {report.targetAudienceDetailed.personaName.charAt(0)}
            </div>
            <div className="space-y-3.5">
              <div>
                <h4 className="text-xs font-bold text-white font-display uppercase tracking-wider">
                  {report.targetAudienceDetailed.personaName}
                </h4>
                <p className="text-[10px] text-slate-500 font-semibold font-mono mt-0.5">
                  {report.targetAudienceDetailed.demographics}
                </p>
              </div>

              <blockquote className="text-xs italic text-slate-400 border-l-2 border-indigo-500/30 pl-3 leading-relaxed">
                "{report.targetAudienceDetailed.personaBio}"
              </blockquote>

              <div className="space-y-1.5">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono">Core Pain Points</span>
                <ul className="space-y-1">
                  {report.targetAudienceDetailed.painPoints.map((pt, index) => (
                    <li key={index} className="text-xs text-slate-300 leading-relaxed flex items-start gap-1.5 font-medium">
                      <span className="text-rose-450 shrink-0 mt-0.5">✕</span>
                      {pt}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-1">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono">Buying Behavior</span>
                <p className="text-xs text-slate-300 leading-relaxed font-medium">
                  {report.targetAudienceDetailed.buyingBehavior}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Business Model Details Card */}
        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-3xl p-6 shadow-2xl" id="business-model-card">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-4 mb-5">
            <DollarSign className="w-5 h-5 text-slate-500" />
            <h3 className="font-display font-bold text-white text-sm sm:text-base">
              Business Model Blueprint
            </h3>
          </div>

          <div className="space-y-5">
            <div className="space-y-1.5">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono">Central Value Proposition</span>
              <p className="text-xs text-white font-semibold leading-relaxed">
                {report.businessModelDetailed.valueProposition}
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono block">Proposed Monetization Streams</span>
              <div className="space-y-2">
                {report.businessModelDetailed.revenueStreams.map((stream, idx) => (
                  <div key={idx} className="p-3 bg-slate-950/40 border border-slate-850 rounded-xl flex items-center justify-between text-xs text-slate-300 font-semibold">
                    <span className="max-w-[200px] truncate">{stream}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-1 bg-slate-950/40 p-3 border border-slate-850 rounded-xl">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono block">Pricing Policy</span>
              <p className="text-xs text-slate-400 leading-normal font-semibold">
                {report.businessModelDetailed.pricingStrategy}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
