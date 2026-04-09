/**
 * SHREYANVISOFT - Admin Clients API
 * Handles GET/POST requests to /api/admin/clients
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
    const validToken = await env.KV.get(`admin_session:${token}`);
    if (!validToken) {
      return new Response(JSON.stringify({ error: "Invalid or expired session" }), { status: 401 });
    }

    if (request.method === 'GET') {
      const clients = await env.KV.get("client_users", "json") || [];
      return new Response(JSON.stringify({ clients }), { headers: { "Content-Type": "application/json" } });
    }

    if (request.method === 'POST') {
      const { clients } = await request.json();
      await env.KV.put("client_users", JSON.stringify(clients));
      return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json" } });
    }

    return new Response("Method not allowed", { status: 405 });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
