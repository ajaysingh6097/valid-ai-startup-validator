import React, { useState } from "react";
import { 
  ArrowRight, 
  CheckCircle2, 
  Compass, 
  Flame, 
  Layers, 
  ShieldCheck, 
  Sparkles, 
  TrendingUp, 
  Workflow 
} from "lucide-react";
import ConstellationBackground from "./ConstellationBackground";

interface LandingPageProps {
  onExploreDemo: () => void;
  onStartAnalysis: (initialIdea: string) => void;
  userEmail: string | undefined;
}

export default function LandingPage({ onExploreDemo, onStartAnalysis, userEmail }: LandingPageProps) {
  const [ideaText, setIdeaText] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (ideaText.trim()) {
      onStartAnalysis(ideaText);
    }
  };

  const benefits = [
    {
      title: "Real-time Grounding",
      description: "Checks live database indexes and search signals for current, accurate competitor intelligence.",
      icon: Compass
    },
    {
      title: "Quantitative Scoring",
      description: "Assesses viability using a specialized algorithm scoring from 10 to 100 on market fit.",
      icon: ShieldCheck
    },
    {
      title: "Tactical Timelines",
      description: "Automatically translates abstract concepts into Q1-Q4 roadmaps and actionable MVP milestones.",
      icon: Workflow
    }
  ];

  const samples = [
    "An on-demand smart watering sensor for vertical organic farming.",
    "A subscription box for organic compost tea blends.",
    "B2B marketplace for reclaimed vintage timber."
  ];

  return (
    <div className="relative overflow-hidden bg-[#020617]" id="landing-page-root">
      {/* Background Animated Constellation Network */}
      <ConstellationBackground />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 sm:pt-24 sm:pb-28 border-b border-slate-800/60" id="hero-section">
        {/* Subtle blur highlights */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none overflow-hidden opacity-45">
          <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] rounded-full bg-indigo-600/10 blur-[120px]"></div>
          <div className="absolute top-[20%] right-[10%] w-[400px] h-[400px] rounded-full bg-cyan-500/10 blur-[120px]"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            {/* Top Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/50 border border-slate-700 text-slate-300 text-[11px] font-mono tracking-widest uppercase mb-6 shadow-sm">
              <Sparkles className="w-3 h-3 text-indigo-400" />
              Valid AI Precision v2.0
            </div>

            {/* Title */}
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-[1.1] mb-6 italic">
              Turn Your Vision into a <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 font-sans font-black uppercase tracking-tight not-italic">
                Validated Venture
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed mb-10 font-medium">
              Stop guessing. Subject your business ideas to high-fidelity, quantitative data modeling. Automatically generate competitor analysis, SWOT grids, go-to-market strategies, and execution roadmaps in 60 seconds.
            </p>

            {/* Prompt Bar Input */}
            <div className="max-w-2xl mx-auto mb-6 bg-slate-900/60 border border-slate-800 p-2.5 rounded-2xl shadow-2xl focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all">
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  placeholder="Describe your startup concept (e.g., An IoT energy tracking sensor...)"
                  value={ideaText}
                  onChange={(e) => setIdeaText(e.target.value)}
                  className="flex-1 px-4 py-3 text-sm text-white focus:outline-none placeholder:text-slate-500 bg-transparent min-w-0 font-medium"
                  required
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold tracking-tight transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-500/20"
                >
                  Analyze Idea
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>

            {/* Quick Samples */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
              <span className="text-xs text-slate-400 font-medium">Try these concepts:</span>
              {samples.map((sample, idx) => (
                <button
                  key={idx}
                  onClick={() => setIdeaText(sample)}
                  className="px-3 py-1.5 bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-lg text-xs text-slate-300 hover:text-white transition-all font-medium shadow-xs cursor-pointer"
                >
                  {sample}
                </button>
              ))}
            </div>

            {/* Primary Sandbox Trigger */}
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 border-t border-slate-800/60 pt-8">
              <button
                onClick={onExploreDemo}
                className="px-6 py-3 bg-slate-900 border border-slate-800 hover:border-slate-750 text-slate-200 hover:text-white rounded-xl text-xs font-semibold tracking-tight shadow-xs transition-all flex items-center gap-2 group"
                id="explore-demo-button"
              >
                <Flame className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
                Explore Demo Workspace (Project Alpha)
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Benefits Grid */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10" id="benefits-section">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs text-indigo-400 font-mono tracking-widest uppercase font-bold">
            The Analytical Edge
          </span>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight mt-2">
            Why founders validate with Valid AI
          </h2>
          <p className="text-sm sm:text-base text-slate-400 mt-3 leading-relaxed font-medium">
            Statistically, 90% of startups fail, primarily due to building products nobody wants. Valid AI strips away emotional biases, offering data-rich strategic intelligence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {benefits.map((benefit, idx) => {
            const Icon = benefit.icon;
            return (
              <div 
                key={idx} 
                className="bg-slate-900/50 backdrop-blur-md p-8 rounded-2xl border border-slate-800 shadow-2xl hover:border-slate-700 transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-xl bg-slate-800 text-indigo-400 flex items-center justify-center mb-6 group-hover:bg-indigo-600/20 group-hover:text-indigo-300 transition-colors">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-display text-lg font-bold text-white mb-3">
                  {benefit.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-medium">
                  {benefit.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Visual Workspace Mockup Blueprint */}
      <section className="py-16 bg-slate-950/40 border-y border-slate-800/80 relative z-10" id="blueprint-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs text-indigo-400 font-mono tracking-widest uppercase font-bold">
                Workspace Mockup
              </span>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight mt-2 mb-6">
                Interactive Strategic Intelligence at Your Fingertips
              </h2>
              <p className="text-sm text-slate-400 mb-6 leading-relaxed font-medium">
                Unlock structured modules that detail every facet of your proposed business strategy. View real-time competitor SWOT reports, analyze customer purchasing behavior, and map complex execution strategies.
              </p>

              <div className="space-y-4">
                {[
                  "Interactive SWOT matrices with threat classifications.",
                  "Competitive landscape mapping showing structural gaps.",
                  "Q1 - Q4 roadmap broken down into specific key results."
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-300 font-medium">{item}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={onExploreDemo}
                className="mt-8 px-5 py-2.5 bg-white text-slate-950 hover:bg-slate-200 rounded-xl text-xs font-bold tracking-tight shadow-xl shadow-white/5 transition-all flex items-center gap-2 cursor-pointer"
              >
                Launch Demo Preview
                <ArrowRight className="w-4 h-4 text-slate-950" />
              </button>
            </div>

            <div className="relative">
              {/* Isometric layered UI card graphic */}
              <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 shadow-2xl relative overflow-hidden">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400/80"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-400/80"></div>
                    <div className="w-3 h-3 rounded-full bg-emerald-400/80"></div>
                  </div>
                  <span className="text-[10px] font-mono tracking-wider text-slate-500">Blueprints // Project Alpha</span>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-850 shadow-md">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-slate-200">SWOT Matrix</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono">Module 01</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400">
                      <div className="border border-slate-800/60 bg-slate-900/50 p-2 rounded">Strengths: Real-time API tracking</div>
                      <div className="border border-slate-800/60 bg-slate-900/50 p-2 rounded">Weaknesses: API cost overhead</div>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-850 shadow-md opacity-85">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-slate-200">Competitive Landscapes</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">Module 02</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full w-[84%]"></div>
                    </div>
                    <div className="flex justify-between text-[9px] text-slate-500 mt-1">
                      <span>Unfair Advantage</span>
                      <span>84% Feasibility Score</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
