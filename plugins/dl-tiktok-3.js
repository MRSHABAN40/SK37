const { cmd } = require('../command');
const axios = require('axios');

cmd({
  pattern: "tiktok3",
  alias: ['tt3'],
  react: '🎥',
  desc: "download tt videos",
  category: "download",
  filename: __filename
}, async (conn, m, store, { from, quoted, q, reply }) => {
  try {
    if (!q || !q.startsWith('https://')) {
      return reply("Please provide a valid TikTok URL.");
    }

    store.react('⬇️');

    const response = await fetch(`https://api.cypherx.dpdns.org/tiktok?url=${encodeURIComponent(q)}`);
    const json = await response.json();

    if (json.status !== "success" || !json.results) {
      return reply("*Failed to fetch video. Please try again later.*");
    }

    let links = json.results;
    let caption = `
𝗧𝗜𝗞𝗧𝗢𝗞 𝗗𝗢𝗪𝗡𝗟𝗢𝗔𝗗𝗘𝗥 🎥
1. ${links[0]?.quality || 'MP4'}
2. ${links[1]?.quality || 'MP4 HD'}
3. ${links[2]?.quality || 'MP3'}
*Reply with 1, 2 or 3 to download*
    `.trim();

    const sentMsg = await conn.sendMessage(from, {
      image: { url: "https://i.ibb.co/KxqWDtj/tiktok.jpg" }, // Static thumbnail
      caption: caption
    });

    const msgID = sentMsg.key.id;

    conn.ev.on("messages.upsert", async update => {
      let msg = update.messages[0];
      if (!msg.message) return;

      const userInput = msg.message.conversation || msg.message.extendedTextMessage?.text;
      const isReply = msg.message.extendedTextMessage &&
        msg.message.extendedTextMessage.contextInfo?.stanzaId === msgID;

      if (isReply) {
        await conn.sendMessage(from, { react: { text: '⬇️', key: msg.key } });

        if (userInput === '1') {
          await conn.sendMessage(from, {
            video: { url: links[0].link },
            caption: "*Downloaded via SHABAN-MD*"
          }, { quoted: msg });
        } else if (userInput === '2') {
          await conn.sendMessage(from, {
            video: { url: links[1].link },
            caption: "*Downloaded via SHABAN-MD (HD)*"
          }, { quoted: msg });
        } else if (userInput === '3') {
          await conn.sendMessage(from, {
            audio: { url: links[2].link },
            mimetype: "audio/mpeg"
          }, { quoted: msg });
        } else {
          reply("*Invalid input. Please reply with 1, 2, or 3.*");
        }
      }
    });

  } catch (e) {
    console.log(e);
    reply("An error occurred while processing your request.");
  }
});