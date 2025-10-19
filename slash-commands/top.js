const { ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, ActionRowBuilder, EmbedBuilder, Collection, ApplicationCommandOptionType, TextInputStyle, ModalBuilder, TextInputBuilder, LabelBuilder } = require("discord.js")
const UserRegexp = /usr{(.*?)}/
const LimitRegexp = /lim{(.*?)}/
const selectionRegexp = /sel{(.*?)}/
const itemRegexp = /item<(.*?)>/
module.exports = {
    name: "top",
    nameLocalizations: {
        "ru": `топ`,
        "uk": `топ`,
        "es-ES": `top`
    },
    description: `View leaderboard of guild`,
    descriptionLocalizations: {
        "ru": `Посмотреть таблицу лидеров сервера`,
        "uk": `Переглянути таблицю лідерів сервера`,
        "es-ES": `Ver la tabla de clasificación del servidor`
    },
    options: [
        {
            name: 'statistics',
            nameLocalizations: {
                'ru': `статистика`,
                'uk': `статистика`,
                'es-ES': `estadísticas`
            },
            description: 'Top leaders by profile statistics',
            descriptionLocalizations: {
                'ru': `Топ лидеров по статистике профиля`,
                'uk': `Топ лідерів за статистикою профілю`,
                'es-ES': `Top líderes por estadísticas de perfil`
            },
            type: ApplicationCommandOptionType.Subcommand,
            options: [{
                name: 'selection',
                nameLocalizations: {
                    'ru': `выборка`,
                    'uk': `вибірка`,
                    'es-ES': `selección`
                },
                description: 'Parameters of selection',
                descriptionLocalizations: {
                    'ru': `Параметры выборки`,
                    'uk': `Параметри вибірки`,
                    'es-ES': `Parámetros de selección`
                },
                type: ApplicationCommandOptionType.String,
                required: true,
                autocomplete: true    
            },
            {
                name: 'ephemeral',
                nameLocalizations: {
                    'ru': `эфемерный`,
                    'uk': `тимчасовий`,
                    'es-ES': `efímero`
                },
                description: 'Message visible only for you',
                descriptionLocalizations: {
                    'ru': `Сообщение видно только тебе`,
                    'uk': `Повідомлення видно тільки вам`,
                    'es-ES': `Mensaje visible solo para ti`
                },
                type: ApplicationCommandOptionType.Boolean
            }]
        },
        {
            name: 'item',
            nameLocalizations: {
                'ru': `предмет`,
                'uk': `предмет`,
                'es-ES': `objeto`
            },
            description: 'Top leaders by item',
            descriptionLocalizations: {
                'ru': `Топ лидеров по предмету`,
                'uk': `Топ лідерів за предметом`,
                'es-ES': `Top líderes por objeto`
            },
            type: ApplicationCommandOptionType.Subcommand,
            options: [{
                name: 'name',
                nameLocalizations: {
                    'ru': `название`,
                    'uk': `назва`,
                    'es-ES': `nombre`
                },
                description: 'Item name',
                descriptionLocalizations: {
                    'ru': `Название предмета`,
                    'uk': `Назва предмету`,
                    'es-ES': `Nombre del objeto`
                },
                type: ApplicationCommandOptionType.String,
                autocomplete: true,
                required: true
            },
            {
                name: 'ephemeral',
                nameLocalizations: {
                    'ru': `эфемерный`,
                    'uk': `тимчасовий`,
                    'es-ES': `efímero`
                },
                description: 'Message visible only for you',
                descriptionLocalizations: {
                    'ru': `Сообщение видно только тебе`,
                    'uk': `Повідомлення видно тільки вам`,
                    'es-ES': `Mensaje visible solo para ti`
                },
                type: ApplicationCommandOptionType.Boolean
            }]
        }
    ],
    dmPermission: false,
    group: `general-group`,
    cooldowns: new Collection(),
    /**
     *
     * @param {Client} client
     * @param {CommandInteraction} interaction
     * @param {Object[]} args
     */
    run: async (client, interaction, args) => {
        if (interaction.isChatInputCommand()) {
            if (args.Subcommand === "statistics") {
                if (![
                    "alltime.totalxp",
                    `alltime.seasonTotalXp`,
                    `alltime.hours`,
                    `alltime.messages`,
                    `alltime.likes`,
                    `alltime.currency`,
                    `alltime.invites`,
                    `alltime.bumps`,
                    `alltime.wormholeTouched`,
                    `alltime.rp`,
                    `alltime.giveawaysCreated`,
                    `alltime.doneQuests`,
                    `weekly.totalxp`,
                    `weekly.hours`,
                    `weekly.messages`,
                    `weekly.likes`,
                    `weekly.currency`,
                    `weekly.invites`,
                    `weekly.bumps`,
                    `weekly.wormholeTouched`,
                    `weekly.rp`,
                    `weekly.giveawaysCreated`,
                    `weekly.doneQuests`,
                    `yearly.totalxp`,
                    `monthly.totalxp`,
                    `daily.totalxp`,
                    `yearly.hours`,
                    `monthly.hours`,
                    `daily.hours`,
                    `yearly.messages`,
                    `monthly.messages`,
                    `daily.messages`,
                    `yearly.likes`,
                    `monthly.likes`,
                    `daily.likes`,
                    `yearly.currency`,
                    `monthly.currency`,
                    `daily.currency`,
                    `yearly.invites`,
                    `monthly.invites`,
                    `daily.invites`,
                    `yearly.bumps`,
                    `monthly.bumps`,
                    `daily.bumps`,
                    `yearly.wormholeTouched`,
                    `monthly.wormholeTouched`,
                    `daily.wormholeTouched`,
                    `yearly.rp`,
                    `monthly.rp`,
                    `daily.rp`,
                    `yearly.giveawaysCreated`,
                    `monthly.giveawaysCreated`,
                    `daily.giveawaysCreated`,
                    `yearly.doneQuests`,
                    `monthly.doneQuests`,
                    `daily.doneQuests`
                ].includes(args.selection)) {
                    return interaction.reply({ content: `${client.config.emojis.NO}${client.language({ textId: `Выберите выборку из списка`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
                }
            }
            await interaction.deferReply({ flags: args.ephemeral ? ["Ephemeral"] : undefined })
        }
        const components = interaction.message?.components
        if (!interaction.isChatInputCommand()) {
            if (interaction.user.id !== UserRegexp.exec(interaction.customId)?.[1]) return interaction.deferUpdate().catch(e => null)
        }
        let min = 0
        let limit = 10
        const selection = interaction.isChatInputCommand() && args.Subcommand === "statistics" ? args.selection : interaction.isChatInputCommand() && args.Subcommand === "item" ? `item<${args.name}>` : interaction.customId?.includes(`sel`) ? selectionRegexp.exec(interaction.customId)?.[1] : `alltime.totalxp`
        let profiles
        const settings = client.cache.settings.get(interaction.guildId)
        if (!interaction.isChatInputCommand()) {
            if (interaction.customId.includes(`page`)) {
                const modal = new ModalBuilder()
                    .setCustomId(`top_page_${interaction.id}`)
                    .setTitle(`${client.language({ textId: `Страница`, guildId: interaction.guildId, locale: interaction.locale })}`)
                    .setLabelComponents([
                        new LabelBuilder()
                            .setLabel(`${client.language({ textId: `Номер страницы`, guildId: interaction.guildId, locale: interaction.locale })}`)
                            .setTextInputComponent(
                                new TextInputBuilder()
                                    .setCustomId("page")
                                    .setRequired(true)
                                    .setStyle(TextInputStyle.Short)
                            )
                    ])
                await interaction.showModal(modal);delete client.globalCooldown[`${interaction.guildId}_${interaction.user.id}`]
                const filter = (i) => i.customId === `top_page_${interaction.id}` && i.user.id === interaction.user.id
                interaction = await interaction.awaitModalSubmit({ filter, time: 60000 }).catch(e => interaction)
                if (interaction && interaction.isModalSubmit()) {
                    profiles = await client.functions.fetchLeaderboard(client, interaction.guild.id, selection).then(collection => collection.map(user => user))
                    const modalArgs = {}
                    interaction.fields.fields.each(field => modalArgs[field.customId] = field.value)
                    if (isNaN(+modalArgs.page) && Number.isInteger(+modalArgs.page)) {
                        await interaction.update({ components: components })
                        return interaction.followUp({ content: `${client.config.emojis.NO} **${modalArgs.page}** ${client.language({ textId: `не является целым числом`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
                    }
                    modalArgs.page = +modalArgs.page
                    if (modalArgs.page <= 0 || modalArgs.page > (profiles.length + (profiles.length % 10 == 0 ? 0 : 10 - (profiles.length % 10)))/10) {
                        await interaction.update({ components: components })
                        return interaction.followUp({ content: `${client.config.emojis.NO} ${client.language({ textId: `Такой страницы не существует`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
                    }
                    limit = modalArgs.page * 10
                    min = limit - 10
                }  
            } else {
                if (interaction.customId.includes("findYourself")) {
                    profiles = await client.functions.fetchLeaderboard(client, interaction.guild.id, selection).then(collection => collection.map(user => user))
                    const index = profiles.findIndex(e => e.userID === interaction.user.id)
                    if (index >= 0) {
                        limit = index + 10 - (Array.from(index.toFixed())[Array.from(index.toFixed()).length - 1])
                        min = limit - 10 
                    } else {
                        await interaction.update({ components: components })
                        return interaction.followUp({ content: `${client.config.emojis.NO}${client.language({ textId: `Ты не найден в таблице лидеров.`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
                    }
                } else {
                    limit = +LimitRegexp.exec(interaction.customId)?.[1]
                    min = limit - 10      
                }
            }
        }
        if (!profiles) profiles = await client.functions.fetchLeaderboard(client, interaction.guild.id, selection).then(collection => collection.map(profile => profile))
        const first_page_btn = new ButtonBuilder().setEmoji(`${client.config.emojis.arrowLeft2}`).setStyle(ButtonStyle.Secondary).setCustomId(`usr{${interaction.user.id}}cmd{top}lim{10}sel{${selection}}1`).setDisabled((profiles.length <= 10 && min == 0) || (profiles.length > 10 && min < 10) ? true : false)
        const previous_page_btn = new ButtonBuilder().setEmoji(`${client.config.emojis.arrowLeft}`).setStyle(ButtonStyle.Secondary).setCustomId(`usr{${interaction.user.id}}cmd{top}lim{${limit - 10}}sel{${selection}}2`).setDisabled((profiles.length <= 10 && min == 0) || (profiles.length > 10 && min < 10) ? true : false)
        const select_page_btn = new ButtonBuilder().setLabel(`${Math.ceil(limit/10).toString()}/${(profiles.length + (profiles.length % 10 == 0 ? 0 : 10 - (profiles.length % 10)))/10}`).setStyle(ButtonStyle.Secondary).setCustomId(`usr{${interaction.user.id}}cmd{top} page sel{${selection}}`).setDisabled(profiles.length <= 10)
        const next_page_btn = new ButtonBuilder().setEmoji(`${client.config.emojis.arrowRight}`).setStyle(ButtonStyle.Secondary).setCustomId(`usr{${interaction.user.id}}cmd{top}lim{${limit + 10}}sel{${selection}}3`).setDisabled((profiles.length <= 10 && min == 0) || (profiles.length > 10 && min >= profiles.length - 10) ? true : false)
        const last_page_btn = new ButtonBuilder().setEmoji(`${client.config.emojis.arrowRight2}`).setStyle(ButtonStyle.Secondary).setCustomId(`usr{${interaction.user.id}}cmd{top}lim{${profiles.length + (profiles.length % 10 == 0 ? 0 : 10 - (profiles.length % 10))}}sel{${selection}}4`).setDisabled((profiles.length <= 10 && min == 0) || (profiles.length > 10 && min >= profiles.length - 10) ? true : false)
        const array_btn = [first_page_btn, previous_page_btn, select_page_btn, next_page_btn, last_page_btn]
        let date = new Date()
        if (selection.includes(`daily`)) date = ` ${client.language({ textId: `за`, guildId: interaction.guildId, locale: interaction.locale })} ${date.getDate().toString().length < 2 ? `0` + date.getDate().toString() : date.getDate().toString() }.${(date.getMonth() + 1).toString().length < 2 ? 0 + (date.getMonth() + 1).toString() : date.getMonth() + 1 }.${date.getFullYear()}`
        if (selection.includes(`weekly`)) {
            let startOfWeek = require(`date-fns/startOfWeek`,)
            let endOfWeek = require(`date-fns/endOfWeek`)
            const start_date = startOfWeek(date, { weekStartsOn: 1 })
            const end_date = endOfWeek(date, { weekStartsOn: 1 })
            date = ` ${client.language({ textId: "с", guildId: interaction.guildId, locale: interaction.locale })} ${start_date.getDate().toString().length < 2 ? `0` + start_date.getDate().toString() : start_date.getDate().toString() }.${(start_date.getMonth() + 1).toString().length < 2 ? 0 + (start_date.getMonth() + 1).toString() : start_date.getMonth() + 1 }.${start_date.getFullYear()} ${client.language({ textId: `по`, guildId: interaction.guildId, locale: interaction.locale })} ${end_date.getDate().toString().length < 2 ? `0` + end_date.getDate().toString() : end_date.getDate().toString() }.${(end_date.getMonth() + 1).toString().length < 2 ? 0 + (end_date.getMonth() + 1).toString() : end_date.getMonth() + 1 }.${end_date.getFullYear()}`
        } else
        if (selection.includes(`monthly`)) date = ` ${client.language({ textId: `за`, guildId: interaction.guildId, locale: interaction.locale })} ${date.getMonth() == 0 ? `${client.language({ textId: `январь`, guildId: interaction.guildId, locale: interaction.locale })}` : date.getMonth() == 1 ? `${client.language({ textId: `февраль`, guildId: interaction.guildId, locale: interaction.locale })}` : date.getMonth() == 2 ? `${client.language({ textId: `март`, guildId: interaction.guildId, locale: interaction.locale })}` : date.getMonth() == 3 ? `${client.language({ textId: `апрель`, guildId: interaction.guildId, locale: interaction.locale })}` : date.getMonth() == 4 ? `${client.language({ textId: `май`, guildId: interaction.guildId, locale: interaction.locale })}` : date.getMonth() == 5 ? `${client.language({ textId: `июнь`, guildId: interaction.guildId, locale: interaction.locale })}` : date.getMonth() == 6 ? `${client.language({ textId: `июль`, guildId: interaction.guildId, locale: interaction.locale })}` : date.getMonth() == 7 ? `${client.language({ textId: `август`, guildId: interaction.guildId, locale: interaction.locale })}` : date.getMonth() == 8 ? `${client.language({ textId: `сентябрь`, guildId: interaction.guildId, locale: interaction.locale })}` : date.getMonth() == 9 ? `${client.language({ textId: `октябрь`, guildId: interaction.guildId, locale: interaction.locale })}` : date.getMonth() == 10 ? `${client.language({ textId: `ноябрь`, guildId: interaction.guildId, locale: interaction.locale })}` : `${client.language({ textId: `декабрь`, guildId: interaction.guildId, locale: interaction.locale })}`} ${date.getFullYear()}`
        else if (selection.includes(`yearly`)) date = ` ${client.language({ textId: `за`, guildId: interaction.guildId, locale: interaction.locale })} ${date.getFullYear()} ${client.language({ textId: `год`, guildId: interaction.guildId, locale: interaction.locale })}`
        else if (selection.includes(`alltime`)) date = ` ${client.language({ textId: `за все время`, guildId: interaction.guildId, locale: interaction.locale })}`
        const firstRow = new ActionRowBuilder().addComponents(array_btn)
        const findYourselfRow = new ActionRowBuilder()
            .addComponents([
                new ButtonBuilder()
                    .setLabel(`${client.language({ textId: `Найти себя`, guildId: interaction.guildId, locale: interaction.locale })}`)
                    .setStyle(ButtonStyle.Primary)
                    .setCustomId(`usr{${interaction.user.id}}cmd{top}lim{${limit}}sel{${selection}}findYourself `)
            ])
        let context = `${client.language({ textId: `!${selection.slice(selection.indexOf(".")+1)}`, guildId: interaction.guildId, locale: interaction.locale })}`
        let leaderboard
        let item
        if (selection.includes("item")) {
            if (profiles.length) leaderboard = profiles.slice(min, limit)
            item = client.cache.items.find(e => e.guildID === interaction.guildId && (e.itemID === itemRegexp.exec(selection)[1] || e.name.toLowerCase().includes(itemRegexp.exec(selection)[1].toLowerCase())))
            if (!item) {
                if (interaction.isChatInputCommand()) return interaction.editReply({ content: `${client.config.emojis.NO}${client.language({ textId: `Предмет не найден`, guildId: interaction.guildId, locale: interaction.locale })}` })
                else return interaction.update({ content: `${client.config.emojis.NO}${client.language({ textId: `Предмет не найден`, guildId: interaction.guildId, locale: interaction.locale })}` })
            }
            date = ""
            context = `${client.language({ textId: `по предмету`, guildId: interaction.guildId, locale: interaction.locale })} ${item.displayEmoji}**${item.name}**`
        } else if (profiles.length) {
            profiles = profiles.slice(min, limit)
            leaderboard = await client.functions.computeLeaderboard(client, profiles, selection, min)
        }
        if (profiles.length < 1) {
            if (interaction.isChatInputCommand()) return interaction.editReply({ content: `# ${client.language({ textId: `Таблица лидеров`, guildId: interaction.guildId, locale: interaction.locale })} ${context}${date} ${client.language({ textId: `на сервере`, guildId: interaction.guildId, locale: interaction.locale })} ${interaction.guild.name}\n${client.config.emojis.NO} ${client.language({ textId: `В таблице лидеров пока никого нет`, guildId: interaction.guildId, locale: interaction.locale })}` })  
            else return interaction.update({ content: `# ${client.language({ textId: `Таблица лидеров`, guildId: interaction.guildId, locale: interaction.locale })} ${context}${date} ${client.language({ textId: `на сервере`, guildId: interaction.guildId, locale: interaction.locale })} ${interaction.guild.name}\n${client.config.emojis.NO} ${client.language({ textId: `В таблице лидеров пока никого нет`, guildId: interaction.guildId, locale: interaction.locale })}` })  
        }
        const embeds = []
        for (const profile of leaderboard) {
        	const member = await interaction.guild.members.fetch(profile.userID).catch(e => null)
        	const embed = new EmbedBuilder()
        	embed.setTitle(`${profile.position}. ${member?.displayName || `<@${profile.userID}>`} | ${client.language({ textId: `Lvl`, guildId: interaction.guildId, locale: interaction.locale })} 🎖${profile.level}${settings.seasonLevelsEnabled ? ` | ${client.language({ textId: `Slvl`, guildId: interaction.guildId, locale: interaction.locale })} ${client.config.emojis.seasonLevel}${profile.seasonLevel}` : ""}`)
        	if (!selection.includes("item")) {
                embed.setDescription(`${client.language({ textId: `Профиль`, guildId: interaction.guildId, locale: interaction.locale })}: <@${profile.userID}>\n${client.config.emojis.XP}${profile.totalxp < 10000 ? profile.totalxp.toFixed(2) : `${(profile.totalxp/1000).toFixed(0)}K`} ${settings.seasonLevelsEnabled ? `${client.config.emojis.seasonXP}${profile.seasonTotalXp < 10000 ? profile.seasonTotalXp.toFixed(2) : `${(profile.seasonTotalXp/1000).toFixed(0)}K`}` : ""} ${client.config.emojis.mic}${profile.hours.toLocaleString()} ${client.config.emojis.message}️${profile.messages.toLocaleString()} ${client.config.emojis.heart}${profile.likes.toLocaleString()} ${settings.displayCurrencyEmoji}${(profile.currency).toLocaleString()} ${client.config.emojis.invite}${profile.invites.toLocaleString()} ${client.config.emojis.bump} ${profile.bumps.toLocaleString()} ${client.config.emojis.giveaway}${profile.giveawaysCreated.toLocaleString()} ${client.config.emojis.wormhole}${profile.wormholeTouched.toLocaleString()} ${client.config.emojis.RP} ${profile.rp.toLocaleString()} ${client.config.emojis.quests}${profile.doneQuests.toLocaleString()}`)
            } else {
                embed.setDescription(`${client.language({ textId: `Профиль`, guildId: interaction.guildId, locale: interaction.locale })}: <@${profile.userID}>\n${item?.displayEmoji || ""}${item?.name} (${profile.amount?.toLocaleString() || 0})`)
            }
            if (member) {
                embed.setColor(member.displayHexColor)
                embed.setThumbnail(member.user.avatarURL())
            }
            embeds.push(embed)
        }
        if (interaction.isChatInputCommand()) return interaction.editReply({ content: `# ${client.language({ textId: `Таблица лидеров`, guildId: interaction.guildId, locale: interaction.locale })} ${context}${date} ${client.language({ textId: `на сервере`, guildId: interaction.guildId, locale: interaction.locale })} ${interaction.guild.name}`, embeds: embeds, components: [firstRow, findYourselfRow] })
        else return interaction.update({ content: `# ${client.language({ textId: `Таблица лидеров`, guildId: interaction.guildId, locale: interaction.locale })} ${context}${date} ${client.language({ textId: `на сервере`, guildId: interaction.guildId, locale: interaction.locale })} ${interaction.guild.name}`, embeds: embeds, components: [firstRow, findYourselfRow] })
    } 
}