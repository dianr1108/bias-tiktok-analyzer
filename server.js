import express from "express";
import cors from "cors";
import { scrapeTikTokProfile } from "./scraper.js";

const app = express();
app.use(cors());

app.get("/api/tiktok/:username", async (req, res) => {
  try {
    const username = req.params.username;
    const result = await scrapeTikTokProfile(username);

    res.json({
      success: true,
      analyzed_by: "BIAS TikTok Analyzer",
      profile: result,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () =>
  console.log(`✅ BIAS TikTok Analyzer running on port ${port}`)
);
