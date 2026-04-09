/**
 * SHREYANVISOFT - OTP Verification
 * Handles POST requests to /api/otp/verify
 */

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const { email, otp } = await request.json();
    
    if (!email || !otp) {
      return new Response(JSON.stringify({ error: "Email and OTP are required" }), { status: 400 });
    }

    // 1. Check KV for stored OTP
    if (!env.KV) {
      return new Response(JSON.stringify({ error: "KV storage not configured" }), { status: 500 });
    }

    const storedOtp = await env.KV.get(`otp:${email}`);

    if (storedOtp && storedOtp === otp) {
      // OTP is correct - delete it so it can't be used again
      await env.KV.delete(`otp:${email}`);
      
      return new Response(JSON.stringify({ success: true }), {
        headers: { "Content-Type": "application/json" }
      });
    } else {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Invalid or expired access code." 
      }), { status: 400 });
    }

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
