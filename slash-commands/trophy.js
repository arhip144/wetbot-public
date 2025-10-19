const { ApplicationCommandOptionType, Collection } = require("discord.js")
module.exports = {
    name: 'trophy',
    nameLocalizations: {
        'ru': `трофей`,
        'uk': `трофей`,
        'es-ES': `trofeo`
    },
    description: 'Manager of trophy system',
    descriptionLocalizations: {
        'ru': `Менеджер трофеев`,
        'uk': `Менеджер трофеїв`,
        'es-ES': `Administrador del sistema de trofeos`
    },
    options: [
        {
            name: 'give',
            nameLocalizations: {
                'ru': `выдать`,
                'uk': `видати`,
                'es-ES': `otorgar`
            },
            description: 'Give a trophy to the user',
            descriptionLocalizations: {
                'ru': `Выдать трофей пользователю`,
                'uk': `Видати трофей користувачу`,
                'es-ES': `Otorgar un trofeo al usuario`
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
                    description: 'The user to give a trophy',
                    descriptionLocalizations: {
                        'ru': `Пользователь для выдачи трофея`,
                        'uk': `Користувач для видачі трофею`,
                        'es-ES': `Usuario para otorgar el trofeo`
                    },
                    type: ApplicationCommandOptionType.User,
                    required: true
                },
                {
                    name: 'trophy',
                    nameLocalizations: {
                        'ru': `трофей`,
                        'uk': `трофей`,
                        'es-ES': `trofeo`
                    },
                    description: 'Name of trophy',
                    descriptionLocalizations: {
                        'ru': `Название трофея`,
                        'uk': `Назва трофею`,
                        'es-ES': `Nombre del trofeo`
                    },
                    minLength: 1,
                    maxLength: 60,
                    type: ApplicationCommandOptionType.String,
                    required: true
                }
            ]
        },
        {
            name: 'take',
            nameLocalizations: {
                'ru': `забрать`,
                'uk': `забрати`,
                'es-ES': `quitar`
            },
            description: 'Take a trophy from the user',
            descriptionLocalizations: {
                'ru': `Забрать трофей у пользователя`,
                'uk': `Забрати трофей у користувача`,
                'es-ES': `Quitar un trofeo al usuario`
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
                    description: 'User to take a trophy',
                    descriptionLocalizations: {
                        'ru': `Пользователь для снятия трофея`,
                        'uk': `Користувач для зняття трофею`,
                        'es-ES': `Usuario para quitar el trofeo`
                    },
                    type: ApplicationCommandOptionType.User,
                    required: true
                },
                {
                    name: 'trophy',
                    nameLocalizations: {
                        'ru': `трофей`,
                        'uk': `трофей`,
                        'es-ES': `trofeo`
                    },
                    description: 'Name of trophy',
                    descriptionLocalizations: {
                        'ru': `Название трофея`,
                        'uk': `Назва трофею`,
                        'es-ES': `Nombre del trofeo`
                    },
                    minLength: 1,
                    maxLength: 60,
                    type: ApplicationCommandOptionType.String,
                    autocomplete: true,
                    required: true
                }
            ]
        },
    ],
    defaultMemberPermissions: "Administrator",
    dmPermission: false,
    group: `profile-group`,
    cooldowns: new Collection(),
    /**
     *
     * @param {Client} client
     * @param {CommandInteraction} interaction
     * @param {String[]} args
     */
    run: async (client, interaction, args) => {
        const profile = await client.functions.fetchProfile(client, args.user, interaction.guildId)
        if (args.Subcommand == 'give') {
            if (args.trophy.length > 60) {
                return interaction.reply({ content: `${client.config.emojis.NO} ${client.language({ textId: `Название трофея не должно содержать больше 60 символов`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
            }
            if (profile.trophies?.length >= 10) {
                return interaction.reply({ content: `${client.config.emojis.NO} ${client.language({ textId: `Нельзя добавить больше 10 трофеев`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
            }
            if (profile.trophies?.some(e => e.toLowerCase() == args.trophy.toLowerCase())) {
                return interaction.reply({ content: `${client.config.emojis.NO} <@${args.user}> ${client.language({ textId: `уже имеет`, guildId: interaction.guildId, locale: interaction.locale })} ${args.trophy}`, flags: ["Ephemeral"] })
            }
            if (!profile.trophies) profile.trophies = []
            profile.trophies.push(args.trophy)
            await profile.save()
            return interaction.reply({ content: `${client.config.emojis.YES} ${client.language({ textId: `Трофей`, guildId: interaction.guildId, locale: interaction.locale })} ${args.trophy} ${client.language({ textId: `был добавлен`, guildId: interaction.guildId, locale: interaction.locale })} <@${args.user}>` })
        }
        if (args.Subcommand == 'take') {
            const trophies = profile.trophies?.filter(e => e.toLowerCase().includes(args.trophy.toLowerCase())) || []
            if (trophies?.length > 1 && !trophies?.some(e => e.toLowerCase() == args.trophy.toLowerCase())) {
                let result = ""
                for (const trophy of trophies) {
                    result += `> ${trophy}\n`
                }
                return interaction.reply({ content: `${client.config.emojis.block}${client.language({ textId: ` По вашему запросу было найдено несколько трофеев`, guildId: interaction.guildId, locale: interaction.locale })}:\n${result}` }) 
            }
            if (!profile.trophies?.some(e => e.toLowerCase() == args.trophy.toLowerCase())) {
                return interaction.reply({ content: `${client.config.emojis.NO} <@${args.user}> ${client.language({ textId: `не имеет трофея`, guildId: interaction.guildId, locale: interaction.locale })} ${args.trophy}`, flags: ["Ephemeral"] })
            }
            profile.trophies = profile.trophies.filter(e => e.toLowerCase() !== args.trophy.toLowerCase())
            if (!profile.trophies[0]) profile.trophies = undefined
            await profile.save()
            return interaction.reply({ content: `${client.config.emojis.YES} ${client.language({ textId: `Трофей`, guildId: interaction.guildId, locale: interaction.locale })} ${args.trophy} ${client.language({ textId: `был убран у`, guildId: interaction.guildId, locale: interaction.locale })} <@${args.user}>` })
        }
    }
}