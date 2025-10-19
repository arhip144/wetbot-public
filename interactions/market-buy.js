const { ModalBuilder, TextInputBuilder, TextInputStyle, LabelBuilder } = require("discord.js")
const { RewardType } = require("../enums")
const LotRegexp = /lot{(.*?)}/
module.exports = {
    name: `market-buy`,
    run: async (client, interaction) => {
        const lotID = LotRegexp.exec(interaction.customId)[1]
        const lot = client.cache.lots.find(e => e.lotID === lotID)
        if (!lot) {
            await interaction.reply({ content: `${client.config.emojis.NO}${client.language({ textId: `Лот не найден`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
            return interaction.message.delete()
        }
        if (lot.userID === interaction.user.id) {
            return interaction.reply({ content: `${client.config.emojis.NO}${client.language({ textId: `Ты не можешь купить свой лот`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
        }
        const modal = new ModalBuilder()
            .setCustomId(`market_buy_${interaction.id}`)
            .setTitle(`${client.language({ textId: `Купить лот`, guildId: interaction.guildId, locale: interaction.locale })}`)
            .setLabelComponents([
                new LabelBuilder()
                    .setLabel(`${client.language({ textId: `Количество`, guildId: interaction.guildId, locale: interaction.locale })}`)
                    .setTextInputComponent(
                        new TextInputBuilder()
                        .setCustomId("amount")
                        .setRequired(true)
                        .setStyle(TextInputStyle.Short)
                    ),
            ])
        await interaction.showModal(modal);delete client.globalCooldown[`${interaction.guildId}_${interaction.user.id}`]
        const filter = (i) => i.customId === `market_buy_${interaction.id}` && i.user.id === interaction.user.id
        interaction = await interaction.awaitModalSubmit({ filter, time: 60000 }).catch(e => interaction)
        let amount
        if (interaction && interaction.isModalSubmit()) {
            const modalArgs = {}
            interaction.fields.fields.each(field => modalArgs[field.customId] = field.value)
            if (isNaN(+modalArgs.amount) || !Number.isInteger(+modalArgs.amount)) {
                return interaction.reply({ content: `${client.config.emojis.NO} **${modalArgs.amount}** ${client.language({ textId: `не является целым числом`, guildId: interaction.guildId, locale: interaction.locale })}`, components: [], flags: ["Ephemeral"] })
            }
            modalArgs.amount = +modalArgs.amount
            if (modalArgs.amount <= 0) {
                return interaction.reply({ content: `${client.config.emojis.NO} ${client.language({ textId: `Количество не должно быть`, guildId: interaction.guildId, locale: interaction.locale })} <= 0`, components: [], flags: ["Ephemeral"] })
            }
            amount = modalArgs.amount
        } else return
        if (!lot) {
            return interaction.reply({ content: `${client.config.emojis.NO}**${client.language({ textId: "Данного лота уже не существует", guildId: interaction.guildId, locale: interaction.locale })}**`, flags: ["Ephemeral"] })
        }
        for (const element of lot.items) {
            if (element.type === RewardType.Item) {
                const item = client.cache.items.find(e => !e.temp && e.enabled && e.itemID == element.id && e.found)
                if (!item) {
                    return interaction.reply({ content: `${client.config.emojis.NO}${client.language({ textId: `Неизвестный предмет`, guildId: interaction.guildId, locale: interaction.locale })} **${element.id}**`, flags: ["Ephemeral"] })    
                }
                if (item.notSellable) {
                    return interaction.reply({ content: `${client.config.emojis.NO}${client.language({ textId: `Предмет`, guildId: interaction.guildId, locale: interaction.locale })} ${item.displayEmoji}**${item.name}** ${client.language({ textId: `нельзя выставлять в качестве цены на маркете`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })    
                }
            }
            if (element.type === RewardType.Role) {
                const role = interaction.guild.roles.cache.get(lot.item.id)
                if (!role) {
                    return interaction.reply({ content: `${client.config.emojis.NO}**${client.language({ textId: `Роль не найдена`, guildId: interaction.guildId, locale: interaction.locale })} (${lot.item.id})**`, flags: ["Ephemeral"] })
                }
                const roleProperties = await client.rolePropertiesSchema.findOne({ id: role.id }).lean()
                if (roleProperties && roleProperties.cannotSell) {
                    return interaction.reply({ content: `${client.config.emojis.NO}**${client.language({ textId: `Эту роль нельзя выставлять в качестве цены`, guildId: interaction.guildId, locale: interaction.locale })} (<@&${role.id}>)**`, flags: ["Ephemeral"] })
                }
            }
        }
        if (lot.item.type === RewardType.Item) {
            const item = client.cache.items.find(e => !e.temp && e.itemID === lot.item.id && e.enabled)
            if (!item) {
                return interaction.reply({ content: `${client.config.emojis.NO}${client.language({ textId: `Неизвестный предмет`, guildId: interaction.guildId, locale: interaction.locale })} (${lot.item.id})`, flags: ["Ephemeral"] })
            }
            if (item.notSellable) {
                return interaction.reply({ content: `${client.config.emojis.NO} ${client.language({ textId: `Предмет`, guildId: interaction.guildId, locale: interaction.locale })} ${item.displayEmoji}**${item.name}** ${client.language({ textId: `нельзя покупать на маркете`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
            }    
        }
        if (lot.item.type === RewardType.Role) {
            const role = interaction.guild.roles.cache.get(lot.item.id)
            if (!role) {
                return interaction.reply({ content: `${client.config.emojis.NO}**${client.language({ textId: `Роль не найдена`, guildId: interaction.guildId, locale: interaction.locale })} (${lot.item.id})**`, flags: ["Ephemeral"] })
            }
            const roleProperties = await client.rolePropertiesSchema.findOne({ id: role.id }).lean()
            if (roleProperties && roleProperties.cannotSell) {
                return interaction.reply({ content: `${client.config.emojis.NO}**${client.language({ textId: `Эту роль нельзя покупать`, guildId: interaction.guildId, locale: interaction.locale })} (<@&${role.id}>)**`, flags: ["Ephemeral"] })
            }
        }
        if (lot.item.amount < amount) amount = lot.item.amount
        const profileSeller = await client.functions.fetchProfile(client, lot.userID, interaction.guildId)
        const memberSeller = await interaction.guild.members.fetch(lot.userID)
        const profile = await client.functions.fetchProfile(client, interaction.user.id, interaction.guildId)
        let canBuy = true
        const notEnough = []
        const settings = client.cache.settings.get(interaction.guildId)
        for (let item of lot.items) {
            if (item.type === RewardType.Item) {
                const serverItem = client.cache.items.find(e => !e.temp && e.itemID === item.id && e.enabled)
                if (!serverItem) {
                    return interaction.reply({ content: `${client.config.emojis.NO}**${client.language({ textId: "Такого предмета не существует, либо он неизвестен", guildId: interaction.guildId, locale: interaction.locale })} (${item.id})**`, flags: ["Ephemeral"] })
                }
                const buyerUserItem = profile.inventory.find((e) => { return e.itemID === item.id })
                if (!buyerUserItem || buyerUserItem.amount < item.amount * amount) {
                    notEnough.push(`${serverItem.displayEmoji}${serverItem.name} (${item.amount * amount - (buyerUserItem?.amount || 0)})`)
                    canBuy = false
                }  
            }
            if (item.type === RewardType.Currency) {
                if (profile.currency < item.amount * amount) {
                    notEnough.push(`${settings.displayCurrencyEmoji}${settings.currencyName} (${item.amount * amount - profile.currency})`)
                    canBuy = false
                }
            }
            if (item.type === RewardType.Role) {
                const role = interaction.guild.roles.cache.get(item.id)
                if (!role) {
                    return interaction.reply({ content: `${client.config.emojis.NO}**${client.language({ textId: `Роль не найдена`, guildId: interaction.guildId, locale: interaction.locale })} (${item.id})**`, flags: ["Ephemeral"] })
                }
                const roleInventory = profile.inventoryRoles?.find(e => { return e.id === item.id && e.ms === undefined })
                if (!roleInventory || (roleInventory.amount < (item.amount * amount))) {
                    notEnough.push(`<@&${item.id}> (${item.amount * amount - (roleInventory?.amount || 0)})`)
                    canBuy = false
                }
            }
        }
        if (!canBuy) {
            return interaction.reply({ content: `${client.config.emojis.NO}${client.language({ textId: "Для покупки тебе не хватает", guildId: interaction.guildId, locale: interaction.locale })}:\n${notEnough.join(", ")}`, flags: ["Ephemeral"] })
        }
        await lot.buy(profile, profileSeller, amount, memberSeller, interaction, true)
    }
}