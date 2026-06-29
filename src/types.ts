export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  businessRole?: string;
  subscriptionType: "Free" | "Growth Pro" | "Enterprise Elite";
  linkedinUrl?: string;
  websiteUrl?: string;
  bio?: string;
  createdAt: string;
}

// Model interface for user-uploaded images/media files
export interface UploadedImage {
  id: string;
  userId: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  caption?: string;
  uploadedAt: string;
}

export interface Project {
  id: string;
  userId: string;
  name: string;
  description: string;
  industry: string;
  targetAudience: string;
  businessModel: string;
  status: "Draft" | "Validating" | "Validated" | "Failed";
  createdAt: string;
}

export interface SWOT {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

export interface TargetAudienceDetailed {
  personaName: string;
  demographics: string;
  painPoints: string[];
  personaBio: string;
  buyingBehavior: string;
}

export interface BusinessModelDetailed {
  valueProposition: string;
  revenueStreams: string[];
  pricingStrategy: string;
  customerAcquisitionCost: string;
  lifetimeValue: string;
}

export interface Competitor {
  name: string;
  marketShare: string;
  strengths: string;
  weaknesses: string;
  advantage: string; // valid AI's unfair advantage over them
}

export interface RevenueIdea {
  source: string;
  potential: "High" | "Medium" | "Low";
  complexity: "High" | "Medium" | "Low";
  strategy: string;
}

export interface MarketingChannel {
  channel: string;
  strategy: string;
  cost: string;
  impact: "High" | "Medium" | "Low";
}

export interface MVPStep {
  step: string;
  duration: string;
  task: string;
  status: "Pending" | "In Progress" | "Completed";
}

export interface RoadmapMilestone {
  quarter: string; // "Q1", "Q2", "Q3", "Q4"
  objective: string;
  keyResults: string[];
  icon: string; // Lucide icon name
}

export interface ValidationReport {
  id: string;
  projectId: string;
  score: number; // 0 to 100
  marketSizeSummary: string; // Market size or TAM/SAM/SOM summary
  swot: SWOT;
  targetAudienceDetailed: TargetAudienceDetailed;
  businessModelDetailed: BusinessModelDetailed;
  competitors: Competitor[];
  revenueIdeas: RevenueIdea[];
  marketingPlan: MarketingChannel[];
  mvpRoadmap: MVPStep[];
  milestones: RoadmapMilestone[];
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
