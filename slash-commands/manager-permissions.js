const { TextInputStyle, ButtonBuilder, ButtonStyle, InteractionType, StringSelectMenuBuilder, ActionRowBuilder, EmbedBuilder, TextInputBuilder, ModalBuilder, RoleSelectMenuBuilder, UserSelectMenuBuilder, Collection, ApplicationCommandOptionType, ChannelSelectMenuBuilder, LabelBuilder } = require("discord.js");
const uniqid = require('uniqid')
const PermissionRegexp = /prm{(.*?)}/
const UserRegexp = /usr{(.*?)}/
const Permission = require("../classes/permission.js")
const { parse } = require('date-format-parse')
const LimitRegexp = /limit{(.*?)}/
module.exports = {
    name: 'manager-permissions',
    nameLocalizations: {
        'ru': `управление-правами`,
        'uk': `управління-правами`,
        'es-ES': `gestión-de-permisos`
    },
    description: 'Manage permissions',
    descriptionLocalizations: {
        'ru': `Управление правами`,
        'uk': `Управління правами`,
        'es-ES': `Gestión de permisos`
    },
    options: [
        {
			name: 'view',
            nameLocalizations: {
                'ru': `просмотр`,
                'uk': `перегляд`,
                'es-ES': `ver`
            },
            description: 'View all permissions',
            descriptionLocalizations: {
                'ru': `Просмотр всех прав`,
                'uk': `Перегляд усіх прав`,
                'es-ES': `Ver todos los permisos`
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
            description: 'Create a permission',
            descriptionLocalizations: {
                'ru': `Создать право`,
                'uk': `Створити право`,
                'es-ES': `Crear permiso`
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
                    description: 'Permission name',
                    descriptionLocalizations: {
                        'ru': `Название права`,
                        'uk': `Назва права`,
                        'es-ES': `Nombre del permiso`
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
            description: 'Edit a permission',
            descriptionLocalizations: {
                'ru': `Изменить право`,
                'uk': `Змінити право`,
                'es-ES': `Editar permiso`
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
                    description: 'Permission name',
                    descriptionLocalizations: {
                        'ru': `Название права`,
                        'uk': `Назва права`,
                        'es-ES': `Nombre del permiso`
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
            description: 'Copy a permission',
            descriptionLocalizations: {
                'ru': `Копировать право`,
                'uk': `Копіювати право`,
                'es-ES': `Copiar permiso`
            },
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'permission',
                    nameLocalizations: {
                        'ru': `право`,
                        'uk': `право`,
                        'es-ES': `permiso`
                    },
                    description: 'Permission name',
                    descriptionLocalizations: {
                        'ru': `Название права`,
                        'uk': `Назва права`,
                        'es-ES': `Nombre del permiso`
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
                    description: 'Name for new permission',
                    descriptionLocalizations: {
                        'ru': `Название для нового права`,
                        'uk': `Назва для нового права`,
                        'es-ES': `Nombre para el nuevo permiso`
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
            description: 'Delete a permission',
            descriptionLocalizations: {
                'ru': `Удалить право`,
                'uk': `Видалити право`,
                'es-ES': `Eliminar permiso`
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
                    description: 'Permission name',
                    descriptionLocalizations: {
                        'ru': `Название права`,
                        'uk': `Назва права`,
                        'es-ES': `Nombre del permiso`
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
                'uk': `увімкнути-все`,
                'es-ES': `habilitar-todos`
            },
            description: 'Enable all permissions',
            descriptionLocalizations: {
                'ru': `Включить все права`,
                'uk': `Увімкнути всі права`,
                'es-ES': `Habilitar todos los permisos`
            },
            type: ApplicationCommandOptionType.Subcommand,
        },
        {
            name: 'disable-all',
            nameLocalizations: {
                'ru': `выключить-все`,
                'uk': `вимкнути-все`,
                'es-ES': `deshabilitar-todos`
            },
            description: 'Disable all permissions',
            descriptionLocalizations: {
                'ru': `Выключить все права`,
                'uk': `Вимкнути всі права`,
                'es-ES': `Deshabilitar todos los permisos`
            },
            type: ApplicationCommandOptionType.Subcommand,
        }
    ],
    defaultMemberPermissions: "Administrator",
    dmPermission: false,
    group: `managers`,
    cooldowns: new Collection(),
    run: async (client, interaction, args) => {
        let permission
        if (args?.Subcommand === "enable-all") {
            if (!client.cache.permissions.some(e => e.guildID === interaction.guildId)) return interaction.reply({ content: `${client.config.emojis.NO}${client.language({ textId: `На сервере нет прав`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
            client.cache.permissions.filter(e => e.guildID === interaction.guildId).forEach(async permission => {
                permission.enable = true
                await permission.save()
            })
            return interaction.reply({ content: `${client.config.emojis.YES}${client.language({ textId: `Все права были включены`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
        } else
        if (args?.Subcommand === "disable-all") {
            if (!client.cache.permissions.some(e => e.guildID === interaction.guildId)) return interaction.reply({ content: `${client.config.emojis.NO}${client.language({ textId: `На сервере нет прав`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
            client.cache.permissions.filter(e => e.guildID === interaction.guildId).forEach(async permission => {
                permission.enable = false
                await permission.save()
            })
            return interaction.reply({ content: `${client.config.emojis.YES}${client.language({ textId: `Все права были выключены`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
        } else
        if (args?.Subcommand === "create") {
            if (client.cache.permissions.some(e => e.name.toLowerCase() === args.name.toLowerCase() && e.guildID === interaction.guildId)) {
                return interaction.reply({ content: `${client.language({ textId: `Право с названием`, guildId: interaction.guildId, locale: interaction.locale })} **${args.name}** ${client.language({ textId: `уже существует, выбери другое название`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
            }
            await interaction.deferReply()
            permission = new client.permissionSchema({
                id: uniqid.time(),
                name: args.name,
                guildID: interaction.guildId
            })
            await permission.save()
            permission = new Permission(client, permission)
            client.cache.permissions.set(permission.id, permission)
        } else
        if (args?.Subcommand === "copy") {
            let originalPermission = client.cache.permissions.find(e => e.name.toLowerCase() === args.permission.toLowerCase() && e.guildID === interaction.guildId)
            if (!originalPermission) return interaction.reply({ content: `${client.language({ textId: `Право с названием`, guildId: interaction.guildId, locale: interaction.locale })}: **${args.name}** ${client.language({ textId: `не найдено`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
            if (client.cache.permissions.some(e => e.name.toLowerCase() === args.name.toLowerCase() && e.guildID === interaction.guildId)) {
                return interaction.reply({ content: `${client.language({ textId: `Право с названием`, guildId: interaction.guildId, locale: interaction.locale })}: **${args.name}** ${client.language({ textId: `уже существует, выбери другое название`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
            }
            await interaction.deferReply()
            let copyPermission = structuredClone(Object.assign({}, { ...originalPermission, client: undefined, requirements: [] }))
            if (originalPermission.requirements.length) originalPermission.requirements = JSON.parse(JSON.stringify(originalPermission.requirements))
            delete copyPermission._id
            copyPermission.name = args.name
            copyPermission.id = uniqid.time()
            copyPermission = new client.permissionSchema(copyPermission)
            await copyPermission.save()
            permission = new Permission(client, copyPermission)
            client.cache.permissions.set(permission.id, permission)
        } else
        if (args?.Subcommand === "edit") {
            permission = client.cache.permissions.find(e => e.name.toLowerCase() === args.name.toLowerCase() && e.guildID === interaction.guildId)
            if (!permission) return interaction.reply({ content: `${client.config.emojis.NO} ${client.language({ textId: `Право с названием`, guildId: interaction.guildId, locale: interaction.locale })} **${args.name}** ${client.language({ textId: `не существует`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
            await interaction.deferReply()
        } else
        if (args?.Subcommand === "delete") {
            await interaction.deferReply({ flags: ["Ephemeral"] })
            permission = client.cache.permissions.find(e => e.name.toLowerCase() === args.name.toLowerCase() && e.guildID === interaction.guildId)
            if (!permission) return interaction.editReply({ content: `${client.config.emojis.NO} ${client.language({ textId: `Право с названием`, guildId: interaction.guildId, locale: interaction.locale })} **${args.name}** ${client.language({ textId: `не существует`, guildId: interaction.guildId, locale: interaction.locale })}` })
            await permission.delete()
            return interaction.editReply({ content: `${client.language({ textId: `Право`, guildId: interaction.guildId, locale: interaction.locale })} **${permission.name}** ${client.language({ textId: `было удалено`, guildId: interaction.guildId, locale: interaction.locale })}.`, flags: ["Ephemeral"] })
        } else
        if (args?.Subcommand === "view" || interaction.customId?.includes("view")) {
            const permissions = client.cache.permissions.filter(e => e.guildID === interaction.guildId)
            let min = 0
            let limit = 20
            if (interaction.customId?.includes("limit")) {
                limit = +LimitRegexp.exec(interaction.customId)?.[1]
                min = limit - 20
                if (isNaN(limit) || isNaN(min)) {
                    limit = +LimitRegexp.exec(interaction.customId)?.[1]
                    min = limit - 20  
                }
            }
            let array_btn = [
                new ButtonBuilder().setEmoji(`${client.config.emojis.arrowLeft2}`).setStyle(ButtonStyle.Secondary).setCustomId(`cmd{manager-permissions}limit{20}1 view`).setDisabled((permissions.size <= 20 && min == 0) || (permissions.size > 20 && min < 20)),
                new ButtonBuilder().setEmoji(`${client.config.emojis.arrowLeft}`).setStyle(ButtonStyle.Secondary).setCustomId(`cmd{manager-permissions}limit{${limit - 20}}2 view`).setDisabled((permissions.size <= 20 && min == 0) || (permissions.size > 20 && min < 20)),
                new ButtonBuilder().setEmoji(`${client.config.emojis.arrowRight}`).setStyle(ButtonStyle.Secondary).setCustomId(`cmd{manager-permissions}limit{${limit + 20}}3 view`).setDisabled((permissions.size <= 20 && min == 0) || (permissions.size > 20 && min >= permissions.size - 20)),
                new ButtonBuilder().setEmoji(`${client.config.emojis.arrowRight2}`).setStyle(ButtonStyle.Secondary).setCustomId(`cmd{manager-permissions}limit{${permissions.size + (permissions.size % 20 == 0 ? 0 : 20 - (permissions.size % 20))}}4 view`).setDisabled((permissions.size <= 20 && min == 0) || (permissions.size > 20 && min >= permissions.size - 20))
            ]
            const embed = new EmbedBuilder()
                .setTitle(`${client.language({ textId: `Менеджер прав`, guildId: interaction.guildId, locale: interaction.locale })}`)
                .setColor(3093046)
                .setDescription(permissions.size ? permissions.map(e => e).slice(min, limit).map((permission, index) => { 
                    return `${index+1+min}. ${permission.name}`
                }).join("\n") : `${client.language({ textId: `Нет прав`, guildId: interaction.guildId, locale: interaction.locale })}`)
            if (!interaction.isChatInputCommand()) return interaction.update({ 
                embeds: [
                    embed, 
                    new EmbedBuilder().setColor(3093046).setDescription(`<:PLUS:1012990107143385159>${client.language({ textId: `Создать право`, guildId: interaction.guildId, locale: interaction.locale })}: </manager-permissions create:1150455842294988943>\n<:pen:1012990423171600404>${client.language({ textId: `Изменить право`, guildId: interaction.guildId, locale: interaction.locale })}: </manager-permissions edit:1150455842294988943>\n<:activities:1005856343141384264>${client.language({ textId: `Скопировать право`, guildId: interaction.guildId, locale: interaction.locale })}: </manager-permissions copy:1150455842294988943>\n<:block:1005859695619215370>${client.language({ textId: `Удалить право`, guildId: interaction.guildId, locale: interaction.locale })}: </manager-permissions delete:1150455842294988943>`)
                ],
                components: [new ActionRowBuilder().setComponents(array_btn)],
                flags: ["Ephemeral"]
            })
            else return interaction.reply({ 
                embeds: [
                    embed, 
                    new EmbedBuilder().setColor(3093046).setDescription(`<:PLUS:1012990107143385159>${client.language({ textId: `Создать право`, guildId: interaction.guildId, locale: interaction.locale })}: </manager-permissions create:1150455842294988943>\n<:pen:1012990423171600404>${client.language({ textId: `Изменить право`, guildId: interaction.guildId, locale: interaction.locale })}: </manager-permissions edit:1150455842294988943>\n<:activities:1005856343141384264>${client.language({ textId: `Скопировать право`, guildId: interaction.guildId, locale: interaction.locale })}: </manager-permissions copy:1150455842294988943>\n<:block:1005859695619215370>${client.language({ textId: `Удалить право`, guildId: interaction.guildId, locale: interaction.locale })}: </manager-permissions delete:1150455842294988943>`)
                ],
                components: [new ActionRowBuilder().setComponents(array_btn)],
                flags: ["Ephemeral"]
            })
        }
        if (!interaction.isChatInputCommand()) {
            if (UserRegexp.exec(interaction.customId)?.[1] !== interaction.user.id) return interaction.reply({ content: `${client.config.emojis.NO} <@${interaction.user.id}>, ${client.language({ textId: `не твоя кнопка/меню`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
            permission = client.cache.permissions.find(e => e.id === PermissionRegexp.exec(interaction.customId)?.[1] && e.guildID === interaction.guildId)
            if (!permission) return interaction.update({ content: `${client.config.emojis.NO} ${client.language({ textId: `Право с ID`, guildId: interaction.guildId, locale: interaction.locale })} **${PermissionRegexp.exec(interaction.customId)?.[1]}** ${client.language({ textId: `не существует`, guildId: interaction.guildId, locale: interaction.locale })}` })
            if (interaction.customId.includes("addreq")) {
                if (permission.requirements.length >= 10) {
                    return interaction.reply({ content: `${client.config.emojis.NO} ${client.language({ textId: `Достигнуто максимум требований`, guildId: interaction.guildId, locale: interaction.locale })}: 10`, flags: ["Ephemeral"] })
                }
                interaction.message.components.forEach(row => row.components.forEach(component => {
                    component.data.disabled = true
                }))
                await interaction.update({ components: interaction.message.components })
                await interaction.followUp({ 
                    content: `${client.language({ textId: `Выбери требование`, guildId: interaction.guildId, locale: interaction.locale })}`,
                    components: [
                        new ActionRowBuilder()
                            .addComponents(
                                new StringSelectMenuBuilder()
                                    .setCustomId(`requirementSelect1`)
                                    .setOptions([
                                        { //Должен иметь/не иметь роль
                                            label: `${client.language({ textId: `roles`, guildId: interaction.guildId, locale: interaction.locale })}`,
                                            value: `roles`,
                                            emoji: client.config.emojis.roles
                                        },
                                        { //Предмет в инвентаре
                                            label: `${client.language({ textId: `item`, guildId: interaction.guildId, locale: interaction.locale })} ${client.language({ textId: `от X до X`, guildId: interaction.guildId, locale: interaction.locale })}`,
                                            value: `item`,
                                            emoji: client.config.emojis.box
                                        },
                                        { //Выполнено достижение
                                            label: `${client.language({ textId: `achievement`, guildId: interaction.guildId, locale: interaction.locale })}`,
                                            value: `achievement`,
                                            emoji: client.config.emojis.achievements
                                        },
                                        { //Не выполнено достижение
                                            label: `${client.language({ textId: `achievement-`, guildId: interaction.guildId, locale: interaction.locale })}`,
                                            value: `achievement-`,
                                            emoji: client.config.emojis.achievements
                                        },
                                        { //Канал должен быть/не должен быть одним из...
                                            label: `${client.language({ textId: `channels`, guildId: interaction.guildId, locale: interaction.locale })}`,
                                            value: `channels`,
                                            emoji: client.config.emojis.mic
                                        },
                                        { //Сезонный уровень
                                            label: `${client.language({ textId: `seasonLevel`, guildId: interaction.guildId, locale: interaction.locale })}`,
                                            value: `seasonLevel`,
                                            emoji: client.config.emojis.medal
                                        },
                                        { //Сезонный опыт
                                            label: `${client.language({ textId: `seasonTotalXp`, guildId: interaction.guildId, locale: interaction.locale })}`,
                                            value: `seasonTotalXp`,
                                            emoji: client.config.emojis.XP
                                        },
                                        { //Время (UTC)
                                            label: `${client.language({ textId: `time`, guildId: interaction.guildId, locale: interaction.locale })}`,
                                            value: `time`,
                                            emoji: client.config.emojis.watch
                                        },
                                        { //Дни недели
                                            label: `${client.language({ textId: `day`, guildId: interaction.guildId, locale: interaction.locale })}`,
                                            value: `day`,
                                            emoji: "📅"
                                        },
                                        { //Уровень
                                            label: `${client.language({ textId: `level`, guildId: interaction.guildId, locale: interaction.locale })} ${client.language({ textId: `от X до X`, guildId: interaction.guildId, locale: interaction.locale })}`,
                                            value: `level`,
                                            emoji: client.config.emojis.medal
                                        },
                                        { //Опыт
                                            label: `${client.language({ textId: `totalXp`, guildId: interaction.guildId, locale: interaction.locale })} ${client.language({ textId: `от X до X`, guildId: interaction.guildId, locale: interaction.locale })}`,
                                            value: `totalXp`,
                                            emoji: client.config.emojis.XP
                                        },
                                        { //Сессионный опыт в голосовом канале
                                            label: `${client.language({ textId: `xpSession`, guildId: interaction.guildId, locale: interaction.locale })} ${client.language({ textId: `от X до X`, guildId: interaction.guildId, locale: interaction.locale })}`,
                                            value: `xpSession`,
                                            emoji: client.config.emojis.XP
                                        },
                                        { //Сессионная репутация в голосовом канале
                                            label: `${client.language({ textId: `rpSession`, guildId: interaction.guildId, locale: interaction.locale })} ${client.language({ textId: `от X до X`, guildId: interaction.guildId, locale: interaction.locale })}`,
                                            value: `rpSession`,
                                            emoji: client.config.emojis.RP
                                        },
                                        { //Сессионные часы в голосовом канале
                                            label: `${client.language({ textId: `hoursSession`, guildId: interaction.guildId, locale: interaction.locale })} ${client.language({ textId: `от X до X`, guildId: interaction.guildId, locale: interaction.locale })}`,
                                            value: `hoursSession`,
                                            emoji: client.config.emojis.mic
                                        },
                                        { //Сессионная валюта в голосовом канале
                                            label: `${client.language({ textId: `currencySession`, guildId: interaction.guildId, locale: interaction.locale })} ${client.language({ textId: `от X до X`, guildId: interaction.guildId, locale: interaction.locale })}`,
                                            value: `currencySession`,
                                            emoji: client.config.emojis.coin
                                        },
                                        { //Написанные сообщения
                                            label: `${client.language({ textId: `messages`, guildId: interaction.guildId, locale: interaction.locale })} ${client.language({ textId: `от X до X`, guildId: interaction.guildId, locale: interaction.locale })}`,
                                            value: `messages`,
                                            emoji: client.config.emojis.message
                                        },
                                        { //Часы в голосовых каналах
                                            label: `${client.language({ textId: `hours`, guildId: interaction.guildId, locale: interaction.locale })} ${client.language({ textId: `от X до X`, guildId: interaction.guildId, locale: interaction.locale })}`,
                                            value: `hours`,
                                            emoji: client.config.emojis.mic
                                        },
                                        { //Репутация
                                            label: `${client.language({ textId: `rp`, guildId: interaction.guildId, locale: interaction.locale })} ${client.language({ textId: `от X до X`, guildId: interaction.guildId, locale: interaction.locale })}`,
                                            value: `rp`,
                                            emoji: client.config.emojis.RP
                                        },
                                        { //Лайки
                                            label: `${client.language({ textId: `likes`, guildId: interaction.guildId, locale: interaction.locale })} ${client.language({ textId: `от X до X`, guildId: interaction.guildId, locale: interaction.locale })}`,
                                            value: `likes`,
                                            emoji: client.config.emojis.heart
                                        },
                                        { //Валюта
                                            label: `${client.language({ textId: `currency`, guildId: interaction.guildId, locale: interaction.locale })} ${client.language({ textId: `от X до X`, guildId: interaction.guildId, locale: interaction.locale })}`,
                                            value: `currency`,
                                            emoji: client.config.emojis.coin
                                        },
                                        { //Валюты потрачено
                                            label: `${client.language({ textId: `currencySpent`, guildId: interaction.guildId, locale: interaction.locale })} ${client.language({ textId: `от X до X`, guildId: interaction.guildId, locale: interaction.locale })}`,
                                            value: `currencySpent`,
                                            emoji: client.config.emojis.coin
                                        },
                                        { //Приглашения
                                            label: `${client.language({ textId: `invites`, guildId: interaction.guildId, locale: interaction.locale })} ${client.language({ textId: `от X до X`, guildId: interaction.guildId, locale: interaction.locale })}`,
                                            value: `invites`,
                                            emoji: client.config.emojis.invite
                                        },
                                        { //Бампы
                                            label: `${client.language({ textId: `bumps`, guildId: interaction.guildId, locale: interaction.locale })} ${client.language({ textId: `от X до X`, guildId: interaction.guildId, locale: interaction.locale })}`,
                                            value: `bumps`,
                                            emoji: client.config.emojis.bump
                                        },
                                        { //Создано раздач
                                            label: `${client.language({ textId: `giveawaysCreated`, guildId: interaction.guildId, locale: interaction.locale })} ${client.language({ textId: `от X до X`, guildId: interaction.guildId, locale: interaction.locale })}`,
                                            value: `giveawaysCreated`,
                                            emoji: client.config.emojis.giveaway
                                        },
                                        { //Взято червоточин
                                            label: `${client.language({ textId: `wormholeTouched`, guildId: interaction.guildId, locale: interaction.locale })} ${client.language({ textId: `от X до X`, guildId: interaction.guildId, locale: interaction.locale })}`,
                                            value: `wormholeTouched`,
                                            emoji: client.config.emojis.wormhole
                                        }
                                    ])
                            ),
                        new ActionRowBuilder()
                            .addComponents(
                                new StringSelectMenuBuilder()
                                    .setCustomId(`requirementSelect2`)
                                    .setOptions([
                                        { //Выполнено квестов
                                            label: `${client.language({ textId: `doneQuests`, guildId: interaction.guildId, locale: interaction.locale })} ${client.language({ textId: `от X до X`, guildId: interaction.guildId, locale: interaction.locale })}`,
                                            value: `doneQuests`,
                                            emoji: client.config.emojis.quests
                                        },
                                        { //Продано предметов на маркете
                                            label: `${client.language({ textId: `itemsSoldOnMarketPlace`, guildId: interaction.guildId, locale: interaction.locale })} ${client.language({ textId: `от X до X`, guildId: interaction.guildId, locale: interaction.locale })}`,
                                            value: `itemsSoldOnMarketPlace`,
                                            emoji: client.config.emojis.dol
                                        },
                                        { //День в ежедневных наградах
                                            label: `${client.language({ textId: `maxDaily`, guildId: interaction.guildId, locale: interaction.locale })} ${client.language({ textId: `от X до X`, guildId: interaction.guildId, locale: interaction.locale })}`,
                                            value: `maxDaily`,
                                            emoji: client.config.emojis.giveaway
                                        },
                                        { //Выполнен квест
                                            label: `${client.language({ textId: `quest`, guildId: interaction.guildId, locale: interaction.locale })}`,
                                            value: `quest`,
                                            emoji: client.config.emojis.quests
                                        },
                                        { //Открыто предметов
                                            label: `${client.language({ textId: `itemsOpened`, guildId: interaction.guildId, locale: interaction.locale })} ${client.language({ textId: `от X до X`, guildId: interaction.guildId, locale: interaction.locale })}`,
                                            value: `itemsOpened`,
                                            emoji: client.config.emojis.open
                                        },
                                        { //Заспавнено червоточин
                                            label: `${client.language({ textId: `wormholesSpawned`, guildId: interaction.guildId, locale: interaction.locale })} ${client.language({ textId: `от X до X`, guildId: interaction.guildId, locale: interaction.locale })}`,
                                            value: `wormholesSpawned`,
                                            emoji: client.config.emojis.wormhole
                                        },
                                        { //Получено предметов
                                            label: `${client.language({ textId: `itemsReceived`, guildId: interaction.guildId, locale: interaction.locale })} ${client.language({ textId: `от X до X`, guildId: interaction.guildId, locale: interaction.locale })}`,
                                            value: `itemsReceived`,
                                            emoji: client.config.emojis.box
                                        },
                                        { //Создано предметов
                                            label: `${client.language({ textId: `itemsCrafted`, guildId: interaction.guildId, locale: interaction.locale })} ${client.language({ textId: `от X до X`, guildId: interaction.guildId, locale: interaction.locale })}`,
                                            value: `itemsCrafted`,
                                            emoji: client.config.emojis.craft
                                        },
                                        { //Использовано предметов
                                            label: `${client.language({ textId: `itemsUsed`, guildId: interaction.guildId, locale: interaction.locale })} ${client.language({ textId: `от X до X`, guildId: interaction.guildId, locale: interaction.locale })}`,
                                            value: `itemsUsed`,
                                            emoji: client.config.emojis.use
                                        },
                                        { //Куплено предметов в магазине
                                            label: `${client.language({ textId: `itemsBoughtInShop`, guildId: interaction.guildId, locale: interaction.locale })} ${client.language({ textId: `от X до X`, guildId: interaction.guildId, locale: interaction.locale })}`,
                                            value: `itemsBoughtInShop`,
                                            emoji: client.config.emojis.shop
                                        },
                                        { //Куплено предметов на маркете
                                            label: `${client.language({ textId: `itemsBoughtOnMarket`, guildId: interaction.guildId, locale: interaction.locale })} ${client.language({ textId: `от X до X`, guildId: interaction.guildId, locale: interaction.locale })}`,
                                            value: `itemsBoughtOnMarket`,
                                            emoji: client.config.emojis.dol
                                        },
                                        { //Продано предметов
                                            label: `${client.language({ textId: `itemsSold`, guildId: interaction.guildId, locale: interaction.locale })} ${client.language({ textId: `от X до X`, guildId: interaction.guildId, locale: interaction.locale })}`,
                                            value: `itemsSold`,
                                            emoji: client.config.emojis.shop
                                        },
                                        { //Активный бустер опыта с увеличением
                                            label: `${client.language({ textId: `multiplyXP`, guildId: interaction.guildId, locale: interaction.locale })} ${client.language({ textId: `от X до X`, guildId: interaction.guildId, locale: interaction.locale })}`,
                                            value: `multiplyXP`,
                                            emoji: client.config.emojis.XP100Booster
                                        },
                                        { //Активный бустер репутации с увеличением
                                            label: `${client.language({ textId: `multiplyRP`, guildId: interaction.guildId, locale: interaction.locale })} ${client.language({ textId: `от X до X`, guildId: interaction.guildId, locale: interaction.locale })}`,
                                            value: `multiplyRP`,
                                            emoji: client.config.emojis.XP100Booster
                                        },
                                        { //Активный бустер валюты с увеличением
                                            label: `${client.language({ textId: `multiplyCUR`, guildId: interaction.guildId, locale: interaction.locale })} ${client.language({ textId: `от X до X`, guildId: interaction.guildId, locale: interaction.locale })}`,
                                            value: `multiplyCUR`,
                                            emoji: client.config.emojis.XP100Booster
                                        },
                                        { //Активный бустер удачи с увеличением
                                            label: `${client.language({ textId: `multiplyLuck`, guildId: interaction.guildId, locale: interaction.locale })} ${client.language({ textId: `от X до X`, guildId: interaction.guildId, locale: interaction.locale })}`,
                                            value: `multiplyLuck`,
                                            emoji: client.config.emojis.XP100Booster
                                        },
                                        { //Опыт за день
                                            label: `${client.language({ textId: `stats?.daily?.totalxp`, guildId: interaction.guildId, locale: interaction.locale })} ${client.language({ textId: `от X до X`, guildId: interaction.guildId, locale: interaction.locale })}`,
                                            value: `stats?.daily?.totalxp`,
                                            emoji: client.config.emojis.XP
                                        },
                                        { //Написанные сообщения за день
                                            label: `${client.language({ textId: `stats?.daily?.messages`, guildId: interaction.guildId, locale: interaction.locale })} ${client.language({ textId: `от X до X`, guildId: interaction.guildId, locale: interaction.locale })}`,
                                            value: `stats?.daily?.messages`,
                                            emoji: client.config.emojis.message
                                        },
                                        { //Часы в голосовом канале за день
                                            label: `${client.language({ textId: `stats?.daily?.hours`, guildId: interaction.guildId, locale: interaction.locale })} ${client.language({ textId: `от X до X`, guildId: interaction.guildId, locale: interaction.locale })}`,
                                            value: `stats?.daily?.hours`,
                                            emoji: client.config.emojis.mic
                                        },
                                        { //Репутация за день
                                            label: `${client.language({ textId: `stats?.daily?.rp`, guildId: interaction.guildId, locale: interaction.locale })} ${client.language({ textId: `от X до X`, guildId: interaction.guildId, locale: interaction.locale })}`,
                                            value: `stats?.daily?.rp`,
                                            emoji: client.config.emojis.RP
                                        },
                                        { //Лайки за день
                                            label: `${client.language({ textId: `stats?.daily?.likes`, guildId: interaction.guildId, locale: interaction.locale })} ${client.language({ textId: `от X до X`, guildId: interaction.guildId, locale: interaction.locale })}`,
                                            value: `stats?.daily?.likes`,
                                            emoji: client.config.emojis.heart
                                        },
                                        { //Валюта за день
                                            label: `${client.language({ textId: `stats?.daily?.currency`, guildId: interaction.guildId, locale: interaction.locale })} ${client.language({ textId: `от X до X`, guildId: interaction.guildId, locale: interaction.locale })}`,
                                            value: `stats?.daily?.currency`,
                                            emoji: client.config.emojis.coin
                                        },
                                        { //Приглашения за день
                                            label: `${client.language({ textId: `stats?.daily?.invites`, guildId: interaction.guildId, locale: interaction.locale })} ${client.language({ textId: `от X до X`, guildId: interaction.guildId, locale: interaction.locale })}`,
                                            value: `stats?.daily?.invites`,
                                            emoji: client.config.emojis.invite
                                        },
                                        { //Бампы за день
                                            label: `${client.language({ textId: `stats?.daily?.bumps`, guildId: interaction.guildId, locale: interaction.locale })} ${client.language({ textId: `от X до X`, guildId: interaction.guildId, locale: interaction.locale })}`,
                                            value: `stats?.daily?.bumps`,
                                            emoji: client.config.emojis.bump
                                        },
                                        { //Создано раздач за день
                                            label: `${client.language({ textId: `stats?.daily?.giveawaysCreated`, guildId: interaction.guildId, locale: interaction.locale })} ${client.language({ textId: `от X до X`, guildId: interaction.guildId, locale: interaction.locale })}`,
                                            value: `stats?.daily?.giveawaysCreated`,
                                            emoji: client.config.emojis.giveaway
                                        }
                                    ])
                            ),
                        new ActionRowBuilder()
                            .addComponents(
                                new StringSelectMenuBuilder()
                                    .setCustomId(`requirementSelect3`)
                                    .setOptions([
                                        { //Взято червоточин за день
                                            label: `${client.language({ textId: `stats?.daily?.wormholeTouched`, guildId: interaction.guildId, locale: interaction.locale })} ${client.language({ textId: `от X до X`, guildId: interaction.guildId, locale: interaction.locale })}`,
                                            value: `stats?.daily?.wormholeTouched`,
                                            emoji: client.config.emojis.wormhole
                                        },
                                        { //Выполнено квестов за день
                                            label: `${client.language({ textId: `stats?.daily?.doneQuests`, guildId: interaction.guildId, locale: interaction.locale })} ${client.language({ textId: `от X до X`, guildId: interaction.guildId, locale: interaction.locale })}`,
                                            value: `stats?.daily?.doneQuests`,
                                            emoji: client.config.emojis.quests
                                        },
                                        { //Предметов продано на маркете за день
                                            label: `${client.language({ textId: `stats?.daily?.itemsSoldOnMarketPlace`, guildId: interaction.guildId, locale: interaction.locale })} ${client.language({ textId: `от X до X`, guildId: interaction.guildId, locale: interaction.locale })}`,
                                            value: `stats?.daily?.itemsSoldOnMarketPlace`,
                                            emoji: client.config.emojis.dol
                                        },
                                        { //Опыт за неделю
                                            label: `${client.language({ textId: `stats?.weekly?.totalxp`, guildId: interaction.guildId, locale: interaction.locale })} ${client.language({ textId: `от X до X`, guildId: interaction.guildId, locale: interaction.locale })}`,
                                            value: `stats?.weekly?.totalxp`,
                                            emoji: client.config.emojis.XP
                                        },
                                        { //Написанные сообщения за неделю
                                            label: `${client.language({ textId: `stats?.weekly?.messages`, guildId: interaction.guildId, locale: interaction.locale })} ${client.language({ textId: `от X до X`, guildId: interaction.guildId, locale: interaction.locale })}`,
                                            value: `stats?.weekly?.messages`,
                                            emoji: client.config.emojis.message
                                        },
                                        { //Часы в голосовом канале за неделю
                                            label: `${client.language({ textId: `stats?.weekly?.hours`, guildId: interaction.guildId, locale: interaction.locale })} ${client.language({ textId: `от X до X`, guildId: interaction.guildId, locale: interaction.locale })}`,
                                            value: `stats?.weekly?.hours`,
                                            emoji: client.config.emojis.mic
                                        },
                                        { //Репутация за неделю
                                            label: `${client.language({ textId: `stats?.weekly?.rp`, guildId: interaction.guildId, locale: interaction.locale })} ${client.language({ textId: `от X до X`, guildId: interaction.guildId, locale: interaction.locale })}`,
                                            value: `stats?.weekly?.rp`,
                                            emoji: client.config.emojis.RP
                                        },
                                        { //Лайки за неделю
                                            label: `${client.language({ textId: `stats?.weekly?.likes`, guildId: interaction.guildId, locale: interaction.locale })} ${client.language({ textId: `от X до X`, guildId: interaction.guildId, locale: interaction.locale })}`,
                                            value: `stats?.weekly?.likes`,
                                            emoji: client.config.emojis.heart
                                        },
                                        { //Валюта за неделю
                                            label: `${client.language({ textId: `stats?.weekly?.currency`, guildId: interaction.guildId, locale: interaction.locale })} ${client.language({ textId: `от X до X`, guildId: interaction.guildId, locale: interaction.locale })}`,
                                            value: `stats?.weekly?.currency`,
                                            emoji: client.config.emojis.coin
                                        },
                                        { //Приглашения за неделю
                                            label: `${client.language({ textId: `stats?.weekly?.invites`, guildId: interaction.guildId, locale: interaction.locale })} ${client.language({ textId: `от X до X`, guildId: interaction.guildId, locale: interaction.locale })}`,
                                            value: `stats?.weekly?.invites`,
                                            emoji: client.config.emojis.invite
                                        },
                                        { //Бампы за неделю
                                            label: `${client.language({ textId: `stats?.weekly?.bumps`, guildId: interaction.guildId, locale: interaction.locale })} ${client.language({ textId: `от X до X`, guildId: interaction.guildId, locale: interaction.locale })}`,
                                            value: `stats?.weekly?.bumps`,
                                            emoji: client.config.emojis.bump
                                        },
                                        { //Создано раздач за неделю
                                            label: `${client.language({ textId: `stats?.weekly?.giveawaysCreated`, guildId: interaction.guildId, locale: interaction.locale })} ${client.language({ textId: `от X до X`, guildId: interaction.guildId, locale: interaction.locale })}`,
                                            value: `stats?.weekly?.giveawaysCreated`,
                                            emoji: client.config.emojis.giveaway
                                        },
                                        { //Взято червоточин за неделю
                                            label: `${client.language({ textId: `stats?.weekly?.wormholeTouched`, guildId: interaction.guildId, locale: interaction.locale })} ${client.language({ textId: `от X до X`, guildId: interaction.guildId, locale: interaction.locale })}`,
                                            value: `stats?.weekly?.wormholeTouched`,
                                            emoji: client.config.emojis.wormhole
                                        },
                                        { //Выполнено квестов за неделю
                                            label: `${client.language({ textId: `stats?.weekly?.doneQuests`, guildId: interaction.guildId, locale: interaction.locale })} ${client.language({ textId: `от X до X`, guildId: interaction.guildId, locale: interaction.locale })}`,
                                            value: `stats?.weekly?.doneQuests`,
                                            emoji: client.config.emojis.quests
                                        },
                                        { //Предметов продано на маркете за неделю
                                            label: `${client.language({ textId: `stats?.weekly?.itemsSoldOnMarketPlace`, guildId: interaction.guildId, locale: interaction.locale })} ${client.language({ textId: `от X до X`, guildId: interaction.guildId, locale: interaction.locale })}`,
                                            value: `stats?.weekly?.itemsSoldOnMarketPlace`,
                                            emoji: client.config.emojis.dol
                                        },
                                        { //Опыт за месяц
                                            label: `${client.language({ textId: `stats?.monthly?.totalxp`, guildId: interaction.guildId, locale: interaction.locale })} ${client.language({ textId: `от X до X`, guildId: interaction.guildId, locale: interaction.locale })}`,
                                            value: `stats?.monthly?.totalxp`,
                                            emoji: client.config.emojis.XP
                                        },
                                        { //Написанные сообщения за месяц
                                            label: `${client.language({ textId: `stats?.monthly?.messages`, guildId: interaction.guildId, locale: interaction.locale })} ${client.language({ textId: `от X до X`, guildId: interaction.guildId, locale: interaction.locale })}`,
                                            value: `stats?.monthly?.messages`,
                                            emoji: client.config.emojis.message
                                        },
                                        { //Часы в голосовом канале за месяц
                                            label: `${client.language({ textId: `stats?.monthly?.hours`, guildId: interaction.guildId, locale: interaction.locale })} ${client.language({ textId: `от X до X`, guildId: interaction.guildId, locale: interaction.locale })}`,
                                            value: `stats?.monthly?.hours`,
                                            emoji: client.config.emojis.mic
                                        },
                                        { //Репутация за месяц
                                            label: `${client.language({ textId: `stats?.monthly?.rp`, guildId: interaction.guildId, locale: interaction.locale })} ${client.language({ textId: `от X до X`, guildId: interaction.guildId, locale: interaction.locale })}`,
                                            value: `stats?.monthly?.rp`,
                                            emoji: client.config.emojis.RP
                                        },
                                        { //Лайки за месяц
                                            label: `${client.language({ textId: `stats?.monthly?.likes`, guildId: interaction.guildId, locale: interaction.locale })} ${client.language({ textId: `от X до X`, guildId: interaction.guildId, locale: interaction.locale })}`,
                                            value: `stats?.monthly?.likes`,
                                            emoji: client.config.emojis.heart
                                        },
                                        { //Валюта за месяц
                                            label: `${client.language({ textId: `stats?.monthly?.currency`, guildId: interaction.guildId, locale: interaction.locale })} ${client.language({ textId: `от X до X`, guildId: interaction.guildId, locale: interaction.locale })}`,
                                            value: `stats?.monthly?.currency`,
                                            emoji: client.config.emojis.coin
                                        },
                                        { //Приглашения за месяц
                                            label: `${client.language({ textId: `stats?.monthly?.invites`, guildId: interaction.guildId, locale: interaction.locale })} ${client.language({ textId: `от X до X`, guildId: interaction.guildId, locale: interaction.locale })}`,
                                            value: `stats?.monthly?.invites`,
                                            emoji: client.config.emojis.invite
                                        },
                                        { //Бампы за месяц
                                            label: `${client.language({ textId: `stats?.monthly?.bumps`, guildId: interaction.guildId, locale: interaction.locale })} ${client.language({ textId: `от X до X`, guildId: interaction.guildId, locale: interaction.locale })}`,
                                            value: `stats?.monthly?.bumps`,
                                            emoji: client.config.emojis.bump
                                        },
                                        { //Создано раздач за месяц
                                            label: `${client.language({ textId: `stats?.monthly?.giveawaysCreated`, guildId: interaction.guildId, locale: interaction.locale })} ${client.language({ textId: `от X до X`, guildId: interaction.guildId, locale: interaction.locale })}`,
                                            value: `stats?.monthly?.giveawaysCreated`,
                                            emoji: client.config.emojis.giveaway
                                        },
                                        { //Взято червоточин за месяц
                                            label: `${client.language({ textId: `stats?.monthly?.wormholeTouched`, guildId: interaction.guildId, locale: interaction.locale })} ${client.language({ textId: `от X до X`, guildId: interaction.guildId, locale: interaction.locale })}`,
                                            value: `stats?.monthly?.wormholeTouched`,
                                            emoji: client.config.emojis.wormhole
                                        }
                                    ])
                            ),
                        new ActionRowBuilder()
                            .addComponents(
                                new StringSelectMenuBuilder()
                                    .setCustomId(`requirementSelect4`)
                                    .setOptions([
                                        { //Выполнено квестов за месяц
                                            label: `${client.language({ textId: `stats?.monthly?.doneQuests`, guildId: interaction.guildId, locale: interaction.locale })} ${client.language({ textId: `от X до X`, guildId: interaction.guildId, locale: interaction.locale })}`,
                                            value: `stats?.monthly?.doneQuests`,
                                            emoji: client.config.emojis.quests
                                        },
                                        { //Предметов продано на маркете за месяц
                                            label: `${client.language({ textId: `stats?.monthly?.itemsSoldOnMarketPlace`, guildId: interaction.guildId, locale: interaction.locale })} ${client.language({ textId: `от X до X`, guildId: interaction.guildId, locale: interaction.locale })}`,
                                            value: `stats?.monthly?.itemsSoldOnMarketPlace`,
                                            emoji: client.config.emojis.dol
                                        },
                                        { //Опыт за год
                                            label: `${client.language({ textId: `stats?.yearly?.totalxp`, guildId: interaction.guildId, locale: interaction.locale })} ${client.language({ textId: `от X до X`, guildId: interaction.guildId, locale: interaction.locale })}`,
                                            value: `stats?.yearly?.totalxp`,
                                            emoji: client.config.emojis.XP
                                        },
                                        { //Написанные сообщения за год
                                            label: `${client.language({ textId: `stats?.yearly?.messages`, guildId: interaction.guildId, locale: interaction.locale })} ${client.language({ textId: `от X до X`, guildId: interaction.guildId, locale: interaction.locale })}`,
                                            value: `stats?.yearly?.messages`,
                                            emoji: client.config.emojis.message
                                        },
                                        { //Часы в голосовом канале за год
                                            label: `${client.language({ textId: `stats?.yearly?.hours`, guildId: interaction.guildId, locale: interaction.locale })} ${client.language({ textId: `от X до X`, guildId: interaction.guildId, locale: interaction.locale })}`,
                                            value: `stats?.yearly?.hours`,
                                            emoji: client.config.emojis.mic
                                        },
                                        { //Репутация за год
                                            label: `${client.language({ textId: `stats?.yearly?.rp`, guildId: interaction.guildId, locale: interaction.locale })} ${client.language({ textId: `от X до X`, guildId: interaction.guildId, locale: interaction.locale })}`,
                                            value: `stats?.yearly?.rp`,
                                            emoji: client.config.emojis.RP
                                        },
                                        { //Лайки за год
                                            label: `${client.language({ textId: `stats?.yearly?.likes`, guildId: interaction.guildId, locale: interaction.locale })} ${client.language({ textId: `от X до X`, guildId: interaction.guildId, locale: interaction.locale })}`,
                                            value: `stats?.yearly?.likes`,
                                            emoji: client.config.emojis.heart
                                        },
                                        { //Валюта за год
                                            label: `${client.language({ textId: `stats?.yearly?.currency`, guildId: interaction.guildId, locale: interaction.locale })} ${client.language({ textId: `от X до X`, guildId: interaction.guildId, locale: interaction.locale })}`,
                                            value: `stats?.yearly?.currency`,
                                            emoji: client.config.emojis.coin
                                        },
                                        { //Приглашения за год
                                            label: `${client.language({ textId: `stats?.yearly?.invites`, guildId: interaction.guildId, locale: interaction.locale })} ${client.language({ textId: `от X до X`, guildId: interaction.guildId, locale: interaction.locale })}`,
                                            value: `stats?.yearly?.invites`,
                                            emoji: client.config.emojis.invite
                                        },
                                        { //Бампы за год
                                            label: `${client.language({ textId: `stats?.yearly?.bumps`, guildId: interaction.guildId, locale: interaction.locale })} ${client.language({ textId: `от X до X`, guildId: interaction.guildId, locale: interaction.locale })}`,
                                            value: `stats?.yearly?.bumps`,
                                            emoji: client.config.emojis.bump
                                        },
                                        { //Создано раздач за год
                                            label: `${client.language({ textId: `stats?.yearly?.giveawaysCreated`, guildId: interaction.guildId, locale: interaction.locale })} ${client.language({ textId: `от X до X`, guildId: interaction.guildId, locale: interaction.locale })}`,
                                            value: `stats?.yearly?.giveawaysCreated`,
                                            emoji: client.config.emojis.giveaway
                                        },
                                        { //Взято червоточин за год
                                            label: `${client.language({ textId: `stats?.yearly?.wormholeTouched`, guildId: interaction.guildId, locale: interaction.locale })} ${client.language({ textId: `от X до X`, guildId: interaction.guildId, locale: interaction.locale })}`,
                                            value: `stats?.yearly?.wormholeTouched`,
                                            emoji: client.config.emojis.wormhole
                                        },
                                        { //Выполнено квестов за год
                                            label: `${client.language({ textId: `stats?.yearly?.doneQuests`, guildId: interaction.guildId, locale: interaction.locale })} ${client.language({ textId: `от X до X`, guildId: interaction.guildId, locale: interaction.locale })}`,
                                            value: `stats?.yearly?.doneQuests`,
                                            emoji: client.config.emojis.quests
                                        },
                                        { //Предметов продано на маркете за год
                                            label: `${client.language({ textId: `stats?.yearly?.itemsSoldOnMarketPlace`, guildId: interaction.guildId, locale: interaction.locale })} ${client.language({ textId: `от X до X`, guildId: interaction.guildId, locale: interaction.locale })}`,
                                            value: `stats?.yearly?.itemsSoldOnMarketPlace`,
                                            emoji: client.config.emojis.dol
                                        },
                                        { //Находиться на сервере
                                            label: `${client.language({ textId: `MemberSince`, guildId: interaction.guildId, locale: interaction.locale })} ${client.language({ textId: `от X до X минут`, guildId: interaction.guildId, locale: interaction.locale })}`,
                                            value: `MemberSince`,
                                            emoji: client.config.emojis.watch
                                        }
                                    ])
                            ),
                        new ActionRowBuilder()
                            .addComponents(
                                new ButtonBuilder()
                                    .setCustomId(`requirementCancel`)
                                    .setLabel(client.language({ textId: `ОТМЕНА`, guildId: interaction.guildId, locale: interaction.locale }))
                                    .setStyle(ButtonStyle.Danger)
                            )
                    ],
                    flags: ["Ephemeral"]
                })    
                const filter = (i) => i.customId.includes(`requirement`) && i.user.id === interaction.user.id;
                let interaction2 = await interaction.channel.awaitMessageComponent({ filter, time: 120000 }).catch(() => null)
                if (interaction2) {
                    if (interaction2.customId.includes("requirementSelect")) {
                        const value = interaction2.values[0]
                        switch (value) {
                            case "item": {
                                const modal = new ModalBuilder()
                                    .setCustomId(`manager-permissions_addReq_${value}_${interaction.id}`)
                                    .setTitle(`${client.language({ textId: `Предмет в инвентаре`, guildId: interaction.guildId, locale: interaction.locale })}`)
                                    .setLabelComponents([
                                        new LabelBuilder()
                                            .setLabel(`${client.language({ textId: `Название предмета`, guildId: interaction.guildId, locale: interaction.locale })}`)
                                            .setTextInputComponent(
                                                new TextInputBuilder()
                                                    .setCustomId("name")
                                                    .setMinLength(2)
                                                    .setMaxLength(30)
                                                    .setRequired(true)
                                                    .setStyle(TextInputStyle.Short)
                                            ),
                                        new LabelBuilder()
                                            .setLabel(`${client.language({ textId: `Мин. количество`, guildId: interaction.guildId, locale: interaction.locale })}`)
                                            .setTextInputComponent(
                                                new TextInputBuilder()
                                                    .setCustomId("min")
                                                    .setRequired(false)
                                                    .setStyle(TextInputStyle.Short)
                                            ),
                                        new LabelBuilder()
                                            .setLabel(`${client.language({ textId: `Макс. количество`, guildId: interaction.guildId, locale: interaction.locale })}`)
                                            .setTextInputComponent(
                                                new TextInputBuilder()
                                                    .setCustomId("max")
                                                    .setRequired(false)
                                                    .setStyle(TextInputStyle.Short)
                                            ),
                                    ])
                                await interaction2.showModal(modal);delete client.globalCooldown[`${interaction2.guildId}_${interaction2.user.id}`]
                                const filter = (i) => i.customId === `manager-permissions_addReq_${value}_${interaction.id}` && i.user.id === interaction.user.id;
                                interaction2 = await interaction2.awaitModalSubmit({ filter, time: 120000 }).catch(e => interaction)
                                if (interaction2 && interaction2.type === InteractionType.ModalSubmit) {
                                    const modalArgs = {}
                                    interaction2.fields.fields.each(field => modalArgs[field.customId] = field.value)
                                    if (!modalArgs.min && !modalArgs.max) {
                                        interaction.message.components.forEach(row => row.components.forEach(component => {
                                            component.data.disabled = false
                                        }))
                                        interaction.editReply({ components: interaction.message.components })
                                        return interaction2.update({ content: `${client.config.emojis.NO} ${client.language({ textId: `Должно быть заполнено хотя бы одно поле`, guildId: interaction.guildId, locale: interaction.locale })}: ${client.language({ textId: `Мин. количество`, guildId: interaction.guildId, locale: interaction.locale })}, ${client.language({ textId: `Макс. количество`, guildId: interaction.guildId, locale: interaction.locale })}`, components: [] })
                                    }
                                    const item = client.cache.items.find(e => e.guildID === interaction.guildId && e.name.toLowerCase() === modalArgs.name.toLowerCase())
                                    if (!item) {
                                        interaction.message.components.forEach(row => row.components.forEach(component => {
                                            component.data.disabled = false
                                        }))
                                        interaction.editReply({ components: interaction.message.components })
                                        return interaction2.update({ content: `${client.config.emojis.NO} ${client.language({ textId: `Предмет с названием`, guildId: interaction.guildId, locale: interaction.locale })} **${modalArgs.name}** ${client.language({ textId: `не найден`, guildId: interaction.guildId, locale: interaction.locale })}`, components: [] })
                                    }
                                    if (modalArgs.min && isNaN(+modalArgs.min)) {
                                        interaction.message.components.forEach(row => row.components.forEach(component => {
                                            component.data.disabled = false
                                        }))
                                        interaction.editReply({ components: interaction.message.components })
                                        return interaction2.update({ content: `${client.config.emojis.NO} **${modalArgs.min}** ${client.language({ textId: `не является числом`, guildId: interaction.guildId, locale: interaction.locale })}`, components: [] })
                                    }
                                    if (modalArgs.max && isNaN(+modalArgs.max)) {
                                        interaction.message.components.forEach(row => row.components.forEach(component => {
                                            component.data.disabled = false
                                        }))
                                        interaction.editReply({ components: interaction.message.components })
                                        return interaction2.update({ content: `${client.config.emojis.NO} **${modalArgs.max}** ${client.language({ textId: `не является числом`, guildId: interaction.guildId, locale: interaction.locale })}`, components: [] })
                                    }
                                    if (modalArgs.min !== "") modalArgs.min = +modalArgs.min
                                    else delete modalArgs.min
                                    if (modalArgs.max !== "") modalArgs.max = +modalArgs.max
                                    else delete modalArgs.max
                                    if (modalArgs.min && modalArgs.max && modalArgs.min > modalArgs.max) {
                                        interaction.message.components.forEach(row => row.components.forEach(component => {
                                            component.data.disabled = false
                                        }))
                                        interaction.editReply({ components: interaction.message.components })
                                        return interaction2.update({ content: `${client.config.emojis.NO} ${client.language({ textId: `Минимальное количество не должно быть больше максимального количества`, guildId: interaction.guildId, locale: interaction.locale })}`, components: [], flags: ["Ephemeral"] })
                                    }
                                    if (permission.requirements.find(req => req.id === value && req.itemID === item.itemID && req.minAmount === modalArgs.min && req.maxAmount === modalArgs.max)) {
                                        interaction.message.components.forEach(row => row.components.forEach(component => {
                                            component.data.disabled = false
                                        }))
                                        interaction.editReply({ components: interaction.message.components })
                                        return interaction2.update({ content: `${client.config.emojis.NO} ${client.language({ textId: `Такое требование уже существует`, guildId: interaction.guildId, locale: interaction.locale })}`, components: [], flags: ["Ephemeral"] })
                                    }
                                    const requirement = {}
                                    requirement["id"] = value
                                    requirement["itemID"] = item.itemID
                                    if (modalArgs.min !== "") requirement["minAmount"] = modalArgs.min
                                    if (modalArgs.max !== "") requirement["maxAmount"] = modalArgs.max
                                    permission.requirements.push(requirement)
                                    await permission.save()
                                    interaction2.update({ content: `${client.config.emojis.YES}`, components: [], flags: ["Ephemeral"] })
                                } else return
                                break
                            }
                            case "achievement": {
                                const modal = new ModalBuilder()
                                    .setCustomId(`manager-permissions_addReq_${value}_${interaction.id}`)
                                    .setTitle(`${client.language({ textId: `Выполненное достижение`, guildId: interaction.guildId, locale: interaction.locale })}`)
                                    .setLabelComponents([
                                        new LabelBuilder()
                                            .setLabel(`${client.language({ textId: `Название достижение`, guildId: interaction.guildId, locale: interaction.locale })}`)
                                            .setTextInputComponent(
                                                new TextInputBuilder()
                                                    .setCustomId("name")
                                                    .setRequired(true)
                                                    .setStyle(TextInputStyle.Short)
                                            ),
                                    ])
                                await interaction2.showModal(modal);delete client.globalCooldown[`${interaction2.guildId}_${interaction2.user.id}`]
                                const filter = (i) => i.customId === `manager-permissions_addReq_${value}_${interaction.id}` && i.user.id === interaction.user.id;
                                interaction2 = await interaction2.awaitModalSubmit({ filter, time: 120000 }).catch(e => interaction)
                                if (interaction2 && interaction2.type === InteractionType.ModalSubmit) {
                                    const modalArgs = {}
                                    interaction2.fields.fields.each(field => modalArgs[field.customId] = field.value)
                                    const achievement = client.cache.achievements.find(e => e.guildID === interaction.guildId && e.name.toLowerCase() === modalArgs.name.toLowerCase() && e.enabled)
                                    if (!achievement) {
                                        interaction.message.components.forEach(row => row.components.forEach(component => {
                                            component.data.disabled = false
                                        }))
                                        interaction.editReply({ components: interaction.message.components })
                                        return interaction2.update({ content: `${client.config.emojis.NO} ${client.language({ textId: `Достижение с названием`, guildId: interaction.guildId, locale: interaction.locale })} **${modalArgs.name}** ${client.language({ textId: `не найдено`, guildId: interaction.guildId, locale: interaction.locale })}`, components: [] })
                                    }
                                    if (permission.requirements.find(req => req.id === value && req.achievementID === achievement.id)) {
                                        interaction.message.components.forEach(row => row.components.forEach(component => {
                                            component.data.disabled = false
                                        }))
                                        interaction.editReply({ components: interaction.message.components })
                                        return interaction2.update({ content: `${client.config.emojis.NO} ${client.language({ textId: `Такое требование уже существует`, guildId: interaction.guildId, locale: interaction.locale })}`, components: [], flags: ["Ephemeral"] })
                                    }
                                    permission.requirements.push({
                                        id: value,
                                        achievementID: achievement.id,
                                    })
                                    await permission.save()
                                    interaction2.update({ content: `${client.config.emojis.YES}`, components: [], flags: ["Ephemeral"] })
                                } else return
                                break
                            }
                            case "achievement-": {
                                const modal = new ModalBuilder()
                                    .setCustomId(`manager-permissions_addReq_${value}_${interaction.id}`)
                                    .setTitle(`${client.language({ textId: `Не выполненное достижение`, guildId: interaction.guildId, locale: interaction.locale })}`)
                                    .setLabelComponents([
                                        new LabelBuilder()
                                            .setLabel(`${client.language({ textId: `Название достижение`, guildId: interaction.guildId, locale: interaction.locale })}`)
                                            .setTextInputComponent(
                                                new TextInputBuilder()
                                                    .setCustomId("name")
                                                    .setRequired(true)
                                                    .setStyle(TextInputStyle.Short)
                                            ),
                                    ])
                                await interaction2.showModal(modal);delete client.globalCooldown[`${interaction2.guildId}_${interaction2.user.id}`]
                                const filter = (i) => i.customId === `manager-permissions_addReq_${value}_${interaction.id}` && i.user.id === interaction.user.id;
                                interaction2 = await interaction2.awaitModalSubmit({ filter, time: 120000 }).catch(e => interaction)
                                if (interaction2 && interaction2.type === InteractionType.ModalSubmit) {
                                    const modalArgs = {}
                                    interaction2.fields.fields.each(field => modalArgs[field.customId] = field.value)
                                    const achievement = client.cache.achievements.find(e => e.guildID === interaction.guildId && e.name.toLowerCase() === modalArgs.name.toLowerCase() && e.enabled)
                                    if (!achievement) {
                                        interaction.message.components.forEach(row => row.components.forEach(component => {
                                            component.data.disabled = false
                                        }))
                                        interaction.editReply({ components: interaction.message.components })
                                        return interaction2.update({ content: `${client.config.emojis.NO} ${client.language({ textId: `Достижение с названием`, guildId: interaction.guildId, locale: interaction.locale })} **${modalArgs.name}** ${client.language({ textId: `не найдено`, guildId: interaction.guildId, locale: interaction.locale })}`, components: [] })
                                    }
                                    if (permission.requirements.find(req => req.id === value && req.achievementID === achievement.id)) {
                                        interaction.message.components.forEach(row => row.components.forEach(component => {
                                            component.data.disabled = false
                                        }))
                                        interaction.editReply({ components: interaction.message.components })
                                        return interaction2.update({ content: `${client.config.emojis.NO} ${client.language({ textId: `Такое требование уже существует`, guildId: interaction.guildId, locale: interaction.locale })}`, components: [], flags: ["Ephemeral"] })
                                    }
                                    permission.requirements.push({
                                        id: value,
                                        achievementID: achievement.id,
                                    })
                                    await permission.save()
                                    interaction2.update({ content: `${client.config.emojis.YES}`, components: [], flags: ["Ephemeral"] })
                                } else return
                                break
                            }
                            case "quest": {
                                const modal = new ModalBuilder()
                                    .setCustomId(`manager-permissions_addReq_${value}_${interaction.id}`)
                                    .setTitle(`${client.language({ textId: `Выполненный квест`, guildId: interaction.guildId, locale: interaction.locale })}`)
                                    .setLabelComponents([
                                        new LabelBuilder()
                                            .setLabel(`${client.language({ textId: `Название квеста`, guildId: interaction.guildId, locale: interaction.locale })}`)
                                            .setTextInputComponent(
                                                new TextInputBuilder()
                                                    .setCustomId("name")
                                                    .setRequired(true)
                                                    .setStyle(TextInputStyle.Short)
                                            ),
                                    ])
                                await interaction2.showModal(modal);delete client.globalCooldown[`${interaction2.guildId}_${interaction2.user.id}`]
                                const filter = (i) => i.customId === `manager-permissions_addReq_${value}_${interaction.id}` && i.user.id === interaction.user.id;
                                interaction2 = await interaction2.awaitModalSubmit({ filter, time: 120000 }).catch(e => interaction)
                                if (interaction2 && interaction2.type === InteractionType.ModalSubmit) {
                                    const modalArgs = {}
                                    interaction2.fields.fields.each(field => modalArgs[field.customId] = field.value)
                                    const quest = client.cache.quests.find(quest => quest.guildID === interaction.guildId && quest.isEnabled && quest.name.toLowerCase() === modalArgs.name.toLowerCase())
                                    if (!quest) {
                                        interaction.message.components.forEach(row => row.components.forEach(component => {
                                            component.data.disabled = false
                                        }))
                                        interaction.editReply({ components: interaction.message.components })
                                        return interaction2.update({ content: `${client.config.emojis.NO} ${client.language({ textId: `Квест с названием`, guildId: interaction.guildId, locale: interaction.locale })} **${modalArgs.name}** ${client.language({ textId: `не найден`, guildId: interaction.guildId, locale: interaction.locale })}`, components: [] })
                                    }
                                    if (permission.requirements.find(req => req.id === value && req.questID === quest.questID)) {
                                        interaction.message.components.forEach(row => row.components.forEach(component => {
                                            component.data.disabled = false
                                        }))
                                        interaction.editReply({ components: interaction.message.components })
                                        return interaction2.update({ content: `${client.config.emojis.NO} ${client.language({ textId: `Такое требование уже существует`, guildId: interaction.guildId, locale: interaction.locale })}`, components: [], flags: ["Ephemeral"] })
                                    }
                                    permission.requirements.push({
                                        id: value,
                                        questID: quest.questID,
                                    })
                                    await permission.save()
                                    interaction2.update({ content: `${client.config.emojis.YES}`, components: [], flags: ["Ephemeral"] })
                                } else return
                                break
                            }
                            case "roles": {
                                await interaction2.update({ 
                                    content: `${client.language({ textId: `Выбери тип`, guildId: interaction.guildId, locale: interaction.locale })}`,
                                    components: [
                                        new ActionRowBuilder()
                                            .addComponents(
                                                new StringSelectMenuBuilder()
                                                    .setCustomId(`requirementRolesSelect`)
                                                    .setOptions([
                                                        {
                                                            label: `${client.language({ textId: `Пользователь должен иметь следующие роли`, guildId: interaction.guildId, locale: interaction.locale })}...`,
                                                            value: `hasAll`
                                                        },
                                                        {
                                                            label: `${client.language({ textId: `Пользователь должен иметь одну из следующих ролей`, guildId: interaction.guildId, locale: interaction.locale })}...`,
                                                            value: `hasAny`
                                                        },
                                                        {
                                                            label: `${client.language({ textId: `Пользователь не должен иметь одну из следующих ролей`, guildId: interaction.guildId, locale: interaction.locale })}...`,
                                                            value: `except`
                                                        }
                                                    ])
                                            ),
                                        new ActionRowBuilder()
                                            .addComponents(
                                                new ButtonBuilder()
                                                    .setCustomId(`requirementRolesCancel`)
                                                    .setLabel(client.language({ textId: `ОТМЕНА`, guildId: interaction.guildId, locale: interaction.locale }))
                                                    .setStyle(ButtonStyle.Danger)
                                            )
                                    ],
                                    flags: ["Ephemeral"]
                                })    
                                const filter = (i) => i.customId.includes(`requirementRoles`) && i.user.id === interaction2.user.id;
                                interaction2 = await interaction2.channel.awaitMessageComponent({ filter, time: 30000 }).catch(() => null)
                                if (interaction2) {
                                    if (interaction2.customId === "requirementRolesSelect") {
                                        const value = interaction2.values[0]
                                        if (permission.requirements.find(req => req.id === "roles" && req.filter === value)) {
                                            interaction.message.components.forEach(row => row.components.forEach(component => {
                                                component.data.disabled = false
                                            }))
                                            interaction.editReply({ components: interaction.message.components })
                                            return interaction2.update({ content: `${client.config.emojis.NO} ${client.language({ textId: `Такое требование уже существует`, guildId: interaction.guildId, locale: interaction.locale })}`, components: [], flags: ["Ephemeral"] })
                                        }
                                        await interaction2.update({ 
                                            content: `${client.language({ textId: `Выбери роли`, guildId: interaction.guildId, locale: interaction.locale })}`,
                                            components: [
                                                new ActionRowBuilder()
                                                    .addComponents(
                                                        new RoleSelectMenuBuilder()
                                                            .setCustomId(`requirement2RolesSelect`)
                                                            .setMaxValues(25)
                                                    ),
                                                new ActionRowBuilder()
                                                    .addComponents(
                                                        new ButtonBuilder()
                                                            .setCustomId(`requirement2RolesCancel`)
                                                            .setLabel(client.language({ textId: `ОТМЕНА`, guildId: interaction.guildId, locale: interaction.locale }))
                                                            .setStyle(ButtonStyle.Danger)
                                                    )
                                            ],
                                            flags: ["Ephemeral"]
                                        })    
                                        const filter = (i) => i.customId.includes(`requirement2Roles`) && i.user.id === interaction2.user.id;
                                        interaction2 = await interaction2.channel.awaitMessageComponent({ filter, time: 30000 }).catch(() => null)
                                        if (interaction2) {
                                            if (interaction2.customId === "requirement2RolesSelect") {
                                                permission.requirements.push({
                                                    id: "roles",
                                                    filter: value,
                                                    roles: interaction2.roles.map(e => e.id)
                                                })
                                                await permission.save()
                                                interaction2.update({ content: `${client.config.emojis.YES}`, components: [], flags: ["Ephemeral"] })
                                            }
                                            if (interaction2.customId === "requirement2RolesCancel") {
                                                interaction2.update({ content: `${client.config.emojis.YES} ${client.language({ textId: `Выбор отменён`, guildId: interaction.guildId, locale: interaction.locale })}`, components: [] })
                                                interaction.message.components.forEach(row => row.components.forEach(component => {
                                                    component.data.disabled = false
                                                }))
                                                return interaction.editReply({ components: interaction.message.components })
                                            }
                                        } else return
                                    }
                                    if (interaction2.customId === "requirementRolesCancel") {
                                        interaction2.update({ content: `${client.config.emojis.YES} ${client.language({ textId: `Выбор отменён`, guildId: interaction.guildId, locale: interaction.locale })}`, components: [] })
                                        interaction.message.components.forEach(row => row.components.forEach(component => {
                                            component.data.disabled = false
                                        }))
                                        return interaction.editReply({ components: interaction.message.components })
                                    }
                                } else return
                                break
                            }
                            case "channels": {
                                await interaction2.update({ 
                                    content: `${client.language({ textId: `Выбери тип`, guildId: interaction.guildId, locale: interaction.locale })}`,
                                    components: [
                                        new ActionRowBuilder()
                                            .addComponents(
                                                new StringSelectMenuBuilder()
                                                    .setCustomId(`requirementChannelsSelect`)
                                                    .setOptions([
                                                        {
                                                            label: `${client.language({ textId: `Канал должен быть одним из`, guildId: interaction.guildId, locale: interaction.locale })}...`,
                                                            value: `includes`
                                                        },
                                                        {
                                                            label: `${client.language({ textId: `Канал не должен быть одним из`, guildId: interaction.guildId, locale: interaction.locale })}...`,
                                                            value: `notIncludes`
                                                        }
                                                    ])
                                            ),
                                        new ActionRowBuilder()
                                            .addComponents(
                                                new ButtonBuilder()
                                                    .setCustomId(`requirementChannelsCancel`)
                                                    .setLabel(client.language({ textId: `ОТМЕНА`, guildId: interaction.guildId, locale: interaction.locale }))
                                                    .setStyle(ButtonStyle.Danger)
                                            )
                                    ],
                                    flags: ["Ephemeral"]
                                })    
                                const filter = (i) => i.customId.includes(`requirementChannels`) && i.user.id === interaction2.user.id;
                                interaction2 = await interaction2.channel.awaitMessageComponent({ filter, time: 30000 }).catch(() => null)
                                if (interaction2) {
                                    if (interaction2.customId === "requirementChannelsSelect") {
                                        const value = interaction2.values[0]
                                        if (permission.requirements.find(req => req.id === "channels" && req.filter === value)) {
                                            interaction.message.components.forEach(row => row.components.forEach(component => {
                                                component.data.disabled = false
                                            }))
                                            interaction.editReply({ components: interaction.message.components })
                                            return interaction2.update({ content: `${client.config.emojis.NO} ${client.language({ textId: `Такое требование уже существует`, guildId: interaction.guildId, locale: interaction.locale })}`, components: [], flags: ["Ephemeral"] })
                                        }
                                        await interaction2.update({ 
                                            content: `${client.language({ textId: `Выбери каналы`, guildId: interaction.guildId, locale: interaction.locale })}`,
                                            components: [
                                                new ActionRowBuilder()
                                                    .addComponents(
                                                        new ChannelSelectMenuBuilder()
                                                            .setCustomId(`requirement2ChannelsSelect`)
                                                            .setMaxValues(10)
                                                    ),
                                                new ActionRowBuilder()
                                                    .addComponents(
                                                        new ButtonBuilder()
                                                            .setCustomId(`requirement2ChannelsCancel`)
                                                            .setLabel(client.language({ textId: `ОТМЕНА`, guildId: interaction.guildId, locale: interaction.locale }))
                                                            .setStyle(ButtonStyle.Danger)
                                                    )
                                            ],
                                            flags: ["Ephemeral"]
                                        })    
                                        const filter = (i) => i.customId.includes(`requirement2Channels`) && i.user.id === interaction2.user.id;
                                        interaction2 = await interaction2.channel.awaitMessageComponent({ filter, time: 30000 }).catch(() => null)
                                        if (interaction2) {
                                            if (interaction2.customId === "requirement2ChannelsSelect") {
                                                permission.requirements.push({
                                                    id: "channels",
                                                    filter: value,
                                                    channels: interaction2.channels.map(e => e.id)
                                                })
                                                await permission.save()
                                                interaction2.update({ content: `${client.config.emojis.YES}`, components: [], flags: ["Ephemeral"] })
                                            }
                                            if (interaction2.customId === "requirement2ChannelsCancel") {
                                                interaction2.update({ content: `${client.config.emojis.YES} ${client.language({ textId: `Выбор отменён`, guildId: interaction.guildId, locale: interaction.locale })}`, components: [] })
                                                interaction.message.components.forEach(row => row.components.forEach(component => {
                                                    component.data.disabled = false
                                                }))
                                                return interaction.editReply({ components: interaction.message.components })
                                            }
                                        }
                                    }
                                    if (interaction2.customId === "requirementChannelsCancel") {
                                        interaction2.update({ content: `${client.config.emojis.YES} ${client.language({ textId: `Выбор отменён`, guildId: interaction.guildId, locale: interaction.locale })}`, components: [] })
                                        interaction.message.components.forEach(row => row.components.forEach(component => {
                                            component.data.disabled = false
                                        }))
                                        return interaction.editReply({ components: interaction.message.components })
                                    }
                                }
                                break
                            }
                            case "time": {
                                const modal = new ModalBuilder()
                                    .setCustomId(`manager-permissions_addReq_${value}_${interaction.id}`)
                                    .setTitle(`${client.language({ textId: value, guildId: interaction.guildId, locale: interaction.locale })}`)
                                    .setLabelComponents([
                                        new LabelBuilder()
                                            .setLabel(`${client.language({ textId: `Время начальное (ЧЧ:ММ)`, guildId: interaction.guildId, locale: interaction.locale })}`)
                                            .setTextInputComponent(
                                                new TextInputBuilder()
                                                    .setCustomId("startTime")
                                                    .setRequired(true)
                                                    .setStyle(TextInputStyle.Short)
                                            ),
                                        new LabelBuilder()
                                            .setLabel(`${client.language({ textId: `Время конечное (ЧЧ:ММ)`, guildId: interaction.guildId, locale: interaction.locale })}`)
                                            .setTextInputComponent(
                                                new TextInputBuilder()
                                                    .setCustomId("endTime")
                                                    .setRequired(true)
                                                    .setStyle(TextInputStyle.Short)
                                            ),
                                    ])
                                await interaction2.showModal(modal);delete client.globalCooldown[`${interaction2.guildId}_${interaction2.user.id}`]
                                const filter = (i) => i.customId === `manager-permissions_addReq_${value}_${interaction.id}` && i.user.id === interaction.user.id;
                                interaction2 = await interaction2.awaitModalSubmit({ filter, time: 120000 }).catch(e => interaction)
                                if (interaction2 && interaction2.type === InteractionType.ModalSubmit) {
                                    const modalArgs = {}
                                    interaction2.fields.fields.each(field => modalArgs[field.customId] = field.value)
                                    const startTime = parse(modalArgs.startTime, 'HH:mm')
                                    if (isNaN(startTime.getTime())) {
                                        interaction.message.components.forEach(row => row.components.forEach(component => {
                                            component.data.disabled = false
                                        }))
                                        interaction.editReply({ components: interaction.message.components })
                                        return interaction2.update({ content: `${client.config.emojis.NO} ${client.language({ textId: `Неверный формат времени. Введите правильный формат в виде ЧЧ:ММ, где Ч - это часы, М - это минуты`, guildId: interaction.guildId, locale: interaction.locale })}`, components: [], flags: ["Ephemeral"] })
                                    }
                                    const endTime = parse(modalArgs.endTime, 'HH:mm')
                                    if (isNaN(endTime.getTime())) {
                                        interaction.message.components.forEach(row => row.components.forEach(component => {
                                            component.data.disabled = false
                                        }))
                                        interaction.editReply({ components: interaction.message.components })
                                        return interaction2.update({ content: `${client.config.emojis.NO} ${client.language({ textId: `Неверный формат времени. Введите правильный формат в виде ЧЧ:ММ, где Ч - это часы, М - это минуты`, guildId: interaction.guildId, locale: interaction.locale })}`, components: [], flags: ["Ephemeral"] })
                                    }
                                    if (permission.requirements.find(req => req.id === value && req.startTime === modalArgs.startTime && req.endTime === modalArgs.endTime)) {
                                        interaction.message.components.forEach(row => row.components.forEach(component => {
                                            component.data.disabled = false
                                        }))
                                        interaction.editReply({ components: interaction.message.components })
                                        return interaction2.update({ content: `${client.config.emojis.NO} ${client.language({ textId: `Такое требование уже существует`, guildId: interaction.guildId, locale: interaction.locale })}`, components: [], flags: ["Ephemeral"] })
                                    }
                                    permission.requirements.push({
                                        id: value,
                                        startTime: modalArgs.startTime,
                                        endTime: modalArgs.endTime
                                    })
                                    await permission.save()
                                    interaction2.update({ content: `${client.config.emojis.YES}`, components: [], flags: ["Ephemeral"] })
                                }
                                break
                            }
                            case "day": {
                                if (permission.requirements.find(req => req.id === value)) {
                                    interaction.message.components.forEach(row => row.components.forEach(component => {
                                        component.data.disabled = false
                                    }))
                                    interaction.editReply({ components: interaction.message.components })
                                    return interaction2.update({ content: `${client.config.emojis.NO} ${client.language({ textId: `Такое требование уже существует`, guildId: interaction.guildId, locale: interaction.locale })}`, components: [], flags: ["Ephemeral"] })
                                }
                                await interaction2.update({ 
                                    content: `${client.language({ textId: `Выбери разрешенные дни недели`, guildId: interaction.guildId, locale: interaction.locale })}`,
                                    components: [
                                        new ActionRowBuilder()
                                            .addComponents(
                                                new StringSelectMenuBuilder()
                                                    .setCustomId(`requirementDaysSelect`)
                                                    .setOptions([
                                                        {
                                                            label: `${client.language({ textId: `Понедельник`, guildId: interaction.guildId, locale: interaction.locale })}`,
                                                            value: `1`
                                                        },
                                                        {
                                                            label: `${client.language({ textId: `Вторник`, guildId: interaction.guildId, locale: interaction.locale })}`,
                                                            value: `2`
                                                        },
                                                        {
                                                            label: `${client.language({ textId: `Среда`, guildId: interaction.guildId, locale: interaction.locale })}`,
                                                            value: `3`
                                                        },
                                                        {
                                                            label: `${client.language({ textId: `Четверг`, guildId: interaction.guildId, locale: interaction.locale })}`,
                                                            value: `4`
                                                        },
                                                        {
                                                            label: `${client.language({ textId: `Пятница`, guildId: interaction.guildId, locale: interaction.locale })}`,
                                                            value: `5`
                                                        },
                                                        {
                                                            label: `${client.language({ textId: `Суббота`, guildId: interaction.guildId, locale: interaction.locale })}`,
                                                            value: `6`
                                                        },
                                                        {
                                                            label: `${client.language({ textId: `Воскресенье`, guildId: interaction.guildId, locale: interaction.locale })}`,
                                                            value: `0`
                                                        }
                                                    ])
                                                    .setMaxValues(7)
                                            ),
                                        new ActionRowBuilder()
                                            .addComponents(
                                                new ButtonBuilder()
                                                    .setCustomId(`requirementDaysCancel`)
                                                    .setLabel(client.language({ textId: `ОТМЕНА`, guildId: interaction.guildId, locale: interaction.locale }))
                                                    .setStyle(ButtonStyle.Danger)
                                            )
                                    ],
                                    flags: ["Ephemeral"]
                                })    
                                const filter = (i) => i.customId.includes(`requirementDays`) && i.user.id === interaction2.user.id;
                                interaction2 = await interaction2.channel.awaitMessageComponent({ filter, time: 30000 }).catch(() => null)
                                if (interaction2) {
                                    if (interaction2.customId === "requirementDaysSelect") {
                                        permission.requirements.push({
                                            id: value,
                                            days: interaction2.values.map(e => +e),
                                        })
                                        await permission.save()
                                        interaction2.update({ content: `${client.config.emojis.YES}`, components: [], flags: ["Ephemeral"] })
                                    }
                                    if (interaction2.customId === "requirementDaysCancel") {
                                        interaction2.update({ content: `${client.config.emojis.YES} ${client.language({ textId: `Выбор отменён`, guildId: interaction.guildId, locale: interaction.locale })}`, components: [] })
                                        interaction.message.components.forEach(row => row.components.forEach(component => {
                                            component.data.disabled = false
                                        }))
                                        return interaction.editReply({ components: interaction.message.components })
                                    }
                                }
                                break
                            }
                            default: {
                                const modal = new ModalBuilder()
                                    .setCustomId(`manager-permissions_addReq_${value}_${interaction.id}`)
                                    .setTitle(`${client.language({ textId: value, guildId: interaction.guildId, locale: interaction.locale })}`)
                                    .setLabelComponents([
                                        new LabelBuilder()
                                            .setLabel(`${client.language({ textId: `Мин. количество`, guildId: interaction.guildId, locale: interaction.locale })}`)
                                            .setTextInputComponent(
                                                new TextInputBuilder()
                                                    .setCustomId("min")
                                                    .setRequired(false)
                                                    .setStyle(TextInputStyle.Short)
                                            ),
                                        new LabelBuilder()
                                            .setLabel(`${client.language({ textId: `Макс. количество`, guildId: interaction.guildId, locale: interaction.locale })}`)
                                            .setTextInputComponent(
                                                new TextInputBuilder()
                                                    .setCustomId("max")
                                                    .setRequired(false)
                                                    .setStyle(TextInputStyle.Short)
                                            ),
                                    ])
                                await interaction2.showModal(modal);delete client.globalCooldown[`${interaction2.guildId}_${interaction2.user.id}`]
                                const filter = (i) => i.customId === `manager-permissions_addReq_${value}_${interaction.id}` && i.user.id === interaction.user.id;
                                interaction2 = await interaction2.awaitModalSubmit({ filter, time: 120000 }).catch(e => interaction)
                                if (interaction2 && interaction2.type === InteractionType.ModalSubmit) {
                                    const modalArgs = {}
                                    interaction2.fields.fields.each(field => modalArgs[field.customId] = field.value)
                                    if (!modalArgs.min && !modalArgs.max) {
                                        interaction.message.components.forEach(row => row.components.forEach(component => {
                                            component.data.disabled = false
                                        }))
                                        interaction.editReply({ components: interaction.message.components })
                                        return interaction2.update({ content: `${client.config.emojis.NO} ${client.language({ textId: `Должно быть заполнено хотя бы одно поле`, guildId: interaction.guildId, locale: interaction.locale })}: ${client.language({ textId: `Мин. количество`, guildId: interaction.guildId, locale: interaction.locale })}, ${client.language({ textId: `Макс. количество`, guildId: interaction.guildId, locale: interaction.locale })}`, components: [] })
                                    }
                                    if (modalArgs.min && isNaN(+modalArgs.min)) {
                                        interaction.message.components.forEach(row => row.components.forEach(component => {
                                            component.data.disabled = false
                                        }))
                                        interaction.editReply({ components: interaction.message.components })
                                        return interaction2.update({ content: `${client.config.emojis.NO} **${modalArgs.min}** ${client.language({ textId: `не является числом`, guildId: interaction.guildId, locale: interaction.locale })}`, components: [] })
                                    }
                                    if (modalArgs.max && isNaN(+modalArgs.max)) {
                                        interaction.message.components.forEach(row => row.components.forEach(component => {
                                            component.data.disabled = false
                                        }))
                                        interaction.editReply({ components: interaction.message.components })
                                        return interaction2.update({ content: `${client.config.emojis.NO} **${modalArgs.max}** ${client.language({ textId: `не является числом`, guildId: interaction.guildId, locale: interaction.locale })}`, components: [] })
                                    }
                                    if (modalArgs.min !== "") modalArgs.min = +modalArgs.min
                                    else delete modalArgs.min
                                    if (modalArgs.max !== "") modalArgs.max = +modalArgs.max
                                    else delete modalArgs.max
                                    if (modalArgs.min !== undefined && modalArgs.max !== undefined && modalArgs.min > modalArgs.max) {
                                        interaction.message.components.forEach(row => row.components.forEach(component => {
                                            component.data.disabled = false
                                        }))
                                        interaction.editReply({ components: interaction.message.components })
                                        return interaction2.update({ content: `${client.config.emojis.NO} ${client.language({ textId: `Минимальное количество не должно быть больше максимального количества`, guildId: interaction.guildId, locale: interaction.locale })}`, components: [], flags: ["Ephemeral"] })
                                    }
                                    if (permission.requirements.find(req => req.id === value && req.minAmount === modalArgs.min && req.maxAmount === modalArgs.max)) {
                                        interaction.message.components.forEach(row => row.components.forEach(component => {
                                            component.data.disabled = false
                                        }))
                                        interaction.editReply({ components: interaction.message.components })
                                        return interaction2.update({ content: `${client.config.emojis.NO} ${client.language({ textId: `Такое требование уже существует`, guildId: interaction.guildId, locale: interaction.locale })}`, components: [], flags: ["Ephemeral"] })
                                    }
                                    const requirement = {}
                                    requirement["id"] = value
                                    if (modalArgs.min !== undefined) requirement["minAmount"] = value.includes("multiply") ? modalArgs.min/100 : modalArgs.min
                                    if (modalArgs.max !== undefined) requirement["maxAmount"] = value.includes("multiply") ? modalArgs.max/100 : modalArgs.max
                                    permission.requirements.push(requirement)
                                    await permission.save()
                                    interaction2.update({ content: `${client.config.emojis.YES}`, components: [], flags: ["Ephemeral"] })
                                } else return
                                break
                            }
                        }
                    }
                    if (interaction2.customId === "requirementCancel") {
                        interaction2.update({ content: `${client.config.emojis.YES} ${client.language({ textId: `Выбор отменён`, guildId: interaction.guildId, locale: interaction.locale })}`, components: [] })
                        interaction.message.components.forEach(row => row.components.forEach(component => {
                            component.data.disabled = false
                        }))
                        return interaction.editReply({ components: interaction.message.components })
                    }
                }
            } else
            if (interaction.customId.includes("delreq")) {
                const modal = new ModalBuilder()
                    .setCustomId(`manager-permissions_delReq_${interaction.id}`)
                    .setTitle(`${client.language({ textId: `Удалить требование`, guildId: interaction.guildId, locale: interaction.locale })}`)
                    .setLabelComponents([
                        new LabelBuilder()
                            .setLabel(`${client.language({ textId: `Номер требования`, guildId: interaction.guildId, locale: interaction.locale })}`)
                            .setTextInputComponent(
                                new TextInputBuilder()
                                    .setCustomId("number")
                                    .setRequired(true)
                                    .setStyle(TextInputStyle.Short)
                            ),
                    ])
                await interaction.showModal(modal);delete client.globalCooldown[`${interaction.guildId}_${interaction.user.id}`]
                const filter = (i) => i.customId === `manager-permissions_delReq_${interaction.id}` && i.user.id === interaction.user.id;
                interaction = await interaction.awaitModalSubmit({ filter, time: 120000 }).catch(e => interaction)
                if (interaction && interaction.type === InteractionType.ModalSubmit) {
                    const modalArgs = {}
                    interaction.fields.fields.each(field => modalArgs[field.customId] = field.value)
                    if (isNaN(+modalArgs.number) || !Number.isInteger(+modalArgs.number)) {
                        return interaction.reply({ content: `${client.config.emojis.NO} **${modalArgs.number}** ${client.language({ textId: `не является целым числом`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
                    }
                    modalArgs.number = +modalArgs.number
                    if (modalArgs.number <= 0) {
                        return interaction.reply({ content: `${client.config.emojis.NO} ${client.language({ textId: `Номер должен быть`, guildId: interaction.guildId, locale: interaction.locale })} > 0`, flags: ["Ephemeral"] })
                    }
                    if (modalArgs.number > permission.requirements.length) {
                        return interaction.reply({ content: `${client.config.emojis.NO} ${client.language({ textId: `Требования`, guildId: interaction.guildId, locale: interaction.locale })} №${modalArgs.number} ${client.language({ textId: `не существует`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
                    }
                    permission.requirements.splice(modalArgs.number - 1, 1)
                    await permission.save()
                }
            } else
            if (interaction.customId.includes("enabledisable")) {
                permission.enable = !permission.enable
                await permission.save()
            }
            if (interaction.customId.includes("test")) {
                if (!permission.requirements.length) {
                    return interaction.reply({ content: `${client.config.emojis.NO} ${client.language({ textId: `Добавьте требования для этого права`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
                }
                const profile = await client.functions.fetchProfile(client, interaction.user.id, interaction.guildId)
                const isPassing = permission.for(profile, interaction.member, interaction.channel, interaction)
                return interaction.reply({ embeds: [new EmbedBuilder().setColor(3093046).setTitle(`${client.language({ textId: `Для этого взаимодействия требуется:`, guildId: interaction.guildId, locale: interaction.locale })}`).setDescription(isPassing.reasons.join("\n"))], flags: ["Ephemeral"] })
            }
        }
        const embed = new EmbedBuilder()
            .setAuthor({ name: `${client.language({ textId: `Управление правами`, guildId: interaction.guildId, locale: interaction.locale })}` })
            .setTitle(permission.name)
            .setColor(3093046)
            .setFooter({ text: `ID: ${permission.id}` })
        let min = 0
        let limit = 20
        if (interaction.customId?.includes("limit")) {
            limit = +LimitRegexp.exec(interaction.customId)?.[1]
            min = limit - 20
            if (isNaN(limit) || isNaN(min)) {
                limit = +LimitRegexp.exec(interaction.customId)?.[1]
                min = limit - 20  
            }
        }
        let requirements = []
        if (!permission.requirements.length) embed.setDescription(`${client.language({ textId: `Требования не установлены`, guildId: interaction.guildId, locale: interaction.locale })}`)
        else {
            for (const req of permission.requirements.slice(min, limit)) {
                let amount = []
                if (req.minAmount !== undefined && req.maxAmount !== undefined && req.minAmount === req.maxAmount) amount.push(req.id === "MemberSince" ? client.functions.transformSecs(client, req.maxAmount * 60 * 1000, interaction.guildId, interaction.locale) : req.maxAmount)
                else if (req.minAmount !== undefined || req.maxAmount !== undefined) {
                    if (req.minAmount !== undefined) amount.push(`${client.language({ textId: `от`, guildId: interaction.guildId, locale: interaction.locale })} ${req.id === "MemberSince" ? client.functions.transformSecs(client, req.minAmount * 60 * 1000, interaction.guildId, interaction.locale) : req.minAmount}`)
                    if (req.maxAmount !== undefined) amount.push(`${client.language({ textId: `до`, guildId: interaction.guildId, locale: interaction.locale })} ${req.id === "MemberSince" ? client.functions.transformSecs(client, req.maxAmount * 60 * 1000, interaction.guildId, interaction.locale) : req.maxAmount}`)
                }
                switch (req.id) {
                    case "item":
                        const item = client.cache.items.get(req.itemID)
                        requirements.push(`${client.language({ textId: `item`, guildId: interaction.guildId, locale: interaction.locale })}: ${item?.displayEmoji || ""}${item?.name || req.itemID} (${amount.join(" ")})`)
                        break
                    case "achievement": {
                        const achievement = client.cache.achievements.get(req.achievementID)
                        requirements.push(`${client.language({ textId: `achievement`, guildId: interaction.guildId, locale: interaction.locale })}: ${achievement?.displayEmoji || ""}${achievement?.name || req.achievementID}`)
                        break
                    }
                    case "achievement-":
                        const achievement = client.cache.achievements.get(req.achievementID)
                        requirements.push(`${client.language({ textId: `achievement-`, guildId: interaction.guildId, locale: interaction.locale })}: ${achievement?.displayEmoji || ""}${achievement?.name || req.achievementID}`)
                        break
                    case "quest":
                        const quest = client.cache.quests.get(req.questID)
                        requirements.push(`${client.language({ textId: `quest`, guildId: interaction.guildId, locale: interaction.locale })}: ${quest?.displayEmoji || ""}${quest?.name || req.questID}`)
                        break
                    case "roles":
                        requirements.push(req.filter === "hasAll" ? `${client.language({ textId: `Пользователь должен иметь следующие роли`, guildId: interaction.guildId, locale: interaction.locale })}: ${req.roles.map(e => `<@&${e}>`).join(", ")}` :  req.filter === "hasAny" ? `${client.language({ textId: `Пользователь должен иметь одну из следующих ролей`, guildId: interaction.guildId, locale: interaction.locale })}: ${req.roles.map(e => `<@&${e}>`).join(", ")}` : `${client.language({ textId: `Пользователь не должен иметь одну из следующих ролей`, guildId: interaction.guildId, locale: interaction.locale })}: ${req.roles.map(e => `<@&${e}>`).join(", ")}`)
                        break
                    case "multiplyXP":
                        requirements.push(`${client.language({ textId: `multiplyXP`, guildId: interaction.guildId, locale: interaction.locale })}${req.minAmount ? ` ${client.language({ textId: `от`, guildId: interaction.guildId, locale: interaction.locale })} ${req.minAmount*100}%` : ""} ${req.maxAmount ? `${client.language({ textId: `до`, guildId: interaction.guildId, locale: interaction.locale })} ${req.maxAmount*100}%` : ""}`)
                        break
                    case "multiplyRP":
                        requirements.push(`${client.language({ textId: `multiplyRP`, guildId: interaction.guildId, locale: interaction.locale })}${req.minAmount ? ` ${client.language({ textId: `от`, guildId: interaction.guildId, locale: interaction.locale })} ${req.minAmount*100}%` : ""} ${req.maxAmount ? `${client.language({ textId: `до`, guildId: interaction.guildId, locale: interaction.locale })} ${req.maxAmount*100}%` : ""}`)
                        break
                    case "multiplyCUR":
                        requirements.push(`${client.language({ textId: `multiplyCUR`, guildId: interaction.guildId, locale: interaction.locale })}${req.minAmount ? ` ${client.language({ textId: `от`, guildId: interaction.guildId, locale: interaction.locale })} ${req.minAmount*100}%` : ""} ${req.maxAmount ? `${client.language({ textId: `до`, guildId: interaction.guildId, locale: interaction.locale })} ${req.maxAmount*100}%` : ""}`)
                        break
                    case "multiplyLuck":
                        requirements.push(`${client.language({ textId: `multiplyLuck`, guildId: interaction.guildId, locale: interaction.locale })}${req.minAmount ? ` ${client.language({ textId: `от`, guildId: interaction.guildId, locale: interaction.locale })} ${req.minAmount*100}%` : ""} ${req.maxAmount ? `${client.language({ textId: `до`, guildId: interaction.guildId, locale: interaction.locale })} ${req.maxAmount*100}%` : ""}`)
                        break
                    case "channels":
                        requirements.push(req.filter === "includes" ? `${client.language({ textId: `Канал должен быть одним из`, guildId: interaction.guildId, locale: interaction.locale })}: ${req.channels.map(e => `<#${e}>`).join(", ")}` : `${client.language({ textId: `Канал не должен быть одним из`, guildId: interaction.guildId, locale: interaction.locale })}: ${req.channels.map(e => `<#${e}>`).join(", ")}`)
                        break
                    case "time":
                        requirements.push(`${client.language({ textId: `Время (UTC)`, guildId: interaction.guildId, locale: interaction.locale })} ${req.startTime}-${req.endTime}`)
                        break
                    case "day":
                        requirements.push(`${client.language({ textId: `Дни недели`, guildId: interaction.guildId, locale: interaction.locale })}: ${req.days.join(", ").replace(1, client.language({ textId: `Понедельник`, guildId: interaction.guildId, locale: interaction.locale })).replace(2, client.language({ textId: `Вторник`, guildId: interaction.guildId, locale: interaction.locale })).replace(3, client.language({ textId: `Среда`, guildId: interaction.guildId, locale: interaction.locale })).replace(4, client.language({ textId: `Четверг`, guildId: interaction.guildId, locale: interaction.locale })).replace(5, client.language({ textId: `Пятница`, guildId: interaction.guildId, locale: interaction.locale })).replace(6, client.language({ textId: `Суббота`, guildId: interaction.guildId, locale: interaction.locale })).replace(0, client.language({ textId: `Воскресенье`, guildId: interaction.guildId, locale: interaction.locale }))}`)
                        break
                    default:
                        requirements.push(`${client.language({ textId: req.id, guildId: interaction.guildId, locale: interaction.locale })} (${amount.join(" ")})`)
                        break
                }
            }
            embed.setDescription(`### ${client.language({ textId: `Требования`, guildId: interaction.guildId, locale: interaction.locale })}:\n${requirements.map((req, index) => `${index+1+min}. ${req}`).join("\n")}`)
        }
        let array_btn = [
            new ButtonBuilder().setEmoji(`${client.config.emojis.arrowLeft2}`).setStyle(ButtonStyle.Secondary).setCustomId(`cmd{manager-permissions}usr{${interaction.user.id}}prm{${permission.id}}limit{20}1`).setDisabled((permission.requirements.length <= 20 && min == 0) || (permission.requirements.length > 20 && min < 20)),
            new ButtonBuilder().setEmoji(`${client.config.emojis.arrowLeft}`).setStyle(ButtonStyle.Secondary).setCustomId(`cmd{manager-permissions}usr{${interaction.user.id}}prm{${permission.id}}limit{${limit - 20}}2`).setDisabled((permission.requirements.length <= 20 && min == 0) || (permission.requirements.length > 20 && min < 20)),
            new ButtonBuilder().setEmoji(`${client.config.emojis.arrowRight}`).setStyle(ButtonStyle.Secondary).setCustomId(`cmd{manager-permissions}usr{${interaction.user.id}}prm{${permission.id}}limit{${limit + 20}}3`).setDisabled((permission.requirements.length <= 20 && min == 0) || (permission.requirements.length > 20 && min >= permission.requirements.length - 20)),
            new ButtonBuilder().setEmoji(`${client.config.emojis.arrowRight2}`).setStyle(ButtonStyle.Secondary).setCustomId(`cmd{manager-permissions}usr{${interaction.user.id}}prm{${permission.id}}limit{${permission.requirements.length + (permission.requirements.length % 20 == 0 ? 0 : 20 - (permission.requirements.length % 20))}}4`).setDisabled((permission.requirements.length <= 20 && min == 0) || (permission.requirements.length > 20 && min >= permission.requirements.length - 20))
        ]
        const addReqBtn = new ButtonBuilder()
            .setStyle(ButtonStyle.Success)
            .setLabel(`${client.language({ textId: `Добавить требование`, guildId: interaction.guildId, locale: interaction.locale })}`)
            .setCustomId(`cmd{manager-permissions}usr{${interaction.user.id}}prm{${permission.id}}addreq`)
            .setDisabled(permission.requirements.length >= 25)
        const delReqBtn = new ButtonBuilder()
            .setStyle(ButtonStyle.Danger)
            .setLabel(`${client.language({ textId: `Удалить требование`, guildId: interaction.guildId, locale: interaction.locale })}`)
            .setCustomId(`cmd{manager-permissions}usr{${interaction.user.id}}prm{${permission.id}}delreq`)
            .setDisabled(permission.requirements.length === 0)
        const enable_disable_Btn = new ButtonBuilder()
            .setStyle(permission.enable ? ButtonStyle.Danger : ButtonStyle.Success)
            .setLabel(permission.enable ? `${client.language({ textId: `Выключить`, guildId: interaction.guildId, locale: interaction.locale })}` : `${client.language({ textId: `Включить`, guildId: interaction.guildId, locale: interaction.locale })}`)
            .setCustomId(`cmd{manager-permissions}usr{${interaction.user.id}}prm{${permission.id}}enabledisable`)
            .setEmoji(permission.enable ? client.config.emojis.off : client.config.emojis.on)
        const test_Btn = new ButtonBuilder()
            .setStyle(ButtonStyle.Secondary)
            .setLabel(`${client.language({ textId: `Тест`, guildId: interaction.guildId, locale: interaction.locale })}`)
            .setCustomId(`cmd{manager-permissions}usr{${interaction.user.id}}prm{${permission.id}}test`)
            .setEmoji(client.config.emojis.use)
        if (interaction.replied || interaction.deferred) return interaction.editReply({ embeds: [embed], components: [new ActionRowBuilder().addComponents(array_btn), new ActionRowBuilder().addComponents(addReqBtn, delReqBtn, enable_disable_Btn, test_Btn)] })
        else return interaction.update({ embeds: [embed], components: [new ActionRowBuilder().addComponents(array_btn), new ActionRowBuilder().addComponents(addReqBtn, delReqBtn, enable_disable_Btn, test_Btn)] })
    }
}