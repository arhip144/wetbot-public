const { AchievementType } = require("../enums/index")
async function addLike(client, userID, guildID, mention, likes, channel) {
    const settings = client.cache.settings.get(guildID)
    const achievements = client.cache.achievements.filter(e => e.guildID === guildID && e.type === AchievementType.Like && e.enabled)
    const itemsForLike = client.cache.items.filter(i => i.guildID === guildID && !i.temp && i.enabled && i.activities?.like?.amountFrom && i.activities?.like?.amountTo)
    const guild = client.guilds.cache.get(guildID)
    if (guild) {
        const likedProfile = await client.functions.fetchProfile(client, mention, guildID)
        const likingProfile = await client.functions.fetchProfile(client, userID, guildID)
        const likedUserRewards = []
        const likingUserRewards = []
        if (settings.xpForLike && !likedProfile.blockActivities?.like?.XP) {
            const base_xp = likes * settings.xpForLike
            const xp = base_xp + (base_xp * likedProfile.getXpBoost())
            if (xp) await likedProfile.addXp({ amount: xp })
        }
        if (settings.curForLike && !likedProfile.blockActivities?.like?.CUR) {
            const base_cur = likes * settings.curForLike
            const cur = base_cur + (base_cur * likedProfile.getCurBoost())
            if (cur) await likedProfile.addCurrency({ amount: cur })
        }
        if (settings.rpForLike && !likedProfile.blockActivities?.like?.RP) {
            const base_rp = likes * settings.rpForLike
            const rp = base_rp + (base_rp * likedProfile.getRpBoost())
            if (rp) await likedProfile.addRp({ amount: rp })
        }
        if (!likedProfile.blockActivities?.like?.items) {
            const member = await guild.members.fetch(likedProfile.userID).catch(() => null)
            await Promise.all(itemsForLike.map(async item => {
                if (item.activities_like_permission && client.cache.permissions.some(e => e.id === item.activities_like_permission)) {
                    const permission = client.cache.permissions.find(e => e.id === item.activities_like_permission)
                    const isPassing = permission.for(likedProfile, member, channel)
                    if (isPassing.value === true) {
                        const amount = client.functions.getRandomNumber(item.activities.like.amountFrom, item.activities.like.amountTo)
                        if (member) await likedProfile.addItem({ itemID: item.itemID, amount })
                        likedUserRewards.push(`${item.displayEmoji}**${item.name}** (${amount})`)
                    }
                } else {
                    const amount = client.functions.getRandomNumber(item.activities.like.amountFrom, item.activities.like.amountTo)
                    if (member) await likedProfile.addItem({ itemID: item.itemID, amount })
                    likedUserRewards.push(`${item.displayEmoji}**${item.name}** (${amount})`)
                }
            }))
        } 
        likedProfile.likes += likes
        await Promise.all(achievements.map(async achievement => {
            if (!likedProfile.achievements?.some(ach => ach.achievmentID === achievement.id) && likedProfile.likes >= achievement.amount && !client.tempAchievements[likedProfile.userID]?.includes(achievement.id)) {
                if (!client.tempAchievements[likedProfile.userID]) client.tempAchievements[likedProfile.userID] = []
                client.tempAchievements[likedProfile.userID].push(achievement.id)
                await likedprofile.addAchievement({ achievement })
            }        
        }))
        await likedProfile.save()
        likingProfile.lastLike = new Date()
        if (settings.xpForLike && !likingProfile.blockActivities?.like?.XP) {
            const base_xp = likes * settings.xpForLike
            const xp = base_xp + (base_xp * likingProfile.getXpBoost())
            if (xp) await likingProfile.addXp({ amount: xp })
        }
        if (settings.curForLike && !likingProfile.blockActivities?.like?.CUR) {
            const base_cur = likes * settings.curForLike
            const cur = base_cur + (base_cur * likingProfile.getCurBoost())
            if (cur) await likingProfile.addCurrency({ amount: cur })
        }
        if (settings.rpForLike && !likingProfile.blockActivities?.like?.RP) {
            const base_rp = likes * settings.rpForLike
            const rp = base_rp + (base_rp * likingProfile.getRpBoost())
            if (rp) await likingProfile.addRp({ amount: rp })
        }
        if (!likingProfile.blockActivities?.like?.items) {
            const member = await guild.members.fetch(likingProfile.userID).catch(() => null)
            await Promise.all(itemsForLike.map(async item => {
                if (item.activities_like_permission && client.cache.permissions.some(e => e.id === item.activities_like_permission)) {
                    const permission = client.cache.permissions.find(e => e.id === item.activities_like_permission)
                    const isPassing = permission.for(likingProfile, member, channel)
                    if (isPassing.value === true) {
                        const amount = client.functions.getRandomNumber(item.activities.like.amountFrom, item.activities.like.amountTo)
                        if (member) await likingProfile.addItem({ itemID: item.itemID, amount })
                        likingUserRewards.push(`${item.displayEmoji}**${item.name}** (${amount})`)
                    }
                } else {
                    const amount = client.functions.getRandomNumber(item.activities.like.amountFrom, item.activities.like.amountTo)
                    if (member) await likingProfile.addItem({ itemID: item.itemID, amount })
                    likingUserRewards.push(`${item.displayEmoji}**${item.name}** (${amount})`)
                }
            }))
        }
        const guildQuests = client.cache.quests.filter(quest => quest.guildID === guild.id && quest.isEnabled && quest.targets.some(target => target.type === "like"))
        if (guildQuests.size) await likingProfile.addQuestProgression({ type: "like", amount: 1, object: mention })
        await likingProfile.save()
        return { likingProfile: likingProfile, likedProfile: likedProfile,  likingUserRewards: likingUserRewards, likedUserRewards: likedUserRewards }    
    }
}
module.exports = addLike;