/**
 * SHREYANVISOFT - Admin Login
 * Handles POST requests to /api/admin/login
 */

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const { email, password, otp } = await request.json();

    if (!env.KV) {
      return new Response(JSON.stringify({ error: "KV storage not configured" }), { status: 500 });
    }

    // 1. Check Master Admin from Environment Variables (Predefined Credentials)
    let isValid = false;
    let adminUser = null;

    if (env.ADMIN_EMAIL && env.ADMIN_PASSWORD && email.toLowerCase() === env.ADMIN_EMAIL.toLowerCase() && password === env.ADMIN_PASSWORD) {
      isValid = true;
      adminUser = { email: env.ADMIN_EMAIL, role: "superadmin" };
    }

    // 2. If not master admin, check KV storage for other admins/superadmins
    if (!isValid) {
      const admins = await env.KV.get("admin_users", "json") || [];
      adminUser = admins.find(a => a.email.toLowerCase() === email.toLowerCase());
      
      if (adminUser && password && adminUser.password === password) {
        isValid = true;
      }
    }

    if (!isValid) {
      return new Response(JSON.stringify({ success: false, error: "Invalid credentials" }), { status: 401 });
    }

    // 3. Issue Session Token
    if (isValid && adminUser) {
      // Generate a simple random token
      const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
      await env.KV.put(`session:${token}`, email, { expirationTtl: 86400 }); // 24 hours

      return new Response(JSON.stringify({ success: true, token, email, role: adminUser.role }), {
        headers: { "Content-Type": "application/json" }
      });
    }

    return new Response(JSON.stringify({ success: false, error: "Invalid credentials or expired OTP" }), { 
      status: 401,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
