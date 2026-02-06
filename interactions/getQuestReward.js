const { EmbedBuilder } = require("discord.js")
const { AchievementType, RewardType } = require("../enums")
const guestRegexp = /quest{(.*?)}/
module.exports = {
    name: `getQuestReward`,
    run: async (client, interaction) => {
        await interaction.deferReply({ flags: ["Ephemeral"] })
    	const settings = client.cache.settings.get(interaction.guildId)
        const questID = guestRegexp.exec(interaction.customId)?.[1]
        const profile = await client.functions.fetchProfile(client, interaction.user.id, interaction.guildId)
        if (!questID) {
            let index = 0
            const quests = client.cache.quests.filter(quest => quest.guildID === interaction.guildId && quest.isEnabled)
            if (profile.quests) {
                for (let userQuest of profile.quests.filter(userQuest => {
                    const quest = quests.get(userQuest.questID)
                    if (!quest) return undefined
                    return (userQuest && userQuest.targets?.every(element => element.finished === true) && !userQuest.finished && !quest.community) || (userQuest && quest.community && !userQuest.finished && quest.targets.every(element => element.finished === true))
                }).filter(Boolean)) {
                    index++
                    const quest = quests.get(userQuest.questID)
                    const rewards = []
                    for (const element of quest.rewards) {
                        if (element.type === RewardType.Currency) {
                            rewards.push(`${settings.displayCurrencyEmoji}**${settings.currencyName}** (${element.amount})`)
                            await profile.addCurrency({ amount: element.amount })
                        } else if (element.type === RewardType.Experience) {
                            rewards.push(`${client.config.emojis.XP}**${client.language({ textId: "Опыт", guildId: interaction.guildId, locale: interaction.locale })}** (${element.amount})`)
                            await profile.addXp({ amount: element.amount })
                        } else if (element.type === RewardType.Reputation) {
                            rewards.push(`${client.config.emojis.RP}**${client.language({ textId: "Репутация", guildId: interaction.guildId, locale: interaction.locale })}** (${element.amount})`)
                            await profile.addRp({ amount: element.amount })
                        } else if (element.type === RewardType.Item) {
                            const rewardItem = client.cache.items.find(i => i.itemID === element.id && !i.temp && i.enabled)
                            if (rewardItem) {
                                rewards.push(`${rewardItem.displayEmoji}**${rewardItem.name}** (${element.amount})`)
                                await profile.addItem({ itemID: element.id, amount: element.amount })
                            }
                        } else if (element.type === RewardType.Role) {
                            rewards.push(`<@&${element.id}>${element.ms ? ` [${client.functions.transformSecs(client, element.ms, interaction.guildId, interaction.locale)}]` : ``} (${element.amount})`)
                            profile.addRole({ id: element.id, amount: element.amount, ms: element.ms })
                        }
                    }
                    userQuest = profile.quests?.find(e => { return e.questID === quest.questID })
                    userQuest.finished = true
                    userQuest.finishedDate = new Date()
                    profile.doneQuests += 1
                    await profile.addQuestProgression({ type: "quests", amount: 1, object: quest.questID })
                    const achievements = client.cache.achievements.filter(e => e.guildID === interaction.guildId && e.type === AchievementType.Quests && e.enabled)
                    await Promise.all(achievements.map(async achievement => {
                        if (!profile.achievements?.some(ach => ach.achievmentID === achievement.id) && profile.doneQuests >= achievement.amount) {
                            await profile.addAchievement({ achievement })
                        }
                    }))
                    await profile.save()
                    const rewardEmbed = new EmbedBuilder()
                        .setTitle(`${client.language({ textId: "Квест", guildId: interaction.guildId, locale: interaction.locale })} ${quest.displayEmoji}${quest.name} ${client.language({ textId: "выполнен", guildId: interaction.guildId, locale: interaction.locale })}`)
                        .setThumbnail(quest.image || null)
                        .setColor(quest.hex || null)
                        .setDescription(`${quest.description}${rewards.length ? `\n${client.language({ textId: "Награда", guildId: interaction.guildId, locale: interaction.locale })}:\n${rewards.join("\n")}` : ``}`)
                    interaction.followUp({ embeds: [rewardEmbed], flags: ["Ephemeral"] })
                }
            }
            if (index === 0) return interaction.editReply({ content: `${client.config.emojis.NO} ${client.language({ textId: `У тебя нет завершённых квестов`, guildId: interaction.guildId, locale: interaction.locale })}` })
            else return
        }
    	const quest = client.cache.quests.find(quest => quest.guildID === interaction.guildId && quest.questID === questID && quest.isEnabled)
        if (!quest) return interaction.editReply({ content: `${client.config.emojis.NO}**${client.language({ textId: `Такого квеста не существует`, guildId: interaction.guildId, locale: interaction.locale })}.**` })
        if (!quest.enable) return interaction.editReply({ content: `${client.config.emojis.NO}**${client.language({ textId: `Этот квест временно выключен`, guildId: interaction.guildId, locale: interaction.locale })}.**` })
        const userQuest = profile.quests?.find(e => { return e.questID === quest.questID })
        if (!userQuest) return interaction.editReply({ content: `${client.config.emojis.NO}**${client.language({ textId: `Такой квест не найден в твоём профиле`, guildId: interaction.guildId, locale: interaction.locale })}.**` })
        if (userQuest.finished) return interaction.editReply({ content: `${client.config.emojis.NO}**${client.language({ textId: `Ты уже получил награду за этот квест`, guildId: interaction.guildId, locale: interaction.locale })}.**` })
        //ПРОВЕРКА НА ВЫПОЛНЕНИЕ
        if (quest.community) {
            if (!quest.targets.every(element => element.finished === true && !userQuest.finished)) {
                let targetIndex = 0
                const targetArray = []
                for (const element of quest.targets) {
                    let emoji = ``
                    if (element.finished) emoji = client.config.emojis.YES
                    else emoji = client.config.emojis.NO
                    const description = quest.getDescription(element, interaction.locale)
                    targetArray.push([
                        `> ${emoji}${description}`
                    ])
                    targetIndex++ 
                }
                return interaction.editReply({ content: `${client.config.emojis.NO}**${client.language({ textId: `Сообщество не выполнило задачи этого квеста`, guildId: interaction.guildId, locale: interaction.locale })}:**\n${targetArray.join("\n")}` })
            }
        } else {
            if (!userQuest.targets.every(element => element.finished === true)) {
                let targetIndex = 0
                const targetArray = []
                for (const element of quest.targets) {
                    let emoji = ``
                    if (quest.community) {
                        if (element.finished) emoji = client.config.emojis.YES
                        else emoji = client.config.emojis.NO
                    } else {
                        if (userQuest.targets[targetIndex].finished) emoji = client.config.emojis.YES
                        else emoji = client.config.emojis.NO    
                    }
                    let amount = ``
                    if (element.amount) amount = quest.community ? `` : `(**${userQuest.targets[targetIndex].reached.toFixed()}**/**${element.amount}** **${Math.floor(userQuest.targets[targetIndex].reached/element.amount*100)}%**)`
                    const description = quest.getDescription(element, interaction.locale)
                    targetArray.push([
                        `> ${emoji}${description} ${amount}`
                    ])
                    targetIndex++ 
                }
                return interaction.editReply({ content: `${client.config.emojis.NO}**${client.language({ textId: `Ты не выполнил задачи этого квеста`, guildId: interaction.guildId, locale: interaction.locale })}:**\n${targetArray.join("\n")}` })
            }    
        }
        if (quest.donePermission && client.cache.permissions.some(e => e.id === quest.donePermission)) {
            const permission = client.cache.permissions.find(e => e.id === quest.donePermission)
            const isPassing = permission.for(profile, interaction.member, interaction.channel, interaction)
            if (isPassing.value === false) {
                return interaction.reply({ embeds: [new EmbedBuilder().setColor(3093046).setTitle(`${client.language({ textId: `Для этого взаимодействия требуется:`, guildId: interaction.guildId, locale: interaction.locale })}`).setDescription(isPassing.reasons.join("\n"))], flags: ["Ephemeral"] })
            }
        }
        userQuest.finished = true
        userQuest.finishedDate = new Date()
        profile.doneQuests += 1
        const rewards = []
        for (const reward of quest.rewards) {
            if (reward.type === RewardType.Currency) {
                await profile.addCurrency({ amount: reward.amount })
                rewards.push(`${settings.displayCurrencyEmoji}**${settings.currencyName}** (${reward.amount})`)
            }
            if (reward.type === RewardType.Experience) {
                await profile.addXp({ amount: rewards.amount })
                rewards.push(`${client.config.emojis.XP}**${client.language({ textId: `Опыт`, guildId: interaction.guildId, locale: interaction.locale })}** (${reward.amount})`)
            }
            if (reward.type === RewardType.Reputation) {
                await profile.addRp({ amount: reward.amount })
                rewards.push(`${client.config.emojis.RP}**${client.language({ textId: `Репутация`, guildId: interaction.guildId, locale: interaction.locale })}** (${reward.amount})`)
            }
            if (reward.type === RewardType.Item) {
                const rewardItem = client.cache.items.find(i => i.itemID === reward.id && !i.temp && i.enabled)
                if (rewardItem) {
                    await profile.addItem({ itemID: rewardItem.itemID, amount: reward.amount })
                    rewards.push(`${rewardItem.displayEmoji}**${rewardItem.name}** (${reward.amount})`)
                }
            }
            if (reward.type === RewardType.Role) {
                profile.addRole({ id: reward.id, amount: reward.amount, ms: reward.ms })
                rewards.push(`<@&${reward.id}>${reward.ms ? ` [${client.functions.transformSecs(client, reward.ms, interaction.guildId, interaction.locale)}]` : ``} (${reward.amount})`)
            }
        }
        await profile.addQuestProgression({ type: "quests", amount: 1, object: quest.questID })
        const achievements = client.cache.achievements.filter(e => e.guildID === interaction.guildId && e.type === AchievementType.Quests && e.enabled)
        await Promise.all(achievements.map(async achievement => {
            if (!profile.achievements?.some(ach => ach.achievmentID === achievement.id) && profile.doneQuests >= achievement.amount) {
                await profile.addAchievement({ achievement })
            }
        }))
        await profile.save()
        let targetIndex = 0
        const targetArray = []
        for (const element of quest.targets) {
            let amount = ``
            if (element.amount) amount = quest.community ? `` : `(**${userQuest.targets[targetIndex].reached.toFixed()}**/**${element.amount}** **${Math.floor(userQuest.targets[targetIndex].reached/element.amount*100)}%**)`
            const description = quest.getDescription(element, interaction.locale)
            targetArray.push([
                `${client.config.emojis.YES}${description} ${amount}`
            ])
            targetIndex++ 
        }
        return interaction.editReply({ 
            embeds: [
                new EmbedBuilder()
                    .setTitle(`${client.language({ textId: `Ты выполнил квест`, guildId: interaction.guildId, locale: interaction.locale })} ${await client.functions.getEmoji(client, quest.emoji)}${quest.name}`)
                    .setFields([
                        {
                            name: `${client.language({ textId: `Задачи`, guildId: interaction.guildId, locale: interaction.locale })}`,
                            value: `${targetArray.join("\n")}`
                        },
                        {
                            name: `${client.language({ textId: `Награда`, guildId: interaction.guildId, locale: interaction.locale })}`,
                            value: `${rewards.length ? rewards.join("\n") : `${client.language({ textId: `У этого квеста нет наград`, guildId: interaction.guildId, locale: interaction.locale })}`}`
                        }
                    ])
                    .setThumbnail(quest.image || null)
                    .setColor(quest.hex || null)
            ] 
        })
    }
}