const { findUid: getFBID } = global.utils;
const webUrlRegex = /^(https?:\/\/[^\s]+)$/;

module.exports = {
  config: {
    name: "uid",
    version: "4.0",
    author: "ntkhanki",
    role: 0,
    shortDescription: {
      en: "Extract Facebook UID"
    },
    longDescription: {
      en: "A versatile tool to get UIDs from profile links, mentions, replies, or shared contacts."
    },
    category: "utility",
    guide: {
      en: "{pn} | [tag] | [link] | reply | [share contact]"
    }
  },

  onStart: async function ({ message, event, args, api }) {
    const { senderID: myID, messageReply: replyData, mentions: taggedUsers, threadID, messageID } = event;

    try {
      const taggedKeys = Object.keys(taggedUsers || {});
      if (taggedKeys.length > 0) {
        const names = Object.values(taggedUsers);
        for (let i = 0; i < taggedKeys.length; i++) {
          const id = taggedKeys[i];
          const name = names[i];
          await api.shareContact(id, id, threadID, messageID);
        }
        return;
      }

      if (replyData) {
        if (replyData.senderID) {
          return api.shareContact(replyData.senderID, replyData.senderID, threadID, messageID);
        }
      }

      if (args.length === 0) {
        return api.shareContact(myID, myID, threadID, messageID);
      }

      if (webUrlRegex.test(args[0])) {
        for (const inputLink of args) {
          try {
            const retrievedUid = await getFBID(inputLink);
            await api.shareContact(retrievedUid, retrievedUid, threadID, messageID);
          } catch (error) {
            await message.reply(`⚠️ Failed: ${error.message || "Invalid Link"}`);
          }
        }
        return;
      }

      return message.reply("Invalid input. Use a link, tag someone, reply to a message, or send a shared contact.");
      
    } catch (err) {
      console.error(err);
      return message.reply("❌ An error occurred while trying to share the contact.");
    }
  }
};
