import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import fetch from 'node-fetch';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_FILE = path.join(process.cwd(), 'db.json');

function loadData() {
  if (fs.existsSync(DB_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    } catch (e) {
      console.error("Error loading DB file:", e);
    }
  }
  return null;
}

function saveData(data: any) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  } catch (e) {
    console.error("Error saving DB file:", e);
  }
}

const initialData = loadData() || {
  pricing: {
    taxRate: 18,
    intlBankFee: 5,
    globalMarkup: 0,
    emailBasic: "5,100 - 10,200",
    emailStandard: "10,200 - 25,500",
    emailEnterprise: "25,500+",
    tenantBasic: "3,060 - 7,140",
    tenantStandard: "7,140 - 15,300",
    tenantEnterprise: "15,300+",
    siteRecoveryBasic: "8,160 - 15,300",
    siteRecoveryStandard: "15,300 - 40,800",
    siteRecoveryEnterprise: "40,800+",
    backupBasic: "5,100 - 10,200",
    backupStandard: "10,200 - 25,500",
    backupEnterprise: "25,500+"
  },
  admins: [],
  clients: [],
  quotes: []
};

let mockPricing = initialData.pricing;
let mockAdmins = initialData.admins;
let mockClients = initialData.clients;
let mockQuotes = initialData.quotes;

// Ensure default superadmin exists if not in DB
if (mockAdmins.length === 0) {
  mockAdmins.push({ email: 'sales@shreyanvisoft.com', password: 'admin', role: 'superadmin' });
}

function syncToDisk() {
  saveData({
    pricing: mockPricing,
    admins: mockAdmins,
    clients: mockClients,
    quotes: mockQuotes
  });
}

// Cloudflare AI Configuration
const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;

const MODEL_MAP: Record<string, string> = {
  "llama": "@cf/meta/llama-3-8b-instruct",
  "gemma": "@cf/google/gemma-4-26b-a4b-it",
  "qwen": "@cf/qwen/qwen2.5-coder-32b-instruct"
};

const SYSTEM_INSTRUCTION = `
You are the expert AI Sales Executive for SHREYANVISOFT. Your tone is highly professional, polite, and premium.
Services Provided: Email Migrations, Web Design, RPA BOT, AI Chatbots, Web Scraping, Remote Access, Data Backup, Cloud VMs.

CRITICAL BEHAVIOR RULES:
1. If the user says "Hi", "Hello", or asks a general question, GREET THEM POLITELY and ask how you can help. DO NOT offer a quote yet.
2. If the user asks for pricing, ONLY output the exact prices listed in the PRICING TABLE below. Use clean bullet points. Do not add long conversational filler.
3. ONLY when a user explicitly asks to buy, purchase, or setup a service, reply with EXACTLY this phrase and NOTHING else: "Shreyanvisoft provides ultra-premium implementations for this service with the best quotes in the market. Please use the secure input box below to provide your details."
4. NEVER ask the user to type their info in the chat. NEVER generate fake links.
5. Do NOT mix up pricing plans. Only read exactly what is in the table below.
6. MENTION that all initial consultations and basic setups are currently FREE for new enterprise clients.

💼 IT SERVICES PRICING PLANS (Prices in INR. Includes 2% standard gateway processing fees):
[FREE TIER]
* Starter Setup: ₹0 (Free consultation + basic environment check)

[EMAIL MIGRATION PLANS]
* Basic: ₹5,100 - ₹10,200 (Up to 10 users, Email + contacts migration)
* Standard: ₹10,200 - ₹25,500 (Up to 50 users, Full data migration + config)
* Enterprise: ₹25,500+ (Unlimited users, Complex migration + support)

[TENANT SETUP PLANS]
* Basic: ₹3,060 - ₹7,140 (Basic setup users + domain)
* Standard: ₹7,140 - ₹15,300 (Security + policies + admin setup)
* Enterprise: ₹15,300+ (Full config + compliance + optimization)

[SITE RECOVERY PLANS]
* Basic: ₹8,160 - ₹15,300 
* Standard: ₹15,300 - ₹40,800
* Enterprise: ₹40,800+

[BACKUP PLANS]
* Basic: ₹5,100 - ₹10,200
* Standard: ₹10,200 - ₹25,500
* Enterprise: ₹25,500+

[REMOTE ACCESS & VIRTUAL MACHINES (On Physical System)]
* Remote Basic: ₹5,100 - ₹10,200 | Standard: ₹10,200 - ₹20,400 | Enterprise: ₹20,400+
* VM Basic: ₹5,100 - ₹12,240 | Standard: ₹12,240 - ₹30,600 | Enterprise: ₹30,600+

[CLOUD VM SETUP & PREMIUM STATIC WEBSITE DESIGN]
* Both start at ₹10,200 depending on the scale and chatbot integration requirements.

⚠️ IMPORTANT PRICING NOTES:
* Price changes based on scenario and infrastructure.
* Licenses and software are NOT included.
* Taxes are NOT included and will be added in the final quote.
`;

async function startServer() {
  const app = express();
  const PORT = process.env.NODE_ENV === 'production' ? 3000 : 3001; // 3000 for prod, 3001 for dev proxy

  app.use(cors());
  app.use(express.json());

  // In-memory IP rate limiting store
  const ipRateLimit = new Map<string, { count: number, blockedUntil: number }>();
  const aiChatUsage = new Map<string, { count: number, blockedUntil: number }>();

  app.post('/api/ai/unlock', async (req, res) => {
    const { name, email, phone } = req.body;
    if (!name || !email || !phone) return res.status(400).json({ error: 'All fields are required' });

    const ip = req.ip || "unknown";
    const now = Date.now();

    // Check if IP is blocked
    const usage = aiChatUsage.get(ip);
    if (usage && usage.blockedUntil > now) {
      const daysLeft = Math.ceil((usage.blockedUntil - now) / (1000 * 60 * 60 * 24));
      return res.status(429).json({ 
        success: false, 
        error: `Limit reached. Please try after ${daysLeft} days.` 
      });
    }

    // Save lead to Formspree
    const formspreeUrl = process.env.VITE_FORMSPREE_URL || "https://formspree.io/f/mnjoopbq";
    try {
      await fetch(formspreeUrl, {
        method: "POST",
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ 
          subject: "AI Playground Unlock",
          name, email, phone, ip,
          date: new Date().toISOString()
        })
      });
    } catch (e) {
      console.error("Failed to send unlock lead to Formspree", e);
    }

    res.json({ success: true });
  });

  app.post('/api/otp/send', async (req, res) => {
    const { email, type = 'customer' } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const ip = req.ip || "unknown";
    const now = Date.now();
    
    // 1. IP-Based Rate Limiting (5 requests per IP, block for 5 days)
    let limit = ipRateLimit.get(ip);
    if (limit && limit.blockedUntil > now) {
      return res.status(429).json({ 
        success: false, 
        error: "You reached the limit, check after 5 days." 
      });
    }

    if (!limit) {
      limit = { count: 0, blockedUntil: 0 };
    }

    if (limit.count >= 5) {
      limit.blockedUntil = now + 5 * 24 * 60 * 60 * 1000; // 5 days
      ipRateLimit.set(ip, limit);
      return res.status(429).json({ 
        success: false, 
        error: "You reached the limit, check after 5 days." 
      });
    }

    limit.count += 1;
    ipRateLimit.set(ip, limit);

    // 2. OTP is disabled for testing
    res.json({ 
      success: true, 
      message: type === 'admin' ? "Admin access granted for testing." : "Access granted for testing." 
    });
  });

  app.post('/api/otp/verify', (req, res) => {
    // OTP is disabled, always return success for testing
    res.json({ success: true });
  });

  // API Routes
  app.post('/api/chat', async (req, res) => {
    const { message, history = [], model = 'llama' } = req.body;
    const ip = req.ip || "unknown";
    const now = Date.now();

    // Check block
    let usage = aiChatUsage.get(ip);
    if (usage && usage.blockedUntil > now) {
      const daysLeft = Math.ceil((usage.blockedUntil - now) / (1000 * 60 * 60 * 24));
      return res.status(429).json({ error: `Limit reached. Please try after ${daysLeft} days.` });
    }

    if (!usage) {
      usage = { count: 0, blockedUntil: 0 };
    }

    // Increment count
    usage.count += 1;
    if (usage.count > 5) {
      usage.blockedUntil = now + (5 * 24 * 60 * 60 * 1000); // 5 days
      aiChatUsage.set(ip, usage);
      return res.status(429).json({ error: "Limit reached. Please try after 5 days." });
    }
    aiChatUsage.set(ip, usage);

    const cloudflareModelId = MODEL_MAP[model] || MODEL_MAP['llama'];

    const messages = [
      { role: 'system', content: SYSTEM_INSTRUCTION },
      ...history.map((msg: any) => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      })),
      { role: 'user', content: message }
    ];

    try {
      if (!CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_API_TOKEN) {
        return res.json({ 
          response: "Cloudflare AI is not configured. Please add CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN to your environment variables.",
          showForm: false 
        });
      }

      const url = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/ai/run/${cloudflareModelId}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages,
          max_tokens: 250,
          temperature: 0.2
        })
      });

      if (!response.ok) {
        throw new Error(`Cloudflare API error: ${response.statusText}`);
      }

      const result: any = await response.json();
      let botReply = "Our AI is currently assisting other customers. Please email sales@shreyanvisoft.com directly.";
      let showForm = false;

      if (result.result && result.result.response) {
        botReply = result.result.response.trim();
      } else if (result.response) {
        botReply = result.response.trim();
      }

      if (botReply.toLowerCase().includes("secure input box") || botReply.toLowerCase().includes("input box below")) {
        showForm = true;
      }

      res.json({ response: botReply, showForm });
    } catch (error) {
      console.error('SERVER ERROR:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // --- MOCK API ROUTES FOR DEV ENVIRONMENT ---
  // In production, Cloudflare Pages Functions (/functions/api/...) will handle these.
  
  let mockPricing = {
    taxRate: 18,
    intlBankFee: 5, // 5% for international bank transfers
    globalMarkup: 0, // 0% default markup
    emailBasic: "5,100 - 10,200",
    emailStandard: "10,200 - 25,500",
    emailEnterprise: "25,500+",
    tenantBasic: "3,060 - 7,140",
    tenantStandard: "7,140 - 15,300",
    tenantEnterprise: "15,300+",
    siteRecoveryBasic: "8,160 - 15,300",
    siteRecoveryStandard: "15,300 - 40,800",
    siteRecoveryEnterprise: "40,800+",
    backupBasic: "5,100 - 10,200",
    backupStandard: "10,200 - 25,500",
    backupEnterprise: "25,500+"
  };
  let mockAdmins = [{ email: 'sales@shreyanvisoft.com', password: 'admin', role: 'superadmin' }];
  let mockClients: any[] = [];
  let mockQuotes: any[] = [];
  let adminSessions = new Map<string, string>(); // token -> role
  let clientSessions = new Map<string, any>();

  app.get('/api/pricing', (req, res) => {
    res.json(mockPricing);
  });

  app.post('/api/admin/login', (req, res) => {
    const { email, password } = req.body;
    
    let isValid = false;
    let role = 'admin';

    // Check Master Admin from Environment Variables
    if (process.env.ADMIN_EMAIL && email.toLowerCase() === process.env.ADMIN_EMAIL.toLowerCase() && password === process.env.ADMIN_PASSWORD) {
      role = 'superadmin';
      isValid = true;
    } else {
      // Check Mock Admins
      const admin = mockAdmins.find(a => a.email.toLowerCase() === email.toLowerCase());
      if (admin && admin.password === password) {
        role = admin.role || 'admin';
        isValid = true;
      }
    }

    if (isValid) {
      const token = `admin_token_${Date.now()}`;
      adminSessions.set(token, role);
      res.json({ success: true, token, role });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  });

  app.get('/api/admin/config', (req, res) => {
    const auth = req.headers.authorization;
    const token = auth ? auth.split(' ')[1] : null;
    if (!token || !adminSessions.has(token)) return res.status(401).json({ error: 'Unauthorized' });
    res.json({ pricing: mockPricing, admins: mockAdmins });
  });

  app.post('/api/admin/config', (req, res) => {
    const auth = req.headers.authorization;
    const token = auth ? auth.split(' ')[1] : null;
    if (!token || !adminSessions.has(token)) return res.status(401).json({ error: 'Unauthorized' });
    const { pricing, admins } = req.body;
    if (pricing) {
      mockPricing = { ...mockPricing, ...pricing };
    }
    if (admins) {
      mockAdmins = admins;
    }
    syncToDisk();
    res.json({ success: true });
  });

  app.get('/api/admin/clients', (req, res) => {
    const auth = req.headers.authorization;
    const token = auth ? auth.split(' ')[1] : null;
    if (!token || !adminSessions.has(token)) return res.status(401).json({ error: 'Unauthorized' });
    res.json({ clients: mockClients });
  });

  app.post('/api/admin/clients', (req, res) => {
    const auth = req.headers.authorization;
    const token = auth ? auth.split(' ')[1] : null;
    if (!token || !adminSessions.has(token)) return res.status(401).json({ error: 'Unauthorized' });
    const { clients } = req.body;
    mockClients = clients;
    syncToDisk();
    res.json({ success: true });
  });

  app.get('/api/admin/quotes', (req, res) => {
    const auth = req.headers.authorization;
    const token = auth ? auth.split(' ')[1] : null;
    if (!token || !adminSessions.has(token)) return res.status(401).json({ error: 'Unauthorized' });
    res.json({ quotes: mockQuotes });
  });

  app.post('/api/admin/quotes', (req, res) => {
    const auth = req.headers.authorization;
    const token = auth ? auth.split(' ')[1] : null;
    if (!token || !adminSessions.has(token)) return res.status(401).json({ error: 'Unauthorized' });
    const { quotes } = req.body;
    mockQuotes = quotes;
    syncToDisk();
    res.json({ success: true });
  });

  app.post('/api/client/login', (req, res) => {
    const { email, password } = req.body;
    const client = mockClients.find(c => c.email === email && c.password === password);
    if (client) {
      const token = `client_token_${Date.now()}`;
      clientSessions.set(token, client);
      res.json({ success: true, token });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  });

  app.get('/api/client/data', (req, res) => {
    const auth = req.headers.authorization;
    const token = auth ? auth.split(' ')[1] : null;
    if (!token || !clientSessions.has(token)) return res.status(401).json({ error: 'Unauthorized' });
    const client = clientSessions.get(token);
    const clientQuotes = mockQuotes.filter(q => q.clientId === client.id);
    res.json({ client, quotes: clientQuotes });
  });

  app.post('/api/client/update-info', (req, res) => {
    const auth = req.headers.authorization;
    const token = auth ? auth.split(' ')[1] : null;
    if (!token || !clientSessions.has(token)) return res.status(401).json({ error: 'Unauthorized' });
    
    const client = clientSessions.get(token);
    const { migrationDetails, orderNotes } = req.body;
    
    // Update mock client details
    const clientIdx = mockClients.findIndex(c => c.id === client.id);
    if (clientIdx !== -1) {
      mockClients[clientIdx] = { 
        ...mockClients[clientIdx], 
        migrationDetails, 
        orderNotes 
      };
      // Update session too
      clientSessions.set(token, mockClients[clientIdx]);
      syncToDisk();
    }
    
    res.json({ success: true });
  });

  app.post('/api/lead', async (req, res) => {
    console.log("Local /api/lead called with body:", req.body);
    const formspreeUrl = process.env.VITE_FORMSPREE_URL || "https://formspree.io/f/mnjoopbq";
    
    try {
      const response = await fetch(formspreeUrl, {
        method: "POST",
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(req.body)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Formspree Error:", errorText);
        return res.status(500).json({ error: `Formspree Error: ${response.status} - ${errorText}` });
      }

      res.json({ success: true, result: { message: "Lead captured and sent to Formspree successfully" } });
    } catch (error) {
      console.error("Local Lead Error:", error);
      res.status(500).json({ error: "Failed to send lead" });
    }
  });
  // --- END MOCK API ROUTES ---

  // In production, serve static files
  if (process.env.NODE_ENV === 'production') {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
