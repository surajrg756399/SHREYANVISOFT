/**
 * SHREYANVISOFT - Lead Capture & D1 Storage
 * Handles POST requests to /api/lead
 * This function saves the lead to Cloudflare D1 and forwards it to Formspree.
 */

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    // Clone the request to read it twice (once for D1, once for Formspree)
    const clonedRequest = request.clone();
    const formData = await request.formData();
    const data = Object.fromEntries(formData.entries());

    // 0. Verify Cloudflare Turnstile (if secret is configured)
    const turnstileToken = data['cf-turnstile-response'];
    if (env.TURNSTILE_SECRET_KEY && turnstileToken) {
      const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `secret=${env.TURNSTILE_SECRET_KEY}&response=${turnstileToken}`
      });
      const verifyData = await verifyRes.json();
      if (!verifyData.success) {
        return new Response(JSON.stringify({ error: "Turnstile verification failed" }), { status: 403 });
      }
    }

    // 1. Save to Cloudflare D1 Database
    // Ensure you have created a D1 binding named "DB" in your Cloudflare Pages settings
    if (env.DB) {
      try {
        await env.DB.prepare(
          "INSERT INTO leads (name, email, phone, service, details, timestamp) VALUES (?, ?, ?, ?, ?, ?)"
        ).bind(
          data.name || data.Name || "Unknown",
          data.email || data.Email || "Unknown",
          data.phone || data.Phone || "Unknown",
          data.service || data.Lead_Source || "Chat Lead",
          data.details || data.Full_Chat_Transcript || "No details provided",
          new Date().toISOString()
        ).run();
      } catch (dbError) {
        console.error("D1 Storage Error:", dbError.message);
        // We continue even if DB fails so the email still goes out
      }
    }

    // 2. Forward to Formspree for Email Notification
    const formspreeUrl = env.VITE_FORMSPREE_URL || "https://formspree.io/f/mnjoopbq";
    
    // We use the cloned request to send the exact same multi-part form data to Formspree
    const response = await fetch(formspreeUrl, {
      method: "POST",
      body: clonedRequest.body,
      headers: { 
        'Accept': 'application/json',
        // Cloudflare automatically handles the boundary for FormData
      }
    });

    const result = await response.json();

    return new Response(JSON.stringify({ success: response.ok, result }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
