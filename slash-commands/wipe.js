const { ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, ActionRowBuilder, EmbedBuilder, Collection, UserSelectMenuBuilder } = require("discord.js")
const { RewardType } = require("../enums")
const UserRegexp = /usr{(.*?)}/
module.exports = {
    name: 'wipe',
    nameLocalizations: {
        'ru': `вайп`,
        'uk': `вайп`,
        'es-ES': `wipe`
    },
    description: 'Wipe users',
    descriptionLocalizations: {
        'ru': `Очистить пользователей с заданными параметрами`,
        'uk': `Очистити користувачів із заданими параметрами`,
        'es-ES': `Eliminar usuarios con parámetros específicos`
    },
    defaultMemberPermissions: "Administrator",
    dmPermission: false,
    group: `admins-group`,
    cooldowns: new Collection(),
    /**
     *
     * @param {Discord} client
     * @param {CommandInteraction} interaction
     * @param {String[]} args
     */
    run: async (client, interaction, args) => {
        if (interaction.isChatInputCommand()) await interaction.deferReply()
        else if (!interaction.isChatInputCommand() && interaction.user.id !== UserRegexp.exec(interaction.customId)?.[1]) return
        const settings = client.cache.settings.get(interaction.guildId)
        const embed = new EmbedBuilder().setColor(3093046)
        if (!client.wipe[interaction.guildId]) client.wipe[interaction.guildId] = {}
        if (interaction.customId?.includes("confirm")) {
            if (!client.wipe[interaction.guildId].values) return interaction.reply({ content: `${client.language({ textId: `Сначала выберите, что очистить`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
            let description = ``
            for (const value of client.wipe[interaction.guildId].values) {
                if (value === "stats.alltime") description += `\n${client.language({ textId: `Статистика за все время`, guildId: interaction.guildId, locale: interaction.locale })}`
                else if (value === "stats.yearly") description += `\n${client.language({ textId: `Статистика за год`, guildId: interaction.guildId, locale: interaction.locale })}`
                else if (value === "stats.monthly") description += `\n${client.language({ textId: `Статистика за месяц`, guildId: interaction.guildId, locale: interaction.locale })}`
                else if (value === "stats.weekly") description += `\n${client.language({ textId: `Статистика за неделю`, guildId: interaction.guildId, locale: interaction.locale })}`
                else if (value === "stats.daily") description += `\n${client.language({ textId: `Статистика за день`, guildId: interaction.guildId, locale: interaction.locale })}`
                else if (value === "totalxp") description += `\n${client.language({ textId: `Опыт и уровни`, guildId: interaction.guildId, locale: interaction.locale })}`
                else if (value === "seasonTotalXp") description += `\n${client.language({ textId: `Сезонный опыт и уровни`, guildId: interaction.guildId, locale: interaction.locale })}`
                else if (value === "currency") description += `\n${client.language({ textId: `Валюта`, guildId: interaction.guildId, locale: interaction.locale })}`
                else if (value === "rp") description += `\n${client.language({ textId: `Репутация`, guildId: interaction.guildId, locale: interaction.locale })}`
                else if (value === "boosts") description += `\n${client.language({ textId: `Бусты опыта, валюты, удачи и репутации`, guildId: interaction.guildId, locale: interaction.locale })}`
                else if (value === "users quests") description += `\n${client.language({ textId: `Взятые квесты`, guildId: interaction.guildId, locale: interaction.locale })}`
                else if (value === "users achievements") description += `\n${client.language({ textId: `Достижения пользователя`, guildId: interaction.guildId, locale: interaction.locale })}`
                else if (value === "roles") description += `\n${client.language({ textId: `Роли выданные за предметы`, guildId: interaction.guildId, locale: interaction.locale })}`
                else if (value === "inventory") description += `\n${client.language({ textId: `Инвентарь`, guildId: interaction.guildId, locale: interaction.locale })}`
                else if (value === "inventoryRoles") description += `\n${client.language({ textId: `Инвентарь ролей`, guildId: interaction.guildId, locale: interaction.locale })}`
                else if (value === "shop") description += `\n${client.language({ textId: `Магазин (для всех пользователей)`, guildId: interaction.guildId, locale: interaction.locale })}`
                else if (value === "trophies") description += `\n${client.language({ textId: `Трофеи`, guildId: interaction.guildId, locale: interaction.locale })}`
                else if (value === "jobsCooldowns") description += `\n${client.language({ textId: `Кулдауны работы`, guildId: interaction.guildId, locale: interaction.locale })}`
                else if (value === "dailyRewardsProgression") description += `\n${client.language({ textId: `Прогресс ежедневных наград`, guildId: interaction.guildId, locale: interaction.locale })}`
            }
            const array = []
            if (client.wipe[interaction.guildId]?.usersID?.length) {
                for (const userID of client.wipe[interaction.guildId].usersID) {
                    const member = await interaction.guild.members.fetch(userID).catch(e => null)
                    if (member) array.push(`> ${member.user.username} (${member.user.id})`)
                }
            }
            description += `\n${client.language({ textId: `У пользователей`, guildId: interaction.guildId, locale: interaction.locale })}: ${!array.length ? `${client.language({ textId: `ВСЕХ`, guildId: interaction.guildId, locale: interaction.locale })}` : `\n${array.join(`\n`)}`}`
            interaction.message.components.forEach(row => row.components.forEach(component => {
                component.data.disabled = true
            }))
            await interaction.update({ components: interaction.message.components })
            await interaction.followUp({ content: `${client.language({ textId: `Очистит`, guildId: interaction.guildId, locale: interaction.locale })}:${description}\n${client.language({ textId: `Отмена подтверждения через`, guildId: interaction.guildId, locale: interaction.locale })} ${client.functions.transformSecs(client, 20000, interaction.guildId, interaction.locale)}`, embeds: [], components: [
                new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId(`wipe confirm`)
                        .setLabel(`${client.language({ textId: `ОЧИСТИТЬ`, guildId: interaction.guildId, locale: interaction.locale })}`)
                        .setStyle(ButtonStyle.Success),
                    new ButtonBuilder()
                        .setCustomId(`wipe decline`)
                        .setLabel(`${client.language({ textId: `ОТМЕНА`, guildId: interaction.guildId, locale: interaction.locale })}`)
                        .setStyle(ButtonStyle.Danger))
                ],
                flags: ["Ephemeral"] 
            })
            const filter1 = (i) => (i.customId === `wipe confirm` || i.customId === `wipe decline`) && i.user.id === interaction.user.id
            const buttonInteraction = await interaction.channel.awaitMessageComponent({ filter1, time: 20000 }).catch(e => null)
            if (!buttonInteraction) return
            if (buttonInteraction && buttonInteraction.customId === "wipe decline") {
                interaction.message.components.forEach(row => row.components.forEach(component => {
                    if (component.data.custom_id === `cmd{wipe} confirm usr{${interaction.user.id}}` && client.wipe[interaction.guildId].values) component.data.disabled = false
                    else if (component.data.custom_id === `cmd{wipe} confirm usr{${interaction.user.id}}` && !client.wipe[interaction.guildId].values) component.data.disabled = true
                    else component.data.disabled = false
                }))
                await interaction.editReply({ components: interaction.message.components })
                return buttonInteraction.update({ content: `${client.config.emojis.YES} ${client.language({ textId: `Очистка отменена`, guildId: interaction.guildId, locale: interaction.locale })}`, components: [] }).catch(e => null)
            }
            await buttonInteraction.update({ content: `⏳ ${client.language({ textId: `Очищаю. Пожалуйста подождите`, guildId: interaction.guildId, locale: interaction.locale })}...`, embeds: [], components: [] })
            if (client.wipe[interaction.guildId].values.includes("shop")) {
                await Promise.all(client.cache.items.filter(e => e.guildID === interaction.guildId).map(async item => {
                    item.shop.amount = 0
                    await item.save()   
                }))
            }
            const search = (profile) => profile.guildID === interaction.guildId && (client.wipe[interaction.guildId].usersID?.length ? client.wipe[interaction.guildId].usersID.includes(profile.userID) : true)
            await Promise.all(client.cache.profiles.filter(search).map(async profile => {
                let filter = {}
                for (const value of client.wipe[interaction.guildId].values) {
                    if (value === "stats.alltime") {
                        filter["_messages"] = undefined
                        filter["_hours"] = undefined
                        filter["_likes"] = undefined
                        filter["_invites"] = undefined
                        filter["_bumps"] = undefined
                        filter["_doneQuests"] = undefined
                        filter["_giveawaysCreated"] = undefined
                        filter["_wormholeTouched"] = undefined
                        filter["_itemsSoldOnMarketPlace"] = undefined
                        filter["_fishing"] = undefined
                        filter["_currencySpent"] = undefined
                        filter["_itemsOpened"] = undefined
                        filter["_wormholesSpawned"] = undefined
                        filter["_itemsReceived"] = undefined
                        filter["_itemsCrafted"] = undefined
                        filter["_itemsUsed"] = undefined
                        filter["_itemsBoughtInShop"] = undefined
                        filter["_itemsBoughtOnMarket"] = undefined
                        filter["_itemsSold"] = undefined
                        filter["_mining"] = undefined
                        filter["_boosts"] = undefined
                    }
                    else if (value === "stats.yearly") {
                        if (!filter.stats) filter.stats = {}
                        filter.stats.yearly = undefined
                    }
                    else if (value === "stats.monthly") {
                        if (!filter.stats) filter.stats = {}
                        filter.stats.monthly = undefined
                    }
                    else if (value === "stats.weekly") {
                        if (!filter.stats) filter.stats = {}
                        filter.stats.weekly = undefined
                    }
                    else if (value === "stats.daily") {
                        if (!filter.stats) filter.stats = {}
                        filter.stats.daily = undefined
                    }
                    else if (value === "totalxp") {
                        filter["level"] = 1
                        filter["_totalxp"] = undefined
                        filter["_xp"] = undefined
                    }
                    else if (value === "seasonTotalXp") {
                        filter["seasonLevel"] = 1
                        filter["_seasonTotalXp"] = undefined
                        filter["_seasonXp"] = undefined
                    }
                    else if (value === "currency") {
                        filter["_currency"] = undefined
                        filter["_currencySpent"] = undefined
                    }
                    else if (value === "rp") {
                        filter["_rp"] = undefined
                    }
                    else if (value === "boosts") {
                        filter["_multiplyXP"] = undefined
                        filter["multiplyXPTime"] = undefined
                        filter["_multiplyCUR"] = undefined
                        filter["multiplyCURTime"] = undefined
                        filter["_multiplyLuck"] = undefined
                        filter["multiplyLuckTime"] = undefined
                        filter["_multiplyRP"] = undefined
                        filter["multiplyRPTime"] = undefined
                    }
                    else if (value === "invites") {
                        filter["inviterInfo"] = undefined
                    }
                    else if (value === "trophies") {
                        filter["trophies"] = undefined
                    }
                    else if (value === "roles" || value === "users achievements" || value === "users quests" || value === "inventory" || value === "inventoryRoles") {
                        if (value === "roles") {
                            filter["roles"] = undefined
                        }
                        if (value === "users achievements") {
                            filter["achievements"] = undefined
                        }
                        if (value === "users quests") {
                            filter["quests"] = undefined
                        }
                        if (value === "inventory") {
                            filter["inventory"] = []
                        }
                        if (value === "inventoryRoles") {
                            filter["inventoryRoles"] = undefined
                        }
                    }
                    else if (value === "jobsCooldowns") {
                        filter["jobsCooldowns"] = undefined
                        filter["allJobsCooldown"] = undefined
                    }
                    else if (value === "dailyRewardsProgression") {
                        filter["daysStreak"] = 1
                        filter["lastDaily"] = undefined
                    }
                }
                Object.assign(profile, (filter.stats && profile.stats && Object.values(filter.stats).length >= Object.values(profile.stats).filter(e => e !== undefined).length && !Object.values(filter.stats).filter(e => e !== undefined).length) || !profile.stats ? { ...filter, stats: undefined } : { ...filter, stats: { ...profile.stats, ...filter.stats }})
                await profile.save()
            }))
            delete client.wipe[interaction.guildId]
            return buttonInteraction.editReply({ content: `${client.config.emojis.YES} ${client.language({ textId: `Очистка завершена. Очищено:`, guildId: interaction.guildId, locale: interaction.locale })}${description}` })
        }
        if (interaction.customId?.includes("filter")) {
            interaction.message.components.forEach(row => row.components.forEach(component => {
                component.data.disabled = true
            }))
            await interaction.update({ components: interaction.message.components })
            await interaction.followUp({ 
                content: `${client.language({ textId: `Выбери пользователей для фильтра`, guildId: interaction.guildId, locale: interaction.locale })}`,
                components: [
                    new ActionRowBuilder().addComponents(
                        new UserSelectMenuBuilder()
                            .setCustomId(`usersWipeFilter`)
                            .setPlaceholder(`${client.language({ textId: `Выбери пользователей`, guildId: interaction.guildId, locale: interaction.locale })}...`)
                            .setMaxValues(25)),
                    new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setCustomId("usersWipeFilterCancel")
                            .setEmoji(client.config.emojis.NO)
                            .setLabel(client.language({ textId: `Отмена`, guildId: interaction.guildId, locale: interaction.locale }))
                            .setStyle(ButtonStyle.Danger)
                    )
                ],
                flags: ["Ephemeral"]
            })    
            const filter = (i) => i.customId.includes(`usersWipeFilter`) && i.user.id === interaction.user.id
            const userSelectMenuInteraction = await interaction.channel.awaitMessageComponent({ filter, time: 30000 }).catch(e => null)
            if (userSelectMenuInteraction && userSelectMenuInteraction.customId.includes("usersWipeFilter")) {
                await userSelectMenuInteraction.deferUpdate()
                if (userSelectMenuInteraction.customId === "usersWipeFilter") {
                    client.wipe[interaction.guildId].usersID = userSelectMenuInteraction.users.map(e => e.id)
                    userSelectMenuInteraction.editReply({ 
                        content: `${client.config.emojis.YES} ${client.language({ textId: `Фильтр изменён`, guildId: interaction.guildId, locale: interaction.locale })}`, 
                        components: [] 
                    })   
                } else userSelectMenuInteraction.editReply({ content: `${client.config.emojis.YES} ${client.language({ textId: `Выбор отменён`, guildId: interaction.guildId, locale: interaction.locale })}`, components: [] })
            }
        }
        if (interaction.customId?.includes("select")) {
            client.wipe[interaction.guildId].values = interaction.values
        }
        if (interaction.customId?.includes("wipeDB")) {
            let description = ``
            for (const value of interaction.values) {
                if (value === "items") description += `\n${client.language({ textId: `Предметы`, guildId: interaction.guildId, locale: interaction.locale })}`
                else if (value === "achievements") description += `\n${client.language({ textId: `Достижения`, guildId: interaction.guildId, locale: interaction.locale })}`
                else if (value === "quests") description += `\n${client.language({ textId: `Квесты`, guildId: interaction.guildId, locale: interaction.locale })}`
                else if (value === "wormholes") description += `\n${client.language({ textId: `Червоточины`, guildId: interaction.guildId, locale: interaction.locale })}`
                else if (value === "gifts") description += `\n${client.language({ textId: `Подарки`, guildId: interaction.guildId, locale: interaction.locale })}`
                else if (value === "styles") description += `\n${client.language({ textId: `Стили`, guildId: interaction.guildId, locale: interaction.locale })}`
                else if (value === "categories") description += `\n${client.language({ textId: `Категории`, guildId: interaction.guildId, locale: interaction.locale })}`
                else if (value === "bonusChannels") description += `\n${client.language({ textId: `Бонусные каналы`, guildId: interaction.guildId, locale: interaction.locale })}`
                else if (value === "giveaways") description += `\n${client.language({ textId: `Раздачи`, guildId: interaction.guildId, locale: interaction.locale })}`
                else if (value === "market") description += `\n${client.language({ textId: `Лоты на маркете`, guildId: interaction.guildId, locale: interaction.locale })}`
                else if (value === "roles") description += `\n${client.language({ textId: `Доходные роли`, guildId: interaction.guildId, locale: interaction.locale })}`
                else if (value === "permissions") description += `\n${client.language({ textId: `Права`, guildId: interaction.guildId, locale: interaction.locale })}`
                else if (value === "jobs") description += `\n${client.language({ textId: `Работа`, guildId: interaction.guildId, locale: interaction.locale })}`
                else if (value === "promocodes") description += `\n${client.language({ textId: `Промокоды`, guildId: interaction.guildId, locale: interaction.locale })}`
                else if (value === "autogenerators") description += `\n${client.language({ textId: `Автогенераторы промокодов`, guildId: interaction.guildId, locale: interaction.locale })}`
                else if (value === "gift-uses") description += `\n${client.language({ textId: `Использования подарков`, guildId: interaction.guildId, locale: interaction.locale })}`
                else if (value === "auctions") description += `\n${client.language({ textId: `Аукционы`, guildId: interaction.guildId, locale: interaction.locale })}`
            }
            interaction.message.components.forEach(row => row.components.forEach(component => {
                component.data.disabled = true
            }))
            await interaction.update({ components: interaction.message.components })
            await interaction.followUp({ content: `${client.language({ textId: `Удалит`, guildId: interaction.guildId, locale: interaction.locale })}:${description}\n${client.language({ textId: `Отмена подтверждения через`, guildId: interaction.guildId, locale: interaction.locale })} ${client.functions.transformSecs(client, 20000, interaction.guildId, interaction.locale)}`, embeds: [], components: [
                new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId(`wipe confirm`)
                        .setLabel(`${client.language({ textId: `ОЧИСТИТЬ`, guildId: interaction.guildId, locale: interaction.locale })}`)
                        .setStyle(ButtonStyle.Success),
                    new ButtonBuilder()
                        .setCustomId(`wipe decline`)
                        .setLabel(`${client.language({ textId: `ОТМЕНА`, guildId: interaction.guildId, locale: interaction.locale })}`)
                        .setStyle(ButtonStyle.Danger))
                ], flags: ["Ephemeral"] })
            const filter = (i) => (i.customId === `wipe confirm` || i.customId === `wipe decline`) && i.user.id === interaction.user.id
            const buttonInteraction = await interaction.channel.awaitMessageComponent({ filter, time: 20000 }).catch(e => null)
            if (!buttonInteraction) return
            if (buttonInteraction && buttonInteraction.customId === "wipe decline") {
                interaction.message.components.forEach(row => row.components.forEach(component => {
                    if (component.data.custom_id === `cmd{wipe} confirm usr{${interaction.user.id}}` && client.wipe[interaction.guildId].values) component.data.disabled = false
                    else if (component.data.custom_id === `cmd{wipe} confirm usr{${interaction.user.id}}` && !client.wipe[interaction.guildId].values) component.data.disabled = true
                    else component.data.disabled = false
                }))
                await interaction.editReply({ components: interaction.message.components })
                return buttonInteraction.update({ content: `${client.config.emojis.YES} ${client.language({ textId: `Очистка отменена`, guildId: interaction.guildId, locale: interaction.locale })}`, components: [] }).catch(e => null)
            }
            await buttonInteraction.update({ content: `⏳ ${client.language({ textId: `Очищаю. Пожалуйста подождите`, guildId: interaction.guildId, locale: interaction.locale })}...`, embeds: [], components: [] })
            for (const value of interaction.values) {
                if (value === "achievements") {
                    const achievements = client.cache.achievements.filter(e => e.guildID === interaction.guildId)
                    await Promise.all(achievements.map(async achievement => {
                        await achievement.delete()
                    }))
                } else
                if (value === "auctions") {
                    await Promise.all(client.cache.auctions.filter(e => e.guildID === interaction.guildId).map(async auction => await auction.delete(true, true)))
                } else
                if (value === "quests") {
                    const quests = client.cache.quests.filter(e => e.guildID === interaction.guildId)
                    await Promise.all(quests.map(async quest => {
                        await quest.delete()
                    })) 
                    await Promise.all(client.cache.profiles.filter(e => e.guildID === interaction.guildId && e.quests?.length).map(async profile => {
                        profile.quests = undefined
                        await profile.save()
                    }))
                } else
                if (value === "wormholes") {
                    await Promise.all(client.cache.items.filter(e => e.guildID === interaction.guildId && e.onUse.spawnWormhole).map(async item => {
                        item.onUse.spawnWormhole = undefined
                        await item.save()
                    }))
                    await Promise.all(client.cache.wormholes.filter(e => e.guildID === interaction.guildId).map(async wormhole => await wormhole.delete()))
                } else
                if (value === "gifts") {
                    await client.giftSchema.deleteMany({ guildID: interaction.guildId })
                } else
                if (value === "styles") {
                    await client.styleSchema.deleteMany({ guildID: interaction.guildId })
                    await Promise.all(client.cache.wormholes.filter(e => e.guildID === interaction.guildId && e.styleID).map(async wormhole => {
                        wormhole.styleID = null
                        await wormhole.save()
                    }))
                } else
                if (value === "categories") {
                    await client.shopCategorySchema.deleteMany({ guildID: interaction.guildId })
                } else
                if (value === "bonusChannels") {
                    await Promise.all(client.cache.channels.filter(e => e.guildID === interaction.guildId).map(async channel => await channel.delete()))
                } else
                if (value === "giveaways") {
                    const giveaways = client.cache.giveaways.filter(e => e.guildID === interaction.guildId)
                    await Promise.all(giveaways.map(async giveaway => {
                        if (giveaway.type === `user`) {
                            const profile = client.cache.profiles.get(interaction.guildId+giveaway.creator)
                            if (profile) {
                                for (const element of giveaway.rewards) {
                                    if (element.type === RewardType.Currency) {
                                        profile.currency = element.amount
                                    }
                                    else if (element.type === RewardType.Item) {
                                        const item = client.cache.items.find(i => i.itemID === element.id && !i.temp)
                                        if (item) await profile.addItem(element.id, element.amount)
                                    } else if (element.type === RewardType.Role) {
                                        const role = interaction.guild.roles.cache.get(element.id)
                                        if (role) profile.addRole(element.id, element.amount, element.ms)
                                    }
                                }
                                await profile.save()    
                            }
                        }
                        await giveaway.delete()    
                    }))
                } else
                if (value === "market") {
                    await Promise.all(client.cache.lots.filter(e => e.guildID === interaction.guildId).map(async lot => {
                        await lot.return()
                    }))
                } else
                if (value === "items") {
                    await Promise.all(client.cache.items.filter(e => e.guildID === interaction.guildId).map(async item => {
                        await item.delete()
                    }))
                } else
                if (value === "roles") {
                    await Promise.all(client.cache.roles.filter(e => e.guildID === interaction.guildId).map(async role => await role.delete()))
                } else
                if (value === "permissions") {
                    await Promise.all(client.cache.permissions.filter(e => e.guildID === interaction.guildId).map(async permission => await permission.delete()))
                } else
                if (value === "jobs") {
                    await Promise.all(client.cache.jobs.filter(e => e.guildID === interaction.guildId).map(async job => await job.delete()))
                } else
                if (value === "promocodes") {
                    await Promise.all(client.cache.promocodes.filter(e => e.guildID === interaction.guildId).map(async promocode => await promocode.delete()))
                } else
                if (value === "autogenerators") {
                    await Promise.all(client.cache.promocodeAutogenerators.filter(e => e.guildID === interaction.guildId).map(async autogenerator => await autogenerator.delete()))
                } else
                if (value === "gift-uses") {
                    await client.giftSchema.updateMany({ guildID: interaction.guildId }, { $set: { members: [] } })
                }
            }
            buttonInteraction.editReply({ content: `${client.config.emojis.YES} ${client.language({ textId: `Очистка завершена. Удалено:`, guildId: interaction.guildId, locale: interaction.locale })}\n${description}` })
            interaction.message.components.forEach(row => row.components.forEach(component => {
                if (component.data.custom_id === `cmd{wipe} confirm usr{${interaction.user.id}}` && client.wipe[interaction.guildId].values) component.data.disabled = false
                else if (component.data.custom_id === `cmd{wipe} confirm usr{${interaction.user.id}}` && !client.wipe[interaction.guildId].values) component.data.disabled = true
                else component.data.disabled = false
            }))
            return interaction.editReply({ components: interaction.message.components })
        }
        if (interaction.customId?.includes("delete values")) {
            client.wipe[interaction.guildId] = {}
        }
        let description = `${client.language({ textId: `Очистит`, guildId: interaction.guildId, locale: interaction.locale })}:`
        if (interaction.values?.length) {
            for (const value of interaction.values) {
                if (value === "stats.alltime") description += `\n${client.language({ textId: `Статистика за все время`, guildId: interaction.guildId, locale: interaction.locale })}`
                else if (value === "stats.yearly") description += `\n${client.language({ textId: `Статистика за год`, guildId: interaction.guildId, locale: interaction.locale })}`
                else if (value === "stats.monthly") description += `\n${client.language({ textId: `Статистика за месяц`, guildId: interaction.guildId, locale: interaction.locale })}`
                else if (value === "stats.weekly") description += `\n${client.language({ textId: `Статистика за неделю`, guildId: interaction.guildId, locale: interaction.locale })}`
                else if (value === "stats.daily") description += `\n${client.language({ textId: `Статистика за день`, guildId: interaction.guildId, locale: interaction.locale })}`
                else if (value === "totalxp") description += `\n${client.language({ textId: `Опыт и уровни`, guildId: interaction.guildId, locale: interaction.locale })}`
                else if (value === "seasonTotalXp") description += `\n${client.language({ textId: `Сезонный опыт и уровни`, guildId: interaction.guildId, locale: interaction.locale })}`
                else if (value === "currency") description += `\n${client.language({ textId: `Валюта`, guildId: interaction.guildId, locale: interaction.locale })}`
                else if (value === "rp") description += `\n${client.language({ textId: `Репутация`, guildId: interaction.guildId, locale: interaction.locale })}`
                else if (value === "invites") description += `\n${client.language({ textId: `Приглашения`, guildId: interaction.guildId, locale: interaction.locale })}`
                else if (value === "boosts") description += `\n${client.language({ textId: `Бусты опыта, валюты, удачи и репутации`, guildId: interaction.guildId, locale: interaction.locale })}`
                else if (value === "users quests") description += `\n${client.language({ textId: `Взятые квесты`, guildId: interaction.guildId, locale: interaction.locale })}`
                else if (value === "users achievements") description += `\n${client.language({ textId: `Достижения`, guildId: interaction.guildId, locale: interaction.locale })}`
                else if (value === "roles") description += `\n${client.language({ textId: `Роли выданные за предметы`, guildId: interaction.guildId, locale: interaction.locale })}`
                else if (value === "inventory") description += `\n${client.language({ textId: `Инвентарь`, guildId: interaction.guildId, locale: interaction.locale })}`
                else if (value === "inventoryRoles") description += `\n${client.language({ textId: `Инвентарь ролей`, guildId: interaction.guildId, locale: interaction.locale })}`
                else if (value === "shop") description += `\n${client.language({ textId: `Магазин (для всех пользователей)`, guildId: interaction.guildId, locale: interaction.locale })}`
                else if (value === "items") description += `\n${client.language({ textId: `Известность всех предметов (для всех пользователей)`, guildId: interaction.guildId, locale: interaction.locale })}`
                else if (value === "trophies") description += `\n${client.language({ textId: `Трофеи`, guildId: interaction.guildId, locale: interaction.locale })}`
                else if (value === "jobsCooldowns") description += `\n${client.language({ textId: `Кулдауны работы`, guildId: interaction.guildId, locale: interaction.locale })}`
                else if (value === "dailyRewardsProgression") description += `\n${client.language({ textId: `Прогресс ежедневных наград`, guildId: interaction.guildId, locale: interaction.locale })}`
            }    
        } else if (client.wipe[interaction.guildId]?.values?.length) {
            for (const value of client.wipe[interaction.guildId].values) {
                if (value === "stats.alltime") description += `\n${client.language({ textId: `Статистика за все время`, guildId: interaction.guildId, locale: interaction.locale })}`
                else if (value === "stats.yearly") description += `\n${client.language({ textId: `Статистика за год`, guildId: interaction.guildId, locale: interaction.locale })}`
                else if (value === "stats.monthly") description += `\n${client.language({ textId: `Статистика за месяц`, guildId: interaction.guildId, locale: interaction.locale })}`
                else if (value === "stats.weekly") description += `\n${client.language({ textId: `Статистика за неделю`, guildId: interaction.guildId, locale: interaction.locale })}`
                else if (value === "stats.daily") description += `\n${client.language({ textId: `Статистика за день`, guildId: interaction.guildId, locale: interaction.locale })}`
                else if (value === "totalxp") description += `\n${client.language({ textId: `Опыт и уровни`, guildId: interaction.guildId, locale: interaction.locale })}`
                else if (value === "seasonTotalXp") description += `\n${client.language({ textId: `Сезонный опыт и уровни`, guildId: interaction.guildId, locale: interaction.locale })}`
                else if (value === "currency") description += `\n${client.language({ textId: `Валюта`, guildId: interaction.guildId, locale: interaction.locale })}`
                else if (value === "rp") description += `\n${client.language({ textId: `Репутация`, guildId: interaction.guildId, locale: interaction.locale })}`
                else if (value === "invites") description += `\n${client.language({ textId: `Приглашения`, guildId: interaction.guildId, locale: interaction.locale })}`
                else if (value === "boosts") description += `\n${client.language({ textId: `Бусты опыта, валюты, удачи и репутации`, guildId: interaction.guildId, locale: interaction.locale })}`
                else if (value === "users quests") description += `\n${client.language({ textId: `Взятые квесты`, guildId: interaction.guildId, locale: interaction.locale })}`
                else if (value === "users achievements") description += `\n${client.language({ textId: `Достижения`, guildId: interaction.guildId, locale: interaction.locale })}`
                else if (value === "roles") description += `\n${client.language({ textId: `Роли выданные за предметы`, guildId: interaction.guildId, locale: interaction.locale })}`
                else if (value === "inventory") description += `\n${client.language({ textId: `Инвентарь`, guildId: interaction.guildId, locale: interaction.locale })}`
                else if (value === "inventoryRoles") description += `\n${client.language({ textId: `Инвентарь ролей`, guildId: interaction.guildId, locale: interaction.locale })}`
                else if (value === "shop") description += `\n${client.language({ textId: `Магазин (для всех пользователей)`, guildId: interaction.guildId, locale: interaction.locale })}`
                else if (value === "items") description += `\n${client.language({ textId: `Известность всех предметов (для всех пользователей)`, guildId: interaction.guildId, locale: interaction.locale })}`
                else if (value === "trophies") description += `\n${client.language({ textId: `Трофеи`, guildId: interaction.guildId, locale: interaction.locale })}`
                else if (value === "jobsCooldowns") description += `\n${client.language({ textId: `Кулдауны работы`, guildId: interaction.guildId, locale: interaction.locale })}`
                else if (value === "dailyRewardsProgression") description += `\n${client.language({ textId: `Прогресс ежедневных наград`, guildId: interaction.guildId, locale: interaction.locale })}`
            } 
        }
        const array = []
        if (client.wipe[interaction.guildId]?.usersID?.length) {
            for (const userID of client.wipe[interaction.guildId].usersID) {
                const member = interaction.guild.members.cache.get(userID)
                if (member) array.push(`> ${member.user.username} (${member.user.id})`)
            }
        }
        description += `\n${client.language({ textId: `У пользователей`, guildId: interaction.guildId, locale: interaction.locale })}: ${!array.length ? `${client.language({ textId: `ВСЕХ`, guildId: interaction.guildId, locale: interaction.locale })}` : `\n${array.join(`\n`)}`}`
        embed.setDescription(description)
        embed.setTitle(`${client.language({ textId: `ОЧИСТКА СЕРВЕРА`, guildId: interaction.guildId, locale: interaction.locale })} ${interaction.guild?.name || ""}`)
        const userFilterBTN = new ButtonBuilder()
            .setStyle(ButtonStyle.Primary)
            .setLabel(`${client.language({ textId: `Фильтр пользователей`, guildId: interaction.guildId, locale: interaction.locale })}`)
            .setCustomId(`cmd{wipe} filter usr{${interaction.user.id}}`)
        const wipeBTN = new ButtonBuilder()
            .setStyle(ButtonStyle.Success)
            .setLabel(`${client.language({ textId: `Очистить`, guildId: interaction.guildId, locale: interaction.locale })}`)
            .setEmoji(client.config.emojis.YES)
            .setCustomId(`cmd{wipe} confirm usr{${interaction.user.id}}`)
        const removeValuesBTN = new ButtonBuilder()
            .setStyle(ButtonStyle.Danger)
            .setLabel(`${client.language({ textId: `Удалить значения`, guildId: interaction.guildId, locale: interaction.locale })}`)
            .setEmoji(client.config.emojis.NO)
            .setCustomId(`cmd{wipe}usr{${interaction.user.id}} delete values`)
        if (array.length >= 25) userFilterBTN.setDisabled(true)
        if (!client.wipe[interaction.guildId]?.values?.length) {
            wipeBTN.setDisabled(true)
            removeValuesBTN.setDisabled(true)
        }
        const second_row = new ActionRowBuilder().addComponents([wipeBTN, removeValuesBTN, userFilterBTN])
        const menu_options = [
            { emoji: `📊`, label: `${client.language({ textId: `Статистка за все время`, guildId: interaction.guildId, locale: interaction.locale })}`, value: `stats.alltime`, description: `${client.language({ textId: `Очистит статистику за все время`, guildId: interaction.guildId, locale: interaction.locale })}` },
            { emoji: `📊`, label: `${client.language({ textId: `Статистка за год`, guildId: interaction.guildId, locale: interaction.locale })}`, value: `stats.yearly`, description: `${client.language({ textId: `Очистит статистику за год`, guildId: interaction.guildId, locale: interaction.locale })}` },
            { emoji: `📊`, label: `${client.language({ textId: `Статистка за месяц`, guildId: interaction.guildId, locale: interaction.locale })}`, value: `stats.monthly`, description: `${client.language({ textId: `Очистит статистику за месяц`, guildId: interaction.guildId, locale: interaction.locale })}` },
            { emoji: `📊`, label: `${client.language({ textId: `Статистка за неделю`, guildId: interaction.guildId, locale: interaction.locale })}`, value: `stats.weekly`, description: `${client.language({ textId: `Очистит статистику за неделю`, guildId: interaction.guildId, locale: interaction.locale })}` },
            { emoji: `📊`, label: `${client.language({ textId: `Статистка за день`, guildId: interaction.guildId, locale: interaction.locale })}`, value: `stats.daily`, description: `${client.language({ textId: `Очистит статистику за день`, guildId: interaction.guildId, locale: interaction.locale })}` },
            { emoji: client.config.emojis.XP, label: `${client.language({ textId: `Опыт и уровни`, guildId: interaction.guildId, locale: interaction.locale })}`, value: `totalxp`, description: `${client.language({ textId: `Очистит опыт и уровни у пользователей`, guildId: interaction.guildId, locale: interaction.locale })}` },
            { emoji: client.config.emojis.seasonXP, label: `${client.language({ textId: `Сезонный опыт и уровни`, guildId: interaction.guildId, locale: interaction.locale })}`, value: `seasonTotalXp`, description: `${client.language({ textId: `Очистит сезонный опыт и уровни у пользователей`, guildId: interaction.guildId, locale: interaction.locale })}` },
            { emoji: settings.displayCurrencyEmoji, label: `${client.language({ textId: `Валюта`, guildId: interaction.guildId, locale: interaction.locale })}`, value: `currency`, description: `${client.language({ textId: `Очистит валюту у пользователей`, guildId: interaction.guildId, locale: interaction.locale })}` },
            { emoji: client.config.emojis.RP, label: `${client.language({ textId: `Репутация`, guildId: interaction.guildId, locale: interaction.locale })}`, value: `rp`, description: `${client.language({ textId: `Очистит репутацию у пользователей`, guildId: interaction.guildId, locale: interaction.locale })}` },
            { emoji: client.config.emojis.invite, label: `${client.language({ textId: `Приглашения`, guildId: interaction.guildId, locale: interaction.locale })}`, value: `invites`, description: `${client.language({ textId: `Очистит все приглашения пользователей`, guildId: interaction.guildId, locale: interaction.locale })}` },
            { emoji: client.config.emojis.quests, label: `${client.language({ textId: `Квесты пользователей`, guildId: interaction.guildId, locale: interaction.locale })}`, value: `users quests`, description: `${client.language({ textId: `Очистит все квесты пользователей`, guildId: interaction.guildId, locale: interaction.locale })}` },
            { emoji: client.config.emojis.XP100Booster, label: `${client.language({ textId: `Бонусы к опыту, валюте и удаче`, guildId: interaction.guildId, locale: interaction.locale })}`, value: `boosts`, description: `${client.language({ textId: `Очистит все бонусы к опыту, валюте, удаче и репутации`, guildId: interaction.guildId, locale: interaction.locale })}` },
            { emoji: client.config.emojis.roles, label: `${client.language({ textId: `Роли`, guildId: interaction.guildId, locale: interaction.locale })}`, value: `roles`, description: `${client.language({ textId: `Очистит все роли полученные с помощью предметов`, guildId: interaction.guildId, locale: interaction.locale })}` },
            { emoji: client.config.emojis.achievements, label: `${client.language({ textId: `Достижения пользователей`, guildId: interaction.guildId, locale: interaction.locale })}`, value: `users achievements`, description: `${client.language({ textId: `Очистит все достижения пользователей и роли достижений`, guildId: interaction.guildId, locale: interaction.locale })}` },
            { emoji: `${client.config.emojis.inventory}`, label: `${client.language({ textId: `Инвентарь`, guildId: interaction.guildId, locale: interaction.locale })}`, value: `inventory`, description: `${client.language({ textId: `Очистит весь инвентарь`, guildId: interaction.guildId, locale: interaction.locale })}` },
            { emoji: `${client.config.emojis.roles}`, label: `${client.language({ textId: `Инвентарь ролей`, guildId: interaction.guildId, locale: interaction.locale })}`, value: `inventoryRoles`, description: `${client.language({ textId: `Очистит весь инвентарь ролей`, guildId: interaction.guildId, locale: interaction.locale })}` },
            { emoji: client.config.emojis.shop, label: `${client.language({ textId: `Магазин`, guildId: interaction.guildId, locale: interaction.locale })}`, value: `shop`, description: `${client.language({ textId: `Магазин станет пустым`, guildId: interaction.guildId, locale: interaction.locale })}` },
            { emoji: client.config.emojis.trophies, label: `${client.language({ textId: `Трофеи`, guildId: interaction.guildId, locale: interaction.locale })}`, value: `trophies`, description: `${client.language({ textId: `Очистит все трофеи у пользователей`, guildId: interaction.guildId, locale: interaction.locale })}` },
            { emoji: client.config.emojis.watch, label: `${client.language({ textId: `Кулдауны работы`, guildId: interaction.guildId, locale: interaction.locale })}`, value: `jobsCooldowns`, description: `${client.language({ textId: `Очистит все кулдауны работы`, guildId: interaction.guildId, locale: interaction.locale })}` },
            { emoji: client.config.emojis.giveaway, label: `${client.language({ textId: `Прогресс ежедневных наград`, guildId: interaction.guildId, locale: interaction.locale })}`, value: `dailyRewardsProgression`, description: `${client.language({ textId: `Очистит прогресс ежедневных наград`, guildId: interaction.guildId, locale: interaction.locale })}` },
        ]
        const menu_options2 = [
            { emoji: client.config.emojis.style, label: `${client.language({ textId: `Стили`, guildId: interaction.guildId, locale: interaction.locale })}`, value: `styles`, description: `${client.language({ textId: `Удалит все стили`, guildId: interaction.guildId, locale: interaction.locale })}` },
            { emoji: client.config.emojis.wormhole, label: `${client.language({ textId: `Червоточины`, guildId: interaction.guildId, locale: interaction.locale })}`, value: `wormholes`, description: `${client.language({ textId: `Удалит все червоточины`, guildId: interaction.guildId, locale: interaction.locale })}` },
            { emoji: client.config.emojis.achievements, label: `${client.language({ textId: `Достижения`, guildId: interaction.guildId, locale: interaction.locale })}`, value: `achievements`, description: `${client.language({ textId: `Удалит все достижения`, guildId: interaction.guildId, locale: interaction.locale })}` },
            { emoji: client.config.emojis.quests, label: `${client.language({ textId: `Квесты`, guildId: interaction.guildId, locale: interaction.locale })}`, value: `quests`, description: `${client.language({ textId: `Удалит все квесты`, guildId: interaction.guildId, locale: interaction.locale })}` },
            { emoji: client.config.emojis.shop, label: `${client.language({ textId: `Категории магазина`, guildId: interaction.guildId, locale: interaction.locale })}`, value: `categories`, description: `${client.language({ textId: `Удалит все категории магазина`, guildId: interaction.guildId, locale: interaction.locale })}` },
            { emoji: client.config.emojis.balloon, label: `${client.language({ textId: `Бонусные каналы`, guildId: interaction.guildId, locale: interaction.locale })}`, value: `bonusChannels`, description: `${client.language({ textId: `Удалит все бонусные каналы`, guildId: interaction.guildId, locale: interaction.locale })}` },
            { emoji: client.config.emojis.giveaway, label: `${client.language({ textId: `Раздачи`, guildId: interaction.guildId, locale: interaction.locale })}`, value: `giveaways`, description: `${client.language({ textId: `Удалит все раздачи`, guildId: interaction.guildId, locale: interaction.locale })}` },
            { emoji: client.config.emojis.dol, label: `${client.language({ textId: `Лоты на маркете`, guildId: interaction.guildId, locale: interaction.locale })}`, value: `market`, description: `${client.language({ textId: `Удалит все лоты на маркете`, guildId: interaction.guildId, locale: interaction.locale })}` },
            { emoji: client.config.emojis.box, label: `${client.language({ textId: `Предметы`, guildId: interaction.guildId, locale: interaction.locale })}`, value: `items`, description: `${client.language({ textId: `Удалит все предметы`, guildId: interaction.guildId, locale: interaction.locale })}` },
            { emoji: client.config.emojis.giveaway, label: `${client.language({ textId: `Подарки`, guildId: interaction.guildId, locale: interaction.locale })}`, value: `gifts`, description: `${client.language({ textId: `Удалит все подарки`, guildId: interaction.guildId, locale: interaction.locale })}` },
            { emoji: client.config.emojis.roles, label: `${client.language({ textId: `Доходные роли`, guildId: interaction.guildId, locale: interaction.locale })}`, value: `roles`, description: `${client.language({ textId: `Удалит все доходные роли`, guildId: interaction.guildId, locale: interaction.locale })}` },
            { emoji: client.config.emojis.crown, label: `${client.language({ textId: `Права`, guildId: interaction.guildId, locale: interaction.locale })}`, value: `permissions`, description: `${client.language({ textId: `Удалит все права`, guildId: interaction.guildId, locale: interaction.locale })}` },
            { emoji: client.config.emojis.job, label: `${client.language({ textId: `Jobs`, guildId: interaction.guildId, locale: interaction.locale })}`, value: `jobs`, description: `${client.language({ textId: `Удалит всю работу`, guildId: interaction.guildId, locale: interaction.locale })}` },
            { emoji: client.config.emojis.ticket, label: `${client.language({ textId: `Промокоды`, guildId: interaction.guildId, locale: interaction.locale })}`, value: `promocodes`, description: `${client.language({ textId: `Удалит все промокоды`, guildId: interaction.guildId, locale: interaction.locale })}` },
            { emoji: client.config.emojis.generate, label: `${client.language({ textId: `Автогенераторы промокодов`, guildId: interaction.guildId, locale: interaction.locale })}`, value: `autogenerators`, description: `${client.language({ textId: `Удалит все автогенераторы промокодов`, guildId: interaction.guildId, locale: interaction.locale })}` },
            { emoji: client.config.emojis.giveaway, label: `${client.language({ textId: `Использования подарков`, guildId: interaction.guildId, locale: interaction.locale })}`, value: `gift-uses`, description: `${client.language({ textId: `Удалит все использования подарков`, guildId: interaction.guildId, locale: interaction.locale })}` },
            { emoji: client.config.emojis.auction, label: `${client.language({ textId: `Аукционы`, guildId: interaction.guildId, locale: interaction.locale })}`, value: `auctions`, description: `${client.language({ textId: `Удалит все аукционы`, guildId: interaction.guildId, locale: interaction.locale })}` },
        ]
        const options1_row = new ActionRowBuilder()
            .addComponents([
                new StringSelectMenuBuilder()
                    .setCustomId(`cmd{wipe} select usr{${interaction.user.id}}1`)
                    .addOptions(menu_options).setMaxValues(menu_options.length)
                    .setPlaceholder(`${client.language({ textId: `Выбери до`, guildId: interaction.guildId, locale: interaction.locale })} ${menu_options.length} ${client.language({ textId: `значений`, guildId: interaction.guildId, locale: interaction.locale })}`)
            ])
        const options2_row = new ActionRowBuilder()
            .addComponents([
                new StringSelectMenuBuilder()
                    .setCustomId(`cmd{wipe}usr{${interaction.user.id}} wipeDB`)
                    .addOptions(menu_options2)
                    .setMaxValues(menu_options2.length)
                    .setPlaceholder(`${client.language({ textId: `Выбери до`, guildId: interaction.guildId, locale: interaction.locale })} ${menu_options2.length} ${client.language({ textId: `значений`, guildId: interaction.guildId, locale: interaction.locale })}`)
            ])
        const components = [options1_row, options2_row, second_row]
        if (interaction.replied || interaction.deferred) return interaction.editReply({ embeds: [embed], components: components }).catch(e => {
            if (e.message.includes(`Invalid emoji`)) {
                const array = e.message.split(`\n`)
                for (const message of array.splice(1, array.length-1)) {
                    const expression = message.replace(/data./, "").slice(0, message.indexOf(".emoji"))
                    eval(expression).data.emoji.id = `957227390759739453`  
                }
                interaction.editReply({ embeds: [embed], components: components })
            } else client.functions.sendError(e)
        })
        else return interaction.update({ embeds: [embed], components: components }).catch(e => {
            if (e.message.includes(`Invalid emoji`)) {
                const array = e.message.split(`\n`)
                for (const message of array.splice(1, array.length-1)) {
                    const expression = message.replace(/data./, "").slice(0, message.indexOf(".emoji"))
                    eval(expression).data.emoji.id = `957227390759739453`  
                }
                interaction.update({ embeds: [embed], components: components })
            } else client.functions.sendError(e)
        })
    }
}