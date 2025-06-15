const os = require("os");
const { cmd } = require('../command');

cmd({
    pattern: "alive",
    alias: ["status", "uptime", "a"],
    desc: "Check if the bot is online and active",
    category: "main",
    react: "⚡",
    filename: __filename
},
async (conn, mek, m, { sender, from, reply }) => {
    try {
        const start = Date.now();

        // Platform Detection
        let host = "Unknown VPS";
        const env = process.env;

        if (env.RENDER === "true") host = "Render";
        else if (env.HEROKU_APP_NAME) host = "Heroku";
        else if (env.KOYEB_APP_NAME) host = "Koyeb";
        else if (env.RAILWAY_STATIC_URL) host = "Railway";
        else if (env.REPL_ID || env.REPL_OWNER) host = "Replit";
        else if (env.VERCEL === "1") host = "Vercel";

        // Response Time
        const ping = Date.now() - start;

        const msg = `*🤖 SHABAN-MD is Alive!*

🔋 *Uptime:* ${Math.floor(process.uptime())}s
⚡ *Response:* ${ping}ms
🖥️ *Host:* ${host}
📡 *Platform:* ${os.platform()}
🧠 *Memory:* ${(os.totalmem() / 1024 / 1024).toFixed(0)}MB

✅ Bot is working fine, boss!`;

        await conn.sendMessage(from, {
            text: msg,
            contextInfo: {
                mentionedJid: [sender]
            }
        }, { quoted: mek });

    } catch (e) {
        console.error("❌ Alive command error:", e);
        reply("Error in .alive command: " + e.message);
    }
});
