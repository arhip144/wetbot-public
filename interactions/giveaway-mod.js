const { EmbedBuilder, Colors, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, ButtonBuilder, ButtonStyle, LabelBuilder } = require("discord.js")
const giveawayRegexp = /giveaway{(.*?)}/
const { format } = require('date-format-parse')
const { parse } = require('date-format-parse')
const { AchievementType, RewardType } = require("../enums")
const isImageURL = require('image-url-validator').default
module.exports = {
    name: `giveaway-mod`,
    run: async (client, interaction) => {
    	const giveaway = client.cache.giveaways.get(giveawayRegexp.exec(interaction.customId)[1])
        if (!giveaway) {
        	return interaction.update({ content: `${client.config.emojis.NO} ${client.language({ textId: `Этой раздачи больше не существует`, guildId: interaction.guildId, locale: interaction.locale })}`, components: [] })
        }
        const settings = client.cache.settings.get(interaction.guildId)
        if (settings.giveawayManagerPermission) {
        	const profile = await client.functions.fetchProfile(client, interaction.user.id, interaction.guildId)
        	const permission = client.cache.permissions.get(settings.giveawayManagerPermission)
        	const isPassing = permission.for(profile, interaction.member, interaction.channel, interaction)
            if (isPassing.value === false) {
                return interaction.reply({ embeds: [new EmbedBuilder().setColor(3093046).setTitle(`${client.language({ textId: `Для этого взаимодействия требуется:`, guildId: interaction.guildId, locale: interaction.locale })}`).setDescription(isPassing.reasons.join("\n"))], flags: ["Ephemeral"] })
            }
        }
        const profile = await client.functions.fetchProfile(client, giveaway.creator, interaction.guildId)
        if (interaction.customId.includes("accept")) {
            const channel = await interaction.guild.channels.fetch(giveaway.channelId).catch(e => null)
            if (!channel) {
                await giveaway.delete()
                return interaction.update({ content: `${client.config.emojis.NO} ${client.language({ textId: `Канал для раздачи не найден`, guildId: interaction.guildId, locale: interaction.locale })}: <#${giveaway.channelId}>`, components: [], flags: ["Ephemeral"] })
            }
            if (!channel.permissionsFor(interaction.guild.members.me).has("SendMessages") || !channel.permissionsFor(interaction.guild.members.me).has("AddReactions")) {
                return interaction.reply({ content: `${client.config.emojis.NO} ${client.language({ textId: `Для канала`, guildId: interaction.guildId, locale: interaction.locale })} <#${giveaway.channelId}> ${client.language({ textId: `мне нужны следующие права:\n1. Отправка сообщений\n2. Добавлять реакции`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
            }
            if (giveaway.status === "started") {
                return interaction.reply({ content: `${client.config.emojis.NO} ${client.language({ textId: `Эта раздача уже принята`, guildId: interaction.guildId })}`, flags: ["Ephemeral"] })
            }
            const member = await interaction.guild.members.fetch(giveaway.creator).catch(e => null)
            const changes = []
            if (interaction.customId.includes("edit")) {
                let copyDate = new Date(giveaway.endsTime)
                let date = giveaway.endsTime ? format(new Date(copyDate.setMinutes(copyDate.getMinutes() - new Date().getTimezoneOffset() *-1)), 'DD-MM-YYYY HH:mm') : undefined
                const modal = new ModalBuilder()
                    .setCustomId(`giveaway_mod_accept_edit_${interaction.id}`)
                    .setTitle(`${client.language({ textId: `Изменить и принять раздачу`, guildId: interaction.guildId, locale: interaction.locale })}`)
                    .setLabelComponents([
                        new LabelBuilder()
                            .setLabel(`${client.language({ textId: `Дата окончания раздачи (UTC)`, guildId: interaction.guildId, locale: interaction.locale })}`)
                            .setTextInputComponent(
                                new TextInputBuilder()
		                            .setCustomId("endDate")
		                            .setRequired(false)
		                            .setStyle(TextInputStyle.Short)
		                            .setValue(giveaway.endsTime ? date : "")
                            ),
                        new LabelBuilder()
                            .setLabel(`${client.language({ textId: `Количество победителей`, guildId: interaction.guildId, locale: interaction.locale })}`)
                            .setTextInputComponent(
                                new TextInputBuilder()
		                            .setCustomId("winnersAmount")
		                            .setRequired(true)
		                            .setStyle(TextInputStyle.Short)
		                            .setValue(`${giveaway.winnerCount || ""}`)
                            ),
                        new LabelBuilder()
                            .setLabel(`${client.language({ textId: `Право участия`, guildId: interaction.guildId, locale: interaction.locale })}`)
                            .setTextInputComponent(
                                new TextInputBuilder()
                                    .setCustomId("permission")
                                    .setRequired(false)
                                    .setValue(`${client.cache.permissions.find(e => e.id === giveaway.permission)?.name || ""}`)
                                    .setStyle(TextInputStyle.Short)
                                    .setPlaceholder(`${client.language({ textId: `Название права`, guildId: interaction.guildId, locale: interaction.locale })}`)
                            ),
                        new LabelBuilder()
                            .setLabel(`${client.language({ textId: `Описание раздачи`, guildId: interaction.guildId, locale: interaction.locale })}`)
                            .setTextInputComponent(
                                new TextInputBuilder()
		                            .setCustomId("description")
		                            .setRequired(false)
		                            .setStyle(TextInputStyle.Paragraph)
		                            .setMaxLength(300)
		                            .setValue(`${giveaway.description || ""}`)
                            ),
                        new LabelBuilder()
                            .setLabel(`${client.language({ textId: `Иконка раздачи`, guildId: interaction.guildId, locale: interaction.locale })}`)
                            .setTextInputComponent(
                                new TextInputBuilder()
		                            .setCustomId("link")
		                            .setRequired(false)
		                            .setStyle(TextInputStyle.Short)
		                            .setValue(`${giveaway.thumbnail || ""}`)
                            ),
                    ])
                await interaction.showModal(modal);delete client.globalCooldown[`${interaction.guildId}_${interaction.user.id}`]
                const filter = (i) => i.customId === `giveaway_mod_accept_edit_${interaction.id}` && i.user.id === interaction.user.id
                interaction = await interaction.awaitModalSubmit({ filter, time: 300000 }).catch(e => interaction)
                if (interaction && interaction.isModalSubmit()) {
                    const modalArgs = {}
                    interaction.fields.fields.each(field => modalArgs[field.customId] = field.value)
                    if (!modalArgs.description) delete modalArgs.description
                    if (!modalArgs.link) modalArgs.link = null
                    if (!modalArgs.permission) delete modalArgs.permission
                    if (modalArgs.endDate) {
                        date = parse(modalArgs.endDate, 'DD-MM-YYYY HH:mm')
                        if (isNaN(date.getTime())) {
                            return interaction.reply({ content: `${client.config.emojis.NO} ${client.language({ textId: `Введен неправильный формат даты. Правильный формат даты: 28-07-2033 16:57.`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
                        }    
                        copyDate = new Date(date)
                        copyDate = new Date(copyDate.setMinutes(copyDate.getMinutes() - new Date().getTimezoneOffset()))
                        if (copyDate <= new Date()) return interaction.reply({ content: `${client.config.emojis.NO} ${client.language({ textId: `Дата окончания не должна быть в прошлом`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
                        if (giveaway.endsTime !== copyDate) {
                            changes.push(`* ${client.language({ textId: `Дата окончания`, guildId: interaction.guildId })}: ${giveaway.endsTime ? `<t:${Math.floor(giveaway.endsTime.getTime()/1000)}>` : `---`} -> <t:${Math.floor(copyDate.getTime()/1000)}>`)
                            giveaway.endsTime = copyDate
                        }
                    } else {
                        if (!giveaway.ends) {
                            return interaction.reply({ content: `${client.config.emojis.NO} ${client.language({ textId: `Должно быть выбрано: дата окончания или тип окончания`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
                        }
                        if (giveaway.endsTime !== undefined) {
                            changes.push(`* ${client.language({ textId: `Дата окончания`, guildId: interaction.guildId })}: <t:${Math.floor(giveaway.endsTime.getTime()/1000)}> -> ---`)
                        }
                        giveaway.endsTime = undefined
                    }
                    if (isNaN(+modalArgs.winnersAmount) || !Number.isInteger(+modalArgs.winnersAmount)) {
                        return interaction.reply({ content: `${client.config.emojis.NO} **${modalArgs.winnersAmount}** ${client.language({ textId: `не является целым числом`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
                    }
                    modalArgs.winnersAmount = +modalArgs.winnersAmount
                    if (modalArgs.winnersAmount <= 0 || modalArgs.winnersAmount > 100) {
                        return interaction.reply({ content: `${client.config.emojis.NO} ${client.language({ textId: `Число не должно быть`, guildId: interaction.guildId, locale: interaction.locale })} <= 0 ${client.language({ textId: `или`, guildId: interaction.guildId, locale: interaction.locale })} > 100`, flags: ["Ephemeral"] })
                    }
                    if (modalArgs.link !== null) {
                        const image = await isImageURL(modalArgs.link)
                        if (!image) {
                            return interaction.reply({ content: `${client.config.emojis.NO} ${client.language({ textId: `Строка`, guildId: interaction.guildId, locale: interaction.locale })} **${modalArgs.link}** ${client.language({ textId: `не является прямой ссылкой на изображение`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
                        }
                    }
                    const permission = client.cache.permissions.find(e => e.name.toLowerCase() === modalArgs.permission?.toLowerCase() && e.guildID === interaction.guildId)
                    if (!permission && modalArgs.permission) {
                        return interaction.reply({ content: `${client.config.emojis.NO} ${client.language({ textId: `Права с названием`, guildId: interaction.guildId, locale: interaction.locale })} **${modalArgs.name}** ${client.language({ textId: `не существует`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
                    }
                    if (giveaway.winnerCount !== modalArgs.winnersAmount) {
                        changes.push(`* ${client.language({ textId: `Количество победителей`, guildId: interaction.guildId })}: ${giveaway.winnerCount} -> ${modalArgs.winnersAmount}`)
                        giveaway.winnerCount = modalArgs.winnersAmount
                    }
                    if (giveaway.description !== modalArgs.description) {
                        changes.push(`* ${client.language({ textId: `Описание`, guildId: interaction.guildId })}: ${giveaway.description || client.language({ textId: `Пусто`, guildId: interaction.guildId })} -> ${modalArgs.description || client.language({ textId: `Пусто`, guildId: interaction.guildId })}`)
                        giveaway.description = modalArgs.description
                    }
                    if (giveaway.thumbnail !== modalArgs.link) {
                        changes.push(`* ${client.language({ textId: `Иконка`, guildId: interaction.guildId })}: ${`[${client.language({ textId: `старая`, guildId: interaction.guildId })}](${giveaway.thumbnail})` || client.language({ textId: `Пусто`, guildId: interaction.guildId })} -> ${`[${client.language({ textId: `новая`, guildId: interaction.guildId })}](${modalArgs.link})` || client.language({ textId: `Пусто`, guildId: interaction.guildId })}`)
                        giveaway.thumbnail = modalArgs.link
                    }
                    if (giveaway.permission !== modalArgs.permission) {
                        changes.push(`* ${client.language({ textId: `Право участия`, guildId: interaction.guildId })}: ${giveaway.permission ? client.cache.permissions.get(giveaway.permission)?.name || `${client.language({ textId: `Неизвестное право`, guildId: interaction.guildId })}` : `${client.language({ textId: `Пусто`, guildId: interaction.guildId })}`} -> ${modalArgs.permission ? client.cache.permissions.get(giveaway.permission).name : client.language({ textId: `Пусто`, guildId: interaction.guildId })}`)
                        giveaway.permission = modalArgs.permission
                    }
                } else return
            }
            giveaway.status = "started"
            giveaway.deleteTemp = undefined
            const embed = new EmbedBuilder()
    			.setColor(3093046)
				.setAuthor({ name: `${client.language({ textId: `Раздача от`, guildId: interaction.guildId })} ${member.displayName}`, iconURL: member.displayAvatarURL() })
    			.setDescription([
    				giveaway.description ? giveaway.description : false,
    				giveaway.permission ? `${client.language({ textId: `Право`, guildId: interaction.guildId })}: ${client.cache.permissions.find(e => e.id === giveaway.permission)?.name || giveaway.permission}` : false,
    				`${client.language({ textId: `Канал`, guildId: interaction.guildId })}: ${giveaway.channelId ? `<#${giveaway.channelId}>` : `${client.language({ textId: `укажи канал проведения раздачи`, guildId: interaction.guildId })}`}`,
    				`${client.language({ textId: `Количество победителей`, guildId: interaction.guildId })}: ${giveaway.winnerCount || `${client.language({ textId: `укажи количество победителей`, guildId: interaction.guildId })}`}`,
    				`${client.language({ textId: `Окончание`, guildId: interaction.guildId, locale: interaction.locale })}: ${!giveaway.endsTime && !giveaway.ends ? `${client.language({ textId: `укажи дату окончания (UTC) или тип окончания`, guildId: interaction.guildId })}` : [giveaway.endsTime ? `<t:${Math.floor(giveaway.endsTime.getTime() / 1000)}>` : undefined, giveaway.ends?.type === "members" ? `${client.language({ textId: `По достижению`, guildId: interaction.guildId, locale: interaction.locale })} ${giveaway.ends.amount} ${client.language({ textId: `участников`, guildId: interaction.guildId, locale: interaction.locale })}` : undefined, giveaway.ends?.type === "reaction" ? `${client.language({ textId: `По достижению`, guildId: interaction.guildId, locale: interaction.locale })} ${giveaway.ends.amount} ${client.language({ textId: `реакций`, guildId: interaction.guildId, locale: interaction.locale })}` : undefined].filter(e => e).join(` ${client.language({ textId: `или`, guildId: interaction.guildId, locale: interaction.locale })} `)}`,
    				`${client.language({ textId: `Создатель`, guildId: interaction.guildId })}: <@${giveaway.creator}>`,
    				`${client.language({ textId: `Награды`, guildId: interaction.guildId })}: ${giveaway.rewards.length ? await Promise.all(giveaway.rewards.map(async e => {
							if (e.type === RewardType.Currency) {
                                return `${settings.displayCurrencyEmoji}${settings.currencyName} (${e.amount})`
                            } else if (e.type === RewardType.Experience) {
                                return `${client.config.emojis.XP}${client.language({ textId: `Опыт`, guildId: interaction.guildId })} (${e.amount})`
                            } else if (e.type === RewardType.Reputation) {
                                return `${client.config.emojis.RP}${client.language({ textId: `Репутация`, guildId: interaction.guildId })} (${e.amount})`
                            } else if (e.type === RewardType.Item) {
                                const item = client.cache.items.find(i => i.itemID === e.id && !i.temp && i.enabled)
                                if (item) return `${item.displayEmoji}${item.name} (${e.amount})`
                                else return `${e.id} (${e.amount})`
                            } else if (e.type === RewardType.Text) {
                                return `📝${e.id} (${e.amount})`
                            } else if (e.type === RewardType.Role) {
                                return `<@&${e.id}>${e.ms ? ` [${client.functions.transformSecs(client, e.ms, interaction.guildId, interaction.locale)}]` : ``} (${e.amount})`
                            }
    				})).then(array => array.join(", ")) : `${client.language({ textId: `Добавь награду`, guildId: interaction.guildId })}`}`,
				].filter(e => e).join("\n"))
				.setThumbnail(giveaway.thumbnail || null)
				.setFooter({ text: `ID: ${giveaway.giveawayID}` })
            const giveawayMessage = await interaction.guild.channels.cache.get(giveaway.channelId).send({ 
                content: settings.roles?.giveawaysNotification ? `<@&${settings.roles.giveawaysNotification}>` : ` `, 
                embeds: [embed], 
                components: giveaway.permission && client.cache.permissions.some(e => e.id === giveaway.permission) ? 
                [ new ActionRowBuilder()
                    .addComponents(new ButtonBuilder()
                    .setStyle(ButtonStyle.Primary)
                    .setLabel(`${client.language({ textId: `Требование`, guildId: interaction.guildId })}`)
                    .setCustomId(`cmd{check-giveaway-requirements}giveaway{${giveaway.giveawayID}}`)) ] 
                : []
            })
            await giveawayMessage.react(client.config.emojis.tada)
            giveaway.messageId = giveawayMessage.id
            giveaway.url = giveawayMessage.url
            await giveaway.save()
            if (giveaway.endsTime) giveaway.setTimeoutEnd(client)
            giveaway.clearTimeoutDelete()
            profile.giveawaysCreated = 1
            const achievements = client.cache.achievements.filter(e => e.guildID === interaction.guildId && e.type === AchievementType.Giveaway && e.enabled)
            await Promise.all(achievements.map(async achievement => {
                if (!profile.achievements?.some(ach => ach.achievmentID === achievement.id) && profile.giveawaysCreated >= achievement.amount && !client.tempAchievements[profile.userID]?.includes(achievement.id)) {
                    if (!client.tempAchievements[profile.userID]) client.tempAchievements[profile.userID] = []
                    client.tempAchievements[profile.userID].push(achievement.id)
                    await profile.addAchievement(achievement)
                }    
            }))
            await profile.save()
            interaction.message.thread.setLocked(true)
            interaction.message.thread.setArchived(true)
            return interaction.update({ 
                content: `${client.config.emojis.YES} ${client.language({ textId: `Раздача была принята ${changes.length ? `с изменениями ` : ``}пользователем`, guildId: interaction.guildId })} <@${interaction.user.id}> ${client.language({ textId: `в`, guildId: interaction.guildId })} <t:${Math.floor(Date.now()/1000)}>(<t:${Math.floor(Date.now()/1000)}:R>): ${giveawayMessage.url}${changes.length ? `\n### ${client.language({ textId: `Изменения`, guildId: interaction.guildId })}:\n${changes.join("\n")}`: ``}`,
                embeds: [embed.setColor(Colors.Green)],
                components: [
                    new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                            .setStyle(ButtonStyle.Success)
                            .setLabel(`${client.language({ textId: `Принято`, guildId: interaction.guildId })}`)
                            .setCustomId(`0`)
                            .setDisabled(true)
                        )
                ] 
            })    
        } else
        if (interaction.customId.includes("decline")) {
            const embedRaw = interaction.message.embeds[0]
            const modal = new ModalBuilder()
                .setCustomId(`giveaway-mod_reason_${interaction.id}`)
                .setTitle(`${client.language({ textId: `Причина отклонения`, guildId: interaction.guildId, locale: interaction.locale })}`)
                .setLabelComponents([
                    new LabelBuilder()
                        .setLabel(`${client.language({ textId: `Причина`, guildId: interaction.guildId, locale: interaction.locale })}`)
                        .setTextInputComponent(
                            new TextInputBuilder()
                                .setCustomId("reason")
                                .setRequired(true)
                                .setStyle(TextInputStyle.Paragraph)
                                .setMaxLength(300)
                        ),
                ])
                await interaction.showModal(modal);delete client.globalCooldown[`${interaction.guildId}_${interaction.user.id}`]
                const filter = (i) => i.customId === `giveaway-mod_reason_${interaction.id}` && i.user.id === interaction.user.id
                interaction = await interaction.awaitModalSubmit({ filter, time: 120000 }).catch(e => interaction)
                if (interaction && interaction.isModalSubmit()) {
                    if (!client.cache.giveaways.get(giveaway.giveawayID)) {
                        return interaction.reply({ content: `${client.config.emojis.NO} ${client.language({ textId: `Эту раздачу уже отклонили`, guildId: interaction.guildId })}`, flags: ["Ephemeral"] })
                    }
                    const modalArgs = {}
                    interaction.fields.fields.each(field => modalArgs[field.customId] = field.value)
                    interaction.update({ 
                        content: `${client.language({ textId: `Раздача отклонена пользователем`, guildId: interaction.guildId })} <@${interaction.user.id}> ${client.language({ textId: `в`, guildId: interaction.guildId })} <t:${Math.floor(Date.now()/1000)}>(<t:${Math.floor(Date.now()/1000)}:R>) ${client.language({ textId: `по причине:`, guildId: interaction.guildId })}\n${modalArgs.reason}`,
                        embeds: [EmbedBuilder.from(embedRaw).setColor(Colors.Red)],
                        components: [
                            new ActionRowBuilder()
                                .addComponents(
                                    new ButtonBuilder()
                                    .setStyle(ButtonStyle.Danger)
                                    .setLabel(`${client.language({ textId: `Отклонено`, guildId: interaction.guildId })}`)
                                    .setCustomId(`0`)
                                    .setDisabled(true)
                                )
                        ]
                    })
                    interaction.message.thread.setLocked(true)
                    interaction.message.thread.setArchived(true)
                    if (giveaway.type === "user") {
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
                    const member = await interaction.guild.members.fetch(giveaway.creator).catch(e => null)
                    if (member) {
                        member.send({ content: `## ${interaction.guild.name}\n${client.language({ textId: `Раздача отклонена по причине:`, guildId: interaction.guildId })} ${modalArgs.reason}`, embeds: [embedRaw] }).catch(e => null)
                    }
                    giveaway.delete()
                } else return
        }
    }
}