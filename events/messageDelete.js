const client = require("../index")
const { Events } = require("discord.js")
client.on(Events.MessageDelete, async (message) => {
    const auction = client.cache.auctions.find(e => e.messageId === message.id)
    if (auction) await auction.delete(true, true)
})