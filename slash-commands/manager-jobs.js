const { TextInputStyle, ButtonBuilder, ButtonStyle, InteractionType, StringSelectMenuBuilder, ActionRowBuilder, EmbedBuilder, TextInputBuilder, ModalBuilder, Collection, ApplicationCommandOptionType, Colors, LabelBuilder } = require("discord.js")
const uniqid = require('uniqid')
const JobRegexp = /job{(.*?)}/
const UserRegexp = /usr{(.*?)}/
const ActionRegexp = /act{(.*?)}/
const ExodusRegexp = /exo{(.*?)}/
const Job = require("../classes/job.js")
const isImageURL = require('image-url-validator').default
module.exports = {
    name: 'manager-jobs',
    nameLocalizations: {
        'ru': `управление-работой`,
        'uk': `управління-роботою`,
        'es-ES': `gestión-trabajos`
    },
    description: 'Manage jobs',
    descriptionLocalizations: {
        'ru': `Управление работой`,
        'uk': `Управління роботою`,
        'es-ES': `Gestión de trabajos`
    },
    options: [
        {
            name: 'view',
            nameLocalizations: {
                'ru': `просмотр`,
                'uk': `перегляд`,
                'es-ES': `ver`
            },
            description: 'View all jobs',
            descriptionLocalizations: {
                'ru': `Просмотр всех работ`,
                'uk': `Перегляд усіх робіт`,
                'es-ES': `Ver todos los trabajos`
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
            description: 'Create a job',
            descriptionLocalizations: {
                'ru': `Создать работу`,
                'uk': `Створити роботу`,
                'es-ES': `Crear un trabajo`
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
                    description: 'Job name',
                    descriptionLocalizations: {
                        'ru': `Название работы`,
                        'uk': `Назва роботи`,
                        'es-ES': `Nombre del trabajo`
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
            description: 'Edit a job',
            descriptionLocalizations: {
                'ru': `Изменить работу`,
                'uk': `Змінити роботу`,
                'es-ES': `Editar un trabajo`
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
                    description: 'Job name',
                    descriptionLocalizations: {
                        'ru': `Название работы`,
                        'uk': `Назва роботи`,
                        'es-ES': `Nombre del trabajo`
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
            description: 'Copy a job',
            descriptionLocalizations: {
                'ru': `Копировать работу`,
                'uk': `Копіювати роботу`,
                'es-ES': `Copiar un trabajo`
            },
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'job',
                    nameLocalizations: {
                        'ru': `работа`,
                        'uk': `робота`,
                        'es-ES': `trabajo`
                    },
                    description: 'Job name',
                    descriptionLocalizations: {
                        'ru': `Название работы`,
                        'uk': `Назва роботи`,
                        'es-ES': `Nombre del trabajo`
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
                    description: 'Name for new job',
                    descriptionLocalizations: {
                        'ru': `Название для новой работы`,
                        'uk': `Назва для нової роботи`,
                        'es-ES': `Nombre para el nuevo trabajo`
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
            description: 'Delete a job',
            descriptionLocalizations: {
                'ru': `Удалить работу`,
                'uk': `Видалити роботу`,
                'es-ES': `Eliminar un trabajo`
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
                    description: 'Job name',
                    descriptionLocalizations: {
                        'ru': `Название работы`,
                        'uk': `Назва роботи`,
                        'es-ES': `Nombre del trabajo`
                    },
                    type: ApplicationCommandOptionType.String,
                    minLength: 2,
                    maxLength: 30,
                    autocomplete: true,
                    required: true
                }
            ]
        }
    ],
    defaultMemberPermissions: "Administrator",
    dmPermission: false,
    group: `managers`,
    cooldowns: new Collection(),
    run: async (client, interaction, args) => {
        if (!interaction.isChatInputCommand() && interaction.user.id !== UserRegexp.exec(interaction.customId)?.[1]) return interaction.deferUpdate()
            const settings = client.cache.settings.get(interaction.guildId)
        let job
        if (interaction.isChatInputCommand()) {
            if (args.Subcommand === "create") {
                if (client.cache.jobs.some(e => e.name.toLowerCase() === args.name.toLowerCase() && e.guildID === interaction.guildId)) {
                    return interaction.reply({ content: `${client.language({ textId: `Работа с названием`, guildId: interaction.guildId, locale: interaction.locale })} **${args.name}** ${client.language({ textId: `уже существует, выбери другое название`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
                }
                const modal = new ModalBuilder()
                    .setCustomId(`manager-jobs_new_${args.name}_${interaction.id}`)
                    .setTitle(args.name)
                    .setLabelComponents([
                        new LabelBuilder()
                            .setLabel(`${client.language({ textId: `Описание работы`, guildId: interaction.guildId, locale: interaction.locale })}`)
                            .setTextInputComponent(
                               new TextInputBuilder()
                                    .setCustomId("description")
                                    .setRequired(true)
                                    .setMaxLength(200)
                                    .setStyle(TextInputStyle.Paragraph)
                            ),
                        new LabelBuilder()
                            .setLabel(`${client.language({ textId: `Название первого действия`, guildId: interaction.guildId, locale: interaction.locale })}`)
                            .setTextInputComponent(
                                new TextInputBuilder()
                                    .setCustomId("action1name")
                                    .setRequired(true)
                                    .setMaxLength(20)
                                    .setStyle(TextInputStyle.Short)
                            ),
                        new LabelBuilder()
                            .setLabel(`${client.language({ textId: `Название второго действия`, guildId: interaction.guildId, locale: interaction.locale })}`)
                            .setTextInputComponent(
                                new TextInputBuilder()
                                    .setCustomId("action2name")
                                    .setRequired(true)
                                    .setMaxLength(20)
                                    .setStyle(TextInputStyle.Short)
                            ),
                    ])
                await interaction.showModal(modal);delete client.globalCooldown[`${interaction.guildId}_${interaction.user.id}`]
                const filter = (i) => i.customId === `manager-jobs_new_${args.name}_${interaction.id}` && i.user.id === interaction.user.id
                interaction = await interaction.awaitModalSubmit({ filter, time: 300000 }).catch(e => interaction)
                if (interaction && interaction.type === InteractionType.ModalSubmit) {
                    const modalArgs = {}
                    interaction.fields.fields.each(field => modalArgs[field.customId] = field.value)
                    job = new client.jobSchema({
                        id: uniqid.time(),
                        name: args.name,
                        description: modalArgs.description,
                        hide: false,
                        guildID: interaction.guildId,
                        action1: {
                            name: modalArgs.action1name
                        },
                        action2: {
                            name: modalArgs.action2name
                        }
                    })
                    await job.save()
                    job = new Job(client, job)
                    client.cache.jobs.set(job.id, job)
                } else return
            } else
            if (args.Subcommand === "copy") {
                const originalJob = client.cache.jobs.find(e => e.name.toLowerCase() === args.job.toLowerCase() && e.guildID === interaction.guildId)
                if (!originalJob) return interaction.reply({ content: `${client.language({ textId: `Работа с названием`, guildId: interaction.guildId, locale: interaction.locale })}: **${args.name}** ${client.language({ textId: `не найдена`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
                if (client.cache.jobs.some(e => e.name.toLowerCase() === args.name.toLowerCase() && e.guildID === interaction.guildId)) {
                    return interaction.reply({ content: `${client.language({ textId: `Работа с названием`, guildId: interaction.guildId, locale: interaction.locale })}: **${args.name}** ${client.language({ textId: `уже существует, выбери другое название`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
                }
                await interaction.deferReply()
                const copyJob = structuredClone(Object.assign({}, { 
                    ...originalJob, 
                    client: undefined, 
                    action1: { 
                        ...originalJob.action1, 
                        success: { ...originalJob.action1.success, messages: [], images: [], rewards: [] }, 
                        fail: { ...originalJob.action1.fail, messages: [], images: [], rewards: [] } 
                    }, 
                    action2: { 
                        ...originalJob.action2, 
                        success: { ...originalJob.action2.success, messages: [], images: [], rewards: [] }, 
                        fail: { ...originalJob.action2.fail, messages: [], images: [], rewards: [] } 
                    } 
                }))
                if (originalJob.action1.success.messages.length) copyJob.action1.success.messages = JSON.parse(JSON.stringify(originalJob.action1.success.messages))
                if (originalJob.action1.success.images.length) copyJob.action1.success.images = JSON.parse(JSON.stringify(originalJob.action1.success.images))
                if (originalJob.action1.success.rewards.length) copyJob.action1.success.rewards = JSON.parse(JSON.stringify(originalJob.action1.success.rewards))
                if (originalJob.action1.fail.messages.length) copyJob.action1.fail.messages = JSON.parse(JSON.stringify(originalJob.action1.fail.messages))
                if (originalJob.action1.fail.images.length) copyJob.action1.fail.images = JSON.parse(JSON.stringify(originalJob.action1.fail.images))
                if (originalJob.action1.fail.rewards.length) copyJob.action1.fail.rewards = JSON.parse(JSON.stringify(originalJob.action1.fail.rewards))
                
                if (originalJob.action2.success.messages.length) copyJob.action2.success.messages = JSON.parse(JSON.stringify(originalJob.action2.success.messages))
                if (originalJob.action2.success.images.length) copyJob.action2.success.images = JSON.parse(JSON.stringify(originalJob.action2.success.images))
                if (originalJob.action2.success.rewards.length) copyJob.action2.success.rewards = JSON.parse(JSON.stringify(originalJob.action2.success.rewards))
                if (originalJob.action2.fail.messages.length) copyJob.action2.fail.messages = JSON.parse(JSON.stringify(originalJob.action2.fail.messages))
                if (originalJob.action2.fail.images.length) copyJob.action2.fail.images = JSON.parse(JSON.stringify(originalJob.action2.fail.images))
                if (originalJob.action2.fail.rewards.length) copyJob.action2.fail.rewards = JSON.parse(JSON.stringify(originalJob.action2.fail.rewards))
                delete copyJob._id
                copyJob.name = args.name
                copyJob.id = uniqid.time()
                copyJob.enable = false
                job = new client.jobSchema(copyJob)
                await job.save()
                job = new Job(client, job)
                client.cache.jobs.set(job.id, job)
            } else
            if (args.Subcommand === "edit") {
                job = client.cache.jobs.find(e => e.name.toLowerCase() === args.name.toLowerCase() && e.guildID === interaction.guildId)
                if (!job) return interaction.reply({ content: `${client.config.emojis.NO} ${client.language({ textId: `Работа с названием`, guildId: interaction.guildId, locale: interaction.locale })} **${args.name}** ${client.language({ textId: `не существует`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
                await interaction.deferReply()
            } else
            if (args.Subcommand === "delete") {
                await interaction.deferReply({ flags: ["Ephemeral"] })
                job = client.cache.jobs.find(e => e.name.toLowerCase() === args.name.toLowerCase() && e.guildID === interaction.guildId)
                if (!job) return interaction.editReply({ content: `${client.config.emojis.NO} ${client.language({ textId: `Работа с названием`, guildId: interaction.guildId, locale: interaction.locale })} **${args.name}** ${client.language({ textId: `не существует`, guildId: interaction.guildId, locale: interaction.locale })}` })
                await job.delete()
                return interaction.editReply({ content: `${client.language({ textId: `Работа`, guildId: interaction.guildId, locale: interaction.locale })} **${job.name}** ${client.language({ textId: `была удалена`, guildId: interaction.guildId, locale: interaction.locale })}.`, flags: ["Ephemeral"] })
            } else
            if (args.Subcommand === "view") {
                let index = 0
                const embed = new EmbedBuilder()
                    .setTitle(`${client.language({ textId: `Менеджер работы`, guildId: interaction.guildId, locale: interaction.locale })}`)
                    .setColor(3093046)
                    .setDescription(client.cache.jobs.filter(e => e.guildID === interaction.guildId).size ? client.cache.jobs.filter(e => e.guildID === interaction.guildId).map((job) => { 
                        return `${index++}. ${job.name}`
                    }).join("\n") : `${client.language({ textId: `Работа отсутствует`, guildId: interaction.guildId, locale: interaction.locale })}`)
                return interaction.reply({ 
                    embeds: [
                        embed, 
                        new EmbedBuilder().setColor(3093046).setDescription(`${client.config.emojis.plus}${client.language({ textId: `Создать работу`, guildId: interaction.guildId, locale: interaction.locale })}: </manager-jobs create:1150455842294988942>\n${client.config.emojis.edit}${client.language({ textId: `Изменить работу`, guildId: interaction.guildId, locale: interaction.locale })}: </manager-jobs edit:1150455842294988942>\n${client.config.emojis.copy}${client.language({ textId: `Скопировать работу`, guildId: interaction.guildId, locale: interaction.locale })}: </manager-jobs copy:1150455842294988942>\n${client.config.emojis.trash}${client.language({ textId: `Удалить работу`, guildId: interaction.guildId, locale: interaction.locale })}: </manager-jobs delete:1150455842294988942>`)
                    ] 
                })
            }
        } else {
            job = client.cache.jobs.get(JobRegexp.exec(interaction.customId)[1])
            if (!job) return interaction.reply({ content: `${client.config.emojis.NO} ${client.language({ textId: `Такой работы не существует`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
        }
        let action = interaction.isModalSubmit() || interaction.isChatInputCommand() ? `action1` : ActionRegexp.exec(interaction.customId)[1]
        let exodus = interaction.isModalSubmit() || interaction.isChatInputCommand() ? `success` : ExodusRegexp.exec(interaction.customId)[1]
        if (!interaction.isChatInputCommand() && !interaction.isModalSubmit()) {
            if (interaction.customId.includes("actione")) {
                action = interaction.values[0]
            }
            if (interaction.customId.includes("exodus")) {
                exodus = interaction.values[0]
            }
            if (interaction.customId.includes("edit")) {
                const components = JSON.parse(JSON.stringify(interaction.message.components))
                if (interaction.values?.[0] === "name") {
                    const modal = new ModalBuilder()
                        .setCustomId(`manager-jobs_name_${interaction.id}`)
                        .setTitle(`${client.language({ textId: `Название работы`, guildId: interaction.guildId, locale: interaction.locale })}`)
                        .setLabelComponents([
                            new LabelBuilder()
                                .setLabel(`${client.language({ textId: `Название`, guildId: interaction.guildId, locale: interaction.locale })}`)
                                .setTextInputComponent(
                                    new TextInputBuilder()
                                        .setCustomId("name")
                                        .setRequired(true)
                                        .setMinLength(2)
                                        .setMaxLength(30)
                                        .setStyle(TextInputStyle.Short)
                                        .setValue(job.name)
                                ),
                        ])
                    await interaction.showModal(modal);delete client.globalCooldown[`${interaction.guildId}_${interaction.user.id}`]
                    const filter = (i) => i.customId === `manager-jobs_name_${interaction.id}` && i.user.id === interaction.user.id
                    interaction = await interaction.awaitModalSubmit({ filter, time: 60000 }).catch(e => interaction)
                    if (interaction && interaction.type === InteractionType.ModalSubmit) {
                        const modalArgs = {}
                        interaction.fields.fields.each(field => modalArgs[field.customId] = field.value)
                        if (client.cache.jobs.some(e => e.name.toLowerCase() === modalArgs.name.toLowerCase() && e.guildID === interaction.guildId)) {
                            await interaction.update({ components: components })
                            return interaction.followUp({ content: `${client.language({ textId: `Работа с названием`, guildId: interaction.guildId, locale: interaction.locale })} **${modalArgs.name}** ${client.language({ textId: `уже существует, выбери другое название`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
                        }
                        job.name = modalArgs.name
                        await job.save()
                    } else return
                } else
                if (interaction.values?.[0] === "description") {
                    const modal = new ModalBuilder()
                        .setCustomId(`manager-jobs_description_${interaction.id}`)
                        .setTitle(job.name)
                        .setLabelComponents([
                            new LabelBuilder()
                                .setLabel(`${client.language({ textId: `Описание работы`, guildId: interaction.guildId, locale: interaction.locale })}`)
                                .setTextInputComponent(
                                   new TextInputBuilder()
                                        .setCustomId("description")
                                        .setRequired(true)
                                        .setMaxLength(200)
                                        .setStyle(TextInputStyle.Paragraph)
                                        .setValue(job.description)
                                ),
                        ])
                    await interaction.showModal(modal);delete client.globalCooldown[`${interaction.guildId}_${interaction.user.id}`]
                    const filter = (i) => i.customId === `manager-jobs_description_${interaction.id}` && i.user.id === interaction.user.id
                    interaction = await interaction.awaitModalSubmit({ filter, time: 120000 }).catch(e => interaction)
                    if (interaction && interaction.type === InteractionType.ModalSubmit) {
                        const modalArgs = {}
                        interaction.fields.fields.each(field => modalArgs[field.customId] = field.value)
                        job.description = modalArgs.description
                        await job.save()
                    } else return
                } else
                if (interaction.values?.[0] === "action_name") {
                    const modal = new ModalBuilder()
                        .setCustomId(`manager-jobs_action_name_${interaction.id}`)
                        .setTitle(job.name)
                        .setLabelComponents([
                            new LabelBuilder()
                                .setLabel(`${client.language({ textId: `Название действия`, guildId: interaction.guildId, locale: interaction.locale })}`)
                                .setTextInputComponent(
                                    new TextInputBuilder()
                                        .setCustomId("name")
                                        .setRequired(true)
                                        .setMaxLength(20)
                                        .setStyle(TextInputStyle.Short)
                                        .setValue(job[action].name)
                                ),
                        ])
                    await interaction.showModal(modal);delete client.globalCooldown[`${interaction.guildId}_${interaction.user.id}`]
                    const filter = (i) => i.customId === `manager-jobs_action_name_${interaction.id}` && i.user.id === interaction.user.id
                    interaction = await interaction.awaitModalSubmit({ filter, time: 60000 }).catch(e => interaction)
                    if (interaction && interaction.type === InteractionType.ModalSubmit) {
                        const modalArgs = {}
                        interaction.fields.fields.each(field => modalArgs[field.customId] = field.value)
                        job[action].name = modalArgs.name
                        await job.save()
                    } else return
                } else
                if (interaction.values?.[0] === "action_permission") {
                    if (!client.cache.permissions.some(e => e.guildID === interaction.guildId)) {
                        return interaction.reply({ content: `${client.config.emojis.NO} ${client.language({ textId: `На сервере не найдено созданных прессетов прав. Для создания прессета используй команду </manager-permissions create:1150455842294988943>.`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
                    }
                    const components = JSON.parse(JSON.stringify(interaction.message.components))
                    const modal = new ModalBuilder()
                        .setCustomId(`manager-jobs_action_permission_${interaction.id}`)
                        .setTitle(job.name)
                        .setLabelComponents([
                            new LabelBuilder()
                                .setLabel(`${client.language({ textId: `Название права`, guildId: interaction.guildId, locale: interaction.locale })}`)
                                .setTextInputComponent(
                                    new TextInputBuilder()
                                        .setCustomId("name")
                                        .setRequired(false)
                                        .setStyle(TextInputStyle.Short)
                                        .setValue(client.cache.permissions.find(e => e.id === job[action].permission)?.name || "")
                                ),
                        ])
                    await interaction.showModal(modal);delete client.globalCooldown[`${interaction.guildId}_${interaction.user.id}`]
                    const filter = (i) => i.customId === `manager-jobs_action_permission_${interaction.id}` && i.user.id === interaction.user.id
                    interaction = await interaction.awaitModalSubmit({ filter, time: 60000 }).catch(e => interaction)
                    if (interaction && interaction.type === InteractionType.ModalSubmit) {
                        const modalArgs = {}
                        interaction.fields.fields.each(field => modalArgs[field.customId] = field.value)
                        if (!modalArgs.name) {
                            job[action].permission = undefined
                            await job.save()
                        } else {
                            const permission = client.cache.permissions.find(e => e.name.toLowerCase() === modalArgs.name.toLowerCase() && e.guildID === interaction.guildId)
                            if (!permission) {
                                await interaction.update({ components: components })
                                return interaction.followUp({ content: `${client.config.emojis.NO} ${client.language({ textId: `Права с названием`, guildId: interaction.guildId, locale: interaction.locale })} **${modalArgs.name}** ${client.language({ textId: `не существует`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
                            } else {
                                job[action].permission = permission.id
                                await job.save()
                            }
                        }
                    } else return
                } else
                if (interaction.values?.[0] === "success_chance") {
                    const components = JSON.parse(JSON.stringify(interaction.message.components))
                    const modal = new ModalBuilder()
                        .setCustomId(`manager-jobs_success_chance_${interaction.id}`)
                        .setTitle(job.name)
                        .setLabelComponents([
                            new LabelBuilder()
                                .setLabel(`${client.language({ textId: `Шанс успеха (%)`, guildId: interaction.guildId, locale: interaction.locale })}`)
                                .setTextInputComponent(
                                    new TextInputBuilder()
                                        .setCustomId("chance")
                                        .setRequired(true)
                                        .setStyle(TextInputStyle.Short)
                                        .setValue(`${job[action].success.chance}`)
                                ),
                        ])
                    await interaction.showModal(modal);delete client.globalCooldown[`${interaction.guildId}_${interaction.user.id}`]
                    const filter = (i) => i.customId === `manager-jobs_success_chance_${interaction.id}` && i.user.id === interaction.user.id
                    interaction = await interaction.awaitModalSubmit({ filter, time: 60000 }).catch(e => interaction)
                    if (interaction && interaction.type === InteractionType.ModalSubmit) {
                        const modalArgs = {}
                        interaction.fields.fields.each(field => modalArgs[field.customId] = field.value)
                        if (isNaN(+modalArgs.chance)) {
                            await interaction.update({ components: components })
                            return interaction.followUp({ content: `${client.config.emojis.NO} **${modalArgs.chance}** ${client.language({ textId: `не является числом`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
                        }
                        modalArgs.chance = +modalArgs.chance
                        if (modalArgs.chance > 100 || modalArgs.chance <= 0) {
                            await interaction.update({ components: components })
                            return interaction.followUp({ content: `${client.config.emojis.NO} ${client.language({ textId: `Шанс не должен быть`, guildId: interaction.guildId, locale: interaction.locale })} <= 0 ${client.language({ textId: `или`, guildId: interaction.guildId, locale: interaction.locale })} > 100`, flags: ["Ephemeral"] })
                        }
                        job[action].success.chance = modalArgs.chance
                        await job.save()
                    } else return
                } else
                if (interaction.values?.[0] === "messages" || interaction.customId.includes("msg")) {
                    if (interaction.customId.includes("add")) {
                        if (job[action][exodus].messages.length >= 10) {
                            return interaction.reply({ content: `${client.config.emojis.NO} ${client.language({ textId: `Достигнуто максимальное количество сообщений`, guildId: interaction.guildId, locale: interaction.locale })}: 10`, flags: ["Ephemeral"] })
                        }
                        const modal = new ModalBuilder()
                            .setCustomId(`manager-jobs_${exodus}_messages_add_${interaction.id}`)
                            .setTitle(job.name)
                            .setLabelComponents([
                                new LabelBuilder()
                                    .setLabel(`${client.language({ textId: `Сообщение`, guildId: interaction.guildId, locale: interaction.locale })}`)
                                    .setTextInputComponent(
                                        new TextInputBuilder()
                                            .setCustomId("msg")
                                            .setRequired(true)
                                            .setMaxLength(200)
                                            .setStyle(TextInputStyle.Paragraph)
                                            .setPlaceholder(`${client.language({ textId: `Доступные заменители`, guildId: interaction.guildId, locale: interaction.locale })}: {userID} {guildName} {channelId} {items} {cooldown} {cooldownJobs}`)
                                    ),
                            ])
                        await interaction.showModal(modal);delete client.globalCooldown[`${interaction.guildId}_${interaction.user.id}`]
                        const filter = (i) => i.customId === `manager-jobs_${exodus}_messages_add_${interaction.id}` && i.user.id === interaction.user.id
                        interaction = await interaction.awaitModalSubmit({ filter, time: 120000 }).catch(e => interaction)
                        if (interaction && interaction.type === InteractionType.ModalSubmit) {
                            const modalArgs = {}
                            interaction.fields.fields.each(field => modalArgs[field.customId] = field.value)
                            job[action][exodus].messages.push(modalArgs.msg)
                            await job.save()
                        } else return
                    }
                    if (interaction.customId.includes("del")) {
                        if (job[action][exodus].messages.length === 0) {
                            return interaction.reply({ content: `${client.config.emojis.NO} ${client.language({ textId: `Не найдено ни одного сообщения`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
                        }
                        const components = JSON.parse(JSON.stringify(interaction.message.components))
                        const modal = new ModalBuilder()
                            .setCustomId(`manager-jobs_${exodus}_messages_del_${interaction.id}`)
                            .setTitle(job.name)
                            .setLabelComponents([
                                new LabelBuilder()
                                    .setLabel(`${client.language({ textId: `Номер сообщения`, guildId: interaction.guildId, locale: interaction.locale })}`)
                                    .setTextInputComponent(
                                        new TextInputBuilder()
                                            .setCustomId("number")
                                            .setRequired(true)
                                            .setStyle(TextInputStyle.Short)
                                    ),
                            ])
                        await interaction.showModal(modal);delete client.globalCooldown[`${interaction.guildId}_${interaction.user.id}`]
                        const filter = (i) => i.customId === `manager-jobs_${exodus}_messages_del_${interaction.id}` && i.user.id === interaction.user.id
                        interaction = await interaction.awaitModalSubmit({ filter, time: 60000 }).catch(e => interaction)
                        if (interaction && interaction.type === InteractionType.ModalSubmit) {
                            const modalArgs = {}
                            interaction.fields.fields.each(field => modalArgs[field.customId] = field.value)
                            if (isNaN(+modalArgs.number) || !Number.isInteger(+modalArgs.number)) {
                                await interaction.update({ components: components })
                                return interaction.followUp({ content: `${client.config.emojis.NO} **${modalArgs.number}** ${client.language({ textId: `не является целым числом`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
                            }
                            modalArgs.number = +modalArgs.number
                            if (modalArgs.number <= 0) {
                                await interaction.update({ components: components })
                                return interaction.followUp({ content: `${client.config.emojis.NO} ${client.language({ textId: `Номер должен быть`, guildId: interaction.guildId, locale: interaction.locale })} > 0`, flags: ["Ephemeral"] })
                            }
                            if (modalArgs.number > job[action][exodus].messages.length) {
                                await interaction.update({ components: components })
                                return interaction.followUp({ content: `${client.config.emojis.NO} ${client.language({ textId: `Сообщения`, guildId: interaction.guildId, locale: interaction.locale })} №${modalArgs.number} ${client.language({ textId: `не существует`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
                            }
                            job[action][exodus].messages.splice(modalArgs.number - 1, 1)
                            await job.save()
                        } else return
                    }
                    const row = new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setCustomId(`cmd{manager-jobs}usr{${interaction.user.id}}job{${job.id}}act{${action}}exo{${exodus}}editmsgadd`)
                            .setLabel(`${client.language({ textId: `Добавить сообщение`, guildId: interaction.guildId, locale: interaction.locale })}`)
                            .setStyle(ButtonStyle.Success)
                            .setDisabled(job[action][exodus].messages.length >= 10),
                        new ButtonBuilder()
                            .setCustomId(`cmd{manager-jobs}usr{${interaction.user.id}}job{${job.id}}act{${action}}exo{${exodus}}editmsgdel`)
                            .setLabel(`${client.language({ textId: `Удалить сообщение`, guildId: interaction.guildId, locale: interaction.locale })}`)
                            .setStyle(ButtonStyle.Danger)
                            .setDisabled(job[action][exodus].messages.length === 0)
                    )
                    const embed = new EmbedBuilder()
                        .setColor(3093046)
                        .setTitle(`${client.language({ textId: `Сообщения при ${exodus === "success" ? "успехе" : "провале"}`, guildId: interaction.guildId, locale: interaction.locale })}`)
                        .setDescription(job[action][exodus].messages.length ? job[action][exodus].messages.map((msg, index) => `${index+1}. ${msg}`).join("\n") : client.language({ textId: `Отсутствуют`, guildId: interaction.guildId, locale: interaction.locale }))
                    if (interaction.isModalSubmit()) return interaction.update({ embeds: [embed], components: [row], flags: ["Ephemeral"] })
                    else return interaction.reply({ embeds: [embed], components: [row], flags: ["Ephemeral"] })
                } else
                if (interaction.values?.[0] === "images" || interaction.customId.includes("img")) {
                    if (interaction.customId.includes("add")) {
                        if (job[action][exodus].images.length >= 10) {
                            return interaction.reply({ content: `${client.config.emojis.NO} ${client.language({ textId: `Достигнуто максимальное количество изображений`, guildId: interaction.guildId, locale: interaction.locale })}: 10`, flags: ["Ephemeral"] })
                        }
                        const components = JSON.parse(JSON.stringify(interaction.message.components))
                        const modal = new ModalBuilder()
                            .setCustomId(`manager-jobs_${exodus}_images_add_${interaction.id}`)
                            .setTitle(job.name)
                            .setLabelComponents([
                                new LabelBuilder()
                                    .setLabel(`${client.language({ textId: `Ссылка на изображение`, guildId: interaction.guildId, locale: interaction.locale })}`)
                                    .setTextInputComponent(
                                        new TextInputBuilder()
                                            .setCustomId("link")
                                            .setRequired(true)
                                            .setMaxLength(400)
                                            .setStyle(TextInputStyle.Short)
                                    ),
                            ])
                        await interaction.showModal(modal);delete client.globalCooldown[`${interaction.guildId}_${interaction.user.id}`]
                        const filter = (i) => i.customId === `manager-jobs_${exodus}_images_add_${interaction.id}` && i.user.id === interaction.user.id
                        interaction = await interaction.awaitModalSubmit({ filter, time: 120000 }).catch(e => interaction)
                        if (interaction && interaction.type === InteractionType.ModalSubmit) {
                            const modalArgs = {}
                            interaction.fields.fields.each(field => modalArgs[field.customId] = field.value)
                            const image = await isImageURL(modalArgs.link)
                            if (!image) {
                                await interaction.update({ components: components })
                                return interaction.followUp({ content: `${client.config.emojis.NO} ${client.language({ textId: `Строка`, guildId: interaction.guildId, locale: interaction.locale })} **${modalArgs.link}** ${client.language({ textId: `не является прямой ссылкой на изображение`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
                            }
                            job[action][exodus].images.push(modalArgs.link)
                            await job.save()
                        } else return
                    }
                    if (interaction.customId.includes("del")) {
                        if (job[action][exodus].images.length === 0) {
                            return interaction.reply({ content: `${client.config.emojis.NO} ${client.language({ textId: `Не найдено ни одного изображения`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
                        }
                        const components = JSON.parse(JSON.stringify(interaction.message.components))
                        const modal = new ModalBuilder()
                            .setCustomId(`manager-jobs_${exodus}_images_del_${interaction.id}`)
                            .setTitle(job.name)
                            .setLabelComponents([
                                new LabelBuilder()
                                    .setLabel(`${client.language({ textId: `Номер изображения`, guildId: interaction.guildId, locale: interaction.locale })}`)
                                    .setTextInputComponent(
                                        new TextInputBuilder()
                                            .setCustomId("number")
                                            .setRequired(true)
                                            .setStyle(TextInputStyle.Short)
                                    ),
                            ])
                        await interaction.showModal(modal);delete client.globalCooldown[`${interaction.guildId}_${interaction.user.id}`]
                        const filter = (i) => i.customId === `manager-jobs_${exodus}_images_del_${interaction.id}` && i.user.id === interaction.user.id
                        interaction = await interaction.awaitModalSubmit({ filter, time: 60000 }).catch(e => interaction)
                        if (interaction && interaction.type === InteractionType.ModalSubmit) {
                            const modalArgs = {}
                            interaction.fields.fields.each(field => modalArgs[field.customId] = field.value)
                            if (isNaN(+modalArgs.number) || !Number.isInteger(+modalArgs.number)) {
                                await interaction.update({ components: components })
                                return interaction.followUp({ content: `${client.config.emojis.NO} **${modalArgs.number}** ${client.language({ textId: `не является целым числом`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
                            }
                            modalArgs.number = +modalArgs.number
                            if (modalArgs.number <= 0) {
                                await interaction.update({ components: components })
                                return interaction.followUp({ content: `${client.config.emojis.NO} ${client.language({ textId: `Номер должен быть`, guildId: interaction.guildId, locale: interaction.locale })} > 0`, flags: ["Ephemeral"] })
                            }
                            if (modalArgs.number > job[action][exodus].images.length) {
                                await interaction.update({ components: components })
                                return interaction.followUp({ content: `${client.config.emojis.NO} ${client.language({ textId: `Сообщения`, guildId: interaction.guildId, locale: interaction.locale })} №${modalArgs.number} ${client.language({ textId: `не существует`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
                            }
                            job[action][exodus].images.splice(modalArgs.number - 1, 1)
                            await job.save()
                        } else return
                    }
                    const row = new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setCustomId(`cmd{manager-jobs}usr{${interaction.user.id}}job{${job.id}}act{${action}}exo{${exodus}}editimgadd`)
                            .setLabel(`${client.language({ textId: `Добавить изображение`, guildId: interaction.guildId, locale: interaction.locale })}`)
                            .setStyle(ButtonStyle.Success)
                            .setDisabled(job[action][exodus].images.length >= 10),
                        new ButtonBuilder()
                            .setCustomId(`cmd{manager-jobs}usr{${interaction.user.id}}job{${job.id}}act{${action}}exo{${exodus}}editimgdel`)
                            .setLabel(`${client.language({ textId: `Удалить изображение`, guildId: interaction.guildId, locale: interaction.locale })}`)
                            .setStyle(ButtonStyle.Danger)
                            .setDisabled(job[action][exodus].images.length === 0)
                    )
                    const embed = new EmbedBuilder()
                        .setColor(3093046)
                        .setTitle(`${client.language({ textId: `Изображения при ${exodus === "success" ? "успехе" : "провале"}`, guildId: interaction.guildId, locale: interaction.locale })}`)
                        .setDescription(job[action][exodus].images.length ? job[action][exodus].images.map((img, index) => `${index+1}. ${img}`).join("\n") : client.language({ textId: `Отсутствуют`, guildId: interaction.guildId, locale: interaction.locale }))
                    if (interaction.isModalSubmit()) return interaction.update({ embeds: [embed], components: [row], flags: ["Ephemeral"] })
                    else return interaction.reply({ embeds: [embed], components: [row], flags: ["Ephemeral"] })
                } else
                if (interaction.values?.[0] === "cooldown") {
                    const modal = new ModalBuilder()
                        .setCustomId(`manager-jobs_${exodus}_cooldown_${interaction.id}`)
                        .setTitle(job.name)
                        .setLabelComponents([
                            new LabelBuilder()
                                .setLabel(`${client.language({ textId: `Кулдаун для этой работы (сек.)`, guildId: interaction.guildId, locale: interaction.locale })}`)
                                .setTextInputComponent(
                                    new TextInputBuilder()
                                        .setCustomId("cooldown")
                                        .setRequired(true)
                                        .setStyle(TextInputStyle.Short)
                                        .setValue(`${job[action][exodus].cooldown}`)
                                ),
                        ])
                    await interaction.showModal(modal);delete client.globalCooldown[`${interaction.guildId}_${interaction.user.id}`]
                    const filter = (i) => i.customId === `manager-jobs_${exodus}_cooldown_${interaction.id}` && i.user.id === interaction.user.id
                    interaction = await interaction.awaitModalSubmit({ filter, time: 60000 }).catch(e => interaction)
                    if (interaction && interaction.type === InteractionType.ModalSubmit) {
                        const modalArgs = {}
                        interaction.fields.fields.each(field => modalArgs[field.customId] = field.value)
                        if (isNaN(+modalArgs.cooldown) || !Number.isInteger(+modalArgs.cooldown)) {
                            await interaction.update({ components: components })
                            return interaction.followUp({ content: `${client.config.emojis.NO} **${modalArgs.cooldown}** ${client.language({ textId: `не является целым числом`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
                        }
                        modalArgs.cooldown = +modalArgs.cooldown
                        if (modalArgs.cooldown < 0 || modalArgs.cooldown > 604800) {
                            await interaction.update({ components: components })
                            return interaction.followUp({ content: `${client.config.emojis.NO} ${client.language({ textId: `Кулдаун не должен быть`, guildId: interaction.guildId, locale: interaction.locale })} = 0 ${client.language({ textId: `или`, guildId: interaction.guildId, locale: interaction.locale })} > 604800`, flags: ["Ephemeral"] })
                        }
                        job[action][exodus].cooldown = modalArgs.cooldown
                        await job.save()
                    } else return
                } else
                if (interaction.values?.[0] === "cooldownJobs") {
                    const modal = new ModalBuilder()
                        .setCustomId(`manager-jobs_${exodus}_cooldownJobs_${interaction.id}`)
                        .setTitle(job.name)
                        .setLabelComponents([
                            new LabelBuilder()
                                .setLabel(`${client.language({ textId: `Кулдаун для всей работы (сек.)`, guildId: interaction.guildId, locale: interaction.locale })}`)
                                .setTextInputComponent(
                                    new TextInputBuilder()
                                        .setCustomId("cooldownJobs")
                                        .setRequired(true)
                                        .setStyle(TextInputStyle.Short)
                                        .setValue(`${job[action][exodus].cooldownJobs}`)
                                ),
                        ])
                    await interaction.showModal(modal);delete client.globalCooldown[`${interaction.guildId}_${interaction.user.id}`]
                    const filter = (i) => i.customId === `manager-jobs_${exodus}_cooldownJobs_${interaction.id}` && i.user.id === interaction.user.id
                    interaction = await interaction.awaitModalSubmit({ filter, time: 60000 }).catch(e => interaction)
                    if (interaction && interaction.type === InteractionType.ModalSubmit) {
                        const modalArgs = {}
                        interaction.fields.fields.each(field => modalArgs[field.customId] = field.value)
                        if (isNaN(+modalArgs.cooldownJobs) || !Number.isInteger(+modalArgs.cooldownJobs)) {
                            await interaction.update({ components: components })
                            return interaction.followUp({ content: `${client.config.emojis.NO} **${modalArgs.cooldownJobs}** ${client.language({ textId: `не является целым числом`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
                        }
                        modalArgs.cooldownJobs = +modalArgs.cooldownJobs
                        if (modalArgs.cooldownJobs < 0 || modalArgs.cooldownJobs > 604800) {
                            await interaction.update({ components: components })
                            return interaction.followUp({ content: `${client.config.emojis.NO} ${client.language({ textId: `Кулдаун не должен быть`, guildId: interaction.guildId, locale: interaction.locale })} < 0 ${client.language({ textId: `или`, guildId: interaction.guildId, locale: interaction.locale })} > 604800`, flags: ["Ephemeral"] })
                        }
                        job[action][exodus].cooldownJobs = modalArgs.cooldownJobs
                        await job.save()
                    } else return
                } else
                if (interaction.values?.[0] === "rewards") {
                    const components = JSON.parse(JSON.stringify(interaction.message.components))
                    interaction.message.components.forEach(row => row.components.forEach(component => {
                        component.data.disabled = true
                    }))
                    await interaction.update({ components: interaction.message.components })
                    await interaction.followUp({ 
                        content: `${client.language({ textId: `Выбери награду для ${exodus === "success" ? "успеха" : "провала"}`, guildId: interaction.guildId, locale: interaction.locale })}`,
                        components: [
                            new ActionRowBuilder()
                                .addComponents(
                                    new ButtonBuilder()
                                        .setCustomId("manager-jobs_add_reward_item")
                                        .setLabel(client.language({ textId: `Предмет`, guildId: interaction.guildId, locale: interaction.locale }))
                                        .setEmoji(client.config.emojis.box)
                                        .setStyle(ButtonStyle.Secondary),
                                    new ButtonBuilder()
                                        .setCustomId("manager-jobs_add_reward_currency")
                                        .setLabel(settings.currencyName)
                                        .setEmoji(settings.displayCurrencyEmoji)
                                        .setStyle(ButtonStyle.Secondary),
                                    new ButtonBuilder()
                                        .setCustomId("manager-jobs_add_reward_rp")
                                        .setLabel(client.language({ textId: `Репутация`, guildId: interaction.guildId, locale: interaction.locale }))
                                        .setEmoji(client.config.emojis.RP)
                                        .setStyle(ButtonStyle.Secondary),
                                    new ButtonBuilder()
                                        .setCustomId("manager-jobs_add_reward_xp")
                                        .setLabel(client.language({ textId: `Опыт`, guildId: interaction.guildId, locale: interaction.locale }))
                                        .setEmoji(client.config.emojis.XP)
                                        .setStyle(ButtonStyle.Secondary),
                                ),
                            new ActionRowBuilder()
                                .addComponents(
                                    new ButtonBuilder()
                                        .setCustomId("manager-jobs_add_reward_cancel")
                                        .setLabel(client.language({ textId: `ОТМЕНА`, guildId: interaction.guildId, locale: interaction.locale }))
                                        .setStyle(ButtonStyle.Danger),
                                ),
                        ],
                        flags: ["Ephemeral"]
                    })    
                    const filter = (i) => i.customId.includes(`manager-jobs_add_reward`) && i.user.id === interaction.user.id
                    let interaction2 = await interaction.channel.awaitMessageComponent({ filter, time: 30000 }).catch(e => null)
                    if (interaction2 && interaction2.customId.includes("manager-jobs_add_reward")) {
                        let itemID
                        let minAmount
                        let maxAmount
                        if (interaction2.customId.includes("item")) {
                            const modal = new ModalBuilder()
                                .setCustomId(`manager-jobs_${exodus}_rewards_add_item_${interaction.id}`)
                                .setTitle(job.name)
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
                                                .setCustomId("minAmount")
                                                .setRequired(true)
                                                .setStyle(TextInputStyle.Short)
                                        ),
                                    new LabelBuilder()
                                        .setLabel(`${client.language({ textId: `Макс. количество`, guildId: interaction.guildId, locale: interaction.locale })}`)
                                        .setTextInputComponent(
                                            new TextInputBuilder()
                                                .setCustomId("maxAmount")
                                                .setRequired(true)
                                                .setStyle(TextInputStyle.Short)
                                        ),
                                ])
                            await interaction2.showModal(modal);delete client.globalCooldown[`${interaction2.guildId}_${interaction2.user.id}`]
                            const filter = (i) => i.customId === `manager-jobs_${exodus}_rewards_add_item_${interaction.id}` && i.user.id === interaction.user.id
                            interaction2 = await interaction2.awaitModalSubmit({ filter, time: 60000 }).catch(e => interaction)
                            if (interaction2 && interaction2.type === InteractionType.ModalSubmit) {
                                const modalArgs = {}
                                interaction2.fields.fields.each(field => modalArgs[field.customId] = field.value)
                                const item = client.cache.items.find(e => e.guildID === interaction.guildId && e.name.toLowerCase() === modalArgs.name.toLowerCase() && !e.temp)
                                if (!item) {
                                    await interaction2.update({ content: `${client.config.emojis.NO} ${client.language({ textId: `Такого предмета не существует`, guildId: interaction.guildId, locale: interaction.locale })}`, components: [] })
                                    return interaction.editReply({ components: components })
                                }
                                if (isNaN(+modalArgs.minAmount)) {
                                    await interaction2.update({ content: `${client.config.emojis.NO} **${modalArgs.minAmount}** ${client.language({ textId: `не является числом`, guildId: interaction.guildId, locale: interaction.locale })}`, components: [], flags: ["Ephemeral"] })
                                    return interaction.editReply({ components: components })
                                }
                                if (isNaN(+modalArgs.maxAmount)) {
                                    await interaction2.update({ content: `${client.config.emojis.NO} **${modalArgs.maxAmount}** ${client.language({ textId: `не является числом`, guildId: interaction.guildId, locale: interaction.locale })}`, components: [], flags: ["Ephemeral"] })
                                    return interaction.editReply({ components: components })
                                }
                                modalArgs.minAmount = +modalArgs.minAmount
                                modalArgs.maxAmount = +modalArgs.maxAmount
                                if (modalArgs.minAmount < -100000000000 || modalArgs.minAmount > 100000000000 || modalArgs.maxAmount < -100000000000 || modalArgs.maxAmount > 100000000000) {
                                    await interaction.update({ content: `${client.config.emojis.NO} ${client.language({ textId: `Количество не должно быть`, guildId: interaction.guildId, locale: interaction.locale })} < -100000000000 ${client.language({ textId: `или`, guildId: interaction.guildId, locale: interaction.locale })} > 100000000000`, components: [], flags: ["Ephemeral"] })
                                    return interaction.editReply({ components: components })
                                }
                                if (minAmount > maxAmount) {
                                    await interaction.update({ content: `${client.config.emojis.NO} ${client.language({ textId: `Минимальное количество не должно быть больше максимального количества`, guildId: interaction.guildId, locale: interaction.locale })}`, components: [], flags: ["Ephemeral"] })
                                    return interaction.editReply({ components: components })
                                }
                                itemID = item.itemID
                                minAmount = modalArgs.minAmount
                                maxAmount = modalArgs.maxAmount
                                interaction2.update({ content: client.config.emojis.YES, components: [] })
                            } else return
                        } else
                        if (interaction2.customId.includes("currency")) {
                            const modal = new ModalBuilder()
                                .setCustomId(`manager-jobs_${exodus}_rewards_add_currency_${interaction.id}`)
                                .setTitle(job.name)
                                .setLabelComponents([
                                    new LabelBuilder()
                                        .setLabel(`${client.language({ textId: `Мин. количество`, guildId: interaction.guildId, locale: interaction.locale })}`)
                                        .setTextInputComponent(
                                            new TextInputBuilder()
                                                .setCustomId("minAmount")
                                                .setRequired(true)
                                                .setStyle(TextInputStyle.Short)
                                        ),
                                    new LabelBuilder()
                                        .setLabel(`${client.language({ textId: `Макс. количество`, guildId: interaction.guildId, locale: interaction.locale })}`)
                                        .setTextInputComponent(
                                            new TextInputBuilder()
                                                .setCustomId("maxAmount")
                                                .setRequired(true)
                                                .setStyle(TextInputStyle.Short)
                                        ),
                                ])
                            await interaction2.showModal(modal);delete client.globalCooldown[`${interaction2.guildId}_${interaction2.user.id}`]
                            const filter = (i) => i.customId === `manager-jobs_${exodus}_rewards_add_currency_${interaction.id}` && i.user.id === interaction.user.id
                            interaction2 = await interaction2.awaitModalSubmit({ filter, time: 60000 }).catch(e => interaction)
                            if (interaction2 && interaction2.type === InteractionType.ModalSubmit) {
                                const modalArgs = {}
                                interaction2.fields.fields.each(field => modalArgs[field.customId] = field.value)
                                if (isNaN(+modalArgs.minAmount)) {
                                    await interaction2.update({ content: `${client.config.emojis.NO} **${modalArgs.minAmount}** ${client.language({ textId: `не является числом`, guildId: interaction.guildId, locale: interaction.locale })}`, components: [], flags: ["Ephemeral"] })
                                    return interaction.editReply({ components: components })
                                }
                                if (isNaN(+modalArgs.maxAmount)) {
                                    await interaction2.update({ content: `${client.config.emojis.NO} **${modalArgs.maxAmount}** ${client.language({ textId: `не является числом`, guildId: interaction.guildId, locale: interaction.locale })}`, components: [], flags: ["Ephemeral"] })
                                    return interaction.editReply({ components: components })
                                }
                                modalArgs.minAmount = +modalArgs.minAmount
                                modalArgs.maxAmount = +modalArgs.maxAmount
                                if (modalArgs.minAmount < -100000000000 || modalArgs.minAmount > 100000000000 || modalArgs.maxAmount < -100000000000 || modalArgs.maxAmount > 100000000000) {
                                    await interaction.update({ content: `${client.config.emojis.NO} ${client.language({ textId: `Количество не должно быть`, guildId: interaction.guildId, locale: interaction.locale })} < -100000000000 ${client.language({ textId: `или`, guildId: interaction.guildId, locale: interaction.locale })} > 100000000000`, components: [], flags: ["Ephemeral"] })
                                    return interaction.editReply({ components: components })
                                }
                                if (minAmount > maxAmount) {
                                    await interaction.update({ content: `${client.config.emojis.NO} ${client.language({ textId: `Минимальное количество не должно быть больше максимального количества`, guildId: interaction.guildId, locale: interaction.locale })}`, components: [], flags: ["Ephemeral"] })
                                    return interaction.editReply({ components: components })
                                }
                                minAmount = modalArgs.minAmount
                                maxAmount = modalArgs.maxAmount
                                itemID = "currency"
                                interaction2.update({ content: client.config.emojis.YES, components: [] })
                            } else return
                        } else
                        if (interaction2.customId.includes("rp")) {
                            const modal = new ModalBuilder()
                                .setCustomId(`manager-jobs_${exodus}_rewards_add_rp_${interaction.id}`)
                                .setTitle(job.name)
                                .setLabelComponents([
                                    new LabelBuilder()
                                        .setLabel(`${client.language({ textId: `Мин. количество`, guildId: interaction.guildId, locale: interaction.locale })}`)
                                        .setTextInputComponent(
                                            new TextInputBuilder()
                                                .setCustomId("minAmount")
                                                .setRequired(true)
                                                .setStyle(TextInputStyle.Short)
                                        ),
                                    new LabelBuilder()
                                        .setLabel(`${client.language({ textId: `Макс. количество`, guildId: interaction.guildId, locale: interaction.locale })}`)
                                        .setTextInputComponent(
                                            new TextInputBuilder()
                                                .setCustomId("maxAmount")
                                                .setRequired(true)
                                                .setStyle(TextInputStyle.Short)
                                        ),
                                ])
                            await interaction2.showModal(modal);delete client.globalCooldown[`${interaction2.guildId}_${interaction2.user.id}`]
                            const filter = (i) => i.customId === `manager-jobs_${exodus}_rewards_add_rp_${interaction.id}` && i.user.id === interaction.user.id
                            interaction2 = await interaction2.awaitModalSubmit({ filter, time: 60000 }).catch(e => interaction)
                            if (interaction2 && interaction2.type === InteractionType.ModalSubmit) {
                                const modalArgs = {}
                                interaction2.fields.fields.each(field => modalArgs[field.customId] = field.value)
                                if (isNaN(+modalArgs.minAmount)) {
                                    await interaction2.update({ content: `${client.config.emojis.NO} **${modalArgs.minAmount}** ${client.language({ textId: `не является числом`, guildId: interaction.guildId, locale: interaction.locale })}`, components: [], flags: ["Ephemeral"] })
                                    return interaction.editReply({ components: components })
                                }
                                if (isNaN(+modalArgs.maxAmount)) {
                                    await interaction2.update({ content: `${client.config.emojis.NO} **${modalArgs.maxAmount}** ${client.language({ textId: `не является числом`, guildId: interaction.guildId, locale: interaction.locale })}`, components: [], flags: ["Ephemeral"] })
                                    return interaction.editReply({ components: components })
                                }
                                modalArgs.minAmount = +modalArgs.minAmount
                                modalArgs.maxAmount = +modalArgs.maxAmount
                                if (modalArgs.minAmount < -100000000000 || modalArgs.minAmount > 100000000000 || modalArgs.maxAmount < -100000000000 || modalArgs.maxAmount > 100000000000) {
                                    await interaction.update({ content: `${client.config.emojis.NO} ${client.language({ textId: `Количество не должно быть`, guildId: interaction.guildId, locale: interaction.locale })} < -100000000000 ${client.language({ textId: `или`, guildId: interaction.guildId, locale: interaction.locale })} > 100000000000`, components: [], flags: ["Ephemeral"] })
                                    return interaction.editReply({ components: components })
                                }
                                if (minAmount > maxAmount) {
                                    await interaction.update({ content: `${client.config.emojis.NO} ${client.language({ textId: `Минимальное количество не должно быть больше максимального количества`, guildId: interaction.guildId, locale: interaction.locale })}`, components: [], flags: ["Ephemeral"] })
                                    return interaction.editReply({ components: components })
                                }
                                minAmount = modalArgs.minAmount
                                maxAmount = modalArgs.maxAmount
                                itemID = "rp"
                                interaction2.update({ content: client.config.emojis.YES, components: [] })
                            } else return
                        } else
                        if (interaction2.customId.includes("xp")) {
                            const modal = new ModalBuilder()
                                .setCustomId(`manager-jobs_${exodus}_rewards_add_xp_${interaction.id}`)
                                .setTitle(job.name)
                                .setLabelComponents([
                                    new LabelBuilder()
                                        .setLabel(`${client.language({ textId: `Мин. количество`, guildId: interaction.guildId, locale: interaction.locale })}`)
                                        .setTextInputComponent(
                                            new TextInputBuilder()
                                                .setCustomId("minAmount")
                                                .setRequired(true)
                                                .setStyle(TextInputStyle.Short)
                                        ),
                                    new LabelBuilder()
                                        .setLabel(`${client.language({ textId: `Макс. количество`, guildId: interaction.guildId, locale: interaction.locale })}`)
                                        .setTextInputComponent(
                                            new TextInputBuilder()
                                                .setCustomId("maxAmount")
                                                .setRequired(true)
                                                .setStyle(TextInputStyle.Short)
                                        ),
                                ])
                            await interaction2.showModal(modal);delete client.globalCooldown[`${interaction2.guildId}_${interaction2.user.id}`]
                            const filter = (i) => i.customId === `manager-jobs_${exodus}_rewards_add_xp_${interaction.id}` && i.user.id === interaction.user.id
                            interaction2 = await interaction2.awaitModalSubmit({ filter, time: 60000 }).catch(e => interaction)
                            if (interaction2 && interaction2.type === InteractionType.ModalSubmit) {
                                const modalArgs = {}
                                interaction2.fields.fields.each(field => modalArgs[field.customId] = field.value)
                                if (isNaN(+modalArgs.minAmount)) {
                                    await interaction2.update({ content: `${client.config.emojis.NO} **${modalArgs.minAmount}** ${client.language({ textId: `не является числом`, guildId: interaction.guildId, locale: interaction.locale })}`, components: [], flags: ["Ephemeral"] })
                                    return interaction.editReply({ components: components })
                                }
                                if (isNaN(+modalArgs.maxAmount)) {
                                    await interaction2.update({ content: `${client.config.emojis.NO} **${modalArgs.maxAmount}** ${client.language({ textId: `не является числом`, guildId: interaction.guildId, locale: interaction.locale })}`, components: [], flags: ["Ephemeral"] })
                                    return interaction.editReply({ components: components })
                                }
                                modalArgs.minAmount = +modalArgs.minAmount
                                modalArgs.maxAmount = +modalArgs.maxAmount
                                if (modalArgs.minAmount < -100000000000 || modalArgs.minAmount > 100000000000 || modalArgs.maxAmount < -100000000000 || modalArgs.maxAmount > 100000000000) {
                                    await interaction.update({ content: `${client.config.emojis.NO} ${client.language({ textId: `Количество не должно быть`, guildId: interaction.guildId, locale: interaction.locale })} < -100000000000 ${client.language({ textId: `или`, guildId: interaction.guildId, locale: interaction.locale })} > 100000000000`, components: [], flags: ["Ephemeral"] })
                                    return interaction.editReply({ components: components })
                                }
                                if (minAmount > maxAmount) {
                                    await interaction.update({ content: `${client.config.emojis.NO} ${client.language({ textId: `Минимальное количество не должно быть больше максимального количества`, guildId: interaction.guildId, locale: interaction.locale })}`, components: [], flags: ["Ephemeral"] })
                                    return interaction.editReply({ components: components })
                                }
                                minAmount = modalArgs.minAmount
                                maxAmount = modalArgs.maxAmount
                                itemID = "xp"
                                interaction2.update({ content: client.config.emojis.YES, components: [] })
                            } else return
                        } else
                        if (interaction2.customId.includes("cancel")) {
                            interaction2.update({ content: `${client.config.emojis.YES} ${client.language({ textId: `Выбор отменён`, guildId: interaction.guildId, locale: interaction.locale })}`, components: [] })
                            return interaction.editReply({ components: components })
                        }
                        const item = job[action][exodus].rewards.find(e => { return e.itemID === itemID })
                        if (item) {
                            if (minAmount === 0 && maxAmount === 0) {
                                job[action][exodus].rewards = job[action][exodus].rewards.filter(e => e.itemID !== itemID )
                            } else {
                                item.minAmount = minAmount
                                item.maxAmount = maxAmount
                            }
                        } else if (minAmount !== 0 && maxAmount !== 0) {
                            if (job[action][exodus].rewards.length >= 10) {
                                await interaction.update({ components: components })
                                return interaction.followUp({ content: `${client.config.emojis.NO} ${client.language({ textId: `Достигнуто максимальное количество наград`, guildId: interaction.guildId, locale: interaction.locale })}: 10` })
                            }
                            job[action][exodus].rewards.push({
                                itemID: itemID,
                                minAmount: minAmount,
                                maxAmount: maxAmount,
                            })
                        }
                        await job.save()
                    }
                } else
                if (interaction.values?.[0] === "hideRewards") {
                    job[action][exodus].hideRewards = !job[action][exodus].hideRewards
                    await job.save()
                } else
                if (interaction.values?.[0] === "hideChance") {
                    job[action].hideChance = !job[action].hideChance
                    await job.save()
                } else
                if (interaction.values?.[0] === "hideCooldowns") {
                    job[action][exodus].hideCooldowns = !job[action][exodus].hideCooldowns
                    await job.save()
                } else
                if (interaction.values?.[0] === "hide") {
                    job.hide = !job.hide
                    await job.save()
                }
            }
            if (interaction.customId.includes("onoff")) {
                job.enable = !job.enable
                await job.save()
            }
        }
        const embed = new EmbedBuilder()
            .setAuthor({ name: `${client.language({ textId: `Управление работой`, guildId: interaction.guildId, locale: interaction.locale })}` })
            .setTitle(job.name)
            .setColor(Colors.DarkButNotBlack)
            .setDescription([
                job.description,
                `${client.language({ textId: `Скрывать работу из автозаполнения, если не доступна`, guildId: interaction.guildId, locale: interaction.locale })}: ${job.hide ? `${client.language({ textId: `Да`, guildId: interaction.guildId, locale: interaction.locale })}` : `${client.language({ textId: `Нет`, guildId: interaction.guildId, locale: interaction.locale })}`}`
            ].filter(e => e).join("\n"))
            .setFields([
                {
                    name: job.action1.name,
                    value: [
                        client.config.emojis.UP + `**${client.language({ textId: `Успех`, guildId: interaction.guildId, locale: interaction.locale })} (${job.action1.success.chance}%)**`,
                        `* ${client.language({ textId: `Кулдаун этой работы после успеха`, guildId: interaction.guildId, locale: interaction.locale })}${job.action1.success.hideCooldowns ? ` (${client.language({ textId: `скрыт`, guildId: interaction.guildId, locale: interaction.locale })})` : ``}: \`${job.action1.success.cooldown ? transformSecs(client, job.action1.success.cooldown * 1000, interaction.guildId, interaction.locale) : `${client.language({ textId: `отсутствует`, guildId: interaction.guildId, locale: interaction.locale })}`}\``,
                        `* ${client.language({ textId: `Кулдаун всей работы после успеха`, guildId: interaction.guildId, locale: interaction.locale })}${job.action1.success.hideCooldowns ? ` (${client.language({ textId: `скрыт`, guildId: interaction.guildId, locale: interaction.locale })})` : ``}: \`${job.action1.success.cooldownJobs ? transformSecs(client, job.action1.success.cooldownJobs * 1000, interaction.guildId, interaction.locale) : `${client.language({ textId: `отсутствует`, guildId: interaction.guildId, locale: interaction.locale })}`}\``,
                        `* ${client.language({ textId: `Предметы после успеха`, guildId: interaction.guildId, locale: interaction.locale })}${job.action1.success.hideRewards ? ` (${client.language({ textId: `скрыты`, guildId: interaction.guildId, locale: interaction.locale })})` : ``}: ${job.action1.success.rewards.length ? `${await Promise.all(job.action1.success.rewards.map(async e => {
                                if (e.itemID === "currency") {
                                    return `${settings.displayCurrencyEmoji}${settings.currencyName} (${e.minAmount !== e.maxAmount ? `${e.minAmount}~${e.maxAmount}` : e.minAmount})`
                                } else
                                if (e.itemID === "xp") {
                                    return `${client.config.emojis.XP}${client.language({ textId: `Опыт`, guildId: interaction.guildId, locale: interaction.locale })} (${e.minAmount !== e.maxAmount ? `${e.minAmount}~${e.maxAmount}` : e.minAmount})`
                                } else
                                if (e.itemID === "rp") {
                                    return `${client.config.emojis.RP}${client.language({ textId: `Репутация`, guildId: interaction.guildId, locale: interaction.locale })} (${e.minAmount !== e.maxAmount ? `${e.minAmount}~${e.maxAmount}` : e.minAmount})`
                                } else {
                                    const item = client.cache.items.find(item => item.itemID === e.itemID && !item.temp && item.enabled)
                                    if (item) return `${item.displayEmoji}${item.name} (${e.minAmount !== e.maxAmount ? `${e.minAmount}~${e.maxAmount}` : e.minAmount})`
                                    else return false
                                }
                        }).filter(e => e)).then(rewards => rewards.join(", "))}` : "🚫"}`,
                        client.config.emojis.DOWN + `**${client.language({ textId: `Провал`, guildId: interaction.guildId, locale: interaction.locale })} (${100-job.action1.success.chance}%)**`,
                        `* ${client.language({ textId: `Кулдаун этой работы после провала`, guildId: interaction.guildId, locale: interaction.locale })}${job.action1.fail.hideCooldowns ? ` (${client.language({ textId: `скрыт`, guildId: interaction.guildId, locale: interaction.locale })})` : ``}: \`${job.action1.fail.cooldown ? transformSecs(client, job.action1.fail.cooldown * 1000, interaction.guildId, interaction.locale) : `${client.language({ textId: `отсутствует`, guildId: interaction.guildId, locale: interaction.locale })}`}\``,
                        `* ${client.language({ textId: `Кулдаун всей работы после провала`, guildId: interaction.guildId, locale: interaction.locale })}${job.action1.fail.hideCooldowns ? ` (${client.language({ textId: `скрыт`, guildId: interaction.guildId, locale: interaction.locale })})` : ``}: \`${job.action1.fail.cooldownJobs ? transformSecs(client, job.action1.fail.cooldownJobs * 1000, interaction.guildId, interaction.locale) : `${client.language({ textId: `отсутствует`, guildId: interaction.guildId, locale: interaction.locale })}`}\``,
                        `* ${client.language({ textId: `Предметы после провала`, guildId: interaction.guildId, locale: interaction.locale })}${job.action1.fail.hideRewards ? ` (${client.language({ textId: `скрыты`, guildId: interaction.guildId, locale: interaction.locale })})` : ``}: ${job.action1.fail.rewards.length ? `${await Promise.all(job.action1.fail.rewards.map(async e => {
                            if (e.itemID === "currency") {
                                return `${settings.displayCurrencyEmoji}${settings.currencyName} (${e.minAmount !== e.maxAmount ? `${e.minAmount}~${e.maxAmount}` : e.minAmount})`
                            } else
                            if (e.itemID === "xp") {
                                return `${client.config.emojis.XP}${client.language({ textId: `Опыт`, guildId: interaction.guildId, locale: interaction.locale })} (${e.minAmount !== e.maxAmount ? `${e.minAmount}~${e.maxAmount}` : e.minAmount})`
                            } else
                            if (e.itemID === "rp") {
                                return `${client.config.emojis.RP}${client.language({ textId: `Репутация`, guildId: interaction.guildId, locale: interaction.locale })} (${e.minAmount !== e.maxAmount ? `${e.minAmount}~${e.maxAmount}` : e.minAmount})`
                            } else {
                                const item = client.cache.items.find(item => item.itemID === e.itemID && !item.temp && item.enabled)
                                if (item) return `${item.displayEmoji}${item.name} (${e.minAmount !== e.maxAmount ? `${e.minAmount}~${e.maxAmount}` : e.minAmount})`
                                else return false
                            }
                    }).filter(e => e)).then(rewards => rewards.join(", "))}` : "🚫"}`,
                    ].join("\n"),
                    inline: true
                },
                {
                    name: job.action2.name,
                    value: [
                        client.config.emojis.UP + `**${client.language({ textId: `Успех`, guildId: interaction.guildId, locale: interaction.locale })} (${job.action2.success.chance}%)**`,
                        `* ${client.language({ textId: `Кулдаун этой работы после успеха`, guildId: interaction.guildId, locale: interaction.locale })}${job.action2.success.hideCooldowns ? ` (${client.language({ textId: `скрыт`, guildId: interaction.guildId, locale: interaction.locale })})` : ``}: \`${job.action2.success.cooldown ? transformSecs(client, job.action2.success.cooldown * 1000, interaction.guildId, interaction.locale) : `${client.language({ textId: `отсутствует`, guildId: interaction.guildId, locale: interaction.locale })}`}\``,
                        `* ${client.language({ textId: `Кулдаун всей работы после успеха`, guildId: interaction.guildId, locale: interaction.locale })}${job.action2.success.hideCooldowns ? ` (${client.language({ textId: `скрыт`, guildId: interaction.guildId, locale: interaction.locale })})` : ``}: \`${job.action2.success.cooldownJobs ? transformSecs(client, job.action2.success.cooldownJobs * 1000, interaction.guildId, interaction.locale) : `${client.language({ textId: `отсутствует`, guildId: interaction.guildId, locale: interaction.locale })}`}\``,
                        `* ${client.language({ textId: `Предметы после успеха`, guildId: interaction.guildId, locale: interaction.locale })}${job.action2.success.hideRewards ? ` (${client.language({ textId: `скрыты`, guildId: interaction.guildId, locale: interaction.locale })})` : ``}: ${job.action2.success.rewards.length ? `${await Promise.all(job.action2.success.rewards.map(async e => {
                            if (e.itemID === "currency") {
                                return `${settings.displayCurrencyEmoji}${settings.currencyName} (${e.minAmount !== e.maxAmount ? `${e.minAmount}~${e.maxAmount}` : e.minAmount})`
                            } else
                            if (e.itemID === "xp") {
                                return `${client.config.emojis.XP}${client.language({ textId: `Опыт`, guildId: interaction.guildId, locale: interaction.locale })} (${e.minAmount !== e.maxAmount ? `${e.minAmount}~${e.maxAmount}` : e.minAmount})`
                            } else
                            if (e.itemID === "rp") {
                                return `${client.config.emojis.RP}${client.language({ textId: `Репутация`, guildId: interaction.guildId, locale: interaction.locale })} (${e.minAmount !== e.maxAmount ? `${e.minAmount}~${e.maxAmount}` : e.minAmount})`
                            } else {
                                const item = client.cache.items.find(item => item.itemID === e.itemID && !item.temp && item.enabled)
                                if (item) return `${item.displayEmoji}${item.name} (${e.minAmount !== e.maxAmount ? `${e.minAmount}~${e.maxAmount}` : e.minAmount})`
                                else return false
                            }
                        }).filter(e => e)).then(rewards => rewards.join(", "))}` : "🚫"}`,
                        client.config.emojis.DOWN + `**${client.language({ textId: `Провал`, guildId: interaction.guildId, locale: interaction.locale })} (${100-job.action2.success.chance}%)**`,
                        `* ${client.language({ textId: `Кулдаун этой работы после провала`, guildId: interaction.guildId, locale: interaction.locale })}${job.action2.fail.hideCooldowns ? ` (${client.language({ textId: `скрыт`, guildId: interaction.guildId, locale: interaction.locale })})` : ``}: \`${job.action2.fail.cooldown ? transformSecs(client, job.action2.fail.cooldown * 1000, interaction.guildId, interaction.locale) : `${client.language({ textId: `отсутствует`, guildId: interaction.guildId, locale: interaction.locale })}`}\``,
                        `* ${client.language({ textId: `Кулдаун всей работы после провала`, guildId: interaction.guildId, locale: interaction.locale })}${job.action2.fail.hideCooldowns ? ` (${client.language({ textId: `скрыт`, guildId: interaction.guildId, locale: interaction.locale })})` : ``}: \`${job.action2.fail.cooldownJobs ? transformSecs(client, job.action2.fail.cooldownJobs * 1000, interaction.guildId, interaction.locale) : `${client.language({ textId: `отсутствует`, guildId: interaction.guildId, locale: interaction.locale })}`}\``,
                        `* ${client.language({ textId: `Предметы после провала`, guildId: interaction.guildId, locale: interaction.locale })}${job.action2.fail.hideRewards ? ` (${client.language({ textId: `скрыты`, guildId: interaction.guildId, locale: interaction.locale })})` : ``}: ${job.action2.fail.rewards.length ? `${await Promise.all(job.action2.fail.rewards.map(async e => {
                            if (e.itemID === "currency") {
                                return `${settings.displayCurrencyEmoji}${settings.currencyName} (${e.minAmount !== e.maxAmount ? `${e.minAmount}~${e.maxAmount}` : e.minAmount})`
                            } else
                            if (e.itemID === "xp") {
                                return `${client.config.emojis.XP}${client.language({ textId: `Опыт`, guildId: interaction.guildId, locale: interaction.locale })} (${e.minAmount !== e.maxAmount ? `${e.minAmount}~${e.maxAmount}` : e.minAmount})`
                            } else
                            if (e.itemID === "rp") {
                                return `${client.config.emojis.RP}${client.language({ textId: `Репутация`, guildId: interaction.guildId, locale: interaction.locale })} (${e.minAmount !== e.maxAmount ? `${e.minAmount}~${e.maxAmount}` : e.minAmount})`
                            } else {
                                const item = client.cache.items.find(item => item.itemID === e.itemID && !item.temp && item.enabled)
                                if (item) return `${item.displayEmoji}${item.name} (${e.minAmount !== e.maxAmount ? `${e.minAmount}~${e.maxAmount}` : e.minAmount})`
                                else return false
                            }
                        }).filter(e => e)).then(rewards => rewards.join(", "))}` : "🚫"}`,
                    ].join("\n"),
                    inline: true
                }
            ])
            .setFooter({ text: `ID: ${job.id}` })
        const action1Menu = new StringSelectMenuBuilder()
            .setCustomId(`cmd{manager-jobs}usr{${interaction.user.id}}job{${job.id}}act{${action}}exo{${exodus}}actione`)
            .setOptions([
                {
                    label: job.action1.name,
                    value: `action1`,
                    default: action === "action1"
                },
                {
                    label: job.action2.name,
                    value: `action2`,
                    default: action === "action2"
                }
            ])
        const exodusMenu = new StringSelectMenuBuilder()
            .setCustomId(`cmd{manager-jobs}usr{${interaction.user.id}}job{${job.id}}act{${action}}exo{${exodus}}exodus`)
            .setOptions([
                {
                    label: client.language({ textId: `Успех`, guildId: interaction.guildId, locale: interaction.locale }),
                    value: `success`,
                    default: exodus === "success",
                    emoji: client.config.emojis.UP
                },
                {
                    label: client.language({ textId: `Провал`, guildId: interaction.guildId, locale: interaction.locale }),
                    value: `fail`,
                    default: exodus === "fail",
                    emoji: client.config.emojis.DOWN
                }
            ])
        const editMenu = new StringSelectMenuBuilder()
            .setCustomId(`cmd{manager-jobs}usr{${interaction.user.id}}job{${job.id}}act{${action}}exo{${exodus}}edit`)
            .setOptions([
                {
                    label: client.language({ textId: `Название работы`, guildId: interaction.guildId, locale: interaction.locale }),
                    value: `name`,
                    description: job.name
                },
                {
                    label: client.language({ textId: `Описание работы`, guildId: interaction.guildId, locale: interaction.locale }),
                    value: `description`,
                    description: job.description.slice(0, 100)
                },
                {
                    label: client.language({ textId: `${job.hide ? `Отображать работу в автозаполнении, если не доступна` : `Скрывать работу из автозаполнения, если не доступна`}`, guildId: interaction.guildId, locale: interaction.locale }),
                    value: `hide`,
                },
                {
                    label: `${job[action].name}: ${client.language({ textId: `название действия`, guildId: interaction.guildId, locale: interaction.locale })}`,
                    value: `action_name`
                },
                {
                    label: `${job[action].name}: ${client.language({ textId: `право действия`, guildId: interaction.guildId, locale: interaction.locale })}`,
                    value: `action_permission`,
                    description: client.cache.permissions.find(e => e.id === job[action].permission)?.name || undefined
                },
                {
                    label: `${job[action].name}: ${client.language({ textId: `шанс успеха`, guildId: interaction.guildId, locale: interaction.locale })}`,
                    value: `success_chance`,
                    description: `${job[action].success.chance}%`
                },
                {
                    label: `${job[action].name}: ${client.language({ textId: `сообщения ${exodus === "success" ? "успеха" : "провала"}`, guildId: interaction.guildId, locale: interaction.locale })}`,
                    value: `messages`,
                    description: `${client.language({ textId: `Количество`, guildId: interaction.guildId, locale: interaction.locale })}: ${job[action][exodus].messages.length}`
                },
                {
                    label: `${job[action].name}: ${client.language({ textId: `изображения ${exodus === "success" ? "успеха" : "провала"}`, guildId: interaction.guildId, locale: interaction.locale })}`,
                    value: `images`,
                    description: `${client.language({ textId: `Количество`, guildId: interaction.guildId, locale: interaction.locale })}: ${job[action][exodus].images.length}`
                },
                {
                    label: `${job[action].name}: ${client.language({ textId: `кулдаун этой работы после ${exodus === "success" ? "успеха" : "провала"}`, guildId: interaction.guildId, locale: interaction.locale })}`,
                    value: `cooldown`,
                    description: `${job[action][exodus].cooldown} ${client.language({ textId: `секунд`, guildId: interaction.guildId, locale: interaction.locale })}`
                },
                {
                    label: `${job[action].name}: ${client.language({ textId: `кулдаун всей работы после ${exodus === "success" ? "успеха" : "провала"}`, guildId: interaction.guildId, locale: interaction.locale })}`,
                    value: `cooldownJobs`,
                    description: `${job[action][exodus].cooldownJobs} ${client.language({ textId: `секунд`, guildId: interaction.guildId, locale: interaction.locale })}`
                },
                {
                    label: `${job[action].name}: ${client.language({ textId: `награды ${exodus === "success" ? "успеха" : "провала"}`, guildId: interaction.guildId, locale: interaction.locale })}`,
                    value: `rewards`,
                    description: `${client.language({ textId: `Количество`, guildId: interaction.guildId, locale: interaction.locale })}: ${job[action][exodus].rewards.length}`
                },
                {
                    label: `${job[action].name}: ${client.language({ textId: `${job[action][exodus].hideRewards ? `отобразить` : `скрыть`} награды ${exodus === "success" ? "успеха" : "провала"}`, guildId: interaction.guildId, locale: interaction.locale })}`,
                    value: `hideRewards`
                },
                {
                    label: `${job[action].name}: ${client.language({ textId: `${job[action].hideChance ? `отобразить` : `скрыть`} шансы`, guildId: interaction.guildId, locale: interaction.locale })}`,
                    value: `hideChance`
                },
                {
                    label: `${job[action].name}: ${client.language({ textId: `${job[action][exodus].hideCooldowns ? `отобразить` : `скрыть`} кулдауны ${exodus === "success" ? "успеха" : "провала"}`, guildId: interaction.guildId, locale: interaction.locale })}`,
                    value: `hideCooldowns`
                }
            ])
        const enableButton = new ButtonBuilder()
            .setCustomId(`cmd{manager-jobs}usr{${interaction.user.id}}job{${job.id}}act{${action}}exo{${exodus}}onoff`)
            .setLabel(job.enable ? client.language({ textId: `Выключить`, guildId: interaction.guildId, locale: interaction.locale }) : client.language({ textId: `Включить`, guildId: interaction.guildId, locale: interaction.locale }))
            .setStyle(job.enable ? ButtonStyle.Danger : ButtonStyle.Success)
            .setEmoji(job.enable ? client.config.emojis.off : client.config.emojis.on)
        const firstRow = new ActionRowBuilder().addComponents(action1Menu)
        const secondRow = new ActionRowBuilder().addComponents(exodusMenu)
        const thirdRow = new ActionRowBuilder().addComponents(editMenu)
        const fourthRow = new ActionRowBuilder().addComponents(enableButton)
        if (args?.Subcommand === "create") return interaction.reply({ embeds: [embed], components: [firstRow, secondRow, thirdRow, fourthRow] })
        if (interaction.replied || interaction.deferred) return interaction.editReply({ embeds: [embed], components: [firstRow, secondRow, thirdRow, fourthRow] })
        else return interaction.update({ embeds: [embed], components: [firstRow, secondRow, thirdRow, fourthRow] })

        function transformSecs(client, duration, guildId, locale) {
            let ms = parseInt((duration % 1000) / 100),
            secs = Math.floor((duration / 1000) % 60),
            mins = Math.floor((duration / (1000 * 60)) % 60),
            hrs = Math.floor((duration / (1000 * 60 * 60)) % 24)
            days = Math.floor((duration / (1000 * 60 * 60 * 24)) % 30)
            if (days) return `${days} ${client.language({ textId: "дн", guildId: guildId, locale: locale })}. ${hrs} ${client.language({ textId: "HOURS_SMALL", guildId: guildId, locale: locale })}. ${mins} ${client.language({ textId: "мин", guildId: guildId, locale: locale })}. ${secs} ${client.language({ textId: "сек", guildId: guildId, locale: locale })}.`
            if (!days) return `${hrs} ${client.language({ textId: "HOURS_SMALL", guildId: guildId, locale: locale })}. ${mins} ${client.language({ textId: "мин", guildId: guildId, locale: locale })}. ${secs} ${client.language({ textId: "сек", guildId: guildId, locale: locale })}.`
            if (!hrs) return `${mins} ${client.language({ textId: "мин", guildId: guildId, locale: locale })}. ${secs} ${client.language({ textId: "сек", guildId: guildId, locale: locale })}.`
            if (!mins) return `${secs} ${client.language({ textId: "сек", guildId: guildId, locale: locale })}.`
            if (!secs) return `${ms} ${client.language({ textId: "мс", guildId: guildId, locale: locale })}.`
        }
    }
}