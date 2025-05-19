const { cmd } = require('../command');
const axios = require('axios');

cmd({
  pattern: "tiktok3",
  alias: ["ttdl3", "tt3", "tiktokdl"],
  desc: "Download TikTok video or audio from new API",
  category: "downloader",
  react: "🎵",
  filename: __filename
},
async (conn, mek, m, { from, args, q, reply }) => {
  try {
    if (!q) return reply("Please provide a TikTok video URL.");
    if (!q.includes("tiktok.com")) return reply("Invalid TikTok URL.");

    // React to show processing
    await conn.sendMessage(from, { react: { text: "🎵", key: mek.key } });

    // Use the new API endpoint
    const apiUrl = `https://api.cypherx.dpdns.org/tiktok?url=${encodeURIComponent(q)}`;
    const { data } = await axios.get(apiUrl);

    if (data.status !== "success" || !Array.isArray(data.results)) {
      return reply("Failed to fetch TikTok video/audio.");
    }

    // Prepare message with all available download options
    let caption = `🎵 *TikTok Download Links* 🎵\n\n`;
    data.results.forEach((item, i) => {
      // Skip invalid or promo links
      if (!item.link || item.link === "https://savetikpro.com") return;
      caption += `${i + 1}. ${item.quality}\n${item.link}\n\n`;
    });

    // Send message with all download links
    await conn.sendMessage(from, { text: caption }, { quoted: mek });

  } catch (error) {
    console.error("Error in TikTok downloader command:", error);
    reply("An error occurred while processing your request.");
  }
});
