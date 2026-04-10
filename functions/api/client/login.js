/**
 * SHREYANVISOFT - Client Login API
 * Handles POST requests to /api/client/login
 */

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const { email, password } = await request.json();

    if (!env.KV) {
      return new Response(JSON.stringify({ error: "KV namespace not bound" }), { status: 500 });
    }

    const clients = await env.KV.get("client_users", "json") || [];
    const client = clients.find(c => c.email.toLowerCase() === email.toLowerCase() && c.password === password);

    if (client) {
      // Generate a simple token
      const token = crypto.randomUUID();
      
      // Store session in KV (expires in 24 hours)
      await env.KV.put(`client_session:${token}`, JSON.stringify({ id: client.id, email: client.email, name: client.name }), { expirationTtl: 86400 });
      
      return new Response(JSON.stringify({ success: true, token }), { headers: { "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ success: false, error: "Invalid email or password" }), { status: 401, headers: { "Content-Type": "application/json" } });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
