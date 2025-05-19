const { cmd } = require('../command');
const axios = require('axios');

cmd({
  pattern: "tiktok3",
  alias: ['tt3'],
  react: '🎥',
  desc: "Download TikTok videos",
  category: "download",
  filename: __filename
}, async (conn, m, store, { from, q, reply }) => {
  try {
    if (!q || !q.startsWith("http")) return reply("Please provide a valid TikTok URL.");

    store.react('⬇️');

    const res = await fetch(`https://api.cypherx.dpdns.org/tiktok?url=${encodeURIComponent(q)}`);
    const text = await res.text();

    let json;
    try {
      json = JSON.parse(text);
    } catch (err) {
      console.log("Invalid JSON from API:\n", text);
      return reply("API returned invalid response.");
    }

    if (json.status !== "success" || !json.results || !Array.isArray(json.results)) {
      console.log("Invalid API format:\n", json);
      return reply("Failed to parse download links from TikTok.");
    }

    let results = json.results;
    let video1 = results.find(v => v.quality.includes("MP4 [1]"))?.link;
    let video2 = results.find(v => v.quality.includes("MP4 HD"))?.link;
    let audio = results.find(v => v.quality.includes("MP3"))?.link;

    let caption = `*𝗧𝗜𝗞𝗧𝗢𝗞 𝗗𝗢𝗪𝗡𝗟𝗢𝗔𝗗𝗘𝗥 🎥*\n
1. MP4 Normal\n2. MP4 HD\n3. Audio (MP3)\n\nReply with 1, 2 or 3`;

    const sentMsg = await conn.sendMessage(from, {
      text: caption
    }, { quoted: m });

    const msgID = sentMsg.key.id;

    conn.ev.on('messages.upsert', async msg => {
      try {
        const incoming = msg.messages?.[0];
        if (!incoming?.message) return;

        const userText = incoming.message?.conversation || incoming.message?.extendedTextMessage?.text;
        const isReply = incoming.message?.extendedTextMessage?.contextInfo?.stanzaId === msgID;
        const chat = incoming.key.remoteJid;

        if (isReply) {
          if (userText === '1' && video1) {
            await conn.sendMessage(chat, {
              video: { url: video1 },
              caption: "*Downloaded by SHABAN-MD*"
            }, { quoted: incoming });
          } else if (userText === '2' && video2) {
            await conn.sendMessage(chat, {
              video: { url: video2 },
              caption: "*Downloaded by SHABAN-MD*"
            }, { quoted: incoming });
          } else if (userText === '3' && audio) {
            await conn.sendMessage(chat, {
              audio: { url: audio },
              mimetype: "audio/mpeg"
            }, { quoted: incoming });
          } else {
            conn.sendMessage(chat, { text: "Invalid option. Reply with 1, 2, or 3." }, { quoted: incoming });
          }
        }
      } catch (err) {
        console.log("Error in reply handler:", err);
      }
    });

  } catch (e) {
    console.log("TikTok Command Error:", e);
    reply("Something went wrong. Check logs.");
  }
});
