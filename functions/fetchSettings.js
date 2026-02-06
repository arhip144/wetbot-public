const Settings = require("../classes/Settings.js");
async function fetchSettings(client, guildID) {
    let settings = client.cache.settings.get(guildID)
    if (settings) return settings
    settings = new client.settingsSchema({
        guildID: guildID,
        daily: {
            day1: [{
                itemID: "currency",
                valueFrom: 100,
                valueTo: 100,  
            }],
            day2: [{
                itemID: "currency",
                valueFrom: 200,
                valueTo: 200,  
            }],
            day3: [{
                itemID: "currency",
                valueFrom: 300,
                valueTo: 300,  
            }],
            day4: [{
                itemID: "currency",
                valueFrom: 400,
                valueTo: 400,  
            }],
            day5: [{
                itemID: "currency",
                valueFrom: 500,
                valueTo: 500,  
            }],
            day6: [{
                itemID: "currency",
                valueFrom: 600,
                valueTo: 600,  
            }],
            day7: [{
                itemID: "currency",
                valueFrom: 700,
                valueTo: 700,  
            }]
        }
    })
    try {
        await settings.save()
    } catch(err) {
        if (err.message.includes("duplicate key")) {
            settings = client.cache.settings.get(guildID)
            if (!settings) settings = await client.settingsSchema.findOne({ guildID: guildID }).lean()
            else return settings 
        } else throw err
    }
    settings = new Settings(client, settings)
    client.cache.settings.set(guildID, settings)
    return settings
}
module.exports = fetchSettings;