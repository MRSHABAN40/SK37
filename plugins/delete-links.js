const { cmd } = require('../command');
const config = require('../config');

const linkPatterns = [
  /https?:\/\/\S+/gi // Yeh kisi bhi "http" ya "https" se start hone wale link ko pakdega
];

cmd({
  on: "body"
}, async (conn, m, store, {
  from,
  body,
  sender,
  isGroup,
  isAdmins,
  isBotAdmins,
  reply
}) => {
  try {
    if (!isGroup || isAdmins || !isBotAdmins) return;

    // Detect link in message
    const linkPatterns = [/https?:\/\/\S+/];
    const containsLink = linkPatterns.some(pattern => pattern.test(body));

    if (containsLink && config.DELETE_LINK === 'true') {
      console.log(`Link detected from ${sender}: ${body}`);

      // Delete the message
      try {
        await conn.sendMessage(from, { delete: m.key });
        console.log(`Message deleted: ${m.key.id}`);
      } catch (deleteError) {
        console.error("Failed to delete message:", deleteError);
      }

      // Just inform the group, do not remove the user
      await conn.sendMessage(from, {
        text: `🚫 SHABAN-MD: @${sender.split('@')[0]} sent a link. Message has been deleted.`,
        mentions: [sender]
      });
    }
  } catch (error) {
    console.error("Delete-link error:", error);
    reply("❌ An error occurred while processing the anti-link command.");
  }
});
