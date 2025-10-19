const { ApplicationCommandType, Collection } = require("discord.js")
module.exports = {
    name: 'Like the user',
    nameLocalizations: {
        'ru': `Лайкнуть`,
        'uk': `Вподобати`,
        'es-ES': `Dar me gusta`
    },
    description: 'Like the user',
    descriptionLocalizations: {
        'ru': `Лайкнуть пользователя`,
        'uk': `Вподобати користувача`,
        'es-ES': `Dar me gusta al usuario`,
        'en-US': `Like the user`,
        'en-GB': `Like the user`,
    },
    type: ApplicationCommandType.User,
    dmPermission: false,
    group: `context-group`,
    cooldowns: new Collection(),
    run: async (client, interaction) => {
        const command = client.slashCommands.get("like")
        if (!command) return interaction.reply({ content: `Неизвестная команда like`, flags: ["Ephemeral"] })
        command.run(client, interaction, { user: interaction.targetId })
    }   
}