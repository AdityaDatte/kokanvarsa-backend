export default {
  async fetch(request, env, ctx) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
    const url = new URL(request.url);

    // १. GET /products (सर्व प्रॉडक्ट्स आणणे)
    if (request.method === "GET" && url.pathname === "/products") {
      try {
        const { results } = await env.DB.prepare("SELECT * FROM products").all();
        return new Response(JSON.stringify(results), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      } catch (error) { return new Response(JSON.stringify({ error: "डेटाबेस एरर!" }), { status: 500, headers: corsHeaders }); }
    }

    // २. POST /order (गुगल शीटवर ऑर्डर पाठवणे)
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
        await fetch(googleScriptURL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(orderData) });
        return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      } catch (error) { return new Response(JSON.stringify({ error: "चूक झाली!" }), { status: 500, headers: corsHeaders }); }
    }

    // ३. POST /add-product (नवीन प्रॉडक्ट + Unit सह)
    if (request.method === "POST" && url.pathname === "/add-product") {
      try {
        const body = await request.json();
        await env.DB.prepare(
          "INSERT INTO products (name, price, image_url, stock_status, unit) VALUES (?, ?, ?, ?, ?)"
        ).bind(body.name, body.price, body.image_url, body.stock_status, body.unit || "नग").run();
        return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      } catch (error) { return new Response(JSON.stringify({ error: "डेटाबेस एरर!" }), { status: 500, headers: corsHeaders }); }
    }

    // ४. DELETE /delete-product (प्रॉडक्ट काढून टाकण्यासाठी)
    if (request.method === "DELETE" && url.pathname.startsWith("/delete-product")) {
      try {
        const id = url.searchParams.get("id");
        await env.DB.prepare("DELETE FROM products WHERE id = ?").bind(id).run();
        return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      } catch (error) { return new Response(JSON.stringify({ error: "डेटाबेस एरर!" }), { status: 500, headers: corsHeaders }); }
    }

    return new Response("API Running! 🚀", { headers: corsHeaders });
  }
};
