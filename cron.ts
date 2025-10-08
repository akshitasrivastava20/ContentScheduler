import cron from "node-cron";
import fetch from "node-fetch";

// Get the base URL for the API calls
const baseUrl = process.env.NODE_ENV === "production" 
  ? "https://scheduler.akshita.xyz"
  : "http://localhost:3000";

console.log("🚀 Content Scheduler Cron Job Started");
console.log(`📡 Using API base URL: ${baseUrl}`);

// Run every 5 minutes to check for scheduled posts
cron.schedule("*/5 * * * *", async () => {
  console.log("🔍 Checking for scheduled posts...", new Date().toISOString());
  
  try {
    const res = await fetch(`${baseUrl}/api/publish`, { 
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    const data = await res.json() as { 
      success: boolean; 
      postedCount?: number; 
      totalFound?: number; 
      error?: string; 
    };
    
    if (data.success) {
      if (data.postedCount && data.postedCount > 0) {
        console.log(`✅ Posted ${data.postedCount}/${data.totalFound || 0} scheduled posts`);
      } else {
        console.log("📭 No posts ready to publish");
      }
    } else {
      console.error("❌ Publish API returned error:", data.error);
    }
  } catch (error) {
    console.error("❌ Cron job failed:", error);
  }
});

// Optional: Add a health check cron that runs every hour
cron.schedule("0 * * * *", () => {
  console.log("💚 Cron job is running healthy", new Date().toISOString());
});
