const { fetchJson } = require("../lib/functions");
const { downloadTiktok } = require("@mrnima/tiktok-downloader");
const { facebook } = require("@mrnima/facebook-downloader");
const cheerio = require("cheerio");
const { igdl } = require("ruhend-scraper");
const axios = require("axios");
const { cmd, commands } = require('../command');
const fetch = require('node-fetch');

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

/// tiktok============================

cmd({
  pattern: "tiktok",
  alias: ["tt"],
  react: "🎥",
  desc: "Download TikTok videos",
  category: "download",
  filename: __filename
}, async (conn, m, store, { from, q, reply }) => {
  try {
    if (!q || !q.startsWith('http')) return reply("Please provide a valid TikTok link.");

    store.react("⬇️");

    let apiUrl = `https://api.cypherx.dpdns.org/tiktok?url=${encodeURIComponent(q)}`;
    let res = await fetch(apiUrl);
    let data = await res.json();

    console.log("API DATA:", data); // Debug line

    if (data.status !== "success" || !Array.isArray(data.results)) {
      return reply("*API response invalid or failed.*");
    }

    let video = data.results.find(v => v.quality.includes("MP4 [1]"));
    if (!video || !video.link) return reply("*No watermark video not found.*");

    await conn.sendMessage(from, {
      video: { url: video.link },
      caption: "*Downloaded by SHABAN-MD*"
    });

  } catch (err) {
    console.error("ERROR:", err);
    return reply("An error occurred while processing your request.");
  }
});

// Facebook-dl =====================

cmd({
  pattern: "fb",
  alias: ["facebook"],
  desc: "Download Facebook videos",
  category: "download",
  filename: __filename
}, async (conn, m, store, { from, quoted, args, q, reply }) => {
  try {
    if (!q || !q.startsWith("https://")) {
      return conn.sendMessage(from, { text: "Need URL" }, { quoted: m });
    }

    await conn.sendMessage(from, {
      react: { text: '⏳', key: m.key }
    });

    const response = await fetch(`https://apis.davidcyriltech.my.id/facebook2?url=${encodeURIComponent(q)}`);
    const data = await response.json();

    if (!data.status || !data.video) {
      return reply("❌ Error fetching the video. Please try again.");
    }

    const caption = `*FB DOWNLOADER*\n\n`
      + `┃▸ *Title*: ${data.video.title.replace(/&#x1f979;/g, "🥹")}\n\n`
      + `🌐 *Download Options:*\n`
      + `1️⃣ *SD Quality*\n`
      + `2️⃣ *HD Quality*\n\n`
      + `📌 *Reply with the number to download your choice.*`;

    const sentMsg = await conn.sendMessage(from, {
      image: { url: data.video.thumbnail },
      caption: caption
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
              video: { url: data.video.downloads[0].downloadUrl },
              caption: "📥 *Downloaded by SHABAN-MD (SD)*"
            }, { quoted: receivedMsg });
            break;

          case "2":
            await conn.sendMessage(senderID, {
              video: { url: data.video.downloads[1].downloadUrl },
              caption: "📥 *Downloaded by SHABAN-MD (HD)*"
            }, { quoted: receivedMsg });
            break;

          default:
            reply("❌ Invalid option! Please reply with 1 or 2.");
        }
      }
    });

  } catch (error) {
    console.error("Error:", error);
    reply("❌ Error fetching the video. Please try again.");
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
    if (!q) {
      return reply("❌ Please provide a valid Google Drive link.");
    }

    await conn.sendMessage(from, { react: { text: "⬇️", key: m.key } });

    const apiUrl = `https://api.fgmods.xyz/api/downloader/gdrive?url=${q}&apikey=mnp3grlZ`;
    const response = await axios.get(apiUrl);
    const downloadUrl = response.data.result.downloadUrl;

    if (downloadUrl) {
      await conn.sendMessage(from, { react: { text: "⬆️", key: m.key } });

      await conn.sendMessage(from, {
        document: { url: downloadUrl },
        mimetype: response.data.result.mimetype,
        fileName: response.data.result.fileName,
        caption: "*© Powered By Mʀ-Sʜᴀʙᴀɴ*"
      }, { quoted: m });

      await conn.sendMessage(from, { react: { text: "✅", key: m.key } });
    } else {
      return reply("⚠️ No download URL found. Please check the link and try again.");
    }
  } catch (error) {
    console.error("Error:", error);
    reply("❌ An error occurred while fetching the Google Drive file. Please try again.");
  }
}); 
            
// Snapchat============================

cmd({ pattern: "snap", alias: ["snapchat", "snp"], desc: "To download Snapchat videos.", react: "📹", category: "download", filename: __filename }, async (conn, m, store, { from, q, reply }) => { try { if (!q || !q.startsWith("http")) { return reply("❌ Please provide a valid Snapchat link."); }

await conn.sendMessage(from, {
  react: { text: "⏳", key: m.key }
});

const response = await axios.get(`https://api.nexoracle.com/downloader/snapchat?apikey=2f9b02060a600d6c88&url=${encodeURIComponent(q)}`);
const data = response.data;

if (!data || data.status !== 200 || !data.result || !data.result.url) {
  return reply("⚠️ Failed to fetch Snapchat content. Please check the link and try again.");
}

if (data.result.url) {
  await conn.sendMessage(from, {
    video: { url: data.result.url },
    mimetype: "video/mp4",
    caption: `📥 *Snapchat Video Downloaded SHABAN-MD*

🎥 Title: ${data.result.title}
📏 Size: ${data.result.size}` }, { quoted: m }); }

} catch (error) { console.error("Error:", error); reply("❌ An error occurred while processing your request. Please try again."); } });
