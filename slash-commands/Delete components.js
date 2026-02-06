const { ApplicationCommandType, Collection } = require("discord.js")
module.exports = {
    name: 'Delete components',
    nameLocalizations: {
        'ru': `Удалить компоненты`,
        'uk': `Видалити компоненти`, 
        'es-ES': `Eliminar componentes`
    },
    description: 'Delete components from message',
    descriptionLocalizations: {
        'ru': `Удалить компоненты из сообщения`,
        'uk': `Видалити компоненти з повідомлення`,
        'es-ES': `Eliminar componentes del mensaje`,
        'en-US': `Delete components from message`,
        'en-GB': `Delete components from message`,
    },
    type: ApplicationCommandType.Message,
    dmPermission: false,
    defaultMemberPermissions: "Administrator",
    group: `context-group`,
    cooldowns: new Collection(),
    run: async (client, interaction) => {
        if (!interaction.channel) return interaction.reply({ content: `${client.config.emojis.NO}${client.language({ textId: "Возможно у меня нет доступа к каналу", guildId: interaction.guildId })}.`, flags: ["Ephemeral"] })
        if (!interaction.channel.messages) return interaction.reply({ content: `${client.config.emojis.NO}${client.language({ textId: "Возможно у меня нет доступа к сообщениям этого канала", guildId: interaction.guildId })}.`, flags: ["Ephemeral"] })
        const message = await interaction.channel.messages.fetch({ message: interaction.targetId, cache: false, force: true }).catch(() => null)
        if (!message) return interaction.reply({ content: `${client.config.emojis.NO}${client.language({ textId: "Не удалось найти сообщение", guildId: interaction.guildId })}.`, flags: ["Ephemeral"] })
        if (message.author.id !== client.user.id) return interaction.reply({ content: `${client.config.emojis.NO}${client.language({ textId: "Это сообщение не является моим", guildId: interaction.guildId })}.`, flags: ["Ephemeral"] })
        if (!message.components?.length) return interaction.reply({ content: `${client.config.emojis.NO}${client.language({ textId: "В этом сообщении нет компонентов", guildId: interaction.guildId })}.`, flags: ["Ephemeral"] })
        if (!message.editable) return interaction.reply({ content: `${client.config.emojis.NO}${client.language({ textId: "Я не могу редактировать это сообщение", guildId: interaction.guildId })}.`, flags: ["Ephemeral"] })
        message.edit({ content: message.content, embeds: message.embeds, files: message.attachments, components: [] })
        return interaction.reply({ content: `${client.config.emojis.YES}${client.language({ textId: "Компоненты из сообщения были удалены", guildId: interaction.guildId })}.`, flags: ["Ephemeral"] })
    }   
}