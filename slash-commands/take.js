const { ApplicationCommandOptionType, Collection } = require("discord.js")
module.exports = {
    name: 'take',
    nameLocalizations: {
        'ru': `забрать`,
        'uk': `забрати`,
        'es-ES': `quitar`
    },
    description: 'Take level, XP, currency or RP from the user',
    descriptionLocalizations: {
        'ru': `Забрать уровень, опыт, валюту или репутацию у пользователя`,
        'uk': `Забрати рівень, досвід, валюту або репутацію у користувача`,
        'es-ES': `Quitar nivel, XP, moneda o reputación del usuario`
    },
    options: [
        {
            name: 'level',
            nameLocalizations: {
                'ru': `уровень`,
                'uk': `рівень`,
                'es-ES': `nivel`
            },
            description: 'Take level',
            descriptionLocalizations: {
                'ru': `Забрать уровень`,
                'uk': `Забрати рівень`,
                'es-ES': `Quitar nivel`
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
            description: 'Take season level',
            descriptionLocalizations: {
                'ru': `Забрать сезонный уровень`,
                'uk': `Забрати сезонний рівень`,
                'es-ES': `Quitar nivel de temporada`
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
                    min_value: 1,
                    max_value: 100
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
            description: 'Take experience',
            descriptionLocalizations: {
                'ru': `Забрать опыт`,
                'uk': `Забрати досвід`,
                'es-ES': `Quitar experiencia`
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
                    min_value: 1,
                    max_value: 100000
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
            description: 'Take currency',
            descriptionLocalizations: {
                'ru': `Забрать валюту`,
                'uk': `Забрати валюту`,
                'es-ES': `Quitar moneda`
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
                    min_value: 1,
                    max_value: 1000000000
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
            description: 'Take reputation',
            descriptionLocalizations: {
                'ru': `Забрать репутацию`,
                'uk': `Забрати репутацію`,
                'es-ES': `Quitar reputación`
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
                    min_value: 1,
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
            description: 'Take likes',
            descriptionLocalizations: {
                'ru': `Забрать лайки`,
                'uk': `Забрати лайки`,
                'es-ES': `Quitar me gusta`
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
                    min_value: 1,
                    max_value: 1000
                }
            ]
        },
        {
            name: 'role',
            nameLocalizations: {
                'ru': `роль`,
                'uk': `роль`,
                'es-ES': `rol`
            },
            description: 'Take role from /inventory-roles',
            descriptionLocalizations: {
                'ru': `Убрать роль из /инвентарь-ролей`,
                'uk': `Забрати роль з /інвентар-ролей`,
                'es-ES': `Quitar rol de /inventario-roles`
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
                    name: 'role',
                    nameLocalizations: {
                        'ru': `роль`,
                        'uk': `роль`,
                        'es-ES': `rol`
                    },
                    description: 'Role to take',
                    descriptionLocalizations: {
                        'ru': `Роль для уменьшения`,
                        'uk': `Роль для зменшення`,
                        'es-ES': `Rol para quitar`
                    },
                    type: ApplicationCommandOptionType.String,
                    required: true,
                    autocomplete: true
                },
                {
                    name: 'amount',
                    nameLocalizations: {
                        'ru': `количество`,
                        'uk': `кількість`,
                        'es-ES': `cantidad`
                    },
                    description: 'Amount of role',
                    descriptionLocalizations: {
                        'ru': `Количество роли`,
                        'uk': `Кількість ролі`,
                        'es-ES': `Cantidad de rol`
                    },
                    type: ApplicationCommandOptionType.Integer,
                    required: true,
                    min_value: 1,
                    max_value: 1000000
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
        if (member.user.bot)  return interaction.editReply({ content: `${client.config.emojis.NO} ${client.language({ textId: `Ты не можешь использовать эту команду для бота`, guildId: interaction.guildId, locale: interaction.locale })}.` })
        const profile = await client.functions.fetchProfile(client, args.user, interaction.guildId)
        if (args.Subcommand === "level") {
            await profile.subtractLevel({ amount: args.amount, save: true })
            return interaction.editReply({ content: `${client.config.emojis.YES} 🎖${client.language({ textId: "Уровень", guildId: interaction.guildId, locale: interaction.locale })} (${args.amount.toLocaleString()}) ${client.language({ textId: `было уменьшено`, guildId: interaction.guildId, locale: interaction.locale })} <@${args.user}>` })  
        }
        if (args.Subcommand === "season_level") {
            await profile.subtractSeasonLevel({ amount: args.amount, save: true })
            return interaction.editReply({ content: `${client.config.emojis.YES} ${client.config.emojis.seasonLevel}${client.language({ textId: "Сезонный уровень", guildId: interaction.guildId, locale: interaction.locale })} (${args.amount.toLocaleString()}) ${client.language({ textId: `было уменьшено`, guildId: interaction.guildId, locale: interaction.locale })} <@${args.user}>` })  
        }
        if (args.Subcommand === "experience") {
            await profile.subtractXp({ amount: args.amount, save: true })
            return interaction.editReply({ content: `${client.config.emojis.YES} ${client.config.emojis.XP}**${client.language({ textId: "Опыт", guildId: interaction.guildId, locale: interaction.locale })}** (${args.amount.toLocaleString()}) ${client.language({ textId: `было уменьшено`, guildId: interaction.guildId, locale: interaction.locale })} <@${args.user}>` })
        }
        if (args.Subcommand === "reputation") {
            if (profile.rp - args.amount < -1000) return interaction.editReply({ content: `${client.config.emojis.NO} ${client.language({ textId: `Репутация (RP) у пользователя не должна быть меньше -1000`, guildId: interaction.guildId, locale: interaction.locale })}` })
            await profile.subtractRp({ amount: args.amount, save: true })
            return interaction.editReply({ content: `${client.config.emojis.YES} ${client.config.emojis.RP}**${client.language({ textId: "Репутация", guildId: interaction.guildId, locale: interaction.locale })}** (${args.amount.toLocaleString()}) ${client.language({ textId: `было уменьшено`, guildId: interaction.guildId, locale: interaction.locale })} <@${args.user}>` })
        }
        if (args.Subcommand === "currency") {
            const settings = client.cache.settings.get(interaction.guildId)
            await profile.subtractCurrency({ amount: args.amount, save: true, noCurrencySpent: true })
            return interaction.editReply({ content: `${client.config.emojis.YES} ${settings.displayCurrencyEmoji}**${settings.currencyName}** (${args.amount.toLocaleString()}) ${client.language({ textId: `было уменьшено`, guildId: interaction.guildId, locale: interaction.locale })} <@${args.user}>` })
        }
        if (args.Subcommand === "likes") {
            profile.likes -= args.amount
            await profile.save()
            return interaction.editReply({ content: `${client.config.emojis.YES} ${client.config.emojis.heart}️${args.amount.toLocaleString()} ${client.language({ textId: `было уменьшено`, guildId: interaction.guildId, locale: interaction.locale })} <@${args.user}>` })
        }
        if (args.Subcommand === "role") {
            const inventoryRole = profile.inventoryRoles?.find(e => e.uniqId === args.role)
            if (!inventoryRole) return interaction.editReply({ content: `${client.config.emojis.NO}${client.language({ textId: "Роль не найдена", guildId: interaction.guildId, locale: interaction.locale })}` })
            const role = interaction.guild.roles.cache.get(inventoryRole.id)
            profile.subtractRole({ id: inventoryRole.id, amount: args.amount, ms: inventoryRole.ms })
            await profile.save()
            return interaction.editReply({ content: `${client.config.emojis.YES}${client.language({ textId: "Роль", guildId: interaction.guildId, locale: interaction.locale })} ${role ? `<@&${role.id}>` : `${inventoryRole.id}`}${inventoryRole.ms ? ` [${client.functions.transformSecs(client, inventoryRole.ms, interaction.guildId, interaction.locale)}]` : ``} (${args.amount}) ${client.language({ textId: "была взята из </inventory-roles:1197450785324290148> пользователя", guildId: interaction.guildId, locale: interaction.locale })} <@${args.user}>` })
        }
    }
}