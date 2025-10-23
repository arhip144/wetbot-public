const { ChannelType, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, ActionRowBuilder, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, Collection, InteractionType, PermissionFlagsBits, RoleSelectMenuBuilder, ChannelSelectMenuBuilder, LabelBuilder } = require("discord.js")
const UserRegexp = /usr{(.*?)}/
const TitleRegexp = /title{(.*?)}/
const MarkRegexp = /mark{(.*?)}/
const { v4: uuidv4 } = require("uuid")
const { RewardType } = require("../enums")
module.exports = {
    name: `manager-settings`,
    nameLocalizations: {
        'ru': `управление-настройками`,
        'uk': `управління-налаштуваннями`,
        'es-ES': `gestión-de-configuraciones`
    },
    description: 'Manage guild settings',
    descriptionLocalizations: {
        'ru': `Управление настройками сервера`,
        'uk': `Управління налаштуваннями сервера`,
        'es-ES': `Gestión de la configuración del servidor`
    },
    defaultMemberPermissions: "Administrator",
    dmPermission: false,
    group: `managers`,
    cooldowns: new Collection(),
    /**
     *
     * @param {Client} client
     * @param {CommandInteraction} interaction
     * @param {String[]} args
     */
    run: async (client, interaction) => {
        const settings = await client.functions.fetchSettings(client, interaction.guildId)
        if (!interaction.isChatInputCommand() && UserRegexp.exec(interaction.customId)?.[1] !== interaction.user.id) return interaction.reply({ content: `${client.config.emojis.NO} ${interaction.member.displayName} ${client.language({ textId: `Не твоя кнопка/меню`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
        const components1 = interaction.message?.components
        if (interaction.isChatInputCommand()) {
            if (!interaction.channel || !interaction.channel.permissionsFor(interaction.guild.members.me).has(PermissionFlagsBits.EmbedLinks) || !interaction.channel.permissionsFor(interaction.guild.members.me).has(PermissionFlagsBits.ViewChannel)) {
                return interaction.reply({ content: `${client.language({ textId: `Для использования этой команды мне нужны следующие права`, guildId: interaction.guildId, locale: interaction.locale })}:\n${client.language({ textId: `1. Просмотр канала`, guildId: interaction.guildId, locale: interaction.locale })}\n${client.language({ textId: `2. Встраивать ссылки`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
            }
            await interaction.deferReply()
        }
        const filter = m => m.author.id == interaction.user.id && !m.content.includes("\u200B") && m.content.length > 0 && m.channel.id == interaction.channel.id
        const embed = new EmbedBuilder()
        embed.setAuthor({ name: `${client.language({ textId: `НАСТРОЙКИ`, guildId: interaction.guildId, locale: interaction.locale })}` })
        embed.setColor(3093046)
        if (interaction.customId?.includes("language")) {
            settings.language = interaction.values[0]
            await settings.save()
            const { setLanguage } = require(`../handler/language`)
            setLanguage(interaction.guildId, interaction.values[0])
        }
        const menu_options = [
            { emoji: client.config.emojis.gear, label: `${client.language({ textId: `Просмотр общей информации`, guildId: interaction.guildId, locale: interaction.locale })}`, value: `general`, default: true },
            { emoji: client.config.emojis.brush, label: `${client.language({ textId: `Персонализация`, guildId: interaction.guildId, locale: interaction.locale })}`, value: `customization` },
            { emoji: client.config.emojis.fishing, label: `${client.language({ textId: `Рыбалка`, guildId: interaction.guildId, locale: interaction.locale })}`, value: `fishing` },
            { emoji: client.config.emojis.mining, label: `${client.language({ textId: `Майнинг`, guildId: interaction.guildId, locale: interaction.locale })}`, value: `mining` },
            { emoji: client.config.emojis.shop, label: `${settings.shopName ? settings.shopName.slice(0, 100) : client.language({ textId: `Магазин`, guildId: interaction.guildId, locale: interaction.locale }) }`, value: `shop` },
            { emoji: client.config.emojis.mic, label: `${client.language({ textId: `Каналы`, guildId: interaction.guildId, locale: interaction.locale })}`, value: `channels` },
            { emoji: client.config.emojis.roles, label: `${client.language({ textId: `Роли`, guildId: interaction.guildId, locale: interaction.locale })}`, value: `roles` },
            { emoji: client.config.emojis.coin, label: `${client.language({ textId: `Валюта сервера`, guildId: interaction.guildId, locale: interaction.locale })}`, value: `currency`},
            { emoji: client.config.emojis.giveaway, label: `${client.language({ textId: `Ежедневные награды`, guildId: interaction.guildId, locale: interaction.locale })}`, value: `dailyRewards`},
            { emoji: client.config.emojis.top, label: `${client.language({ textId: `Роли за уровни`, guildId: interaction.guildId, locale: interaction.locale })}`, value: `levelRoles`},
            { emoji: client.config.emojis.premium, label: `${client.language({ textId: `Отчеты о топ лидерах`, guildId: interaction.guildId, locale: interaction.locale })}`, value: `topLeaders`},
            { emoji: client.config.emojis.XP, label: `${client.language({ textId: `Получения валюты, опыта, репутации`, guildId: interaction.guildId, locale: interaction.locale })}`, value: `activities`},
            { emoji: client.config.emojis.premium, label: `${client.language({ textId: `Логи`, guildId: interaction.guildId, locale: interaction.locale })}`, value: `logs`},
            { emoji: client.config.emojis.giveaway, label: `${client.language({ textId: `Стартовый набор`, guildId: interaction.guildId, locale: interaction.locale })}`, value: `startKit` },
            { emoji: client.config.emojis.seasonLevel, label: `${client.language({ textId: `Сезонные уровни`, guildId: interaction.guildId, locale: interaction.locale })}`, value: `seasonLevels` },
            { emoji: client.config.emojis.premium, label: `${client.language({ textId: `Кастомные роли`, guildId: interaction.guildId, locale: interaction.locale })}`, value: `customRoles` },
            { emoji: client.config.emojis.shop, label: `${client.language({ textId: `Настройки маркета`, guildId: interaction.guildId, locale: interaction.locale })}`, value: `marketSettings` },
            { emoji: client.config.emojis.XP100Booster, label: `${client.language({ textId: `Бустеры`, guildId: interaction.guildId, locale: interaction.locale })}`, value: `boosters` },
            { emoji: client.config.emojis.auction, label: `${client.language({ textId: `Аукционы`, guildId: interaction.guildId, locale: interaction.locale })}`, value: `auctions` },
        ]
        const language_options = [
            { emoji: "🇷🇺", label: `Язык: Русский`, value: `ru`, default: settings.language === 'ru' },
            { emoji: "🇬🇧", label: `Language: English`, value: `en-US`, default: settings.language === "en-US" },
            { emoji: "🇪🇸", label: `Idioma: Español`, value: `es-ES`, default: settings.language === "es-ES" },
            { emoji: "🇺🇦", label: `Мова: Українська`, value: `uk`, default: settings.language === "uk" },
        ]
        const lang_row = new ActionRowBuilder().addComponents([new StringSelectMenuBuilder().setCustomId(`cmd{manager-settings} language usr{${interaction.user.id}}`).addOptions(language_options)])
        menu_options.find(e => { return e.default === true}).default = false
        const title = menu_options.find(e => { return e.value == `${interaction.isChatInputCommand() ? "general" : interaction.isStringSelectMenu() && interaction.customId === `cmd{manager-settings}usr{${interaction.user.id}}` ? interaction.values[0] : interaction.customId.includes("language") ? `general` : TitleRegexp.exec(interaction.customId)?.[1]}` })
        if (title) title.default = true
        const first_row = new ActionRowBuilder().addComponents([new StringSelectMenuBuilder().setCustomId(`cmd{manager-settings}usr{${interaction.user.id}}`).addOptions(menu_options)])
        if (interaction.isStringSelectMenu() || interaction.isButton() || interaction.isModalSubmit()) {
            if (interaction.values?.[0].includes("customization") || interaction.customId.includes("customization")) {
                if (interaction.isStringSelectMenu()) {
                    if (interaction.values[0] === "avatar") {
                        if (!interaction.channel.permissionsFor(interaction.guild.members.me).has("ViewChannel") || !interaction.channel.permissionsFor(interaction.guild.members.me).has("ReadMessageHistory")) {
                            return interaction.reply({ content: `${client.config.emojis.NO} ${client.language({ textId: `У меня нет прав для канала`, guildId: interaction.guildId, locale: interaction.locale })} <#${interaction.channel.id}>\n${client.language({ textId: `Мне нужны следующие права`, guildId: interaction.guildId, locale: interaction.locale })}:\n1. ${client.language({ textId: `Просмотр канала`, guildId: interaction.guildId, locale: interaction.locale })}\n2. ${client.language({ textId: `Читать историю сообщений`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
                        }
                        const components = JSON.parse(JSON.stringify(interaction.message.components))
                        await interaction.update({ embeds: interaction.message.embeds, components: [] })
                        const filter = m => m.author.id == interaction.user.id && m.channel.id == interaction.channel.id
                        const message1 = await interaction.followUp({ content: `${client.config.emojis.exc} ${client.language({ textId: `Отправь изображение`, guildId: interaction.guildId, locale: interaction.locale })}. ${client.language({ textId: `Для отмены напиши`, guildId: interaction.guildId, locale: interaction.locale })}: cancel` })
                        const attachment = await waitingForAttachment(client, interaction, filter)
                        message1.delete().catch(e => null)
                        if (attachment) {
                            const fetch = require("node-fetch")
                            const res = await fetch(attachment.url)
                            const buffer = await res.buffer()
                            await interaction.guild.members.editMe({
                                avatar: buffer
                            }).catch(error => {
                                interaction.followUp({ content: `${client.config.emojis.NO}${error.message}`, flags: ["Ephemeral"] })
                            })
                        } else return interaction.editReply({ embeds: interaction.message.embeds, components: components })
                    } else
                    if (interaction.values[0] === "banner") {
                        if (!interaction.channel.permissionsFor(interaction.guild.members.me).has("ViewChannel") || !interaction.channel.permissionsFor(interaction.guild.members.me).has("ReadMessageHistory")) {
                            return interaction.reply({ content: `${client.config.emojis.NO} ${client.language({ textId: `У меня нет прав для канала`, guildId: interaction.guildId, locale: interaction.locale })} <#${interaction.channel.id}>\n${client.language({ textId: `Мне нужны следующие права`, guildId: interaction.guildId, locale: interaction.locale })}:\n1. ${client.language({ textId: `Просмотр канала`, guildId: interaction.guildId, locale: interaction.locale })}\n2. ${client.language({ textId: `Читать историю сообщений`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
                        }
                        const components = JSON.parse(JSON.stringify(interaction.message.components))
                        await interaction.update({ embeds: interaction.message.embeds, components: [] })
                        const filter = m => m.author.id == interaction.user.id && m.channel.id == interaction.channel.id
                        const message1 = await interaction.followUp({ content: `${client.config.emojis.exc} ${client.language({ textId: `Отправь изображение`, guildId: interaction.guildId, locale: interaction.locale })}. ${client.language({ textId: `Для отмены напиши`, guildId: interaction.guildId, locale: interaction.locale })}: cancel` })
                        const attachment = await waitingForAttachment(client, interaction, filter)
                        message1.delete().catch(e => null)
                        if (attachment) {
                            const fetch = require("node-fetch")
                            const res = await fetch(attachment.url)
                            const buffer = await res.buffer()
                            await interaction.guild.members.editMe({
                                banner: buffer
                            }).catch(error => {
                                interaction.followUp({ content: `${client.config.emojis.NO}${error.message}`, flags: ["Ephemeral"] })
                            })
                        } else return interaction.editReply({ embeds: interaction.message.embeds, components: components })
                    } else
                    if (interaction.values[0] === "bio") {
                        const modal = new ModalBuilder()
                            .setCustomId(`bio_${interaction.id}`)
                            .setTitle(`${client.language({ textId: `Изменить информацию`, guildId: interaction.guildId, locale: interaction.locale })}`)
                            .addLabelComponents(
                                new LabelBuilder()
                                    .setLabel(`${client.language({ textId: `Bio`, guildId: interaction.guildId, locale: interaction.locale })}`)
                                    .setTextInputComponent(
                                        new TextInputBuilder()
                                            .setCustomId("bio")
                                            .setRequired(false)
                                            .setMaxLength(400)
                                            .setStyle(TextInputStyle.Paragraph)
                                    )
                            )
                        await interaction.showModal(modal);delete client.globalCooldown[`${interaction.guildId}_${interaction.user.id}`]
                        const filter = (i) => i.customId === `bio_${interaction.id}` && i.user.id === interaction.user.id
                        interaction = await interaction.awaitModalSubmit({ filter, time: 120000 }).catch(e => interaction)
                        if (interaction && interaction.type === InteractionType.ModalSubmit) {
                            const modalArgs = {}
                            interaction.fields.fields.each(field => modalArgs[field.customId] = field.value)
                            await interaction.guild.members.editMe({
                                bio: modalArgs.bio
                            }).catch(error => {
                                interaction.followUp({ content: `${client.config.emojis.NO}${error.message}`, flags: ["Ephemeral"] })
                            })
                        }
                    } else
                    if (interaction.values[0] === "default:avatar") {
                        await interaction.guild.members.editMe({
                            avatar: null
                        }).catch(error => {
                            interaction.followUp({ content: `${client.config.emojis.NO}${error.message}`, flags: ["Ephemeral"] })
                        })
                    } else
                    if (interaction.values[0] === "default:banner") {
                        await interaction.guild.members.editMe({
                            banner: null
                        }).catch(error => {
                            interaction.followUp({ content: `${client.config.emojis.NO}${error.message}`, flags: ["Ephemeral"] })
                        })
                    } else
                    if (interaction.values[0] === "default:bio") {
                        await interaction.guild.members.editMe({
                            bio: null
                        }).catch(error => {
                            interaction.followUp({ content: `${client.config.emojis.NO}${error.message}`, flags: ["Ephemeral"] })
                        })
                    }
                }
                await interaction.guild.members.me.fetch()
                embed.setTitle(title.label)
                embed.setDescription([
                    `${client.language({ textId: `Аватар`, guildId: interaction.guildId, locale: interaction.locale })}: \`\`\`${interaction.guild.members.me.avatar || client.user.avatar || `${client.language({ textId: `Отсутствует`, guildId: interaction.guildId, locale: interaction.locale })}`}\`\`\``,
                    `${client.language({ textId: `Баннер`, guildId: interaction.guildId, locale: interaction.locale })}: \`\`\`${interaction.guild.members.me.banner || client.user.banner || `${client.language({ textId: `Отсутствует`, guildId: interaction.guildId, locale: interaction.locale })}`}\`\`\``
                ].join("\n"))
                embed.setThumbnail(interaction.guild.members.me.displayAvatarURL())
                embed.setImage(interaction.guild.members.me.displayBannerURL({ size: 4096 }))
                const menu = new StringSelectMenuBuilder().setCustomId(`cmd{manager-settings}title{customization}usr{${interaction.user.id}}`).setPlaceholder(`${client.language({ textId: `Персонализировать бота`, guildId: interaction.guildId, locale: interaction.locale })}`).setOptions([
                    {
                        label: `${client.language({ textId: `Аватар`, guildId: interaction.guildId, locale: interaction.locale })}`,
                        value: `avatar`,
                        emoji: client.config.emojis.avatar
                    },
                    {
                        label: `${client.language({ textId: `Баннер`, guildId: interaction.guildId, locale: interaction.locale })}`,
                        value: `banner`,
                        emoji: client.config.emojis.banner
                    },
                    {
                        label: `${client.language({ textId: `Bio`, guildId: interaction.guildId, locale: interaction.locale })}`,
                        value: `bio`,
                        emoji: client.config.emojis.bio
                    },
                    {
                        label: `${client.language({ textId: `Сбросить аватар`, guildId: interaction.guildId, locale: interaction.locale })}`,
                        value: `default:avatar`,
                        emoji: client.config.emojis.NO
                    },
                    {
                        label: `${client.language({ textId: `Сбросить баннер`, guildId: interaction.guildId, locale: interaction.locale })}`,
                        value: `default:banner`,
                        emoji: client.config.emojis.NO
                    },
                    {
                        label: `${client.language({ textId: `Сбросить информацию`, guildId: interaction.guildId, locale: interaction.locale })}`,
                        value: `default:bio`,
                        emoji: client.config.emojis.NO
                    }
                ])
                const row = new ActionRowBuilder().addComponents(menu)
                if (interaction.replied || interaction.deferred) return interaction.editReply({ embeds: [embed], components: [first_row, row] })
                else return interaction.update({ embeds: [embed], components: [first_row, row] })
            }
            if (interaction.values?.[0].includes("customRoles") || interaction.customId.includes("customRoles")) {
                if (interaction.isStringSelectMenu()) {
                    if (interaction.values[0] === "customRoleModeration") {
                        const components = JSON.parse(JSON.stringify(interaction.message.components))
                        interaction.message.components.forEach(row => row.components.forEach(component => {
                            component.data.disabled = true
                        }))
                        await interaction.update({ components: interaction.message.components })
                        await interaction.followUp({ 
                            components: [
                                new ActionRowBuilder()
                                    .addComponents(
                                        new ChannelSelectMenuBuilder()
                                            .setCustomId(`channel`)
                                            .setPlaceholder(`${client.language({ textId: `Выбери канал`, guildId: interaction.guildId, locale: interaction.locale })}...`)
                                            .setChannelTypes(ChannelType.GuildText, ChannelType.GuildVoice, ChannelType.GuildAnnouncement, ChannelType.PrivateThread, ChannelType.PublicThread)
                                    ),
                                new ActionRowBuilder().addComponents(
                                    new ButtonBuilder()
                                        .setCustomId("channelDelete")
                                        .setLabel(client.language({ textId: `УДАЛИТЬ`, guildId: interaction.guildId, locale: interaction.locale }))
                                        .setStyle(ButtonStyle.Danger),
                                    new ButtonBuilder()
                                        .setCustomId("channelCancel")
                                        .setLabel(client.language({ textId: `ОТМЕНА`, guildId: interaction.guildId, locale: interaction.locale }))
                                        .setStyle(ButtonStyle.Danger)
                                )
                            ],
                            flags: ["Ephemeral"]
                        })    
                        const filter = (i) => i.customId.includes(`channel`) && i.user.id === interaction.user.id
                        let interaction2 = await interaction.channel.awaitMessageComponent({ filter, time: 30000 }).catch(e => interaction)
                        if (interaction2 && interaction2.customId.includes("channel")) {
                            if (interaction2.customId === "channel") {
                                const channel = interaction2.channels.first()
                                if (!channel.permissionsFor(interaction.guild.members.me).has("SendMessages")) {
		                    		interaction2.update({ content: `${client.config.emojis.NO} ${client.language({ textId: `Для канала`, guildId: interaction.guildId, locale: interaction.locale })} <#${channel.id}> ${client.language({ textId: `мне нужны следующие права:\n1. Отправка сообщений`, guildId: interaction.guildId, locale: interaction.locale })}`, components: [], flags: ["Ephemeral"] })
		                    		return interaction.editReply({ components: components })
		                    	}
                                settings.channels.customRoleModerationChannel = channel.id
                                await settings.save()
                                interaction2.update({ content: `${client.config.emojis.YES}`, components: [] })
                            } else if (interaction2.customId === "channelDelete") {
                                settings.channels.customRoleModerationChannel = undefined
                                await settings.save()
                                interaction2.update({ content: `${client.config.emojis.YES}`, components: [] })
                            } else if (interaction2.customId === "channelCancel") {
                                interaction2.update({ content: `${client.config.emojis.YES} ${client.language({ textId: `Выбор отменён`, guildId: interaction.guildId, locale: interaction.locale })}`, components: [] })
                                return interaction.editReply({ components: components })
                            }
                        } else return interaction.editReply({ components: components })
                    }
                    if (interaction.values[0] === "customRolePosition") {
                        const components = JSON.parse(JSON.stringify(interaction.message.components))
                        interaction.message.components.forEach(row => row.components.forEach(component => {
                            component.data.disabled = true
                        }))
                        await interaction.update({ components: interaction.message.components })
                        await interaction.followUp({ 
                            components: [
                                new ActionRowBuilder()
                                    .addComponents(
                                        new RoleSelectMenuBuilder()
                                            .setCustomId(`role`)
                                            .setPlaceholder(`${client.language({ textId: `Выбери роль`, guildId: interaction.guildId, locale: interaction.locale })}...`)
                                    ),
                                new ActionRowBuilder().addComponents(
                                    new ButtonBuilder()
                                        .setCustomId("roleDelete")
                                        .setLabel(client.language({ textId: `УДАЛИТЬ`, guildId: interaction.guildId, locale: interaction.locale }))
                                        .setStyle(ButtonStyle.Danger),
                                    new ButtonBuilder()
                                        .setCustomId("roleCancel")
                                        .setLabel(client.language({ textId: `ОТМЕНА`, guildId: interaction.guildId, locale: interaction.locale }))
                                        .setStyle(ButtonStyle.Danger)
                                )
                            ],
                            flags: ["Ephemeral"]
                        })    
                        const filter = (i) => i.customId.includes(`role`) && i.user.id === interaction.user.id
                        let interaction2 = await interaction.channel.awaitMessageComponent({ filter, time: 30000 }).catch(e => interaction)
                        if (interaction2 && interaction2.customId.includes("role")) {
                            if (interaction2.customId === "role") {
                                const role = interaction2.roles.first()
                                if (!interaction.guild.members.me.permissions.has("ManageRoles")) {
                                    await interaction2.update({ content: `${client.config.emojis.NO}${client.language({ textId: `У меня нет права 'Управлять ролями'`, guildId: interaction.guildId, locale: interaction.locale })}`, components: [] })
                                    return interaction.editReply({ components: components })
                                }
                                if (role.position > interaction.guild.members.me.roles.highest.position) {
                                    await interaction2.update({ content: `${client.config.emojis.NO}${client.language({ textId: `Позиция моей наивысшей роли ниже, чем позиция`, guildId: interaction.guildId, locale: interaction.locale })} ${role}`, components: [] })
                                    return interaction.editReply({ components: components })
                                }
                                settings.roles.customRolePosition = role.id
                                await settings.save()
                                interaction2.update({ content: `${client.config.emojis.YES}`, components: [] })
                            } else if (interaction2.customId === "roleDelete") {
                                settings.roles.customRolePosition = undefined
                                await settings.save()
                                interaction2.update({ content: `${client.config.emojis.YES}`, components: [] })
                            } else if (interaction2.customId === "roleCancel") {
                                interaction2.update({ content: `${client.config.emojis.YES} ${client.language({ textId: `Выбор отменён`, guildId: interaction.guildId, locale: interaction.locale })}`, components: [] })
                                return interaction.editReply({ components: components })
                            }
                        } else return interaction.editReply({ components: components })
                    }
                    if (interaction.values[0] === "customRolePermission") {
                        if (!client.cache.permissions.some(e => e.guildID === interaction.guildId)) {
							return interaction.reply({ content: `${client.config.emojis.NO} ${client.language({ textId: `На сервере не найдено созданных прессетов прав. Для создания прессета используй команду </manager-permissions create:1150455842294988943>.`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
						}
						const modal = new ModalBuilder()
							.setCustomId(`permission_${interaction.id}`)
							.setTitle(`${client.language({ textId: `Установка права`, guildId: interaction.guildId, locale: interaction.locale })}`)
                            .setLabelComponents([
                                new LabelBuilder()
                                    .setLabel(`${client.language({ textId: `Название права`, guildId: interaction.guildId, locale: interaction.locale })}`)
                                    .setTextInputComponent(
                                        new TextInputBuilder()
											.setCustomId("name")
											.setRequired(false)
											.setValue(`${client.cache.permissions.find(e => e.id === settings.customRolePermission)?.name || ""}`)
											.setStyle(TextInputStyle.Short)
                                    ),
                            ])
						await interaction.showModal(modal);delete client.globalCooldown[`${interaction.guildId}_${interaction.user.id}`]
						const filter = (i) => i.customId === `permission_${interaction.id}` && i.user.id === interaction.user.id
						interaction = await interaction.awaitModalSubmit({ filter, time: 120000 }).catch(e => interaction)
						if (interaction && interaction.type === InteractionType.ModalSubmit) {
							const modalArgs = {}
							interaction.fields.fields.each(field => modalArgs[field.customId] = field.value)
							if (!modalArgs.name) {
								settings.customRolePermission = undefined
                                await settings.save()
							} else {
								const permission = client.cache.permissions.find(e => e.name.toLowerCase() === modalArgs.name.toLowerCase() && e.guildID === interaction.guildId)
								if (!permission) {
									return interaction.reply({ content: `${client.config.emojis.NO} ${client.language({ textId: `Права с названием`, guildId: interaction.guildId, locale: interaction.locale })} **${modalArgs.name}** ${client.language({ textId: `не существует`, guildId: interaction.guildId, locale: interaction.locale })}` })
								} else {
									settings.customRolePermission = permission.id
                                    await settings.save()
								}
							}
						} else return
                    } else
                    if (interaction.values[0] === "price") {
                        const components = JSON.parse(JSON.stringify(interaction.message.components))
                        interaction.message.components.forEach(row => row.components.forEach(component => {
                            component.data.disabled = true
                        }))
                        await interaction.update({ components: interaction.message.components })
                        await interaction.followUp({ 
                            components: [
                                new ActionRowBuilder()
                                    .addComponents(
                                        [
                                            new ButtonBuilder()
                                                .setCustomId("add_item")
                                                .setLabel(client.language({ textId: `Предмет`, guildId: interaction.guildId, locale: interaction.locale }))
                                                .setEmoji(client.config.emojis.box)
                                                .setStyle(ButtonStyle.Secondary),
                                            new ButtonBuilder()
                                                .setCustomId("add_currency")
                                                .setLabel(settings.displayCurrencyEmoji)
                                                .setEmoji(client.config.emojis.coin)
                                                .setStyle(ButtonStyle.Secondary),
                                            new ButtonBuilder()
                                                .setCustomId("add_rp")
                                                .setLabel(`${client.language({ textId: `Репутация`, guildId: interaction.guildId, locale: interaction.locale })}`)
                                                .setEmoji(client.config.emojis.RP)
                                                .setStyle(ButtonStyle.Secondary),
                                            new ButtonBuilder()
                                                .setCustomId("add_role")
                                                .setLabel(client.language({ textId: `Роль`, guildId: interaction.guildId, locale: interaction.locale }))
                                                .setEmoji(client.config.emojis.box)
                                                .setStyle(ButtonStyle.Secondary),
                                        ]
                                    ),
                                new ActionRowBuilder()
                                    .addComponents(
                                        new ButtonBuilder()
                                            .setCustomId("add_cancel")
                                            .setLabel(client.language({ textId: `ОТМЕНА`, guildId: interaction.guildId, locale: interaction.locale }))
                                            .setStyle(ButtonStyle.Danger),
                                    ),
                            ],
                            flags: ["Ephemeral"]
                        })
                        const filter = (i) => i.customId.includes(`add`) && i.user.id === interaction.user.id
                        let interaction2 = await interaction.channel.awaitMessageComponent({ filter, time: 30000 }).catch(e => null)
                        if (interaction2 && interaction2.customId.includes("add")) {
                            if (interaction2.customId.includes("cancel")) {
                                interaction2.update({ content: `${client.config.emojis.YES} ${client.language({ textId: `Выбор отменён`, guildId: interaction.guildId, locale: interaction.locale })}`, components: [] })
                                return interaction.editReply({ components: components })
                            }
                            let type
                            let id
                            const modalComponents = [
                                new LabelBuilder()
                                    .setLabel(`${client.language({ textId: `Количество`, guildId: interaction.guildId, locale: interaction.locale })}`)
                                    .setTextInputComponent(
                                        new TextInputBuilder()
                                            .setCustomId("amount")
                                            .setRequired(true)
                                            .setStyle(TextInputStyle.Short)
                                    )
                            ]
                            if (interaction2.customId.includes("item")) {
                                type = RewardType.Item
                                modalComponents.unshift(
                                    new LabelBuilder()
                                        .setLabel(`${client.language({ textId: `Название предмета`, guildId: interaction.guildId, locale: interaction.locale })}`)
                                        .setTextInputComponent(
                                            new TextInputBuilder()
                                                .setCustomId("item")
                                                .setRequired(true)
                                                .setStyle(TextInputStyle.Short)
                                        )
                                )
                            }
                            if (interaction2.customId.includes("role")) {
                                await interaction2.update({ 
                                    components: [
                                        new ActionRowBuilder()
                                            .addComponents(
                                                new RoleSelectMenuBuilder()
                                                    .setCustomId(`addRole`)
                                                    .setPlaceholder(`${client.language({ textId: `Выбери роль`, guildId: interaction.guildId, locale: interaction.locale })}...`)
                                            ),
                                        new ActionRowBuilder().addComponents(
                                            new ButtonBuilder()
                                                .setCustomId("addRoleCancel")
                                                .setLabel(client.language({ textId: `ОТМЕНА`, guildId: interaction.guildId, locale: interaction.locale }))
                                                .setStyle(ButtonStyle.Danger)
                                        )
                                    ],
                                    flags: ["Ephemeral"]
                                })    
                                const filter = (i) => i.customId.includes(`addRole`) && i.user.id === interaction.user.id
                                interaction2 = await interaction2.channel.awaitMessageComponent({ filter, time: 30000 }).catch(e => interaction2)
                                if (interaction2 && interaction2.customId.includes("addRole")) {
                                    if (interaction2.customId === "addRole") {
                                        const role = interaction2.roles.first()
                                        id = role.id
                                        type = RewardType.Role
                                    } else {
                                        interaction2.update({ content: client.config.emojis.YES, components: [] })
                                        return interaction.editReply({ components: components })
                                    }
                                } else return interaction.editReply({ components: components })
                            }
                            if (interaction2.customId.includes("currency")) type = RewardType.Currency
                            if (interaction2.customId.includes("rp")) type = RewardType.Reputation
                            const modal = new ModalBuilder()
                                .setCustomId(`addItem_${interaction2.id}`)
                                .setTitle(`${client.language({ textId: `Добавить цену`, guildId: interaction.guildId, locale: interaction.locale })}`)
                                .setLabelComponents(modalComponents)
                            await interaction2.showModal(modal);delete client.globalCooldown[`${interaction.guildId}_${interaction.user.id}`]
                            const filter = (i) => i.customId === `addItem_${interaction2.id}` && i.user.id === interaction.user.id
                            interaction2 = await interaction2.awaitModalSubmit({ filter, time: 60000 }).catch(e => interaction2)
                            if (interaction2 && interaction2.isModalSubmit()) {
                                const modalArgs = {}
                                interaction2.fields.fields.each(field => modalArgs[field.customId] = field.value)
                                if (type === RewardType.Item) {
                                    const filteredItems = client.cache.items.filter(e => e.guildID === interaction.guildId && !e.temp && e.name.toLowerCase().includes(modalArgs.item.toLowerCase()) && e.found && e.enabled)
                                    if (filteredItems.size > 1 && !filteredItems.some(e =>  e.name.toLowerCase() === modalArgs.item.toLowerCase())) {
                                        let result = ""
                                        filteredItems.forEach(item => {
                                            result += `> ${item.displayEmoji}**${item.name}**\n`	
                                        })
                                        interaction2.update({ content: `${client.config.emojis.block} ${client.language({ textId: `По вашему запросу было найдено несколько предметов`, guildId: interaction.guildId, locale: interaction.locale })}:\n${result}`.slice(0, 2000), components: [], flags: ["Ephemeral"] })  
                                        return interaction.editReply({ components: components })
                                    }
                                    searchedItem = filteredItems.some(e => e.name.toLowerCase() === modalArgs.item.toLowerCase()) ? filteredItems.find(e => e.name.toLowerCase() === modalArgs.item.toLowerCase()) : filteredItems.first()
                                    if (!searchedItem) {
                                        interaction2.update({ content: `${client.config.emojis.NO}${client.language({ textId: `Предмет`, guildId: interaction.guildId, locale: interaction.locale })} **${modalArgs.item}** ${client.language({ textId: `не найден`, guildId: interaction.guildId, locale: interaction.locale })}`, components: [], flags: ["Ephemeral"] })
                                        return interaction.editReply({ components: components })
                                    }
                                    id = searchedItem.itemID
                                }
                                if (isNaN(+modalArgs.amount)) {
                                    interaction2.update({ content: `${client.config.emojis.NO} **${modalArgs.amount}** ${client.language({ textId: `не является числом`, guildId: interaction.guildId, locale: interaction.locale })}`, components: [], flags: ["Ephemeral"] })
                                    return interaction.editReply({ components: components })
                                }
                                modalArgs.amount = +modalArgs.amount
                                if (modalArgs.amount < 0 || modalArgs.amount > 100000000000) {
                                    interaction2.update({ content: `${client.config.emojis.NO} ${client.language({ textId: `Количество не должно быть`, guildId: interaction.guildId, locale: interaction.locale })} < 0 ${client.language({ textId: `или`, guildId: interaction.guildId, locale: interaction.locale })} > 100 000 000 000`, components: [], flags: ["Ephemeral"] })
                                    return interaction.editReply({ components: components })
                                }
                                const reward = settings.customRolePrice?.find(e => { return e.type === type && e.id === id })
                                if (reward) {
                                    if (modalArgs.amount === 0) settings.customRolePrice = settings.customRolePrice.filter(e => e.id !== id && e.type !== type)
                                    else reward.amount = modalArgs.amount
                                } else {
                                    if (modalArgs.amount > 0) {
                                        if (settings.customRolePrice?.length >= 5) {
                                            interaction2.update({ content: `${client.config.emojis.NO}**${client.language({ textId: `Достигнуто максимальное количество предметов для цены`, guildId: interaction.guildId, locale: interaction.locale })}: 5**`, components: [], flags: ["Ephemeral"] })
                                            return interaction.editReply({ components: components })
                                        }
                                        if (!settings.customRolePrice) settings.customRolePrice = []
                                        settings.customRolePrice.push({
                                            type: type,
                                            id: id,
                                            amount: modalArgs.amount
                                        })
                                    }
                                }
                                await settings.save()
                                interaction2.update({ content: client.config.emojis.YES, components: [], flags: ["Ephemeral"] })
                            }
                        }
                    } else
                    if (interaction.values[0] === "clearPrice") {
                        settings.customRolePrice = []
                        await settings.save()
                    } else
                    if (interaction.values[0] === "hoist") {
                        if (settings.customRoleHoist) settings.customRoleHoist = undefined
                        else settings.customRoleHoist = true
                        await settings.save()
                    } else
                    if (interaction.values[0] === "customRoleMinimumMinutes") {
                        const modal = new ModalBuilder()
                            .setCustomId(`customRoleMinimumMinutes_${interaction.id}`)
                            .setTitle(`${client.language({ textId: `Минимальное время временной роли`, guildId: interaction.guildId, locale: interaction.locale })}`)
                            .setLabelComponents([
                                new LabelBuilder()
                                    .setLabel(`${client.language({ textId: `Минуты`, guildId: interaction.guildId, locale: interaction.locale })}`)
                                    .setTextInputComponent(
                                        new TextInputBuilder()
                                            .setCustomId("minutes")
                                            .setMaxLength(100)
                                            .setStyle(TextInputStyle.Short)
                                    ),
                            ])
                        await interaction.showModal(modal);delete client.globalCooldown[`${interaction.guildId}_${interaction.user.id}`]
                        const filter = (i) => i.customId === `customRoleMinimumMinutes_${interaction.id}` && i.user.id === interaction.user.id
                        interaction = await interaction.awaitModalSubmit({ filter, time: 60000 }).catch(e => null)
                        if (interaction && interaction.isModalSubmit()) {
                            const modalArgs = {}
                            interaction.fields.fields.each(field => modalArgs[field.customId] = field.value)
                            if (isNaN(+modalArgs.minutes) || !Number.isInteger(+modalArgs.minutes)) {
                                return interaction.reply({ content: `${client.config.emojis.NO} **${modalArgs.minutes}** ${client.language({ textId: `не является целым числом`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
                            }
                            modalArgs.minutes = +modalArgs.minutes
                            if (modalArgs.minutes <= 0) {
                                return interaction.reply({ content: `${client.config.emojis.NO} **${client.language({ textId: `Число не может быть`, guildId: interaction.guildId, locale: interaction.locale })} <= 0**`, flags: ["Ephemeral"] })
                            }
                            settings.customRoleMinimumMinutes = modalArgs.minutes
                            await settings.save()
                        } else return
                    } else
                    if (interaction.values[0] === "temporary") {
                        settings.customRoleTemporaryEnabled = !settings.customRoleTemporaryEnabled
                        await settings.save()
                    } else
                    if (interaction.values[0] === "priceMinute") {
                        const components = JSON.parse(JSON.stringify(interaction.message.components))
                        interaction.message.components.forEach(row => row.components.forEach(component => {
                            component.data.disabled = true
                        }))
                        await interaction.update({ components: interaction.message.components })
                        await interaction.followUp({ 
                            components: [
                                new ActionRowBuilder()
                                    .addComponents(
                                        [
                                            new ButtonBuilder()
                                                .setCustomId("add_item")
                                                .setLabel(client.language({ textId: `Предмет`, guildId: interaction.guildId, locale: interaction.locale }))
                                                .setEmoji(client.config.emojis.box)
                                                .setStyle(ButtonStyle.Secondary),
                                            new ButtonBuilder()
                                                .setCustomId("add_currency")
                                                .setLabel(settings.currencyName)
                                                .setEmoji(settings.displayCurrencyEmoji)
                                                .setStyle(ButtonStyle.Secondary),
                                            new ButtonBuilder()
                                                .setCustomId("add_rp")
                                                .setLabel(`${client.language({ textId: `Репутация`, guildId: interaction.guildId, locale: interaction.locale })}`)
                                                .setEmoji(client.config.emojis.RP)
                                                .setStyle(ButtonStyle.Secondary),
                                            new ButtonBuilder()
                                                .setCustomId("add_role")
                                                .setLabel(client.language({ textId: `Роль`, guildId: interaction.guildId, locale: interaction.locale }))
                                                .setEmoji(client.config.emojis.box)
                                                .setStyle(ButtonStyle.Secondary),
                                        ]
                                    ),
                                new ActionRowBuilder()
                                    .addComponents(
                                        new ButtonBuilder()
                                            .setCustomId("add_cancel")
                                            .setLabel(client.language({ textId: `ОТМЕНА`, guildId: interaction.guildId, locale: interaction.locale }))
                                            .setStyle(ButtonStyle.Danger),
                                    ),
                            ],
                            flags: ["Ephemeral"]
                        })
                        const filter = (i) => i.customId.includes(`add`) && i.user.id === interaction.user.id
                        let interaction2 = await interaction.channel.awaitMessageComponent({ filter, time: 30000 }).catch(e => null)
                        if (interaction2 && interaction2.customId.includes("add")) {
                            if (interaction2.customId.includes("cancel")) {
                                interaction2.update({ content: `${client.config.emojis.YES} ${client.language({ textId: `Выбор отменён`, guildId: interaction.guildId, locale: interaction.locale })}`, components: [] })
                                return interaction.editReply({ components: components })
                            }
                            let type
                            let id
                            const modalComponents = [
                                new LabelBuilder()
                                    .setLabel(`${client.language({ textId: `Количество`, guildId: interaction.guildId, locale: interaction.locale })}`)
                                    .setTextInputComponent(
                                        new TextInputBuilder()
                                            .setCustomId("amount")
                                            .setRequired(true)
                                            .setStyle(TextInputStyle.Short)
                                    )
                            ]
                            if (interaction2.customId.includes("item")) {
                                type = RewardType.Item
                                modalComponents.unshift(
                                    new LabelBuilder()
                                        .setLabel(`${client.language({ textId: `Название предмета`, guildId: interaction.guildId, locale: interaction.locale })}`)
                                        .setTextInputComponent(
                                            new TextInputBuilder()
                                                .setCustomId("item")
                                                .setRequired(true)
                                                .setStyle(TextInputStyle.Short)
                                        )
                                )
                            }
                            if (interaction2.customId.includes("role")) {
                                await interaction2.update({ 
                                    components: [
                                        new ActionRowBuilder()
                                            .addComponents(
                                                new RoleSelectMenuBuilder()
                                                    .setCustomId(`addRole`)
                                                    .setPlaceholder(`${client.language({ textId: `Выбери роль`, guildId: interaction.guildId, locale: interaction.locale })}...`)
                                            ),
                                        new ActionRowBuilder().addComponents(
                                            new ButtonBuilder()
                                                .setCustomId("addRoleCancel")
                                                .setLabel(client.language({ textId: `ОТМЕНА`, guildId: interaction.guildId, locale: interaction.locale }))
                                                .setStyle(ButtonStyle.Danger)
                                        )
                                    ],
                                    flags: ["Ephemeral"]
                                })    
                                const filter = (i) => i.customId.includes(`addRole`) && i.user.id === interaction.user.id
                                interaction2 = await interaction2.channel.awaitMessageComponent({ filter, time: 30000 }).catch(e => interaction2)
                                if (interaction2 && interaction2.customId.includes("addRole")) {
                                    if (interaction2.customId === "addRole") {
                                        const role = interaction2.roles.first()
                                        id = role.id
                                        type = RewardType.Role
                                    } else {
                                        interaction2.update({ content: client.config.emojis.YES, components: [] })
                                        return interaction.editReply({ components: components })
                                    }
                                } else return interaction.editReply({ components: components })
                            }
                            if (interaction2.customId.includes("currency")) type = RewardType.Currency
                            if (interaction2.customId.includes("rp")) type = RewardType.Reputation
                            const modal = new ModalBuilder()
                                .setCustomId(`addItem_${interaction2.id}`)
                                .setTitle(`${client.language({ textId: `Добавить цену`, guildId: interaction.guildId, locale: interaction.locale })}`)
                                .setLabelComponents(modalComponents)
                            await interaction2.showModal(modal);delete client.globalCooldown[`${interaction.guildId}_${interaction.user.id}`]
                            const filter = (i) => i.customId === `addItem_${interaction2.id}` && i.user.id === interaction.user.id
                            interaction2 = await interaction2.awaitModalSubmit({ filter, time: 60000 }).catch(e => interaction2)
                            if (interaction2 && interaction2.isModalSubmit()) {
                                const modalArgs = {}
                                interaction2.fields.fields.each(field => modalArgs[field.customId] = field.value)
                                if (type === RewardType.Item) {
                                    const filteredItems = client.cache.items.filter(e => e.guildID === interaction.guildId && !e.temp && e.name.toLowerCase().includes(modalArgs.item.toLowerCase()) && e.found && e.enabled)
                                    if (filteredItems.size > 1 && !filteredItems.some(e =>  e.name.toLowerCase() === modalArgs.item.toLowerCase())) {
                                        let result = ""
                                        filteredItems.forEach(item => {
                                            result += `> ${item.displayEmoji}**${item.name}**\n`	
                                        })
                                        interaction2.update({ content: `${client.config.emojis.block} ${client.language({ textId: `По вашему запросу было найдено несколько предметов`, guildId: interaction.guildId, locale: interaction.locale })}:\n${result}`.slice(0, 2000), components: [], flags: ["Ephemeral"] })  
                                        return interaction.editReply({ components: components })
                                    }
                                    searchedItem = filteredItems.some(e => e.name.toLowerCase() === modalArgs.item.toLowerCase()) ? filteredItems.find(e => e.name.toLowerCase() === modalArgs.item.toLowerCase()) : filteredItems.first()
                                    if (!searchedItem) {
                                        interaction2.update({ content: `${client.config.emojis.NO}${client.language({ textId: `Предмет`, guildId: interaction.guildId, locale: interaction.locale })} **${modalArgs.item}** ${client.language({ textId: `не найден`, guildId: interaction.guildId, locale: interaction.locale })}`, components: [], flags: ["Ephemeral"] })
                                        return interaction.editReply({ components: components })
                                    }
                                    id = searchedItem.itemID
                                }
                                if (isNaN(+modalArgs.amount)) {
                                    interaction2.update({ content: `${client.config.emojis.NO} **${modalArgs.amount}** ${client.language({ textId: `не является числом`, guildId: interaction.guildId, locale: interaction.locale })}`, components: [], flags: ["Ephemeral"] })
                                    return interaction.editReply({ components: components })
                                }
                                modalArgs.amount = +modalArgs.amount
                                if (modalArgs.amount < 0 || modalArgs.amount > 100000000000) {
                                    interaction2.update({ content: `${client.config.emojis.NO} ${client.language({ textId: `Количество не должно быть`, guildId: interaction.guildId, locale: interaction.locale })} < 0 ${client.language({ textId: `или`, guildId: interaction.guildId, locale: interaction.locale })} > 100 000 000 000`, components: [], flags: ["Ephemeral"] })
                                    return interaction.editReply({ components: components })
                                }
                                const reward = settings.customRolePriceMinute?.find(e => { return e.type === type && e.id === id })
                                if (reward) {
                                    if (modalArgs.amount === 0) settings.customRolePriceMinute = settings.customRolePriceMinute.filter(e => e.id !== id && e.type !== type)
                                    else reward.amount = modalArgs.amount
                                } else {
                                    if (modalArgs.amount > 0) {
                                        if (settings.customRolePriceMinute?.length >= 5) {
                                            interaction2.update({ content: `${client.config.emojis.NO}**${client.language({ textId: `Достигнуто максимальное количество предметов для цены`, guildId: interaction.guildId, locale: interaction.locale })}: 5**`, components: [], flags: ["Ephemeral"] })
                                            return interaction.editReply({ components: components })
                                        }
                                        if (!settings.customRolePriceMinute) settings.customRolePriceMinute = []
                                        settings.customRolePriceMinute.push({
                                            type: type,
                                            id: id,
                                            amount: modalArgs.amount
                                        })
                                    }
                                }
                                await settings.save()
                                interaction2.update({ content: client.config.emojis.YES, components: [], flags: ["Ephemeral"] })
                            }
                        }
                    } else
                    if (interaction.values[0] === "clearPriceMinute") {
                        settings.customRolePriceMinute = []
                        await settings.save()
                    } else
                    if (interaction.values[0] === "customRoleCreationLimit") {
                        const modal = new ModalBuilder()
							.setCustomId(`customRoleCreationLimit_${interaction.id}`)
							.setTitle(`${client.language({ textId: `Лимит создания кастомных ролей`, guildId: interaction.guildId, locale: interaction.locale })}`)
                            .setLabelComponents([
                                new LabelBuilder()
                                    .setLabel(`${client.language({ textId: `Лимит`, guildId: interaction.guildId, locale: interaction.locale })}`)
                                    .setTextInputComponent(
                                        new TextInputBuilder()
											.setCustomId("limit")
											.setRequired(false)
											.setValue(`${settings.customRoleCreationLimit || " "}`)
											.setStyle(TextInputStyle.Short)
                                    ),
                            ])
						await interaction.showModal(modal);delete client.globalCooldown[`${interaction.guildId}_${interaction.user.id}`]
						const filter = (i) => i.customId === `customRoleCreationLimit_${interaction.id}` && i.user.id === interaction.user.id
						interaction = await interaction.awaitModalSubmit({ filter, time: 120000 }).catch(e => null)
						if (interaction && interaction.type === InteractionType.ModalSubmit) {
							const modalArgs = {}
							interaction.fields.fields.each(field => modalArgs[field.customId] = field.value)
                            if (!modalArgs.limit) {
                                settings.customRoleCreationLimit = undefined
                                await settings.save()
                            } else {
                                if (isNaN(+modalArgs.limit)) {
                                    return interaction.reply({ content: `${client.config.emojis.NO} **${modalArgs.limit}** ${client.language({ textId: `не является числом`, guildId: interaction.guildId, locale: interaction.locale })}`, components: [], flags: ["Ephemeral"] })
                                }
                                modalArgs.limit = +modalArgs.limit
                                if (modalArgs.limit <= 0 || modalArgs.limit > 100000000000) {
                                    return interaction.reply({ content: `${client.config.emojis.NO} ${client.language({ textId: `Количество не должно быть`, guildId: interaction.guildId, locale: interaction.locale })} <= 0 ${client.language({ textId: `или`, guildId: interaction.guildId, locale: interaction.locale })} > 100 000 000 000`, components: [], flags: ["Ephemeral"] })
                                }
                                settings.customRoleCreationLimit = modalArgs.limit
                                await settings.save()
                            }
						} else return
                    }
                    if (interaction.customId.includes("properties")) {
                        interaction.values.forEach(e => {
                            if (!settings.customRoleProperties) settings.customRoleProperties = []
                            if (settings.customRoleProperties.includes(e)) settings.customRoleProperties = settings.customRoleProperties.filter(p => p !== e)
                            else settings.customRoleProperties.push(e)
                        })
                        await settings.save()
                    }
                }
                embed.setTitle(title.label)
                embed.setDescription(`${client.language({ textId: `C помощью команды /custom-role можно создать свою роль. Для использования команды нужно настроить параметры ниже.`, guildId: interaction.guildId, locale: interaction.locale })}`)
                embed.addFields([
                    {
                        name: `${client.language({ textId: `Создание кастомной роли под ролью (Обязательно)`, guildId: interaction.guildId, locale: interaction.locale })}`,
                        value: settings.roles.customRolePosition ? `<@&${settings.roles.customRolePosition}>` : `<${client.language({ textId: `Требуется выбрать`, guildId: interaction.guildId, locale: interaction.locale })}>`
                    },
                    {
                        name: `${client.language({ textId: `Канал для модерации кастомных ролей`, guildId: interaction.guildId, locale: interaction.locale })}`,
                        value: settings.channels.customRoleModerationChannel ? `<#${settings.channels.customRoleModerationChannel}>` : `<${client.language({ textId: `Требуется выбрать`, guildId: interaction.guildId, locale: interaction.locale })}>`
                    },
                    {
                        name: `${client.language({ textId: `Право для создания кастомной роли`, guildId: interaction.guildId, locale: interaction.locale })}`,
                        value: settings.customRolePermission ? client.cache.permissions.get(settings.customRolePermission)?.name || `${client.language({ textId: `Нет права`, guildId: interaction.guildId, locale: interaction.locale })}` : `${client.language({ textId: `Нет права`, guildId: interaction.guildId, locale: interaction.locale })}`
                    },
                    {
                        name: `${client.language({ textId: `Показывать участников с ролью отдельно от остальных участников в сети`, guildId: interaction.guildId, locale: interaction.locale })}`,
                        value: settings.customRoleHoist ? `${client.language({ textId: `Да`, guildId: interaction.guildId, locale: interaction.locale })}` : `${client.language({ textId: `Нет`, guildId: interaction.guildId, locale: interaction.locale })}`
                    },
                    settings.customRoleProperties?.length ? {
                        name: `${client.language({ textId: `После создания роли, устанавливает свойства`, guildId: interaction.guildId, locale: interaction.locale })}:`,
                        value: `[${settings.customRoleProperties.map(e => `${client.language({ textId: e, guildId: interaction.guildId, locale: interaction.locale })}`).join(", ")}]`
                    } : undefined,
                    {
                        name: `${client.language({ textId: `Минимальное время временной роли`, guildId: interaction.guildId, locale: interaction.locale })}`,
                        value: settings.customRoleMinimumMinutes ? `${client.functions.transformSecs(client, settings.customRoleMinimumMinutes * 60 * 1000, interaction.guildId, interaction.locale)}` : `${client.language({ textId: `Нет ограничения`, guildId: interaction.guildId, locale: interaction.locale })}`
                    },
                    {
                        name: `${client.language({ textId: `Цена создания кастомной роли навсегда`, guildId: interaction.guildId, locale: interaction.locale })}`,
                        value: !settings.customRolePrice?.length ? `${client.language({ textId: `Бесплатно`, guildId: interaction.guildId, locale: interaction.locale })}` : await Promise.all(settings.customRolePrice.map(async e => {
                            if (e.type === RewardType.Currency) {
                                return `${settings.displayCurrencyEmoji}${settings.currencyName} (${e.amount})`
                            }
                            if (e.type === RewardType.Reputation) {
                                return `${client.config.emojis.RP}${client.language({ textId: "Репутация", guildId: interaction.guildId, locale: interaction.locale })} (${e.amount})`
                            }
                            if (e.type === RewardType.Item) {
                                const item = client.cache.items.find(i => i.itemID === e.id && i.enabled && !i.temp)
                                if (item) {
                                    return `${item.displayEmoji}${item.name} (${e.amount})`
                                }
                                else return `${e.id} (${e.amount})`
                            }
                            if (e.type === RewardType.Role) {
                                return `<@&${e.id}> (${e.amount})`
                            }
                        })).then(array => array.join(", "))
                    },
                    {
                        name: `${client.language({ textId: `Лимит создания кастомных ролей`, guildId: interaction.guildId, locale: interaction.locale })}`,
                        value: settings.customRoleCreationLimit ? `${settings.customRoleCreationLimit}` : `${client.language({ textId: `Нет ограничения`, guildId: interaction.guildId, locale: interaction.locale })}`
                    },
                    settings.customRoleTemporaryEnabled ? {
                        name: `${client.language({ textId: `Цена создания кастомной роли [1 мин.]`, guildId: interaction.guildId, locale: interaction.locale })}`,
                        value: !settings.customRolePriceMinute?.length ? `${client.language({ textId: `Бесплатно`, guildId: interaction.guildId, locale: interaction.locale })}` : await Promise.all(settings.customRolePriceMinute.map(async e => {
                            if (e.type === RewardType.Currency) {
                                return `${settings.displayCurrencyEmoji}${settings.currencyName} (${e.amount})`
                            }
                            if (e.type === RewardType.Reputation) {
                                return `${client.config.emojis.RP}${client.language({ textId: "Репутация", guildId: interaction.guildId, locale: interaction.locale })} (${e.amount})`
                            }
                            if (e.type === RewardType.Item) {
                                const item = client.cache.items.find(i => i.itemID === e.id && i.enabled && !i.temp)
                                if (item) {
                                    return `${item.displayEmoji}${item.name} (${e.amount})`
                                }
                                else return `${e.id} (${e.amount})`
                            }
                            if (e.type === RewardType.Role) {
                                return `<@&${e.id}> (${e.amount})`
                            }
                        })).then(array => array.join(", "))
                    } : undefined
                ].filter(e => e))
                const menu = new StringSelectMenuBuilder().setCustomId(`cmd{manager-settings}title{customRoles}usr{${interaction.user.id}}`).setOptions([
                    {
                        label: `${client.language({ textId: `Канал для модерации кастомных ролей`, guildId: interaction.guildId, locale: interaction.locale })}`,
                        value: `customRoleModeration`
                    },
                    {
                        label: `${client.language({ textId: `Создание кастомной роли под ролью`, guildId: interaction.guildId, locale: interaction.locale })}`,
                        value: `customRolePosition`
                    },
                    {
                        label: `${client.language({ textId: `Право для создания кастомной роли`, guildId: interaction.guildId, locale: interaction.locale })}`,
                        value: `customRolePermission`
                    },
                    {
                        label: `${client.language({ textId: `Показывать участников с ролью отдельно от остальных участников в сети`, guildId: interaction.guildId, locale: interaction.locale })}`,
                        value: `hoist`
                    },
                    {
                        label: `${client.language({ textId: `Минимальное время временной роли`, guildId: interaction.guildId, locale: interaction.locale })}`,
                        value: `customRoleMinimumMinutes`
                    },
                    {
                        label: `${client.language({ textId: settings.customRoleTemporaryEnabled ? `Выключить возможность создания временной роли` : `Включить возможность создания временной роли`, guildId: interaction.guildId, locale: interaction.locale })}`,
                        value: `temporary`
                    },
                    {
                        label: `${client.language({ textId: `Добавить цену [навсегда]`, guildId: interaction.guildId, locale: interaction.locale })}`,
                        value: `price`
                    },
                    settings.customRoleTemporaryEnabled ? {
                        label: `${client.language({ textId: `Добавить цену [1 мин.]`, guildId: interaction.guildId, locale: interaction.locale })}`,
                        value: `priceMinute`
                    } : undefined,
                    {
                        label: `${client.language({ textId: `Лимит создания кастомных ролей`, guildId: interaction.guildId, locale: interaction.locale })}`,
                        value: `customRoleCreationLimit`
                    },
                ].filter(e => e))
                const menu2 = new StringSelectMenuBuilder().setCustomId(`cmd{manager-settings}title{customRoles}usr{${interaction.user.id}}properties`).setOptions([
                    {
                        label: `${client.language({ textId: `canUnwear`, guildId: interaction.guildId, locale: interaction.locale })}`,
                        value: `canUnwear`
                    },
                    {
                        label: `${client.language({ textId: `cannotTransfer`, guildId: interaction.guildId, locale: interaction.locale })}`,
                        value: `cannotTransfer`
                    },
                    {
                        label: `${client.language({ textId: `cannotSell`, guildId: interaction.guildId, locale: interaction.locale })}`,
                        value: `cannotSell`
                    },
                    {
                        label: `${client.language({ textId: `cannotGiveaway`, guildId: interaction.guildId, locale: interaction.locale })}`,
                        value: `cannotGiveaway`
                    },
                ]).setMaxValues(4).setPlaceholder(`${client.language({ textId: `После создания роли, устанавливает свойства`, guildId: interaction.guildId, locale: interaction.locale })}...`)
                if (settings.customRolePrice?.length) menu.addOptions([
                    {
                        label: `${client.language({ textId: `Очистить цену [навсегда]`, guildId: interaction.guildId, locale: interaction.locale })}`,
                        value: `clearPrice`
                    }
                ])
                if (settings.customRolePriceMinute?.length) menu.addOptions([
                    {
                        label: `${client.language({ textId: `Очистить цену [1 мин.]`, guildId: interaction.guildId, locale: interaction.locale })}`,
                        value: `clearPriceMinute`
                    }
                ])
                const row = new ActionRowBuilder().addComponents(menu)
                const row2 = new ActionRowBuilder().addComponents(menu2)
                if (interaction.replied || interaction.deferred) return interaction.editReply({ embeds: [embed], components: [first_row, row, row2] })
                else return interaction.update({ embeds: [embed], components: [first_row, row, row2] })
            }
            if (interaction.values?.[0].includes("startKit") || interaction.customId.includes("startKit")) {
                embed.setTitle(title.label)
                if (interaction.customId.includes("currency")) {
                    const modal = new ModalBuilder()
                        .setCustomId(`startKit_currency_${interaction.id}`)
                        .setTitle(settings.currencyName)
                        .setLabelComponents([
                            new LabelBuilder()
                                .setLabel(`${client.language({ textId: `Количество`, guildId: interaction.guildId, locale: interaction.locale })}`)
                                .setTextInputComponent(
                                    new TextInputBuilder()
                                        .setCustomId("amount")
                                        .setRequired(true)
                                        .setMaxLength(9)
                                        .setStyle(TextInputStyle.Short)
                                        .setValue(`${settings.startKit.find(e => e.itemID === "currency")?.amount || 0}`)
                                ),
                        ])
                    await interaction.showModal(modal);delete client.globalCooldown[`${interaction.guildId}_${interaction.user.id}`]
                    const filter = (i) => i.customId === `startKit_currency_${interaction.id}` && i.user.id === interaction.user.id
                    interaction = await interaction.awaitModalSubmit({ filter, time: 180000 }).catch(e => interaction)
                    if (interaction && interaction.isModalSubmit()) {
                        const modalArgs = {}
                        interaction.fields.fields.each(field => modalArgs[field.customId] = field.value)
                        if (!+modalArgs.amount) {
                            settings.startKit = settings.startKit.filter(e => e.itemID !== "currency")
                            await settings.save()
                        } else {
                            const currency = settings.startKit.find(e => { return e.itemID === "currency" })
                            if (currency) currency.amount = +modalArgs.amount
                            else settings.startKit.push({
                                itemID: "currency",
                                amount: +modalArgs.amount
                            })
                            await settings.save()
                        }
                    } else return
                }
                if (interaction.customId.includes("xp")) {
                    const modal = new ModalBuilder()
                        .setCustomId(`startKit_xp_${interaction.id}`)
                        .setTitle(`${client.language({ textId: `Опыт`, guildId: interaction.guildId, locale: interaction.locale })}`)
                        .setLabelComponents([
                            new LabelBuilder()
                                .setLabel(`${client.language({ textId: `Количество`, guildId: interaction.guildId, locale: interaction.locale })}`)
                                .setTextInputComponent(
                                    new TextInputBuilder()
                                        .setCustomId("amount")
                                        .setRequired(true)
                                        .setMaxLength(9)
                                        .setStyle(TextInputStyle.Short)
                                        .setValue(`${settings.startKit.find(e => e.itemID === "xp")?.amount || 0}`)
                                )
                        ])
                    await interaction.showModal(modal);delete client.globalCooldown[`${interaction.guildId}_${interaction.user.id}`]
                    const filter = (i) => i.customId === `startKit_xp_${interaction.id}` && i.user.id === interaction.user.id
                    interaction = await interaction.awaitModalSubmit({ filter, time: 180000 }).catch(e => interaction)
                    if (interaction && interaction.isModalSubmit()) {
                        const modalArgs = {}
                        interaction.fields.fields.each(field => modalArgs[field.customId] = field.value)
                        if (!+modalArgs.amount || +modalArgs.amount < 0) {
                            settings.startKit = settings.startKit.filter(e => e.itemID !== "xp")
                            await settings.save()
                        } else {
                            const xp = settings.startKit.find(e => { return e.itemID === "xp" })
                            if (xp) xp.amount = +modalArgs.amount
                            else settings.startKit.push({
                                itemID: "xp",
                                amount: +modalArgs.amount
                            })
                            await settings.save()
                        }
                    } else return
                }
                if (interaction.customId.includes("rp")) {
                    const modal = new ModalBuilder()
                        .setCustomId(`startKit_rp_${interaction.id}`)
                        .setTitle(`${client.language({ textId: `Репутация`, guildId: interaction.guildId, locale: interaction.locale })}`)
                        .setLabelComponents([
                            new LabelBuilder()
                                .setLabel(`${client.language({ textId: `Количество`, guildId: interaction.guildId, locale: interaction.locale })}`)
                                .setTextInputComponent(
                                    new TextInputBuilder()
                                        .setCustomId("amount")
                                        .setRequired(true)
                                        .setMaxLength(5)
                                        .setStyle(TextInputStyle.Short)
                                        .setValue(`${settings.startKit.find(e => e.itemID === "rp")?.amount || 0}`)
                                )
                        ])
                    await interaction.showModal(modal);delete client.globalCooldown[`${interaction.guildId}_${interaction.user.id}`]
                    const filter = (i) => i.customId === `startKit_rp_${interaction.id}` && i.user.id === interaction.user.id
                    interaction = await interaction.awaitModalSubmit({ filter, time: 180000 }).catch(e => interaction)
                    if (interaction && interaction.isModalSubmit()) {
                        const modalArgs = {}
                        interaction.fields.fields.each(field => modalArgs[field.customId] = field.value)
                        if (+modalArgs.amount < -1000) modalArgs.amount = -1000
                        if (+modalArgs.amount > 1000) modalArgs.amount = 1000
                        if (!+modalArgs.amount) {
                            settings.startKit = settings.startKit.filter(e => e.itemID !== "rp")
                            await settings.save()
                        } else {
                            const rp = settings.startKit.find(e => { return e.itemID === "rp" })
                            if (rp) rp.amount = +modalArgs.amount
                            else settings.startKit.push({
                                itemID: "rp",
                                amount: +modalArgs.amount
                            })
                            await settings.save()
                        }
                    } else return
                }
                if (interaction.customId.includes("items")) {
                    const modal = new ModalBuilder()
                        .setCustomId(`startKit_items_${interaction.id}`)
                        .setTitle(`${client.language({ textId: `Предмет`, guildId: interaction.guildId, locale: interaction.locale })}`)
                        .setLabelComponents([
                            new LabelBuilder()
                                .setLabel(`${client.language({ textId: `Название предмета`, guildId: interaction.guildId, locale: interaction.locale })}`)
                                .setTextInputComponent(
                                    new TextInputBuilder()
                                        .setCustomId("item")
                                        .setRequired(true)
                                        .setStyle(TextInputStyle.Short)
                                ),
                            new LabelBuilder()
                                .setLabel(`${client.language({ textId: `Количество`, guildId: interaction.guildId, locale: interaction.locale })}`)
                                .setTextInputComponent(
                                    new TextInputBuilder()
                                        .setCustomId("amount")
                                        .setRequired(true)
                                        .setMaxLength(9)
                                        .setStyle(TextInputStyle.Short)
                                )
                        ])
                    await interaction.showModal(modal);delete client.globalCooldown[`${interaction.guildId}_${interaction.user.id}`]
                    const filter = (i) => i.customId === `startKit_items_${interaction.id}` && i.user.id === interaction.user.id
                    interaction = await interaction.awaitModalSubmit({ filter, time: 180000 }).catch(e => interaction)
                    if (interaction && interaction.isModalSubmit()) {
                        const modalArgs = {}
                        interaction.fields.fields.each(field => modalArgs[field.customId] = field.value)
                        const filteredItems = client.cache.items.filter(e => e.guildID === interaction.guildId && !e.temp && e.name.toLowerCase().includes(modalArgs.item.toLowerCase()))
                        const itemID = filteredItems.some(e => e.name.toLowerCase() === modalArgs.item.toLowerCase()) ? filteredItems.find(e => e.name.toLowerCase() === modalArgs.item.toLowerCase())?.itemID : filteredItems.first()?.itemID
                        if (!itemID) {
                            if (!interaction.deferred) await interaction.deferUpdate().catch(e => null)
                            return interaction.followUp({ content: `${client.language({ textId: `Предмета с названием`, guildId: interaction.guildId, locale: interaction.locale })} **${modalArgs.item}** ${client.language({ textId: `не существует`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
                        } else {
                            if (!+modalArgs.amount) {
                                settings.startKit = settings.startKit.filter(e => e.itemID !== itemID)
                                await settings.save()
                            } else {
                                const item = settings.startKit.find(e => { return e.itemID === itemID })
                                if (item) item.amount = +modalArgs.amount
                                else {
                                    if (settings.startKit.filter(e => e.itemID !== "rp" && e.itemID !== "xp" && e.itemID !== "currency").length < 5) {
                                        settings.startKit.push({
                                            itemID: itemID,
                                            amount: +modalArgs.amount
                                        })    
                                    } else {
                                        if (!interaction.deferred) await interaction.deferUpdate().catch(e => null)
                                        return interaction.followUp({ content: `${client.language({ textId: `Максимальное кол-во предметов в наборе - 5`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
                                    }
                                }
                                await settings.save()
                            }    
                        }
                    } else return
                }
                if (interaction.customId.includes("turn")) {
                    if (settings.startKitEnabled) settings.startKitEnabled = undefined
                    else settings.startKitEnabled = true
                    await settings.save()
                }
                if (!settings.startKit.length) embed.setDescription(`${client.language({ textId: `Стартовый набор отсутствует. В стартовый набор можно добавить валюту, опыт, репутацию и до 5 предметов. При выдаче стартового набора не засчитываются квесты и достижения.`, guildId: interaction.guildId, locale: interaction.locale })}`)
                else {
                    const kit = [settings.startKitEnabled ? `${client.config.emojis.on}${client.language({ textId: `Включен`, guildId: interaction.guildId, locale: interaction.locale })}` : `${client.config.emojis.off}${client.language({ textId: `Выключен`, guildId: interaction.guildId, locale: interaction.locale })}`]
                    for (const element of settings.startKit) {
                        if (element.itemID === "currency") kit.push(`${settings.displayCurrencyEmoji}**${settings.currencyName}** ${element.amount}`)
                        else if (element.itemID === "xp") kit.push(`${client.config.emojis.XP}**${client.language({ textId: `Опыт`, guildId: interaction.guildId, locale: interaction.locale })}** ${element.amount}`)
                        else if (element.itemID === "rp") kit.push(`${client.config.emojis.RP}**${client.language({ textId: `Репутация`, guildId: interaction.guildId, locale: interaction.locale })}** ${element.amount}`)
                        else {
                            const item = client.cache.items.find(e => e.itemID === element.itemID && !e.temp)
                            if (item) {
                                kit.push(`${item.displayEmoji}**${item.name}** ${element.amount}${!item.enabled ? ` (${client.language({ textId: `отключенный`, guildId: interaction.guildId, locale: interaction.locale })})` : ``}`)
                            } else kit.push(`**${element.itemID}** ${element.amount}`)
                        }
                    }
                    embed.setDescription(kit.join("\n"))
                    embed.setFooter({ text: `${client.language({ textId: `Для удаления предмета из стартового набора - введите название предмета и поставьте количество 0`, guildId: interaction.guildId, locale: interaction.locale })}` })
                }
                const hasCurrency = settings.startKit.some(e => e.itemID === "currency")
                const hasXp = settings.startKit.some(e => e.itemID === "xp")
                const hasRp = settings.startKit.some(e => e.itemID === "rp")
                const itemsAmount = settings.startKit.filter(e => e.itemID !== "rp" && e.itemID !== "xp" && e.itemID !== "currency").length
                const currency_btn = new ButtonBuilder().setStyle(hasCurrency ? ButtonStyle.Secondary : ButtonStyle.Success).setEmoji(settings.displayCurrencyEmoji).setCustomId(`cmd{manager-settings}title{startKit}usr{${interaction.user.id}}currency`).setLabel(hasCurrency ? `${client.language({ textId: `Изменить кол-во`, guildId: interaction.guildId, locale: interaction.locale })} ${settings.currencyName}` : `${client.language({ textId: `Добавить`, guildId: interaction.guildId, locale: interaction.locale })} ${settings.currencyName}`)
                const xp_btn = new ButtonBuilder().setStyle(hasXp ? ButtonStyle.Secondary : ButtonStyle.Success).setEmoji(client.config.emojis.XP).setCustomId(`cmd{manager-settings}title{startKit}usr{${interaction.user.id}}xp`).setLabel(hasXp ? `${client.language({ textId: `Изменить кол-во опыта`, guildId: interaction.guildId, locale: interaction.locale })}` : `${client.language({ textId: `Добавить опыт`, guildId: interaction.guildId, locale: interaction.locale })}`)
                const rp_btn = new ButtonBuilder().setStyle(hasRp ? ButtonStyle.Secondary : ButtonStyle.Success).setEmoji(client.config.emojis.RP).setCustomId(`cmd{manager-settings}title{startKit}usr{${interaction.user.id}}rp`).setLabel(hasRp ? `${client.language({ textId: `Изменить кол-во репутации`, guildId: interaction.guildId, locale: interaction.locale })}` : `${client.language({ textId: `Добавить репутацию`, guildId: interaction.guildId, locale: interaction.locale })}`)
                const items_btn = new ButtonBuilder().setStyle(itemsAmount ? ButtonStyle.Secondary : ButtonStyle.Success).setEmoji(client.config.emojis.box).setCustomId(`cmd{manager-settings}title{startKit}usr{${interaction.user.id}}items`).setLabel(itemsAmount ? `${client.language({ textId: `Добавить/изменить/удалить предмет`, guildId: interaction.guildId, locale: interaction.locale })}` : `${client.language({ textId: `Добавить предмет`, guildId: interaction.guildId, locale: interaction.locale })}`)
                const turn_btn = new ButtonBuilder().setStyle(settings.startKitEnabled ? ButtonStyle.Danger : ButtonStyle.Success).setEmoji(settings.startKitEnabled ? client.config.emojis.off : client.config.emojis.on).setCustomId(`cmd{manager-settings}title{startKit}usr{${interaction.user.id}}turn`).setLabel(settings.startKitEnabled ? `${client.language({ textId: `Выключить`, guildId: interaction.guildId, locale: interaction.locale })}` : `${client.language({ textId: `Включить`, guildId: interaction.guildId, locale: interaction.locale })}`)
                if (interaction.replied || interaction.deferred) return interaction.editReply({ embeds: [embed], components: [first_row, new ActionRowBuilder().addComponents([currency_btn, xp_btn, rp_btn, items_btn]), new ActionRowBuilder().addComponents([turn_btn])] })
                return interaction.update({ embeds: [embed], components: [first_row, new ActionRowBuilder().addComponents([currency_btn, xp_btn, rp_btn, items_btn]), new ActionRowBuilder().addComponents([turn_btn])] })
            }
            if (interaction.values?.[0].includes("fishing") || interaction.customId.includes("fishing")) {
                embed.setTitle(title.label)
                if (interaction.customId.includes("edit")) {
                    const modal = new ModalBuilder()
                        .setCustomId(`fishing_edit_${interaction.id}`)
                        .setTitle(`${client.language({ textId: `РЫБАЛКА`, guildId: interaction.guildId, locale: interaction.locale })}`)
                        .setLabelComponents([
                            new LabelBuilder()
                                .setLabel(`${client.language({ textId: `Наживка`, guildId: interaction.guildId, locale: interaction.locale })}`)
                                .setTextInputComponent(
                                    new TextInputBuilder()
                                        .setCustomId("bait")
                                        .setRequired(true)
                                        .setMaxLength(30)
                                        .setStyle(TextInputStyle.Short)
                                        .setValue(`${settings.baitCurrency === "currency" ? settings.currencyName : client.cache.items.find(e => !e.temp && e.itemID === settings.baitCurrency)?.name || settings.baitCurrency}`)
                                ),
                            new LabelBuilder()
                                .setLabel(`${client.language({ textId: `Количество`, guildId: interaction.guildId, locale: interaction.locale })}`)
                                .setTextInputComponent(
                                    new TextInputBuilder()
                                        .setCustomId("amount")
                                        .setRequired(true)
                                        .setMaxLength(9)
                                        .setStyle(TextInputStyle.Short)
                                        .setValue(`${settings.baitPrice}`)
                                ),
                            new LabelBuilder()
                                .setLabel(`${client.language({ textId: `Название`, guildId: interaction.guildId, locale: interaction.locale })}`)
                                .setTextInputComponent(
                                    new TextInputBuilder()
                                        .setCustomId("name")
                                        .setRequired(false)
                                        .setMaxLength(20)
                                        .setStyle(TextInputStyle.Short)
                                        .setValue(`${settings.fishingName || ""}`)
                                ),
                            new LabelBuilder()
                                .setLabel(`${client.language({ textId: `URL иконки`, guildId: interaction.guildId, locale: interaction.locale })}`)
                                .setTextInputComponent(
                                    new TextInputBuilder()
                                        .setCustomId("url")
                                        .setRequired(false)
                                        .setStyle(TextInputStyle.Short)
                                        .setValue(`${settings.fishingIcon || ""}`)
                                )
                        ])
                    await interaction.showModal(modal);delete client.globalCooldown[`${interaction.guildId}_${interaction.user.id}`]
                    const filter = (i) => i.customId === `fishing_edit_${interaction.id}` && i.user.id === interaction.user.id
                    interaction = await interaction.awaitModalSubmit({ filter, time: 180000 }).catch(e => interaction)
                    if (interaction && interaction.isModalSubmit()) {
                        const modalArgs = {}
                        interaction.fields.fields.each(field => modalArgs[field.customId] = field.value)
                        if (modalArgs.bait.toLowerCase() === settings.currencyName.toLowerCase()) settings.baitCurrency = "currency"
                        else {
                            const filteredItems = client.cache.items.filter(e => e.guildID === interaction.guildId && !e.temp && e.name.toLowerCase().includes(modalArgs.bait.toLowerCase()))
                            const itemID = filteredItems.some(e => e.name.toLowerCase() === modalArgs.bait.toLowerCase()) ? filteredItems.find(e => e.name.toLowerCase() === modalArgs.bait.toLowerCase())?.itemID : filteredItems.first()?.itemID
                            if (!itemID) {
                                if (!interaction.deferred) await interaction.deferUpdate().catch(e => null)
                                interaction.followUp({ content: `${client.language({ textId: `Предмета с названием`, guildId: interaction.guildId, locale: interaction.locale })} **${modalArgs.bait}** ${client.language({ textId: `не существует`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
                            } else settings.baitCurrency = itemID
                        }
                        if (+modalArgs.amount < 0) modalArgs.amount = 0
                        if (Number.isNaN(+modalArgs.amount)) {
                            if (!interaction.deferred) await interaction.deferUpdate().catch(e => null)
                            interaction.followUp({ content: `**${modalArgs.amount}** ${client.language({ textId: `не является числом`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
                        } else settings.baitPrice = +modalArgs.amount
                        if (modalArgs.name) settings.fishingName = modalArgs.name
                        else settings.fishingName = undefined
                        if (modalArgs.url) {
                            const isImageURL = require('image-url-validator').default
                            const image = await isImageURL(modalArgs.url)
                            if (image) settings.fishingIcon = modalArgs.url
                            else {
                                if (!interaction.deferred) await interaction.deferUpdate().catch(e => null)
                                interaction.followUp({ content: `${client.language({ textId: `Строка`, guildId: interaction.guildId, locale: interaction.locale })} **${modalArgs.url}** ${client.language({ textId: `не является прямой ссылкой на изображение`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
                            }
                        } else settings.fishingIcon = undefined
                        await settings.save()
                    }
                }
                const description = []
                if (settings.baitCurrency === "currency") {
                    description.push(`${client.language({ textId: `Наживка`, guildId: interaction.guildId, locale: interaction.locale })}: ${settings.displayCurrencyEmoji}**${settings.currencyName}**\n${client.language({ textId: `Количество`, guildId: interaction.guildId, locale: interaction.locale })}: **${settings.baitPrice}**`)
                } else {
                    const item = client.cache.items.find(e => !e.temp && e.itemID === settings.baitCurrency)
                    if (item) {
                        description.push(`${client.language({ textId: `Наживка`, guildId: interaction.guildId, locale: interaction.locale })}: ${item.displayEmoji}**${item.name}**${!item.enabled ? ` (${client.language({ textId: `отключенный`, guildId: interaction.guildId, locale: interaction.locale })})` : ``}\n${client.language({ textId: `Количество`, guildId: interaction.guildId, locale: interaction.locale })}: **${settings.baitPrice}**`)    
                    } else {
                        description.push(`${client.language({ textId: `Наживка`, guildId: interaction.guildId, locale: interaction.locale })}: **${settings.baitCurrency}**\n${client.language({ textId: `Количество`, guildId: interaction.guildId, locale: interaction.locale })}: **${settings.baitPrice}**`)    
                    }
                }
                if (settings.fishingName) description.push(`${client.language({ textId: `Название`, guildId: interaction.guildId, locale: interaction.locale })}: ${settings.fishingName}`)
                if (settings.fishingIcon) description.push(`${client.language({ textId: `Иконка`, guildId: interaction.guildId, locale: interaction.locale })}: ${settings.fishingIcon}`)
                embed.setDescription(description.join("\n"))
                const edit_btn = new ButtonBuilder().setStyle(ButtonStyle.Primary).setLabel(`${client.language({ textId: `Изменить`, guildId: interaction.guildId, locale: interaction.locale })}`).setEmoji(client.config.emojis.edit).setCustomId(`cmd{manager-settings} title{fishing} edit usr{${interaction.user.id}}`)
                const second_row = new ActionRowBuilder().addComponents([edit_btn])
                if (interaction.replied || interaction.deferred) return interaction.editReply({ content: " ", embeds: [embed], components: [first_row, second_row] })
                return interaction.update({ content: " ", embeds: [embed], components: [first_row, second_row] })
            }
            if (interaction.values?.[0].includes("mining") || interaction.customId.includes("mining")) {
                embed.setTitle(title.label)
                if (interaction.customId.includes("edit")) {
                    const modal = new ModalBuilder()
                        .setCustomId(`mining_edit_${interaction.id}`)
                        .setTitle(`${client.language({ textId: `МАЙНИНГ`, guildId: interaction.guildId, locale: interaction.locale })}`)
                        .setLabelComponents([
                            new LabelBuilder()
                                .setLabel(`${client.language({ textId: `Инструмент`, guildId: interaction.guildId, locale: interaction.locale })}`)
                                .setTextInputComponent(
                                    new TextInputBuilder()
                                        .setCustomId("tool")
                                        .setRequired(true)
                                        .setMaxLength(30)
                                        .setStyle(TextInputStyle.Short)
                                        .setValue(`${settings.miningTool === "currency" ? settings.currencyName : client.cache.items.find(e => !e.temp && e.itemID === settings.miningTool)?.name || settings.miningTool}`)
                                ),
                            new LabelBuilder()
                                .setLabel(`${client.language({ textId: `Количество`, guildId: interaction.guildId, locale: interaction.locale })}`)
                                .setTextInputComponent(
                                    new TextInputBuilder()
                                        .setCustomId("amount")
                                        .setRequired(true)
                                        .setMaxLength(9)
                                        .setStyle(TextInputStyle.Short)
                                        .setValue(`${settings.miningPrice}`)
                                ),
                            new LabelBuilder()
                                .setLabel(`${client.language({ textId: `Название`, guildId: interaction.guildId, locale: interaction.locale })}`)
                                .setTextInputComponent(
                                    new TextInputBuilder()
                                        .setCustomId("name")
                                        .setRequired(false)
                                        .setMaxLength(20)
                                        .setStyle(TextInputStyle.Short)
                                        .setValue(`${settings.miningName || ""}`)
                                ),
                            new LabelBuilder()
                                .setLabel(`${client.language({ textId: `URL иконки`, guildId: interaction.guildId, locale: interaction.locale })}`)
                                .setTextInputComponent(
                                    new TextInputBuilder()
                                        .setCustomId("url")
                                        .setRequired(false)
                                        .setStyle(TextInputStyle.Short)
                                        .setValue(`${settings.miningIcon || ""}`)
                                )
                        ])
                    await interaction.showModal(modal);delete client.globalCooldown[`${interaction.guildId}_${interaction.user.id}`]
                    const filter = (i) => i.customId === `mining_edit_${interaction.id}` && i.user.id === interaction.user.id
                    interaction = await interaction.awaitModalSubmit({ filter, time: 180000 }).catch(e => interaction)
                    if (interaction && interaction.isModalSubmit()) {
                        const modalArgs = {}
                        interaction.fields.fields.each(field => modalArgs[field.customId] = field.value)
                        if (modalArgs.tool.toLowerCase() === settings.currencyName.toLowerCase()) settings.miningTool = "currency"
                        else {
                            const filteredItems = client.cache.items.filter(e => e.guildID === interaction.guildId && !e.temp && e.name.toLowerCase().includes(modalArgs.tool.toLowerCase()))
                            const itemID = filteredItems.some(e => e.name.toLowerCase() === modalArgs.tool.toLowerCase()) ? filteredItems.find(e => e.name.toLowerCase() === modalArgs.tool.toLowerCase())?.itemID : filteredItems.first()?.itemID
                            if (!itemID) {
                                if (!interaction.deferred) await interaction.deferUpdate().catch(e => null)
                                interaction.followUp({ content: `${client.language({ textId: `Предмета с названием`, guildId: interaction.guildId, locale: interaction.locale })} **${modalArgs.tool}** ${client.language({ textId: `не существует`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
                            } else settings.miningTool = itemID
                        }
                        if (+modalArgs.amount < 0) modalArgs.amount = 0
                        if (Number.isNaN(+modalArgs.amount)) {
                            if (!interaction.deferred) await interaction.deferUpdate().catch(e => null)
                            interaction.followUp({ content: `**${modalArgs.amount}** ${client.language({ textId: `не является числом`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
                        } else settings.miningPrice = +modalArgs.amount
                        if (modalArgs.name) settings.miningName = modalArgs.name
                        else settings.miningName = undefined
                        if (modalArgs.url) {
                            const isImageURL = require('image-url-validator').default
                            const image = await isImageURL(modalArgs.url)
                            if (image) settings.miningIcon = modalArgs.url
                            else {
                                if (!interaction.deferred) await interaction.deferUpdate().catch(e => null)
                                interaction.followUp({ content: `${client.language({ textId: `Строка`, guildId: interaction.guildId, locale: interaction.locale })} **${modalArgs.url}** ${client.language({ textId: `не является прямой ссылкой на изображение`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
                            }
                        } else settings.miningIcon = undefined
                        await settings.save()
                    }
                }
                const description = []
                if (settings.miningTool == "currency") {
                    description.push(`${client.language({ textId: `Инструмент`, guildId: interaction.guildId, locale: interaction.locale })}: ${settings.displayCurrencyEmoji}**${settings.currencyName}**\n${client.language({ textId: `Количество`, guildId: interaction.guildId, locale: interaction.locale })}: **${settings.miningPrice}**`)
                } else {
                    const item = client.cache.items.find(e => !e.temp && e.itemID === settings.miningTool)
                    if (item) {
                        description.push(`${client.language({ textId: `Инструмент`, guildId: interaction.guildId, locale: interaction.locale })}: ${item.displayEmoji}**${item.name}**${!item.enabled ? ` (${client.language({ textId: `отключенный`, guildId: interaction.guildId, locale: interaction.locale })})` : ``}\n${client.language({ textId: `Количество`, guildId: interaction.guildId, locale: interaction.locale })}: **${settings.miningPrice}**`)    
                    } else {
                        description.push(`${client.language({ textId: `Инструмент`, guildId: interaction.guildId, locale: interaction.locale })}: **${settings.miningTool}**\n${client.language({ textId: `Количество`, guildId: interaction.guildId, locale: interaction.locale })}: **${settings.miningPrice}**`)    
                    }
                }
                if (settings.miningName) description.push(`${client.language({ textId: `Название`, guildId: interaction.guildId, locale: interaction.locale })}: ${settings.miningName}`)
                if (settings.miningIcon) description.push(`${client.language({ textId: `Иконка`, guildId: interaction.guildId, locale: interaction.locale })}: ${settings.miningIcon}`)
                embed.setDescription(description.join("\n"))
                const edit_btn = new ButtonBuilder().setStyle(ButtonStyle.Primary).setLabel(`${client.language({ textId: `Изменить`, guildId: interaction.guildId, locale: interaction.locale })}`).setEmoji(client.config.emojis.edit).setCustomId(`cmd{manager-settings} title{mining} edit usr{${interaction.user.id}}`)
                const second_row = new ActionRowBuilder().addComponents([edit_btn])
                if (interaction.replied || interaction.deferred) return interaction.editReply({ content: " ", embeds: [embed], components: [first_row, second_row] })
                return interaction.update({ content: " ", embeds: [embed], components: [first_row, second_row] })
            }
            if (interaction.values?.[0].includes("seasonLevels") || interaction.customId.includes("seasonLevels")) {
                embed.setTitle(`${title.label}`)
                if (interaction.customId.includes("new season")) {
                    await Promise.all(client.cache.profiles.filter(e => e.guildID === interaction.guildId && (e.seasonLevel !== 1 || e.seasonXp !== 0 || e.seasonTotalXp !== 0)).map(async profile => {
                        profile.seasonLevel = 1
                        profile.seasonXp = 0
                        profile.seasonTotalXp = 0
                        await profile.save()
                    }))
                    settings.lastSeasonReset = new Date()
                    await settings.save()
                }
                if (interaction.customId.includes("levelfactor")) {
                    const modal = new ModalBuilder()
                        .setCustomId(`manager-settings_seasonLevels_levelfactor_${interaction.message.id}`)
                        .setTitle(`${client.language({ textId: `Левел фактор (Сезонный опыт)`, guildId: interaction.guildId, locale: interaction.locale })}`)
                        .setLabelComponents([
                            new LabelBuilder()
                                .setLabel(`${client.language({ textId: `Левел фактор`, guildId: interaction.guildId, locale: interaction.locale })}`)
                                .setTextInputComponent(
                                    new TextInputBuilder()
                                        .setCustomId("amount")
                                        .setRequired(true)
                                        .setValue(`${settings.seasonLevelfactor}`)
                                        .setStyle(TextInputStyle.Short)
                                )
                        ])
                    await interaction.showModal(modal);delete client.globalCooldown[`${interaction.guildId}_${interaction.user.id}`]
                    const filter = (i) => i.customId === `manager-settings_seasonLevels_levelfactor_${interaction.message.id}` && i.user.id === interaction.user.id
                    interaction = await interaction.awaitModalSubmit({ filter, time: 120000 }).catch(e => interaction)
                    if (interaction && interaction.type === InteractionType.ModalSubmit) {
                        const modalArgs = {}
                        interaction.fields.fields.each(field => modalArgs[field.customId] = field.value)
                        await interaction.deferUpdate()
                        let pass = true
                        if (isNaN(+modalArgs.amount) || !Number.isInteger(+modalArgs.amount)) {
                            interaction.followUp({ content: `${client.config.emojis.NO} **${modalArgs.amount}** ${client.language({ textId: `не является целым числом`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
                            pass = false
                        }
                        modalArgs.amount = +modalArgs.amount
                        if (modalArgs.amount < 10 || modalArgs.amount > 5000) {
                            interaction.followUp({ content: `${client.config.emojis.NO} ${client.language({ textId: `Левел фактор не должен быть`, guildId: interaction.guildId, locale: interaction.locale })} < 10 ${client.language({ textId: `или`, guildId: interaction.guildId, locale: interaction.locale })} > 5000`, flags: ["Ephemeral"] })
                            pass = false
                        }
                        if (pass) {
                            settings.seasonLevelfactor = modalArgs.amount
                            await settings.save().catch(e => console.error(e))
                            await Promise.all(client.cache.profiles.filter(e => e.guildID === interaction.guildId).map(async profile => {
                                profile.seasonLevel = 1
                                profile.seasonXp = profile.seasonTotalXp
                                let i = 0
                                while (profile.seasonXp >= profile.seasonLevel * settings.seasonLevelfactor + 100) {
                                    profile.seasonXp -= profile.seasonLevel * settings.seasonLevelfactor + 100
                                    profile.seasonLevel++
                                    i++
                                    if (i > 100000) throw new Error(`Бесконечный цикл: manager-settings:1269, profile.seasonXp: ${profile.seasonXp}, profile.seasonLevel: ${profile.seasonLevel}, settings.seasonLevelfactor: ${settings.seasonLevelfactor}`)
                                }
                                await profile.save()
                            }))
                        }
                    } else return
                }
                if (interaction.customId.includes("days")) {
                    const modal = new ModalBuilder()
                        .setCustomId(`manager-settings_seasonLevels_days_${interaction.message.id}`)
                        .setTitle(`${client.language({ textId: `Дней сезона`, guildId: interaction.guildId, locale: interaction.locale })}`)
                        .setLabelComponents([
                            new LabelBuilder()
                                .setLabel(`${client.language({ textId: `Дни`, guildId: interaction.guildId, locale: interaction.locale })}`)
                                .setTextInputComponent(
                                    new TextInputBuilder()
                                        .setCustomId("amount")
                                        .setRequired(true)
                                        .setValue(`${settings.daysSeason}`)
                                        .setStyle(TextInputStyle.Short)
                                )
                        ])
                    await interaction.showModal(modal);delete client.globalCooldown[`${interaction.guildId}_${interaction.user.id}`]
                    const filter = (i) => i.customId === `manager-settings_seasonLevels_days_${interaction.message.id}` && i.user.id === interaction.user.id
                    interaction = await interaction.awaitModalSubmit({ filter, time: 120000 }).catch(e => interaction)
                    if (interaction && interaction.type === InteractionType.ModalSubmit) {
                        const modalArgs = {}
                        interaction.fields.fields.each(field => modalArgs[field.customId] = field.value)
                        await interaction.deferUpdate()
                        let pass = true
                        if (isNaN(+modalArgs.amount) || !Number.isInteger(+modalArgs.amount)) {
                            interaction.followUp({ content: `${client.config.emojis.NO} **${modalArgs.amount}** ${client.language({ textId: `не является целым числом`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
                            pass = false
                        }
                        modalArgs.amount = +modalArgs.amount
                        if (modalArgs.amount < 7 || modalArgs.amount > 365) {
                            interaction.followUp({ content: `${client.config.emojis.NO} ${client.language({ textId: `Дни не должны быть`, guildId: interaction.guildId, locale: interaction.locale })} < 7 ${client.language({ textId: `или`, guildId: interaction.guildId, locale: interaction.locale })} > 365`, flags: ["Ephemeral"] })
                            pass = false
                        }
                        if (pass) {
                            settings.daysSeason = modalArgs.amount
                            await settings.save()
                        }
                    } else return
                }
                if (interaction.customId.includes("offon")) {
                    if (settings.seasonLevelsEnabled) settings.seasonLevelsEnabled = undefined
                    else settings.seasonLevelsEnabled = true
                    await settings.save()
                }
                if (interaction.customId.includes("{seasonLevels}settings")) {
                    return interaction.reply({ content: `${client.config.emojis.NO} ${client.language({ textId: `Недоступно в BETA версии`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
                }
                const description = [
                    `${client.language({ textId: `Левел фактор`, guildId: interaction.guildId, locale: interaction.locale })}: ${settings.seasonLevelfactor}`,
                    `${client.language({ textId: `Количество дней в сезоне`, guildId: interaction.guildId, locale: interaction.locale })}: ${settings.daysSeason}`,
                    `${client.language({ textId: `Предыдущий сброс`, guildId: interaction.guildId, locale: interaction.locale })}: <t:${Math.floor(settings.lastSeasonReset / 1000)}:R>`,
                    `${client.language({ textId: `Следующий сброс`, guildId: interaction.guildId, locale: interaction.locale })}: <t:${Math.floor(settings.lastSeasonReset / 1000 + settings.daysSeason * 24 * 60 * 60)}:R>`
                ]
                embed.setDescription(description.join("\n"))
                const row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setStyle(settings.seasonLevelsEnabled ? ButtonStyle.Danger : ButtonStyle.Success)
                        .setCustomId(`cmd{manager-settings}usr{${interaction.user.id}}title{seasonLevels}offon`)
                        .setLabel(settings.seasonLevelsEnabled ? `${client.language({ textId: `Выключить`, guildId: interaction.guildId, locale: interaction.locale })}` : `${client.language({ textId: `Включить`, guildId: interaction.guildId, locale: interaction.locale })}`)
                        .setEmoji(settings.seasonLevelsEnabled ? client.config.emojis.off : client.config.emojis.on),
                    new ButtonBuilder()
                        .setStyle(ButtonStyle.Primary)
                        .setCustomId(`cmd{manager-settings}usr{${interaction.user.id}}title{seasonLevels}levelfactor`)
                        .setLabel(`${client.language({ textId: `Левел фактор`, guildId: interaction.guildId, locale: interaction.locale })}`),
                    new ButtonBuilder()
                        .setStyle(ButtonStyle.Primary)
                        .setCustomId(`cmd{manager-settings}usr{${interaction.user.id}}title{seasonLevels}days`)
                        .setLabel(`${client.language({ textId: `Кол-во дней`, guildId: interaction.guildId, locale: interaction.locale })}`),
                    new ButtonBuilder()
                        .setStyle(ButtonStyle.Primary)
                        .setCustomId(`cmd{manager-settings}usr{${interaction.user.id}}title{seasonLevels}new season`)
                        .setLabel(`${client.language({ textId: `Новый сезон`, guildId: interaction.guildId, locale: interaction.locale })}`),
                    // new ButtonBuilder()
                    //     .setStyle(ButtonStyle.Secondary)
                    //     .setCustomId(`cmd{manager-settings}usr{${interaction.user.id}}title{seasonLevels}settings`)
                    //     .setLabel(`${client.language({ textId: `Настройки сброса`, guildId: interaction.guildId, locale: interaction.locale })}`)
                )
                if (interaction.replied || interaction.deferred) return interaction.editReply({ embeds: [embed], components: [first_row, row] })
                else return interaction.update({ embeds: [embed], components: [first_row, row] })
            }
            if (interaction.values?.[0].includes("marketSettings") || interaction.customId.includes("marketSettings")) {
                embed.setTitle(`${title.label}`)
                if (interaction.customId.includes("channel")) {
                    const components = JSON.parse(JSON.stringify(interaction.message.components))
                    interaction.message.components.forEach(row => row.components.forEach(component => {
                        component.data.disabled = true
                    }))
                    await interaction.update({ components: interaction.message.components })
                    await interaction.followUp({ 
                        components: [
                            new ActionRowBuilder()
                                .addComponents(
                                    new ChannelSelectMenuBuilder()
                                        .setCustomId(`channel`)
                                        .setPlaceholder(`${client.language({ textId: `Выбери канал`, guildId: interaction.guildId, locale: interaction.locale })}...`)
                                        .setChannelTypes(ChannelType.GuildText, ChannelType.GuildVoice, ChannelType.GuildAnnouncement, ChannelType.PrivateThread, ChannelType.PublicThread)
                                ),
                            new ActionRowBuilder().addComponents(
                                new ButtonBuilder()
                                    .setCustomId("channelCancel")
                                    .setLabel(client.language({ textId: `ОТМЕНА`, guildId: interaction.guildId, locale: interaction.locale }))
                                    .setStyle(ButtonStyle.Danger),
                                new ButtonBuilder()
                                    .setCustomId("channelDelete")
                                    .setLabel(client.language({ textId: `УДАЛИТЬ`, guildId: interaction.guildId, locale: interaction.locale }))
                                    .setStyle(ButtonStyle.Danger),
                            
                            )
                        ],
                        flags: ["Ephemeral"]
                    })    
                    const filter = (i) => i.customId.includes(`channel`) && i.user.id === interaction.user.id
                    let interaction2 = await interaction.channel.awaitMessageComponent({ filter, time: 30000 }).catch(e => null)
                    if (interaction2 && interaction2.customId.includes("channel")) {
                        if (interaction2.customId === "channel") {
                            const channel = interaction2.channels.first()
                            if (!channel.permissionsFor(interaction.guild.members.me).has("SendMessages") || !channel.permissionsFor(interaction.guild.members.me).has("ReadMessageHistory") || !channel.permissionsFor(interaction.guild.members.me).has("ViewChannel")) {
                                interaction2.update({ content: `${client.config.emojis.NO} ${client.language({ textId: `Для канала`, guildId: interaction.guildId, locale: interaction.locale })} <#${channel.id}> ${client.language({ textId: `мне нужны следующие права`, guildId: interaction.guildId, locale: interaction.locale })}:\n1. ${client.language({ textId: `Просмотр канала`, guildId: interaction.guildId, locale: interaction.locale })}\n2. ${client.language({ textId: `Отправлять сообщения`, guildId: interaction.guildId, locale: interaction.locale })}\n2. ${client.language({ textId: `Читать историю сообщений`, guildId: interaction.guildId, locale: interaction.locale })}`, components: [], flags: ["Ephemeral"] })
                                return interaction.editReply({ components: components })
                            }
                            settings.channels.marketChannel = channel.id
                            await settings.save()
                            interaction2.update({ content: `${client.config.emojis.YES}`, components: [] })
                        } else if (interaction2.customId === "channelDelete") {
                            settings.channels.marketChannel = undefined
                            await settings.save()
                            interaction2.update({ content: `${client.config.emojis.YES}`, components: [] })
                        } else {
                            interaction2.update({ content: `${client.config.emojis.YES} ${client.language({ textId: `Выбор отменён`, guildId: interaction.guildId, locale: interaction.locale })}`, components: [] })
                            return interaction.editReply({ components: components })
                        }
                    } else return interaction.editReply({ components: components })
                }
                if (interaction.customId.includes("marketStorageLifeDays")) {
                    const modal = new ModalBuilder()
                        .setCustomId(`manager-settings_marketSettings_storageLife_${interaction.message.id}`)
                        .setTitle(`${client.language({ textId: `Срок хранения лотов`, guildId: interaction.guildId, locale: interaction.locale })}`)
                        .setLabelComponents([
                            new LabelBuilder()
                                .setLabel(`${client.language({ textId: `Дни`, guildId: interaction.guildId, locale: interaction.locale })}`)
                                .setTextInputComponent(
                                    new TextInputBuilder()
                                        .setCustomId("days")
                                        .setRequired(true)
                                        .setValue(`${settings.marketStorageLifeDays}`)
                                        .setStyle(TextInputStyle.Short)
                                        .setPlaceholder(`${client.language({ textId: `0 - неограниченно`, guildId: interaction.guildId, locale: interaction.locale })}`)
                                )
                        ])
                    await interaction.showModal(modal);delete client.globalCooldown[`${interaction.guildId}_${interaction.user.id}`]
                    const filter = (i) => i.customId === `manager-settings_marketSettings_storageLife_${interaction.message.id}` && i.user.id === interaction.user.id
                    interaction = await interaction.awaitModalSubmit({ filter, time: 120000 }).catch(e => interaction)
                    if (interaction && interaction.type === InteractionType.ModalSubmit) {
                        const modalArgs = {}
                        interaction.fields.fields.each(field => modalArgs[field.customId] = field.value)
                        if (isNaN(+modalArgs.days) || !Number.isInteger(+modalArgs.days)) {
                            return interaction.reply({ content: `${client.config.emojis.NO} **${modalArgs.days}** ${client.language({ textId: `не является целым числом`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
                        }
                        modalArgs.days = +modalArgs.days
                        if (modalArgs.days < 0 || modalArgs.days > 365) {
                            return interaction.reply({ content: `${client.config.emojis.NO} ${client.language({ textId: `Количество дней не должно быть`, guildId: interaction.guildId, locale: interaction.locale })} < 0 ${client.language({ textId: `или`, guildId: interaction.guildId, locale: interaction.locale })} > 365`, flags: ["Ephemeral"] })
                        }
                        settings.marketStorageLifeDays = modalArgs.days
                        await settings.save()
                    } else return
                }
                const description = [
                    `${client.language({ textId: `Канал для публикации лотов`, guildId: interaction.guildId, locale: interaction.locale })}: ${settings.channels.marketChannel ? `<#${interaction.guild.channels.cache.get(settings.channels.marketChannel)?.id}>` : `<${client.language({ textId: `Отсутствует`, guildId: interaction.guildId, locale: interaction.locale })}>`}`,
                    `${client.language({ textId: `Срок хранения лотов на маркете`, guildId: interaction.guildId, locale: interaction.locale })}: ${settings.marketStorageLifeDays ? `${settings.marketStorageLifeDays} ${client.language({ textId: `дней`, guildId: interaction.guildId, locale: interaction.locale })}` : `${client.language({ textId: `Неограниченно`, guildId: interaction.guildId, locale: interaction.locale })}`}`
                ]
                embed.setDescription(description.join("\n"))
                const row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setStyle(ButtonStyle.Secondary)
                        .setCustomId(`cmd{manager-settings}usr{${interaction.user.id}}title{marketSettings}channel`)
                        .setLabel(`${client.language({ textId: `Канал для публикации лотов`, guildId: interaction.guildId, locale: interaction.locale })}`)
                        .setEmoji(client.config.emojis.numbersign),
                    new ButtonBuilder()
                        .setStyle(ButtonStyle.Secondary)
                        .setCustomId(`cmd{manager-settings}usr{${interaction.user.id}}title{marketSettings}marketStorageLifeDays`)
                        .setLabel(`${client.language({ textId: `Срок хранения лотов на маркете`, guildId: interaction.guildId, locale: interaction.locale })}`)
                )
                if (interaction.replied || interaction.deferred) return interaction.editReply({ embeds: [embed], components: [first_row, row] })
                else return interaction.update({ embeds: [embed], components: [first_row, row] })
            }
            if (interaction.values?.[0].includes("boosters") || interaction.customId.includes("boosters")) {
                embed.setTitle(`${title.label}`)
                if (interaction.customId.includes("edit")) {
                    const value = interaction.values[0]
                    const modal = new ModalBuilder()
                        .setCustomId(`manager-settings_boosters_${value}_${interaction.id}`)
                        .setTitle(`${client.language({ textId: `${value}`, guildId: interaction.guildId, locale: interaction.locale })}`)
                        .setLabelComponents([
                            new LabelBuilder()
                                .setLabel(`%`)
                                .setTextInputComponent(
                                    new TextInputBuilder()
                                        .setCustomId("multiplier")
                                        .setValue(`${settings[value]?.multiplier ? settings[value].multiplier * 100 : 0}`)
                                        .setStyle(TextInputStyle.Short)
                                        .setMaxLength(4)
                                ),
                            new LabelBuilder()
                                .setLabel(`${client.language({ textId: `Минуты`, guildId: interaction.guildId, locale: interaction.locale })}`)
                                .setTextInputComponent(
                                    new TextInputBuilder()
                                        .setCustomId("until")
                                        .setValue(`${settings[value]?.until && settings[value]?.until - new Date() > 0 ? Math.floor((settings[value].until - new Date())/1000/60) : " "}`)
                                        .setStyle(TextInputStyle.Short)
                                        .setRequired(false)
                                        .setMaxLength(10)
                                )
                        ])
                    await interaction.showModal(modal);delete client.globalCooldown[`${interaction.guildId}_${interaction.user.id}`]
                    const filter = (i) => i.customId === `manager-settings_boosters_${value}_${interaction.id}` && i.user.id === interaction.user.id
                    interaction = await interaction.awaitModalSubmit({ filter, time: 120000 }).catch(e => interaction)
                    if (interaction && interaction.type === InteractionType.ModalSubmit) {
                        const modalArgs = {}
                        interaction.fields.fields.each(field => modalArgs[field.customId] = field.value)
                        if (isNaN(+modalArgs.multiplier) || !Number.isInteger(+modalArgs.multiplier)) {
                            return interaction.reply({ content: `${client.config.emojis.NO} **${modalArgs.multiplier}** ${client.language({ textId: `не является целым числом`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
                        }
                        if (isNaN(+modalArgs.until) || !Number.isInteger(+modalArgs.until)) {
                            return interaction.reply({ content: `${client.config.emojis.NO} **${modalArgs.until}** ${client.language({ textId: `не является целым числом`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
                        }
                        modalArgs.multiplier = +modalArgs.multiplier
                        if (modalArgs.multiplier !== 0) modalArgs.multiplier = modalArgs.multiplier / 100
                        if (modalArgs.until) {
                            modalArgs.until = +modalArgs.until
                        }
                        if (!modalArgs.until || modalArgs.until <= 0) modalArgs.until = undefined
                        else modalArgs.until = new Date(Date.now() + modalArgs.until * 60 * 1000)
                        if (value !== "luck_booster" && modalArgs.multiplier < 0) {
                            return interaction.reply({ content: `${client.config.emojis.NO} ${client.language({ textId: `Число не должно быть`, guildId: interaction.guildId, locale: interaction.locale })} < 0`, flags: ["Ephemeral"] })
                        }
                        if (!settings[value]) settings[value] = {
                            multiplier: 0
                        }
                        settings[value].multiplier = modalArgs.multiplier
                        settings[value].until = modalArgs.until
                        await settings.save()
                    } else return
                }
                if (interaction.customId.includes("mode")) {
                    settings.global_boosters_stacking = !settings.global_boosters_stacking
                    await settings.save()
                }
                embed.setDescription([
                    `${client.language({ textId: `Режим складывания бустеров`, guildId: interaction.guildId, locale: interaction.locale })}: ${settings.global_boosters_stacking ? `${client.language({ textId: `Бустеры складываются`, guildId: interaction.guildId, locale: interaction.locale })}` : `${client.language({ textId: `Бустеры не складываются, выбирается наибольший бустер (профильный бустер, глобальный бустер, бустер канала)`, guildId: interaction.guildId, locale: interaction.locale })}`}`,
                    `${client.config.emojis.XP}${client.language({ textId: `Глобальный бустер опыта`, guildId: interaction.guildId, locale: interaction.locale })}: ${(!settings.xp_booster) || (settings.xp_booster.until && settings.xp_booster.until < new Date()) || (!settings.xp_booster.multiplier) ? `${client.language({ textId: `Отсутствует`, guildId: interaction.guildId, locale: interaction.locale })}` : `${settings.xp_booster.multiplier * 100}% ${client.language({ textId: `для всех пользователей`, guildId: interaction.guildId, locale: interaction.locale })} ${settings.xp_booster.until ? `${client.language({ textId: `until`, guildId: interaction.guildId, locale: interaction.locale })} <t:${Math.floor(settings.xp_booster.until/1000)}:f>` : ""}`}`,
                    `${client.config.emojis.random}${client.language({ textId: `Глобальный бустер удачи`, guildId: interaction.guildId, locale: interaction.locale })}: ${(!settings.luck_booster) || (settings.luck_booster.until && settings.luck_booster.until < new Date()) || (!settings.luck_booster.multiplier) ? `${client.language({ textId: `Отсутствует`, guildId: interaction.guildId, locale: interaction.locale })}` : `${settings.luck_booster.multiplier * 100}% ${client.language({ textId: `для всех пользователей`, guildId: interaction.guildId, locale: interaction.locale })} ${settings.luck_booster.until ? `${client.language({ textId: `until`, guildId: interaction.guildId, locale: interaction.locale })} <t:${Math.floor(settings.luck_booster.until/1000)}:f>` : ""}`}`,
                    `${settings.displayCurrencyEmoji}${client.language({ textId: `Глобальный бустер валюты`, guildId: interaction.guildId, locale: interaction.locale })}: ${(!settings.cur_booster) || (settings.cur_booster.until && settings.cur_booster.until < new Date()) || (!settings.cur_booster.multiplier) ? `${client.language({ textId: `Отсутствует`, guildId: interaction.guildId, locale: interaction.locale })}` : `${settings.cur_booster.multiplier * 100}% ${client.language({ textId: `для всех пользователей`, guildId: interaction.guildId, locale: interaction.locale })} ${settings.cur_booster.until ? `${client.language({ textId: `until`, guildId: interaction.guildId, locale: interaction.locale })} <t:${Math.floor(settings.cur_booster.until/1000)}:f>` : ""}`}`,
                    `${client.config.emojis.RP}${client.language({ textId: `Глобальный бустер репутации`, guildId: interaction.guildId, locale: interaction.locale })}: ${(!settings.rp_booster) || (settings.rp_booster.until && settings.rp_booster.until < new Date()) || (!settings.rp_booster.multiplier) ? `${client.language({ textId: `Отсутствует`, guildId: interaction.guildId, locale: interaction.locale })}` : `${settings.rp_booster.multiplier * 100}% ${client.language({ textId: `для всех пользователей`, guildId: interaction.guildId, locale: interaction.locale })} ${settings.rp_booster.until ? `${client.language({ textId: `until`, guildId: interaction.guildId, locale: interaction.locale })} <t:${Math.floor(settings.rp_booster.until/1000)}:f>` : ""}`}`
                ].join("\n"))
                const second_row = new ActionRowBuilder().addComponents([new StringSelectMenuBuilder().setCustomId(`cmd{manager-settings} title{boosters} edit usr{${interaction.user.id}}`).addOptions([
                    {
                        label: `${client.language({ textId: `Бустер опыта`, guildId: interaction.guildId, locale: interaction.locale })}`,
                        description: `${client.language({ textId: `Установить бустер опыта для всех пользователей`, guildId: interaction.guildId, locale: interaction.locale })}`,
                        value: `xp_booster`,
                        emoji: client.config.emojis.XP
                    },
                    {
                        label: `${client.language({ textId: `Бустер удачи`, guildId: interaction.guildId, locale: interaction.locale })}`,
                        description: `${client.language({ textId: `Установить бустер удачи для всех пользователей`, guildId: interaction.guildId, locale: interaction.locale })}`,
                        value: `luck_booster`,
                        emoji: client.config.emojis.random
                    },
                    {
                        label: `${client.language({ textId: `Бустер валюты`, guildId: interaction.guildId, locale: interaction.locale })}`,
                        description: `${client.language({ textId: `Установить бустер валюты для всех пользователей`, guildId: interaction.guildId, locale: interaction.locale })}`,
                        value: `cur_booster`,
                        emoji: settings.displayCurrencyEmoji
                    },
                    {
                        label: `${client.language({ textId: `Бустер репутации`, guildId: interaction.guildId, locale: interaction.locale })}`,
                        description: `${client.language({ textId: `Установить бустер репутации для всех пользователей`, guildId: interaction.guildId, locale: interaction.locale })}`,
                        value: `rp_booster`,
                        emoji: client.config.emojis.RP
                    },
                ])])
                const third_row = new ActionRowBuilder().addComponents([new ButtonBuilder().setCustomId(`cmd{manager-settings} title{boosters} mode usr{${interaction.user.id}}`).setLabel(`${client.language({ textId: `Переключить режим складывания бустеров`, guildId: interaction.guildId, locale: interaction.locale })}`).setStyle(ButtonStyle.Primary)])
                return interaction.update({ embeds: [embed], components: [first_row, second_row, third_row]})
            }
            if (interaction.values?.[0].includes("auctions") || interaction.customId.includes("auctions")) {
                embed.setTitle(`${title.label}`)
                if (interaction.isStringSelectMenu()) {
                    if (interaction.values[0] === "channel") {
                        const components = JSON.parse(JSON.stringify(interaction.message.components))
                        interaction.message.components.forEach(row => row.components.forEach(component => {
                            component.data.disabled = true
                        }))
                        await interaction.update({ components: interaction.message.components })
                        await interaction.followUp({ 
                            components: [
                                new ActionRowBuilder()
                                    .addComponents(
                                        new ChannelSelectMenuBuilder()
                                            .setCustomId(`channel`)
                                            .setPlaceholder(`${client.language({ textId: `Выбери канал`, guildId: interaction.guildId, locale: interaction.locale })}...`)
                                            .setChannelTypes(ChannelType.GuildText, ChannelType.GuildVoice, ChannelType.GuildAnnouncement, ChannelType.PrivateThread, ChannelType.PublicThread)
                                    ),
                                new ActionRowBuilder().addComponents(
                                    new ButtonBuilder()
                                        .setCustomId("channelCancel")
                                        .setLabel(client.language({ textId: `ОТМЕНА`, guildId: interaction.guildId, locale: interaction.locale }))
                                        .setStyle(ButtonStyle.Danger),
                                    new ButtonBuilder()
                                        .setCustomId("channelDelete")
                                        .setLabel(client.language({ textId: `УДАЛИТЬ`, guildId: interaction.guildId, locale: interaction.locale }))
                                        .setStyle(ButtonStyle.Danger),
                                )
                            ],
                            flags: ["Ephemeral"]
                        })    
                        const filter = (i) => i.customId.includes(`channel`) && i.user.id === interaction.user.id
                        let interaction2 = await interaction.channel.awaitMessageComponent({ filter, time: 30000 }).catch(e => interaction)
                        if (interaction2 && interaction2.customId.includes("channel")) {
                            if (interaction2.customId === "channel") {
                                const channel = interaction2.channels.first()
                                if (!channel.permissionsFor(interaction.guild.members.me).has("SendMessages") || !channel.permissionsFor(interaction.guild.members.me).has("ReadMessageHistory") || !channel.permissionsFor(interaction.guild.members.me).has("ViewChannel")) {
                                    interaction2.update({ content: `${client.config.emojis.NO} ${client.language({ textId: `Для канала`, guildId: interaction.guildId, locale: interaction.locale })} <#${channel.id}> ${client.language({ textId: `мне нужны следующие права`, guildId: interaction.guildId, locale: interaction.locale })}:\n1. ${client.language({ textId: `Просмотр канала`, guildId: interaction.guildId, locale: interaction.locale })}\n2. ${client.language({ textId: `Отправлять сообщения`, guildId: interaction.guildId, locale: interaction.locale })}\n2. ${client.language({ textId: `Читать историю сообщений`, guildId: interaction.guildId, locale: interaction.locale })}`, components: [], flags: ["Ephemeral"] })
                                    return interaction.editReply({ components: components })
                                }
                                settings.channels.auctionsChannelId = channel.id
                                await settings.save()
                                interaction2.update({ content: `${client.config.emojis.YES}`, components: [] })
                            } else if (interaction2.customId === "channelDelete") {
                                settings.channels.auctionsChannelId = undefined
                                await settings.save()
                                interaction2.update({ content: `${client.config.emojis.YES}`, components: [] })
                            } else {
                                interaction2.update({ content: `${client.config.emojis.YES} ${client.language({ textId: `Выбор отменён`, guildId: interaction.guildId, locale: interaction.locale })}`, components: [] })
                                return interaction.editReply({ components: components })
                            }
                        } else return interaction.editReply({ components: components })
                    } else if (interaction.values[0] === "permission") {
                        if (!client.cache.permissions.some(e => e.guildID === interaction.guildId)) {
                            return interaction.reply({ content: `${client.config.emojis.NO} ${client.language({ textId: `На сервере не найдено созданных прессетов прав. Для создания прессета используй команду </manager-permissions create:1150455842294988943>.`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
                        }
                        const modal = new ModalBuilder()
                            .setCustomId(`permission_${interaction.id}`)
                            .setTitle(`${client.language({ textId: `Установка права`, guildId: interaction.guildId, locale: interaction.locale })}`)
                            .setLabelComponents([
                                new LabelBuilder()
                                    .setLabel(`${client.language({ textId: `Название права`, guildId: interaction.guildId, locale: interaction.locale })}`)
                                    .setTextInputComponent(
                                        new TextInputBuilder()
                                            .setCustomId("name")
                                            .setRequired(false)
                                            .setValue(`${client.cache.permissions.find(e => e.id === settings.auctions_permission)?.name || ""}`)
                                            .setStyle(TextInputStyle.Short)
                                    )
                            ])
                        await interaction.showModal(modal);delete client.globalCooldown[`${interaction.guildId}_${interaction.user.id}`]
                        const filter = (i) => i.customId === `permission_${interaction.id}` && i.user.id === interaction.user.id
                        interaction = await interaction.awaitModalSubmit({ filter, time: 120000 }).catch(e => interaction)
                        if (interaction && interaction.type === InteractionType.ModalSubmit) {
                            const modalArgs = {}
                            interaction.fields.fields.each(field => modalArgs[field.customId] = field.value)
                            if (!modalArgs.name) {
                                settings.auctions_permission = undefined
                                await settings.save()
                            } else {
                                const permission = client.cache.permissions.find(e => e.name.toLowerCase() === modalArgs.name.toLowerCase() && e.guildID === interaction.guildId)
                                if (!permission) {
                                    return interaction.reply({ content: `${client.config.emojis.NO} ${client.language({ textId: `Права с названием`, guildId: interaction.guildId, locale: interaction.locale })} **${modalArgs.name}** ${client.language({ textId: `не существует`, guildId: interaction.guildId, locale: interaction.locale })}` })
                                } else {
                                    settings.auctions_permission = permission.id
                                    await settings.save()
                                }
                            }
                        } else return
                    }    
                }
                embed.setDescription([
                    `${client.language({ textId: `Канал для публикации аукционов`, guildId: interaction.guildId, locale: interaction.locale })}: ${settings.channels.auctionsChannelId ? `<#${interaction.guild.channels.cache.get(settings.channels.auctionsChannelId)?.id}>` : `<${client.language({ textId: `Отсутствует`, guildId: interaction.guildId, locale: interaction.locale })}>`}`,
                    `${client.language({ textId: `Право для создания аукционов`, guildId: interaction.guildId, locale: interaction.locale })}: ${settings.auctions_permission ? `${client.cache.permissions.get(settings.auctions_permission)?.name || `<${client.language({ textId: `Отсутствует`, guildId: interaction.guildId, locale: interaction.locale })}>`}` : `<${client.language({ textId: `Отсутствует`, guildId: interaction.guildId, locale: interaction.locale })}>` }`
                ].join("\n"))
                const second_row = new ActionRowBuilder().addComponents([new StringSelectMenuBuilder().setCustomId(`cmd{manager-settings} title{auctions} edit usr{${interaction.user.id}}`).addOptions([
                    {
                        label: `${client.language({ textId: `Канал для аукционов`, guildId: interaction.guildId, locale: interaction.locale })}`,
                        description: `${client.language({ textId: `Установить канал для аукционов`, guildId: interaction.guildId, locale: interaction.locale })}`,
                        value: `channel`,
                        emoji: undefined
                    },
                    {
                        label: `${client.language({ textId: `Право для создания аукционов`, guildId: interaction.guildId, locale: interaction.locale })}`,
                        description: `${client.language({ textId: `Установить право для создания аукционов`, guildId: interaction.guildId, locale: interaction.locale })}`,
                        value: `permission`,
                        emoji: undefined
                    }
                ])])
                if (interaction.replied || interaction.deferred) return interaction.editReply({ embeds: [embed], components: [first_row, second_row]})
                else return interaction.update({ embeds: [embed], components: [first_row, second_row]})
            }
            if (interaction.values?.[0].includes("currency") || interaction.customId.includes("currency")) {
                embed.setTitle(title.label)
                if (interaction.isStringSelectMenu()) {
                    if (interaction.values[0] === "currency_name_description") {
                        const bannedWords = [
                            "description",
                            "\\n",
                            "itemID",
                            "currency",
                            "xp",
                            "rp",
                            "item",
                            "null",
                            "undefined"
                        ]
                        const modal = new ModalBuilder()
                            .setCustomId(`currency_name_description_${interaction.id}`)
                            .setTitle(`${client.language({ textId: client.language({ textId: `Изменить название, описание валюты`, guildId: interaction.guildId, locale: interaction.locale }), guildId: interaction.guildId, locale: interaction.locale })}`)
                            .setLabelComponents([
                                new LabelBuilder()
                                    .setLabel(`${client.language({ textId: `Название`, guildId: interaction.guildId, locale: interaction.locale })}`)
                                    .setTextInputComponent(
                                        new TextInputBuilder()
                                            .setCustomId("name")
                                            .setValue(`${settings.currencyName}`)
                                            .setStyle(TextInputStyle.Short)
                                            .setMaxLength(20)
                                            .setRequired(true)
                                    ),
                                new LabelBuilder()
                                    .setLabel(`${client.language({ textId: `Описание`, guildId: interaction.guildId, locale: interaction.locale })}`)
                                    .setTextInputComponent(
                                        new TextInputBuilder()
                                            .setCustomId("description")
                                            .setValue(`${settings.currencyDescription}`)
                                            .setStyle(TextInputStyle.Paragraph)
                                            .setRequired(true)
                                            .setMaxLength(200)
                                    )
                            ])
                        await interaction.showModal(modal);delete client.globalCooldown[`${interaction.guildId}_${interaction.user.id}`]
                        const filter = (i) => i.customId === `currency_name_description_${interaction.id}` && i.user.id === interaction.user.id
                        interaction = await interaction.awaitModalSubmit({ filter, time: 120000 }).catch(e => interaction)
                        if (interaction && interaction.type === InteractionType.ModalSubmit) {
                            const modalArgs = {}
                            interaction.fields.fields.each(field => modalArgs[field.customId] = field.value)
                            if (bannedWords.some(word => modalArgs.name.toLowerCase().includes(word))) {
                                return interaction.reply({ content: `${client.config.emojis.NO} ${client.language({ textId: `Название`, guildId: interaction.guildId, locale: interaction.locale })} **${modalArgs.name}** ${client.language({ textId: `содержит запрещенные слова. Запрещенные слова`, guildId: interaction.guildId, locale: interaction.locale })}:\n${bannedWords.join(`\n`)}`, flags: ["Ephemeral"] })
                            }
                            settings.currencyName = modalArgs.name
                            settings.currencyDescription = modalArgs.description
                            await settings.save()
                        } else return
                    } else if (interaction.values[0] === "currencyEmoji") {
                        const command = client.interactions.get("emoji-selector")
					    return command.run(client, interaction, {}, "currency", "0")
                    } else if (interaction.values[0] === "currency_no_transfer") {
                        settings.currency_no_transfer = !settings.currency_no_transfer
                        await settings.save()
                    } else if (interaction.values[0] === "currency_no_drop") {
                        settings.currency_no_drop = !settings.currency_no_drop
                        await settings.save()
                    } else if (interaction.values[0] === "currency_transfer_permission") {
                        if (!client.cache.permissions.some(e => e.guildID === interaction.guildId)) {
                            return interaction.reply({ content: `${client.config.emojis.NO} ${client.language({ textId: `На сервере не найдено созданных прессетов прав. Для создания прессета используй команду </manager-permissions create:1150455842294988943>.`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
                        }
                        const modal = new ModalBuilder()
                            .setCustomId(`permission_${interaction.id}`)
                            .setTitle(`${client.language({ textId: `Установка права`, guildId: interaction.guildId, locale: interaction.locale })}`)
                            .setLabelComponents([
                                new LabelBuilder()
                                    .setLabel(`${client.language({ textId: `Название права`, guildId: interaction.guildId, locale: interaction.locale })}`)
                                    .setTextInputComponent(
                                        new TextInputBuilder()
                                            .setCustomId("name")
                                            .setRequired(false)
                                            .setValue(`${client.cache.permissions.find(e => e.id === settings.currency_transfer_permission)?.name || ""}`)
                                            .setStyle(TextInputStyle.Short)
                                    )
                            ])
                        await interaction.showModal(modal);delete client.globalCooldown[`${interaction.guildId}_${interaction.user.id}`]
                        const filter = (i) => i.customId === `permission_${interaction.id}` && i.user.id === interaction.user.id
                        interaction = await interaction.awaitModalSubmit({ filter, time: 120000 }).catch(e => interaction)
                        if (interaction && interaction.type === InteractionType.ModalSubmit) {
                            const modalArgs = {}
                            interaction.fields.fields.each(field => modalArgs[field.customId] = field.value)
                            if (!modalArgs.name) {
                                settings.currency_transfer_permission = undefined
                                await settings.save()
                            } else {
                                const permission = client.cache.permissions.find(e => e.name.toLowerCase() === modalArgs.name.toLowerCase() && e.guildID === interaction.guildId)
                                if (!permission) {
                                    return interaction.reply({ content: `${client.config.emojis.NO} ${client.language({ textId: `Права с названием`, guildId: interaction.guildId, locale: interaction.locale })} **${modalArgs.name}** ${client.language({ textId: `не существует`, guildId: interaction.guildId, locale: interaction.locale })}` })
                                } else {
                                    settings.currency_transfer_permission = permission.id
                                    await settings.save()
                                }
                            }
                        } else return
                    } else if (interaction.values[0] === "currency_drop_permission") {
                        if (!client.cache.permissions.some(e => e.guildID === interaction.guildId)) {
                            return interaction.reply({ content: `${client.config.emojis.NO} ${client.language({ textId: `На сервере не найдено созданных прессетов прав. Для создания прессета используй команду </manager-permissions create:1150455842294988943>.`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
                        }
                        const modal = new ModalBuilder()
                            .setCustomId(`permission_${interaction.id}`)
                            .setTitle(`${client.language({ textId: `Установка права`, guildId: interaction.guildId, locale: interaction.locale })}`)
                            .setLabelComponents([
                                new LabelBuilder()
                                    .setLabel(`${client.language({ textId: `Название права`, guildId: interaction.guildId, locale: interaction.locale })}`)
                                    .setTextInputComponent(
                                        new TextInputBuilder()
                                            .setCustomId("name")
                                            .setRequired(false)
                                            .setValue(`${client.cache.permissions.find(e => e.id === settings.currency_drop_permission)?.name || ""}`)
                                            .setStyle(TextInputStyle.Short)
                                    )
                            ])
                        await interaction.showModal(modal);delete client.globalCooldown[`${interaction.guildId}_${interaction.user.id}`]
                        const filter = (i) => i.customId === `permission_${interaction.id}` && i.user.id === interaction.user.id
                        interaction = await interaction.awaitModalSubmit({ filter, time: 120000 }).catch(e => interaction)
                        if (interaction && interaction.type === InteractionType.ModalSubmit) {
                            const modalArgs = {}
                            interaction.fields.fields.each(field => modalArgs[field.customId] = field.value)
                            if (!modalArgs.name) {
                                settings.currency_drop_permission = undefined
                                await settings.save()
                            } else {
                                const permission = client.cache.permissions.find(e => e.name.toLowerCase() === modalArgs.name.toLowerCase() && e.guildID === interaction.guildId)
                                if (!permission) {
                                    return interaction.reply({ content: `${client.config.emojis.NO} ${client.language({ textId: `Права с названием`, guildId: interaction.guildId, locale: interaction.locale })} **${modalArgs.name}** ${client.language({ textId: `не существует`, guildId: interaction.guildId, locale: interaction.locale })}` })
                                } else {
                                    settings.currency_drop_permission = permission.id
                                    await settings.save()
                                }
                            }
                        } else return
                    }
                }
                embed.setDescription([
                    `${client.language({ textId: `Валюта`, guildId: interaction.guildId, locale: interaction.locale })}: ${settings.displayCurrencyEmoji}**${settings.currencyName}**`,
                    `\`\`\`${settings.currencyDescription}\`\`\``,
                    `${client.language({ textId: `Можно передать`, guildId: interaction.guildId, locale: interaction.locale })}: ${settings.currency_no_transfer ? `${client.language({ textId: `Нет`, guildId: interaction.guildId, locale: interaction.locale })}` : `${client.language({ textId: `Да`, guildId: interaction.guildId, locale: interaction.locale })}`}`,
                    `${client.language({ textId: `Можно выбросить`, guildId: interaction.guildId, locale: interaction.locale })}: ${settings.currency_no_drop ? `${client.language({ textId: `Нет`, guildId: interaction.guildId, locale: interaction.locale })}` : `${client.language({ textId: `Да`, guildId: interaction.guildId, locale: interaction.locale })}`}`,
                    `${client.language({ textId: `Право на передачу`, guildId: interaction.guildId, locale: interaction.locale })}: ${settings.currency_transfer_permission ? `${client.cache.permissions.get(settings.currency_transfer_permission)?.name || `<${client.language({ textId: `Отсутствует`, guildId: interaction.guildId, locale: interaction.locale })}>`}` : `<${client.language({ textId: `Отсутствует`, guildId: interaction.guildId, locale: interaction.locale })}>` }`,
                    `${client.language({ textId: `Право на выбрасывание`, guildId: interaction.guildId, locale: interaction.locale })}: ${settings.currency_drop_permission ? `${client.cache.permissions.get(settings.currency_drop_permission)?.name || `<${client.language({ textId: `Отсутствует`, guildId: interaction.guildId, locale: interaction.locale })}>`}` : `<${client.language({ textId: `Отсутствует`, guildId: interaction.guildId, locale: interaction.locale })}>` }`
                ].join("\n"))
                return interaction.update({ embeds: [embed], components: [first_row, new ActionRowBuilder().setComponents([
                    new StringSelectMenuBuilder()
                        .setCustomId(`cmd{manager-settings}title{currency}usr{${interaction.user.id}}`)
                        .setOptions([
                            {
                                emoji: client.config.emojis.edit,
                                label: client.language({ textId: `Изменить название, описание валюты`, guildId: interaction.guildId, locale: interaction.locale }),
                                value: `currency_name_description`
                            },
                            {
                                emoji: client.config.emojis.edit,
                                label: client.language({ textId: `Изменить эмодзи валюты`, guildId: interaction.guildId, locale: interaction.locale }),
                                value: `currencyEmoji`
                            },
                            {
                                emoji: client.config.emojis.edit,
                                label: client.language({ textId: `Можно передать`, guildId: interaction.guildId, locale: interaction.locale }),
                                value: `currency_no_transfer`
                            },
                            {
                                emoji: client.config.emojis.edit,
                                label: client.language({ textId: `Можно выбросить`, guildId: interaction.guildId, locale: interaction.locale }),
                                value: `currency_no_drop`
                            },
                            {
                                emoji: client.config.emojis.crown,
                                label: client.language({ textId: `Право на передачу`, guildId: interaction.guildId, locale: interaction.locale }),
                                value: `currency_transfer_permission`
                            },
                            {
                                emoji: client.config.emojis.crown,
                                label: client.language({ textId: `Право на выбрасывание`, guildId: interaction.guildId, locale: interaction.locale }),
                                value: `currency_drop_permission`
                            }
                        ])
                ])] })
            }
            if ((interaction.replied || interaction.deferred)) await interaction.editReply({ components: [new ActionRowBuilder().addComponents(new ButtonBuilder().setEmoji("⏳").setStyle(ButtonStyle.Secondary).setCustomId(`0`).setDisabled(true))]})
            else await interaction.update({ components: [new ActionRowBuilder().addComponents(new ButtonBuilder().setEmoji("⏳").setStyle(ButtonStyle.Secondary).setCustomId(`0`).setDisabled(true))]})
            if (interaction.values?.[0].includes("shop") || interaction.customId.includes("shop")) {
                const types = ["shopName", "shopMessages", "shopThumbnail"]
                if (types.includes(interaction.values[0])) {
                    if (interaction.values[0] == "shopName") {
                        await interaction.editReply({ embeds: interaction.message.embeds, components: [] })
                        const message = await interaction.followUp({ content: `**${client.language({ textId: `Напиши в чат название магазина`, guildId: interaction.guildId, locale: interaction.locale })}.**\n> ${client.language({ textId: `Для отмены введи`, guildId: interaction.guildId, locale: interaction.locale })}: cancel.` })
                        const collected = await waitingForShopName(client, interaction, filter)
                        message.delete().catch(e => null)
                        if (collected) {
                            settings.shopName = collected
                            await settings.save()
                        }
                    }
                    if (interaction.values[0] == "shopMessages") {
                        await interaction.editReply({ embeds: interaction.message.embeds, components: [] })
                        const message = await interaction.followUp({ content: `**${client.language({ textId: `Напиши в чат сообщение для магазина`, guildId: interaction.guildId, locale: interaction.locale })}.**\n> ${client.language({ textId: `Для отмены введи`, guildId: interaction.guildId, locale: interaction.locale })}: cancel.\n> ${client.language({ textId: `Можете употреблять переменные`, guildId: interaction.guildId, locale: interaction.locale })}: **{member}** - ${client.language({ textId: `имя пользователя`, guildId: interaction.guildId, locale: interaction.locale })}, **{currency}** - ${client.language({ textId: `кол-во валюты у пользователя`, guildId: interaction.guildId, locale: interaction.locale })}, **{guild}** - ${client.language({ textId: `название сервера`, guildId: interaction.guildId, locale: interaction.locale })}\n> ${client.language({ textId: `Для удаления всех сообщений`, guildId: interaction.guildId, locale: interaction.locale })}: clear.` })
                        const collected = await waitingForShopMessage(client, interaction, filter)
                        message.delete().catch(e => null)
                        if (collected) {
                            if (collected == "clear") {
                                settings.shopMessages = []
                                await settings.save()
                            }
                            else if (settings.shopMessages.some(e => e.toLowerCase() == collected.toLowerCase())) {
                                settings.shopMessages = settings.shopMessages.filter(e => e.toLowerCase() !== collected.toLowerCase())    
                                await settings.save()
                                
                            } else {
                                if (settings.shopMessages.length >= 10) interaction.followUp({ content: `${client.config.emojis.NO} ${client.language({ textId: `Сообщение`, guildId: interaction.guildId, locale: interaction.locale })} [**${collected}**] ${client.language({ textId: `не добавлено`, guildId: interaction.guildId, locale: interaction.locale })}. ${client.language({ textId: `Превышен лимит`, guildId: interaction.guildId, locale: interaction.locale })}: 10 ${client.language({ textId: `сообщений`, guildId: interaction.guildId, locale: interaction.locale })}.`, flags: ["Ephemeral"] })
                                else {
                                    settings.shopMessages.push(collected)
                                    await settings.save()
                                }
                            }
                        }
                    }
                    if (interaction.values[0] == "shopThumbnail") {
                        await interaction.editReply({ embeds: interaction.message.embeds, components: [] })
                        const message = await interaction.followUp({ content: `**${client.language({ textId: `Напиши в чат прямую ссылку на изображение для магазина`, guildId: interaction.guildId, locale: interaction.locale })}.**\n> ${client.language({ textId: `Для отмены введи`, guildId: interaction.guildId, locale: interaction.locale })}: cancel.\n> ${client.language({ textId: `Для удаления введи`, guildId: interaction.guildId, locale: interaction.locale })}: delete.` })
                        const collected = await waitingForShopThumbnail(client, interaction, filter)
                        message.delete().catch(e => null)
                        if (collected) {
                            if (collected == "delete") {
                                settings.shopThumbnail = null
                                await settings.save()
                            } else {
                                settings.shopThumbnail = collected
                                await settings.save()
                            }
                        }
                    }
                }
                embed.setTitle(title.label)
                const options = [
                    { emoji: client.config.emojis.name, label: `${client.language({ textId: `Изменить название магазина`, guildId: interaction.guildId, locale: interaction.locale })}`, value: `shopName`, description: settings.shopName?.slice(0, 100) || undefined },
                    { emoji: client.config.emojis.balloon, label: `${client.language({ textId: `Добавить/удалить сообщения магазина`, guildId: interaction.guildId, locale: interaction.locale })}`, value: `shopMessages` },
                    { emoji: client.config.emojis.picture, label: `${client.language({ textId: `Изменить изображение магазина`, guildId: interaction.guildId, locale: interaction.locale })}`, value: `shopThumbnail` },
                ]
                const profile = await client.functions.fetchProfile(client, interaction.user.id, interaction.guildId)
                embed.setDescription(`${client.language({ textId: `Название магазина`, guildId: interaction.guildId, locale: interaction.locale })}: ${settings.shopName || client.language({ textId: `Магазин`, guildId: interaction.guildId, locale: interaction.locale })}\n${client.language({ textId: `Сообщения магазина`, guildId: interaction.guildId, locale: interaction.locale })}: ${settings.shopMessages.length ? settings.shopMessages.map(e => {
                    e = e.replace(/{member}/i, interaction.member.displayName)
                    e = e.replace(/{currency}/i, profile.currency.toFixed())
                    e = e.replace(/{guild}/i, interaction.guild?.name)
                    return `[**${e}**]`
                }).join(", ") : [`**${client.language({ textId: `Я и не сомневался что ты придешь.`, guildId: interaction.guildId, locale: interaction.locale })}**`, `**${client.language({ textId: `У меня для тебя есть специальное предложение.`, guildId: interaction.guildId, locale: interaction.locale })}**`, `**${client.language({ textId: `У меня есть очень хорошее предложение для тебя.`, guildId: interaction.guildId, locale: interaction.locale })}**`, `**${client.language({ textId: `Что покупаем?`, guildId: interaction.guildId, locale: interaction.locale })}**`, `**${client.language({ textId: `Бусты, роли, еда! У меня есть все что ты захочешь.`, guildId: interaction.guildId, locale: interaction.locale })}**`, `**${client.language({ textId: `Извини`, guildId: interaction.guildId, locale: interaction.locale })} ${interaction.member.displayName}. ${client.language({ textId: `Я не могу предоставить тебе кредит. Возвращайся когда будешь... мммм... побогаче!`, guildId: interaction.guildId, locale: interaction.locale })}**`, `**${client.language({ textId: `У меня есть все что ты захочешь.`, guildId: interaction.guildId, locale: interaction.locale })}**`, `**${client.language({ textId: `Лучше не заходи с пустым кошельком.`, guildId: interaction.guildId, locale: interaction.locale })}**`, `**${client.language({ textId: `У меня всегда есть предложение.`, guildId: interaction.guildId, locale: interaction.locale })}**`, `**${client.language({ textId: `WETBOT доволен тобой, но я буду более довольным, если ты купишь у меня пару вещей!`, guildId: interaction.guildId, locale: interaction.locale })}**`, `**${client.language({ textId: `Если тебе нужны снасти, то они у меня есть.`, guildId: interaction.guildId, locale: interaction.locale })}**`].join(", ")}\n${client.language({ textId: `Сообщения магазина`, guildId: interaction.guildId, locale: interaction.locale })}: ${settings.shopThumbnail || `${client.language({ textId: `НЕТ`, guildId: interaction.guildId, locale: interaction.locale })}` }`)
                embed.setThumbnail(settings.shopThumbnail?.length ? settings.shopThumbnail : null)
                const second_row = new ActionRowBuilder().addComponents([new StringSelectMenuBuilder().setCustomId(`cmd{manager-settings} title{shop} usr{${interaction.user.id}}`).addOptions(options).setPlaceholder(`${client.language({ textId: `Выбери для изменения`, guildId: interaction.guildId, locale: interaction.locale })}`)])
                return interaction.editReply({ content: " ", embeds: [embed], components: [first_row, second_row] })
            }
            if (interaction.values?.[0].includes("channels") || interaction.customId.includes("channels")) {
                embed.setTitle(title.label)
                const types = ["wipe", "achievementsNotificationChannelId", "itemsNotificationChannelId", "levelNotificationChannelId", "mutedChannels", "botChannelId", "generalChannelId"]
                if (types.includes(interaction.values[0])) {
                    if (interaction.values[0] == "mutedChannels") {
                        await interaction.editReply({ embeds: interaction.message.embeds, components: [] })
                        const message = await interaction.followUp({ content: `**${client.language({ textId: `Пингани в чат каналы или напиши их ID через пробел для добавления или удаления из исключенных каналов. Напр.`, guildId: interaction.guildId, locale: interaction.locale })}: #${client.language({ textId: `канал`, guildId: interaction.guildId, locale: interaction.locale })}1 #${client.language({ textId: `канал`, guildId: interaction.guildId, locale: interaction.locale })}2 801818825795305539 802882544969318420.**\n> ${client.language({ textId: `Для отмены введи`, guildId: interaction.guildId, locale: interaction.locale })}: cancel.` })
                        const collected = await waitingForMutedChannel(client, interaction, filter, settings)
                        message.delete().catch(e => null)
                        if (collected.length) {
                            for (let channel of collected) {
                                if (settings.channels?.mutedChannels.includes(channel)) {
                                    settings.channels.mutedChannels = settings.channels.mutedChannels.filter(e => e !== channel)
                                } else {
                                    settings.channels.mutedChannels.push(channel)
                                }
                            }
                            await settings.save()
                            
                        }
                    }
                    if (interaction.values[0] == "botChannelId") {
                        await interaction.editReply({ embeds: interaction.message.embeds, components: [] })
                        const message = await interaction.followUp({ content: `**${client.language({ textId: `Пингани в чат канал где будут появляться уведомления от`, guildId: interaction.guildId, locale: interaction.locale })} ${client.user.username}.**\n> ${client.language({ textId: `Для удаления введи`, guildId: interaction.guildId, locale: interaction.locale })}: delete.\n> ${client.language({ textId: `Для отмены введи`, guildId: interaction.guildId, locale: interaction.locale })}: cancel.` })
                        const collected = await waitingForChannelId(client, interaction, filter)
                        message.delete().catch(e => null)
                        if (collected) {
                            if (collected == "delete") {
                                settings.channels.botChannelId = undefined
                                await settings.save()
                            } else {
                                settings.channels.botChannelId = collected.id
                                await settings.save()
                            }
                        }
                    }
                    if (interaction.values[0] == "levelNotificationChannelId") {
                        await interaction.editReply({ embeds: interaction.message.embeds, components: [] })
                        const message = await interaction.followUp({ content: `**${client.language({ textId: `Пингани в чат канал где будут появляться уведомления о новых уровнях`, guildId: interaction.guildId, locale: interaction.locale })}.**\n> ${client.language({ textId: `Для удаления введи`, guildId: interaction.guildId, locale: interaction.locale })}: delete.\n> ${client.language({ textId: `Для отмены введи`, guildId: interaction.guildId, locale: interaction.locale })}: cancel.` })
                        const collected = await waitingForChannelId(client, interaction, filter)
                        message.delete().catch(e => null)
                        if (collected) {
                            if (collected == "delete") {
                                settings.channels.levelNotificationChannelId = undefined
                                await settings.save()
                            } else {
                                settings.channels.levelNotificationChannelId = collected.id
                                await settings.save()
                            }
                        }
                    }
                    if (interaction.values[0] == "itemsNotificationChannelId") {
                        await interaction.editReply({ embeds: interaction.message.embeds, components: [] })
                        const message = await interaction.followUp({ content: `**${client.language({ textId: `Пингани в чат канал где будут появляться уведомления о найденных предметах`, guildId: interaction.guildId, locale: interaction.locale })}.**\n> ${client.language({ textId: `Для удаления введи`, guildId: interaction.guildId, locale: interaction.locale })}: delete.\n> ${client.language({ textId: `Для отмены введи`, guildId: interaction.guildId, locale: interaction.locale })}: cancel.` })
                        const collected = await waitingForChannelId(client, interaction, filter)
                        message.delete().catch(e => null)
                        if (collected) {
                            if (collected == "delete") {
                                settings.channels.itemsNotificationChannelId = undefined
                                await settings.save()
                            } else {
                                settings.channels.itemsNotificationChannelId = collected.id
                                await settings.save()  
                            }
                        }
                    }
                    if (interaction.values[0] == "achievementsNotificationChannelId") {
                        await interaction.editReply({ embeds: interaction.message.embeds, components: [] })
                        const message = await interaction.followUp({ content: `**${client.language({ textId: `Пингани в чат канал где будут появляться уведомления о полученных достижениях`, guildId: interaction.guildId, locale: interaction.locale })}.**\n> ${client.language({ textId: `Для удаления введи`, guildId: interaction.guildId, locale: interaction.locale })}: delete.\n> ${client.language({ textId: `Для отмены введи`, guildId: interaction.guildId, locale: interaction.locale })}: cancel.` })
                        const collected = await waitingForChannelId(client, interaction, filter)
                        message.delete().catch(e => null)
                        if (collected) {
                            if (collected == "delete") {
                                settings.channels.achievmentsNotificationChannelId = undefined
                                await settings.save()
                            } else {
                                settings.channels.achievmentsNotificationChannelId = collected.id
                                await settings.save()
                            }
                        }
                    }
                    if (interaction.values[0] == "generalChannelId") {
                        await interaction.editReply({ embeds: interaction.message.embeds, components: [] })
                        const message = await interaction.followUp({ content: `**${client.language({ textId: `Пингани в чат общий канал для общения`, guildId: interaction.guildId, locale: interaction.locale })}.**\n> ${client.language({ textId: `Для удаления введи`, guildId: interaction.guildId, locale: interaction.locale })}: delete.\n> ${client.language({ textId: `Для отмены введи`, guildId: interaction.guildId, locale: interaction.locale })}: cancel.` })
                        const collected = await waitingForChannelId(client, interaction, filter)
                        message.delete().catch(e => null)
                        if (collected) {
                            if (collected == "delete") {
                                settings.channels.generalChannelId = undefined
                                await settings.save()
                            } else {
                                settings.channels.generalChannelId = collected.id
                                await settings.save()
                            }
                        }
                    }
                    if (interaction.values[0] == "wipe") {
                        settings.channels.mutedChannels = []
                        await settings.save()
                    }
                }
                const channels_options = [
                    { emoji: client.config.emojis.plus, label: `${client.language({ textId: `Добавить/Удалить канал в/из список(а) исключенных`, guildId: interaction.guildId, locale: interaction.locale })}`, value: `mutedChannels` },
                    { emoji: "🤖", label: `${client.language({ textId: `Канал для уведомлений от`, guildId: interaction.guildId, locale: interaction.locale })} ${client.user.username}`, value: `botChannelId`, description: `${client.language({ textId: `Установленный канал`, guildId: interaction.guildId, locale: interaction.locale })}: ${settings.channels?.botChannelId ? `${await interaction.guild.channels.fetch(settings.channels.botChannelId).then(channel => channel.name).catch(e => null)}` : `${client.language({ textId: `НЕТ`, guildId: interaction.guildId, locale: interaction.locale })}`}` },
                    { emoji: client.config.emojis.top, label: `${client.language({ textId: `Канал для уведомлений о новых уровнях`, guildId: interaction.guildId, locale: interaction.locale })}`, value: `levelNotificationChannelId`, description: `${client.language({ textId: `Установленный канал`, guildId: interaction.guildId, locale: interaction.locale })}: ${settings.channels?.levelNotificationChannelId ? `${await interaction.guild.channels.fetch(settings.channels.levelNotificationChannelId).then(channel => channel.name).catch(e => null)}` : `${client.language({ textId: `НЕТ`, guildId: interaction.guildId, locale: interaction.locale })}`}` },
                    { emoji: client.config.emojis.box, label: `${client.language({ textId: `Канал для уведомлений о найденных предметах`, guildId: interaction.guildId, locale: interaction.locale })}`, value: `itemsNotificationChannelId`, description: `${client.language({ textId: `Установленный канал`, guildId: interaction.guildId, locale: interaction.locale })}: ${settings.channels?.itemsNotificationChannelId ? `${await interaction.guild.channels.fetch(settings.channels.itemsNotificationChannelId).then(channel => channel.name).catch(e => null)}` : `${client.language({ textId: `НЕТ`, guildId: interaction.guildId, locale: interaction.locale })}`}` },
                    { emoji: client.config.emojis.achievements, label: `${client.language({ textId: `Канал для уведомлений о полученных достижениях`, guildId: interaction.guildId, locale: interaction.locale })}`, value: `achievementsNotificationChannelId`, description: `${client.language({ textId: `Установленный канал`, guildId: interaction.guildId, locale: interaction.locale })}: ${settings.channels?.achievmentsNotificationChannelId ? `${await interaction.guild.channels.fetch(settings.channels.achievmentsNotificationChannelId).then(channel => channel.name).catch(e => null)}` : `${client.language({ textId: `НЕТ`, guildId: interaction.guildId, locale: interaction.locale })}`}` },
                    { emoji: client.config.emojis.message, label: `${client.language({ textId: `Общий чат`, guildId: interaction.guildId, locale: interaction.locale })}`, value: `generalChannelId`, description: `${client.language({ textId: `Установленный канал`, guildId: interaction.guildId, locale: interaction.locale })}: ${settings.channels?.generalChannelId ? `${await interaction.guild.channels.fetch(settings.channels.generalChannelId).then(channel => channel.name).catch(e => null)}` : `${client.language({ textId: `НЕТ`, guildId: interaction.guildId, locale: interaction.locale })}`}` },
                    { emoji: client.config.emojis.NO, label: `${client.language({ textId: `Очистить список исключенных каналов`, guildId: interaction.guildId, locale: interaction.locale })}`, value: `wipe` },
                ]
                let muted_channels = ""
                for (const channel of settings.channels?.mutedChannels) {
                    muted_channels += `\n> <#${channel}> (**${channel}**)`
                }
                embed.setDescription(`${client.config.emojis.block} ${client.language({ textId: `Исключенные каналы для получения опыта, валюты, предметов, репутации, достижений и выполнения квестов`, guildId: interaction.guildId, locale: interaction.locale })}: ${muted_channels}`.slice(0, 4096))
                embed.addFields([{ name: `${client.language({ textId: `Каналы`, guildId: interaction.guildId, locale: interaction.locale })}:`, value: `> ${client.language({ textId: `Канал для уведомлений от`, guildId: interaction.guildId, locale: interaction.locale })} ${client.user.username}: ${settings.channels?.botChannelId ? `<#${settings.channels.botChannelId}> (**${settings.channels.botChannelId}**)` : `${client.language({ textId: `НЕТ`, guildId: interaction.guildId, locale: interaction.locale })}`}\n> ${client.language({ textId: `Канал для уведомлений о новых уровнях`, guildId: interaction.guildId, locale: interaction.locale })}: ${settings.channels?.levelNotificationChannelId ? `<#${settings.channels.levelNotificationChannelId}> (**${settings.channels.levelNotificationChannelId}**)` : `${client.language({ textId: `НЕТ`, guildId: interaction.guildId, locale: interaction.locale })}`}\n> ${client.language({ textId: `Канал для уведомлений о найденных предметах`, guildId: interaction.guildId, locale: interaction.locale })}: ${settings.channels?.itemsNotificationChannelId ? `<#${settings.channels.itemsNotificationChannelId}> (**${settings.channels.itemsNotificationChannelId}**)` : `${client.language({ textId: `НЕТ`, guildId: interaction.guildId, locale: interaction.locale })}`}\n> ${client.language({ textId: `Канал для уведомлений о полученных достижениях`, guildId: interaction.guildId, locale: interaction.locale })}: ${settings.channels?.achievmentsNotificationChannelId ? `<#${settings.channels.achievmentsNotificationChannelId}> (**${settings.channels.achievmentsNotificationChannelId}**)` : `${client.language({ textId: `НЕТ`, guildId: interaction.guildId, locale: interaction.locale })}`}\n> ${client.language({ textId: `Общий чат`, guildId: interaction.guildId, locale: interaction.locale })}: ${settings.channels?.generalChannelId ? `<#${settings.channels.generalChannelId}> (**${settings.channels.generalChannelId}**)` : `${client.language({ textId: `НЕТ`, guildId: interaction.guildId, locale: interaction.locale })}`}` }])
                const second_row = new ActionRowBuilder().addComponents([new StringSelectMenuBuilder().setCustomId(`cmd{manager-settings} title{channels} usr{${interaction.user.id}}`).addOptions(channels_options).setPlaceholder(`${client.language({ textId: `Выбери для изменения`, guildId: interaction.guildId, locale: interaction.locale })}`)])
                return interaction.editReply({ content: " ", embeds: [embed], components: [first_row, second_row] })
            }   
            if (interaction.values?.[0].includes("roles") || interaction.customId.includes("roles")) {
                embed.setTitle(title.label)
                const types = ["mutedRoles", "rolesToNewMember", "wormholesNotification", "bumpNotification", "mutedWipe", "rolesTNMWipe"]
                if (types.includes(interaction.values[0])) {
                    if (interaction.values[0] == "mutedRoles") {
                        await interaction.editReply({ embeds: interaction.message.embeds, components: [] })
                        const message = await interaction.followUp({ content: `**${client.language({ textId: `Пингани в чат роли или напиши их ID через пробел для добавления или удаления из исключенных ролей. Напр.`, guildId: interaction.guildId, locale: interaction.locale })}: @${client.language({ textId: `роль`, guildId: interaction.guildId, locale: interaction.locale })}1 @${client.language({ textId: `роль`, guildId: interaction.guildId, locale: interaction.locale })}2 801818825795305539 802882544969318420.**\n> ${client.language({ textId: `Для отмены введи`, guildId: interaction.guildId, locale: interaction.locale })}: cancel.` })
                        const collected = await waitingForMutedRoles(client, interaction, filter, settings)
                        message.delete().catch(e => null)
                        if (collected.length) {
                            for (let role of collected) {
                                if (settings.roles?.mutedRoles.includes(role)) {
                                    settings.roles.mutedRoles = settings.roles.mutedRoles.filter(e => e !== role)
                                } else {
                                    settings.roles.mutedRoles.push(role)
                                }
                            }
                            await settings.save()
                            
                        }
                    }
                    if (interaction.values[0] == "rolesToNewMember") {
                        await interaction.editReply({ embeds: interaction.message.embeds, components: [] })
                        const message = await interaction.followUp({ content: `**${client.language({ textId: `Пингани в чат роли или напиши их ID через пробел для добавления или удаления из списка ролей для новых пользователей. Напр.`, guildId: interaction.guildId, locale: interaction.locale })}: @${client.language({ textId: `роль`, guildId: interaction.guildId, locale: interaction.locale })}1 @${client.language({ textId: `роль`, guildId: interaction.guildId, locale: interaction.locale })}2 801818825795305539 802882544969318420.**\n> ${client.language({ textId: `Для отмены введи`, guildId: interaction.guildId, locale: interaction.locale })}: cancel.` })
                        const collected = await waitingForRolesToNewMember(client, interaction, filter, settings)
                        message.delete().catch(e => null)
                        if (collected.length) {
                            for (let role of collected) {
                                if (settings.roles?.rolesToNewMember.includes(role)) {
                                    settings.roles.rolesToNewMember = settings.roles.rolesToNewMember.filter(e => e !== role)
                                } else {
                                    if (settings.roles.rolesToNewMember.length >= 10) {
                                        interaction.followUp({ content: `${client.language({ textId: `Роль`, guildId: interaction.guildId, locale: interaction.locale })} <@&${role}> ${client.language({ textId: `не была добавлена, поскольку вы достигли максимум ролей для новых участников`, guildId: interaction.guildId, locale: interaction.locale })}: 10`, flags: ["Ephemeral"] })
                                    } else {
                                        settings.roles.rolesToNewMember.push(role)  
                                    }
                                }
                            }
                            await settings.save()
                            
                        }
                    }
                    if (interaction.values[0] == "wormholesNotification") {
                        await interaction.editReply({ embeds: interaction.message.embeds, components: [] })
                        const message = await interaction.followUp({ content: `${client.language({ textId: `Пингани в чат роль для уведомления о червоточине`, guildId: interaction.guildId, locale: interaction.locale })}.\n> ${client.language({ textId: `Для удаления введи`, guildId: interaction.guildId, locale: interaction.locale })}: **delete**\n> ${client.language({ textId: `Для отмены введи`, guildId: interaction.guildId, locale: interaction.locale })}: **cancel**` })
                        const collected = await waitingForRoleId(client, interaction, filter)
                        message.delete().catch(e => null)
                        if (collected) {
                            if (collected == "delete") {
                                settings.roles.wormholesNotification = undefined
                                await settings.save()
                            } else {
                                settings.roles.wormholesNotification = collected.id
                                await settings.save()
                            }
                        }
                    }
                    if (interaction.values[0] == "bumpNotification") {
                        await interaction.editReply({ embeds: interaction.message.embeds, components: [] })
                        const message = await interaction.followUp({ content: `${client.language({ textId: `Пингани в чат роль для уведомления о бампе`, guildId: interaction.guildId, locale: interaction.locale })}.\n> ${client.language({ textId: `Для удаления введи`, guildId: interaction.guildId, locale: interaction.locale })}: **delete**\n> ${client.language({ textId: `Для отмены введи`, guildId: interaction.guildId, locale: interaction.locale })}: **cancel**` })
                        const collected = await waitingForRoleId(client, interaction, filter)
                        message.delete().catch(e => null)
                        if (collected) {
                            if (collected == "delete") {
                                settings.roles.bumpNotification = undefined
                                await settings.save()
                            } else {
                                settings.roles.bumpNotification = collected.id
                                await settings.save()
                            }
                        }
                    }
                    if (interaction.values[0] == "mutedWipe") {
                        settings.roles.mutedRoles = []
                        await settings.save()
                    }
                    if (interaction.values[0] == "rolesTNMWipe") {
                        settings.roles.rolesToNewMember = []
                        await settings.save()
                    }
                }
                const roles_options = [
                    { emoji: client.config.emojis.plus, label: `${client.language({ textId: `Добавить/Удалить роль в/из список(а) исключенных`, guildId: interaction.guildId, locale: interaction.locale })}`, value: `mutedRoles` },
                    { emoji: client.config.emojis.plus, label: `${client.language({ textId: `Добавить/Удалить роль в/из список(а) для новых участников`, guildId: interaction.guildId, locale: interaction.locale })}`, value: `rolesToNewMember` },
                    { emoji: client.config.emojis.wormhole, label: `${client.language({ textId: `Роль для уведомлений о червоточине`, guildId: interaction.guildId, locale: interaction.locale })}`, value: `wormholesNotification`, description: `${client.language({ textId: `Установленная роль`, guildId: interaction.guildId, locale: interaction.locale })}: ${settings.roles?.wormholesNotification ? `${interaction.guild.roles.cache.get(settings.roles.wormholesNotification)?.name}` : `${client.language({ textId: `НЕТ`, guildId: interaction.guildId, locale: interaction.locale })}`}` },
                    { emoji: client.config.emojis.upvote, label: `${client.language({ textId: `Роль для уведомлений о бампе`, guildId: interaction.guildId, locale: interaction.locale })}`, value: `bumpNotification`, description: `${client.language({ textId: `Установленная роль`, guildId: interaction.guildId, locale: interaction.locale })}: ${settings.roles?.bumpNotification ? `${interaction.guild.roles.cache.get(settings.roles.bumpNotification)?.name}` : `${client.language({ textId: `НЕТ`, guildId: interaction.guildId, locale: interaction.locale })}`}` },
                    { emoji: client.config.emojis.NO, label: `${client.language({ textId: `Очистить список исключенных ролей`, guildId: interaction.guildId, locale: interaction.locale })}`, value: `mutedWipe` },
                    { emoji: client.config.emojis.NO, label: `${client.language({ textId: `Очистить список ролей для новых участников`, guildId: interaction.guildId, locale: interaction.locale })}`, value: `rolesTNMWipe` },
                ]
                let muted_roles = ""
                for (const role of settings.roles?.mutedRoles) {
                    muted_roles += `\n> <@&${role}> (**${role}**)`
                }
                let roles_to_new_member = ""
                for (const role of settings.roles?.rolesToNewMember) {
                    roles_to_new_member += `\n> <@&${role}> (**${role}**)`
                }
                const values = [
                    `> ${client.language({ textId: `Роль для уведомлений о червоточине`, guildId: interaction.guildId, locale: interaction.locale })}: ${settings.roles?.wormholesNotification ? `<@&${settings.roles.wormholesNotification}> (**${settings.roles.wormholesNotification}**)` : `${client.language({ textId: `НЕТ`, guildId: interaction.guildId, locale: interaction.locale })}`}`,
                    `> ${client.language({ textId: `Роль для уведомлений о бампе`, guildId: interaction.guildId, locale: interaction.locale })}: ${settings.roles?.bumpNotification ? `<@&${settings.roles.bumpNotification}> (**${settings.roles.bumpNotification}**)` : `${client.language({ textId: `НЕТ`, guildId: interaction.guildId, locale: interaction.locale })}`}`,
                ]
                embed.setDescription(`${client.config.emojis.block} ${client.language({ textId: `Исключенные роли для получения опыта, валюты, предметов, репутации, достижений и выполнения квестов`, guildId: interaction.guildId, locale: interaction.locale })}: ${muted_roles}\n${client.config.emojis.roles}${client.language({ textId: `Роли для нового участника сервера`, guildId: interaction.guildId, locale: interaction.locale })}: ${roles_to_new_member}`.slice(0, 4096))
                embed.addFields([{ name: `${client.language({ textId: `Роли`, guildId: interaction.guildId, locale: interaction.locale })}:`, value: values.join("\n") }])
                const second_row = new ActionRowBuilder().addComponents([new StringSelectMenuBuilder().setCustomId(`cmd{manager-settings} title{roles} usr{${interaction.user.id}}`).addOptions(roles_options).setPlaceholder(`${client.language({ textId: `Выбери для изменения`, guildId: interaction.guildId, locale: interaction.locale })}`)])
                return interaction.editReply({ content: " ", embeds: [embed], components: [first_row, second_row] })
            }
            if (interaction.values?.[0].includes("dailyRewards") || interaction.customId.includes("dailyRewards")) {
                embed.setTitle(title.label)
                embed.setColor(interaction.member.displayHexColor)
                embed.setThumbnail(`https://emojipedia-us.s3.amazonaws.com/source/skype/289/wrapped-gift_1f381.png`)
                let dayMark = 1
                if (interaction.customId.includes("mark")) {
                    dayMark = +MarkRegexp.exec(interaction.values[0])?.[1]
                }
                if (interaction.isStringSelectMenu()) {
                    if (interaction.values[0].includes("xpEdit")) {
                        await interaction.editReply({ embeds: interaction.message.embeds, components: [] })
                        let message = await interaction.followUp({ content: `<@${interaction.user.id}>, ${client.language({ textId: `напиши в чат минимальное количество`, guildId: interaction.guildId, locale: interaction.locale })} XP.\n> **cancel** - ${client.language({ textId: `отмена`, guildId: interaction.guildId, locale: interaction.locale })}` })
                        const collected = await waitingForAmount(client, interaction, filter, interaction.values[0])
                        message.delete().catch(e => null)
                        if (collected !== false) {
                            message = await interaction.followUp({ content: `<@${interaction.user.id}>, ${client.language({ textId: `напиши в чат максимальное количество`, guildId: interaction.guildId, locale: interaction.locale })} XP.\n> **cancel** - ${client.language({ textId: `отмена`, guildId: interaction.guildId, locale: interaction.locale })}` })
                            const collected1 = await waitingForAmount(client, interaction, filter, interaction.values[0], collected)
                            message.delete().catch(e => null)
                            if (collected1 !== false) {
                                const reward = settings.daily[`day${dayMark}`].find(e => { return e.itemID === "xp" })
                                if (!reward) {
                                    settings.daily[`day${dayMark}`].push({
                                        itemID: "xp",
                                        valueFrom: collected,
                                        valueTo: collected1
                                    })
                                    await settings.save()
                                } else {
                                    const reward = settings.daily[`day${dayMark}`].find(e => { return e.itemID === "xp" })
                                    reward.valueFrom = collected
                                    reward.valueTo = collected1
                                    await settings.save()
                                }
                            }
                        }
                    } 
                    if (interaction.values[0].includes("rpEdit")) {
                        await interaction.editReply({ embeds: interaction.message.embeds, components: [] })
                        let message = await interaction.followUp({ content: `<@${interaction.user.id}>, ${client.language({ textId: `напиши в чат минимальное количество`, guildId: interaction.guildId, locale: interaction.locale })} RP.\n> **cancel** - ${client.language({ textId: `отмена`, guildId: interaction.guildId, locale: interaction.locale })}` })
                        const collected = await waitingForAmount(client, interaction, filter, interaction.values[0])
                        message.delete().catch(e => null)
                        if (collected !== false) {
                            message = await interaction.followUp({ content: `<@${interaction.user.id}>, ${client.language({ textId: `напиши в чат максимальное количество`, guildId: interaction.guildId, locale: interaction.locale })} RP.\n> **cancel** - ${client.language({ textId: `отмена`, guildId: interaction.guildId, locale: interaction.locale })}` })
                            const collected1 = await waitingForAmount(client, interaction, filter, interaction.values[0], collected)
                            message.delete().catch(e => null)
                            if (collected1 !== false) {
                                const reward = settings.daily[`day${dayMark}`].find(e => { return e.itemID === "rp" })
                                if (!reward) {
                                    settings.daily[`day${dayMark}`].push({
                                        itemID: "rp",
                                        valueFrom: collected,
                                        valueTo: collected1
                                    })
                                    await settings.save()
                                } else {
                                    const reward = settings.daily[`day${dayMark}`].find(e => { return e.itemID === "rp" })
                                    reward.valueFrom = collected
                                    reward.valueTo = collected1
                                    await settings.save()
                                }
                            }
                        }
                    } 
                    if (interaction.values[0].includes("curEdit")) {
                        await interaction.editReply({ embeds: interaction.message.embeds, components: [] })
                        let message = await interaction.followUp({ content: `<@${interaction.user.id}>, ${client.language({ textId: `напиши в чат минимальное количество`, guildId: interaction.guildId, locale: interaction.locale })}.\n> **cancel** - ${client.language({ textId: `отмена`, guildId: interaction.guildId, locale: interaction.locale })}` })
                        const collected = await waitingForAmount(client, interaction, filter, interaction.values[0])
                        message.delete().catch(e => null)
                        if (collected !== false) {
                            message = await interaction.followUp({ content: `<@${interaction.user.id}>, ${client.language({ textId: `напиши в чат максимальное количество валюты`, guildId: interaction.guildId, locale: interaction.locale })}.\n> **cancel** - ${client.language({ textId: `отмена`, guildId: interaction.guildId, locale: interaction.locale })}` })
                            const collected1 = await waitingForAmount(client, interaction, filter, interaction.values[0], collected)
                            message.delete().catch(e => null)
                            if (collected1 !== false) {
                                const reward = settings.daily[`day${dayMark}`].find(e => { return e.itemID === "currency" })
                                if (!reward) {
                                    settings.daily[`day${dayMark}`].push({
                                        itemID: "currency",
                                        valueFrom: collected,
                                        valueTo: collected1
                                    })
                                    await settings.save()
                                } else {
                                    const reward = settings.daily[`day${dayMark}`].find(e => { return e.itemID === "currency" })
                                    reward.valueFrom = collected
                                    reward.valueTo = collected1
                                    await settings.save()
                                }
                            }
                        }
                    }
                    if (interaction.values[0].includes("xpDelete")) {
                        settings.daily[`day${dayMark}`] = settings.daily[`day${dayMark}`].filter(e => e.itemID !== "xp")
                        await settings.save()
                    }
                    if (interaction.values[0].includes("rpDelete")) {
                        settings.daily[`day${dayMark}`] = settings.daily[`day${dayMark}`].filter(e => e.itemID !== "rp")
                        await settings.save()
                    }
                    if (interaction.values[0].includes("curDelete")) {
                        settings.daily[`day${dayMark}`] = settings.daily[`day${dayMark}`].filter(e => e.itemID !== "currency")
                        await settings.save()
                    }
                    if (interaction.values[0].includes("weekBonusEdit")) {
                        await interaction.editReply({ embeds: interaction.message.embeds, components: [] })
                        const message = await interaction.followUp({ content: `<@${interaction.user.id}>, ${client.language({ textId: `напиши в чат максимальный множитель бонуса`, guildId: interaction.guildId, locale: interaction.locale })}.\n> **0** - ${client.language({ textId: `неограниченно`, guildId: interaction.guildId, locale: interaction.locale })}\n> **cancel** - ${client.language({ textId: `отмена`, guildId: interaction.guildId, locale: interaction.locale })}` })
                        const collected = await waitingForMaxBonus(client, interaction, filter)
                        message.delete().catch(e => null)
                        if (collected !== false) {
                            settings.weekMaxBonus = collected
                            await settings.save()
                        }
                    }
                }
                let Day = 1
                const dailyItems = client.cache.items.filter(e => e.guildID === interaction.guildId && !e.temp && e.enabled && e.activities?.daily)
                for (let day in settings.daily) {
                    if (day == "day1" || day == "day2" || day == "day3" || day == "day4" || day == "day5" || day == "day6" || day == "day7") {
                        let dailyRewards = ""
                        const rewards = []
                        const i = dailyItems.filter(e => e.activities?.daily[day]?.amountTo && e.activities?.daily[day]?.amountFrom)
                        i.forEach(e => {
                            rewards.push({
                                itemID: e.itemID,
                                valueFrom: e.activities.daily[day].amountFrom,
                                valueTo: e.activities.daily[day].amountTo
                            })    
                        })
                        if (typeof settings.daily[day] == "object") settings.daily[day].forEach((reward1, index) => {
                            if (index !== 0) dailyRewards += '\n'
                            rewards.push({
                                itemID: reward1.itemID,
                                valueFrom: reward1.valueFrom,
                                valueTo: reward1.valueTo
                            })
                        })
                        for (let r of rewards) {
                            if (r.itemID == "currency") dailyRewards += `\n> ${settings.displayCurrencyEmoji}**${settings.currencyName}** ${r.valueFrom == r.valueTo ? r.valueFrom : `${r.valueFrom}-${r.valueTo}`}`
                            else if (r.itemID == "xp") dailyRewards += `\n> ${client.config.emojis.XP}**${client.language({ textId: `Опыт`, guildId: interaction.guildId, locale: interaction.locale })}** ${r.valueFrom == r.valueTo ? r.valueFrom : `${r.valueFrom}-${r.valueTo}`}`
                            else if (r.itemID == "rp") dailyRewards += `\n> ${client.config.emojis.RP}**${client.language({ textId: `Репутация`, guildId: interaction.guildId, locale: interaction.locale })}** ${r.valueFrom == r.valueTo ? r.valueFrom : `${r.valueFrom}-${r.valueTo}`}`
                            else {
                                let item = client.cache.items.find(e => e.itemID === r.itemID && !e.temp)
                                if (item) {
                                    if (!item.enabled) item = `${item.displayEmoji}**${item.name}** (${client.language({ textId: `отключенный`, guildId: interaction.guildId, locale: interaction.locale })})`
                                    else if (item.found) item = `${item.displayEmoji}**${item.name}**`
                                    else item = `${item.displayEmoji}**${item.name}** (${client.language({ textId: `неизвестный`, guildId: interaction.guildId, locale: interaction.locale })})`
                                } else item = r.itemID
                                dailyRewards += `\n> ${item} ${r.valueFrom == r.valueTo ? r.valueFrom : `${r.valueFrom}-${r.valueTo}`}`
                            }    
                        }
                        embed.addFields([{ name: `${dayMark === Day ? client.config.emojis.arrowRight : ""} ${client.language({ textId: `ДЕНЬ`, guildId: interaction.guildId, locale: interaction.locale })} ${Day}`, value: dailyRewards.length ? dailyRewards : `\n> ${client.language({ textId: `Нет наград`, guildId: interaction.guildId, locale: interaction.locale })}` }])
                        Day++    
                    } 
                }
                const options = [
                    { emoji: { name: "1️⃣" }, label: `${client.language({ textId: `День`, guildId: interaction.guildId, locale: interaction.locale })} 1`, value: `mark{1}`, default: dayMark === 1 ? true : false },
                    { emoji: { name: "2️⃣" }, label: `${client.language({ textId: `День`, guildId: interaction.guildId, locale: interaction.locale })} 2`, value: `mark{2}`, default: dayMark === 2 ? true : false },
                    { emoji: { name: "3️⃣" }, label: `${client.language({ textId: `День`, guildId: interaction.guildId, locale: interaction.locale })} 3`, value: `mark{3}`, default: dayMark === 3 ? true : false },
                    { emoji: { name: "4️⃣" }, label: `${client.language({ textId: `День`, guildId: interaction.guildId, locale: interaction.locale })} 4`, value: `mark{4}`, default: dayMark === 4 ? true : false },
                    { emoji: { name: "5️⃣" }, label: `${client.language({ textId: `День`, guildId: interaction.guildId, locale: interaction.locale })} 5`, value: `mark{5}`, default: dayMark === 5 ? true : false },
                    { emoji: { name: "6️⃣" }, label: `${client.language({ textId: `День`, guildId: interaction.guildId, locale: interaction.locale })} 6`, value: `mark{6}`, default: dayMark === 6 ? true : false },
                    { emoji: { name: "7️⃣" }, label: `${client.language({ textId: `День`, guildId: interaction.guildId, locale: interaction.locale })} 7`, value: `mark{7}`, default: dayMark === 7 ? true : false },
                ]
                const options2 = [
                    { emoji: client.config.emojis.XP, label: `${settings.daily[`day${dayMark}`].some(e => e.itemID === "xp") ? `${client.language({ textId: `Изменить кол-во`, guildId: interaction.guildId, locale: interaction.locale })} XP` : `${client.language({ textId: `Добавить`, guildId: interaction.guildId, locale: interaction.locale })} XP`}`, value: `xpEdit mark{${dayMark}}` },
                    { emoji: client.config.emojis.RP, label: `${settings.daily[`day${dayMark}`].some(e => e.itemID === "rp") ? `${client.language({ textId: `Изменить кол-во`, guildId: interaction.guildId, locale: interaction.locale })} RP` : `${client.language({ textId: `Добавить`, guildId: interaction.guildId, locale: interaction.locale })} RP`}`, value: `rpEdit mark{${dayMark}}` },
                    { emoji: settings.displayCurrencyEmoji, label: `${settings.daily[`day${dayMark}`].some(e => e.itemID === "currency") ? `${client.language({ textId: `Изменить кол-во валюты`, guildId: interaction.guildId, locale: interaction.locale })}` : `${client.language({ textId: `Добавить валюту`, guildId: interaction.guildId, locale: interaction.locale })}`}`, value: `curEdit mark{${dayMark}}` },
                ]
                if (settings.daily[`day${dayMark}`].some(e => e.itemID === "xp")) options2.push({ emoji: client.config.emojis.NO, label: `${client.language({ textId: `Удалить`, guildId: interaction.guildId, locale: interaction.locale })} XP`, value: `xpDelete mark{${dayMark}}` })
                if (settings.daily[`day${dayMark}`].some(e => e.itemID === "rp")) options2.push({ emoji: client.config.emojis.NO, label: `${client.language({ textId: `Удалить`, guildId: interaction.guildId, locale: interaction.locale })} RP`, value: `rpDelete mark{${dayMark}}` })
                if (settings.daily[`day${dayMark}`].some(e => e.itemID === "currency")) options2.push({ emoji: client.config.emojis.NO, label: `${client.language({ textId: `Удалить валюту`, guildId: interaction.guildId, locale: interaction.locale })}`, value: `curDelete mark{${dayMark}}` })
                options2.push({ emoji: client.config.emojis.activities, label: `${client.language({ textId: `Изменить макс. бонус за номер недели`, guildId: interaction.guildId, locale: interaction.locale })}`, value: `weekBonusEdit mark{${dayMark}}`, description: `${client.language({ textId: `Текущий макс. бонус`, guildId: interaction.guildId, locale: interaction.locale })}: ${!settings.weekMaxBonus ? `${client.language({ textId: `НЕОГРАНИЧЕННО`, guildId: interaction.guildId, locale: interaction.locale })}` : "x" + settings.weekMaxBonus }` })
                const second_row = new ActionRowBuilder().addComponents([new StringSelectMenuBuilder().setCustomId(`cmd{manager-settings} title{dailyRewards} mark usr{${interaction.user.id}}`).addOptions(options).setPlaceholder(`${client.language({ textId: `Выбери день для редактирования`, guildId: interaction.guildId, locale: interaction.locale })}`)])
                const third_row = new ActionRowBuilder().addComponents([new StringSelectMenuBuilder().setCustomId(`cmd{manager-settings} title{dailyRewards} mark1 usr{${interaction.user.id}}`).addOptions(options2).setPlaceholder(`${client.language({ textId: `Выбери для редактирования`, guildId: interaction.guildId, locale: interaction.locale })}`)])
                embed.setFooter({ text: `${client.language({ textId: `Текущий макс. бонус`, guildId: interaction.guildId, locale: interaction.locale })}: ${!settings.weekMaxBonus ? `${client.language({ textId: `НЕОГРАНИЧЕННО`, guildId: interaction.guildId, locale: interaction.locale })}` : "x"+ settings.weekMaxBonus }` })
                return interaction.editReply({ content: " ", embeds: [embed], components: [first_row, second_row, third_row] })
            }
            if (interaction.values?.[0].includes("levelRoles") || interaction.customId.includes("levelRoles")) {
                embed.setTitle(title.label)
                if (interaction.customId.includes("add")) {
                    if (settings.levelsRoles.length < 80) {
                        await interaction.editReply({ embeds: interaction.message.embeds, components: [] })
                        let message = await interaction.followUp({ content: `\`\`\`${client.language({ textId: `Пингани в чат роль или напиши ее ID`, guildId: interaction.guildId, locale: interaction.locale })}.\`\`\`\n> ${client.language({ textId: `Для отмены введи`, guildId: interaction.guildId, locale: interaction.locale })}: **cancel**` })
                        const role_guild = await waitingForRoleToAdd(client, interaction, filter, settings)
                        message.delete().catch(e => null)
                        if (role_guild) {
                            message = await interaction.followUp({ content: `\`\`\`${client.language({ textId: `Напиши в чат с какого уровня выдавать`, guildId: interaction.guildId, locale: interaction.locale })} ${role_guild.name}.\`\`\`\n> ${client.language({ textId: `Для отмены введи`, guildId: interaction.guildId, locale: interaction.locale })}: **cancel**` })
                            const levelFrom = await waitingForLevelFrom(client, interaction, filter)
                            message.delete().catch(e => null)
                            if (levelFrom) {
                                message = await interaction.followUp({ content: `\`\`\`${client.language({ textId: `Уровень получения`, guildId: interaction.guildId, locale: interaction.locale })} ${role_guild.name}: ${levelFrom}.\n${client.language({ textId: `Напиши в чат с какого уровня забирать`, guildId: interaction.guildId, locale: interaction.locale })} ${role_guild.name}.\`\`\`\n> ${client.language({ textId: `Для пропуска введи`, guildId: interaction.guildId, locale: interaction.locale })}: **skip**\n> ${client.language({ textId: `Для отмены введи`, guildId: interaction.guildId, locale: interaction.locale })}: **cancel**` })
                                const levelTo = await waitingForLevelTo(client, interaction, filter, levelFrom)
                                message.delete().catch(e => null)
                                if (levelTo !== false) {
                                    if (settings.levelsRoles.length < 80) {
                                        if (!settings.levelsRoles.includes(e => e.roleId == role_guild.id)) {
                                            settings.levelsRoles.push({
                                                roleId: role_guild.id,
                                                levelFrom: levelFrom,
                                                levelTo: levelTo
                                            })
                                            await settings.save()
                                            
                                        } else interaction.followUp({ content: `${client.config.emojis.NO} **${client.language({ textId: `Роль`, guildId: interaction.guildId, locale: interaction.locale })} <@&${role_guild.name}> ${client.language({ textId: `уже есть в списке ролей за уровни`, guildId: interaction.guildId, locale: interaction.locale })}**`, flags: ["Ephemeral"] })    
                                    } else interaction.followUp({ content: `${client.config.emojis.NO} **${client.language({ textId: `Превышено максимальное`, guildId: interaction.guildId, locale: interaction.locale })} (80) ${client.language({ textId: `количество ролей за уровни`, guildId: interaction.guildId, locale: interaction.locale })}**`, flags: ["Ephemeral"] })
                                }
                            }
                        }    
                    } else interaction.followUp({ content: `${client.config.emojis.NO} **${client.language({ textId: `Превышено максимальное`, guildId: interaction.guildId, locale: interaction.locale })} (80) ${client.language({ textId: `количество ролей за уровни`, guildId: interaction.guildId, locale: interaction.locale })}**`, flags: ["Ephemeral"] })
                }
                if (interaction.customId.includes("del")) {
                    await interaction.editReply({ embeds: interaction.message.embeds, components: [] })
                    const message = await interaction.followUp({ content: `\`\`\`${client.language({ textId: `Пингани в чат роли или напиши их ID через пробел для удаления их из ролей за уровни`, guildId: interaction.guildId, locale: interaction.locale })}.\n${client.language({ textId: `Напр.`, guildId: interaction.guildId, locale: interaction.locale })}: #${client.language({ textId: `роль`, guildId: interaction.guildId, locale: interaction.locale })}1 #${client.language({ textId: `роль`, guildId: interaction.guildId, locale: interaction.locale })}1 801818825795305539 802882544969318420.\`\`\`\n> ${client.language({ textId: `Для отмены введи`, guildId: interaction.guildId, locale: interaction.locale })}: **cancel**` })
                    const collected = await waitingForRolesToDelete(client, interaction, filter, settings)
                    message.delete().catch(e => null)
                    if (collected.length) {
                        for (let role of collected) {
                            settings.levelsRoles = settings.levelsRoles.filter(e => e.roleId !== role)
                        }
                        await settings.save()
                    }
                }
                if (interaction.customId.includes("wipe")) {
                    settings.levelsRoles = []
                    await settings.save()
                }
                let level_roles = ""
                const levelsRoles = settings.levelsRoles.sort((a, b) => {
                    return b.levelFrom - a.levelFrom || b.levelTo - a.levelTo
                })
                levelsRoles.forEach((role, index) => {
                    level_roles += `${role.levelFrom && role.levelTo ? `> ${client.language({ textId: `c`, guildId: interaction.guildId, locale: interaction.locale })} ${role.levelFrom} ${client.language({ textId: `ур`, guildId: interaction.guildId, locale: interaction.locale })}. ${client.language({ textId: `по`, guildId: interaction.guildId, locale: interaction.locale })} ${role.levelTo} ${client.language({ textId: `ур`, guildId: interaction.guildId, locale: interaction.locale })}.` : role.levelFrom && !role.levelTo ? `> ${client.language({ textId: `c`, guildId: interaction.guildId, locale: interaction.locale })} ${role.levelFrom} ${client.language({ textId: `ур`, guildId: interaction.guildId, locale: interaction.locale })}.` : ``}` + ` - <@&${role.roleId}> (${role.roleId})\n`
                    if (Number.isInteger((index + 1) / 13)) {
                        embed.addFields([{ name: `${embed.data.fields?.length > 0 ? `\u200B` : `${client.language({ textId: `Роли за уровни`, guildId: interaction.guildId, locale: interaction.locale })}:`}`, value: level_roles }])
                        level_roles = ""
                    } else if (index + 1 == levelsRoles.length) embed.addFields([{ name: `${embed.data.fields?.length > 0 ? `\u200B` : `${client.language({ textId: `Роли за уровни`, guildId: interaction.guildId, locale: interaction.locale })}:`}`, value: level_roles }])
                })
                const add_level_role_btn = new ButtonBuilder().setStyle(ButtonStyle.Success).setLabel(`${client.language({ textId: `Добавить роль за уровень`, guildId: interaction.guildId, locale: interaction.locale })}`).setEmoji(client.config.emojis.plus).setCustomId(`cmd{manager-settings} title{levelRoles} add usr{${interaction.user.id}}`)
                const del_level_role_btn = new ButtonBuilder().setStyle(ButtonStyle.Danger).setLabel(`${client.language({ textId: `Удалить роль за уровень`, guildId: interaction.guildId, locale: interaction.locale })}`).setEmoji(client.config.emojis.NO).setCustomId(`cmd{manager-settings} title{levelRoles} del usr{${interaction.user.id}}`)
                const del_all_btn = new ButtonBuilder().setStyle(ButtonStyle.Danger).setLabel(`${client.language({ textId: `УДАЛИТЬ ВСЕ`, guildId: interaction.guildId, locale: interaction.locale })}`).setCustomId(`cmd{manager-settings} title{levelRoles} wipe usr{${interaction.user.id}}`)
                const second_row = new ActionRowBuilder().addComponents([add_level_role_btn, del_level_role_btn, del_all_btn])
                return interaction.editReply({ content: " ", embeds: [embed], components: [first_row, second_row] })
            }
            if (interaction.values?.[0].includes("topLeaders") || interaction.customId.includes("topLeaders")) {
                embed.setTitle(`${client.config.emojis.premium}${title.label}`)
                const types = ["daily", "weekly", "monthly", "yearly", "channel"]
                if (types.includes(interaction.values[0])) {
                    if (interaction.values[0] == "channel") {
                        await interaction.editReply({ embeds: interaction.message.embeds, components: [] })
                        const message = await interaction.followUp({ content: `**${client.language({ textId: `Пингани в чат канал где будут публиковаться отчеты`, guildId: interaction.guildId, locale: interaction.locale })}.**\n> ${client.language({ textId: `Для удаления введи`, guildId: interaction.guildId, locale: interaction.locale })}: delete.\n> ${client.language({ textId: `Для отмены введи`, guildId: interaction.guildId, locale: interaction.locale })}: cancel.` })
                        const collected = await waitingForChannelId(client, interaction, filter)
                        message.delete().catch(e => null)
                        if (collected) {
                            if (collected == "delete") {
                                settings.top_report.channelId = undefined
                                await settings.save()
                            } else {
                                settings.top_report.channelId = collected.id
                                await settings.save()
                            }
                        }
                    } else {
                        if (settings.top_report[interaction.values[0]]) settings.top_report[interaction.values[0]] = undefined
                        else settings.top_report[interaction.values[0]] = true
                        await settings.save()
                    }
                }
                const topLeaders_options = [
                    { emoji: settings.top_report.daily ? `🟢` : `🔴`, label: `${client.language({ textId: `Ежедневный отчет`, guildId: interaction.guildId, locale: interaction.locale })}: ${settings.top_report.daily ? `${client.language({ textId: `Выключить`, guildId: interaction.guildId, locale: interaction.locale })}` : `${client.language({ textId: `Включить`, guildId: interaction.guildId, locale: interaction.locale })}`}`, value: `daily` },
                    { emoji: settings.top_report.weekly ? `🟢` : `🔴`, label: `${client.language({ textId: `Еженедельный отчет`, guildId: interaction.guildId, locale: interaction.locale })}: ${settings.top_report.weekly ? `${client.language({ textId: `Выключить`, guildId: interaction.guildId, locale: interaction.locale })}` : `${client.language({ textId: `Включить`, guildId: interaction.guildId, locale: interaction.locale })}`}`, value: `weekly` },
                    { emoji: settings.top_report.monthly ? `🟢` : `🔴`, label: `${client.language({ textId: `Ежемесячный отчет`, guildId: interaction.guildId, locale: interaction.locale })}: ${settings.top_report.monthly ? `${client.language({ textId: `Выключить`, guildId: interaction.guildId, locale: interaction.locale })}` : `${client.language({ textId: `Включить`, guildId: interaction.guildId, locale: interaction.locale })}`}`, value: `monthly` },
                    { emoji: settings.top_report.yearly ? `🟢` : `🔴`, label: `${client.language({ textId: `Ежегодный отчет`, guildId: interaction.guildId, locale: interaction.locale })}: ${settings.top_report.yearly ? `${client.language({ textId: `Выключить`, guildId: interaction.guildId, locale: interaction.locale })}` : `${client.language({ textId: `Включить`, guildId: interaction.guildId, locale: interaction.locale })}`}`, value: `yearly` },
                    { emoji: `📄`, label: `${client.language({ textId: `Канал для отчетов`, guildId: interaction.guildId, locale: interaction.locale })}: ${settings.top_report.channelId ? `${interaction.guild.channels.cache.has(settings.top_report.channelId) ? `${await interaction.guild.channels.fetch(settings.top_report.channelId).then(channel => channel.name).catch(e => null)}` : `${client.language({ textId: `НЕТ`, guildId: interaction.guildId, locale: interaction.locale })}`}` : `${client.language({ textId: `НЕТ`, guildId: interaction.guildId, locale: interaction.locale })}`}`, value: `channel` },
                ]
                const text = [
                    `${client.language({ textId: `Бот может публиковать таблицу лидеров за отчетный период`, guildId: interaction.guildId, locale: interaction.locale })}`,
                    `> ${client.language({ textId: `Ежедневный отчет`, guildId: interaction.guildId, locale: interaction.locale })}: ${settings.top_report.daily ? `🟢${client.language({ textId: `ВКЛЮЧЕН`, guildId: interaction.guildId, locale: interaction.locale })}` : `🔴${client.language({ textId: `ВЫКЛЮЧЕН`, guildId: interaction.guildId, locale: interaction.locale })}`}`,
                    `> ${client.language({ textId: `Еженедельный отчет`, guildId: interaction.guildId, locale: interaction.locale })}: ${settings.top_report.weekly ? `🟢${client.language({ textId: `ВКЛЮЧЕН`, guildId: interaction.guildId, locale: interaction.locale })}` : `🔴${client.language({ textId: `ВЫКЛЮЧЕН`, guildId: interaction.guildId, locale: interaction.locale })}`}`,
                    `> ${client.language({ textId: `Ежемесячный отчет`, guildId: interaction.guildId, locale: interaction.locale })}: ${settings.top_report.monthly ? `🟢${client.language({ textId: `ВКЛЮЧЕН`, guildId: interaction.guildId, locale: interaction.locale })}` : `🔴${client.language({ textId: `ВЫКЛЮЧЕН`, guildId: interaction.guildId, locale: interaction.locale })}`}`,
                    `> ${client.language({ textId: `Ежегодный отчет`, guildId: interaction.guildId, locale: interaction.locale })}: ${settings.top_report.yearly ? `🟢${client.language({ textId: `ВКЛЮЧЕН`, guildId: interaction.guildId, locale: interaction.locale })}` : `🔴${client.language({ textId: `ВЫКЛЮЧЕН`, guildId: interaction.guildId, locale: interaction.locale })}`}`,
                    `> ${client.language({ textId: `Канал для отчетов`, guildId: interaction.guildId, locale: interaction.locale })}: ${settings.top_report.channelId ? `${interaction.guild.channels.cache.has(settings.top_report.channelId) ? `<#${await interaction.guild.channels.fetch(settings.top_report.channelId).then(channel => channel.id).catch(e => null)}>` : `${client.language({ textId: `НЕТ`, guildId: interaction.guildId, locale: interaction.locale })}`}` : `${client.language({ textId: `НЕТ`, guildId: interaction.guildId, locale: interaction.locale })}`}`
                ]
                embed.setDescription(text.join("\n"))
                const second_row = new ActionRowBuilder().addComponents([new StringSelectMenuBuilder().setCustomId(`cmd{manager-settings} title{topLeaders} usr{${interaction.user.id}}`).addOptions(topLeaders_options).setPlaceholder(`${client.language({ textId: `Выбери для изменения`, guildId: interaction.guildId, locale: interaction.locale })}`)])
                return interaction.editReply({ content: " ", embeds: [embed], components: [first_row, second_row] })
            }
            if (interaction.values?.[0].includes("activities") || interaction.customId.includes("activities")) {
                embed.setTitle(title.label)
                const types = [ `xpForMessage`, `curForMessage`, "rpForMessage", 
                "xpForVoice", "curForVoice", "rpForVoice", 
                "xpForInvite", "curForInvite", "rpForInvite", 
                "xpForBump", "curForBump", "rpForBump", 
                "xpForLike", "curForLike", "rpForLike", 
                "xpForFirstFoundItem", "curForFirstFoundItem", "rpForFirstFoundItem" ]
                if (types.includes(interaction.values?.[0])) {
                    await interaction.editReply({ embeds: interaction.message.embeds, components: [] })
                    const message = await interaction.followUp({ content: `${client.language({ textId: `Напиши в чат количество`, guildId: interaction.guildId, locale: interaction.locale })}. ${client.language({ textId: `Для отмены введи`, guildId: interaction.guildId, locale: interaction.locale })}: cancel.` })
                    const collected = await waitingForAmount2(client, interaction, filter, interaction.values[0])
                    message.delete().catch(e => null)
                    if (!Number.isNaN(collected)) {
                        settings[interaction.values[0]] = +collected
                        await settings.save()
                    }
                }
                if (interaction.customId.includes("default")) {
                    settings.xpForMessage = 15
                    settings.curForMessage = 3
                    settings.rpForMessage = 0
                    settings.xpForVoice = 5000
                    settings.curForVoice = 300
                    settings.rpForVoice = 0
                    settings.xpForInvite = 10000
                    settings.curForInvite = 0
                    settings.rpForInvite = 200
                    settings.xpForBump = 200
                    settings.curForBump = 30
                    settings.rpForBump = 1000
                    settings.xpForLike = 1000
                    settings.curForLike = 0
                    settings.rpForLike = 0
                    settings.xpForFirstFoundItem = 1000
                    settings.curForFirstFoundItem = 0
                    settings.levelfactor = 10
                    await settings.save()
                    await Promise.all(client.cache.profiles.filter(e => e.guildID === interaction.guildId).map(async profile => {
                        let oldLevel = profile.level
                        profile.level = 1
                        profile.xp = profile.totalxp
                        let i = 0
                        while (profile.xp >= profile.level * settings.levelfactor + 100) {
                            profile.xp -= profile.level * settings.levelfactor + 100
                            profile.level++
                            i++
                            if (i > 100000) throw new Error(`Бесконечный цикл: manager-settings:2224, oldLevel: ${oldLevel}, profile.totalxp: ${profile.totalxp}, settings.levelfactor: ${settings.levelfactor}`)
                        }
                        if (profile.level !== oldLevel) await profile.newLevelNotify(client)
                        await profile.save()   
                    }))
                }
                if (interaction.values?.[0].includes("levelfactor") || interaction.customId.includes("levelfactor")) {
                    if (client.levelFactorCooldowns[interaction.guildId] > new Date()) {
                        await interaction.editReply({ embeds: interaction.message.embeds, components: components1 })
                        return interaction.followUp({ content: `${client.language({ textId: `Ожидайте кулдаун`, guildId: interaction.guildId, locale: interaction.locale })}: ${Math.ceil((client.levelFactorCooldowns[interaction.guildId] - new Date())/1000/60)} ${client.language({ textId: `мин`, guildId: interaction.guildId, locale: interaction.locale })}.`, flags: ["Ephemeral"] })
                    }
                    const date = new Date()
                    client.levelFactorCooldowns[interaction.guildId] = new Date(date.setMinutes(date.getMinutes() + 30))
                    await interaction.editReply({ embeds: interaction.message.embeds, components: [] })
                    const message = await interaction.followUp({ content: `${client.language({ textId: `Напиши в чат level factor (Увеличение кол-ва необходимого опыта для следующего уровня)`, guildId: interaction.guildId, locale: interaction.locale })}. ${client.language({ textId: `Для отмены введи`, guildId: interaction.guildId, locale: interaction.locale })}: cancel.` })
                    const collected = await waitingForLevelFactor(client, interaction, filter)
                    message.delete().catch(e => null)
                    if (collected) {
                        await interaction.editReply({ content: interaction.message.content || " ", embeds: interaction.message.embeds, components: [new ActionRowBuilder().addComponents(new ButtonBuilder().setEmoji("⏳").setStyle(ButtonStyle.Secondary).setCustomId(`0`).setDisabled(true))]})
                        settings.levelfactor = +collected
                        await settings.save()
                        await Promise.all(client.cache.profiles.filter(e => e.guildID === interaction.guildId).map(async profile => {
                            let oldLevel = profile.level
                            profile.level = 1
                            profile.xp = profile.totalxp
                            let i = 0
                            while (profile.xp >= profile.level * settings.levelfactor + 100) {
                                profile.xp -= profile.level * settings.levelfactor + 100
                                profile.level++
                                i++
                                if (i > 100000) throw new Error(`Бесконечный цикл: manager-settings:2254, oldLevel: ${oldLevel}, profile.totalxp: ${profile.totalxp}, settings.levelfactor: ${settings.levelfactor}`)
                            }
                            if (oldLevel !== profile.level) {
                                const member = await interaction.guild.members.fetch(profile.userID).catch(e => null)
                                if (member) {
                                    if (settings.levelsRoles.length > 0) {
                                        const rolesAdd = settings.levelsRoles.filter(e => profile.level >= e.levelFrom && (!e.levelTo || e.levelTo > profile.level) && !member.roles.cache.has(e.roleId))
                                        for (const role of rolesAdd) {
                                            const guild_role = await interaction.guild.roles.fetch(role.roleId).catch(e => null)
                                            if (guild_role && interaction.guild.members.me.roles.highest.position > guild_role.position) {
                                                await member.roles.add(guild_role.id).catch(e => null)
                                            }
                                        }
                                        const rolesRemove = settings.levelsRoles.filter(e => (e.levelTo <= profile.level || e.levelFrom > profile.level) && member.roles.cache.has(e.roleId))
                                        for (const role of rolesRemove) {
                                            const guild_role = await interaction.guild.roles.fetch(role.roleId).catch(e => null)
                                            if (guild_role && interaction.guild.members.me.roles.highest.position > guild_role.position) {
                                                await member.roles.remove(guild_role.id).catch(e => null) 
                                            }
                                        }
                                    }
                                }
                            }
                            await profile.save()
                        }))
                    } else delete client.levelFactorCooldowns[interaction.guildId]
                }
                const activities_options = [
                    { emoji: client.config.emojis.XP, label: `${client.language({ textId: `Левел фактор`, guildId: interaction.guildId, locale: interaction.locale })}`, value: `levelfactor`, description: `${client.language({ textId: `Левел фактор`, guildId: interaction.guildId, locale: interaction.locale })}: ${settings.levelfactor}` },
                    { emoji: client.config.emojis.XP, label: `✉️${client.language({ textId: `Опыт за сообщение`, guildId: interaction.guildId, locale: interaction.locale })}`, value: `xpForMessage`, description: `${client.language({ textId: `За одно сообщение`, guildId: interaction.guildId, locale: interaction.locale })}: ${settings.xpForMessage} XP` },
                    { emoji: settings.displayCurrencyEmoji, label: `✉️${settings.currencyName} ${client.language({ textId: `за сообщение`, guildId: interaction.guildId, locale: interaction.locale })}`, value: `curForMessage`, description: `${client.language({ textId: `За одно сообщение`, guildId: interaction.guildId, locale: interaction.locale })}: ${settings.curForMessage} ${settings.currencyName}` },
                    { emoji: client.config.emojis.RP, label: `✉️${client.language({ textId: `Репутация за сообщение`, guildId: interaction.guildId, locale: interaction.locale })}`, value: `rpForMessage`, description: `${client.language({ textId: `За одно сообщение`, guildId: interaction.guildId, locale: interaction.locale })}: ${settings.rpForMessage} RP` },
                    { emoji: client.config.emojis.XP, label: `🎙️${client.language({ textId: `Опыт за общение в ГК`, guildId: interaction.guildId, locale: interaction.locale })}`, value: `xpForVoice`, description: `${client.language({ textId: `За одну минуту в ГК`, guildId: interaction.guildId, locale: interaction.locale })}: ${settings.xpForVoice} XP` },
                    { emoji: settings.displayCurrencyEmoji, label: `🎙️${settings.currencyName} ${client.language({ textId: `за общение в ГК`, guildId: interaction.guildId, locale: interaction.locale })}`, value: `curForVoice`, description: `${client.language({ textId: `За одну минуту в ГК`, guildId: interaction.guildId, locale: interaction.locale })}: ${settings.curForVoice} ${settings.currencyName}` },
                    { emoji: client.config.emojis.RP, label: `🎙️${client.language({ textId: `Репутация за общение в ГК`, guildId: interaction.guildId, locale: interaction.locale })}`, value: `rpForVoice`, description: `${client.language({ textId: `За одну минуту в ГК`, guildId: interaction.guildId, locale: interaction.locale })}: ${settings.rpForVoice} RP` },
                    { emoji: client.config.emojis.XP, label: `📨${client.language({ textId: `Опыт за приглашение`, guildId: interaction.guildId, locale: interaction.locale })}`, value: `xpForInvite`, description: `${client.language({ textId: `За одно приглашение`, guildId: interaction.guildId, locale: interaction.locale })}: ${settings.xpForInvite} XP` },
                    { emoji: settings.displayCurrencyEmoji, label: `📨${settings.currencyName} ${client.language({ textId: `за приглашение`, guildId: interaction.guildId, locale: interaction.locale })}`, value: `curForInvite`, description: `${client.language({ textId: `За одно приглашение`, guildId: interaction.guildId, locale: interaction.locale })}: ${settings.curForInvite} ${settings.currencyName}` },
                    { emoji: client.config.emojis.RP, label: `📨${client.language({ textId: `Репутация за приглашение`, guildId: interaction.guildId, locale: interaction.locale })}`, value: `rpForInvite`, description: `${client.language({ textId: `За одно приглашение`, guildId: interaction.guildId, locale: interaction.locale })}: ${settings.rpForInvite} RP` },
                    { emoji: client.config.emojis.XP, label: `🆙${client.language({ textId: `Опыт за бамп`, guildId: interaction.guildId, locale: interaction.locale })}`, value: `xpForBump`, description: `${client.language({ textId: `За один бамп`, guildId: interaction.guildId, locale: interaction.locale })}: ${settings.xpForBump} XP` },
                    { emoji: settings.displayCurrencyEmoji, label: `🆙${settings.currencyName} ${client.language({ textId: `за бамп`, guildId: interaction.guildId, locale: interaction.locale })}`, value: `curForBump`, description: `${client.language({ textId: `За один бамп`, guildId: interaction.guildId, locale: interaction.locale })}: ${settings.curForBump} ${settings.currencyName}` },
                    { emoji: client.config.emojis.RP, label: `🆙${client.language({ textId: `Репутация за бамп`, guildId: interaction.guildId, locale: interaction.locale })}`, value: `rpForBump`, description: `${client.language({ textId: `За один бамп`, guildId: interaction.guildId, locale: interaction.locale })}: ${settings.rpForBump} RP` },
                    { emoji: client.config.emojis.XP, label: `❤️${client.language({ textId: `Опыт за лайк`, guildId: interaction.guildId, locale: interaction.locale })}`, value: `xpForLike`, description: `${client.language({ textId: `За один бамп`, guildId: interaction.guildId, locale: interaction.locale })}: ${settings.xpForLike} XP` },
                    { emoji: settings.displayCurrencyEmoji, label: `❤️${settings.currencyName} ${client.language({ textId: `за лайк`, guildId: interaction.guildId, locale: interaction.locale })}`, value: `curForLike`, description: `${client.language({ textId: `За один бамп`, guildId: interaction.guildId, locale: interaction.locale })}: ${settings.curForLike} ${settings.currencyName}` },
                    { emoji: client.config.emojis.RP, label: `❤️${client.language({ textId: `Репутация за лайк`, guildId: interaction.guildId, locale: interaction.locale })}`, value: `rpForLike`, description: `${client.language({ textId: `За один бамп`, guildId: interaction.guildId, locale: interaction.locale })}: ${settings.rpForLike} RP` },
                    { emoji: client.config.emojis.XP, label: `📦${client.language({ textId: `Опыт за предмет найденный впервые`, guildId: interaction.guildId, locale: interaction.locale })}`, value: `xpForFirstFoundItem`, description: `${client.language({ textId: `За один предмет`, guildId: interaction.guildId, locale: interaction.locale })}: ${settings.xpForFirstFoundItem} XP` },
                    { emoji: settings.displayCurrencyEmoji, label: `📦${settings.currencyName} ${client.language({ textId: `за предмет найденный впервые`, guildId: interaction.guildId, locale: interaction.locale })}`, value: `curForFirstFoundItem`, description: `${client.language({ textId: `За один предмет`, guildId: interaction.guildId, locale: interaction.locale })}: ${settings.curForFirstFoundItem} ${settings.currencyName}` },
                    //{ emoji: client.config.emojis.RP, label: `📦${client.language({ textId: `Репутация за предмет найденный впервые`, guildId: interaction.guildId, locale: interaction.locale })}`, value: `rpForFirstFoundItem`, description: `${client.language({ textId: `За один предмет`, guildId: interaction.guildId, locale: interaction.locale })}: ${settings.rpForFirstFoundItem} RP` },
                ]
                embed.setDescription(`${client.language({ textId: `Левел фактор`, guildId: interaction.guildId, locale: interaction.locale })}: ${settings.levelfactor} (${client.language({ textId: `Каждый новый уровень, количество опыта до следующего уровня повышается на`, guildId: interaction.guildId, locale: interaction.locale })} ${settings.levelfactor})`)
                embed.addFields([
                    { 
                        name: `${client.config.emojis.message}️ ${client.language({ textId: `За сообщение`, guildId: interaction.guildId, locale: interaction.locale })}:`, 
                        value: `**${client.language({ textId: `Присуждается за сообщение в не исключенных текстовых каналах.\nИсключенные каналы можно настроить в \"Настройки каналов\"`, guildId: interaction.guildId, locale: interaction.locale })}.**\n> ${client.config.emojis.XP}**${client.language({ textId: `Опыт`, guildId: interaction.guildId, locale: interaction.locale })}:** ${settings.xpForMessage}\n> ${settings.displayCurrencyEmoji}**${settings.currencyName}:** ${settings.curForMessage}\n> ${client.config.emojis.RP}**${client.language({ textId: `Репутация`, guildId: interaction.guildId, locale: interaction.locale })}:** ${settings.rpForMessage}`,
                    },
                    { 
                        name: `${client.config.emojis.mic} ${client.language({ textId: `За активность в голосовых каналах`, guildId: interaction.guildId, locale: interaction.locale })}:`, 
                        value: `**${client.language({ textId: `Присуждается за одну минуту общения в не исключенных голосовых каналах, с включенных микрофоном и как минимум с одним человеком`, guildId: interaction.guildId, locale: interaction.locale })}.**\n> ${client.config.emojis.XP}**${client.language({ textId: `Опыт`, guildId: interaction.guildId, locale: interaction.locale })}:** ${settings.xpForVoice}\n> ${settings.displayCurrencyEmoji}**${settings.currencyName}:** ${settings.curForVoice}\n> ${client.config.emojis.RP}**${client.language({ textId: `Репутация`, guildId: interaction.guildId, locale: interaction.locale })}:** ${settings.rpForVoice}`,
                    },
                    {
                        name: `${client.config.emojis.invite} ${client.language({ textId: `За приглашение`, guildId: interaction.guildId, locale: interaction.locale })}:`, 
                        value: `**${client.language({ textId: `Присуждается с одно приглашение на сервер`, guildId: interaction.guildId, locale: interaction.locale })}.**\n> ${client.config.emojis.XP}**${client.language({ textId: `Опыт`, guildId: interaction.guildId, locale: interaction.locale })}:** ${settings.xpForInvite}\n> ${settings.displayCurrencyEmoji}**${settings.currencyName}:** ${settings.curForInvite}\n> ${client.config.emojis.RP}**${client.language({ textId: `Репутация`, guildId: interaction.guildId, locale: interaction.locale })}:** ${settings.rpForInvite}`,
                    },
                    {
                        name: `${client.config.emojis.premium} ${client.config.emojis.bump} ${client.language({ textId: `За бамп`, guildId: interaction.guildId, locale: interaction.locale })}:`, 
                        value: `**${client.language({ textId: `Присуждается за один бамп сервера с помощью команд других ботов. Напр.`, guildId: interaction.guildId, locale: interaction.locale })} /bump, /up, /like**\n> ${client.config.emojis.XP}**${client.language({ textId: `Опыт`, guildId: interaction.guildId, locale: interaction.locale })}:** ${settings.xpForBump}\n> ${settings.displayCurrencyEmoji}**${settings.currencyName}:** ${settings.curForBump}\n> ${client.config.emojis.RP}**${client.language({ textId: `Репутация`, guildId: interaction.guildId, locale: interaction.locale })}:** ${settings.rpForBump}`,
                    },
                    {
                        name: `${client.config.emojis.heart}️ ${client.language({ textId: `За лайк`, guildId: interaction.guildId, locale: interaction.locale })}:`, 
                        value: `**${client.language({ textId: `Присуждается за лайк другого пользователя (/like). Присуждается обоим пользователям (отправивший лайк, получивший лайк)`, guildId: interaction.guildId, locale: interaction.locale })}**\n> ${client.config.emojis.XP}**${client.language({ textId: `Опыт`, guildId: interaction.guildId, locale: interaction.locale })}:** ${settings.xpForLike}\n> ${settings.displayCurrencyEmoji}**${settings.currencyName}:** ${settings.curForLike}\n> ${client.config.emojis.RP}**${client.language({ textId: `Репутация`, guildId: interaction.guildId, locale: interaction.locale })}:** ${settings.rpForLike}`,
                    },
                    {
                        name: `${client.config.emojis.box} ${client.language({ textId: `За предмет найденный впервые`, guildId: interaction.guildId, locale: interaction.locale })}:`, 
                        value: `**${client.language({ textId: `Присуждается за предмет, который пользователь нашел впервые`, guildId: interaction.guildId, locale: interaction.locale })}.**\n> ${client.config.emojis.XP}**${client.language({ textId: `Опыт`, guildId: interaction.guildId, locale: interaction.locale })}:** ${settings.xpForFirstFoundItem}\n> ${settings.displayCurrencyEmoji}**${settings.currencyName}:** ${settings.curForFirstFoundItem}`,
                    }
                ])
                const second_row = new ActionRowBuilder()
                    .addComponents([
                        new StringSelectMenuBuilder()
                            .setCustomId(`cmd{manager-settings} title{activities} usr{${interaction.user.id}}`)
                            .addOptions(activities_options)
                            .setPlaceholder(`${client.language({ textId: `Выбери для изменения`, guildId: interaction.guildId, locale: interaction.locale })}`)
                        ])
                const third_row = new ActionRowBuilder()
                    .addComponents([
                        new ButtonBuilder()
                            .setCustomId(`cmd{manager-settings} title{activities} default usr{${interaction.user.id}}`)
                            .setLabel(`${client.language({ textId: `ПО УМОЛЧАНИЮ`, guildId: interaction.guildId, locale: interaction.locale })}`)
                            .setStyle(ButtonStyle.Danger)
                        ])
                const components = [first_row, second_row, third_row]
                return interaction.editReply({ content: " ", embeds: [embed], components: components }).catch(e => {
                    if (e.message.includes(`Invalid emoji`)) {
                        const array = e.message.split(`\n`)
                        for (const message of array.splice(1, array.length-1)) {
                            const expression = message.replace(/data./, "").slice(0, message.indexOf(".emoji"))
                            eval(expression).data.emoji.id = `957227390759739453`  
                        }
                        interaction.editReply({ content: " ", embeds: [embed], components: components })
                    } else client.functions.sendError(e)
                })
            }
            if (interaction.values?.[0].includes("logs") || interaction.customId.includes("logs")) {
                embed.setTitle(`${client.config.emojis.premium}${title.label}`)
                if (interaction.customId.includes("editPreferences")) {
                    for (const value of interaction.values) {
                        if (settings.logs[value]) settings.logs[value] = undefined
                        else settings.logs[value] = true
                    }
                    await settings.save()
                }
                if (interaction.customId.includes("editWebhook")) {
                    await interaction.editReply({ embeds: interaction.message.embeds, components: [] })
                    const message = await interaction.followUp({ content: `**${client.language({ textId: `Вставь в чат ссылку вебхука, где будут публиковаться логи`, guildId: interaction.guildId, locale: interaction.locale })}.**\n> ${client.language({ textId: `Для удаления введи`, guildId: interaction.guildId, locale: interaction.locale })}: delete.\n> ${client.language({ textId: `Для отмены введи`, guildId: interaction.guildId, locale: interaction.locale })}: cancel.` })
                    const collected = await waitingForWebhook(client, interaction, filter)
                    message.delete().catch(e => null)
                    if (collected) {
                        if (collected == "delete") {
                            settings.logs.webhook = undefined
                            await settings.save()
                        } else {
                            settings.logs.webhook = collected
                            await settings.save() 
                        }
                    }
                }
                if (interaction.customId.includes("turnAllOn")) {
                    settings.logs.channelCreate = true
                    settings.logs.channelDelete = true
                    settings.logs.guildUpdate = true
                    settings.logs.memberAdd = true
                    settings.logs.memberRemove = true
                    settings.logs.memberUpdate = true
                    settings.logs.memberKick = true
                    settings.logs.memberPrune = true
                    settings.logs.memberRoleUpdate = true
                    settings.logs.memberBanAdd = true
                    settings.logs.memberBanRemove = true
                    settings.logs.inviteCreate = true
                    settings.logs.inviteDelete = true
                    settings.logs.inviteUpdate = true
                    settings.logs.messageReactionAdd = true
                    settings.logs.roleCreate = true
                    settings.logs.roleDelete = true
                    settings.logs.roleUpdate = true
                    settings.logs.stickerCreate = true
                    settings.logs.stickerDelete = true
                    settings.logs.stickerUpdate = true
                    settings.logs.messageCreate = true
                    settings.logs.messageDelete = true
                    settings.logs.voiceStateUpdate = true
                    settings.logs.emojiCreate = true
                    settings.logs.emojiDelete = true
                    settings.logs.emojiUpdate = true
                    settings.logs.interactionCreate = true
                    settings.logs.botAdd = true
                    settings.logs.applicationCommandPermissionUpdate = true
                    settings.logs.guildScheduledEventCreate = true
                    settings.logs.guildScheduledEventDelete = true
                    settings.logs.guildScheduledEventUpdate = true
                    settings.logs.integrationCreate = true
                    settings.logs.integrationDelete = true
                    settings.logs.integrationUpdate = true
                    settings.logs.webhookCreate = true
                    settings.logs.webhookDelete = true
                    settings.logs.webhookUpdate = true
                    settings.logs.economyLogCreate = true
                    await settings.save()
                }
                if (interaction.customId.includes("turnAllOff")) {
                    settings.logs.channelCreate = undefined
                    settings.logs.channelDelete = undefined
                    settings.logs.guildUpdate = undefined
                    settings.logs.memberAdd = undefined
                    settings.logs.memberRemove = undefined
                    settings.logs.memberUpdate = undefined
                    settings.logs.memberKick = undefined
                    settings.logs.memberPrune = undefined
                    settings.logs.memberRoleUpdate = undefined
                    settings.logs.memberBanAdd = undefined
                    settings.logs.memberBanRemove = undefined
                    settings.logs.inviteCreate = undefined
                    settings.logs.inviteDelete = undefined
                    settings.logs.inviteUpdate = undefined
                    settings.logs.messageReactionAdd = undefined
                    settings.logs.roleCreate = undefined
                    settings.logs.roleDelete = undefined
                    settings.logs.roleUpdate = undefined
                    settings.logs.stickerCreate = undefined
                    settings.logs.stickerDelete = undefined
                    settings.logs.stickerUpdate = undefined
                    settings.logs.messageCreate = undefined
                    settings.logs.messageDelete = undefined
                    settings.logs.voiceStateUpdate = undefined
                    settings.logs.emojiCreate = undefined
                    settings.logs.emojiDelete = undefined
                    settings.logs.emojiUpdate = undefined
                    settings.logs.interactionCreate = undefined
                    settings.logs.botAdd = undefined
                    settings.logs.applicationCommandPermissionUpdate = undefined
                    settings.logs.guildScheduledEventCreate = undefined
                    settings.logs.guildScheduledEventDelete = undefined
                    settings.logs.guildScheduledEventUpdate = undefined
                    settings.logs.integrationCreate = undefined
                    settings.logs.integrationDelete = undefined
                    settings.logs.integrationUpdate = undefined
                    settings.logs.webhookCreate = undefined
                    settings.logs.webhookDelete = undefined
                    settings.logs.webhookUpdate = undefined
                    settings.logs.economyLogCreate = undefined
                    await settings.save()
                }
                const options = [
                    {
                        emoji: settings.logs.channelCreate ? client.config.emojis.YES : client.config.emojis.NO,
                        label: `${client.language({ textId: `Создание канала`, guildId: interaction.guildId, locale: interaction.locale })}`,
                        description: `${client.language({ textId: `Происходит, когда создают канал`, guildId: interaction.guildId, locale: interaction.locale })}`,
                        value: `channelCreate`
                    },
                    {
                        emoji: settings.logs.channelDelete ? client.config.emojis.YES : client.config.emojis.NO,
                        label: `${client.language({ textId: `Удаление канала`, guildId: interaction.guildId, locale: interaction.locale })}`,
                        description: `${client.language({ textId: `Происходит, когда удаляют канал`, guildId: interaction.guildId, locale: interaction.locale })}`,
                        value: `channelDelete`
                    },
                    {
                        emoji: settings.logs.channelUpdate ? client.config.emojis.YES : client.config.emojis.NO,
                        label: `${client.language({ textId: `Изменение канала`, guildId: interaction.guildId, locale: interaction.locale })}`,
                        description: `${client.language({ textId: `Происходит, когда редактируют канал`, guildId: interaction.guildId, locale: interaction.locale })}`,
                        value: `channelUpdate`
                    },
                    {
                        emoji: settings.logs.guildUpdate ? client.config.emojis.YES : client.config.emojis.NO,
                        label: `${client.language({ textId: `Изменение сервера`, guildId: interaction.guildId, locale: interaction.locale })}`,
                        description: `${client.language({ textId: `Происходит, когда редактируют сервер`, guildId: interaction.guildId, locale: interaction.locale })}`,
                        value: `guildUpdate`
                    },
                    {
                        emoji: settings.logs.memberAdd ? client.config.emojis.YES : client.config.emojis.NO,
                        label: `${client.language({ textId: `Добавление пользователя`, guildId: interaction.guildId, locale: interaction.locale })}`,
                        description: `${client.language({ textId: `Происходит, когда пользователь заходит на сервер`, guildId: interaction.guildId, locale: interaction.locale })}`,
                        value: `memberAdd`
                    },
                    {
                        emoji: settings.logs.memberRemove ? client.config.emojis.YES : client.config.emojis.NO,
                        label: `${client.language({ textId: `Удаление пользователя`, guildId: interaction.guildId, locale: interaction.locale })}`,
                        description: `${client.language({ textId: `Происходит, когда пользователь выходит с сервера`, guildId: interaction.guildId, locale: interaction.locale })}`,
                        value: `memberRemove`
                    },
                    {
                        emoji: settings.logs.memberUpdate ? client.config.emojis.YES : client.config.emojis.NO,
                        label: `${client.language({ textId: `Изменение пользователя`, guildId: interaction.guildId, locale: interaction.locale })}`,
                        description: `${client.language({ textId: `Происходит, когда пользователь редактирует профиль`, guildId: interaction.guildId, locale: interaction.locale })}`,
                        value: `memberUpdate`
                    },
                    {
                        emoji: settings.logs.memberKick ? client.config.emojis.YES : client.config.emojis.NO,
                        label: `${client.language({ textId: `Кик пользователя`, guildId: interaction.guildId, locale: interaction.locale })}`,
                        description: `${client.language({ textId: `Происходит, когда пользователя кикают`, guildId: interaction.guildId, locale: interaction.locale })}`,
                        value: `memberKick`
                    },
                    {
                        emoji: settings.logs.memberPrune ? client.config.emojis.YES : client.config.emojis.NO,
                        label: `${client.language({ textId: `Сокращение пользователя`, guildId: interaction.guildId, locale: interaction.locale })}`,
                        description: `${client.language({ textId: `Происходит, когда пользователя сокращают`, guildId: interaction.guildId, locale: interaction.locale })}`,
                        value: `memberPrune`
                    },
                    {
                        emoji: settings.logs.memberRoleUpdate ? client.config.emojis.YES : client.config.emojis.NO,
                        label: `${client.language({ textId: `Изменение ролей пользователя`, guildId: interaction.guildId, locale: interaction.locale })}`,
                        description: `${client.language({ textId: `Происходит, когда у пользователя изменяют роли`, guildId: interaction.guildId, locale: interaction.locale })}`,
                        value: `memberRoleUpdate`
                    },
                    {
                        emoji: settings.logs.memberBanAdd ? client.config.emojis.YES : client.config.emojis.NO,
                        label: `${client.language({ textId: `Бан пользователя`, guildId: interaction.guildId, locale: interaction.locale })}`,
                        description: `${client.language({ textId: `Происходит, когда пользователя банят`, guildId: interaction.guildId, locale: interaction.locale })}`,
                        value: `memberBanAdd`
                    },
                    {
                        emoji: settings.logs.memberBanRemove ? client.config.emojis.YES : client.config.emojis.NO,
                        label: `${client.language({ textId: `Разбан пользователя`, guildId: interaction.guildId, locale: interaction.locale })}`,
                        description: `${client.language({ textId: `Происходит, когда пользователя разбанивают`, guildId: interaction.guildId, locale: interaction.locale })}`,
                        value: `memberBanRemove`
                    },
                    {
                        emoji: settings.logs.inviteCreate ? client.config.emojis.YES : client.config.emojis.NO,
                        label: `${client.language({ textId: `Создание приглашения`, guildId: interaction.guildId, locale: interaction.locale })}`,
                        description: `${client.language({ textId: `Происходит, когда создают приглашение`, guildId: interaction.guildId, locale: interaction.locale })}`,
                        value: `inviteCreate`
                    },
                    {
                        emoji: settings.logs.inviteDelete ? client.config.emojis.YES : client.config.emojis.NO,
                        label: `${client.language({ textId: `Удаление приглашения`, guildId: interaction.guildId, locale: interaction.locale })}`,
                        description: `${client.language({ textId: `Происходит, когда удаляют приглашение`, guildId: interaction.guildId, locale: interaction.locale })}`,
                        value: `inviteDelete`
                    },
                    {
                        emoji: settings.logs.inviteUpdate ? client.config.emojis.YES : client.config.emojis.NO,
                        label: `${client.language({ textId: `Изменение приглашения`, guildId: interaction.guildId, locale: interaction.locale })}`,
                        description: `${client.language({ textId: `Происходит, когда изменяют приглашение`, guildId: interaction.guildId, locale: interaction.locale })}`,
                        value: `inviteUpdate`
                    },
                    {
                        emoji: settings.logs.messageReactionAdd ? client.config.emojis.YES : client.config.emojis.NO,
                        label: `${client.language({ textId: `Добавление реакции`, guildId: interaction.guildId, locale: interaction.locale })}`,
                        description: `${client.language({ textId: `Происходит, когда добавляют реакцию`, guildId: interaction.guildId, locale: interaction.locale })}`,
                        value: `messageReactionAdd`
                    },
                    {
                        emoji: settings.logs.roleCreate ? client.config.emojis.YES : client.config.emojis.NO,
                        label: `${client.language({ textId: `Создание роли`, guildId: interaction.guildId, locale: interaction.locale })}`,
                        description: `${client.language({ textId: `Происходит, когда создают роль`, guildId: interaction.guildId, locale: interaction.locale })}`,
                        value: `roleCreate`
                    },
                    {
                        emoji: settings.logs.roleDelete ? client.config.emojis.YES : client.config.emojis.NO,
                        label: `${client.language({ textId: `Удаление роли`, guildId: interaction.guildId, locale: interaction.locale })}`,
                        description: `${client.language({ textId: `Происходит, когда удаляют роль`, guildId: interaction.guildId, locale: interaction.locale })}`,
                        value: `roleDelete`
                    },
                    {
                        emoji: settings.logs.roleUpdate ? client.config.emojis.YES : client.config.emojis.NO,
                        label: `${client.language({ textId: `Изменение роли`, guildId: interaction.guildId, locale: interaction.locale })}`,
                        description: `${client.language({ textId: `Происходит, когда редактируют роль`, guildId: interaction.guildId, locale: interaction.locale })}`,
                        value: `roleUpdate`
                    },
                    {
                        emoji: settings.logs.stickerCreate ? client.config.emojis.YES : client.config.emojis.NO,
                        label: `${client.language({ textId: `Создание стикера`, guildId: interaction.guildId, locale: interaction.locale })}`,
                        description: `${client.language({ textId: `Происходит, когда создают стикер`, guildId: interaction.guildId, locale: interaction.locale })}`,
                        value: `stickerCreate`
                    },
                    {
                        emoji: settings.logs.stickerDelete ? client.config.emojis.YES : client.config.emojis.NO,
                        label: `${client.language({ textId: `Удаление стикера`, guildId: interaction.guildId, locale: interaction.locale })}`,
                        description: `${client.language({ textId: `Происходит, когда удаляют стикер`, guildId: interaction.guildId, locale: interaction.locale })}`,
                        value: `stickerDelete`
                    },
                    {
                        emoji: settings.logs.stickerUpdate ? client.config.emojis.YES : client.config.emojis.NO,
                        label: `${client.language({ textId: `Изменение стикера`, guildId: interaction.guildId, locale: interaction.locale })}`,
                        description: `${client.language({ textId: `Происходит, когда изменяют стикер`, guildId: interaction.guildId, locale: interaction.locale })}`,
                        value: `stickerUpdate`
                    },
                    {
                        emoji: settings.logs.messageCreate ? client.config.emojis.YES : client.config.emojis.NO,
                        label: `${client.language({ textId: `Создание сообщения`, guildId: interaction.guildId, locale: interaction.locale })}`,
                        description: `${client.language({ textId: `Происходит, когда создают сообщение`, guildId: interaction.guildId, locale: interaction.locale })}`,
                        value: `messageCreate`
                    },
                    {
                        emoji: settings.logs.messageDelete ? client.config.emojis.YES : client.config.emojis.NO,
                        label: `${client.language({ textId: `Удаление сообщения`, guildId: interaction.guildId, locale: interaction.locale })}`,
                        description: `${client.language({ textId: `Происходит, когда удаляют чужое сообщение`, guildId: interaction.guildId, locale: interaction.locale })}`,
                        value: `messageDelete`
                    },
                    {
                        emoji: settings.logs.voiceStateUpdate ? client.config.emojis.YES : client.config.emojis.NO,
                        label: `${client.language({ textId: `Изменение голосового стейта`, guildId: interaction.guildId, locale: interaction.locale })}`,
                        description: `${client.language({ textId: `Происходит, когда пользователь выходит/заходит/меняет голосовой канал`, guildId: interaction.guildId, locale: interaction.locale })}`,
                        value: `voiceStateUpdate`
                    },
                    {
                        emoji: settings.logs.emojiCreate ? client.config.emojis.YES : client.config.emojis.NO,
                        label: `${client.language({ textId: `Создание эмодзи`, guildId: interaction.guildId, locale: interaction.locale })}`,
                        description: `${client.language({ textId: `Происходит, когда создают эмодзи`, guildId: interaction.guildId, locale: interaction.locale })}`,
                        value: `emojiCreate`
                    },
                    {
                        emoji: settings.logs.emojiDelete ? client.config.emojis.YES : client.config.emojis.NO,
                        label: `${client.language({ textId: `Удаление эмодзи`, guildId: interaction.guildId, locale: interaction.locale })}`,
                        description: `${client.language({ textId: `Происходит, когда удаляют эмодзи`, guildId: interaction.guildId, locale: interaction.locale })}`,
                        value: `emojiDelete`
                    },
                    {
                        emoji: settings.logs.emojiUpdate ? client.config.emojis.YES : client.config.emojis.NO,
                        label: `${client.language({ textId: `Изменение эмодзи`, guildId: interaction.guildId, locale: interaction.locale })}`,
                        description: `${client.language({ textId: `Происходит, когда изменяют эмодзи`, guildId: interaction.guildId, locale: interaction.locale })}`,
                        value: `emojiUpdate`
                    },
                    {
                        emoji: settings.logs.interactionCreate ? client.config.emojis.YES : client.config.emojis.NO,
                        label: `${client.language({ textId: `Создание команды`, guildId: interaction.guildId, locale: interaction.locale })}`,
                        description: `${client.language({ textId: `Происходит, когда используют команду`, guildId: interaction.guildId, locale: interaction.locale })}`,
                        value: `interactionCreate`
                    },
                    {
                        emoji: settings.logs.botAdd ? client.config.emojis.YES : client.config.emojis.NO,
                        label: `${client.language({ textId: `Добавление бота`, guildId: interaction.guildId, locale: interaction.locale })}`,
                        description: `${client.language({ textId: `Происходит, когда добавляют бота на сервер`, guildId: interaction.guildId, locale: interaction.locale })}`,
                        value: `botAdd`
                    },
                    {
                        emoji: settings.logs.applicationCommandPermissionUpdate ? client.config.emojis.YES : client.config.emojis.NO,
                        label: `${client.language({ textId: `Изменение прав на использование команд`, guildId: interaction.guildId, locale: interaction.locale })}`,
                        description: `${client.language({ textId: `Происходит, когда изменяют права на использование команд`, guildId: interaction.guildId, locale: interaction.locale })}`,
                        value: `applicationCommandPermissionUpdate`
                    },
                    {
                        emoji: settings.logs.guildScheduledEventCreate ? client.config.emojis.YES : client.config.emojis.NO,
                        label: `${client.language({ textId: `Создания события сервера`, guildId: interaction.guildId, locale: interaction.locale })}`,
                        description: `${client.language({ textId: `Происходит, когда создают событие сервера`, guildId: interaction.guildId, locale: interaction.locale })}`,
                        value: `guildScheduledEventCreate`
                    },
                    {
                        emoji: settings.logs.guildScheduledEventUpdate ? client.config.emojis.YES : client.config.emojis.NO,
                        label: `${client.language({ textId: `Изменение события сервера`, guildId: interaction.guildId, locale: interaction.locale })}`,
                        description: `${client.language({ textId: `Происходит, когда изменяют событие сервера`, guildId: interaction.guildId, locale: interaction.locale })}`,
                        value: `guildScheduledEventUpdate`
                    },
                    {
                        emoji: settings.logs.guildScheduledEventDelete ? client.config.emojis.YES : client.config.emojis.NO,
                        label: `${client.language({ textId: `Удаление события сервера`, guildId: interaction.guildId, locale: interaction.locale })}`,
                        description: `${client.language({ textId: `Происходит, когда удаляют событие сервера`, guildId: interaction.guildId, locale: interaction.locale })}`,
                        value: `guildScheduledEventDelete`
                    },
                    {
                        emoji: settings.logs.integrationCreate ? client.config.emojis.YES : client.config.emojis.NO,
                        label: `${client.language({ textId: `Создание интеграции`, guildId: interaction.guildId, locale: interaction.locale })}`,
                        description: `${client.language({ textId: `Происходит, когда создают интеграцию`, guildId: interaction.guildId, locale: interaction.locale })}`,
                        value: `integrationCreate`
                    },
                    {
                        emoji: settings.logs.integrationUpdate ? client.config.emojis.YES : client.config.emojis.NO,
                        label: `${client.language({ textId: `Изменение интеграции`, guildId: interaction.guildId, locale: interaction.locale })}`,
                        description: `${client.language({ textId: `Происходит, когда изменяют интеграцию`, guildId: interaction.guildId, locale: interaction.locale })}`,
                        value: `integrationUpdate`
                    },
                    {
                        emoji: settings.logs.integrationDelete ? client.config.emojis.YES : client.config.emojis.NO,
                        label: `${client.language({ textId: `Удаление интеграции`, guildId: interaction.guildId, locale: interaction.locale })}`,
                        description: `${client.language({ textId: `Происходит, когда удаляют интеграцию`, guildId: interaction.guildId, locale: interaction.locale })}`,
                        value: `integrationDelete`
                    },
                    {
                        emoji: settings.logs.webhookCreate ? client.config.emojis.YES : client.config.emojis.NO,
                        label: `${client.language({ textId: `Создание вебхука`, guildId: interaction.guildId, locale: interaction.locale })}`,
                        description: `${client.language({ textId: `Происходит, когда создают вебхук`, guildId: interaction.guildId, locale: interaction.locale })}`,
                        value: `webhookCreate`
                    },
                    {
                        emoji: settings.logs.webhookUpdate ? client.config.emojis.YES : client.config.emojis.NO,
                        label: `${client.language({ textId: `Изменение вебхука`, guildId: interaction.guildId, locale: interaction.locale })}`,
                        description: `${client.language({ textId: `Происходит, когда изменяют вебхук`, guildId: interaction.guildId, locale: interaction.locale })}`,
                        value: `webhookUpdate`
                    },
                    {
                        emoji: settings.logs.webhookDelete ? client.config.emojis.YES : client.config.emojis.NO,
                        label: `${client.language({ textId: `Удаление вебхука`, guildId: interaction.guildId, locale: interaction.locale })}`,
                        description: `${client.language({ textId: `Происходит, когда удаляют вебхук`, guildId: interaction.guildId, locale: interaction.locale })}`,
                        value: `webhookDelete`
                    },
                    {
                        emoji: settings.logs.economyLogCreate ? client.config.emojis.YES : client.config.emojis.NO,
                        label: `${client.language({ textId: `Аудит экономики`, guildId: interaction.guildId, locale: interaction.locale })}`,
                        description: `${client.language({ textId: `Аудит получения валюты, опыта, предметов и т.д.`, guildId: interaction.guildId, locale: interaction.locale })}`,
                        value: `economyLogCreate`
                    }
                ]
                embed.setDescription(`${client.language({ textId: `Вебхук`, guildId: interaction.guildId, locale: interaction.locale })}: ${settings.logs.webhook ? `${settings.logs.webhook}` : `${client.language({ textId: `Не настроен`, guildId: interaction.guildId, locale: interaction.locale })}`}`)
                // embed.addFields([
                //     { name: "\u200B", value: options.slice(0, 5).map(e => { return `${e.emoji} ${e.label} (${e.description})` }).join("\n") },
                //     { name: "\u200B", value: options.slice(6, 11).map(e => { return `${e.emoji} ${e.label} (${e.description})` }).join("\n") },
                //     { name: "\u200B", value: options.slice(12, 14).map(e => { return `${e.emoji} ${e.label} (${e.description})` }).join("\n") }
                // ])
                const second_row = new ActionRowBuilder().addComponents([new StringSelectMenuBuilder().setCustomId(`cmd{manager-settings} title{logs} editPreferences usr{${interaction.user.id}}1`).addOptions(options.slice(0, 25)).setMaxValues(25)])
                const third_row = new ActionRowBuilder().addComponents([new StringSelectMenuBuilder().setCustomId(`cmd{manager-settings} title{logs} editPreferences usr{${interaction.user.id}}2`).addOptions(options.slice(25, options.length)).setMaxValues(options.slice(25, options.length).length)])
                const editWebhook_btn = new ButtonBuilder().setStyle(ButtonStyle.Primary).setLabel(`${client.language({ textId: `Изменить вебхук`, guildId: interaction.guildId, locale: interaction.locale })}`).setCustomId(`cmd{manager-settings} title{logs} editWebhook usr{${interaction.user.id}}`)
                const turnAllOn_btn = new ButtonBuilder().setStyle(ButtonStyle.Success).setLabel(`${client.language({ textId: `Вкл. всё`, guildId: interaction.guildId, locale: interaction.locale })}`).setCustomId(`cmd{manager-settings} title{logs} turnAllOn usr{${interaction.user.id}}`)
                const turnAllOff_btn = new ButtonBuilder().setStyle(ButtonStyle.Danger).setLabel(`${client.language({ textId: `Выкл. всё`, guildId: interaction.guildId, locale: interaction.locale })}`).setCustomId(`cmd{manager-settings} title{logs} turnAllOff usr{${interaction.user.id}}`)
                const four_row = new ActionRowBuilder().addComponents([editWebhook_btn, turnAllOn_btn, turnAllOff_btn])
                return interaction.editReply({ content: `${!interaction.guild.members.me.permissions.has("ViewAuditLog") ? `${client.config.emojis.block} ${client.language({ textId: `ВНИМАНИЕ!!! Для лучшей работы логера, необходимо выдать права для просмотра журнала аудита!`, guildId: interaction.guildId, locale: interaction.locale })}` : ` `}`, embeds: [embed], components: [first_row, second_row, third_row, four_row]})
            }
        }
        const guildItems = client.cache.items.filter(e => e.guildID === interaction.guildId)
        const guildAchievements = client.cache.achievements.filter(e => e.guildID === interaction.guildId)
        const guildWormholes = client.cache.wormholes.filter(e => e.guildID === interaction.guildId)
        const guildBonusChannels = client.cache.channels.filter(e => e.guildID === interaction.guildId)
        const guildCategories = await client.shopCategorySchema.find({ guildID: interaction.guildId }).lean()
        const guildStyles = await client.styleSchema.find({ guildID: interaction.guildId }).lean()
        const guildQuests = client.cache.quests.filter(e => e.guildID === interaction.guildId)
        const guildRoles = client.cache.roles.filter(e => e.guildID === interaction.guildId)
        const guildGifts = await client.giftSchema.find({ guildID: interaction.guildId }).lean()
        const permissions = client.cache.permissions.filter(e => e.guildID === interaction.guildId)
        const jobs = client.cache.jobs.filter(e => e.guildID === interaction.guildId)
        const description = [
            `${interaction.guild.description ? `\`\`\`${interaction.guild.description}\`\`\`` : ""}`,
            `${client.language({ textId: `Участников`, guildId: interaction.guildId, locale: interaction.locale })}: ${client.config.emojis.profile}${interaction.guild.memberCount}`,
            `${client.language({ textId: `Предметов`, guildId: interaction.guildId, locale: interaction.locale })}: ${client.config.emojis.box}${guildItems.size} / ${settings.max_items}`,
            `${client.language({ textId: `Достижений`, guildId: interaction.guildId, locale: interaction.locale })}: ${client.config.emojis.achievements}${guildAchievements.size} / ${settings.max_achievements}`,
            `${client.language({ textId: `Червоточин`, guildId: interaction.guildId, locale: interaction.locale })}: ${client.config.emojis.wormhole}${guildWormholes.size} / ${settings.max_wormholes}`,
            `${client.language({ textId: `Стилей`, guildId: interaction.guildId, locale: interaction.locale })}: ${client.config.emojis.style}${guildStyles.length} / ${settings.max_styles}`,
            `${client.language({ textId: `Бонусных каналов`, guildId: interaction.guildId, locale: interaction.locale })}: ${client.config.emojis.mic}${guildBonusChannels.size} / ${settings.max_bonusChannels}`,
            `${client.language({ textId: `Категорий`, guildId: interaction.guildId, locale: interaction.locale })}: ${client.config.emojis.shop}${guildCategories.length} / ${settings.max_categories}`,
            `${client.language({ textId: `Роли`, guildId: interaction.guildId, locale: interaction.locale })}: ${client.config.emojis.roles}${guildRoles.size} / ${settings.max_roles}`,
            `${client.language({ textId: `Квестов`, guildId: interaction.guildId, locale: interaction.locale })}: ${client.config.emojis.scroll}${guildQuests.size} / ${settings.max_quests}`,
            `${client.language({ textId: `Подарки`, guildId: interaction.guildId, locale: interaction.locale })}: ${client.config.emojis.giveaway}${guildGifts.length}`,
            `${client.language({ textId: `Права`, guildId: interaction.guildId, locale: interaction.locale })}: ${client.config.emojis.crown}${permissions.size}`,
            `${client.language({ textId: `Работа`, guildId: interaction.guildId, locale: interaction.locale })}: ${client.config.emojis.job}${jobs.size}`,
            `${client.language({ textId: `Владелец`, guildId: interaction.guildId, locale: interaction.locale })}: <@${await interaction.guild.fetchOwner().then(member => member.user.id)}>`
        ]
        embed.setDescription(description.join("\n"))
        embed.setThumbnail(interaction.guild.iconURL())
        embed.setImage(interaction.guild.bannerURL({ format: "png", size: 4096 }))
        return interaction.editReply({ embeds: [embed], components: [lang_row, first_row] })
    }
}
async function waitingForAmount(client, interaction, filter, value, min) {
    while (true) {
        const collected = await interaction.channel.awaitMessages({ filter, max: 1, time: 2 * 60 * 1000 })
        if (!collected.size) return false
        if (!isNaN(collected.first().content)) {
            if (value?.includes("rp")) {
                if (collected.first().content <= 0 || collected.first().content > 1000) {
                    collected.first().delete().catch(e => null)
                    interaction.followUp({ content: `${client.config.emojis.NO} ${client.language({ textId: `Количество не должно быть`, guildId: interaction.guildId, locale: interaction.locale })} <= 0 ${client.language({ textId: `или`, guildId: interaction.guildId, locale: interaction.locale })} > 1000`, flags: ["Ephemeral"] })
                } else if (min !== undefined && +collected.first().content < min) {
                    collected.first().delete().catch(e => null)
                    interaction.followUp({ content: `${client.config.emojis.NO} ${client.language({ textId: `Максимальное значение не должно быть меньше минимального`, guildId: interaction.guildId, locale: interaction.locale })} (${min})`, flags: ["Ephemeral"] })
                } else {
                    collected.first().delete().catch(e => null) 
                    return +collected.first().content   
                }
            } else {
                if (collected.first().content <= 0 || collected.first().content > 100000000 ) {
                    collected.first().delete().catch(e => null)
                    interaction.followUp({ content: `${client.config.emojis.NO} ${client.language({ textId: `Количество не должно быть`, guildId: interaction.guildId, locale: interaction.locale })} <= 0 ${client.language({ textId: `или`, guildId: interaction.guildId, locale: interaction.locale })} > 100000000`, flags: ["Ephemeral"] })
                } else if (collected.first().content < min) {
                    collected.first().delete().catch(e => null)
                    interaction.followUp({ content: `${client.config.emojis.NO} ${client.language({ textId: `Максимальное значение не должно быть меньше минимального`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
                } else if (min == 0 && +collected.first().content == 0) {
                    collected.first().delete().catch(e => null)
                    interaction.followUp({ content: `${client.config.emojis.NO} ${client.language({ textId: `Максимальное значение не должно быть равно нулю`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
                } else {
                    collected.first().delete().catch(e => null) 
                    return +collected.first().content   
                }
            }
        } else {
            if (collected.first().content.toLowerCase() == "cancel") {
                collected.first().delete().catch(e => null)
                return false
            }
            collected.first().delete().catch(e => null)
            interaction.followUp({ content: `${client.config.emojis.NO} **${collected.first().content}** ${client.language({ textId: `не является числом`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
        }
    }
}
async function waitingForAmount2(client, interaction, filter, value, min) {
    while (true) {
        const collected = await interaction.channel.awaitMessages({ filter, max: 1, time: 2 * 60 * 1000 })
        if (!collected.size) return false
        if (!Number.isInteger(collected.first().content)) {
            if (value?.includes("rp")) {
                if (collected.first().content < 0 || collected.first().content > 1000) {
                    collected.first().delete().catch(e => null)
                    interaction.followUp({ content: `${client.config.emojis.NO} ${client.language({ textId: `Количество не должно быть`, guildId: interaction.guildId, locale: interaction.locale })} < 0 ${client.language({ textId: `или`, guildId: interaction.guildId, locale: interaction.locale })} > 1000`, flags: ["Ephemeral"] })
                } else if (min !== undefined && +collected.first().content < min) {
                    collected.first().delete().catch(e => null)
                    interaction.followUp({ content: `${client.config.emojis.NO} ${client.language({ textId: `Максимальное значение не должно быть меньше минимального`, guildId: interaction.guildId, locale: interaction.locale })} (${min})`, flags: ["Ephemeral"] })
                } else {
                    collected.first().delete().catch(e => null) 
                    return +collected.first().content   
                }
            } else {
                if (collected.first().content < 0 || collected.first().content > 100000000 ) {
                    collected.first().delete().catch(e => null)
                    interaction.followUp({ content: `${client.config.emojis.NO} ${client.language({ textId: `Количество не должно быть`, guildId: interaction.guildId, locale: interaction.locale })} < 0 ${client.language({ textId: `или`, guildId: interaction.guildId, locale: interaction.locale })} > 100000000`, flags: ["Ephemeral"] })
                } else if (collected.first().content < min) {
                    collected.first().delete().catch(e => null)
                    interaction.followUp({ content: `${client.config.emojis.NO} ${client.language({ textId: `Максимальное значение не должно быть меньше минимального`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
                } else if (min == 0 && +collected.first().content == 0) {
                    collected.first().delete().catch(e => null)
                    interaction.followUp({ content: `${client.config.emojis.NO} ${client.language({ textId: `Максимальное значение не должно быть равно нулю`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
                } else {
                    collected.first().delete().catch(e => null) 
                    return +collected.first().content   
                }
            }
        } else {
            if (collected.first().content.toLowerCase() == "cancel") {
                collected.first().delete().catch(e => null)
                return false
            }
            collected.first().delete().catch(e => null)
            interaction.followUp({ content: `${client.config.emojis.NO} **${collected.first().content}** ${client.language({ textId: `не является числом`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
        }
    }
}
async function waitingForLevelFactor(client, interaction, filter) {
    while (true) {
        const collected = await interaction.channel.awaitMessages({ filter, max: 1, time: 30000 })
        if (!collected.size) return false
        if (!Number.isInteger(collected.first().content)) {
            if (collected.first().content < 10 || collected.first().content > 5000 ) {
                collected.first().delete().catch(e => null)
                interaction.followUp({ content: `${client.config.emojis.NO} ${client.language({ textId: `Максимальное значение не должно быть равно нулю`, guildId: interaction.guildId, locale: interaction.locale })} < 10 ${client.language({ textId: `или`, guildId: interaction.guildId, locale: interaction.locale })} > 5000`, flags: ["Ephemeral"] })
            } else {
                collected.first().delete().catch(e => null) 
                return +collected.first().content   
            }
        } else {
            if (collected.first().content.toLowerCase() == "cancel") {
                collected.first().delete().catch(e => null)
                return false
            }
            collected.first().delete().catch(e => null)
            interaction.followUp({ content: `${client.config.emojis.NO} **${collected.first().content}** ${client.language({ textId: `не является целым числом`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
        }
    }
}
async function waitingForShopName(client, interaction, filter) {
    while (true) {
        const collected = await interaction.channel.awaitMessages({ filter, max: 1, time: 2 * 60 * 1000 })
        if (!collected.size) return false
        if (collected.first().content.toLowerCase() == "cancel") {
            collected.first().delete().catch(e => null)
            return false
        }
        if (collected.first().content.length <= 0 || collected.first().content.length > 20 ) {
            collected.first().delete().catch(e => null)
            interaction.followUp({ content: `${client.config.emojis.NO} ${client.language({ textId: `Длина название магазина не должна быть`, guildId: interaction.guildId, locale: interaction.locale })} <= 0 ${client.language({ textId: `или`, guildId: interaction.guildId, locale: interaction.locale })} > 20`, flags: ["Ephemeral"] })
        } else {
            collected.first().delete().catch(e => null) 
            return collected.first().content   
        }
    }
}
async function waitingForShopThumbnail(client, interaction, filter) {
    while (true) {
        const isImageURL = require('image-url-validator').default;
        const collected = await interaction.channel.awaitMessages({ filter, max: 1, time: 2 * 60 * 1000 })
        if (!collected.size) return false
        if (collected.first().content == "delete") {
            collected.first().delete().catch(e => null)
            return "delete"
        }
        if (collected.first().content) {
            const image = await isImageURL(collected.first().content)
            if (image) {
                collected.first().delete().catch(e => null) 
                return collected.first().content
            } else {
                if (collected.first().content.toLowerCase() == "cancel") {
                    collected.first().delete().catch(e => null)
                    return false
                }
                collected.first().delete().catch(e => null)
                interaction.followUp({ content: `${client.config.emojis.NO}${client.language({ textId: `Строка`, guildId: interaction.guildId, locale: interaction.locale })} **${collected.first().content}** ${client.language({ textId: `не является прямой ссылкой на изображение`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
            }    
        } else interaction.followUp({ content: `${client.language({ textId: `Введена пустая строка`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
    }
}
async function waitingForShopMessage(client, interaction, filter) {
    while (true) {
        const collected = await interaction.channel.awaitMessages({ filter, max: 1, time: 2 * 60 * 1000 })
        if (!collected.size) return false
        if (collected.first().content.toLowerCase() == "cancel") {
            collected.first().delete().catch(e => null)
            return false
        }
        if (collected.first().content <= 0 || collected.first().content > 50 ) {
            collected.first().delete().catch(e => null)
            interaction.followUp({ content: `${client.config.emojis.NO} ${client.language({ textId: `Длина сообщения магазина не должна быть`, guildId: interaction.guildId, locale: interaction.locale })} <= 0 ${client.language({ textId: `или`, guildId: interaction.guildId, locale: interaction.locale })} > 50`, flags: ["Ephemeral"] })
        } else {
            collected.first().delete().catch(e => null) 
            return collected.first().content   
        }
    }
}
async function waitingForMaxBonus(client, interaction, filter) {
    while (true) {
        const collected = await interaction.channel.awaitMessages({ filter, max: 1, time: 30000 })
        if (!collected.size) return false
        if (Number.isInteger(+collected.first().content)) {
            if (collected.first().content < 0 || collected.first().content > 5000 ) {
                collected.first().delete().catch(e => null)
                interaction.followUp({ content: `${client.config.emojis.NO} ${client.language({ textId: `Число не должно быть`, guildId: interaction.guildId, locale: interaction.locale })} < 0 ${client.language({ textId: `или`, guildId: interaction.guildId, locale: interaction.locale })} > 5000`, flags: ["Ephemeral"] })
            } else {
                collected.first().delete().catch(e => null) 
                return +collected.first().content   
            }
        } else {
            if (collected.first().content.toLowerCase() == "cancel") {
                collected.first().delete().catch(e => null)
                return false
            }
            collected.first().delete().catch(e => null)
            interaction.followUp({ content: `${client.config.emojis.NO} **${collected.first().content}** ${client.language({ textId: `не является целым числом`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
        }
    }
}
async function waitingForLevelFrom(client, interaction, filter) {
    while (true) {
        const collected = await interaction.channel.awaitMessages({ filter, max: 1, time: 30000 })
        if (!collected.size) return false
        if (!isNaN(collected.first().content)) {
            if (collected.first().content <= 0 || collected.first().content > 9999) {
                collected.first().delete().catch(e => null)
                interaction.followUp({ content: `${client.config.emojis.NO} **${client.language({ textId: `Уровень не должен быть`, guildId: interaction.guildId, locale: interaction.locale })} <= 0 ${client.language({ textId: `или`, guildId: interaction.guildId, locale: interaction.locale })} > 9999**`, flags: ["Ephemeral"] })
            } else {
                collected.first().delete().catch(e => null) 
                return +collected.first().content   
            }
        } else {
            if (collected.first().content.toLowerCase() == "cancel") {
                collected.first().delete().catch(e => null)
                return false
            }
            collected.first().delete().catch(e => null)
            interaction.followUp({ content: `${client.config.emojis.NO} **${collected.first().content}** ${client.language({ textId: `не является числом`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
        }
    }
}
async function waitingForLevelTo(client, interaction, filter, levelFrom) {
    while (true) {
        const collected = await interaction.channel.awaitMessages({ filter, max: 1, time: 2 * 60 * 1000 })
        if (!collected.size) return false
        if (!isNaN(collected.first().content)) {
            if (collected.first().content > levelFrom) {
                if (collected.first().content > 0 && collected.first().content <= 9999) {
                    collected.first().delete().catch(e => null) 
                    return +collected.first().content  
                } interaction.followUp({ content: `${client.config.emojis.NO} **${client.language({ textId: `Уровень не должен быть`, guildId: interaction.guildId, locale: interaction.locale })} <= 0 ${client.language({ textId: `или`, guildId: interaction.guildId, locale: interaction.locale })} > 9999**`, flags: ["Ephemeral"] })
            } else interaction.followUp({ content: `${client.config.emojis.NO} **${client.language({ textId: `Уровень сдачи роли не должен быть меньше или равен уровню получения роль`, guildId: interaction.guildId, locale: interaction.locale })}**`, flags: ["Ephemeral"] })
        } else {
            if (collected.first().content.toLowerCase() == "cancel") {
                collected.first().delete().catch(e => null)
                return false
            }
            if (collected.first().content.toLowerCase() == "skip") {
                collected.first().delete().catch(e => null)
                return undefined
            }
            collected.first().delete().catch(e => null)
            interaction.followUp({ content: `${client.config.emojis.NO} **${collected.first().content}** ${client.language({ textId: `не является числом`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
        }
    }
}
async function waitingForMutedChannel(client, interaction, filter, settings) {
    while (true) {
        let collected = await interaction.channel.awaitMessages({ filter, max: 1, time: 2 * 60 * 1000 })
        if (!collected.size) return false
        if (collected.first().content.toLowerCase() == "cancel") {
            collected.first().delete().catch(e => null)
            return false
        } else {
            let channels_string = collected.first().content.replace(/<|#|>/g, "")
            const channels_array = channels_string.split(" ")
            const filtered_channels = []
            for (let chan of channels_array) {
                const channel = await interaction.guild.channels.fetch(chan).catch(e => null)
                if (channel || settings.channels?.mutedChannels.includes(chan)) {
                    if (channel && channel.permissionsFor(interaction.guild.members.me).has("ViewChannel") || settings.channels?.mutedChannels.includes(chan)) {
                        filtered_channels.push(chan)
                    } else if (channel) {
                        interaction.followUp({ content: `${client.config.emojis.NO} ${client.language({ textId: `У меня нет прав для канала`, guildId: interaction.guildId, locale: interaction.locale })} <#${channel.id}>\n${client.language({ textId: `Мне нужны следующие права`, guildId: interaction.guildId, locale: interaction.locale })}:\n1. ${client.language({ textId: `Просмотр канала`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
                    }
                } else {
                    interaction.followUp({ content: `${client.config.emojis.NO} ${client.language({ textId: `Канал`, guildId: interaction.guildId, locale: interaction.locale })} "${chan}" ${client.language({ textId: `не найден`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
                }    
            }
            collected.first().delete().catch(e => null)
            return filtered_channels
        }
    } 
}
async function waitingForMutedRoles(client, interaction, filter, settings) {
    while (true) {
        let collected = await interaction.channel.awaitMessages({ filter, max: 1, time: 2 * 60 * 1000 })
        if (!collected.size) return false
        if (collected.first().content.toLowerCase() == "cancel") {
            collected.first().delete().catch(e => null)
            return false
        } else {
            let roles_string = collected.first().content.replace(/<|@&|>/g, "")
            const roles_array = roles_string.split(" ")
            const filtered_roles = []
            for (let role of roles_array) {
                const guildRole = await interaction.guild.roles.fetch(role).catch(e => null)
                if (guildRole || settings.roles?.mutedRoles.includes(role)) {
                    filtered_roles.push(role)
                } else {
                    interaction.followUp({ content: `${client.config.emojis.NO} ${client.language({ textId: `Роль c ID`, guildId: interaction.guildId, locale: interaction.locale })} **${role}** ${client.language({ textId: `не найдена`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
                }    
            }
            collected.first().delete().catch(e => null)
            return filtered_roles
        }
    } 
}
async function waitingForRolesToNewMember(client, interaction, filter, settings) {
    while (true) {
        let collected = await interaction.channel.awaitMessages({ filter, max: 1, time: 2 * 60 * 1000 })
        if (!collected.size) return false
        if (collected.first().content.toLowerCase() == "cancel") {
            collected.first().delete().catch(e => null)
            return false
        } else {
            let roles_string = collected.first().content.replace(/<|@&|>/g, "")
            const roles_array = roles_string.split(" ")
            const filtered_roles = []
            for (let role of roles_array) {
                const guildRole = await interaction.guild.roles.fetch(role).catch(e => null)
                if (guildRole || settings.roles?.rolesToNewMember.includes(role)) {
                    filtered_roles.push(role)
                } else {
                    interaction.followUp({ content: `${client.config.emojis.NO} ${client.language({ textId: `Роль c ID`, guildId: interaction.guildId, locale: interaction.locale })} **${role}** ${client.language({ textId: `не найдена`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
                }    
            }
            collected.first().delete().catch(e => null)
            return filtered_roles
        }
    } 
}
async function waitingForRolesToDelete(client, interaction, filter, settings) {
    while (true) {
        let collected = await interaction.channel.awaitMessages({ filter, max: 1, time: 2 * 60 * 1000 })
        if (!collected.size) return false
        if (collected.first().content.toLowerCase() == "cancel") {
            collected.first().delete().catch(e => null)
            return false
        } else {
            let roles_string = collected.first().content.replace(/<|@|&|>/g, "")
            const roles_array = roles_string.split(" ")
            const filtered_roles = []
            for (let role of roles_array) {
                if (settings.levelsRoles.some(e => e.roleId == role)) {
                    filtered_roles.push(role)
                } else {
                    interaction.followUp({ content: `${client.config.emojis.NO} ${client.language({ textId: `Роль`, guildId: interaction.guildId, locale: interaction.locale })} **${role}** ${client.language({ textId: `не найдена`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
                }    
            }
            collected.first().delete().catch(e => null)
            return filtered_roles
        }
    } 
}
async function waitingForRoleToAdd(client, interaction, filter, settings) {
    while (true) {
        let collected = await interaction.channel.awaitMessages({ filter, max: 1, time: 2 * 60 * 1000 })
        if (!collected.size) return false
        if (collected.first().content.toLowerCase() == "cancel") {
            collected.first().delete().catch(e => null)
            return false
        } else {
            let role_id = collected.first().content.replace(/<|@|&|>/g, "")
            const guild_role = await interaction.guild.roles.fetch(role_id).catch(e => null)
            if (guild_role) {
                if (!settings.levelsRoles.some(e => e.roleId == guild_role.id)) {
                    if (interaction.guild.members.me.roles.highest.position > guild_role.position) {
                        collected.first().delete().catch(e => null)
                        return guild_role
                    } else interaction.followUp({ content: `${client.config.emojis.NO} **${client.language({ textId: `Я не могу управлять ролью`, guildId: interaction.guildId, locale: interaction.locale })} ${guild_role.name}, ${client.language({ textId: `т.к. моя роль ниже роли, которую вы пытаетесь добавить. Переместите мою роль в самый верх списка`, guildId: interaction.guildId, locale: interaction.locale })}.**`, flags: ["Ephemeral"] })
                } else interaction.followUp({ content: `${client.config.emojis.NO} **${client.language({ textId: `Роль`, guildId: interaction.guildId, locale: interaction.locale })} ${guild_role.name} ${client.language({ textId: `уже есть в списке ролей за уровни`, guildId: interaction.guildId, locale: interaction.locale })}**`, flags: ["Ephemeral"] })  
            } else interaction.followUp({ content: `${client.config.emojis.NO} ${client.language({ textId: `Роль`, guildId: interaction.guildId, locale: interaction.locale })} **${role_id}** ${client.language({ textId: `не найдена`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
            collected.first().delete().catch(e => null)
        }
    } 
}
async function waitingForRole(client, interaction, filter) {
    while (true) {
        let collected = await interaction.channel.awaitMessages({ filter, max: 1, time: 2 * 60 * 1000 })
        if (!collected.size) return false
        if (collected.first().content.toLowerCase() == "cancel") {
            collected.first().delete().catch(e => null)
            return false
        } else {
            let role_id = collected.first().content.replace(/<|@|&|>/g, "")
            const guild_role = await interaction.guild.roles.fetch(role_id).catch(e => null)
            if (guild_role) {
                if (interaction.guild.members.me.roles.highest.position > guild_role.position) {
                    collected.first().delete().catch(e => null)
                    return guild_role
                } else interaction.followUp({ content: `${client.config.emojis.NO} **${client.language({ textId: `Я не могу управлять ролью`, guildId: interaction.guildId, locale: interaction.locale })} ${guild_role.name}, ${client.language({ textId: `т.к. моя роль ниже роли, которую вы пытаетесь добавить. Переместите мою роль в самый верх списка`, guildId: interaction.guildId, locale: interaction.locale })}.**`, flags: ["Ephemeral"] })
            } else interaction.followUp({ content: `${client.config.emojis.NO} Роль **${role_id}** ${client.language({ textId: `не найдена`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
            collected.first().delete().catch(e => null)
        }
    } 
}
async function waitingForJoinToCreateChannel(client, interaction, filter, settings) {
    while (true) {
        const collected = await interaction.channel.awaitMessages({ filter, max: 1, time: 30000 })
        if (!collected.size) return false
        const channel = await interaction.guild.channels.fetch(collected.first().content.replace(/<|#|>/g, "")).catch(e => null)
        if (channel?.type === ChannelType.GuildVoice) {
            if (channel.permissionsFor(interaction.guild.members.me).has("MoveMembers") && channel.permissionsFor(interaction.guild.members.me).has("ManageChannels")) {
                collected.first().delete().catch(e => null) 
                return channel    
            } else {
                collected.first().delete().catch(e => null)
                interaction.followUp({ content: `${client.config.emojis.NO} ${client.language({ textId: `У меня нет прав для канала`, guildId: interaction.guildId, locale: interaction.locale })} <#${channel.id}>\n${client.language({ textId: `Мне нужны следующие права`, guildId: interaction.guildId, locale: interaction.locale })}:\n> 1. ${client.language({ textId: `Перемещать участников`, guildId: interaction.guildId, locale: interaction.locale })}\n> 2. ${client.language({ textId: `Управлять каналами`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
            }
        } else {
            if (collected.first().content.toLowerCase() == "cancel") {
                collected.first().delete().catch(e => null)
                return false
            }
            if (collected.first().content.toLowerCase() == "delete") {
                collected.first().delete().catch(e => null)
                return "delete"
            }
            collected.first().delete().catch(e => null)
            interaction.followUp({ content: `${client.config.emojis.NO} **${client.language({ textId: `Голосовой канал не найден`, guildId: interaction.guildId, locale: interaction.locale })}**`, flags: ["Ephemeral"] })
        }
    } 
}
async function waitingForJoinToCreateCategory(client, interaction, filter, settings) {
    while (true) {
        const collected = await interaction.channel.awaitMessages({ filter, max: 1, time: 30000 })
        if (!collected.size) return false
        const channel = await interaction.guild.channels.fetch(collected.first().content.replace(/<|#|>/g, "")).catch(e => null)
        if (channel?.type === ChannelType.GuildCategory) {
            if (channel.permissionsFor(interaction.guild.members.me).has("MoveMembers") && channel.permissionsFor(interaction.guild.members.me).has("ManageChannels")) {
                collected.first().delete().catch(e => null) 
                return channel
            } else {
                collected.first().delete().catch(e => null)
                interaction.followUp({ content: `${client.config.emojis.NO} ${client.language({ textId: `У меня нет прав для категории`, guildId: interaction.guildId, locale: interaction.locale })} <#${channel.id}>\n${client.language({ textId: `Мне нужны следующие права`, guildId: interaction.guildId, locale: interaction.locale })}:\n> 1. ${client.language({ textId: `Перемещать участников`, guildId: interaction.guildId, locale: interaction.locale })}\n> 2. ${client.language({ textId: `Управлять каналами`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
            }
        } else {
            if (collected.first().content.toLowerCase() == "cancel") {
                collected.first().delete().catch(e => null)
                return false
            }
            if (collected.first().content.toLowerCase() == "delete") {
                collected.first().delete().catch(e => null)
                return "delete"
            }
            collected.first().delete().catch(e => null)
            interaction.followUp({ content: `${client.config.emojis.NO} **${client.language({ textId: `Категория не найдена`, guildId: interaction.guildId, locale: interaction.locale })}**`, flags: ["Ephemeral"] })
        }
    } 
}
async function waitingForChannelId(client, interaction, filter) {
    while (true) {
        const collected = await interaction.channel.awaitMessages({ filter, max: 1, time: 30000 })
        if (!collected.size) return false
        const channel = await interaction.guild.channels.fetch(collected.first().content.replace(/<|#|>/g, "")).catch(e => null)
        if (channel?.type === ChannelType.GuildText || channel?.type === ChannelType.PublicThread || channel?.type === ChannelType.PrivateThread) {
            if (channel.permissionsFor(interaction.guild.members.me).has("ViewChannel") && channel.permissionsFor(interaction.guild.members.me).has("SendMessages")) {
                collected.first().delete().catch(e => null) 
                return channel
            } else {
                collected.first().delete().catch(e => null)
                interaction.followUp({ content: `${client.config.emojis.NO} ${client.language({ textId: `У меня нет прав для канала`, guildId: interaction.guildId, locale: interaction.locale })} <#${channel.id}>\n${client.language({ textId: `Мне нужны следующие права`, guildId: interaction.guildId, locale: interaction.locale })}:\n1. ${client.language({ textId: `Просмотр канала`, guildId: interaction.guildId, locale: interaction.locale })}\n2. ${client.language({ textId: `Отправлять сообщения`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
            }
        } else {
            if (collected.first().content.toLowerCase() === "cancel") {
                collected.first().delete().catch(e => null)
                return false
            }
            if (collected.first().content.toLowerCase() === "delete") {
                collected.first().delete().catch(e => null)
                return "delete"
            }
            collected.first().delete().catch(e => null)
            interaction.followUp({ content: `${client.config.emojis.NO} ${client.language({ textId: `Текстовый канал не найден`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
        }
    } 
}
async function waitingForWebhook(client, interaction, filter) {
    while (true) {
        const collected = await interaction.channel.awaitMessages({ filter, max: 1, time: 30000 })
        if (!collected.size) return false
        if (collected.first().content.toLowerCase() == "cancel") {
            collected.first().delete().catch(e => null)
            return false
        }
        if (collected.first().content.toLowerCase() == "delete") {
            collected.first().delete().catch(e => null)
            return "delete"
        }    
        collected.first().delete().catch(e => null) 
        return collected.first().content
    } 
}
async function waitingForRoleId(client, interaction, filter) {
    while (true) {
        const collected = await interaction.channel.awaitMessages({ filter, max: 1, time: 30000 })
        if (!collected.size) return false
        const role = await interaction.guild.roles.fetch(collected.first().content.replace(/<|@&|>/g, "")).catch(e => null)
        if (role) {
            collected.first().delete().catch(e => null) 
            return role
        } else {
            if (collected.first().content.toLowerCase() == "cancel") {
                collected.first().delete().catch(e => null)
                return false
            }
            if (collected.first().content.toLowerCase() == "delete") {
                collected.first().delete().catch(e => null)
                return "delete"
            }
            collected.first().delete().catch(e => null)
            interaction.followUp({ content: `${client.config.emojis.NO} ${client.language({ textId: `Роль не найдена`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
        }
    } 
}
async function waitingForMemesChannelId(client, interaction, filter) {
    while (true) {
        const collected = await interaction.channel.awaitMessages({ filter, max: 1, time: 30000 })
        if (!collected.size) return false
        const channel = await interaction.guild.channels.fetch(collected.first().content.replace(/<|#|>/g, "")).catch(e => null)
        if (channel?.type === ChannelType.GuildText || channel?.type === ChannelType.PublicThread) {
            if (channel.permissionsFor(interaction.guild.members.me).has("ViewChannel") && channel.permissionsFor(interaction.guild.members.me).has("AddReactions") && channel.permissionsFor(interaction.guild.members.me).has("ReadMessageHistory")) {
                collected.first().delete().catch(e => null) 
                return channel
            } else {
                collected.first().delete().catch(e => null)
                interaction.followUp({ content: `${client.config.emojis.NO} ${client.language({ textId: `У меня нет прав для канала`, guildId: interaction.guildId, locale: interaction.locale })} <#${channel.id}>\n${client.language({ textId: `Мне нужны следующие права`, guildId: interaction.guildId, locale: interaction.locale })}:\n1. ${client.language({ textId: `Просмотр канала`, guildId: interaction.guildId, locale: interaction.locale })}\n2. ${client.language({ textId: `AddReactions`, guildId: interaction.guildId, locale: interaction.locale })}\n3. ${client.language({ textId: `Читать историю сообщений`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
            }
        } else {
            if (collected.first().content.toLowerCase() == "cancel") {
                collected.first().delete().catch(e => null)
                return false
            }
            if (collected.first().content.toLowerCase() == "delete") {
                collected.first().delete().catch(e => null)
                return "delete"
            }
            collected.first().delete().catch(e => null)
            interaction.followUp({ content: `${client.config.emojis.NO} ${client.language({ textId: `Текстовый канал не найден`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
        }
    } 
}
async function waitingForAttachment(client, interaction, filter) {
    while (true) {
        const collected = await interaction.channel.awaitMessages({ filter, max: 1, time: 30000 })
        if (!collected.size) return false
        if (collected.first().attachments.first()) {
            if (collected.first().attachments.first().contentType.includes("image")) {
                if (collected.first().attachments.first().size <= 8388608) {
                    return collected.first().attachments.first()
                } else {
                    collected.first().delete().catch(e => null)
                    interaction.followUp({ content: `${client.config.emojis.NO} ${client.language({ textId: `Размер вложения не должен превышать 8МБ`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
                }
            } else {
                collected.first().delete().catch(e => null)
                interaction.followUp({ content: `${client.config.emojis.NO} ${client.language({ textId: `Вложение должно быть изображением`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
            }
        } else {
            if (collected.first().content.toLowerCase() == `cancel`) {
                collected.first().delete().catch(e => null)
                return false
            }
            collected.first().delete().catch(e => null)
            interaction.followUp({ content: `${client.config.emojis.NO} ${client.language({ textId: `Нет вложения`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
        }
    } 
}