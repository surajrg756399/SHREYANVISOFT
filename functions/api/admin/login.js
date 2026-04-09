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

    // 1. Get or Bootstrap Admins
    let admins = await env.KV.get("admin_users", "json");
    if (!admins) {
      // Bootstrap the master admin if none exist
      admins = [{ email: "sales@shreyanvisoft.com", role: "superadmin", password: "" }];
      await env.KV.put("admin_users", JSON.stringify(admins));
    }

    const adminUser = admins.find(a => a.email === email);
    if (!adminUser) {
      return new Response(JSON.stringify({ success: false, error: "Unauthorized Access" }), { status: 401 });
    }

    let isValid = false;

    // 2. Verify Password OR OTP
    if (password && adminUser.password && adminUser.password === password) {
      isValid = true;
    } else if (otp) {
      const storedOtp = await env.KV.get(`otp:${email}`);
      if (storedOtp && storedOtp === otp) {
        isValid = true;
        await env.KV.delete(`otp:${email}`); // Burn OTP after use
      }
    }

    // 3. Issue Session Token
    if (isValid) {
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
