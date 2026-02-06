const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, TextInputStyle, ModalBuilder, TextInputBuilder, GuildPremiumTier, LabelBuilder } = require("discord.js")
const { RewardType } = require("../enums")
const idRegexp = /id{(.*?)}/
module.exports = {
    name: `createCustomRole`,
    run: async (client, interaction) => {
        const id = idRegexp.exec(interaction.customId)[1]
        const customRole = client.cache.customRoles.get(id)
        if (!customRole) {
            return interaction.reply({ content: `${client.config.emojis.NO}${client.language({ textId: `Запрос на создание роли не найден`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
        }
        const settings = client.cache.settings.get(interaction.guildId)
        if (interaction.customId.includes("accept")) {
            const member = await interaction.guild.members.fetch(customRole.userID).catch(() => null)
            if (member) {
                const position = interaction.guild.roles.cache.get(settings.roles.customRolePosition).position
                const role = await interaction.guild.roles.create({
                    name: customRole.name,
                    color: customRole.color || undefined,
                    reason: 'Custom role',
                    hoist: settings.customRoleHoist,
                    position: position,
                    icon: (interaction.guild.premiumTier === GuildPremiumTier.Tier2 || interaction.guild.premiumTier === GuildPremiumTier.Tier3) && customRole.icon !== customRole.displayIcon ? customRole.iconURL : undefined,
                    unicodeEmoji: (interaction.guild.premiumTier === GuildPremiumTier.Tier2 || interaction.guild.premiumTier === GuildPremiumTier.Tier3) && customRole.icon === customRole.displayIcon ? customRole.icon : undefined
                })
                const profile = await client.functions.fetchProfile(client, customRole.userID, interaction.guildId)
                profile.addRole({ id: role.id, amount: 1, ms: customRole.minutes && customRole.minutes !== Infinity ? customRole.minutes * 60 * 1000 : undefined })
                await profile.save()
                member.send({ embeds: [new EmbedBuilder().setThumbnail(interaction.guild.iconURL()).setColor(3093046).setTitle(interaction.guild.name).setDescription(`${client.language({ textId: `Вам разрешено в создании кастомной роли`, guildId: interaction.guildId })}. ${client.language({ textId: `Роль`, guildId: interaction.guildId })} ${role.name} ${client.language({ textId: `добавлена в инвентарь (/inventory-roles)`, guildId: interaction.guildId })}`)] })
                if (settings.customRoleProperties?.length) {
                    const properties = {}
                    settings.customRoleProperties.forEach(e => properties[e] = true )
                    await new client.rolePropertiesSchema({
                        guildID: interaction.guildId,
                        id: role.id,
                        ...properties
                    }).save()
                }
                customRole.deleteDate = undefined
                customRole.channelId = undefined
                customRole.messageId = undefined
                customRole.roleId = role.id
                customRole.clearTimeoutDelete()
                await customRole.save()    
            } else {
                await customRole.delete()
            }
            return interaction.update({ components: [new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("0").setDisabled(true).setLabel(`${client.language({ textId: `РАЗРЕШЕНО`, guildId: interaction.guildId, locale: interaction.locale })}`).setStyle(ButtonStyle.Success))] })
        }
        if (interaction.customId.includes("decline")) {
            const member = await interaction.guild.members.fetch(customRole.userID).catch(() => null)
            if (member) {
                const modal = new ModalBuilder()
                    .setCustomId(`decline_${interaction.id}`)
                    .setTitle(`${client.language({ textId: `Отказ`, guildId: interaction.guildId, locale: interaction.locale })}`)
                    .setLabelComponents([
                        new LabelBuilder()
                            .setLabel(`${client.language({ textId: `Причина`, guildId: interaction.guildId, locale: interaction.locale })}`)
                            .setTextInputComponent(
                                new TextInputBuilder()
                                    .setCustomId("reason")
                                    .setRequired(true)
                                    .setMaxLength(100)
                                    .setStyle(TextInputStyle.Short)
                            )
                    ])
                await interaction.showModal(modal);delete client.globalCooldown[`${interaction.guildId}_${interaction.user.id}`]
                const filter = (i) => i.customId === `decline_${interaction.id}` && i.user.id === interaction.user.id;
                interaction = await interaction.awaitModalSubmit({ filter, time: 60000 }).catch(() => null)
                if (interaction) {
                    const modalArgs = {}
                    interaction.fields.fields.each(field => modalArgs[field.customId] = field.value)
                    member.send({ embeds: [new EmbedBuilder().setThumbnail(interaction.guild.iconURL()).setColor(3093046).setTitle(interaction.guild.name).setDescription(`${client.language({ textId: `Вам отказано в создании кастомной роли, причина`, guildId: interaction.guildId })}: **${modalArgs.reason}**`)] })
                } else return
                const profile = await client.functions.fetchProfile(client, customRole.userID, interaction.guildId)
                if (customRole.minutes === Infinity && settings.customRolePrice.length) {
                    for (let item of settings.customRolePrice) {
                        if (item.type === RewardType.Item) {
                            await profile.addItem({ itemID: item.id, amount: item.amount })
                        }
                        if (item.type === RewardType.Currency) {
                            profile.currency += item.amount
                        }
                        if (item.type === RewardType.Role) {
                            await profile.addRole({ id: item.id, amount: item.amount })
                        }
                        if (item.type === RewardType.Reputation) {
                            await profile.addRp({ amount: item.amount })
                        }
                    }
                    await profile.save()    
                }
                if (customRole.minutes !== Infinity && settings.customRolePriceMinute.length) {
                    for (let item of settings.customRolePriceMinute) {
                        if (item.type === RewardType.Item) {
                            await profile.addItem({ itemID: item.id, amount: item.amount * customRole.minutes })
                        }
                        if (item.type === RewardType.Currency) {
                            profile.currency += item.amount * customRole.minutes
                        }
                        if (item.type === RewardType.Role) {
                            await profile.addRole({ id: item.id, amount: item.amount * customRole.minutes })
                        }
                        if (item.type === RewardType.Reputation) {
                            await profile.addRp({ amount: item.amount * customRole.minutes })
                        }
                    }
                    await profile.save()    
                }
            }
            await customRole.delete()
            return interaction.update({ components: [new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("0").setDisabled(true).setLabel(`${client.language({ textId: `НЕ РАЗРЕШЕНО`, guildId: interaction.guildId, locale: interaction.locale })}`).setStyle(ButtonStyle.Danger))] })
        }
    }
}