/**
 * Cloudflare Pages AI Chat Endpoint
 * Handles POST requests to /api/chat
 * Dynamically loads pricing from KV Storage
 */

const MODEL_MAP = {
  "llama": "@cf/meta/llama-3-8b-instruct",
  "gemma": "@cf/google/gemma-4-26b-a4b-it",
  "nemotron": "@cf/nvidia/nemotron-3-120b-a12b",
  "qwen": "@cf/qwen/qwen2.5-coder-32b-instruct"
};

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const { message, history = [], model = 'llama' } = await request.json();
    const cloudflareModelId = MODEL_MAP[model] || MODEL_MAP['llama'];

    // 1. Fetch Dynamic Pricing from KV
    let pricing = {
      taxRate: 18,
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

    if (env.KV) {
      const storedPricing = await env.KV.get("pricing_config", "json");
      if (storedPricing) {
        pricing = { ...pricing, ...storedPricing };
      }
    }

    const SYSTEM_INSTRUCTION = `
You are the expert AI Sales Executive for our Enterprise. Your tone is highly professional, polite, and premium.
Services Provided: Email Migrations, Web Design, RPA BOT, AI Chatbots, Web Scraping, Remote Access, Data Backup, Cloud VMs.

CRITICAL BEHAVIOR RULES:
1. If the user says "Hi", "Hello", or asks a general question, GREET THEM POLITELY and ask how you can help. DO NOT offer a quote yet.
2. If the user asks for pricing, ONLY output the exact prices listed in the PRICING TABLE below. Use clean bullet points.
3. ONLY when a user explicitly asks to buy, purchase, or setup a service, reply with EXACTLY this phrase and NOTHING else: "We provide ultra-premium implementations for this service with the best quotes in the market. Please use the secure input box below to provide your details."
4. NEVER ask the user to type their info in the chat. NEVER generate fake links.

💼 IT SERVICES PRICING PLANS (Prices in INR. Includes 2% standard gateway processing fees):
[FREE TIER]
* Starter Setup: ₹0 (Free consultation + basic environment check)

[EMAIL MIGRATION PLANS]
* Basic: ₹${pricing.emailBasic} (Up to 10 users, Email + contacts migration)
* Standard: ₹${pricing.emailStandard} (Up to 50 users, Full data migration + config)
* Enterprise: ₹${pricing.emailEnterprise} (Unlimited users, Complex migration + support)

[TENANT SETUP PLANS]
* Basic: ₹${pricing.tenantBasic} (Basic setup users + domain)
* Standard: ₹${pricing.tenantStandard} (Security + policies + admin setup)
* Enterprise: ₹${pricing.tenantEnterprise} (Full config + compliance + optimization)

[SITE RECOVERY PLANS]
* Basic: ₹${pricing.siteRecoveryBasic}
* Standard: ₹${pricing.siteRecoveryStandard}
* Enterprise: ₹${pricing.siteRecoveryEnterprise}

[BACKUP PLANS]
* Basic: ₹${pricing.backupBasic}
* Standard: ₹${pricing.backupStandard}
* Enterprise: ₹${pricing.backupEnterprise}

⚠️ IMPORTANT PRICING NOTES:
* Price changes based on scenario and infrastructure.
* Licenses and software are NOT included.
* Taxes (${pricing.taxRate}%) are NOT included and will be added in the final quote.
`;

    const messages = [
      { role: 'system', content: SYSTEM_INSTRUCTION },
      ...history.map((msg) => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      })),
      { role: 'user', content: message }
    ];

    // 2. Call Cloudflare Workers AI
    const url = `https://api.cloudflare.com/client/v4/accounts/${env.CLOUDFLARE_ACCOUNT_ID}/ai/run/${cloudflareModelId}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.CLOUDFLARE_API_TOKEN}`,
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

    const result = await response.json();
    let botReply = "Our AI is currently assisting other customers. Please email our sales team directly.";
    let showForm = false;

    if (result.result && result.result.response) {
      botReply = result.result.response.trim();
    } else if (result.response) {
      botReply = result.response.trim();
    }

    if (botReply.toLowerCase().includes("secure input box") || botReply.toLowerCase().includes("input box below")) {
      showForm = true;
    }

    return new Response(JSON.stringify({ response: botReply, showForm }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error('SERVER ERROR:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error', details: error.message }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
