const node_emoji = require("node-emoji");
const emojiUnicode = require('emoji-unicode')
async function getEmojiURL(client, emoji, extension) {
    if (!emoji) return null
    if (node_emoji.find(emoji)) {
        return `https://api-ninjas-data.s3.us-west-2.amazonaws.com/emojis/U%2B${emojiUnicode(emoji).toUpperCase().split(" ").join("%20U%2B")}.png`
    }
    let guild_emoji = client.emojis.cache.get(emoji)
    let imageURL
    if (!guild_emoji) {
        imageURL = await client.shard.broadcastEval(async (c, { emojiId, extension }) => {
            const guild_emoji = c.emojis.cache.get(emojiId)
            if (guild_emoji) {
                if (guild_emoji.animated) return guild_emoji.imageURL({ extension: extension || "gif" })
                else return guild_emoji.imageURL({ extension: extension || "png" })    
            }
        }, { context: { emojiId: emoji, extension: extension }}).then(urls => {
            return urls.find(e => e)
        })
    }
    if (guild_emoji) {
        if (guild_emoji.animated) return guild_emoji.imageURL({ extension: extension || "gif" })
        else return guild_emoji.imageURL({ extension: extension || "png" })
    } else if (imageURL) return imageURL
    else return null
}
module.exports = getEmojiURL;