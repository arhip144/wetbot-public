const client = require("../index")
const { EmbedBuilder, ChannelType, MessageType, Events, ApplicationCommandType } = require("discord.js")
const { AchievementType } = require("../enums")
const Decimal = require('decimal.js')
const { glob } = require("glob")
client.on(Events.MessageCreate, async (message) => {
    if (message.author.id === client.config.discord.ownerId && message.content === "!reg") {
        const value = glob.sync(`slash-commands/reg.js`, {
            absolute: true
        })
        let command = require(value[0])
        const guild = client.guilds.cache.get(message.guild.id)
        if (guild) {
            try {
                command = await client.application.commands.create(command, message.guild.id)
            } catch (err) {
                return message.reply({ content: err.message })
            }
            return message.reply({ content: `Команда </${command.name}:${command.id}> была успешно зарегистрирована на сервере ${guild.name} (${guild.id}).` })    
        } else return message.reply({ content: `Сервер с ID ${message.guild.id} не найден` })
    }
    if (message.inGuild() && client.blacklist(message.guildId, "full_ban", "guilds")) return
    if (message.inGuild() && client.blacklist(message.author.id, "full_ban", "users")) return
    if ([MessageType.GuildBoost, MessageType.GuildBoostTier1, MessageType.GuildBoostTier2, MessageType.GuildBoostTier3].includes(message.type)) {
        const profile = await client.functions.fetchProfile(client, message.author.id, message.guildId)
        profile.boosts += 1
        const achievements = client.cache.achievements.filter(e => e.guildID === message.guildId && e.type === AchievementType.GuildBoost && e.enabled)
        await Promise.all(achievements.map(async achievement => {
            if (!profile.achievements?.some(ach => ach.achievmentID === achievement.id) && profile.boosts >= achievement.amount && !client.tempAchievements[profile.userID]?.includes(achievement.id)) {
                if (!client.tempAchievements[profile.userID]) client.tempAchievements[profile.userID] = []
                client.tempAchievements[profile.userID].push(achievement.id)
                await profile.addAchievement({ achievement })
            }
        }))
        await profile.save()
    }
    if (message.author.bot || message.channel.type === ChannelType.DM || message.channel.type == ChannelType.GroupDM || (message.type !== MessageType.Default && message.type !== MessageType.Reply)) return;
    const settings = await client.functions.fetchSettings(client, message.guildId);
    if (settings.channels.mutedChannels.includes(message.channelId)) return;

    const profile = await client.functions.fetchProfile(client, message.author.id, message.guildId);
    profile.messages += 1;

    if (!message.member || message.member.roles.cache.hasAny(...settings.roles?.mutedRoles || [])) {
        await profile.save();
        return;
    }

    // Получаем множители канала один раз
    const channelMultipliers = _getChannelMultipliers(client, message);
    const { curMultiplier, xpMultiplier, rpMultiplier, luckMultiplier } = channelMultipliers;

    // Параллельная обработка валюты, опыта и репутации
    await Promise.all([
        _processCurrencyReward(settings, profile, curMultiplier),
        _processXpReward(settings, profile, xpMultiplier),
        _processRpReward(settings, profile, rpMultiplier)
    ]);

    // Обработка квестов и достижений
    await Promise.all([
        _processMessageQuests(client, message, profile),
        _processMessageAchievements(client, message, profile)
    ]);

    // Обработка предметов
    if (!profile.blockActivities?.message?.items) {
        await _processItemDrops(client, message, settings, profile, luckMultiplier);
    }

    await profile.save();
})
const lerp = (min, max, roll) => ((1 - roll) * min + roll * max)
const drop = (items, roll) => {
    const chance = lerp(0, 100, roll)
    let current = new Decimal(0)
    for (const item of items) {
        if (current.lte(chance) && current.plus(item.activities.message.chance).gte(chance)) {
            return item
        }
        current = current.plus(item.activities.message.chance)
    }
};
// Вспомогательные методы
function _getChannelMultipliers(client, message) {
    let channel = client.cache.channels.find(ch => ch.id === message.channelId && ch.isEnabled);
    if (!channel) {
        channel = client.cache.channels.find(ch => ch.id === message.channel?.parentId && ch.isEnabled);
    }
    
    return {
        curMultiplier: channel?.cur_multiplier || 0,
        xpMultiplier: channel?.xp_multiplier || 0,
        rpMultiplier: channel?.rp_multiplier || 0,
        luckMultiplier: channel?.luck_multiplier || 0
    };
}

async function _processCurrencyReward(settings, profile, multiplier) {
    if (!settings.curForMessage || profile.blockActivities?.message?.CUR) return;
    
    const baseCur = settings.curForMessage;
    const cur = baseCur + (baseCur * profile.getCurBoost(multiplier));
    if (cur > 0) {
        await profile.addCurrency({ amount: cur });
    }
}

async function _processXpReward(settings, profile, multiplier) {
    if (!settings.xpForMessage || profile.blockActivities?.message?.XP) return;
    
    const baseXp = settings.xpForMessage;
    const xp = baseXp + (baseXp * profile.getXpBoost(multiplier));
    if (xp > 0) {
        await profile.addXp({ amount: xp });
    }
}

async function _processRpReward(settings, profile, multiplier) {
    if (!settings.rpForMessage || profile.blockActivities?.message?.RP) return;
    
    const baseRp = settings.rpForMessage;
    const rp = baseRp + (baseRp * profile.getRpBoost(multiplier));
    if (rp > 0) {
        await profile.addRp({ amount: rp });
    }
}

async function _processMessageQuests(client, message, profile) {
    const hasMessageQuests = client.cache.quests.some(quest => 
        quest.guildID === message.guildId && 
        quest.isEnabled && 
        quest.targets.some(target => target.type === "message")
    );
    
    if (hasMessageQuests) {
        await profile.addQuestProgression({ type: "message", amount: 1, object: message.channelId });
    }
}

async function _processMessageAchievements(client, message, profile) {
    const achievements = client.cache.achievements.filter(achievement => 
        achievement.guildID === message.guildId && 
        achievement.type === AchievementType.Message && 
        achievement.enabled
    );
    
    const achievementsToAdd = achievements.filter(achievement => 
        !profile.achievements?.some(ach => ach.achievmentID === achievement.id) &&
        profile.messages >= achievement.amount &&
        !client.tempAchievements[profile.userID]?.includes(achievement.id)
    );
    
    if (achievementsToAdd.length === 0) return;
    
    client.tempAchievements[profile.userID] = client.tempAchievements[profile.userID] || [];
    
    // Добавляем ID во временный список
    achievementsToAdd.forEach(achievement => {
        client.tempAchievements[profile.userID].push(achievement.id);
    });
    
    // Добавляем достижения параллельно
    await Promise.all(
        achievementsToAdd.map(achievement => profile.addAchievement({ achievement }))
    );
}
async function _filterItemsByPermission(client, items, profile, member, channel) {
    const permissionChecks = await Promise.all(
        items.map(async (item) => {
            if (!item.activities_message_permission) return item;
            
            const permission = client.cache.permissions.find(p => p.id === item.activities_message_permission);
            if (!permission) return item;
            
            const isPassing = await permission.for(profile, member, channel);
            return isPassing.value === true ? item : null;
        })
    );
    
    return permissionChecks.filter(item => item !== null);
}

async function _sendItemNotification(client, message, settings, profile, item, amount) {
    if (!settings.channels?.itemsNotificationChannelId) return;
    
    try {
        const channel = await message.member.guild.channels.fetch(settings.channels.itemsNotificationChannelId);
        if (!channel) return;
        
        const embed = new EmbedBuilder()
            .setAuthor({ name: message.member.displayName, iconURL: message.author.displayAvatarURL() })
            .setDescription(`${client.language({ textId: "Нашел", guildId: message.guildId })}: ${item.displayEmoji}**${item.name}** (${amount})`)
            .setColor(item.hex || "#2F3236");
            
        const content = profile.itemMention ? `<@${message.member.user.id}>` : ' ';
        await channel.send({ content, embeds: [embed] });
    } catch (error) {
        // Игнорируем ошибки отправки уведомлений
    }
}
async function _processItemDrops(client, message, settings, profile, luckMultiplier) {
    const items = client.cache.items.filter(item => 
        item.guildID === message.guildId && 
        !item.temp && 
        item.enabled && 
        item.activities?.message?.chance
    );
    
    if (items.size === 0) return;
    
    // Сортируем и подготавливаем предметы
    const availableItems = Array.from(items.values())
        .sort((a, b) => a.activities.message.chance - b.activities.message.chance)
        .map(item => ({
            itemID: item.itemID,
            displayEmoji: item.displayEmoji,
            name: item.name,
            activities: { 
                message: { 
                    chance: item.activities.message.chance,
                    amountFrom: item.activities.message.amountFrom,
                    amountTo: item.activities.message.amountTo
                }
            },
            hex: item.hex,
            activities_message_permission: item.activities_message_permission
        }));
    
    // Применяем удачу
    const bonus = new Decimal(1).plus(profile.getLuckBoost(luckMultiplier));
    const adjustedItems = client.functions.adjustActivityChanceByLuck(availableItems, bonus, "message");
    
    // Фильтруем по разрешениям
    const filteredItems = await _filterItemsByPermission(client, adjustedItems, profile, message.member, message.channel);
    if (filteredItems.length === 0) return;
    
    // Выбираем предмет
    const baseChance = Math.random() || 1; // Если 0, то 1
    const item = drop(filteredItems, baseChance);
    
    if (!item) return;
    
    const amount = client.functions.getRandomNumber(item.activities.message.amountFrom, item.activities.message.amountTo);
    await profile.addItem({ itemID: item.itemID, amount });
    
    // Отправляем уведомление
    await _sendItemNotification(client, message, settings, profile, item, amount);
}
