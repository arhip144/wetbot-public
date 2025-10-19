const client = require("../index")
const { Events } = require("discord.js")
client.on(Events.GuildEmojiUpdate, async (emoji) => {
    const items = client.cache.items.filter(e => e.emoji === emoji.id)
    await Promise.all(items.map(async item => {
        item.displayEmoji = `<${emoji.animated ? "a:" : ""}${emoji.name}:${emoji.id}>`
        await item.save()
    }))
    const achievements = client.cache.achievements.filter(e => e.emoji === emoji.id)
    await Promise.all(achievements.map(async achievement => {
        achievement.displayEmoji = `<${emoji.animated ? "a:" : ""}${emoji.name}:${emoji.id}>`
        await achievement.save()
    }))
})