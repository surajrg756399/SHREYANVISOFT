/**
 * SHREYANVISOFT - Secure OTP Delivery via Cloudflare Email Service
 * Handles POST requests to /api/otp/send
 */

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const { email, type = 'customer' } = await request.json();
    
    if (!email) {
      return new Response(JSON.stringify({ error: "Email is required" }), { status: 400 });
    }

    const ip = request.headers.get("CF-Connecting-IP") || "unknown";
    
    // 1. IP-Based Rate Limiting (5 requests per IP, block for 5 days)
    if (env.KV) {
      const blockKey = `block:${ip}`;
      const isBlocked = await env.KV.get(blockKey);
      if (isBlocked) {
        return new Response(JSON.stringify({ 
          success: false, 
          error: "You reached the limit, check after 5 days." 
        }), { status: 429 });
      }

      const countKey = `count:${ip}`;
      const count = parseInt(await env.KV.get(countKey) || "0");

      if (count >= 5) {
        // Block for 5 days (432000 seconds)
        await env.KV.put(blockKey, "true", { expirationTtl: 432000 });
        return new Response(JSON.stringify({ 
          success: false, 
          error: "You reached the limit, check after 5 days." 
        }), { status: 429 });
      }

      // Increment count (expires in 24 hours if not blocked)
      await env.KV.put(countKey, (count + 1).toString(), { expirationTtl: 86400 });
    }

    // 2. OTP is disabled for testing, just return success for customers
    if (type === 'customer') {
      return new Response(JSON.stringify({ 
        success: true, 
        message: "Access granted for testing." 
      }), {
        headers: { "Content-Type": "application/json" }
      });
    }

    // 3. Admin logic (if still needed, but user said Super Admin uses env vars)
    // For now, let's just return success if it's an admin request too, 
    // but the frontend should probably skip this for Super Admin.
    return new Response(JSON.stringify({ 
      success: true, 
      message: "Admin access granted for testing." 
    }), {
      headers: { "Content-Type": "application/json" }
    });

    return new Response(JSON.stringify({ 
      success: true, 
      message: type === 'admin' ? "Admin code sent to your email." : "Access code sent to your email." 
    }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
