const axios = require("axios");
const { cmd } = require("../command");

cmd({
  pattern: "gdrive2",
  desc: "Download Google Drive files.",
  react: "🌐",
  category: "download",
  filename: __filename
}, async (conn, m, store, {
  from,
  quoted,
  q,
  reply
}) => {
  try {
    if (!q) {
      return reply("❌ Please provide a valid Google Drive link.");
    }

    await conn.sendMessage(from, { react: { text: "⬇️", key: m.key } });

    const apiUrl = `https://bk9.fun/download/gdrive?url=${encodeURIComponent(q)}`;
    const response = await axios.get(apiUrl);
    const data = response.data;

    if (data.status && data.BK9 && data.BK9.downloadUrl) {
      const file = data.BK9;

      await conn.sendMessage(from, { react: { text: "⬆️", key: m.key } });

      await conn.sendMessage(from, {
        document: { url: file.downloadUrl },
        mimetype: file.mimetype || "application/octet-stream",
        fileName: file.fileName || "file",
        caption: `*📁 File Name:* ${file.fileName}\n*📦 Size:* ${file.fileSize}\n\n*© Powered By Mʀ-Sʜᴀʙᴀɴ*`
      }, { quoted: m });

      await conn.sendMessage(from, { react: { text: "✅", key: m.key } });
    } else {
      return reply("⚠️ No download URL found. Please check the Google Drive link.");
    }
  } catch (error) {
    console.error("Error:", error);
    reply("❌ An error occurred while fetching the Google Drive file. Please try again later.");
  }
});