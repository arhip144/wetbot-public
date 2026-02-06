const { AchievementType } = require("../enums/index")
const node_emoji = require("node-emoji");
function getAchievementDescription(achievement, profile, globalProfile, settings, interaction, member) {
    switch(achievement.type) {
        case AchievementType.Message:
            return `${achievement.client.language({ textId: `Написать`, guildId: interaction.guildId, locale: interaction.locale })} ${achievement.amount?.toLocaleString() || `XX`} ${achievement.client.language({ textId: `сообщений в чате`, guildId: interaction.guildId, locale: interaction.locale })} ${!profile ? "" : !profile.achievements?.some(e => e.achievmentID == achievement.id) ? `(**${profile.messages.toLocaleString()}**/**${achievement.amount.toLocaleString()}** **${Math.floor(profile.messages / achievement.amount * 100)}%**)` : `(**${achievement.amount.toLocaleString()}**/**${achievement.amount.toLocaleString()}** **100%**)`}`
        case AchievementType.Voice:
            return `${achievement.client.language({ textId: `Провести`, guildId: interaction.guildId, locale: interaction.locale })} ${achievement.amount?.toLocaleString() || `XX`} ${achievement.client.language({ textId: `часов в голосовом чате`, guildId: interaction.guildId, locale: interaction.locale })} ${!profile ? "" : !profile.achievements?.some(e => e.achievmentID == achievement.id) ? `(**${profile.hours.toLocaleString()}**/**${achievement.amount.toLocaleString()}** **${Math.floor(profile.hours / achievement.amount * 100)}%**)` : `(**${achievement.amount.toLocaleString()}**/**${achievement.amount.toLocaleString()}** **100%**)`}`
        case AchievementType.Like:
            return `${achievement.client.language({ textId: `Получить`, guildId: interaction.guildId, locale: interaction.locale })} ${achievement.amount?.toLocaleString() || `XX`} ${achievement.client.language({ textId: `лайков`, guildId: interaction.guildId, locale: interaction.locale })} ${!profile ? "" : !profile.achievements?.some(e => e.achievmentID == achievement.id) ? `(**${profile.likes.toLocaleString()}**/**${achievement.amount.toLocaleString()}** **${Math.floor(profile.likes / achievement.amount * 100)}%**)` : `(**${achievement.amount.toLocaleString()}**/**${achievement.amount.toLocaleString()}** **100%**)`}`
        case AchievementType.Invite:
            return `${achievement.client.language({ textId: `Пригласить`, guildId: interaction.guildId, locale: interaction.locale })} ${achievement.amount?.toLocaleString() || `XX`} ${achievement.client.language({ textId: `чел. на сервер`, guildId: interaction.guildId, locale: interaction.locale })} ${!profile ? "" : !profile.achievements?.some(e => e.achievmentID == achievement.id) ? `(**${profile.invites.toLocaleString()}**/**${achievement.amount.toLocaleString()}** **${Math.floor(profile.invites / achievement.amount * 100)}%**)` : `(**${achievement.amount.toLocaleString()}**/**${achievement.amount.toLocaleString()}** **100%**)`}`
        case AchievementType.Bump:
            return `${achievement.client.language({ textId: `Бампнуть сервер`, guildId: interaction.guildId, locale: interaction.locale })} ${achievement.amount?.toLocaleString() || `XX`} ${achievement.client.language({ textId: `раз(а)`, guildId: interaction.guildId, locale: interaction.locale })} ${!profile ? "" : !profile.achievements?.some(e => e.achievmentID == achievement.id) ? `(**${profile.bumps.toLocaleString()}**/**${achievement.amount.toLocaleString()}** **${Math.floor(profile.bumps / achievement.amount * 100)}%**)` : `(**${achievement.amount.toLocaleString()}**/**${achievement.amount.toLocaleString()}** **100%**)`}`
        case AchievementType.Currency:
            return `${achievement.client.language({ textId: `Накопить`, guildId: interaction.guildId, locale: interaction.locale })} ${achievement.amount?.toLocaleString() || `XX`} ${settings.currencyName} ${!profile ? "" : !profile.achievements?.some(e => e.achievmentID == achievement.id) ? `(**${profile.currency.toLocaleString()}**/**${achievement.amount.toLocaleString()}** **${Math.floor(profile.currency / achievement.amount * 100)}%**)` : `(**${achievement.amount.toLocaleString()}**/**${achievement.amount.toLocaleString()}** **100%**)`}`
        case AchievementType.CurrencySpent:
            return `${achievement.client.language({ textId: `Потратить`, guildId: interaction.guildId, locale: interaction.locale })} ${achievement.amount?.toLocaleString() || `XX`} ${settings.currencyName} ${!profile ? "" : !profile.achievements?.some(e => e.achievmentID == achievement.id) ? `(**${profile.currencySpent.toLocaleString()}**/**${achievement.amount.toLocaleString()}** **${Math.floor(profile.currencySpent / achievement.amount * 100)}%**)` : `(**${achievement.amount.toLocaleString()}**/**${achievement.amount.toLocaleString()}** **100%**)`}`
        case AchievementType.Fishing:
            return `${achievement.client.language({ textId: `Порыбачить`, guildId: interaction.guildId, locale: interaction.locale })} ${achievement.amount?.toLocaleString() || `XX`} ${achievement.client.language({ textId: `раз(а)`, guildId: interaction.guildId, locale: interaction.locale })} ${!profile ? "" : !profile.achievements?.some(e => e.achievmentID == achievement.id) ? `(**${profile.fishing.toLocaleString()}**/**${achievement.amount.toLocaleString()}** **${Math.floor(profile.fishing / achievement.amount * 100)}%**)` : `(**${achievement.amount.toLocaleString()}**/**${achievement.amount.toLocaleString()}** **100%**)`}`
        case AchievementType.Mining:
            return `${achievement.client.language({ textId: `Выкопать`, guildId: interaction.guildId, locale: interaction.locale })} ${achievement.amount?.toLocaleString() || `XX`} ${achievement.client.language({ textId: `раз(а)`, guildId: interaction.guildId, locale: interaction.locale })} ${!profile ? "" : !profile.achievements?.some(e => e.achievmentID == achievement.id) ? `(**${profile.mining.toLocaleString()}**/**${achievement.amount.toLocaleString()}** **${Math.floor(profile.mining / achievement.amount * 100)}%**)` : `(**${achievement.amount.toLocaleString()}**/**${achievement.amount.toLocaleString()}** **100%**)`}`
        case AchievementType.Item: {
            const targetItems = []
            if (achievement.items) {
                for (const itemID of achievement.items) {
                    const item = achievement.client.cache.items.get(itemID)
                    const isDefaultEmoji = item ? node_emoji.hasEmoji(item.emoji) : false
                    if (!isDefaultEmoji) targetItems.push(`${item ? `${item.name}` : itemID }`) 
                    else {
                        targetItems.push(`${item ? `${item.displayEmoji}${item.name}` : itemID }`)    
                    }
                }
            }
            return `${achievement.client.language({ textId: `Найти предмет`, guildId: interaction.guildId, locale: interaction.locale })} ${achievement.items?.length ? targetItems.join(` ${achievement.client.language({ textId: `или`, guildId: interaction.guildId, locale: interaction.locale })} `) : ``}`
        }
        case AchievementType.Craft: {
            const targetItems = []
            if (achievement.items) {
                for (const itemID of achievement.items) {
                    const item = achievement.client.cache.items.get(itemID)
                    const isDefaultEmoji = node_emoji.hasEmoji(item?.emoji)
                    if (!isDefaultEmoji) targetItems.push(`${item ? `${item.name}` : itemID }`) 
                    else {
                        targetItems.push(`${item ? `${item.displayEmoji}${item.name}` : itemID }`)    
                    }
                }
            }
            return `${achievement.client.language({ textId: `Скрафтить предмет`, guildId: interaction.guildId, locale: interaction.locale })} ${achievement.items?.length ? targetItems.join(` ${achievement.client.language({ textId: `или`, guildId: interaction.guildId, locale: interaction.locale })} `) : ``}`
        }
        case AchievementType.Wormhole:
            return `${achievement.client.language({ textId: `Дотронуться до червоточины`, guildId: interaction.guildId, locale: interaction.locale })} ${achievement.amount?.toLocaleString() || `XX`} ${achievement.client.language({ textId: `раз(а)`, guildId: interaction.guildId, locale: interaction.locale })} ${!profile ? "" : !profile.achievements?.some(e => e.achievmentID == achievement.id) ? `(**${profile.wormholeTouched.toLocaleString()}**/**${achievement.amount.toLocaleString()}** **${Math.floor(profile.wormholeTouched / achievement.amount * 100)}%**)` : `(**${achievement.amount.toLocaleString()}**/**${achievement.amount.toLocaleString()}** **100%**)`}`
        case AchievementType.Daily:
            return `${achievement.client.language({ textId: `Получать ежедневную награду`, guildId: interaction.guildId, locale: interaction.locale })} ${achievement.amount?.toLocaleString() || `XX`} ${achievement.client.language({ textId: `дн. подряд`, guildId: interaction.guildId, locale: interaction.locale })} ${!profile ? "" : !profile.achievements?.some(e => e.achievmentID == achievement.id) ? `(**${profile.maxDaily.toLocaleString()}**/**${achievement.amount.toLocaleString()}** **${Math.floor(profile.maxDaily / achievement.amount * 100)}%**)` : `(**${achievement.amount.toLocaleString()}**/**${achievement.amount.toLocaleString()}** **100%**)`}`
        case AchievementType.Rp:
            return `${achievement.client.language({ textId: `Достичь репутации`, guildId: interaction.guildId, locale: interaction.locale })} ${achievement.amount?.toLocaleString() || `XX`} ${!profile ? "" : !profile.achievements?.some(e => e.achievmentID == achievement.id) ? `(**${profile.rp.toLocaleString()}**/**${achievement.amount.toLocaleString()}** **${Math.floor(profile.rp / achievement.amount * 100)}%**)` : `(**${achievement.amount.toLocaleString()}**/**${achievement.amount.toLocaleString()}** **100%**)`}`
        case AchievementType.Quests:
            return `${achievement.client.language({ textId: `Выполнить квесты`, guildId: interaction.guildId, locale: interaction.locale })} ${achievement.amount?.toLocaleString() || `XX`} ${achievement.client.language({ textId: `раз(а)`, guildId: interaction.guildId, locale: interaction.locale })} ${!profile ? "" : !profile.achievements?.some(e => e.achievmentID == achievement.id) ? `(**${profile.doneQuests.toLocaleString()}**/**${achievement.amount.toLocaleString()}** **${Math.floor(profile.doneQuests / achievement.amount * 100)}%**)` : `(**${achievement.amount.toLocaleString()}**/**${achievement.amount.toLocaleString()}** **100%**)`}`
        case AchievementType.Items:
            return `${achievement.client.language({ textId: `Найти все предметы`, guildId: interaction.guildId, locale: interaction.locale })}`
        case AchievementType.Giveaway:
            return `${achievement.client.language({ textId: `Создать раздачу`, guildId: interaction.guildId, locale: interaction.locale })} ${achievement.amount?.toLocaleString() || `XX`} ${achievement.client.language({ textId: `раз(а)`, guildId: interaction.guildId, locale: interaction.locale })} ${!profile ? "" : !profile.achievements?.some(e => e.achievmentID == achievement.id) ? `(**${profile.giveawaysCreated.toLocaleString()}**/**${achievement.amount.toLocaleString()}** **${Math.floor(profile.giveawaysCreated / achievement.amount * 100)}%**)` : `(**${achievement.amount.toLocaleString()}**/**${achievement.amount.toLocaleString()}** **100%**)`}`
        case AchievementType.Marketplace:
            return `${achievement.client.language({ textId: `Продать`, guildId: interaction.guildId, locale: interaction.locale })} ${achievement.amount?.toLocaleString() || `XX`} ${achievement.client.language({ textId: `предметов на маркете`, guildId: interaction.guildId, locale: interaction.locale })} ${!profile ? "" : !profile.achievements?.some(e => e.achievmentID == achievement.id) ? `(**${profile.itemsSoldOnMarketPlace.toLocaleString()}**/**${achievement.amount.toLocaleString()}** **${Math.floor(profile.itemsSoldOnMarketPlace / achievement.amount * 100)}%**)` : `(**${achievement.amount.toLocaleString()}**/**${achievement.amount.toLocaleString()}** **100%**)`}`
        case AchievementType.DailyHours:
            return `${achievement.client.language({ textId: `Провести`, guildId: interaction.guildId, locale: interaction.locale })} ${achievement.amount?.toLocaleString() || `XX`} ${achievement.client.language({ textId: `ч. подряд в голосовом канале`, guildId: interaction.guildId, locale: interaction.locale })} ${!profile ? "" : !profile.achievements?.some(e => e.achievmentID == achievement.id) ? `(**${profile.hoursSession.toLocaleString()}**/**${achievement.amount.toLocaleString()}** **${Math.floor(profile.hoursSession / achievement.amount * 100)}%**)` : `(**${achievement.amount.toLocaleString()}**/**${achievement.amount.toLocaleString()}** **100%**)`}`
        case AchievementType.ItemsOpened:
            return `${achievement.client.language({ textId: `Открыть`, guildId: interaction.guildId, locale: interaction.locale })} ${achievement.amount?.toLocaleString() || `XX`} ${achievement.client.language({ textId: `предметов`, guildId: interaction.guildId, locale: interaction.locale })} ${!profile ? "" : !profile.achievements?.some(e => e.achievmentID == achievement.id) ? `(**${profile.itemsOpened.toLocaleString()}**/**${achievement.amount.toLocaleString()}** **${Math.floor(profile.itemsOpened / achievement.amount * 100)}%**)` : `(**${achievement.amount.toLocaleString()}**/**${achievement.amount.toLocaleString()}** **100%**)`}`
        case AchievementType.WormholesSpawned:
            return `${achievement.client.language({ textId: `Заспавнить червоточину`, guildId: interaction.guildId, locale: interaction.locale })} ${achievement.amount?.toLocaleString() || `XX`} ${achievement.client.language({ textId: `раз(а)`, guildId: interaction.guildId, locale: interaction.locale })} ${!profile ? "" : !profile.achievements?.some(e => e.achievmentID == achievement.id) ? `(**${profile.wormholesSpawned.toLocaleString()}**/**${achievement.amount.toLocaleString()}** **${Math.floor(profile.wormholesSpawned / achievement.amount * 100)}%**)` : `(**${achievement.amount.toLocaleString()}**/**${achievement.amount.toLocaleString()}** **100%**)`}`
        case AchievementType.ItemsReceived:
            return `${achievement.client.language({ textId: `Получить`, guildId: interaction.guildId, locale: interaction.locale })} ${achievement.amount?.toLocaleString() || `XX`} ${achievement.client.language({ textId: `предметов`, guildId: interaction.guildId, locale: interaction.locale })} ${!profile ? "" : !profile.achievements?.some(e => e.achievmentID == achievement.id) ? `(**${profile.itemsReceived.toLocaleString()}**/**${achievement.amount.toLocaleString()}** **${Math.floor(profile.itemsReceived / achievement.amount * 100)}%**)` : `(**${achievement.amount.toLocaleString()}**/**${achievement.amount.toLocaleString()}** **100%**)`}`
        case AchievementType.ItemsCrafted:
            return `${achievement.client.language({ textId: `Скрафтить`, guildId: interaction.guildId, locale: interaction.locale })} ${achievement.amount?.toLocaleString() || `XX`} ${achievement.client.language({ textId: `предметов`, guildId: interaction.guildId, locale: interaction.locale })} ${!profile ? "" : !profile.achievements?.some(e => e.achievmentID == achievement.id) ? `(**${profile.itemsCrafted.toLocaleString()}**/**${achievement.amount.toLocaleString()}** **${Math.floor(profile.itemsCrafted / achievement.amount * 100)}%**)` : `(**${achievement.amount.toLocaleString()}**/**${achievement.amount.toLocaleString()}** **100%**)`}`
        case AchievementType.ItemsUsed:
            return `${achievement.client.language({ textId: `Использовать`, guildId: interaction.guildId, locale: interaction.locale })} ${achievement.amount?.toLocaleString() || `XX`} ${achievement.client.language({ textId: `предметов`, guildId: interaction.guildId, locale: interaction.locale })} ${!profile ? "" : !profile.achievements?.some(e => e.achievmentID == achievement.id) ? `(**${profile.itemsUsed.toLocaleString()}**/**${achievement.amount.toLocaleString()}** **${Math.floor(profile.itemsUsed / achievement.amount * 100)}%**)` : `(**${achievement.amount.toLocaleString()}**/**${achievement.amount.toLocaleString()}** **100%**)`}`
        case AchievementType.ItemsBoughtInShop:
            return `${achievement.client.language({ textId: `Купить`, guildId: interaction.guildId, locale: interaction.locale })} ${achievement.amount?.toLocaleString() || `XX`} ${achievement.client.language({ textId: `предметов в магазине`, guildId: interaction.guildId, locale: interaction.locale })} ${!profile ? "" : !profile.achievements?.some(e => e.achievmentID == achievement.id) ? `(**${profile.itemsBoughtInShop.toLocaleString()}**/**${achievement.amount.toLocaleString()}** **${Math.floor(profile.itemsBoughtInShop / achievement.amount * 100)}%**)` : `(**${achievement.amount.toLocaleString()}**/**${achievement.amount.toLocaleString()}** **100%**)`}`
        case AchievementType.ItemsBoughtOnMarket:
            return `${achievement.client.language({ textId: `Купить`, guildId: interaction.guildId, locale: interaction.locale })} ${achievement.amount?.toLocaleString() || `XX`} ${achievement.client.language({ textId: `предметов на маркете`, guildId: interaction.guildId, locale: interaction.locale })} ${!profile ? "" : !profile.achievements?.some(e => e.achievmentID == achievement.id) ? `(**${profile.itemsBoughtOnMarket.toLocaleString()}**/**${achievement.amount.toLocaleString()}** **${Math.floor(profile.itemsBoughtOnMarket / achievement.amount * 100)}%**)` : `(**${achievement.amount.toLocaleString()}**/**${achievement.amount.toLocaleString()}** **100%**)`}`
        case AchievementType.ItemsSold:
            return `${achievement.client.language({ textId: `Продать`, guildId: interaction.guildId, locale: interaction.locale })} ${achievement.amount?.toLocaleString() || `XX`} ${achievement.client.language({ textId: `предметов`, guildId: interaction.guildId, locale: interaction.locale })} ${!profile ? "" : !profile.achievements?.some(e => e.achievmentID == achievement.id) ? `(**${profile.itemsSold.toLocaleString()}**/**${achievement.amount.toLocaleString()}** **${Math.floor(profile.itemsSold / achievement.amount * 100)}%**)` : `(**${achievement.amount.toLocaleString()}**/**${achievement.amount.toLocaleString()}** **100%**)`}`
        case AchievementType.Role: {
            const targetRoles = []
            if (achievement.roles) {
                for (const roleID of achievement.roles) {
                    targetRoles.push(`<@&${roleID}>`)
                }
            }
            return `${achievement.client.language({ textId: `Получить роль`, guildId: interaction.guildId, locale: interaction.locale })} ${achievement.roles?.length ? targetRoles.join(` ${achievement.client.language({ textId: `или`, guildId: interaction.guildId, locale: interaction.locale })} `) : ``}`
        }
        case AchievementType.Level:
            return `${achievement.client.language({ textId: `Достигнуть`, guildId: interaction.guildId, locale: interaction.locale })} ${achievement.amount?.toLocaleString() || `XX`} ${achievement.client.language({ textId: `уровня`, guildId: interaction.guildId, locale: interaction.locale })} ${!profile ? "" : !profile.achievements?.some(e => e.achievmentID == achievement.id) ? `(**${profile.level.toLocaleString()}**/**${achievement.amount.toLocaleString()}** **${Math.floor(profile.level / achievement.amount * 100)}%**)` : `(**${achievement.amount.toLocaleString()}**/**${achievement.amount.toLocaleString()}** **100%**)`}`
        case AchievementType.SeasonLevel:
            return `${achievement.client.language({ textId: `Достигнуть`, guildId: interaction.guildId, locale: interaction.locale })} ${achievement.amount?.toLocaleString() || `XX`} ${achievement.client.language({ textId: `сезонного уровня`, guildId: interaction.guildId, locale: interaction.locale })} ${!profile ? "" : !profile.achievements?.some(e => e.achievmentID == achievement.id) ? `(**${profile.seasonLevel.toLocaleString()}**/**${achievement.amount.toLocaleString()}** **${Math.floor(profile.seasonLevel / achievement.amount * 100)}%**)` : `(**${achievement.amount.toLocaleString()}**/**${achievement.amount.toLocaleString()}** **100%**)`}`
        case AchievementType.GetAllAchievements:
            return `${achievement.client.language({ textId: `Выполнить все достижения`, guildId: interaction.guildId, locale: interaction.locale })}`
        case AchievementType.GuildBoost:
            return `${achievement.client.language({ textId: `Забустить сервер`, guildId: interaction.guildId, locale: interaction.locale })} ${achievement.amount?.toLocaleString() || `XX`} ${achievement.client.language({ textId: `раз(а)`, guildId: interaction.guildId, locale: interaction.locale })} ${!profile ? "" : !profile.achievements?.some(e => e.achievmentID == achievement.id) ? `(**${profile.boosts.toLocaleString()}**/**${achievement.amount.toLocaleString()}** **${Math.floor(profile.boosts / achievement.amount * 100)}%**)` : `(**${achievement.amount.toLocaleString()}**/**${achievement.amount.toLocaleString()}** **100%**)`}`
        case AchievementType.Work:
            return `${achievement.client.language({ textId: `Поработать`, guildId: interaction.guildId, locale: interaction.locale })} ${achievement.amount?.toLocaleString() || `XX`} ${achievement.client.language({ textId: `раз(а)`, guildId: interaction.guildId, locale: interaction.locale })} ${!profile ? "" : !profile.achievements?.some(e => e.achievmentID == achievement.id) ? `(**${profile.works.toLocaleString()}**/**${achievement.amount.toLocaleString()}** **${Math.floor(profile.works / achievement.amount * 100)}%**)` : `(**${achievement.amount.toLocaleString()}**/**${achievement.amount.toLocaleString()}** **100%**)`}`
        case AchievementType.GiveawayWins:
            return `${achievement.client.language({ textId: `Выиграть в раздаче`, guildId: interaction.guildId, locale: interaction.locale })} ${achievement.amount?.toLocaleString() || `XX`} ${achievement.client.language({ textId: `раз(а)`, guildId: interaction.guildId, locale: interaction.locale })} ${!profile ? "" : !profile.achievements?.some(e => e.achievmentID == achievement.id) ? `(**${profile.giveawayWins.toLocaleString()}**/**${achievement.amount.toLocaleString()}** **${Math.floor(profile.giveawayWins / achievement.amount * 100)}%**)` : `(**${achievement.amount.toLocaleString()}**/**${achievement.amount.toLocaleString()}** **100%**)`}`
        case AchievementType.FishingItem: {
            const targetItems = []
            if (achievement.items) {
                for (const itemID of achievement.items) {
                    const item = achievement.client.cache.items.get(itemID)
                    const isDefaultEmoji = node_emoji.hasEmoji(item?.emoji)
                    if (!isDefaultEmoji) targetItems.push(`${item ? `${item.name}` : itemID }`) 
                    else {
                        targetItems.push(`${item ? `${item.displayEmoji}${item.name}` : itemID }`)    
                    }
                }
            }
            return `${achievement.client.language({ textId: `Выловить предмет в рыбалке`, guildId: interaction.guildId, locale: interaction.locale })} ${achievement.items?.length ? targetItems.join(` ${achievement.client.language({ textId: `или`, guildId: interaction.guildId, locale: interaction.locale })} `) : ``}`
        }
        case AchievementType.MiningItem: {
            const targetItems = []
            if (achievement.items) {
                for (const itemID of achievement.items) {
                    const item = achievement.client.cache.items.get(itemID)
                    const isDefaultEmoji = node_emoji.hasEmoji(item?.emoji)
                    if (!isDefaultEmoji) targetItems.push(`${item ? `${item.name}` : itemID }`) 
                    else {
                        targetItems.push(`${item ? `${item.displayEmoji}${item.name}` : itemID }`)    
                    }
                }
            }
            return `${achievement.client.language({ textId: `Выкопать предмет в майнинге`, guildId: interaction.guildId, locale: interaction.locale })} ${achievement.items?.length ? targetItems.join(` ${achievement.client.language({ textId: `или`, guildId: interaction.guildId, locale: interaction.locale })} `) : ``}`
        }
        case AchievementType.UsedPromocodes: {
            return `${achievement.client.language({ textId: `Использовать промокод`, guildId: interaction.guildId, locale: interaction.locale })} ${achievement.amount?.toLocaleString() || `XX`} ${achievement.client.language({ textId: `раз(а)`, guildId: interaction.guildId, locale: interaction.locale })} ${!profile ? "" : !profile.achievements?.some(e => e.achievmentID == achievement.id) ? `(**${profile.promocodesUsed.toLocaleString()}**/**${achievement.amount.toLocaleString()}** **${Math.floor(profile.promocodesUsed / achievement.amount * 100)}%**)` : `(**${achievement.amount.toLocaleString()}**/**${achievement.amount.toLocaleString()}** **100%**)`}`
        }
        case AchievementType.MemberSince: {
            const total = achievement.client.functions.transformSecs(achievement.client, achievement.amount*60*1000, interaction.guildId, interaction.locale)
            return `${achievement.client.language({ textId: `Находиться на сервере`, guildId: interaction.guildId, locale: interaction.locale })} ${achievement.amount ? total : `XX минут`} ${!profile ? "" : !profile.achievements?.some(e => e.achievmentID == achievement.id) ? `(**${achievement.client.functions.transformSecs(achievement.client, Date.now() - member.joinedTimestamp, interaction.guildId, interaction.locale)}**/**${total}** **${Math.floor((Date.now() - member.joinedTimestamp) / (achievement.amount * 60 * 1000) * 100)}%**)` : `(**${total}**/**${total}** **100%**)`}`
        }
        case AchievementType.Crash: {
            return `${achievement.client.language({ textId: `Выиграть ставку`, guildId: interaction.guildId, locale: interaction.locale })} ${achievement.amount?.toLocaleString() || `XX`} ${achievement.client.language({ textId: `или больше в мини-игре 'Краш'`, guildId: interaction.guildId, locale: interaction.locale })} ${!profile ? "" : !profile.achievements?.some(e => e.achievmentID == achievement.id) ? `(**0**/**1** **${Math.floor(0 / 1 * 100)}%**)` : `(**1**/**1** **100%**)`}`
        }
        default:
            return `${achievement.type || achievement.client.language({ textId: `Отсутствует задача достижения`, guildId: interaction.guildId, locale: interaction.locale })}`
    }
}
module.exports = getAchievementDescription;