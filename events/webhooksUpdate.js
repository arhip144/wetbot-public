const client = require("../index")
const { Events } = require("discord.js")
client.on(Events.WebhooksUpdate, async (channel) => {
	const webhooks = await channel.fetchWebhooks().catch(e => null)
    if (webhooks) webhooks.forEach(webhook => client.cache.webhooks.set(webhook.id, webhook))
})