const { fetchJson } = require("../lib/functions");
const { downloadTiktok } = require("@mrnima/tiktok-downloader");
const { facebook } = require("@mrnima/facebook-downloader");
const cheerio = require("cheerio");
const { igdl } = require("ruhend-scraper");
const axios = require("axios");
const { cmd, commands } = require('../command');

cmd({
    pattern: "ig",
    alias: ["insta", "instagram"],
    desc: "Download Instagram video",
    category: "downloader",
    react: "📷",
    filename: __filename
},
async (conn, mek, m, { from, args, q, reply }) => {
    try {
        if (!q) return reply("Please provide an Instagram video link.");
        if (!q.includes("instagram.com")) return reply("Invalid Instagram link.");
        
        reply("Downloading video, please wait...");
        
        const apiUrl = `https://rest-lily.vercel.app/api/downloader/igdl?url=${q}`;
        const { data } = await axios.get(apiUrl);
        
        if (!data.status || !data.data || !data.data[0]) return reply("Failed to fetch Instagram video.");
        
        const { url } = data.data[0];
        
        const caption = 
`📷 *Instagram Video* 📷\n\n` +
`👤 *Creator* *SHABAN MD*`;
        
        await conn.sendMessage(from, {
            video: { url: url },
            caption: caption,
            contextInfo: { mentionedJid: [m.sender] }
        }, { quoted: mek });
        
    } catch (e) {
        console.error("Error in Instagram downloader command:", e);
        reply(`An error occurred: ${e.message}`);
    }
});

// twitter-dl=======================

cmd({ pattern: "twitter", alias: ["twt", "twdl"], desc: "Download Twitter videos", category: "download", filename: __filename }, async (conn, m, store, { from, quoted, q, reply }) => { try { if (!q || !q.startsWith("https://")) { return conn.sendMessage(from, { text: "❌ Please provide a valid Twitter URL." }, { quoted: m }); }

await conn.sendMessage(from, {
  react: { text: '⏳', key: m.key }
});

const response = await axios.get(`https://bk9.fun/download/twitter-2?url=${q}`);
const data = response.data;

if (!data || !data.status || !data.BK9 || !data.BK9.BK9) {
  return reply("⚠️ Failed to retrieve Twitter video. Please check the link and try again.");
}

const videos = data.BK9.BK9.filter(item => item.type === "video");
if (videos.length === 0) {
  return reply("⚠️ No video found in the provided URL.");
}

const [video1, video2] = videos;

const caption = `〔 *TWITTER DOWNLOADER* 〕\n`
  + `┃▸ *Author:* ${data.BK9.authorName} (@${data.BK9.authorUsername})\n`
  + `┃▸ *Likes:* ${data.BK9.likes}\n`
  + `┃▸ *Replies:* ${data.BK9.replies}\n`
  + `┃▸ *Retweets:* ${data.BK9.retweets}\n`
  + `╰━━━⪼\n\n`
  + `📹 *Download Options:*\n`
  + `1️⃣  *Video 1 (Higher Resolution)*\n`
  + `2️⃣  *Video 2 (Lower Resolution)*\n\n`
  + `📌 *Reply with the number to download your choice.*`;

const sentMsg = await conn.sendMessage(from, {
  text: caption
}, { quoted: m });

const messageID = sentMsg.key.id;

conn.ev.on("messages.upsert", async (msgData) => {
  const receivedMsg = msgData.messages[0];
  if (!receivedMsg.message) return;

  const receivedText = receivedMsg.message.conversation || receivedMsg.message.extendedTextMessage?.text;
  const senderID = receivedMsg.key.remoteJid;
  const isReplyToBot = receivedMsg.message.extendedTextMessage?.contextInfo?.stanzaId === messageID;

  if (isReplyToBot) {
    await conn.sendMessage(senderID, {
      react: { text: '⬇️', key: receivedMsg.key }
    });

    switch (receivedText) {
      case "1":
        await conn.sendMessage(senderID, {
          video: { url: video1.url },
          caption: "📥 *Downloaded SHABAN-MD*"
        }, { quoted: receivedMsg });
        break;

      case "2":
        await conn.sendMessage(senderID, {
          video: { url: video2.url },
          caption: "📥 *Downloaded SHABAN-MD*"
        }, { quoted: receivedMsg });
        break;

      default:
        reply("❌ Invalid option! Please reply with 1 or 2.");
    }
  }
});

} catch (error) { console.error("Error:", error); reply("❌ An error occurred while processing your request. Please try again."); } });



// MediaFire-dl========================

cmd({ pattern: "mediafire", alias: ["mfire"], desc: "To download MediaFire files.", react: "🎥", category: "download", filename: __filename }, async (conn, m, store, { from, quoted, q, reply }) => { try { if (!q) { return reply("❌ Please provide a valid MediaFire link."); }

await conn.sendMessage(from, {
  react: { text: "⏳", key: m.key }
});

const response = await axios.get(`https://bk9.fun/download/mediafire?url=${q}`);
const data = response.data;

if (!data || !data.status || !data.BK9 || !data.BK9.link) {
  return reply("⚠️ Failed to fetch MediaFire download link. Ensure the link is valid and public.");
}

const { link, name, filetype, mime, size } = data.BK9;
const file_name = name || "mediafire_download";
const mime_type = mime || "application/octet-stream";
const file_size = size || "Unknown size";

await conn.sendMessage(from, {
  react: { text: "⬆️", key: m.key }
});

const caption = `〔 *MEDIAFIRE DOWNLOADER* 〕\n`
  + `┃▸ *File Name:* ${file_name}\n`
  + `┃▸ *File Type:* ${filetype || "Unknown"}\n`
  + `┃▸ *File Size:* ${file_size}\n`
  + `╰━━━⪼\n\n`
  + `📥 *Downloading your file...*`;

await conn.sendMessage(from, {
  document: { url: link },
  mimetype: mime_type,
  fileName: file_name,
  caption: caption
}, { quoted: m });

} catch (error) { console.error("Error:", error); reply("❌ An error occurred while processing your request. Please try again."); } });



// apk-dl===========================

cmd({
  pattern: "apk",
  desc: "dl  from mod",
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
      return reply("❌ Please provide an apk name to search.");
    }

    await conn.sendMessage(from, { react: { text: "⏳", key: m.key } });

    const apiUrl = `http://ws75.aptoide.com/api/7/apps/search/query=${q}/limit=1`;
    const response = await axios.get(apiUrl);
    const data = response.data;

    if (!data || !data.datalist || !data.datalist.list.length) {
      return reply("⚠️ No results found for the given app name.");
    }

    const app = data.datalist.list[0];
    const appSize = (app.size / 1048576).toFixed(2); // Convert bytes to MB

    const caption = `*Apk Downldoader*
┃ 📦 *Name:* ${app.name}
┃ 🏋 *Size:* ${appSize} MB
┃ 📦 *Package:* ${app.package}
┃ 📅 *Updated On:* ${app.updated}
┃ 👨‍💻 *Developer:* ${app.developer.name}
╰━━━━━━━━━━━━━━━┈⊷
🔗 *Powered By Mʀ-Sʜᴀʙᴀɴ*`;

    await conn.sendMessage(from, { react: { text: "⬆️", key: m.key } });

    await conn.sendMessage(from, {
      document: { url: app.file.path_alt },
      fileName: `${app.name}.apk`,
      mimetype: "application/vnd.android.package-archive",
      caption: caption
    }, { quoted: m });

    await conn.sendMessage(from, { react: { text: "✅", key: m.key } });

  } catch (error) {
    console.error("Error:", error);
    reply("❌ An error occurred while fetching the APK. Please try again.");
  }
});

// G-Drive-DL=====================

cmd({
  pattern: "gdrive",
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
    if (!q) return reply("❌ Please provide a valid Google Drive link.");

    // Auto-fix incomplete 'usp' parameter
    let cleanLink = q.includes("usp=") ? q : q + "sharing";

    await conn.sendMessage(from, { react: { text: "⬇️", key: m.key } });

    const apiUrl = `https://bk9.fun/download/gdrive?url=${encodeURIComponent(cleanLink)}`;
    const response = await axios.get(apiUrl);
    const data = response.data;
    const file = data.BK9;

    if (data.status && file && file.downloadUrl) {
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
    console.error("❌ Error:", error.response?.data || error.message);
    reply("❌ An error occurred while fetching the Google Drive file. Please try again.");
  }
});