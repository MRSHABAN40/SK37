const { cmd } = require('../command');
const axios = require('axios');

cmd({
    pattern: "tiktok3",
    alias: ["ttdl3", "tt3", "tiktokdl"],
    desc: "Download TikTok video or audio without watermark",
    category: "downloader",
    react: "🎵",
    filename: __filename
},
async (conn, mek, m, { from, args, q, reply }) => {
    try {
        if (!q) return reply("Please provide a TikTok video link.\nUsage: tiktok2 <TikTok URL> <1 for Video | 2 for Audio>");
        if (!q.includes("tiktok.com")) return reply("Invalid TikTok link.");

        // args[0] should be URL, args[1] should be choice 1 or 2
        const url = args[0];
        const choice = args[1] || "1"; // default to video if no choice given

        if (!url) return reply("Please provide the TikTok URL.");
        if (choice !== "1" && choice !== "2") return reply("Invalid choice. Reply with 1 for Video, 2 for Audio.");

        reply("Downloading your TikTok " + (choice === "1" ? "video" : "audio") + ", please wait...");

        const apiUrl = `https://api.cypherx.dpdns.org/tiktok?url=${url}`;
        const { data } = await axios.get(apiUrl);

        if (data.status !== "success" || !data.results || data.results.length === 0) 
            return reply("Failed to fetch TikTok media.");

        // Filter results based on choice
        let mediaLink = "";
        let mediaType = "";

        if (choice === "1") {
            // Video download - prefer HD if available
            const videoItem = data.results.find(item => item.quality.toLowerCase().includes("mp4 hd")) 
                            || data.results.find(item => item.quality.toLowerCase().includes("mp4"));
            if (!videoItem) return reply("No video found for download.");
            mediaLink = videoItem.link;
            mediaType = "video";
        } else if (choice === "2") {
            // Audio download (mp3)
            const audioItem = data.results.find(item => item.quality.toLowerCase().includes("mp3"));
            if (!audioItem) return reply("No audio found for download.");
            mediaLink = audioItem.link;
            mediaType = "audio";
        }

        // Send media with appropriate caption
        const caption = `🎵 *TikTok ${mediaType === "video" ? "Video" : "Audio"} Download* 🎵\n\n` +
                        `Link: ${url}\n` +
                        `Type: ${mediaType.toUpperCase()}\n\n` +
                        `Enjoy your media!`;

        if (mediaType === "video") {
            await conn.sendMessage(from, {
                video: { url: mediaLink },
                caption: caption,
                contextInfo: { mentionedJid: [m.sender] }
            }, { quoted: mek });
        } else {
            await conn.sendMessage(from, {
                audio: { url: mediaLink },
                mimetype: 'audio/mpeg',
                ptt: false,
                contextInfo: { mentionedJid: [m.sender] }
            }, { quoted: mek });
            await reply(caption);
        }

    } catch (e) {
        console.error("Error in TikTok downloader command:", e);
        reply(`An error occurred: ${e.message}`);
    }
});
