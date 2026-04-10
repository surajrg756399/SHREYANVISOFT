/**
 * SHREYANVISOFT - Admin Quotes API
 * Handles GET/POST requests to /api/admin/quotes
 */

export async function onRequest(context) {
  const { request, env } = context;

  try {
    if (!env.KV) {
      return new Response(JSON.stringify({ error: "KV namespace not bound" }), { status: 500 });
    }

    // Verify Admin Token
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    const validToken = await env.KV.get(`session:${token}`);
    if (!validToken) {
      return new Response(JSON.stringify({ error: "Invalid or expired session" }), { status: 401 });
    }

    if (request.method === 'GET') {
      const quotes = await env.KV.get("client_quotes", "json") || [];
      return new Response(JSON.stringify({ quotes }), { headers: { "Content-Type": "application/json" } });
    }

    if (request.method === 'POST') {
      const { quotes } = await request.json();
      await env.KV.put("client_quotes", JSON.stringify(quotes));
      return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json" } });
    }

    return new Response("Method not allowed", { status: 405 });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
