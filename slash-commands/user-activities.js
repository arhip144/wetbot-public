const { ApplicationCommandOptionType, StringSelectMenuBuilder, ActionRowBuilder, EmbedBuilder, Collection } = require("discord.js")
const UserRegexp = /usr{(.*?)}/
const MemberRegexp = /mbr{(.*?)}/
module.exports = {
    name: 'user-activities',
    nameLocalizations: {
        'ru': `активности-пользователя`,
        'uk': `активності-користувача`,
        'es-ES': `actividades-usuario`
    },
    description: 'Disable or enable an ability to gain currency, XP, RP and items for activities',
    descriptionLocalizations: {
        'ru': `Включить или выключить возможность получать валюту, опыт, репутацию, предметы за активности`,
        'uk': `Увімкнути або вимкнути можливість отримувати валюту, досвід, репутацію, предмети за активності`,
        'es-ES': `Activar o desactivar la capacidad de obtener moneda, XP, RP y objetos por actividades`
    },
    options: [
        {
            name: 'user',
            nameLocalizations: {
                'ru': `юзер`,
                'uk': `користувач`,
                'es-ES': `usuario`
            },
            description: 'The user',
            descriptionLocalizations: {
                'ru': `Пользователь`,
                'uk': `Користувач`,
                'es-ES': `Usuario`
            },
            type: ApplicationCommandOptionType.User,
            required: true
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
        if (!interaction.isChatInputCommand() && interaction.user.id !== UserRegexp.exec(interaction.customId)?.[1]) return interaction.deferUpdate().catch(() => null)
        const { guild } = interaction
        const userID = args?.user || MemberRegexp.exec(interaction.customId)?.[1]
        if (!userID) {
            return interaction.reply({ content: `${client.config.emojis.NO}${client.language({ textId: `Некорректный ID`, guildId: interaction.guildId, locale: interaction.locale })}`, embeds: [], components: [], flags: ["Ephemeral"] })
        }
        const member = await guild.members.fetch(userID).catch(() => null)
        if (!member) {
            return interaction.reply({ content: `${client.config.emojis.NO}${client.language({ textId: `Пользователь не найден на сервере`, guildId: interaction.guildId, locale: interaction.locale })}`, embeds: [], components: [], flags: ["Ephemeral"] })
        }
        if (member.user.bot) {
            return interaction.reply({ content: `${client.config.emojis.NO} ${client.language({ textId: `Ты не можешь использовать эту команду для бота`, guildId: interaction.guildId, locale: interaction.locale })}.`, embeds: [], components: [], flags: ["Ephemeral"] })
        }
        const profile = await client.functions.fetchProfile(client, member.user.id, guild.id)
        const embed = new EmbedBuilder()
        embed.setThumbnail(member.displayAvatarURL())
        embed.setTitle(member.displayName)
        embed.setAuthor({ name: `${client.language({ textId: `Активности`, guildId: interaction.guildId, locale: interaction.locale })}` })
        embed.setColor(member.displayHexColor)
        if (interaction.customId?.includes("select")) {
            for (let values of interaction.values) {
                values = values.split('.')
                if (!profile.blockActivities) profile.blockActivities = { [values[0]]: { [values[1]]: true }}
                else if (!profile.blockActivities[values[0]]) profile.blockActivities[values[0]] = { [values[1]]: true }
                else {
                    if (profile.blockActivities?.[values[0]][values[1]]) {
                        profile.blockActivities[values[0]][values[1]] = undefined
                        if (!Object.values(profile.blockActivities[values[0]]).filter(e => e !== undefined).length) profile.blockActivities[values[0]] = undefined
                        if (!Object.values(profile.blockActivities).filter(e => e !== undefined).length) profile.blockActivities = undefined
                    }
                    else profile.blockActivities[values[0]][values[1]] = true    
                }
            }
            await profile.save()
        }
        const activities = [
            `> ${profile.blockActivities?.["message"]?.XP ? client.config.emojis.NO : client.config.emojis.YES}${client.language({ textId: `Получение опыта за сообщение`, guildId: interaction.guildId, locale: interaction.locale })}`,
            `> ${profile.blockActivities?.["message"]?.CUR ? client.config.emojis.NO : client.config.emojis.YES}${client.language({ textId: `Получение валюты за сообщение`, guildId: interaction.guildId, locale: interaction.locale })}`,
            `> ${profile.blockActivities?.["message"]?.RP ? client.config.emojis.NO : client.config.emojis.YES}${client.language({ textId: `Получение репутации за сообщение`, guildId: interaction.guildId, locale: interaction.locale })}`,
            `> ${profile.blockActivities?.["message"]?.items ? client.config.emojis.NO : client.config.emojis.YES}${client.language({ textId: `Получение предметов за сообщение`, guildId: interaction.guildId, locale: interaction.locale })}`,
            `> ${profile.blockActivities?.["voice"]?.XP ? client.config.emojis.NO : client.config.emojis.YES}${client.language({ textId: `Получение опыта за общение в ГК`, guildId: interaction.guildId, locale: interaction.locale })}`,
            `> ${profile.blockActivities?.["voice"]?.CUR ? client.config.emojis.NO : client.config.emojis.YES}${client.language({ textId: `Получение валюты за общение в ГК`, guildId: interaction.guildId, locale: interaction.locale })}`,
            `> ${profile.blockActivities?.["voice"]?.RP ? client.config.emojis.NO : client.config.emojis.YES}${client.language({ textId: `Получение репутации за общение в ГК`, guildId: interaction.guildId, locale: interaction.locale })}`,
            `> ${profile.blockActivities?.["voice"]?.items ? client.config.emojis.NO : client.config.emojis.YES}${client.language({ textId: `Получение предметов за общение в ГК`, guildId: interaction.guildId, locale: interaction.locale })}`,
            `> ${profile.blockActivities?.["invite"]?.XP ? client.config.emojis.NO : client.config.emojis.YES}${client.language({ textId: `Получение опыта за приглашение`, guildId: interaction.guildId, locale: interaction.locale })}`,
            `> ${profile.blockActivities?.["invite"]?.CUR ? client.config.emojis.NO : client.config.emojis.YES}${client.language({ textId: `Получение валюты за приглашение`, guildId: interaction.guildId, locale: interaction.locale })}`,
            `> ${profile.blockActivities?.["invite"]?.RP ? client.config.emojis.NO : client.config.emojis.YES}${client.language({ textId: `Получение репутации за приглашение`, guildId: interaction.guildId, locale: interaction.locale })}`,
            `> ${profile.blockActivities?.["invite"]?.items ? client.config.emojis.NO : client.config.emojis.YES}${client.language({ textId: `Получение предметов за приглашение`, guildId: interaction.guildId, locale: interaction.locale })}`,
            `> ${profile.blockActivities?.["bump"]?.XP ? client.config.emojis.NO : client.config.emojis.YES}${client.language({ textId: `Получение опыта за бамп`, guildId: interaction.guildId, locale: interaction.locale })}`,
            `> ${profile.blockActivities?.["bump"]?.CUR ? client.config.emojis.NO : client.config.emojis.YES}${client.language({ textId: `Получение валюты за бамп`, guildId: interaction.guildId, locale: interaction.locale })}`,
            `> ${profile.blockActivities?.["bump"]?.RP ? client.config.emojis.NO : client.config.emojis.YES}${client.language({ textId: `Получение репутации за бамп`, guildId: interaction.guildId, locale: interaction.locale })}`,
            `> ${profile.blockActivities?.["bump"]?.items ? client.config.emojis.NO : client.config.emojis.YES}${client.language({ textId: `Получение предметов за бамп`, guildId: interaction.guildId, locale: interaction.locale })}`,
            `> ${profile.blockActivities?.["like"]?.XP ? client.config.emojis.NO : client.config.emojis.YES}${client.language({ textId: `Получение опыта за лайк`, guildId: interaction.guildId, locale: interaction.locale })}`,
            `> ${profile.blockActivities?.["like"]?.CUR ? client.config.emojis.NO : client.config.emojis.YES}${client.language({ textId: `Получение валюты за лайк`, guildId: interaction.guildId, locale: interaction.locale })}`,
            `> ${profile.blockActivities?.["like"]?.RP ? client.config.emojis.NO : client.config.emojis.YES}${client.language({ textId: `Получение репутации за лайк`, guildId: interaction.guildId, locale: interaction.locale })}`,
            `> ${profile.blockActivities?.["like"]?.items ? client.config.emojis.NO : client.config.emojis.YES}${client.language({ textId: `Получение предметов за лайк`, guildId: interaction.guildId, locale: interaction.locale })}`,
            `> ${profile.blockActivities?.["item"]?.XP ? client.config.emojis.NO : client.config.emojis.YES}${client.language({ textId: `Получение опыта за первое нахождение предмета`, guildId: interaction.guildId, locale: interaction.locale })}`,
            `> ${profile.blockActivities?.["item"]?.CUR ? client.config.emojis.NO : client.config.emojis.YES}${client.language({ textId: `Получение валюты за первое нахождение предмета`, guildId: interaction.guildId, locale: interaction.locale })}`,
        ]
        embed.setDescription(activities.join("\n"))
        const menu_options = [
            { emoji: `${profile.blockActivities?.["message"]?.XP ? client.config.emojis.NO : client.config.emojis.YES}`, label: `${profile.blockActivities?.["message"]?.XP ? `${client.language({ textId: `Вкл.`, guildId: interaction.guildId, locale: interaction.locale })}` : `${client.language({ textId: `Выкл.`, guildId: interaction.guildId, locale: interaction.locale })}`}: ${client.language({ textId: `Опыт за сообщение`, guildId: interaction.guildId, locale: interaction.locale })}`, value: `message.XP` }, 
            { emoji: `${profile.blockActivities?.["message"]?.CUR ? client.config.emojis.NO : client.config.emojis.YES}`, label: `${profile.blockActivities?.["message"]?.CUR ? `${client.language({ textId: `Вкл.`, guildId: interaction.guildId, locale: interaction.locale })}` : `${client.language({ textId: `Выкл.`, guildId: interaction.guildId, locale: interaction.locale })}`}: ${client.language({ textId: `Валюта за сообщение`, guildId: interaction.guildId, locale: interaction.locale })}`, value: `message.CUR` },
            { emoji: `${profile.blockActivities?.["message"]?.RP ? client.config.emojis.NO : client.config.emojis.YES}`, label: `${profile.blockActivities?.["message"]?.RP ? `${client.language({ textId: `Вкл.`, guildId: interaction.guildId, locale: interaction.locale })}` : `${client.language({ textId: `Выкл.`, guildId: interaction.guildId, locale: interaction.locale })}`}: ${client.language({ textId: `Репутация за сообщение`, guildId: interaction.guildId, locale: interaction.locale })}`, value: `message.RP` },
            { emoji: `${profile.blockActivities?.["message"]?.items ? client.config.emojis.NO : client.config.emojis.YES}`, label: `${profile.blockActivities?.["message"]?.items ? `${client.language({ textId: `Вкл.`, guildId: interaction.guildId, locale: interaction.locale })}` : `${client.language({ textId: `Выкл.`, guildId: interaction.guildId, locale: interaction.locale })}`}: ${client.language({ textId: `Предметы за сообщение`, guildId: interaction.guildId, locale: interaction.locale })}`, value: `message.items` },
            { emoji: `${profile.blockActivities?.["voice"]?.XP ? client.config.emojis.NO : client.config.emojis.YES}`, label: `${profile.blockActivities?.["voice"]?.XP ? `${client.language({ textId: `Вкл.`, guildId: interaction.guildId, locale: interaction.locale })}` : `${client.language({ textId: `Выкл.`, guildId: interaction.guildId, locale: interaction.locale })}`}: ${client.language({ textId: `Опыт за общение в ГК`, guildId: interaction.guildId, locale: interaction.locale })}`, value: `voice.XP` },
            { emoji: `${profile.blockActivities?.["voice"]?.CUR ? client.config.emojis.NO : client.config.emojis.YES}`, label: `${profile.blockActivities?.["voice"]?.CUR ? `${client.language({ textId: `Вкл.`, guildId: interaction.guildId, locale: interaction.locale })}` : `${client.language({ textId: `Выкл.`, guildId: interaction.guildId, locale: interaction.locale })}`}: ${client.language({ textId: `Валюта за общение в ГК`, guildId: interaction.guildId, locale: interaction.locale })}`, value: `voice.CUR` },
            { emoji: `${profile.blockActivities?.["voice"]?.RP ? client.config.emojis.NO : client.config.emojis.YES}`, label: `${profile.blockActivities?.["voice"]?.RP ? `${client.language({ textId: `Вкл.`, guildId: interaction.guildId, locale: interaction.locale })}` : `${client.language({ textId: `Выкл.`, guildId: interaction.guildId, locale: interaction.locale })}`}: ${client.language({ textId: `Репутация за общение в ГК`, guildId: interaction.guildId, locale: interaction.locale })}`, value: `voice.RP` },
            { emoji: `${profile.blockActivities?.["voice"]?.items ? client.config.emojis.NO : client.config.emojis.YES}`, label: `${profile.blockActivities?.["voice"]?.items ? `${client.language({ textId: `Вкл.`, guildId: interaction.guildId, locale: interaction.locale })}` : `${client.language({ textId: `Выкл.`, guildId: interaction.guildId, locale: interaction.locale })}`}: ${client.language({ textId: `Предметы за общение в ГК`, guildId: interaction.guildId, locale: interaction.locale })}`, value: `voice.items` },
            { emoji: `${profile.blockActivities?.["invite"]?.XP ? client.config.emojis.NO : client.config.emojis.YES}`, label: `${profile.blockActivities?.["invite"]?.XP ? `${client.language({ textId: `Вкл.`, guildId: interaction.guildId, locale: interaction.locale })}` : `${client.language({ textId: `Выкл.`, guildId: interaction.guildId, locale: interaction.locale })}`}: ${client.language({ textId: `Опыт за приглашение`, guildId: interaction.guildId, locale: interaction.locale })}`, value: `invite.XP` },
            { emoji: `${profile.blockActivities?.["invite"]?.CUR ? client.config.emojis.NO : client.config.emojis.YES}`, label: `${profile.blockActivities?.["invite"]?.CUR ? `${client.language({ textId: `Вкл.`, guildId: interaction.guildId, locale: interaction.locale })}` : `${client.language({ textId: `Выкл.`, guildId: interaction.guildId, locale: interaction.locale })}`}: ${client.language({ textId: `Валюта за приглашение`, guildId: interaction.guildId, locale: interaction.locale })}`, value: `invite.CUR` },
            { emoji: `${profile.blockActivities?.["invite"]?.RP ? client.config.emojis.NO : client.config.emojis.YES}`, label: `${profile.blockActivities?.["invite"]?.RP ? `${client.language({ textId: `Вкл.`, guildId: interaction.guildId, locale: interaction.locale })}` : `${client.language({ textId: `Выкл.`, guildId: interaction.guildId, locale: interaction.locale })}`}: ${client.language({ textId: `Репутация за приглашение`, guildId: interaction.guildId, locale: interaction.locale })}`, value: `invite.RP` },
            { emoji: `${profile.blockActivities?.["invite"]?.items ? client.config.emojis.NO : client.config.emojis.YES}`, label: `${profile.blockActivities?.["invite"]?.items ? `${client.language({ textId: `Вкл.`, guildId: interaction.guildId, locale: interaction.locale })}` : `${client.language({ textId: `Выкл.`, guildId: interaction.guildId, locale: interaction.locale })}`}: ${client.language({ textId: `Предметы за приглашение`, guildId: interaction.guildId, locale: interaction.locale })}`, value: `invite.items` },
            { emoji: `${profile.blockActivities?.["bump"]?.XP ? client.config.emojis.NO : client.config.emojis.YES}`, label: `${profile.blockActivities?.["bump"]?.XP ? `${client.language({ textId: `Вкл.`, guildId: interaction.guildId, locale: interaction.locale })}` : `${client.language({ textId: `Выкл.`, guildId: interaction.guildId, locale: interaction.locale })}`}: ${client.language({ textId: `Опыт за бамп`, guildId: interaction.guildId, locale: interaction.locale })}`, value: `bump.XP` },
            { emoji: `${profile.blockActivities?.["bump"]?.CUR ? client.config.emojis.NO : client.config.emojis.YES}`, label: `${profile.blockActivities?.["bump"]?.CUR ? `${client.language({ textId: `Вкл.`, guildId: interaction.guildId, locale: interaction.locale })}` : `${client.language({ textId: `Выкл.`, guildId: interaction.guildId, locale: interaction.locale })}`}: ${client.language({ textId: `Валюта за бамп`, guildId: interaction.guildId, locale: interaction.locale })}`, value: `bump.CUR` },
            { emoji: `${profile.blockActivities?.["bump"]?.RP ? client.config.emojis.NO : client.config.emojis.YES}`, label: `${profile.blockActivities?.["bump"]?.RP ? `${client.language({ textId: `Вкл.`, guildId: interaction.guildId, locale: interaction.locale })}` : `${client.language({ textId: `Выкл.`, guildId: interaction.guildId, locale: interaction.locale })}`}: ${client.language({ textId: `Репутация за бамп`, guildId: interaction.guildId, locale: interaction.locale })}`, value: `bump.RP` },
            { emoji: `${profile.blockActivities?.["bump"]?.items ? client.config.emojis.NO : client.config.emojis.YES}`, label: `${profile.blockActivities?.["bump"]?.items ? `${client.language({ textId: `Вкл.`, guildId: interaction.guildId, locale: interaction.locale })}` : `${client.language({ textId: `Выкл.`, guildId: interaction.guildId, locale: interaction.locale })}`}: ${client.language({ textId: `Предметы за бамп`, guildId: interaction.guildId, locale: interaction.locale })}`, value: `bump.items` },
            { emoji: `${profile.blockActivities?.["like"]?.XP ? client.config.emojis.NO : client.config.emojis.YES}`, label: `${profile.blockActivities?.["like"]?.XP ? `${client.language({ textId: `Вкл.`, guildId: interaction.guildId, locale: interaction.locale })}` : `${client.language({ textId: `Выкл.`, guildId: interaction.guildId, locale: interaction.locale })}`}: ${client.language({ textId: `Опыт за лайк`, guildId: interaction.guildId, locale: interaction.locale })}`, value: `like.XP` },
            { emoji: `${profile.blockActivities?.["like"]?.CUR ? client.config.emojis.NO : client.config.emojis.YES}`, label: `${profile.blockActivities?.["like"]?.CUR ? `${client.language({ textId: `Вкл.`, guildId: interaction.guildId, locale: interaction.locale })}` : `${client.language({ textId: `Выкл.`, guildId: interaction.guildId, locale: interaction.locale })}`}: Валюта за лайк`, value: `like.CUR` },
            { emoji: `${profile.blockActivities?.["like"]?.RP ? client.config.emojis.NO : client.config.emojis.YES}`, label: `${profile.blockActivities?.["like"]?.RP ? `${client.language({ textId: `Вкл.`, guildId: interaction.guildId, locale: interaction.locale })}` : `${client.language({ textId: `Выкл.`, guildId: interaction.guildId, locale: interaction.locale })}`}: ${client.language({ textId: `Репутация за лайк`, guildId: interaction.guildId, locale: interaction.locale })}`, value: `like.RP` },
            { emoji: `${profile.blockActivities?.["like"]?.items ? client.config.emojis.NO : client.config.emojis.YES}`, label: `${profile.blockActivities?.["like"]?.items ? `${client.language({ textId: `Вкл.`, guildId: interaction.guildId, locale: interaction.locale })}` : `${client.language({ textId: `Выкл.`, guildId: interaction.guildId, locale: interaction.locale })}`}: ${client.language({ textId: `Предметы за лайк`, guildId: interaction.guildId, locale: interaction.locale })}`, value: `like.items` },
            { emoji: `${profile.blockActivities?.["item"]?.XP ? client.config.emojis.NO : client.config.emojis.YES}`, label: `${profile.blockActivities?.["item"]?.XP ? `${client.language({ textId: `Вкл.`, guildId: interaction.guildId, locale: interaction.locale })}` : `${client.language({ textId: `Выкл.`, guildId: interaction.guildId, locale: interaction.locale })}`}: ${client.language({ textId: `Опыт за первое нахождение предмета`, guildId: interaction.guildId, locale: interaction.locale })}`, value: `item.XP` },
            { emoji: `${profile.blockActivities?.["item"]?.CUR ? client.config.emojis.NO : client.config.emojis.YES}`, label: `${profile.blockActivities?.["item"]?.CUR ? `${client.language({ textId: `Вкл.`, guildId: interaction.guildId, locale: interaction.locale })}` : `${client.language({ textId: `Выкл.`, guildId: interaction.guildId, locale: interaction.locale })}`}: ${client.language({ textId: `Валюта за первое нахождение предмета`, guildId: interaction.guildId, locale: interaction.locale })}`, value: `item.CUR` },
        ]
        const first_row = new ActionRowBuilder().addComponents([new StringSelectMenuBuilder().setCustomId(`mbr{${member.user.id}}cmd{user-activities} select usr{${interaction.user.id}}`).addOptions(menu_options).setMaxValues(menu_options.length).setPlaceholder(`${client.language({ textId: `Выбери до`, guildId: interaction.guildId, locale: interaction.locale })} ${menu_options.length} ${client.language({ textId: `значений`, guildId: interaction.guildId, locale: interaction.locale })}`)])
        if (interaction.isChatInputCommand()) return interaction.reply({ embeds: [embed], components: [first_row] })
        else {
            await interaction.message.edit({ embeds: [embed], components: [first_row] })
            if (!interaction.deferred) return await interaction.deferUpdate()
            else return
        }
    }
}