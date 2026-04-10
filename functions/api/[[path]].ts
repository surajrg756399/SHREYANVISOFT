/// <reference types="@cloudflare/workers-types" />

interface Env {
  DB: D1Database;
  AI: any;
  KV: KVNamespace;
  CLOUDFLARE_ACCOUNT_ID: string;
  CLOUDFLARE_API_TOKEN: string;
  ADMIN_EMAIL: string;
  ADMIN_PASSWORD: string;
  VITE_FORMSPREE_URL: string;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env, params } = context;
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;

  // Helper to handle CORS
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  if (method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // --- PUBLIC ROUTES ---

    // GET /api/pricing
    if (path === '/api/pricing' && method === 'GET') {
      const result = await env.DB.prepare('SELECT data FROM pricing WHERE id = 1').first<{ data: string }>();
      const pricing = result ? JSON.parse(result.data) : {
        taxRate: 18, intlBankFee: 5, globalMarkup: 0,
        emailBasic: "5,100 - 10,200", emailStandard: "10,200 - 25,500", emailEnterprise: "25,500+",
        tenantBasic: "3,060 - 7,140", tenantStandard: "7,140 - 15,300", tenantEnterprise: "15,300+",
        siteRecoveryBasic: "8,160 - 15,300", siteRecoveryStandard: "15,300 - 40,800", siteRecoveryEnterprise: "40,800+",
        backupBasic: "5,100 - 10,200", backupStandard: "10,200 - 25,500", backupEnterprise: "25,500+"
      };
      return new Response(JSON.stringify(pricing), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // POST /api/ai/unlock
    if (path === '/api/ai/unlock' && method === 'POST') {
      const { name, email, phone } = await request.json() as any;
      const ip = request.headers.get('cf-connecting-ip') || 'unknown';
      
      // Check rate limit in D1
      const usage = await env.DB.prepare('SELECT * FROM usage_logs WHERE ip = ?').bind(ip).first<any>();
      if (usage && usage.blocked_until > Date.now()) {
        const days = Math.ceil((usage.blocked_until - Date.now()) / (1000 * 60 * 60 * 24));
        return new Response(JSON.stringify({ success: false, error: `Limit reached. Try after ${days} days.` }), { status: 429, headers: corsHeaders });
      }

      // Send to Formspree
      const formUrl = env.VITE_FORMSPREE_URL || "https://formspree.io/f/mnjoopbq";
      await fetch(formUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: 'AI Unlock', name, email, phone, ip })
      });

      return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
    }

    // POST /api/chat
    if (path === '/api/chat' && method === 'POST') {
      const { message, model, history } = await request.json() as any;
      const ip = request.headers.get('cf-connecting-ip') || 'unknown';

      // Rate limit check
      let usage = await env.DB.prepare('SELECT * FROM usage_logs WHERE ip = ?').bind(ip).first<any>();
      if (usage && usage.blocked_until > Date.now()) {
        return new Response(JSON.stringify({ error: 'Limit reached. Try after 5 days.' }), { status: 429, headers: corsHeaders });
      }

      const count = (usage?.count || 0) + 1;
      let blockedUntil = 0;
      if (count > 5) {
        blockedUntil = Date.now() + (5 * 24 * 60 * 60 * 1000);
      }

      await env.DB.prepare('INSERT OR REPLACE INTO usage_logs (ip, count, blocked_until) VALUES (?, ?, ?)')
        .bind(ip, count, blockedUntil).run();

      if (blockedUntil > 0) {
        return new Response(JSON.stringify({ error: 'Limit reached. Try after 5 days.' }), { status: 429, headers: corsHeaders });
      }

      // Workers AI Call
      const modelId = model === 'gemma' ? '@cf/google/gemma-7b-it' : (model === 'qwen' ? '@cf/qwen/qwen1.5-7b-chat' : '@cf/meta/llama-3-8b-instruct');
      const aiResponse = await env.AI.run(modelId, {
        messages: [
          { role: 'system', content: 'You are the expert AI Sales Executive for SHREYANVISOFT.' },
          ...history,
          { role: 'user', content: message }
        ]
      });

      return new Response(JSON.stringify({ response: aiResponse.response }), { headers: corsHeaders });
    }

    // --- ADMIN ROUTES ---
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.split(' ')[1];

    // Admin Login
    if (path === '/api/admin/login' && method === 'POST') {
      const { email, password } = await request.json() as any;
      
      // Check Master Admin from Env
      if (email === env.ADMIN_EMAIL && password === env.ADMIN_PASSWORD) {
        const sessionToken = crypto.randomUUID();
        await env.KV.put(`admin_session_${sessionToken}`, JSON.stringify({ email, role: 'superadmin' }), { expirationTtl: 3600 });
        return new Response(JSON.stringify({ success: true, token: sessionToken, role: 'superadmin' }), { headers: corsHeaders });
      }

      // Check DB Admins
      const admin = await env.DB.prepare('SELECT * FROM admins WHERE email = ? AND password = ?').bind(email, password).first<any>();
      if (admin) {
        const sessionToken = crypto.randomUUID();
        await env.KV.put(`admin_session_${sessionToken}`, JSON.stringify({ email: admin.email, role: admin.role }), { expirationTtl: 3600 });
        return new Response(JSON.stringify({ success: true, token: sessionToken, role: admin.role }), { headers: corsHeaders });
      }

      return new Response(JSON.stringify({ error: 'Invalid credentials' }), { status: 401, headers: corsHeaders });
    }

    // Admin Auth Check
    const adminSession = token ? await env.KV.get(`admin_session_${token}`) : null;
    if (path.startsWith('/api/admin/') && path !== '/api/admin/login') {
      if (!adminSession) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
    }

    // GET /api/admin/config
    if (path === '/api/admin/config' && method === 'GET') {
      const pResult = await env.DB.prepare('SELECT data FROM pricing WHERE id = 1').first<{ data: string }>();
      const pricing = pResult ? JSON.parse(pResult.data) : {};
      const admins = await env.DB.prepare('SELECT email, role FROM admins').all();
      return new Response(JSON.stringify({ pricing, admins: admins.results }), { headers: corsHeaders });
    }

    // POST /api/admin/config
    if (path === '/api/admin/config' && method === 'POST') {
      const { pricing, admins } = await request.json() as any;
      if (pricing) {
        await env.DB.prepare('INSERT OR REPLACE INTO pricing (id, data) VALUES (1, ?)').bind(JSON.stringify(pricing)).run();
      }
      if (admins) {
        // Simple sync: delete all and re-insert (caution: in production use better sync)
        for (const admin of admins) {
          await env.DB.prepare('INSERT OR REPLACE INTO admins (email, password, role) VALUES (?, ?, ?)')
            .bind(admin.email, admin.password || '', admin.role).run();
        }
      }
      return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
    }

    // GET /api/admin/clients
    if (path === '/api/admin/clients' && method === 'GET') {
      const clients = await env.DB.prepare('SELECT * FROM clients').all();
      const results = clients.results.map((c: any) => ({ ...JSON.parse(c.data), id: c.id }));
      return new Response(JSON.stringify({ clients: results }), { headers: corsHeaders });
    }

    // POST /api/admin/clients
    if (path === '/api/admin/clients' && method === 'POST') {
      const { clients } = await request.json() as any;
      for (const client of clients) {
        await env.DB.prepare('INSERT OR REPLACE INTO clients (id, data) VALUES (?, ?)')
          .bind(client.id, JSON.stringify(client)).run();
      }
      return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
    }

    // GET /api/admin/quotes
    if (path === '/api/admin/quotes' && method === 'GET') {
      const quotes = await env.DB.prepare('SELECT * FROM quotes').all();
      const results = quotes.results.map((q: any) => ({ ...JSON.parse(q.data), id: q.id }));
      return new Response(JSON.stringify({ quotes: results }), { headers: corsHeaders });
    }

    // POST /api/admin/quotes
    if (path === '/api/admin/quotes' && method === 'POST') {
      const { quotes } = await request.json() as any;
      for (const quote of quotes) {
        await env.DB.prepare('INSERT OR REPLACE INTO quotes (id, data) VALUES (?, ?)')
          .bind(quote.id, JSON.stringify(quote)).run();
      }
      return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
    }

    // --- CLIENT ROUTES ---
    
    // POST /api/client/login
    if (path === '/api/client/login' && method === 'POST') {
      const { email, password } = await request.json() as any;
      const clients = await env.DB.prepare('SELECT * FROM clients').all();
      const client = clients.results.find((c: any) => {
        const data = JSON.parse(c.data);
        return data.email === email && data.password === password;
      });

      if (client) {
        const sessionToken = crypto.randomUUID();
        await env.KV.put(`client_session_${sessionToken}`, client.id, { expirationTtl: 3600 });
        return new Response(JSON.stringify({ success: true, token: sessionToken }), { headers: corsHeaders });
      }
      return new Response(JSON.stringify({ error: 'Invalid credentials' }), { status: 401, headers: corsHeaders });
    }

    const clientSessionId = token ? await env.KV.get(`client_session_${token}`) : null;
    if (path.startsWith('/api/client/') && path !== '/api/client/login') {
      if (!clientSessionId) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
    }

    // GET /api/client/data
    if (path === '/api/client/data' && method === 'GET') {
      const clientRow = await env.DB.prepare('SELECT * FROM clients WHERE id = ?').bind(clientSessionId).first<any>();
      const client = JSON.parse(clientRow.data);
      const quotesRows = await env.DB.prepare('SELECT * FROM quotes').all();
      const quotes = quotesRows.results
        .map((q: any) => JSON.parse(q.data))
        .filter((q: any) => q.clientId === clientSessionId);
      
      return new Response(JSON.stringify({ client, quotes }), { headers: corsHeaders });
    }

    // POST /api/client/update-info
    if (path === '/api/client/update-info' && method === 'POST') {
      const { migrationDetails, orderNotes } = await request.json() as any;
      const clientRow = await env.DB.prepare('SELECT * FROM clients WHERE id = ?').bind(clientSessionId).first<any>();
      const clientData = JSON.parse(clientRow.data);
      const updated = { ...clientData, migrationDetails, orderNotes };
      await env.DB.prepare('UPDATE clients SET data = ? WHERE id = ?').bind(JSON.stringify(updated), clientSessionId).run();
      return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
    }

    return new Response(JSON.stringify({ error: 'Not Found' }), { status: 404, headers: corsHeaders });

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
  }
};
