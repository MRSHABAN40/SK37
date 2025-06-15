const config = require('../config');
const { cmd } = require('../command');

cmd({
    pattern: "ping",
    alias: ["speed", "pong", "p"],
    use: '.ping',
    desc: "Check bot's response time with a VIP touch.",
    category: "main",
    react: "⚡",
    filename: __filename
},
async (conn, mek, m, { from, quoted, sender, reply }) => {
    try {
        const reactionEmojis = ['🚛', '🚚', '🚜', '🚒', '🚐', '🛻', '🚗', '🚙', '🏎️', '🏍️'];
        const textEmojis = ['🚁', '🛸', '⚡️', '🚀', '🛩️', '🎠', '🚍', '🚔', '🚘', '🚖'];

        const reactionEmoji = reactionEmojis[Math.floor(Math.random() * reactionEmojis.length)];
        const filteredEmojis = textEmojis.filter(e => e !== reactionEmoji);
        const textEmoji = filteredEmojis[Math.floor(Math.random() * filteredEmojis.length)];

        // React fast
        await conn.sendMessage(from, {
            react: { text: textEmoji, key: m.key }
        });

        const start = Date.now(); // Measure after reaction
        const sent = await conn.sendMessage(from, {
            text: '♻️ Testing ping...',
        }, { quoted: mek });
        const responseTime = Date.now() - start;

        // Edit response with final result
        await conn.sendMessage(from, {
            text: `*SHABAN-MD SERVER SPEED:* 🐦‍🔥\n\n🚀 *Response Time:* ${responseTime}ms ${reactionEmoji}\n👑 *Status:* Ultra-Fast 🦅`,
            edit: sent.key,
            contextInfo: {
                mentionedJid: [sender]
            }
        });

    } catch (e) {
        console.error("Error in ping command:", e);
        reply(`❌ *Error:* ${e.message}`);
    }
});
