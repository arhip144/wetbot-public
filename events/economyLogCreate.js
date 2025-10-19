const client = require("../index")
const request = require('request')
client.on('economyLogCreate', async (guildId, log) => {
	const settings = client.cache.settings.find(settings => settings.guildID === guildId)
	if (!settings.logs?.webhook || !settings.logs?.economyLogCreate) return
    try {
        request({
            uri: settings.logs.webhook,
            body: JSON.stringify({
                content: log,
                allowed_mentions: {
                    parse: []
                }
            }),
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        })
    } catch (err) {
        if (err.message.includes("Invalid URI")) {
            settings.logs.webhook = undefined
            await settings.save()
        } else sendError(err)
    }
})