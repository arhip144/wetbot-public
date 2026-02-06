const { ChannelType, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, ActionRowBuilder, EmbedBuilder, Collection, ChannelSelectMenuBuilder, Webhook, StringSelectMenuOptionBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, InteractionType, ApplicationCommandOptionType, LabelBuilder } = require("discord.js")
const WormholeRegexp = /wormhole{(.*?)}/
const uniqid = require('uniqid')
const Wormhole = require("../classes/wormhole.js")
const limRegexp = /lim{(.*?)}/
const Cron = require("croner");
const CronTranslator = require("../classes/CronTranslator.js")
const axios = require('axios');
module.exports = {
    name: 'manager-wormholes',
    nameLocalizations: {
        'ru': `управление-червоточинами`,
        'uk': `управління-червоточинами`,
        'es-ES': `gestor-agujeros-de-gusano`
    },
    description: 'Manage wormholes',
    descriptionLocalizations: {
        'ru': `Управление червоточинами`,
        'uk': `Управління червоточинами`,
        'es-ES': `Gestión de agujeros de gusano`
    },
    options: [
        {
            name: 'view',
            nameLocalizations: {
                'ru': `просмотр`,
                'uk': `перегляд`,
                'es-ES': `ver`
            },
            description: 'View all wormholes',
            descriptionLocalizations: {
                'ru': `Просмотр всех червоточин`,
                'uk': `Перегляд усіх червоточин`,
                'es-ES': `Ver todos los agujeros de gusano`
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
            description: 'Create a wormhole',
            descriptionLocalizations: {
                'ru': `Создать червоточину`,
                'uk': `Створити червоточину`,
                'es-ES': `Crear un agujero de gusano`
            },
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'name',
                    nameLocalizations: {
                        'ru': `название`,
                        'uk': `назва`,
                        'es-ES': `nombre`
                    },
                    description: 'Wormhole name',
                    descriptionLocalizations: {
                        'ru': `Название червоточины`,
                        'uk': `Назва червоточини`,
                        'es-ES': `Nombre del agujero de gusano`
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
            description: 'Edit a wormhole',
            descriptionLocalizations: {
                'ru': `Изменить червоточину`,
                'uk': `Змінити червоточину`,
                'es-ES': `Editar un agujero de gusano`
            },
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'name',
                    nameLocalizations: {
                        'ru': `название`,
                        'uk': `назва`,
                        'es-ES': `nombre`
                    },
                    description: 'Wormhole name',
                    descriptionLocalizations: {
                        'ru': `Название червоточины`,
                        'uk': `Назва червоточини`,
                        'es-ES': `Nombre del agujero de gusano`
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
            description: 'Copy a wormhole',
            descriptionLocalizations: {
                'ru': `Копировать червоточину`,
                'uk': `Копіювати червоточину`,
                'es-ES': `Copiar un agujero de gusano`
            },
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'wormhole',
                    nameLocalizations: {
                        'ru': `червоточина`,
                        'uk': `червоточина`,
                        'es-ES': `agujero-de-gusano`
                    },
                    description: 'Wormhole name',
                    descriptionLocalizations: {
                        'ru': `Название червоточины`,
                        'uk': `Назва червоточини`,
                        'es-ES': `Nombre del agujero de gusano`
                    },
                    type: ApplicationCommandOptionType.String,
                    minLength: 2,
                    maxLength: 30,
                    autocomplete: true,
                    required: true
                },
                {
                    name: 'name',
                    nameLocalizations: {
                        'ru': `название`,
                        'uk': `назва`,
                        'es-ES': `nombre`
                    },
                    description: 'Name for new wormhole',
                    descriptionLocalizations: {
                        'ru': `Название для новой червоточины`,
                        'uk': `Назва для нової червоточини`,
                        'es-ES': `Nombre para el nuevo agujero de gusano`
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
            description: 'Delete a wormhole',
            descriptionLocalizations: {
                'ru': `Удалить червоточину`,
                'uk': `Видалити червоточину`,
                'es-ES': `Eliminar un agujero de gusano`
            },
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'name',
                    nameLocalizations: {
                        'ru': `название`,
                        'uk': `назва`,
                        'es-ES': `nombre`
                    },
                    description: 'Wormhole name',
                    descriptionLocalizations: {
                        'ru': `Название червоточины`,
                        'uk': `Назва червоточини`,
                        'es-ES': `Nombre del agujero de gusano`
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
            description: 'Enable all wormholes',
            descriptionLocalizations: {
                'ru': `Включить все червоточины`,
                'uk': `Увімкнути всі червоточини`,
                'es-ES': `Activar todos los agujeros de gusano`
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
            description: 'Disable all wormholes',
            descriptionLocalizations: {
                'ru': `Выключить все червоточины`,
                'uk': `Вимкнути всі червоточини`,
                'es-ES': `Desactivar todos los agujeros de gusano`
            },
            type: ApplicationCommandOptionType.Subcommand,
        }
    ],
    defaultMemberPermissions: "Administrator",
    dmPermission: false,
    group: `managers`,
    cooldowns: new Collection(),
    run: async (client, interaction, args) => {
        let wormhole
        if (interaction.isChatInputCommand() || interaction.customId?.includes("view")) {
            if (interaction.isChatInputCommand()) await interaction.deferReply({ flags: ["Ephemeral"] })
            if (args?.Subcommand === "create") {
                const settings = client.cache.settings.get(interaction.guildId)
                const wormholes = client.cache.wormholes.filter(e => e.guildID === interaction.guildId)
                if (wormholes.size >= settings.max_wormholes) return interaction.editReply({ content: `${client.language({ textId: `Достигнуто максимум червоточин:`, guildId: interaction.guildId, locale: interaction.locale })} ${settings.max_wormholes}`, flags: ["Ephemeral"] })
                if (client.cache.wormholes.some(e => e.name.toLowerCase() === args.name.toLowerCase() && e.guildID === interaction.guildId)) {
                    return interaction.editReply({ content: `${client.config.emojis.NO}**${client.language({ textId: `Червоточина с названием`, guildId: interaction.guildId, locale: interaction.locale })} <${args.name}> ${client.language({ textId: `уже существует, выбери другое название`, guildId: interaction.guildId, locale: interaction.locale })}**`, flags: ["Ephemeral"] })
                }
                wormhole = new client.wormholeSchema({
                    wormholeID: uniqid.time(),
                    name: args.name,
                    guildID: interaction.guildId,
                    enabled: false,
                    deleteAfterTouch: false,
                    runsLeft: Infinity,
                    visibleDate: true
                })
                await wormhole.save()
                wormhole = new Wormhole(client, wormhole)
                client.cache.wormholes.set(wormhole.wormholeID, wormhole)
            } else
            if (args?.Subcommand === "edit") {
                wormhole = client.cache.wormholes.find(e => e.name.toLowerCase() === args.name.toLowerCase() && e.guildID === interaction.guildId)
                if (!wormhole) return interaction.editReply({ content: `${client.config.emojis.NO}**${client.language({ textId: `Червоточина с названием`, guildId: interaction.guildId, locale: interaction.locale })} <${args.name}> ${client.language({ textId: `не существует`, guildId: interaction.guildId, locale: interaction.locale })}**`, flags: ["Ephemeral"] })
            } else
            if (args?.Subcommand === "copy") {
                const settings = client.cache.settings.get(interaction.guildId)
                const wormholes = client.cache.wormholes.filter(e => e.guildID === interaction.guildId)
                if (wormholes.size >= settings.max_wormholes) return interaction.editReply({ content: `${client.language({ textId: `Достигнуто максимум червоточин:`, guildId: interaction.guildId, locale: interaction.locale })} ${settings.max_wormholes}`, flags: ["Ephemeral"] })
                if (client.cache.wormholes.some(e => e.name.toLowerCase() === args.name.toLowerCase() && e.guildID === interaction.guildId)) {
                    return interaction.editReply({ content: `${client.config.emojis.NO}**${client.language({ textId: `Червоточина с названием`, guildId: interaction.guildId, locale: interaction.locale })}: <${args.name}>> ${client.language({ textId: `уже существует, выбери другое название`, guildId: interaction.guildId, locale: interaction.locale })}**`, flags: ["Ephemeral"] })
                }
                let originalWormhole = client.cache.wormholes.find(e => e.name.toLowerCase() === args.wormhole.toLowerCase() && e.guildID === interaction.guildId)
                if (!originalWormhole) return interaction.editReply({ content: `${client.config.emojis.NO}**${client.language({ textId: `Червоточина с названием`, guildId: interaction.guildId, locale: interaction.locale })}: <${args.name}> ${client.language({ textId: `не найдена`, guildId: interaction.guildId, locale: interaction.locale })}**`, flags: ["Ephemeral"] })
                let copyWormhole = structuredClone(Object.assign({}, { ...originalWormhole, client: undefined, cronJob: undefined }))
                delete copyWormhole._id
                copyWormhole.name = args.name
                copyWormhole.wormholeID = uniqid.time()
                copyWormhole.enabled = false
                copyWormhole = new client.wormholeSchema(copyWormhole)
                await copyWormhole.save()
                wormhole = new Wormhole(client, copyWormhole)
                client.cache.wormholes.set(wormhole.wormholeID, wormhole)
            } else
            if (args?.Subcommand === "delete") {
                wormhole = client.cache.wormholes.find(e => e.name.toLowerCase() === args.name.toLowerCase() && e.guildID === interaction.guildId)
                if (!wormhole) return interaction.editReply({ content: `${client.config.emojis.NO}**${client.language({ textId: `Червоточина с названием`, guildId: interaction.guildId, locale: interaction.locale })} <${args.name}> ${client.language({ textId: `не существует`, guildId: interaction.guildId, locale: interaction.locale })}**` })
                await wormhole.delete()
                return interaction.editReply({ content: `${client.config.emojis.YES}**${client.language({ textId: `Червоточина`, guildId: interaction.guildId, locale: interaction.locale })} <${wormhole.name}> ${client.language({ textId: `была удалена`, guildId: interaction.guildId, locale: interaction.locale })}**`, flags: ["Ephemeral"] })
            } else
            if (args?.Subcommand === "view" || interaction.customId?.includes("view")) {
                const settings = client.cache.settings.get(interaction.guildId)
                const wormholes = client.cache.wormholes.filter(e => e.guildID === interaction.guildId)
                let min = 0
                let max = 25
                if (interaction.customId?.includes("lim")) {
                    max = +limRegexp.exec(interaction.customId)[1]
                    min = max - 25
                }
                let index = 0
                const embed = new EmbedBuilder()
                    .setTitle(`${client.language({ textId: `Менеджер червоточин`, guildId: interaction.guildId, locale: interaction.locale })} (${wormholes.size}/${settings.max_wormholes})`)
                    .setColor(3093046)
                    .setDescription(wormholes.size ? wormholes.map((wormhole) => { 
                        return `${index++}. ${wormhole.isEnabled ? "🟢": "🔴"}${wormhole.name}`
                    }).slice(min, max).join("\n") : `${client.language({ textId: `Нет червоточин`, guildId: interaction.guildId, locale: interaction.locale })}`)
                const embeds = [
                    embed,
                    new EmbedBuilder()
                        .setColor(3093046)
                        .setDescription(`${client.config.emojis.plus}${client.language({ textId: `Создать червоточину`, guildId: interaction.guildId, locale: interaction.locale })}: </manager-wormholes create:1150455842294988948>\n${client.config.emojis.edit}${client.language({ textId: `Изменить червоточину`, guildId: interaction.guildId, locale: interaction.locale })}: </manager-wormholes edit:1150455842294988948>\n${client.config.emojis.copy}${client.language({ textId: `Скопировать червоточину`, guildId: interaction.guildId, locale: interaction.locale })}: </manager-wormholes copy:1150455842294988948>\n${client.config.emojis.trash}${client.language({ textId: `Удалить червоточину`, guildId: interaction.guildId, locale: interaction.locale })}: </manager-wormholes delete:1150455842294988948>`)
                ]
                const components = [
                    new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setStyle(ButtonStyle.Primary)
                                .setEmoji(`${client.config.emojis.arrowLeft2}`)
                                .setCustomId(`cmd{manager-wormholes}lim{25}view1`)
                                .setDisabled((wormholes.size <= 25 && min === 0) || (wormholes.size > 25 && min < 25) ? true : false),
                            new ButtonBuilder()
                                .setStyle(ButtonStyle.Primary)
                                .setEmoji(`${client.config.emojis.arrowLeft}`)
                                .setCustomId(`cmd{manager-wormholes}lim{${max - 25}}view2`)
                                .setDisabled((wormholes.size <= 25 && min === 0) || (wormholes.size > 25 && min < 25) ? true : false),
                            new ButtonBuilder()
                                .setStyle(ButtonStyle.Primary)
                                .setEmoji(`${client.config.emojis.arrowRight}`)
                                .setCustomId(`cmd{manager-wormholes}lim{${max + 25}}view3`)
                                .setDisabled((wormholes.size <= 25 && min === 0) || (wormholes.size > 25 && min >= wormholes.size - 25) ? true : false),
                            new ButtonBuilder()
                                .setStyle(ButtonStyle.Primary)
                                .setEmoji(`${client.config.emojis.arrowRight2}`)
                                .setCustomId(`cmd{manager-wormholes}lim{${wormholes.size + (wormholes.size % 25 === 0 ? 0 : 25 - (wormholes.size % 25))}}view4`)
                                .setDisabled((wormholes.size <= 25 && min === 0) || (wormholes.size > 25 && min >= wormholes.size - 25) ? true : false)
                        )
                ]
                if (interaction.isChatInputCommand()) return interaction.editReply({ embeds: embeds, components: components })
                else return interaction.update({ embeds: embeds, components: components })
            } else
            if (args?.Subcommand === "enable-all") {
                if (!client.cache.wormholes.some(e => e.guildID === interaction.guildId)) return interaction.editReply({ content: `${client.config.emojis.NO}**${client.language({ textId: `На сервере нет червоточин`, guildId: interaction.guildId, locale: interaction.locale })}**`, flags: ["Ephemeral"] })
                let count = 0
                await Promise.all(client.cache.wormholes.filter(e => e.guildID === interaction.guildId && e.name && e.itemID && e.amountFrom && e.amountTo && e.chance && e.deleteTimeOut !== undefined && e.webhookId && !e.enabled && e.cronPattern && e.runsLeft).map(async wormhole => {
                    await wormhole.enable()
                    count++
                }))
                return interaction.editReply({ content: `${client.config.emojis.YES}**${client.language({ textId: `Червоточины были включены`, guildId: interaction.guildId, locale: interaction.locale })} (${count})**`, flags: ["Ephemeral"] })
            } else
            if (args?.Subcommand === "disable-all") {
                if (!client.cache.wormholes.some(e => e.guildID === interaction.guildId)) return interaction.editReply({ content: `${client.config.emojis.NO}**${client.language({ textId: `На сервере нет червоточин`, guildId: interaction.guildId, locale: interaction.locale })}**`, flags: ["Ephemeral"] })
                let count = 0
                await Promise.all(client.cache.wormholes.filter(e => e.guildID === interaction.guildId && e.enabled).map(async wormhole => {
                    await wormhole.disable()
                    count++
                }))
                return interaction.editReply({ content: `${client.config.emojis.YES}**${client.language({ textId: `Червоточины были выключены`, guildId: interaction.guildId, locale: interaction.locale })} (${count})**`, flags: ["Ephemeral"] })
            }
        }
        const settings = client.cache.settings.get(interaction.guildId)
        if (!interaction.isChatInputCommand()) {
            wormhole = client.cache.wormholes.get(WormholeRegexp.exec(interaction.customId)?.[1])
            if (!wormhole) return interaction.reply({ content: `${client.config.emojis.NO}**${client.language({ textId: `Такой червоточины не существует`, guildId: interaction.guildId, locale: interaction.locale })}**`, flags: ["Ephemeral"] })
            if (interaction.values[0] === "name") {
                const modal = new ModalBuilder()
                    .setCustomId(`manager-wormholes_name_${interaction.id}`)
                    .setTitle(`${client.language({ textId: `Название червоточины`, guildId: interaction.guildId, locale: interaction.locale })}`)
                    .setLabelComponents([
                        new LabelBuilder()
                            .setLabel(`${client.language({ textId: `Название`, guildId: interaction.guildId, locale: interaction.locale })}`)
                            .setTextInputComponent(
                                new TextInputBuilder()
                                    .setCustomId("name")
                                    .setRequired(true)
                                    .setMaxLength(30)
                                    .setStyle(TextInputStyle.Short)
                                    .setValue(wormhole.name)
                            )
                    ])
                await interaction.showModal(modal);delete client.globalCooldown[`${interaction.guildId}_${interaction.user.id}`]
                const filter = (i) => i.customId === `manager-wormholes_name_${interaction.id}` && i.user.id === interaction.user.id
                interaction = await interaction.awaitModalSubmit({ filter, time: 60000 }).catch(e => interaction)
                if (interaction && interaction.isModalSubmit()) {
                    const modalArgs = {}
                    interaction.fields.fields.each(field => modalArgs[field.customId] = field.value)
                    if (client.cache.wormholes.some(e => e.guildID === interaction.guildId && e.name.toLowerCase() === modalArgs.name.toLowerCase() && e.wormholeID !== wormhole.wormholeID)) {
                        await interaction.deferUpdate()
                        return interaction.followUp({ content: `${client.config.emojis.NO}**${client.language({ textId: `Червоточина с названием`, guildId: interaction.guildId, locale: interaction.locale })}: <${modalArgs.name}>> ${client.language({ textId: `уже существует, выбери другое название`, guildId: interaction.guildId, locale: interaction.locale })}**`, flags: ["Ephemeral"] })
                    } else {
                        wormhole.name = modalArgs.name
                        await wormhole.save()    
                    }
                }
            } else if (interaction.values[0] === "item") {
                const addItemBTN = new ButtonBuilder()
					.setStyle(ButtonStyle.Primary)
					.setLabel(`${client.language({ textId: `Предмет`, guildId: interaction.guildId, locale: interaction.locale })}`)
					.setEmoji(client.config.emojis.box)
					.setCustomId(`addItem_item`)
				const addCurBTN = new ButtonBuilder()
					.setStyle(ButtonStyle.Primary)
					.setLabel(`${settings.currencyName}`)
					.setEmoji(settings.displayCurrencyEmoji)
					.setCustomId(`addItem_currency`)
				const addXPBTN = new ButtonBuilder()
					.setStyle(ButtonStyle.Primary)
					.setLabel(`${client.language({ textId: `Опыт`, guildId: interaction.guildId, locale: interaction.locale })}`)
					.setEmoji(client.config.emojis.XP)
					.setCustomId(`addItem_xp`)
				const addRPBTN = new ButtonBuilder()
					.setStyle(ButtonStyle.Primary)
					.setLabel(`${client.language({ textId: `Репутация`, guildId: interaction.guildId, locale: interaction.locale })}`)
					.setEmoji(client.config.emojis.RP)
					.setCustomId(`addItem_rp`)
				const cancelBTN = new ButtonBuilder()
					.setStyle(ButtonStyle.Danger)
					.setLabel(`${client.language({ textId: `Отмена`, guildId: interaction.guildId, locale: interaction.locale })}`)
					.setCustomId(`addItem_cancel`)
                const components = JSON.parse(JSON.stringify(interaction.message.components))
                interaction.message.components.forEach(row => row.components.forEach(component => {
                    component.data.disabled = true
                }))
                await interaction.update({ components: interaction.message.components })
                await interaction.followUp({ components: [new ActionRowBuilder().addComponents(addItemBTN, addCurBTN, addXPBTN, addRPBTN), new ActionRowBuilder().addComponents(cancelBTN)], flags: ["Ephemeral"] })
                const filter = (i) => i.customId.includes(`addItem`) && i.user.id === interaction.user.id;
                let interaction2 = await interaction.channel.awaitMessageComponent({ filter, time: 30000 }).catch(() => null)
                if (interaction2) {
                    if (interaction2.customId === "addItem_item") {
                        const modal = new ModalBuilder()
                            .setCustomId(`manager-wormholes_addItem_item_${interaction2.id}`)
                            .setTitle(`${client.language({ textId: `Предмет`, guildId: interaction.guildId, locale: interaction.locale })}`)
                            .setLabelComponents([
                                new LabelBuilder()
                                    .setLabel(`${client.language({ textId: `Название предмета`, guildId: interaction.guildId, locale: interaction.locale })}`)
                                    .setTextInputComponent(
                                        new TextInputBuilder()
                                            .setCustomId("item")
                                            .setRequired(true)
                                            .setStyle(TextInputStyle.Short)
                                    )
                            ])
                        await interaction2.showModal(modal);delete client.globalCooldown[`${interaction.guildId}_${interaction.user.id}`]
                        const filter = (i) => i.customId === `manager-wormholes_addItem_item_${interaction2.id}` && i.user.id === interaction.user.id
                        interaction2 = await interaction2.awaitModalSubmit({ filter, time: 60000 }).catch(e => interaction2)
                        if (interaction2 && interaction2.isModalSubmit()) {
                            const modalArgs = {}
                            interaction2.fields.fields.each(field => modalArgs[field.customId] = field.value)
                            const filteredItems = client.cache.items.filter(e => e.guildID === interaction.guildId && !e.temp && e.name.toLowerCase().includes(modalArgs.item.toLowerCase()))
                            if (filteredItems.size > 1 && !filteredItems.some(e =>  e.name.toLowerCase() === modalArgs.item.toLowerCase())) {
                                let result = ""
                                filteredItems.forEach(item => {
                                    result += `> ${item.displayEmoji}**${item.name}**\n`	
                                })
                                await interaction2.update({ content: `${client.config.emojis.block} ${client.language({ textId: `По вашему запросу было найдено несколько предметов`, guildId: interaction.guildId, locale: interaction.locale })}:\n${result}`.slice(0, 2000), components: [], flags: ["Ephemeral"] })  
                            } else {
                                const searchedItem = filteredItems.some(e => e.name.toLowerCase() === modalArgs.item.toLowerCase()) ? filteredItems.find(e => e.name.toLowerCase() === modalArgs.item.toLowerCase()) : filteredItems.first()
                                if (!searchedItem) await interaction2.update({ content: `${client.config.emojis.NO}${client.language({ textId: `Предмет`, guildId: interaction.guildId, locale: interaction.locale })} **${modalArgs.item}** ${client.language({ textId: `не найден`, guildId: interaction.guildId, locale: interaction.locale })}`, components: [], flags: ["Ephemeral"] })
                                else {
                                    wormhole.itemID = searchedItem.itemID
                                    await wormhole.save()
                                    await interaction2.update({ content: client.config.emojis.YES, components: [] })
                                }
                            }
                        }
                    } else if (interaction2.customId === "addItem_currency") {
                        wormhole.itemID = "currency"
                        await wormhole.save()
                        await interaction2.update({ content: client.config.emojis.YES, components: [] })
                    } else if (interaction2.customId === "addItem_xp") {
                        wormhole.itemID = "xp"
                        await wormhole.save()
                        await interaction2.update({ content: client.config.emojis.YES, components: [] })
                    } else if (interaction2.customId === "addItem_rp") {
                        wormhole.itemID = "rp"
                        await wormhole.save()
                        await interaction2.update({ content: client.config.emojis.YES, components: [] })
                    } else if (interaction2.customId === "addItem_cancel") {
                        interaction2.update({ content: `${client.config.emojis.YES} ${client.language({ textId: `Выбор отменён`, guildId: interaction.guildId, locale: interaction.locale })}`, components: [] })
                        return interaction.editReply({ components: components })
                    }
                }
            } else if (interaction.values[0] === "chance") {
                const modal = new ModalBuilder()
                    .setCustomId(`manager-wormholes_chance_${interaction.id}`)
                    .setTitle(`${client.language({ textId: `Шанс спавна`, guildId: interaction.guildId, locale: interaction.locale })}`)
                    .setLabelComponents([
                        new LabelBuilder()
                            .setLabel(`${client.language({ textId: `Шанс (%)`, guildId: interaction.guildId, locale: interaction.locale })}`)
                            .setTextInputComponent(
                                new TextInputBuilder()
                                    .setCustomId("chance")
                                    .setRequired(true)
                                    .setStyle(TextInputStyle.Short)
                                    .setValue(`${wormhole.chance || ""}`)
                            )
                    ])
                await interaction.showModal(modal);delete client.globalCooldown[`${interaction.guildId}_${interaction.user.id}`]
                const filter = (i) => i.customId === `manager-wormholes_chance_${interaction.id}` && i.user.id === interaction.user.id
                interaction = await interaction.awaitModalSubmit({ filter, time: 60000 }).catch(e => interaction)
                if (interaction && interaction.isModalSubmit()) {
                    await interaction.deferUpdate()
                    const modalArgs = {}
                    interaction.fields.fields.each(field => modalArgs[field.customId] = field.value)
                    if (isNaN(+modalArgs.chance)) {
                        await interaction.followUp({ content: `${client.config.emojis.NO}**${modalArgs.chance}** ${client.language({ textId: `не является числом`, guildId: interaction.guildId, locale: interaction.locale })}`, components: [], flags: ["Ephemeral"] })
                    } else {
                        modalArgs.chance = +modalArgs.chance
                        if (modalArgs.chance <= 0 || modalArgs.chance > 100) {
                            await interaction.followUp({ content: `${client.config.emojis.NO}${client.language({ textId: `Число не должно быть`, guildId: interaction.guildId, locale: interaction.locale })} <= 0 ${client.language({ textId: `или`, guildId: interaction.guildId, locale: interaction.locale })} > 100`, components: [], flags: ["Ephemeral"] })
                        } else {
                            wormhole.chance = modalArgs.chance
                            await wormhole.save()
                        }
                    }
                }
            } else if (interaction.values[0] === "amount") {
                const modal = new ModalBuilder()
                    .setCustomId(`manager-wormholes_amount_${interaction.id}`)
                    .setTitle(`${client.language({ textId: `Количество предметов`, guildId: interaction.guildId, locale: interaction.locale })}`)
                    .setLabelComponents([
                        new LabelBuilder()
                            .setLabel(`${client.language({ textId: `Мин. количество`, guildId: interaction.guildId, locale: interaction.locale })}`)
                            .setTextInputComponent(
                                new TextInputBuilder()
                                    .setCustomId("min")
                                    .setRequired(true)
                                    .setStyle(TextInputStyle.Short)
                                    .setValue(`${wormhole.amountFrom || ""}`)
                            ),
                        new LabelBuilder()
                            .setLabel(`${client.language({ textId: `Макс. количество`, guildId: interaction.guildId, locale: interaction.locale })}`)
                            .setTextInputComponent(
                                new TextInputBuilder()
                                    .setCustomId("max")
                                    .setRequired(true)
                                    .setStyle(TextInputStyle.Short)
                                    .setValue(`${wormhole.amountTo || ""}`)
                            )
                    ])
                await interaction.showModal(modal);delete client.globalCooldown[`${interaction.guildId}_${interaction.user.id}`]
                const filter = (i) => i.customId === `manager-wormholes_amount_${interaction.id}` && i.user.id === interaction.user.id
                interaction = await interaction.awaitModalSubmit({ filter, time: 60000 }).catch(e => interaction)
                if (interaction && interaction.isModalSubmit()) {
                    await interaction.deferUpdate()
                    const modalArgs = {}
                    interaction.fields.fields.each(field => modalArgs[field.customId] = field.value)
                    if (isNaN(+modalArgs.min)) {
                        await interaction.followUp({ content: `${client.config.emojis.NO}**${modalArgs.min}** ${client.language({ textId: `не является числом`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
                    } else {
                        if (isNaN(+modalArgs.max)) {
                            await interaction.followUp({ content: `${client.config.emojis.NO}**${modalArgs.max}** ${client.language({ textId: `не является числом`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
                        } else {
                            modalArgs.min = +modalArgs.min
                            modalArgs.max = +modalArgs.max
                            if (modalArgs.min <= 0 || modalArgs.min > 100000000 || modalArgs.max <= 0 || modalArgs.max > 100000000) {
                                await interaction.followUp({ content: `${client.config.emojis.NO} ${client.language({ textId: `Количество не должно быть`, guildId: interaction.guildId, locale: interaction.locale })} <= 0 ${client.language({ textId: `или`, guildId: interaction.guildId, locale: interaction.locale })} > 100000000`, flags: ["Ephemeral"] })
                            } else {
                                if (modalArgs.max < modalArgs.min) {
                                    await interaction.followUp({ content: `${client.config.emojis.NO} ${client.language({ textId: `Минимальное количество не должно быть больше максимального количества`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
                                } else {
                                    wormhole.amountFrom = modalArgs.min
                                    wormhole.amountTo = modalArgs.max
                                    await wormhole.save()
                                }
                            }    
                        }
                    }
                }
            } else if (interaction.values[0] === "time") {
                const modal = new ModalBuilder()
                    .setCustomId(`manager-wormholes_time_${interaction.id}`)
                    .setTitle(`${client.language({ textId: `Время жизни`, guildId: interaction.guildId, locale: interaction.locale })}`)
                    .setLabelComponents([
                        new LabelBuilder()
                            .setLabel(`${client.language({ textId: `Секунды`, guildId: interaction.guildId, locale: interaction.locale })}`)
                            .setTextInputComponent(
                                new TextInputBuilder()
                                    .setCustomId("secs")
                                    .setRequired(true)
                                    .setStyle(TextInputStyle.Short)
                                    .setValue(`${wormhole.deleteTimeOut/1000 || ""}`)
                                    .setPlaceholder(`${client.language({ textId: `Бесконечно: 0`, guildId: interaction.guildId, locale: interaction.locale })}`)
                            )
                    ])
                await interaction.showModal(modal);delete client.globalCooldown[`${interaction.guildId}_${interaction.user.id}`]
                const filter = (i) => i.customId === `manager-wormholes_time_${interaction.id}` && i.user.id === interaction.user.id
                interaction = await interaction.awaitModalSubmit({ filter, time: 60000 }).catch(e => interaction)
                if (interaction && interaction.isModalSubmit()) {
                    await interaction.deferUpdate()
                    const modalArgs = {}
                    interaction.fields.fields.each(field => modalArgs[field.customId] = field.value)
                    if (isNaN(+modalArgs.secs)) {
                        await interaction.followUp({ content: `${client.config.emojis.NO}**${modalArgs.secs}** ${client.language({ textId: `не является числом`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
                    } else {
                        modalArgs.secs = +modalArgs.secs
                        if (modalArgs.secs < 0 || modalArgs.secs > 100000) {
                            await interaction.followUp({ content: `${client.config.emojis.NO}${client.language({ textId: `Число не должно быть`, guildId: interaction.guildId, locale: interaction.locale })} < 0 ${client.language({ textId: `или`, guildId: interaction.guildId, locale: interaction.locale })} > 100000`, flags: ["Ephemeral"] })
                        } else {
                            wormhole.deleteTimeOut = modalArgs.secs * 1000
                            await wormhole.save()
                        }
                    }
                }
            } else if (interaction.values[0] === "webhook") {
                interaction.message.components.forEach(row => row.components.forEach(component => {
                    component.data.disabled = true
                }))
                await interaction.update({ components: interaction.message.components })
                await interaction.followUp({ 
                    content: `${client.language({ textId: `Выбери канал, где будет создан вебхук`, guildId: interaction.guildId, locale: interaction.locale })}`,
                    components: [
                        new ActionRowBuilder().addComponents(
                            new ChannelSelectMenuBuilder()
                                .setCustomId(`wormholeCreateWebhook`)
                                .setPlaceholder(`${client.language({ textId: `Создать вебхук`, guildId: interaction.guildId, locale: interaction.locale })}...`)
                                .setChannelTypes([ChannelType.AnnouncementThread, ChannelType.GuildAnnouncement, ChannelType.GuildForum, ChannelType.GuildText, ChannelType.GuildVoice]))
                    ],
                    flags: ["Ephemeral"]
                })    
                const filter = (i) => i.customId.includes(`wormholeCreateWebhook`) && i.user.id === interaction.user.id;
                channelSelectMenuInteraction = await interaction.channel.awaitMessageComponent({ filter, time: 30000 }).catch(() => null)
                if (channelSelectMenuInteraction && channelSelectMenuInteraction.customId === "wormholeCreateWebhook") {
                    await channelSelectMenuInteraction.deferUpdate()
                    if (wormhole.webhookId) {
                        const webhook = client.cache.webhooks.get(wormhole.webhookId)
                        if (webhook) {
                            webhook.delete().catch(() => null)
                            client.cache.webhooks.delete(wormhole.webhookId)
                        } else await client.fetchWebhook(wormhole.webhookId).then(webhook => webhook.delete()).catch(() => null)
                    }
                    const webhook = await channelSelectMenuInteraction.channels.first().createWebhook({
                        name: wormhole.name,
                        avatar: `https://i.imgur.com/gi8qKFX.gif`
                    }).catch(e => e.message)
                    if (webhook instanceof Webhook) {
                        client.cache.webhooks.set(webhook.id, webhook)
                        channelSelectMenuInteraction.editReply({ content: `${client.language({ textId: `Создан вебхук`, guildId: interaction.guildId, locale: interaction.locale })} (${webhook.name}) ${client.language({ textId: `для канала`, guildId: interaction.guildId, locale: interaction.locale })} <#${webhook.channelId}>\n${client.language({ textId: `Для настройки имени и аватара вебхука, перейди в настройки канала`, guildId: interaction.guildId, locale: interaction.locale })} <#${webhook.channelId}> -> ${client.language({ textId: `Интеграции`, guildId: interaction.guildId, locale: interaction.locale })} -> ${client.language({ textId: `Вебхуки`, guildId: interaction.guildId, locale: interaction.locale })} -> ${webhook.name}`, components: [], flags: ["Ephemeral"] })
                        wormhole.webhookId = webhook.id
                        wormhole.channelId = webhook.channelId
                        wormhole.threadId = undefined
                        await wormhole.save()
                    } else {
                        channelSelectMenuInteraction.editReply({ content: `${client.config.emojis.NO} ${client.language({ textId: `Ошибка`, guildId: interaction.guildId, locale: interaction.locale })}: ${webhook}`, components: [], flags: ["Ephemeral"] })
                    }
                }
            } else if (interaction.values[0] === "prms") {
                if (!client.cache.permissions.some(e => e.guildID === interaction.guildId)) {
                    return interaction.reply({ content: `${client.config.emojis.NO} ${client.language({ textId: `На сервере не найдено созданных прессетов прав. Для создания прессета используй команду </manager-permissions create:1150455842294988943>.`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
                }
                const modal = new ModalBuilder()
                    .setCustomId(`manager-wormholes_permissions_${interaction.id}`)
                    .setTitle(`${client.language({ textId: `Установка права`, guildId: interaction.guildId, locale: interaction.locale })}`)
                    .setLabelComponents([
                        new LabelBuilder()
                            .setLabel(`${client.language({ textId: `Название права`, guildId: interaction.guildId, locale: interaction.locale })}`)
                            .setTextInputComponent(
                                new TextInputBuilder()
                                    .setCustomId("name")
                                    .setRequired(false)
                                    .setValue(`${client.cache.permissions.find(e => e.id === wormhole.permission)?.name || ""}`)
                                    .setStyle(TextInputStyle.Short)
                            )
                    ])
                await interaction.showModal(modal);delete client.globalCooldown[`${interaction.guildId}_${interaction.user.id}`]
                const filter = (i) => i.customId === `manager-wormholes_permissions_${interaction.id}` && i.user.id === interaction.user.id
                interaction = await interaction.awaitModalSubmit({ filter, time: 120000 }).catch(e => interaction)
                if (interaction && interaction.type === InteractionType.ModalSubmit) {
                    const modalArgs = {}
                    interaction.fields.fields.each(field => modalArgs[field.customId] = field.value)
                    if (!modalArgs.name) {
                        wormhole.permission = undefined
                    } else {
                        const permission = client.cache.permissions.find(e => e.name.toLowerCase() === modalArgs.name.toLowerCase() && e.guildID === interaction.guildId)
                        if (!permission) {
                            await interaction.deferUpdate()
                            await interaction.followUp({ content: `${client.config.emojis.NO} ${client.language({ textId: `Права с названием`, guildId: interaction.guildId, locale: interaction.locale })} **${modalArgs.name}** ${client.language({ textId: `не существует`, guildId: interaction.guildId, locale: interaction.locale })}` })
                        } else {
                            wormhole.permission = permission.id
                        }
                    }
                }
            } else if (interaction.values[0] === "delMsg") {
                if (wormhole.deleteAfterTouch) wormhole.deleteAfterTouch = false
                else wormhole.deleteAfterTouch = true
                await wormhole.save()
            } else if (interaction.values[0] === "pattern") {
                const modal = new ModalBuilder()
                    .setCustomId(`manager-wormholes_pattern_${interaction.id}`)
                    .setTitle(`${client.language({ textId: `Cron-паттерн`, guildId: interaction.guildId, locale: interaction.locale })}`)
                    .setLabelComponents([
                        new LabelBuilder()
                            .setLabel(`${client.language({ textId: `Паттерн`, guildId: interaction.guildId, locale: interaction.locale })}`)
                            .setTextInputComponent(
                                new TextInputBuilder()
                                    .setCustomId("pattern")
                                    .setRequired(true)
                                    .setStyle(TextInputStyle.Short)
                                    .setValue(wormhole.cronPattern || "")
                            )
                    ])
                await interaction.showModal(modal);delete client.globalCooldown[`${interaction.guildId}_${interaction.user.id}`]
                const filter = (i) => i.customId === `manager-wormholes_pattern_${interaction.id}` && i.user.id === interaction.user.id
                interaction = await interaction.awaitModalSubmit({ filter, time: 60000 }).catch(e => interaction)
                if (interaction && interaction.isModalSubmit()) {
                    const modalArgs = {}
                    interaction.fields.fields.each(field => modalArgs[field.customId] = field.value)
                    modalArgs.pattern = modalArgs.pattern
                        .replace("@yearly", "0 0 1 1 *")
                        .replace("@annually", "0 0 1 1 *")
                        .replace("@monthly", "0 0 1 * *")
                        .replace("@weekly", "0 0 * * 0")
                        .replace("@daily", "0 0 * * *")
                        .replace("@hourly", "0 * * * *")
                    try {
                        const job = Cron(modalArgs.pattern, { timezone: "UTC", interval: 60, paused: true }, () => {} )
                        job.stop()
                    } catch (err) {
                        await interaction.deferUpdate()
                        return interaction.followUp({ content: `${client.config.emojis.NO}${err.message}`, flags: ["Ephemeral"] })
                    }
                    wormhole.cronPattern = modalArgs.pattern
                    if (wormhole.enabled) {
                        if (wormhole.cronJob) wormhole.cronJobStop()
                        wormhole.cronJobStart()
                    }
                    await wormhole.save()    
                }
            } else if (interaction.values[0] === "runsLeft") {
                const modal = new ModalBuilder()
                    .setCustomId(`manager-wormholes_runsLeft_${interaction.id}`)
                    .setTitle(`${client.language({ textId: `Количество спавнов`, guildId: interaction.guildId, locale: interaction.locale })}`)
                    .setLabelComponents([
                        new LabelBuilder()
                            .setLabel(`${client.language({ textId: `Количество спавнов`, guildId: interaction.guildId, locale: interaction.locale })}`)
                            .setTextInputComponent(
                                new TextInputBuilder()
                                    .setCustomId("runsLeft")
                                    .setRequired(true)
                                    .setStyle(TextInputStyle.Short)
                                    .setValue(`${wormhole.runsLeft}` || "0")
                                    .setPlaceholder(`${client.language({ textId: `Бесконечно: Infinity`, guildId: interaction.guildId, locale: interaction.locale })}`)
                            )
                    ])
                await interaction.showModal(modal);delete client.globalCooldown[`${interaction.guildId}_${interaction.user.id}`]
                const filter = (i) => i.customId === `manager-wormholes_runsLeft_${interaction.id}` && i.user.id === interaction.user.id
                interaction = await interaction.awaitModalSubmit({ filter, time: 60000 }).catch(e => interaction)
                if (interaction && interaction.isModalSubmit()) {
                    const modalArgs = {}
                    interaction.fields.fields.each(field => modalArgs[field.customId] = field.value)
                    if (isNaN(+modalArgs.runsLeft)) {
                        await interaction.deferUpdate()
                        await interaction.followUp({ content: `${client.config.emojis.NO}**${modalArgs.runsLeft}** ${client.language({ textId: `не является числом`, guildId: interaction.guildId, locale: interaction.locale })}`, components: [], flags: ["Ephemeral"] })
                    } else {
                        modalArgs.runsLeft = +modalArgs.runsLeft
                        if (modalArgs.runsLeft <= 0) {
                            await interaction.deferUpdate()
                            await interaction.followUp({ content: `${client.config.emojis.NO}${client.language({ textId: `Число не должно быть`, guildId: interaction.guildId, locale: interaction.locale })} <= 0`, components: [], flags: ["Ephemeral"] })
                        } else {
                            wormhole.runsLeft = modalArgs.runsLeft
                            await wormhole.save()
                        }
                    }  
                }
            } else if (interaction.values[0] === "visibleDate") {
                wormhole.visibleDate = !wormhole.visibleDate
                await wormhole.save()
            }
            if (interaction.customId.includes("style")) {
                if (wormhole.styleID === interaction.values[0]) wormhole.styleID = undefined
                else wormhole.styleID = interaction.values[0]
                await wormhole.save()
            }
            let webhook
            if (wormhole.webhookId) {
                webhook = client.cache.webhooks.get(wormhole.webhookId)
                if (!webhook) {
                    webhook = await client.fetchWebhook(wormhole.webhookId).catch(() => null)
                    if (webhook instanceof Webhook) client.cache.webhooks.set(webhook.id, webhook)
                }    
            }
            if (interaction.isStringSelectMenu() && interaction.values[0] === "thread") {
                interaction.message.components.forEach(row => row.components.forEach(component => {
                    component.data.disabled = true
                }))
                await interaction.update({ components: interaction.message.components })
                await interaction.followUp({ 
                    content: `${client.language({ textId: `Выбери ветку, где будет создан вебхук`, guildId: interaction.guildId, locale: interaction.locale })}`,
                    components: [
                        new ActionRowBuilder().addComponents(
                            new ChannelSelectMenuBuilder()
                                .setCustomId(`wormholeThread`)
                                .setPlaceholder(`${client.language({ textId: `Выбери ветку`, guildId: interaction.guildId, locale: interaction.locale })}...`)
                                .setChannelTypes([ChannelType.PublicThread, ChannelType.PrivateThread])),
                        new ActionRowBuilder().addComponents(
                            new ButtonBuilder()
                                .setCustomId("wormholeThreadDelete")
                                .setEmoji(client.config.emojis.NO)
                                .setLabel(client.language({ textId: `Удалить`, guildId: interaction.guildId, locale: interaction.locale }))
                                .setStyle(ButtonStyle.Danger),
                            new ButtonBuilder()
                                .setCustomId("wormholeThreadCancel")
                                .setEmoji(client.config.emojis.NO)
                                .setLabel(client.language({ textId: `Отмена`, guildId: interaction.guildId, locale: interaction.locale }))
                                .setStyle(ButtonStyle.Danger)
                        )
                    ],
                    flags: ["Ephemeral"]
                })    
                const filter = (i) => i.customId.includes(`wormholeThread`) && i.user.id === interaction.user.id;
                channelSelectMenuInteraction = await interaction.channel.awaitMessageComponent({ filter, time: 30000 }).catch(() => null)
                if (channelSelectMenuInteraction && channelSelectMenuInteraction.customId.includes("wormholeThread")) {
                    await channelSelectMenuInteraction.deferUpdate()
                    if (channelSelectMenuInteraction.customId === "wormholeThread") {
                        const thread = channelSelectMenuInteraction.channels.first()
                        if (thread.parentId === webhook.channelId) {
                            wormhole.threadId = thread.id
                            channelSelectMenuInteraction.editReply({ content: `${client.config.emojis.YES} ${client.language({ textId: `Установлена ветка`, guildId: interaction.guildId, locale: interaction.locale })} <#${thread.id}>`, components: [] })
                        } else {
                            channelSelectMenuInteraction.editReply({ content: `${client.config.emojis.NO} ${client.language({ textId: `Ветка`, guildId: interaction.guildId, locale: interaction.locale })} <#${thread.id}> ${client.language({ textId: `не принадлежит вебхуку`, guildId: interaction.guildId, locale: interaction.locale })} ${webhook.name}`, components: [], flags: ["Ephemeral"] })
                        }    
                    } else if (channelSelectMenuInteraction.customId.includes("wormholeThreadDelete")) {
                        wormhole.threadId = undefined
                        channelSelectMenuInteraction.editReply({ content: `${client.config.emojis.YES} ${client.language({ textId: `Ветка удалена`, guildId: interaction.guildId, locale: interaction.locale })}`, components: [] })
                    } else channelSelectMenuInteraction.editReply({ content: `${client.config.emojis.YES} ${client.language({ textId: `Ввод отменён`, guildId: interaction.guildId, locale: interaction.locale })}`, components: [] })
                }
            } else if (interaction.isStringSelectMenu() && interaction.values[0] === "enable") {
                const errors = []
                if (!wormhole.chance) errors.push(`${client.language({ textId: `Отсутствует шанс`, guildId: interaction.guildId, locale: interaction.locale })}`)
                if (!wormhole.amountFrom || !wormhole.amountTo) errors.push(`${client.language({ textId: `Отсутствует количество`, guildId: interaction.guildId, locale: interaction.locale })}`)
                if (wormhole.deleteTimeOut === undefined) errors.push(`${client.language({ textId: `Отсутствует время жизни`, guildId: interaction.guildId, locale: interaction.locale })}`)
                if (!wormhole.itemID) errors.push(`${client.language({ textId: `Отсутствует предмет`, guildId: interaction.guildId, locale: interaction.locale })}`)
                if (!wormhole.webhookId) errors.push(`${client.language({ textId: `Отсутствует вебхук`, guildId: interaction.guildId, locale: interaction.locale })}`)
                if (!wormhole.cronPattern) errors.push(`${client.language({ textId: `Отсутствует cron-паттерн`, guildId: interaction.guildId, locale: interaction.locale })}`)
                if (wormhole.runsLeft <= 0) errors.push(`${client.language({ textId: `Количество спавнов должно быть больше нуля`, guildId: interaction.guildId, locale: interaction.locale })}`)
                if (errors.length) return interaction.reply({ content: `${client.config.emojis.NO}**${client.language({ textId: `Невозможно включить червоточину`, guildId: interaction.guildId, locale: interaction.locale })}:**\n* ${errors.join("\n* ")}`, flags: ["Ephemeral"] })
                if (wormhole.enabled) await wormhole.disable()
                else await wormhole.enable()
            } else if (interaction.isStringSelectMenu() && interaction.values[0] === "send") {
                const errors = []
                if (!wormhole.chance) errors.push(`${client.language({ textId: `Отсутствует шанс`, guildId: interaction.guildId, locale: interaction.locale })}`)
                if (!wormhole.amountFrom || !wormhole.amountTo) errors.push(`${client.language({ textId: `Отсутствует количество`, guildId: interaction.guildId, locale: interaction.locale })}`)
                if (wormhole.deleteTimeOut === undefined) errors.push(`${client.language({ textId: `Отсутствует время жизни`, guildId: interaction.guildId, locale: interaction.locale })}`)
                if (!wormhole.itemID) errors.push(`${client.language({ textId: `Отсутствует предмет`, guildId: interaction.guildId, locale: interaction.locale })}`)
                if (!wormhole.webhookId) errors.push(`${client.language({ textId: `Отсутствует вебхук`, guildId: interaction.guildId, locale: interaction.locale })}`)
                if (!wormhole.cronPattern) errors.push(`${client.language({ textId: `Отсутствует cron-паттерн`, guildId: interaction.guildId, locale: interaction.locale })}`)
                if (errors.length) return interaction.reply({ content: `${client.config.emojis.NO}**${client.language({ textId: `Невозможно заспавнить червоточину`, guildId: interaction.guildId, locale: interaction.locale })}:**\n* ${errors.join("\n* ")}`, flags: ["Ephemeral"] })
                if (!client.cache.items.find(e => !e.temp && e.itemID == wormhole.itemID) && wormhole.itemID !== "currency" && wormhole.itemID !== "xp" && wormhole.itemID !== "rp") {
                    return interaction.reply({ content: `${client.language({ textId: `Ошибка: предмета с ID`, guildId: interaction.guildId, locale: interaction.locale })} ${wormhole.itemID} ${client.language({ textId: `не существует`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"]  })
                }
                let webhook = client.cache.webhooks.get(wormhole.webhookId)
                if (!webhook) {
                    webhook = await client.fetchWebhook(wormhole.webhookId).catch(() => null)
                    if (webhook instanceof Webhook) client.cache.webhooks.set(webhook.id, webhook)
                }
                if (!webhook) {
                    return interaction.reply({ content: `${client.language({ textId: `Ошибка: вебхука с ID`, guildId: interaction.guildId, locale: interaction.locale })} ${wormhole.webhookId} ${client.language({ textId: `не существует`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"]  })
                }
                wormhole.spawn(webhook)
            }
        }
        let webhook
        if (wormhole.webhookId) {
            webhook = client.cache.webhooks.get(wormhole.webhookId)
            if (!webhook) {
                webhook = await client.fetchWebhook(wormhole.webhookId).catch(() => null)
                if (webhook instanceof Webhook) client.cache.webhooks.set(webhook.id, webhook)
            }    
        }
        if (!(webhook instanceof Webhook)) {
            if (wormhole.enabled) {
                await wormhole.disable()
            }
        }
        const item = client.cache.items.find(e => !e.temp && e.itemID === wormhole.itemID)
        const emoji = item ? item.displayEmoji : wormhole.itemID == "currency" ? settings.displayCurrencyEmoji : wormhole.itemID == "xp" ? client.config.emojis.XP : wormhole.itemID == "rp" ? client.config.emojis.RP : ""
        const embed = new EmbedBuilder()
            .setAuthor({ name: `${client.language({ textId: `Менеджер червоточин`, guildId: interaction.guildId, locale: interaction.locale })}` })
            .setTitle(wormhole.name)
            .setDescription([
                `${client.language({ textId: `Предмет`, guildId: interaction.guildId, locale: interaction.locale })}: ${item ? `${emoji}${item.name}` : wormhole.itemID == "currency" ? `${emoji}${settings.currencyName}` : wormhole.itemID == "xp" ? `${emoji}XP` : wormhole.itemID == "rp" ? `${emoji}RP` : `${client.language({ textId: `Требуется выбрать`, guildId: interaction.guildId, locale: interaction.locale })}`}`,
                `${client.language({ textId: `Шанс`, guildId: interaction.guildId, locale: interaction.locale })}: ${wormhole.chance ? `${wormhole.chance}%`: `${client.language({ textId: `Требуется выбрать`, guildId: interaction.guildId, locale: interaction.locale })}`}`,
                `${client.language({ textId: `Cron-паттерн`, guildId: interaction.guildId, locale: interaction.locale })}: ${wormhole.cronPattern ? `${await translateText(new CronTranslator().translate(wormhole.cronPattern), interaction.locale)} [\`${wormhole.cronPattern}\`]`: `${client.language({ textId: `Требуется выбрать`, guildId: interaction.guildId, locale: interaction.locale })}`} ([${client.language({ textId: `Что это?`, guildId: interaction.guildId, locale: interaction.locale })}](https://docs.wetbot.space/guide/cron-patterns))`,
                `${client.language({ textId: `Количество выпадения`, guildId: interaction.guildId, locale: interaction.locale })}: ${wormhole.amountFrom && wormhole.amountTo ? wormhole.amountFrom == wormhole.amountTo ? `${wormhole.amountFrom} ${client.language({ textId: `шт`, guildId: interaction.guildId, locale: interaction.locale })}.` : `${client.language({ textId: `от`, guildId: interaction.guildId, locale: interaction.locale })} ${wormhole.amountFrom} ${client.language({ textId: `до`, guildId: interaction.guildId, locale: interaction.locale })} ${wormhole.amountTo} ${client.language({ textId: `шт`, guildId: interaction.guildId, locale: interaction.locale })}.` : `${client.language({ textId: `Требуется выбрать`, guildId: interaction.guildId, locale: interaction.locale })}`}`,
                `${client.language({ textId: `Время жизни`, guildId: interaction.guildId, locale: interaction.locale })}: ${wormhole.deleteTimeOut === undefined ? `${client.language({ textId: `Требуется выбрать`, guildId: interaction.guildId, locale: interaction.locale })}` : wormhole.deleteTimeOut === 0 ? `${client.language({ textId: `Бесконечно`, guildId: interaction.guildId, locale: interaction.locale })}` : `${wormhole.deleteTimeOut / 1000} c.`}`,
                `${client.language({ textId: `Сообщение удаляется после сбора`, guildId: interaction.guildId, locale: interaction.locale })}: ${wormhole.deleteAfterTouch ? client.config.emojis.YES : client.config.emojis.NO}`,
                `${client.language({ textId: `Включена`, guildId: interaction.guildId, locale: interaction.locale })}: ${wormhole.enabled ? client.config.emojis.YES : client.config.emojis.NO}`,
                `${client.language({ textId: `Осталось спавнов`, guildId: interaction.guildId, locale: interaction.locale })}: ${client.language({ textId: wormhole.runsLeft, guildId: interaction.guildId, locale: interaction.locale })}`,
                `${client.language({ textId: `Вебхук`, guildId: interaction.guildId, locale: interaction.locale })}: ${!wormhole.webhookId ? `${client.language({ textId: `Требуется выбрать`, guildId: interaction.guildId, locale: interaction.locale })}` : webhook ? `${webhook.name} -> <#${webhook.channelId}> ${wormhole.threadId ? `-> <#${wormhole.threadId}>` : ``}` : `${client.language({ textId: `Неизвестный вебхук`, guildId: interaction.guildId, locale: interaction.locale })}`}`,
                `${client.language({ textId: `Следующие спавны`, guildId: interaction.guildId, locale: interaction.locale })}${wormhole.runsLeft > 10 ? ` (${10})` : wormhole.runsLeft <= 0 ? "" : ` (${wormhole.runsLeft})`}: ${!wormhole.enabled ? `${client.language({ textId: `Для отображения требуется запустить червоточину`, guildId: interaction.guildId, locale: interaction.locale })}` : `${wormhole.cronJob.nextRuns(wormhole.runsLeft > 10 ? 10 : wormhole.runsLeft).map(date => `<t:${Math.floor(date.getTime()/1000)}:R>`).join(", ")}` }`
            ].join("\n"))
            .setFooter({ text: `ID: ${wormhole.wormholeID}` })
            .setColor(3093046)
        const warnings = []
        if (wormhole.deleteTimeOut && wormhole.webhookId && webhook) {
            if (!webhook.channel?.permissionsFor(interaction.guild.members.me)?.has("ViewChannel")) {
                warnings.push(`⚠️${client.language({ textId: `Бот не сможет удалять сообщения, поскольку у него нет права на просмотр канала`, guildId: interaction.guildId, locale: interaction.locale })} <#${webhook.channelId}>`)
            }
        }
        if (wormhole.webhookId && wormhole.channelId && !webhook) {
            const channel = interaction.guild.channels.cache.get(wormhole.channelId)
            if (channel && !channel.permissionsFor(interaction.guild.members.me).has("ManageWebhooks")) {
                warnings.push(`⚠️${client.language({ textId: `Бот не сможет спавнить червоточину, поскольку у него нет права на управление вебхуками в канале`, guildId: interaction.guildId, locale: interaction.locale })} <#${wormhole.channelId}>`)
            }
        }
        if (item && !item.enabled) {
            warnings.push(`⚠️${client.language({ textId: `Бот не сможет спавнить червоточину, поскольку предмет`, guildId: interaction.guildId, locale: interaction.locale })} ${item.displayEmoji}${item.name} ${client.language({ textId: `невидимый`, guildId: interaction.guildId, locale: interaction.locale })}`)
        }
        if (warnings.length) {
            embed.setFields([
                {
                    name: `${client.language({ textId: `Предупреждения`, guildId: interaction.guildId, locale: interaction.locale })}`,
                    value: warnings.join("\n")
                }
            ])
        }
        const stringSelectMenu = new StringSelectMenuBuilder()
            .setCustomId(`wormhole{${wormhole.wormholeID}}cmd{manager-wormholes}edit`)
            .setOptions([
                {
                    emoji: client.config.emojis.name,
                    label: `${client.language({ textId: `Название`, guildId: interaction.guildId, locale: interaction.locale })}`,
                    value: `name`
                },
                {
                    emoji: client.config.emojis.box,
                    label: `${client.language({ textId: `Предмет`, guildId: interaction.guildId, locale: interaction.locale })}`,
                    value: `item`
                },
                {
                    emoji: client.config.emojis.random,
                    label: `${client.language({ textId: `Шанс`, guildId: interaction.guildId, locale: interaction.locale })}`,
                    value: `chance`
                },
                {
                    emoji: "📟",
                    label: `${client.language({ textId: `Cron-паттерн`, guildId: interaction.guildId, locale: interaction.locale })}`,
                    value: `pattern`
                },
                {
                    emoji: `🔢`,
                    label: `${client.language({ textId: `Количество`, guildId: interaction.guildId, locale: interaction.locale })}`,
                    value: `amount`
                },
                {
                    emoji: `🔢`,
                    label: `${client.language({ textId: `Количество оставшихся спавнов`, guildId: interaction.guildId, locale: interaction.locale })}`,
                    value: `runsLeft`
                },
                {
                    emoji: client.config.emojis.watch,
                    label: `${client.language({ textId: `Время жизни`, guildId: interaction.guildId, locale: interaction.locale })}`,
                    description: `${client.language({ textId: `Время в секундах до того как исчезнет червоточина`, guildId: interaction.guildId, locale: interaction.locale })}`,
                    value: `time`
                },
                {
                    emoji: client.config.emojis.plus,
                    label: `${client.language({ textId: `Вебхук`, guildId: interaction.guildId, locale: interaction.locale })}`,
                    value: `webhook`
                },
                {
                    emoji: client.config.emojis.crown,
                    label: `${client.language({ textId: `Право`, guildId: interaction.guildId, locale: interaction.locale })}`,
                    value: `prms`,
                    description: client.cache.permissions.find(e => e.id === wormhole.permission)?.name || undefined
                },
                {
                    emoji: wormhole.deleteAfterTouch ? client.config.emojis.YES : client.config.emojis.NO,
                    label: `${client.language({ textId: `Удаляется`, guildId: interaction.guildId, locale: interaction.locale })}: ${wormhole.deleteAfterTouch ? client.language({ textId: `ДА`, guildId: interaction.guildId, locale: interaction.locale }) : client.language({ textId: `НЕТ`, guildId: interaction.guildId, locale: interaction.locale })}`,
                    value: `delMsg`
                },
                {
                    emoji: wormhole.enabled ? client.config.emojis.YES : client.config.emojis.NO,
                    label: `${wormhole.enabled ? client.language({ textId: `Включена`, guildId: interaction.guildId, locale: interaction.locale }) : client.language({ textId: `Выключена`, guildId: interaction.guildId, locale: interaction.locale })}`,
                    value: `enable`
                },
                {
                    emoji: client.config.emojis.invite,
                    label: `${client.language({ textId: `Заспавнить`, guildId: interaction.guildId, locale: interaction.locale })}`,
                    value: `send`
                },
                {
                    emoji: client.config.emojis.watch,
                    label: `${client.language({ textId: `Дата спавна отображается в предметопедии`, guildId: interaction.guildId, locale: interaction.locale })}`,
                    value: `visibleDate`,
                    description: `${client.language({ textId: wormhole.visibleDate ? `Да` : `Нет`, guildId: interaction.guildId, locale: interaction.locale })}`
                }
            ])
        if (webhook) stringSelectMenu.options.push(new StringSelectMenuOptionBuilder().setEmoji("#️⃣").setLabel(client.language({ textId: `Ветка`, guildId: interaction.guildId, locale: interaction.locale })).setValue("thread"))
        let styleMenuOptions = [{ label: "0", value: "0" }]
        const styles = await client.styleSchema.find({ guildID: interaction.guildId })
        if (styles.length) {
            styleMenuOptions = []
            for (const style of styles) {
                styleMenuOptions.push({ label: style.styleName, value: style.styleID })
            }
        }
        const styleMenu = new StringSelectMenuBuilder()
            .setCustomId(`wormhole{${wormhole.wormholeID}}cmd{manager-wormholes}edit style`)
            .addOptions(styleMenuOptions)
        if (!styles.length) styleMenu.setPlaceholder(`${client.language({ textId: `Стилей нет. Создать: /manager-styles`, guildId: interaction.guildId, locale: interaction.locale })}`).setDisabled(true)
        else if (!wormhole.styleID) styleMenu.setPlaceholder(`${client.language({ textId: `Нет стиля. Выбрать...`, guildId: interaction.guildId, locale: interaction.locale })}`)
        else {
            const style = styles.find(e => e.styleID === wormhole.styleID)
            styleMenu.setPlaceholder(style?.styleName || wormhole.styleID)
        }
        const styleRow = new ActionRowBuilder().addComponents([styleMenu])
        const firstRow = new ActionRowBuilder().addComponents([stringSelectMenu])
        if (interaction.replied || interaction.deferred) return interaction.editReply({ content: " ", embeds: [embed], components: [styleRow, firstRow] })
        else return interaction.update({ content: " ", embeds: [embed], components: [styleRow, firstRow] })
    }
}
async function translateText(text, targetLang, sourceLang = "ru") {
    if (targetLang === sourceLang) return text
    try {
    // Используем бесплатный Google Translate API
    const response = await axios.get('https://translate.googleapis.com/translate_a/single', {
        params: {
        client: 'gtx',
        sl: sourceLang,
        tl: targetLang,
        dt: 't',
        q: text
        }
    });

    // Извлекаем переведенный текст из ответа
    const translatedText = response.data[0][0][0];
    return translatedText;
    } catch (error) {
    console.error(`❌ Ошибка перевода "${text}" на ${targetLang}:`, error.message);
    return text;
    }
}