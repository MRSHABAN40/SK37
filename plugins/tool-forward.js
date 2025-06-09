const { cmd } = require("../command");

const SAFETY = {
  MAX_JIDS: 20,
  BASE_DELAY: 2000,
  EXTRA_DELAY: 4000
};

cmd({
  pattern: "forward",
  alias: ["fwd"],
  desc: "Forward quoted media/text to multiple groups using WhatsApp server forwarding (4GB supported)",
  category: "owner",
  filename: __filename
}, async (client, message, match, { isOwner }) => {
  try {
    // ✅ Owner only check
    if (!isOwner) return message.reply("*📛 Owner Only Command*");

    // ✅ Quoted message required
    if (!message.quoted) return message.reply("*📌 Reply to the message you want to forward*");

    // 🧠 Clean and process JID input
    let jidInput = typeof match === "string" ? match.trim() :
      Array.isArray(match) ? match.join(" ").trim() :
      (match?.text || "");

    const rawJids = jidInput
      .split(/[\s,]+/)
      .map(j => j.trim())
      .filter(j => j.length > 0);

    const validJids = rawJids.map(jid => {
      jid = jid.replace(/\s/g, "");
      if (!jid.endsWith("@g.us")) jid += "@g.us";
      return jid.match(/^[0-9]+(-[0-9]+)?@g\.us$/) ? jid : null;
    }).filter(jid => jid !== null).slice(0, SAFETY.MAX_JIDS);

    // ❌ No valid groups?
    if (validJids.length === 0) {
      return message.reply("❌ No valid group JIDs found.\n\n📝 Example:\n.fwd 1203xxxx@g.us, 9230xxxx-1583xxxx");
    }

    // 🔁 Forward to each group using WhatsApp server
    let success = 0, failed = [];

    for (const [i, jid] of validJids.entries()) {
      try {
        await client.forwardMessage(jid, message.quoted);
        success++;

        // Notify every 10 groups
        if ((i + 1) % 10 === 0) {
          await message.reply(`📤 Forwarded to ${i + 1}/${validJids.length} groups...`);
        }

        // Apply delay
        const delay = (i + 1) % 10 === 0 ? SAFETY.EXTRA_DELAY : SAFETY.BASE_DELAY;
        await new Promise(res => setTimeout(res, delay));

      } catch (e) {
        failed.push(jid.replace('@g.us', ''));
        console.error(`❌ Error forwarding to ${jid}:`, e.message);
        await new Promise(res => setTimeout(res, SAFETY.BASE_DELAY));
      }
    }

    // 📦 Final report
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
    console.error("⚠️ Forward Command Error:", err);
    await message.reply(`❌ Error: ${err.message.substring(0, 100)}\n\nCheck:\n• Bot is in group\n• Valid media\n• Not a system msg`);
  }
});
