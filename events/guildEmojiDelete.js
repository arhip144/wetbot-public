const client = require("../index")
const { Events } = require("discord.js")
client.on(Events.GuildEmojiDelete, async (emoji) => {
    const items = client.cache.items.filter(e => e.emoji === emoji.id)
    await Promise.all(items.map(async item => {
        item.emoji = "991344303253241897"
        item.displayEmoji = "⏳"
        await item.save()
    }))
    const achievements = client.cache.achievements.filter(e => e.emoji === emoji.id)
    await Promise.all(achievements.map(async achievement => {
        achievement.emoji = "991344303253241897"
        achievement.displayEmoji = "⏳"
        await achievement.save()
    }))
})