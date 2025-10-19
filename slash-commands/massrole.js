const {ApplicationCommandOptionType, Collection, PermissionFlagsBits } = require("discord.js")
const loading = new Collection()
module.exports = {
    name: 'massrole',
    nameLocalizations: {
        'ru': `массроль`,
        'uk': `масова-роль`,
        'es-ES': `rol-masivo`
    },
    description: 'Add/remove role to everyone',
    descriptionLocalizations: {
        'ru': `Добавить/удалить роль всем`,
        'uk': `Додати/видалити роль усім`,
        'es-ES': `Añadir/eliminar rol a todos`
    },
    options: [
        {
            name: 'add',
            nameLocalizations: {
                'ru': `добавить`,
                'uk': `додати`,
                'es-ES': `añadir`
            },
            description: 'Add role to everyone',
            descriptionLocalizations: {
                'ru': `Добавить роль всем`,
                'uk': `Додати роль усім`,
                'es-ES': `Añadir rol a todos`
            },
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'role',
                    nameLocalizations: {
                        'ru': `роль`,
                        'uk': `роль`,
                        'es-ES': `rol`
                    },
                    description: 'Addable role',
                    descriptionLocalizations: {
                        'ru': `Добавляемая роль`,
                        'uk': `Роль для додавання`,
                        'es-ES': `Rol para añadir`
                    },
                    type: ApplicationCommandOptionType.Role,
                    required: true
                }
            ]
        },
        {
            name: 'remove',
            nameLocalizations: {
                'ru': `удалить`,
                'uk': `видалити`,
                'es-ES': `eliminar`
            },
            description: 'Remove role from everyone',
            descriptionLocalizations: {
                'ru': `Удалить роль у всех`,
                'uk': `Видалити роль у всіх`,
                'es-ES': `Eliminar rol de todos`
            },
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'role',
                    nameLocalizations: {
                        'ru': `роль`,
                        'uk': `роль`,
                        'es-ES': `rol`
                    },
                    description: 'Removable role',
                    descriptionLocalizations: {
                        'ru': `Удаляемая роль`,
                        'uk': `Роль для видалення`,
                        'es-ES': `Rol para eliminar`
                    },
                    type: ApplicationCommandOptionType.Role,
                    required: true
                }
            ]
        },
    ],
    dmPermission: false,
    defaultMemberPermissions: PermissionFlagsBits.Administrator,
    group: `admins-group`,
    cooldowns: new Collection(),
    /**
     *
     * @param {Client} client
     * @param {CommandInteraction} interaction
     * @param {String[]} args
     */
    run: async (client, interaction, args) => {
        if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageRoles)) {
            return interaction.reply({ content: `${client.config.emojis.NO}${client.language({ textId: "У меня нет права управления ролями", guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
        }
        if (args.role === interaction.guildId) {
            return interaction.reply({ content: `${client.language({ textId: "Ты серьёзно? О_о", guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
        }
        if (loading.has(interaction.guildId)) {
            const process = loading.get(interaction.guildId)
            return interaction.reply({ content: `⏳${process.type === "remove" ? `${client.language({ textId: "Уже идет процесс удаления", guildId: interaction.guildId, locale: interaction.locale })}` : `${client.language({ textId: "Уже идет процесс добавления", guildId: interaction.guildId, locale: interaction.locale })}`} <@&${process.roleId}> (\`${process.count}\`/\`${process.membersSize}\` \`${Math.floor(process.count/process.membersSize*100)}%\`)`, flags: ["Ephemeral"] })
        }
        loading.set(interaction.guildId, { count: 0, membersSize: 0, type: args.Subcommand, roleId: args.role })
        await interaction.deferReply({ flags: ["Ephemeral"] })
        if (!client.fetchedMembers.has(interaction.guildId)) {
            await interaction.guild.members.fetch()
            client.fetchedMembers.add(interaction.guildId)
        }
        const role = interaction.guild.roles.cache.get(args.role)
        const members = interaction.guild.members.cache.filter(member => (args.Subcommand === "remove" ? member.roles.cache.has(role.id) : !member.roles.cache.has(role.id)) && !member.user.bot && member.roles.highest.position < interaction.guild.members.me.roles.highest.position)
        if (!members.size) {
            loading.delete(interaction.guildId)
            return interaction.editReply({ content: `${client.config.emojis.NO}${client.language({ textId: "Нет участников для", guildId: interaction.guildId, locale: interaction.locale })} ${args.Subcommand === "remove" ? `${client.language({ textId: "удаления роли", guildId: interaction.guildId, locale: interaction.locale })}` : `${client.language({ textId: "добавления роли", guildId: interaction.guildId, locale: interaction.locale })}`}` })
        }
        loading.set(interaction.guildId, { count: 0, membersSize: members.size, type: args.Subcommand, roleId: args.role })
        let count = 0
        for (const member of members) {
            await interaction.editReply({ content: `⏳${args.Subcommand === "remove" ? `${client.language({ textId: "Удаляю", guildId: interaction.guildId, locale: interaction.locale })}` : `${client.language({ textId: "Добавляю", guildId: interaction.guildId, locale: interaction.locale })}`} <@&${role.id}> (\`${count}\`/\`${members.size}\` \`${Math.floor(count/members.size*100)}%\`)`, flags: ["Ephemeral"] })
            if (args.Subcommand === "add") {
                await member[1].roles.add(role)
            }
            if (args.Subcommand === "remove") {
                await member[1].roles.remove(role)
            }
            count++
            loading.set(interaction.guildId, { count: count, membersSize: members.size, type: args.Subcommand, roleId: args.role })
        }
        loading.delete(interaction.guildId)
        return interaction.editReply({ content: `${client.config.emojis.YES} ${client.language({ textId: "Роль", guildId: interaction.guildId, locale: interaction.locale })} <@&${role.id}> ${args.Subcommand === "remove" ? `${client.language({ textId: "удалена", guildId: interaction.guildId, locale: interaction.locale })}` : `${client.language({ textId: "добавлена", guildId: interaction.guildId, locale: interaction.locale })}`}  (\`${count}\`/\`${members.size}\` \`${Math.floor(count/members.size*100)}%\`)`, flags: ["Ephemeral"] })
    }
}