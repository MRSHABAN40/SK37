const { cmd } = require("../command");

const SAFETY = {
  MAX_JIDS: 20,
  BASE_DELAY: 2000,
  EXTRA_DELAY: 4000
};

cmd({
  pattern: "forward",
  alias: ["fwd"],
  desc: "Forward quoted document/video/image to multiple groups (up to 4GB supported)",
  category: "owner",
  filename: __filename
}, async (client, message, match, { isOwner }) => {
  try {
    if (!isOwner) return message.reply("*📛 Owner Only Command*");
    if (!message.quoted) return message.reply("*📌 Reply to a document/video/image message*");

    // Process JID list
    let jidInput = typeof match === "string" ? match.trim() :
      Array.isArray(match) ? match.join(" ").trim() :
      (match?.text || "");

    const rawJids = jidInput.split(/[\s,]+/).map(j => j.trim()).filter(j => j.length > 0);
    const validJids = rawJids.map(jid => {
      jid = jid.replace(/\s/g, "");
      if (!jid.endsWith("@g.us")) jid += "@g.us";
      return jid.match(/^[0-9]+(-[0-9]+)?@g\.us$/) ? jid : null;
    }).filter(jid => jid !== null).slice(0, SAFETY.MAX_JIDS);

    if (validJids.length === 0) {
      return message.reply("❌ No valid group JIDs found.\n\n📝 Example:\n.fwd 1203xxx@g.us, 9230xxx-1583xxx");
    }

    // Download quoted media
    const mtype = message.quoted.mtype;
    const supported = ["imageMessage", "videoMessage", "audioMessage", "documentMessage"];
    if (!supported.includes(mtype)) return message.reply("❌ Only media or document messages are supported.");

    const buffer = await message.quoted.download();
    const caption = message.quoted.text || "";

    let messageContent = {};
    switch (mtype) {
      case "imageMessage":
        messageContent = { image: buffer, caption };
        break;
      case "videoMessage":
        messageContent = { video: buffer, caption };
        break;
      case "audioMessage":
        messageContent = {
          audio: buffer,
          mimetype: message.quoted.mimetype || "audio/mp4",
          ptt: message.quoted.ptt || false
        };
        break;
      case "documentMessage":
        messageContent = {
          document: buffer,
          mimetype: message.quoted.mimetype || "application/octet-stream",
          fileName: message.quoted.fileName || "file.mp4",
          caption
        };
        break;
    }

    // Forward loop
    let success = 0, failed = [];

    for (const [i, jid] of validJids.entries()) {
      try {
        await client.sendMessage(jid, messageContent);
        success++;

        if ((i + 1) % 10 === 0) {
          await message.reply(`📤 Sent to ${i + 1}/${validJids.length} groups...`);
        }

        const delay = (i + 1) % 10 === 0 ? SAFETY.EXTRA_DELAY : SAFETY.BASE_DELAY;
        await new Promise(res => setTimeout(res, delay));

      } catch (e) {
        failed.push(jid.replace("@g.us", ""));
        console.error(`❌ Failed to send to ${jid}:`, e.message);
        await new Promise(res => setTimeout(res, SAFETY.BASE_DELAY));
      }
    }

    // Final summary
    let summary = `✅ *Forward Complete*\n\n📦 Success: ${success}/${validJids.length}`;
    if (failed.length > 0) {
      summary += `\n❌ Failed (${failed.length}): ${failed.slice(0, 5).join(", ")}`;
      if (failed.length > 5) summary += ` +${failed.length - 5} more`;
    }

    if (rawJids.length > SAFETY.MAX_JIDS) {
      summary += `\n⚠️ Note: Limited to first ${SAFETY.MAX_JIDS} groups`;
    }

    await message.reply(summary);

  } catch (err) {
    console.error("⚠️ Forward Error:", err);
    await message.reply(`❌ Error: ${err.message.substring(0, 100)}\nCheck:\n• Group access\n• File validity\n• Bot status`);
  }
});
