/**
 * SHREYANVISOFT - Admin Configuration (Pricing & Users)
 * Handles GET/POST requests to /api/admin/config
 */

export async function onRequest(context) {
  const { request, env } = context;

  try {
    if (!env.KV) {
      return new Response(JSON.stringify({ error: "KV storage not configured" }), { status: 500 });
    }

    // 1. Authenticate Request
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }
    
    const token = authHeader.split(" ")[1];
    const email = await env.KV.get(`session:${token}`);
    
    if (!email) {
      return new Response(JSON.stringify({ error: "Session expired or invalid" }), { status: 401 });
    }

    // 2. Handle GET (Fetch Config)
    if (request.method === "GET") {
      const pricing = await env.KV.get("pricing_config", "json") || {
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
      const admins = await env.KV.get("admin_users", "json") || [];
      
      // Don't send passwords back to the client
      const safeAdmins = admins.map(a => ({ email: a.email, role: a.role, hasPassword: !!a.password }));

      return new Response(JSON.stringify({ pricing, admins: safeAdmins }), {
        headers: { "Content-Type": "application/json" }
      });
    }

    // 3. Handle POST (Update Config)
    if (request.method === "POST") {
      const body = await request.json();
      
      if (body.pricing) {
        await env.KV.put("pricing_config", JSON.stringify(body.pricing));
      }
      
      if (body.admins) {
        // Only allow superadmin to update admins
        const currentAdmins = await env.KV.get("admin_users", "json") || [];
        const currentUser = currentAdmins.find(a => a.email === email);
        
        if (currentUser && currentUser.role === 'superadmin') {
          // Merge passwords for existing users if not provided in update
          const updatedAdmins = body.admins.map(newAdmin => {
            const existing = currentAdmins.find(a => a.email === newAdmin.email);
            return {
              ...newAdmin,
              password: newAdmin.password !== undefined ? newAdmin.password : (existing ? existing.password : "")
            };
          });
          
          // Ensure at least one superadmin remains
          if (!updatedAdmins.some(a => a.role === 'superadmin')) {
             return new Response(JSON.stringify({ error: "Cannot remove all superadmins" }), { status: 400 });
          }
          
          await env.KV.put("admin_users", JSON.stringify(updatedAdmins));
        } else {
          return new Response(JSON.stringify({ error: "Only superadmins can modify users" }), { status: 403 });
        }
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { "Content-Type": "application/json" }
      });
    }

    return new Response("Method not allowed", { status: 405 });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
