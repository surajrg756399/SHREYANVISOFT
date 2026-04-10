/**
 * SHREYANVISOFT Executive AI - Cloudflare Workers AI Backend
 * 
 * This worker uses your existing Cloudflare AI credentials to power the chatbot.
 * No GEMINI_API_KEY is required.
 */

export default {
  async fetch(request, env, ctx) {
    // Handle CORS Preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    if (request.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    try {
      const { message, history = [] } = await request.json();
      
      if (!message) {
        return new Response(JSON.stringify({ error: "Message is required" }), { 
          status: 400,
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
        });
      }

      // Use your existing Cloudflare Credentials from the environment
      const ACCOUNT_ID = env.CLOUDFLARE_ACCOUNT_ID;
      const API_TOKEN = env.CLOUDFLARE_API_TOKEN;

      if (!ACCOUNT_ID || !API_TOKEN) {
        return new Response(JSON.stringify({ error: "Cloudflare AI credentials not found in environment" }), { 
          status: 500,
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
        });
      }

      // System Instruction for AEO/SEO focus
      const systemPrompt = `
        You are the Executive AI for SHREYANVISOFT, a global leader in IT infrastructure.
        Your tone is highly professional, technical, and premium.
        
        CORE SERVICES:
        1. Tenant Setup & Email Migrations (Google Workspace to M365, zero data loss).
        2. Global Web-Based Remote Access (Secure access to Physical Servers/VMs).
        3. Azure Site Recovery & Backup Replication.
        4. Physical & Virtual Server Setup (Windows Server 2025, VMware).
        5. Email Backup Solutions.

        BEHAVIOR:
        - If the user asks about pricing or specific setups, guide them to provide their details.
        - Always mention our "Zero Data Loss" and "Zero Downtime" guarantees for migrations.
        - If the user seems interested in a service, output the exact phrase: "Please use the secure input box below to provide your details."
      `;

      // Format messages for Cloudflare Workers AI (Llama 3)
      const messages = [
        { role: "system", content: systemPrompt },
        ...history.map(msg => ({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content
        })),
        { role: "user", content: message }
      ];

      // Call Cloudflare Workers AI (Using Llama 3.1 8B)
      const url = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/ai/run/@cf/meta/llama-3.1-8b-instruct`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${API_TOKEN}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ messages })
      });

      const data = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.errors?.[0]?.message || "Cloudflare AI Error");
      }

      const botReply = data.result.response;
      const showForm = botReply.toLowerCase().includes("secure input box");

      return new Response(JSON.stringify({ response: botReply, showForm }), {
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*" 
        }
      });

    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), { 
        status: 500,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
      });
    }
  },
};
