const { InteractionType, ModalBuilder, TextInputBuilder, TextInputStyle, Collection, BaseChannel, Message, EmbedBuilder, LabelBuilder, ApplicationCommandOptionType, PermissionsBitField } = require("discord.js");
const ChannelRegexp = /channelId{(.*?)}/
const MessageRegexp = /messageId{(.*?)}/
const PermissionRegexp = /permission{(.*?)}/
const fetch = require("node-fetch")
module.exports = {
    name: 'say',
    nameLocalizations: {
        'ru': `сказать`,
        'uk': `сказати`,
        'es-ES': `decir`
    },
    description: 'Send message by WETBOT',
    descriptionLocalizations: {
        'ru': `Отправить сообщение от имени WETBOT`,
        'uk': `Надіслати повідомлення від імені WETBOT`,
        'es-ES': `Enviar mensaje como WETBOT`
    },
    options: [
        {
            name: 'message',
            nameLocalizations: {
                'ru': 'сообщение',
                'uk': 'повідомлення',
                'es-ES': 'mensaje'
            },
            description: 'Send regular message',
            descriptionLocalizations: {
                'ru': 'Отправлять обычное сообщение',
                'uk': 'Надіслати звичайне повідомлення',
                'es-ES': 'Enviar mensaje regular'
            },
            type: ApplicationCommandOptionType.Subcommand
        },
        {
            name: 'json',
            nameLocalizations: {
                'ru': 'json',
                'uk': 'json',
                'es-ES': 'json'
            },
            description: 'Send message from JSON',
            descriptionLocalizations: {
                'ru': 'Отправить сообщение из JSON',
                'uk': 'Надіслати повідомлення з JSON',
                'es-ES': 'Enviar mensaje desde JSON'
            },
            type: ApplicationCommandOptionType.Subcommand,
            options: [{
                name: 'file',
                nameLocalizations: {
                    'ru': 'файл',
                    'uk': 'файл',
                    'es-ES': 'file'
                },
                description: 'File as JSON',
                descriptionLocalizations: {
                    'ru': 'Файл в формате JSON',
                    'uk': 'Файл у форматі JSON',
                    'es-ES': 'File as JSON'
                },
                type: ApplicationCommandOptionType.Attachment,
                required: true
            }]
        },
    ],
    defaultMemberPermissions: PermissionsBitField.Flags.Administrator,
    dmPermission: false,
    group: `general-group`,
    cooldowns: new Collection(),
    /**
     *
     * @param {Client} client
     * @param {CommandInteraction} interaction
     */
    run: async (client, interaction) => {
        const subcommand = interaction.options?.getSubcommand()
        if (subcommand === "message" || !interaction.isChatInputCommand()) {
            let reply = false
            let send = true
            let update = false
            const flags = []
            if (!interaction.channel) return
            if (interaction.isButton()) {
                if (ChannelRegexp.exec(interaction.customId) && !MessageRegexp.exec(interaction.customId)) {
                    return interaction.reply({ content: `${client.config.emojis.NO}${client.language({ textId: `Аргумент channelId должен быть вместе с аргументом messageId`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
                }
                if (!ChannelRegexp.exec(interaction.customId) && MessageRegexp.exec(interaction.customId)) {
                    return interaction.reply({ content: `${client.config.emojis.NO}${client.language({ textId: `Аргумент messageId должен быть вместе с аргументом channelId`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
                }
                if (interaction.customId.includes("reply") && interaction.customId.includes("update")) {
                    return interaction.reply({ content: `${client.config.emojis.NO}${client.language({ textId: `Аргументы reply и update не могут быть вместе`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
                }
                if (!interaction.customId.includes("reply") && interaction.customId.includes("eph")) {
                    return interaction.reply({ content: `${client.config.emojis.NO}${client.language({ textId: `Аргумент eph может быть только вместе с аргументом reply`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
                }
                if (interaction.customId.includes("reply")) {
                    reply = true
                    send = false
                } else if (interaction.customId.includes("update")) {
                    update = true
                    send = false
                } else if (!interaction.channel.permissionsFor(interaction.guild.members.me).has("SendMessages")) return interaction.reply({ content: `${client.language({ textId: `У меня нет прав для отправки сообщений в этом канале`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
                if (PermissionRegexp.exec(interaction.customId)) {
                    const permission = client.cache.permissions.find(e => e.id === PermissionRegexp.exec(interaction.customId)[1] && e.guildID === interaction.guildId)
                    if (!permission) {
                        return interaction.reply({ content: `${client.config.emojis.NO} ${client.language({ textId: "Для этой команды установлено неизвестное право", guildId: interaction.guildId, locale: interaction.locale })}: ${PermissionRegexp.exec(interaction.customId)[1]}`, flags: ["Ephemeral"] })
                    }
                    const profile = await client.functions.fetchProfile(client, interaction.user.id, interaction.guildId)
                    const isPassing = permission.for(profile, interaction.member, interaction.channel, interaction)
                    if (isPassing.value === false) {
                        return interaction.reply({ embeds: [new EmbedBuilder().setColor(3093046).setTitle(`${client.language({ textId: `Для этого взаимодействия требуется:`, guildId: interaction.guildId, locale: interaction.locale })}`).setDescription(isPassing.reasons.join("\n"))], flags: ["Ephemeral"] })
                    }
                }
                if (interaction.customId.includes("eph")) flags.push("Ephemeral")
                if (ChannelRegexp.exec(interaction.customId) && MessageRegexp.exec(interaction.customId)) {
                    const channelID = ChannelRegexp.exec(interaction.customId)[1]
                    const messageID = MessageRegexp.exec(interaction.customId)[1]
                    const channel = await interaction.guild.channels.fetch(channelID).catch(() => null)
                    if (!channel || !(channel instanceof BaseChannel)) {
                        return interaction.reply({ content: `${client.config.emojis.NO}${client.language({ textId: `Канал с ID`, guildId: interaction.guildId, locale: interaction.locale })} ${channelID} ${client.language({ textId: `не найден`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
                    }
                    if (!channel.messages) {
                        return interaction.reply({ content: `${client.config.emojis.NO}${client.language({ textId: `Канал`, guildId: interaction.guildId, locale: interaction.locale })} <#${channelID}> ${client.language({ textId: `не может иметь сообщения`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
                    }
                    const message = await channel.messages.fetch(messageID).catch(() => null)
                    if (!message || !(message instanceof Message)) {
                        return interaction.reply({ content: `${client.config.emojis.NO}${client.language({ textId: `Сообщение с ID`, guildId: interaction.guildId, locale: interaction.locale })} ${messageID} ${client.language({ textId: `не найдено в канале`, guildId: interaction.guildId, locale: interaction.locale })} <#${channelID}>`, flags: ["Ephemeral"] })
                    }
                    if (reply) {
                        return interaction.reply({ content: message.content, embeds: message.embeds, components: message.components, files: message.attachments.map(e => e), flags })
                    } else if (update) {
                        return interaction.update({ content: message.content, embeds: message.embeds, components: message.components, files: message.attachments.map(e => e) })
                    } else {
                        interaction.deferUpdate()
                        return interaction.channel.send({ content: message.content, embeds: message.embeds, components: message.components, files: message.attachments.map(e => e) })
                    }
                }
            }
            if (!interaction.channel.permissionsFor(interaction.guild.members.me).has("SendMessages")) return interaction.reply({ content: `${client.language({ textId: `У меня нет прав для отправки сообщений в этом канале`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
            const modal = new ModalBuilder()
                .setCustomId(`say_${interaction.id}`)
                .setTitle(`${client.language({ textId: `Отправить сообщение в канал`, guildId: interaction.guildId, locale: interaction.locale })}`)
                .addLabelComponents([
                    new LabelBuilder()
                        .setLabel(`${client.language({ textId: `Сообщение`, guildId: interaction.guildId, locale: interaction.locale })}`)
                        .setTextInputComponent(
                            new TextInputBuilder()
                                .setCustomId("message")
                                .setRequired(true)
                                .setStyle(TextInputStyle.Paragraph)
                        )
                ])
            await interaction.showModal(modal);delete client.globalCooldown[`${interaction.guildId}_${interaction.user.id}`]
            const filter = (i) => i.customId === `say_${interaction.id}` && i.user.id === interaction.user.id;
            interaction = await interaction.awaitModalSubmit({ filter, time: 120000 }).catch(e => interaction)
            if (interaction && interaction.type === InteractionType.ModalSubmit) {
                const modalArgs = {}
                interaction.fields.fields.each(field => modalArgs[field.customId] = field.value)
                let error = false
                const channelId = modalArgs.message.split("/")[5]
                const messageId = modalArgs.message.split("/")[6]
                if (channelId && messageId) {
                    const channel = await interaction.guild.channels.fetch(channelId).catch(() => null)
                    if (channel && channel instanceof BaseChannel) {
                        if (channel.messages) {
                            const message = await channel.messages.fetch({ message: messageId }).catch(() => null)
                            if (message && message instanceof Message) {
                                if (reply) {
                                    return interaction.reply({ content: message.content, embeds: message.embeds, components: message.components, files: message.attachments.map(e => e), flags })
                                } else if (update) {
                                    return interaction.update({ content: message.content, embeds: message.embeds, components: message.components, files: message.attachments.map(e => e) })
                                } else await interaction.channel.send({ content: message.content, embeds: message.embeds, components: message.components, files: message.attachments.map(e => e) }).catch(async (e) => {
                                    error = true
                                    return await interaction.reply({ content: `${client.config.emojis.NO}${client.language({ textId: `Сообщение не отправлено. Ошибка`, guildId: interaction.guildId, locale: interaction.locale })}:\n${e}`, flags: ["Ephemeral"] })
                                })
                                if (!error) return interaction.deferUpdate()
                            }    
                        }
                    }
                }
                if (reply) {
                    return interaction.reply({ content: modalArgs.message, flags })
                } else if (update) {
                    return interaction.update({ content: modalArgs.message, embeds: [], components: [], files: [] })
                } else {
                    if (isValidJSON(modalArgs.message)) {
                        const json = JSON.parse(modalArgs.message);
                        await interaction.channel.send(json).catch(async (e) => {
                            error = true
                            return await interaction.reply({ content: `${client.config.emojis.NO}${client.language({ textId: `Сообщение не отправлено. Ошибка`, guildId: interaction.guildId, locale: interaction.locale })}:\n${e}`, flags: ["Ephemeral"] })
                        })
                    } else {
                        await interaction.channel.send({ content: modalArgs.message }).catch(async (e) => {
                            error = true
                            return await interaction.reply({ content: `${client.config.emojis.NO}${client.language({ textId: `Сообщение не отправлено. Ошибка`, guildId: interaction.guildId, locale: interaction.locale })}:\n${e}`, flags: ["Ephemeral"] })
                        })
                    }
                    
                }
                if (!error) return interaction.deferUpdate()
            }
        }
        if (subcommand === "json") {
            const attachment = interaction.options.getAttachment("file")
            if (!attachment.contentType.includes("application/json")) {
                return interaction.reply({ content: `${client.config.emojis.NO} ${client.language({ textId: `Формат вложения должен быть .json`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
            }
            const res = await fetch(attachment.url)
            const buffer = await res.buffer()
            const string = buffer.toString()
            let error = false
            if (isValidJSON(string)) {
                const json = JSON.parse(string)
                await interaction.channel.send(json).catch(async (err) => {
                    error = true
                    interaction.reply({ content: `${client.config.emojis.NO}${client.language({ textId: `Сообщение не отправлено. Ошибка`, guildId: interaction.guildId, locale: interaction.locale })}:\n${err}`, flags: ["Ephemeral"] })
                })
            } else {
                error = true
                await interaction.reply({ content: `${client.config.emojis.NO} ${client.language({ textId: `Не валидный JSON`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
            }
            if (!error) return interaction.reply({ content: `${client.config.emojis.YES}${client.language({ textId: `Сообщение отправлено`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
        }
    }
};
function isValidJSON(str) {
    try {
        JSON.parse(str);
        return true;
    } catch (e) {
        return false;
    }
}