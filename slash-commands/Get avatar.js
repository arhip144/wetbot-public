const { ApplicationCommandType, EmbedBuilder, Collection } = require("discord.js")
module.exports = {
    name: 'Get avatar',
    nameLocalizations: {
        'ru': `Получить аватар`,
        'uk': `Отримати аватар`,
        'es-ES': `Obtener avatar`
    },
    description: 'Get user\'s avatar',
    descriptionLocalizations: {
        'ru': `Получить аватар пользователя`,
        'uk': `Отримати аватар користувача`,
        'es-ES': `Obtener el avatar del usuario`,
        'en-US': `Get user\'s avatar`,
        'en-GB': `Get user\'s avatar`,
    },
    type: ApplicationCommandType.User,
    dmPermission: false,
    group: `context-group`,
    cooldowns: new Collection(),
    run: async (client, interaction) => {
        const embed = new EmbedBuilder()
        const member = await interaction.guild.members.fetch(interaction.targetId).catch(e => null)
        if (!member) return interaction.reply({ content: `${client.config.emojis.NO} ${client.language({ textId: "Пользователь с ID", guildId: interaction.guildId, locale: interaction.locale })} **${interaction.targetId}** ${client.language({ textId: "не найден на сервере", guildId: interaction.guildId, locale: interaction.locale })}.`, flags: ["Ephemeral"] })
        embed.setDescription(`<@${member.user.id}>`)
        embed.setImage(member.displayAvatarURL({ size: 4096 }))
        interaction.member.send({ embeds: [embed] }).catch(e => null)
        interaction.reply({ embeds: [embed], flags: ["Ephemeral"] })
    }   
}