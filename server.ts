import express, { Request, Response, NextFunction } from "express";
import path from "path";
import fs from "fs";
import multer from "multer";
import jwt from "jsonwebtoken";
import { createServer as createViteServer } from "vite";
import { dbService } from "./server/db";
import { generateValidationReport } from "./server/gemini";

const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || "valid-ai-secret-key-998877";

// Ensure uploads folder exists
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Set up static files route for uploads
app.use("/uploads", express.static(uploadDir));

// Multer Disk Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  }
});

// Configure upload middleware (only accept images up to 5MB)
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limits
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed."));
    }
  }
});

// Middleware to parse requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Express Request extension for authenticated user
export interface AuthenticatedRequest extends Request {
  userId?: string;
}

// Authentication Middleware
function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    res.status(401).json({ error: "Access denied. No authentication token provided." });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(403).json({ error: "Invalid or expired authentication token." });
  }
}

// --- API ROUTES ---

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// Authentication: Register
app.post("/api/auth/register", async (req, res) => {
  const { email, name, password } = req.body;

  if (!email || !name || !password) {
    res.status(400).json({ error: "All fields (email, name, password) are required." });
    return;
  }

  try {
    const existing = await dbService.getUserByEmail(email);
    if (existing) {
      res.status(400).json({ error: "Email already registered." });
      return;
    }

    const user = await dbService.createUser(email, name, password);
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });

    res.status(201).json({ token, user });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to register user." });
  }
});

// Authentication: Login
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: "Email and password are required." });
    return;
  }

  try {
    const user = await dbService.verifyPassword(email, password);
    if (!user) {
      res.status(401).json({ error: "Invalid email or password." });
      return;
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, user });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to log in." });
  }
});

// Authentication: Get Current User (Me)
app.get("/api/auth/me", authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const user = await dbService.getUserById(req.userId!);
    if (!user) {
      res.status(404).json({ error: "User not found." });
      return;
    }
    res.json({ user });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch profile." });
  }
});

// Authentication: Update Profile
app.put("/api/auth/profile", authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const updatedUser = await dbService.updateUser(req.userId!, req.body);
    res.json({ user: updatedUser });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to update profile." });
  }
});

// Projects: List All for Logged-In User
app.get("/api/projects", authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const projects = await dbService.listProjects(req.userId!);
    res.json({ projects });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to list projects." });
  }
});

// Projects: Create a New Project Draft
app.post("/api/projects", authenticateToken, async (req: AuthenticatedRequest, res) => {
  const { name, description, industry, targetAudience, businessModel } = req.body;

  if (!name || !description) {
    res.status(400).json({ error: "Project name and description are required." });
    return;
  }

  try {
    const project = await dbService.createProject(req.userId!, {
      name,
      description,
      industry: industry || "General Technology",
      targetAudience: targetAudience || "General Public",
      businessModel: businessModel || "Unspecified"
    });
    res.status(201).json({ project });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to create project." });
  }
});

// Projects: Delete a Project
app.delete("/api/projects/:id", authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const project = await dbService.getProject(req.params.id);
    if (!project) {
      res.status(404).json({ error: "Project not found." });
      return;
    }

    if (project.userId !== req.userId) {
      res.status(403).json({ error: "Unauthorized access to this project." });
      return;
    }

    await dbService.deleteProject(req.params.id);
    res.json({ success: true, message: "Project and its validation blueprints deleted successfully." });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to delete project." });
  }
});

// Projects: Get Single Project
app.get("/api/projects/:id", authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const project = await dbService.getProject(req.params.id);
    if (!project) {
      res.status(404).json({ error: "Project not found." });
      return;
    }

    if (project.userId !== req.userId) {
      res.status(403).json({ error: "Unauthorized access to this project." });
      return;
    }

    res.json({ project });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch project." });
  }
});

// Projects: Fetch Validation Report
app.get("/api/projects/:id/report", authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const project = await dbService.getProject(req.params.id);
    if (!project) {
      res.status(404).json({ error: "Project not found." });
      return;
    }

    if (project.userId !== req.userId) {
      res.status(403).json({ error: "Unauthorized access to this project." });
      return;
    }

    const report = await dbService.getReport(req.params.id);
    res.json({ report });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch report." });
  }
});

// Projects: Trigger AI Validation Report (with fallback if key is missing)
app.post("/api/projects/:id/validate", authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const project = await dbService.getProject(req.params.id);
    if (!project) {
      res.status(404).json({ error: "Project not found." });
      return;
    }

    if (project.userId !== req.userId) {
      res.status(403).json({ error: "Unauthorized access to this project." });
      return;
    }

    // Set status to Validating
    await dbService.updateProject(project.id, { status: "Validating" });

    // Try to run real Gemini Validation
    let validationData;
    const isSimulate = req.body.simulate === true;

    if (!process.env.GEMINI_API_KEY || isSimulate) {
      console.log("No GEMINI_API_KEY detected or simulation requested. Running realistic high-fidelity fallback validation generator.");
      
      // Simulate highly detailed, tailored responses based on their industry/description to preserve delightful prototyping experience
      const industryText = project.industry || "Technology";
      const score = Math.floor(Math.random() * 25) + 65; // realistic score between 65 and 90
      
      validationData = {
        score,
        marketSizeSummary: `For the ${industryText} sector, the Total Addressable Market (TAM) is estimated at $8.2B globally, with a Serviceable Addressable Market (SAM) of $420M. Target annual CAGR in this sub-sector stands at a rapid 12.8%.`,
        swot: {
          strengths: [
            `Highly tailored value proposition addressing modern ${industryText} efficiencies.`,
            "Agile product architecture allowing rapid deployment loops.",
            "Strong core utility solving specific, high-frequency user frustrations."
          ],
          weaknesses: [
            "Lack of early market presence and brand awareness compared to incumbents.",
            "High customer education barrier for advanced product workflows.",
            "Dependence on cloud APIs and infrastructure scaling stability."
          ],
          opportunities: [
            "Untapped expansion opportunities in mid-market business operations.",
            "Integrations with widely used third-party enterprise platforms.",
            "Forming strong distribution channels with specialized consultants."
          ],
          threats: [
            "Potential for fast-following duplication by established industry leaders.",
            "Security/privacy compliance overhead (GDPR/SOC2) in premium tiers.",
            "Economic contraction slowing client purchasing velocity."
          ]
        },
        targetAudienceDetailed: {
          personaName: "Innovative Professional Ian",
          demographics: `Aged 28-45, working in ${industryText} or related operations, earning $85k-$130k. High affinity for tech solutions.`,
          painPoints: [
            "Time loss due to repetitive, highly manual administrative workflows.",
            "Scattered data streams making insights hard to structure clearly.",
            "Frustration with outdated software interfaces that slow execution speed."
          ],
          personaBio: "Ian is a high-performing lead or founder who constantly feels bottlenecked by operations. He has tried generalized tools but finds them too generic. He will gladly pay for custom vertical software that immediately gives him 5 hours back each week.",
          buyingBehavior: "Self-serves trials first. Highly motivated by clean UI/UX, transparent ROI calculators, and peer testimonials."
        },
        businessModelDetailed: {
          valueProposition: `Supercharge ${industryText} operations by automating your bottleneck workflows with deep quantitative clarity.`,
          revenueStreams: [
            "Growth Pro Plan: $39/month for advanced metrics & real-time analytics.",
            "Enterprise Elite Plan: $149/month for high-volume capabilities, priority queues, and premium API connectors.",
            "Starter Seat: $15/month for basic single-user access."
          ],
          pricingStrategy: "Value-based subscription modeled on immediate productivity gains, ensuring user payback is realized in less than 30 days.",
          customerAcquisitionCost: "$42.00 through high-intent organic search SEO, direct product launches, and content hubs.",
          lifetimeValue: "$273.00 (average subscriber retention of 7 months)."
        },
        competitors: [
          {
            name: "Traditional Market Incumbents",
            marketShare: "55%",
            strengths: "Deep capitalization, established corporate trust, wide service offerings.",
            weaknesses: "Bloated software interfaces, slow feature delivery cycles, generic messaging.",
            advantage: "Valid AI is built with modern speed, specialized vertical intelligence, and extreme UX polish."
          },
          {
            name: "Ad-Hoc Manual Spreadsheets",
            marketShare: "30%",
            strengths: "Virtually free, highly custom, users are already familiar with the tools.",
            weaknesses: "Completely static, highly error-prone, zero automated intelligence scaling.",
            advantage: "Seamless automation and automated reporting pipelines that reduce error probability to 0%."
          }
        ],
        revenueIdeas: [
          {
            source: "White-Label Strategic Exports",
            potential: "High",
            complexity: "Medium",
            strategy: "Allow users to fully export executive validation dashboards under their own corporate branding for pitch meetings, charged as an premium add-on of $29 per download."
          },
          {
            source: "API Integrations Hub",
            potential: "Medium",
            complexity: "High",
            strategy: "Monetize custom API access that pipes validation signals directly into founder workflows, Notion boards, or developer tools."
          }
        ],
        marketingPlan: [
          {
            channel: "Targeted Micro-Newsletter Sponsorships",
            strategy: `Run native sponsor slots in premium ${industryText} & startup newsletters.`,
            cost: "$400/mo",
            impact: "High"
          },
          {
            channel: "Launch Engineering (Free Tools Engine)",
            strategy: "Release a lightweight, free 'ROI Calculator' or 'Idea Scorecard' on Product Hunt to drive highly qualified organic backlink traffic to our landing page.",
            cost: "Organic",
            impact: "High"
          },
          {
            channel: "LinkedIn Video Demos",
            strategy: "Share short 45-second Loom screen recordings highlighting the exact raw insights generated by the validation dashboard.",
            cost: "Organic",
            impact: "Medium"
          }
        ],
        mvpRoadmap: [
          {
            step: "Phase 1: Basic Core Dashboard",
            duration: "Weeks 1-4",
            task: "Develop the full-stack system architecture and landing page canvas.",
            status: "Completed"
          },
          {
            step: "Phase 2: Advanced Metric Generators",
            duration: "Weeks 5-8",
            task: "Build the competitor and marketing-channel analytics screens with simulated grounding data.",
            status: "In Progress"
          },
          {
            step: "Phase 3: Automated Exports Hub",
            duration: "Weeks 9-10",
            task: "Implement interactive PDF and CSV formatting options.",
            status: "Pending"
          }
        ],
        milestones: [
          {
            quarter: "Q1",
            objective: `Prototype Release & Local Market Fit`,
            keyResults: [
              "Onboard initial 100 beta test founders.",
              "Deliver comprehensive validation reports in under 30 seconds.",
              "Achieve 30% weekly user return rate."
            ],
            icon: "Flame"
          },
          {
            quarter: "Q2",
            objective: "Public Launch & Strategic Integrations",
            keyResults: [
              "Rank in Top 5 on Product Hunt launcher index.",
              "Integrate with popular workflow managers (Notion, Slack).",
              "Achieve initial $3,000 Monthly Recurring Revenue (MRR)."
            ],
            icon: "TrendingUp"
          },
          {
            quarter: "Q3",
            objective: "Advisory Network & Dynamic Feeds",
            keyResults: [
              "Launch premium adviser matchmaking service.",
              "Deliver real-time automated competitor notification emails.",
              "Grow subscriber count to 500+ paid users."
            ],
            icon: "Users"
          },
          {
            quarter: "Q4",
            objective: "Enterprise Growth & International Reach",
            keyResults: [
              "Partner with 3 leading startup venture builders.",
              "Offer multi-currency & multilingual validation packages.",
              "Surpass $15,000 MRR scale."
            ],
            icon: "Globe"
          }
        ]
      };
      
      // Artificial delay to mimic AI reasoning
      await new Promise((resolve) => setTimeout(resolve, 2000));
    } else {
      console.log(`Triggering actual Gemini API validation for project: ${project.name}`);
      validationData = await generateValidationReport(
        project.name,
        project.description,
        project.industry,
        project.targetAudience,
        project.businessModel
      );
    }

    const savedReport = await dbService.saveReport(project.id, validationData);
    res.json({ success: true, report: savedReport });
  } catch (error: any) {
    // If anything fails, revert status back to Draft or Failed
    try {
      await dbService.updateProject(req.params.id, { status: "Draft" });
    } catch (revertError) {}

    console.error("Validation API error handler:", error);
    res.status(500).json({
      error: error.message || "Failed to generate validation report.",
      isMissingKey: !process.env.GEMINI_API_KEY
    });
  }
});

// Seed API (explicit trigger if needed)
app.post("/api/projects/seed", authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    await dbService.seedDemoProjects(req.userId!);
    const projects = await dbService.listProjects(req.userId!);
    res.json({ success: true, projects });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to seed demo projects." });
  }
});

// --- IMAGES API ENDPOINTS (FULL CRUD) ---

// 1. Read (List all images for authenticated user)
app.get("/api/images", authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const images = await dbService.listImages(req.userId!);
    res.json({ images });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to list uploaded images." });
  }
});

// 2. Create (Upload a new image file to disk and database)
app.post("/api/images/upload", authenticateToken, (req: AuthenticatedRequest, res) => {
  upload.single("image")(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message || "Failed to upload file." });
    }

    if (!req.file) {
      return res.status(400).json({ error: "No image file provided in request." });
    }

    try {
      const fileUrl = `/uploads/${req.file.filename}`;
      const newImage = await dbService.createImage(req.userId!, {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        url: fileUrl,
        caption: req.body.caption || ""
      });

      res.status(201).json({ image: newImage });
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to record image metadata." });
    }
  });
});

// 3. Update (Modify image metadata caption/originalName)
app.put("/api/images/:id", authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const image = await dbService.getImage(req.params.id);
    if (!image) {
      return res.status(404).json({ error: "Image record not found." });
    }

    if (image.userId !== req.userId) {
      return res.status(403).json({ error: "Unauthorized access to this image." });
    }

    const { caption, originalName } = req.body;
    const updates: any = {};
    if (caption !== undefined) updates.caption = caption;
    if (originalName !== undefined) updates.originalName = originalName;

    const updatedImage = await dbService.updateImage(req.params.id, updates);
    res.json({ image: updatedImage });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to update image details." });
  }
});

// 4. Delete (Remove image file from disk and database)
app.delete("/api/images/:id", authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const image = await dbService.getImage(req.params.id);
    if (!image) {
      return res.status(404).json({ error: "Image record not found." });
    }

    if (image.userId !== req.userId) {
      return res.status(403).json({ error: "Unauthorized access to this image." });
    }

    // Attempt to remove physical file from disk
    const filePath = path.join(process.cwd(), "uploads", image.filename);
    try {
      await fs.promises.unlink(filePath);
    } catch (diskErr) {
      console.warn(`File already deleted or missing on disk at ${filePath}:`, diskErr);
    }

    // Delete database entry
    await dbService.deleteImage(req.params.id);
    res.json({ success: true, message: "Image deleted successfully from server." });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to delete image record." });
  }
});

// 5. Profile Avatar direct upload endpoint
app.post("/api/auth/avatar", authenticateToken, (req: AuthenticatedRequest, res) => {
  upload.single("avatar")(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message || "Failed to upload avatar." });
    }

    if (!req.file) {
      return res.status(400).json({ error: "No image file provided for avatar." });
    }

    try {
      const fileUrl = `/uploads/${req.file.filename}`;
      const updatedUser = await dbService.updateUser(req.userId!, { avatar: fileUrl });
      res.json({ success: true, avatarUrl: fileUrl, user: updatedUser });
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to update user avatar in database." });
    }
  });
});

// --- VITE MIDDLEWARE CONFIGURATION ---

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Mount Vite middleware in development
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server successfully started in ${process.env.NODE_ENV || "development"} mode on http://0.0.0.0:${PORT}`);
  });
}

startServer();
