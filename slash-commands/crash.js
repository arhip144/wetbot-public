const { ApplicationCommandOptionType, EmbedBuilder, Collection } = require("discord.js")
const Decimal = require("decimal.js")
const { AchievementType } = require("../enums")
module.exports = {
    name: 'crash',
    nameLocalizations: {
        'ru': `краш`,
        'uk': `краш`,
        'es-ES': `crash`
    },
    description: 'Play Crash',
    descriptionLocalizations: {
        'ru': `Играть в Краш`,
        'uk': `Грати в Краш`,
        'es-ES': `Jugar al Crash`
    },
    options: [
        {
            name: 'coefficient',
            nameLocalizations: {
                'ru': 'коэффициент',
                'uk': 'коефіцієнт',
                'es-ES': 'coeficiente'
            },
            description: 'Bet the winning coefficient',
            descriptionLocalizations: {
                'ru': 'Поставить коэффициент выигрыша',
                'uk': 'Поставити коефіцієнт виграшу',
                'es-ES': 'Apostar el coeficiente de ganancia'
            },
            type: ApplicationCommandOptionType.Number,
            min_value: 1.01,
            max_value: 1000,
            required: true,
        },
        {
            name: 'bet',
            nameLocalizations: {
                'ru': 'ставка',
                'uk': 'ставка',
                'es-ES': 'apuesta'
            },
            description: 'Place a bet',
            descriptionLocalizations: {
                'ru': 'Поставить ставку',
                'uk': 'Зробити ставку',
                'es-ES': 'Hacer una apuesta'
            },
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
            description: 'Bet amount',
            descriptionLocalizations: {
                'ru': 'Количество ставки',
                'uk': 'Кількість ставки',
                'es-ES': 'Cantidad de la apuesta'
            },
            min_value: 1,
            type: ApplicationCommandOptionType.Integer,
            required: true
        }
    ],
    dmPermission: false,
    group: `games-group`,
    cooldowns: new Collection(),
    /**
     *
     * @param {Client} client
     * @param {CommandInteraction} interaction
     * @param {String[]} args
     */
    run: async (client, interaction, args) => {
        const betCoefficient = args.coefficient
        if (betCoefficient.toString().split('.')[1]?.length > 2) {
            return interaction.reply({ content: `${client.language({ textId: `Количество знаков ставки после точки не должно быть больше 2`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
        }
        const profile = await client.functions.fetchProfile(client, interaction.user.id, interaction.guildId)
        const settings = client.cache.settings.get(interaction.guildId)
        let userItem
        let serverItem
        if (args.bet !== "currency") {
            const filteredItems = client.cache.items.filter(e => e.guildID === interaction.guildId && !e.temp && e.enabled && e.name.toLowerCase().includes(args.bet.toLowerCase()) && profile.inventory.some(x => x.itemID == e.itemID))
            if (filteredItems.size > 1 && !filteredItems.some(e => e.name.toLowerCase() === args.bet.toLowerCase())) {
                let result = ""
                filteredItems.forEach(item => {
                    result += `> ${item.displayEmoji}**${item.name}**\n`
                })
                return interaction.reply({ content: `${client.config.emojis.block} ${client.language({ textId: `По вашему запросу было найдено несколько предметов`, guildId: interaction.guildId, locale: interaction.locale })}:\n${result}`, flags: ["Ephemeral"] })   
            }
            if (filteredItems.some(e => e.name.toLowerCase() === args.bet.toLowerCase())) {
                serverItem = filteredItems.find(e => e.name.toLowerCase() === args.bet.toLowerCase())
                if (!serverItem) return interaction.reply({ content: `${client.config.emojis.NO} ${client.language({ textId: `Предмет не найден`, guildId: interaction.guildId, locale: interaction.locale })}.`, flags: ["Ephemeral"] })  
                userItem = profile.inventory.find(e => { return e.itemID == serverItem.itemID && e.amount > 0 })
            } else {
                serverItem = filteredItems.first()
                if (!serverItem) return interaction.reply({ content: `${client.config.emojis.NO} ${client.language({ textId: `Предмет не найден`, guildId: interaction.guildId, locale: interaction.locale })}.`, flags: ["Ephemeral"] })  
                userItem = profile.inventory.find(e => { return e.itemID == serverItem.itemID && e.amount > 0})
            }
            if (!userItem) {
                return interaction.reply({ content: `‼ ${client.language({ textId: `В инвентаре нет такого предмета`, guildId: interaction.guildId, locale: interaction.locale })}: **${serverItem.displayEmoji}${serverItem.name}**`, flags: ["Ephemeral"] })
            }
            if (serverItem.notCrashable) {
                return interaction.reply({ content: `${client.config.emojis.NO} ${client.language({ textId: `Этот предмет нельзя поставить в краше`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
            }
        }
        const serverItemEmoji = args.bet === "currency" ? settings.displayCurrencyEmoji : serverItem?.displayEmoji
        const serverItemName = args.bet === "currency" ? settings.currencyName : serverItem?.name
        if ((args.bet === "currency" ? profile.currency : userItem.amount) < args.amount) return interaction.reply({ content: `${client.config.emojis.NO} ${client.language({ textId: "В инвентаре", guildId: interaction.guildId, locale: interaction.locale })} ${serverItemEmoji}${serverItemName} (${(args.bet === "currency" ? profile.currency : userItem.amount)})`, flags: ["Ephemeral"] })
        if (args.bet !== "currency") {
            await profile.subtractItem(serverItem.itemID, args.amount)    
        } else {
            await profile.subtractCurrency(args.amount)
        }
        await profile.save()
        const coefficient = getCrashPoint()
        await interaction.deferReply()

        const startTime = Date.now()
        let currentMultiplier = 1

        const gameLoop = setInterval(async () => {
            const elapsedSeconds = (Date.now() - startTime) / 1000
            currentMultiplier = Math.exp(elapsedSeconds * 0.1)
            interaction.editReply({ embeds: [
                new EmbedBuilder()
                    .setAuthor({ name: interaction.member.displayName, iconURL: interaction.member.displayAvatarURL() })
                    .setTitle(`${interaction.client.language({ textId: `Мини-игра 'Краш'`, guildId: interaction.guildId, locale: interaction.locale })}`)
                    .setFields([
                        {
                            name: `${interaction.client.language({ textId: `Коэффициент игры:`, guildId: interaction.guildId, locale: interaction.locale })}`,
                            value: `x${coefficient > currentMultiplier ? currentMultiplier.toFixed(2) : coefficient}`
                        },
                        {
                            name: `${interaction.client.language({ textId: `Твой коэффициент:`, guildId: interaction.guildId, locale: interaction.locale })}`,
                            value: `x${betCoefficient}`
                        },
                        {
                            name: `${interaction.client.language({ textId: betCoefficient > currentMultiplier ? `Выигрыш:` : betCoefficient <= coefficient ? `Ты выиграл:` : `Ты проиграл:`, guildId: interaction.guildId, locale: interaction.locale })}`,
                            value: `${serverItemEmoji}${serverItemName} (${args.amount.toLocaleString()}) ➜ ${serverItemEmoji}${serverItemName} (${Number(String(new Decimal(args.amount).mul((new Decimal(betCoefficient > currentMultiplier ? currentMultiplier : betCoefficient <= coefficient ? betCoefficient : 0))))).toLocaleString()})`
                        }
                    ])
                    .setColor(coefficient > currentMultiplier ? "Green" : betCoefficient <= coefficient ? `Green` : `Red`)    
            ] })
            if (currentMultiplier >= coefficient) {
                clearInterval(gameLoop)
                interaction.editReply({ embeds: [
                    new EmbedBuilder()
                        .setAuthor({ name: interaction.member.displayName, iconURL: interaction.member.displayAvatarURL() })
                        .setTitle(`${interaction.client.language({ textId: `Мини-игра 'Краш'`, guildId: interaction.guildId, locale: interaction.locale })}`)
                        .setFields([
                            {
                                name: `${interaction.client.language({ textId: `Коэффициент игры:`, guildId: interaction.guildId, locale: interaction.locale })}`,
                                value: `x${coefficient}`
                            },
                            {
                                name: `${interaction.client.language({ textId: `Твой коэффициент:`, guildId: interaction.guildId, locale: interaction.locale })}`,
                                value: `x${betCoefficient}`
                            },
                            {
                                name: betCoefficient <= coefficient ? `${interaction.client.language({ textId: `Ты выиграл:`, guildId: interaction.guildId, locale: interaction.locale })}` : `${interaction.client.language({ textId: `Ты проиграл:`, guildId: interaction.guildId, locale: interaction.locale })}`,
                                value: `${serverItemEmoji}${serverItemName} (${args.amount.toLocaleString()}) ➜ ${serverItemEmoji}${serverItemName} (${Number(String(new Decimal(args.amount).mul((new Decimal(betCoefficient <= coefficient ? betCoefficient : 0))))).toLocaleString()})`
                            }
                        ])
                        .setColor(betCoefficient <= coefficient ? "Green" : "Red")    
                ] })
                if (args.bet !== "currency") {
                    if (betCoefficient <= coefficient) await profile.addItem(serverItem.itemID, +`${new Decimal(args.amount).mul((new Decimal(betCoefficient)))}`) 
                } else {
                    if (betCoefficient <= coefficient) await profile.addCurrency(+`${new Decimal(args.amount).mul((new Decimal(betCoefficient)))}`)
                }
                if (betCoefficient <= coefficient) {
                    const achievements = client.cache.achievements.filter(e => e.guildID === interaction.guildId && e.enabled && e.type === AchievementType.Crash)
                    await Promise.all(achievements.map(async achievement => {
                        if (!profile.achievements?.some(ach => ach.achievmentID === achievement.id) && betCoefficient >= achievement.amount && !client.tempAchievements[interaction.user.id]?.includes(achievement.id)) { 
                            if (!client.tempAchievements[interaction.user.id]) client.tempAchievements[interaction.user.id] = []
                            client.tempAchievements[interaction.user.id].push(achievement.id)
                            await profile.addAchievement(achievement)
                        }
                    }))
                }
                return await profile.save()
            }
        }, 1000)
    }
}
function getCrashPoint(houseEdge = 0.01) {
    const MAX = 0xFFFFFFFFFFFFF // 2^52 (4503599627370496 в десятичной)
    // Генерируем случайное число от 1 до 2^52 - 1
    const random = Math.floor(Math.random() * (MAX - 1)) + 1
    const point = (MAX * (1 - houseEdge)) / random
    return Number(Math.max(1, point).toFixed(2)) // Минимальный множитель = 1
}