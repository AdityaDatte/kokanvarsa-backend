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

    const url = new URL(request.url);

    // १. नवीन API: डेटाबेसमधून प्रॉडक्ट्स आणण्यासाठी (GET /products)
    if (request.method === "GET" && url.pathname === "/products") {
      try {
        // env.DB मुळे Worker थेट तुझ्या D1 डेटाबेसशी बोलतो
        const { results } = await env.DB.prepare("SELECT * FROM products").all();
        
        return new Response(JSON.stringify(results), { 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: "डेटाबेसशी संपर्क झाला नाही!" }), { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        });
      }
    }

    // २. जुनी API: ऑर्डर्स गुगल शीटवर पाठवण्यासाठी (POST /order)
    if (request.method === "POST" && url.pathname === "/order") {
      try {
        const formData = await request.formData();
        
        const orderData = {
          Customer_Name: formData.get("Customer_Name") || "नाव नाही",
          Phone_Number: formData.get("Phone_Number") || "नंबर नाही", 
          Address: formData.get("Address") || "पत्ता नाही",
          Order_Details: formData.get("Order_Details") || "माहिती नाही",
          Total_Amount: formData.get("Total_Amount") || "0"
        };

        const googleScriptURL = "https://script.google.com/macros/s/AKfycbyDptEll5w89b8_vlIdqa5GQPGUD2qk8K_vuBp3lLQrqzNHtyDHOfYTltifU9g7sX-e/exec";
        
        await fetch(googleScriptURL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(orderData)
        });

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

    // जर कुणी थेट लिंक उघडली तर
    return new Response("कोकण वारसा - Full Stack Backend API यशस्वीरित्या चालू आहे! 🚀", { 
      headers: corsHeaders 
    });
  }
};
