const { TextInputStyle, InteractionType, ActionRowBuilder, ModalBuilder, TextInputBuilder, Collection, LabelBuilder } = require("discord.js")
module.exports = {
    name: 'eval',
    description: 'Run JS code',
    dmPermission: true,
    group: `admins-group`,
    defaultMemberPermissions: "Administrator",
    owner: true,
    cooldowns: new Collection(),
    /**
     *
     * @param {Client} client
     * @param {CommandInteraction} interaction
     * @param {String[]} args
     */
    run: async (client, interaction, args) => {
        if (interaction.user.id !== client.config.discord.ownerId) return interaction.reply({ content: `${client.language({ textId: `У тебя нет прав для использования этой команды`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
        const modal = new ModalBuilder()
            .setCustomId(`content`)
            .setTitle(`Run JS code`)
            .setLabelComponents([
                new LabelBuilder()
                    .setLabel(`Выражение`)
                    .setTextInputComponent(
                        new TextInputBuilder()
                            .setCustomId("content")
                            .setRequired(true)
                            .setStyle(TextInputStyle.Paragraph)
                    ),
            ])
        await interaction.showModal(modal);delete client.globalCooldown[`${interaction.guildId}_${interaction.user.id}`]
        const filter = (i) => i.customId === `content` && i.user.id === interaction.user.id
        interaction = await interaction.awaitModalSubmit({ filter, time: 300000 }).catch(e => interaction)
        if (interaction && interaction.type === InteractionType.ModalSubmit) {
            const modalArgs = {}
            interaction.fields.fields.each(field => modalArgs[field.customId] = field.value)
            try {
                const result = await eval(modalArgs.content)
                console.log(result)
                let json = JSON.stringify(result)
                return interaction.reply({ content: `${json?.slice(0, 2000)}`, flags: ["Ephemeral"] })
            } catch (err) {
                interaction.reply({ content: err.stack, flags: ["Ephemeral"] })
            }
        } else return
    }
}