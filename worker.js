export default {
  async scheduled(event, env, ctx) {
    console.log("Scheduled task triggered");
    const response = await fetch("https://schedulercontent.pages.dev/api/publish", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": "cs_worker_2025_secure_key_789xyz" }
    });
    const result = await response.json();
    console.log("Result:", result);
  },

  async fetch(request, env, ctx) {
    return new Response("Content Scheduler Worker");
  }
};
