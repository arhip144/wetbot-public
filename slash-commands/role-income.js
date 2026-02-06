const { EmbedBuilder, Collection, ActionRowBuilder, ButtonBuilder, ButtonStyle, SnowflakeUtil, SectionBuilder, TextDisplayBuilder, ThumbnailBuilder, SeparatorBuilder, MessageFlags, ContainerBuilder } = require("discord.js")
const UserRegexp = /usr{(.*?)}/
const lt = require('long-timeout')
module.exports = {
    name: 'role-income',
    nameLocalizations: {
        'ru': `роль-доход`,
        'uk': `дохід-від-ролі`,
        'es-ES': `ingresos-rol`
    },
    description: 'Get income from the role',
    descriptionLocalizations: {
        'ru': `Получить доход от роли`,
        'uk': `Отримати дохід від ролі`,
        'es-ES': `Obtener ingresos del rol`
    },
    dmPermission: false,
    group: `inventory-group`,
    cooldowns: new Collection(),
    run: async (client, interaction, args) => {
        if (interaction.isButton() && interaction.user.id !== UserRegexp.exec(interaction.customId)?.[1]) return interaction.deferUpdate().catch(() => null)
        const profile = await client.functions.fetchProfile(client, interaction.user.id, interaction.guildId)
        if (interaction.isChatInputCommand()) await interaction.deferReply()
        else {
            await interaction.update({ 
                components: [
                    new TextDisplayBuilder().setContent(`### ⏳${client.language({ textId: "Загрузка", guildId: interaction.guildId, locale: interaction.locale })}`)
                ] 
            })
        }
        const member = await interaction.guild.members.fetch(interaction.user.id)
        const { income, pass, notification, totalIncome } = await profile.getIncome(interaction)
        if (!Object.keys(income).length) {
            return interaction.editReply({
                components: [
                    new SectionBuilder()
                        .addTextDisplayComponents(new TextDisplayBuilder().setContent(`## ${member.displayName}\n## ${client.language({ textId: "Доход от ролей", guildId: interaction.guildId, locale: interaction.locale })}`))
                        .setThumbnailAccessory(new ThumbnailBuilder().setURL(member.displayAvatarURL())),
                    new SeparatorBuilder(),
                    new TextDisplayBuilder()
                        .setContent(`${client.config.emojis.NO} ${client.language({ textId: "У тебя не найдено соответствующих ролей. Посмотреть всех доходные роли", guildId: interaction.guildId, locale: interaction.locale })}: </roles:1150455842680885357>.`)
                ],
                flags: [MessageFlags.IsComponentsV2]
            })
        }
        let message
        const container = new ContainerBuilder()
            .addSectionComponents([
                new SectionBuilder()
                    .addTextDisplayComponents(new TextDisplayBuilder().setContent(`## ${member.displayName}\n## ${client.language({ textId: "Доход от ролей", guildId: interaction.guildId, locale: interaction.locale })}`))
                    .setThumbnailAccessory(new ThumbnailBuilder().setURL(member.displayAvatarURL()))
            ])
            .addSeparatorComponents(new SeparatorBuilder())
        let totalIncomeSection = ''
        if (totalIncome.length) {
            totalIncomeSection = `## ${client.language({ textId: "Всего получено", guildId: interaction.guildId, locale: interaction.locale })}\n${totalIncome.join("\n")}`
        }

        const BASE_CONTENT_LENGTH = `## ${member.displayName}\n## ${client.language({ textId: "Доход от ролей", guildId: interaction.guildId, locale: interaction.locale })}`.length
        const TOTAL_INCOME_LENGTH = totalIncomeSection.length
        const SEPARATORS_LENGTH = 100
        const MAX_INCOME_LENGTH = 4000 - BASE_CONTENT_LENGTH - TOTAL_INCOME_LENGTH - SEPARATORS_LENGTH

        const incomeContent = createIncomeContent(interaction, income, profile, MAX_INCOME_LENGTH)

        container.addTextDisplayComponents([
            new TextDisplayBuilder().setContent(incomeContent)
        ])
        if (totalIncome.length) {
            container
                .addSeparatorComponents(new SeparatorBuilder())
                .addSectionComponents([
                    new SectionBuilder()
                        .addTextDisplayComponents([
                            new TextDisplayBuilder()
                                .setContent(`## ${client.language({ textId: "Всего получено", guildId: interaction.guildId, locale: interaction.locale })}\n${totalIncome.join("\n")}`)
                        ])
                        .setButtonAccessory(
                            new ButtonBuilder()
                                .setCustomId(`cmd{inventory}usr{${interaction.user.id}}eph reply`)
                                .setEmoji(client.config.emojis.inventory)
                                .setLabel(client.language({ textId: `Инвентарь`, guildId: interaction.guildId, locale: interaction.locale }))
                                .setStyle(ButtonStyle.Secondary)
                        )
                ])
        }
        message = await interaction.editReply({ components: [container], flags: [MessageFlags.IsComponentsV2], allowedMentions: { roles: [] } })
        client.emit("economyLogCreate", interaction.guildId, `<@${interaction.user.id}> ${client.language({ textId: "получил доход от ролей", guildId: interaction.guildId })}`)
        if (!pass || !notification) return
        lt.setTimeout(async () => {
            const nonce = SnowflakeUtil.generate().toString()
            await message.reply({ 
                components: [
                    new TextDisplayBuilder().setContent(`<@${member.user.id}>, ${client.language({ textId: "пора получать доход от ролей", guildId: interaction.guildId, locale: interaction.locale })}: </role-income:1150455842680885356>`),
                    new SeparatorBuilder(),
                    new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setStyle(ButtonStyle.Success)
                            .setLabel(`${client.language({ textId: "ПОЛУЧИТЬ ДОХОД", guildId: interaction.guildId, locale: interaction.locale })}`)
                            .setCustomId(`cmd{role-income}usr{${member.user.id}}`)
                    )
                ],
                flags: [MessageFlags.IsComponentsV2],
                allowedMentions: profile.roleIncomeMention ? { users: [member.user.id] } : { parse: [] },
                enforceNonce: true, nonce: nonce,
            }).catch(() => null)
        }, Math.min.apply(null, Array.from(profile.roleIncomeCooldowns.values()).map(value => value - Date.now()).filter(value => value > 0)))
    }
}
function createIncomeContent(interaction, income, profile, maxLength) {
    let result = ''
    const incomeKeys = Object.keys(income)
    let displayedRoles = 0
    let remainingRoles = 0
    
    for (let i = 0; i < incomeKeys.length; i++) {
        const key = incomeKeys[i]
        const index = i
        
        let roleEntry = ''
        if (income[key].cooldown) {
            roleEntry = `\`${index + 1 < 10 ? "0" : ""}${index + 1}\` — <@&${key}>: ${interaction.client.language({ textId: "следующий доход", guildId: interaction.guildId, locale: interaction.locale })} <t:${Math.floor(income[key].cooldown / 1000)}:R>`
        } else {
            const incomeLines = []
            
            if (income[key].cur) incomeLines.push(income[key].cur)
            if (income[key].rp) incomeLines.push(income[key].rp)
            if (income[key].xp) incomeLines.push(income[key].xp)
            if (income[key].items && income[key].items.length > 0) {
                incomeLines.push(...income[key].items)
            }
            
            roleEntry = `\`${index + 1 < 10 ? "0" : ""}${index + 1}\` — <@&${key}>: ${interaction.client.language({ textId: "следующий доход", guildId: interaction.guildId, locale: interaction.locale })} <t:${Math.floor(profile.roleIncomeCooldowns.get(key) / 1000)}:R>\n${incomeLines.join(", ")}`
        }
        
        const potentialContent = result + (result ? '\n' : '') + roleEntry
        const remainingText = `\n\n*${interaction.client.language({ textId: "и ещё", guildId: interaction.guildId, locale: interaction.locale })} ${incomeKeys.length - i} ${interaction.client.language({ textId: getRoleWord(incomeKeys.length - i), guildId: interaction.guildId, locale: interaction.locale })}*`
        if (potentialContent.length + remainingText.length <= maxLength) {
            result = potentialContent
            displayedRoles++
        } else {
            remainingRoles = incomeKeys.length - i
            if (result.length + remainingText.length <= maxLength) {
                result += remainingText
            }
            break
        }
        if (displayedRoles === incomeKeys.length) {
            displayedRoles = incomeKeys.length
            remainingRoles = 0
        }
    }
    
    return result
}
function getRoleWord(count) {
    if (count % 10 === 1 && count % 100 !== 11) {
        return 'роль'
    } else if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100)) {
        return 'роли'
    } else {
        return 'ролей'
    }
}