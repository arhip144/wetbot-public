const { ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, ActionRowBuilder, EmbedBuilder, ApplicationCommandOptionType, GuildMember, Collection } = require("discord.js")
const UserRegexp = /usr{(.*?)}/
const MemberRegexp = /mbr{(.*?)}/
module.exports = {
    name: "stats",
    nameLocalizations: {
        "ru": `статистика`,
        "uk": `статистика`,
        "es-ES": `estadísticas`
    },
    description: `View stats`,
    descriptionLocalizations: {
       "ru": `Посмотреть статистику`,
       "uk": `Переглянути статистику`,
       "es-ES": `Ver estadísticas`
    },
    options: [
        {
            name: "user",
            nameLocalizations: {
                "ru": `юзер`,
                "uk": `користувач`,
                "es-ES": `usuario`
            },
            description: `View user stats`,
            descriptionLocalizations: {
                "ru": `Посмотреть статистику пользователя`,
                "uk": `Переглянути статистику користувача`,
                "es-ES": `Ver estadísticas del usuario`
            },
            type: ApplicationCommandOptionType.User,
            required: false
        },
        {
            name: 'ephemeral',
            nameLocalizations: {
                'ru': `эфемерный`,
                'uk': `тимчасовий`,
                'es-ES': `efímero`
            },
            description: 'Message visible only for you',
            descriptionLocalizations: {
                'ru': `Сообщение видно только тебе`,
                'uk': `Повідомлення видно тільки вам`,
                'es-ES': `Mensaje visible solo para ti`
            },
            type: ApplicationCommandOptionType.Boolean
        }
    ],
    dmPermission: false,
    group: `profile-group`,
    cooldowns: new Collection(),
    run: async (client, interaction, args) => {
        if (!interaction.isChatInputCommand() && !interaction.isContextMenuCommand() && UserRegexp.exec(interaction.customId)) {
            if (interaction.user.id !== UserRegexp.exec(interaction.customId)[1]) return interaction.deferUpdate().catch(() => null)
        }
        const flags = []
        if (interaction.customId?.includes("eph") || interaction.values?.[0].includes("eph") || args?.ephemeral) flags.push("Ephemeral")
        let member
        if (args?.user) member = await interaction.guild.members.fetch(args.user).catch(() => null)
        else if (interaction.isButton() && MemberRegexp.exec(interaction.customId)) member = await interaction.guild.members.fetch(MemberRegexp.exec(interaction.customId)[1]).catch(() => null)
        else if (interaction.isStringSelectMenu() && (MemberRegexp.exec(interaction.customId) || MemberRegexp.exec(interaction.values[0]))) {
            member = await interaction.guild.members.fetch(MemberRegexp.exec(interaction.values[0])?.[1]).catch(() => null)
            if (!(member instanceof GuildMember)) member = await interaction.guild.members.fetch(MemberRegexp.exec(interaction.customId)[1]).catch(() => null)
        }
        else member = interaction.member
        if (!member) {
            if (!interaction.replied && !interaction.deferred) return interaction.reply({ content: `${client.config.emojis.NO}${client.language({ textId: `Пользователь не найден на сервере`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
            else return interaction.editReply({ content: `${client.config.emojis.NO}${client.language({ textId: `Пользователь не найден на сервере`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
        }
        const embed = new EmbedBuilder()
        const profile = await client.functions.fetchProfile(client, member.user.id, interaction.guildId)
        if (member.user.bot || (profile.isHiden && interaction.user.id !== profile.userID && !interaction.member.permissions.has("Administrator"))) {
            embed.setAuthor({ name: `${member.displayName} | ${client.language({ textId: `Профиль`, guildId: interaction.guildId, locale: interaction.locale })}`, iconURL: member.displayAvatarURL() }) 
            embed.setDescription(`${client.config.emojis.block} ${client.language({ textId: `Профиль скрыт`, guildId: interaction.guildId, locale: interaction.locale })}.`)
            embed.setColor(member.displayHexColor)
            return interaction.reply({ content: ` `, embeds: [embed], flags: ["Ephemeral"] })
        }
        const settings = client.cache.settings.get(interaction.guildId)
        let filter = "alltime"
        if (interaction.isStringSelectMenu() && interaction.customId.includes("filter")) filter = interaction.values[0]
        let menu_options = [
            { emoji: client.config.emojis.profile, label: `${client.language({ textId: `Профиль`, guildId: interaction.guildId, locale: interaction.locale })}`, value: `usr{${interaction.user.id}}cmd{profile}mbr{${member.user.id}}eph reply`, description: `${client.language({ textId: `Ваш личный профиль`, guildId: interaction.guildId, locale: interaction.locale })}`},
            { emoji: client.config.emojis.profile, label: `${client.language({ textId: `Статистика`, guildId: interaction.guildId, locale: interaction.locale })}`, value: `usr{${interaction.user.id}}cmd{stats}mbr{${member.user.id}}`, description: `${client.language({ textId: `Ваша статистика`, guildId: interaction.guildId, locale: interaction.locale })}`, default: true },
            { emoji: client.config.emojis.inventory, label: `${client.language({ textId: `Инвентарь`, guildId: interaction.guildId, locale: interaction.locale })}`, value: `usr{${interaction.user.id}}cmd{inventory}lim{15}mbr{${member.user.id}}eph reply`, description: `${client.language({ textId: `Ваш инвентарь с предметами`, guildId: interaction.guildId, locale: interaction.locale })}` },
            { emoji: `${client.config.emojis.roles}`, label: `${client.language({ textId: "Инвентарь ролей", guildId: interaction.guildId, locale: interaction.locale })}`, value: `usr{${interaction.user.id}}cmd{inventory-roles}lim{50}mbr{${member.user.id}}`, description: `${client.language({ textId: "Ваш инвентарь с ролями", guildId: interaction.guildId, locale: interaction.locale })}` },
            { emoji: client.config.emojis.invite, label: `${client.language({ textId: `Приглашения`, guildId: interaction.guildId, locale: interaction.locale })}`, value: `usr{${interaction.user.id}}cmd{invites}lim{10}mbr{${member.user.id}}`, description: `${client.language({ textId: `Ваши приглашения`, guildId: interaction.guildId, locale: interaction.locale })}` },
            { emoji: client.config.emojis.shop, label: `${settings.shopName ? settings.shopName.slice(0, 100) : client.language({ textId: `Магазин`, guildId: interaction.guildId, locale: interaction.locale }) }`, value: `usr{${interaction.user.id}}cmd{shop}lim{10}mbr{${member.user.id}}`, description: `${client.language({ textId: `Магазин сервера`, guildId: interaction.guildId, locale: interaction.locale })}` },
            { emoji: client.config.emojis.achievements, label: `${client.language({ textId: `Достижения`, guildId: interaction.guildId, locale: interaction.locale })}`, value: `usr{${interaction.user.id}}cmd{achievements}lim{10}mbr{${member.user.id}}`, description: `${client.language({ textId: `Ваши достижения`, guildId: interaction.guildId, locale: interaction.locale })}` },
            { emoji: client.config.emojis.quests, label: `${client.language({ textId: `Квесты`, guildId: interaction.guildId, locale: interaction.locale })}`, value: `usr{${interaction.user.id}}cmd{quests}mbr{${member.user.id}}`, description: `${client.language({ textId: `Просмотр квестов`, guildId: interaction.guildId, locale: interaction.locale })}` }
        ]
        if (member.user.id !== interaction.user.id) {
            menu_options = [
                { emoji: client.config.emojis.profile, label: `${client.language({ textId: `Профиль`, guildId: interaction.guildId, locale: interaction.locale })}`, value: `usr{${interaction.user.id}}cmd{profile}mbr{${member.user.id}}eph reply`, description: `${client.language({ textId: `Личный профиль`, guildId: interaction.guildId, locale: interaction.locale })} ${member.displayName}` },
                { emoji: client.config.emojis.profile, label: `${client.language({ textId: `Статистика`, guildId: interaction.guildId, locale: interaction.locale })}`, value: `usr{${interaction.user.id}}cmd{stats}mbr{${member.user.id}}`, description: `${client.language({ textId: `Статистка`, guildId: interaction.guildId, locale: interaction.locale })} ${member.displayName}`, default: true },
                { emoji: client.config.emojis.inventory, label: `${client.language({ textId: `Инвентарь`, guildId: interaction.guildId, locale: interaction.locale })}`, value: `usr{${interaction.user.id}}cmd{inventory}lim{15}mbr{${member.user.id}}eph reply`, description: `${client.language({ textId: `Инвентарь с предметами`, guildId: interaction.guildId, locale: interaction.locale })} ${member.displayName}` },
                { emoji: client.config.emojis.roles, label: `${client.language({ textId: `Инвентарь ролей`, guildId: interaction.guildId, locale: interaction.locale })}`, value: `usr{${interaction.user.id}}cmd{inventory-roles}lim{50}mbr{${member.user.id}}`, description: `${client.language({ textId: `Инвентарь с ролями`, guildId: interaction.guildId, locale: interaction.locale })} ${member.displayName}` },
                { emoji: client.config.emojis.invite, label: `${client.language({ textId: `Приглашения`, guildId: interaction.guildId, locale: interaction.locale })}`, value: `usr{${interaction.user.id}}cmd{invites}lim{10}mbr{${member.user.id}}`, description: `${client.language({ textId: `Приглашения`, guildId: interaction.guildId, locale: interaction.locale })} ${member.displayName}` },
                { emoji: client.config.emojis.achievements, label: `${client.language({ textId: `Достижения`, guildId: interaction.guildId, locale: interaction.locale })}`, value: `usr{${interaction.user.id}}cmd{achievements}lim{10}mbr{${member.user.id}}`, description: `${client.language({ textId: `Достижения`, guildId: interaction.guildId, locale: interaction.locale })} ${member.displayName}` },
                { emoji: client.config.emojis.quests, label: `${client.language({ textId: `Квесты`, guildId: interaction.guildId, locale: interaction.locale })}`, value: `usr{${interaction.user.id}}cmd{quests}mbr{${member.user.id}}`, description: `${client.language({ textId: `Просмотр квестов`, guildId: interaction.guildId, locale: interaction.locale })} ${member.displayName}` },
            ]
            if (profile.achievementsHiden && !interaction.member.permissions.has("Administrator")) menu_options = menu_options.filter(e => e.value !== `usr{${interaction.user.id}}cmd{achievements}lim{10}mbr{${member.user.id}}`)
        }
        const filterMenu = new StringSelectMenuBuilder()
            .setCustomId(`cmd{stats}}usr{${interaction.user.id}}mbr{${member.user.id}}filter`)
            .setOptions([
                {
                    label: `${client.language({ textId: `За всё время`, guildId: interaction.guildId, locale: interaction.locale })}`,
                    value: `alltime`,
                    default: filter === "alltime"
                },
                {
                    label: `${client.language({ textId: `За день`, guildId: interaction.guildId, locale: interaction.locale })}`,
                    value: `daily`,
                    default: filter === "daily"
                },
                {
                    label: `${client.language({ textId: `За неделю`, guildId: interaction.guildId, locale: interaction.locale })}`,
                    value: `weekly`,
                    default: filter === "weekly"
                },
                {
                    label: `${client.language({ textId: `За месяц`, guildId: interaction.guildId, locale: interaction.locale })}`,
                    value: `monthly`,
                    default: filter === "monthly"
                },
                {
                    label: `${client.language({ textId: `За год`, guildId: interaction.guildId, locale: interaction.locale })}`,
                    value: `yearly`,
                    default: filter === "yearly"
                }
            ])
        const components = []
        const first_row = new ActionRowBuilder().addComponents([new StringSelectMenuBuilder().setCustomId(`usr{${interaction.user.id}}mbr{${member.user.id}}profile-menu`).addOptions(menu_options)])
        components.push(first_row)  
        components.push(new ActionRowBuilder().addComponents(filterMenu))
        embed.setTitle(`${member.displayName} | ${client.language({ textId: `Статистика`, guildId: interaction.guildId, locale: interaction.locale })}`)
        const description = []
        if (filter === "alltime") {
            description.push(
                `# ${client.language({ textId: `Статистика за всё время`, guildId: interaction.guildId, locale: interaction.locale })}:`,
                `${client.language({ textId: `Уровень`, guildId: interaction.guildId, locale: interaction.locale })}: ${client.config.emojis.medal} ${profile.level.toLocaleString()}`,
                `${client.language({ textId: `Опыт`, guildId: interaction.guildId, locale: interaction.locale })}: ${client.config.emojis.XP} ${profile.totalxp.toLocaleString()}`,
                settings.seasonLevelsEnabled ? `${client.language({ textId: `Сезонный опыт`, guildId: interaction.guildId, locale: interaction.locale })}: ${client.config.emojis.seasonXP} ${profile.seasonTotalXp.toLocaleString()}` : false,
                `${client.language({ textId: `Часов в ГК`, guildId: interaction.guildId, locale: interaction.locale })}: ${client.config.emojis.mic} ${profile.hours.toFixed(1)}`,
                `${client.language({ textId: `Сообщения`, guildId: interaction.guildId, locale: interaction.locale })}: ${client.config.emojis.message} ${profile.messages}`,
                `${client.language({ textId: `Лайки`, guildId: interaction.guildId, locale: interaction.locale })}: ${client.config.emojis.heart} ${profile.likes}`,
                `${settings.currencyName}: ${settings.displayCurrencyEmoji} ${(profile.currency).toFixed()}`,
                `${settings.currencyName} ${client.language({ textId: `потрачено`, guildId: interaction.guildId, locale: interaction.locale })}: ${settings.displayCurrencyEmoji} ${(profile.currencySpent).toFixed()}`,
                `${client.language({ textId: `Приглашения`, guildId: interaction.guildId, locale: interaction.locale })}: ${client.config.emojis.invite} ${profile.invites}`,
                `${client.language({ textId: `Бампы`, guildId: interaction.guildId, locale: interaction.locale })}: ${client.config.emojis.bump} ${profile.bumps}`,
                `${client.language({ textId: `Репутация`, guildId: interaction.guildId, locale: interaction.locale })}: ${client.config.emojis.RP} ${profile.rp.toFixed(2)}`,
                `${client.language({ textId: `Квестов завершено`, guildId: interaction.guildId, locale: interaction.locale })}: ${client.config.emojis.quests} ${profile.doneQuests}`,
                `${client.language({ textId: `Раздачи`, guildId: interaction.guildId, locale: interaction.locale })}: ${client.config.emojis.giveaway} ${profile.giveawaysCreated}`,
                `${client.language({ textId: `Червоточины`, guildId: interaction.guildId, locale: interaction.locale })}: ${client.config.emojis.wormhole} ${profile.wormholeTouched}`,
                `${client.language({ textId: `Рыбалка`, guildId: interaction.guildId, locale: interaction.locale })}: ${client.config.emojis.fishing} ${profile.fishing}`,
                `${client.language({ textId: `Майнинг`, guildId: interaction.guildId, locale: interaction.locale })}: ${client.config.emojis.mining} ${profile.mining}`,
                `${client.language({ textId: `Червоточин вызвано`, guildId: interaction.guildId, locale: interaction.locale })}: ${client.config.emojis.wormhole} ${profile.wormholesSpawned}`,
                `${client.language({ textId: `Предметов`, guildId: interaction.guildId, locale: interaction.locale })}: ${client.config.emojis.box}`,
                `* ${client.language({ textId: `продано на маркете`, guildId: interaction.guildId, locale: interaction.locale })}: ${profile.itemsSoldOnMarketPlace.toLocaleString()}`,
                `* ${client.language({ textId: `открыто`, guildId: interaction.guildId, locale: interaction.locale })}: ${profile.itemsOpened.toLocaleString()}`,
                `* ${client.language({ textId: `получено`, guildId: interaction.guildId, locale: interaction.locale })}: ${profile.itemsReceived.toLocaleString()}`,
                `* ${client.language({ textId: `скрафчено`, guildId: interaction.guildId, locale: interaction.locale })}: ${profile.itemsCrafted.toLocaleString()}`,
                `* ${client.language({ textId: `использовано`, guildId: interaction.guildId, locale: interaction.locale })}: ${profile.itemsUsed.toLocaleString()}`,
                `* ${client.language({ textId: `куплено в магазине`, guildId: interaction.guildId, locale: interaction.locale })}: ${profile.itemsBoughtInShop.toLocaleString()}`,
                `* ${client.language({ textId: `куплено на маркете`, guildId: interaction.guildId, locale: interaction.locale })}: ${profile.itemsBoughtOnMarket.toLocaleString()}`,
                `* ${client.language({ textId: `продано`, guildId: interaction.guildId, locale: interaction.locale })}: ${profile.itemsSold.toLocaleString()}`,
        )
        } else {
            description.push(
                `# ${client.language({ textId: `Статистика за ${filter}`, guildId: interaction.guildId, locale: interaction.locale })}:`,
                `${client.language({ textId: `Опыт`, guildId: interaction.guildId, locale: interaction.locale })}: ${client.config.emojis.XP} ${profile.stats?.[filter]?.totalxp?.toLocaleString() || 0}`,
                `${client.language({ textId: `Часов в ГК`, guildId: interaction.guildId, locale: interaction.locale })}: ${client.config.emojis.mic} ${profile.stats?.[filter]?.hours?.toFixed(1) || 0}`,
                `${client.language({ textId: `Сообщения`, guildId: interaction.guildId, locale: interaction.locale })}: ${client.config.emojis.message} ${profile.stats?.[filter]?.messages?.toLocaleString() || 0}`,
                `${client.language({ textId: `Лайки`, guildId: interaction.guildId, locale: interaction.locale })}: ${client.config.emojis.heart} ${profile.stats?.[filter]?.likes?.toLocaleString() || 0}`,
                `${settings.currencyName}: ${settings.displayCurrencyEmoji} ${profile.stats?.[filter]?.currency?.toLocaleString()|| 0}`,
                `${client.language({ textId: `Приглашения`, guildId: interaction.guildId, locale: interaction.locale })}: ${client.config.emojis.invite} ${profile.stats?.[filter]?.invites?.toLocaleString() || 0}`,
                `${client.language({ textId: `Бампы`, guildId: interaction.guildId, locale: interaction.locale })}: ${client.config.emojis.bump} ${profile.stats?.[filter]?.bumps?.toLocaleString() || 0}`,
                `${client.language({ textId: `Репутация`, guildId: interaction.guildId, locale: interaction.locale })}: ${client.config.emojis.RP} ${profile.stats?.[filter]?.rp?.toLocaleString() || 0}`,
                `${client.language({ textId: `Квестов завершено`, guildId: interaction.guildId, locale: interaction.locale })}: ${client.config.emojis.quests} ${profile.stats?.[filter]?.doneQuests?.toLocaleString() || 0}`,
                `${client.language({ textId: `Раздачи`, guildId: interaction.guildId, locale: interaction.locale })}: ${client.config.emojis.giveaway} ${profile.stats?.[filter]?.giveawaysCreated?.toLocaleString() || 0}`,
                `${client.language({ textId: `Червоточины`, guildId: interaction.guildId, locale: interaction.locale })}: ${client.config.emojis.wormhole} ${profile.stats?.[filter]?.wormholeTouched?.toLocaleString() || 0}`,
                `${client.language({ textId: `Предметов продано на маркете`, guildId: interaction.guildId, locale: interaction.locale })}: ${client.config.emojis.box} ${profile.stats?.[filter]?.itemsSoldOnMarketPlace?.toLocaleString() || 0}`,
            )
        }
        embed.setDescription(description.filter(Boolean).join("\n"))
        embed.setColor(member.displayHexColor)
        embed.setThumbnail(member.displayAvatarURL())
        embed.setFooter({ text: `${client.language({ textId: `До следующего уровня`, guildId: interaction.guildId, locale: interaction.locale })} ⭐${profile.xp.toFixed()}/${profile.getRequiredXp(profile.level, settings.levelfactor)} XP (${Math.floor((profile.xp / (profile.getRequiredXp(profile.level, settings.levelfactor))) * 100)}%)${settings.seasonLevelsEnabled ? `\n${client.language({ textId: `До следующего сезонного уровня`, guildId: interaction.guildId, locale: interaction.locale })} ⭐${profile.seasonXp.toFixed()}/${profile.getRequiredXp(profile.seasonLevel, settings.seasonLevelfactor)} XP (${Math.floor((profile.seasonXp / (profile.getRequiredXp(profile.seasonLevel, settings.seasonLevelfactor))) * 100)}%)` : ""}`, iconURL: client.user.displayAvatarURL() })
        if (!flags.includes("Ephemeral")) {
            const close_btn = new ButtonBuilder()
            .setStyle(ButtonStyle.Secondary)
            .setEmoji(client.config.emojis.close)
            .setCustomId(`usr{${interaction.user.id}} close`)
            const close_row = new ActionRowBuilder().addComponents([close_btn])
            components.push(close_row)    
        }
        if ((interaction.customId?.includes("reply") || interaction.values?.[0].includes("reply")) || interaction.isChatInputCommand() || interaction.isContextMenuCommand()) {
            return interaction.reply({ content: ` `, embeds: [embed], components: components, flags })
        }
        return interaction.update({ content: ` `, embeds: [embed], components: components })
    }
}