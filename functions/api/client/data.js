/**
 * SHREYANVISOFT - Client Data API
 * Handles GET requests to /api/client/data
 */

export async function onRequestGet(context) {
  const { request, env } = context;

  try {
    if (!env.KV) {
      return new Response(JSON.stringify({ error: "KV namespace not bound" }), { status: 500 });
    }

    // Verify Client Token
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    const sessionStr = await env.KV.get(`client_session:${token}`);
    
    if (!sessionStr) {
      return new Response(JSON.stringify({ error: "Invalid or expired session" }), { status: 401 });
    }
    
    const client = JSON.parse(sessionStr);

    // Fetch quotes for this specific client
    const allQuotes = await env.KV.get("client_quotes", "json") || [];
    const clientQuotes = allQuotes.filter(q => q.clientId === client.id);

    return new Response(JSON.stringify({ client, quotes: clientQuotes }), { headers: { "Content-Type": "application/json" } });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
