const questSchema = require("../schemas/questSchema.js")
const { RewardType } = require('../enums/index')
class Quest {
	constructor(client, quest) {
		this.client = client
		this.guildID = quest.guildID
        this.questID = quest.questID
        this.name = quest.name
        this.emoji = quest.emoji
        this.description = quest.description
        this.image = quest.image
        this.hex = quest.hex
        this.targets = quest.targets
        this.rewards = quest.rewards
        this.daily = quest.daily
        this.weekly = quest.weekly
        this.community = quest.community
        this.repeated = quest.repeated
        this.enable = quest.enable
        this.active = quest.active
        this.takePermission = quest.takePermission
        this.donePermission = quest.donePermission
        this.displayEmoji = "⏳"
	}
    get isEnabled() {
        return this.enable
    }
    async save() {
		await questSchema.replaceOne({ questID: this.questID }, Object.assign({}, { ...this, client: undefined }), { upsert: true })
	}
    async delete() {
        await Promise.all(this.client.cache.profiles.filter(profile => profile.guildID === this.guildID && profile.quests?.some(quest => quest.questID === this.questID)).map(async profile => {
            profile.quests = profile.quests?.filter(quest => quest.questID !== this.questID)
            if (!profile.quests.length) profile.quests = undefined
            await profile.save()
        }))
        this.client.cache.quests.delete(this.questID)
        await questSchema.deleteOne({ questID: this.questID })
    }
    getDescription(target, locale) {
        const settings = this.client.cache.settings.get(this.guildID)
        let amount
        if (this.community) amount = `**${target.reached}**/**${target.amount}** (**${Math.floor(target.reached/target.amount*100)}%**)`
        else amount = `**${target.amount}**`
        switch(target.type) {
            case "message":
                if (!target.object) target = `${this.client.language({ textId: "Написать", guildId: this.guildID, locale: locale })} ${amount} ${this.client.language({ textId: "сообщений в чате", guildId: this.guildID, locale: locale })}`
                else target = `${this.client.language({ textId: "Написать", guildId: this.guildID, locale: locale })} ${amount} ${this.client.language({ textId: "сообщений в чате", guildId: this.guildID, locale: locale })} (<#${target.object}>)`
                break
            case "voice":
                if (!target.object) target = `${this.client.language({ textId: "Провести", guildId: this.guildID, locale: locale })} ${amount} ${this.client.language({ textId: "минут в голосовом чате", guildId: this.guildID, locale: locale })}`
                else target = `${this.client.language({ textId: "Провести", guildId: this.guildID, locale: locale })} ${amount} ${this.client.language({ textId: "минут в голосовом чате", guildId: this.guildID, locale: locale })} (<#${target.object}>)`
                break
            case "like":
                if (!target.object) target = `${this.client.language({ textId: "Поставить", guildId: this.guildID, locale: locale })} ${amount} ${this.client.language({ textId: "лайков", guildId: this.guildID, locale: locale })}`
                else target = `${this.client.language({ textId: "Поставить", guildId: this.guildID, locale: locale })} ${amount} ${this.client.language({ textId: "лайков", guildId: this.guildID, locale: locale })} (<@${target.object}>)`
                break
            case "invite":
                target = `${this.client.language({ textId: "Пригласить", guildId: this.guildID, locale: locale })} ${amount} ${this.client.language({ textId: "чел. на сервер", guildId: this.guildID, locale: locale })}`
                break
            case "bump":
                target = `${this.client.language({ textId: "Бампнуть сервер", guildId: this.guildID, locale: locale })} ${amount} ${this.client.language({ textId: "раз(а)", guildId: this.guildID, locale: locale })}`
                break
            case "currency":
                target = `${this.client.language({ textId: "Накопить", guildId: this.guildID, locale: locale })} ${amount} ${settings?.currencyName || this.client.language({ textId: "валюты", guildId: this.guildID, locale: locale })}`
                break
            case "currencySpent":
                target = `${this.client.language({ textId: "Потратить", guildId: this.guildID, locale: locale })} ${amount} ${settings?.currencyName || this.client.language({ textId: "валюты", guildId: this.guildID, locale: locale })}`
                break
            case "fishing":
                if (!target.object) target = `${this.client.language({ textId: "Порыбачить", guildId: this.guildID, locale: locale })} ${amount} ${this.client.language({ textId: "раз(а)", guildId: this.guildID, locale: locale })}`
                else {
                    const item = this.client.cache.items.find(i => i.itemID === target.object && i.enabled)
                    if (!item) target = `${this.client.language({ textId: "Выловить", guildId: this.guildID, locale: locale })} ${target.object} ${amount} ${this.client.language({ textId: "раз(а)", guildId: this.guildID, locale: locale })}`
                    else if (!item.found) target = `${this.client.language({ textId: "Выловить", guildId: this.guildID, locale: locale })} ||????????|| ${amount} ${this.client.language({ textId: "раз(а)", guildId: this.guildID, locale: locale })}`
                    else {
                        target = `${this.client.language({ textId: "Выловить", guildId: this.guildID, locale: locale })} ${item.displayEmoji}**${item.name}** ${amount} ${this.client.language({ textId: "раз(а)", guildId: this.guildID, locale: locale })}`
                    }
                }
                break
            case "mining":
                if (!target.object) target = `${this.client.language({ textId: "Помайнить", guildId: this.guildID, locale: locale })} ${amount} ${this.client.language({ textId: "раз(а)", guildId: this.guildID, locale: locale })}`
                else {
                    const item = this.client.cache.items.find(i => i.itemID === target.object && i.enabled)
                    if (!item) target = `${this.client.language({ textId: "Выкопать", guildId: this.guildID, locale: locale })} ${target.object} ${amount} ${this.client.language({ textId: "раз(а)", guildId: this.guildID, locale: locale })}`
                    else if (!item.found) target = `${this.client.language({ textId: "Выкопать", guildId: this.guildID, locale: locale })} ||????????|| ${amount} ${this.client.language({ textId: "раз(а)", guildId: this.guildID, locale: locale })}`
                    else {
                        target = `${this.client.language({ textId: "Выкопать", guildId: this.guildID, locale: locale })} ${item.displayEmoji}**${item.name}** ${amount} ${this.client.language({ textId: "раз(а)", guildId: this.guildID, locale: locale })}`
                    }
                }
                break
            case "wormhole":
                if (!target.object) target = `${this.client.language({ textId: "Использовать червоточину", guildId: this.guildID, locale: locale })} ${amount} ${this.client.language({ textId: "раз(а)", guildId: this.guildID, locale: locale })}`
                else {
                    const wormhole = this.client.cache.wormholes.get(target.object)
                    if (wormhole) {
                        const item = this.client.cache.items.find(i => i.itemID === wormhole.itemID && i.enabled)
                        if (!item) target = `${this.client.language({ textId: "Использовать червоточину", guildId: this.guildID, locale: locale })} ${target.object} ${amount} ${this.client.language({ textId: "раз(а)", guildId: this.guildID, locale: locale })}`
                        else if (!item.found) target = `${this.client.language({ textId: "Использовать червоточину", guildId: this.guildID, locale: locale })} ||????????|| ${amount} ${this.client.language({ textId: "раз(а)", guildId: this.guildID, locale: locale })}`
                        else {
                            target = `${this.client.language({ textId: "Использовать червоточину", guildId: this.guildID, locale: locale })} ${item.displayEmoji}**${item.name}** ${amount} ${this.client.language({ textId: "раз(а)", guildId: this.guildID, locale: locale })}`
                        }    
                    } else target = `${this.client.language({ textId: "Использовать червоточину", guildId: this.guildID, locale: locale })} ${target.object} ${amount} ${this.client.language({ textId: "раз(а)", guildId: this.guildID, locale: locale })}`
                    
                }
                break
            case "daily":
                target = `${this.client.language({ textId: "Получить ежедневную награду", guildId: this.guildID, locale: locale })} ${amount} ${this.client.language({ textId: "раз(а)", guildId: this.guildID, locale: locale })}`
                break
            case "quests":
                if (!target.object) target = `${this.client.language({ textId: "Выполнить квесты", guildId: this.guildID, locale: locale })} ${amount} ${this.client.language({ textId: "раз(а)", guildId: this.guildID, locale: locale })}`
                else {
                    const quest = this.client.cache.quests.find(quest => quest.guildID === this.guildID && quest.questID === target.object)
                    if (quest) {
                        target = `${this.client.language({ textId: "Выполнить квест", guildId: this.guildID, locale: locale })} ${quest.displayEmoji}**${quest.name}** ${amount} ${this.client.language({ textId: "раз(а)", guildId: this.guildID, locale: locale })}`
                    } else target = `${this.client.language({ textId: "Выполнить квест", guildId: this.guildID, locale: locale })} ${target.object} ${amount} ${this.client.language({ textId: "раз(а)", guildId: this.guildID, locale: locale })}`
                }
                break
            case "giveaway":
                target = `${this.client.language({ textId: "Создать раздачу", guildId: this.guildID, locale: locale })} ${amount} ${this.client.language({ textId: "раз(а)", guildId: this.guildID, locale: locale })}`
                break
            case "marketplace":
                if (!target.object) target = `${this.client.language({ textId: "Продать", guildId: this.guildID, locale: locale })} ${amount} ${this.client.language({ textId: "предметов на маркете", guildId: this.guildID, locale: locale })}`
                else {
                    const item = this.client.cache.items.get(target.object)
                    if (!item) target = `${this.client.language({ textId: "Продать", guildId: this.guildID, locale: locale })} ${target.object} ${amount} ${this.client.language({ textId: "на маркете", guildId: this.guildID, locale: locale })}`
                    else if (!item.found) target = `${this.client.language({ textId: "Продать", guildId: this.guildID, locale: locale })} ||????????|| ${amount} ${this.client.language({ textId: "на маркете", guildId: this.guildID, locale: locale })}`
                    else {
                        target = `${this.client.language({ textId: "Продать", guildId: this.guildID, locale: locale })} ${item.displayEmoji}**${item.name}** ${amount} ${this.client.language({ textId: "на маркете", guildId: this.guildID, locale: locale })}`
                    }   
                }
                break
            case "itemsOpened":
                if (!target.object) target = `${this.client.language({ textId: "Открыть", guildId: this.guildID, locale: locale })} ${amount} ${this.client.language({ textId: "предметов", guildId: this.guildID, locale: locale })}`
                else {
                    const item = this.client.cache.items.get(target.object)
                    if (!item) target = `${this.client.language({ textId: "Открыть", guildId: this.guildID, locale: locale })} ${target.object} ${amount} ${this.client.language({ textId: "раз(а)", guildId: this.guildID, locale: locale })}`
                    else if (!item.found) target = `${this.client.language({ textId: "Открыть", guildId: this.guildID, locale: locale })} ||????????|| ${amount} ${this.client.language({ textId: "раз(а)", guildId: this.guildID, locale: locale })}`
                    else {
                        target = `${this.client.language({ textId: "Открыть", guildId: this.guildID, locale: locale })} ${item.displayEmoji}**${item.name}** ${amount} ${this.client.language({ textId: "раз(а)", guildId: this.guildID, locale: locale })}`
                    }   
                }
                break
            case "wormholesSpawned":
                if (!target.object) target = `${this.client.language({ textId: "Заспавнить червоточину", guildId: this.guildID, locale: locale })} ${amount} ${this.client.language({ textId: "раз(а)", guildId: this.guildID, locale: locale })}`
                else {
                    const wormhole = this.client.cache.wormholes.get(target.object)
                    if (wormhole) {
                        const item = this.client.cache.items.find(i => i.itemID === wormhole.itemID && i.enabled)
                        if (!item) target = `${this.client.language({ textId: "Заспавнить червоточину", guildId: this.guildID, locale: locale })} ${target.object} ${amount} ${this.client.language({ textId: "раз(а)", guildId: this.guildID, locale: locale })}`
                        else if (!item.found) target = `${this.client.language({ textId: "Заспавнить червоточину", guildId: this.guildID, locale: locale })} ||????????|| ${amount} ${this.client.language({ textId: "раз(а)", guildId: this.guildID, locale: locale })}`
                        else {
                            target = `${this.client.language({ textId: "Заспавнить червоточину", guildId: this.guildID, locale: locale })} ${item.displayEmoji}**${item.name}** ${amount} ${this.client.language({ textId: "раз(а)", guildId: this.guildID, locale: locale })}`
                        }    
                    } else target = `${this.client.language({ textId: "Заспавнить червоточину", guildId: this.guildID, locale: locale })} ${target.object} ${amount} ${this.client.language({ textId: "раз(а)", guildId: this.guildID, locale: locale })}`
                }
                break
            case "itemsReceived":
                if (!target.object) target = `${this.client.language({ textId: "Получить", guildId: this.guildID, locale: locale })} ${amount} ${this.client.language({ textId: "предметов", guildId: this.guildID, locale: locale })}`
                else {
                    const item = this.client.cache.items.get(target.object)
                    if (!item) target = `${this.client.language({ textId: "Получить", guildId: this.guildID, locale: locale })} ${target.object} ${amount} ${this.client.language({ textId: "раз(а)", guildId: this.guildID, locale: locale })}`
                    else if (!item.found) target = `${this.client.language({ textId: "Получить", guildId: this.guildID, locale: locale })} ||????????|| ${amount} ${this.client.language({ textId: "раз(а)", guildId: this.guildID, locale: locale })}`
                    else {
                        target = `${this.client.language({ textId: "Получить", guildId: this.guildID, locale: locale })} ${item.displayEmoji}**${item.name}** ${amount} ${this.client.language({ textId: "раз(а)", guildId: this.guildID, locale: locale })}`
                    }   
                }
                break
            case "itemsCrafted":
                if (!target.object) target = `${this.client.language({ textId: "Скрафтить", guildId: this.guildID, locale: locale })} ${amount} ${this.client.language({ textId: "предметов", guildId: this.guildID, locale: locale })}`
                else {
                    const item = this.client.cache.items.get(target.object)
                    if (!item) target = `${this.client.language({ textId: "Скрафтить", guildId: this.guildID, locale: locale })} ${target.object} ${amount} ${this.client.language({ textId: "раз(а)", guildId: this.guildID, locale: locale })}`
                    else if (!item.found) target = `${this.client.language({ textId: "Скрафтить", guildId: this.guildID, locale: locale })} ||????????|| ${amount} ${this.client.language({ textId: "раз(а)", guildId: this.guildID, locale: locale })}`
                    else {
                        target = `${this.client.language({ textId: "Скрафтить", guildId: this.guildID, locale: locale })} ${item.displayEmoji}**${item.name}** ${amount} ${this.client.language({ textId: "раз(а)", guildId: this.guildID, locale: locale })}`
                    }   
                }
                break
            case "itemsUsed":
                if (!target.object) target = `${this.client.language({ textId: "Использовать", guildId: this.guildID, locale: locale })} ${amount} ${this.client.language({ textId: "предметов", guildId: this.guildID, locale: locale })}`
                else {
                    const item = this.client.cache.items.get(target.object)
                    if (!item) target = `${this.client.language({ textId: "Использовать", guildId: this.guildID, locale: locale })} ${target.object} ${amount} ${this.client.language({ textId: "раз(а)", guildId: this.guildID, locale: locale })}`
                    else if (!item.found) target = `${this.client.language({ textId: "Использовать", guildId: this.guildID, locale: locale })} ||????????|| ${amount} ${this.client.language({ textId: "раз(а)", guildId: this.guildID, locale: locale })}`
                    else {
                        target = `${this.client.language({ textId: "Использовать", guildId: this.guildID, locale: locale })} ${item.displayEmoji}**${item.name}** ${amount} ${this.client.language({ textId: "раз(а)", guildId: this.guildID, locale: locale })}`
                    }   
                }
                break
            case "itemsBoughtInShop":
                if (!target.object) target = `${this.client.language({ textId: "Купить", guildId: this.guildID, locale: locale })} ${amount} ${this.client.language({ textId: "предметов в магазине", guildId: this.guildID, locale: locale })}`
                else {
                    const item = this.client.cache.items.get(target.object)
                    if (!item) target = `${this.client.language({ textId: "Купить", guildId: this.guildID, locale: locale })} ${target.object} ${amount} ${this.client.language({ textId: "шт. в магазине", guildId: this.guildID, locale: locale })}`
                    else if (!item.found) target = `${this.client.language({ textId: "Купить", guildId: this.guildID, locale: locale })} ||????????|| ${amount} ${this.client.language({ textId: "шт. в магазине", guildId: this.guildID, locale: locale })}`
                    else {
                        target = `${this.client.language({ textId: "Купить", guildId: this.guildID, locale: locale })} ${item.displayEmoji}**${item.name}** ${amount} ${this.client.language({ textId: "шт. в магазине", guildId: this.guildID, locale: locale })}`
                    }   
                }
                break
            case "itemsBoughtOnMarket":
                if (!target.object) target = `${this.client.language({ textId: "Купить", guildId: this.guildID, locale: locale })} ${amount} ${this.client.language({ textId: "предметов на маркете", guildId: this.guildID, locale: locale })}`
                else {
                    const item = this.client.cache.items.get(target.object)
                    if (!item) target = `${this.client.language({ textId: "Купить", guildId: this.guildID, locale: locale })} ${target.object} ${amount} ${this.client.language({ textId: "шт. на маркете", guildId: this.guildID, locale: locale })}`
                    else if (!item.found) target = `${this.client.language({ textId: "Купить", guildId: this.guildID, locale: locale })} ||????????|| ${amount} ${this.client.language({ textId: "шт. на маркете", guildId: this.guildID, locale: locale })}`
                    else {
                        target = `${this.client.language({ textId: "Купить", guildId: this.guildID, locale: locale })} ${item.displayEmoji}**${item.name}** ${amount} ${this.client.language({ textId: "шт. на маркете", guildId: this.guildID, locale: locale })}`
                    }   
                }
                break
            case "itemsSold":
                if (!target.object) target = `${this.client.language({ textId: "Продать", guildId: this.guildID, locale: locale })} ${amount} ${this.client.language({ textId: "предметов", guildId: this.guildID, locale: locale })}`
                else {
                    const item = this.client.cache.items.get(target.object)
                    if (!item) target = `${this.client.language({ textId: "Продать", guildId: this.guildID, locale: locale })} ${target.object} ${amount} ${this.client.language({ textId: "раз(а)", guildId: this.guildID, locale: locale })}`
                    else if (!item.found) target = `${this.client.language({ textId: "Продать", guildId: this.guildID, locale: locale })} ||????????|| ${amount} ${this.client.language({ textId: "раз(а)", guildId: this.guildID, locale: locale })}`
                    else {
                        target = `${this.client.language({ textId: "Продать", guildId: this.guildID, locale: locale })} ${item.displayEmoji}**${item.name}** ${amount} ${this.client.language({ textId: "раз(а)", guildId: this.guildID, locale: locale })}`
                    }   
                }
                break
            case "drop":
                if (!target.object) target = `${this.client.language({ textId: "Выкинуть", guildId: this.guildID, locale: locale })} ${amount} ${this.client.language({ textId: "предметов", guildId: this.guildID, locale: locale })}`
                else {
                    const item = this.client.cache.items.get(target.object)
                    if (!item) target = `${this.client.language({ textId: "Выкинуть", guildId: this.guildID, locale: locale })} ${target.object} ${amount} ${this.client.language({ textId: "раз(а)", guildId: this.guildID, locale: locale })}`
                    else if (!item.found) target = `${this.client.language({ textId: "Выкинуть", guildId: this.guildID, locale: locale })} ||????????|| ${amount} ${this.client.language({ textId: "раз(а)", guildId: this.guildID, locale: locale })}`
                    else {
                        target = `${this.client.language({ textId: "Выкинуть", guildId: this.guildID, locale: locale })} ${item.displayEmoji}**${item.name}** ${amount} ${this.client.language({ textId: "раз(а)", guildId: this.guildID, locale: locale })}`
                    }   
                }
                break
            case "transfer":
                if (!target.object) target = `${this.client.language({ textId: "Передать", guildId: this.guildID, locale: locale })} ${amount} ${this.client.language({ textId: "предметов", guildId: this.guildID, locale: locale })}`
                else {
                    const item = this.client.cache.items.get(target.object)
                    if (!item) target = `${this.client.language({ textId: "Передать", guildId: this.guildID, locale: locale })} ${target.object} ${amount} ${this.client.language({ textId: "раз(а)", guildId: this.guildID, locale: locale })}`
                    else if (!item.found) target = `${this.client.language({ textId: "Передать", guildId: this.guildID, locale: locale })} ||????????|| ${amount} ${this.client.language({ textId: "раз(а)", guildId: this.guildID, locale: locale })}`
                    else {
                        target = `${this.client.language({ textId: "Передать", guildId: this.guildID, locale: locale })} ${item.displayEmoji}**${item.name}** ${amount} ${this.client.language({ textId: "раз(а)", guildId: this.guildID, locale: locale })}`
                    }   
                }
                break
            case "level":
                target = `${this.client.language({ textId: "Получить", guildId: this.guildID, locale: locale })} ${amount} ${this.client.language({ textId: "уровней", guildId: this.guildID, locale: locale })}`
                break
            case "exp":
                target = `${this.client.language({ textId: "Получить", guildId: this.guildID, locale: locale })} ${amount} ${this.client.language({ textId: "опыта", guildId: this.guildID, locale: locale })}`
                break
            case "seasonLevel":
                target = `${this.client.language({ textId: "Получить", guildId: this.guildID, locale: locale })} ${amount} ${this.client.language({ textId: "сезонных уровней", guildId: this.guildID, locale: locale })}`
                break
            case "seasonXp":
                target = `${this.client.language({ textId: "Получить", guildId: this.guildID, locale: locale })} ${amount} ${this.client.language({ textId: "сезонного опыта", guildId: this.guildID, locale: locale })}`
                break
            case "upvote":
                target = `${this.client.language({ textId: "Проголосовать за бота на мониторингах", guildId: this.guildID, locale: locale })} ${amount} ${this.client.language({ textId: "раз(а)", guildId: this.guildID, locale: locale })}`
                break
            case "UsedPromocode":
                if (!target.object) target = `${this.client.language({ textId: "Использовать промокод", guildId: this.guildID, locale: locale })} ${amount} ${this.client.language({ textId: "раз(а)", guildId: this.guildID, locale: locale })}`
                else {
                    const promocode = this.client.cache.promocodes.find(e => e.code === target.object && e.guildID === this.guildID)
                    if (!promocode) target = `${this.client.language({ textId: "Использовать промокод", guildId: this.guildID, locale: locale })} ${target.object} ${amount} ${this.client.language({ textId: "раз(а)", guildId: this.guildID, locale: locale })}`
                    else {
                        target = `${this.client.language({ textId: "Использовать промокод", guildId: this.guildID, locale: locale })} ||????????|| ${amount} ${this.client.language({ textId: "раз(а)", guildId: this.guildID, locale: locale })}`
                    }   
                }
                break
            default:
                target = `${this.client.language({ textId: "ERROR: Неизвестная задача", guildId: this.guildID, locale: locale })}`
                break
        }
        return target
    }
}
module.exports = Quest