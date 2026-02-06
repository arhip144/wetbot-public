const { 
    ApplicationCommandOptionType, 
    TextInputStyle, 
    ButtonBuilder, 
    ButtonStyle, 
    InteractionType, 
    StringSelectMenuBuilder, 
    ActionRowBuilder, 
    EmbedBuilder, 
    TextInputBuilder, 
    ModalBuilder, 
    Collection, 
    CommandInteraction, 
    Client, 
    PermissionFlagsBits,
    LabelBuilder
} = require("discord.js")
const UserRegexp = /usr{(.*?)}/
module.exports = {
    name: 'dropdown-roles',
    nameLocalizations: {
        'ru': `выпадающие-роли`,
        'uk': `випадаючі-ролі`,
        'es-ES': `roles-desplegables`
    },
    description: 'Create a dropdown list of roles and then select',
    descriptionLocalizations: {
        'ru': `Создание выпадающего списка ролей с последующим выбором`,
        'uk': `Створення випадаючого списку ролей з подальшим вибором`,
        'es-ES': `Crear una lista desplegable de roles y luego seleccionar`
    },
    options: [
        {
            name: 'role1',
            nameLocalizations: {
                'ru': `роль1`,
                'uk': `роль1`, 
                'es-ES': `rol1`
            },
            description: 'The 1st role to add to the dropdown list',
            descriptionLocalizations: {
                'ru': `1-я роль для добавления в выпадающий список`,
                'uk': `1-ша роль для додавання у випадаючий список`,
                'es-ES': `Primer rol para agregar a la lista desplegable`
            },
            type: ApplicationCommandOptionType.Role,
            required: true
        },
        {
            name: 'role2',
            nameLocalizations: {
                'ru': `роль2`,
                'uk': `роль2`,
                'es-ES': `rol2`
            },
            description: 'The 2nd role to add to the dropdown list',
            descriptionLocalizations: {
                'ru': `2-я роль для добавления в выпадающий список`,
                'uk': `2-га роль для додавання у випадаючий список`,
                'es-ES': `Segundo rol para agregar a la lista desplegable`
            },
            type: ApplicationCommandOptionType.Role,
        },
        {
            name: 'role3',
            nameLocalizations: {
                'ru': `роль3`,
                'uk': `роль3`,
                'es-ES': `rol3`
            },
            description: 'The 3rd role to add to the dropdown list',
            descriptionLocalizations: {
                'ru': `3-я роль для добавления в выпадающий список`,
                'uk': `3-тя роль для додавання у випадаючий список`,
                'es-ES': `Tercer rol para agregar a la lista desplegable`
            },
            type: ApplicationCommandOptionType.Role,
        },
        {
            name: 'role4',
            nameLocalizations: {
                'ru': `роль4`,
                'uk': `роль4`,
                'es-ES': `rol4`
            },
            description: 'The 4th role to add to the dropdown list',
            descriptionLocalizations: {
                'ru': `4-я роль для добавления в выпадающий список`,
                'uk': `4-та роль для додавання у випадаючий список`,
                'es-ES': `Cuarto rol para agregar a la lista desplegable`
            },
            type: ApplicationCommandOptionType.Role,
        },
        {
            name: 'role5',
            nameLocalizations: {
                'ru': `роль5`,
                'uk': `роль5`,
                'es-ES': `rol5`
            },
            description: 'The 5th role to add to the dropdown list',
            descriptionLocalizations: {
                'ru': `5-я роль для добавления в выпадающий список`,
                'uk': `5-та роль для додавання у випадаючий список`,
                'es-ES': `Quinto rol para agregar a la lista desplegable`
            },
            type: ApplicationCommandOptionType.Role,
        },
        {
            name: 'role6',
            nameLocalizations: {
                'ru': `роль6`,
                'uk': `роль6`,
                'es-ES': `rol6`
            },
            description: 'The 6th role to add to the dropdown list',
            descriptionLocalizations: {
                'ru': `6-я роль для добавления в выпадающий список`,
                'uk': `6-та роль для додавання у випадаючий список`,
                'es-ES': `Sexto rol para agregar a la lista desplegable`
            },
            type: ApplicationCommandOptionType.Role,
        },
        {
            name: 'role7',
            nameLocalizations: {
                'ru': `роль7`,
                'uk': `роль7`,
                'es-ES': `rol7`
            },
            description: 'The 7th role to add to the dropdown list',
            descriptionLocalizations: {
                'ru': `7-я роль для добавления в выпадающий список`,
                'uk': `7-ма роль для додавання у випадаючий список`,
                'es-ES': `Séptimo rol para agregar a la lista desplegable`
            },
            type: ApplicationCommandOptionType.Role,
        },
        {
            name: 'role8',
            nameLocalizations: {
                'ru': `роль8`,
                'uk': `роль8`,
                'es-ES': `rol8`
            },
            description: 'The 8th role to add to the dropdown list',
            descriptionLocalizations: {
                'ru': `8-я роль для добавления в выпадающий список`,
                'uk': `8-ма роль для додавання у випадаючий список`,
                'es-ES': `Octavo rol para agregar a la lista desplegable`
            },
            type: ApplicationCommandOptionType.Role,
        },
        {
            name: 'role9',
            nameLocalizations: {
                'ru': `роль9`,
                'uk': `роль9`,
                'es-ES': `rol9`
            },
            description: 'The 9th role to add to the dropdown list',
            descriptionLocalizations: {
                'ru': `9-я роль для добавления в выпадающий список`,
                'uk': `9-та роль для додавання у випадаючий список`,
                'es-ES': `Noveno rol para agregar a la lista desplegable`
            },
            type: ApplicationCommandOptionType.Role,
        },
        {
            name: 'role10',
            nameLocalizations: {
                'ru': `роль10`,
                'uk': `роль10`,
                'es-ES': `rol10`
            },
            description: 'The 10th role to add to the dropdown list',
            descriptionLocalizations: {
                'ru': `10-я роль для добавления в выпадающий список`,
                'uk': `10-та роль для додавання у випадаючий список`,
                'es-ES': `Décimo rol para agregar a la lista desplegable`
            },
            type: ApplicationCommandOptionType.Role,
        },
        {
            name: 'role11',
            nameLocalizations: {
                'ru': `роль11`,
                'uk': `роль11`,
                'es-ES': `rol11`
            },
            description: 'The 11th role to add to the dropdown list',
            descriptionLocalizations: {
                'ru': `11-я роль для добавления в выпадающий список`,
                'uk': `11-та роль для додавання у випадаючий список`,
                'es-ES': `Undécimo rol para agregar a la lista desplegable`
            },
            type: ApplicationCommandOptionType.Role,
        },
        {
            name: 'role12',
            nameLocalizations: {
                'ru': `роль12`,
                'uk': `роль12`,
                'es-ES': `rol12`
            },
            description: 'The 12th role to add to the dropdown list',
            descriptionLocalizations: {
                'ru': `12-я роль для добавления в выпадающий список`,
                'uk': `12-та роль для додавання у випадаючий список`,
                'es-ES': `Duodécimo rol para agregar a la lista desplegable`
            },
            type: ApplicationCommandOptionType.Role,
        },
        {
            name: 'role13',
            nameLocalizations: {
                'ru': `роль13`,
                'uk': `роль13`,
                'es-ES': `rol13`
            },
            description: 'The 13th role to add to the dropdown list',
            descriptionLocalizations: {
                'ru': `13-я роль для добавления в выпадающий список`,
                'uk': `13-та роль для додавання у випадаючий список`,
                'es-ES': `Decimotercer rol para agregar a la lista desplegable`
            },
            type: ApplicationCommandOptionType.Role,
        },
        {
            name: 'role14',
            nameLocalizations: {
                'ru': `роль14`,
                'uk': `роль14`,
                'es-ES': `rol14`
            },
            description: 'The 14th role to add to the dropdown list',
            descriptionLocalizations: {
                'ru': `14-я роль для добавления в выпадающий список`,
                'uk': `14-та роль для додавання у випадаючий список`,
                'es-ES': `Decimocuarto rol para agregar a la lista desplegable`
            },
            type: ApplicationCommandOptionType.Role,
        },
        {
            name: 'role15',
            nameLocalizations: {
                'ru': `роль15`,
                'uk': `роль15`,
                'es-ES': `rol15`
            },
            description: 'The 15th role to add to the dropdown list',
            descriptionLocalizations: {
                'ru': `15-я роль для добавления в выпадающий список`,
                'uk': `15-та роль для додавання у випадаючий список`,
                'es-ES': `Decimoquinto rol para agregar a la lista desplegable`
            },
            type: ApplicationCommandOptionType.Role,
        },
        {
            name: 'role16',
            nameLocalizations: {
                'ru': `роль16`,
                'uk': `роль16`,
                'es-ES': `rol16`
            },
            description: 'The 16th role to add to the dropdown list',
            descriptionLocalizations: {
                'ru': `16-я роль для добавления в выпадающий список`,
                'uk': `16-та роль для додавання у випадаючий список`,
                'es-ES': `Decimosexto rol para agregar a la lista desplegable`
            },
            type: ApplicationCommandOptionType.Role,
        },
        {
            name: 'role17',
            nameLocalizations: {
                'ru': `роль17`,
                'uk': `роль17`,
                'es-ES': `rol17`
            },
            description: 'The 17th role to add to the dropdown list',
            descriptionLocalizations: {
                'ru': `17-я роль для добавления в выпадающий список`,
                'uk': `17-та роль для додавання у випадаючий список`,
                'es-ES': `Decimoséptimo rol para agregar a la lista desplegable`
            },
            type: ApplicationCommandOptionType.Role,
        },
        {
            name: 'role18',
            nameLocalizations: {
                'ru': `роль18`,
                'uk': `роль18`,
                'es-ES': `rol18`
            },
            description: 'The 18th role to add to the dropdown list',
            descriptionLocalizations: {
                'ru': `18-я роль для добавления в выпадающий список`,
                'uk': `18-та роль для додавання у випадаючий список`,
                'es-ES': `Decimoctavo rol para agregar a la lista desplegable`
            },
            type: ApplicationCommandOptionType.Role,
        },
        {
            name: 'role19',
            nameLocalizations: {
                'ru': `роль19`,
                'uk': `роль19`,
                'es-ES': `rol19`
            },
            description: 'The 19th role to add to the dropdown list',
            descriptionLocalizations: {
                'ru': `19-я роль для добавления в выпадающий список`,
                'uk': `19-та роль для додавання у випадаючий список`,
                'es-ES': `Decimonoveno rol para agregar a la lista desplegable`
            },
            type: ApplicationCommandOptionType.Role,
        },
        {
            name: 'role20',
            nameLocalizations: {
                'ru': `роль20`,
                'uk': `роль20`,
                'es-ES': `rol20`
            },
            description: 'The 20th role to add to the dropdown list',
            descriptionLocalizations: {
                'ru': `20-я роль для добавления в выпадающий список`,
                'uk': `20-та роль для додавання у випадаючий список`,
                'es-ES': `Vigésimo rol para agregar a la lista desplegable`
            },
            type: ApplicationCommandOptionType.Role,
        },
        {
            name: 'role21',
            nameLocalizations: {
                'ru': `роль21`,
                'uk': `роль21`,
                'es-ES': `rol21`
            },
            description: 'The 21th role to add to the dropdown list',
            descriptionLocalizations: {
                'ru': `21-я роль для добавления в выпадающий список`,
                'uk': `21-ша роль для додавання у випадаючий список`,
                'es-ES': `Vigésimo primer rol para agregar a la lista desplegable`
            },
            type: ApplicationCommandOptionType.Role,
        },
        {
            name: 'role22',
            nameLocalizations: {
                'ru': `роль22`,
                'uk': `роль22`,
                'es-ES': `rol22`
            },
            description: 'The 22th role to add to the dropdown list',
            descriptionLocalizations: {
                'ru': `22-я роль для добавления в выпадающий список`,
                'uk': `22-га роль для додавання у випадаючий список`,
                'es-ES': `Vigésimo segundo rol para agregar a la lista desplegable`
            },
            type: ApplicationCommandOptionType.Role,
        },
        {
            name: 'role23',
            nameLocalizations: {
                'ru': `роль23`,
                'uk': `роль23`,
                'es-ES': `rol23`
            },
            description: 'The 23th role to add to the dropdown list',
            descriptionLocalizations: {
                'ru': `23-я роль для добавления в выпадающий список`,
                'uk': `23-тя роль для додавання у випадаючий список`,
                'es-ES': `Vigésimo tercer rol para agregar a la lista desplegable`
            },
            type: ApplicationCommandOptionType.Role,
        },
        {
            name: 'role24',
            nameLocalizations: {
                'ru': `роль24`,
                'uk': `роль24`,
                'es-ES': `rol24`
            },
            description: 'The 24th role to add to the dropdown list',
            descriptionLocalizations: {
                'ru': `24-я роль для добавления в выпадающий список`,
                'uk': `24-та роль для додавання у випадаючий список`,
                'es-ES': `Vigésimo cuarto rol para agregar a la lista desplegable`
            },
            type: ApplicationCommandOptionType.Role,
        },
        {
            name: 'role25',
            nameLocalizations: {
                'ru': `роль25`,
                'uk': `роль25`,
                'es-ES': `rol25`
            },
            description: 'The 25th role to add to the dropdown list',
            descriptionLocalizations: {
                'ru': `25-я роль для добавления в выпадающий список`,
                'uk': `25-та роль для додавання у випадаючий список`,
                'es-ES': `Vigésimo quinto rol para agregar a la lista desplegable`
            },
            type: ApplicationCommandOptionType.Role,
        }
    ],
    defaultMemberPermissions: PermissionFlagsBits.Administrator,
    dmPermission: false,
    group: `admins-group`,
    cooldowns: new Collection(),
    /**
     * @param { Client } client
     * @param { CommandInteraction } interaction
     */ 
    run: async (client, interaction) => {
        if (interaction.isChatInputCommand()) {
            await interaction.deferReply()
            const selectMenuOptions = []
            const seen = {}
            let j = 0
            const options = interaction.options.data
            for (let i = 0; i < options.length; i++) {
                const role = options[i].role
                const key = role.id
                if (!seen[key]) {
                    seen[key] = 1
                    selectMenuOptions[j++] = {
                        label: role.name,
                        emoji: role.unicodeEmoji ?? undefined,
                        value: role.id
                    }
                }
            }
            const priceMenuOptions = []
            const visualMenuOptions = []
            const embed = new EmbedBuilder()
                .setColor(3093046)
                .setTitle(`${client.language({ textId: "Выпадающие роли", guildId: interaction.guildId, locale: interaction.locale })}`)
                .setDescription(`${client.language({ textId: "Мульти выбор", guildId: interaction.guildId, locale: interaction.locale })}: ${client.config.emojis.YES}\n${client.language({ textId: "Кулдаун", guildId: interaction.guildId, locale: interaction.locale })} (${client.config.emojis.question}): ${client.config.emojis.NO}\n${client.language({ textId: "Плейсхолдер", guildId: interaction.guildId, locale: interaction.locale })} (${client.config.emojis.question}): ${client.language({ textId: "Выберите нужное", guildId: interaction.guildId, locale: interaction.locale })}`)
                .addFields(selectMenuOptions.map(e => {
                    priceMenuOptions.push({
                        label: `${e.label}: ${client.language({ textId: "установить цену", guildId: interaction.guildId, locale: interaction.locale })}`,
                        emoji: e.emoji,
                        value: e.value
                    })
                    visualMenuOptions.push({
                        label: `${client.language({ textId: "Отображение для", guildId: interaction.guildId, locale: interaction.locale })}: ${e.label}`,
                        emoji: e.emoji,
                        value: e.value
                    })
                    return {
                        name: e.label,
                        value: `${client.language({ textId: "Цена", guildId: interaction.guildId, locale: interaction.locale })}: ${client.config.emojis.NO}`,
                        inline: true
                    }
                }))
            const priceSelectMenu = new StringSelectMenuBuilder()
                .setOptions(priceMenuOptions)
                .setPlaceholder(`${client.language({ textId: "Установить цены для ролей", guildId: interaction.guildId, locale: interaction.locale })}...`)
                .setCustomId(`cmd{dropdown-roles}usr{${interaction.user.id}}setPrice`)
            const visualSelectMenu = new StringSelectMenuBuilder()
                .setOptions(visualMenuOptions)
                .setPlaceholder(`${client.language({ textId: "Изменить отображение меню", guildId: interaction.guildId, locale: interaction.locale })}...`)
                .setCustomId(`cmd{dropdown-roles}usr{${interaction.user.id}}setVisual`)
            const multiSelectMenu = new StringSelectMenuBuilder()
            .setOptions([
                {
                    label: `${client.language({ textId: "Мульти выбор", guildId: interaction.guildId, locale: interaction.locale })}`,
                    value: `true`,
                    emoji: "🔢",
                    default: true
                },
                {
                    label: `${client.language({ textId: "Одиночный выбор", guildId: interaction.guildId, locale: interaction.locale })}`,
                    value: `false`,
                    emoji: "1️⃣",
                    default: false
                }
            ])
            .setCustomId(`cmd{dropdown-roles}usr{${interaction.user.id}}multi`)
            const questions = new ButtonBuilder()
                .setEmoji(client.config.emojis.question)
                .setStyle(ButtonStyle.Secondary)
                .setCustomId(`cmd{dropdown-roles}usr{${interaction.user.id}}help`)
            const create = new ButtonBuilder()
                .setEmoji(client.config.emojis.YES)
                .setStyle(ButtonStyle.Success)
                .setCustomId(`cmd{dropdown-roles}usr{${interaction.user.id}}create`)
            const cooldown = new ButtonBuilder()
                .setEmoji(client.config.emojis.watch)
                .setLabel(client.language({ textId: "Установить кулдаун", guildId: interaction.guildId, locale: interaction.locale }))
                .setStyle(ButtonStyle.Secondary)
                .setCustomId(`cmd{dropdown-roles}usr{${interaction.user.id}}cooldown`)
            const placeholder = new ButtonBuilder()
                .setEmoji(client.config.emojis.edit)
                .setLabel(client.language({ textId: "Изменить плейсхолдер", guildId: interaction.guildId, locale: interaction.locale }))
                .setStyle(ButtonStyle.Secondary)
                .setCustomId(`cmd{dropdown-roles}usr{${interaction.user.id}}placeholder`)
            const row1 = new ActionRowBuilder().addComponents(multiSelectMenu)
            const row2 = new ActionRowBuilder().addComponents(priceSelectMenu)
            const row3 = new ActionRowBuilder().addComponents(visualSelectMenu)
            const row4 = new ActionRowBuilder().addComponents(create, cooldown, placeholder, questions)
            const message = await interaction.editReply({ embeds: [embed], components: [row1, row2, row3, row4] })
            return client.dropDownTemp.set(message.id, {
                multi: true,
                cooldown: 0,
                placeholder: client.language({ textId: "Выберите нужное", guildId: interaction.guildId, locale: interaction.locale }),
                roles: new Collection(selectMenuOptions.map(e => {
                    return [e.value, {
                        id: e.value,
                        currency: null,
                        price: null,
                        name: e.label,
                        description: undefined,
                        emoji: e.emoji
                    }]
                }))
            })
        }
        if (UserRegexp.exec(interaction.customId)?.[1] !== interaction.user.id) return interaction.deferUpdate().catch(() => null)
        const dropdown = client.dropDownTemp.get(interaction.message.id)
        if (!dropdown) return interaction.reply({ content: `${client.config.emojis.NO}**${client.language({ textId: "Этого менеджера больше не существует. Введите повторно команду.", guildId: interaction.guildId, locale: interaction.locale })}**`, flags: ["Ephemeral"] })
        const settings = client.cache.settings.get(interaction.guildId)
        if (interaction.isStringSelectMenu()) {
            if (interaction.customId.includes("setPrice")) {
                const role = dropdown.roles.get(interaction.values[0])
                const setItemBTN = new ButtonBuilder().setStyle(ButtonStyle.Success).setLabel(`${client.language({ textId: `Установить предмет`, guildId: interaction.guildId, locale: interaction.locale })}`).setEmoji(client.config.emojis.box).setCustomId(`item_setPriceSelect`)
                const setCurBTN = new ButtonBuilder().setStyle(ButtonStyle.Success).setLabel(`${client.language({ textId: `Установить`, guildId: interaction.guildId, locale: interaction.locale })} ${settings.currencyName}`).setEmoji(settings.displayCurrencyEmoji).setCustomId(`currency_setPriceSelect`)
                const setRPBTN = new ButtonBuilder().setStyle(ButtonStyle.Success).setLabel(`${client.language({ textId: `Установить`, guildId: interaction.guildId, locale: interaction.locale })} RP`).setEmoji(client.config.emojis.RP).setCustomId(`rp_setPriceSelect`)
                const row = new ActionRowBuilder().addComponents(setItemBTN, setCurBTN, setRPBTN)
                const components = [row]
                interaction.message.components.forEach(row => row.components.forEach(component => {
                    component.data.disabled = true
                }))
                await interaction.update({ components: interaction.message.components })
                await interaction.followUp({ content: `${client.language({ textId: `Выбери валюту, за которую будет покупаться`, guildId: interaction.guildId, locale: interaction.locale })} <@&${role.id}>. ${client.language({ textId: `Ожидание: 30с`, guildId: interaction.guildId, locale: interaction.locale })}.`, components: components, embeds: [], flags: ["Ephemeral"] })
                const filter1 = (i) => i.customId.includes(`setPriceSelect`) && i.user.id === interaction.user.id
                const originalCurrency = role.currency
                let followUpInteraction = await interaction.channel.awaitMessageComponent({ filter1, time: 30000 }).catch(() => null)
                if (followUpInteraction) {
                    const type = followUpInteraction.customId.slice(0, followUpInteraction.customId.indexOf("_"))
                    if (type === "item") {
                        const modal = new ModalBuilder()
                            .setCustomId(`dropdown-roles_item_${followUpInteraction.id}`)
                            .setTitle(`${client.language({ textId: `Установка цены`, guildId: interaction.guildId, locale: interaction.locale })}`)
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
                                            .setMaxLength(15)
                                            .setRequired(true)
                                            .setStyle(TextInputStyle.Short)
                                    ),
                            ])
                        await followUpInteraction.showModal(modal);delete client.globalCooldown[`${interaction.guildId}_${interaction.user.id}`]
                        const filter = (i) => i.customId === `dropdown-roles_item_${followUpInteraction.id}` && i.user.id === interaction.user.id
                        followUpInteraction = await followUpInteraction.awaitModalSubmit({ filter, time: 120000 }).catch(e => followUpInteraction)
                        if (followUpInteraction && followUpInteraction.type === InteractionType.ModalSubmit) {
                            const modalArgs = {}
                            followUpInteraction.fields.fields.each(field => modalArgs[field.customId] = field.value)
                            const filteredItems = client.cache.items.filter(e => e.guildID === interaction.guildId && !e.temp && e.name.toLowerCase().includes(modalArgs.item.toLowerCase()))
                            if (filteredItems.size > 1 && !filteredItems.some(e =>  e.name.toLowerCase() === modalArgs.item.toLowerCase())) {
                                let result = ""
                                filteredItems.forEach(item => {
                                    result += `> ${item.displayEmoji}**${item.name}**\n`	
                                })
                                await followUpInteraction.update({ content: `${client.config.emojis.block} ${client.language({ textId: `По вашему запросу было найдено несколько предметов`, guildId: interaction.guildId, locale: interaction.locale })}:\n${result}`.slice(0, 2000), components: [], flags: ["Ephemeral"] })  
                            } else {
                                const searchedItem = filteredItems.some(e => e.name.toLowerCase() === modalArgs.item.toLowerCase()) ? filteredItems.find(e => e.name.toLowerCase() === modalArgs.item.toLowerCase()) : filteredItems.first()
                                if (!searchedItem) await followUpInteraction.update({ content: `${client.config.emojis.NO}${client.language({ textId: `Предмет`, guildId: interaction.guildId, locale: interaction.locale })} **${modalArgs.item}** ${client.language({ textId: `не найден`, guildId: interaction.guildId, locale: interaction.locale })}`, components: [], flags: ["Ephemeral"] })
                                else role.currency = searchedItem.itemID
                            }
                        }
                    } else {
                        const modal = new ModalBuilder()
                            .setCustomId(`setPrice_${followUpInteraction.id}`)
                            .setTitle(`${client.language({ textId: `Установить цену`, guildId: interaction.guildId, locale: interaction.locale })}`)
                            .setLabelComponents([
                                new LabelBuilder()
                                    .setLabel(`${client.language({ textId: `Цена`, guildId: interaction.guildId, locale: interaction.locale })}`)
                                    .setTextInputComponent(
                                        new TextInputBuilder()
                                            .setCustomId("amount")
                                            .setMaxLength(15)
                                            .setRequired(true)
                                            .setStyle(TextInputStyle.Short)
                                    ),
                            ])
                        await followUpInteraction.showModal(modal);delete client.globalCooldown[`${interaction.guildId}_${interaction.user.id}`]
                        const filter = (i) => i.customId === `setPrice_${followUpInteraction.id}` && i.user.id === interaction.user.id
                        followUpInteraction = await followUpInteraction.awaitModalSubmit({ filter, time: 60000 }).catch(e => followUpInteraction)
                        role.currency = type    
                    }
                }
                if (followUpInteraction && followUpInteraction.type === InteractionType.ModalSubmit) {
                    const modalArgs = {}
                    followUpInteraction.fields.fields.each(field => modalArgs[field.customId] = field.value)
                    if (isNaN(+modalArgs.amount)) {
                        await followUpInteraction.update({ content: `${client.config.emojis.NO} **${modalArgs.amount}** ${client.language({ textId: `не является числом`, guildId: interaction.guildId, locale: interaction.locale })}`, components: [], flags: ["Ephemeral"] })
                    } else {
                        role.price = +modalArgs.amount
                        if (role.price <= 0) {
                            role.currency = null
                            role.price = null
                        }
                        await followUpInteraction.update({ content: `${client.config.emojis.YES}`, components: [], flags: ["Ephemeral"] })
                    }
                } else role.currency = originalCurrency
            } else
            if (interaction.customId.includes("setVisual")) {
                const role = dropdown.roles.get(interaction.values[0])
                const modal = new ModalBuilder()
                    .setCustomId(`setVisual_${interaction.id}`)
                    .setTitle(`${client.language({ textId: `Установить отображение меню`, guildId: interaction.guildId, locale: interaction.locale })}`)
                    .setLabelComponents([
                        new LabelBuilder()
                            .setLabel(`${client.language({ textId: `Название`, guildId: interaction.guildId, locale: interaction.locale })}`)
                            .setTextInputComponent(
                                new TextInputBuilder()
                                    .setCustomId("name")
                                    .setMaxLength(50)
                                    .setRequired(true)
                                    .setStyle(TextInputStyle.Short)
                                    .setValue(role.name)
                            ),
                        new LabelBuilder()
                            .setLabel(`${client.language({ textId: `Описание`, guildId: interaction.guildId, locale: interaction.locale })}`)
                            .setTextInputComponent(
                                new TextInputBuilder()
                                    .setCustomId("description")
                                    .setMaxLength(100)
                                    .setRequired(false)
                                    .setStyle(TextInputStyle.Short)
                                    .setValue(role.description || "")
                            ),
                        new LabelBuilder()
                            .setLabel(`${client.language({ textId: `Emoji`, guildId: interaction.guildId, locale: interaction.locale })}`)
                            .setTextInputComponent(
                                new TextInputBuilder()
                                    .setCustomId("emoji")
                                    .setRequired(false)
                                    .setStyle(TextInputStyle.Short)
                                    .setValue(role.emoji || "")
                                    .setPlaceholder(`${client.language({ textId: `ID эмодзи или Unicode эмодзи`, guildId: interaction.guildId, locale: interaction.locale })}`)
                            ),
                    ])
                await interaction.showModal(modal);delete client.globalCooldown[`${interaction.guildId}_${interaction.user.id}`]
                const filter = (i) => i.customId === `setVisual_${interaction.id}` && i.user.id === interaction.user.id
                interaction = await interaction.awaitModalSubmit({ filter, time: 60000 }).catch(e => interaction)
                if (interaction && interaction.type === InteractionType.ModalSubmit) {
                    const modalArgs = {}
                    interaction.fields.fields.each(field => modalArgs[field.customId] = field.value)
                    await interaction.deferUpdate()
                    role.name = modalArgs.name
                    if (modalArgs.description.length) role.description = modalArgs.description
                    else role.description = undefined
                    if (modalArgs.emoji.length) {
                        const node_emoji = require(`node-emoji`)
                        const isDefaultEmoji = node_emoji.hasEmoji(modalArgs.emoji)
                        const emoji = !isDefaultEmoji ? await client.functions.getEmoji(client, modalArgs.emoji) : modalArgs.emoji
                        if (!isDefaultEmoji && emoji === "❓") {
							return interaction.followUp({ content: `${client.config.emojis.NO}**${client.language({ textId: `Строка`, guildId: interaction.guildId, locale: interaction.locale })} ${modalArgs.emoji} ${client.language({ textId: `не содержит эмодзи или содержит не поддерживаемый эмодзи`, guildId: interaction.guildId, locale: interaction.locale })}**`, flags: ["Ephemeral"] })
						}
                        role.emoji = modalArgs.emoji    
                    } else role.emoji = undefined
                } else return
            }
        }
        if (interaction.customId.includes("cooldown")) {
            const modal = new ModalBuilder()
            .setCustomId(`setCooldown_${interaction.id}`)
            .setTitle(`${client.language({ textId: `Установить кулдаун`, guildId: interaction.guildId, locale: interaction.locale })}`)
            .setLabelComponents([
                new LabelBuilder()
                    .setLabel(`${client.language({ textId: `Кулдаун (сек.)`, guildId: interaction.guildId, locale: interaction.locale })}`)
                    .setTextInputComponent(
                        new TextInputBuilder()
                            .setCustomId("cooldown")
                            .setMaxLength(15)
                            .setRequired(true)
                            .setValue(`${dropdown.cooldown ? dropdown.cooldown : 0}`)
                            .setStyle(TextInputStyle.Short)
                    ),
            ])
            await interaction.showModal(modal);delete client.globalCooldown[`${interaction.guildId}_${interaction.user.id}`]
            const filter = (i) => i.customId === `setCooldown_${interaction.id}` && i.user.id === interaction.user.id
            interaction = await interaction.awaitModalSubmit({ filter, time: 60000 }).catch(e => interaction)
            if (interaction && interaction.type === InteractionType.ModalSubmit) {
                const modalArgs = {}
                interaction.fields.fields.each(field => modalArgs[field.customId] = field.value)
                if (isNaN(+modalArgs.cooldown)) {
                    interaction.reply({ content: `${client.config.emojis.NO}**${modalArgs.cooldown}** ${client.language({ textId: `не является числом`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
                } else {
                    dropdown.cooldown = +modalArgs.cooldown < 0 ? 0 : +modalArgs.cooldown
                }
            } else return
        } else if (interaction.customId.includes("placeholder")) {
            const modal = new ModalBuilder()
            .setCustomId(`setPlaceholder_${interaction.id}`)
            .setTitle(`${client.language({ textId: `Установить плейсхолдер`, guildId: interaction.guildId, locale: interaction.locale })}`)
            .setLabelComponents([
                new LabelBuilder()
                    .setLabel(`${client.language({ textId: `Плейсхолдер`, guildId: interaction.guildId, locale: interaction.locale })}`)
                    .setTextInputComponent(
                        new TextInputBuilder()
                            .setCustomId("placeholder")
                            .setMaxLength(100)
                            .setRequired(true)
                            .setValue(`${dropdown.placeholder}`)
                            .setStyle(TextInputStyle.Short)
                    ),
            ])
            await interaction.showModal(modal);delete client.globalCooldown[`${interaction.guildId}_${interaction.user.id}`]
            const filter = (i) => i.customId === `setPlaceholder_${interaction.id}` && i.user.id === interaction.user.id
            interaction = await interaction.awaitModalSubmit({ filter, time: 60000 }).catch(e => interaction)
            if (interaction && interaction.type === InteractionType.ModalSubmit) {
                const modalArgs = {}
                interaction.fields.fields.each(field => modalArgs[field.customId] = field.value)
                dropdown.placeholder = modalArgs.placeholder
            } else return
        } else if (interaction.customId.includes("help")) {
            const helpEmbed = new EmbedBuilder()
                .setColor(3093046)
                .setTitle(`${client.language({ textId: "ПОМОЩЬ", guildId: interaction.guildId, locale: interaction.locale })}`)
                .addFields([
                    {
                        name: `${client.language({ textId: "Create", guildId: interaction.guildId, locale: interaction.locale })}`,
                        value: `${client.language({ textId: "— Создание происходит прикреплением выпадающего меню к любому сообщению бота.\n— Создать сообщение от бота можно с помощью команд </say:1150455842680885358> или </embed-generator:1150455841779105902>.", guildId: interaction.guildId, locale: interaction.locale })}`
                    },
                    {
                        name: `${client.language({ textId: "Кулдаун", guildId: interaction.guildId, locale: interaction.locale })}`,
                        value: `${client.language({ textId: "— После выбора ролей, пользователь в течении кулдауна не сможет выбрать новые роли.", guildId: interaction.guildId, locale: interaction.locale })}`
                    },
                    {
                        name: `${client.language({ textId: "Плейсхолдер", guildId: interaction.guildId, locale: interaction.locale })}`,
                        value: `${client.language({ textId: "— Косметический параметр, если выпадающее меню с ролями закрыто, то будет отображаться плейсхолдер.", guildId: interaction.guildId, locale: interaction.locale })}`
                    },
                    {
                        name: `${client.language({ textId: "Мультивыбор", guildId: interaction.guildId, locale: interaction.locale })}`,
                        value: `${client.language({ textId: "— С этим параметром можно выбрать до 25 ролей одновременно.\n— Если выбранная роль уже есть у пользователя и на нее нет цены, то роль будет убрана.\n— Если выбранная роль уже есть у пользователя и на нее есть цена, то роль не будет убрана.", guildId: interaction.guildId, locale: interaction.locale })}`
                    },
                    {
                        name: `${client.language({ textId: "Одиночный выбор", guildId: interaction.guildId, locale: interaction.locale })}`,
                        value: `${client.language({ textId: "— С этим параметром можно выбрать только одну роль.\n— Если выбранная роль уже есть у пользователя, то роль не будет убрана.\n— При выборе роли все остальные роли будут убраны, даже если на них есть цена.", guildId: interaction.guildId, locale: interaction.locale })}`
                    }
                ])
            return interaction.reply({ embeds: [helpEmbed], flags: ["Ephemeral"] })
        } else if (interaction.customId.includes("multi")) {
            if (interaction.values[0] === "true") dropdown.multi = true
            else if (interaction.values[0] === "false") dropdown.multi = false
        }
        const priceMenuOptions = []
        const visualMenuOptions = []
        const selectMenuOptions = []
        const fields = []
        for (let role of dropdown.roles) {
            role = role[1]
            const guildRole = await interaction.guild.roles.fetch(role.id).catch(() => null)
            selectMenuOptions.push({
                label: role.name,
                emoji: role.emoji,
                value: guildRole.id,
                description: role.description
            })
            priceMenuOptions.push({
                label: `${client.language({ textId: "Установить цену", guildId: interaction.guildId, locale: interaction.locale })}: ${role.name !== guildRole.name ? `${role.name} (${guildRole.name})` : guildRole.name}`,
                emoji: role.emoji,
                value: guildRole.id
            })
            visualMenuOptions.push({
                label: `${client.language({ textId: "Отображение для", guildId: interaction.guildId, locale: interaction.locale })}: ${role.name !== guildRole.name ? `${role.name} (${guildRole.name})` : guildRole.name}`,
                emoji: role.emoji,
                value: guildRole.id
            })
            let priceItem
            let priceEmoji
            if (role.currency && role.price) {
                priceItem = role.currency === "currency" ? { name: settings.currencyName } : role.currency === "rp" ? { name: client.language({ textId: "Репутация", guildId: interaction.guildId, locale: interaction.locale }) } : client.cache.items.find(e => e.itemID === role.currency && !e.temp)
                priceEmoji = priceItem?.name === settings.currencyName ? settings.displayCurrencyEmoji : priceItem?.name === client.language({ textId: "Репутация", guildId: interaction.guildId, locale: interaction.locale }) ? client.config.emojis.RP : priceItem?.emoji || ""
            }
            fields.push({
                name: role.name !== guildRole.name ? `${role.name} (${guildRole.name})${role.description ? `\n[${role.description}]` : ""}` : `${guildRole.name}${role.description ? `\n[${role.description}]` : ""}`,
                value: `${client.language({ textId: "Цена", guildId: interaction.guildId, locale: interaction.locale })}: ${role.currency && role.price ? `${priceEmoji}**${priceItem?.name}** ${role.price}` : client.config.emojis.NO}`,
                inline: true
            })
        }
        if (interaction.customId.includes("create")) {
            const components = JSON.parse(JSON.stringify(interaction.message.components))
            const modal = new ModalBuilder()
                .setCustomId(`dropdown-roles_message_${interaction.id}`)
                .setTitle(`${client.language({ textId: `Сообщение бота`, guildId: interaction.guildId, locale: interaction.locale })}`)
                .setLabelComponents([
                    new LabelBuilder()
                        .setLabel(`${client.language({ textId: `Ссылка`, guildId: interaction.guildId, locale: interaction.locale })}`)
                        .setTextInputComponent(
                            new TextInputBuilder()
                                .setCustomId("link")
                                .setRequired(true)
                                .setStyle(TextInputStyle.Short)
                        ),
                ])
            await interaction.showModal(modal);delete client.globalCooldown[`${interaction.guildId}_${interaction.user.id}`]
            const filter = (i) => i.customId === `dropdown-roles_message_${interaction.id}` && i.user.id === interaction.user.id
            interaction = await interaction.awaitModalSubmit({ filter, time: 60000 }).catch(e => interaction)
            if (interaction && interaction.type === InteractionType.ModalSubmit) {
                const modalArgs = {}
                interaction.fields.fields.each(field => modalArgs[field.customId] = field.value)
                const channelId = modalArgs.link.split("/")[5]
                const messageId = modalArgs.link.split("/")[6]
                if (!channelId || !messageId) {
                    return interaction.reply({ content: `${client.config.emojis.NO}**${client.language({ textId: `Неверная ссылка на сообщение`, guildId: interaction.guildId, locale: interaction.locale })}**`, flags: ["Ephemeral"] })
                }
                const channel = await interaction.guild.channels.fetch(channelId).catch(() => null)
                if (!channel) {
                    return interaction.reply({ content: `${client.config.emojis.NO}**${client.language({ textId: `Текстовый канал не найден`, guildId: interaction.guildId, locale: interaction.locale })}**`, flags: ["Ephemeral"] })
                }
                if (!channel.messages) {
                    return interaction.reply({ content: `${client.config.emojis.NO}**${client.language({ textId: `Возможно у меня нет доступа к сообщениям этого канала`, guildId: interaction.guildId, locale: interaction.locale })}**`, flags: ["Ephemeral"] })
                }
                const message = await channel.messages.fetch({ message: messageId, cache: false, force: true }).catch(() => null)
                if (!message) {
                    return interaction.reply({ content: `${client.config.emojis.NO}**${client.language({ textId: `Сообщение не найдено`, guildId: interaction.guildId, locale: interaction.locale })}**`, flags: ["Ephemeral"] })
                }
                if (message.author.id !== client.user.id) {
                    return interaction.reply({ content: `${client.config.emojis.NO}**${client.language({ textId: `Это не моё сообщение`, guildId: interaction.guildId, locale: interaction.locale })}**\n${client.language({ textId: `Сообщение можно создать с помощью команд </say:1150455842680885358> или </embed-generator:1150455841779105902>`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
                }
                try {
                    const selectMenu = new StringSelectMenuBuilder().setOptions(selectMenuOptions).setMaxValues(dropdown.multi ? selectMenuOptions.length : 1).setCustomId(`cmd{dropdown-roles-select}`).setPlaceholder(dropdown.placeholder)
                    const row = new ActionRowBuilder().addComponents([selectMenu])
                    message.edit({ content: message.content, embeds: message.embeds, components: [row], files: message.attachments })
                } catch (err) {
                    return interaction.reply({ content: `${client.config.emojis.NO}${err.message}` })
                }
                let dropdownDB = await client.dropdownRoleSchema.findOne({ guildID: interaction.guildId, messageID: message.id })
                if (dropdownDB) {
                    dropdownDB.roles = new Map(dropdown.roles.filter(e => e.price && e.currency).map(e => {
                        return [e.id, {
                            id: e.id,
                            currency: e.currency,
                            price: e.price
                        }]
                    }))
                    dropdownDB.cooldown = dropdown.cooldown
                    dropdownDB.multi = dropdown.multi
                } else {
                    dropdownDB = new client.dropdownRoleSchema({
                        guildID: interaction.guildId,
                        messageID: message.id,
                        channelID: message.channel.id,
                        roles: new Map(dropdown.roles.filter(e => e.price && e.currency).map(e => {
                            return [e.id, {
                                id: e.id,
                                currency: e.currency,
                                price: e.price
                            }]
                        })),
                        cooldown: dropdown.cooldown,
                        multi: dropdown.multi
                    })
                }
                await dropdownDB.save()
                if (interaction.deferred || interaction.replied) return interaction.editReply({ embeds: interaction.message.embeds, components: components })
                else return interaction.update({ embeds: interaction.message.embeds, components: components })
            }
        }
        const embed = new EmbedBuilder()
            .setColor(3093046)
            .setTitle(`${client.language({ textId: "Выпадающие роли", guildId: interaction.guildId, locale: interaction.locale })}`)
            .setDescription(`${client.language({ textId: "Мульти выбор", guildId: interaction.guildId, locale: interaction.locale })}: ${dropdown.multi ? client.config.emojis.YES : client.config.emojis.NO}\n${client.language({ textId: "Кулдаун", guildId: interaction.guildId, locale: interaction.locale })} (${client.config.emojis.question}): ${dropdown.cooldown ? `${transformSecs(client, dropdown.cooldown*1000)}` : client.config.emojis.NO}\n${client.language({ textId: "Плейсхолдер", guildId: interaction.guildId, locale: interaction.locale })} (${client.config.emojis.question}): ${dropdown.placeholder}`)
            .addFields(fields)
        const priceSelectMenu = new StringSelectMenuBuilder()
            .setOptions(priceMenuOptions)
            .setPlaceholder(`${client.language({ textId: "Установить цены для ролей", guildId: interaction.guildId, locale: interaction.locale })}...`)
            .setCustomId(`cmd{dropdown-roles}usr{${interaction.user.id}}setPrice`)
        const visualSelectMenu = new StringSelectMenuBuilder()
            .setOptions(visualMenuOptions)
            .setPlaceholder(`${client.language({ textId: "Изменить отображение меню", guildId: interaction.guildId, locale: interaction.locale })}...`)
            .setCustomId(`cmd{dropdown-roles}usr{${interaction.user.id}}setVisual`)
        const multiSelectMenu = new StringSelectMenuBuilder()
            .setOptions([
                {
                    label: `${client.language({ textId: "Мульти выбор", guildId: interaction.guildId, locale: interaction.locale })}`,
                    value: `true`,
                    emoji: "🔢",
                    default: dropdown.multi
                },
                {
                    label: `${client.language({ textId: "Одиночный выбор", guildId: interaction.guildId, locale: interaction.locale })}`,
                    value: `false`,
                    emoji: "1️⃣",
                    default: !dropdown.multi
                }
            ])
            .setCustomId(`cmd{dropdown-roles}usr{${interaction.user.id}}multi`)
        const questions = new ButtonBuilder()
            .setEmoji(client.config.emojis.question)
            .setStyle(ButtonStyle.Secondary)
            .setCustomId(`cmd{dropdown-roles}usr{${interaction.user.id}}help`)
        const create = new ButtonBuilder()
            .setEmoji(client.config.emojis.YES)
            .setStyle(ButtonStyle.Success)
            .setCustomId(`cmd{dropdown-roles}usr{${interaction.user.id}}create`)
        const cooldown = new ButtonBuilder()
            .setEmoji(client.config.emojis.watch)
            .setLabel(client.language({ textId: "Установить кулдаун", guildId: interaction.guildId, locale: interaction.locale }))
            .setStyle(ButtonStyle.Secondary)
            .setCustomId(`cmd{dropdown-roles}usr{${interaction.user.id}}cooldown`)
        const placeholder = new ButtonBuilder()
            .setEmoji(client.config.emojis.edit)
            .setLabel(client.language({ textId: "Изменить плейсхолдер", guildId: interaction.guildId, locale: interaction.locale }))
            .setStyle(ButtonStyle.Secondary)
            .setCustomId(`cmd{dropdown-roles}usr{${interaction.user.id}}placeholder`)
        const row1 = new ActionRowBuilder().addComponents(multiSelectMenu)
        const row2 = new ActionRowBuilder().addComponents(priceSelectMenu)
        const row3 = new ActionRowBuilder().addComponents(visualSelectMenu)
        const row4 = new ActionRowBuilder().addComponents(create, cooldown, placeholder, questions)
        if (interaction.deferred || interaction.replied) return interaction.editReply({ embeds: [embed], components: [row1, row2, row3, row4] })
        else return interaction.update({ embeds: [embed], components: [row1, row2, row3, row4] })
    }
}
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