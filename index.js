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
        
        // फॉर्ममधून आलेला ग्राहकाचा डेटा गोळा करणे
        const orderData = {
          Customer_Name: formData.get("Customer_Name") || "नाव नाही",
          Phone_Number: formData.get("Phone_Number") || "नंबर नाही", 
          Address: formData.get("Address") || "पत्ता नाही",
          Order_Details: formData.get("Order_Details") || "माहिती नाही",
          Total_Amount: formData.get("Total_Amount") || "0"
        };

        // तुझी Google Sheets ची लिंक (Webhook)
        const googleScriptURL = "https://script.google.com/macros/s/AKfycbyDptEll5w89b8_vlIdqa5GQPGUD2qk8K_vuBp3lLQrqzNHtyDHOfYTltifU9g7sX-e/exec";
        
        // गुगल शीटला डेटा पाठवणे
        await fetch(googleScriptURL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(orderData)
        });

        // ग्राहकाला सक्सेस मेसेज देणे
        return new Response(JSON.stringify({ 
          success: true, 
          message: `ऑर्डर यशस्वीरित्या नोंदवली गेली, ${orderData.Customer_Name}!` 
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
