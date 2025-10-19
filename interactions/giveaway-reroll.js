const { EmbedBuilder } = require("discord.js")
const { RewardType } = require("../enums")
const giveawayRegexp = /giveaway{(.*?)}/
module.exports = {
    name: `giveaway-reroll`,
    run: async (client, interaction) => {
    	const giveaway = client.cache.giveaways.get(giveawayRegexp.exec(interaction.customId)[1])
        if (!giveaway) {
        	await interaction.update({ components: [] })
        	return interaction.followUp({ content: `${client.config.emojis.NO} ${client.language({ textId: `Этой раздачи больше не существует`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
        }
        if (giveaway.status !== "finished") {
        	return interaction.reply({ content: `${client.config.emojis.NO} ${client.language({ textId: `Эта раздача ещё не завершилась`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
        }
        const settings = client.cache.settings.get(interaction.guildId)
        if (settings.giveawayRerollPermission) {
        	const profile = await client.functions.fetchProfile(client, interaction.user.id, interaction.guildId)
        	const permission = client.cache.permissions.get(settings.giveawayRerollPermission)
        	const isPassing = permission.for(profile, interaction.member, interaction.channel, interaction)
            if (isPassing.value === false) {
                return interaction.reply({ embeds: [new EmbedBuilder().setColor(3093046).setTitle(`${client.language({ textId: `Для этого взаимодействия требуется:`, guildId: interaction.guildId, locale: interaction.locale })}`).setDescription(isPassing.reasons.join("\n"))], flags: ["Ephemeral"] })
            }
        } else {
        	if (!interaction.member.permissions.has("Administrator")) {
        		return interaction.reply({ content: `${client.config.emojis.NO} ${client.language({ textId: `Для этого взаимодействия требуется право администратора`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
        	}
        }
        const message = await interaction.message.fetch({ force: true }).catch(e => null)
        let reaction = message.reactions.resolve("🎉")
        if (!reaction) {
            if (giveaway.type === "user") {
                const profile = await client.functions.fetchProfile(client, giveaway.creator, interaction.guildId)
                for (const element of giveaway.rewards) {
                    if (element.type === RewardType.Currency) {
                        profile.currency = element.amount
                    }
                    else if (element.type === RewardType.Item) {
                        const item = client.cache.items.find(i => i.itemID === element.id && !i.temp)
                        if (item) await profile.addItem(element.id, element.amount)
                    } else if (element.type === RewardType.Role) {
                        const role = interaction.guild.roles.cache.get(element.id)
                        if (role) profile.addRole(element.id, element.amount, element.ms)
                    }
                }
                await profile.save()
            }
            await interaction.update({ components: [] })
            interaction.followUp({ content: `${client.config.emojis.NO} ${client.language({ textId: `Не удалось найти реакцию для раздачи`, guildId: interaction.guildId, locale: interaction.locale })} (${giveaway.giveawayID}). ${client.language({ textId: `Раздача удалена`, guildId: interaction.guildId, locale: interaction.locale })}.`, flags: ["Ephemeral"] })
            return giveaway.delete()
        }
        const object = await giveaway.reroll(interaction.guild, reaction)
        if (!object.winners.length) {
        	return interaction.reply({ content: `${client.config.emojis.NO} ${client.language({ textId: `Возможных победителей не осталось`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
        }
    	const embed = EmbedBuilder.from(interaction.message.embeds[0])
            .addFields([
                {
                    name: `${client.language({ textId: `Победители (реролл)`, guildId: interaction.guildId })}`,
                    value: object.winners.map(e => `<@${e.id}>`).join(", ")
                }
            ])
		await interaction.update({ 
			embeds: [embed]
		})
        interaction.followUp({ 
            content: `🥳 ${object.winners.map(e => `<@${e.id}>`).join(", ")} [${client.language({ textId: "поздравляем", guildId: interaction.guildId })}! ${object.winners.length === 1 ? client.language({ textId: "Ты стал победителем реролла раздачи и выиграл", guildId: interaction.guildId }) : client.language({ textId: "Вы стали победителями реролла раздачи и выиграли", guildId: interaction.guildId })}](<${interaction.message.url}>): ${object.rewards.join(", ")}`,
            allowedMentions: { users: object.winners.map(e => e.id) } 
        })
    }
}