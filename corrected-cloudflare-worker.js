// CORRECTED Cloudflare Worker Script
// Replace ALL existing code in your Cloudflare Worker with this:

addEventListener("fetch", event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const url = new URL(request.url);
  
  // YOUR ACTUAL REPLIT SERVER URL (confirmed working)
  const replitBaseUrl = "https://b7ab1518-0819-4bb0-bd7f-3ba662471113-00-bxtgdzno5xmc.riker.replit.dev";
  
  const targetUrl = `${replitBaseUrl}${url.pathname}${url.search}`;
  
  const modifiedRequest = new Request(targetUrl, {
    method: request.method,
    headers: {
      ...request.headers,
      "Host": url.hostname, // Pass original hostname for subdomain detection
      "X-Forwarded-Host": url.hostname,
      "X-Forwarded-Proto": "https"
    },
    body: request.body
  });
  
  try {
    const response = await fetch(modifiedRequest);
    
    // Return the response with CORS headers for API endpoints
    const newResponse = new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: {
        ...response.headers,
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization"
      }
    });
    
    return newResponse;
  } catch (error) {
    console.error("Worker error:", error);
    return new Response("Server temporarily unavailable", {
      status: 503,
      headers: { "Content-Type": "text/plain" }
    });
  }
}