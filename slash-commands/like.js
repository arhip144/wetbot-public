const { ApplicationCommandOptionType, ButtonBuilder, ButtonStyle, ActionRowBuilder, EmbedBuilder, Collection, ContainerBuilder, TextDisplayBuilder, SectionBuilder, ComponentType, MessageFlags, SeparatorSpacingSize } = require("discord.js")
const UserRegexp = /usr{(.*?)}/
const MemberRegexp = /mbr{(.*?)}/
module.exports = {
    name: 'like',
    nameLocalizations: {
        'ru': `лайк`,
        'uk': `лайк`,
        'es-ES': `me-gusta`
    },
    description: 'Like the user',
    descriptionLocalizations: {
        'ru': `Лайкнуть пользователя`,
        'uk': `Вподобати користувача`,
        'es-ES': `Dar me gusta al usuario`
    },
    options: [
        {
            name: 'user',
            nameLocalizations: {
                'ru': `юзер`,
                'uk': `користувач`,
                'es-ES': `usuario`
            },
            description: 'User to like',
            descriptionLocalizations: {
                'ru': `Пользователь, которого хотите лайкнуть`,
                'uk': `Користувач, якого ви хочете вподобати`,
                'es-ES': `Usuario al que quieres dar me gusta`
            },
            type: ApplicationCommandOptionType.User,
            required: true
        }
    ],
    dmPermission: false,
    group: `general-group`,
    cooldowns: new Collection(),
    run: async (client, interaction, args) => {
        if (interaction.isButton()) {
            if (interaction.user.id !== MemberRegexp.exec(interaction.customId)?.[1]) return interaction.deferUpdate().catch(e => null)
        }
        let mentionMember
        if (args?.user) mentionMember = await interaction.guild.members.fetch(args.user).catch(e => null)
        else if (interaction.isContextMenuCommand()) mentionMember = await interaction.guild.members.fetch(interaction.tagertId).catch(e => null)
        else if (interaction.isButton()) mentionMember = await interaction.guild.members.fetch(UserRegexp.exec(interaction.customId)?.[1]).catch(e => null)
        else mentionMember = interaction.member
        if (!mentionMember) {
            return interaction.reply({ content: `${client.config.emojis.NO}${client.language({ textId: `Пользователь не найден на сервере`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
        }
        const settings = client.cache.settings.get(interaction.guildId)
        const profile = await client.functions.fetchProfile(client, interaction.user.id, interaction.guildId)
        if (interaction.user.id == mentionMember.user.id || mentionMember.user.bot == true) {
            return interaction.reply({ content: `${client.config.emojis.NO} ${client.language({ textId: `Ты не можешь лайкать себя или бота`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
        }
        if (profile.lastLike && Date.now() < profile.lastLike.getTime() + 24 * 60 * 60 * 1000) {
            if (!interaction.isButton()) return interaction.reply({ content: `⚠ <@${interaction.user.id}>, ${client.language({ textId: `ты уже недавно`, guildId: interaction.guildId, locale: interaction.locale })} ${profile.sex === "male" ? `${client.language({ textId: `лайкнул`, guildId: interaction.guildId, locale: interaction.locale })}` : profile.sex === "female" ? `${client.language({ textId: `лайкнула`, guildId: interaction.guildId, locale: interaction.locale })}` : `${client.language({ textId: `лайкнул(-а)`, guildId: interaction.guildId, locale: interaction.locale })}`}\n${client.language({ textId: `Следующий лайк`, guildId: interaction.guildId, locale: interaction.locale })}: <t:${Math.floor((profile.lastLike.getTime() + 24 * 60 * 60 * 1000)/1000)}:F>`, flags: ["Ephemeral"], allowedMentions: { parse: [] } })
            else {
                return interaction.reply({ content: `⚠ <@${interaction.user.id}>, ${client.language({ textId: `ты уже недавно`, guildId: interaction.guildId, locale: interaction.locale })} ${profile.sex === "male" ? `${client.language({ textId: `лайкнул`, guildId: interaction.guildId, locale: interaction.locale })}` : profile.sex === "female" ? `${client.language({ textId: `лайкнула`, guildId: interaction.guildId, locale: interaction.locale })}` : `${client.language({ textId: `лайкнул(-а)`, guildId: interaction.guildId, locale: interaction.locale })}`}\n${client.language({ textId: `Следующий лайк`, guildId: interaction.guildId, locale: interaction.locale })}: <t:${Math.floor((profile.lastLike.getTime() + 24 * 60 * 60 * 1000)/1000)}:F>`, flags: ["Ephemeral"], allowedMentions: { parse: [] } })
            }
        }
        const data = await client.functions.addLike(client, interaction.user.id, interaction.guildId, mentionMember.user.id, 1, interaction.channel)
        const rewards = []
        const rewards1 = []
        if (settings.xpForLike && !data.likedProfile.blockActivities?.like?.XP) rewards.push(`${client.config.emojis.XP}**${client.language({ textId: `Опыт`, guildId: interaction.guildId, locale: interaction.locale })}** ${(settings.xpForLike + (settings.xpForLike * data.likedProfile.getXpBoost())).toLocaleString()}`)
        if (settings.xpForLike && !data.likingProfile.blockActivities?.like?.XP) rewards1.push(`${client.config.emojis.XP}**${client.language({ textId: `Опыт`, guildId: interaction.guildId, locale: interaction.locale })}** ${(settings.xpForLike + (settings.xpForLike * data.likingProfile.getXpBoost())).toLocaleString()}`)
        if (settings.curForLike && !data.likedProfile.blockActivities?.like?.CUR) rewards.push(`${settings.displayCurrencyEmoji}**${settings.currencyName}** ${(settings.curForLike + (settings.curForLike * data.likedProfile.getCurBoost())).toFixed()}`)
        if (settings.curForLike && !data.likingProfile.blockActivities?.like?.CUR) rewards1.push(`${settings.displayCurrencyEmoji}**${settings.currencyName}** ${(settings.curForLike + (settings.curForLike * data.likingProfile.getCurBoost())).toFixed()}`)
        if (settings.rpForLike && !data.likedProfile.blockActivities?.like?.RP) rewards.push(`${client.config.emojis.RP}**${client.language({ textId: `Репутация`, guildId: interaction.guildId, locale: interaction.locale })}** ${(settings.rpForLike + (settings.rpForLike * data.likedProfile.getRpBoost())).toLocaleString()}`)
        if (settings.rpForLike && !data.likingProfile.blockActivities?.like?.RP) rewards1.push(`${client.config.emojis.RP}**${client.language({ textId: `Репутация`, guildId: interaction.guildId, locale: interaction.locale })}** ${(settings.rpForLike + (settings.rpForLike * data.likingProfile.getRpBoost())).toLocaleString()}`)
        const like_btn = new ButtonBuilder()
            .setStyle(ButtonStyle.Success)
            .setLabel(`${client.language({ textId: `ЛАЙКНУТЬ В ОТВЕТ`, guildId: interaction.guildId, locale: interaction.locale })}`)
            .setCustomId(`mbr{${mentionMember.user.id}}cmd{like}usr{${interaction.user.id}}`)
        const first_row = new ActionRowBuilder().addComponents([like_btn])
        const container = new ContainerBuilder()
            .addTextDisplayComponents([
                new TextDisplayBuilder().setContent([
                    `<@${interaction.user.id}> ${profile.sex === "male" ? `${client.language({ textId: `лайкнул`, guildId: interaction.guildId, locale: interaction.locale })}` : profile.sex === "female" ? `${client.language({ textId: `лайкнула`, guildId: interaction.guildId, locale: interaction.locale })}` : `${client.language({ textId: `лайкнул(-а)`, guildId: interaction.guildId, locale: interaction.locale })}`} <@${mentionMember.user.id}>\n${client.language({ textId: `Следующий лайк`, guildId: interaction.guildId, locale: interaction.locale })}: <t:${Math.floor((profile.lastLike.getTime() + 24 * 60 * 60 * 1000)/1000)}:F>`
                ].join("\n"))
            ])
            .addSeparatorComponents(SeparatorBuilder => SeparatorBuilder.setSpacing(SeparatorSpacingSize.Large))
            .addSectionComponents([
                new SectionBuilder()
                    .setThumbnailAccessory(ThumbnailBuilder => ThumbnailBuilder.setURL(mentionMember.displayAvatarURL()))
                    .addTextDisplayComponents([
                        new TextDisplayBuilder()
                            .setContent([
                                `## ${mentionMember.displayName}`,
                                `${client.language({ textId: `Получено`, guildId: interaction.guildId, locale: interaction.locale })}:`,
                                `${client.config.emojis.heart}**${client.language({ textId: `Лайк`, guildId: interaction.guildId, locale: interaction.locale })}** 1`,
                                rewards.join("\n"),
                                `${data.likedUserRewards ? data.likedUserRewards.join("\n") : undefined}`
                            ].filter(e => e).join("\n"))
                    ])
            ])
        container.addSeparatorComponents(SeparatorBuilder => SeparatorBuilder.setSpacing(SeparatorSpacingSize.Large))
            .addSectionComponents([
                new SectionBuilder()
                    .setThumbnailAccessory(ThumbnailBuilder => ThumbnailBuilder.setURL(interaction.member.displayAvatarURL()))
                    .addTextDisplayComponents([
                        new TextDisplayBuilder()
                            .setContent([
                                `## ${interaction.member.displayName}`,
                                (settings.xpForLike || settings.curForLike || settings.rpForLike) && (!data.likingProfile.blockActivities?.like?.XP || !data.likingProfile.blockActivities?.like?.CUR || !data.likingProfile.blockActivities?.like?.RP || !data.likingProfile.blockActivities?.like?.items) ? `${client.language({ textId: `Получено`, guildId: interaction.guildId, locale: interaction.locale })}:\n${rewards1.join("\n")}\n${data.likingUserRewards ? data.likingUserRewards.join("\n") : "" }` : undefined
                            ].filter(e => e).join("\n"))
                    ])
            ])
        if (!interaction.isButton()) {
            container.addSeparatorComponents(SeparatorBuilder => SeparatorBuilder.setSpacing(SeparatorSpacingSize.Large))
            container.addActionRowComponents(first_row)
        }
        else {
            const container = new ContainerBuilder(interaction.message.components[0].toJSON())
            container.spliceComponents(container.components.length - 2, 2)
            await interaction.update({ components: [container] })
        }
        client.emit("economyLogCreate", interaction.guildId, `<@${interaction.user.id}> (${interaction.user.username}) ${client.language({ textId: "лайкнул", guildId: interaction.guildId })} <@${mentionMember.user.id}> (${mentionMember.user.username})`)
        if (!interaction.isButton()) return interaction.reply({ components: [container], allowedMentions: { users: [mentionMember.user.id] }, flags: [MessageFlags.IsComponentsV2] })
        else {
            return interaction.followUp({ components: [container], allowedMentions: { users: [mentionMember.user.id] }, flags: [MessageFlags.IsComponentsV2] })
        }
    }   
}