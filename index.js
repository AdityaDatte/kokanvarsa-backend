export default {
  async fetch(request, env, ctx) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method === "POST" && request.url.endsWith("/order")) {
      try {
        const formData = await request.formData();
        const customerName = formData.get("Customer_Name");
        
        return new Response(JSON.stringify({ 
          success: true, 
          message: `ऑर्डर यशस्वीरित्या बॅकएंडवर पोहोचली, ${customerName}!` 
        }), { 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: "काहीतरी चूक झाली!" }), { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        });
      }
    }

    return new Response("कोकण वारसा - Backend API यशस्वीरित्या चालू आहे! 🚀", { 
      headers: corsHeaders 
    });
  }
};
