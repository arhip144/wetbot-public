const { glob } = require("glob")
const { Client } = require("discord.js")
const { loadLanguages } = require(`./language`)
const { loadBlackList } = require(`./blacklist`)
const { loadCooldowns } = require(`./cooldowns`)
const { loadCache } = require(`./cacheLoader`)
require('dotenv').config()
const mongoose = require("mongoose")
const { ApplicationCommandType, Events } = require("discord.js")
/**
 * @param {Client} client
 */
module.exports = async (client) => {
    client.on(Events.ClientReady, async () => {
        mongoose.set("strictQuery", true)
        const db = await mongoose.connect(process.env.mongoDB_SRV, {
            keepAlive: true,
            useNewUrlParser: true, 
            useUnifiedTopology: true,
        })
        if (db?.connections?.[0]) console.log(`Successfully connected to ${db.connections[0].name} (${db.connections[0].host}:${db.connections[0].port})`)
        await loadCache(client)
        await loadLanguages(client)
        await loadBlackList(client)
        await loadCooldowns(client)
        // Buttons
        console.time("Successfully loaded interactions")
        const interactions = glob.sync(`interactions/*.js`, {
            absolute: true
        })
        const arrayOfButtons = []
        await interactions.map((value) => {
            const file = require(value)
            if (!file?.name) return
            client.interactions.set(file.name, file)
            arrayOfButtons.push(file)
        })
        console.timeEnd("Successfully loaded interactions")

        // Slash Commands
        console.time(`Successfully loaded commands`)
        const slashCommands = glob.sync(`slash-commands/*.js`, {
            absolute: true
        })
        const arrayOfSlashCommands = []
        await slashCommands.map(async (value) => {
            const file = require(value)
            if (!file?.name) return
            client.slashCommands.set(file.name, file)
            if ([ApplicationCommandType.Message, ApplicationCommandType.User].includes(file.type)) {
                delete file.description
                delete file.options
            }
            let newMap = Object.assign({}, file)
            delete newMap.group
            delete newMap.permissions
            delete newMap.owner
            delete newMap.cooldowns
            arrayOfSlashCommands.push(newMap)
        })
        console.log(`Successfully loaded commands.`)
        // Events
        console.time("Successfully loaded events")
        const eventFiles = glob.sync(`events/*.js`, {
            absolute: true
        })
        await eventFiles.map((value) => {
            require(value)
        })
        console.timeEnd("Successfully loaded events")
        //modules
        console.time("Successfully loaded modules")
        const modulesFiles = glob.sync(`modules/*.js`, {
            absolute: true
        })
        await modulesFiles.map((value) => {
            require(value)(client)
        })
        console.timeEnd("Successfully loaded modules")
        client.cache.giveaways.filter(e => e.endsTime && e.status === "started").forEach(giveaway => giveaway.setTimeoutEnd())
        client.cache.giveaways.filter(e => e.deleteTemp && e.status !== "started").forEach(giveaway => giveaway.setTimeoutDelete())
        await Promise.all(client.cache.wormholes.filter(e => e.isEnabled).map(async wormhole => {
            wormhole.cronJobStart()
		}))
        await Promise.all(client.cache.promocodeAutogenerators.filter(e => e.isEnabled).map(async autogenerator => {
            autogenerator.cronJobStart()
		}))
        await Promise.all(client.cache.promocodes.filter(e => e.resetCronPattern).map(async promocode => {
            promocode.cronJobStart()
		}))
        client.cache.promocodes.filter(e => e.deleteDate).forEach(promocode => promocode.setTimeoutDelete())
    })
}
