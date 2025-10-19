const { ActivityType, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, ActionRowBuilder, EmbedBuilder, ApplicationCommandOptionType, GuildMember, ModalBuilder, TextInputBuilder, TextInputStyle, InteractionType, Collection, ContainerBuilder, SectionBuilder, TextDisplayBuilder, ThumbnailBuilder, MessageFlags, SeparatorSpacingSize, MediaGalleryBuilder, MediaGalleryItemBuilder, ComponentType, LabelBuilder } = require("discord.js")
const UserRegexp = /usr{(.*?)}/
const MemberRegexp = /mbr{(.*?)}/
const { AchievementType } = require("../enums")
const { SocialLinks } = require(`social-links`)
const { format } = require('date-format-parse')
module.exports = {
    name: "profile",
    nameLocalizations: {
        "ru": "профиль",
        "uk": "профіль",
        "es-ES": "perfil"
    },
    description: `View profile`,
    descriptionLocalizations: {
       "ru": "Посмотреть профиль",
       "uk": "Переглянути профіль",
       "es-ES": "Ver perfil"
    },
    options: [
        {
            name: "user",
            nameLocalizations: {
                "ru": "юзер",
                "uk": "користувач",
                "es-ES": "usuario"
            },
            description: `View user's profile`,
            descriptionLocalizations: {
                "ru": "Посмотреть профиль пользователя",
                "uk": "Переглянути профіль користувача",
                "es-ES": "Ver perfil del usuario"
            },
            type: ApplicationCommandOptionType.User,
            required: false
        },
        {
            name: 'compact',
            nameLocalizations: {
                'ru': "компактный",
                'uk': "компактний",
                'es-ES': "compacto"
            },
            description: 'The compact version of profile',
            descriptionLocalizations: {
                'ru': "Компактная версия профиля",
                'uk': "Компактна версія профілю",
                'es-ES': "Versión compacta del perfil"
            },
            type: ApplicationCommandOptionType.Boolean
        },
        {
            name: 'ephemeral',
            nameLocalizations: {
                'ru': "эфемерный",
                'uk': "ефемерний",
                'es-ES': "efímero"
            },
            description: 'Message visible only for you',
            descriptionLocalizations: {
                'ru': "Сообщение видно только тебе",
                'uk': "Повідомлення видно тільки вам",
                'es-ES': "Mensaje visible solo para ti"
            },
            type: ApplicationCommandOptionType.Boolean
        }
    ],
    dmPermission: false,
    group: `profile-group`,
    cooldowns: new Collection(),
    run: async (client, interaction, args) => {
        if (!interaction.isChatInputCommand() && !interaction.isContextMenuCommand() && UserRegexp.exec(interaction.customId)) {
            if (interaction.user.id !== UserRegexp.exec(interaction.customId)[1]) return interaction.deferUpdate().catch(e => null)
        }
        const flags = []
        if ((interaction.isChatInputCommand() && !args?.compact) || interaction.message?.flags.toArray().includes("IsComponentsV2")) flags.push(MessageFlags.IsComponentsV2)
        if (interaction.customId?.includes("eph") || interaction.values?.[0].includes("eph") || args?.ephemeral) flags.push("Ephemeral")
        let member
        if (args?.user) member = await interaction.guild.members.fetch(args.user).catch(e => null)
        else if (interaction.isButton() && MemberRegexp.exec(interaction.customId)) member = await interaction.guild.members.fetch(MemberRegexp.exec(interaction.customId)[1]).catch(e => null)
        else if (interaction.isStringSelectMenu() && (MemberRegexp.exec(interaction.customId) || MemberRegexp.exec(interaction.values[0]))) {
            member = await interaction.guild.members.fetch(MemberRegexp.exec(interaction.values[0])?.[1]).catch(e => null)
            if (!(member instanceof GuildMember)) member = await interaction.guild.members.fetch(MemberRegexp.exec(interaction.customId)[1]).catch(e => null)
        }
        else member = interaction.member
        if (!member) {
            if (!interaction.replied && !interaction.deferred) return interaction.reply({ content: `${client.config.emojis.NO}${client.language({ textId: `Пользователь не найден на сервере`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
            else return interaction.editReply({ content: `${client.config.emojis.NO}${client.language({ textId: `Пользователь не найден на сервере`, guildId: interaction.guildId, locale: interaction.locale })}`, embeds: [], components: [], flags: ["Ephemeral"] })
        }
        const embed = new EmbedBuilder()
        const profile = await client.functions.fetchProfile(client, member.user.id, interaction.guildId)
        let globalUser = await client.globalProfileSchema.findOne({ userID: member.user.id })
        if (interaction.isStringSelectMenu()) {
            if (interaction.values[0].includes(`joinDate`)) {
                if (profile.joinDateIsHiden) profile.joinDateIsHiden = undefined
                else profile.joinDateIsHiden = true
                await profile.save()
            } else
            if (interaction.values[0].includes(`isHiden`)) {
                if (profile.isHiden) profile.isHiden = undefined
                else profile.isHiden = true
                await profile.save()
            } else
            if (interaction.values[0].includes(`achievementsHide`)) {
                if (profile.achievementsHiden) profile.achievementsHiden = undefined
                else profile.achievementsHiden = true
                await profile.save()
            } else
            if (interaction.values[0].includes(`sexMale`)) {
                profile.sex = `male`
                await profile.save()
            } else
            if (interaction.values[0].includes(`sexFemale`)) {
                profile.sex = `female`
                await profile.save()
            } else
            if (interaction.values[0].includes(`sexHide`)) {
                if (profile.sexHide) profile.sexHide = undefined
                else profile.sexHide = true
                await profile.save()
            } else
            if (interaction.values[0].includes(`trophyHide`)) {
                if (profile.trophyHide) profile.trophyHide = undefined
                else profile.trophyHide = true
                await profile.save()
            } else
            if (interaction.values[0].includes(`lastOnlineHide`)) {
                if (!globalUser) globalUser = await client.functions.fetchGlobalProfile(client, member.user.id)
                if (!globalUser.lastOnlineHiden) globalUser.lastOnlineHiden = true
                else globalUser.lastOnlineHiden = undefined
                await globalUser.save()
            } else
            if (interaction.values[0].includes(`VK`)) {
                const modal = new ModalBuilder()
                .setCustomId(`editVK_${interaction.id}`)
                .setTitle(`${client.language({ textId: `РЕДАКТИРОВАТЬ ПРОФИЛЬ`, guildId: interaction.guildId, locale: interaction.locale })}`)
                .setLabelComponents([
                    new LabelBuilder()
                        .setLabel(`${client.language({ textId: "Ссылка VK", guildId: interaction.guildId, locale: interaction.locale })}`)
                        .setTextInputComponent(
                            new TextInputBuilder()
                                .setCustomId("link")
                                .setStyle(TextInputStyle.Short)
                                .setRequired(false)
                                .setValue(`${profile.links?.VK || ""}`)
                        )
                ])
                await interaction.showModal(modal);delete client.globalCooldown[`${interaction.guildId}_${interaction.user.id}`]
                const filter = (i) => i.customId === `editVK_${interaction.id}` && i.user.id === interaction.user.id;
                interaction = await interaction.awaitModalSubmit({ filter, time: 180000 }).catch(e => interaction)
                if (interaction && interaction.type === InteractionType.ModalSubmit) {
                    const modalArgs = {}
                    interaction.components.forEach(component => component.components.forEach(c => modalArgs[c.customId] = c.value))
                    if (!modalArgs.link && profile.links) {
                        profile.links.VK = undefined
                    } else if (modalArgs.link) {
                        const socialLinks = new SocialLinks()
                        const VK = {
                            name: `VK`,
                            matches: [
                                {
                                    match: `(https?://)?(www.)?vk.com/({PROFILE_ID})(/)?`, group: 3,
                                    pattern: `https://vk.com/{PROFILE_ID}`
                                }
                            ]
                        }
                        const profileMatches = VK.matches
                        socialLinks.addProfile(`VK`, profileMatches)
                        if (!socialLinks.isValid("VK", modalArgs.link)) {
                            return interaction.reply({ content: `${client.language({ textId: `Неверная ссылка`, guildId: interaction.guildId, locale: interaction.locale })} VK`, flags: ["Ephemeral"] })
                        }
                        if (!profile.links) profile.links = {}
                        profile.links.VK = modalArgs.link    
                    }
                    await profile.save()
                } else return
            } else
            if (interaction.values[0].includes(`TikTok`)) {
                const modal = new ModalBuilder()
                .setCustomId(`editTikTok_${interaction.id}`)
                .setTitle(`${client.language({ textId: `РЕДАКТИРОВАТЬ ПРОФИЛЬ`, guildId: interaction.guildId, locale: interaction.locale })}`)
                .setLabelComponents([
                    new LabelBuilder()
                        .setLabel(`${client.language({ textId: "Ссылка TikTok", guildId: interaction.guildId, locale: interaction.locale })}`)
                        .setTextInputComponent(
                            new TextInputBuilder()
                                .setCustomId("link")
                                .setStyle(TextInputStyle.Short)
                                .setRequired(false)
                                .setValue(`${profile.links?.TikTok || ""}`)
                        )
                ])
                await interaction.showModal(modal);delete client.globalCooldown[`${interaction.guildId}_${interaction.user.id}`]
                const filter = (i) => i.customId === `editTikTok_${interaction.id}` && i.user.id === interaction.user.id;
                interaction = await interaction.awaitModalSubmit({ filter, time: 180000 }).catch(e => interaction)
                if (interaction && interaction.type === InteractionType.ModalSubmit) {
                    const modalArgs = {}
                    interaction.components.forEach(component => component.components.forEach(c => modalArgs[c.customId] = c.value))
                    if (!modalArgs.link && profile.links) {
                        profile.links.TikTok = undefined
                    } else if (modalArgs.link) {
                        const socialLinks = new SocialLinks()
                        if (!socialLinks.isValid("tiktok", modalArgs.link)) {
                            return interaction.reply({ content: `${client.language({ textId: `Неверная ссылка`, guildId: interaction.guildId, locale: interaction.locale })} TikTok`, flags: ["Ephemeral"] })
                        }
                        if (!profile.links) profile.links = {}
                        profile.links.TikTok = modalArgs.link    
                    }
                    await profile.save()
                } else return
            } else
            if (interaction.values[0].includes(`Instagram`)) {
                const modal = new ModalBuilder()
                .setCustomId(`editInstagram_${interaction.id}`)
                .setTitle(`${client.language({ textId: `РЕДАКТИРОВАТЬ ПРОФИЛЬ`, guildId: interaction.guildId, locale: interaction.locale })}`)
                .setLabelComponents([
                    new LabelBuilder()
                        .setLabel(`${client.language({ textId: "Ссылка Instagram", guildId: interaction.guildId, locale: interaction.locale })}`)
                        .setTextInputComponent(
                            new TextInputBuilder()
                                .setCustomId("link")
                                .setStyle(TextInputStyle.Short)
                                .setRequired(false)
                                .setValue(`${profile.links?.Instagram || ""}`)
                        )
                ])
                await interaction.showModal(modal);delete client.globalCooldown[`${interaction.guildId}_${interaction.user.id}`]
                const filter = (i) => i.customId === `editInstagram_${interaction.id}` && i.user.id === interaction.user.id;
                interaction = await interaction.awaitModalSubmit({ filter, time: 180000 }).catch(e => interaction)
                if (interaction && interaction.type === InteractionType.ModalSubmit) {
                    const modalArgs = {}
                    interaction.components.forEach(component => component.components.forEach(c => modalArgs[c.customId] = c.value))
                    if (!modalArgs.link && profile.links) {
                        profile.links.Instagram = undefined
                    } else if (modalArgs.link) {
                        const socialLinks = new SocialLinks()
                        if (!socialLinks.isValid("instagram", modalArgs.link)) {
                            return interaction.reply({ content: `${client.language({ textId: `Неверная ссылка`, guildId: interaction.guildId, locale: interaction.locale })} Instagram`, flags: ["Ephemeral"] })
                        }
                        if (!profile.links) profile.links = {}
                        profile.links.Instagram = modalArgs.link    
                    }
                    await profile.save()
                } else return 
            } else
            if (interaction.values[0].includes(`Steam`)) {
                const modal = new ModalBuilder()
                .setCustomId(`editSteam_${interaction.id}`)
                .setTitle(`${client.language({ textId: `РЕДАКТИРОВАТЬ ПРОФИЛЬ`, guildId: interaction.guildId, locale: interaction.locale })}`)
                .setLabelComponents([
                    new LabelBuilder()
                        .setLabel(`${client.language({ textId: "Ссылка Steam", guildId: interaction.guildId, locale: interaction.locale })}`)
                        .setTextInputComponent(
                            new TextInputBuilder()
                                .setCustomId("link")
                                .setStyle(TextInputStyle.Short)
                                .setRequired(false)
                                .setValue(`${profile.links?.Steam || ""}`)
                        )
                ])
                await interaction.showModal(modal);delete client.globalCooldown[`${interaction.guildId}_${interaction.user.id}`]
                const filter = (i) => i.customId === `editSteam_${interaction.id}` && i.user.id === interaction.user.id;
                interaction = await interaction.awaitModalSubmit({ filter, time: 180000 }).catch(e => interaction)
                if (interaction && interaction.type === InteractionType.ModalSubmit) {
                    const modalArgs = {}
                    interaction.components.forEach(component => component.components.forEach(c => modalArgs[c.customId] = c.value))
                    if (!modalArgs.link && profile.links) {
                        profile.links.Steam = undefined
                    } else if (modalArgs.link) {
                        const socialLinks = new SocialLinks()
                        const Steam = {
                            name: `Steam`,
                            matches: [
                                {
                                    match: `(https?://)?(www.)?steamcommunity.com/id/({PROFILE_ID})(/)?`, group: 3,
                                    pattern: `https://steamcommunity.com/id/{PROFILE_ID}`
                                },
                                {
                                    match: `(https?://)?(www.)?steamcommunity.com/profiles/({PROFILE_ID})(/)?`, group: 3,
                                    pattern: `https://steamcommunity.com/profiles/{PROFILE_ID}`
                                }
                            ]
                        }
                        const profileMatches = Steam.matches
                        socialLinks.addProfile(`Steam`, profileMatches)
                        if (!socialLinks.isValid("Steam", modalArgs.link)) {
                            return interaction.reply({ content: `${client.language({ textId: `Неверная ссылка`, guildId: interaction.guildId, locale: interaction.locale })} Steam`, flags: ["Ephemeral"] })
                        }
                        if (!profile.links) profile.links = {}
                        profile.links.Steam = modalArgs.link    
                    }
                    await profile.save()
                } else return
            } else
            if (interaction.values[0].includes(`description`)) {
                const modal = new ModalBuilder()
                .setCustomId(`editDescription_${interaction.id}`)
                .setTitle(`${client.language({ textId: `РЕДАКТИРОВАТЬ ПРОФИЛЬ`, guildId: interaction.guildId, locale: interaction.locale })}`)
                .setLabelComponents([
                    new LabelBuilder()
                        .setLabel(`${client.language({ textId: "Описание профиля", guildId: interaction.guildId, locale: interaction.locale })}`)
                        .setTextInputComponent(
                            new TextInputBuilder()
                                .setCustomId("description")
                                .setMaxLength(300)
                                .setRequired(false)
                                .setStyle(TextInputStyle.Paragraph)
                                .setValue(`${profile.bio || ""}`)
                        )
                ])
                await interaction.showModal(modal);delete client.globalCooldown[`${interaction.guildId}_${interaction.user.id}`]
                const filter = (i) => i.customId === `editDescription_${interaction.id}` && i.user.id === interaction.user.id;
                interaction = await interaction.awaitModalSubmit({ filter, time: 180000 }).catch(e => interaction)
                if (interaction && interaction.type === InteractionType.ModalSubmit) {
                    const modalArgs = {}
                    interaction.components.forEach(component => component.components.forEach(c => modalArgs[c.customId] = c.value))
                    if (!modalArgs.description) profile.bio = undefined
                    else profile.bio = modalArgs.description
                    await profile.save()
                } else return
            } else
            if (interaction.values[0].includes(`banner`)) {
                const modal = new ModalBuilder()
                .setCustomId(`editBanner_${interaction.id}`)
                .setTitle(`${client.language({ textId: `РЕДАКТИРОВАТЬ ПРОФИЛЬ`, guildId: interaction.guildId, locale: interaction.locale })}`)
                .setLabelComponents([
                    new LabelBuilder()
                        .setLabel(`${client.language({ textId: "Баннер профиля", guildId: interaction.guildId, locale: interaction.locale })}`)
                        .setTextInputComponent(
                            new TextInputBuilder()
                                .setCustomId("banner")
                                .setStyle(TextInputStyle.Short)
                                .setRequired(false)
                                .setValue(`${profile.image || ""}`)
                        )
                ])
                await interaction.showModal(modal);delete client.globalCooldown[`${interaction.guildId}_${interaction.user.id}`]
                const filter = (i) => i.customId === `editBanner_${interaction.id}` && i.user.id === interaction.user.id;
                interaction = await interaction.awaitModalSubmit({ filter, time: 180000 }).catch(e => interaction)
                if (interaction && interaction.type === InteractionType.ModalSubmit) {
                    const modalArgs = {}
                    interaction.components.forEach(component => component.components.forEach(c => modalArgs[c.customId] = c.value))
                    if (!modalArgs.banner) {
                        profile.image = undefined
                    } else {
                        const isImageURL = require('image-url-validator').default;
                        const banner = await isImageURL(modalArgs.banner)
                        if (!banner) {
                            return interaction.reply({ content: `${client.config.emojis.NO} ${client.language({ textId: `Строка`, guildId: interaction.guildId, locale: interaction.locale })} **${modalArgs.banner}** ${client.language({ textId: `не является прямой ссылкой на изображение`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
                        }
                        profile.image = modalArgs.banner    
                    }
                    await profile.save()
                } else return
            } else
            if (interaction.values[0].includes(`birthday`)) {
                const modal = new ModalBuilder()
                .setCustomId(`editBirthday_${interaction.id}`)
                .setTitle(`${client.language({ textId: `РЕДАКТИРОВАТЬ ПРОФИЛЬ`, guildId: interaction.guildId, locale: interaction.locale })}`)
                .setLabelComponents([
                    new LabelBuilder()
                        .setLabel(`${client.language({ textId: "День", guildId: interaction.guildId, locale: interaction.locale })}`)
                        .setTextInputComponent(
                            new TextInputBuilder()
                                .setCustomId("day")
                                .setStyle(TextInputStyle.Short)
                                .setRequired(false)
                                .setValue(`${profile.birthday_day ? convert(profile.birthday_day) : ""}`)
                        ),
                    new LabelBuilder()
                        .setLabel(`${client.language({ textId: "Месяц", guildId: interaction.guildId, locale: interaction.locale })}`)
                        .setTextInputComponent(
                            new TextInputBuilder()
                                .setCustomId("month")
                                .setStyle(TextInputStyle.Short)
                                .setRequired(false)
                                .setValue(`${profile.birthday_month ? convert(profile.birthday_month) : ""}`)
                        ),
                    new LabelBuilder()
                        .setLabel(`${client.language({ textId: "Год", guildId: interaction.guildId, locale: interaction.locale })}`)
                        .setTextInputComponent(
                            new TextInputBuilder()
                                .setCustomId("year")
                                .setStyle(TextInputStyle.Short)
                                .setRequired(false)
                                .setValue(`${profile.birthday_year || ""}`)
                        )
                ])
                await interaction.showModal(modal);delete client.globalCooldown[`${interaction.guildId}_${interaction.user.id}`]
                const filter = (i) => i.customId === `editBirthday_${interaction.id}` && i.user.id === interaction.user.id;
                interaction = await interaction.awaitModalSubmit({ filter, time: 180000 }).catch(e => interaction)
                if (interaction && interaction.type === InteractionType.ModalSubmit) {
                    const modalArgs = {}
                    interaction.components.forEach(component => component.components.forEach(c => modalArgs[c.customId] = c.value))
                    if (!modalArgs.day && !modalArgs.month && !modalArgs.year) {
                        profile.birthday_day = undefined;
                        profile.birthday_month = undefined;
                        profile.birthday_year = undefined;
                    } else {
                        const isValidBirthdate = require("validate-date")
                        if ((!isValidBirthdate(`${modalArgs.day}/${modalArgs.month}/${modalArgs.year}`, responseType=`boolean`, dateFormat=`dd/mm/yyyy`)) || (modalArgs.year && modalArgs.year < 1900 || modalArgs.year > new Date().getFullYear() - 1)) {
                            return interaction.reply({ content: `${client.config.emojis.NO}${client.language({ textId: `Неверный формат`, guildId: interaction.guildId, locale: interaction.locale })}.`, flags: ["Ephemeral"] })
                        }
                        profile.birthday_day = modalArgs.day;
                        profile.birthday_month = modalArgs.month;
                        profile.birthday_year = modalArgs.year;  
                    }
                    await profile.save()
                } else return
            }
        }
        if (interaction.values?.[0].includes("mentions") || interaction.customId?.includes("mentions")) {
            embed.setAuthor({ name: `${member.displayName} | ${client.language({ textId: `Профиль`, guildId: interaction.guildId, locale: interaction.locale })}`, iconURL: member.displayAvatarURL() }) 
            embed.setTitle(`${client.language({ textId: `Настройка упоминаний`, guildId: interaction.guildId, locale: interaction.locale })}`)
            embed.setColor(member.displayHexColor)
            if (interaction.customId.includes("edit")) {
                interaction.values.forEach(e => {
                    if (profile[e]) profile[e] = undefined
                    else profile[e] = true
                })
                await profile.save()
            }
            embed.addFields([
                {
                    name: `${client.language({ textId: `Упоминание о новом уровне`, guildId: interaction.guildId, locale: interaction.locale })}`, value: profile.levelMention ? `${client.config.emojis.on}${client.language({ textId: `Включено`, guildId: interaction.guildId, locale: interaction.locale })}` : `${client.config.emojis.off}${client.language({ textId: `Выключено`, guildId: interaction.guildId, locale: interaction.locale })}`, inline: true
                },
                {
                    name: `${client.language({ textId: `Упоминание о новом достижении`, guildId: interaction.guildId, locale: interaction.locale })}`, value: profile.achievementMention ? `${client.config.emojis.on}${client.language({ textId: `Включено`, guildId: interaction.guildId, locale: interaction.locale })}` : `${client.config.emojis.off}${client.language({ textId: `Выключено`, guildId: interaction.guildId, locale: interaction.locale })}`, inline: true
                },
                {
                    name: `${client.language({ textId: `Упоминание о новом предмете`, guildId: interaction.guildId, locale: interaction.locale })}`, value: profile.itemMention ? `${client.config.emojis.on}${client.language({ textId: `Включено`, guildId: interaction.guildId, locale: interaction.locale })}` : `${client.config.emojis.off}${client.language({ textId: `Выключено`, guildId: interaction.guildId, locale: interaction.locale })}`, inline: true
                },
                {
                    name: `${client.language({ textId: `Упоминание о доходе роли`, guildId: interaction.guildId, locale: interaction.locale })}`, value: profile.roleIncomeMention ? `${client.config.emojis.on}${client.language({ textId: `Включено`, guildId: interaction.guildId, locale: interaction.locale })}` : `${client.config.emojis.off}${client.language({ textId: `Выключено`, guildId: interaction.guildId, locale: interaction.locale })}`, inline: true
                },
                {
                    name: `${client.language({ textId: `Упоминание о заходе приглашенного`, guildId: interaction.guildId, locale: interaction.locale })}`, value: profile.inviteJoinMention ? `${client.config.emojis.on}${client.language({ textId: `Включено`, guildId: interaction.guildId, locale: interaction.locale })}` : `${client.config.emojis.off}${client.language({ textId: `Выключено`, guildId: interaction.guildId, locale: interaction.locale })}`, inline: true
                },
                {
                    name: `${client.language({ textId: `Упоминание о выходе приглашенного`, guildId: interaction.guildId, locale: interaction.locale })}`, value: profile.inviteLeaveMention ? `${client.config.emojis.on}${client.language({ textId: `Включено`, guildId: interaction.guildId, locale: interaction.locale })}` : `${client.config.emojis.off}${client.language({ textId: `Выключено`, guildId: interaction.guildId, locale: interaction.locale })}`, inline: true
                }
            ])
            const selectMenuOptions = [
                {
                    emoji: client.config.emojis.medal, label: `${client.language({ textId: `Упоминание о новом уровне`, guildId: interaction.guildId, locale: interaction.locale })}`, description: profile.levelMention ? `🔔${client.language({ textId: `Включено`, guildId: interaction.guildId, locale: interaction.locale })}` : `🔕${client.language({ textId: `Выключено`, guildId: interaction.guildId, locale: interaction.locale })}`, value: `levelMention`
                },
                {
                    emoji: client.config.emojis.achievements, label: `${client.language({ textId: `Упоминание о новом достижении`, guildId: interaction.guildId, locale: interaction.locale })}`, description: profile.achievementMention ? `🔔${client.language({ textId: `Включено`, guildId: interaction.guildId, locale: interaction.locale })}` : `🔕${client.language({ textId: `Выключено`, guildId: interaction.guildId, locale: interaction.locale })}`, value: `achievementMention`
                },
                {
                    emoji: client.config.emojis.box, label: `${client.language({ textId: `Упоминание о новом предмете`, guildId: interaction.guildId, locale: interaction.locale })}`, description: profile.itemMention ? `🔔${client.language({ textId: `Включено`, guildId: interaction.guildId, locale: interaction.locale })}` : `🔕${client.language({ textId: `Выключено`, guildId: interaction.guildId, locale: interaction.locale })}`, value: `itemMention`
                },
                {
                    emoji: client.config.emojis.roles, label: `${client.language({ textId: `Упоминание о доходе роли`, guildId: interaction.guildId, locale: interaction.locale })}`, description: profile.roleIncomeMention ? `🔔${client.language({ textId: `Включено`, guildId: interaction.guildId, locale: interaction.locale })}` : `🔕${client.language({ textId: `Выключено`, guildId: interaction.guildId, locale: interaction.locale })}`, value: `roleIncomeMention`
                },
                {
                    emoji: client.config.emojis.invite, label: `${client.language({ textId: `Упоминание о заходе приглашенного`, guildId: interaction.guildId, locale: interaction.locale })}`, description: profile.inviteJoinMention ? `🔔${client.language({ textId: `Включено`, guildId: interaction.guildId, locale: interaction.locale })}` : `🔕${client.language({ textId: `Выключено`, guildId: interaction.guildId, locale: interaction.locale })}`, value: `inviteJoinMention`
                },
                {
                    emoji: client.config.emojis.invite, label: `${client.language({ textId: `Упоминание о выходе приглашенного`, guildId: interaction.guildId, locale: interaction.locale })}`, description: profile.inviteLeaveMention ? `🔔${client.language({ textId: `Включено`, guildId: interaction.guildId, locale: interaction.locale })}` : `🔕${client.language({ textId: `Выключено`, guildId: interaction.guildId, locale: interaction.locale })}`, value: `inviteLeaveMention`
                }
            ]
            if (interaction.customId.includes("edit")) {
                return interaction.update({ 
                    embeds: [embed], 
                    components: [
                        new ActionRowBuilder()
                            .addComponents([
                                new StringSelectMenuBuilder()
                                    .setCustomId(`usr{${interaction.user.id}}cmd{profile}mbr{${member.user.id}}mentions edit`)
                                    .setOptions(selectMenuOptions).setMaxValues(selectMenuOptions.length)
                                    .setPlaceholder(`${client.language({ textId: `Упоминания...`, guildId: interaction.guildId, locale: interaction.locale })}`)
                            ])
                    ]
                })
            } else {
                return interaction.reply({ 
                    embeds: [embed], 
                    components: [
                        new ActionRowBuilder()
                            .addComponents([
                                new StringSelectMenuBuilder()
                                    .setCustomId(`usr{${interaction.user.id}}cmd{profile}mbr{${member.user.id}}mentions edit`)
                                    .setOptions(selectMenuOptions).setMaxValues(selectMenuOptions.length)
                                    .setPlaceholder(`${client.language({ textId: `Упоминания...`, guildId: interaction.guildId, locale: interaction.locale })}`)
                            ])
                    ],
                    flags: ["Ephemeral"]
                })
            }
            
        }
        if (interaction.isChatInputCommand()) await interaction.deferReply({ flags })
        if (interaction.isButton() && interaction.customId.includes("like")) {
            if (interaction.user.id === member.user.id || profile.usersWhoLiked?.includes(interaction.user.id)) return interaction.deferUpdate()
            profile.profileLikes ++
            if (!profile.usersWhoLiked) profile.usersWhoLiked = []
            profile.usersWhoLiked.push(interaction.user.id)
            await profile.save()
            return member.send({ embeds: [
                new EmbedBuilder()
                    .setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL() })
                    .setThumbnail(interaction.member.displayAvatarURL())
                    .setDescription(`${interaction.member.displayName} ${client.language({ textId: `лайкнул твой профиль`, guildId: interaction.guildId })}`)
                    .setColor(3093046)
            ] }).catch(e => null)
        }
        if (member.user.bot || (profile.isHiden && interaction.user.id !== profile.userID && !interaction.member.permissions.has("Administrator"))) {
            const container = new ContainerBuilder()
                .setAccentColor(hex2rgb(member.displayHexColor))
            const section = new SectionBuilder()
                .addTextDisplayComponents(new TextDisplayBuilder().setContent(`${member.displayName} | ${client.language({ textId: `Профиль`, guildId: interaction.guildId, locale: interaction.locale })}`))
            try {
                section.setThumbnailAccessory(ThumbnailBuilder => ThumbnailBuilder.setURL(profile.thumbnail || member.displayAvatarURL()))
            } catch (err) {
                section.setThumbnailAccessory(ThumbnailBuilder => ThumbnailBuilder.setURL(member.displayAvatarURL()))
            }
            container.addSectionComponents(section)
            container.addSeparatorComponents(separator => separator.setSpacing(SeparatorSpacingSize.Large))
            container.addTextDisplayComponents(new TextDisplayBuilder().setContent(`${client.config.emojis.block} ${client.language({ textId: `Профиль скрыт`, guildId: interaction.guildId, locale: interaction.locale })}`))
            if (interaction.replied || interaction.deferred) return interaction.editReply({ components: [container], flags: [MessageFlags.IsComponentsV2] })
            else return interaction.reply({ components: [container], flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2] })
        }
        const settings = client.cache.settings.get(interaction.guildId)
        ms = require(`ms`)
        let birthday = ``
        if (profile.birthday_day && profile.birthday_month) {
            const convertedDay = convert(profile.birthday_day)
            const convertedMonth = convert(profile.birthday_month)
            birthday = `\n${client.language({ textId: `Дата рождения`, guildId: interaction.guildId, locale: interaction.locale })}: ${convertedDay}/${convertedMonth}`
        }
        if (profile.birthday_year) birthday = `${birthday}/${profile.birthday_year}・${Math.floor((Date.now() - new Date(profile.birthday_year, (profile.birthday_month - 1), profile.birthday_day))/1000/60/60/24/365.25)} ${client.language({ textId: `years old`, guildId: interaction.guildId, locale: interaction.locale })}`
        let menu_options = [
            { emoji: client.config.emojis.profile, label: `${client.language({ textId: `Профиль`, guildId: interaction.guildId, locale: interaction.locale })}`, value: `usr{${interaction.user.id}}cmd{profile}mbr{${member.user.id}}`, description: `${client.language({ textId: `Ваш личный профиль`, guildId: interaction.guildId, locale: interaction.locale })}`, default: true },
            { emoji: client.config.emojis.profile, label: `${client.language({ textId: `Статистика`, guildId: interaction.guildId, locale: interaction.locale })}`, value: `usr{${interaction.user.id}}cmd{stats}mbr{${member.user.id}}${flags.includes(MessageFlags.IsComponentsV2) ? "eph reply" : ""}`, description: `${client.language({ textId: `Ваша статистика`, guildId: interaction.guildId, locale: interaction.locale })}` },
            { emoji: client.config.emojis.inventory, label: `${client.language({ textId: `Инвентарь`, guildId: interaction.guildId, locale: interaction.locale })}`, value: `usr{${interaction.user.id}}cmd{inventory}lim{15}mbr{${member.user.id}}${!flags.includes(MessageFlags.IsComponentsV2) ? "eph reply" : ""}`, description: `${client.language({ textId: `Ваш инвентарь с предметами`, guildId: interaction.guildId, locale: interaction.locale })}` },
            { emoji: `${client.config.emojis.roles}`, label: `${client.language({ textId: "Инвентарь ролей", guildId: interaction.guildId, locale: interaction.locale })}`, value: `usr{${interaction.user.id}}cmd{inventory-roles}lim{50}mbr{${member.user.id}}${flags.includes(MessageFlags.IsComponentsV2) ? "eph reply" : ""}`, description: `${client.language({ textId: "Ваш инвентарь с ролями", guildId: interaction.guildId, locale: interaction.locale })}` },
            { emoji: client.config.emojis.invite, label: `${client.language({ textId: `Приглашения`, guildId: interaction.guildId, locale: interaction.locale })}`, value: `usr{${interaction.user.id}}cmd{invites}lim{10}mbr{${member.user.id}}${flags.includes(MessageFlags.IsComponentsV2) ? "eph reply" : ""}`, description: `${client.language({ textId: `Ваши приглашения`, guildId: interaction.guildId, locale: interaction.locale })}` },
            { emoji: client.config.emojis.shop, label: `${settings.shopName ? settings.shopName.slice(0, 100) : client.language({ textId: `Магазин`, guildId: interaction.guildId, locale: interaction.locale }) }`, value: `usr{${interaction.user.id}}cmd{shop}lim{10}mbr{${member.user.id}}${flags.includes(MessageFlags.IsComponentsV2) ? "eph reply" : ""}`, description: `${client.language({ textId: `Магазин сервера`, guildId: interaction.guildId, locale: interaction.locale })}` },
            { emoji: client.config.emojis.achievements, label: `${client.language({ textId: `Достижения`, guildId: interaction.guildId, locale: interaction.locale })}`, value: `usr{${interaction.user.id}}cmd{achievements}lim{10}mbr{${member.user.id}}${flags.includes(MessageFlags.IsComponentsV2) ? "eph reply" : ""}`, description: `${client.language({ textId: `Ваши достижения`, guildId: interaction.guildId, locale: interaction.locale })}` },
            { emoji: client.config.emojis.quests, label: `${client.language({ textId: `Квесты`, guildId: interaction.guildId, locale: interaction.locale })}`, value: `usr{${interaction.user.id}}cmd{quests}mbr{${member.user.id}}${flags.includes(MessageFlags.IsComponentsV2) ? "eph reply" : ""}`, description: `${client.language({ textId: `Просмотр квестов`, guildId: interaction.guildId, locale: interaction.locale })}` }
        ]
        const menuOptions_options = []
        if (member.user.id === interaction.user.id) {
            menuOptions_options.push(
                { emoji: client.config.emojis.edit, label: `${client.language({ textId: `Изменить описание`, guildId: interaction.guildId, locale: interaction.locale })}`, value: `usr{${interaction.user.id}}cmd{profile} description mbr{${member.user.id}}`, description: profile.description ? profile.description.slice(0, 99) : undefined },
                { emoji: client.config.emojis.edit, label: `${client.language({ textId: `Изменить баннер`, guildId: interaction.guildId, locale: interaction.locale })}`, value: `usr{${interaction.user.id}}cmd{profile} banner mbr{${member.user.id}}` },
                { emoji: client.config.emojis.edit, label: `${client.language({ textId: `Изменить дату рождения`, guildId: interaction.guildId, locale: interaction.locale })}`, value: `usr{${interaction.user.id}}cmd{profile} birthday mbr{${member.user.id}}`, description: profile.birthday_day ? birthday : undefined },
                { emoji: client.config.emojis.VK, label: `${client.language({ textId: `Ссылка`, guildId: interaction.guildId, locale: interaction.locale })} VK`, value: `usr{${interaction.user.id}}cmd{profile} VK mbr{${member.user.id}}`, description: profile.links?.VK || undefined },
                { emoji: client.config.emojis.TikTok, label: `${client.language({ textId: `Ссылка`, guildId: interaction.guildId, locale: interaction.locale })} TikTok`, value: `usr{${interaction.user.id}}cmd{profile} TikTok mbr{${member.user.id}}`, description: profile.links?.TikTok || undefined },
                { emoji: client.config.emojis.Instagram, label: `${client.language({ textId: `Ссылка`, guildId: interaction.guildId, locale: interaction.locale })} Instagram`, value: `usr{${interaction.user.id}}cmd{profile} Instagram mbr{${member.user.id}}`, description: profile.links?.Instagram || undefined },
                { emoji: client.config.emojis.Steam, label: `${client.language({ textId: `Ссылка`, guildId: interaction.guildId, locale: interaction.locale })} Steam`, value: `usr{${interaction.user.id}}cmd{profile} Steam mbr{${member.user.id}}`, description: profile.links?.Steam || undefined },
                { emoji: client.config.emojis.watch, label: `${profile.joinDateIsHiden ? `${client.language({ textId: `Отобразить дату вступления`, guildId: interaction.guildId, locale: interaction.locale })}` : `${client.language({ textId: `Скрыть дату вступления`, guildId: interaction.guildId, locale: interaction.locale })}`}`, value: `usr{${interaction.user.id}}cmd{profile} joinDate mbr{${member.user.id}}` },
                { emoji: client.config.emojis.achievements, label: `${profile.achievementsHiden ? `${client.language({ textId: `Отобразить достижения`, guildId: interaction.guildId, locale: interaction.locale })}` : `${client.language({ textId: `Скрыть достижения`, guildId: interaction.guildId, locale: interaction.locale })}`}`, value: `usr{${interaction.user.id}}cmd{profile} achievementsHide mbr{${member.user.id}}` },
                { emoji: client.config.emojis.gender, label: `${profile.sexHide ? `${client.language({ textId: `Отобразить гендер`, guildId: interaction.guildId, locale: interaction.locale })}` : `${client.language({ textId: `Скрыть гендер`, guildId: interaction.guildId, locale: interaction.locale })}`}`, value: `usr{${interaction.user.id}}cmd{profile} sexHide mbr{${member.user.id}}` },
                { emoji: client.config.emojis.trophies, label: `${profile.trophyHide ? `${client.language({ textId: `Отобразить трофеи`, guildId: interaction.guildId, locale: interaction.locale })}` : `${client.language({ textId: `Скрыть трофеи`, guildId: interaction.guildId, locale: interaction.locale })}`}`, value: `usr{${interaction.user.id}}cmd{profile} trophyHide mbr{${member.user.id}}` },
                { emoji: client.config.emojis.profile, label: `${profile.isHiden ? `${client.language({ textId: `Открыть профиль`, guildId: interaction.guildId, locale: interaction.locale })}` : `${client.language({ textId: `Скрыть профиль`, guildId: interaction.guildId, locale: interaction.locale })}`}`, value: `usr{${interaction.user.id}}cmd{profile} isHiden mbr{${member.user.id}}` },
                { emoji: client.config.emojis.profile, label: `${globalUser?.lastOnlineHiden ? `${client.language({ textId: `Открыть последнюю активность`, guildId: interaction.guildId, locale: interaction.locale })}` : `${client.language({ textId: `Скрыть последнюю активность`, guildId: interaction.guildId, locale: interaction.locale })}`}`, value: `usr{${interaction.user.id}}cmd{profile} lastOnlineHide mbr{${member.user.id}}` },
                { emoji: client.config.emojis.ring, label: `${client.language({ textId: `Настройка упоминаний`, guildId: interaction.guildId, locale: interaction.locale })}`, value: `usr{${interaction.user.id}}cmd{profile} mentions mbr{${member.user.id}}` },
            )
        }
        let second_row 
        if (menuOptions_options.length) second_row = new ActionRowBuilder().addComponents([new StringSelectMenuBuilder().setCustomId(`usr{${interaction.user.id}}mbr{${member.user.id}}profile-settings`).addOptions(menuOptions_options).setPlaceholder(`⚙️${client.language({ textId: `Настройки профиля`, guildId: interaction.guildId, locale: interaction.locale })}`)])
        if (member.user.id !== interaction.user.id) {
            menu_options = [
                { emoji: client.config.emojis.profile, label: `${client.language({ textId: `Профиль`, guildId: interaction.guildId, locale: interaction.locale })}`, value: `usr{${interaction.user.id}}cmd{profile}mbr{${member.user.id}}`, description: `${client.language({ textId: `Личный профиль`, guildId: interaction.guildId, locale: interaction.locale })} ${member.displayName}`, default: true },
                { emoji: client.config.emojis.profile, label: `${client.language({ textId: `Статистика`, guildId: interaction.guildId, locale: interaction.locale })}`, value: `usr{${interaction.user.id}}cmd{stats}mbr{${member.user.id}}${flags.includes(MessageFlags.IsComponentsV2) ? "eph reply" : ""}`, description: `${client.language({ textId: `Статистика`, guildId: interaction.guildId, locale: interaction.locale })} ${member.displayName}` },
                { emoji: client.config.emojis.inventory, label: `${client.language({ textId: `Инвентарь`, guildId: interaction.guildId, locale: interaction.locale })}`, value: `usr{${interaction.user.id}}cmd{inventory}lim{15}mbr{${member.user.id}}${!flags.includes(MessageFlags.IsComponentsV2) ? "eph reply" : ""}`, description: `${client.language({ textId: `Инвентарь с предметами`, guildId: interaction.guildId, locale: interaction.locale })} ${member.displayName}` },
                { emoji: client.config.emojis.roles, label: `${client.language({ textId: `Инвентарь ролей`, guildId: interaction.guildId, locale: interaction.locale })}`, value: `usr{${interaction.user.id}}cmd{inventory-roles}lim{50}mbr{${member.user.id}}${flags.includes(MessageFlags.IsComponentsV2) ? "eph reply" : ""}`, description: `${client.language({ textId: `Инвентарь с ролями`, guildId: interaction.guildId, locale: interaction.locale })} ${member.displayName}` },
                { emoji: client.config.emojis.invite, label: `${client.language({ textId: `Приглашение`, guildId: interaction.guildId, locale: interaction.locale })}`, value: `usr{${interaction.user.id}}cmd{invites}lim{10}mbr{${member.user.id}}${flags.includes(MessageFlags.IsComponentsV2) ? "eph reply" : ""}`, description: `${client.language({ textId: `Приглашения`, guildId: interaction.guildId, locale: interaction.locale })} ${member.displayName}` },
                { emoji: client.config.emojis.achievements, label: `${client.language({ textId: `Достижения`, guildId: interaction.guildId, locale: interaction.locale })}`, value: `usr{${interaction.user.id}}cmd{achievements}lim{10}mbr{${member.user.id}}${flags.includes(MessageFlags.IsComponentsV2) ? "eph reply" : ""}`, description: `${client.language({ textId: `Достижения`, guildId: interaction.guildId, locale: interaction.locale })} ${member.displayName}` },
                { emoji: client.config.emojis.quests, label: `${client.language({ textId: `Квесты`, guildId: interaction.guildId, locale: interaction.locale })}`, value: `usr{${interaction.user.id}}cmd{quests}mbr{${member.user.id}}${flags.includes(MessageFlags.IsComponentsV2) ? "eph reply" : ""}`, description: `${client.language({ textId: `Просмотр квестов`, guildId: interaction.guildId, locale: interaction.locale })} ${member.displayName}` },
            ]
            if (profile.achievementsHiden && !interaction.member.permissions.has("Administrator")) menu_options = menu_options.filter(e => e.value !== `usr{${interaction.user.id}}cmd{achievements}lim{10}mbr{${member.user.id}}`)
        }
        const achievementsMemberSince = client.cache.achievements.filter(e => e.guildID === interaction.guildId && e.type === AchievementType.MemberSince && e.enabled)
        await Promise.all(achievementsMemberSince.map(async achievement => {
            if (!profile.achievements?.some(ach => ach.achievmentID === achievement.id) && Date.now() - member.joinedTimestamp >= achievement.amount * 60 * 1000 && !client.tempAchievements[profile.userID]?.includes(achievement.id)) {
                if (!client.tempAchievements[profile.userID]) client.tempAchievements[profile.userID] = []
                client.tempAchievements[profile.userID].push(achievement.id)
                await profile.addAchievement(achievement, true)
            }    
        }))
        const components = []
        let achArr = []
        let achCount = 0
        const achievements = client.cache.achievements.filter(e => e.guildID === interaction.guildId && e.enabled).map(e => e)
        if (!profile.achievementsHiden) {
            if (achievements.length > 0) {
                let a = achievements.length < 11 ? achievements.length : 11
                for (let i = 0; i < a; i++) {
                    if (profile.achievements?.some(e => e.achievmentID == achievements[i].id)) {
                        let combo = `> ${client.config.emojis.YES} ` + achievements[i].displayEmoji + achievements[i].name
                        achArr.push(combo)
                    } else {
                        let combo = `> ${client.config.emojis.NO} ` + achievements[i].displayEmoji + achievements[i].name
                        achArr.push(combo)
                    }
                }
                for (let i = 0; i < achievements.length; i++) {
                    if (profile.achievements?.some(e => e.achievmentID == achievements[i].id)) {
                        achCount++
                    }
                }
                if (achievements.length > 11) achArr.push(`> *... ${client.language({ textId: `и еще`, guildId: interaction.guildId, locale: interaction.locale })} ${achievements.length - a}*`)
                achArr = achArr.join(`\n`)
            }
        }
        const first_row = new ActionRowBuilder().addComponents([new StringSelectMenuBuilder().setCustomId(`usr{${interaction.user.id}}mbr{${member.user.id}}profile-menu`).addOptions(menu_options)])
        components.push(first_row, second_row)    
        let bonusXP
        let bonusCUR
        let bonusLuck
        let bonusRP
        let premium
        let marry
        let gender
        const fetchedUser = await member.user.fetch().catch(e => null)
        embed.setColor(member.displayHexColor)
        let activities = []
        if (member.presence) {
            for (const activity of member.presence.activities) {
                const transformedActivity = transformActivity(client, interaction.guildId, interaction.locale, activity)
                activities.push(transformedActivity)
            }    
        }
        if (profile.getXpBoost()) bonusXP = `${booster(client.config, profile.getXpBoost())} ${client.language({ textId: `к`, guildId: interaction.guildId, locale: interaction.locale })} ${client.config.emojis.XP} ${profile.getXpBoost() ? `${client.language({ textId: `until`, guildId: interaction.guildId, locale: interaction.locale })} <t:${Math.floor(profile.getXpBoostTime() / 1000)}>` : ""}`
        if (profile.getCurBoost()) bonusCUR = `${booster(client.config, profile.getCurBoost())} ${client.language({ textId: `к`, guildId: interaction.guildId, locale: interaction.locale })} ${settings.displayCurrencyEmoji} ${profile.getCurBoostTime() ? `${client.language({ textId: `until`, guildId: interaction.guildId, locale: interaction.locale })} <t:${Math.floor(profile.getCurBoostTime() / 1000)}>` : ""}`
        if (profile.getLuckBoost()) bonusLuck = `${booster(client.config, profile.getLuckBoost())} ${client.language({ textId: `к`, guildId: interaction.guildId, locale: interaction.locale })} ${client.config.emojis.random} ${profile.getLuckBoostTime() ? `${client.language({ textId: `until`, guildId: interaction.guildId, locale: interaction.locale })} <t:${Math.floor(profile.getLuckBoostTime() / 1000)}>` : ""}`
        if (profile.getRpBoost()) bonusRP = `${booster(client.config, profile.getRpBoost())} ${client.language({ textId: `к`, guildId: interaction.guildId, locale: interaction.locale })} ${client.config.emojis.RP} ${profile.getRpBoostTime() ? `${client.language({ textId: `until`, guildId: interaction.guildId, locale: interaction.locale })} <t:${Math.floor(profile.getRpBoostTime() / 1000)}>` : ""}`
        if (member.premiumSince) premium = `${boosterEmoji}${client.language({ textId: `Бустит сервер с`, guildId: interaction.guildId, locale: interaction.locale })} <t:${Math.floor(member.premiumSince.valueOf() / 1000)}>`
        if (profile.marry) marry = `${client.config.emojis.purplebutterflies} ${client.language({ textId: `В браке с`, guildId: interaction.guildId, locale: interaction.locale })} <@${profile.marry}> ${profile.marryDate ? `${client.language({ textId: `since`, guildId: interaction.guildId, locale: interaction.locale })} <t:${Math.floor(profile.marryDate/1000)}:d>` : ""}`
        embed.setTitle(`${member.displayName}\n${client.language({ textId: `Уровень`, guildId: interaction.guildId, locale: interaction.locale })} 🎖${profile.level}${settings.seasonLevelsEnabled ? `\n${client.language({ textId: `Сезонный уровень`, guildId: interaction.guildId, locale: interaction.locale })} ${client.config.emojis.seasonLevel}${profile.seasonLevel}` : ""}`)
        if (member.user.id === interaction.user.id || interaction.member.permissions.has("Administrator") || interaction.member.permissions.has("ManageGuild")) embed.setURL(`https://wetbot.space/guilds/${interaction.guildId}/profiles/${member.user.id}`)
        const status = !member.presence || member.presence.status === "offline" ? (globalUser?.lastOnlineHiden) || !globalUser || !globalUser.lastOnline ? `🔴${client.language({ textId: `offline`, guildId: interaction.guildId, locale: interaction.locale })}` : `${client.config.emojis[`offline_${globalUser.device}`]}${client.language({ textId: `Был в сети`, guildId: interaction.guildId, locale: interaction.locale })} <t:${globalUser.lastOnline}:R>` : `${client.config.emojis[`${member.presence.status}_${Object.keys(member.presence.clientStatus)[0]}`]} ${client.language({ textId: member.presence.status, guildId: interaction.guildId, locale: interaction.locale })}`
        if (profile.sex && !profile.hideSex) gender = `${client.config.emojis[profile.sex]}${client.language({ textId: profile.sex, guildId: interaction.guildId, locale: interaction.locale })}`
        const description = [
            status,
            activities.join("\n"),
            bonusXP,
            bonusCUR,
            bonusLuck,
            bonusRP,
            premium,
            marry,
            gender,
            profile.autoIncomeExpire ? `${client.language({ textId: `Авто доход ролей до`, guildId: interaction.guildId, locale: interaction.locale })} <t:${Math.floor(profile.autoIncomeExpire/1000)}:f>` : undefined,
            `${client.config.emojis.mic}${(+profile.hours.toFixed(1)).toLocaleString()} ${client.config.emojis.message}${profile.messages.toLocaleString()} ${settings.displayCurrencyEmoji}${Math.floor(profile.currency).toLocaleString()} ${client.config.emojis.heart}${profile.likes.toLocaleString()}`
        ]
        embed.setDescription(description.filter(e => e).join("\n"))

        const container = new ContainerBuilder().setAccentColor(hex2rgb(member.displayHexColor))
        const text1 = new TextDisplayBuilder().setContent([
            member.displayName,
            `${client.language({ textId: `Уровень`, guildId: interaction.guildId, locale: interaction.locale })} 🎖${profile.level}`,
            `${settings.seasonLevelsEnabled ? `${client.language({ textId: `Сезонный уровень`, guildId: interaction.guildId, locale: interaction.locale })} ${client.config.emojis.seasonLevel}${profile.seasonLevel}` : ""}`,
            description.filter(e => e).join("\n")
        ].join("\n"))
        if (!profile.thumbnailHidden) {
            try {
                container.addSectionComponents(new SectionBuilder().addTextDisplayComponents(text1).setThumbnailAccessory(ThumbnailBuilder => ThumbnailBuilder.setURL(profile.thumbnail || member.displayAvatarURL())))
            }
            catch (err) {
                container.addSectionComponents(new SectionBuilder().addTextDisplayComponents(text1).setThumbnailAccessory(ThumbnailBuilder => ThumbnailBuilder.setURL(member.displayAvatarURL())))
            }
        } else {
            container.addTextDisplayComponents(text1)
        }
        container.addSeparatorComponents(separator => separator.setSpacing(SeparatorSpacingSize.Large))
        const mainContent = []
        if (!profile.bioHidden && profile.bio) {
            const text = profile.bio.replace(/\\n/g,`\n`)
            mainContent.push([`### ${client.language({ textId: `Информация`, guildId: interaction.guildId, locale: interaction.locale })}:`, text.slice(0, 1011)].join("\n"))
            embed.addFields([{ name: `${client.language({ textId: `Информация`, guildId: interaction.guildId, locale: interaction.locale })}:`, value: `${text.slice(0, 1011)}` }])
        }
        if (!profile.socialLinksHidden && (profile.vk || profile.tiktok || profile.instagram || profile.steam)) {
            const socials = []
            if (profile.vk) socials.push(`${client.config.emojis.VK} ${profile.vk}`)
            if (profile.tiktok) socials.push(`${client.config.emojis.TikTok} ${profile.tiktok}`)
            if (profile.instagram) socials.push(`${client.config.emojis.Instagram} ${profile.instagram}`)
            if (profile.steam) socials.push(`${client.config.emojis.Steam} ${profile.steam}`)
            mainContent.push([`### ${client.language({ textId: `Социальные сети`, guildId: interaction.guildId, locale: interaction.locale })}:`, socials.join("\n")].join("\n"))
            embed.addFields([{ name: `${client.language({ textId: `Социальные сети`, guildId: interaction.guildId, locale: interaction.locale })}:`, value: socials.join("\n") }])    
        }
        if (profile.trophies?.length && !profile.trophyHide) {
            mainContent.push([`### ${client.language({ textId: `Трофеи`, guildId: interaction.guildId, locale: interaction.locale })}:`, profile.trophies.join(`\n`)].join("\n"))
            embed.addFields([{ name: `${client.language({ textId: `Трофеи`, guildId: interaction.guildId, locale: interaction.locale })}:`, value: profile.trophies.join(`\n`) }])
        }
        try {
            if (!profile.thumbnailHidden) embed.setThumbnail(profile.thumbnail || member.displayAvatarURL())
        } catch (err) {

        }
        if (mainContent.length) {
            container.addTextDisplayComponents(new TextDisplayBuilder().setContent(mainContent.join("\n")))
            container.addSeparatorComponents(separator => separator.setSpacing(SeparatorSpacingSize.Large))    
        }
        if (!profile.rolesHidden && member.roles.cache.filter(e => e.name !== "@everyone").size) {
            const button = new ButtonBuilder()
                .setCustomId(`cmd{inventory-roles}usr{${interaction.user.id}}mbr{${member.user.id}}eph reply`)
                .setEmoji(client.config.emojis.roles)
                .setLabel(`${client.language({ textId: `Инвентарь ролей`, guildId: interaction.guildId, locale: interaction.locale })}`)
                .setStyle(ButtonStyle.Secondary)
            const maxRoles = 10
            const roles = member.roles.cache.filter(e => e.name !== "@everyone").sort((role1, role2) => role2.position - role1.position)
            container.addSectionComponents(new SectionBuilder().setButtonAccessory(button).addTextDisplayComponents(new TextDisplayBuilder().setContent([
                `### ${client.language({ textId: `Роли`, guildId: interaction.guildId, locale: interaction.locale })}:`, roles.first(maxRoles).map(role => `<@&${role.id}>`).join(" ") + `${roles.size > maxRoles ? ` _${client.language({ textId: `и еще`, guildId: interaction.guildId, locale: interaction.locale })} ${roles.size - maxRoles}..._`: ""}`,
            ].join("\n"))))
            embed.addFields([{
                name: `${client.language({ textId: `Роли`, guildId: interaction.guildId, locale: interaction.locale })}`,
                value: roles.first(maxRoles).map(role => `<@&${role.id}>`).join(" ") + `${roles.size > maxRoles ? ` _${client.language({ textId: `и еще`, guildId: interaction.guildId, locale: interaction.locale })} ${roles.size - maxRoles}..._`: ""}`
            }])
        }
        if (!profile.achievementsHiden && achArr.length) {
            const button = new ButtonBuilder()
                .setCustomId(`cmd{achievements}usr{${interaction.user.id}}mbr{${member.user.id}}eph reply`)
                .setEmoji(client.config.emojis.achievements)
                .setLabel(`${client.language({ textId: `Все достижения`, guildId: interaction.guildId, locale: interaction.locale })}`)
                .setStyle(ButtonStyle.Secondary)
            container.addSectionComponents(new SectionBuilder().setButtonAccessory(button).addTextDisplayComponents(new TextDisplayBuilder().setContent([
                `### ${client.language({ textId: `Достижения`, guildId: interaction.guildId, locale: interaction.locale })} (${achCount}/${achievements.length}):`,
                achArr
            ].join("\n"))))
            embed.addFields([{ name: `${client.language({ textId: `Достижения`, guildId: interaction.guildId, locale: interaction.locale })} (${achCount}/${achievements.length}):`, value: achArr }])
        }
        if (!profile.bannerHidden && (profile.image || fetchedUser?.bannerURL({ size: 4096 }))) {
            try {
                container.addMediaGalleryComponents(MediaGalleryBuilder => MediaGalleryBuilder.addItems(MediaGalleryItemBuilder => MediaGalleryItemBuilder.setURL(profile.image || fetchedUser?.bannerURL({ size: 4096 }))))
                embed.setImage(profile.image || fetchedUser?.bannerURL({ size: 4096 }) || undefined)
            } catch (err) {
                if (fetchedUser?.bannerURL({ size: 4096 })) container.addMediaGalleryComponents(MediaGalleryBuilder => MediaGalleryBuilder.addItems(MediaGalleryItemBuilder => MediaGalleryItemBuilder.setURL(fetchedUser?.bannerURL({ size: 4096 }))))
            }
        }
        let footerText = ""
        const footerContent = []
        if (!profile.joinDateIsHiden) {
            footerContent.push(`-# ${client.language({ textId: `Member since`, guildId: interaction.guildId, locale: interaction.locale })} ${format(member.joinedAt, 'DD/MM/YYYY')}`)
            footerText += `${client.language({ textId: `Member since`, guildId: interaction.guildId, locale: interaction.locale })} ${format(member.joinedAt, 'DD/MM/YYYY')}`
        }
        if (!profile.birthdateHidden && profile.birthday_day !== undefined && profile.birthday_month !== undefined && profile.birthday_year !== undefined) {
            if (!profile.birthYearHidden) {
                footerContent.push(`-# ${`${client.language({ textId: `Дата рождения`, guildId: interaction.guildId, locale: interaction.locale })}: ${convert(profile.birthday_day)}/${convert(profile.birthday_month)}`}/${profile.birthday_year}・${Math.floor((Date.now() - new Date(profile.birthday_year, (profile.birthday_month - 1), profile.birthday_day))/1000/60/60/24/365.25)} ${client.language({ textId: `years old`, guildId: interaction.guildId, locale: interaction.locale })}`)
                footerText += `${`\n${client.language({ textId: `Дата рождения`, guildId: interaction.guildId, locale: interaction.locale })}: ${convert(profile.birthday_day)}/${convert(profile.birthday_month)}`}/${profile.birthday_year}・${Math.floor((Date.now() - new Date(profile.birthday_year, (profile.birthday_month - 1), profile.birthday_day))/1000/60/60/24/365.25)} ${client.language({ textId: `years old`, guildId: interaction.guildId, locale: interaction.locale })}`
            }
            else {
                footerContent.push(`-# ${client.language({ textId: `Дата рождения`, guildId: interaction.guildId, locale: interaction.locale })}: ${convert(profile.birthday_day)}/${convert(profile.birthday_month)}`)
                footerText += `${`\n${client.language({ textId: `Дата рождения`, guildId: interaction.guildId, locale: interaction.locale })}: ${convert(profile.birthday_day)}/${convert(profile.birthday_month)}`}`
            }
        }
        if (footerText.length) {
            embed.setFooter({ iconURL: interaction.guild.iconURL(), text: footerText })
        }
        if (footerContent.length) {
            container.addTextDisplayComponents(new TextDisplayBuilder().setContent(footerContent.join("\n")))
        }
        let close_row = new ActionRowBuilder()
        close_row.addComponents(new ButtonBuilder().setStyle(ButtonStyle.Secondary).setCustomId(`cmd{profile}usr{${interaction.user.id}}mbr{${member.user.id}}like`).setEmoji(client.config.emojis.heart).setLabel(`${profile.profileLikes}`).setDisabled(interaction.user.id === member.user.id || (profile.usersWhoLiked || []).includes(interaction.user.id)))
        if (!flags.includes("Ephemeral")) {
            const close_btn = new ButtonBuilder()
                .setStyle(ButtonStyle.Secondary)
                .setEmoji(client.config.emojis.close)
                .setCustomId(`usr{${interaction.user.id}} close`)
            close_row.addComponents(close_btn)
        }
        if (close_row.components.length) components.push(close_row)
        container.addActionRowComponents(components)    
        const embeds = []
        if (!flags.includes(MessageFlags.IsComponentsV2)) {
            embeds.push(embed)
        }
        if (interaction.customId?.includes("reply") || interaction.values?.[0].includes("reply") || interaction.isContextMenuCommand()) {
            return interaction.reply({ embeds, components: flags.includes(MessageFlags.IsComponentsV2) ? [container] : components, flags })
        }
        if (interaction.isChatInputCommand()) return interaction.editReply({ embeds, components: flags.includes(MessageFlags.IsComponentsV2) ? [container] : components, flags })
        return interaction.update({ embeds, components: flags.includes(MessageFlags.IsComponentsV2) ? [container] : components })
    }
}
function convert(number){
    const converted = number.toString()
    const length = converted.length
    return length == `1` ? `0${converted}` : converted
}
function booster(config, number){
    return `${number < 0 ? config.emojis.DOWN : config.emojis.UP}${number * 100}%`
}
function transformActivity(client, guildId, locale, activity) {
    return activity.type === ActivityType.Playing 
    ? `🎮${client.language({ textId: "Играет", guildId: guildId, locale: locale })} ${activity.name}` 
    : activity.type === ActivityType.Streaming
    ? `🎥${client.language({ textId: "Стримит", guildId: guildId, locale: locale })} ${activity.state}` 
    : activity.type === ActivityType.Listening
    ? `🎧${client.language({ textId: "Слушает", guildId: guildId, locale: locale })} ${activity.state} - ${activity.details}`
    : activity.type === ActivityType.Watching
    ? `📺${client.language({ textId: "Смотрит", guildId: guildId, locale: locale })} ${activity.state}`
    : activity.type === ActivityType.Competing
    ?  `${client.language({ textId: "Соревнуется", guildId: guildId, locale: locale })} ${activity.name}`
    : `${activity.emoji ? activity.emoji : ""}${activity.state || ""}`
}
function hex2rgb(color) {
    const r = color.match(/^#(([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2}))$/i)
    if (!r) return [0, 0, 0]
    return [parseInt(r[2], 16), 
            parseInt(r[3], 16), 
            parseInt(r[4], 16)]
}