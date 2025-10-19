const { ShardingManager, EmbedBuilder } = require('discord.js')
require('dotenv').config()
const request = require('request')
const config = require('./config/botconfig')
const manager = new ShardingManager('./index.js', {
    token: process.env.discordToken,
    mode: "worker"
})
const shardsReady = []
manager.on('shardCreate', shard => {
    shard.on("ready", async () => {
        console.log(`Шард #${shard.id} запустился`)
        shardsReady.push(shard.id)
        if (shardsReady.length === manager.totalShards) {
            manager.broadcastEval(async (c) => {
                const timerId = setInterval(() => {
                    if (c.cache.ready) {
                        clearInterval(timerId)
                        c.cache.items.forEach(async item => {
                            item.displayEmoji = await c.functions.getEmoji(c, item.emoji)
                        })
                        c.cache.achievements.forEach(async achievement => {
                            achievement.displayEmoji = await c.functions.getEmoji(c, achievement.emoji)
                        })
                        c.cache.settings.forEach(async settings => {
                            settings.displayCurrencyEmoji = await c.functions.getEmoji(c, settings.emojis.currency)
                        })
                        c.cache.quests.forEach(async quest => {
                            quest.displayEmoji = await c.functions.getEmoji(c, quest.emoji)
                        })
                        c.cache.customRoles.forEach(async customRole => {
                            if (customRole.icon) customRole.displayIcon = await c.functions.getEmoji(c, customRole.icon)
                        }) 
                    }
                }, 1000)
            })
        }
    })
})
manager.spawn({ timeout: -1 }).then(shards => {
    require("./shard-modules/cron.js")(manager)
})
process.on(`unhandledRejection`, error => {
    console.error('Ошибка:', error)
    if (error.stack.includes(`Missing Permissions`) || error.stack.includes(`Missing Access`) || error.stack.includes(`Unknown interaction`) || error.stack.includes(`Regular expression is invalid`) || error.stack.includes(`Unknown Channel`) || error.stack.includes(`Unknown Message`) || error.stack.includes(`ECONNRESET`)) return
    else {
        const embed = new EmbedBuilder()
            .setColor(3093046)
            .setAuthor({ name: `Ошибка ${error.message.slice(0, 100)}` })
            .setDescription(`\`\`\`ml\n${error.stack}\`\`\``)
            .setTimestamp()
        const clientServerOptions = {
            uri: process.env.errorWebhook,
            body: JSON.stringify({
                content: `<@${config.discord.ownerId}>`,
                embeds: [embed]
            }),
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        }
        request(clientServerOptions)
    }
})
process.on("uncaughtException", (error) => {
    console.error('Ошибка:', error)
    if (error.stack.includes(`Missing Permissions`) || error.stack.includes(`Missing Access`) || error.stack.includes(`Unknown interaction`) || error.stack.includes(`Regular expression is invalid`) || error.stack.includes(`Unknown Channel`) || error.stack.includes(`Unknown Message`) || error.stack.includes(`ECONNRESET`)) return
    else {
        const embed = new EmbedBuilder()
            .setColor(3093046)
            .setAuthor({ name: `Ошибка ${error.message.slice(0, 100)}` })
            .setDescription(`\`\`\`ml\n${error.stack}\`\`\``)
            .setTimestamp()
        const clientServerOptions = {
            uri: process.env.errorWebhook,
            body: JSON.stringify({
                content: `<@${config.discord.ownerId}>`,
                embeds: [embed]
            }),
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        }
        request(clientServerOptions)
    }
})