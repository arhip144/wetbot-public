const node_emoji = require("node-emoji");
async function getEmoji(client, emoji) {
    const unknownEmoji = "❓"
    if (!emoji) return unknownEmoji
    const isDefaultEmoji = node_emoji.hasEmoji(emoji)
    if (isDefaultEmoji) {
        emoji = node_emoji.emojify(emoji)
    }
    let guild_emoji = !isDefaultEmoji ? client.emojis.cache.get(emoji) : undefined
    if (!guild_emoji && !isDefaultEmoji) {
        guild_emoji = await client.shard.broadcastEval(async (c, { emojiId }) => {
            return c.emojis.cache.get(emojiId)
        }, { context: { emojiId: emoji }}).then(emojis => {
            return emojis.find(e => e)
        })
    }
    if (guild_emoji) return `<${guild_emoji.animated ? `a:` : `:`}${guild_emoji.name}:${guild_emoji.id}>`
    else if (isDefaultEmoji) return emoji
    else return unknownEmoji
}
module.exports = getEmoji;