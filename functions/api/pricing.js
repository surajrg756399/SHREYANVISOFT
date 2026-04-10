/**
 * SHREYANVISOFT - Public Pricing API
 * Handles GET requests to /api/pricing
 * Fetches dynamic pricing from KV so the frontend can display it.
 */

export async function onRequestGet(context) {
  const { env } = context;

  try {
    // Default pricing fallback
    let pricing = {
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

    if (env.KV) {
      const storedPricing = await env.KV.get("pricing_config", "json");
      if (storedPricing) {
        pricing = { ...pricing, ...storedPricing };
      }
    }

    return new Response(JSON.stringify(pricing), {
      headers: { 
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=60" // Cache for 60 seconds
      }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
