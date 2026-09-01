import http from "node:http";
import https from "node:https";

const job = {
  start: function () {
    const intervalMs = 14 * 60 * 1000; // 14 minutes
    setInterval(() => {
      const base = process.env.BACKEND_URL || process.env.FRONTEND_URL;
      if (!base) return;
      
      const url = new URL("/health", base).href;
      const client = url.startsWith("https:") ? https : http;

      client
        .get(url, (res) => {
          if (res.statusCode === 200) console.log("GET request sent successfully");
          else console.log("GET request failed", res.statusCode);
        })
        .on("error", (e) => console.error("Error while sending request", e));
    }, intervalMs);
    console.log("Keep-alive cron job started.");
  },
};

export default job;