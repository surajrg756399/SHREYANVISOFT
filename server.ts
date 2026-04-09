import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import fetch from 'node-fetch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
  const PORT = process.env.NODE_ENV === 'production' ? 3000 : 3001;

  app.use(cors());
  app.use(express.json());

  // In-memory OTP store
  const otpStore = new Map<string, { otp: string, expires: number }>();
  const ADMIN_EMAIL = "sales@shreyanvisoft.com";

  app.post('/api/otp/send', async (req, res) => {
    const { email, type = 'customer' } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const targetEmail = type === 'admin' ? ADMIN_EMAIL : email;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore.set(targetEmail, { otp, expires: Date.now() + 5 * 60 * 1000 });

    console.log(`[OTP DEBUG] Generated ${type} OTP: ${otp} for ${targetEmail}`);

    try {
      const subject = type === 'admin' ? "🚨 ADMIN UNLIMITED ACCESS OTP 🚨" : "✨ CUSTOMER AI PLAYGROUND OTP ✨";
      const message = type === 'admin' 
        ? `Admin Login Attempt. Secure OTP for Unlimited Access: ${otp}. Requested by: ${email}`
        : `A customer (${email}) has requested an access code for the AI Playground. Secure OTP: ${otp}`;

      // Notify sales team via Formspree (Lead Tracking & OTP Delivery)
      // NOTE: Formspree sends this email to the SALES inbox, not the customer.
      const formspreeUrl = process.env.VITE_FORMSPREE_URL || "https://formspree.io/f/mnjoopbq";
      await fetch(formspreeUrl, {
        method: "POST",
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          Subject: subject,
          Email: targetEmail,
          Message: message,
          _replyto: email 
        })
      });
      
      res.json({ 
        success: true, 
        message: type === 'admin' 
          ? 'Admin OTP sent to sales inbox.' 
          : 'Access code request sent. The sales team will receive your request and provide the code.' 
      });
    } catch (error) {
      res.json({ success: true, message: 'Access code generated.' });
    }
  });

  app.post('/api/otp/verify', (req, res) => {
    const { email, otp } = req.body;
    const stored = otpStore.get(email);

    if (stored && stored.otp === otp && stored.expires > Date.now()) {
      otpStore.delete(email);
      res.json({ success: true });
    } else {
      res.status(400).json({ success: false, error: 'Invalid or expired OTP' });
    }
  });

  // API Routes
  app.post('/api/chat', async (req, res) => {
    const { message, history = [], model = 'llama' } = req.body;
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
