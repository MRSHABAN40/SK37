const os = require("os");
const { cmd } = require("../command");
const pkg = require("../package.json");

cmd({
  pattern: "alive",
  alias: ["status", "uptime", "a"],
  desc: "Check if the bot is online and active",
  category: "main",
  react: "💠",
  filename: __filename,
},
async (conn, mek, m, { from, sender, reply }) => {
  try {
    const uptime = process.uptime(); // in seconds
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);
    const uptimeFormatted = `${hours}h ${minutes}m ${seconds}s`;

    // Detect Host Platform
    let host = "VPS / Localhost";
    if (process.env.RENDER === "true") host = "Render";
    else if (process.env.HEROKU_APP_NAME) host = "Heroku";
    else if (process.env.RAILWAY_STATIC_URL) host = "Railway";

    const text = `🧿 *SHABAN-MD IS ALIVE* 🧿

✨ *Bot Name:* SHABAN-MD
🚦 *Status:* ✅ Online & Running
🕒 *Uptime:* ${uptimeFormatted}
💻 *Host:* ${host}
🛠 *Version:* ${pkg.version}
👑 *Owner:* ${pkg.author || "Mr Shaban"}

🔗 *Made with ❤️ by SHABAN*`;

    await conn.sendMessage(from, {
      text,
      contextInfo: {
        mentionedJid: [sender],
      },
    }, { quoted: mek });

  } catch (err) {
    console.error("Alive command error:", err);
    reply(`❌ *Error:* ${err.message}`);
  }
});
