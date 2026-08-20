export default {
  async fetch(request, env, ctx) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, x-admin-pass", // इथे x-admin-pass ॲड केला
    };

    if (request.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
    const url = new URL(request.url);

    // तुझा सिक्रेट पासवर्ड (हा कुणालाही सांगू नकोस)
    const ADMIN_PASSWORD = "Radhaa@18"; 

    // १. GET /products (सर्वांसाठी खुले)
    if (request.method === "GET" && url.pathname === "/products") {
      try {
        const { results } = await env.DB.prepare("SELECT * FROM products").all();
        return new Response(JSON.stringify(results), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      } catch (error) { return new Response(JSON.stringify({ error: "डेटाबेस एरर!" }), { status: 500, headers: corsHeaders }); }
    }

    // २. POST /order (सर्वांसाठी खुले)
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

    // ३. POST /add-product (फक्त पासवर्ड असलेल्या ॲडमिनसाठी)
    if (request.method === "POST" && url.pathname === "/add-product") {
      if (request.headers.get("x-admin-pass") !== ADMIN_PASSWORD) {
        return new Response(JSON.stringify({ error: "चुकीचा पासवर्ड! प्रवेश निषिद्ध." }), { status: 401, headers: corsHeaders });
      }
      try {
        const body = await request.json();
        await env.DB.prepare(
          "INSERT INTO products (name, price, image_url, stock_status, unit) VALUES (?, ?, ?, ?, ?)"
        ).bind(body.name, body.price, body.image_url, body.stock_status, body.unit || "नग").run();
        return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      } catch (error) { return new Response(JSON.stringify({ error: "डेटाबेस एरर!" }), { status: 500, headers: corsHeaders }); }
    }

    // ४. DELETE /delete-product (फक्त पासवर्ड असलेल्या ॲडमिनसाठी)
    if (request.method === "DELETE" && url.pathname.startsWith("/delete-product")) {
      if (request.headers.get("x-admin-pass") !== ADMIN_PASSWORD) {
        return new Response(JSON.stringify({ error: "चुकीचा पासवर्ड! प्रवेश निषिद्ध." }), { status: 401, headers: corsHeaders });
      }
      try {
        const id = url.searchParams.get("id");
        await env.DB.prepare("DELETE FROM products WHERE id = ?").bind(id).run();
        return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      } catch (error) { return new Response(JSON.stringify({ error: "डेटाबेस एरर!" }), { status: 500, headers: corsHeaders }); }
    }

    // ५. POST /verify-admin (पासवर्ड चेक करण्यासाठी)
    if (request.method === "POST" && url.pathname === "/verify-admin") {
      if (request.headers.get("x-admin-pass") === ADMIN_PASSWORD) {
        return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      } else {
        return new Response(JSON.stringify({ error: "चुकीचा पासवर्ड!" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
    }
    
    return new Response("API Running! 🚀", { headers: corsHeaders });
  }
};
