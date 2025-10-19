const { ApplicationCommandOptionType, Collection } = require("discord.js")
module.exports = {
    name: 'achievement-give-to-user',
    nameLocalizations: {
        'ru': `выдать-достижение`,
        'uk': `видати-досягнення`,
        'es-ES': `otorgar-logro`
    },
    description: 'Add an achievement to the user',
    descriptionLocalizations: {
        'ru': `Выдать достижение пользователю`,
        'uk': `Видати досягнення користувачу`,
        'es-ES': `Otorgar un logro al usuario`
    },
    options: [
        {
            name: 'user',
            nameLocalizations: {
                'ru': 'юзер',
                'uk': 'користувач',
                'es-ES': 'usuario'
            },
            description: 'User to give an achievement',
            descriptionLocalizations: {
                'ru': 'Пользователь, которому выдать достижение',
                'uk': 'Користувач, якому видати досягнення',
                'es-ES': 'Usuario al que otorgar el logro'
            },
            type: ApplicationCommandOptionType.User,
            required: true
        },
        {
            name: 'achievement',
            nameLocalizations: {
                'ru': 'достижение',
                'uk': 'досягнення',
                'es-ES': 'logro'
            },
            description: 'Achievement name or ID',
            descriptionLocalizations: {
                'ru': 'Название достижения или его ID',
                'uk': 'Назва досягнення або його ID',
                'es-ES': 'Nombre del logro o su ID'
            },
            type: ApplicationCommandOptionType.String,
            required: true,
            autocomplete: true
        }
    ],
    defaultMemberPermissions: "Administrator",
    dmPermission: false,
    group: `admins-group`,
    cooldowns: new Collection(),
    /**
     *
     * @param {Client} client
     * @param {CommandInteraction} interaction
     * @param {String[]} args
     */
    run: async (client, interaction, args) => {
        await interaction.deferReply({ flags: ["Ephemeral"] })
        const member = await interaction.guild.members.fetch(args.user).catch(e => null)
        if (!member) {
            return interaction.editReply({ content: `${client.config.emojis.NO} ${client.language({ textId: "Пользователь с ID", guildId: interaction.guildId, locale: interaction.locale })} **${args.user}** ${client.language({ textId: "не найден на сервере", guildId: interaction.guildId, locale: interaction.locale })}.` })
        }
        if (member.user.bot) {
            return interaction.editReply({ content: `${client.config.emojis.NO} ${client.language({ textId: "Ты не можешь использовать эту команду для бота", guildId: interaction.guildId, locale: interaction.locale })}` })
        }
        const profile = await client.functions.fetchProfile(client, args.user, interaction.guildId)
        const achievement = client.cache.achievements.find(e => e.guildID === interaction.guildId && e.enabled && (e.id === args.achievement || e.name === args.achievement))
        if (!achievement) {
            return interaction.editReply({ content: `${client.config.emojis.NO} ${client.language({ textId: "Достижение с именем или ID", guildId: interaction.guildId, locale: interaction.locale })} **${args.achievement}** ${client.language({ textId: "не найдено", guildId: interaction.guildId, locale: interaction.locale })}.`})
        }
        if (profile.achievements?.find(e => e.achievmentID === achievement.id)) {
            return interaction.editReply({ content: `${client.config.emojis.NO} ${client.language({ textId: "У пользователя уже есть достижение", guildId: interaction.guildId, locale: interaction.locale })} ${achievement.displayEmoji}**${achievement.name}**.`})
        }
        await profile.addAchievement(achievement, true)
        return interaction.editReply({ content: `${client.config.emojis.DONE} ${client.language({ textId: "Достижение", guildId: interaction.guildId, locale: interaction.locale })} ${achievement.displayEmoji}**${achievement.name}** ${client.language({ textId: "было добавлено пользователю", guildId: interaction.guildId, locale: interaction.locale })}.`})
    }
}