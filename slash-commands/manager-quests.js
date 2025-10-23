const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle, TextInputStyle, TextInputBuilder, ModalBuilder, InteractionType, StringSelectMenuBuilder, Collection, RoleSelectMenuBuilder, ApplicationCommandOptionType, LabelBuilder, UserSelectMenuComponent, UserSelectMenuBuilder, ChannelSelectMenuBuilder, MessageFlags } = require("discord.js")
const uniqid = require("uniqid")
const { RewardType } = require("../enums")
const Quest = require("../classes/Quest")
const QuestRegexp = /qst{(.*?)}/
const limRegexp = /lim{(.*?)}/
module.exports = {
    name: 'manager-quests',
    nameLocalizations: {
        'ru': `управление-квестами`,
        'uk': `управління-квестами`,
        'es-ES': `gestión-de-misiones`
    },
    description: 'Manage guild quests',
    descriptionLocalizations: {
        'ru': `Управление квестами сервера`,
        'uk': `Управління квестами сервера`,
        'es-ES': `Gestión de misiones del servidor`
    },
    options: [
        {
            name: 'view',
            nameLocalizations: {
                'ru': `просмотр`,
                'uk': `перегляд`,
                'es-ES': `ver`
            },
            description: 'View all quests',
            descriptionLocalizations: {
                'ru': `Просмотр всех квестов`,
                'uk': `Перегляд всіх квестів`,
                'es-ES': `Ver todas las misiones`
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
            description: 'Create a quest',
            descriptionLocalizations: {
                'ru': `Создать квест`,
                'uk': `Створити квест`,
                'es-ES': `Crear una misión`
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
                    description: 'Quest name',
                    descriptionLocalizations: {
                        'ru': `Название квеста`,
                        'uk': `Назва квесту`,
                        'es-ES': `Nombre de la misión`
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
            description: 'Edit a quest',
            descriptionLocalizations: {
                'ru': `Изменить квест`,
                'uk': `Змінити квест`,
                'es-ES': `Editar una misión`
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
                    description: 'Quest name',
                    descriptionLocalizations: {
                        'ru': `Название квеста`,
                        'uk': `Назва квесту`,
                        'es-ES': `Nombre de la misión`
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
            description: 'Copy a quest',
            descriptionLocalizations: {
                'ru': `Копировать квест`,
                'uk': `Копіювати квест`,
                'es-ES': `Copiar una misión`
            },
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'quest',
                    nameLocalizations: {
                        'ru': `квест`,
                        'uk': `квест`,
                        'es-ES': `misión`
                    },
                    description: 'Quest name',
                    descriptionLocalizations: {
                        'ru': `Название квеста`,
                        'uk': `Назва квесту`,
                        'es-ES': `Nombre de la misión`
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
                    description: 'Name for new quest',
                    descriptionLocalizations: {
                        'ru': `Название для нового квеста`,
                        'uk': `Назва для нового квесту`,
                        'es-ES': `Nombre para la nueva misión`
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
            description: 'Delete a quest',
            descriptionLocalizations: {
                'ru': `Удалить квест`,
                'uk': `Видалити квест`,
                'es-ES': `Eliminar una misión`
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
                    description: 'Quest name',
                    descriptionLocalizations: {
                        'ru': `Название квеста`,
                        'uk': `Назва квесту`,
                        'es-ES': `Nombre de la misión`
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
            description: 'Enable all quests',
            descriptionLocalizations: {
                'ru': `Включить все квесты`,
                'uk': `Увімкнути всі квести`,
                'es-ES': `Activar todas las misiones`
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
            description: 'Disable all quests',
            descriptionLocalizations: {
                'ru': `Выключить все квесты`,
                'uk': `Вимкнути всі квести`,
                'es-ES': `Desactivar todas las misiones`
            },
            type: ApplicationCommandOptionType.Subcommand,
        },
        {
            name: 'maximum-weekly-quests',
            nameLocalizations: {
                'ru': `максимум-еженедельных-квестов`,
                'uk': `максимум-щотижневих-квестів`,
                'es-ES': `máximo-de-misiones-semanales`
            },
            description: 'Set maximum amount of weekly quests per week which the member can take',
            descriptionLocalizations: {
                'ru': `Установить максимальное количество еженедельных квестов в неделю, которые может взять участник`,
                'uk': `Встановити максимальну кількість щотижневих квестів на тиждень, які може взяти учасник`,
                'es-ES': `Establecer la cantidad máxima de misiones semanales que el miembro puede tomar por semana`
            },
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'amount',
                    nameLocalizations: {
                        'ru': `количество`,
                        'uk': `кількість`,
                        'es-ES': `cantidad`
                    },
                    description: 'Maximum amount of weekly quests',
                    descriptionLocalizations: {
                        'ru': `Максимальное количество еженедельных квестов`,
                        'uk': `Максимальна кількість щотижневих квестів`,
                        'es-ES': `Cantidad máxima de misiones semanales`
                    },
                    type: ApplicationCommandOptionType.Number,
                    minLength: 0,
                    maxLength: 25,
                    required: true
                }
            ]
        },
        {
            name: 'maximum-daily-quests',
            nameLocalizations: {
                'ru': `максимум-ежедневных-квестов`,
                'uk': `максимум-щоденних-квестів`,
                'es-ES': `máximo-de-misiones-diarias`
            },
            description: 'Set maximum amount of daily quests per day which the member can take',
            descriptionLocalizations: {
                'ru': `Установить максимальное количество ежедневных квестов в день, которые может взять участник`,
                'uk': `Встановити максимальну кількість щоденних квестів на день, які може взяти учасник`,
                'es-ES': `Establecer la cantidad máxima de misiones diarias que el miembro puede tomar por día`
            },
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'amount',
                    nameLocalizations: {
                        'ru': `количество`,
                        'uk': `кількість`,
                        'es-ES': `cantidad`
                    },
                    description: 'Maximum amount of daily quests',
                    descriptionLocalizations: {
                        'ru': `Максимальное количество ежедневных квестов`,
                        'uk': `Максимальна кількість щоденних квестів`,
                        'es-ES': `Cantidad máxima de misiones diarias`
                    },
                    type: ApplicationCommandOptionType.Number,
                    minLength: 0,
                    maxLength: 25,
                    required: true
                }
            ]
        }
    ],
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
    run: async (client, interaction, args) => {
        let quest
        const settings = client.cache.settings.get(interaction.guildId)
        if (interaction.isChatInputCommand() || interaction.customId?.includes("view")) {
            if (interaction.isChatInputCommand()) await interaction.deferReply({ flags: ["Ephemeral"] })
            if (args?.Subcommand === "create") {
                const quests = client.cache.quests.filter(e => e.guildID === interaction.guildId)
                if (quests.size >= settings.max_quests) return interaction.editReply({ content: `${client.language({ textId: `Достигнуто максимум квестов:`, guildId: interaction.guildId, locale: interaction.locale })} ${settings.max_quests}`, flags: ["Ephemeral"] })
                if (quests.some(e => e.name.toLowerCase() === args.name.toLowerCase())) {
                    return interaction.editReply({ content: `${client.config.emojis.NO}**${client.language({ textId: `Квест с названием`, guildId: interaction.guildId, locale: interaction.locale })} <${args.name}> ${client.language({ textId: `уже существует, выбери другое название`, guildId: interaction.guildId, locale: interaction.locale })}**`, flags: ["Ephemeral"] })
                }
                quest = new client.questSchema({
                    questID: uniqid.time(),
                    name: args.name,
                    guildID: interaction.guildId,
                    enable: false
                })
                await quest.save()
                quest = new Quest(client, quest)
                client.cache.quests.set(quest.questID, quest)
            } else
            if (args?.Subcommand === "edit") {
                quest = client.cache.quests.find(e => e.name.toLowerCase() === args.name.toLowerCase() && e.guildID === interaction.guildId)
                if (!quest) return interaction.editReply({ content: `${client.config.emojis.NO}**${client.language({ textId: `Квест с названием`, guildId: interaction.guildId, locale: interaction.locale })} <${args.name}> ${client.language({ textId: `не существует`, guildId: interaction.guildId, locale: interaction.locale })}**`, flags: ["Ephemeral"] })
            } else
            if (args?.Subcommand === "copy") {
                const quests = client.cache.quests.filter(e => e.guildID === interaction.guildId)
                if (quests.size >= settings.max_quests) return interaction.reply({ content: `${client.language({ textId: `Достигнуто максимум квестов:`, guildId: interaction.guildId, locale: interaction.locale })} ${settings.max_quests}`, flags: ["Ephemeral"] })
                let originalQuest = client.cache.quests.find(e => e.name.toLowerCase() === args.quest.toLowerCase() && e.guildID === interaction.guildId)
                if (!originalQuest) return interaction.editReply({ content: `${client.config.emojis.NO}**${client.language({ textId: `Квест с названием`, guildId: interaction.guildId, locale: interaction.locale })}: <${args.name}> ${client.language({ textId: `не найден`, guildId: interaction.guildId, locale: interaction.locale })}**`, flags: ["Ephemeral"] })
                if (client.cache.quests.some(e => e.name.toLowerCase() === args.name.toLowerCase() && e.guildID === interaction.guildId)) {
                    return interaction.editReply({ content: `${client.config.emojis.NO}**${client.language({ textId: `Квест с названием`, guildId: interaction.guildId, locale: interaction.locale })}: <${args.name}>> ${client.language({ textId: `уже существует, выбери другое название`, guildId: interaction.guildId, locale: interaction.locale })}**`, flags: ["Ephemeral"] })
                }
                let copyQuest = structuredClone(Object.assign({}, { ...originalQuest, client: undefined, rewards: [], targets: [] }))
                if (originalQuest.rewards.length) copyQuest.rewards = JSON.parse(JSON.stringify(originalQuest.rewards))
                if (originalQuest.targets.length) copyQuest.targets = JSON.parse(JSON.stringify(originalQuest.targets))
                delete copyQuest._id
                copyQuest.name = args.name
                copyQuest.questID = uniqid.time()
                copyQuest.enable = false
                copyQuest = new client.questSchema(copyQuest)
                await copyQuest.save()
                quest = new Quest(client, copyQuest)
                quest.displayEmoji = originalQuest.displayEmoji
                client.cache.quests.set(quest.questID, quest)
            } else
            if (args?.Subcommand === "delete") {
                quest = client.cache.quests.find(e => e.name.toLowerCase() === args.name.toLowerCase() && e.guildID === interaction.guildId)
                if (!quest) return interaction.editReply({ content: `${client.config.emojis.NO}**${client.language({ textId: `Квест с названием`, guildId: interaction.guildId, locale: interaction.locale })} <${args.name}> ${client.language({ textId: `не существует`, guildId: interaction.guildId, locale: interaction.locale })}**` })
                await quest.delete()
                return interaction.editReply({ content: `${client.config.emojis.YES}**${client.language({ textId: `Квест`, guildId: interaction.guildId, locale: interaction.locale })} <${quest.name}> ${client.language({ textId: `был удалён`, guildId: interaction.guildId, locale: interaction.locale })}**`, flags: ["Ephemeral"] })
            } else
            if (args?.Subcommand === "view" || interaction.customId?.includes("view")) {
                const quests = client.cache.quests.filter(e => e.guildID === interaction.guildId)
                let min = 0
                let max = 25
                if (interaction.customId?.includes("lim")) {
                    max = +limRegexp.exec(interaction.customId)[1]
                    min = max - 25
                }
                let index = 0
                const embed = new EmbedBuilder()
                    .setTitle(`${client.language({ textId: `Менеджер квестов`, guildId: interaction.guildId, locale: interaction.locale })} (${quests.size}/${settings.max_quests})`)
                    .setColor(3093046)
                    .setDescription(quests.size ? quests.map((quest) => { 
                        return `${index++}. ${quest.enable ? "🟢": "🔴"}${quest.displayEmoji}${quest.name}`
                    }).slice(min, max).join("\n") : `${client.language({ textId: `Нет квестов`, guildId: interaction.guildId, locale: interaction.locale })}`)
                const embeds = [
                    embed,
                    new EmbedBuilder()
                        .setColor(3093046)
                        .setDescription(`${client.config.emojis.plus}${client.language({ textId: `Создать квест`, guildId: interaction.guildId, locale: interaction.locale })}: </manager-quests create:1150455842294988944>\n${client.config.emojis.edit}${client.language({ textId: `Изменить квест`, guildId: interaction.guildId, locale: interaction.locale })}: </manager-quests edit:1150455842294988944>\n${client.config.emojis.copy}${client.language({ textId: `Скопировать квест`, guildId: interaction.guildId, locale: interaction.locale })}: </manager-quests copy:1150455842294988944>\n${client.config.emojis.trash}${client.language({ textId: `Удалить квест`, guildId: interaction.guildId, locale: interaction.locale })}: </manager-quests delete:1150455842294988944>`)
                ]
                const components = [
                    new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setStyle(ButtonStyle.Primary)
                                .setEmoji(`${client.config.emojis.arrowLeft2}`)
                                .setCustomId(`cmd{manager-quests}lim{25}view1`)
                                .setDisabled((quests.size <= 25 && min === 0) || (quests.size > 25 && min < 25) ? true : false),
                            new ButtonBuilder()
                                .setStyle(ButtonStyle.Primary)
                                .setEmoji(`${client.config.emojis.arrowLeft}`)
                                .setCustomId(`cmd{manager-quests}lim{${max - 25}}view2`)
                                .setDisabled((quests.size <= 25 && min === 0) || (quests.size > 25 && min < 25) ? true : false),
                            new ButtonBuilder()
                                .setStyle(ButtonStyle.Primary)
                                .setEmoji(`${client.config.emojis.arrowRight}`)
                                .setCustomId(`cmd{manager-quests}lim{${max + 25}}view3`)
                                .setDisabled((quests.size <= 25 && min === 0) || (quests.size > 25 && min >= quests.size - 25) ? true : false),
                            new ButtonBuilder()
                                .setStyle(ButtonStyle.Primary)
                                .setEmoji(`${client.config.emojis.arrowRight2}`)
                                .setCustomId(`cmd{manager-quests}lim{${quests.size + (quests.size % 25 === 0 ? 0 : 25 - (quests.size % 25))}}view4`)
                                .setDisabled((quests.size <= 25 && min === 0) || (quests.size > 25 && min >= quests.size - 25) ? true : false)
                        )
                ]
                if (interaction.isChatInputCommand()) return interaction.editReply({ embeds: embeds, components: components })
                else return interaction.update({ embeds: embeds, components: components })
            } else
            if (args?.Subcommand === "enable-all") {
                if (!client.cache.quests.some(e => e.guildID === interaction.guildId)) return interaction.editReply({ content: `${client.config.emojis.NO}**${client.language({ textId: `На сервере нет квестов`, guildId: interaction.guildId, locale: interaction.locale })}**`, flags: ["Ephemeral"] })
                let count = 0
                await Promise.all(client.cache.quests.filter(e => e.guildID === interaction.guildId && e.name && e.emoji && e.targets.length && !e.enable).map(async quest => {
                    quest.enable = true
                    await quest.save()
                    count++
                }))
                return interaction.editReply({ content: `${client.config.emojis.YES}**${client.language({ textId: `Квесты были включены`, guildId: interaction.guildId, locale: interaction.locale })} (${count})**`, flags: ["Ephemeral"] })
            } else
            if (args?.Subcommand === "disable-all") {
                if (!client.cache.quests.some(e => e.guildID === interaction.guildId)) return interaction.editReply({ content: `${client.config.emojis.NO}**${client.language({ textId: `На сервере нет квестов`, guildId: interaction.guildId, locale: interaction.locale })}**`, flags: ["Ephemeral"] })
                let count = 0
                await Promise.all(client.cache.quests.filter(e => e.guildID === interaction.guildId).map(async quest => {
                    quest.enable = false
                    await quest.save()
                    count++
                }))
                return interaction.editReply({ content: `${client.config.emojis.YES}**${client.language({ textId: `Квесты были выключены`, guildId: interaction.guildId, locale: interaction.locale })} (${count})**`, flags: ["Ephemeral"] })
            } else
            if (args?.Subcommand === "maximum-weekly-quests") {
                settings.maxWeeklyQuests = args.amount
                await settings.save()
                return interaction.editReply({ content: `${client.language({ textId: `Максимальное количество еженедельных квестов в неделю установлено на`, guildId: interaction.guildId, locale: interaction.locale })} ${args.amount}` })
            } else
            if (args?.Subcommand === "maximum-daily-quests") {
                settings.maxDailyQuests = args.amount
                await settings.save()
                return interaction.editReply({ content: `${client.language({ textId: `Максимальное количество ежедневных квестов в день установлено на`, guildId: interaction.guildId, locale: interaction.locale })} ${args.amount}` })
            }
        }
        if (!interaction.isChatInputCommand()) {
            if (interaction.isStringSelectMenu()) {
                quest = client.cache.quests.get(QuestRegexp.exec(interaction.customId)[1])
                if (!quest) return interaction.reply({ content: `${client.config.emojis.NO}**${client.language({ textId: `Такого квеста не существует`, guildId: interaction.guildId, locale: interaction.locale })}**`, flags: ["Ephemeral"] })
                if (interaction.values[0] === "name, description, image, color") {
                    const modal = new ModalBuilder()
                        .setCustomId(`name, description, image, color_${interaction.id}`)
                        .setTitle(quest.name)
                        .setLabelComponents([
                            new LabelBuilder()
                                .setLabel(`${client.language({ textId: `Название`, guildId: interaction.guildId, locale: interaction.locale })}`)
                                .setTextInputComponent(
                                    new TextInputBuilder()
                                        .setCustomId("name")
                                        .setMinLength(2)
                                        .setMaxLength(30)
                                        .setRequired(true)
                                        .setStyle(TextInputStyle.Short)
                                        .setPlaceholder(`${client.language({ textId: `Введите название вашего квеста`, guildId: interaction.guildId, locale: interaction.locale })}`)
                                        .setValue(quest.name)
                                ),
                            new LabelBuilder()
                                .setLabel(`${client.language({ textId: `Описание`, guildId: interaction.guildId, locale: interaction.locale })}`)
                                .setTextInputComponent(
                                    new TextInputBuilder()
                                        .setCustomId("description")
                                        .setRequired(true)
                                        .setStyle(TextInputStyle.Paragraph)
                                        .setPlaceholder(`${client.language({ textId: `Введите описание вашего квеста`, guildId: interaction.guildId, locale: interaction.locale })}`)
                                        .setValue(quest.description || "")
                                ),
                            new LabelBuilder()
                                .setLabel(`${client.language({ textId: `Изображение`, guildId: interaction.guildId, locale: interaction.locale })}`)
                                .setTextInputComponent(
                                    new TextInputBuilder()
                                        .setCustomId("image")
                                        .setRequired(false)
                                        .setStyle(TextInputStyle.Short)
                                        .setPlaceholder(`${client.language({ textId: `Вставьте ссылку на изображение`, guildId: interaction.guildId, locale: interaction.locale })}`)
                                        .setValue(quest.image || "")
                                ),
                            new LabelBuilder()
                                .setLabel(`${client.language({ textId: `Цвет`, guildId: interaction.guildId, locale: interaction.locale })}`)
                                .setTextInputComponent(
                                    new TextInputBuilder()
                                        .setCustomId("color")
                                        .setRequired(false)
                                        .setStyle(TextInputStyle.Short)
                                        .setPlaceholder(`${client.language({ textId: `Введите HEX код цвета`, guildId: interaction.guildId, locale: interaction.locale })}`)
                                        .setValue(quest.hex || "#2F3236")
                                ),
                            new LabelBuilder()
                                .setLabel(`${client.language({ textId: `Условие выполнения`, guildId: interaction.guildId, locale: interaction.locale })}`)
                                .setStringSelectMenuComponent(
                                    new StringSelectMenuBuilder()
                                        .setCustomId("requiresAllTasks")
                                        .setRequired(true)
                                        .setOptions([
                                            {
                                                label: `${client.language({ textId: `Выполните все задачи`, guildId: interaction.guildId, locale: interaction.locale })}`,
                                                value: `true`,
                                                default: quest.requiresAllTasks
                                            },
                                            {
                                                label: `${client.language({ textId: `Выполните любую задачу`, guildId: interaction.guildId, locale: interaction.locale })}`,
                                                value: `false`,
                                                default: !quest.requiresAllTasks
                                            }
                                        ])
                                )
                        ])
                    await interaction.showModal(modal);delete client.globalCooldown[`${interaction.guildId}_${interaction.user.id}`]
                    const filter = (i) => i.customId === `name, description, image, color_${interaction.id}` && i.user.id === interaction.user.id
                    interaction = await interaction.awaitModalSubmit({ filter, time: 180000 }).catch(e => null)
                    if (interaction && interaction.type === InteractionType.ModalSubmit) {
                        const modalArgs = {}
                        interaction.fields.fields.each(field => modalArgs[field.customId] = field.value)
                        const requiresAllTasks = interaction.fields.getStringSelectValues("requiresAllTasks")[0] === "true" ? true : false
                        await interaction.deferUpdate()
                        if (client.cache.quests.some(e => e.guildID === interaction.guildId && e.name === modalArgs.name) && quest.name !== modalArgs.name) {
                            await interaction.followUp({ content: `${client.language({ textId: `Квест с таким названием уже существует`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
                        } else {
                            if (modalArgs.image) {
                                const isImageURL = require('image-url-validator').default;
                                const image = await isImageURL(modalArgs.image)
                                if (!image) {
                                    await interaction.followUp({ content: `${client.config.emojis.NO} ${client.language({ textId: `Строка`, guildId: interaction.guildId, locale: interaction.locale })} ${client.language({ textId: `не является прямой ссылкой на изображение`, guildId: interaction.guildId, locale: interaction.locale })}: **${modalArgs.image}**`.slice(0, 2000), flags: ["Ephemeral"] })
                                    delete modalArgs.image
                                }
                            }
                            if (modalArgs.color) {
                                if (!/^#[0-9A-F]{6}$/i.test(modalArgs.color)) {
                                    modalArgs.color = quest.hex
                                }
                            } else modalArgs.color = `#2F3236`
                            quest.name = modalArgs.name
                            quest.description = modalArgs.description
                            quest.hex = modalArgs.color
                            if (modalArgs.image) quest.image = modalArgs.image
                            else quest.image = undefined
                            quest.requiresAllTasks = requiresAllTasks
                            await quest.save()    
                        }
                    } else return
                } else if (interaction.values[0] === "emoji") {
                    const command = client.interactions.get("emoji-selector")
					return command.run(client, interaction, {}, "quest", quest.questID)
                } else if (interaction.values[0] === "active/inactive") {
                    quest.active = !quest.active
                    await quest.save()
                } else if (interaction.values[0] === "enable/disable") {
                    const errors = []
                    if (!quest.enable) {
                        if (!quest.targets.filter(e => !e.isOptional).length) errors.push(`${client.language({ textId: `Отсутствует задача`, guildId: interaction.guildId, locale: interaction.locale })}`)
                        if (!quest.emoji) errors.push(`${client.language({ textId: `Отсутствует эмодзи`, guildId: interaction.guildId, locale: interaction.locale })}`)    
                    }
                    if (errors.length) return interaction.reply({ content: `${client.config.emojis.NO}**${client.language({ textId: `Невозможно включить квест`, guildId: interaction.guildId, locale: interaction.locale })}:**\n* ${errors.join("\n* ")}`, flags: ["Ephemeral"] })
                    quest.enable = !quest.enable
                    await quest.save()    
                } else if (interaction.values[0] === "reward") {
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
                                            .setEmoji(client.config.emojis.coin)
                                            .setStyle(ButtonStyle.Secondary),
                                        new ButtonBuilder()
                                            .setCustomId("add_xp")
                                            .setLabel(`${client.language({ textId: `Опыт`, guildId: interaction.guildId, locale: interaction.locale })}`)
                                            .setEmoji(client.config.emojis.XP)
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
                                    [
                                        new ButtonBuilder()
                                            .setCustomId("add_achievement")
                                            .setLabel(client.language({ textId: `Достижение`, guildId: interaction.guildId, locale: interaction.locale }))
                                            .setEmoji(client.config.emojis.achievements)
                                            .setStyle(ButtonStyle.Secondary)
                                    ]
                                ),
                            new ActionRowBuilder()
                                .addComponents(
                                    new ButtonBuilder()
                                        .setCustomId("cancel")
                                        .setLabel(client.language({ textId: `ОТМЕНА`, guildId: interaction.guildId, locale: interaction.locale }))
                                        .setStyle(ButtonStyle.Danger),
                                ),
                        ],
                        flags: ["Ephemeral"]
                    })
                    const filter = (i) => i.customId.includes(`add`) || i.customId === "cancel" && i.user.id === interaction.user.id;
                    let interaction2 = await interaction.channel.awaitMessageComponent({ filter, time: 30000 }).catch(e => null)
                    if (interaction2 && interaction2.customId.includes("add")) {
                        let id
                        let type
                        let ms
                        const modalComponents = [
                            !interaction2.customId.includes("achievement") ? new LabelBuilder()
                                .setLabel(`${client.language({ textId: `Количество`, guildId: interaction.guildId, locale: interaction.locale })}`)
                                .setTextInputComponent(
                                    new TextInputBuilder()
                                        .setCustomId("amount")
                                        .setRequired(true)
                                        .setStyle(TextInputStyle.Short)
                                ) : undefined,
                            interaction2.customId.includes("role") ?
                            new LabelBuilder()
                                .setLabel(`${client.language({ textId: `Временная (минуты)`, guildId: interaction.guildId, locale: interaction.locale })}`)
                                .setTextInputComponent(
                                    new TextInputBuilder()
                                        .setCustomId("minutes")
                                        .setRequired(false)
                                        .setStyle(TextInputStyle.Short)
                                )
                            : undefined
                        ].filter(e => e)
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
                        if (interaction2.customId.includes("achievement")) {
                            type = RewardType.Achievement
                            modalComponents.unshift(
                                new LabelBuilder()
                                    .setLabel(`${client.language({ textId: `Название достижения`, guildId: interaction.guildId, locale: interaction.locale })}`)
                                    .setTextInputComponent(
                                        new TextInputBuilder()
                                            .setCustomId("achievement")
                                            .setRequired(true)
                                            .setStyle(TextInputStyle.Short)
                                    )
                            )
                        }
                        if (interaction2.customId.includes("role")) {
                            type = RewardType.Role
                            modalComponents.unshift(
                                new LabelBuilder()
                                    .setLabel(`${client.language({ textId: `Название роли`, guildId: interaction.guildId, locale: interaction.locale })}`)
                                    .setRoleSelectMenuComponent(
                                        new RoleSelectMenuBuilder()
                                            .setCustomId("role")
                                            .setRequired(true)
                                    )
                            )
                        }
                        if (interaction2.customId.includes("currency")) type = RewardType.Currency
                        if (interaction2.customId.includes("xp")) type = RewardType.Experience
                        if (interaction2.customId.includes("rp")) type = RewardType.Reputation
                        const modal = new ModalBuilder()
                            .setCustomId(`manager-quests_addRewardAmount_${interaction2.id}`)
                            .setTitle(`${client.language({ textId: `Добавить награду`, guildId: interaction.guildId, locale: interaction.locale })}`)
                            .setLabelComponents(modalComponents)
                        await interaction2.showModal(modal);delete client.globalCooldown[`${interaction.guildId}_${interaction.user.id}`]
                        const filter = (i) => i.customId === `manager-quests_addRewardAmount_${interaction2.id}` && i.user.id === interaction.user.id
                        interaction2 = await interaction2.awaitModalSubmit({ filter, time: 60000 }).catch(e => interaction2)
                        if (interaction2 && interaction2.isModalSubmit()) {
                            const modalArgs = {}
                            interaction2.fields.fields.each(field => modalArgs[field.customId] = field.value)
                            if (type === RewardType.Item) {
                                const filteredItems = client.cache.items.filter(e => e.guildID === interaction.guildId && !e.temp && e.name.toLowerCase().includes(modalArgs.item.toLowerCase()))
                                if (filteredItems.size > 1 && !filteredItems.some(e =>  e.name.toLowerCase() === modalArgs.item.toLowerCase())) {
                                    let result = ""
                                    filteredItems.forEach(item => {
                                        result += `> ${item.displayEmoji}**${item.name}**\n`	
                                    })
                                    pass = false
                                    interaction2.update({ content: `${client.config.emojis.block} ${client.language({ textId: `По вашему запросу было найдено несколько предметов`, guildId: interaction.guildId, locale: interaction.locale })}:\n${result}`.slice(0, 2000), components: [], flags: ["Ephemeral"] })
                                    return interaction.editReply({ components: components })
                                } else {
                                    const searchedItem = filteredItems.some(e => e.name.toLowerCase() === modalArgs.item.toLowerCase()) ? filteredItems.find(e => e.name.toLowerCase() === modalArgs.item.toLowerCase()) : filteredItems.first()
                                    if (!searchedItem) {
                                        pass = false
                                        await interaction2.update({ content: `${client.config.emojis.NO}${client.language({ textId: `Предмет`, guildId: interaction.guildId, locale: interaction.locale })} **${modalArgs.item}** ${client.language({ textId: `не найден`, guildId: interaction.guildId, locale: interaction.locale })}`, components: [], flags: ["Ephemeral"] })
                                        return interaction.editReply({ components: components })
                                    } else {
                                        id = searchedItem.itemID
                                    }
                                }
                            }
                            if (type === RewardType.Achievement) {
                                const filteredAchievements = client.cache.achievements.filter(e => e.guildID === interaction.guildId && e.name.toLowerCase().includes(modalArgs.achievement.toLowerCase()))
                                if (filteredAchievements.size > 1 && !filteredAchievements.some(e =>  e.name.toLowerCase() === modalArgs.achievement.toLowerCase())) {
                                    let result = ""
                                    filteredAchievements.forEach(achievement => {
                                        result += `> ${achievement.displayEmoji}**${achievement.name}**\n`	
                                    })
                                    pass = false
                                    interaction2.update({ content: `${client.config.emojis.block} ${client.language({ textId: `По вашему запросу было найдено несколько достижений`, guildId: interaction.guildId, locale: interaction.locale })}:\n${result}`.slice(0, 2000), components: [], flags: ["Ephemeral"] })
                                    return interaction.editReply({ components: components })
                                } else {
                                    const searchedAchievement = filteredAchievements.some(e => e.name.toLowerCase() === modalArgs.achievement.toLowerCase()) ? filteredAchievements.find(e => e.name.toLowerCase() === modalArgs.achievement.toLowerCase()) : filteredAchievements.first()
                                    if (!searchedAchievement) {
                                        pass = false
                                        await interaction2.update({ content: `${client.config.emojis.NO}${client.language({ textId: `Достижение`, guildId: interaction.guildId, locale: interaction.locale })} **${modalArgs.achievement}** ${client.language({ textId: `не найдено`, guildId: interaction.guildId, locale: interaction.locale })}`, components: [], flags: ["Ephemeral"] })
                                        return interaction.editReply({ components: components })
                                    } else {
                                        id = searchedAchievement.id
                                    }
                                }
                            }
                            if (type === RewardType.Role) {
                                const role = interaction2.fields.getSelectedRoles("role").first()
                                id = role.id
                            }
                            if (modalArgs.amount !== undefined && isNaN(+modalArgs.amount)) {
                                interaction2.update({ content: `${client.config.emojis.NO} **${modalArgs.amount}** ${client.language({ textId: `не является числом`, guildId: interaction.guildId, locale: interaction.locale })}`, components: [], flags: ["Ephemeral"] })
                                return interaction.editReply({ components: components })
                            } else {
                                if (modalArgs.amount !== undefined) modalArgs.amount = +modalArgs.amount
                                if (modalArgs.amount !== undefined && (modalArgs.amount <= 0 || modalArgs.amount > 100000000000)) {
                                    interaction2.update({ content: `${client.config.emojis.NO} ${client.language({ textId: `Количество не должно быть`, guildId: interaction.guildId, locale: interaction.locale })} <= 0 ${client.language({ textId: `или`, guildId: interaction.guildId, locale: interaction.locale })} > 100 000 000 000`, components: [], flags: ["Ephemeral"] })
                                    return interaction.editReply({ components: components })
                                } else {
                                    if (modalArgs.minutes) {
                                        if (isNaN(+modalArgs.minutes) || !Number.isInteger(+modalArgs.minutes)) {
											await interaction2.update({ content: `${client.config.emojis.NO} **${modalArgs.minutes}** ${client.language({ textId: `не является целым числом`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
											return interaction.editReply({ components: components })
										}
										modalArgs.minutes = +modalArgs.minutes
										if (modalArgs.minutes <= 0) {
											await interaction2.update({ content: `${client.config.emojis.NO} **${client.language({ textId: `Число не может быть`, guildId: interaction.guildId, locale: interaction.locale })} <= 0**`, components: [], flags: ["Ephemeral"] })
                                            return interaction.editReply({ components: components })
										}
                                        ms = modalArgs.minutes * 60 * 1000
                                    }
                                    const reward = quest.rewards.find(e => { return e.type === type && e.id === id })
                                    if (reward && modalArgs.amount !== undefined) {
                                        reward.amount = modalArgs.amount
                                    } else {
                                        if (quest.rewards.length >= 5) {
                                            interaction2.update({ content: `${client.config.emojis.NO}**${client.language({ textId: `Достигнуто максимальное количество наград: 5`, guildId: interaction.guildId, locale: interaction.locale })}: 5**`, components: [], flags: ["Ephemeral"] })
                                            return interaction.editReply({ components: components })
                                        } else {
                                            quest.rewards.push({
                                                type: type,
                                                id: id,
                                                amount: modalArgs.amount,
                                                ms: ms
                                            })    
                                        }
                                    }
                                    await quest.save()
                                    interaction2.update({ content: `${client.config.emojis.YES}`, components: [], flags: ["Ephemeral"] })
                                }
                            }
                        }
                    } else if (interaction2 && interaction2.customId === "cancel") {
                        await interaction2.update({ content: `${client.config.emojis.YES}${client.language({ textId: `Выбор отменён`, guildId: interaction.guildId, locale: interaction.locale })}`, components: [] })
                    }
                } else if (interaction.values[0] === "addTarget") {
                    const usersWithThisQuest = client.cache.profiles.some(profile => profile.guildID === interaction.guildId && profile.quests?.some(q => q.questID === quest.questID))
                    let buttonInteraction
                    if (usersWithThisQuest) {
                        await interaction.deferUpdate()
                        await interaction.followUp({ content: `${client.language({ textId: `Для добавления задачи для этого квеста, необходимо удалить этот квест из всех профилей пользователей. Удалить?`, guildId: interaction.guildId, locale: interaction.locale })}`, components: [
                                new ActionRowBuilder().addComponents(
                                    new ButtonBuilder()
                                        .setCustomId(`confirm delete quest from profile`)
                                        .setLabel(`${client.language({ textId: `УДАЛИТЬ`, guildId: interaction.guildId, locale: interaction.locale })}`)
                                        .setStyle(ButtonStyle.Success),
                                    new ButtonBuilder()
                                        .setCustomId(`decline delete quest from profile`)
                                        .setLabel(`${client.language({ textId: `ОТМЕНА`, guildId: interaction.guildId, locale: interaction.locale })}`)
                                        .setStyle(ButtonStyle.Danger))
                            ], flags: ["Ephemeral"] })    
                        const filter = (i) => i.customId.includes(`delete quest from profile`) && i.user.id === interaction.user.id
                        buttonInteraction = await interaction.channel.awaitMessageComponent({ filter, time: 60000 }).catch(e => null)
                        if (buttonInteraction) {
                            if (buttonInteraction.customId.includes("confirm")) {
                                client.cache.profiles.filter(profile => profile.guildID === buttonInteraction.guildId && profile.quests?.some(q => q.questID === quest.questID)).forEach(profile => {
                                    profile.quests = profile.quests?.filter(q => q.questID !== quest.questID)
                                    profile.save()
                                })
                            } else return buttonInteraction.update({ content: `${client.language({ textId: `Вы отменили добавление задачи. Вернуться к [квесту]`, guildId: buttonInteraction.guildId, locale: buttonInteraction.locale })}(<${interaction.message.url}>).`, components: [] })
                        } else return
                    }
                    const row = new ActionRowBuilder().addComponents([
                        new StringSelectMenuBuilder().setCustomId(`submit target ${interaction.id}`).setOptions([
                            {
                                label: getQuestContext("message"),
                                value: `message`
                            },
                            {
                                label: getQuestContext("voice"),
                                value: `voice`,
                            },
                            {
                                label: getQuestContext("like"),
                                value: `like`
                            },
                            {
                                label: getQuestContext("invite"),
                                value: `invite`
                            },
                            {
                                label: getQuestContext("bump"),
                                value: `bump`
                            },
                            {
                                label: getQuestContext("currency"),
                                value: `currency`
                            },
                            {
                                label: getQuestContext("currencySpent"),
                                value: `currencySpent`
                            },
                            {
                                label: getQuestContext("fishing"),
                                value: `fishing`
                            },
                            {
                                label: getQuestContext("mining"),
                                value: `mining`
                            },
                            {
                                label: getQuestContext("daily"),
                                value: `daily`
                            },
                            {
                                label: getQuestContext("wormhole"),
                                value: `wormhole`
                            },
                            {
                                label: getQuestContext("quests"),
                                value: `quests`
                            },
                            {
                                label: getQuestContext("giveaway"),
                                value: `giveaway`
                            },
                            {
                                label: getQuestContext("marketplace"),
                                value: `marketplace`
                            },
                            {
                                label: getQuestContext("itemsOpened"),
                                value: `itemsOpened`
                            },
                            {
                                label: getQuestContext("wormholesSpawned"),
                                value: `wormholesSpawned`
                            },
                            {
                                label: getQuestContext("itemsReceived"),
                                value: `itemsReceived`
                            },
                            {
                                label: getQuestContext("itemsCrafted"),
                                value: `itemsCrafted`
                            },
                            {
                                label: getQuestContext("itemsUsed"),
                                value: `itemsUsed`
                            },
                            {
                                label: getQuestContext("itemsBoughtInShop"),
                                value: `itemsBoughtInShop`
                            },
                            {
                                label: getQuestContext("itemsBoughtOnMarket"),
                                value: `itemsBoughtOnMarket`
                            },
                            {
                                label: getQuestContext("itemsSold"),
                                value: `itemsSold`
                            },
                            {
                                label: getQuestContext("level"),
                                value: `level`
                            },
                            {
                                label: getQuestContext("exp"),
                                value: `exp`
                            }
                        ]).setPlaceholder(`${client.language({ textId: `Выбери задачу`, guildId: interaction.guildId, locale: interaction.locale })}`)
                    ])
                    const row1 = new ActionRowBuilder().addComponents([
                        new StringSelectMenuBuilder().setCustomId(`submit target ${interaction.id} 2`).setOptions([
                            {
                                label: getQuestContext("drop"),
                                value: `drop`
                            },
                            {
                                label: getQuestContext("transfer"),
                                value: `transfer`
                            },
                            {
                                label: getQuestContext("seasonLevel"),
                                value: `seasonLevel`
                            },
                            {
                                label: getQuestContext("seasonXp"),
                                value: `seasonXp`
                            },
                            {
                                label: getQuestContext("UsedPromocode"),
                                value: `UsedPromocode`
                            },
                            {
                                label: getQuestContext("giveToNPC"),
                                value: `giveToNPC`
                            }
                        ]).setPlaceholder(`${client.language({ textId: `Выбери задачу`, guildId: interaction.guildId, locale: interaction.locale })}`)
                    ])
                    if (usersWithThisQuest) await buttonInteraction.update({ content: `${client.language({ textId: `Выбери задачу`, guildId: buttonInteraction.guildId, locale: buttonInteraction.locale })}:`, components: [row, row1], flags: ["Ephemeral"] })
                    else {
                        if (!interaction.replied && !interaction.deferred) await interaction.deferUpdate()
                        await interaction.followUp({ content: `${client.language({ textId: `Выбери задачу`, guildId: interaction.guildId, locale: interaction.locale })}:`, components: [row, row1], flags: ["Ephemeral"] })
                    }
                    const filter = (i) => i.customId.includes(`submit target ${interaction.id}`) && i.user.id === interaction.user.id
                    const selectMenuInteraction = await interaction.channel.awaitMessageComponent({ filter, time: 60000 }).catch(e => null)
                    if (selectMenuInteraction) {
                        const type = selectMenuInteraction.values[0]
                        const components = []
                        components.push(
                            new LabelBuilder()
                                .setLabel(client.language({ textId: `Количество для выполнения задачи (число N)`, guildId: selectMenuInteraction.guildId, locale: selectMenuInteraction.locale }))
                                .setTextInputComponent(
                                    new TextInputBuilder()
                                        .setCustomId("amount")
                                        .setMaxLength(7)
                                        .setRequired(true)
                                        .setStyle(TextInputStyle.Short)
                                        .setPlaceholder(`${client.language({ textId: `Введите число N`, guildId: selectMenuInteraction.guildId, locale: selectMenuInteraction.locale })}`)
                                ),
                            new LabelBuilder()
                                .setLabel(client.language({ textId: `Замена описания задачи`, guildId: selectMenuInteraction.guildId, locale: selectMenuInteraction.locale }))
                                .setTextInputComponent(
                                    new TextInputBuilder()
                                        .setCustomId("description")
                                        .setMaxLength(200)
                                        .setRequired(false)
                                        .setStyle(TextInputStyle.Short)
                                ),
                            new LabelBuilder()
                                .setLabel(client.language({ textId: `Показывать прогресс-бар?`, guildId: selectMenuInteraction.guildId, locale: selectMenuInteraction.locale }))
                                .setStringSelectMenuComponent(
                                    new StringSelectMenuBuilder()
                                        .setCustomId("showProgressBar")
                                        .setOptions([
                                            {
                                                label: client.language({ textId: `Да`, guildId: selectMenuInteraction.guildId, locale: selectMenuInteraction.locale }),
                                                value: "true",
                                                default: true
                                            },
                                            {
                                                label: client.language({ textId: `Нет`, guildId: selectMenuInteraction.guildId, locale: selectMenuInteraction.locale }),
                                                value: "false",
                                                default: false
                                            }
                                        ])
                                        .setRequired(true)
                                ),
                            new LabelBuilder()
                                .setLabel(client.language({ textId: `Задача опциональная?`, guildId: selectMenuInteraction.guildId, locale: selectMenuInteraction.locale }))
                                .setStringSelectMenuComponent(
                                    new StringSelectMenuBuilder()
                                        .setCustomId("isOptional")
                                        .setOptions([
                                            {
                                                label: client.language({ textId: `Да`, guildId: selectMenuInteraction.guildId, locale: selectMenuInteraction.locale }),
                                                value: "true",
                                                default: false
                                            },
                                            {
                                                label: client.language({ textId: `Нет`, guildId: selectMenuInteraction.guildId, locale: selectMenuInteraction.locale }),
                                                value: "false",
                                                default: true
                                            }
                                        ])
                                        .setRequired(true)
                                )
                        )
                        if (type === "message" || type === "like" || type === "fishing" || type === "mining" || type === "wormhole" || type === "quests" || type === "marketplace" || type === "itemsOpened" || type === "wormholesSpawned" || type === "itemsReceived" || type === "itemsCrafted" || type === "itemsUsed" || type === "itemsBoughtInShop" || type === "itemsBoughtOnMarket" || type === "itemsSold" || type === "drop" || type === "transfer" || type === "UsedPromocode" || type === "giveToNPC") {
                            const label = new LabelBuilder()
                                .setLabel(client.language({ textId: `Объект задачи (не обязательно)`, guildId: selectMenuInteraction.guildId, locale: selectMenuInteraction.locale }))
                            if (type === "message") {
                                label.setChannelSelectMenuComponent(
                                    new ChannelSelectMenuBuilder()
                                        .setCustomId("object")
                                        .setRequired(false)
                                )
                            } else if (type === "like") {
                                label.setUserSelectMenuComponent(
                                    new UserSelectMenuBuilder()
                                        .setCustomId("object")
                                        .setRequired(false)
                                )
                            } else label.setTextInputComponent(
                                new TextInputBuilder()
                                    .setCustomId("object").setStyle(TextInputStyle.Short)
                                    .setRequired(false)
                                    .setPlaceholder(`${client.language({ textId: type === "quests" ? `${client.language({ textId: `Название квеста`, guildId: interaction.guildId, locale: interaction.locale })}` :  type === "fishing" || type === "mining" || type === "marketplace" || type === "itemsOpened" || type === "itemsReceived" || type === "itemsCrafted" || type === "itemsUsed" || type === "itemsBoughtInShop" || type === "itemsBoughtOnMarket" || type === "itemsSold" || type === "drop" || type === "transfer" || type === "giveToNPC" ? `${client.language({ textId: `Название предмета`, guildId: interaction.guildId, locale: interaction.locale })}` : type === "wormholesSpawned" ? `${client.language({ textId: `Название червоточины`, guildId: interaction.guildId, locale: interaction.locale })}` : type === "UsedPromocode" ? `${client.language({ textId: `Код промокода`, guildId: interaction.guildId, locale: interaction.locale })}` : ``, guildId: selectMenuInteraction.guildId, locale: selectMenuInteraction.locale })}`)
                            )
                            components.push(label)
                        }
                        const modal = new ModalBuilder()
                            .setCustomId(`addTarget_${type}`)
                            .setTitle(getQuestContext(type))
                            .setLabelComponents(components)
                        await selectMenuInteraction.showModal(modal);delete client.globalCooldown[`${selectMenuInteraction.guildId}_${selectMenuInteraction.user.id}`]
                        const filter = (i) => i.customId === `addTarget_${type}` && i.user.id === interaction.user.id
                        const modalInteraction = await interaction.awaitModalSubmit({ filter, time: 180000 }).catch(e => null)
                        if (modalInteraction && modalInteraction.type === InteractionType.ModalSubmit) {
                            const modalArgs = {}
                            modalInteraction.fields.fields.each(field => modalArgs[field.customId] = field.value)
                            const showProgressBar = modalInteraction.fields.getStringSelectValues("showProgressBar")[0] === "true" ? true : false
                            const isOptional = modalInteraction.fields.getStringSelectValues("isOptional")[0]  === "true" ? true : false
                            modalArgs.object = type === "message" ? modalInteraction.fields.getSelectedChannels("object")?.first()?.id : type === "like" ? modalInteraction.fields.getSelectedUsers("object")?.first()?.id : modalArgs.object
                            if (isNaN(+modalArgs.amount) || !Number.isInteger(+modalArgs.amount)) {
                                await modalInteraction.update({ content: `${client.config.emojis.NO} **${modalArgs.amount}** ${client.language({ textId: `не является целым числом`, guildId: interaction.guildId, locale: interaction.locale })}`, components: [] })
                            } else {
                                if (+modalArgs.amount > 0) {
                                    if (quest.targets.length < 5) {
                                        let object
                                        if (modalArgs.object?.length && (type === "fishing" || type === "mining" || type === "marketplace" || type === "itemsOpened" || type === "itemsReceived" || type === "itemsCrafted" || type === "itemsUsed" || type === "itemsBoughtInShop" || type === "itemsBoughtOnMarket" || type === "itemsSold" || type === "drop" || type === "transfer" || type === "giveToNPC")) {
                                            const filteredItems = client.cache.items.filter(e => e.guildID === modalInteraction.guildId && !e.temp && e.enabled && e.name.toLowerCase().includes(modalArgs.object.toLowerCase()))
                                            object = filteredItems.some(e => e.name.toLowerCase() == modalArgs.object.toLowerCase()) ? filteredItems.find(e => e.name.toLowerCase() === modalArgs.object.toLowerCase())?.itemID : filteredItems.first()?.itemID
                                        }
                                        if (modalArgs.object?.length && type === "wormholesSpawned") {
                                            const filteredWormholes = client.cache.wormholes.filter(e => e.guildID === modalInteraction.guildId && e.name.toLowerCase().includes(modalArgs.object.toLowerCase()))
                                            object = filteredWormholes.some(e => e.name.toLowerCase() === modalArgs.object.toLowerCase()) ? filteredWormholes.find(e => e.name.toLowerCase() === modalArgs.object.toLowerCase())?.wormholeID : filteredWormholes.first()?.wormholeID
                                        }
                                        if (modalArgs.object?.length && type === "quests") {
                                            const filteredQuests = client.cache.quests.filter(e => e.guildID === modalInteraction.guildId && e.name.toLowerCase().includes(modalArgs.object.toLowerCase()))
                                            object = filteredQuests.some(e => e.name.toLowerCase() === modalArgs.object.toLowerCase()) ? filteredQuests.find(e => e.name.toLowerCase() === modalArgs.object.toLowerCase())?.questID : filteredQuests.first()?.questID
                                        }
                                        quest.targets.push({
                                            targetID: uniqid.time(),
                                            amount: +modalArgs.amount,
                                            object: modalArgs.object?.length ? object || modalArgs.object : undefined,
                                            finished: false,
                                            reached: false,
                                            type: type,
                                            description: modalArgs.description.length ? modalArgs.description : undefined,
                                            showProgressBar,
                                            isOptional
                                        })
                                    }
                                }
                                await quest.save()
                                await modalInteraction.deferUpdate().catch(e => null)
                                await modalInteraction.editReply({ content: `${client.config.emojis.YES} ${client.language({ textId: `Задача добавлена`, guildId: selectMenuInteraction.guildId, locale: selectMenuInteraction.locale })}`, components: [] })    
                            }
                        } else return
                    } else return
                } else if (interaction.values[0] === "editTarget") {
                    const usersWithThisQuest = client.cache.profiles.some(profile => profile.guildID === interaction.guildId && profile.quests?.some(q => q.questID === quest.questID))
                    let buttonInteraction
                    if (usersWithThisQuest) {
                        if (!interaction.replied && !interaction.deferred) await interaction.deferUpdate()
                        await interaction.followUp({ content: `${client.language({ textId: `Для изменения задачи для этого квеста, необходимо удалить этот квест из всех профилей пользователей. Удалить?`, guildId: interaction.guildId, locale: interaction.locale })}`, components: [
                                new ActionRowBuilder().addComponents(
                                    new ButtonBuilder()
                                        .setCustomId(`confirm delete quest from profile`)
                                        .setLabel(`${client.language({ textId: `УДАЛИТЬ`, guildId: interaction.guildId, locale: interaction.locale })}`)
                                        .setStyle(ButtonStyle.Success),
                                    new ButtonBuilder()
                                        .setCustomId(`decline delete quest from profile`)
                                        .setLabel(`${client.language({ textId: `ОТМЕНА`, guildId: interaction.guildId, locale: interaction.locale })}`)
                                        .setStyle(ButtonStyle.Danger))
                            ], flags: ["Ephemeral"] })    
                        const filter = (i) => i.customId.includes(`delete quest from profile`) && i.user.id === interaction.user.id
                        buttonInteraction = await interaction.channel.awaitMessageComponent({ filter, time: 60000 }).catch(e => null)
                        if (buttonInteraction) {
                            if (buttonInteraction.customId.includes("confirm")) {
                                client.cache.profiles.filter(profile => profile.guildID === buttonInteraction.guildId && profile.quests?.some(q => q.questID === quest.questID)).forEach(profile => {
                                    profile.quests = profile.quests?.filter(q => q.questID !== quest.questID)
                                    profile.save()
                                })
                            } else return buttonInteraction.update({ content: `${client.language({ textId: `Вы отменили редактирование целей. Вернуться к [квесту]`, guildId: buttonInteraction.guildId, locale: buttonInteraction.locale })}(<${interaction.message.url}>).`, components: [] })
                        } else return
                    }
                    const options = []
                    for (const target of quest.targets) {
                        options.push({
                            label: getQuestContext(target.type),
                            value: target.targetID
                        })
                    }
                    const row = new ActionRowBuilder()
                        .addComponents([
                            new StringSelectMenuBuilder()
                                .setCustomId(`submit editTarget ${interaction.id}`)
                                .setOptions(options)
                                .setPlaceholder(`${client.language({ textId: `Выбери задачу`, guildId: interaction.guildId, locale: interaction.locale })}`)
                        ])
                    if (usersWithThisQuest) await buttonInteraction.update({ content: `${client.language({ textId: `Выбери задачу`, guildId: interaction.guildId, locale: interaction.locale })}:`, components: [row], flags: ["Ephemeral"] })
                    else {
                        await interaction.deferUpdate()
                        await interaction.followUp({ content: `${client.language({ textId: `Выбери задачу`, guildId: interaction.guildId, locale: interaction.locale })}:`, components: [row], flags: ["Ephemeral"] })
                    }
                    const filter = (i) => i.customId === `submit editTarget ${interaction.id}` && i.user.id === interaction.user.id
                    const selectMenuInteraction = await interaction.channel.awaitMessageComponent({ filter, time: 60000 }).catch(e => null)
                    if (selectMenuInteraction) {
                        const target = quest.targets.find(e => { return e.targetID === selectMenuInteraction.values[0] })
                        const components = []
                        components.push(
                            new LabelBuilder()
                                .setLabel(client.language({ textId: `Количество для выполнения задачи (число N)`, guildId: interaction.guildId, locale: interaction.locale }))
                                .setDescription(client.language({ textId: `Для удаления задачи напиши - 0`, guildId: interaction.guildId, locale: interaction.locale }))
                                .setTextInputComponent(...[
                                    new TextInputBuilder()
                                        .setCustomId("amount")
                                        .setMaxLength(7)
                                        .setRequired(false)
                                        .setStyle(TextInputStyle.Short)
                                        .setValue(`${target.amount || " "}`)
                                ]),
                            new LabelBuilder()
                                .setLabel(client.language({ textId: `Замена описания задачи`, guildId: interaction.guildId, locale: interaction.locale }))
                                .setTextInputComponent(...[
                                    new TextInputBuilder()
                                        .setCustomId("description")
                                        .setMaxLength(200)
                                        .setRequired(false)
                                        .setStyle(TextInputStyle.Short)
                                        .setValue(`${target.description || " "}`)
                                ]),
                            new LabelBuilder()
                                .setLabel(client.language({ textId: `Показывать прогресс-бар?`, guildId: interaction.guildId, locale: interaction.locale }))
                                .setStringSelectMenuComponent(
                                    new StringSelectMenuBuilder()
                                        .setCustomId("showProgressBar")
                                        .setOptions([
                                            {
                                                label: client.language({ textId: `Да`, guildId: interaction.guildId, locale: interaction.locale }),
                                                value: "true",
                                                default: target.showProgressBar
                                            },
                                            {
                                                label: client.language({ textId: `Нет`, guildId: interaction.guildId, locale: interaction.locale }),
                                                value: "false",
                                                default: !target.showProgressBar
                                            }
                                        ])
                                        .setRequired(true)
                                ),
                            new LabelBuilder()
                                .setLabel(client.language({ textId: `Задача опциональная?`, guildId: interaction.guildId, locale: interaction.locale }))
                                .setStringSelectMenuComponent(
                                    new StringSelectMenuBuilder()
                                        .setCustomId("isOptional")
                                        .setOptions([
                                            {
                                                label: client.language({ textId: `Да`, guildId: interaction.guildId, locale: interaction.locale }),
                                                value: "true",
                                                default: target.isOptional
                                            },
                                            {
                                                label: client.language({ textId: `Нет`, guildId: interaction.guildId, locale: interaction.locale }),
                                                value: "false",
                                                default: !target.isOptional
                                            }
                                        ])
                                        .setRequired(true)
                                )
                        )
                        if (target.type === "message" || target.type === "like" || target.type === "fishing" || target.type === "mining" || target.type === "wormhole" || target.type === "quests" || target.type === "marketplace" || target.type === "itemsOpened" || target.type === "wormholesSpawned" || target.type === "itemsReceived" || target.type === "itemsCrafted" || target.type === "itemsUsed" || target.type === "itemsBoughtInShop" || target.type === "itemsBoughtOnMarket" || target.type === "itemsSold" || target.type === "drop" || target.type === "transfer" || target.type === "UsedPromocode" || target.type === "giveToNPC") {
                            const label = new LabelBuilder()
                                .setLabel(client.language({ textId: `Объект задачи (не обязательно)`, guildId: selectMenuInteraction.guildId, locale: selectMenuInteraction.locale }))
                            if (target.type === "message") {
                                const channelSelectMenu =  new ChannelSelectMenuBuilder()
                                    .setCustomId("object")
                                    .setRequired(false)
                                if (target.object) channelSelectMenu.setDefaultChannels([target.object])
                                label.setChannelSelectMenuComponent(channelSelectMenu)
                            } else if (target.type === "like") {
                                const userSelectMenu = new UserSelectMenuBuilder()
                                    .setCustomId("object")
                                    .setRequired(false)
                                if (target.object) userSelectMenu.setDefaultUsers([target.object])
                                label.setUserSelectMenuComponent(userSelectMenu)
                            } else label.setTextInputComponent(
                                new TextInputBuilder()
                                    .setCustomId("object").setStyle(TextInputStyle.Short)
                                    .setRequired(false)
                                    .setPlaceholder(`${client.language({ textId: target.type === "quests" ? `${client.language({ textId: `Название квеста`, guildId: interaction.guildId, locale: interaction.locale })}` : target.type === "fishing" || target.type === "mining" || target.type === "marketplace" || target.type === "itemsOpened" || target.type === "itemsReceived" || target.type === "itemsCrafted" || target.type === "itemsUsed" || target.type === "itemsBoughtInShop" || target.type === "itemsBoughtOnMarket" || target.type === "itemsSold" || target.type === "drop" || target.type === "transfer" || target.type === "giveToNPC" ? `${client.language({ textId: `Название предмета`, guildId: interaction.guildId, locale: interaction.locale })}` : target.type === "wormholesSpawned" ? `${client.language({ textId: `Название червоточины`, guildId: interaction.guildId, locale: interaction.locale })}` : target.type === "UsedPromocode" ? `${client.language({ textId: `Код промокода`, guildId: interaction.guildId, locale: interaction.locale })}` : ``, guildId: selectMenuInteraction.guildId, locale: selectMenuInteraction.locale })}`)
                                    .setValue(`${target.object && (target.type === "fishing" || target.type === "mining" || target.type === "marketplace" || target.type === "itemsOpened" || target.type === "itemsReceived" || target.type === "itemsCrafted" || target.type === "itemsUsed" || target.type === "itemsBoughtInShop" || target.type === "itemsBoughtOnMarket" || target.type === "itemsSold" || target.type === "drop" || target.type === "transfer" || target.type === "giveToNPC") ? client.cache.items.get(target.object)?.name || " " : target.object && target.type === "quests" ? client.cache.quests.get(target.object)?.name || " " : target.object && target.type === "wormholesSpawned" ? client.cache.wormholes.get(target.object)?.name || " " : target.object ? target.object : " "}`)
                            )
                            components.push(label)
                        }
                        const modal = new ModalBuilder()
                            .setCustomId(`editTarget_${target.targetID}`)
                            .setTitle(getQuestContext(target.type, target.amount))
                            .setLabelComponents(components)
                        await selectMenuInteraction.showModal(modal);delete client.globalCooldown[`${selectMenuInteraction.guildId}_${selectMenuInteraction.user.id}`]
                        const filter = (i) => i.customId === `editTarget_${target.targetID}` && i.user.id === interaction.user.id
                        const modalInteraction = await selectMenuInteraction.awaitModalSubmit({ filter, time: 180000 }).catch(e => null)
                        if (modalInteraction && modalInteraction.type === InteractionType.ModalSubmit) {
                            const modalArgs = {}
                            modalInteraction.fields.fields.each(field => modalArgs[field.customId] = field.value)
                            const showProgressBar = modalInteraction.fields.getStringSelectValues("showProgressBar")[0] === "true" ? true : false
                            const isOptional = modalInteraction.fields.getStringSelectValues("isOptional")[0]  === "true" ? true : false
                            modalArgs.object = target.type === "message" ? modalInteraction.fields.getSelectedChannels("object")?.first()?.id : target.type === "like" ? modalInteraction.fields.getSelectedUsers("object")?.first()?.id : modalArgs.object
                            let object
                            if (modalArgs.object?.length && (target.type === "fishing" || target.type === "mining" || target.type === "marketplace" || target.type === "itemsOpened" || target.type === "itemsReceived" || target.type === "itemsCrafted" || target.type === "itemsUsed" || target.type === "itemsBoughtInShop" ||  target.type === "itemsBoughtOnMarket" || target.type === "itemsSold" || target.type === "drop" || target.type === "transfer" || target.type === "giveToNPC")) {
                                const filteredItems = client.cache.items.filter(e => e.guildID === interaction.guildId && !e.temp && e.enabled && e.name.toLowerCase().includes(modalArgs.object.toLowerCase()))
                                object = filteredItems.some(e => e.name.toLowerCase() == modalArgs.object.toLowerCase()) ? filteredItems.find(e => e.name.toLowerCase() == modalArgs.object.toLowerCase()).itemID : filteredItems.first()?.itemID
                            }
                            if (modalArgs.object?.length && target.type === "wormholesSpawned") {
                                const filteredWormholes = client.cache.wormholes.filter(e => e.guildID === modalInteraction.guildId && e.name.toLowerCase().includes(modalArgs.object.toLowerCase()))
                                object = filteredWormholes.some(e => e.name.toLowerCase() === modalArgs.object.toLowerCase()) ? filteredWormholes.find(e => e.name.toLowerCase() === modalArgs.object.toLowerCase())?.wormholeID : filteredWormholes.first()?.wormholeID
                            }
                            if (modalArgs.object?.length && target.type === "quests") {
                                const filteredQuests = client.cache.quests.filter(e => e.guildID === modalInteraction.guildId && e.name.toLowerCase().includes(modalArgs.object.toLowerCase()))
                                object = filteredQuests.some(e => e.name.toLowerCase() === modalArgs.object.toLowerCase()) ? filteredQuests.find(e => e.name.toLowerCase() === modalArgs.object.toLowerCase())?.questID : filteredQuests.first()?.questID
                            }
                            if (modalArgs.amount.length && modalArgs.amount !== 0 && !isNaN(+modalArgs.amount)) target.amount = +modalArgs.amount
                            if (modalArgs.object?.length) target.object = object || modalArgs.object
                            else target.object = undefined
                            target.showProgressBar = showProgressBar
                            target.isOptional = isOptional
                            target.description = modalArgs.description.length ? modalArgs.description : undefined
                            if (target.amount <= 0) quest.targets = quest.targets.filter(e => e.targetID !== target.targetID)
                            if (!quest.targets.filter(e => !e.isOptional).length) {
                                quest.enable = false
                            }
                            await quest.save()
                            await modalInteraction.deferUpdate().catch(e => null)
                            await modalInteraction.editReply({ content: `${client.config.emojis.YES} ${client.language({ textId: `Задача была обновлена`, guildId: interaction.guildId, locale: interaction.locale })}`, components: [] })
                        } else return
                    } else return
                } else if (interaction.values[0].includes("Permission")) {
                    if (!client.cache.permissions.some(e => e.guildID === interaction.guildId)) {
                        return interaction.reply({ content: `${client.config.emojis.NO} ${client.language({ textId: `На сервере не найдено созданных прессетов прав. Для создания прессета используй команду </manager-permissions create:1150455842294988943>.`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
                    }
                    const value = interaction.values[0]
                    const modal = new ModalBuilder()
                        .setCustomId(`manager-quests_permissions_${value}_${interaction.id}`)
                        .setTitle(`${client.language({ textId: `Установка права`, guildId: interaction.guildId, locale: interaction.locale })}`)
                        .setLabelComponents([
                            new LabelBuilder()
                                .setLabel(`${client.language({ textId: `Название права`, guildId: interaction.guildId, locale: interaction.locale })}`)
                                .setTextInputComponent(
                                    new TextInputBuilder()
                                        .setCustomId("name")
                                        .setRequired(false)
                                        .setValue(`${client.cache.permissions.find(e => e.id === quest[value])?.name || ""}`)
                                        .setStyle(TextInputStyle.Short)
                                ),
                        ])
                    await interaction.showModal(modal);delete client.globalCooldown[`${interaction.guildId}_${interaction.user.id}`]
                    const filter = (i) => i.customId === `manager-quests_permissions_${value}_${interaction.id}` && i.user.id === interaction.user.id
                    interaction = await interaction.awaitModalSubmit({ filter, time: 120000 }).catch(e => null)
                    if (interaction && interaction.type === InteractionType.ModalSubmit) {
                        const modalArgs = {}
                        interaction.fields.fields.each(field => modalArgs[field.customId] = field.value)
                        if (!modalArgs.name) {
                            quest[value] = undefined
                            await quest.save()
                        } else {
                            const permission = client.cache.permissions.find(e => e.name.toLowerCase() === modalArgs.name.toLowerCase() && e.guildID === interaction.guildId)
                            if (!permission) {
                                await interaction.deferUpdate()
                                interaction.followUp({ content: `${client.config.emojis.NO} ${client.language({ textId: `Права с названием`, guildId: interaction.guildId, locale: interaction.locale })} **${modalArgs.name}** ${client.language({ textId: `не существует`, guildId: interaction.guildId, locale: interaction.locale })}` })
                            } else {
                                quest[value] = permission.id
                                await quest.save()
                            }
                        }
                    } else return
                } else if (interaction.customId.includes("type")) {
                    if ((!quest.community && !quest.repeated && interaction.values.includes("community") && interaction.values.includes("repeated")) || (interaction.values.includes("community") && quest.repeated && !interaction.values.includes("repeated")) || (interaction.values.includes("repeated") && quest.community && !interaction.values.includes("community"))) {
                        return interaction.reply({ content: `${client.language({ textId: `Квест не может иметь тип 'Сообщество' и 'Повторный' одновременно`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
                    }
                    if ((!quest.daily && !quest.weekly && interaction.values.includes("daily") && interaction.values.includes("weekly")) || (interaction.values.includes("daily") && quest.weekly && !interaction.values.includes("weekly")) || (interaction.values.includes("weekly") && quest.daily && !interaction.values.includes("daily"))) {
                        return interaction.reply({ content: `${client.language({ textId: `Квест не может иметь тип 'Ежедневный' и 'Еженедельный' одновременно`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
                    }
                    for (const type of interaction.values) {
                        if (type === "community" && quest.community) {
                            await Promise.all(client.cache.profiles.filter(profile => profile.guildID === interaction.guildId && profile.quests?.some(q => q.questID === quest.questID)).map(async profile => {
                                const userQuest = profile.quests.find(e => { return e.questID === quest.questID })
                                userQuest.targets = quest.targets.map(target => {
                                    return {
                                        targetID: target.targetID,
                                        reached: 0,
                                        finished: false
                                    }
                                })
                                await profile.save()
                            }))
                        }
                        if (type === "community" && !quest.community) {
                            await Promise.all(client.cache.profiles.filter(profile => profile.guildID === interaction.guildId && profile.quests?.some(q => q.questID === quest.questID)).map(async profile => {
                                const userQuest = profile.quests.find(e => { return e.questID === quest.questID })
                                userQuest.targets = undefined
                                await profile.save()
                            }))
                        }
                        quest[type] = !quest[type]
                    }
                    await quest.save()
                } else if (interaction.customId.includes("actions")) {
                    if (!quest.enable) {
                        return interaction.reply({ content: `${client.config.emojis.NO}${client.language({ textId: `Квест выключен`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: [MessageFlags.Ephemeral] })
                    }
                    if (interaction.values[0] === "addMembers") {
                        let totalMembers = 0
                        if (quest.community) {
                            await Promise.all(client.cache.profiles.filter(profile => profile.guildID === interaction.guildId && !profile.quests?.some(q => q.questID === quest.questID) && (profile.quests?.length || 0) < settings.max_quests).map(async profile => {
                                if (!profile.quests) profile.quests = []
                                profile.quests.push({
                                    questID: quest.questID
                                })
                                await profile.save()
                                totalMembers++
                            }))
                        } else {
                            await Promise.all(client.cache.profiles.filter(profile => profile.guildID === interaction.guildId && !profile.quests?.some(q => q.questID === quest.questID) && (profile.quests?.length || 0) < settings.max_quests).map(async profile => {
                                if (!profile.quests) profile.quests = []
                                profile.quests.push({
                                    questID: quest.questID,
                                    targets: quest.targets.map(target => {
                                        return {
                                            targetID: target.targetID,
                                            reached: 0,
                                            finished: false,
                                        }
                                    }),
                                    finished: false
                                })
                                await profile.save()
                                totalMembers++
                            }))
                        }
                        return interaction.reply({ content: `${client.language({ textId: `Квест`, guildId: interaction.guildId, locale: interaction.locale })} ${quest.displayEmoji}**${quest.name}** ${client.language({ textId: `был добавлен`, guildId: interaction.guildId, locale: interaction.locale })} ${totalMembers} ${client.language({ textId: `пользователям`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
                    }
                    if (interaction.values[0] === "addToMember") {
                        const modal = new ModalBuilder()
                            .setCustomId(`addToMember_${interaction.id}`)
                            .setTitle(`${client.language({ textId: `Добавить квест пользователям`, guildId: interaction.guildId, locale: interaction.locale })}`)
                            .setLabelComponents([
                                new LabelBuilder()
                                    .setLabel(`${client.language({ textId: `Пользователи`, guildId: interaction.guildId, locale: interaction.locale })}`)
                                    .setUserSelectMenuComponent(
                                        new UserSelectMenuBuilder()
                                            .setCustomId("users")
                                            .setMaxValues(25)
                                            .setRequired(true)
                                    )
                            ])
                        await interaction.showModal(modal);delete client.globalCooldown[`${interaction.guildId}_${interaction.user.id}`]
                        const filter = (i) => i.customId === `addToMember_${interaction.id}` && i.user.id === interaction.user.id;
                        interaction = await interaction.awaitModalSubmit({ filter, time: 180000 }).catch(e => null)
                        if (interaction && interaction.type === InteractionType.ModalSubmit) {
                            const modalArgs = {}
                            interaction.fields.fields.each(field => modalArgs[field.customId] = field.value)
                            const users = interaction.fields.getSelectedUsers("users").map(user => user.id)
                            const addedToUsers = []
                            if (quest.community) {
                                await Promise.all(client.cache.profiles.filter(profile => profile.guildID === interaction.guildId && users.includes(profile.userID) && !profile.quests?.some(q => q.questID === quest.questID) && (profile.quests?.length || 0) < settings.max_quests).map(async profile => {
                                    if (!profile.quests) profile.quests = []
                                    profile.quests.push({
                                        questID: quest.questID
                                    })
                                    await profile.save()
                                    addedToUsers.push(profile.userID)
                                }))
                            } else {
                                await Promise.all(client.cache.profiles.filter(profile => profile.guildID === interaction.guildId && users.includes(profile.userID) && !profile.quests?.some(q => q.questID === quest.questID) && (profile.quests?.length || 0) < settings.max_quests).map(async profile => {
                                    if (!profile.quests) profile.quests = []
                                    profile.quests.push({
                                        questID: quest.questID,
                                        targets: quest.targets.map(target => {
                                            return {
                                                targetID: target.targetID,
                                                reached: 0,
                                                finished: false,
                                            }
                                        }),
                                        finished: false
                                    })
                                    await profile.save()
                                    addedToUsers.push(profile.userID)
                                }))
                            }
                            if (!addedToUsers.length) {
                                return interaction.reply({ content: `${client.language({ textId: `Квест`, guildId: interaction.guildId, locale: interaction.locale })} ${quest.displayEmoji}**${quest.name}** ${client.language({ textId: `не был вадан ни одному пользователю по нескольким возможным причинам: квест уже выдан или в профиле достигнуто максимальное количество квестов`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
                            }
                            return interaction.reply({ content: `${client.language({ textId: `Квест`, guildId: interaction.guildId, locale: interaction.locale })} ${quest.displayEmoji}**${quest.name}** ${client.language({ textId: `был добавлен`, guildId: interaction.guildId, locale: interaction.locale })} ${client.language({ textId: `пользователям`, guildId: interaction.guildId, locale: interaction.locale })} ${addedToUsers.map(e => `<@${e}>`).join(", ")}`, flags: ["Ephemeral"] })
                        }
                        
                    }
                    if (interaction.values[0] === "delMembers") {
                        let totalMembers = 0
                        await Promise.all(client.cache.profiles.filter(profile => profile.guildID === interaction.guildId && profile.quests?.some(q => q.questID === quest.questID)).map(async profile => {
                            profile.quests = profile.quests?.filter(q => q.questID !== quest.questID)
                            if (!profile.quests.length) profile.quests = undefined
                            await profile.save()
                            totalMembers++
                        }))
                        return interaction.reply({ content: `${client.language({ textId: `Квест`, guildId: interaction.guildId, locale: interaction.locale })} ${quest.displayEmoji}**${quest.name}** ${client.language({ textId: `был удален`, guildId: interaction.guildId, locale: interaction.locale })} ${client.language({ textId: `у`, guildId: interaction.guildId, locale: interaction.locale })} ${totalMembers} ${client.language({ textId: `пользователей`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
                    }
                    if (interaction.values[0] === "delFromMember") {
                        const modal = new ModalBuilder()
                            .setCustomId(`delFromMember_${interaction.id}`)
                            .setTitle(`${client.language({ textId: `Удалить квест у пользователей`, guildId: interaction.guildId, locale: interaction.locale })}`)
                            .setLabelComponents([
                                new LabelBuilder()
                                    .setLabel(`${client.language({ textId: `Пользователи`, guildId: interaction.guildId, locale: interaction.locale })}`)
                                    .setUserSelectMenuComponent(
                                        new UserSelectMenuBuilder()
                                            .setCustomId("users")
                                            .setMaxValues(25)
                                            .setRequired(true)
                                    )
                            ])
                        await interaction.showModal(modal);delete client.globalCooldown[`${interaction.guildId}_${interaction.user.id}`]
                        const filter = (i) => i.customId === `delFromMember_${interaction.id}` && i.user.id === interaction.user.id;
                        interaction = await interaction.awaitModalSubmit({ filter, time: 180000 }).catch(e => null)
                        if (interaction && interaction.type === InteractionType.ModalSubmit) {
                            const modalArgs = {}
                            interaction.fields.fields.each(field => modalArgs[field.customId] = field.value)
                            const users = interaction.fields.getSelectedUsers("users").map(user => user.id)
                            const deletedFromUsers = []
                            await Promise.all(client.cache.profiles.filter(profile => profile.guildID === interaction.guildId && users.includes(profile.userID) && profile.quests?.some(q => q.questID === quest.questID)).map(async profile => {
                                profile.quests = profile.quests?.filter(q => q.questID !== quest.questID)
                                if (!profile.quests.length) profile.quests = undefined
                                await profile.save()
                                deletedFromUsers.push(profile.userID)
                            }))
                            if (!deletedFromUsers.length) {
                                return interaction.reply({ content: `${client.language({ textId: `Квест`, guildId: interaction.guildId, locale: interaction.locale })} ${quest.displayEmoji}**${quest.name}** ${client.language({ textId: `не был удален ни у одного из пользователей по возможной причине отсутствия квеста`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
                            }
                            return interaction.reply({ content: `${client.language({ textId: `Квест`, guildId: interaction.guildId, locale: interaction.locale })} ${quest.displayEmoji}**${quest.name}** ${client.language({ textId: `был удален`, guildId: interaction.guildId, locale: interaction.locale })} ${client.language({ textId: `у пользователей`, guildId: interaction.guildId, locale: interaction.locale })} ${deletedFromUsers.map(e => `<@${e}>`).join(", ")}`, flags: ["Ephemeral"] })
                        }
                    }
                    if (interaction.values[0] === "clearProgress_members") {
                        let totalMembers = 0
                        if (quest.community) {
                            await Promise.all(client.cache.profiles.filter(profile => profile.guildID === interaction.guildId && profile.quests?.some(q => q.questID === quest.questID)).map(async profile => {
                                const q = profile.quests?.find(e => { return e.questID === quest.questID})
                                q.finished = false
                                await profile.save()
                                totalMembers++
                            }))
                            const quests = client.cache.quests.filter(quest => quest.guildID === interaction.guildId && quest.questID === quest.questID && quest.targets.some(target => target.reached) && quest.targets.some(target => target.finished))
                            await Promise.all(quests.map(async quest => {
                                quest.targets.forEach(target => {
                                    target.reached = 0
                                    target.finished = false
                                })
                                await quest.save()
                            }))
                        } else {
                            await Promise.all(client.cache.profiles.filter(profile => profile.guildID === interaction.guildId && profile.quests && profile.quests.some(q => q.questID === quest.questID && q.targets?.some(t => t.reached))).map(async profile => {
                                const q = profile.quests?.find(e => { return e.questID === quest.questID})
                                q.targets.forEach(t => {
                                    t.reached = 0
                                    t.finished = false
                                })
                                q.finished = false
                                q.finishedDate = undefined
                                await profile.save()
                                totalMembers++
                            }))
                        }
                        return interaction.reply({ content: `${client.language({ textId: `Прогресс квеста`, guildId: interaction.guildId, locale: interaction.locale })} ${quest.displayEmoji}**${quest.name}** ${client.language({ textId: `был очищен у`, guildId: interaction.guildId, locale: interaction.locale })} ${totalMembers} ${client.language({ textId: `пользователей`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
                    }
                    if (interaction.values[0] === "clearProgress_member") {
                        const modal = new ModalBuilder()
                            .setCustomId(`clearProgress_member_${interaction.id}`)
                            .setTitle(`${client.language({ textId: `Очистить прогресс квеста у пользователей`, guildId: interaction.guildId, locale: interaction.locale })}`)
                            .setLabelComponents([
                                new LabelBuilder()
                                    .setLabel(`${client.language({ textId: `Пользователи`, guildId: interaction.guildId, locale: interaction.locale })}`)
                                    .setUserSelectMenuComponent(
                                        new UserSelectMenuBuilder()
                                            .setCustomId("users")
                                            .setMaxValues(25)
                                            .setRequired(true)
                                    )
                            ])
                        await interaction.showModal(modal);delete client.globalCooldown[`${interaction.guildId}_${interaction.user.id}`]
                        const filter = (i) => i.customId === `clearProgress_member_${interaction.id}` && i.user.id === interaction.user.id;
                        interaction = await interaction.awaitModalSubmit({ filter, time: 180000 }).catch(e => null)
                        if (interaction && interaction.type === InteractionType.ModalSubmit) {
                            const modalArgs = {}
                            interaction.fields.fields.each(field => modalArgs[field.customId] = field.value)
                            const users = interaction.fields.getSelectedUsers("users").map(user => user.id)
                            if (quest.community) {
                                await Promise.all(client.cache.profiles.filter(profile => profile.guildID === interaction.guildId && users.includes(profile.userID) && profile.quests?.some(q => q.questID === quest.questID)).map(async profile => {
                                    const q = profile.quests?.find(e => { return e.questID === quest.questID})
                                    q.finished = false
                                    await profile.save()
                                    totalMembers++
                                }))
                                const quests = client.cache.quests.filter(quest => quest.guildID === interaction.guildId && quest.questID === quest.questID && quest.targets.some(target => target.reached) && quest.targets.some(target => target.finished))
                                await Promise.all(quests.map(async quest => {
                                    quest.targets.forEach(target => {
                                        target.reached = 0
                                        target.finished = false
                                    })
                                    await quest.save()
                                }))
                            } else {
                                await Promise.all(client.cache.profiles.filter(profile => profile.guildID === interaction.guildId && users.includes(profile.userID) && profile.quests && profile.quests.some(q => q.questID === quest.questID && q.targets?.some(t => t.reached))).map(async profile => {
                                    const q = profile.quests?.find(e => { return e.questID === quest.questID})
                                    q.targets.forEach(t => {
                                        t.reached = 0
                                        t.finished = false
                                    })
                                    q.finished = false
                                    q.finishedDate = undefined
                                    await profile.save()
                                }))
                            }
                        }
                        return interaction.reply({ content: `${client.language({ textId: `Прогресс квеста`, guildId: interaction.guildId, locale: interaction.locale })} ${quest.displayEmoji}**${quest.name}** ${client.language({ textId: `был очищен у пользователей`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
                    }
                } else if (interaction.values[0].includes("nextQuests")) {
                    const modal = new ModalBuilder()
                        .setCustomId(`manager-quests_nextQuests_${interaction.id}`)
                        .setTitle(`${client.language({ textId: `Следующие квесты`, guildId: interaction.guildId, locale: interaction.locale })}`)
                        .setLabelComponents([
                            new LabelBuilder()
                                .setLabel(`${client.language({ textId: `Первый квест`, guildId: interaction.guildId, locale: interaction.locale })}`)
                                .setTextInputComponent(
                                    new TextInputBuilder()
                                        .setCustomId("quest1")
                                        .setRequired(false)
                                        .setValue(`${quest.nextQuests[0] ? client.cache.quests.get(quest.nextQuests[0])?.name || "" : ""}`)
                                        .setStyle(TextInputStyle.Short)
                                ),
                            new LabelBuilder()
                                .setLabel(`${client.language({ textId: `Второй квест`, guildId: interaction.guildId, locale: interaction.locale })}`)
                                .setTextInputComponent(
                                    new TextInputBuilder()
                                        .setCustomId("quest2")
                                        .setRequired(false)
                                        .setValue(`${quest.nextQuests[1] ? client.cache.quests.get(quest.nextQuests[1])?.name || "" : ""}`)
                                        .setStyle(TextInputStyle.Short)
                                ),
                            new LabelBuilder()
                                .setLabel(`${client.language({ textId: `Третий квест`, guildId: interaction.guildId, locale: interaction.locale })}`)
                                .setTextInputComponent(
                                    new TextInputBuilder()
                                        .setCustomId("quest3")
                                        .setRequired(false)
                                        .setValue(`${quest.nextQuests[2] ? client.cache.quests.get(quest.nextQuests[2])?.name || "" : ""}`)
                                        .setStyle(TextInputStyle.Short)
                                )
                        ])
                    await interaction.showModal(modal);delete client.globalCooldown[`${interaction.guildId}_${interaction.user.id}`]
                    const filter = (i) => i.customId === `manager-quests_nextQuests_${interaction.id}` && i.user.id === interaction.user.id;
                    interaction = await interaction.awaitModalSubmit({ filter, time: 120000 }).catch(e => null)
                    if (interaction && interaction.type === InteractionType.ModalSubmit) {
                        const modalArgs = {}
                        interaction.fields.fields.each(field => modalArgs[field.customId] = field.value)
                        quest.nextQuests = []
                        if (modalArgs.quest1.length) {
                            const nextQuest = client.cache.quests.find(e => e.guildID === interaction.guildId && e.name.toLowerCase() === modalArgs.quest1.toLowerCase())
                            if (nextQuest) quest.nextQuests.push(nextQuest.questID)
                        }
                        if (modalArgs.quest2.length) {
                            const nextQuest = client.cache.quests.find(e => e.guildID === interaction.guildId && e.name.toLowerCase() === modalArgs.quest2.toLowerCase())
                            if (nextQuest) quest.nextQuests.push(nextQuest.questID)
                        }
                        if (modalArgs.quest3.length) {
                            const nextQuest = client.cache.quests.find(e => e.guildID === interaction.guildId && e.name.toLowerCase() === modalArgs.quest3.toLowerCase())
                            if (nextQuest) quest.nextQuests.push(nextQuest.questID)
                        }
                        await quest.save()
                    } else return
                } else if (interaction.values[0].includes("delReward")) {
                    if (!quest.rewards.length) {
                        return interaction.reply({ content: `${client.config.emojis.NO}${client.language({ textId: `Отсутствуют награды`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: [MessageFlags.Ephemeral] })
                    }
                    const modal = new ModalBuilder()
                        .setCustomId(`manager-quests_delReward_${interaction.id}`)
                        .setTitle(`${client.language({ textId: `Удалить награды`, guildId: interaction.guildId, locale: interaction.locale })}`)
                        .setLabelComponents([
                            new LabelBuilder()
                                .setLabel(`${client.language({ textId: `Награды`, guildId: interaction.guildId, locale: interaction.locale })}`)
                                .setStringSelectMenuComponent(
                                    new StringSelectMenuBuilder()
                                        .setCustomId(`rewards`)
                                        .setMaxValues(quest.rewards.length)
                                        .setRequired(true)
                                        .setOptions(quest.rewards.map((reward, index) => {
                                            let label
                                            let emoji
                                            let value
                                            if (reward.type === RewardType.Currency) {
                                                label = `${settings.currencyName} (${reward.amount.toLocaleString()})`
                                                emoji = settings.displayCurrencyEmoji
                                                value = `${index}`
                                            }
                                            else if (reward.type === RewardType.Experience) {
                                                label = `${client.language({ textId: "Опыт", guildId: interaction.guildId, locale: interaction.locale })} (${reward.amount.toLocaleString()})`
                                                emoji = client.config.emojis.XP
                                                value = `${index}`
                                            }
                                            else if (reward.type === RewardType.Reputation) {
                                                label = `${client.language({ textId: "Репутация", guildId: interaction.guildId, locale: interaction.locale })} (${reward.amount.toLocaleString()})`
                                                emoji = client.config.emojis.RP
                                                value = `${index}`
                                            }
                                            else if (reward.type === RewardType.Item) {
                                                const item = client.cache.items.find(e => e.itemID === element.id && e.enabled && !e.temp)
                                                if (item) {
                                                    label = `${item.name} (${reward.amount.toLocaleString()})`
                                                    emoji = item.displayEmoji
                                                } else {
                                                    label = `${element.id} (${reward.amount.toLocaleString()})`
                                                    emoji = client.config.emojis.unknown
                                                }
                                                value = `${index}`
                                            } else if (reward.type === RewardType.Role) {
                                                const role = interaction.guild.roles.cache.get(reward.id)
                                                label = `${role?.name || reward.id}${reward.ms ? ` [${client.functions.transformSecs(client, reward.ms, interaction.guildId, interaction.locale)}]` : ``} (${reward.amount.toLocaleString()})`
                                                emoji = client.config.emojis.roles
                                                value = `${index}`
                                            } else if (reward.type ===  RewardType.Achievement) {
                                                const achievement = client.cache.achievements.get(reward.id)
                                                label = `${achievement?.name || reward.id}`
                                                emoji = achievement?.displayEmoji || client.config.emojis.unknown
                                                value = `${index}`
                                            }
                                            return {
                                                label,
                                                emoji,
                                                value
                                            }
                                        }))
                                )
                        ])
                    await interaction.showModal(modal);delete client.globalCooldown[`${interaction.guildId}_${interaction.user.id}`]
                    const filter = (i) => i.customId === `manager-quests_delReward_${interaction.id}` && i.user.id === interaction.user.id;
                    interaction = await interaction.awaitModalSubmit({ filter, time: 120000 }).catch(e => null)
                    if (interaction && interaction.type === InteractionType.ModalSubmit) {
                        const modalArgs = {}
                        interaction.fields.fields.each(field => modalArgs[field.customId] = field.value)
                        const indexesToRemove = interaction.fields.getStringSelectValues("rewards").map(e => +e)
                        const removeSet = new Set(indexesToRemove)
                        quest.rewards = quest.rewards.filter((_, index) => !removeSet.has(index))
                        await quest.save()
                    } else return
                } else if (interaction.values[0].includes("delTarget")) {
                    if (!quest.targets.length) {
                        return interaction.reply({ content: `${client.config.emojis.NO}${client.language({ textId: `Отсутствуют задачи`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: [MessageFlags.Ephemeral] })
                    }
                    const usersWithThisQuest = client.cache.profiles.some(profile => profile.guildID === interaction.guildId && profile.quests?.some(q => q.questID === quest.questID))
                    let buttonInteraction
                    if (usersWithThisQuest) {
                        await interaction.deferUpdate()
                        await interaction.followUp({ content: `${client.language({ textId: `Для удаления задачи для этого квеста, необходимо удалить этот квест из всех профилей пользователей. Удалить?`, guildId: interaction.guildId, locale: interaction.locale })}`, components: [
                                new ActionRowBuilder().addComponents(
                                    new ButtonBuilder()
                                        .setCustomId(`confirm delete quest from profile`)
                                        .setLabel(`${client.language({ textId: `УДАЛИТЬ`, guildId: interaction.guildId, locale: interaction.locale })}`)
                                        .setStyle(ButtonStyle.Success),
                                    new ButtonBuilder()
                                        .setCustomId(`decline delete quest from profile`)
                                        .setLabel(`${client.language({ textId: `ОТМЕНА`, guildId: interaction.guildId, locale: interaction.locale })}`)
                                        .setStyle(ButtonStyle.Danger))
                            ], flags: ["Ephemeral"] })
                        const filter = (i) => i.customId.includes(`delete quest from profile`) && i.user.id === interaction.user.id;
                        buttonInteraction = await interaction.channel.awaitMessageComponent({ filter, time: 60000 }).catch(e => null)
                        if (buttonInteraction) {
                            if (buttonInteraction.customId.includes("confirm")) {
                                client.cache.profiles.filter(profile => profile.guildID === buttonInteraction.guildId && profile.quests?.some(q => q.questID === quest.questID)).forEach(profile => {
                                    profile.quests = profile.quests?.filter(q => q.questID !== quest.questID)
                                    profile.save()
                                })
                            } else return buttonInteraction.update({ content: `${client.language({ textId: `Вы отменили удаление задач. Вернуться к [квесту]`, guildId: buttonInteraction.guildId, locale: buttonInteraction.locale })}(<${interaction.message.url}>).`, components: [] })
                        } else return
                    }
                    const modal = new ModalBuilder()
                        .setCustomId(`manager-quests_delTarget_${interaction.id}`)
                        .setTitle(`${client.language({ textId: `Удалить задачи`, guildId: interaction.guildId, locale: interaction.locale })}`)
                        .setLabelComponents([
                            new LabelBuilder()
                                .setLabel(`${client.language({ textId: `Задачи`, guildId: interaction.guildId, locale: interaction.locale })}`)
                                .setStringSelectMenuComponent(
                                    new StringSelectMenuBuilder()
                                        .setCustomId(`targets`)
                                        .setMaxValues(quest.targets.length)
                                        .setRequired(true)
                                        .setOptions(quest.targets.map((target, index) => {
                                            return {
                                                label: quest.getDescription(target, interaction.locale).slice(0, 45),
                                                value: `${index}`
                                            }
                                        }))
                                )
                        ])
                    if (usersWithThisQuest) {
                        await buttonInteraction.showModal(modal);delete client.globalCooldown[`${interaction.guildId}_${interaction.user.id}`] 
                    }
                    else await interaction.showModal(modal);delete client.globalCooldown[`${interaction.guildId}_${interaction.user.id}`]
                    filter = (i) => i.customId === `manager-quests_delTarget_${interaction.id}` && i.user.id === interaction.user.id;
                    let modalSubmitInteraction
                    if (usersWithThisQuest) {
                        modalSubmitInteraction = await buttonInteraction.awaitModalSubmit({ filter, time: 120000 }).catch(e => null)
                    } else modalSubmitInteraction = await interaction.awaitModalSubmit({ filter, time: 120000 }).catch(e => null)
                    if (modalSubmitInteraction && modalSubmitInteraction.type === InteractionType.ModalSubmit) {
                        const modalArgs = {}
                        modalSubmitInteraction.fields.fields.each(field => modalArgs[field.customId] = field.value)
                        const indexesToRemove = modalSubmitInteraction.fields.getStringSelectValues("targets").map(e => +e)
                        const removeSet = new Set(indexesToRemove)
                        quest.targets = quest.targets.filter((_, index) => !removeSet.has(index))
                        if (!quest.targets.filter(e => !e.isOptional).length) {
                            quest.enable = false
                        }
                        await quest.save()
                        if (usersWithThisQuest) {
                            await modalSubmitInteraction.update({ content: `${client.config.emojis.YES}${client.language({ textId: `Задачи удалены`, guildId: interaction.guildId, locale: interaction.locale })}`, components: [] })
                        } else {
                            await modalSubmitInteraction.deferUpdate()
                            await modalSubmitInteraction.followUp({ content: `${client.config.emojis.YES}${client.language({ textId: `Задачи удалены`, guildId: interaction.guildId, locale: interaction.locale })}`, components: [], flags: [MessageFlags.Ephemeral] })
                        }
                    } else return
                } else if (interaction.values[0].includes("optionalTargetReward")) {
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
                                            .setEmoji(client.config.emojis.coin)
                                            .setStyle(ButtonStyle.Secondary),
                                        new ButtonBuilder()
                                            .setCustomId("add_xp")
                                            .setLabel(`${client.language({ textId: `Опыт`, guildId: interaction.guildId, locale: interaction.locale })}`)
                                            .setEmoji(client.config.emojis.XP)
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
                                    [
                                        new ButtonBuilder()
                                            .setCustomId("add_achievement")
                                            .setLabel(client.language({ textId: `Достижение`, guildId: interaction.guildId, locale: interaction.locale }))
                                            .setEmoji(client.config.emojis.achievements)
                                            .setStyle(ButtonStyle.Secondary)
                                    ]
                                ),
                            new ActionRowBuilder()
                                .addComponents(
                                    new ButtonBuilder()
                                        .setCustomId("cancel")
                                        .setLabel(client.language({ textId: `ОТМЕНА`, guildId: interaction.guildId, locale: interaction.locale }))
                                        .setStyle(ButtonStyle.Danger),
                                ),
                        ],
                        flags: ["Ephemeral"]
                    })
                    const filter = (i) => i.customId.includes(`add`) || i.customId === "cancel" && i.user.id === interaction.user.id;
                    let interaction2 = await interaction.channel.awaitMessageComponent({ filter, time: 30000 }).catch(e => null)
                    if (interaction2 && interaction2.customId.includes("add")) {
                        let id = undefined
                        let type
                        let ms
                        const modalComponents = [
                            !interaction2.customId.includes("achievement") ? new LabelBuilder()
                                .setLabel(`${client.language({ textId: `Количество`, guildId: interaction.guildId, locale: interaction.locale })}`)
                                .setTextInputComponent(
                                    new TextInputBuilder()
                                        .setCustomId("amount")
                                        .setRequired(true)
                                        .setStyle(TextInputStyle.Short)
                                ) : undefined,
                            interaction2.customId.includes("role") ?
                            new LabelBuilder()
                                .setLabel(`${client.language({ textId: `Временная (минуты)`, guildId: interaction.guildId, locale: interaction.locale })}`)
                                .setTextInputComponent(
                                    new TextInputBuilder()
                                        .setCustomId("minutes")
                                        .setRequired(false)
                                        .setStyle(TextInputStyle.Short)
                                )
                            : undefined
                        ].filter(e => e)
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
                        if (interaction2.customId.includes("achievement")) {
                            type = RewardType.Achievement
                            modalComponents.unshift(
                                new LabelBuilder()
                                    .setLabel(`${client.language({ textId: `Название достижения`, guildId: interaction.guildId, locale: interaction.locale })}`)
                                    .setTextInputComponent(
                                        new TextInputBuilder()
                                            .setCustomId("achievement")
                                            .setRequired(true)
                                            .setStyle(TextInputStyle.Short)
                                    )
                            )
                        }
                        if (interaction2.customId.includes("role")) {
                            type = RewardType.Role
                            modalComponents.unshift(
                                new LabelBuilder()
                                    .setLabel(`${client.language({ textId: `Название роли`, guildId: interaction.guildId, locale: interaction.locale })}`)
                                    .setRoleSelectMenuComponent(
                                        new RoleSelectMenuBuilder()
                                            .setCustomId("role")
                                            .setRequired(true)
                                    )
                            )
                        }
                        modalComponents.unshift(
                            new LabelBuilder()
                                .setLabel(`${client.language({ textId: `Выбери опциональную задачу`, guildId: interaction.guildId, locale: interaction.locale })}`)
                                .setStringSelectMenuComponent(
                                    new StringSelectMenuBuilder()
                                        .setCustomId("target")
                                        .setRequired(true)
                                        .setOptions(quest.targets.filter(e => e.isOptional).map(target => {
                                            return {
                                                label: quest.getDescription(target, interaction.locale).slice(0, 45),
                                                value: target.targetID
                                            }
                                        }))
                                )
                        )
                        if (interaction2.customId.includes("currency")) type = RewardType.Currency
                        if (interaction2.customId.includes("xp")) type = RewardType.Experience
                        if (interaction2.customId.includes("rp")) type = RewardType.Reputation
                        const modal = new ModalBuilder()
                            .setCustomId(`manager-quests_addOptionalRewardAmount_${interaction2.id}`)
                            .setTitle(`${client.language({ textId: `Добавить награду`, guildId: interaction.guildId, locale: interaction.locale })}`)
                            .setLabelComponents(modalComponents)
                        await interaction2.showModal(modal);delete client.globalCooldown[`${interaction.guildId}_${interaction.user.id}`]
                        const filter = (i) => i.customId === `manager-quests_addOptionalRewardAmount_${interaction2.id}` && i.user.id === interaction.user.id;
                        interaction2 = await interaction2.awaitModalSubmit({ filter, time: 60000 }).catch(e => interaction2)
                        if (interaction2 && interaction2.isModalSubmit()) {
                            const modalArgs = {}
                            interaction2.fields.fields.each(field => modalArgs[field.customId] = field.value)
                            const targetID = interaction2.fields.getStringSelectValues("target")[0]
                            if (type === RewardType.Item) {
                                const filteredItems = client.cache.items.filter(e => e.guildID === interaction.guildId && !e.temp && e.name.toLowerCase().includes(modalArgs.item.toLowerCase()))
                                if (filteredItems.size > 1 && !filteredItems.some(e =>  e.name.toLowerCase() === modalArgs.item.toLowerCase())) {
                                    let result = ""
                                    filteredItems.forEach(item => {
                                        result += `> ${item.displayEmoji}**${item.name}**\n`	
                                    })
                                    pass = false
                                    interaction2.update({ content: `${client.config.emojis.block} ${client.language({ textId: `По вашему запросу было найдено несколько предметов`, guildId: interaction.guildId, locale: interaction.locale })}:\n${result}`.slice(0, 2000), components: [], flags: ["Ephemeral"] })
                                    return interaction.editReply({ components: components })
                                } else {
                                    const searchedItem = filteredItems.some(e => e.name.toLowerCase() === modalArgs.item.toLowerCase()) ? filteredItems.find(e => e.name.toLowerCase() === modalArgs.item.toLowerCase()) : filteredItems.first()
                                    if (!searchedItem) {
                                        pass = false
                                        await interaction2.update({ content: `${client.config.emojis.NO}${client.language({ textId: `Предмет`, guildId: interaction.guildId, locale: interaction.locale })} **${modalArgs.item}** ${client.language({ textId: `не найден`, guildId: interaction.guildId, locale: interaction.locale })}`, components: [], flags: ["Ephemeral"] })
                                        return interaction.editReply({ components: components })
                                    } else {
                                        id = searchedItem.itemID
                                    }
                                }
                            }
                            if (type === RewardType.Achievement) {
                                const filteredAchievements = client.cache.achievements.filter(e => e.guildID === interaction.guildId && e.name.toLowerCase().includes(modalArgs.achievement.toLowerCase()))
                                if (filteredAchievements.size > 1 && !filteredAchievements.some(e =>  e.name.toLowerCase() === modalArgs.achievement.toLowerCase())) {
                                    let result = ""
                                    filteredAchievements.forEach(achievement => {
                                        result += `> ${achievement.displayEmoji}**${achievement.name}**\n`	
                                    })
                                    pass = false
                                    interaction2.update({ content: `${client.config.emojis.block} ${client.language({ textId: `По вашему запросу было найдено несколько достижений`, guildId: interaction.guildId, locale: interaction.locale })}:\n${result}`.slice(0, 2000), components: [], flags: ["Ephemeral"] })
                                    return interaction.editReply({ components: components })
                                } else {
                                    const searchedAchievement = filteredAchievements.some(e => e.name.toLowerCase() === modalArgs.achievement.toLowerCase()) ? filteredAchievements.find(e => e.name.toLowerCase() === modalArgs.achievement.toLowerCase()) : filteredAchievements.first()
                                    if (!searchedAchievement) {
                                        pass = false
                                        await interaction2.update({ content: `${client.config.emojis.NO}${client.language({ textId: `Достижение`, guildId: interaction.guildId, locale: interaction.locale })} **${modalArgs.achievement}** ${client.language({ textId: `не найдено`, guildId: interaction.guildId, locale: interaction.locale })}`, components: [], flags: ["Ephemeral"] })
                                        return interaction.editReply({ components: components })
                                    } else {
                                        id = searchedAchievement.id
                                    }
                                }
                            }
                            if (type === RewardType.Role) {
                                const role = interaction2.fields.getSelectedRoles("role").first()
                                id = role.id
                            }
                            if (modalArgs.amount !== undefined && isNaN(+modalArgs.amount)) {
                                interaction2.update({ content: `${client.config.emojis.NO} **${modalArgs.amount}** ${client.language({ textId: `не является числом`, guildId: interaction.guildId, locale: interaction.locale })}`, components: [], flags: ["Ephemeral"] })
                                return interaction.editReply({ components: components })
                            } else {
                                if (modalArgs.amount !== undefined) modalArgs.amount = +modalArgs.amount
                                if (modalArgs.amount !== undefined && (modalArgs.amount <= 0 || modalArgs.amount > 100000000000)) {
                                    interaction2.update({ content: `${client.config.emojis.NO} ${client.language({ textId: `Количество не должно быть`, guildId: interaction.guildId, locale: interaction.locale })} <= 0 ${client.language({ textId: `или`, guildId: interaction.guildId, locale: interaction.locale })} > 100 000 000 000`, components: [], flags: ["Ephemeral"] })
                                    return interaction.editReply({ components: components })
                                } else {
                                    if (modalArgs.minutes) {
                                        if (isNaN(+modalArgs.minutes) || !Number.isInteger(+modalArgs.minutes)) {
											await interaction2.update({ content: `${client.config.emojis.NO} **${modalArgs.minutes}** ${client.language({ textId: `не является целым числом`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
											return interaction.editReply({ components: components })
										}
										modalArgs.minutes = +modalArgs.minutes
										if (modalArgs.minutes <= 0) {
											await interaction2.update({ content: `${client.config.emojis.NO} **${client.language({ textId: `Число не может быть`, guildId: interaction.guildId, locale: interaction.locale })} <= 0**`, components: [], flags: ["Ephemeral"] })
                                            return interaction.editReply({ components: components })
										}
                                        ms = modalArgs.minutes * 60 * 1000
                                    }
                                    const target = quest.targets.find(e => { return e.targetID === targetID })
                                    if (target) {
                                        target.optionalRewards = []
                                        target.optionalRewards.push({
                                            type: type,
                                            id: id,
                                            amount: modalArgs.amount,
                                            ms: ms
                                        })
                                    }
                                    await quest.save()
                                    interaction2.update({ content: `${client.config.emojis.YES}`, components: [], flags: ["Ephemeral"] })
                                }
                            }
                        }
                    } else if (interaction2 && interaction2.customId === "cancel") {
                        await interaction2.update({ content: `${client.config.emojis.YES}${client.language({ textId: `Выбор отменён`, guildId: interaction.guildId, locale: interaction.locale })}`, components: [] })
                    }
                }
            } else
            if (interaction.customId.includes("help")) {
                const embedHelp = new EmbedBuilder()
                    .setColor(3093046)
                    .setTitle(`${client.language({ textId: `Помощь`, guildId: interaction.guildId, locale: interaction.locale })}`)
                    .setDescription(`${client.language({ textId: `Квест не может одновременно иметь тип 'Ежедневный' и тип 'Еженедельный'\nКвест не может одновременно иметь тип 'Сообщество' и тип 'Повторный'`, guildId: interaction.guildId, locale: interaction.locale })}`)
                    .addFields([
                        {
                            name: `${client.language({ textId: `Ежедневный`, guildId: interaction.guildId, locale: interaction.locale })}`,
                            value: `${client.language({ textId: `Квесты с данным типом активизируются по очереди каждый день`, guildId: interaction.guildId, locale: interaction.locale })}`
                        },
                        {
                            name: `${client.language({ textId: `Еженедельный`, guildId: interaction.guildId, locale: interaction.locale })}`,
                            value: `${client.language({ textId: `Квесты с данным типом активизируются по очереди каждую неделю`, guildId: interaction.guildId, locale: interaction.locale })}`
                        },
                        {
                            name: `${client.language({ textId: `Повторный`, guildId: interaction.guildId, locale: interaction.locale })}`,
                            value: `${client.language({ textId: `Квесты с данным типом можно выполнять неограниченное кол-во раз`, guildId: interaction.guildId, locale: interaction.locale })}`
                        },
                        {
                            name: `${client.language({ textId: `Сообщество`, guildId: interaction.guildId, locale: interaction.locale })}`,
                            value: `${client.language({ textId: `Квесты с данным типом имеют общий прогресс для целей`, guildId: interaction.guildId, locale: interaction.locale })}`
                        },
                        {
                            name: `${client.language({ textId: `Неактивный`, guildId: interaction.guildId, locale: interaction.locale })}`,
                            value: `${client.language({ textId: `Неактивные квесты нельзя взять`, guildId: interaction.guildId, locale: interaction.locale })}`
                        },
                        {
                            name: `${client.language({ textId: `Disabled`, guildId: interaction.guildId, locale: interaction.locale })}`,
                            value: `${client.language({ textId: `Выключенные квесты невидны для пользователей`, guildId: interaction.guildId, locale: interaction.locale })}`
                        },
                        {
                            name: `${client.language({ textId: `Опциональные задачи`, guildId: interaction.guildId, locale: interaction.locale })}`,
                            value: [
                                `* ${client.language({ textId: `Они не обязательны для завершения квеста, но их выполнение увеличит итоговую награду.`, guildId: interaction.guildId, locale: interaction.locale })}`,
                                `* ${client.language({ textId: `Каждый квест должен иметь как минимум одну основную (не опциональную) задачу.`, guildId: interaction.guildId, locale: interaction.locale })}`,
                                `* ${client.language({ textId: `Если после удаления задач в квесте останутся только опциональные, он станет выключеным. Чтобы восстановить его, добавьте основную задачу.`, guildId: interaction.guildId, locale: interaction.locale })}`
                            ].join("\n")
                        }
                    ])
                return interaction.reply({ embeds: [embedHelp], flags: ["Ephemeral"] })
            }
        }
        if (!quest) return interaction.reply({ content: `${client.config.emojis.NO}**${client.language({ textId: `Такого квеста не существует`, guildId: interaction.guildId, locale: interaction.locale })}**`, flags: ["Ephemeral"] })
        const embed = new EmbedBuilder()
            .setAuthor({ name: `${client.language({ textId: `Менеджер квестов`, guildId: interaction.guildId, locale: interaction.locale })}` })
            .setTitle(quest.displayEmoji+quest.name)
            .setColor(quest.hex || 3093046)
            .setThumbnail(quest.image || null)
        let untilTime = ""
        if (quest.daily) {
            const date = new Date()
            date.setDate(date.getDate()+1)
            const end_date = date.setHours(5,0,0,0)
            untilTime += `\n${client.language({ textId: `до`, guildId: interaction.guildId, locale: interaction.locale })} <t:${Math.round(end_date.valueOf()/1000)}>`
        } else if (quest.weekly) {
            let endOfWeek = require('date-fns/endOfWeek')
            const end_date = endOfWeek(new Date(), { weekStartsOn: 1 })
            end_date.setDate(end_date.getDate() + 1)
            end_date.setHours(5,0,0,0)
            untilTime += `\n${client.language({ textId: `до`, guildId: interaction.guildId, locale: interaction.locale })} <t:${Math.round(end_date.valueOf()/1000)}>`
        }
        embed.setDescription(`${quest.repeated ? `**${client.language({ textId: `ПОВТОРНЫЙ`, guildId: interaction.guildId, locale: interaction.locale })}**` : ""} ${quest.community ? `**${client.language({ textId: `СООБЩЕСТВО`, guildId: interaction.guildId, locale: interaction.locale })}**` : ""} ${quest.daily ? `**${client.language({ textId: `ЕЖЕДНЕВНЫЙ`, guildId: interaction.guildId, locale: interaction.locale })}**` : ""} ${quest.weekly ? `**${client.language({ textId: `ЕЖЕНЕДЕЛЬНЫЙ`, guildId: interaction.guildId, locale: interaction.locale })}**` : ""}${untilTime}\n${quest.enable ? `🟢${client.language({ textId: `ВКЛЮЧЕН`, guildId: interaction.guildId, locale: interaction.locale })}` : `🔴${client.language({ textId: `ВЫКЛЮЧЕН`, guildId: interaction.guildId, locale: interaction.locale })}`}\n${quest.active ? `🟢${client.language({ textId: `АКТИВНЫЙ`, guildId: interaction.guildId, locale: interaction.locale })}` : `🔴${client.language({ textId: `НЕАКТИВНЫЙ`, guildId: interaction.guildId, locale: interaction.locale })}`}`)
        let targetArray = []
        let rewardArray = []
        let targetIndex = 0
        for (const element of quest.targets.sort((a, b) => {
            if ((a.isOptional && b.isOptional) || (!a.isOptional && !b.isOptional)) return 0
            else if (a.isOptional && !b.isOptional) return 1
            else if (!a.isOptional && b.isOptional) return -1
        })) {
            const description = quest.getDescription(element, interaction.locale)
            targetArray.push([
                targetIndex === 0 ? `-# ${quest.requiresAllTasks ? `${client.language({ textId: "Для выполнения квеста выполните все задачи", guildId: interaction.guildId, locale: interaction.locale })}` : `${client.language({ textId: "Для выполнения квеста выполните любую задачу", guildId: interaction.guildId, locale: interaction.locale })}`}` : undefined,
                `${element.isOptional ? `${client.language({ textId: "(ДОП.)", guildId: interaction.guildId, locale: interaction.locale })} ` : ""}${description}${element.isOptional ? `\n⤷⎯⎯⎯⎯⟶${client.language({ textId: "Награда", guildId: interaction.guildId, locale: interaction.locale })}: ${element.optionalRewards.map(reward => {
                    let name = ``
                    if (reward.type === RewardType.Currency) name = `${settings.displayCurrencyEmoji}**${settings.currencyName}**`
                    else if (reward.type === RewardType.Experience) name = `${client.config.emojis.XP}**${client.language({ textId: "Опыт", guildId: interaction.guildId, locale: interaction.locale })}**`
                    else if (reward.type === RewardType.Reputation) name = `${client.config.emojis.RP}**${client.language({ textId: "Репутация", guildId: interaction.guildId, locale: interaction.locale })}**`
                    else if (reward.type === RewardType.Item) {
                        const item = client.cache.items.find(e => e.itemID === reward.id && e.enabled && !e.temp)
                        if (item) {
                            name = item.found ? `${item.displayEmoji}**${item.name}**` : `||???????????||`
                        }
                        else name = `**${reward.id}**`
                    } else if (reward.type === RewardType.Role) name = `<@&${reward.id}>${reward.ms ? ` [${client.functions.transformSecs(client, reward.ms, interaction.guildId, interaction.locale)}]` : ``}`
                    else if (reward.type ===  RewardType.Achievement) {
                        const achievement = client.cache.achievements.get(reward.id)
                        if (achievement) {
                            name = `${achievement.displayEmoji}**${achievement.name}**`
                        } else name = `**${reward.id}**`
                    }
                    return `${name} ${reward.amount ? `(${reward.amount.toLocaleString()})` : ""}`
                }).join(", ")}` : ""}`
            ].filter(e => e).join("\n"))
            targetIndex++
        }
        for (const element of quest.rewards) {
            let name
            if (element.type === RewardType.Currency) {
                name = `${settings.displayCurrencyEmoji}**${settings.currencyName}**`
            }
            else if (element.type === RewardType.Experience) name = `${client.config.emojis.XP}**${client.language({ textId: `Опыт`, guildId: interaction.guildId, locale: interaction.locale })}**`
            else if (element.type === RewardType.Reputation) name = `${client.config.emojis.RP}**${client.language({ textId: `Репутация`, guildId: interaction.guildId, locale: interaction.locale })}**`
            else if (element.type === RewardType.Item) {
                const item = client.cache.items.find(e => e.enabled && !e.temp && e.itemID === element.id)
                if (item) {
                    name = item.found ? `${item.displayEmoji}**${item.name}**` : `||???????????||`
                }
                else name = `**${element.id}**`
            } else if (element.type === RewardType.Role) name = `<@&${element.id}>${element.ms ? ` [${client.functions.transformSecs(client, element.ms, interaction.guildId, interaction.locale)}]` : ``}`
            else if (element.type ===  RewardType.Achievement) {
                const achievement = client.cache.achievements.get(element.id)
                if (achievement) {
                    name = `${achievement.displayEmoji}**${achievement.name}**`
                } else name = `**${element.id}**`
            }
            rewardArray.push(`${name} ${element.amount ? `(${element.amount.toLocaleString()})` : ""}`)
        }
        targetArray = targetArray.join('\n')
        rewardArray = rewardArray.join('\n')
        embed.addFields([
            { 
                name: `\u200B`, 
                value: `${quest.description?.slice(0, 1024) || `<${client.language({ textId: `ОПИСАНИЕ`, guildId: interaction.guildId, locale: interaction.locale })}>`}`
            },
            { 
                name: `${client.language({ textId: `Задачи`, guildId: interaction.guildId, locale: interaction.locale })}:`, 
                value: targetArray.length ? targetArray : `${client.language({ textId: `Отсутствуют`, guildId: interaction.guildId, locale: interaction.locale })}`
            },
            { 
                name: `${client.language({ textId: `Награда`, guildId: interaction.guildId, locale: interaction.locale })}:`, 
                value: rewardArray.length ? rewardArray: `${client.language({ textId: `Отсутствует`, guildId: interaction.guildId, locale: interaction.locale })}`
            }
        ])
        if (quest.nextQuests.length) {
            embed.addFields([
            { 
                name: `${client.language({ textId: `Следующие квесты`, guildId: interaction.guildId, locale: interaction.locale })}:`, 
                value: quest.nextQuests.map(nextQuest => {
                    const nq = client.cache.quests.get(nextQuest)
                    if (nq) return `${nq.displayEmoji}${nq.name}`
                    else return nextQuest
                }).filter(e => e).join(", ")
            }
        ])
        }
        embed.setFooter({ text: `ID: ${quest.questID}` })
        const row = new ActionRowBuilder()
            .addComponents([
                new StringSelectMenuBuilder()
                    .setCustomId(`qst{${quest.questID}}cmd{manager-quests}usr{${interaction.user.id}}type`)
                    .setOptions([
                        {
                            label: `${client.language({ textId: `Ежедневный`, guildId: interaction.guildId, locale: interaction.locale })}`,
                            description: `${client.language({ textId: `Добавляется в пул ежедневных квестов`, guildId: interaction.guildId, locale: interaction.locale })}`,
                            value: `daily`
                        },
                        {
                            label: `${client.language({ textId: `Еженедельный`, guildId: interaction.guildId, locale: interaction.locale })}`,
                            description: `${client.language({ textId: `Добавляется в пул еженедельных квестов`, guildId: interaction.guildId, locale: interaction.locale })}`,
                            value: `weekly`,
                        },
                        {
                            label: `${client.language({ textId: `Сообщество`, guildId: interaction.guildId, locale: interaction.locale })}`,
                            description: `${client.language({ textId: `Квест с общим прогрессом`, guildId: interaction.guildId, locale: interaction.locale })}`,
                            value: `community`
                        },
                        {
                            label: `${client.language({ textId: `Повторный`, guildId: interaction.guildId, locale: interaction.locale })}`,
                            description: `${client.language({ textId: `После выполнения, можно обнулить прогресс`, guildId: interaction.guildId, locale: interaction.locale })}`,
                            value: `repeated`
                        }
                    ])
                .setPlaceholder(`${!quest.repeated && !quest.community && !quest.daily && !quest.weekly ? `${client.language({ textId: `Выбрать тип квеста`, guildId: interaction.guildId, locale: interaction.locale })}...` : `${quest.repeated ? `[${client.language({ textId: `ПОВТОРНЫЙ`, guildId: interaction.guildId, locale: interaction.locale })}]` : ""} ${quest.community ? `[${client.language({ textId: `СООБЩЕСТВО`, guildId: interaction.guildId, locale: interaction.locale })}]` : ""} ${quest.daily ? `[${client.language({ textId: `ЕЖЕДНЕВНЫЙ`, guildId: interaction.guildId, locale: interaction.locale })}]` : ""} ${quest.weekly ? `[${client.language({ textId: `ЕЖЕНЕДЕЛЬНЫЙ`, guildId: interaction.guildId, locale: interaction.locale })}]` : ""}`}`)
                .setMaxValues(4)
            ])
        const options = [
            {
                label: `${client.language({ textId: `Изменить название, описание, картинку, цвет`, guildId: interaction.guildId, locale: interaction.locale })}`,
                value: `name, description, image, color`
            },
            {
                label: `${client.language({ textId: `Изменить эмодзи`, guildId: interaction.guildId, locale: interaction.locale })}`,
                value: `emoji`
            }
        ]
        if (quest.targets.length < 5) options.push({
                label: `${client.language({ textId: `Добавить задачу`, guildId: interaction.guildId, locale: interaction.locale })}`,
                value: `addTarget`,
        })
        if (quest.targets.length >= 1) options.push(
            {
                label: `${client.language({ textId: `Редактировать задачу`, guildId: interaction.guildId, locale: interaction.locale })}`,
                value: `editTarget`,
            },
            {
                label: `${client.language({ textId: `Удалить задачу`, guildId: interaction.guildId, locale: interaction.locale })}`,
                value: `delTarget`
            }
        )
        options.push(
            {
                label: `${client.language({ textId: `Добавить награду`, guildId: interaction.guildId, locale: interaction.locale })}`,
                description: `${client.language({ textId: `Награды`, guildId: interaction.guildId, locale: interaction.locale })}: ${quest.rewards.length}`,
                value: `reward`
            }
        )
        if (quest.rewards.length) {
            options.push({
                label: `${client.language({ textId: `Удалить награду`, guildId: interaction.guildId, locale: interaction.locale })}`,
                description: `${client.language({ textId: `Награды`, guildId: interaction.guildId, locale: interaction.locale })}: ${quest.rewards.length}`,
                value: `delReward`
            })
        }
        if (quest.targets.filter(e => e.isOptional).length) {
            options.push(
            {
                label: `${client.language({ textId: `Добавить награду для опциональной задачи`, guildId: interaction.guildId, locale: interaction.locale })}`,
                value: `optionalTargetReward`
            }
        )
        }
        options.push(
            {
                label: quest.active ? `🔴${client.language({ textId: `Сделать неактивным`, guildId: interaction.guildId, locale: interaction.locale })}` : `🟢${client.language({ textId: `Сделать активным`, guildId: interaction.guildId, locale: interaction.locale })}`,
                value: `active/inactive`
            },
            {
                label: quest.enable ? `🔴${client.language({ textId: `Выключить`, guildId: interaction.guildId, locale: interaction.locale })}` : `🟢${client.language({ textId: `Включить`, guildId: interaction.guildId, locale: interaction.locale })}`,
                value: `enable/disable`
            },
            {
                label: `${client.language({ textId: `Право для взятия квеста`, guildId: interaction.guildId, locale: interaction.locale })}`,
                value: `takePermission`,
                description: client.cache.permissions.get(quest.takePermission)?.name || undefined
            },
            {
                label: `${client.language({ textId: `Право для получения награды`, guildId: interaction.guildId, locale: interaction.locale })}`,
                value: `donePermission`,
                description: client.cache.permissions.get(quest.donePermission)?.name || undefined
            },
            {
                label: `${client.language({ textId: `Следующие квесты`, guildId: interaction.guildId, locale: interaction.locale })}`,
                value: `nextQuests`,
                description: `${client.language({ textId: `Выдаются после выполнения квеста`, guildId: interaction.guildId, locale: interaction.locale })}`
            }
        )
        const row2 = new ActionRowBuilder().addComponents([
            new StringSelectMenuBuilder()
                .setCustomId(`qst{${quest.questID}}cmd{manager-quests}usr{${interaction.user.id}}`)
                .setOptions(options)
                .setPlaceholder(`${client.language({ textId: `Редактировать`, guildId: interaction.guildId, locale: interaction.locale })}...`)
        ])
        const row3 = new ActionRowBuilder().addComponents([
            new StringSelectMenuBuilder()
                .setCustomId(`qst{${quest.questID}}cmd{manager-quests}usr{${interaction.user.id}}actions`)
                .setOptions([
                    {
                        label: `${client.language({ textId: `Добавить этот квест всем пользователям`, guildId: interaction.guildId, locale: interaction.locale })}`,
                        value: `addMembers`
                    },
                    {
                        label: `${client.language({ textId: `Добавить этот квест пользователям...`, guildId: interaction.guildId, locale: interaction.locale })}`,
                        value: `addToMember`
                    },
                    {
                        label: `${client.language({ textId: `Удалить этот квест у всех пользователей`, guildId: interaction.guildId, locale: interaction.locale })}`,
                        value: `delMembers`,
                    },
                    {
                        label: `${client.language({ textId: `Удалить этот квест у пользователей...`, guildId: interaction.guildId, locale: interaction.locale })}`,
                        value: `delFromMember`,
                    },
                    {
                        label: `${client.language({ textId: `Обнулить прогресс этого квеста у всех пользователей`, guildId: interaction.guildId, locale: interaction.locale })}`,
                        value: `clearProgress_members`,
                    },{
                        label: `${client.language({ textId: `Обнулить прогресс этого квеста у пользователей...`, guildId: interaction.guildId, locale: interaction.locale })}`,
                        value: `clearProgress_member`,
                    }
                ])
                .setPlaceholder(`${client.language({ textId: `Действия`, guildId: interaction.guildId, locale: interaction.locale })}...`)
        ])
        const row4 = new ActionRowBuilder().addComponents([
            new ButtonBuilder()
                .setCustomId(`cmd{manager-quests}usr{${interaction.user.id}}help`)
                .setEmoji(client.config.emojis.question)
                .setStyle(ButtonStyle.Secondary)
        ])
        if (interaction.deferred || interaction.replied) return interaction.editReply({ embeds: [embed], components: [row, row2, row3, row4] })
        else return interaction.update({ embeds: [embed], components: [row, row2, row3, row4] })
        function getQuestContext(type, amount) {
            switch (type) {
                case "message":
                    return `${client.language({ textId: `Написать`, guildId: interaction.guildId, locale: interaction.locale })} ${amount || "N"} ${client.language({ textId: `сообщений в чате`, guildId: interaction.guildId, locale: interaction.locale })}`
                case "voice":
                    return `${client.language({ textId: `Провести`, guildId: interaction.guildId, locale: interaction.locale })} ${amount || "N"} ${client.language({ textId: `минут в голосовом чате`, guildId: interaction.guildId, locale: interaction.locale })}`
                case "like":
                    return `${client.language({ textId: `Поставить`, guildId: interaction.guildId, locale: interaction.locale })} ${amount || "N"} ${client.language({ textId: `лайков`, guildId: interaction.guildId, locale: interaction.locale })}`
                case "invite":
                    return `${client.language({ textId: `Пригласить`, guildId: interaction.guildId, locale: interaction.locale })} ${amount || "N"} ${client.language({ textId: `чел. на сервер`, guildId: interaction.guildId, locale: interaction.locale })}`
                case "bump": 
                    return `${client.language({ textId: `Бампнуть сервер`, guildId: interaction.guildId, locale: interaction.locale })} ${amount || "N"} ${client.language({ textId: `раз(а)`, guildId: interaction.guildId, locale: interaction.locale })}`
                case "currency":
                    return `${client.language({ textId: `Накопить`, guildId: interaction.guildId, locale: interaction.locale })} ${amount || "N"} ${settings.currencyName}`
                case "currencySpent":
                    return `${client.language({ textId: `Потратить`, guildId: interaction.guildId, locale: interaction.locale })} ${amount || "N"} ${settings.currencyName}`
                case "fishing": 
                    return `${client.language({ textId: `Порыбачить`, guildId: interaction.guildId, locale: interaction.locale })} ${amount || "N"} ${client.language({ textId: `раз(а)`, guildId: interaction.guildId, locale: interaction.locale })}`
                case "mining":
                    return `${client.language({ textId: `Помайнить`, guildId: interaction.guildId, locale: interaction.locale })} ${amount || "N"} ${client.language({ textId: `раз(а)`, guildId: interaction.guildId, locale: interaction.locale })}`
                case "daily":
                    return `${client.language({ textId: `Получить ежедневную награду`, guildId: interaction.guildId, locale: interaction.locale })} ${amount || "N"} ${client.language({ textId: `раз(а)`, guildId: interaction.guildId, locale: interaction.locale })}`
                case "wormhole":
                    return `${client.language({ textId: `Использовать червоточину`, guildId: interaction.guildId, locale: interaction.locale })} ${amount || "N"} ${client.language({ textId: `раз(а)`, guildId: interaction.guildId, locale: interaction.locale })}`
                case "quests": 
                    return `${client.language({ textId: `Выполнить квесты`, guildId: interaction.guildId, locale: interaction.locale })} ${amount || "N"} ${client.language({ textId: `раз(а)`, guildId: interaction.guildId, locale: interaction.locale })}`
                case "giveaway":
                    return `${client.language({ textId: `Создать раздачу`, guildId: interaction.guildId, locale: interaction.locale })} ${amount || "N"} ${client.language({ textId: `раз(а)`, guildId: interaction.guildId, locale: interaction.locale })}`
                case "marketplace":
                    return `${client.language({ textId: `Продать`, guildId: interaction.guildId, locale: interaction.locale })} ${amount || "N"} ${client.language({ textId: `предметов на маркете`, guildId: interaction.guildId, locale: interaction.locale })}`
                case "itemsOpened":
                    return `${client.language({ textId: `Открыть предметы`, guildId: interaction.guildId, locale: interaction.locale })} ${amount || "N"} ${client.language({ textId: `раз(а)`, guildId: interaction.guildId, locale: interaction.locale })}`
                case "wormholesSpawned":
                    return `${client.language({ textId: `Заспавнить червоточину`, guildId: interaction.guildId, locale: interaction.locale })} ${amount || "N"} ${client.language({ textId: `раз(а)`, guildId: interaction.guildId, locale: interaction.locale })}`
                case "itemsReceived":
                    return `${client.language({ textId: `Получить предметы`, guildId: interaction.guildId, locale: interaction.locale })} ${amount || "N"} ${client.language({ textId: `раз(а)`, guildId: interaction.guildId, locale: interaction.locale })}`
                case "itemsCrafted":
                    return `${client.language({ textId: `Скрафтить предметы`, guildId: interaction.guildId, locale: interaction.locale })} ${amount || "N"} ${client.language({ textId: `раз(а)`, guildId: interaction.guildId, locale: interaction.locale })}`
                case "itemsUsed":
                    return `${client.language({ textId: `Использовать предметы`, guildId: interaction.guildId, locale: interaction.locale })} ${amount || "N"} ${client.language({ textId: `раз(а)`, guildId: interaction.guildId, locale: interaction.locale })}`
                case "itemsBoughtInShop":
                    return `${client.language({ textId: `Купить предметы в магазине`, guildId: interaction.guildId, locale: interaction.locale })} ${amount || "N"} ${client.language({ textId: `раз(а)`, guildId: interaction.guildId, locale: interaction.locale })}`
                case "itemsBoughtOnMarket":
                    return `${client.language({ textId: `Купить предметы в магазине`, guildId: interaction.guildId, locale: interaction.locale })} ${amount || "N"} ${client.language({ textId: `раз(а)`, guildId: interaction.guildId, locale: interaction.locale })}`
                case "itemsSold":
                    return `${client.language({ textId: `Продать предметы`, guildId: interaction.guildId, locale: interaction.locale })} ${amount || "N"} ${client.language({ textId: `раз(а)`, guildId: interaction.guildId, locale: interaction.locale })}`
                case "level":
                    return `${client.language({ textId: `Получить`, guildId: interaction.guildId, locale: interaction.locale })} ${amount || "N"} ${client.language({ textId: `уровней`, guildId: interaction.guildId, locale: interaction.locale })}`
                case "exp":
                    return `${client.language({ textId: `Получить`, guildId: interaction.guildId, locale: interaction.locale })} ${amount || "N"} ${client.language({ textId: `опыта`, guildId: interaction.guildId, locale: interaction.locale })}`
                case "seasonLevel":
                    return `${client.language({ textId: `Получить`, guildId: interaction.guildId, locale: interaction.locale })} ${amount || "N"} ${client.language({ textId: `сезонных уровней`, guildId: interaction.guildId, locale: interaction.locale })}`
                case "seasonXp":
                    return `${client.language({ textId: `Получить`, guildId: interaction.guildId, locale: interaction.locale })} ${amount || "N"} ${client.language({ textId: `сезонного опыта`, guildId: interaction.guildId, locale: interaction.locale })}`
                case "drop":
                    return `${client.language({ textId: `Выкинуть`, guildId: interaction.guildId, locale: interaction.locale })} ${amount || "N"} ${client.language({ textId: `предметов`, guildId: interaction.guildId, locale: interaction.locale })}`
                case "transfer":
                    return `${client.language({ textId: `Передать`, guildId: interaction.guildId, locale: interaction.locale })} ${amount || "N"} ${client.language({ textId: `предметов`, guildId: interaction.guildId, locale: interaction.locale })}`
                case "UsedPromocode":
                    return `${client.language({ textId: `Использовать промокод`, guildId: interaction.guildId, locale: interaction.locale })} ${amount || "N"} ${client.language({ textId: `раз(а)`, guildId: interaction.guildId, locale: interaction.locale })}`
                case "giveToNPC":
                    return `${client.language({ textId: `Передать`, guildId: interaction.guildId, locale: interaction.locale })} ${amount || "N"} ${client.language({ textId: `предметов NPC`, guildId: interaction.guildId, locale: interaction.locale })}`
            }
        }
    }
}