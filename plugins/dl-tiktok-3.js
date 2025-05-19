const { cmd } = require('../command');
const axios = require('axios');

cmd({
    pattern: "tiktok3",
    alias: ["ttdl3", "tt3", "tiktokdl3"],
    desc: "Download TikTok video (MP4) or audio (MP3)",
    category: "downloader",
    react: "🎵",
    filename: __filename
},
async (conn, mek, m, { from, args, q, reply }) => {
    try {
        if (!q) return reply("Please provide a TikTok video link.");
        if (!q.includes("tiktok.com")) return reply("Invalid TikTok link.");

        const isAudio = q.toLowerCase().includes("--mp3") || q.toLowerCase().includes("audio");
        const url = q.replace("--mp3", "").replace("audio", "").trim();

        reply(`Downloading ${isAudio ? "audio" : "video"}, please wait...`);

        const apiUrl = `https://api.cypherx.dpdns.org/tiktok?url=${url}`;
        const { data } = await axios.get(apiUrl);

        if (data.status !== "success" || !data.results || data.results.length === 0) {
            return reply("Failed to fetch TikTok content.");
        }

        if (isAudio) {
            const audio = data.results.find(v => v.quality.toLowerCase().includes("mp3"));
            if (!audio || !audio.link) return reply("MP3 not available for this TikTok.");

            await conn.sendMessage(from, {
                audio: { url: audio.link },
                mimetype: "audio/mpeg",
                ptt: false
            }, { quoted: mek });
        } else {
            const video = data.results.find(v => v.quality.includes("HD")) || data.results.find(v => v.quality.includes("MP4"));
            if (!video || !video.link) return reply("Video not available for this TikTok.");

            const caption = `🎵 *TikTok Video Downloader*\n\n` +
                            `📥 *Quality:* ${video.quality}`;

            await conn.sendMessage(from, {
                video: { url: video.link },
                caption: caption,
                contextInfo: { mentionedJid: [m.sender] }
            }, { quoted: mek });
        }

    } catch (e) {
        console.error("Error in TikTok downloader command:", e);
        reply(`An error occurred: ${e.message}`);
    }
});