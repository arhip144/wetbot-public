const { ApplicationCommandOptionType, Collection } = require("discord.js")
const questRegexp = /quest{(.*?)}/
module.exports = {
    name: 'quest-take-from-user',
    nameLocalizations: {
        'ru': `забрать-квест`,
        'uk': `забрати-квест`,
        'es-ES': `quitar-misión`
    },
    description: 'Take a quest from user',
    descriptionLocalizations: {
        'ru': `Забрать квест у пользователя`,
        'uk': `Забрати квест у користувача`,
        'es-ES': `Quitar una misión al usuario`
    },
    options: [
        {
            name: 'user',
            nameLocalizations: {
                'ru': 'юзер',
                'uk': 'користувач',
                'es-ES': 'usuario'
            },
            description: 'User to take a quest',
            descriptionLocalizations: {
                'ru': 'Пользователь, у которого забрать квест',
                'uk': 'Користувач, у якого забрати квест',
                'es-ES': 'Usuario al que quitar la misión'
            },
            type: ApplicationCommandOptionType.User,
            required: true
        },
        {
            name: 'quest',
            nameLocalizations: {
                'ru': 'квест',
                'uk': 'квест',
                'es-ES': 'misión'
            },
            description: 'Quest name or ID',
            descriptionLocalizations: {
                'ru': 'Название квеста или его ID',
                'uk': 'Назва квесту або його ID',
                'es-ES': 'Nombre de la misión o su ID'
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
        if (interaction.isButton()) {
            args = {}
            args.user = interaction.user.id
            if (!questRegexp.exec(interaction.customId)) return interaction.reply({ content: `${client.config.emojis.NO}**${client.language({ textId: "Отсутствует аргумент", guildId: interaction.guildId, locale: interaction.locale })}: quest{questId}**`, flags: ["Ephemeral"] })
            args.quest = questRegexp.exec(interaction.customId)[1]
            await interaction.deferReply({ flags: ["Ephemeral"] })
        } else await interaction.deferReply()
        const member = await interaction.guild.members.fetch(args.user).catch(e => null)
        if (!member) {
            return interaction.editReply({ content: `${client.config.emojis.NO} ${client.language({ textId: "Пользователь с ID", guildId: interaction.guildId, locale: interaction.locale })} **${args.user}** ${client.language({ textId: "не найден на сервере", guildId: interaction.guildId, locale: interaction.locale })}.` })
        }
        if (member.user.bot) {
            return interaction.editReply({ content: `${client.config.emojis.NO} ${client.language({ textId: "Ты не можешь использовать эту команду для бота", guildId: interaction.guildId, locale: interaction.locale })}.` })
        }
        const quests = client.cache.quests.filter(quest => quest.guildID === interaction.guildId)
        const profile = await client.functions.fetchProfile(client, args.user, interaction.guildId)
        let quest = quests.find(e => e.name.toLowerCase() === args.quest.toLowerCase())
        if (!quest) quest = quests.find(e => e.questID.toLowerCase() === args.quest.toLowerCase())
        if (!quest) {
            return interaction.editReply({ content: `${client.config.emojis.NO} ${client.language({ textId: "Квест с именем или ID", guildId: interaction.guildId, locale: interaction.locale })} **${args.quest}** ${client.language({ textId: "не найден", guildId: interaction.guildId, locale: interaction.locale })}.`})
        }
        if (!profile) {
            return interaction.editReply({ content: `${client.config.emojis.NO} ${client.language({ textId: "Пользователь с ID", guildId: interaction.guildId, locale: interaction.locale })} **${args.user}** не найден.`})
        }
        if (!profile.quests?.find(e => e.questID == quest.questID)) return interaction.editReply({ content: `${client.config.emojis.NO} ${client.language({ textId: "У пользователя не был найден квест", guildId: interaction.guildId, locale: interaction.locale })}: ${quest.displayEmoji}**${quest.name}**`})
        profile.delQuest(quest, true)
        delete client.globalCooldown[`${interaction.guildId}_${args.user}`]
        if (interaction.isButton()) {
            return interaction.editReply({ content: `${client.config.emojis.DONE} ${client.language({ textId: "Квест", guildId: interaction.guildId, locale: interaction.locale })} ${quest.displayEmoji}**${quest.name}** ${client.language({ textId: "удален", guildId: interaction.guildId, locale: interaction.locale })}`})
        } else {
            return interaction.editReply({ content: `${client.config.emojis.DONE} ${client.language({ textId: "У пользователя удален квест", guildId: interaction.guildId, locale: interaction.locale })}: ${quest.displayEmoji}**${quest.name}**`})
        }
        
    }
}