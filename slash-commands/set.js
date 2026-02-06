const { ApplicationCommandOptionType, Collection } = require("discord.js")
const { AchievementType } = require("../enums")
module.exports = {
    name: 'set',
    nameLocalizations: {
        'ru': `установить`,
        'uk': `встановити`,
        'es-ES': `establecer`
    },
    description: 'Set level, XP, currency or RP to the user',
    descriptionLocalizations: {
        'ru': `Установить уровень, опыт, валюту, лайки или репутацию пользователю`,
        'uk': `Встановити рівень, досвід, валюту, лайки або репутацію користувачу`,
        'es-ES': `Establecer nivel, XP, moneda o RP al usuario`
    },
    options: [
        {
            name: 'level',
            nameLocalizations: {
                'ru': `уровень`,
                'uk': `рівень`,
                'es-ES': `nivel`
            },
            description: 'Set level',
            descriptionLocalizations: {
                'ru': `Установить уровень`,
                'uk': `Встановити рівень`,
                'es-ES': `Establecer nivel`
            },
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'user',
                    nameLocalizations: {
                        'ru': `юзер`,
                        'uk': `користувач`,
                        'es-ES': `usuario`
                    },
                    description: 'Target user',
                    descriptionLocalizations: {
                        'ru': `Целевой пользователь`,
                        'uk': `Цільовий користувач`,
                        'es-ES': `Usuario objetivo`
                    },
                    type: ApplicationCommandOptionType.User,
                    required: true
                },
                {
                    name: 'amount',
                    nameLocalizations: {
                        'ru': `количество`,
                        'uk': `кількість`,
                        'es-ES': `cantidad`
                    },
                    description: 'Amount of levels',
                    descriptionLocalizations: {
                        'ru': `Количество уровней`,
                        'uk': `Кількість рівнів`,
                        'es-ES': `Cantidad de niveles`
                    },
                    type: ApplicationCommandOptionType.Integer,
                    required: true,
                    min_value: 1
                }
            ]
        },
        {
            name: 'season_level',
            nameLocalizations: {
                'ru': `сезонный_уровень`,
                'uk': `сезонний_рівень`,
                'es-ES': `nivel_temporada`
            },
            description: 'Set season level',
            descriptionLocalizations: {
                'ru': `Установить сезонный уровень`,
                'uk': `Встановити сезонний рівень`,
                'es-ES': `Establecer nivel de temporada`
            },
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'user',
                    nameLocalizations: {
                        'ru': `юзер`,
                        'uk': `користувач`,
                        'es-ES': `usuario`
                    },
                    description: 'Target user',
                    descriptionLocalizations: {
                        'ru': `Целевой пользователь`,
                        'uk': `Цільовий користувач`,
                        'es-ES': `Usuario objetivo`
                    },
                    type: ApplicationCommandOptionType.User,
                    required: true
                },
                {
                    name: 'amount',
                    nameLocalizations: {
                        'ru': `количество`,
                        'uk': `кількість`,
                        'es-ES': `cantidad`
                    },
                    description: 'Amount of season levels',
                    descriptionLocalizations: {
                        'ru': `Количество сезонных уровней`,
                        'uk': `Кількість сезонних рівнів`,
                        'es-ES': `Cantidad de niveles de temporada`
                    },
                    type: ApplicationCommandOptionType.Integer,
                    required: true,
                    min_value: 1
                }
            ]
        },
        {
            name: 'experience',
            nameLocalizations: {
                'ru': `опыт`,
                'uk': `досвід`,
                'es-ES': `experiencia`
            },
            description: 'Set experience',
            descriptionLocalizations: {
                'ru': `Установить опыт`,
                'uk': `Встановити досвід`,
                'es-ES': `Establecer experiencia`
            },
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'user',
                    nameLocalizations: {
                        'ru': `юзер`,
                        'uk': `користувач`,
                        'es-ES': `usuario`
                    },
                    description: 'Target user',
                    descriptionLocalizations: {
                        'ru': `Целевой пользователь`,
                        'uk': `Цільовий користувач`,
                        'es-ES': `Usuario objetivo`
                    },
                    type: ApplicationCommandOptionType.User,
                    required: true
                },
                {
                    name: 'amount',
                    nameLocalizations: {
                        'ru': `количество`,
                        'uk': `кількість`,
                        'es-ES': `cantidad`
                    },
                    description: 'Amount of experience',
                    descriptionLocalizations: {
                        'ru': `Количество опыта`,
                        'uk': `Кількість досвіду`,
                        'es-ES': `Cantidad de experiencia`
                    },
                    type: ApplicationCommandOptionType.Integer,
                    required: true,
                    min_value: 0
                }
            ]
        },
        {
            name: 'currency',
            nameLocalizations: {
                'ru': `валюта`,
                'uk': `валюта`,
                'es-ES': `moneda`
            },
            description: 'Set currency',
            descriptionLocalizations: {
                'ru': `Установить валюту`,
                'uk': `Встановити валюту`,
                'es-ES': `Establecer moneda`
            },
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'user',
                    nameLocalizations: {
                        'ru': `юзер`,
                        'uk': `користувач`,
                        'es-ES': `usuario`
                    },
                    description: 'Target user',
                    descriptionLocalizations: {
                        'ru': `Целевой пользователь`,
                        'uk': `Цільовий користувач`,
                        'es-ES': `Usuario objetivo`
                    },
                    type: ApplicationCommandOptionType.User,
                    required: true
                },
                {
                    name: 'amount',
                    nameLocalizations: {
                        'ru': `количество`,
                        'uk': `кількість`,
                        'es-ES': `cantidad`
                    },
                    description: 'Amount of currency',
                    descriptionLocalizations: {
                        'ru': `Количество валюты`,
                        'uk': `Кількість валюти`,
                        'es-ES': `Cantidad de moneda`
                    },
                    type: ApplicationCommandOptionType.Integer,
                    required: true,
                    min_value: 0
                }
            ]
        },
        {
            name: 'reputation',
            nameLocalizations: {
                'ru': `репутация`,
                'uk': `репутація`,
                'es-ES': `reputación`
            },
            description: 'Set reputation',
            descriptionLocalizations: {
                'ru': `Установить репутацию`,
                'uk': `Встановити репутацію`,
                'es-ES': `Establecer reputación`
            },
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'user',
                    nameLocalizations: {
                        'ru': `юзер`,
                        'uk': `користувач`,
                        'es-ES': `usuario`
                    },
                    description: 'Target user',
                    descriptionLocalizations: {
                        'ru': `Целевой пользователь`,
                        'uk': `Цільовий користувач`,
                        'es-ES': `Usuario objetivo`
                    },
                    type: ApplicationCommandOptionType.User,
                    required: true
                },
                {
                    name: 'amount',
                    nameLocalizations: {
                        'ru': `количество`,
                        'uk': `кількість`,
                        'es-ES': `cantidad`
                    },
                    description: 'Amount of reputation',
                    descriptionLocalizations: {
                        'ru': `Количество репутации`,
                        'uk': `Кількість репутації`,
                        'es-ES': `Cantidad de reputación`
                    },
                    type: ApplicationCommandOptionType.Integer,
                    required: true,
                    min_value: -1000,
                    max_value: 1000
                }
            ]
        },
        {
            name: 'likes',
            nameLocalizations: {
                'ru': `лайки`,
                'uk': `лайки`,
                'es-ES': `me-gusta`
            },
            description: 'Set likes',
            descriptionLocalizations: {
                'ru': `Установить лайки`,
                'uk': `Встановити лайки`,
                'es-ES': `Establecer me gusta`
            },
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'user',
                    nameLocalizations: {
                        'ru': `юзер`,
                        'uk': `користувач`,
                        'es-ES': `usuario`
                    },
                    description: 'Target user',
                    descriptionLocalizations: {
                        'ru': `Целевой пользователь`,
                        'uk': `Цільовий користувач`,
                        'es-ES': `Usuario objetivo`
                    },
                    type: ApplicationCommandOptionType.User,
                    required: true
                },
                {
                    name: 'amount',
                    nameLocalizations: {
                        'ru': `количество`,
                        'uk': `кількість`,
                        'es-ES': `cantidad`
                    },
                    description: 'Amount of likes',
                    descriptionLocalizations: {
                        'ru': `Количество лайков`,
                        'uk': `Кількість лайків`,
                        'es-ES': `Cantidad de me gusta`
                    },
                    type: ApplicationCommandOptionType.Integer,
                    required: true,
                    min_value: 0
                }
            ]
        },
        {
            name: 'luck_boost',
            nameLocalizations: {
                'ru': `удача_буст`,
                'uk': `удача_буст`,
                'es-ES': `impulso_suerte`
            },
            description: 'Set luck boost',
            descriptionLocalizations: {
                'ru': `Установить буст к удаче`,
                'uk': `Встановити буст до удачі`,
                'es-ES': `Establecer impulso de suerte`
            },
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'user',
                    nameLocalizations: {
                        'ru': `юзер`,
                        'uk': `користувач`,
                        'es-ES': `usuario`
                    },
                    description: 'Target user',
                    descriptionLocalizations: {
                        'ru': `Целевой пользователь`,
                        'uk': `Цільовий користувач`,
                        'es-ES': `Usuario objetivo`
                    },
                    type: ApplicationCommandOptionType.User,
                    required: true
                },
                {
                    name: 'percent',
                    nameLocalizations: {
                        'ru': `процент`,
                        'uk': `відсоток`,
                        'es-ES': `porcentaje`
                    },
                    description: 'Multiplier as a percentage',
                    descriptionLocalizations: {
                        'ru': `Множитель в процентах`,
                        'uk': `Множник у відсотках`,
                        'es-ES': `Multiplicador como porcentaje`
                    },
                    type: ApplicationCommandOptionType.Integer,
                    required: true,
                    min_value: 0,
                    max_value: 10000
                },
                {
                    name: 'time',
                    nameLocalizations: {
                        'ru': `время`,
                        'uk': `час`,
                        'es-ES': `tiempo`
                    },
                    description: 'Time in minutes',
                    descriptionLocalizations: {
                        'ru': `Время в минутах`,
                        'uk': `Час у хвилинах`,
                        'es-ES': `Tiempo en minutos`
                    },
                    type: ApplicationCommandOptionType.Integer,
                    required: true,
                    min_value: 1,
                    max_value: 10000000
                }
            ]
        },
        {
            name: 'xp_boost',
            nameLocalizations: {
                'ru': `опыт_буст`,
                'uk': `досвід_буст`,
                'es-ES': `impulso_experiencia`
            },
            description: 'Set experience boost',
            descriptionLocalizations: {
                'ru': `Установить буст к опыту`,
                'uk': `Встановити буст до досвіду`,
                'es-ES': `Establecer impulso de experiencia`
            },
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'user',
                    nameLocalizations: {
                        'ru': `юзер`,
                        'uk': `користувач`,
                        'es-ES': `usuario`
                    },
                    description: 'Target user',
                    descriptionLocalizations: {
                        'ru': `Целевой пользователь`,
                        'uk': `Цільовий користувач`,
                        'es-ES': `Usuario objetivo`
                    },
                    type: ApplicationCommandOptionType.User,
                    required: true
                },
                {
                    name: 'percent',
                    nameLocalizations: {
                        'ru': `процент`,
                        'uk': `відсоток`,
                        'es-ES': `porcentaje`
                    },
                    description: 'Multiplier as a percentage',
                    descriptionLocalizations: {
                        'ru': `Множитель в процентах`,
                        'uk': `Множник у відсотках`,
                        'es-ES': `Multiplicador como porcentaje`
                    },
                    type: ApplicationCommandOptionType.Integer,
                    required: true,
                    min_value: 0,
                    max_value: 10000
                },
                {
                    name: 'time',
                    nameLocalizations: {
                        'ru': `время`,
                        'uk': `час`,
                        'es-ES': `tiempo`
                    },
                    description: 'Time in minutes',
                    descriptionLocalizations: {
                        'ru': `Время в минутах`,
                        'uk': `Час у хвилинах`,
                        'es-ES': `Tiempo en minutos`
                    },
                    type: ApplicationCommandOptionType.Integer,
                    required: true,
                    min_value: 1,
                    max_value: 10000000
                }
            ]
        },
        {
            name: 'currency_boost',
            nameLocalizations: {
                'ru': `валюта_буст`,
                'uk': `валюта_буст`,
                'es-ES': `impulso_moneda`
            },
            description: 'Set currency boost',
            descriptionLocalizations: {
                'ru': `Установить буст к валюте`,
                'uk': `Встановити буст до валюти`,
                'es-ES': `Establecer impulso de moneda`
            },
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'user',
                    nameLocalizations: {
                        'ru': `юзер`,
                        'uk': `користувач`,
                        'es-ES': `usuario`
                    },
                    description: 'Target user',
                    descriptionLocalizations: {
                        'ru': `Целевой пользователь`,
                        'uk': `Цільовий користувач`,
                        'es-ES': `Usuario objetivo`
                    },
                    type: ApplicationCommandOptionType.User,
                    required: true
                },
                {
                    name: 'percent',
                    nameLocalizations: {
                        'ru': `процент`,
                        'uk': `відсоток`,
                        'es-ES': `porcentaje`
                    },
                    description: 'Multiplier as a percentage',
                    descriptionLocalizations: {
                        'ru': `Множитель в процентах`,
                        'uk': `Множник у відсотках`,
                        'es-ES': `Multiplicador como porcentaje`
                    },
                    type: ApplicationCommandOptionType.Integer,
                    required: true,
                    min_value: 0,
                    max_value: 10000
                },
                {
                    name: 'time',
                    nameLocalizations: {
                        'ru': `время`,
                        'uk': `час`,
                        'es-ES': `tiempo`
                    },
                    description: 'Time in minutes',
                    descriptionLocalizations: {
                        'ru': `Время в минутах`,
                        'uk': `Час у хвилинах`,
                        'es-ES': `Tiempo en minutos`
                    },
                    type: ApplicationCommandOptionType.Integer,
                    required: true,
                    min_value: 1,
                    max_value: 10000000
                }
            ]
        },
        {
            name: 'rp_boost',
            nameLocalizations: {
                'ru': `репутация_буст`,
                'uk': `репутація_буст`,
                'es-ES': `impulso_reputación`
            },
            description: 'Set reputation boost',
            descriptionLocalizations: {
                'ru': `Установить буст к репутации`,
                'uk': `Встановити буст до репутації`,
                'es-ES': `Establecer impulso de reputación`
            },
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'user',
                    nameLocalizations: {
                        'ru': `юзер`,
                        'uk': `користувач`,
                        'es-ES': `usuario`
                    },
                    description: 'Target user',
                    descriptionLocalizations: {
                        'ru': `Целевой пользователь`,
                        'uk': `Цільовий користувач`,
                        'es-ES': `Usuario objetivo`
                    },
                    type: ApplicationCommandOptionType.User,
                    required: true
                },
                {
                    name: 'percent',
                    nameLocalizations: {
                        'ru': `процент`,
                        'uk': `відсоток`,
                        'es-ES': `porcentaje`
                    },
                    description: 'Multiplier as a percentage',
                    descriptionLocalizations: {
                        'ru': `Множитель в процентах`,
                        'uk': `Множник у відсотках`,
                        'es-ES': `Multiplicador como porcentaje`
                    },
                    type: ApplicationCommandOptionType.Integer,
                    required: true,
                    min_value: 0,
                    max_value: 10000
                },
                {
                    name: 'time',
                    nameLocalizations: {
                        'ru': `время`,
                        'uk': `час`,
                        'es-ES': `tiempo`
                    },
                    description: 'Time in minutes',
                    descriptionLocalizations: {
                        'ru': `Время в минутах`,
                        'uk': `Час у хвилинах`,
                        'es-ES': `Tiempo en minutos`
                    },
                    type: ApplicationCommandOptionType.Integer,
                    required: true,
                    min_value: 1,
                    max_value: 10000000
                }
            ]
        }
    ],
    defaultMemberPermissions: "Administrator",
    dmPermission: false,
    group: `admins-group`,
    cooldowns: new Collection(),
    run: async (client, interaction, args) => {
        await interaction.deferReply({ flags: ["Ephemeral"] })
        const member = await interaction.guild.members.fetch(args.user).catch(() => null)
        if (!member) return interaction.editReply({ content: `${client.config.emojis.NO} ${client.language({ textId: `Пользователь с ID`, guildId: interaction.guildId, locale: interaction.locale })} **${args.user}** ${client.language({ textId: `не найден на сервере`, guildId: interaction.guildId, locale: interaction.locale })}.`})
        if (member.user.bot) return interaction.editReply({ content: `${client.config.emojis.NO} ${client.language({ textId: `Ты не можешь использовать эту команду для бота`, guildId: interaction.guildId, locale: interaction.locale })}.`, flags: ["Ephemeral"] })
        const profile = await client.functions.fetchProfile(client, args.user, interaction.guildId)
        if (args.Subcommand === "level") {
            await profile.setLevel({ amount: args.amount, save: true })
            return interaction.editReply({ content: `${client.config.emojis.YES} 🎖**${client.language({ textId: `Уровень`, guildId: interaction.guildId, locale: interaction.locale })}** (${args.amount.toLocaleString()}) ${client.language({ textId: `был установлен`, guildId: interaction.guildId, locale: interaction.locale })} <@${args.user}>`, flags: ["Ephemeral"] }) 
        }
        if (args.Subcommand === "season_level") {
            await profile.setSeasonLevel({ amount: args.amount, save: true })  
            return interaction.editReply({ content: `${client.config.emojis.YES} ${client.config.emojis.seasonLevel}**${client.language({ textId: `Сезонный уровень`, guildId: interaction.guildId, locale: interaction.locale })}** (${args.amount.toLocaleString()}) ${client.language({ textId: `был установлен`, guildId: interaction.guildId, locale: interaction.locale })} <@${args.user}>`, flags: ["Ephemeral"] }) 
        }
        if (args.Subcommand === "experience") {
            await profile.setXp(args.amount, true)
            return interaction.editReply({ content: `${client.config.emojis.YES} ${client.config.emojis.XP}**${client.language({ textId: "Опыт", guildId: interaction.guildId, locale: interaction.locale })}** (${args.amount.toLocaleString()}) ${client.language({ textId: `было установлено`, guildId: interaction.guildId, locale: interaction.locale })} <@${args.user}>`, flags: ["Ephemeral"] })
        }
        if (args.Subcommand === "reputation") {
            profile.rp = args.amount
            profile.save()
            return interaction.editReply({ content: `${client.config.emojis.YES} ${client.config.emojis.RP}**${client.language({ textId: "Репутация", guildId: interaction.guildId, locale: interaction.locale })}** (${args.amount.toLocaleString()}) ${client.language({ textId: `было установлено`, guildId: interaction.guildId, locale: interaction.locale })} <@${args.user}>` })
        }
        if (args.Subcommand === "currency") {
            const settings = client.cache.settings.get(interaction.guildId)
            profile.currency = args.amount
            await profile.save()
            return interaction.editReply({ content: `${client.config.emojis.YES} ${settings.displayCurrencyEmoji}**${settings.currencyName}** (${args.amount.toLocaleString()}) ${client.language({ textId: `было установлено`, guildId: interaction.guildId, locale: interaction.locale })} <@${args.user}>` })
        }
        if (args.Subcommand === "likes") {
            const achievements = client.cache.achievements.filter(e => e.guildID === interaction.guildId && e.enabled && e.type === AchievementType.Like)
            profile.likes = args.amount
            await Promise.all(achievements.map(async achievement => {
                if (!profile.achievements?.some(ach => ach.achievmentID === achievement.id) && profile.likes >= achievement.amount && !client.tempAchievements[profile.userID]?.includes(achievement.id)) {
                    if (!client.tempAchievements[profile.userID]) client.tempAchievements[profile.userID] = []
                    client.tempAchievements[profile.userID].push(achievement.id)
                    await profile.addAchievement({ achievement })
                }    
            }))
            await profile.save()
            return interaction.editReply({ content: `${client.config.emojis.YES} ${client.config.emojis.heart}️${args.amount.toLocaleString()} ${client.language({ textId: `было установлено`, guildId: interaction.guildId, locale: interaction.locale })} <@${args.user}>` })
        }
        if (args.Subcommand === "luck_boost") {
            if (args.percent === 0) {
                profile.multiplyLuck = undefined
                profile.multiplyLuckTime = undefined
                await profile.save()
                return interaction.editReply({ content: `${client.config.emojis.YES} ${client.language({ textId: `Удален буст к удаче`, guildId: interaction.guildId, locale: interaction.locale })}` })
            } else {
                profile.multiplyLuck = args.percent / 100
                profile.multiplyLuckTime = new Date(Date.now() + args.time * 60 * 1000)
                await profile.save()
                return interaction.editReply({ content: `${client.config.emojis.YES} ${client.language({ textId: `Установлено`, guildId: interaction.guildId, locale: interaction.locale })} +${args.percent}% ${client.language({ textId: `к удаче до`, guildId: interaction.guildId, locale: interaction.locale })} <t:${Math.floor((Date.now() + args.time * 60 * 1000) / 1000)}:f>` })
            }
        }
        if (args.Subcommand === "xp_boost") {
            if (args.percent === 0) {
                profile.multiplyXP = undefined
                profile.multiplyXPTime = undefined
                await profile.save()
                return interaction.editReply({ content: `${client.config.emojis.YES} ${client.language({ textId: `Удален буст к опыту`, guildId: interaction.guildId, locale: interaction.locale })}` })
            } else {
                profile.multiplyXP = args.percent / 100
                profile.multiplyXPTime = new Date(Date.now() + args.time * 60 * 1000)
                await profile.save()
                return interaction.editReply({ content: `${client.config.emojis.YES} ${client.language({ textId: `Установлено`, guildId: interaction.guildId, locale: interaction.locale })} +${args.percent}% ${client.language({ textId: `к опыту до`, guildId: interaction.guildId, locale: interaction.locale })} <t:${Math.floor((Date.now() + args.time * 60 * 1000) / 1000)}:f>` })
            }
        }
        if (args.Subcommand === "currency_boost") {
            if (args.percent === 0) {
                profile.multiplyCUR = undefined
                profile.multiplyCURTime = undefined
                await profile.save()
                return interaction.editReply({ content: `${client.config.emojis.YES} ${client.language({ textId: `Удален буст к валюте`, guildId: interaction.guildId, locale: interaction.locale })}` })
            } else {
                profile.multiplyCUR = args.percent / 100
                profile.multiplyCURTime = new Date(Date.now() + args.time * 60 * 1000)
                await profile.save()
                return interaction.editReply({ content: `${client.config.emojis.YES} ${client.language({ textId: `Установлено`, guildId: interaction.guildId, locale: interaction.locale })} +${args.percent}% ${client.language({ textId: `к валюте до`, guildId: interaction.guildId, locale: interaction.locale })} <t:${Math.floor((Date.now() + args.time * 60 * 1000) / 1000)}:f>` })
            }
        }
        if (args.Subcommand === "rp_boost") {
            if (args.percent === 0) {
                profile.multiplyRP = undefined
                profile.multiplyRPTime = undefined
                await profile.save()
                return interaction.editReply({ content: `${client.config.emojis.YES} ${client.language({ textId: `Удален буст к репутации`, guildId: interaction.guildId, locale: interaction.locale })}` })
            } else {
                profile.multiplyRP = args.percent / 100
                profile.multiplyRPTime = new Date(Date.now() + args.time * 60 * 1000)
                await profile.save()
                return interaction.editReply({ content: `${client.config.emojis.YES} ${client.language({ textId: `Установлено`, guildId: interaction.guildId, locale: interaction.locale })} +${args.percent}% ${client.language({ textId: `к репутации до`, guildId: interaction.guildId, locale: interaction.locale })} <t:${Math.floor((Date.now() + args.time * 60 * 1000) / 1000)}:f>` })
            }
        }
    }
}