const { ApplicationCommandOptionType, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, ActionRowBuilder, EmbedBuilder, GuildMember, ModalBuilder, TextInputBuilder, TextInputStyle, InteractionType, Collection, MessageFlags, ContainerBuilder, SectionBuilder, TextDisplayBuilder, ComponentType, Webhook, LabelBuilder } = require("discord.js")
const { AchievementType, RewardType } = require("../enums")
const MemberRegexp = /mbr{(.*?)}/
const UserRegexp = /usr{(.*?)}/
const LimitRegexp = /lim{(.*?)}/
const itemLimitPerPage = 7
const ItemRegexp = /item{(.*?)}/
const { default: Decimal } = require("decimal.js")
module.exports = {
    name: 'inventory',
    nameLocalizations: {
        'ru': `инвентарь`,
        'uk': `інвентар`,
        'es-ES': `inventario`,
    },
    description: 'View inventory',
    descriptionLocalizations: {
        'ru': `Просмотр инвентаря`,
        'uk': `Перегляд інвентарю`,
        'es-ES': `Ver inventario`
    },
    options: [
        {
            name: 'user',
            nameLocalizations: {
                'ru': `юзер`,
                'uk': `користувач`,
                'es-ES': `usuario`,
            },
            description: 'User to view inventory',
            descriptionLocalizations: {
                'ru': `Просмотр инвентаря пользователя`,
                'uk': `Перегляд інвентарю користувача`,
                'es-ES': `Ver inventario del usuario`
            },
            type: ApplicationCommandOptionType.User,
            required: false
        }
    ],
    dmPermission: false,
    group: `inventory-group`,
    cooldowns: new Collection(),
    run: async (client, interaction, args) => {
        if (!interaction.isChatInputCommand() && !interaction.isContextMenuCommand() && UserRegexp.exec(interaction.customId)) {
            if (interaction.user.id !== UserRegexp.exec(interaction.customId)[1]) return interaction.deferUpdate().catch(() => null)
        }
        let min = 0
        let limit = itemLimitPerPage
        const flags = [MessageFlags.IsComponentsV2]
        if (interaction.customId?.includes("eph") || interaction.values?.[0].includes("eph") || interaction.message?.flags.toArray().includes("Ephemeral")) flags.push("Ephemeral")
        let member
        if (args?.user) member = await interaction.guild.members.fetch(args.user).catch(() => null)
        else if (interaction.isButton() && MemberRegexp.exec(interaction.customId)) member = await interaction.guild.members.fetch(MemberRegexp.exec(interaction.customId)[1]).catch(() => null)
        else if (interaction.isStringSelectMenu() && (MemberRegexp.exec(interaction.customId) || MemberRegexp.exec(interaction.values[0]))) {
            member = await interaction.guild.members.fetch(MemberRegexp.exec(interaction.values[0])?.[1]).catch(() => null)
            if (!(member instanceof GuildMember)) member = await interaction.guild.members.fetch(MemberRegexp.exec(interaction.customId)[1]).catch(() => null)
        }
        else member = interaction.member
        if (!member) {
            return interaction.reply({ content: `${client.config.emojis.NO}${client.language({ textId: `Пользователь не найден на сервере`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
        }
        const profile = await client.functions.fetchProfile(client, member.user.id, interaction.guildId)
        const globalProfile = await client.globalProfileSchema.findOne({ userID: member.user.id })
        if (profile.rp > 1000) profile.rp = 1000
        if (interaction.customId?.includes("select")) {
            const modal = new ModalBuilder()
                .setCustomId(`page_${interaction.id}`)
                .setTitle(`${client.language({ textId: `Инвентарь`, guildId: interaction.guildId, locale: interaction.locale })}`)
                .setLabelComponents([
                    new LabelBuilder()
                        .setLabel(`${client.language({ textId: "Страница", guildId: interaction.guildId, locale: interaction.locale })}`)
                        .setTextInputComponent(
                            new TextInputBuilder()
                                .setCustomId("page")
                                .setStyle(TextInputStyle.Short)
                        ),
                ])
            await interaction.showModal(modal);delete client.globalCooldown[`${interaction.guildId}_${interaction.user.id}`]
            const filter = (i) => i.customId === `page_${interaction.id}` && i.user.id === interaction.user.id
            interaction = await interaction.awaitModalSubmit({ filter, time: 30000 }).catch(e => interaction)
            if (interaction && interaction.type === InteractionType.ModalSubmit) {
                const modalArgs = {}
                interaction.fields.fields.each(field => modalArgs[field.customId] = field.value)
                modalArgs.page = +modalArgs.page
                const length = profile.inventory.filter(e => e.amount > 0 || e.amount < 0).length
                if (!isNaN(modalArgs.page) && Number.isInteger(modalArgs.page) && (modalArgs.page <= 0 || modalArgs.page > (length + (length % itemLimitPerPage == 0 ? 0 : itemLimitPerPage - (length % itemLimitPerPage)))/itemLimitPerPage)) {
                    return interaction.reply({ content: `${client.config.emojis.NO} ${client.language({ textId: `Такой страницы не существует`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
                }
                limit = modalArgs.page * itemLimitPerPage
                min = limit - itemLimitPerPage 
            } else return  
        } else if (interaction.isButton()) {
            limit = +LimitRegexp.exec(interaction.customId)?.[1]
            if (!limit) limit = itemLimitPerPage
            min = limit - itemLimitPerPage   
        }
        const settings = client.cache.settings.get(interaction.guildId)
        if (interaction.customId?.includes("use")) {
            const item = client.cache.items.find(item => item.guildID === interaction.guildId && item.enabled && item.found && !item.temp && item.itemID === ItemRegexp.exec(interaction.customId)?.[1])
            if (!item) return interaction.reply({ content: `${client.config.emojis.NO}${client.language({ textId: `Предмет не найден`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
            const userItem = profile.inventory.find(e => { return e.itemID == item.itemID && e.amount > 0 })
            if (!userItem || userItem.amount < 1) return interaction.reply({ content: `${client.config.emojis.NO}${client.language({ textId: `В инвентаре нет такого предмета`, guildId: interaction.guildId, locale: interaction.locale })}: ${item.displayEmoji}**${item.name}**`, flags: ["Ephemeral"] })
            let amount = 1
            if (!item.canUse) return interaction.reply({ content: `${client.config.emojis.NO} ${item.displayEmoji}**${item.name}** ${client.language({ textId: `Невозможно использовать`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
            if (item.usePermission && client.cache.permissions.some(e => e.id === item.usePermission)) {
                const permission = client.cache.permissions.find(e => e.id === item.usePermission)
                const isPassing = permission.for(profile, interaction.member, interaction.channel, interaction)
                if (isPassing.value === false) {
                    return interaction.reply({ embeds: [new EmbedBuilder().setColor(3093046).setTitle(`${client.language({ textId: `Для этого взаимодействия требуется:`, guildId: interaction.guildId, locale: interaction.locale })}`).setDescription(isPassing.reasons.join("\n"))], flags: ["Ephemeral"] })
                }
            }
            if (profile.itemsCooldowns && profile.itemsCooldowns.get(item.itemID)?.use > new Date()) {
                return interaction.reply({ content: `⏳${client.language({ textId: "Ждите кулдаун для этого предмета", guildId: interaction.guildId, locale: interaction.locale })}: ${transformSecs(client, profile.itemsCooldowns.get(item.itemID).use - new Date(), interaction.guildId, interaction.locale)}`, flags: ["Ephemeral"] })
            }
            if (amount < item.min_use || (item.max_use ? amount > item.max_use : false)) {
                return interaction.reply({ content: `${client.config.emojis.NO} ${client.language({ textId: `Диапазон количества использования этого предмета`, guildId: interaction.guildId, locale: interaction.locale })}: ${client.language({ textId: `от`, guildId: interaction.guildId, locale: interaction.locale })} ${item.min_use}${item.max_use ? ` ${client.language({ textId: `до`, guildId: interaction.guildId, locale: interaction.locale })} ${item.max_use}` : ""}`, flags: ["Ephemeral"] })
            }
            const fatalErrors = []
            if (item.onUse.roleDel) {
                if (interaction.member.roles.cache.has(item.onUse.roleDel)) {
                    const guild_role = await interaction.guild.roles.fetch(item.onUse.roleDel).catch(() => null)
                    if (guild_role) {
                        if (!interaction.guild.members.me.permissions.has("ManageRoles") || interaction.guild.members.me.roles.highest.position <= guild_role.position) fatalErrors.push(`${client.language({ textId: `Роль`, guildId: interaction.guildId, locale: interaction.locale })} ${guild_role.name} ${client.language({ textId: `не будет убрана: у меня нет прав на ее удаление`, guildId: interaction.guildId, locale: interaction.locale })}.`)
                    } else fatalErrors.push(`${client.language({ textId: `Роль`, guildId: interaction.guildId, locale: interaction.locale })} ID:${item.onUse.roleDel} ${client.language({ textId: `не будет удалена: роль не найдена на сервере`, guildId: interaction.guildId, locale: interaction.locale })}.`)
                } else fatalErrors.push(`${client.language({ textId: `Роль`, guildId: interaction.guildId, locale: interaction.locale })} <@&${item.onUse.roleDel}> ${client.language({ textId: `не будет удалена: у тебя нет такой роли`, guildId: interaction.guildId, locale: interaction.locale })}.`)
            }
            if (item.onUse.roleAdd && item.onUse.role_add_direct) {
                const guild_role = await interaction.guild.roles.fetch(item.onUse.roleDel).catch(() => null)
                if (guild_role) {
                    if (interaction.member.roles.cache.has(item.onUse.roleAdd) && !item.onUse.roleTimely) {
                        fatalErrors.push(`${client.language({ textId: `Роль`, guildId: interaction.guildId, locale: interaction.locale })} ${guild_role.name} ${client.language({ textId: `не будет добавлена: у тебя уже есть такая роль`, guildId: interaction.guildId, locale: interaction.locale })}.`)
                    } else {
                        if (!interaction.guild.members.me.permissions.has("ManageRoles") || interaction.guild.members.me.roles.highest.position <= guild_role.position) fatalErrors.push(`${client.language({ textId: `Роль`, guildId: interaction.guildId, locale: interaction.locale })} ${guild_role.name} ${client.language({ textId: `не будет добавлена: у меня нет прав на ее добавление`, guildId: interaction.guildId, locale: interaction.locale })}.`)
                    }
                } else fatalErrors.push(`${client.language({ textId: `Роль`, guildId: interaction.guildId, locale: interaction.locale })} ID:${item.onUse.roleDel} ${client.language({ textId: `не будет добавлена: роль не найдена на сервере`, guildId: interaction.guildId, locale: interaction.locale })}.`)
            }
            if (item.onUse.trophyDel) {
                if (!profile.trophies?.some(e => e.toLowerCase() == item.onUse.trophyDel.toLowerCase())) fatalErrors.push(`${client.language({ textId: `Трофей`, guildId: interaction.guildId, locale: interaction.locale })} **${item.onUse.trophyDel}** ${client.language({ textId: `не будет удален: у тебя нет такого трофея`, guildId: interaction.guildId, locale: interaction.locale })}.`)
            }
            if (item.onUse.delQuest) {
                const quest = client.cache.quests.find(quest => quest.guildID === interaction.guildId && quest.questID === item.onUse.delQuest && quest.isEnabled)
                if (!quest) {
                    fatalErrors.push(`${client.language({ textId: `Квест`, guildId: interaction.guildId, locale: interaction.locale })} **${item.onUse.delQuest}** ${client.language({ textId: `не будет удален из профиля: неизвестный квест`, guildId: interaction.guildId, locale: interaction.locale })}.`)
                } else {
                    const index = profile.quests?.findIndex(e => e.questID == quest.questID) || -1
                    if (index < 0) fatalErrors.push(`${client.language({ textId: `Квест`, guildId: interaction.guildId, locale: interaction.locale })} ${quest.displayEmoji}**${quest.name}** ${client.language({ textId: `не будет удален из профиля: квест не взят`, guildId: interaction.guildId, locale: interaction.locale })}.`)
                }
            }
            if (item.onUse.wipeQuest) {
                const quest = client.cache.quests.find(quest => quest.guildID === interaction.guildId && quest.questID === item.onUse.wipeQuest && quest.isEnabled)
                if (!quest) {
                    fatalErrors.push(`${client.language({ textId: `Прогресс квеста`, guildId: interaction.guildId, locale: interaction.locale })} **${item.onUse.wipeQuest}** ${client.language({ textId: `не будет очищен: неизвестный квест`, guildId: interaction.guildId, locale: interaction.locale })}.`)
                } else {
                    const index = profile.quests?.findIndex(e => e.questID == quest.questID) || -1
                    if (index < 0) fatalErrors.push(`${client.language({ textId: `Прогресс квеста`, guildId: interaction.guildId, locale: interaction.locale })} ${quest.displayEmoji}**${quest.name}** ${client.language({ textId: `не будет очищен: квест не взят`, guildId: interaction.guildId, locale: interaction.locale })}.`)
                }
            }
            if (item.onUse.deleteItemFromServer) {
                const serverItem = client.cache.items.find(e => e.itemID === item.onUse.deleteItemFromServer && e.enabled && !e.temp)
                if (!serverItem) fatalErrors.push(`${item.displayEmoji}**${item.name}** ${client.language({ textId: `должен удалять с сервера неизвестный предмет`, guildId: interaction.guildId, locale: interaction.locale })} **${item.onUse.deleteItemFromServer}**, ${client.language({ textId: `но он не найден, обратитесь к администратору`, guildId: interaction.guildId, locale: interaction.locale })}.`)
                if (!serverItem.found) fatalErrors.push(`${item.displayEmoji}**${item.name}** ${client.language({ textId: `должен удалять`, guildId: interaction.guildId, locale: interaction.locale })} ||?????????||, ${client.language({ textId: `но этот предмет еще никто не нашел`, guildId: interaction.guildId, locale: interaction.locale })}.`)
            }
            if (item.onUse.takeXP) {
                if (profile.totalxp < item.onUse.takeXP * amount) {
                    fatalErrors.push(`${client.language({ textId: `У тебя недостаточно опыта для использования`, guildId: interaction.guildId, locale: interaction.locale })} ${item.displayEmoji}**${item.name}**. ${client.language({ textId: `Этот предмет забирает`, guildId: interaction.guildId, locale: interaction.locale })} ${client.config.emojis.XP}${item.onUse.takeXP * amount}. ${client.language({ textId: `У тебя`, guildId: interaction.guildId, locale: interaction.locale })}: ${client.config.emojis.XP}${profile.totalxp.toFixed()}`)
                }
            }
            if (item.onUse.takeCUR) {
                if (profile.currency < item.onUse.takeCUR * amount) {
                    fatalErrors.push(`${client.language({ textId: `У тебя недостаточно`, guildId: interaction.guildId, locale: interaction.locale })} ${settings.displayCurrencyEmoji}**${settings.currencyName}** ${client.language({ textId: `для использования`, guildId: interaction.guildId, locale: interaction.locale })} ${item.displayEmoji}**${item.name}**. ${client.language({ textId: `Этот предмет забирает`, guildId: interaction.guildId, locale: interaction.locale })} ${settings.displayCurrencyEmoji}${item.onUse.takeCUR * amount}. ${client.language({ textId: `У тебя`, guildId: interaction.guildId, locale: interaction.locale })}: ${settings.displayCurrencyEmoji}${profile.currency.toFixed()}`)
                }
            }
            if (item.onUse.takeRP) {
                if (profile.rp - item.onUse.takeRP < -1000) {
                    fatalErrors.push(`${client.language({ textId: `У тебя недостаточно репутации для использования`, guildId: interaction.guildId, locale: interaction.locale })} ${item.displayEmoji}**${item.name}**. ${client.language({ textId: `Этот предмет забирает`, guildId: interaction.guildId, locale: interaction.locale })} ${client.config.emojis.RP}**${client.language({ textId: `Репутация`, guildId: interaction.guildId, locale: interaction.locale })}** (${item.onUse.takeRP * amount}). ${client.language({ textId: `У тебя`, guildId: interaction.guildId, locale: interaction.locale })}: ${client.config.emojis.RP}**${client.language({ textId: `Репутация`, guildId: interaction.guildId, locale: interaction.locale })}** (${profile.rp.toFixed(2)})`)
                }
            }
            if (item.onUse.takeLevel) {
                if (profile.level <= item.onUse.takeLevel * amount) {
                    fatalErrors.push(`${client.language({ textId: `У тебя недостаточно уровня для использования`, guildId: interaction.guildId, locale: interaction.locale })} ${item.displayEmoji}**${item.name}**. ${client.language({ textId: `Этот предмет забирает`, guildId: interaction.guildId, locale: interaction.locale })} ${client.config.emojis.medal}**${item.onUse.takeLevel * amount}**. ${client.language({ textId: `У тебя`, guildId: interaction.guildId, locale: interaction.locale })}: ${client.config.emojis.medal}**${profile.level}**`)
                }
            }
            if (item.onUse.takeItem?.itemID) {
                const serverItem = client.cache.items.find(e => e.itemID === item.onUse.takeItem.itemID && !e.temp && e.enabled && e.found)
                if (!serverItem) fatalErrors.push(`${item.displayEmoji}**${item.name}** ${client.language({ textId: `требует неизвестный предмет`, guildId: interaction.guildId, locale: interaction.locale })} **${item.onUse.takeItem.itemID}**, ${client.language({ textId: `обратитесь к администратору`, guildId: interaction.guildId, locale: interaction.locale })}.`)
                else {
                    const userItem = profile.inventory.find(e => { return e.itemID === item.onUse.takeItem.itemID })
                    if (!userItem || !userItem.amount || userItem.amount < item.onUse.takeItem.amount * amount) fatalErrors.push(`${item.displayEmoji}**${item.name}** ${client.language({ textId: `требует`, guildId: interaction.guildId, locale: interaction.locale })} ${serverItem.displayEmoji}**${serverItem.name}** (${item.onUse.takeItem.amount}) ${client.language({ textId: `для использования`, guildId: interaction.guildId, locale: interaction.locale })}. ${client.language({ textId: `У тебя`, guildId: interaction.guildId, locale: interaction.locale })}: ${serverItem.displayEmoji}**${serverItem.name}** (${userItem?.amount || 0}).`)
                }
            }
            if (fatalErrors.length) {
                return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(interaction.member.displayHexColor)
                            .setTitle(`${client.config.emojis.NO}${client.language({ textId: `Невозможно использовать предмет`, guildId: interaction.guildId, locale: interaction.locale })}`)
                            .setAuthor({ name: interaction.member.displayName, iconURL: interaction.member.displayAvatarURL() })
                            .setDescription(fatalErrors.map((e, index) => `${index + 1}. ${e}`).join("\n"))
                    ],
                    flags: ["Ephemeral"]
                })
            }
            const errors = []
            if (item.onUse.trophyAdd) {
                if (profile.trophies?.some(e => e.toLowerCase() == item.onUse.trophyAdd.toLowerCase())) errors.push(`${client.config.emojis.NO}${client.language({ textId: `Трофей`, guildId: interaction.guildId, locale: interaction.locale })} ${item.onUse.trophyAdd} ${client.language({ textId: `не будет добавлен: тебя уже есть такой трофей`, guildId: interaction.guildId, locale: interaction.locale })}.`)
                else if (profile.trophies?.length >= 10) errors.push(`${client.config.emojis.NO}${client.language({ textId: `Трофей`, guildId: interaction.guildId, locale: interaction.locale })} ${item.onUse.trophyAdd} ${client.language({ textId: `не будет добавлен: достигнуто максимальное кол-во трофеев - 10`, guildId: interaction.guildId, locale: interaction.locale })}.`)
            }
            if (item.onUse.addQuest) {
                const quest = client.cache.quests.find(quest => quest.guildID === interaction.guildId && quest.questID === item.onUse.addQuest && quest.isEnabled)
                if (!quest) {
                    errors.push(`${client.config.emojis.NO}${client.language({ textId: `Квест`, guildId: interaction.guildId, locale: interaction.locale })} **${item.onUse.addQuest}** ${client.language({ textId: `не будет добавлен: не найден`, guildId: interaction.guildId, locale: interaction.locale })}.`)
                } else if (profile.quests >= settings.max_quests) {
                    errors.push(`${client.config.emojis.NO}${client.language({ textId: `Квест`, guildId: interaction.guildId, locale: interaction.locale })} ${quest.displayEmoji}**${quest.name}** ${client.language({ textId: `не будет добавлен:`, guildId: interaction.guildId, locale: interaction.locale })} ${client.language({ textId: `Достигнуто максимальное количество квестов в профиле`, guildId: interaction.guildId, locale: interaction.locale })}: ${settings.max_quests}`)
                } else if (profile.quests?.find(e => e.questID === quest.questID)?.finished === false) {
                    errors.push(`${client.config.emojis.NO}${client.language({ textId: `Квест`, guildId: interaction.guildId, locale: interaction.locale })} ${quest.displayEmoji}**${quest.name}** ${client.language({ textId: `не будет добавлен: уже взят`, guildId: interaction.guildId, locale: interaction.locale })}.`)
                }
            }
            if (item.onUse.rpAdd) {
                if (profile.rp >= 1000) errors.push(`${client.config.emojis.NO}${client.language({ textId: `Репутация не будет добавлена: максимум репутации`, guildId: interaction.guildId, locale: interaction.locale })}.`)
            }
            if (item.onUse.itemAdd?.itemID) {
                const serverItem = client.cache.items.find(e => !e.temp && e.enabled && e.itemID === item.onUse.itemAdd.itemID)
                if (!serverItem) errors.push(`${client.config.emojis.NO}${client.language({ textId: `Предмет`, guildId: interaction.guildId, locale: interaction.locale })} **${item.onUse.itemAdd.itemID}** ${client.language({ textId: `не будет добавлен: не был найден`, guildId: interaction.guildId, locale: interaction.locale })}.`)
            }
            if (item.onUse.addAchievement) {
                const achievement = client.cache.achievements.find(e => e.guildID === interaction.guildId && e.enabled && e.id === item.onUse.addAchievement)
                if (achievement) {
                    if (profile.achievements?.some(e => e.achievmentID === item.onUse.addAchievement)) errors.push(`\n${client.config.emojis.NO}${client.language({ textId: `Достижение`, guildId: interaction.guildId, locale: interaction.locale })} ${achievement.displayEmoji}**${achievement.name}** ${client.language({ textId: `не будет добавлено: оно уже есть`, guildId: interaction.guildId, locale: interaction.locale })}.`)
                } else errors.push(`${client.config.emojis.NO}${client.language({ textId: `Достижение`, guildId: interaction.guildId, locale: interaction.locale })} **${item.onUse.addAchievement}** ${client.language({ textId: `не будет добавлено: не было найдено`, guildId: interaction.guildId, locale: interaction.locale })}.`)
            }
            if (item.onUse.spawnWormhole) {
                const wormhole = client.cache.wormholes.find(e => e.isEnabled && e.wormholeID === item.onUse.spawnWormhole)
                if (wormhole) {
                    let wormholeItem = client.cache.items.find(e => e.itemID === wormhole.itemID && !e.temp && e.enabled)
                    let wormholeItemEmoji = wormholeItem?.displayEmoji
                    if (wormhole.itemID === "currency" || wormhole.itemID === "xp" || wormhole.itemID === "rp") {
                        wormholeItem = {
                            name: wormhole.itemID === "currency" ? settings.currencyName : wormhole.itemID === "xp" ? client.language({ textId: `Опыт`, guildId: interaction.guildId, locale: interaction.locale }) : client.language({ textId: `Репутация`, guildId: interaction.guildId, locale: interaction.locale })
                        }
                        wormholeItemEmoji = wormhole.itemID === "currency" ? settings.displayCurrencyEmoji : wormhole.itemID === "xp" ? client.config.emojis.XP : client.config.emojis.RP
                    }
                    if (wormholeItem) {
                        let webhook = client.cache.webhooks.get(wormhole.webhookId)
                        if (!webhook) {
                            webhook = await client.fetchWebhook(wormhole.webhookId).catch(() => null)
                            if (webhook instanceof Webhook) client.cache.webhooks.set(webhook.id, webhook)
                        }
                        if (!webhook) {
                            errors.push(`\n${client.config.emojis.NO}${client.language({ textId: `Червоточина`, guildId: interaction.guildId, locale: interaction.locale })} ${wormholeItemEmoji}**${wormholeItem.name}** ${client.language({ textId: `не будет призвана: вебхук не найден`, guildId: interaction.guildId, locale: interaction.locale })} <#${wormhole.channelID}>.`)
                        }
                    } else errors.push(`${client.config.emojis.NO}${client.language({ textId: `Червоточина`, guildId: interaction.guildId, locale: interaction.locale })} **${item.onUse.spawnWormhole}** ${client.language({ textId: `не будет призвана: предмет`, guildId: interaction.guildId, locale: interaction.locale })} **${wormhole.itemID}** ${client.language({ textId: `не найден`, guildId: interaction.guildId, locale: interaction.locale })}.`)
                } else errors.push(`${client.config.emojis.NO}${client.language({ textId: `Червоточина`, guildId: interaction.guildId, locale: interaction.locale })} **${item.onUse.spawnWormhole}** ${client.language({ textId: `не будет призвана: не была найдена`, guildId: interaction.guildId, locale: interaction.locale })}.`)
            }
            if (item.onUse.craftResearch) {
                const serverItem = client.cache.items.find(e => e.itemID === item.onUse.craftResearch && !e.temp && e.enabled && e.found)
                if (serverItem) {
                    const craft = serverItem.crafts.find((e) => { return e.isFound === false })
                    if (!craft) errors.push(`${client.config.emojis.NO}${client.language({ textId: `Рецепт не будет изучен: для предмета`, guildId: interaction.guildId, locale: interaction.locale })} ${serverItem.displayEmoji}**${serverItem.name}** - ${client.language({ textId: `изучены все рецепты`, guildId: interaction.guildId, locale: interaction.locale })}.`)
                } else errors.push(`${client.config.emojis.NO}${client.language({ textId: `Рецепт не будет изучен: предмет`, guildId: interaction.guildId, locale: interaction.locale })} **${item.onUse.craftResearch}** ${client.language({ textId: `не найден`, guildId: interaction.guildId, locale: interaction.locale })}.`)
            }
            if (item.onUse.itemResearch) {
                const serverItem = client.cache.items.find(e => e.itemID === item.onUse.itemResearch && !e.temp && e.enabled)
                if (serverItem) {
                    if (serverItem.found) {
                        errors.push(`${client.config.emojis.NO}${client.language({ textId: `Предмет`, guildId: interaction.guildId, locale: interaction.locale })} ${serverItem.displayEmoji}**${serverItem.name}** ${client.language({ textId: `не будет изучен: уже изучен`, guildId: interaction.guildId, locale: interaction.locale })}.`)
                    }
                } else errors.push(`${client.config.emojis.NO}${client.language({ textId: `Предмет`, guildId: interaction.guildId, locale: interaction.locale })} **${item.onUse.craftResearch}** ${client.language({ textId: `не будет изучен: не найден`, guildId: interaction.guildId, locale: interaction.locale })}.`)
            }
            if (item.onUse.multiplier?.XP?.x) {
                if ((profile.getXpBoost() > 0 && profile.getXpBoost() > item.onUse.multiplier.XP.x && !settings.global_boosters_stacking) || (((this.multiplyXPTime < new Date() || !this.multiplyXPTime) ? 0 : this.multiplyXP || 0) > 0 && settings.global_boosters_stacking)) {
                    errors.push(`${client.config.emojis.NO}${client.language({ textId: `Буст не будет добавлен: у тебя уже активен буст опыта с более большим множителем`, guildId: interaction.guildId, locale: interaction.locale })}`)
                }
            }
            if (item.onUse.multiplier?.CUR?.x) {
                if ((profile.getCurBoost() > 0 && profile.getCurBoost() > item.onUse.multiplier.CUR.x && !settings.global_boosters_stacking) || (((this.multiplyCURTime < new Date() || !this.multiplyCURTime) ? 0 : this.multiplyCUR || 0) > 0 && settings.global_boosters_stacking)) {
                    errors.push(`${client.config.emojis.NO}${client.language({ textId: `Буст не будет добавлен: у тебя уже активен буст валюты с более большим множителем`, guildId: interaction.guildId, locale: interaction.locale })}`)
                }
            }
            if (item.onUse.multiplier?.LUCK?.x) {
                if ((profile.getLuckBoost() && profile.getLuckBoost() > item.onUse.multiplier.Luck.x && !settings.global_boosters_stacking) || (((this.multiplyLuckTime < new Date() || !this.multiplyLuckTime) ? 0 : this.multiplyLuck || 0) && settings.global_boosters_stacking)) {
                    errors.push(`${client.config.emojis.NO}${client.language({ textId: `Буст не будет добавлен: у тебя уже активен буст удачи с более большим множителем`, guildId: interaction.guildId, locale: interaction.locale })}`)
                }
            }
            if (item.onUse.multiplier?.RP?.x) {
                if ((profile.getRpBoost() > 0 && profile.getRpBoost() > item.onUse.multiplier.RP.x && !settings.global_boosters_stacking) || (((this.multiplyRPTime < new Date() || !this.multiplyRPTime) ? 0 : this.multiplyRP || 0) > 0 && settings.global_boosters_stacking)) {
                    errors.push(`${client.config.emojis.NO}${client.language({ textId: `Буст не будет добавлен: у тебя уже активен буст репутации с более большим множителем`, guildId: interaction.guildId, locale: interaction.locale })}`)
                }
            }
            let interaction2
            if (errors.length) {
                const components = JSON.parse(JSON.stringify(interaction.message.components))
                interaction.message.components.forEach(row => row.components.forEach(component => {
                    if (component.data.type === ComponentType.Section) {
                        component.accessory.data.disabled = true
                    }
                    if (component.data.type === ComponentType.ActionRow) {
                        component.components.forEach(component => {
                            component.data.disabled = true
                        })
                    }
                }))
                await interaction.update({ components: interaction.message.components })
                await interaction.followUp({
                    embeds: [
                        new EmbedBuilder()
                            .setAuthor({ name: interaction.member.displayName, iconURL: interaction.member.displayAvatarURL() })
                            .setDescription(`${errors.map((e, index) => `${index + 1}. ${e}`).join("\n")}`)
                            .setColor(interaction.member.displayHexColor)],
                    components: [
                        new ActionRowBuilder().addComponents(
                            new ButtonBuilder()
                                .setCustomId(`await use confirm`)
                                .setLabel(`${client.language({ textId: `ИСПОЛЬЗОВАТЬ`, guildId: interaction.guildId, locale: interaction.locale })}`)
                                .setStyle(ButtonStyle.Success),
                            new ButtonBuilder()
                                .setCustomId(`await use decline`)
                                .setLabel(`${client.language({ textId: `ОТМЕНА`, guildId: interaction.guildId, locale: interaction.locale })}`)
                                .setStyle(ButtonStyle.Danger))
                    ],
                    flags: ["Ephemeral"]
                })
                const filter = (i) => i.customId.includes(`await use`) && i.user.id === interaction.user.id;
                interaction2 = await interaction.channel.awaitMessageComponent({ filter, time: 30000 }).catch(() => null)
                if (!interaction2) {
                    return interaction.editReply({ components })
                }
                if (interaction2 && interaction2.customId === "await use decline") {
                    interaction.editReply({ components })
                    return interaction2.update({ content: client.config.emojis.NO })
                }
                else await interaction2.update({ content: interaction2.message.content || " ", embeds: interaction2.message.embeds, components: [new ActionRowBuilder().addComponents(new ButtonBuilder().setEmoji("⏳").setStyle(ButtonStyle.Secondary).setCustomId(`0`).setDisabled(true))] })
            }
            let ableToUse = false
            let used = ""
            if (item.onUse.message) {
                if (item.onUse.messageOnDM) {
                    interaction.member.send({ content: item.onUse.message }).catch(() => null)
                    used += `\n${client.config.emojis.YES} ${client.language({ textId: `Сообщение отправлено в ЛС`, guildId: interaction.guildId, locale: interaction.locale })}`
                } else {
                    used += `\n${item.onUse.message}`
                }
                ableToUse = true
            }
            if (item.onUse.roleAdd) {
                const guild_role = await interaction.guild.roles.fetch(item.onUse.roleAdd).catch(() => null)
                if (guild_role) {
                    if (item.onUse.role_add_direct) {
                        await interaction.member.roles.add(guild_role.id)
                        if (item.onUse.roleTimely) {
                            if (!profile.roles) profile.roles = []
                            profile.roles.push({ id: guild_role.id, until: new Date(Date.now() + item.onUse.roleTimely * 60 * 1000) })
                        }
                        used += `\n${client.config.emojis.YES} ${client.language({ textId: `Роль`, guildId: interaction.guildId, locale: interaction.locale })} <@&${item.onUse.roleAdd}> ${client.language({ textId: `была добавлена`, guildId: interaction.guildId, locale: interaction.locale })}`
                    } else {
                        profile.addRole({ id: guild_role.id, amount, ms: item.onUse.roleTimely ? item.onUse.roleTimely * 60 * 1000 : undefined })
                        used += `\n${client.config.emojis.YES} ${client.language({ textId: `Роль`, guildId: interaction.guildId, locale: interaction.locale })} <@&${item.onUse.roleAdd}> ${client.language({ textId: `была добавлена в </inventory-roles:1198617221170204833>`, guildId: interaction.guildId, locale: interaction.locale })}`
                    }
                    ableToUse = true
                } else used += `\n${client.config.emojis.NO}${client.language({ textId: `Роль`, guildId: interaction.guildId, locale: interaction.locale })} **${item.onUse.roleAdd}** ${client.language({ textId: `не найдена на сервере`, guildId: interaction.guildId, locale: interaction.locale })}.`
            }
            if (item.onUse.roleDel) {
                if (interaction.member.roles.cache.has(item.onUse.roleDel) || profile.inventoryRoles?.find(e => e.id === item.onUse.roleDel && e.ms === undefined)) {
                    const guild_role = interaction.guild.roles.cache.get(item.onUse.roleDel)
                    if (guild_role) {
                        if (interaction.member.roles.cache.has(item.onUse.roleDel)) {
                            try {
                                await interaction.member.roles.remove(guild_role.id)
                                const temporaryRole = profile.roles?.find(e => { return e.id === item.onUse.roleDel })
                                if (temporaryRole) {
                                    profile.roles = profile.roles.filter(r => r.id !== temporaryRole.id)
                                }
                                used += `\n${client.config.emojis.YES} ${client.language({ textId: `Роль`, guildId: interaction.guildId, locale: interaction.locale })} <@&${item.onUse.roleDel}> ${client.language({ textId: `была удалена`, guildId: interaction.guildId, locale: interaction.locale })}.`
                                ableToUse = true
                            } catch (err) {
                                used += `\n${client.config.emojis.NO} ${client.language({ textId: `Роль`, guildId: interaction.guildId, locale: interaction.locale })} <@&${item.onUse.roleDel}> ${client.language({ textId: `не была удалена, поскольку у меня нет прав на ее удаление`, guildId: interaction.guildId, locale: interaction.locale })}.`
                            }
                        } else if (profile.inventoryRoles?.find(e => e.id === item.onUse.roleDel && e.ms === undefined)) {
                            profile.subtractRole({ id: item.onUse.roleDel, amount })
                            used += `\n${client.config.emojis.YES} ${client.language({ textId: `Роль`, guildId: interaction.guildId, locale: interaction.locale })} <@&${item.onUse.roleDel}> ${client.language({ textId: `была удалена`, guildId: interaction.guildId, locale: interaction.locale })}.`
                            ableToUse = true
                        }
                    } else used += `\n${client.config.emojis.NO}${client.language({ textId: `Роль`, guildId: interaction.guildId, locale: interaction.locale })} **${item.onUse.roleAdd}** ${client.language({ textId: `не найдена на сервере`, guildId: interaction.guildId, locale: interaction.locale })}.`
                } else used += `\n${client.config.emojis.NO}${client.language({ textId: `Роль`, guildId: interaction.guildId, locale: interaction.locale })} <@&${item.onUse.roleDel}> ${client.language({ textId: `не была удалена. У тебя нет такой роли`, guildId: interaction.guildId, locale: interaction.locale })}.`
            }
            if (item.onUse.trophyAdd) {
                if (!profile.trophies?.some(e => e.toLowerCase() == item.onUse.trophyAdd.toLowerCase())) {
                    if (!profile.trophies || profile.trophies.length < 10) {
                        if (!profile.trophies) profile.trophies = []
                        profile.trophies.push(item.onUse.trophyAdd)
                        used += `\n${client.config.emojis.YES} ${client.language({ textId: `Трофей`, guildId: interaction.guildId, locale: interaction.locale })} ${item.onUse.trophyAdd} ${client.language({ textId: `был добавлен`, guildId: interaction.guildId, locale: interaction.locale })}.`
                        ableToUse = true
                    } else used += `\n${client.config.emojis.NO}${client.language({ textId: `Трофей`, guildId: interaction.guildId, locale: interaction.locale })} ${item.onUse.trophyAdd} ${client.language({ textId: `не был добавлен. Максимальное кол-во трофеев: 10`, guildId: interaction.guildId, locale: interaction.locale })}.`
                } else used += `\n${client.config.emojis.NO}${client.language({ textId: `Трофей`, guildId: interaction.guildId, locale: interaction.locale })} ${item.onUse.trophyAdd} ${client.language({ textId: `не был добавлен. У тебя уже есть такой трофей`, guildId: interaction.guildId, locale: interaction.locale })}.`
            }
            if (item.onUse.trophyDel) {
                if (profile.trophies?.some(e => e.toLowerCase() == item.onUse.trophyDel.toLowerCase())) {
                    profile.trophies = profile.trophies.filter(e => e.toLowerCase() !== item.onUse.trophyDel.toLowerCase())
                    if (!profile.trophies[0]) profile.trophies = undefined
                    used += `\n${client.config.emojis.YES} ${client.language({ textId: `Трофей`, guildId: interaction.guildId, locale: interaction.locale })} ${item.onUse.trophyDel} ${client.language({ textId: `был удален`, guildId: interaction.guildId, locale: interaction.locale })}.`
                    ableToUse = true
                } else used += `\n${client.config.emojis.NO}${client.language({ textId: `Трофей`, guildId: interaction.guildId, locale: interaction.locale })} ${item.onUse.trophyDel} ${client.language({ textId: `не был удален. У тебя нет такого трофея`, guildId: interaction.guildId, locale: interaction.locale })}.`
            }
            if (item.onUse.delCUR) {
                profile.multiplyCUR = 0
                profile.multiplyCURTime = undefined
                used += `\n${client.config.emojis.YES} ${client.language({ textId: `Буст валюты очищен`, guildId: interaction.guildId, locale: interaction.locale })}.`
                ableToUse = true
            }
            if (item.onUse.delXP) {
                profile.multiplyXP = 0
                profile.multiplyXPTime = undefined
                used += `\n${client.config.emojis.YES} ${client.language({ textId: `Буст опыта очищен`, guildId: interaction.guildId, locale: interaction.locale })}.`
                ableToUse = true
            }
            if (item.onUse.delLuck) {
                profile.multiplyLuck = 0
                profile.multiplyLuckTime = undefined
                used += `\n${client.config.emojis.YES} ${client.language({ textId: `Буст удачи очищен`, guildId: interaction.guildId, locale: interaction.locale })}.`
                ableToUse = true
            }
            if (item.onUse.delRP) {
                profile.multiplyRP = 0
                profile.multiplyRPTime = undefined
                used += `\n${client.config.emojis.YES} ${client.language({ textId: `Буст репутации очищен`, guildId: interaction.guildId, locale: interaction.locale })}.`
                ableToUse = true
            }
            if (item.onUse.multiplier?.XP?.x) {
                if ((profile.getXpBoost() > 0 && profile.getXpBoost() > item.onUse.multiplier.XP.x && !settings.global_boosters_stacking) || (((this.multiplyXPTime < new Date() || !this.multiplyXPTime) ? 0 : this.multiplyXP || 0) > 0 && settings.global_boosters_stacking)) {
                    used += `\n${client.config.emojis.NO}${client.language({ textId: `У тебя уже активен буст опыта с более большим множителем`, guildId: interaction.guildId, locale: interaction.locale })}`
                } else {
                    if (profile.getXpBoost() === item.onUse.multiplier.XP.x) {
                        try {
                            if (!profile.multiplyXPTime) profile.multiplyXPTime = new Date()
                            profile.multiplyXPTime = new Date((profile.multiplyXPTime?.getTime() || Date.now()) + item.onUse.multiplier.XP.time * amount * 60 * 1000)
                            used += `\n${client.config.emojis.YES} ${client.language({ textId: `Твой бустер опыта`, guildId: interaction.guildId, locale: interaction.locale })} **${item.onUse.multiplier.XP.time * amount}** ${client.language({ textId: `минут`, guildId: interaction.guildId, locale: interaction.locale })}.`
                        } catch (err) {
                            throw new Error(`${err.message} userID: ${profile.userID} | guildID: ${profile.guildID} | itemID: ${item.itemID}`)
                        }
                    } else {
                        profile.multiplyXP = item.onUse.multiplier.XP.x
                        profile.multiplyXPTime = new Date(Date.now() + item.onUse.multiplier.XP.time * amount * 60 * 1000)
                        used += `\n${client.config.emojis.YES} ${client.language({ textId: `Твой бустер опыта`, guildId: interaction.guildId, locale: interaction.locale })} **${booster(client.config, item.onUse.multiplier.XP.x)}** ${client.language({ textId: `в течении`, guildId: interaction.guildId, locale: interaction.locale })} ${client.functions.transformSecs(client, (item.onUse.multiplier.XP.time * amount) * 60 * 1000, interaction.guildId, interaction.locale)}`
                    }
                }
                ableToUse = true
            }
            if (item.onUse.multiplier?.CUR?.x) {
                if ((profile.getCurBoost() > 0 && profile.getCurBoost() > item.onUse.multiplier.CUR.x && !settings.global_boosters_stacking) || (((this.multiplyCURTime < new Date() || !this.multiplyCURTime) ? 0 : this.multiplyCUR || 0) > 0 && settings.global_boosters_stacking)) {
                    used += `\n${client.config.emojis.NO}${client.language({ textId: `У тебя уже активен буст валюты с более большим множителем`, guildId: interaction.guildId, locale: interaction.locale })}`
                } else {
                    if (profile.getCurBoost() === item.onUse.multiplier.CUR.x) {
                        try {
                            profile.multiplyCURTime = new Date((profile.multiplyCURTime?.getTime() || Date.now()) + item.onUse.multiplier.CUR.time * amount * 60 * 1000)
                            used += `\n${client.config.emojis.YES} ${client.language({ textId: `Твой бустер валюты`, guildId: interaction.guildId, locale: interaction.locale })} **${item.onUse.multiplier.CUR.time * amount}** ${client.language({ textId: `минут`, guildId: interaction.guildId, locale: interaction.locale })}.`
                        } catch (err) {
                            throw new Error(`${err.message} userID: ${profile.userID} | guildID: ${profile.guildID} | itemID: ${item.itemID}`)
                        }
                    } else {
                        profile.multiplyCUR = item.onUse.multiplier.CUR.x
                        profile.multiplyCURTime = new Date(Date.now() + item.onUse.multiplier.CUR.time * amount * 60 * 1000)
                        used += `\n${client.config.emojis.YES} ${client.language({ textId: `Твой бустер валюты`, guildId: interaction.guildId, locale: interaction.locale })} **${booster(client.config, item.onUse.multiplier.CUR.x)}** ${client.language({ textId: `в течении`, guildId: interaction.guildId, locale: interaction.locale })} ${client.functions.transformSecs(client, (item.onUse.multiplier.CUR.time * amount) * 60 * 1000, interaction.guildId, interaction.locale)}`
                    }
                }
                ableToUse = true
            }
            if (item.onUse.multiplier?.Luck?.x) {
                if ((profile.getLuckBoost() && profile.getLuckBoost() > item.onUse.multiplier.Luck.x && !settings.global_boosters_stacking) || (((this.multiplyLuckTime < new Date() || !this.multiplyLuckTime) ? 0 : this.multiplyLuck || 0) && settings.global_boosters_stacking)) {
                    used += `\n${client.config.emojis.NO}${client.language({ textId: `У тебя уже активен буст удачи с более большим множителем`, guildId: interaction.guildId, locale: interaction.locale })}`
                } else {
                    if (profile.getLuckBoost() === item.onUse.multiplier.Luck.x) {
                        try {
                            profile.multiplyLuckTime = new Date((profile.multiplyLuckTime?.getTime() || Date.now()) + item.onUse.multiplier.Luck.time * amount * 60 * 1000)
                            used += `\n${client.config.emojis.YES} ${client.language({ textId: `Твой бустер удачи`, guildId: interaction.guildId, locale: interaction.locale })} **${item.onUse.multiplier.Luck.time * amount}** ${client.language({ textId: `минут`, guildId: interaction.guildId, locale: interaction.locale })}.`
                        } catch (err) {
                            throw new Error(`${err.message} userID: ${profile.userID} | guildID: ${profile.guildID} | itemID: ${item.itemID}`)
                        }
                    } else {
                        profile.multiplyLuck = item.onUse.multiplier.Luck.x
                        profile.multiplyLuckTime = new Date(Date.now() + item.onUse.multiplier.Luck.time * amount * 60 * 1000)
                        used += `\n${client.config.emojis.YES} ${client.language({ textId: `Твой бустер удачи`, guildId: interaction.guildId, locale: interaction.locale })} **${booster(client.config, item.onUse.multiplier.Luck.x)}** ${client.language({ textId: `в течении`, guildId: interaction.guildId, locale: interaction.locale })} ${client.functions.transformSecs(client, (item.onUse.multiplier.Luck.time * amount) * 60 * 1000, interaction.guildId, interaction.locale)}`
                    }
                }
                ableToUse = true
            }
            if (item.onUse.multiplier?.RP?.x) {
                if ((profile.getRpBoost() > 0 && profile.getRpBoost() > item.onUse.multiplier.RP.x && !settings.global_boosters_stacking) || (((this.multiplyRPTime < new Date() || !this.multiplyRPTime) ? 0 : this.multiplyRP || 0) > 0 && settings.global_boosters_stacking)) {
                    used += `\n${client.config.emojis.NO}${client.language({ textId: `У тебя уже активен буст репутации с более большим множителем`, guildId: interaction.guildId, locale: interaction.locale })}`
                } else {
                    if (profile.getRpBoost() === item.onUse.multiplier.RP.x) {
                        try {
                            profile.multiplyRPTime = new Date((profile.multiplyRPTime?.getTime() || Date.now()) + item.onUse.multiplier.RP.time * amount * 60 * 1000)
                            used += `\n${client.config.emojis.YES} ${client.language({ textId: `Твой бустер репутации`, guildId: interaction.guildId, locale: interaction.locale })} **${item.onUse.multiplier.RP.time * amount}** ${client.language({ textId: `минут`, guildId: interaction.guildId, locale: interaction.locale })}.`
                        } catch (err) {
                            throw new Error(`${err.message} userID: ${profile.userID} | guildID: ${profile.guildID} | itemID: ${item.itemID}`)
                        }
                    } else {
                        profile.multiplyRP = item.onUse.multiplier.RP.x
                        profile.multiplyRPTime = new Date(Date.now() + item.onUse.multiplier.RP.time * amount * 60 * 1000)
                        used += `\n${client.config.emojis.YES} ${client.language({ textId: `Твой бустер репутации`, guildId: interaction.guildId, locale: interaction.locale })} **${booster(client.config, item.onUse.multiplier.RP.x)}** ${client.language({ textId: `в течении`, guildId: interaction.guildId, locale: interaction.locale })} ${client.functions.transformSecs(client, (item.onUse.multiplier.RP.time * amount) * 60 * 1000, interaction.guildId, interaction.locale)}`
                    }
                }
                ableToUse = true
            }
            if (item.onUse.addQuest) {
                const quest = client.cache.quests.find(quest => quest.guildID === interaction.guildId && quest.questID === item.onUse.addQuest && quest.isEnabled)
                if (!quest) {
                    used += `\n${client.config.emojis.NO}${client.language({ textId: `Квест`, guildId: interaction.guildId, locale: interaction.locale })} **${item.onUse.addQuest}** ${client.language({ textId: `не найден`, guildId: interaction.guildId, locale: interaction.locale })}.`
                } else if (profile.quests >= settings.max_quests) {
                    used += `\n${client.config.emojis.NO}${client.language({ textId: `Квест`, guildId: interaction.guildId, locale: interaction.locale })} ${quest.displayEmoji}**${quest.name}** ${client.language({ textId: `не был добавлен:`, guildId: interaction.guildId, locale: interaction.locale })} ${client.language({ textId: `Достигнуто максимальное количество квестов в профиле`, guildId: interaction.guildId, locale: interaction.locale })}: ${settings.max_quests}`
                } else if (profile.quests?.find(e => e.questID === quest.questID)?.finished === false) {
                    used += `\n${client.config.emojis.NO}${client.language({ textId: `Квест`, guildId: interaction.guildId, locale: interaction.locale })} ${quest.displayEmoji}**${quest.name}** ${client.language({ textId: `не был добавлен: уже взят`, guildId: interaction.guildId, locale: interaction.locale })}.`
                } else {
                    profile.addQuest(quest)
                    used += `\n${client.config.emojis.YES} ${client.language({ textId: `Квест`, guildId: interaction.guildId, locale: interaction.locale })} ${quest.displayEmoji}**${quest.name}** ${client.language({ textId: `был добавлен`, guildId: interaction.guildId, locale: interaction.locale })}.`
                    ableToUse = true
                }
            }
            if (item.onUse.delQuest) {
                const quest = client.cache.quests.find(quest => quest.guildID === interaction.guildId && quest.questID === item.onUse.delQuest && quest.isEnabled)
                if (!quest) {
                    used += `\n${client.config.emojis.NO}${client.language({ textId: `Квест`, guildId: interaction.guildId, locale: interaction.locale })} **${item.onUse.delQuest}** ${client.language({ textId: `не найден`, guildId: interaction.guildId, locale: interaction.locale })}.`
                } else {
                    const index = profile.quests?.findIndex(e => e.questID == quest.questID) || -1
                    if (index >= 0) {
                        profile.delQuest(quest)
                        used += `\n${client.config.emojis.YES} ${client.language({ textId: `Квест`, guildId: interaction.guildId, locale: interaction.locale })} ${quest.displayEmoji}**${quest.name}** ${client.language({ textId: `был удален из профиля`, guildId: interaction.guildId, locale: interaction.locale })}.`
                        ableToUse = true
                    } else {
                        used += `\n${client.config.emojis.NO}${client.language({ textId: `Квест`, guildId: interaction.guildId, locale: interaction.locale })} ${quest.displayEmoji}**${quest.name}** ${client.language({ textId: `не найден в профиле`, guildId: interaction.guildId, locale: interaction.locale })}.`
                    }
                }
            }
            if (item.onUse.wipeQuest) {
                const quest = client.cache.quests.find(quest => quest.guildID === interaction.guildId && quest.questID === item.onUse.wipeQuest && quest.isEnabled)
                if (!quest) {
                    used += `\n${client.config.emojis.NO}${client.language({ textId: `Квест`, guildId: interaction.guildId, locale: interaction.locale })} **${item.onUse.wipeQuest}** ${client.language({ textId: `не найден`, guildId: interaction.guildId, locale: interaction.locale })}.`
                } else {
                    const index = profile.quests?.findIndex(e => e.questID == quest.questID) || -1
                    if (index >= 0) {
                        if (quest.community) {
                            quest.targets.forEach(e => {
                                e.reached = 0
                                e.finished = false
                            })
                            profile.quests[index].finished = false
                            profile.quests[index].finishedDate = undefined
                            await quest.save().catch(e => console.error(e))
                        } else {
                            profile.quests[index].targets.forEach(e => {
                                e.reached = 0
                                e.finished = false
                            })
                            profile.quests[index].finished = false
                            profile.quests[index].finishedDate = undefined
                        }
                        used += `\n${client.config.emojis.YES} ${client.language({ textId: `Прогресс квеста`, guildId: interaction.guildId, locale: interaction.locale })} ${quest.displayEmoji}**${quest.name}** был сброшен.`
                        ableToUse = true
                    } else {
                        used += `\n${client.config.emojis.NO}${client.language({ textId: `Квест`, guildId: interaction.guildId, locale: interaction.locale })} ${quest.displayEmoji}**${quest.name}** ${client.language({ textId: `не найден в профиле`, guildId: interaction.guildId, locale: interaction.locale })}.`
                    }
                }
            }
            if (item.onUse.levelAdd) {
                await profile.addLevel({ amount: item.onUse.levelAdd * amount })
                used += `\n${client.config.emojis.YES} ${client.language({ textId: `Добавлено`, guildId: interaction.guildId, locale: interaction.locale })} ${client.config.emojis.medal}**${item.onUse.levelAdd * amount}** ${client.language({ textId: `уровней`, guildId: interaction.guildId, locale: interaction.locale })}.`
                ableToUse = true
            }
            if (item.onUse.rpAdd) {
                if (profile.rp < 1000) {
                    await profile.addRp({ amount: item.onUse.rpAdd * amount })
                    used += `\n${client.config.emojis.YES} ${client.language({ textId: `Добавлено`, guildId: interaction.guildId, locale: interaction.locale })} ${client.config.emojis.RP}**${!(item.onUse.rpAdd * amount).toString().split('.')[1] ? item.onUse.rpAdd * amount : (item.onUse.rpAdd * amount).toString().split('.')[1].length === 1 ? (item.onUse.rpAdd * amount).toFixed(1) : (item.onUse.rpAdd * amount).toFixed(2)}** ${client.language({ textId: `репутации`, guildId: interaction.guildId, locale: interaction.locale })}.`
                    ableToUse = true
                } else used += `\n${client.config.emojis.NO}${client.language({ textId: `Репутация не добавлена: максимум репутации`, guildId: interaction.guildId, locale: interaction.locale })}.`
            }
            if (item.onUse.xpAdd) {
                await profile.addXp({ amount: item.onUse.xpAdd * amount })
                used += `\n${client.config.emojis.YES} ${client.language({ textId: `Добавлено`, guildId: interaction.guildId, locale: interaction.locale })} ${client.config.emojis.XP}**${item.onUse.xpAdd * amount}** ${client.language({ textId: `опыта`, guildId: interaction.guildId, locale: interaction.locale })}.`
                ableToUse = true
            }
            if (item.onUse.currencyAdd) {
                await profile.addCurrency({ amount: item.onUse.currencyAdd * amount })
                used += `\n${client.config.emojis.YES} ${client.language({ textId: `Добавлено`, guildId: interaction.guildId, locale: interaction.locale })} ${settings.displayCurrencyEmoji}**${settings.currencyName}** (${item.onUse.currencyAdd * amount}).`
                ableToUse = true
            }
            if (item.onUse.itemAdd?.itemID) {
                const serverItem = client.cache.items.find(e => !e.temp && e.enabled && e.itemID === item.onUse.itemAdd.itemID)
                if (serverItem) {
                    await profile.addItem({ itemID: serverItem.itemID, amount: item.onUse.itemAdd.amount * amount })
                    used += `\n${client.config.emojis.YES} ${client.language({ textId: `Добавлено`, guildId: interaction.guildId, locale: interaction.locale })} ${serverItem.displayEmoji}**${serverItem.name}** (${item.onUse.itemAdd.amount * amount}).`
                    ableToUse = true
                } else used += `\n${client.config.emojis.NO}${client.language({ textId: `Предмет`, guildId: interaction.guildId, locale: interaction.locale })} **${item.onUse.itemAdd.itemID}** ${client.language({ textId: `не добавлен: не был найден`, guildId: interaction.guildId, locale: interaction.locale })}.`
            }
            if (item.onUse.addAchievement) {
                const achievement = client.cache.achievements.find(e => e.guildID === interaction.guildId && e.enabled && e.id === item.onUse.addAchievement)
                if (achievement) {
                    if (!profile.achievements?.some(e => e.achievmentID === item.onUse.addAchievement)) {
                        if (!client.tempAchievements[profile.userID]) client.tempAchievements[profile.userID] = []
                        client.tempAchievements[profile.userID].push(item.onUse.addAchievement)
                        await profile.addAchievement({ achievement })
                        used += `\n${client.config.emojis.YES} ${client.language({ textId: `Добавлено достижение`, guildId: interaction.guildId, locale: interaction.locale })} ${achievement.displayEmoji}**${achievement.name}**`
                        ableToUse = true
                    } else {
                        used += `\n${client.config.emojis.NO}${client.language({ textId: `Достижение`, guildId: interaction.guildId, locale: interaction.locale })} ${achievement.displayEmoji}**${achievement.name}** ${client.language({ textId: `не добавлено: оно уже есть`, guildId: interaction.guildId, locale: interaction.locale })}.`
                    }
                } else {
                    used += `\n${client.config.emojis.NO}${client.language({ textId: `Достижение`, guildId: interaction.guildId, locale: interaction.locale })} **${item.onUse.addAchievement}** ${client.language({ textId: `не добавлено: не было найдено`, guildId: interaction.guildId, locale: interaction.locale })}.`
                }
            }
            if (item.onUse.spawnWormhole) {
                const wormhole = client.cache.wormholes.find(e => e.isEnabled && e.wormholeID === item.onUse.spawnWormhole)
                if (wormhole) {
                    let wormholeItem = client.cache.items.find(e => e.itemID === wormhole.itemID && !e.temp && e.enabled)
                    let wormholeItemEmoji = wormholeItem?.displayEmoji
                    if (wormhole.itemID === "currency" || wormhole.itemID === "xp" || wormhole.itemID === "rp") {
                        wormholeItem = {
                            name: wormhole.itemID === "currency" ? settings.currencyName : wormhole.itemID === "xp" ? client.language({ textId: `Опыт`, guildId: interaction.guildId, locale: interaction.locale }) : client.language({ textId: `Репутация`, guildId: interaction.guildId, locale: interaction.locale })
                        }
                        wormholeItemEmoji = wormhole.itemID === "currency" ? settings.displayCurrencyEmoji : wormhole.itemID === "xp" ? client.config.emojis.XP : client.config.emojis.RP
                    }
                    if (wormholeItem) {
                        let webhook = client.cache.webhooks.get(wormhole.webhookId)
                        if (!webhook) {
                            webhook = await client.fetchWebhook(wormhole.webhookId).catch(() => null)
                            if (webhook instanceof Webhook) client.cache.webhooks.set(webhook.id, webhook)
                        }
                        if (webhook) {
                            await wormhole.spawn(webhook)
                            await profile.addQuestProgression({ type: "wormholesSpawned", amount: 1, object: wormhole.wormholeID })
                            profile.wormholesSpawned++
                            const achievements = client.cache.achievements.filter(e => e.guildID === interaction.guildId && e.enabled && e.type === AchievementType.WormholesSpawned)
                            await Promise.all(achievements.map(async achievement => {
                                if (!profile.achievements?.some(ach => ach.achievmentID === achievement.id) && profile.wormholesSpawned >= achievement.amount && !client.tempAchievements[interaction.user.id]?.includes(achievement.id)) {
                                    if (!client.tempAchievements[interaction.user.id]) client.tempAchievements[interaction.user.id] = []
                                    client.tempAchievements[interaction.user.id].push(achievement.id)
                                    await profile.addAchievement({ achievement })
                                }
                            }))
                            used += `\n${client.config.emojis.YES} ${client.language({ textId: `Червоточина`, guildId: interaction.guildId, locale: interaction.locale })} ${wormholeItemEmoji}**${wormholeItem.name}** ${client.language({ textId: `заспавнилась`, guildId: interaction.guildId, locale: interaction.locale })}.`
                            ableToUse = true
                        } else used += `\n${client.config.emojis.NO}${client.language({ textId: `Червоточина`, guildId: interaction.guildId, locale: interaction.locale })} ${wormholeItemEmoji}**${wormholeItem.name}** ${client.language({ textId: `не заспавнилась`, guildId: interaction.guildId, locale: interaction.locale })}: ${client.language({ textId: `вебхук не найден`, guildId: interaction.guildId, locale: interaction.locale })}.`
                    } else used += `\n${client.config.emojis.NO}${client.language({ textId: `Червоточина`, guildId: interaction.guildId, locale: interaction.locale })} **${item.onUse.spawnWormhole}** ${client.language({ textId: `не будет призвана: предмет`, guildId: interaction.guildId, locale: interaction.locale })} **${wormhole.itemID}** ${client.language({ textId: `не найден`, guildId: interaction.guildId, locale: interaction.locale })}.`
                } else used += `\n${client.config.emojis.NO}${client.language({ textId: `Червоточина`, guildId: interaction.guildId, locale: interaction.locale })} **${item.onUse.spawnWormhole}** ${client.language({ textId: `не заспавнилась`, guildId: interaction.guildId, locale: interaction.locale })}: ${client.language({ textId: `не была найдена`, guildId: interaction.guildId, locale: interaction.locale })}.`
            }
            if (item.onUse.craftResearch) {
                const serverItem = client.cache.items.find(e => e.itemID === item.onUse.craftResearch && e.enabled && !e.temp)
                if (serverItem) {
                    const craft = serverItem.crafts.find((e) => { return e.isFound === false })
                    if (!craft) {
                        used += `\n${client.config.emojis.NO}${client.language({ textId: `Для предмета`, guildId: interaction.guildId, locale: interaction.locale })} ${serverItem.displayEmoji}**${serverItem.name}** ${client.language({ textId: `изучены все рецепты`, guildId: interaction.guildId, locale: interaction.locale })}.`
                    } else {
                        let recipe = ""
                        for (const e of craft.items) {
                            let amount = ""
                            if (e.amount > 1) amount += e.amount
                            if (e.itemID == "currency") {
                                if (craft.items.findIndex(i2 => i2.itemID === e.itemID) === 0) {
                                    recipe += `${settings.displayCurrencyEmoji}**${settings.currencyName}** (${amount})`
                                } else {
                                    recipe += ` + ${settings.displayCurrencyEmoji}**${settings.currencyName}** (${amount})`
                                }

                            } else {
                                let cItem = client.cache.items.find(a => !a.temp && a.enabled && a.itemID === e.itemID)
                                if (craft.items.findIndex(i2 => i2.itemID === e.itemID) === 0) {
                                    if (cItem.found) recipe += `${cItem.displayEmoji}**${cItem.name}** (${amount})`
                                    else recipe += `||??||`
                                }
                                else {
                                    if (cItem.found) recipe += ` + ${cItem.displayEmoji}**${cItem.name}** (${amount})`
                                    else recipe += ` + ||??||`
                                }
                            }
                        }
                        let craftingItems = ""
                        if (serverItem.crafts.amount1 !== serverItem.crafts.amount2) craftingItems = `${serverItem.crafts.amount1}-${serverItem.crafts.amount2}`
                        else craftingItems = ""
                        recipe += ` = ${serverItem.displayEmoji}**${serverItem.name}** (${craftingItems})\n`
                        craft.isFound = true
                        await serverItem.save()
                        ableToUse = true
                        used += `\n${client.config.emojis.YES} ${client.language({ textId: `Ты изучил рецепт`, guildId: interaction.guildId, locale: interaction.locale })}: ${recipe}`
                    }
                } else used += `\n${client.config.emojis.NO}${client.language({ textId: `Рецепт не был изучен`, guildId: interaction.guildId, locale: interaction.locale })}: ${client.language({ textId: `предмет`, guildId: interaction.guildId, locale: interaction.locale })} **${item.onUse.craftResearch}** ${client.language({ textId: `не найден`, guildId: interaction.guildId, locale: interaction.locale })}.`
            }
            if (item.onUse.itemResearch) {
                const serverItem = client.cache.items.find(e => e.itemID === item.onUse.itemResearch && !e.temp && e.enabled)
                if (serverItem) {
                    if (serverItem.found) {
                        used += `\n${client.config.emojis.NO}${client.language({ textId: `Предмет`, guildId: interaction.guildId, locale: interaction.locale })} ${serverItem.displayEmoji}**${serverItem.name}** ${client.language({ textId: `уже изучен`, guildId: interaction.guildId, locale: interaction.locale })}.`
                    } else {
                        serverItem.found = true
                        await serverItem.save()
                        used += `\n${client.config.emojis.YES} ${client.language({ textId: `Предмет`, guildId: interaction.guildId, locale: interaction.locale })} ${serverItem.displayEmoji}**${serverItem.name}** ${client.language({ textId: `изучен`, guildId: interaction.guildId, locale: interaction.locale })}.`
                        ableToUse = true
                    }
                }
            }
            if (item.onUse.deleteItemFromServer) {
                const serverItem = client.cache.items.find(e => e.itemID === item.onUse.deleteItemFromServer && !e.temp && e.enabled && e.found)
                if (serverItem) {
                    await serverItem.delete()
                    used += `\n${client.config.emojis.YES} ${client.language({ textId: `Предмет`, guildId: interaction.guildId, locale: interaction.locale })} ${serverItem.displayEmoji}**${serverItem.name}** ${client.language({ textId: `был удален с сервера`, guildId: interaction.guildId, locale: interaction.locale })}.`
                    ableToUse = true
                } else used += `\n${client.config.emojis.NO}${client.language({ textId: `Предмет`, guildId: interaction.guildId, locale: interaction.locale })} **${item.onUse.deleteItemFromServer}** ${client.language({ textId: `не был удален с сервера: не найден`, guildId: interaction.guildId, locale: interaction.locale })}.`
            }
            if (item.onUse.takeXP) {
                await profile.subtractXp({ amount: item.onUse.takeXP * amount })
                used += `\n${client.config.emojis.YES} ${client.language({ textId: `Вычтено`, guildId: interaction.guildId, locale: interaction.locale })} ${client.config.emojis.XP}**${item.onUse.takeXP * amount}** ${client.language({ textId: `опыта`, guildId: interaction.guildId, locale: interaction.locale })}.`
                ableToUse = true
            }
            if (item.onUse.takeCUR) {
                await profile.subtractCurrency({ amount: item.onUse.takeCUR * amount })
                used += `\n${client.config.emojis.YES} ${client.language({ textId: `Вычтено`, guildId: interaction.guildId, locale: interaction.locale })} ${settings.displayCurrencyEmoji}**${settings.currencyName}** (${item.onUse.takeCUR * amount}).`
                ableToUse = true
            }
            if (item.onUse.takeRP) {
                await profile.subtractRp({ amount: item.onUse.takeRP * amount })
                used += `\n${client.config.emojis.YES} ${client.language({ textId: `Вычтено`, guildId: interaction.guildId, locale: interaction.locale })} ${client.config.emojis.RP}**${!(item.onUse.takeRP * amount).toString().split('.')[1] ? item.onUse.takeRP * amount : (item.onUse.takeRP * amount).toString().split('.')[1].length === 1 ? (item.onUse.takeRP * amount).toFixed(1) : (item.onUse.takeRP * amount).toFixed(2)}** ${client.language({ textId: `репутации`, guildId: interaction.guildId, locale: interaction.locale })}.`
                ableToUse = true
            }
            if (item.onUse.takeLevel) {
                await profile.subtractLevel({ amount: item.onUse.takeLevel * amount })
                used += `\n${client.config.emojis.YES} ${client.language({ textId: `Вычтено`, guildId: interaction.guildId, locale: interaction.locale })} ${client.config.emojis.medal}**${item.onUse.takeLevel * amount}** ${client.language({ textId: `уровней`, guildId: interaction.guildId, locale: interaction.locale })}.`
                ableToUse = true
            }
            if (item.onUse.takeItem?.itemID) {
                const serverItem = client.cache.items.find(e => e.itemID === item.onUse.takeItem.itemID && !e.temp && e.enabled)
                if (serverItem) {
                    await profile.subtractItem({ itemID: serverItem.itemID, amount: item.onUse.takeItem.amount * amount })
                    used += `\n${client.config.emojis.YES} ${client.language({ textId: `Вычтено`, guildId: interaction.guildId, locale: interaction.locale })} ${serverItem.displayEmoji}**${serverItem.name}** (${item.onUse.takeItem.amount * amount}).`
                    ableToUse = true
                } else used += `\n${client.config.emojis.NO}${client.language({ textId: `Предмет`, guildId: interaction.guildId, locale: interaction.locale })} **${item.onUse.takeItem.itemID}** ${client.language({ textId: `не вычтен: не был найден`, guildId: interaction.guildId, locale: interaction.locale })}.`
            }
            if (item.onUse.autoIncome) {
                if (profile.autoIncomeExpire && profile.autoIncomeExpire > new Date()) {
                    profile.autoIncomeExpire = new Date(profile.autoIncomeExpire.getTime() + item.onUse.autoIncome * amount * 60 * 1000)
                    if (profile.timeouts.autoIncome) profile.clearAutoIncomeTimeout()
                    profile.setAutoIncomeTimeout()
                    used += `\n${client.config.emojis.YES} ${client.language({ textId: `Авто доход ролей увеличен до`, guildId: interaction.guildId, locale: interaction.locale })} <t:${Math.floor(profile.autoIncomeExpire / 1000)}:f>`
                    ableToUse = true
                } else {
                    profile.autoIncomeExpire = new Date(Date.now() + item.onUse.autoIncome * amount * 60 * 1000)
                    profile.setAutoIncomeTimeout()
                    used += `\n${client.config.emojis.YES} ${client.language({ textId: `Авто доход ролей включён до`, guildId: interaction.guildId, locale: interaction.locale })} <t:${Math.floor(profile.autoIncomeExpire / 1000)}:f>`
                }
                ableToUse = true
            }
            if (item.onUse.autoIncomeDel) {
                profile.autoIncomeExpire = undefined
                profile.clearAutoIncomeTimeout()
                used += `\n${client.config.emojis.YES} ${client.language({ textId: `Авто доход ролей выключен`, guildId: interaction.guildId, locale: interaction.locale })}`
            }
            if (ableToUse === true) {
                const embed = new EmbedBuilder()
                    .setColor(item.onUse.color || interaction.member.displayHexColor)
                    .setAuthor({ name: interaction.member.displayName, iconURL: interaction.member.displayAvatarURL() })
                    .setTitle(`${client.config.emojis.DONE} ${client.language({ textId: `Ты`, guildId: interaction.guildId, locale: interaction.locale })} ${profile.sex === "male" ? `${client.language({ textId: `использовал`, guildId: interaction.guildId, locale: interaction.locale })}` : profile.sex === "female" ? `${client.language({ textId: `использовала`, guildId: interaction.guildId, locale: interaction.locale })}` : `${client.language({ textId: `использовал(-а)`, guildId: interaction.guildId, locale: interaction.locale })}`} ${item.displayEmoji}**${item.name}** (${amount})`)
                    .setDescription(used || null)
                    .setThumbnail(item.onUse.thumbnail || item.image || await item.getEmojiURL() || null)
                    .setImage(item.onUse.image || null)
                await profile.subtractItem({ itemID: item.itemID, amount })
                await profile.addQuestProgression({ type: "itemsUsed", amount, object: item.itemID })
                profile.itemsUsed += amount
                if (item.cooldown_use) {
                    if (!profile.itemsCooldowns) profile.itemsCooldowns = new Map()
                    if (profile.itemsCooldowns.get(item.itemID)) profile.itemsCooldowns.set(item.itemID, { ...profile.itemsCooldowns.get(item.itemID), use: new Date(Date.now() + item.cooldown_use * 1000) })
                    else profile.itemsCooldowns.set(item.itemID, { use: new Date(Date.now() + item.cooldown_use * 1000) })
                }
                const achievements = client.cache.achievements.filter(e => e.guildID === interaction.guildId && e.enabled && e.type === AchievementType.ItemsUsed)
                await Promise.all(achievements.map(async achievement => {
                    if (!profile.achievements?.some(ach => ach.achievmentID === achievement.id) && profile.itemsUsed >= achievement.amount && !client.tempAchievements[interaction.user.id]?.includes(achievement.id)) {
                        if (!client.tempAchievements[interaction.user.id]) client.tempAchievements[interaction.user.id] = []
                        client.tempAchievements[interaction.user.id].push(achievement.id)
                        await profile.addAchievement({ achievement })
                    }
                }))
                await profile.save()
                if (interaction2) {
                    interaction2.editReply({ content: " ", embeds: [embed], components: [] })    
                } else {
                    await interaction.deferUpdate()
                    interaction.followUp({ content: " ", embeds: [embed], flags: ["Ephemeral"] }) 
                }
                client.emit("economyLogCreate", interaction.guildId, `<@${interaction.user.id}> (${interaction.user.username}) ${client.language({ textId: "использовал", guildId: interaction.guildId })} ${item.displayEmoji}**${item.name}** (${amount})`)
            } else {
                const embed = new EmbedBuilder()
                    .setColor(interaction.member.displayHexColor)
                    .setAuthor({ name: interaction.member.displayName, iconURL: interaction.member.displayAvatarURL() })
                    .setDescription(used)
                if (interaction2) {
                    interaction2.editReply({ content: " ", embeds: [embed], components: [] })
                } else {
                    await interaction.deferUpdate()
                    interaction.followUp({ embeds: [embed], flags: ["Ephemeral"] })
                }
            }
        }
        if (interaction.customId?.includes("sellItem")) {
            const item = client.cache.items.find(item => item.guildID === interaction.guildId && item.enabled && item.found && !item.temp && item.itemID === ItemRegexp.exec(interaction.customId)?.[1])
            if (!item) return interaction.reply({ content: `${client.config.emojis.NO}${client.language({ textId: `Предмет не найден`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
            const userItem = profile.inventory.find(e => { return e.itemID == item.itemID && e.amount > 0 })
            if (!userItem || userItem.amount < 1) return interaction.reply({ content: `${client.config.emojis.NO}${client.language({ textId: `В инвентаре нет такого предмета`, guildId: interaction.guildId, locale: interaction.locale })}: ${item.displayEmoji}**${item.name}**`, flags: ["Ephemeral"] })
            if ((!item.shop.sellingPrice && !item.shop.cryptoSellingPrice) || !item.shop.sellingPriceType) {
                return interaction.reply({ content: `${client.config.emojis.NO} ${client.language({ textId: `Предмет`, guildId: interaction.guildId, locale: interaction.locale })} ${item.displayEmoji}**${item.name}** ${client.language({ textId: `невозможно продать`, guildId: interaction.guildId, locale: interaction.locale })}.`, flags: ["Ephemeral"] })
            }
            if (item.sellPermission && client.cache.permissions.some(e => e.id === item.sellPermission)) {
                const permission = client.cache.permissions.find(e => e.id === item.sellPermission)
                const isPassing = permission.for(profile, interaction.member, interaction.channel, interaction)
                if (isPassing.value === false) {
                    return interaction.reply({ embeds: [new EmbedBuilder().setColor(3093046).setTitle(`${client.language({ textId: `Для этого взаимодействия требуется:`, guildId: interaction.guildId, locale: interaction.locale })}`).setDescription(isPassing.reasons.join("\n"))], flags: ["Ephemeral"] })
                }
            }
            const serverSellingItemEmoji = item.shop.sellingPriceType == "currency" ? settings.displayCurrencyEmoji : client.cache.items.find(i => i.itemID == item.shop.sellingPriceType && !i.temp && i.enabled)?.displayEmoji
            const userItemAmount = userItem.amount === undefined ? 1 : userItem.amount
            let amount = 1
            const modal = new ModalBuilder()
                .setCustomId(`sellItem_${interaction.id}`)
                .setTitle(`${client.language({ textId: `Продать`, guildId: interaction.guildId, locale: interaction.locale })}`)
                .setLabelComponents([
                    new LabelBuilder()
                        .setLabel(`${client.language({ textId: "Количество", guildId: interaction.guildId, locale: interaction.locale })}`)
                        .setTextInputComponent(
                            new TextInputBuilder()
                                .setCustomId("amount")
                                .setStyle(TextInputStyle.Short)
                        ),
                ])
            await interaction.showModal(modal);delete client.globalCooldown[`${interaction.guildId}_${interaction.user.id}`]
            const filter = (i) => i.customId === `sellItem_${interaction.id}` && i.user.id === interaction.user.id;
            interaction = await interaction.awaitModalSubmit({ filter, time: 30000 }).catch(() => null)
            if (interaction && interaction.type === InteractionType.ModalSubmit) {
                const modalArgs = {}
                interaction.fields.fields.each(field => modalArgs[field.customId] = field.value)
                if (isNaN(+modalArgs.amount) || !Number.isInteger(+modalArgs.amount)) {
                    return interaction.reply({ content: `${client.config.emojis.NO} **${modalArgs.amount}** ${client.language({ textId: `не является целым числом`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
                }
                amount = +modalArgs.amount
            } else return
            if (amount > userItemAmount) amount = userItemAmount
            if (amount < item.min_sell || (item.max_sell ? amount > item.max_sell : false)) {
                return interaction.reply({ content: `${client.config.emojis.NO} ${client.language({ textId: `Диапазон количества продажи этого предмета`, guildId: interaction.guildId, locale: interaction.locale })}: ${client.language({ textId: `от`, guildId: interaction.guildId, locale: interaction.locale })} ${item.min_sell}${item.max_sell ? ` ${client.language({ textId: `до`, guildId: interaction.guildId, locale: interaction.locale })} ${item.max_sell}` : ""}`, flags: ["Ephemeral"] })  
            }
            if (profile.itemsCooldowns && profile.itemsCooldowns.get(item.itemID)?.sell > new Date()) {
                return interaction.reply({ content: `⏳${client.language({ textId: "Ждите кулдаун для этого предмета", guildId: interaction.guildId, locale: interaction.locale })}: ${transformSecs(client, profile.itemsCooldowns.get(item.itemID).sell - new Date(), interaction.guildId, interaction.locale)}`, flags: ["Ephemeral"] })
            }
            const shopItem = client.cache.items.find(e => e.itemID === userItem.itemID && e.shop.inShop)
            if (shopItem) {
                shopItem.shop.amount += amount
                await shopItem.save()
            }
            userItem.amount -= amount
            let price = item.shop.cryptoSellingPrice ? await fetch(`https://api.coinbase.com/v2/prices/${item.shop.cryptoSellingPrice}/sell`).then(response => response.json().then(response => response.data.amount * item.shop.cryptoSellingPriceMultiplier)).catch(err => NaN) : item.shop.sellingPrice
            if (item.shop.sellingDiscount) price = (price * (1 - profile.rp / 2000)) * amount
            else price = price * amount
            if (!price) return interaction.reply({ content: `${client.config.emojis.NO}**${client.language({ textId: `Ошибка получения цены`, guildId: interaction.guildId, locale: interaction.locale })}**`, flags: ["Ephemeral"] })
            if (item.shop.sellingPriceType !== "currency") {
                await profile.addItem({ itemID: item.shop.sellingPriceType, amount: price })
            } else await profile.addCurrency({ amount: price })
            await profile.addQuestProgression({ type: "itemsSold", amount, object: userItem.itemID })
            profile.itemsSold = +`${new Decimal(profile.itemsSold).plus(amount)}`
            if (item.cooldown_sell) {
                if (!profile.itemsCooldowns) profile.itemsCooldowns = new Map()
                if (profile.itemsCooldowns.get(item.itemID)) profile.itemsCooldowns.set(item.itemID, {...profile.itemsCooldowns.get(item.itemID), sell: new Date(Date.now() + item.cooldown_sell * 1000) })
                else profile.itemsCooldowns.set(item.itemID, { sell: new Date(Date.now() + item.cooldown_sell * 1000) })
            }
            const achievements = client.cache.achievements.filter(e => e.guildID === interaction.guildId && e.enabled && e.type === AchievementType.ItemsSold)
            await Promise.all(achievements.map(async achievement => {
                if (!profile.achievements?.some(ach => ach.achievmentID === achievement.id) && profile.itemsSold >= achievement.amount && !client.tempAchievements[interaction.user.id]?.includes(achievement.id)) { 
                    if (!client.tempAchievements[interaction.user.id]) client.tempAchievements[interaction.user.id] = []
                    client.tempAchievements[interaction.user.id].push(achievement.id)
                    await profile.addAchievement({ achievement })
                }
            }))
            await profile.save()
            client.emit("economyLogCreate", interaction.guildId, `<@${interaction.user.id}> (${interaction.user.username}) ${client.language({ textId: "продал предмет", guildId: interaction.guildId })} ${item.displayEmoji}**${item.name}** (${item.itemID}) (${amount})`)
            await interaction.deferUpdate()
            interaction.followUp({ content: `<@${interaction.user.id}>, ${client.language({ textId: `ты`, guildId: interaction.guildId, locale: interaction.locale })} ${profile.sex === "male" ? `${client.language({ textId: `продал`, guildId: interaction.guildId, locale: interaction.locale })}` : profile.sex === "female" ? `${client.language({ textId: `продала`, guildId: interaction.guildId, locale: interaction.locale })}` : `${client.language({ textId: `продал(-а)`, guildId: interaction.guildId, locale: interaction.locale })}`} ${item.displayEmoji}**${item.name}** (${amount}) ${client.language({ textId: `за`, guildId: interaction.guildId, locale: interaction.locale })} ${serverSellingItemEmoji}${price.toLocaleString()}`, flags: ["Ephemeral"] })
        }
        const isYourMenu = interaction.isButton() && MemberRegexp.exec(interaction.customId)?.[1] == UserRegexp.exec(interaction.customId)?.[1] ? true : interaction.user.id == member.user.id ? true : false
        const inventoryEmbed = new EmbedBuilder()
        const container = new ContainerBuilder().setAccentColor(hex2rgb(member.displayHexColor))
        if (member.user.bot || (profile.isHiden && interaction.user.id !== profile.userID && !interaction.member.permissions.has("Administrator"))) {
            inventoryEmbed.setAuthor({ name: `${member.displayName} | ${client.language({ textId: `Инвентарь`, guildId: interaction.guildId, locale: interaction.locale })}`, iconURL: member.displayAvatarURL() }) 
            inventoryEmbed.setDescription(`${client.config.emojis.block} ${client.language({ textId: `Профиль скрыт`, guildId: interaction.guildId, locale: interaction.locale })}`)
            inventoryEmbed.setColor(member.displayHexColor)
            return interaction.reply({ embeds: [inventoryEmbed] })
        }
        const sell_btn = new ButtonBuilder()
            .setStyle(ButtonStyle.Secondary)
            .setLabel(`${client.language({ textId: `ПРОДАТЬ ВСЁ`, guildId: interaction.guildId, locale: interaction.locale })}`)
            .setCustomId(`usr{${interaction.user.id}}cmd{inventory}lim{${itemLimitPerPage}}mbr{${member.user.id}} sellAll`)
            .setDisabled(true)
        if (interaction.isButton() && interaction.customId.includes('sellAll')) {
            const components = JSON.parse(JSON.stringify(interaction.message.components))
            interaction.message.components.forEach(row => row.components.forEach(component => {
                if (component.data.type === ComponentType.Section) {
                    component.accessory.data.disabled = true
                }
                if (component.data.type === ComponentType.ActionRow) {
                    component.components.forEach(component => {
                        component.data.disabled = true
                    })
                }
            }))
            await interaction.update({ components: interaction.message.components })
            await interaction.followUp({ 
                content: `${client.language({ textId: `Ты уверен, что хочешь продать все предметы?`, guildId: interaction.guildId, locale: interaction.locale })}`,
                components: [
                    new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId(`sell_yes_${interaction.id}`)
                                .setLabel(client.language({ textId: `ДА`, guildId: interaction.guildId, locale: interaction.locale }))
                                .setStyle(ButtonStyle.Success),
                            new ButtonBuilder()
                                .setCustomId(`sell_no_${interaction.id}`)
                                .setLabel(client.language({ textId: `НЕТ`, guildId: interaction.guildId, locale: interaction.locale }))
                                .setStyle(ButtonStyle.Danger)
                        )
                ],
                flags: ["Ephemeral"]
            })
            const filter = (i) => (i.customId === `sell_yes_${interaction.id}` || i.customId === `sell_no_${interaction.id}`) && i.user.id === interaction.user.id;
            const interaction2 = await interaction.channel.awaitMessageComponent({ filter, time: 30000 }).catch(() => null)
            if (interaction2) {
                if (interaction2.customId === `sell_no_${interaction.id}`) {
                    await interaction2.update({ content: client.config.emojis.YES, components: [] })
                    return interaction.editReply({ components: components })
                }
            } else return
            const soldItemsObj = {}
            const soldItemsArr = []
            min = 0
            limit = itemLimitPerPage
            const shopItems = client.cache.items.filter(e => e.guildID === interaction.guildId && !e.temp && e.enabled && e.shop.inShop)
            for (const item of profile.inventory) {
                const serverItem = client.cache.items.find(e => e.guildID === interaction.guildId && !e.temp && e.enabled && e.itemID === item.itemID)
                if (serverItem && item.amount > 0 && (serverItem.shop.sellingPrice || serverItem.shop.cryptoSellingPrice) && serverItem.shop.sellingPriceType && !item.fav && (serverItem.sellPermission && client.cache.permissions.get(serverItem.sellPermission) ? client.cache.permissions.get(serverItem.sellPermission).for(profile, member, interaction.channel, interaction.member).value : true)) {
                    for (const sItem of shopItems) {
                        if (sItem.itemID === item.itemID) {
                            sItem.shop.amount += item.amount
                            sItem.save()
                        }
                    }
                    let spent = serverItem.shop.cryptoSellingPrice ? await fetch(`https://api.coinbase.com/v2/prices/${serverItem.shop.cryptoSellingPrice}/sell`).then(response => response.json().then(response => response.data.amount * serverItem.shop.cryptoSellingPriceMultiplier)) : serverItem.shop.sellingPrice
                    spent = serverItem.shop.sellingDiscount ? (spent + spent * (profile.rp / 2000)) * item.amount : spent*item.amount
                    if (serverItem.shop.sellingPriceType == "currency") {
                        if (!soldItemsObj["currency"]) soldItemsObj["currency"] = spent
                        else soldItemsObj["currency"] += spent
                    }
                    else {
                        if (!soldItemsObj[serverItem.shop.sellingPriceType]) soldItemsObj[serverItem.shop.sellingPriceType] = spent
                        else soldItemsObj[serverItem.shop.sellingPriceType] += spent
                        await profile.addItem({ itemID: serverItem.shop.sellingPriceType, amount: spent })
                    }
                    await profile.subtractItem({ itemID: item.itemID, amount: item.amount })
                    await profile.addQuestProgression({ type: "itemsSold", amount: item.amount, object: item.itemID })
                }
            }
            for (const itemID in soldItemsObj) {
                if (itemID === "currency") {
                    await profile.addCurrency({ amount: soldItemsObj[itemID] })
                    soldItemsArr.push(`${settings.displayCurrencyEmoji}${soldItemsObj[itemID].toLocaleString()}`)
                } else {
                    const priceItem = client.cache.items.get(itemID)
                    soldItemsArr.push(`${priceItem.displayEmoji}${soldItemsObj[itemID].toLocaleString()}`)
                }
            }
            await profile.save()
            client.emit("economyLogCreate", interaction.guildId, `<@${interaction.user.id}> (${interaction.user.username}) ${client.language({ textId: "продал все предметы", guildId: interaction.guildId })}`)
            await interaction2.update({ 
                embeds: [
                    new EmbedBuilder()
                        .setAuthor({ name: member.displayName, iconURL: member.displayAvatarURL() })
                        .setColor(member.displayHexColor)
                        .setDescription(`${client.language({ textId: `Ты продал предметы за`, guildId: interaction.guildId, locale: interaction.locale })}:\n${soldItemsArr.join("\n")}`)
                ],
                components: [],
                content: " ",
                flags: ["Ephemeral"]
            })
            sell_btn.setStyle(ButtonStyle.Secondary)
            sell_btn.setDisabled(true)
        }
        const inventory = profile.inventory.filter(element => element.amount > 0 || element.amount < 0).sort((a, b) => {
            const aItem = client.cache.items.find(e => !e.temp && e.itemID === a.itemID)
            const bItem = client.cache.items.find(e => !e.temp && e.itemID === b.itemID)
            if (!aItem) return 1
            if (!bItem) return -1
            return aItem.sort - bItem.sort
        })
        const notNullItems = profile.inventory.filter(e => e.amount > 0 || e.amount < 0)
        const refresh_inventory_btn = new ButtonBuilder()
            .setStyle(ButtonStyle.Secondary)
            .setLabel(`${Math.ceil(limit/itemLimitPerPage).toString()}/${notNullItems.length ? Math.ceil(notNullItems.length / itemLimitPerPage) : 1}`)
            .setEmoji(client.config.emojis.refresh)
            .setCustomId(`usr{${interaction.user.id}}cmd{inventory}lim{${limit}}mbr{${member.user.id}}`)
        const first_page_btn = new ButtonBuilder()
            .setEmoji(`${client.config.emojis.arrowLeft2}`)
            .setStyle(ButtonStyle.Secondary)
            .setCustomId(`usr{${interaction.user.id}}cmd{inventory}lim{${itemLimitPerPage}}mbr{${member.user.id}}1`)
            .setDisabled((notNullItems.length <= itemLimitPerPage && min == 0) || (notNullItems.length > itemLimitPerPage && min < itemLimitPerPage))
        const previous_page_btn = new ButtonBuilder()
            .setEmoji(`${client.config.emojis.arrowLeft}`)
            .setStyle(ButtonStyle.Secondary)
            .setCustomId(`usr{${interaction.user.id}}cmd{inventory}lim{${limit - itemLimitPerPage}}mbr{${member.user.id}}2`)
            .setDisabled((notNullItems.length <= itemLimitPerPage && min == 0) || (notNullItems.length > itemLimitPerPage && min < itemLimitPerPage))
        const select_page_btn = new ButtonBuilder()
            .setLabel(`${Math.ceil(limit/itemLimitPerPage).toString()}/${notNullItems.length ? Math.ceil(notNullItems.length / itemLimitPerPage) : 1}`)
            .setStyle(ButtonStyle.Secondary)
            .setCustomId(`usr{${interaction.user.id}}cmd{inventory}mbr{${member.user.id}} select`)
            .setDisabled(notNullItems.length <= itemLimitPerPage && min == 0)
        const next_page_btn = new ButtonBuilder()
            .setEmoji(`${client.config.emojis.arrowRight}`)
            .setStyle(ButtonStyle.Secondary)
            .setCustomId(`usr{${interaction.user.id}}cmd{inventory}lim{${limit + itemLimitPerPage}}mbr{${member.user.id}}3`)
            .setDisabled((notNullItems.length <= itemLimitPerPage && min == 0) || (notNullItems.length > itemLimitPerPage && min >= notNullItems.length - itemLimitPerPage))
        const last_page_btn = new ButtonBuilder()
            .setEmoji(`${client.config.emojis.arrowRight2}`)
            .setStyle(ButtonStyle.Secondary)
            .setCustomId(`usr{${interaction.user.id}}cmd{inventory}lim{${notNullItems.length + (notNullItems.length % itemLimitPerPage == 0 ? 0 : itemLimitPerPage - (notNullItems.length % itemLimitPerPage))}}mbr{${member.user.id}}4`)
            .setDisabled((notNullItems.length <= itemLimitPerPage && min == 0) || (notNullItems.length > itemLimitPerPage && min >= notNullItems.length - itemLimitPerPage))
        const array_btn = [previous_page_btn, refresh_inventory_btn, next_page_btn]
        if (isYourMenu) array_btn.push(sell_btn)
        let a = min
        inventoryEmbed.setColor(member.displayHexColor)
        inventoryEmbed.setAuthor({ name: `${member.displayName} | ${client.language({ textId: `Инвентарь`, guildId: interaction.guildId, locale: interaction.locale })}`, iconURL: member.displayAvatarURL() })
        const text = [
            `## ${member.displayName} | ${client.language({ textId: `Инвентарь`, guildId: interaction.guildId, locale: interaction.locale })}`,
            `${settings.displayCurrencyEmoji}${settings.currencyName} › (${Math.ceil(profile.currency).toLocaleString()})`,
            `-# ${settings.currencyDescription}`
        ]
        container.addTextDisplayComponents(new TextDisplayBuilder().setContent(text.join("\n")))
        inventoryEmbed.addFields([
            { name: `${settings.displayCurrencyEmoji}${settings.currencyName} › (${Math.ceil(profile.currency).toLocaleString()})`, value: `-# ${settings.currencyDescription}` }
        ])
        await Promise.all(inventory.slice(min, limit).map(async item => {
            let price
            let amount
            const serverItem = client.cache.items.find(e => !e.temp && e.itemID === item.itemID)
            if (sell_btn.data.disabled && serverItem && serverItem.shop && (serverItem.shop.sellingPrice || serverItem.shop.cryptoSellingPrice) && serverItem.shop?.sellingPriceType && !item.fav && serverItem.enabled && (serverItem.sellPermission && client.cache.permissions.get(serverItem.sellPermission) ? client.cache.permissions.get(serverItem.sellPermission).for(profile, member, interaction.channel, interaction, interaction.member).value : true)) {
                sell_btn.setStyle(ButtonStyle.Success)
                sell_btn.setDisabled(false)
            }
            if (serverItem && serverItem.enabled) {
                if (serverItem && (serverItem.shop.sellingPrice || serverItem.shop.cryptoSellingPrice) && serverItem.shop.sellingPriceType) {
                    amount = !item.amount.toString().split('.')[1] ? item.amount : item.amount.toString().split('.')[1].length == 1 ? +item.amount.toFixed(1) : +item.amount.toFixed(2)
                    amount = ` › (${amount.toLocaleString()})`
                    price = serverItem.shop.cryptoSellingPrice ? await fetch(`https://api.coinbase.com/v2/prices/${serverItem.shop.cryptoSellingPrice}/sell`).then(response => response.json().then(response => response?.data?.amount * serverItem.shop.cryptoSellingPriceMultiplier)) : serverItem.shop.sellingPrice
                    price = serverItem.shop.sellingDiscount ? (price + price * (profile.rp / 2000)) * item.amount : price*item.amount
                    price = ` › ${serverItem.shop.sellingPriceType == "currency" ? settings.displayCurrencyEmoji : client.cache.items.find(e => !e.temp && e.itemID == serverItem.shop.sellingPriceType)?.displayEmoji || ""}${price.toLocaleString()}`
                } else if (serverItem) {
                    price = ""
                    amount = ` › (${!item.amount.toString().split('.')[1] ? item.amount.toLocaleString() : item.amount.toString().split('.')[1].length == 1 ? (+item.amount.toFixed(1)).toLocaleString() : (+item.amount.toFixed(2)).toLocaleString()})`
                }
                let button
                if (settings.baitCurrency === serverItem.itemID) {
                    button = new ButtonBuilder().setCustomId(`cmd{fishing}usr{${interaction.user.id}}eph reply`).setEmoji(client.config.emojis.fishing).setLabel(`${client.language({ textId: `Рыбачить`, guildId: interaction.guildId, locale: interaction.locale })}`).setStyle(ButtonStyle.Secondary).setDisabled(!isYourMenu)
                } else
                if (settings.miningTool === serverItem.itemID) {
                    button = new ButtonBuilder().setCustomId(`cmd{mining}usr{${interaction.user.id}}eph reply`).setEmoji(client.config.emojis.mining).setLabel(`${client.language({ textId: `Копать`, guildId: interaction.guildId, locale: interaction.locale })}`).setStyle(ButtonStyle.Secondary).setDisabled(!isYourMenu)
                } else
                if (((settings.customRolePriceMinute && settings.customRoleTemporaryEnabled && settings.customRolePriceMinute.length === 1 && settings.customRolePriceMinute[0].id === serverItem.itemID) || (settings.customRolePrice && settings.customRolePrice.length === 1 && settings.customRolePrice[0].id === serverItem.itemID)) && settings.roles?.customRolePosition) {
                    button = new ButtonBuilder().setCustomId(`cmd{custom-role}eph reply ${serverItem.itemID}`).setEmoji(client.config.emojis.activities).setLabel(`${client.language({ textId: `Создать кастомную роль`, guildId: interaction.guildId, locale: interaction.locale })}`).setStyle(ButtonStyle.Secondary).setDisabled(!isYourMenu)
                } else
                if (serverItem.canUse) {
                    button = new ButtonBuilder().setCustomId(`cmd{inventory}item{${serverItem.itemID}}usr{${interaction.user.id}}use`).setEmoji(client.config.emojis.use).setLabel(`${client.language({ textId: `Использовать`, guildId: interaction.guildId, locale: interaction.locale })}`).setStyle(ButtonStyle.Secondary).setDisabled(!isYourMenu)
                } else if (serverItem.contains.filter(e => (e.type === RewardType.Item && client.cache.items.find(it => it.itemID === e.id && it.enabled && !it.temp)) || e.type !== RewardType.Item).length) {
                    button = new ButtonBuilder().setCustomId(`cmd{open}item{${serverItem.itemID}}usr{${interaction.user.id}}eph reply`).setEmoji(client.config.emojis.box).setLabel(`${client.language({ textId: `Открыть`, guildId: interaction.guildId, locale: interaction.locale })}`).setStyle(ButtonStyle.Secondary).setDisabled(!isYourMenu)
                } else if (serverItem.shop.sellingPrice && serverItem.shop.sellingPriceType) {
                    button = new ButtonBuilder().setCustomId(`cmd{inventory}item{${serverItem.itemID}}usr{${interaction.user.id}}sellItem`).setEmoji(client.config.emojis.dol).setLabel(`${client.language({ textId: `Продать`, guildId: interaction.guildId, locale: interaction.locale })}`).setStyle(ButtonStyle.Secondary).setDisabled(!isYourMenu)
                }
                if (button) {
                    container.addSectionComponents(new SectionBuilder().setButtonAccessory(button).addTextDisplayComponents(new TextDisplayBuilder().setContent([
                        `${item.fav ? client.config.emojis.XP : ""}${serverItem.displayEmoji}${serverItem.name}${amount}${price} › ${client.language({ textId: serverItem.rarity, guildId: interaction.guildId, locale: interaction.locale })}`,
                        serverItem.description.split("\n").map(e => `-# ${e}`).join("\n")
                    ].join("\n"))))    
                } else {
                    container.addTextDisplayComponents(new TextDisplayBuilder().setContent([
                        `${item.fav ? client.config.emojis.XP : ""}${serverItem.displayEmoji}${serverItem.name}${amount}${price} › ${client.language({ textId: serverItem.rarity, guildId: interaction.guildId, locale: interaction.locale })}`,
                        serverItem.description.split("\n").map(e => `-# ${e}`).join("\n")
                    ].join("\n")))
                }
                inventoryEmbed.addFields([{ name: `${item.fav ? client.config.emojis.XP : ""}${serverItem.displayEmoji}${serverItem.name}${amount}${price} › ${client.language({ textId: serverItem.rarity, guildId: interaction.guildId, locale: interaction.locale })}`, value: `-#${serverItem.description}` }])
            } else if (!serverItem) {
                profile.inventory = profile.inventory.filter(e = e.itemID !== item.itemID)
                await profile.save()
            }
        }))
        inventoryEmbed.setFooter({ text: `❓ ${client.language({ textId: `Чтобы использовать предмет введи команду: /use <item>`, guildId: interaction.guildId, locale: interaction.locale })}\n❓ ${client.language({ textId: `Чтобы продать предмет введи команду: /sell <item>`, guildId: interaction.guildId, locale: interaction.locale })}\n❓ ${client.language({ textId: `Чтобы добавить предмет в избранное введи команду: /fav <item>`, guildId: interaction.guildId, locale: interaction.locale })}\n❓ ${client.language({ textId: `Чтобы открыть предмет введи команду: /open [item]`, guildId: interaction.guildId, locale: interaction.locale })}` })
        const row = isYourMenu ? new ActionRowBuilder().addComponents([sell_btn, refresh_inventory_btn]) : new ActionRowBuilder().addComponents([refresh_inventory_btn])
        let menu_options = [
            { emoji: client.config.emojis.profile, label: `${client.language({ textId: "Профиль", guildId: interaction.guildId, locale: interaction.locale })}`, value: `usr{${interaction.user.id}}cmd{profile}mbr{${member.user.id}}`, description: `${client.language({ textId: "Ваш личный профиль", guildId: interaction.guildId, locale: interaction.locale })}` },
            { emoji: client.config.emojis.profile, label: `${client.language({ textId: `Статистика`, guildId: interaction.guildId, locale: interaction.locale })}`, value: `usr{${interaction.user.id}}cmd{stats}mbr{${member.user.id}}eph reply`, description: `${client.language({ textId: `Ваша статистика`, guildId: interaction.guildId, locale: interaction.locale })}` },
            { emoji: `${client.config.emojis.inventory}`, label: `${client.language({ textId: "Инвентарь", guildId: interaction.guildId, locale: interaction.locale })}`, value: `usr{${interaction.user.id}}cmd{inventory}lim{${itemLimitPerPage}}mbr{${member.user.id}}eph reply`, description: `${client.language({ textId: "Ваш инвентарь с предметами", guildId: interaction.guildId, locale: interaction.locale })}`, default: true },
            { emoji: `${client.config.emojis.roles}`, label: `${client.language({ textId: "Инвентарь ролей", guildId: interaction.guildId, locale: interaction.locale })}`, value: `usr{${interaction.user.id}}cmd{inventory-roles}lim{50}mbr{${member.user.id}}eph reply`, description: `${client.language({ textId: "Ваш инвентарь с ролями", guildId: interaction.guildId, locale: interaction.locale })}` },
            { emoji: client.config.emojis.invite, label: `${client.language({ textId: "Приглашения", guildId: interaction.guildId, locale: interaction.locale })}`, value: `usr{${interaction.user.id}}cmd{invites}lim{10}mbr{${member.user.id}}eph reply`, description: `${client.language({ textId: "Ваши приглашения", guildId: interaction.guildId, locale: interaction.locale })}` },
            { emoji: client.config.emojis.shop, label: `${settings.shopName ? settings.shopName.slice(0, 100) : client.language({ textId: `Магазин`, guildId: interaction.guildId, locale: interaction.locale }) }`, value: `usr{${interaction.user.id}}cmd{shop}lim{10}mbr{${member.user.id}}eph reply`, description: `${client.language({ textId: "Магазин сервера", guildId: interaction.guildId, locale: interaction.locale })}` },
            { emoji: client.config.emojis.achievements, label: `${client.language({ textId: "Достижения", guildId: interaction.guildId, locale: interaction.locale })}`, value: `usr{${interaction.user.id}}cmd{achievements}lim{10}mbr{${member.user.id}}eph reply`, description: `${client.language({ textId: "Ваши достижения", guildId: interaction.guildId, locale: interaction.locale })}`},
            { emoji: client.config.emojis.quests, label: `${client.language({ textId: "Квесты", guildId: interaction.guildId, locale: interaction.locale })}`, value: `usr{${interaction.user.id}}cmd{quests}mbr{${member.user.id}}eph reply`, description: `${client.language({ textId: "Просмотр квестов", guildId: interaction.guildId, locale: interaction.locale })}` },
        ]
        if (member.user.id !== interaction.user.id) {
            menu_options = [
                { emoji: client.config.emojis.profile, label: `${client.language({ textId: `Профиль`, guildId: interaction.guildId, locale: interaction.locale })}`, value: `usr{${interaction.user.id}}cmd{profile}mbr{${member.user.id}}`, description: `${client.language({ textId: `Личный профиль`, guildId: interaction.guildId, locale: interaction.locale })} ${member.displayName}` },
                { emoji: client.config.emojis.profile, label: `${client.language({ textId: `Статистика`, guildId: interaction.guildId, locale: interaction.locale })}`, value: `usr{${interaction.user.id}}cmd{stats}mbr{${member.user.id}}eph reply`, description: `${client.language({ textId: `Статистка`, guildId: interaction.guildId, locale: interaction.locale })} ${member.displayName}` },
                { emoji: client.config.emojis.inventory, label: `${client.language({ textId: `Инвентарь`, guildId: interaction.guildId, locale: interaction.locale })}`, value: `usr{${interaction.user.id}}cmd{inventory}lim{${itemLimitPerPage}}mbr{${member.user.id}}`, description: `${client.language({ textId: `Инвентарь с предметами`, guildId: interaction.guildId, locale: interaction.locale })} ${member.displayName}`, default: true },
                { emoji: client.config.emojis.roles, label: `${client.language({ textId: `Инвентарь ролей`, guildId: interaction.guildId, locale: interaction.locale })}`, value: `usr{${interaction.user.id}}cmd{inventory-roles}lim{50}mbr{${member.user.id}}eph reply`, description: `${client.language({ textId: `Инвентарь с ролями`, guildId: interaction.guildId, locale: interaction.locale })} ${member.displayName}` },
                { emoji: client.config.emojis.invite, label: `${client.language({ textId: `Приглашения`, guildId: interaction.guildId, locale: interaction.locale })}`, value: `usr{${interaction.user.id}}cmd{invites}lim{10}mbr{${member.user.id}}eph reply`, description: `${client.language({ textId: `Приглашения`, guildId: interaction.guildId, locale: interaction.locale })} ${member.displayName}` },
                { emoji: client.config.emojis.achievements, label: `${client.language({ textId: `Достижения`, guildId: interaction.guildId, locale: interaction.locale })}`, value: `usr{${interaction.user.id}}cmd{achievements}lim{10}mbr{${member.user.id}}eph reply`, description: `${client.language({ textId: `Достижения`, guildId: interaction.guildId, locale: interaction.locale })} ${member.displayName}` },
                { emoji: client.config.emojis.quests, label: `${client.language({ textId: `Квесты`, guildId: interaction.guildId, locale: interaction.locale })}`, value: `usr{${interaction.user.id}}cmd{quests}mbr{${member.user.id}}eph reply`, description: `${client.language({ textId: `Просмотр квестов`, guildId: interaction.guildId, locale: interaction.locale })} ${member.displayName}` },
            ]
        }
        const nav_row = new ActionRowBuilder().addComponents([new StringSelectMenuBuilder().setCustomId(`usr{${interaction.user.id}} menu`).addOptions(menu_options)])
        const components = []
        if (!flags.includes("Ephemeral")) {
            components.push(nav_row)
        } 
        components.push(row)
        const close_btn = new ButtonBuilder()
            .setStyle(ButtonStyle.Secondary)
            .setEmoji(client.config.emojis.close)
            .setCustomId(`usr{${interaction.user.id}}mbr{${member.user.id}} close`)
        row.addComponents([close_btn])
        if (!flags.includes("Ephemeral")) {
            array_btn.push(close_btn)
        }
        if (array_btn.length) {
            container.addActionRowComponents(new ActionRowBuilder().addComponents(array_btn))
            components.push(new ActionRowBuilder().addComponents(array_btn))
        }
        if (interaction.customId?.includes("reply") || interaction.values?.[0].includes("reply") || interaction.isChatInputCommand()) {
            return interaction.reply({ components: [container], flags })
        }
        if (interaction.deferred || interaction.replied) return interaction.editReply({ components: [container] })
        else return interaction.update({ components: [container] })
    }
}
function hex2rgb(color) {
    const r = color.match(/^#(([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2}))$/i)
    if (!r) return [0, 0, 0]
    return [parseInt(r[2], 16), 
            parseInt(r[3], 16), 
            parseInt(r[4], 16)]
}
function booster(config, number) {
    return `${config.emojis.XP100Booster}${number * 100}%`
}
function transformSecs(client, duration, guildId, locale) {
    let ms = parseInt((duration % 1000) / 100),
        secs = Math.floor((duration / 1000) % 60),
        mins = Math.floor((duration / (1000 * 60)) % 60),
        hrs = Math.floor((duration / (1000 * 60 * 60)) % 24)
    days = Math.floor((duration / (1000 * 60 * 60 * 24)) % 30)
    if (days) return `${days} ${client.language({ textId: "дн", guildId: guildId, locale: locale })}. ${hrs} ${client.language({ textId: "HOURS_SMALL", guildId: guildId, locale: locale })}. ${mins} ${client.language({ textId: "мин", guildId: guildId, locale: locale })}. ${secs} ${client.language({ textId: "сек", guildId: guildId, locale: locale })}.`
    if (!days) return `${hrs} ${client.language({ textId: "HOURS_SMALL", guildId: guildId, locale: locale })}. ${mins} ${client.language({ textId: "мин", guildId: guildId, locale: locale })}. ${secs} ${client.language({ textId: "сек", guildId: guildId, locale: locale })}.`
    if (!hrs) return `${mins} ${client.language({ textId: "мин", guildId: guildId, locale: locale })}. ${secs} ${client.language({ textId: "сек", guildId: guildId, locale: locale })}.`
    if (!mins) return `${secs} ${client.language({ textId: "сек", guildId: guildId, locale: locale })}.`
    if (!secs) return `${ms} ${client.language({ textId: "мс", guildId: guildId, locale: locale })}.`
}