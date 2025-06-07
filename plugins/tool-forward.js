// Jawad TechX - KHAN MD 
// Dont Remove Credit From File 

const { cmd } = require("../command");

// Safety Configuration
const SAFETY = {
  MAX_JIDS: 20,
  BASE_DELAY: 2000,  // jawad on top 🔝
  EXTRA_DELAY: 4000,  // huh don't copy mine file 
};

cmd({
  pattern: "forward",
  alias: ["fwd"],
  desc: "Bulk forward media to groups",
  category: "owner",
  filename: __filename
}, async (client, message, match, { isOwner }) => {
  try {
    // Owner check
    if (!isOwner) return await message.reply("*📛 Owner Only Command*");

    // Quoted message check
    if (!message.quoted) return await message.reply("*🍁 Please reply to a message*");

    // ===== [FLEXIBLE JID INPUT PROCESSING] ===== //
    let jidInput = "";

    if (typeof match === "string") {
      jidInput = match.trim();
    } else if (Array.isArray(match)) {
      jidInput = match.join(" ").trim();
    } else if (match && typeof match === "object") {
      jidInput = match.text || "";
    }

    const rawJids = jidInput
      .split(/[\s,]+/)
      .map(j => j.trim())
      .filter(j => j.length > 0);

    // Accept all @g.us styles: numeric or phone-timestamp
    const validJids = rawJids
      .map(jid => {
        jid = jid.replace(/\s/g, ""); // remove whitespace
        if (!jid.endsWith("@g.us")) {
          jid = jid + "@g.us";
        }
        return jid.match(/^[0-9]+(-[0-9]+)?@g\.us$/) ? jid : null;
      })
      .filter(jid => jid !== null)
      .slice(0, SAFETY.MAX_JIDS);

    if (validJids.length === 0) {
      return await message.reply(
        "❌ No valid group JIDs found\n\n" +
        "📝 Examples:\n" +
        ".fwd 120363411055156472@g.us\n" +
        ".fwd 6596844102-1511946727\n" +
        ".fwd 923064913211-1583508950 120363058058083034"
      );
    }

    // ===== [MEDIA / TEXT HANDLING] ===== //
    let messageContent = {};
    const mtype = message.quoted.mtype;

    if (["imageMessage", "videoMessage", "audioMessage", "stickerMessage", "documentMessage"].includes(mtype)) {
      const buffer = await message.quoted.download();

      switch (mtype) {
        case "imageMessage":
          messageContent = {
            image: buffer,
            caption: message.quoted.text || '',
            mimetype: message.quoted.mimetype || "image/jpeg"
          };
          break;
        case "videoMessage":
          messageContent = {
            video: buffer,
            caption: message.quoted.text || '',
            mimetype: message.quoted.mimetype || "video/mp4"
          };
          break;
        case "audioMessage":
          messageContent = {
            audio: buffer,
            mimetype: message.quoted.mimetype || "audio/mp4",
            ptt: message.quoted.ptt || false
          };
          break;
        case "stickerMessage":
          messageContent = {
            sticker: buffer,
            mimetype: message.quoted.mimetype || "image/webp"
          };
          break;
        case "documentMessage":
          messageContent = {
            document: buffer,
            mimetype: message.quoted.mimetype || "application/octet-stream",
            fileName: message.quoted.fileName || "document"
          };
          break;
      }
    } else if (mtype === "extendedTextMessage" || mtype === "conversation") {
      messageContent = {
        text: message.quoted.text
      };
    } else {
      try {
        messageContent = message.quoted;
      } catch (e) {
        return await message.reply("❌ Unsupported message type");
      }
    }

    // ===== [FORWARD LOOP] ===== //
    let successCount = 0;
    const failedJids = [];

    for (const [index, jid] of validJids.entries()) {
      try {
        await client.sendMessage(jid, messageContent);
        successCount++;

        if ((index + 1) % 10 === 0) {
          await message.reply(`🔄 Sent to ${index + 1}/${validJids.length} groups...`);
        }

        const delayTime = (index + 1) % 10 === 0 ? SAFETY.EXTRA_DELAY : SAFETY.BASE_DELAY;
        await new Promise(resolve => setTimeout(resolve, delayTime));

      } catch (error) {
        failedJids.push(jid.replace('@g.us', ''));
        await new Promise(resolve => setTimeout(resolve, SAFETY.BASE_DELAY));
      }
    }

    // ===== [REPORT] ===== //
    let report = `✅ *Forward Complete*\n\n` +
                 `📤 Success: ${successCount}/${validJids.length}\n` +
                 `📦 Content Type: ${mtype.replace('Message', '') || 'text'}\n`;

    if (failedJids.length > 0) {
      report += `\n❌ Failed (${failedJids.length}): ${failedJids.slice(0, 5).join(', ')}`;
      if (failedJids.length > 5) report += ` +${failedJids.length - 5} more`;
    }

    if (rawJids.length > SAFETY.MAX_JIDS) {
      report += `\n⚠️ Note: Limited to first ${SAFETY.MAX_JIDS} JIDs`;
    }

    await message.reply(report);

  } catch (error) {
    console.error("Forward Error:", error);
    await message.reply(
      `💢 Error: ${error.message.substring(0, 100)}\n\n` +
      `Please try again or check:\n` +
      `1. JID formatting\n` +
      `2. Media type support\n` +
      `3. Bot permissions`
    );
  }
});