// Jawad TechX - KHAN MD 
// Dont Remove Credit From File 

const { cmd } = require("../command");

const SAFETY = {
  MAX_JIDS: 20,
  BASE_DELAY: 2000,
  EXTRA_DELAY: 4000
};

cmd({
  pattern: "forward",
  alias: ["fwd"],
  desc: "Forward original message (media/text) to groups using WhatsApp context forwarding",
  category: "owner",
  filename: __filename
}, async (client, message, match, { isOwner }) => {
  try {
    if (!isOwner) return message.reply("*📛 Owner Only Command*");
    if (!message.quoted) return message.reply("*📌 Reply to the message you want to forward*");

    let jidInput = typeof match === "string" ? match.trim() : (
      Array.isArray(match) ? match.join(" ").trim() :
      (match?.text || "")
    );

    const rawJids = jidInput.split(/[\s,]+/)
      .map(j => j.trim())
      .filter(j => j.length > 0);

    const validJids = rawJids.map(jid => {
      jid = jid.replace(/\s/g, "");
      if (!jid.endsWith("@g.us")) jid += "@g.us";
      return jid.match(/^[0-9]+(-[0-9]+)?@g\.us$/) ? jid : null;
    }).filter(jid => jid !== null).slice(0, SAFETY.MAX_JIDS);

    if (validJids.length === 0) {
      return message.reply("❌ No valid group JIDs found.\n\nExample:\n.fwd 1203xxxxxxx@g.us 9230xxxxxxx-1583xxxxxx");
    }

    let success = 0, failed = [];

    for (const [i, jid] of validJids.entries()) {
      try {
        await client.forwardMessage(jid, message.quoted);
        success++;

        if ((i + 1) % 10 === 0) {
          await message.reply(`📤 Forwarded to ${i + 1}/${validJids.length}...`);
        }

        const delay = (i + 1) % 10 === 0 ? SAFETY.EXTRA_DELAY : SAFETY.BASE_DELAY;
        await new Promise(res => setTimeout(res, delay));
      } catch (e) {
        failed.push(jid.replace('@g.us', ''));
        await new Promise(res => setTimeout(res, SAFETY.BASE_DELAY));
      }
    }

    let summary = `✅ *Forward Complete*\n\n📦 Success: ${success}/${validJids.length}`;
    if (failed.length > 0) {
      summary += `\n❌ Failed: ${failed.slice(0, 5).join(", ")}`;
      if (failed.length > 5) summary += ` +${failed.length - 5} more`;
    }

    await message.reply(summary);

  } catch (err) {
    console.error(err);
    return message.reply(`❌ Error: ${err.message.substring(0, 100)}\nMake sure:\n- Message is valid\n- Bot has group access`);
  }
});