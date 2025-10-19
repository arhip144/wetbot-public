const { ApplicationCommandOptionType, Collection, EmbedBuilder } = require("discord.js")
module.exports = {
    name: 'transfer-role',
    nameLocalizations: {
        'ru': `передать-роль`,
        'uk': `передати-роль`,
        'es-ES': `transferir-rol`
    },
    description: 'Transfer role to another user\'s inventory',
    descriptionLocalizations: {
        'ru': `Передать роль другому пользователю`,
        'uk': `Передати роль іншому користувачу`,
        'es-ES': `Transferir rol a otro usuario`
    },
    options: [
        {
            name: 'user',
            nameLocalizations: {
                'ru': `юзер`,
                'uk': `користувач`,
                'es-ES': `usuario`
            },
            description: 'The user to transfer a role',
            descriptionLocalizations: {
                'ru': `Пользователь для передачи роли`,
                'uk': `Користувач для передачі ролі`,
                'es-ES': `Usuario para transferir el rol`
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
            description: 'A role to transfer',
            descriptionLocalizations: {
                'ru': `Роль для передачи`,
                'uk': `Роль для передачі`,
                'es-ES': `Rol para transferir`
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
            description: 'An amount to transfer',
            descriptionLocalizations: {
                'ru': `Количество для передачи`,
                'uk': `Кількість для передачі`,
                'es-ES': `Cantidad para transferir`
            },
            type: ApplicationCommandOptionType.Integer,
            required: true
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
        const mentionMember = await interaction.guild.members.fetch(args.user).catch(e => null)
        if (!mentionMember) return interaction.reply({ content: `${client.config.emojis.NO}${client.language({ textId: `Пользователь с ID`, guildId: interaction.guildId, locale: interaction.locale })} **${args.user}** ${client.language({ textId: `не найден на сервере`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
        if (mentionMember.user.bot || mentionMember.user.id === interaction.user.id) {
            return interaction.reply({ content: `${client.config.emojis.NO}**${client.language({ textId: `Ты не можешь использовать эту команду на себя или бота`, guildId: interaction.guildId, locale: interaction.locale })}**`, flags: ["Ephemeral"] })
        }
        if (!interaction.channel.permissionsFor(mentionMember, false).has("ViewChannel")) {
            return interaction.reply({ content: `${client.config.emojis.NO}**${client.language({ textId: `У этого пользователя нет доступа к просмотру этого канала`, guildId: interaction.guildId, locale: interaction.locale })}**`, flags: ["Ephemeral"] })
        }
        const profile = await client.functions.fetchProfile(client, interaction.user.id, interaction.guildId)
        const amount = args.amount <= 0 ? 1 : args.amount
        const profile1 = await client.functions.fetchProfile(client, mentionMember.user.id, interaction.guildId)
        if (isNaN(+args.role)) return interaction.reply({ content: `${client.config.emojis.NO}**${client.language({ textId: `Роль не найдена в инвентаре`, guildId: interaction.guildId, locale: interaction.locale })}**`, flags: ["Ephemeral"] })
        const roleInventory = profile.inventoryRoles[+args.role]
        if (!roleInventory) {
            return interaction.reply({ content: `${client.config.emojis.NO}**${client.language({ textId: "Роль не найдена в инвентаре", guildId: interaction.guildId, locale: interaction.locale })}**`, flags: ["Ephemeral"] })
        }
        const role = interaction.guild.roles.cache.get(roleInventory.id)
        if (!role) {
            return interaction.reply({ content: `${client.config.emojis.NO}**${client.language({ textId: `Роль не найдена`, guildId: interaction.guildId, locale: interaction.locale })} (${args.role})**`, flags: ["Ephemeral"] })
        }
        const roleProperties = await client.rolePropertiesSchema.findOne({ id: role.id }).lean()
        if (roleProperties && roleProperties.cannotTransfer) {
            return interaction.reply({ content: `${client.config.emojis.NO}**${client.language({ textId: `Эту роль нельзя передавать`, guildId: interaction.guildId, locale: interaction.locale })} (<@&${role.id}>)**`, flags: ["Ephemeral"] })
        }
        if (!roleInventory || roleInventory.amount < amount) {
            return interaction.reply({ content: `${client.config.emojis.NO}**${client.language({ textId: "В инвентаре", guildId: interaction.guildId, locale: interaction.locale })} <@&${role.id}> (${roleInventory?.amount || 0})**`, flags: ["Ephemeral"] })
        }
        profile.subtractRole(role.id, amount, roleInventory.ms)
        profile1.addRole(role.id, amount, roleInventory.ms)
        await profile.save()
        await profile1.save()
        return interaction.reply({ content: `<@${interaction.user.id}> ${client.language({ textId: "передал", guildId: interaction.guildId, locale: interaction.locale })} <@&${role.id}>${roleInventory.ms ? ` [${client.functions.transformSecs(client, roleInventory.ms, interaction.guildId, interaction.locale)}]` : ``} (${amount}) ${client.language({ textId: "к", guildId: interaction.guildId, locale: interaction.locale })} <@${mentionMember.user.id}>`, allowedMentions: { users: [interaction.user.id, mentionMember.user.id] } })
    }
}