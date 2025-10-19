const client = require("../index")
const { EmbedBuilder, ChannelType, MessageType, Events, ApplicationCommandType } = require("discord.js")
const { AchievementType } = require("../enums")
const Decimal = require('decimal.js')
const { glob } = require("glob")
client.on(Events.MessageCreate, async (message) => {
    if (message.author.id === client.config.discord.ownerId && message.content === "!reg") {
        const value = glob.sync(`slash-commands/reg.js`, {
            absolute: true
        })
        let command = require(value[0])
        const guild = client.guilds.cache.get(message.guild.id)
        if (guild) {
            try {
                command = await client.application.commands.create(command, message.guild.id)
            } catch (err) {
                return message.reply({ content: err.message })
            }
            return message.reply({ content: `Команда </${command.name}:${command.id}> была успешно зарегистрирована на сервере ${guild.name} (${guild.id}).` })    
        } else return message.reply({ content: `Сервер с ID ${message.guild.id} не найден` })
    }
    if (message.inGuild() && client.blacklist(message.guildId, "full_ban", "guilds")) return
    if (message.inGuild() && client.blacklist(message.author.id, "full_ban", "users")) return
    if ([MessageType.GuildBoost, MessageType.GuildBoostTier1, MessageType.GuildBoostTier2, MessageType.GuildBoostTier3].includes(message.type)) {
        const profile = await client.functions.fetchProfile(client, message.author.id, message.guildId)
        profile.boosts += 1
        const achievements = client.cache.achievements.filter(e => e.guildID === message.guildId && e.type === AchievementType.GuildBoost && e.enabled)
        await Promise.all(achievements.map(async achievement => {
            if (!profile.achievements?.some(ach => ach.achievmentID === achievement.id) && profile.boosts >= achievement.amount && !client.tempAchievements[profile.userID]?.includes(achievement.id)) {
                if (!client.tempAchievements[profile.userID]) client.tempAchievements[profile.userID] = []
                client.tempAchievements[profile.userID].push(achievement.id)
                await profile.addAchievement(achievement)
            }
        }))
        await profile.save()
    }
    if (message.author.bot || message.channel.type === ChannelType.DM || message.channel.type == ChannelType.GroupDM || (message.type !== MessageType.Default && message.type !== MessageType.Reply)) return
    const settings = await client.functions.fetchSettings(client, message.guildId)
    if (!settings.channels.mutedChannels.includes(message.channelId)) {
        //Выдача опыта за сообщение
        const profile = await client.functions.fetchProfile(client, message.author.id, message.guildId)
        profile.messages = 1
        if (message.member) {
            if (!message.member.roles.cache.hasAny(...settings.roles?.mutedRoles)) {
                if (settings.curForMessage && !profile.blockActivities?.message?.CUR) {
                    let cur_multiplier_for_channel = 0
                    let channel = client.cache.channels.find(channel => channel.id === message.channelId && channel.isEnabled)
                    if (!channel) channel = client.cache.channels.find(channel => channel.id === message.channel?.parentId && channel.isEnabled)
                    if (channel) {
                        cur_multiplier_for_channel = channel.cur_multiplier
                    }
                    const base_cur = 1 * settings.curForMessage
                    const cur = base_cur + (base_cur * profile.getCurBoost(cur_multiplier_for_channel))
                    if (cur) await profile.addCurrency(cur)
                }
                if (settings.xpForMessage && !profile.blockActivities?.message?.XP) {
                    let xp_multiplier_for_channel = 0
                    let channel = client.cache.channels.find(channel => channel.id === message.channelId && channel.isEnabled)
                    if (!channel) channel = client.cache.channels.find(channel => channel.id === message.channel?.parentId && channel.isEnabled)
                    if (channel) {
                        xp_multiplier_for_channel = channel.xp_multiplier
                    }
                    const base_xp = 1 * settings.xpForMessage
                    const xp = base_xp + (base_xp * profile.getXpBoost(xp_multiplier_for_channel))
                    if (xp) await profile.addXp(xp)
                }
                if (settings.rpForMessage && !profile.blockActivities?.message?.RP) {
                    let rp_multiplier_for_channel = 0
                    let channel = client.cache.channels.find(channel => channel.id === message.channelId && channel.isEnabled)
                    if (!channel) channel = client.cache.channels.find(channel => channel.id === message.channel?.parentId && channel.isEnabled)
                    if (channel) {
                        rp_multiplier_for_channel = channel.rp_multiplier
                    }
                    const base_rp = 1 * settings.rpForMessage
                    const rp = base_rp + (base_rp * profile.getRpBoost(rp_multiplier_for_channel))
                    if (rp) await profile.addRp(rp)
                }
                const guildQuests = client.cache.quests.filter(quest => quest.guildID === message.guildId && quest.isEnabled && quest.targets.some(target => target.type === "message"))
                if (guildQuests.size) await profile.addQuestProgression("message", 1, message.channelId)
                const achievements = client.cache.achievements.filter(e => e.guildID === message.guildId && e.type === AchievementType.Message && e.enabled)
                await Promise.all(achievements.map(async achievement => {
                    if (!profile.achievements?.some(ach => ach.achievmentID === achievement.id) && profile.messages >= achievement.amount && !client.tempAchievements[profile.userID]?.includes(achievement.id)) {
                        if (!client.tempAchievements[profile.userID]) client.tempAchievements[profile.userID] = []
                        client.tempAchievements[profile.userID].push(achievement.id)
                        await profile.addAchievement(achievement)
                    }
                }))
            }    
        }
        if (message.member && !message.member.roles.cache.hasAny(...settings.roles?.mutedRoles) && !profile.blockActivities?.message?.items) {
            let items_for_message = client.cache.items.filter(item => item.guildID === message.guildId && !item.temp && item.enabled && item.activities?.message?.chance).sort((a, b) => a.activities.message.chance - b.activities.message.chance).map(e => { 
                return { itemID: e.itemID, displayEmoji: e.displayEmoji, name: e.name, activities: { message: { chance: e.activities.message.chance, amountFrom: e.activities.message.amountFrom, amountTo: e.activities.message.amountTo } }, hex: e.hex, activities_message_permission: e.activities_message_permission }
            })
            if (items_for_message.length) {
                let luck_multiplier_for_channel = 0
                if (message.channel) {
                    let channel = client.cache.channels.find(channel => channel.id === message.channelId && channel.isEnabled)
                    if (!channel) channel = client.cache.channels.find(channel => channel.id === message.channel?.parentId && channel.isEnabled)
                    if (channel) {
                        luck_multiplier_for_channel = channel.luck_multiplier
                    }    
                }
                const bonus = new Decimal(1).plus(profile.getLuckBoost(luck_multiplier_for_channel))
                items_for_message = client.functions.adjustActivityChanceByLuck(items_for_message, bonus, "message")
                let base_chance = Math.random()
                if (base_chance === 0) base_chance = 1
                const asyncFilter = async (arr, predicate) => {
                    const results = await Promise.all(arr.map(predicate))
                    return results.filter((_v, index) => results[index])
                }
                items_for_message = await asyncFilter(items_for_message, async (e) => {
                    if (e.activities_message_permission) {
                        const permission = client.cache.permissions.find(i => i.id === e.activities_message_permission)
                        if (permission) {
                            const isPassing = permission.for(profile, message.member, message.channel)
                            if (isPassing.value === true) return e	
                        } else return e
                    } else return e
                })
                let item = drop(items_for_message, base_chance)
                if (item) {
                    const amount = client.functions.getRandomNumber(item.activities.message.amountFrom, item.activities.message.amountTo)
                    await profile.addItem(item.itemID, amount)
                    const embed = new EmbedBuilder()
                        .setAuthor({ name: message.member.displayName, iconURL: message.author.displayAvatarURL() })
                        .setDescription(`${client.language({ textId: "Нашел", guildId: message.guildId })}: ${item.displayEmoji}**${item.name}** (${amount})`)
                        .setColor(item.hex || "#2F3236")
                    if (settings.channels?.itemsNotificationChannelId) await message.member.guild.channels.fetch(settings.channels.itemsNotificationChannelId).then(channel => channel.send({ content: profile.itemMention ? `<@${message.member.user.id}>` : ` `, embeds: [embed] })).catch(e => null)
                }    
            }
        }
        await profile.save()
    }
})
const lerp = (min, max, roll) => ((1 - roll) * min + roll * max)
const drop = (items, roll) => {
    const chance = lerp(0, 100, roll)
    let current = new Decimal(0)
    for (const item of items) {
        if (current.lte(chance) && current.plus(item.activities.message.chance).gte(chance)) {
            return item
        }
        current = current.plus(item.activities.message.chance)
    }
}
