import fs from "fs/promises";
import path from "path";
import bcrypt from "bcryptjs";
import { User, Project, ValidationReport, UploadedImage } from "../src/types";

const DB_FILE = path.join(process.cwd(), "data.json");

interface DatabaseSchema {
  users: Record<string, User & { passwordHash: string }>;
  projects: Record<string, Project>;
  reports: Record<string, ValidationReport>;
  images: Record<string, UploadedImage>;
}

const DEFAULT_DB_STATE: DatabaseSchema = {
  users: {},
  projects: {},
  reports: {},
  images: {}
};

// Helper to ensure database is loaded/initialized
async function readDB(): Promise<DatabaseSchema> {
  try {
    const content = await fs.readFile(DB_FILE, "utf-8");
    return JSON.parse(content);
  } catch (error) {
    // If file doesn't exist, create it with default data
    await fs.writeFile(DB_FILE, JSON.stringify(DEFAULT_DB_STATE, null, 2));
    return DEFAULT_DB_STATE;
  }
}

async function writeDB(db: DatabaseSchema): Promise<void> {
  await fs.writeFile(DB_FILE, JSON.stringify(db, null, 2));
}

export const dbService = {
  // --- USER API ---
  async getUserByEmail(email: string) {
    const db = await readDB();
    const normalizedEmail = email.toLowerCase().trim();
    return Object.values(db.users).find((u) => u.email.toLowerCase() === normalizedEmail) || null;
  },

  async getUserById(id: string) {
    const db = await readDB();
    return db.users[id] || null;
  },

  async createUser(email: string, name: string, passwordPlain: string) {
    const db = await readDB();
    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const exists = Object.values(db.users).some((u) => u.email.toLowerCase() === normalizedEmail);
    if (exists) {
      throw new Error("User with this email already exists.");
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(passwordPlain, salt);
    const id = "user_" + Math.random().toString(36).substring(2, 11);

    const newUser: User = {
      id,
      email: normalizedEmail,
      name,
      subscriptionType: "Free",
      createdAt: new Date().toISOString()
    };

    db.users[id] = {
      ...newUser,
      passwordHash
    };

    await writeDB(db);

    // Let's pre-seed a couple of beautiful projects for this new user so they have standard starting dashboards!
    await this.seedDemoProjects(id);

    return newUser;
  },

  async updateUser(id: string, updates: Partial<User>) {
    const db = await readDB();
    if (!db.users[id]) {
      throw new Error("User not found.");
    }

    const { passwordHash, ...safeUser } = db.users[id];
    const updatedUser = {
      ...safeUser,
      ...updates,
      id // prevent ID overwrite
    };

    db.users[id] = {
      ...updatedUser,
      passwordHash
    };

    await writeDB(db);
    return updatedUser;
  },

  async verifyPassword(email: string, passwordPlain: string) {
    const db = await readDB();
    const normalizedEmail = email.toLowerCase().trim();
    const userWithHash = Object.values(db.users).find((u) => u.email.toLowerCase() === normalizedEmail);
    if (!userWithHash) return null;

    const isMatch = await bcrypt.compare(passwordPlain, userWithHash.passwordHash);
    if (!isMatch) return null;

    const { passwordHash, ...user } = userWithHash;
    return user;
  },

  // --- PROJECT API ---
  async listProjects(userId: string): Promise<Project[]> {
    const db = await readDB();
    return Object.values(db.projects).filter((p) => p.userId === userId);
  },

  async getProject(projectId: string): Promise<Project | null> {
    const db = await readDB();
    return db.projects[projectId] || null;
  },

  async createProject(userId: string, data: Omit<Project, "id" | "userId" | "createdAt" | "status">): Promise<Project> {
    const db = await readDB();
    const id = "proj_" + Math.random().toString(36).substring(2, 11);

    const newProject: Project = {
      id,
      userId,
      name: data.name,
      description: data.description,
      industry: data.industry,
      targetAudience: data.targetAudience,
      businessModel: data.businessModel,
      status: "Draft",
      createdAt: new Date().toISOString()
    };

    db.projects[id] = newProject;
    await writeDB(db);
    return newProject;
  },

  async updateProject(projectId: string, updates: Partial<Project>): Promise<Project> {
    const db = await readDB();
    if (!db.projects[projectId]) {
      throw new Error("Project not found.");
    }

    const updatedProject = {
      ...db.projects[projectId],
      ...updates
    };

    db.projects[projectId] = updatedProject;
    await writeDB(db);
    return updatedProject;
  },

  async deleteProject(projectId: string): Promise<void> {
    const db = await readDB();
    delete db.projects[projectId];
    delete db.reports[projectId]; // clean up report too
    await writeDB(db);
  },

  // --- VALIDATION REPORT API ---
  async getReport(projectId: string): Promise<ValidationReport | null> {
    const db = await readDB();
    return db.reports[projectId] || null;
  },

  async saveReport(projectId: string, report: Omit<ValidationReport, "id" | "projectId" | "createdAt">): Promise<ValidationReport> {
    const db = await readDB();
    const id = "rep_" + Math.random().toString(36).substring(2, 11);

    const newReport: ValidationReport = {
      ...report,
      id,
      projectId,
      createdAt: new Date().toISOString()
    };

    db.reports[projectId] = newReport;

    // Auto-advance project status to "Validated" or "Failed" based on the validation score
    if (db.projects[projectId]) {
      db.projects[projectId].status = report.score >= 50 ? "Validated" : "Failed";
    }

    await writeDB(db);
    return newReport;
  },

  // --- IMAGES API ---
  async listImages(userId: string): Promise<UploadedImage[]> {
    const db = await readDB();
    if (!db.images) db.images = {};
    return Object.values(db.images).filter((img) => img.userId === userId);
  },

  async getImage(imageId: string): Promise<UploadedImage | null> {
    const db = await readDB();
    if (!db.images) db.images = {};
    return db.images[imageId] || null;
  },

  async createImage(userId: string, imageData: Omit<UploadedImage, "id" | "userId" | "uploadedAt">): Promise<UploadedImage> {
    const db = await readDB();
    if (!db.images) db.images = {};
    const id = "img_" + Math.random().toString(36).substring(2, 11);

    const newImage: UploadedImage = {
      id,
      userId,
      filename: imageData.filename,
      originalName: imageData.originalName,
      mimeType: imageData.mimeType,
      size: imageData.size,
      url: imageData.url,
      caption: imageData.caption || "",
      uploadedAt: new Date().toISOString()
    };

    db.images[id] = newImage;
    await writeDB(db);
    return newImage;
  },

  async updateImage(imageId: string, updates: Partial<UploadedImage>): Promise<UploadedImage> {
    const db = await readDB();
    if (!db.images) db.images = {};
    if (!db.images[imageId]) {
      throw new Error("Image not found.");
    }

    const updated = {
      ...db.images[imageId],
      ...updates
    };

    db.images[imageId] = updated;
    await writeDB(db);
    return updated;
  },

  async deleteImage(imageId: string): Promise<void> {
    const db = await readDB();
    if (!db.images) db.images = {};
    delete db.images[imageId];
    await writeDB(db);
  },

  // --- SEEDING METHOD ---
  async seedDemoProjects(userId: string) {
    const db = await readDB();

    const proj1Id = "proj_alpha_" + userId.substring(5);
    const proj2Id = "proj_beta_" + userId.substring(5);

    // Seed Demo Project 1: Project Alpha (SaaS Platform)
    const projectAlpha: Project = {
      id: proj1Id,
      userId,
      name: "Project Alpha",
      description: "An AI-powered co-pilot for startup founders that automates continuous market validation, competitor tracking, and quantitative risk scoring.",
      industry: "Enterprise SaaS / Business Intelligence",
      targetAudience: "First-time founders, product managers, and early-stage venture studios.",
      businessModel: "SaaS Subscription ($49/mo - $199/mo premium tier)",
      status: "Validated",
      createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString() // 3 days ago
    };

    const reportAlpha: ValidationReport = {
      id: "rep_alpha_" + userId.substring(5),
      projectId: proj1Id,
      score: 84,
      marketSizeSummary: "Estimated TAM is $12.4B, with a target SAM of $850M in the US early-stage startup landscape, growing at 14.2% CAGR.",
      swot: {
        strengths: [
          "Proprietary real-time competitor tracking algorithm.",
          "High density of actionable recommendations vs. legacy static reports.",
          "Self-serve, instant deployment with minimal barrier to entry."
        ],
        weaknesses: [
          "High initial cost of crawling/scraping custom data endpoints.",
          "User churn might spike once founders complete their initial validation phase.",
          "Dependence on large language model pricing stability."
        ],
        opportunities: [
          "Form strategic partnerships with global startup incubators and accelerators.",
          "Expand validation reports into a 'Pitch Deck Builder' and investor-matching suite.",
          "Upsell premium deep-dives or human-in-the-loop validation advisory."
        ],
        threats: [
          "Rapid replication of the core dashboard by established tools (e.g. HubSpot, Crunchbase).",
          "Potential changes in LinkedIn or Google scraping/API access regulations.",
          "Decline in startup formation rates due to high-interest macroeconomic indicators."
        ]
      },
      targetAudienceDetailed: {
        personaName: "Alex the Ambitious Founder",
        demographics: "Aged 24-38, tech-savvy, based in tier-1/2 startup hubs. Often works a full-time job while building on weekends.",
        painPoints: [
          "Overwhelmed by static advice and lack of objective validation methodology.",
          "Wasting weeks of engineering hours building things nobody actually wants.",
          "Struggling to articulate clear differentiation to angel investors."
        ],
        personaBio: "Alex has two failed side projects. He is determined to validate his third startup idea rigorously before writing a single line of React code. He has limited capital but is willing to pay for tools that save him months of wasted time.",
        buyingBehavior: "Relies on Hacker News, Product Hunt, and peer recommendations. Highly motivated by efficiency and speed."
      },
      businessModelDetailed: {
        valueProposition: "Transform ambiguous business plans into high-fidelity, quantitative, data-driven execution roadmaps within 60 seconds.",
        revenueStreams: [
          "Growth Pro Plan: $49/month for unlimited validation workspace & real-time competitor tracking.",
          "Enterprise Elite Plan: $199/month for collaborative workspaces, CSV exports, and API access.",
          "Single validation report unlock: $19 one-time purchase."
        ],
        pricingStrategy: "Value-based subscription pricing designed to be an absolute no-brainer compared to spending $5,000+ on mockups or custom agency consulting.",
        customerAcquisitionCost: "$35.00 via targeted content marketing & organic founder communities.",
        lifetimeValue: "$294.00 (average subscriber stays for 6 months)."
      },
      competitors: [
        {
          name: "Static PDF Agencies",
          marketShare: "45%",
          strengths: "High-touch human curation, customized insights, perceived brand authority.",
          weaknesses: "Extremely expensive ($3k-$10k), takes 2-4 weeks, static files get outdated instantly.",
          advantage: "Real-time updates, instantaneous delivery, and a fraction of the price."
        },
        {
          name: "Crunchbase/Pitchbook",
          marketShare: "30%",
          strengths: "Massive institutional database, rich investor logs, trusted tracking indicators.",
          weaknesses: "Extremely complex interface, targeted strictly at VC firms, no actionable guidance.",
          advantage: "Valid AI is built specifically to guide early founders with action-focused steps, not just raw database searching."
        },
        {
          name: "Standard AI Chatbots",
          marketShare: "25%",
          strengths: "Free, conversational, handles generalized queries easily.",
          weaknesses: "High hallucination rates, lack of structural marketing, financial, and roadmap methodologies.",
          advantage: "Curated multi-screen intelligence workspace with quantitative risk metrics and actual real-time grounding."
        }
      ],
      revenueIdeas: [
        {
          source: "Founder-to-Investor Pipeline",
          potential: "High",
          complexity: "High",
          strategy: "Introduce premium 'Investor Matchmaking' where highly validated projects (score > 85) are showcased to participating VC partners, taking a placement finder's fee."
        },
        {
          source: "No-Code Partner Marketplace",
          potential: "Medium",
          complexity: "Low",
          strategy: "Integrate localized affiliate recommendations for necessary founder stack tools (Bubble, Webflow, Stripe, AWS credits) directly within the execution roadmap."
        },
        {
          source: "Micro-Advisory Calls",
          potential: "Medium",
          complexity: "Medium",
          strategy: "Enable founders to schedule a 30-minute validation review call with vetted mentors for $99, splitting the revenue with the advisor."
        }
      ],
      marketingPlan: [
        {
          channel: "Launch on Product Hunt & Hacker News",
          strategy: "Craft a high-transparency story of building Valid AI to solve our own pains. Package the launch with a free single report offer for the community.",
          cost: "$0 (Organic)",
          impact: "High"
        },
        {
          channel: "SEO Content Engine (The Validation Academy)",
          strategy: "Publish exhaustive 'How to Validate X Idea' articles capturing search queries for highly trending sectors (AI, vertical SaaS, creator economy).",
          cost: "$300/mo (CMS & Tools)",
          impact: "High"
        },
        {
          channel: "Micro-Influencer Newsletter Sponsorships",
          strategy: "Sponsor 3-5 niche entrepreneurship newsletters (e.g. Trends.vc, SaaS Club) with tailored discounts.",
          cost: "$500/mo",
          impact: "Medium"
        }
      ],
      mvpRoadmap: [
        {
          step: "Phase 1: Validation Engine Core",
          duration: "Weeks 1-3",
          task: "Build the Express server integrating Gemini-3.5-flash with custom validation schemas and output parsers.",
          status: "Completed"
        },
        {
          step: "Phase 2: Auth & Interactive Canvas",
          duration: "Weeks 4-6",
          task: "Implement JWT login, workspace storage, and SWOT/competitor visualizations in React.",
          status: "Completed"
        },
        {
          step: "Phase 3: Beta Launch & Grounding",
          duration: "Weeks 7-8",
          task: "Integrate Google Search web grounding to pull live competitor intelligence and deploy the MVP publicly.",
          status: "In Progress"
        }
      ],
      milestones: [
        {
          quarter: "Q1",
          objective: "Establish MVP Core & Initial Beta Pool",
          keyResults: [
            "Launch private beta for 200 founders.",
            "Achieve an AI Report satisfaction rating of >85%.",
            "Generate 50+ validated project blueprints."
          ],
          icon: "Flame"
        },
        {
          quarter: "Q2",
          objective: "Drive Traction & Premium Subscriptions",
          keyResults: [
            "Public launch on Product Hunt.",
            "Reach $5,000 Monthly Recurring Revenue (MRR).",
            "Implement automated competitor alerts."
          ],
          icon: "TrendingUp"
        },
        {
          quarter: "Q3",
          objective: "Build Advisory & Investor Ecosystem",
          keyResults: [
            "Onboard 10 angel investor partners.",
            "Release multi-user collaborative workspace features.",
            "Reduce average report generation time to <15 seconds."
          ],
          icon: "Users"
        },
        {
          quarter: "Q4",
          objective: "Scale & Institutional Expansion",
          keyResults: [
            "Partner with 5 leading university incubators.",
            "Exceed $25,000 MRR with corporate packages.",
            "Incorporate automated financial spreadsheet exports."
          ],
          icon: "Globe"
        }
      ],
      createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString()
    };

    // Seed Demo Project 2: EcoTrack (Hardware / Green Tech IoT)
    const projectEcoTrack: Project = {
      id: proj2Id,
      userId,
      name: "EcoTrack Smart Meter",
      description: "A plug-and-play smart sensor that measures real-time micro-leakage of household energy and water systems, feeding insights to a mobile dashboard.",
      industry: "IoT / Clean Energy / Smart Home",
      targetAudience: "Eco-conscious homeowners, modern property managers, and green building developers.",
      businessModel: "Hardware Purchase ($149) + Premium Analytics Subscription ($4.99/mo)",
      status: "Validated",
      createdAt: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString() // 10 days ago
    };

    const reportEcoTrack: ValidationReport = {
      id: "rep_ecotrack_" + userId.substring(5),
      projectId: proj2Id,
      score: 68,
      marketSizeSummary: "Global Smart Home Energy Management systems represent a $3.4B market, growing at 11.5% CAGR, with high demand in regions with rising electricity tariffs.",
      swot: {
        strengths: [
          "Unique physical sensor design combining water flow and electric current monitoring.",
          "High energy savings potential (typical household saves 15-20% annually).",
          "Clean, easy-to-use mobile-first companion app."
        ],
        weaknesses: [
          "High upfront physical manufacturing and hardware assembly cost (requires hardware capital).",
          "Distribution is dependent on physical retail or complex online logistics.",
          "Installation might require professional plumbers/electricians for older buildings."
        ],
        opportunities: [
          "Apply for clean-tech government subsidies and tax rebates for green energy solutions.",
          "Partner with regional energy utility companies to offer EcoTrack as a value-added subscription.",
          "Target commercial real-estate operators looking to meet ESG compliance benchmarks."
        ],
        threats: [
          "Direct competition from global smart device brands (Nest, Ecobee, Ring).",
          "Supply chain bottlenecks for custom chipsets or sensors.",
          "High liability insurance requirements for domestic hardware installations."
        ]
      },
      targetAudienceDetailed: {
        personaName: "Eco-Conscious Dave",
        demographics: "Aged 30-55, homeowner, household income > $120k. Tech enthusiast with an interest in sustainability.",
        painPoints: [
          "Rising municipal energy bills with zero transparency on daily consumption leaks.",
          "Desire to decrease his carbon footprint but frustrated by a lack of concrete metrics.",
          "Fear of catastrophic, undetected basement water leaks."
        ],
        personaBio: "Dave lives in a suburban home. He loves smart gadgets and has solar panels installed, but he has no precise way to track energy micro-leaks or silent faucet drips until his high utility bills arrive.",
        buyingBehavior: "Invests in long-term home value. Looks for hardware with clean design and a clear ROI payback calculator."
      },
      businessModelDetailed: {
        valueProposition: "Save $400+ annually on energy and water bills while protecting your home from catastrophic silent leakages.",
        revenueStreams: [
          "Direct-to-Consumer Device sales: $149 per sensor.",
          "EcoTrack Pro Cloud Subscription: $4.99/month for predictive leaks, automated shut-off system triggers, and multi-device coordination.",
          "Enterprise ESG Dashboard: $49/mo per building for commercial property managers."
        ],
        pricingStrategy: "Affordable hardware price combined with a low-cost, high-margin monthly subscription model to drive long-term recurring value.",
        customerAcquisitionCost: "$55.00 via Google Ads & clean-tech directories.",
        lifetimeValue: "$328.00 (average device active for 3+ years with 24 months of subscription)."
      },
      competitors: [
        {
          name: "Sense Home Energy",
          marketShare: "50%",
          strengths: "Established brand name, excellent electrical circuit tracking, rich machine learning data.",
          weaknesses: "Very expensive ($299+), lacks water tracking, complex main electrical panel installation.",
          advantage: "Dual electricity + water monitoring in a single plug-and-play sensory unit with 5-minute user setup."
        },
        {
          name: "Phyn Smart Water",
          marketShare: "20%",
          strengths: "Highly detailed water flow analysis, automatic shutoff valve controls.",
          weaknesses: "Focuses strictly on plumbing, costs $400+, requires professional plumbing install.",
          advantage: "Low barrier to entry ($149), zero plumber installation required, and dual resource tracking."
        }
      ],
      revenueIdeas: [
        {
          source: "Utility Partnership Rebates",
          potential: "High",
          complexity: "High",
          strategy: "Collaborate with municipal utility providers to supply the device free or highly discounted to homeowners, with the utility funding it to reduce overall city load."
        },
        {
          source: "Insurance Co-Branding",
          potential: "Medium",
          complexity: "Medium",
          strategy: "Form alliances with homeowner insurance firms (e.g., State Farm) to offer 10% premium reductions to homes with active EcoTrack devices, leveraging leak avoidance."
        }
      ],
      marketingPlan: [
        {
          channel: "Suburban Facebook & Nextdoor Campaigns",
          strategy: "Run video advertisements focusing on the immediate fear and cost of undetected basement water leaks or vampire energy drawers.",
          cost: "$800/mo",
          impact: "High"
        },
        {
          channel: "Clean-Tech Blogs & Kickstarters",
          strategy: "Run a crowd-funding campaign to build community traction, validate batch production size, and generate initial PR articles.",
          cost: "$1,500 one-time",
          impact: "High"
        }
      ],
      mvpRoadmap: [
        {
          step: "Phase 1: Sensor Prototyping",
          duration: "Months 1-3",
          task: "Design the custom sensor using off-the-shelf ESP32 boards, water flow metrics, and split-core current transducers.",
          status: "Completed"
        },
        {
          step: "Phase 2: Firmware & React Native App",
          duration: "Months 4-5",
          task: "Write the basic Wi-Fi connectivity firmware and compile the companion analytics dashboard.",
          status: "Completed"
        },
        {
          step: "Phase 3: Alpha Beta Cohort",
          duration: "Month 6",
          task: "Ship 50 custom-built physical sensors to initial alpha testers and monitor real-world leak triggers.",
          status: "In Progress"
        }
      ],
      milestones: [
        {
          quarter: "Q1",
          objective: "Complete Prototyping & Alpha Testing",
          keyResults: [
            "Build 50 working hardware prototypes.",
            "Detect 100% of micro-leaks during lab stress testing.",
            "Complete core dashboard interface build."
          ],
          icon: "Flame"
        },
        {
          quarter: "Q2",
          objective: "Crowdfunding & Pre-order Campaign",
          keyResults: [
            "Launch Kickstarter with $30,000 funding target.",
            "Obtain pre-orders for 250+ units.",
            "Secure parts supply agreements for initial production."
          ],
          icon: "TrendingUp"
        },
        {
          quarter: "Q3",
          objective: "Initial Batch Production & Regulatory Approvals",
          keyResults: [
            "Achieve FCC/UL electronic safety certification.",
            "Manufacture first 500 sensors with manufacturing partner.",
            "Ship to initial Kickstarter backers."
          ],
          icon: "Users"
        },
        {
          quarter: "Q4",
          objective: "SaaS Analytics Rollout & Utility Pilot",
          keyResults: [
            "Launch EcoTrack Pro cloud analytics subscription tier.",
            "Initiate pilot partnership with 1 municipal utility company.",
            "Achieve $80,000 in physical sales ARR."
          ],
          icon: "Globe"
        }
      ],
      createdAt: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString()
    };

    db.projects[proj1Id] = projectAlpha;
    db.reports[proj1Id] = reportAlpha;

    db.projects[proj2Id] = projectEcoTrack;
    db.reports[proj2Id] = reportEcoTrack;

    await writeDB(db);
  }
};
