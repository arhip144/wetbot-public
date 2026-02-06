const { RewardType } = require("../enums")
const client = require("../index")
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js")
client.on('giveawayEnd', async (giveaway) => {
    const guild = client.guilds.cache.get(giveaway.guildID)
    if (!guild) return giveaway.delete()
    if (client.blacklist(guild.id, "full_ban", "guilds")) return giveaway.delete()
    const channel = await guild.channels.fetch(giveaway.channelId).catch(() => null)
    const profile = await client.functions.fetchProfile(client, giveaway.creator, guild.id)
    if (!channel) {
        if (giveaway.type === "user") {
            for (const element of giveaway.rewards) {
                if (element.type === RewardType.Currency) {
                    profile.currency += element.amount
                }
                else if (element.type === RewardType.Item) {
                    const item = client.cache.items.find(i => i.itemID === element.id && !i.temp)
                    if (item) await profile.addItem({ itemID: element.id, amount: element.amount })
                } else if (element.type === RewardType.Role) {
                    const role = guild.roles.cache.get(element.id)
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
                    const item = client.cache.items.find(i => i.itemID === element.id && !i.temp)
                    if (item) await profile.addItem({ itemID: element.id, amount: element.amount })
                } else if (element.type === RewardType.Role) {
                    const role = guild.roles.cache.get(element.id)
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
                    const item = client.cache.items.find(i => i.itemID === element.id && !i.temp)
                    if (item) await profile.addItem({ itemID: element.id, amount: element.amount })
                } else if (element.type === RewardType.Role) {
                    const role = guild.roles.cache.get(element.id)
                    if (role) profile.addRole({ id: element.id, amount: element.amount, ms: element.ms })
                }
            }
            await profile.save()
        }
        return giveaway.delete()
    }
    let reaction = giveawayMessage.reactions.resolve("🎉")
    if (!reaction) {
        if (giveaway.type === "user") {
            for (const element of giveaway.rewards) {
                if (element.type === RewardType.Currency) {
                    profile.currency += element.amount
                }
                else if (element.type === RewardType.Item) {
                    const item = client.cache.items.find(i => i.itemID === element.id && !i.temp)
                    if (item) await profile.addItem({ itemID: element.id, amount: element.amount })
                } else if (element.type === RewardType.Role) {
                    const role = guild.roles.cache.get(element.id)
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
                const item = client.cache.items.find(i => i.itemID === element.id && !i.temp)
                if (item) await profile.addItem({ itemID: element.id, amount: element.amount })
            } else if (element.type === RewardType.Role) {
                const role = guild.roles.cache.get(element.id)
                if (role) profile.addRole({ id: element.id, amount: element.amount, ms: element.ms })
            }
            await profile.save()
        }
    }
    const embed = EmbedBuilder.from(giveawayMessage.embeds[0])
    embed.addFields([
        {
            name: `${client.language({ textId: `Победители`, guildId: guild.id })}`,
            value: object.winners.length ? object.winners.length > 42 ? object.winners.slice(0, 42).map(e => `<@${e.id}>`).join(", ") + ` ${client.language({ textId: `и еще`, guildId: guild.id })} ${object.winners.length - 42}...` : object.winners.map(e => `<@${e.id}>`).join(", ") : `${client.language({ textId: `Нет подходящих`, guildId: guild.id })}`
        }
    ])
    giveawayMessage.edit({ 
        content: `${client.config.emojis.tada}${client.config.emojis.tada}${client.language({ textId: `РАЗДАЧА ОКОНЧЕНА`, guildId: guild.id })}${client.config.emojis.tada}${client.config.emojis.tada}`, 
        embeds: [embed], 
        components: giveaway.permission && client.cache.permissions.get(giveaway.permission) ? 
            [ 
                new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setStyle(ButtonStyle.Primary)
                            .setLabel(`${client.language({ textId: `Требование`, guildId: guild.id })}`)
                            .setCustomId(`cmd{check-giveaway-requirements}giveaway{${giveaway.giveawayID}}`),
                        new ButtonBuilder()
                            .setStyle(ButtonStyle.Primary)
                            .setLabel(`${client.language({ textId: `Реролл`, guildId: guild.id })}`)
                            .setCustomId(`cmd{giveaway-reroll}giveaway{${giveaway.giveawayID}}`)
                    ) 
            ] : [
                new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setStyle(ButtonStyle.Primary)
                            .setLabel(`${client.language({ textId: `Реролл`, guildId: guild.guildId })}`)
                            .setCustomId(`cmd{giveaway-reroll}giveaway{${giveaway.giveawayID}}`)
                    )
            ]
        })
    if (object.winners.length) {
        return giveawayMessage.reply({ 
            content: `🥳 ${object.winners.map(e => `<@${e.id}>`).join(", ")} [${client.language({ textId: "поздравляем", guildId: guild.id })}! ${object.winners.length === 1 ? client.language({ textId: "Ты стал победителем раздачи и выиграл", guildId: guild.id }) : client.language({ textId: "Вы стали победителями раздачи и выиграли", guildId: guild.id })}](<${giveawayMessage.url}>): ${object.rewards.join(", ")}`,
            allowedMentions: { users: object.winners.map(e => e.id) } 
        })    
    }
})