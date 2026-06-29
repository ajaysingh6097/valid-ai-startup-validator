import { GoogleGenAI, Type } from "@google/genai";
import { ValidationReport } from "../src/types";

// Lazy-initialize Gemini client to prevent startup crashes if GEMINI_API_KEY is temporarily unset
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required. Please set it in your Settings > Secrets panel.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });
  }
  return aiClient;
}

export async function generateValidationReport(
  name: string,
  description: string,
  industry: string,
  targetAudience: string,
  businessModel: string
): Promise<Omit<ValidationReport, "id" | "projectId" | "createdAt">> {
  const ai = getAiClient();

  const prompt = `
    Conduct a highly rigorous, realistic, and brutally honest validation report for a startup concept.
    Be objective. If the idea is weak, give it a lower validation score and explain why. If it has high potential, reward it with a higher score and detail the execution strategy.

    Startup Concept:
    Name: ${name}
    Description: ${description}
    Industry: ${industry}
    Target Audience: ${targetAudience}
    Business Model Proposed: ${businessModel}

    Your validation must cover:
    1. Score (10 to 100): Quantitative validation score based on market size, competition, feasibility, and margins.
    2. Market Size Summary: A professional estimate of TAM/SAM/SOM or quantitative market interest.
    3. SWOT: Strengths, Weaknesses, Opportunities, and Threats (at least 3 items each).
    4. Target Audience Detailed: Create a high-fidelity user persona (Name, Demographics, Pain Points, Bio, Buying Behavior).
    5. Business Model Detailed: Detailed value proposition, multiple revenue streams, pricing strategy, estimated Customer Acquisition Cost (CAC), and Customer Lifetime Value (LTV).
    6. Competitors: Profile 2-3 real or highly realistic competitors, mapping their market share, strengths, weaknesses, and the startup's Unfair Advantage.
    7. Revenue Ideas: Recommend 2-3 additional high-potential monetization channels.
    8. Marketing Plan: Create a tactical go-to-market plan covering 3 key acquisition channels with costs and impact ratings.
    9. MVP Roadmap: Build a 3-phase lean execution path (Phase 1, Phase 2, Phase 3) detailing step names, durations, tasks, and statuses ("Pending" / "In Progress").
    10. Execution Milestones: Formulate a Q1 to Q4 strategic execution roadmap with 1 clear high-level objective and 3 key results per quarter, mapping to a relevant Lucide icon (e.g., "Flame", "TrendingUp", "Users", "Globe", "Award", "Briefcase", "Activity", "Layers").
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are Valid AI, the elite, quantitative Strategic Venture Validator. You produce brutally honest, data-rich validation analyses with zero fluff, using precise metrics and highly tactical guidance.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: [
            "score",
            "marketSizeSummary",
            "swot",
            "targetAudienceDetailed",
            "businessModelDetailed",
            "competitors",
            "revenueIdeas",
            "marketingPlan",
            "mvpRoadmap",
            "milestones"
          ],
          properties: {
            score: {
              type: Type.INTEGER,
              description: "A business score from 10 to 100 evaluating overall feasibility and success probability."
            },
            marketSizeSummary: {
              type: Type.STRING,
              description: "A summary estimating total addressable market (TAM), SAM, and market CAGR trends."
            },
            swot: {
              type: Type.OBJECT,
              required: ["strengths", "weaknesses", "opportunities", "threats"],
              properties: {
                strengths: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "List of internal, core structural strengths (at least 3)."
                },
                weaknesses: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "List of internal constraints and liabilities (at least 3)."
                },
                opportunities: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "List of external expansion options and growth trends (at least 3)."
                },
                threats: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "List of external threats, competitors, or regulations (at least 3)."
                }
              }
            },
            targetAudienceDetailed: {
              type: Type.OBJECT,
              required: ["personaName", "demographics", "painPoints", "personaBio", "buyingBehavior"],
              properties: {
                personaName: { type: Type.STRING, description: "Name of the target customer archetype." },
                demographics: { type: Type.STRING, description: "Age, income, location, tech stack, and occupation details." },
                painPoints: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "Specific frustrations or challenges they face (at least 3)."
                },
                personaBio: { type: Type.STRING, description: "A narrative explaining their motivation and background." },
                buyingBehavior: { type: Type.STRING, description: "How they buy, how much they spend, and what triggers a purchase." }
              }
            },
            businessModelDetailed: {
              type: Type.OBJECT,
              required: ["valueProposition", "revenueStreams", "pricingStrategy", "customerAcquisitionCost", "lifetimeValue"],
              properties: {
                valueProposition: { type: Type.STRING, description: "The central Unfair Value Proposition of the startup." },
                revenueStreams: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "List of multiple monetization strategies."
                },
                pricingStrategy: { type: Type.STRING, description: "Proposed pricing (subscriptions, one-offs, enterprise)." },
                customerAcquisitionCost: { type: Type.STRING, description: "Estimated customer acquisition cost (e.g. '$25.00 via SEO')." },
                lifetimeValue: { type: Type.STRING, description: "Estimated customer lifetime value (e.g. '$150.00 average')." }
              }
            },
            competitors: {
              type: Type.ARRAY,
              description: "Array of 2-3 key competitors",
              items: {
                type: Type.OBJECT,
                required: ["name", "marketShare", "strengths", "weaknesses", "advantage"],
                properties: {
                  name: { type: Type.STRING, description: "Competitor brand name." },
                  marketShare: { type: Type.STRING, description: "Estimated market share (e.g. '35%')." },
                  strengths: { type: Type.STRING, description: "What they do exceptionally well." },
                  weaknesses: { type: Type.STRING, description: "Where they fail or leave customers frustrated." },
                  advantage: { type: Type.STRING, description: "Your startup's unfair product or strategic advantage over them." }
                }
              }
            },
            revenueIdeas: {
              type: Type.ARRAY,
              description: "List of additional expansion revenue streams (at least 2)",
              items: {
                type: Type.OBJECT,
                required: ["source", "potential", "complexity", "strategy"],
                properties: {
                  source: { type: Type.STRING, description: "Name of the revenue stream source." },
                  potential: { type: Type.STRING, enum: ["High", "Medium", "Low"] },
                  complexity: { type: Type.STRING, enum: ["High", "Medium", "Low"] },
                  strategy: { type: Type.STRING, description: "Concrete, actionable description of how to launch it." }
                }
              }
            },
            marketingPlan: {
              type: Type.ARRAY,
              description: "List of marketing channels and strategies (at least 3)",
              items: {
                type: Type.OBJECT,
                required: ["channel", "strategy", "cost", "impact"],
                properties: {
                  channel: { type: Type.STRING, description: "Channel name (e.g. 'Organic Search SEO')." },
                  strategy: { type: Type.STRING, description: "Tactical campaign description." },
                  cost: { type: Type.STRING, description: "Estimated budget or cost (e.g. '$100/mo' or 'Organic')." },
                  impact: { type: Type.STRING, enum: ["High", "Medium", "Low"] }
                }
              }
            },
            mvpRoadmap: {
              type: Type.ARRAY,
              description: "A 3-phase lean path to build and release the MVP",
              items: {
                type: Type.OBJECT,
                required: ["step", "duration", "task", "status"],
                properties: {
                  step: { type: Type.STRING, description: "Phase name (e.g., 'Phase 1: Core Engine Prototype')." },
                  duration: { type: Type.STRING, description: "Estimated timeframe (e.g. 'Weeks 1-4')." },
                  task: { type: Type.STRING, description: "Detailed focus and primary build objective." },
                  status: { type: Type.STRING, enum: ["Pending", "In Progress", "Completed"] }
                }
              }
            },
            milestones: {
              type: Type.ARRAY,
              description: "Strategic execution milestones for Q1, Q2, Q3, and Q4",
              items: {
                type: Type.OBJECT,
                required: ["quarter", "objective", "keyResults", "icon"],
                properties: {
                  quarter: { type: Type.STRING, description: "Which quarter (e.g. 'Q1', 'Q2', 'Q3', 'Q4')." },
                  objective: { type: Type.STRING, description: "High-level goal for the quarter." },
                  keyResults: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "Specific quantitative metrics to hit (exactly 3)."
                  },
                  icon: { type: Type.STRING, description: "A Lucide React icon name suitable for the goal (e.g. 'Flame', 'TrendingUp', 'Users', 'Globe')." }
                }
              }
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("Received empty response from the validation AI model.");
    }

    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini validation report error:", error);
    throw error;
  }
}
