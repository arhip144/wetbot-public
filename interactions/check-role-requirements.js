const { EmbedBuilder } = require("discord.js")
const roleRegexp = /role{(.*?)}/
module.exports = {
    name: `check-role-requirements`,
    run: async (client, interaction) => {
        const id = roleRegexp.exec(interaction.customId)?.[1]
        const role = client.cache.roles.find(e => e.id === id && e.guildID === interaction.guildId)
        if (!role) {
        	return interaction.reply({ content: `${client.config.emojis.NO} ${client.language({ textId: "Этой доходной роли уже не существует", guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
        }
        if (!role.permission) {
        	return interaction.reply({ content: `${client.config.emojis.NO} ${client.language({ textId: "Для этой доходной роли отсутствуют требования", guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
        }
        const permission = client.cache.permissions.find(e => e.id === role.permission)
        if (!permission) {
        	return interaction.reply({ content: `${client.config.emojis.NO} ${client.language({ textId: "Для этой доходной роли установлено неизвестное право", guildId: interaction.guildId, locale: interaction.locale })}: ${role.permission}`, flags: ["Ephemeral"] })
        }
        const profile = await client.functions.fetchProfile(client, interaction.user.id, interaction.guildId)
        const isPassing = permission.for(profile, interaction.member, interaction.channel, interaction)
        return interaction.reply({ embeds: [
        	new EmbedBuilder()
        		.setDescription(`# ${client.language({ textId: "Требования", guildId: interaction.guildId, locale: interaction.locale })}:\n${isPassing.reasons.map((req, index) => `${index+1}. ${req}`).join("\n")}`)
    	], flags: ["Ephemeral"] })
    }
}