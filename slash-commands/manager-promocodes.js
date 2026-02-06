const { ChannelType, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, ActionRowBuilder, EmbedBuilder, Collection, ChannelSelectMenuBuilder, Webhook, StringSelectMenuOptionBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, InteractionType, ApplicationCommandOptionType, RoleSelectMenuBuilder, LabelBuilder } = require("discord.js");
const CodeRegexp = /id{(.*?)}/
const limRegexp = /lim{(.*?)}/
const Cron = require("croner");
const { RewardType } = require("../enums/RewardType.js");
const Promocode = require("../classes/promocode.js");
const { format } = require('date-format-parse')
const { parse } = require('date-format-parse');
module.exports = {
    name: 'manager-promocodes',
    nameLocalizations: {
        'ru': `управление-промокодами`,
        'uk': `управління-промокодами`,
        'es-ES': `gestor-de-codigos-promocionales`
    },
    description: 'Manage promocodes',
    descriptionLocalizations: {
        'ru': `Управление промокодами`,
        'uk': `Управління промокодами`,
        'es-ES': `Gestión de códigos promocionales`
    },
    options: [
        {
			name: 'view',
            nameLocalizations: {
                'ru': `просмотр`,
                'uk': `перегляд`,
                'es-ES': `ver`
            },
            description: 'View all promocodes',
            descriptionLocalizations: {
                'ru': `Просмотр всех промокодов`,
                'uk': `Перегляд усіх промокодів`,
                'es-ES': `Ver todos los códigos promocionales`
            },
            type: ApplicationCommandOptionType.Subcommand,
		},
        {
            name: 'create',
            nameLocalizations: {
                'ru': `создать`,
                'uk': `створити`,
                'es-ES': `crear`
            },
            description: 'Create a promocode',
            descriptionLocalizations: {
                'ru': `Создать промокод`,
                'uk': `Створити промокод`,
                'es-ES': `Crear código promocional`
            },
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'promocode',
                    nameLocalizations: {
                        'ru': `промокод`,
                        'uk': `промокод`,
                        'es-ES': `codigo-promocional`
                    },
                    description: 'Promocode',
                    descriptionLocalizations: {
                        'ru': `Промокод`,
                        'uk': `Промокод`,
                        'es-ES': `Código promocional`
                    },
                    type: ApplicationCommandOptionType.String,
                    minLength: 2,
                    maxLength: 30,
                    required: true
                }
            ]
        },
        {
            name: 'edit',
            nameLocalizations: {
                'ru': `изменить`,
                'uk': `змінити`,
                'es-ES': `editar`
            },
            description: 'Edit a promocode',
            descriptionLocalizations: {
                'ru': `Изменить промокод`,
                'uk': `Змінити промокод`,
                'es-ES': `Editar código promocional`
            },
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'promocode',
                    nameLocalizations: {
                        'ru': `промокод`,
                        'uk': `промокод`,
                        'es-ES': `codigo-promocional`
                    },
                    description: 'Promocode',
                    descriptionLocalizations: {
                        'ru': `Промокод`,
                        'uk': `Промокод`,
                        'es-ES': `Código promocional`
                    },
                    type: ApplicationCommandOptionType.String,
                    minLength: 2,
                    maxLength: 30,
                    autocomplete: true,
                    required: true
                }
            ]
        },
        {
            name: 'copy',
            nameLocalizations: {
                'ru': `копировать`,
                'uk': `копіювати`,
                'es-ES': `copiar`
            },
            description: 'Copy a promocode',
            descriptionLocalizations: {
                'ru': `Копировать промокод`,
                'uk': `Копіювати промокод`,
                'es-ES': `Copiar código promocional`
            },
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'promocode',
                    nameLocalizations: {
                        'ru': `промокод`,
                        'uk': `промокод`,
                        'es-ES': `codigo-promocional`
                    },
                    description: 'The promocode being copied',
                    descriptionLocalizations: {
                        'ru': `Копируемый промокод`,
                        'uk': `Копіюваний промокод`,
                        'es-ES': `Código promocional a copiar`
                    },
                    type: ApplicationCommandOptionType.String,
                    minLength: 2,
                    maxLength: 30,
                    autocomplete: true,
                    required: true
                },
                {
                    name: 'new_promocode',
                    nameLocalizations: {
                        'ru': `новый_промокод`,
                        'uk': `новий_промокод`,
                        'es-ES': `nuevo_codigo-promocional`
                    },
                    description: 'New promocode',
                    descriptionLocalizations: {
                        'ru': `Новый промокод`,
                        'uk': `Новий промокод`,
                        'es-ES': `Nuevo código promocional`
                    },
                    type: ApplicationCommandOptionType.String,
                    minLength: 2,
                    maxLength: 30,
                    required: true
                }
            ]
        },
        {
            name: 'delete',
            nameLocalizations: {
                'ru': `удалить`,
                'uk': `видалити`,
                'es-ES': `eliminar`
            },
            description: 'Delete a promocode',
            descriptionLocalizations: {
                'ru': `Удалить промокод`,
                'uk': `Видалити промокод`,
                'es-ES': `Eliminar código promocional`
            },
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'promocode',
                    nameLocalizations: {
                        'ru': `промокод`,
                        'uk': `промокод`,
                        'es-ES': `codigo-promocional`
                    },
                    description: 'Promocode',
                    descriptionLocalizations: {
                        'ru': `Промокод`,
                        'uk': `Промокод`,
                        'es-ES': `Código promocional`
                    },
                    type: ApplicationCommandOptionType.String,
                    minLength: 2,
                    maxLength: 30,
                    autocomplete: true,
                    required: true
                }
            ]
        },
        {
            name: 'enable-all',
            nameLocalizations: {
                'ru': `включить-все`,
                'uk': `увімкнути-всі`,
                'es-ES': `activar-todos`
            },
            description: 'Enable all promocodes',
            descriptionLocalizations: {
                'ru': `Включить все промокоды`,
                'uk': `Увімкнути всі промокоди`,
                'es-ES': `Activar todos los códigos promocionales`
            },
            type: ApplicationCommandOptionType.Subcommand,
        },
        {
            name: 'disable-all',
            nameLocalizations: {
                'ru': `выключить-все`,
                'uk': `вимкнути-всі`,
                'es-ES': `desactivar-todos`
            },
            description: 'Disable all promocodes',
            descriptionLocalizations: {
                'ru': `Выключить все промокоды`,
                'uk': `Вимкнути всі промокоди`,
                'es-ES': `Desactivar todos los códigos promocionales`
            },
            type: ApplicationCommandOptionType.Subcommand,
        }
    ],
    defaultMemberPermissions: "Administrator",
    dmPermission: false,
    group: `managers`,
    cooldowns: new Collection(),
    run: async (client, interaction, args) => {
        const settings = client.cache.settings.get(interaction.guildId)
        let promocode
        if (interaction.isChatInputCommand()) {
            await interaction.deferReply({ flags: ["Ephemeral"] })
            if (args.Subcommand === "create") {
                promocode = new client.promocodeSchema({
                    code: args.promocode,
                    guildID: interaction.guildId
                })
                await promocode.save()
                promocode = new Promocode(client, promocode)
                client.cache.promocodes.set(`${promocode.code}_${promocode.guildID}`, promocode)
            } else
            if (args.Subcommand === "copy") {
                const promocodes = client.cache.promocodes.filter(e => e.guildID === interaction.guildId)
                const originalPromocode = promocodes.find(e => e.code === args.promocode && e.guildID === interaction.guildId)
                if (!originalPromocode) return interaction.editReply({ content: `${client.language({ textId: `Промокод`, guildId: interaction.guildId, locale: interaction.locale })}: **${args.promocode}** ${client.language({ textId: `не найден`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
                if (promocodes.some(e => e.code === args.new_promocode && e.guildID === interaction.guildId)) {
                    return interaction.editReply({ content: `${client.language({ textId: `Промокод`, guildId: interaction.guildId, locale: interaction.locale })}: **${args.new_promocode}** ${client.language({ textId: `уже существует, выбери другой код`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
                }
                const copyPromocode = structuredClone(Object.assign({}, { 
                    ...originalPromocode,
                    client: undefined, 
                    items: [],
                    used: []
                }))
                if (originalPromocode.items.length) copyPromocode.items = JSON.parse(JSON.stringify(originalPromocode.items))
                delete copyPromocode._id
                copyPromocode.code = args.new_promocode
                copyPromocode.enabled = false
                promocode = new client.promocodeSchema(copyPromocode)
                await promocode.save()
                promocode = new Promocode(client, promocode)
                client.cache.promocodes.set(`${promocode.code}_${promocode.guildID}`, promocode)
            } else
            if (args.Subcommand === "edit") {
                promocode = client.cache.promocodes.find(e => e.code === args.promocode && e.guildID === interaction.guildId)
                if (!promocode) return interaction.editReply({ content: `${client.config.emojis.NO} ${client.language({ textId: `Промокод`, guildId: interaction.guildId, locale: interaction.locale })} **${args.promocode}** ${client.language({ textId: `не существует`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
            } else
            if (args.Subcommand === "delete") {
                promocode = client.cache.promocodes.find(e => e.code === args.promocode && e.guildID === interaction.guildId)
                if (!promocode) return interaction.editReply({ content: `${client.config.emojis.NO} ${client.language({ textId: `Промокод`, guildId: interaction.guildId, locale: interaction.locale })} **${args.promocode}** ${client.language({ textId: `не существует`, guildId: interaction.guildId, locale: interaction.locale })}` })
                await promocode.delete()
                return interaction.editReply({ content: `${client.language({ textId: `Промокод`, guildId: interaction.guildId, locale: interaction.locale })} **${promocode.code}** ${client.language({ textId: `был удален`, guildId: interaction.guildId, locale: interaction.locale })}.`, flags: ["Ephemeral"] })
            } else
            if (args.Subcommand === "view") {
                const promocodes = client.cache.promocodes.filter(e => e.guildID === interaction.guildId)
                let min = 0
                let max = 100
                if (interaction.customId?.includes("lim")) {
                    max = +limRegexp.exec(interaction.customId)[1]
                    min = max - 100
                }
                let index = 0
                const embed = new EmbedBuilder()
                    .setTitle(`${client.language({ textId: `Менеджер промокодов`, guildId: interaction.guildId, locale: interaction.locale })} (${promocodes.size})`)
                    .setColor(3093046)
                    .setDescription(promocodes.size ? promocodes.map((promocode) => { 
                        return `${index++}. ${promocode.enabled ? "🟢": "🔴"}${promocode.code}`
                    }).slice(min, max).join("\n") : `${client.language({ textId: `Нет промокодов`, guildId: interaction.guildId, locale: interaction.locale })}`)
                const embeds = [
                    embed,
                    new EmbedBuilder()
                        .setColor(3093046)
                        .setDescription(`<:PLUS:1012990107143385159>${client.language({ textId: `Создать промокод`, guildId: interaction.guildId, locale: interaction.locale })}: </manager-promocodes create:1243977285900435466>\n<:pen:1012990423171600404>${client.language({ textId: `Изменить промокод`, guildId: interaction.guildId, locale: interaction.locale })}: </manager-promocodes edit:1243977285900435466>\n<:activities:1005856343141384264>${client.language({ textId: `Скопировать промокод`, guildId: interaction.guildId, locale: interaction.locale })}: </manager-promocodes copy:1243977285900435466>\n<:block:1005859695619215370>${client.language({ textId: `Удалить промокод`, guildId: interaction.guildId, locale: interaction.locale })}: </manager-promocodes delete:1243977285900435466>`)
                ]
                const components = [
                    new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setStyle(ButtonStyle.Primary)
                                .setEmoji(`${client.config.emojis.arrowLeft2}`)
                                .setCustomId(`cmd{manager-promocodes}lim{100}view1`)
                                .setDisabled((promocodes.size <= 100 && min === 0) || (promocodes.size > 100 && min < 100) ? true : false),
                            new ButtonBuilder()
                                .setStyle(ButtonStyle.Primary)
                                .setEmoji(`${client.config.emojis.arrowLeft}`)
                                .setCustomId(`cmd{manager-promocodes}lim{${max - 100}}view2`)
                                .setDisabled((promocodes.size <= 100 && min === 0) || (promocodes.size > 100 && min < 100) ? true : false),
                            new ButtonBuilder()
                                .setStyle(ButtonStyle.Primary)
                                .setEmoji(`${client.config.emojis.arrowRight}`)
                                .setCustomId(`cmd{manager-promocodes}lim{${max + 100}}view3`)
                                .setDisabled((promocodes.size <= 100 && min === 0) || (promocodes.size > 100 && min >= promocodes.size - 100) ? true : false),
                            new ButtonBuilder()
                                .setStyle(ButtonStyle.Primary)
                                .setEmoji(`${client.config.emojis.arrowRight2}`)
                                .setCustomId(`cmd{manager-promocodes}lim{${promocodes.size + (promocodes.size % 100 === 0 ? 0 : 100 - (promocodes.size % 100))}}view4`)
                                .setDisabled((promocodes.size <= 100 && min === 0) || (promocodes.size > 100 && min >= promocodes.size - 100) ? true : false)
                        )
                ]
                if (interaction.isChatInputCommand()) return interaction.editReply({ embeds: embeds, components: components })
                else return interaction.update({ embeds: embeds, components: components })
            } else
            if (args?.Subcommand === "enable-all") {
                if (!client.cache.promocodes.some(e => e.guildID === interaction.guildId)) return interaction.editReply({ content: `${client.config.emojis.NO}**${client.language({ textId: `На сервере нет промокодов`, guildId: interaction.guildId, locale: interaction.locale })}**`, flags: ["Ephemeral"] })
                let count = 0
                await Promise.all(client.cache.promocodes.filter(e => e.guildID === interaction.guildId && e.items.length && !e.enabled).map(async promocode => {
                    promocode.enable()
                    await promocode.save()
                    count++
                }))
                return interaction.editReply({ content: `${client.config.emojis.YES}**${client.language({ textId: `Промокоды были включены`, guildId: interaction.guildId, locale: interaction.locale })} (${count})**`, flags: ["Ephemeral"] })
            } else
            if (args?.Subcommand === "disable-all") {
                if (!client.cache.promocodes.some(e => e.guildID === interaction.guildId)) return interaction.editReply({ content: `${client.config.emojis.NO}**${client.language({ textId: `На сервере нет промокодов`, guildId: interaction.guildId, locale: interaction.locale })}**`, flags: ["Ephemeral"] })
                let count = 0
                await Promise.all(client.cache.promocodes.filter(e => e.guildID === interaction.guildId && e.enabled).map(async promocode => {
                    promocode.disable()
                    await promocode.save()
                    count++
                }))
                return interaction.editReply({ content: `${client.config.emojis.YES}**${client.language({ textId: `Промокоды были выключены`, guildId: interaction.guildId, locale: interaction.locale })} (${count})**`, flags: ["Ephemeral"] })
            }
        } else {
            promocode = client.cache.promocodes.find(e => e.code === CodeRegexp.exec(interaction.customId)[1] && e.guildID === interaction.guildId)
            if (!promocode) return interaction.reply({ content: `${client.config.emojis.NO} ${client.language({ textId: `Такого промокода не существует`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
        }
        if (interaction.isStringSelectMenu()) {
            if (interaction.values[0] === "on/off") {
                if (!promocode.enabled) {
                    const errors = []
                    if (!promocode.items.length) errors.push(`${client.config.emojis.NO} ${client.language({ textId: `Отсутствуют предметы для промокода`, guildId: interaction.guildId, locale: interaction.locale })}`)
                    if (errors.length) {
                        return interaction.reply({ content: `${client.config.emojis.NO} ${client.language({ textId: `Невозможно включить промокод`, guildId: interaction.guildId, locale: interaction.locale })}:\n${errors.join("\n")}`, flags: ["Ephemeral"] })
                    }
                    promocode.enable()
                } else {
                    promocode.disable()
                }
                await promocode.save()
            } else
            if (interaction.values[0] === "resetCronPattern") {
                const modal = new ModalBuilder()
                    .setCustomId(`manager-promocodes_resetCronPattern_${interaction.id}`)
                    .setTitle(`${client.language({ textId: `Cron-паттерн`, guildId: interaction.guildId, locale: interaction.locale })}`)
                    .setLabelComponents([
                        new LabelBuilder()
                            .setLabel(`${client.language({ textId: `Паттерн`, guildId: interaction.guildId, locale: interaction.locale })}`)
                            .setTextInputComponent(
                                new TextInputBuilder()
                                    .setCustomId("pattern")
                                    .setRequired(true)
                                    .setStyle(TextInputStyle.Short)
                                    .setValue(promocode.resetCronPattern || "")
                            ),
                    ])
                await interaction.showModal(modal);delete client.globalCooldown[`${interaction.guildId}_${interaction.user.id}`]
                const filter = (i) => i.customId === `manager-promocodes_resetCronPattern_${interaction.id}` && i.user.id === interaction.user.id;
                interaction = await interaction.awaitModalSubmit({ filter, time: 60000 }).catch(e => interaction)
                if (interaction && interaction.isModalSubmit()) {
                    const modalArgs = {}
                    interaction.fields.fields.each(field => modalArgs[field.customId] = field.value)
                    try {
                        const job = Cron(modalArgs.pattern, { timezone: "UTC", interval: 60, paused: true }, () => {} )
                        job.stop()
                    } catch (err) {
                        await interaction.deferUpdate()
                        return interaction.followUp({ content: `${client.config.emojis.NO}${err.message}`, flags: ["Ephemeral"] })
                    }
                    promocode.resetCronPattern = modalArgs.pattern
                    if (promocode.isEnabled) {
                        if (promocode.cronJob) promocode.cronJob.stop()
                        promocode.cronJobStart()
                    }
                    await promocode.save()
                }
            } else
            if (interaction.values[0] === "deleteDate") {
                let date = promocode.deleteDate ? format(new Date(promocode.deleteDate.getTime() + new Date().getTimezoneOffset() *1 * 60 * 1000), 'DD-MM-YYYY HH:mm') : undefined
                const modal = new ModalBuilder()
                	.setCustomId(`manager-promocodes_deleteDate_${interaction.id}`)
                	.setTitle(`${client.language({ textId: `Дата удаления (UTC)`, guildId: interaction.guildId, locale: interaction.locale })}`)
                    .setLabelComponents([
                        new LabelBuilder()
                            .setLabel(`${client.language({ textId: `Дата в UTC`, guildId: interaction.guildId, locale: interaction.locale })}`)
                            .setTextInputComponent(
                                new TextInputBuilder()
		                            .setCustomId("date")
		                            .setRequired(false)
		                            .setStyle(TextInputStyle.Short)
		                            .setValue(promocode.deleteDate ? date : format(new Date(Date.now() + 900000 + new Date().getTimezoneOffset() *1 * 60 * 1000), 'DD-MM-YYYY HH:mm'))
		                            .setPlaceholder(`${format(new Date(Date.now() + 900000 + new Date().getTimezoneOffset() *1 * 60 * 1000), 'DD-MM-YYYY HH:mm')}`)
                            ),
                    ])
                await interaction.showModal(modal);delete client.globalCooldown[`${interaction.guildId}_${interaction.user.id}`]
                const filter = (i) => i.customId === `manager-promocodes_deleteDate_${interaction.id}` && i.user.id === interaction.user.id;
                interaction = await interaction.awaitModalSubmit({ filter, time: 60000 }).catch(e => interaction)
                if (interaction && interaction.isModalSubmit()) {
                    const modalArgs = {}
                    interaction.fields.fields.each(field => modalArgs[field.customId] = field.value)
                    if (!modalArgs.date) promocode.deleteDate = undefined
                    else {
                        date = parse(modalArgs.date, 'DD-MM-YYYY HH:mm')
                        date = new Date(date.setMinutes(date.getMinutes() - new Date().getTimezoneOffset()))
                        if (isNaN(date.getTime())) {
                            return interaction.reply({ content: `${client.config.emojis.NO} ${client.language({ textId: `Введен неправильный формат даты. Правильный формат даты`, guildId: interaction.guildId, locale: interaction.locale })}: 25-05-2033 16:57.`, flags: ["Ephemeral"] })
                        }
                        if (date <= new Date()) return interaction.reply({ content: `${client.config.emojis.NO} ${client.language({ textId: `Дата окончания не должна быть в прошлом`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
                        promocode.deleteDate = date
                        promocode.setTimeoutDelete()
                    }
                    await promocode.save()
                } else return
            } else
            if (interaction.values[0] === "permission") {
                if (!client.cache.permissions.some(e => e.guildID === interaction.guildId)) {
                    return interaction.reply({ content: `${client.config.emojis.NO} ${client.language({ textId: `На сервере не найдено созданных прессетов прав. Для создания прессета используй команду </manager-permissions create:1150455842294988943>.`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
                }
                const modal = new ModalBuilder()
                    .setCustomId(`manager-promocodes_permissions_${interaction.id}`)
                    .setTitle(`${client.language({ textId: `Установка права`, guildId: interaction.guildId, locale: interaction.locale })}`)
                    .setLabelComponents([
                        new LabelBuilder()
                            .setLabel(`${client.language({ textId: `Название права`, guildId: interaction.guildId, locale: interaction.locale })}`)
                            .setTextInputComponent(
                                new TextInputBuilder()
                                    .setCustomId("name")
                                    .setRequired(false)
                                    .setValue(`${client.cache.permissions.find(e => e.id === promocode.permission)?.name || ""}`)
                                    .setStyle(TextInputStyle.Short)
                            ),
                    ])
                await interaction.showModal(modal);delete client.globalCooldown[`${interaction.guildId}_${interaction.user.id}`]
                const filter = (i) => i.customId === `manager-promocodes_permissions_${interaction.id}` && i.user.id === interaction.user.id;
                interaction = await interaction.awaitModalSubmit({ filter, time: 120000 }).catch(e => interaction)
                if (interaction && interaction.type === InteractionType.ModalSubmit) {
                    const modalArgs = {}
                    interaction.fields.fields.each(field => modalArgs[field.customId] = field.value)
                    if (!modalArgs.name) {
                        promocode.permission = undefined
                    } else {
                        const permission = client.cache.permissions.find(e => e.name.toLowerCase() === modalArgs.name.toLowerCase() && e.guildID === interaction.guildId)
                        if (!permission) {
                            await interaction.deferUpdate()
                            await interaction.followUp({ content: `${client.config.emojis.NO} ${client.language({ textId: `Права с названием`, guildId: interaction.guildId, locale: interaction.locale })} **${modalArgs.name}** ${client.language({ textId: `не существует`, guildId: interaction.guildId, locale: interaction.locale })}` })
                        } else {
                            promocode.permission = permission.id
                            await promocode.save()
                        }
                    }
                }
            } else
            if (interaction.values[0] === "addItem") {
                if (promocode.items.length >= 20) return interaction.reply({ content: `${client.config.emojis.NO}**${client.language({ textId: `Достигнуто максимальное количество предметов в промокоде`, guildId: interaction.guildId, locale: interaction.locale })}: 20**`, flags: ["Ephemeral"] })
                const components = JSON.parse(JSON.stringify(interaction.message.components))
                interaction.message.components.forEach(row => row.components.forEach(component => {
                    component.data.disabled = true
                }))
                await interaction.update({ components: interaction.message.components })
                await interaction.followUp({
                    embeds: [],
                    components: [
                        new ActionRowBuilder()
                            .addComponents(
                                new ButtonBuilder()
                                    .setCustomId(`manager-promocodes_add_xp`)
                                    .setLabel(client.language({ textId: `Опыт`, guildId: interaction.guildId, locale: interaction.locale }))
                                    .setEmoji(client.config.emojis.XP)
                                    .setStyle(ButtonStyle.Secondary),
                                new ButtonBuilder()
                                    .setCustomId(`manager-promocodes_add_currency`)
                                    .setLabel(settings.currencyName)
                                    .setEmoji(settings.displayCurrencyEmoji)
                                    .setStyle(ButtonStyle.Secondary),
                                new ButtonBuilder()
                                    .setCustomId(`manager-promocodes_add_reputation`)
                                    .setLabel(client.language({ textId: `Репутация`, guildId: interaction.guildId, locale: interaction.locale }))
                                    .setEmoji(client.config.emojis.RP)
                                    .setStyle(ButtonStyle.Secondary),
                                new ButtonBuilder()
                                    .setCustomId(`manager-promocodes_add_item`)
                                    .setLabel(client.language({ textId: `Предмет`, guildId: interaction.guildId, locale: interaction.locale }))
                                    .setEmoji(client.config.emojis.box)
                                    .setStyle(ButtonStyle.Secondary),
                                new ButtonBuilder()
                                    .setCustomId(`manager-promocodes_add_role`)
                                    .setLabel(client.language({ textId: `Роль`, guildId: interaction.guildId, locale: interaction.locale }))
                                    .setEmoji(client.config.emojis.roles)
                                    .setStyle(ButtonStyle.Secondary),
                            )
                    ],
                    flags: ["Ephemeral"]
                })
                const filter = (i) => i.customId.includes(`manager-promocodes_add`) && i.user.id === interaction.user.id;
                let interaction2 = await interaction.channel.awaitMessageComponent({ filter, time: 120000 }).catch(() => null)
                if (interaction2) {
                    const rewardType = interaction2.customId.includes("item") ? RewardType.Item : interaction2.customId.includes("xp") ? RewardType.Experience : interaction2.customId.includes("currency") ? RewardType.Currency : interaction2.customId.includes("reputation") ? RewardType.Reputation : RewardType.Role
                    if (interaction2.customId.includes("item")) {
                        const modal = new ModalBuilder()
                            .setCustomId(`manager-promocodes_addItem_${interaction2.id}`)
                            .setTitle(`${client.language({ textId: `Предмет`, guildId: interaction2.guildId, locale: interaction2.locale })}`)
                            .setLabelComponents([
                                new LabelBuilder()
                                    .setLabel(`${client.language({ textId: `Предмет`, guildId: interaction2.guildId, locale: interaction2.locale })}`)
                                    .setTextInputComponent(
                                        new TextInputBuilder()
                                            .setCustomId(`itemName`)
                                            .setRequired(true)
                                            .setStyle(TextInputStyle.Short)
                                            .setPlaceholder(`${client.language({ textId: `Название предмета`, guildId: interaction2.guildId, locale: interaction2.locale })}`)
                                    ),
                                new LabelBuilder()
                                    .setLabel(`${client.language({ textId: `Количество`, guildId: interaction2.guildId, locale: interaction2.locale })}`)
                                    .setTextInputComponent(
                                        new TextInputBuilder()
                                            .setCustomId(`amount`)
                                            .setRequired(true)
                                            .setStyle(TextInputStyle.Short)
                                    ),
                            ])
                        await interaction2.showModal(modal);delete client.globalCooldown[`${interaction2.guildId}_${interaction2.user.id}`]
                        const filter = (i) => i.customId === `manager-promocodes_addItem_${interaction2.id}` && i.user.id === interaction2.user.id;
                        interaction2 = await interaction2.awaitModalSubmit({ filter, time: 60000 }).catch(() => null)
                        if (interaction2 && interaction2.isModalSubmit()) {
                            const modalArgs = {}
                            interaction2.fields.fields.each(field => modalArgs[field.customId] = field.value)
                            const item = client.cache.items.find(e => e.guildID === interaction2.guildId && e.name.toLowerCase() === modalArgs.itemName.toLowerCase())
                            if (!item) {
                                await interaction2.update({ content: `${client.config.emojis.NO}**${client.language({ textId: `Предмет с названием`, guildId: interaction2.guildId, locale: interaction2.locale })} ${modalArgs.itemName} ${client.language({ textId: `не создан, либо он невидимый`, guildId: interaction2.guildId, locale: interaction2.locale })}**`, components: [], flags: ["Ephemeral"] })
                                return interaction.editReply({ components: components })
                            }
                            if (isNaN(+modalArgs.amount)) {
                                await interaction2.update({ content: `${client.config.emojis.NO}**${modalArgs.amount}${client.language({ textId: `не является числом`, guildId: interaction2.guildId, locale: interaction2.locale })}**`, components: [], flags: ["Ephemeral"] })
                                return interaction.editReply({ components: components })
                            }
                            modalArgs.amount = +modalArgs.amount
                            const max = 1000000000
                            const min = 0.01
                            if (modalArgs.amount > max || modalArgs.amount < min) {
                                await interaction2.update({ content: `${client.config.emojis.NO}**${client.language({ textId: `Количество не должно быть`, guildId: interaction.guildId, locale: interaction2.locale })} > ${max} ${client.language({ textId: `или`, guildId: interaction2.guildId, locale: interaction2.locale })} < ${min}**`, components: [], flags: ["Ephemeral"] })
                                return interaction.editReply({ components: components })
                            }
                            const reward = promocode.items.find(e => { return e.id === item.itemID })
                            if (reward) {
                                reward.amount = modalArgs.amount
                            }
                            else {
                                promocode.items.push({
                                    type: rewardType,
                                    id: item.itemID,
                                    amount: modalArgs.amount
                                })
                            }
                            await promocode.save()
                            await interaction2.update({ content: `${client.config.emojis.YES}${client.language({ textId: `Предмет`, guildId: interaction2.guildId, locale: interaction2.locale })} ${item.displayEmoji}${item.name} (${modalArgs.amount}) ${client.language({ textId: `добавлен в промокод`, guildId: interaction2.guildId, locale: interaction2.locale })}`, components: [], flags: ["Ephemeral"] })
                        }
                    } else if (interaction2.customId.includes("role")) {
                        await interaction2.update({ embeds: [], components: [
                            new ActionRowBuilder()
                                .addComponents(
                                    new RoleSelectMenuBuilder()
                                        .setCustomId(`manager-promocodes_addRole`)
                                )
                        ] })
                        const filter = (i) => i.customId.includes(`manager-promocodes_addRole`) && i.user.id === interaction2.user.id;
                        interaction2 = await interaction2.channel.awaitMessageComponent({ filter, time: 120000 }).catch(() => null)
                        if (interaction2) {
                            const role = interaction2.roles.first()
                            if (!interaction.guild.members.me.permissions.has("ManageRoles") || role.position > interaction.guild.members.me.roles.highest.position) {
                                await interaction2.update({ content: `${client.config.emojis.NO}**${client.language({ textId: `У меня нет прав для добавления роли`, guildId: interaction.guildId, locale: interaction.locale })}** <@&${role.id}>`, components: [], flags: ["Ephemeral"] })
                                return interaction.editReply({ components: components })
                            }
                            const modal = new ModalBuilder()
                                .setCustomId(`manager-promocodes_addRole_${interaction2.id}`)
                                .setTitle(`${client.language({ textId: `Роль`, guildId: interaction2.guildId, locale: interaction2.locale })}`)
                                .setLabelComponents([
                                    new LabelBuilder()
                                        .setLabel(`${client.language({ textId: `Количество`, guildId: interaction2.guildId, locale: interaction2.locale })}`)
                                        .setTextInputComponent(
                                            new TextInputBuilder()
                                                .setCustomId(`amount`)
                                                .setRequired(true)
                                                .setStyle(TextInputStyle.Short)
                                        ),
                                    new LabelBuilder()
                                        .setLabel(`${client.language({ textId: `Временная (минуты)`, guildId: interaction.guildId, locale: interaction.locale })}`)
                                        .setTextInputComponent(
                                            new TextInputBuilder()
                                                .setCustomId("minutes")
                                                .setRequired(false)
                                                .setStyle(TextInputStyle.Short)
                                        ),
                                ])
                            await interaction2.showModal(modal);delete client.globalCooldown[`${interaction2.guildId}_${interaction2.user.id}`]
                            const filter = (i) => i.customId === `manager-promocodes_addRole_${interaction2.id}` && i.user.id === interaction2.user.id;
                            interaction2 = await interaction2.awaitModalSubmit({ filter, time: 60000 }).catch(() => null)
                            if (interaction2 && interaction2.isModalSubmit()) {
                                const modalArgs = {}
                                interaction2.fields.fields.each(field => modalArgs[field.customId] = field.value)
                                if (isNaN(+modalArgs.amount)) {
                                    await interaction2.update({ content: `${client.config.emojis.NO}**${modalArgs.amount}${client.language({ textId: `не является числом`, guildId: interaction2.guildId, locale: interaction2.locale })}**`, components: [], flags: ["Ephemeral"] })
                                    return interaction.editReply({ components: components })
                                }
                                modalArgs.amount = +modalArgs.amount
                                const max = 1000000000
                                const min = 1
                                if (modalArgs.amount > max || modalArgs.amount < min) {
                                    await interaction2.update({ content: `${client.config.emojis.NO}**${client.language({ textId: `Количество не должно быть`, guildId: interaction.guildId, locale: interaction2.locale })} > ${max} ${client.language({ textId: `или`, guildId: interaction2.guildId, locale: interaction2.locale })} < ${min}**`, components: [], flags: ["Ephemeral"] })
                                    return interaction.editReply({ components: components })
                                }
                                let ms
                                if (modalArgs.minutes) {
                                    if (isNaN(+modalArgs.minutes) || !Number.isInteger(+modalArgs.minutes)) {
                                        await interaction2.update({ content: `${client.config.emojis.NO} **${modalArgs.minutes}** ${client.language({ textId: `не является целым числом`, guildId: interaction.guildId, locale: interaction.locale })}`, components: [], flags: ["Ephemeral"] })
                                        return interaction.editReply({ components: components })
                                    }
                                    modalArgs.minutes = +modalArgs.minutes
                                    if (modalArgs.minutes <= 0) {
                                        await interaction2.update({ content: `${client.config.emojis.NO} **${client.language({ textId: `Число не может быть`, guildId: interaction.guildId, locale: interaction.locale })} <= 0**`, components: [], flags: ["Ephemeral"] })
                                        return interaction.editReply({ components: components })
                                    }
                                    ms = modalArgs.minutes * 60 * 1000    
                                }
                                const reward = promocode.items.find(e => { return e.id === role.id })
                                if (reward) {
                                    reward.amount = modalArgs.amount
                                }
                                else {
                                    promocode.items.push({
                                        type: RewardType.Role,
                                        id: role.id,
                                        amount: modalArgs.amount,
                                        ms: ms
                                    })
                                }
                                await promocode.save()
                                await interaction2.update({ content: `${client.config.emojis.YES}${client.language({ textId: `Роль`, guildId: interaction2.guildId, locale: interaction2.locale })} <@&${role.id}> (${modalArgs.amount}) ${client.language({ textId: `добавлена в промокод`, guildId: interaction2.guildId, locale: interaction2.locale })}`, components: [], flags: ["Ephemeral"] })
                            }
                        }
                    } else {
                        const modal = new ModalBuilder()
                            .setCustomId(`manager-promocodes_add_${interaction2.id}`)
                            .setTitle(`${client.language({ textId: `Количество`, guildId: interaction2.guildId, locale: interaction2.locale })}`)
                            .setLabelComponents([
                                new LabelBuilder()
                                    .setLabel(`${client.language({ textId: `Количество`, guildId: interaction2.guildId, locale: interaction2.locale })}`)
                                    .setTextInputComponent(
                                        new TextInputBuilder()
                                            .setCustomId(`amount`)
                                            .setRequired(true)
                                            .setStyle(TextInputStyle.Short)
                                    ),
                            ])
                        await interaction2.showModal(modal);delete client.globalCooldown[`${interaction2.guildId}_${interaction2.user.id}`]
                        const filter = (i) => i.customId === `manager-promocodes_add_${interaction2.id}` && i.user.id === interaction2.user.id;
                        interaction2 = await interaction2.awaitModalSubmit({ filter, time: 60000 }).catch(() => null)
                        if (interaction2 && interaction2.isModalSubmit()) {
                            const modalArgs = {}
                            interaction2.fields.fields.each(field => modalArgs[field.customId] = field.value)
                            if (isNaN(+modalArgs.amount)) {
                                await interaction2.update({ content: `${client.config.emojis.NO}**${modalArgs.amount}${client.language({ textId: `не является числом`, guildId: interaction2.guildId, locale: interaction2.locale })}**`, components: [], flags: ["Ephemeral"] })
                                return interaction.editReply({ components: components })
                            } 
                            modalArgs.amount = +modalArgs.amount
                            const max = rewardType === RewardType.Reputation ? 1000 : 1000000000
                            const min = 0.01
                            if (modalArgs.amount > max || modalArgs.amount < min) {
                                await interaction2.update({ content: `${client.config.emojis.NO}**${client.language({ textId: `Количество не должно быть`, guildId: interaction2.guildId, locale: interaction2.locale })} > ${max} ${client.language({ textId: `или`, guildId: interaction2.guildId, locale: interaction2.locale })} < ${min}**`, components: [], flags: ["Ephemeral"] })
                                return interaction.editReply({ components: components })
                            }
                            const reward = promocode.items.find(e => { return e.type === rewardType })
                            if (reward) {
                                reward.amount = modalArgs.amount
                            } else {
                                promocode.items.push({
                                    type: rewardType,
                                    amount: modalArgs.amount
                                })
                            }
                            await promocode.save()
                            if (rewardType === RewardType.Experience) {
                                await interaction2.update({ content: `${client.config.emojis.YES}${client.language({ textId: `Опыт`, guildId: interaction2.guildId, locale: interaction2.locale })} (${modalArgs.amount}) ${client.language({ textId: `добавлен в промокод`, guildId: interaction2.guildId, locale: interaction2.locale })}`, components: [], flags: ["Ephemeral"] })    
                            }
                            if (rewardType === RewardType.Reputation) {
                                await interaction2.update({ content: `${client.config.emojis.YES}${client.language({ textId: `Репутация`, guildId: interaction2.guildId, locale: interaction2.locale })} (${modalArgs.amount}) ${client.language({ textId: `добавлена в промокод`, guildId: interaction2.guildId, locale: interaction2.locale })}`, components: [], flags: ["Ephemeral"] }) 
                            }
                            if (rewardType === RewardType.Currency) {
                                await interaction2.update({ content: `${client.config.emojis.YES}${settings.displayCurrencyEmoji}${settings.currencyName} (${modalArgs.amount}) ${client.language({ textId: `добавлен в промокод`, guildId: interaction2.guildId, locale: interaction2.locale })}`, components: [], flags: ["Ephemeral"] }) 
                            }
                        }
                    }
                    if (interaction2 !== null && !interaction2.deferred && !interaction2.replied) await interaction2.deferUpdate()
                }
            } else
            if (interaction.values[0] === "delItem") {
                if (!promocode.items.length) return interaction.reply({ content: `${client.config.emojis.NO}**${client.language({ textId: `В промокоде нет предметов`, guildId: interaction.guildId, locale: interaction.locale })}**`, flags: ["Ephemeral"] })
                await interaction.update({ embeds: [], components: [
                    new ActionRowBuilder()
                        .addComponents(
                            new StringSelectMenuBuilder()
                                .setOptions(promocode.items.map((e, i) => {
                                    return {
                                        emoji: e.type === RewardType.Currency ? settings.displayCurrencyEmoji : e.type === RewardType.Experience ? client.config.emojis.XP : e.type === RewardType.Item ? client.cache.items.get(e.id).emoji : e.type === RewardType.Reputation ? client.config.emojis.RP : client.config.emojis.roles,
                                        label: e.type === RewardType.Currency ? settings.currencyName : e.type === RewardType.Experience ? client.language({ textId: `Опыт`, guildId: interaction.guildId, locale: interaction.locale }) : e.type === RewardType.Item ? client.cache.items.get(e.id).name : e.type === RewardType.Reputation ? client.language({ textId: `Репутация`, guildId: interaction.guildId, locale: interaction.locale }) : interaction.guild.roles.cache.get(e.id)?.name || `${client.language({ textId: `Роль`, guildId: interaction.guildId, locale: interaction.locale })} ${e.id}`,
                                        value: String(i)
                                    }
                                }))
                                .setCustomId(`manager-promocodes_delItem`)
                        )
                ] })
                const filter = (i) => i.customId.includes(`manager-promocodes_delItem`) && i.user.id === interaction.user.id;
                const interaction2 = await interaction.channel.awaitMessageComponent({ filter, time: 120000 }).catch(() => null)
                if (interaction2) {
                    promocode.items.splice(Number(interaction2.values[0]), 1)
                    await promocode.save()
                    await interaction2.update({ content: client.config.emojis.YES, components: [], flags: ["Ephemeral"] }) 
                }
            } else
            if (interaction.values[0] === "amountUses") {
                const modal = new ModalBuilder()
                    .setCustomId(`manager-promocodes_amountUses_${interaction.id}`)
                    .setTitle(`${client.language({ textId: `Количество использований`, guildId: interaction.guildId, locale: interaction.locale })}`)
                    .setLabelComponents([
                        new LabelBuilder()
                            .setLabel(`${client.language({ textId: `Количество`, guildId: interaction.guildId, locale: interaction.locale })}`)
                            .setTextInputComponent(
                                new TextInputBuilder()
                                    .setCustomId("amountUses")
                                    .setRequired(true)
                                    .setStyle(TextInputStyle.Short)
                                    .setValue(`${promocode.amountUses}`)
                            ),
                    ])
                await interaction.showModal(modal);delete client.globalCooldown[`${interaction.guildId}_${interaction.user.id}`]
                const filter = (i) => i.customId === `manager-promocodes_amountUses_${interaction.id}` && i.user.id === interaction.user.id;
                interaction = await interaction.awaitModalSubmit({ filter, time: 60000 }).catch(e => interaction)
                if (interaction && interaction.isModalSubmit()) {
                    const modalArgs = {}
                    interaction.fields.fields.each(field => modalArgs[field.customId] = field.value)
                    if (isNaN(+modalArgs.amountUses)) {
                        return interaction.reply({ content: `${client.config.emojis.NO}**${modalArgs.amountUses}** ${client.language({ textId: `не является числом`, guildId: interaction.guildId, locale: interaction.locale })}`, components: [], flags: ["Ephemeral"] })
                    }
                    modalArgs.amountUses = +modalArgs.amountUses
                    if (modalArgs.amountUses <= 0) {
                        return interaction.reply({ content: `${client.config.emojis.NO}${client.language({ textId: `Число не должно быть`, guildId: interaction.guildId, locale: interaction.locale })} <= 0`, components: [], flags: ["Ephemeral"] })
                    }
                    promocode.amountUses = modalArgs.amountUses
                    await promocode.save()
                }
            } else
            if (interaction.values[0] === "enabledUntil") {
                let date = promocode.enabledUntil ? format(new Date(promocode.enabledUntil.getTime() + new Date().getTimezoneOffset() *1 * 60 * 1000), 'DD-MM-YYYY HH:mm') : undefined
                const modal = new ModalBuilder()
                	.setCustomId(`manager-promocodes_enabledUntil_${interaction.id}`)
                	.setTitle(`${client.language({ textId: `Дата отключения (UTC)`, guildId: interaction.guildId, locale: interaction.locale })}`)
                    .setLabelComponents([
                        new LabelBuilder()
                            .setLabel(`${client.language({ textId: `Дата в UTC`, guildId: interaction.guildId, locale: interaction.locale })}`)
                            .setTextInputComponent(
                                new TextInputBuilder()
		                            .setCustomId("date")
		                            .setRequired(false)
		                            .setStyle(TextInputStyle.Short)
		                            .setValue(promocode.enabledUntil ? date : format(new Date(Date.now() + 900000 + new Date().getTimezoneOffset() *1 * 60 * 1000), 'DD-MM-YYYY HH:mm'))
		                            .setPlaceholder(`${format(new Date(Date.now() + 900000 + new Date().getTimezoneOffset() *1 * 60 * 1000), 'DD-MM-YYYY HH:mm')}`)
                            ),
                    ])
                await interaction.showModal(modal);delete client.globalCooldown[`${interaction.guildId}_${interaction.user.id}`]
                const filter = (i) => i.customId === `manager-promocodes_enabledUntil_${interaction.id}` && i.user.id === interaction.user.id;
                interaction = await interaction.awaitModalSubmit({ filter, time: 60000 }).catch(e => interaction)
                if (interaction && interaction.isModalSubmit()) {
                    const modalArgs = {}
                    interaction.fields.fields.each(field => modalArgs[field.customId] = field.value)
                    if (!modalArgs.date) promocode.enabledUntil = undefined
                    else {
                        date = parse(modalArgs.date, 'DD-MM-YYYY HH:mm')
                        date = new Date(date.setMinutes(date.getMinutes() - new Date().getTimezoneOffset()))
                        if (isNaN(date.getTime())) {
                            return interaction.reply({ content: `${client.config.emojis.NO} ${client.language({ textId: `Введен неправильный формат даты. Правильный формат даты`, guildId: interaction.guildId, locale: interaction.locale })}: 25-05-2033 16:57.`, flags: ["Ephemeral"] })
                        }
                        if (date <= new Date()) return interaction.reply({ content: `${client.config.emojis.NO} ${client.language({ textId: `Дата окончания не должна быть в прошлом`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
                        promocode.enabledUntil = date
                    }
                    await promocode.save()
                } else return
            } else
            if (interaction.values[0] === "resetUsed") {
                if (promocode.used.length) {
                    promocode.used = []
                    await promocode.save()    
                }
            }
        }
        if (interaction.isButton()) {
            if (interaction.customId.includes("send")) {
                if (!promocode.items.length) {
                    return interaction.reply({ content: `${client.config.emojis.NO}${client.language({ textId: `В промокоде нет предметов`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
                }
                const components = JSON.parse(JSON.stringify(interaction.message.components))
    			interaction.message.components.forEach(row => row.components.forEach(component => {
                    component.data.disabled = true
                }))
    			await interaction.update({ components: interaction.message.components })
                await interaction.followUp({ 
                    content: `${client.language({ textId: `Выбери канал, куда будет отправлен промокод`, guildId: interaction.guildId, locale: interaction.locale })}`,
                    components: [
                        new ActionRowBuilder()
                            .addComponents(
                                new ChannelSelectMenuBuilder()
                                    .setCustomId(`manager-promocodes_channels_select`)
									.setChannelTypes(ChannelType.AnnouncementThread, ChannelType.GuildAnnouncement, ChannelType.GuildForum, ChannelType.GuildText, ChannelType.GuildVoice, ChannelType.PrivateThread, ChannelType.PublicThread)
                            ),
                        new ActionRowBuilder()
                            .addComponents(
                                new ButtonBuilder()
                                    .setCustomId(`manager-promocodes_channels_cancel`)
                                    .setLabel(client.language({ textId: `ОТМЕНА`, guildId: interaction.guildId, locale: interaction.locale }))
                                    .setStyle(ButtonStyle.Danger)
                            )
                    ],
                    flags: ["Ephemeral"]
                })    
                const filter = (i) => i.customId.includes(`manager-promocodes_channels`) && i.user.id === interaction.user.id;
                const interaction2 = await interaction.channel.awaitMessageComponent({ filter, time: 30000 }).catch(() => null)
                if (interaction2) {
                    if (interaction2.customId === "manager-promocodes_channels_select") {
                        promocode.channelId = interaction2.channels.first().id
                        await promocode.save()
                        await promocode.send()
                        interaction2.update({ content: `${client.config.emojis.YES}`, components: [], flags: ["Ephemeral"] })
                    }
                    if (interaction2.customId === "manager-promocodes_channels_cancel") {
                        interaction2.update({ content: `${client.config.emojis.YES} ${client.language({ textId: `Выбор отменён`, guildId: interaction.guildId, locale: interaction.locale })}`, components: [] })
                        return interaction.editReply({ components: components })
                    }
                }
            }
        }
        const embed = new EmbedBuilder()
            .setAuthor({ name: `${client.language({ textId: `Менеджер промокодов`, guildId: interaction.guildId, locale: interaction.locale })}` })
            .setTitle(promocode.code)
            .setDescription([
                `${promocode.isEnabled ? `🟢${client.language({ textId: `Промокод включен`, guildId: interaction.guildId, locale: interaction.locale })}` : `🔴${client.language({ textId: `Промокод выключен`, guildId: interaction.guildId, locale: interaction.locale })}`}`,
                `${client.config.emojis.use}${client.language({ textId: `Cron-паттерн (время) сброса использований`, guildId: interaction.guildId, locale: interaction.locale })} ([${client.language({ textId: `Что это?`, guildId: interaction.guildId, locale: interaction.locale })}](https://docs.wetbot.space/guide/cron-patterns)): \`${promocode.resetCronPattern || `<${client.language({ textId: `Отсутствует`, guildId: interaction.guildId, locale: interaction.locale })}>`}\``,
                `${client.config.emojis.doublecheck}${client.language({ textId: `Количество использований промокода`, guildId: interaction.guildId, locale: interaction.locale })}: ${promocode.used.length}/${promocode.amountUses}`,
                `${client.config.emojis.watch}${client.language({ textId: `Дата удаления`, guildId: interaction.guildId, locale: interaction.locale })} ${promocode.deleteDate ? `<t:${Math.floor(promocode.deleteDate/1000)}:f>` : `<${client.language({ textId: `Отсутствует`, guildId: interaction.guildId, locale: interaction.locale })}>`}`,
                `${client.config.emojis.watch}${client.language({ textId: `Дата отключения`, guildId: interaction.guildId, locale: interaction.locale })}: ${promocode.enabledUntil ? `<t:${Math.floor(promocode.enabledUntil/1000)}:f>` : `<${client.language({ textId: `Отсутствует`, guildId: interaction.guildId, locale: interaction.locale })}>`}`,
                `${client.config.emojis.crown}${client.language({ textId: `Право для промокода`, guildId: interaction.guildId, locale: interaction.locale })}: ${promocode.permission ? client.cache.permissions.get(promocode.permission)?.name || `${client.language({ textId: `Отсутствует`, guildId: interaction.guildId, locale: interaction.locale })}` : `${client.language({ textId: `Отсутствует`, guildId: interaction.guildId, locale: interaction.locale })}`}`,
            ].join("\n"))
            .setFields([{
                name: `${client.language({ textId: `Предметы в промокоде`, guildId: interaction.guildId, locale: interaction.locale })}`,
                value: promocode.items.length ? await Promise.all(promocode.items.map(async e => {
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
                    } else if (e.type === RewardType.Role) {
                        return `<@&${e.id}>${e.ms ? ` [${client.functions.transformSecs(client, e.ms, interaction.guildId, interaction.locale)}]` : ``} (${e.amount})`
                    }
                })).then(array => array.join("\n")) : `<${client.language({ textId: `Добавьте предметы`, guildId: interaction.guildId, locale: interaction.locale })}>`
            }])
            .setColor(3093046)
        const menu = new StringSelectMenuBuilder()
            .setCustomId(`cmd{manager-promocodes}id{${promocode.code}}`)
            .setPlaceholder(`${client.language({ textId: `Изменить`, guildId: interaction.guildId, locale: interaction.locale })}`)
            .setOptions([
                {
                    emoji: client.config.emojis.turn,
                    label: `${promocode.enabled ? client.language({ textId: `Выключить`, guildId: interaction.guildId, locale: interaction.locale }) : client.language({ textId: `Включить`, guildId: interaction.guildId, locale: interaction.locale })}`,
                    value: `on/off`
                },
                {
                    emoji: client.config.emojis.use,
                    label: `${client.language({ textId: `Cron-паттерн сброса использований`, guildId: interaction.guildId, locale: interaction.locale })}`,
                    value: `resetCronPattern`,
                    description: promocode.resetCronPattern ? `${promocode.resetCronPattern}` : undefined
                },
                {
                    emoji: client.config.emojis.doublecheck,
                    label: `${client.language({ textId: `Количество использований промокода`, guildId: interaction.guildId, locale: interaction.locale })}`,
                    value: `amountUses`,
                    description: `${promocode.amountUses}`
                },
                {
                    emoji: client.config.emojis.watch,
                    label: `${client.language({ textId: `Дата удаления`, guildId: interaction.guildId, locale: interaction.locale })}`,
                    value: `deleteDate`,
                },
                {
                    emoji: client.config.emojis.watch,
                    label: `${client.language({ textId: `Дата отключения`, guildId: interaction.guildId, locale: interaction.locale })}`,
                    value: `enabledUntil`
                },
                {
                    emoji: client.config.emojis.crown,
                    label: `${client.language({ textId: `Право для промокода`, guildId: interaction.guildId, locale: interaction.locale })}`,
                    value: `permission`,
                    description: `${promocode.permission ? client.cache.permissions.get(promocode.permission)?.name || `${client.language({ textId: `Отсутствует`, guildId: interaction.guildId, locale: interaction.locale })}` : `${client.language({ textId: `Отсутствует`, guildId: interaction.guildId, locale: interaction.locale })}`}`
                },
                {
                    emoji: client.config.emojis.plus,
                    label: `${client.language({ textId: `Добавить предмет`, guildId: interaction.guildId, locale: interaction.locale })}`,
                    value: `addItem`
                },
                {
                    emoji:  client.config.emojis.minus,
                    label: `${client.language({ textId: `Удалить предмет`, guildId: interaction.guildId, locale: interaction.locale })}`,
                    value: `delItem`
                },
                {
                    emoji:  client.config.emojis.use,
                    label: `${client.language({ textId: `Сбросить использования`, guildId: interaction.guildId, locale: interaction.locale })}`,
                    value: `resetUsed`
                }
            ])
        const row = new ActionRowBuilder().setComponents([menu])
        const send = new ButtonBuilder()
            .setCustomId(`cmd{manager-promocodes}id{${promocode.code}}send`)
            .setLabel(`${client.language({ textId: `Отправить`, guildId: interaction.guildId, locale: interaction.locale })}`)
            .setStyle(ButtonStyle.Secondary)
            .setEmoji(client.config.emojis.send)
        const row2 = new ActionRowBuilder().setComponents([send])
        if (interaction.replied || interaction.deferred) return interaction.editReply({ embeds: [embed], components: [row, row2] })
        else return interaction.update({ embeds: [embed], components: [row, row2] })
    }
}