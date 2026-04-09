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

    // 1. Rate Limiting (5 per day per email)
    // Requires a KV binding named "KV"
    if (env.KV) {
      const today = new Date().toISOString().split('T')[0];
      const limitKey = `limit:${email}:${today}`;
      const count = parseInt(await env.KV.get(limitKey) || "0");

      if (count >= 5) {
        return new Response(JSON.stringify({ 
          success: false, 
          error: "Daily limit reached (5 codes per day). Please try again tomorrow or contact sales@shreyanvisoft.com." 
        }), { status: 429 });
      }

      // Increment count (expires at end of day)
      await env.KV.put(limitKey, (count + 1).toString(), { expirationTtl: 86400 });
    }

    // 2. Determine Target Email & Validate Admins
    let targetEmail = email;
    
    if (type === 'admin') {
      if (env.KV) {
        const admins = await env.KV.get("admin_users", "json") || [{ email: "sales@shreyanvisoft.com", role: "superadmin" }];
        const isAdmin = admins.some(a => a.email.toLowerCase() === email.toLowerCase());
        
        if (!isAdmin) {
          return new Response(JSON.stringify({ success: false, error: "Unauthorized email address." }), { status: 403 });
        }
        targetEmail = email; // Send directly to the requested admin's email
      } else {
        // Fallback if KV isn't ready
        targetEmail = "sales@shreyanvisoft.com";
      }
    }

    // 3. Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // 4. Store OTP in KV (expires in 10 minutes)
    if (env.KV) {
      await env.KV.put(`otp:${targetEmail}`, otp, { expirationTtl: 600 });
    }

    // 4. Send Email via Cloudflare Email Service
    // Requires an Email Service binding named "SEND_EMAIL"
    if (env.SEND_EMAIL) {
      const subject = type === 'admin' ? "🚨 SHREYANVISOFT Admin Access Code 🚨" : "✨ SHREYANVISOFT AI Playground Access Code ✨";
      const body = `
        Your secure access code is: ${otp}
        
        This code will expire in 10 minutes.
        Requested by: ${email}
        
        If you did not request this code, please ignore this email.
        
        SHREYANVISOFT™ | Secure IT Infrastructure Solutions
      `;

      try {
        await env.SEND_EMAIL.send({
          from: "no-reply@shreyanvisoft.com", // Must be a verified domain in Cloudflare Email Routing
          to: targetEmail,
          subject: subject,
          content: [
            {
              type: "text/plain",
              value: body
            }
          ]
        });
      } catch (emailError) {
        console.error("Email Sending Error:", emailError.message);
        // Fallback: If email service fails, we still return success in dev mode 
        // but in production, you'd want to handle this.
        return new Response(JSON.stringify({ 
          success: false, 
          error: "Email delivery failed. Please ensure Cloudflare Email Routing is configured." 
        }), { status: 500 });
      }
    } else {
      // If no email service, we log it (useful for local testing)
      console.log(`[DEV MODE] OTP for ${targetEmail}: ${otp}`);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: type === 'admin' ? "Admin code sent to sales inbox." : "Access code sent to your email." 
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
