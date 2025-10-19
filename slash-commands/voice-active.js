const { ButtonBuilder, ButtonStyle, ActionRowBuilder, EmbedBuilder, Collection } = require("discord.js")
const { AchievementType } = require("../enums")
const UserRegexp = /usr{(.*?)}/
const LimitRegexp = /limit{(.*?)}/
const Decimal = require('decimal.js')
module.exports = {
    name: 'voice-active',
    nameLocalizations: {
        'ru': `голосовая-активность`,
        'uk': `голосова-активність`,
        'es-ES': `actividad-voz`
    },
    description: 'List of users in voice channel, who gaining XP, currency, items',
    descriptionLocalizations: {
        'ru': `Список пользователей, которые в данный момент получают опыт, валюту, предметы в голосовом канале`,
        'uk': `Список користувачів, які зараз отримують досвід, валюту, предмети у голосовому каналі`,
        'es-ES': `Lista de usuarios en el canal de voz que están ganando XP, moneda y objetos`
    },
    dmPermission: false,
    group: `general-group`,
    cooldowns: new Collection(),
    /**
     *
     * @param {Discord} client
     * @param {CommandInteraction} interaction
     * @param {String[]} args
     */
    run: async (client, interaction, args) => {
        if (interaction.isChatInputCommand()) await interaction.deferReply()
        else {
            if (interaction.user.id !== UserRegexp.exec(interaction.customId)?.[1]) return interaction.deferUpdate().catch(e => null)
            await interaction.update({ content: interaction.message.content || " ", embeds: interaction.message.embeds, components: [new ActionRowBuilder().addComponents(new ButtonBuilder().setEmoji("⏳").setStyle(ButtonStyle.Secondary).setCustomId(`0`).setDisabled(true))]})
        }
        const embed = new EmbedBuilder()
        let profiles = client.cache.profiles.filter(profile => profile.startTime <= Date.now() && profile.guildID === interaction.guildId).sort((a, b) => b.hoursSession - a.hoursSession)
        const settings = client.cache.settings.get(interaction.guildId)
        if (interaction.isChatInputCommand() && (client.voiceActiveCooldown[interaction.guildId] < Date.now() || !client.voiceActiveCooldown[interaction.guildId])) {
            client.voiceActiveCooldown[interaction.guildId] = Date.now() + 60000
            for (const profile of profiles.map(e => e)) {
                await UpdateVoiceState(profile, Date.now())
            }
            profiles = client.cache.profiles.filter(profile => profile.startTime <= Date.now() && profile.guildID === interaction.guildId).sort((a, b) => b.hoursSession - a.hoursSession)
        }
        let min = 0
        let limit = 20
        if (!interaction.isChatInputCommand()) {
            limit = +LimitRegexp.exec(interaction.customId)?.[1]
            min = limit - 20
            if (isNaN(limit) || isNaN(min)) {
                limit = +LimitRegexp.exec(interaction.customId)?.[1]
                min = limit - 20  
            }
        }
        let array_btn = [
            new ButtonBuilder().setEmoji(`${client.config.emojis.arrowLeft2}`).setStyle(ButtonStyle.Secondary).setCustomId(`cmd{voice-active}usr{${interaction.user.id}}limit{20}1`).setDisabled((profiles.size <= 20 && min == 0) || (profiles.size > 20 && min < 20)),
            new ButtonBuilder().setEmoji(`${client.config.emojis.arrowLeft}`).setStyle(ButtonStyle.Secondary).setCustomId(`cmd{voice-active}usr{${interaction.user.id}}limit{${limit - 20}}2`).setDisabled((profiles.size <= 20 && min == 0) || (profiles.size > 20 && min < 20)),
            new ButtonBuilder().setEmoji(`${client.config.emojis.arrowRight}`).setStyle(ButtonStyle.Secondary).setCustomId(`cmd{voice-active}usr{${interaction.user.id}}limit{${limit + 20}}3`).setDisabled((profiles.size <= 20 && min == 0) || (profiles.size > 20 && min >= profiles.size - 20)),
            new ButtonBuilder().setEmoji(`${client.config.emojis.arrowRight2}`).setStyle(ButtonStyle.Secondary).setCustomId(`cmd{voice-active}usr{${interaction.user.id}}limit{${profiles.size + (profiles.size % 20 == 0 ? 0 : 20 - (profiles.size % 20))}}4`).setDisabled((profiles.size <= 20 && min == 0) || (profiles.size > 20 && min >= profiles.size - 20))
        ]
        profiles = profiles.map(e => e).slice(min, limit)
        embed.setColor(interaction.member.displayHexColor)
        embed.setAuthor({ name: interaction.member.displayName, iconURL: interaction.member.displayAvatarURL() })
        embed.setDescription(`${client.language({ textId: `Пользователи в не исключенных голосовых каналах, которые получают опыт, валюту, предметы`, guildId: interaction.guildId, locale: interaction.locale })}:\n${profiles.map(profile => {
            return `${profiles.findIndex(i => i.userID === profile.userID) + 1 + min}. <@${profile.userID}> ${client.config.emojis.mic}️${profile.hoursSession.toLocaleString()} ➜ ${client.config.emojis.XP}${profile.xpSession.toLocaleString()} ${settings.displayCurrencyEmoji}${(profile.currencySession).toLocaleString()} ${client.config.emojis.RP}${profile.rpSession.toLocaleString()}`
        }).join("\n")}`)
        return interaction.editReply({ embeds: [embed], components: [new ActionRowBuilder().addComponents(array_btn)] })
        
        async function UpdateVoiceState(profile, newDate) {
            let guild = interaction.guild
            if (client.blacklist(guild.id, "full_ban", "guilds") || client.blacklist(profile.userID, "full_ban", "users")) {
                profile.itemsSession = undefined
                profile.hoursSession = 0
                profile.xpSession = 0
                profile.currencySession = 0
                profile.startTime = undefined
                await profile.save()
                return
            }
            const member = await interaction.guild.members.fetch(profile.userID).catch(e => null)
            if (member) {
                let { channel } = member.voice
                if (member.voice.channelId !== null && channel?.members.filter(member => !member.user.bot && !member.voice.mute).size > 1 && settings.channels.mutedChannels.includes(member.voice.channelId) === false) {
                    client.globalCooldown[`${guild.id}_${profile.userID}`] = Date.now() + 30000
                    const timeDiff = newDate - profile.startTime
                    //appendMsVC
                    const hours = timeDiff/1000/60/60
                    if (hours <= 100) {
                        const rewards = {
                            xp: 0,
                            currency: 0,
                            rp: 0
                        }
                        if (!member.roles.cache.hasAny(...settings.roles?.mutedRoles)) {
                            if (settings.xpForVoice && !profile.blockActivities?.voice?.XP) {
                                let xp_multiplier_for_channel = 0
                                let xp_multiplier_for_members = 0
                                if (channel) {
                                    let channelMultipliers = client.cache.channels.find(channelMultipliers => channelMultipliers.id === channel.id && channelMultipliers.isEnabled)
                                    if (!channelMultipliers) channelMultipliers = client.cache.channels.find(channelMultipliers => channelMultipliers.id === channel.parentId && channelMultipliers.isEnabled)
                                    if (channelMultipliers) {
                                        let members_size = channel.members.filter(member => !member.voice.mute && !member.user.bot).size
                                        if (members_size < channelMultipliers.xp_min_members_size) members_size = 0
                                        if (members_size > channelMultipliers.xp_max_members_size) members_size = channelMultipliers.xp_max_members_size
                                        xp_multiplier_for_channel = channelMultipliers.xp_multiplier
                                        xp_multiplier_for_members = channelMultipliers.xp_multiplier_for_members * members_size
                                    }    
                                }
                                const base_xp = timeDiff/1000/60 * settings.xpForVoice
                                const xp = base_xp + (base_xp * profile.getXpBoost(xp_multiplier_for_channel + xp_multiplier_for_members))
                                if (xp) rewards.xp += xp
                            }
                            if (settings.rpForVoice && !profile.blockActivities?.voice?.RP) {
                                let rp_multiplier_for_channel = 0
                                let rp_multiplier_for_members = 0
                                if (channel) {
                                    let channelMultipliers = client.cache.channels.find(channelMultipliers => channelMultipliers.id === channel.id && channelMultipliers.isEnabled)
                                    if (!channelMultipliers) channelMultipliers = client.cache.channels.find(channelMultipliers => channelMultipliers.id === channel.parentId && channelMultipliers.isEnabled)
                                    if (channelMultipliers) {
                                        let members_size = channel.members.filter(member => !member.voice.mute && !member.user.bot).size
                                        if (members_size < channelMultipliers.rp_min_members_size) members_size = 0
                                        if (members_size > channelMultipliers.rp_max_members_size) members_size = channelMultipliers.rp_max_members_size
                                        rp_multiplier_for_channel = channelMultipliers.rp_multiplier
                                        rp_multiplier_for_channel = channelMultipliers.rp_multiplier_for_members * members_size
                                    }
                                }
                                const base_rp = timeDiff/1000/60 * settings.rpForVoice
                                const rp = base_rp + (base_rp * profile.getRpBoost(rp_multiplier_for_channel + rp_multiplier_for_members))
                                if (rp) rewards.rp += rp
                            }
                            if (settings.curForVoice && !profile.blockActivities?.voice?.CUR) {
                                let cur_multiplier_for_channel = 0
                                let cur_multiplier_for_members = 0
                                if (channel) {
                                    let channelMultipliers = client.cache.channels.find(channelMultipliers => channelMultipliers.id === channel.id && channelMultipliers.isEnabled)
                                    if (!channelMultipliers) channelMultipliers = client.cache.channels.find(channelMultipliers => channelMultipliers.id === channel.parentId && channelMultipliers.isEnabled)
                                    if (channelMultipliers) {
                                        let members_size = channel.members.filter(member => !member.voice.mute && !member.user.bot).size
                                        if (members_size < channelMultipliers.cur_min_members_size) members_size = 0
                                        if (members_size > channelMultipliers.cur_max_members_size) members_size = channelMultipliers.cur_max_members_size
                                        cur_multiplier_for_channel = channelMultipliers.cur_multiplier
                                        cur_multiplier_for_members = channelMultipliers.cur_multiplier_for_members * members_size
                                    }
                                }
                                const base_cur = timeDiff/1000/60 * settings.curForVoice
                                const cur = base_cur + (base_cur * profile.getCurBoost(cur_multiplier_for_channel + cur_multiplier_for_members))
                                if (cur) {
                                    rewards.currency += cur
                                }
                            }
                            const guildQuests = client.cache.quests.filter(quest => quest.guildID === interaction.guildId && quest.isEnabled && quest.targets.some(target => target.type === "voice"))
                            if (guildQuests.size) await profile.addQuestProgression("voice", hours*60, channel?.id)
                            let achievements = client.cache.achievements.filter(e => e.guildID === guild.id && e.enabled && e.type === AchievementType.DailyHours)
                            await Promise.all(achievements.map(async achievement => {
                                if (!profile.achievements?.some(ach => ach.achievmentID === achievement.id) && profile.hoursSession >= achievement.amount && !client.tempAchievements[member.user.id]?.includes(achievement.id)) { 
                                    if (!client.tempAchievements[profile.userID]) client.tempAchievements[member.user.id] = []
                                    client.tempAchievements[member.user.id].push(achievement.id)
                                    await profile.addAchievement(achievement)
                                }    
                            }))
                            achievements = client.cache.achievements.filter(e => e.guildID === guild.id && e.enabled && e.type === AchievementType.Voice)
                            await Promise.all(achievements.map(async achievement => {
                                if (!profile.achievements?.some(ach => ach.achievmentID === achievement.id) && profile.hours >= achievement.amount && !client.tempAchievements[member.user.id]?.includes(achievement.id)) {
                                    if (!client.tempAchievements[profile.userID]) client.tempAchievements[member.user.id] = []
                                    client.tempAchievements[member.user.id].push(achievement.id)
                                    await profile.addAchievement(achievement)
                                }        
                            }))
                        }
                        if (rewards.xp > 1000000000000) rewards.xp = 1000000000000
                        profile.hours = hours
                        profile.hoursSession += hours
                        profile.xpSession += rewards.xp
                        profile.rpSession += rewards.rp
                        profile.currencySession += rewards.currency
                        profile.currency = rewards.currency
                        profile.startTime = newDate
                        if (rewards.xp) await profile.addXp(rewards.xp)
                        if (rewards.rp) await profile.addRp(rewards.rp)
                        if (rewards.currency > 0) await profile.addCurrency(rewards.currency)
                        if (!member.roles.cache.hasAny(...settings.roles?.mutedRoles) && !profile.blockActivities?.voice?.items) {
                            let luck_multiplier_for_channel = 0
                            let luck_multiplier_for_members = 0
                            if (channel) {
                                let channelMultipliers = client.cache.channels.find(channelMultipliers => channelMultipliers.id === channel.id && channelMultipliers.isEnabled)
                                if (!channelMultipliers) channelMultipliers = client.cache.channels.find(channelMultipliers => channelMultipliers.id === channel.parentId && channelMultipliers.isEnabled)
                                if (channelMultipliers) {
                                    let members_size = channel.members.filter(member => !member.voice.mute && !member.user.bot).size
                                    if (members_size < channelMultipliers.luck_min_members_size) members_size = 0
                                    if (members_size > channelMultipliers.luck_max_members_size) members_size = channelMultipliers.luck_max_members_size
                                    luck_multiplier_for_channel = channelMultipliers.luck_multiplier
                                    luck_multiplier_for_members = channelMultipliers.luck_multiplier_for_members * members_size
                                }	
                            }
                            let Items = client.cache.items.filter(e => e.guildID === guild.id && !e.temp && e.enabled && e.activities?.voice?.chance).sort((a, b) => a.activities.voice.chance - b.activities.voice.chance).map(e => { 
                                return { itemID: e.itemID, displayEmoji: e.displayEmoji, name: e.name, activities: { voice: { chance: e.activities.voice.chance, amountFrom: e.activities.voice.amountFrom, amountTo: e.activities.voice.amountTo } }, activities_voice_permission: e.activities_voice_permission }
                            })
                            if (Items.length) {
                                const received_items = []
                                let count = Math.round((hours*60))
                                const bonus = new Decimal(1).plus(profile.getLuckBoost(luck_multiplier_for_channel))
                                Items = client.functions.adjustActivityChanceByLuck(Items, bonus, "voice")
                                for (let i = 0; i < count; i++) {
                                    let base_chance = Math.random()
                                    if (base_chance === 0) base_chance = 1
                                    const lerp = (min, max, roll) => ((1 - roll) * min + roll * max)
                                    const drop = (items, roll) => {
                                        const chance = lerp(0, 100, roll)
                                        let current = new Decimal(0)
                                        for (const item of items) {
                                            if (current.lte(chance) && current.plus(item.activities.voice.chance).gte(chance)) {
                                                return item
                                            }
                                            current = current.plus(item.activities.voice.chance)
                                        }
                                    }
                                    const asyncFilter = async (arr, predicate) => {
                                        const results = await Promise.all(arr.map(predicate))
                                        return results.filter((_v, index) => results[index])
                                    }
                                    let items = await asyncFilter(Items, async (e) => {
                                        if (e.activities_voice_permission) {
                                            const permission = client.cache.permissions.get(e.activities_voice_permission)
                                            if (permission) {
                                                const isPassing = permission.for(profile, member, channel)
                                                if (isPassing.value === true) return e	
                                            } else return e
                                        } else return e
                                    })
                                    const item = drop(items, base_chance)
                                    if (item) {
                                        const amount = client.functions.getRandomNumber(item.activities.voice.amountFrom, item.activities.voice.amountTo)
                                        await profile.addItem(item.itemID, amount)
                                        const received_item = received_items.find(e => { return e.itemID === item.itemID })
                                        if (received_item) received_item.amount += amount
                                        else {
                                            received_items.push({
                                                itemID: item.itemID,
                                                name: item.name,
                                                emoji: item.emoji,
                                                amount: amount,
                                            })
                                        }
                                    }
                                }
                                if (received_items.length) {
                                    let index = 0
                                    for (const received_item of received_items) {
                                        const sessionItem = profile.itemsSession?.find(e => { return e.itemID === received_item.itemID })
                                        if (sessionItem) {
                                            sessionItem.amount += received_item.amount
                                        } else {
                                            if (!profile.itemsSession) profile.itemsSession = []
                                            profile.itemsSession.push({
                                                itemID: received_item.itemID,
                                                amount: received_item.amount,
                                            })
                                        }
                                        received_items[index] = `**${await client.functions.getEmoji(client, received_item.emoji)}${received_item.name}** (${received_item.amount})`
                                        index++
                                    }
                                    if (settings.channels.itemsNotificationChannelId) {
                                        const channel = await guild.channels.fetch(settings.channels.itemsNotificationChannelId).catch(e => null)
                                        if (channel && channel.permissionsFor(guild.members.me).has("SendMessages")) {
                                            const embed2 = new EmbedBuilder()
                                                .setAuthor({ name: member.displayName, iconURL: member.displayAvatarURL() })
                                                .setDescription(`${client.language({ textId: "Нашел", guildId: guild.id })}:\n${received_items.join("\n")}`)
                                                .setColor("#2F3236")
                                            channel.send({ content: profile.itemMention ? `<@${member.user.id}>` : ` `, embeds: [embed2] }).catch(e => null)
                                        }
                                    }
                                }	
                            }
                        }
                        await profile.save()
                    } else {
                        profile.itemsSession = undefined
                        profile.hoursSession = 0
                        profile.xpSession = 0
                        profile.currencySession = 0
                        profile.startTime = newDate
                        await profile.save()
                    }
                    return delete client.globalCooldown[`${guild.id}_${profile.userID}`]
                } else if (member.voice.channelId === null) {
                    profile.itemsSession = undefined
                    profile.hoursSession = 0
                    profile.xpSession = 0
                    profile.currencySession = 0
                    profile.startTime = undefined
                    return await profile.save()
                } else if (settings.channels.mutedChannels.includes(member.voice.channelId) === true) {
                    profile.itemsSession = undefined
                    profile.hoursSession = 0
                    profile.xpSession = 0
                    profile.currencySession = 0
                    profile.startTime = undefined
                    return await profile.save()
                } else {
                    profile.startTime = undefined
                    return await profile.save()
                }
            } else {
                profile.itemsSession = undefined
                profile.hoursSession = 0
                profile.xpSession = 0
                profile.currencySession = 0
                profile.startTime = undefined
                return await profile.save()
            }
        }
    }
}