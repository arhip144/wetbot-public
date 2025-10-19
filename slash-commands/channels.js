const { ChannelType, EmbedBuilder, Collection, ApplicationCommandOptionType } = require("discord.js")
module.exports = {
    name: 'channels',
    nameLocalizations: {
        'ru': `каналы`,
        'uk': 'канали',
        'es-ES': 'canales'
    },
    description: 'Information about channels bonuses',
    descriptionLocalizations: {
        'ru': `Информация о бонусах каналов`,
        'uk': 'Інформація про бонуси каналів',
        'es-ES': 'Información sobre bonificaciones de canales'
    },
    options: [
        {
            name: 'name',
            nameLocalizations: {
                'ru': `название`,
                'uk': 'назва',
                'es-ES': 'nombre'
            },
            description: 'Channel name',
            descriptionLocalizations: {
                'ru': `Название канала`,
                'uk': 'Назва каналу',
                'es-ES': 'Nombre del canal'
            },
            type: ApplicationCommandOptionType.String,
            autocomplete: true,
            required: true
        }
    ],
    dmPermission: false,
    group: `general-group`,
    cooldowns: new Collection(),
    run: async (client, interaction, args) => {
        await interaction.deferReply({ flags: ["Ephemeral"] })
        const embed = new EmbedBuilder()
            .setColor(3093046)
        const multipliersChannel = client.cache.channels.find(e => e.id === args.name && e.guildID === interaction.guildId)
        if (!multipliersChannel) return interaction.editReply({ content: `${client.config.emojis.NO}**${client.language({ textId: `Канал с названием`, guildId: interaction.guildId, locale: interaction.locale })} <${args.name}> ${client.language({ textId: `не существует`, guildId: interaction.guildId, locale: interaction.locale })}**`, flags: ["Ephemeral"] })
        if (!interaction.guild.channels.cache.get(multipliersChannel.id)) {
            await multipliersChannel.delete()
            return interaction.editReply({ content: `${client.config.emojis.NO}**${client.language({ textId: `Канал не найден и был удален`, guildId: interaction.guildId, locale: interaction.locale })}**`, flags: ["Ephemeral"] })
        }
        const channel = await interaction.guild.channels.fetch(multipliersChannel.id).catch(e => null)
        if (channel) {
            embed.setTitle(`${client.language({ textId: `Множители канала`, guildId: interaction.guildId, locale: interaction.locale })}`)
            const value = [
                `${client.language({ textId: `Тип`, guildId: interaction.guildId, locale: interaction.locale })}: ${channel.type === ChannelType.GuildText ? `${client.language({ textId: "Текстовый канал", guildId: interaction.guildId, locale: interaction.locale })}` : 
                channel.type === ChannelType.GuildVoice ? `${client.language({ textId: "Голосовой канал", guildId: interaction.guildId, locale: interaction.locale })}` : 
                channel.type === ChannelType.GuildCategory ? `${client.language({ textId: "Категория", guildId: interaction.guildId, locale: interaction.locale })}` : 
                channel.type === ChannelType.GuildAnnouncement ? `${client.language({ textId: "Канал с объявлениями", guildId: interaction.guildId, locale: interaction.locale })}` : 
                channel.type === ChannelType.GuildStageVoice ? `${client.language({ textId: "Трибуна", guildId: interaction.guildId, locale: interaction.locale })}` : 
                channel.type === ChannelType.PublicThread ? `${client.language({ textId: "Публичная ветка", guildId: interaction.guildId, locale: interaction.locale })}` : 
                channel.type === ChannelType.PrivateThread ? `${client.language({ textId: "Приватная ветка", guildId: interaction.guildId, locale: interaction.locale })}` : `${client.language({ textId: "Неизвестно", guildId: interaction.guildId, locale: interaction.locale })}` }`,
                `${client.language({ textId: `Бонус к опыту`, guildId: interaction.guildId, locale: interaction.locale })} +${multipliersChannel.xp_multiplier * 100}%`,
                `${client.language({ textId: `Бонус к валюте`, guildId: interaction.guildId, locale: interaction.locale })} +${multipliersChannel.cur_multiplier * 100}%`,
                `${client.language({ textId: `Бонус к репутации`, guildId: interaction.guildId, locale: interaction.locale })} +${multipliersChannel.rp_multiplier * 100}%`,
                `${client.language({ textId: `Бонус к удаче`, guildId: interaction.guildId, locale: interaction.locale })} +${multipliersChannel.luck_multiplier * 100}%` 
            ]
            if (channel.type === ChannelType.GuildVoice || channel.type === ChannelType.GuildCategory) {
                value.push(
                    `${client.language({ textId: `Бонус к опыту за каждого человека`, guildId: interaction.guildId, locale: interaction.locale })} +${multipliersChannel.xp_multiplier_for_members * 100}% (${client.language({ textId: `от`, guildId: interaction.guildId, locale: interaction.locale })} ${multipliersChannel.xp_min_members_size} ${client.language({ textId: `до`, guildId: interaction.guildId, locale: interaction.locale })} ${multipliersChannel.xp_max_members_size} ${client.language({ textId: `чел`, guildId: interaction.guildId, locale: interaction.locale })}.)`,
                    `${client.language({ textId: `Бонус к валюте за каждого человека`, guildId: interaction.guildId, locale: interaction.locale })} +${multipliersChannel.cur_multiplier_for_members * 100}% (${client.language({ textId: `от`, guildId: interaction.guildId, locale: interaction.locale })} ${multipliersChannel.cur_min_members_size} ${client.language({ textId: `до`, guildId: interaction.guildId, locale: interaction.locale })} ${multipliersChannel.cur_max_members_size} ${client.language({ textId: `чел`, guildId: interaction.guildId, locale: interaction.locale })}.)`,
                    `${client.language({ textId: `Бонус к репутации за каждого человека`, guildId: interaction.guildId, locale: interaction.locale })} +${multipliersChannel.rp_multiplier_for_members * 100}% (${client.language({ textId: `от`, guildId: interaction.guildId, locale: interaction.locale })} ${multipliersChannel.rp_min_members_size} ${client.language({ textId: `до`, guildId: interaction.guildId, locale: interaction.locale })} ${multipliersChannel.rp_max_members_size} ${client.language({ textId: `чел`, guildId: interaction.guildId, locale: interaction.locale })}.)`,
                    `${client.language({ textId: `Бонус к удаче за каждого человека`, guildId: interaction.guildId, locale: interaction.locale })} +${multipliersChannel.luck_multiplier_for_members * 100}% (${client.language({ textId: `от`, guildId: interaction.guildId, locale: interaction.locale })} ${multipliersChannel.luck_min_members_size} ${client.language({ textId: `до`, guildId: interaction.guildId, locale: interaction.locale })} ${multipliersChannel.luck_max_members_size} ${client.language({ textId: `чел`, guildId: interaction.guildId, locale: interaction.locale })}.)`,
                )
            }
            embed.addFields([{ name: channel.name, value: `${value.join("\n")}`, inline: true }])  
        } else {
            embed.addFields([{ name: id, value: `${client.language({ textId: `Канал не найден`, guildId: interaction.guildId, locale: interaction.locale })}`, inline: true }])    
        }
        return interaction.editReply({ embeds: [embed] })
    }
}