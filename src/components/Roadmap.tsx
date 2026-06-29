import React from "react";
import { ValidationReport, MVPStep, RoadmapMilestone } from "../types";
import * as Icons from "lucide-react";
import { 
  Workflow, 
  Calendar, 
  Sparkles, 
  CheckSquare, 
  Square, 
  ChevronRight,
  TrendingUp
} from "lucide-react";

interface RoadmapProps {
  report: ValidationReport;
}

// Helper to dynamically look up Lucide icons by name
const DynamicIcon = ({ name, className }: { name: string; className?: string }) => {
  const IconComponent = (Icons as any)[name];
  if (!IconComponent) {
    return <Icons.Compass className={className} />;
  }
  return <IconComponent className={className} />;
};

export default function Roadmap({ report }: RoadmapProps) {
  
  // Custom status indicators for the MVP steps
  const getStatusBadge = (status: "Pending" | "In Progress" | "Completed") => {
    switch (status) {
      case "Completed":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "In Progress":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse";
      case "Pending":
      default:
        return "bg-slate-800 text-slate-400 border-slate-750";
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 animate-fade-in relative z-10" id="roadmap-root">
      
      {/* Q1 - Q4 Execution Milestones Grid */}
      <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl" id="quarters-milestones-timeline">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-4 mb-8">
          <Calendar className="w-5 h-5 text-slate-500" />
          <h3 className="font-display font-bold text-white text-base">
            Quarterly Execution Roadmap (Q1 - Q4)
          </h3>
          <span className="text-[10px] text-slate-500 font-mono ml-auto uppercase tracking-wider font-semibold">Twelve-Month Objective Scale</span>
        </div>

        {/* Timeline track */}
        <div className="relative border-l border-slate-800 pl-6 sm:pl-8 ml-4 space-y-12">
          {report.milestones.map((milestone, idx) => (
            <div key={idx} className="relative group">
               
              {/* Timeline bubble icon node */}
              <div className="absolute left-[-42px] sm:left-[-48px] top-0 w-8 h-8 rounded-xl bg-slate-950 text-white flex items-center justify-center border-4 border-slate-900 shadow-lg group-hover:bg-indigo-600 transition-colors">
                <DynamicIcon name={milestone.icon} className="w-3.5 h-3.5" />
              </div>

              <div className="bg-slate-950/20 hover:bg-slate-950/40 border border-slate-850 hover:border-slate-750 p-5 rounded-2xl shadow-inner transition-all duration-300">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:items-center mb-4">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-mono font-bold text-indigo-400 tracking-wider uppercase bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full">
                      Timeline Target // {milestone.quarter}
                    </span>
                    <h4 className="text-xs sm:text-sm font-bold text-white font-display mt-1">
                      {milestone.objective}
                    </h4>
                  </div>
                </div>

                {/* Key Results Checklist */}
                <div className="space-y-2.5">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono block">Quantitative Key Results</span>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {milestone.keyResults.map((kr, i) => (
                      <div key={i} className="flex items-start gap-2 p-2.5 bg-slate-950/40 border border-slate-850 rounded-xl text-xs text-slate-300 font-semibold leading-relaxed">
                        <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{kr}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MVP Development Roadmap Panel */}
      <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl" id="mvp-lean-roadmap-panel">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-4 mb-6">
          <Workflow className="w-5 h-5 text-slate-500" />
          <h3 className="font-display font-bold text-white text-base">
            Lean MVP Development Cycles
          </h3>
          <span className="text-[10px] text-slate-500 font-mono ml-auto uppercase tracking-wider font-semibold">Iterative Phase Planning</span>
        </div>

        <div className="space-y-4">
          {report.mvpRoadmap.map((step, idx) => (
            <div 
              key={idx}
              className="p-4 sm:p-5 bg-slate-950/20 hover:bg-slate-950/40 border border-slate-850 hover:border-slate-750 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all duration-200"
            >
              <div className="space-y-1 max-w-2xl">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="text-xs font-bold text-white font-display">
                    {step.step}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono font-bold flex items-center gap-1">
                    • {step.duration}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                  {step.task}
                </p>
              </div>

              <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border shrink-0 ${getStatusBadge(step.status)}`}>
                {step.status}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
