const client = require("../index")
const { setLanguage } = require(`../handler/language`)
const { Events, ShardClientUtil } = require("discord.js")
const request = require('request')
const { RewardType } = require("../enums")
const Permission = require("../classes/permission.js")
const Job = require("../classes/job.js")
const Giveaway = require("../classes/giveaway.js")
const Wormhole = require("../classes/wormhole.js")
const Profile = require("../classes/profile.js")
const Item = require("../classes/item.js")
const Achievement = require("../classes/achievement.js")
const IncomeRole = require("../classes/IncomeRole")
const ChannelMultipliers = require("../classes/channelMultipliers")
const Promocode = require("../classes/promocode")
const Autogenerator = require("../classes/promocodeAutogenerator")
const Lot = require("../classes/Lot")
const Settings = require("../classes/Settings")
client.on(Events.GuildCreate, async (guild) => {
    if (client.blacklist(guild.id, "full_ban", "guilds")) return
    let settings = await client.functions.fetchSettings(client, guild.id)
    if (settings.deleteFromDB) {
        settings.deleteFromDB = undefined
        settings.clearDeleteFromDbTimeout()
        await settings.save()
        const profiles = await client.profileSchema.find({ guildID: guild.id }).lean()
        await Promise.all(profiles.map(async profile => {
            profile = new Profile(client, profile)
            client.cache.profiles.set(profile.guildID+profile.userID, profile)
        }))
        const items = await client.itemSchema.find({ guildID: guild.id }).lean()
        await Promise.all(items.map(item => {
            item = new Item(client, item)
            client.cache.items.set(item.itemID, item)
        }))
        const achievements = await client.achievementSchema.find({ guildID: guild.id }).lean()
        await Promise.all(achievements.map(achievement => {
            achievement = new Achievement(client, achievement)
            client.cache.achievements.set(achievement.id, achievement)
        }))
        const permissions = await client.permissionSchema.find({ guildID: guild.id }).lean()
        await Promise.all(permissions.map(permission => {
            permission = new Permission(client, permission)
            client.cache.permissions.set(permission.id, permission)
        }))
        const jobs = await client.jobSchema.find({ guildID: guild.id }).lean()
        await Promise.all(jobs.map(job => {
            job = new Job(client, job)
            client.cache.jobs.set(job.id, job)
        }))
        const wormholes = await client.wormholeSchema.find({ guildID: guild.id }).lean()
        await Promise.all(wormholes.map(wormhole => {
            wormhole = new Wormhole(client, wormhole)
            if (wormhole.isEnabled) wormhole.cronJobStart()
            client.cache.wormholes.set(wormhole.wormholeID, wormhole)
        }))
        const roles = await client.roleSchema.find({ guildID: guild.id }).lean()
        await Promise.all(roles.map(role => {
            role = new IncomeRole(client, role)
            client.cache.roles.set(role.id, role)
        }))
        const channels = await client.channelMultipliersSchema.find({ guildID: guild.id }).lean()
        await Promise.all(channels.map(channel => {
            channel = new ChannelMultipliers(client, channel)
            client.cache.channels.set(channel.id, channel)
        }))
        const promocodes = await client.promocodeSchema.find({ guildID: guild.id }).lean()
        await Promise.all(promocodes.map(promocode => {
            promocode = new Promocode(client, promocode)
            if (promocode.resetCronPattern) promocode.cronJobStart()
            if (promocode.deleteDate) promocode.setTimeoutDelete()
            client.cache.promocodes.set(`${promocode.code}_${promocode.guildID}`, promocode)
        }))
        const autogenerators = await client.promocodeAutogeneratorSchema.find({ guildID: guild.id }).lean()
        await Promise.all(autogenerators.map(autogenerator => {
            autogenerator = new Autogenerator(client, autogenerator)
            if (autogenerator.isEnabled) autogenerator.cronJobStart()
            client.cache.promocodeAutogenerators.set(autogenerator.id, autogenerator)
        }))
        const lots = await client.marketSchema.find({ guildID: guild.id }).lean()
        await Promise.all(lots.map(lot => {
            lot = new Lot(client, lot)
            if (lot.lifeTime) lot.setTimeoutDelete()
            client.cache.lots.set(lot.lotID, lot)
        }))
        const giveaways = await client.giveawaySchema.find({ guildID: guild.id }).lean()
        await Promise.all(giveaways.map(giveaway => {
            giveaway = new Giveaway(client, giveaway)
            if (giveaway.endsTime && giveaway.status === "started") giveaway.setTimeoutEnd()
            if (giveaway.deleteTemp && giveaway.status !== "started") giveaway.setTimeoutDelete()
            client.cache.giveaways.set(giveaway.giveawayID, giveaway)
        }))
    }
    setLanguage(guild, settings ? settings.language : 'en-US')
    request({
        uri: process.env.entryLogWebhook,
        body: JSON.stringify({
            content: `🟢 Бот зашел на сервер ${guild.name} (${guild.id}) c 👤${guild.memberCount} участниками`,
        }),
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    client.shard.broadcastEval(async (c) => {
        const totalGuilds = await c.shard.fetchClientValues('guilds.client.cache.size').then(results => {
            return results.reduce((prev, curr) => prev + curr, 0)
        })
        const giveaways = c.cache.giveaways.filter(giveaway => giveaway.ends?.type === "servers" && giveaway.status === "started" && giveaway.ends.amount <= totalGuilds && giveaway.guildID === c.config.discord.supportServerId)
        if (giveaways.size) {
            const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js")
            giveaways.forEach(async giveaway => {
                const guild = c.guilds.client.cache.get(giveaway.guildID)
                const profile = await c.functions.fetchProfile(c, giveaway.creator, guild.id)
                const channel = await guild.channels.fetch(giveaway.channelId).catch(() => null)
                if (!channel) {
                    if (giveaway.type === "user") {
                        for (const element of giveaway.rewards) {
                            if (element.type === RewardType.Currency) {
                                profile.currency += element.amount
                            }
                            else if (element.type === RewardType.Item) {
                                const item = c.client.cache.items.find(i => i.itemID === element.id && !i.temp && i.enabled)
                                if (item) await profile.addItem({ itemID: element.id, amount: element.amount })
                            } else if (element.type === RewardType.Role) {
                                const role = guild.roles.client.cache.get(element.id)
                                if (role) profile.addRole({ id: element.id, amount: element.amount, ms: element.ms })
                            }
                        }
                        await profile.save()
                    }
                    return giveaway.delete()
                }
                const giveawayMessage = await channel.messages.fetch({ message: giveaway.messageId, cache: false, force: true }).catch(() => null)
                if (!giveawayMessage) {
                    if (giveaway.type === "user") {
                        for (const element of giveaway.rewards) {
                            if (element.type === RewardType.Currency) {
                                profile.currency += element.amount
                            }
                            else if (element.type === RewardType.Item) {
                                const item = c.client.cache.items.find(i => i.itemID === element.id && !i.temp && i.enabled)
                                if (item) await profile.addItem({ itemID: element.id, amount: element.amount })
                            } else if (element.type === RewardType.Role) {
                                const role = guild.roles.client.cache.get(element.id)
                                if (role) profile.addRole({ id: element.id, amount: element.amount, ms: element.ms })
                            }
                        }
                        await profile.save()
                    }
                    return giveaway.delete()
                }
                if (!giveawayMessage.reactions) {
                    if (giveaway.type === "user") {
                        for (const element of giveaway.rewards) {
                            if (element.type === RewardType.Currency) {
                                profile.currency += element.amount
                            }
                            else if (element.type === RewardType.Item) {
                                const item = c.client.cache.items.find(i => i.itemID === element.id && !i.temp && i.enabled)
                                if (item) await profile.addItem({ itemID: element.id, amount: element.amount })
                            } else if (element.type === RewardType.Role) {
                                const role = guild.roles.client.cache.get(element.id)
                                if (role) profile.addRole({ id: element.id, amount: element.amount, ms: element.ms })
                            }
                        }
                        await profile.save()
                    }
                    return giveaway.delete()
                }
                let reaction = giveawayMessage.reactions.resolve("1005873464822997115")
                if (!reaction) reaction = giveawayMessage.reactions.resolve(client.config.emojis.tada.slice(client.config.emojis.tada.lastIndexOf(":")+1, client.config.emojis.tada.lastIndexOf(">")))
                if (!reaction) reaction = giveawayMessage.reactions.resolve("🎉")
                if (!reaction) {
                    if (giveaway.type === "user") {
                        for (const element of giveaway.rewards) {
                            if (element.type === RewardType.Currency) {
                                profile.currency += element.amount
                            }
                            else if (element.type === RewardType.Item) {
                                const item = c.client.cache.items.find(i => i.itemID === element.id && !i.temp && i.enabled)
                                if (item) await profile.addItem({ itemID: element.id, amount: element.amount })
                            } else if (element.type === RewardType.Role) {
                                const role = guild.roles.client.cache.get(element.id)
                                if (role) profile.addRole({ id: element.id, amount: element.amount, ms: element.ms })
                            }
                        }
                        await profile.save()
                    }
                    return giveaway.delete()
                }
                const object = await giveaway.end(guild, reaction)
                if (!object.winners.length && giveaway.type === "user") {
                    for (const element of giveaway.rewards) {
                        if (element.type === RewardType.Currency) {
                            profile.currency += element.amount
                        }
                        else if (element.type === RewardType.Item) {
                            const item = c.client.cache.items.find(i => i.itemID === element.id && !i.temp && i.enabled)
                            if (item) await profile.addItem({ itemID: element.id, amount: element.amount })
                        } else if (element.type === RewardType.Role) {
                            const role = guild.roles.client.cache.get(element.id)
                            if (role) profile.addRole({ id: element.id, amount: element.amount, ms: element.ms })
                        }
                        await profile.save()
                    }
                }
                const embed = EmbedBuilder.from(giveawayMessage.embeds[0])
                embed.addFields([
                    {
                        name: `${c.language({ textId: `Победители`, guildId: guild.id })}`,
                        value: object.winners.length ? object.winners.length > 42 ? object.winners.slice(0, 42).map(e => `<@${e.id}>`).join(", ") + ` ${c.language({ textId: `и еще`, guildId: guild.id })} ${object.winners.length - 42}...` : object.winners.map(e => `<@${e.id}>`).join(", ") : `${c.language({ textId: `Нет подходящих`, guildId: guild.id })}`
                    }
                ])
                giveawayMessage.edit({ 
                    content: `${c.config.emojis.tada}${c.config.emojis.tada}${c.language({ textId: `РАЗДАЧА ОКОНЧЕНА`, guildId: guild.id })}${c.config.emojis.tada}${c.config.emojis.tada}`, 
                    embeds: [embed], 
                    components: giveaway.permission && c.client.cache.permissions.get(giveaway.permission) ? 
                        [ 
                            new ActionRowBuilder()
                                .addComponents(
                                    new ButtonBuilder()
                                        .setStyle(ButtonStyle.Primary)
                                        .setLabel(`${c.language({ textId: `Требование`, guildId: guild.id })}`)
                                        .setCustomId(`cmd{check-giveaway-requirements}giveaway{${giveaway.giveawayID}}`),
                                    new ButtonBuilder()
                                        .setStyle(ButtonStyle.Primary)
                                        .setLabel(`${c.language({ textId: `Реролл`, guildId: guild.id })}`)
                                        .setCustomId(`cmd{giveaway-reroll}giveaway{${giveaway.giveawayID}}`)
                                ) 
                        ] : [
                            new ActionRowBuilder()
                                .addComponents(
                                    new ButtonBuilder()
                                        .setStyle(ButtonStyle.Primary)
                                        .setLabel(`${c.language({ textId: `Реролл`, guildId: guild.guildId })}`)
                                        .setCustomId(`cmd{giveaway-reroll}giveaway{${giveaway.giveawayID}}`)
                                )
                        ]
                    })
                if (object.winners.length) {
                    return giveawayMessage.reply({ 
                        content: `🥳 ${object.winners.map(e => `<@${e.id}>`).join(", ")} [${c.language({ textId: "поздравляем", guildId: guild.id })}! ${object.winners.length === 1 ? c.language({ textId: "Ты стал победителем раздачи и выиграл", guildId: guild.id }) : c.language({ textId: "Вы стали победителями раздачи и выиграли", guildId: guild.id })}](<${giveawayMessage.url}>): ${object.rewards.join(", ")}`,
                        allowedMentions: { users: object.winners.map(e => e.id) } 
                    })
                }
            })
        }    
    }, { shard: ShardClientUtil.shardIdForGuildId(client.config.discord.supportServerId, client.shard.count) })
})