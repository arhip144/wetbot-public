const Profile = require("../classes/profile.js");
async function fetchProfile(client, userID, guildID) {
    let profile = client.cache.profiles.get(guildID+userID)
    if (profile) return profile
    profile = await client.profileSchema.findOne({ userID: userID, guildID: guildID })
    if (profile) {
        profile = new Profile(client, profile)
        client.cache.profiles.set(guildID+userID, profile)
        return profile
    }
    const settings = await client.functions.fetchSettings(client, guildID)
    const query = {
        userID: userID,
        guildID: guildID,
        inventory: []
    }
    if (settings.startKitEnabled) {
        for (const element of settings.startKit) {
            if (element.itemID === "currency") {
                query.currency = element.amount
            }
            else if (element.itemID === "xp") {
                query.xp = element.amount
                query.totalxp = element.amount
            }
            else if (element.itemID === "rp") {
                query.rp = element.amount
            }
            else {
                const item = client.cache.items.find(i => i.itemID === element.itemID && !i.temp && i.enabled)
                if (item) {
                    item.found = true
                    await item.save()
                    query.inventory.push({
                        itemID: item.itemID,
                        amount: element.amount
                    })
                }
            }
        }    
    }
    try {
        profile = new client.profileSchema(query)
        await profile.save()    
    } catch (err) {
        if (err.message.includes('duplicate key')) {
            return client.cache.profiles.get(guildID+userID)
        }
        throw err
    }
    profile = new Profile(client, profile)
    client.cache.profiles.set(guildID+userID, profile)
    return profile
}
module.exports = fetchProfile;