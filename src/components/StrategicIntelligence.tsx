import React from "react";
import { ValidationReport, Competitor, RevenueIdea, MarketingChannel } from "../types";
import { 
  Users, 
  DollarSign, 
  Compass, 
  TrendingUp, 
  Sparkles,
  ShieldAlert,
  HelpCircle,
  Lightbulb,
  ExternalLink
} from "lucide-react";

interface StrategicIntelligenceProps {
  report: ValidationReport;
}

export default function StrategicIntelligence({ report }: StrategicIntelligenceProps) {
  
  // Resolve badge colors for Potential/Complexity/Impact
  const getBadgeColor = (val: "High" | "Medium" | "Low") => {
    switch (val) {
      case "High":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "Medium":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "Low":
        return "bg-slate-850 text-slate-400 border-slate-750";
      default:
        return "bg-slate-900 text-slate-500 border-slate-800";
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 animate-fade-in relative z-10" id="strategic-intelligence-root">
      
      {/* Competitors Breakdown */}
      <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl" id="competitor-intelligence-section">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-4 mb-6">
          <Users className="w-5 h-5 text-slate-500" />
          <h3 className="font-display font-bold text-white text-base">
            Competitive Landscapes & Unfair Advantage
          </h3>
          <span className="text-[10px] text-slate-500 font-mono ml-auto uppercase tracking-wider font-semibold">CRAWL MODULE v1.2</span>
        </div>

        {/* Competitor list/table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse" id="competitors-table">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] text-slate-500 font-mono uppercase tracking-wider">
                <th className="py-3 px-4 font-bold">Brand / Competitor</th>
                <th className="py-3 px-4 font-bold">Market Share</th>
                <th className="py-3 px-4 font-bold">Key Strengths</th>
                <th className="py-3 px-4 font-bold">Primary Weakness</th>
                <th className="py-3 px-4 font-bold text-right">Our Unfair Advantage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850 text-xs">
              {report.competitors.map((comp, idx) => (
                <tr key={idx} className="hover:bg-slate-955/50 transition-colors">
                  {/* Name */}
                  <td className="py-4 px-4 font-bold text-white flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-slate-700"></span>
                    {comp.name}
                  </td>
                  
                  {/* Share */}
                  <td className="py-4 px-4 font-mono font-bold text-slate-400">
                    <div className="flex items-center gap-2">
                      <span className="min-w-[32px]">{comp.marketShare}</span>
                      <div className="w-16 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-indigo-500 h-full rounded-full" 
                          style={{ width: comp.marketShare.includes("%") ? comp.marketShare : "30%" }}
                        ></div>
                      </div>
                    </div>
                  </td>

                  {/* Strengths */}
                  <td className="py-4 px-4 text-slate-300 leading-relaxed font-semibold max-w-xs truncate" title={comp.strengths}>
                    {comp.strengths}
                  </td>

                  {/* Weaknesses */}
                  <td className="py-4 px-4 text-slate-300 leading-relaxed font-semibold max-w-xs truncate" title={comp.weaknesses}>
                    {comp.weaknesses}
                  </td>

                  {/* Unfair Advantage */}
                  <td className="py-4 px-4 font-bold text-indigo-400 text-right max-w-sm leading-normal">
                    {comp.advantage}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Grid: Additional Revenue Ideas (Left) & Go-To-Market Plan (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Additional Monetization channels */}
        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col justify-between" id="revenue-channels-section">
          <div>
            <div className="flex items-center gap-2 border-b border-slate-800 pb-4 mb-5">
              <Lightbulb className="w-5 h-5 text-slate-500" />
              <h3 className="font-display font-bold text-white text-sm sm:text-base">
                Monetization Expansion Strategies
              </h3>
            </div>

            <div className="space-y-4">
              {report.revenueIdeas.map((idea, idx) => (
                <div key={idx} className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-white font-display">
                      {idea.source}
                    </span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className={`text-[9px] font-semibold px-2 py-0.5 border rounded-full ${getBadgeColor(idea.potential)}`}>
                        Pot: {idea.potential}
                      </span>
                      <span className={`text-[9px] font-semibold px-2 py-0.5 border rounded-full ${getBadgeColor(idea.complexity)}`}>
                        Cpx: {idea.complexity}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                    {idea.strategy}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-800 pt-3.5 mt-5 text-center">
            <span className="text-[10px] text-slate-500 font-bold tracking-wider font-mono">ADVISORY NOTE: LAUNCH ADDITIONAL CHANNELS ONLY POST REVENUE-MATCH</span>
          </div>
        </div>

        {/* Go-To-Market Marketing Plan */}
        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-3xl p-6 shadow-2xl" id="marketing-plan-section">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-4 mb-5">
            <TrendingUp className="w-5 h-5 text-slate-500" />
            <h3 className="font-display font-bold text-white text-sm sm:text-base">
              Go-To-Market Plan (Acquisition Channels)
            </h3>
          </div>

          <div className="space-y-4">
            {report.marketingPlan.map((item, idx) => (
              <div key={idx} className="p-4 border border-slate-850/80 bg-slate-950/40 hover:border-slate-700/60 transition-all rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white font-display">
                    {item.channel}
                  </span>
                  <span className={`text-[9px] font-semibold px-2 py-0.5 border rounded-full ${getBadgeColor(item.impact)}`}>
                    Impact: {item.impact}
                  </span>
                </div>
                
                <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                  {item.strategy}
                </p>

                <div className="flex items-center justify-between text-[10px] font-mono border-t border-slate-850/60 pt-2 text-slate-500 font-bold uppercase">
                  <span>ESTIMATED BUDGET</span>
                  <span className="text-indigo-400 font-semibold">{item.cost}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
