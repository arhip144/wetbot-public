const { ChannelType, ApplicationCommandOptionType, ButtonBuilder, ButtonStyle, ActionRowBuilder, Collection, EmbedBuilder } = require("discord.js");
const Drop = require("../classes/Drop");
const { RewardType } = require("../enums");
const DropRegexp = /dropId{(.*?)}/
const drops = new Collection()
const uniqid = require('uniqid')
module.exports = {
    name: 'drop',
    nameLocalizations: {
        'ru': `дроп`,
        'uk': `дроп`, 
        'es-ES': `soltar`
    },
    description: 'Drop an item in text channel',
    descriptionLocalizations: {
        'ru': `Выкинуть предмет в текстовый канал`,
        'uk': `Викинути предмет у текстовому каналі`,
        'es-ES': `Soltar el objeto en el canal de texto`
    },
    options: [
        {
            name: 'item',
            nameLocalizations: {
                'ru': 'предмет',
                'uk': 'предмет',
                'es-ES': 'objeto'
            },
            description: 'Item name to drop',
            descriptionLocalizations: {
                'ru': 'Имя предмета для дропа',
                'uk': 'Назва предмета для дропу',
                'es-ES': 'Nombre del objeto para soltar'
            },
            minLength: 2,
            type: ApplicationCommandOptionType.String,
            required: true,
            autocomplete: true
        },
        {
            name: 'amount',
            nameLocalizations: {
                'ru': 'количество',
                'uk': 'кількість',
                'es-ES': 'cantidad'
            },
            description: 'Amount of items to drop',
            descriptionLocalizations: {
                'ru': 'Количество предметов для дропа',
                'uk': 'Кількість предметів для дропу',
                'es-ES': 'Número de objetos para soltar'
            },
            type: ApplicationCommandOptionType.Number,
            required: true
        },
        {
            name: 'channel',
            nameLocalizations: {
                'ru': 'канал',
                'uk': 'канал',
                'es-ES': 'canal'
            },
            description: 'Text channel for drop',
            descriptionLocalizations: {
                'ru': 'Текстовый канал для дропа',
                'uk': 'Текстовий канал для дропу',
                'es-ES': 'Canal de texto para soltar'
            },
            type: ApplicationCommandOptionType.Channel,
            required: true,
            channelTypes: [ChannelType.GuildText, ChannelType.GuildVoice, ChannelType.GuildAnnouncement, ChannelType.AnnouncementThread, ChannelType.PublicThread, ChannelType.PrivateThread]
        }
    ],
    dmPermission: false,
    group: `inventory-group`,
    cooldowns: new Collection(),
    /**
     *
     * @param {Client} client
     * @param {CommandInteraction} interaction
     * @param {String[]} args
     */
    run: async (client, interaction, args) => {
        if (interaction.isButton()) {
            if (!DropRegexp.exec(interaction.customId)) return interaction.deferUpdate()
            const drop = drops.get(DropRegexp.exec(interaction.customId)[1])
            if (!drop) return interaction.deferUpdate()
            if (interaction.user.id === drop.userId) {
                return interaction.reply({ content: `${client.config.emojis.NO} ${client.language({ textId: "Ты не можешь взять свой дроп", guildId: interaction.guildId, locale: interaction.locale })}.`, flags: ["Ephemeral"] })
            }
            if (!drop.users.has(interaction.user.id)) drop.users.add(interaction.user.id)
            if ([...drop.users][0] !== interaction.user.id) {
                return interaction.reply({ content: `${client.config.emojis.NO} ${client.language({ textId: `Этот дроп уже забрали`, guildId: interaction.guildId, locale: interaction.locale })}.`, flags: ["Ephemeral"] })
            }
            const userId = [...drop.users][0]
            const profile = await client.functions.fetchProfile(client, userId, interaction.guildId)
            if (drop.type === RewardType.Currency) {
                const settings = client.cache.settings.get(interaction.guildId)
                await profile.addCurrency({ amount: drop.amount, save: true })
                client.emit("economyLogCreate", interaction.guildId, `<@${userId}> ${client.language({ textId: "подобрал", guildId: interaction.guildId })} ${settings.displayCurrencyEmoji}**${settings.currencyName}** (${drop.amount})`)
                await interaction.update({ content: `${client.config.emojis.DONE} <@${userId}> ${profile.sex === `male` ? `${client.language({ textId: "забрал", guildId: interaction.guildId, locale: interaction.locale })}` : profile.sex === `female` ? `${client.language({ textId: "забрала", guildId: interaction.guildId, locale: interaction.locale })}` : `${client.language({ textId: "забрал(-а)", guildId: interaction.guildId, locale: interaction.locale })}`} ${settings.displayCurrencyEmoji}**${settings.currencyName}** (${drop.amount.toLocaleString()}) ${client.language({ textId: "из дропа от", guildId: interaction.guildId, locale: interaction.locale })} <@${drop.userId}>.`, components: [] })
                return drops.delete(drop.id)
            } else {
                const item = client.cache.items.find(item => item.guildID === interaction.guildId && !item.temp && item.enabled && item.itemID === drop.item.itemID)
                if (item) {
                    await profile.addItem({ itemID: drop.item.itemID, amount: drop.amount, save: true })
                    client.emit("economyLogCreate", interaction.guildId, `<@${userId}> ${client.language({ textId: "подобрал", guildId: interaction.guildId })} ${item.displayEmoji}**${item.name}** (${drop.amount})`)
                    await interaction.update({ content: `${client.config.emojis.DONE} <@${userId}> ${profile.sex === `male` ? `${client.language({ textId: "забрал", guildId: interaction.guildId, locale: interaction.locale })}` : profile.sex === `female` ? `${client.language({ textId: "забрала", guildId: interaction.guildId, locale: interaction.locale })}` : `${client.language({ textId: "забрал(-а)", guildId: interaction.guildId, locale: interaction.locale })}`} ${item.displayEmoji}**${item.name}** (${drop.amount.toLocaleString()}) ${client.language({ textId: "из дропа от", guildId: interaction.guildId, locale: interaction.locale })} <@${drop.userId}>.`, components: [] })
                    return drops.delete(drop.id)
                } else return
            }
        }
        const settings = client.cache.settings.get(interaction.guildId)
        const amount = args.amount <= 0 ? 1 : args.amount
        const profile = await client.functions.fetchProfile(client, interaction.user.id, interaction.guildId)
        if (args.item.length < 2) {
            return interaction.reply({ content: `${client.config.emojis.NO} ${client.language({ textId: "Запрос содержит менее двух символов", guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })  
        }
        if (args.item.toLowerCase() === settings.currencyName.toLowerCase()) {
            if (settings.currency_no_drop) {
                return interaction.reply({ content: `${client.config.emojis.NO} ${settings.displayCurrencyEmoji}${settings.currencyName} ${client.language({ textId: `нельзя выбросить`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
            }
            if (profile.currency < amount) {
                return interaction.reply({ content: `${client.config.emojis.NO} ${client.language({ textId: "В инвентаре", guildId: interaction.guildId, locale: interaction.locale })} ${settings.displayCurrencyEmoji}${settings.currencyName} (${profile.currency})` })
            }
            const permission = client.cache.permissions.get(settings.currency_drop_permission)
            if (permission) {
                const isPassing = permission.for(profile, interaction.member, interaction.channel, interaction)
                if (isPassing.value === false) {
                    return interaction.reply({ embeds: [new EmbedBuilder().setColor(3093046).setTitle(`${client.language({ textId: `Для этого взаимодействия требуется:`, guildId: interaction.guildId, locale: interaction.locale })}`).setDescription(isPassing.reasons.join("\n"))], flags: ["Ephemeral"] })
                }
            }
            const channel = await interaction.guild.channels.fetch(args.channel).catch(() => null)
            if (!channel) {
                return interaction.reply({ content: `${client.config.emojis.NO} ${client.language({ textId: "Введен неизвестный канал", guildId: interaction.guildId, locale: interaction.locale })}.` })  
            }
            if (!channel.permissionsFor(interaction.guild.members.me).has("ViewChannel")) {
                return interaction.reply({ content: `${client.config.emojis.NO} ${client.language({ textId: "У меня нет прав для просмотра этого канала", guildId: interaction.guildId, locale: interaction.locale })}.` })  
            }
            if (!channel.permissionsFor(interaction.guild.members.me).has("SendMessages")) {
                return interaction.reply({ content: `${client.config.emojis.NO} ${client.language({ textId: "У меня нет прав для отправки сообщений в этом канале", guildId: interaction.guildId, locale: interaction.locale })}.` })  
            }
            if (!channel.permissionsFor(interaction.member).has("ViewChannel")) {
                return interaction.reply({ content: `${client.config.emojis.NO} ${client.language({ textId: "У тебя нет прав для просмотра этого канала", guildId: interaction.guildId, locale: interaction.locale })}.` })  
            }
            if (!channel.permissionsFor(interaction.member).has("SendMessages")) {
                return interaction.reply({ content: `${client.config.emojis.NO} ${client.language({ textId: "У тебя нет прав для отправки сообщений в этот канал", guildId: interaction.guildId, locale: interaction.locale })}.` })  
            }
            const drop = new Drop(client, uniqid.time(), interaction.user.id, RewardType.Currency, amount)
            drops.set(drop.id, drop)
            const dropBTN = new ButtonBuilder()
                .setLabel(`${client.language({ textId: "Взять дроп", guildId: interaction.guildId, locale: interaction.locale })}`)
                .setStyle(ButtonStyle.Primary)
                .setCustomId(`cmd{drop}dropId{${drop.id}}`)
                .setEmoji('🤏')
            channel.send({ content: `${client.language({ textId: "Дроп", guildId: interaction.guildId, locale: interaction.locale })} ➜ ||${settings.displayCurrencyEmoji}**${settings.currencyName} (${amount.toLocaleString()})**|| ${client.language({ textId: "от", guildId: interaction.guildId, locale: interaction.locale })} <@${interaction.user.id}>`, components: [new ActionRowBuilder().addComponents([dropBTN])]}).catch(() => null)
            profile.currency -= amount
            const guildQuests = client.cache.quests.filter(quest => quest.guildID === interaction.guildId && quest.isEnabled && quest.targets.some(target => target.type === "drop"))
            if (guildQuests.size) await profile.addQuestProgression({ type: "drop", amount, object: args.item })
            await profile.save()
            client.emit("economyLogCreate", interaction.guildId, `<@${interaction.user.id}> (${interaction.user.username}) ${client.language({ textId: "выбросил", guildId: interaction.guildId })} ${settings.displayCurrencyEmoji}**${settings.currencyName}** (${amount}) (<#${args.channel}>)`)
            return interaction.reply({ content: `${client.config.emojis.DONE} ${settings.displayCurrencyEmoji}**${settings.currencyName}** (${amount.toLocaleString()}) ${client.language({ textId: "был выброшен в", guildId: interaction.guildId, locale: interaction.locale })} <#${args.channel}>`, flags: ["Ephemeral"] })
        } else {
            const filteredItems = client.cache.items.filter(e => e.guildID === interaction.guildId && !e.temp && e.enabled && e.name.toLowerCase().includes(args.item.toLowerCase()) && profile.inventory.some(x => x.itemID == e.itemID && x.amount > 0))
            if (filteredItems.size > 1 && !filteredItems.some(e => e.name.toLowerCase() == args.item.toLowerCase())) {
                let result = ""
                filteredItems.forEach(item => {
                    result += `> ${item.displayEmoji}**${item.name}**\n`
                })
                return interaction.reply({ content: `${client.config.emojis.block} ${client.language({ textId: "По вашему запросу было найдено несколько предметов", guildId: interaction.guildId, locale: interaction.locale })}:\n${result}`, flags: ["Ephemeral"] }) 
            }
            let userItem
            let guildItem
            if (filteredItems.some(e => e.name.toLowerCase() == args.item.toLowerCase())) {
                guildItem = filteredItems.find(e => e.name.toLowerCase() == args.item.toLowerCase())
                if (!guildItem) return interaction.reply({ content: `${client.config.emojis.NO} ${client.language({ textId: "Предмет не найден", guildId: interaction.guildId, locale: interaction.locale })}: ${args.item}.`, flags: ["Ephemeral"] })  
                userItem = profile.inventory.find(e => { return e.itemID == guildItem.itemID })
            } else {
                guildItem = filteredItems.first()
                if (!guildItem) return interaction.reply({ content: `${client.config.emojis.NO} ${client.language({ textId: "Предмет не найден", guildId: interaction.guildId, locale: interaction.locale })}: ${args.item}.`, flags: ["Ephemeral"] })  
                userItem = profile.inventory.find(e => { return e.itemID == guildItem.itemID })
            }
            if (!userItem) {
                return interaction.reply({ content: `${client.config.emojis.NO} ${client.language({ textId: "В инвентаре не такого предмета", guildId: interaction.guildId, locale: interaction.locale })}.`, flags: ["Ephemeral"] })  
            }
            const channel = await interaction.guild.channels.fetch(args.channel).catch(() => null)
            if (!channel) {
                return interaction.reply({ content: `${client.config.emojis.NO} ${client.language({ textId: "Введен неизвестный канал", guildId: interaction.guildId, locale: interaction.locale })}.`, flags: ["Ephemeral"] })  
            }
            if (!channel.permissionsFor(interaction.guild.members.me).has("ViewChannel") || !channel.permissionsFor(interaction.guild.members.me).has("SendMessages")) {
                return interaction.reply({ content: `${client.config.emojis.NO} ${client.language({ textId: "У меня нет прав для просмотра или отправки сообщений в этот канал", guildId: interaction.guildId, locale: interaction.locale })}.`, flags: ["Ephemeral"] })  
            }
            if (!channel.permissionsFor(interaction.member).has("ViewChannel") || !channel.permissionsFor(interaction.member).has("SendMessages")) {
                return interaction.reply({ content: `${client.config.emojis.NO} ${client.language({ textId: "У тебя нет прав для просмотра или отправки сообщений в этот канал", guildId: interaction.guildId, locale: interaction.locale })}.`, flags: ["Ephemeral"] })  
            }
            if (amount < guildItem.min_drop || (guildItem.max_drop ? amount > guildItem.max_drop : false)) {
                return interaction.reply({ content: `${client.config.emojis.NO} ${client.language({ textId: `Диапазон количества дропа этого предмета`, guildId: interaction.guildId, locale: interaction.locale })}: ${client.language({ textId: `от`, guildId: interaction.guildId, locale: interaction.locale })} ${guildItem.min_drop}${guildItem.max_drop ? ` ${client.language({ textId: `до`, guildId: interaction.guildId, locale: interaction.locale })} ${guildItem.max_drop}` : ""}`, flags: ["Ephemeral"] })  
            }
            if (profile.itemsCooldowns && profile.itemsCooldowns.get(guildItem.itemID)?.drop > new Date()) {
                return interaction.reply({ content: `<a:8716loading:991344303253241897>${client.language({ textId: "Ждите кулдаун для этого предмета", guildId: interaction.guildId, locale: interaction.locale })}: ${client.functions.transformSecs(client, profile.itemsCooldowns.get(guildItem.itemID).drop - new Date(), interaction.guildId, interaction.locale)}`, flags: ["Ephemeral"] })
            }
            if (guildItem.notDropable && !interaction.member.permissions.has("Administrator")) return interaction.reply({ content: `${client.config.emojis.NO} ${guildItem.displayEmoji}**${guildItem.name}** ${client.language({ textId: "нельзя бросать", guildId: interaction.guildId, locale: interaction.locale })}.`, flags: ["Ephemeral"] })  
            if (userItem.amount < amount) return interaction.reply({ content: `${client.config.emojis.NO} ${client.language({ textId: "В инвентаре", guildId: interaction.guildId, locale: interaction.locale })} ${guildItem.displayEmoji}${guildItem.name} (${userItem.amount})`, flags: ["Ephemeral"] })
            if (guildItem.dropPermission && client.cache.permissions.some(e => e.id === guildItem.dropPermission)) {
                const permission = client.cache.permissions.find(e => e.id === guildItem.dropPermission)
                const isPassing = permission.for(profile, interaction.member, interaction.channel, interaction)
                if (isPassing.value === false) {
                    return interaction.reply({ embeds: [new EmbedBuilder().setColor(3093046).setTitle(`${client.language({ textId: `Для этого взаимодействия требуется:`, guildId: interaction.guildId, locale: interaction.locale })}`).setDescription(isPassing.reasons.join("\n"))], flags: ["Ephemeral"] })
                }
            }
            await profile.subtractItem({ itemID: guildItem.itemID, amount })
            const drop = new Drop(client, uniqid.time(), interaction.user.id, RewardType.Item, amount, guildItem)
            const dropBTN = new ButtonBuilder()
                .setLabel(client.language({ textId: "Взять дроп", guildId: interaction.guildId, locale: interaction.locale }))
                .setStyle(ButtonStyle.Primary)
                .setCustomId(`cmd{drop}dropId{${drop.id}}`)
                .setEmoji('🤏')
            drops.set(drop.id, drop)
            channel.send({ content: `${client.language({ textId: "Дроп", guildId: interaction.guildId, locale: interaction.locale })} --> ||${guildItem.displayEmoji}**${guildItem.name} (${amount.toLocaleString()})**|| ${client.language({ textId: "от", guildId: interaction.guildId, locale: interaction.locale })} <@${interaction.user.id}>`, components: [new ActionRowBuilder().addComponents([dropBTN])]}).catch(() => null)
            if (guildItem.cooldown_drop) {
                if (!profile.itemsCooldowns) profile.itemsCooldowns = new Map()
                if (profile.itemsCooldowns.get(guildItem.itemID)) profile.itemsCooldowns.set(guildItem.itemID, {...profile.itemsCooldowns.get(guildItem.itemID), drop: new Date(Date.now() + guildItem.cooldown_drop * 1000) })
                else profile.itemsCooldowns.set(guildItem.itemID, { drop: new Date(Date.now() + guildItem.cooldown_drop * 1000) })
            }
            await profile.save()
            client.emit("economyLogCreate", interaction.guildId, `<@${interaction.user.id}> (${interaction.user.username}) ${client.language({ textId: "выбросил", guildId: interaction.guildId })} ${guildItem.displayEmoji}**${guildItem.name}** (${amount}) (<#${args.channel}>)`)
            return interaction.reply({ content: `${client.config.emojis.DONE} ${guildItem.displayEmoji}**${guildItem.name}** (${amount.toLocaleString()}) ${client.language({ textId: "был выброшен в", guildId: interaction.guildId, locale: interaction.locale })} <#${args.channel}>`, flags: ["Ephemeral"] })    
        }
    }
}