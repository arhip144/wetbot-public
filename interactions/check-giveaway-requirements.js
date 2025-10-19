const { EmbedBuilder } = require("discord.js")
const giveawayRegexp = /giveaway{(.*?)}/
module.exports = {
    name: `check-giveaway-requirements`,
    run: async (client, interaction) => {
        const id = giveawayRegexp.exec(interaction.customId)?.[1]
        const giveaway = await client.giveawaySchema.findOne({ giveawayID: id, guildID: interaction.guildId }).lean()
        if (!giveaway) {
        	return interaction.reply({ content: `${client.config.emojis.NO} ${client.language({ textId: "Этой раздачи уже не существует", guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
        }
        if (!giveaway.permission) {
        	return interaction.reply({ content: `${client.config.emojis.NO} ${client.language({ textId: "Для этой раздачи отсутствуют требования", guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
        }
        const permission = client.cache.permissions.find(e => e.id === giveaway.permission)
        if (!permission) {
        	return interaction.reply({ content: `${client.config.emojis.NO} ${client.language({ textId: "Для этой раздачи установлено неизвестное право", guildId: interaction.guildId, locale: interaction.locale })}: ${giveaway.permission}`, flags: ["Ephemeral"] })
        }
        const profile = await client.functions.fetchProfile(client, interaction.user.id, interaction.guildId)
        const isPassing = permission.for(profile, interaction.member, undefined, interaction)
        return interaction.reply({ embeds: [
        	new EmbedBuilder()
        		.setDescription(`# ${client.language({ textId: "Требования", guildId: interaction.guildId, locale: interaction.locale })}:\n${isPassing.reasons.map((req, index) => `${index+1}. ${req}`).join("\n")}`)
    	], flags: ["Ephemeral"] })
    }
}