require('dotenv').config()
const { Client, Collection, Partials, GatewayIntentBits, EmbedBuilder, Options, Events } = require("discord.js")
const client = new Client({
    intents: [
        GatewayIntentBits.GuildInvites,
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildExpressions,
        GatewayIntentBits.GuildMembers, 
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildModeration,
        GatewayIntentBits.GuildWebhooks,
        GatewayIntentBits.GuildPresences
    ],
    partials: [Partials.Channel, Partials.GuildMember, Partials.Reaction, Partials.Message],
    sweepers: { 
        ...Options.DefaultSweeperSettings,
        messages: { interval: 3600, lifetime: 86400 }, 
    },
    makeCache: Options.cacheWithLimits({ ...Options.DefaultMakeCacheSettings, MessageManager: 100 })
})
client.functions = require("./handler/functions.js")
client.temp = []
client.dropDownTemp = new Collection()
client.wipe = {}
client.giftsInWork = {}
client.globalCooldown = {}
client.voiceActiveCooldown = {}
client.levelFactorCooldowns = {}
client.tempAchievements = {}
client.config = require('./config/botconfig')
client.slashCommands = new Collection()
client.interactions = new Collection()
client.itemSchema = require("./schemas/itemSchema.js")
client.permissionSchema = require("./schemas/permissionSchema.js")
client.giftSchema = require("./schemas/giftSchema.js")
client.styleSchema = require("./schemas/wormholeStyleSchema.js")
client.roleSchema = require("./schemas/roleSchema.js")
client.profileSchema = require("./schemas/profileSchema.js")
client.globalProfileSchema = require("./schemas/globalProfileSchema.js")
client.questSchema = require("./schemas/questSchema.js")
client.achievementSchema = require("./schemas/achievementSchema.js")
client.settingsSchema = require("./schemas/settingsSchema.js")
client.giveawaySchema = require("./schemas/giveawaySchema.js")
client.marketSchema = require("./schemas/marketSchema.js")
client.wormholeSchema = require("./schemas/wormholeSchema.js")
client.commandsUsesSchema = require("./schemas/commandsUsesSchema.js")
client.shopCategorySchema = require("./schemas/shopCategorySchema.js")
client.dropdownRoleSchema = require("./schemas/dropdownRoleSchema.js")
client.blackListSchema = require("./schemas/blacklistSchema.js")
client.jobSchema = require("./schemas/jobSchema.js")
client.rolePropertiesSchema = require("./schemas/rolePropertiesSchema.js")
client.customRoleSchema = require("./schemas/customRoleSchema.js")
client.channelMultipliersSchema = require("./schemas/channelMultipliersSchema.js")
client.promocodeSchema = require("./schemas/promocodeSchema.js")
client.promocodeAutogeneratorSchema = require("./schemas/promocodeAutogeneratorSchema.js")
client.language = require(`./handler/language`)
client.cooldowns = require(`./handler/cooldowns`)
client.blacklist = require(`./handler/blacklist`)
client.marketFilters = new Collection()
client.fetchedMembers = new Set()
const { cache } = require(`./handler/cacheLoader`)
client.cache = cache
module.exports = client
client.on(Events.Warn, console.log)
require("./handler")(client)
const request = require('request')
client.rest.on("rateLimited", error => {
    console.error(`Рейт-лимит ${new Date()}:`, error)
})
process.on(`unhandledRejection`, error => {
    console.error(`Ошибка ${new Date()}:`, error)
    if (error.stack.includes(`Missing Permissions`) || error.stack.includes(`Missing Access`) || error.stack.includes(`Unknown interaction`) || error.stack.includes(`Regular expression is invalid`) || error.stack.includes(`Unknown Channel`) || error.stack.includes(`Unknown Message`) || error.stack.includes("Target user is not connected to voice") || error.stack.includes("Unknown Member") || error.stack.includes(`ECONNRESET`)) return
    else {
        const embed = new EmbedBuilder()
            .setColor(3093046)
            .setAuthor({ name: `Ошибка ${error.message.slice(0, 245)}` })
            .setDescription(`\`\`\`ml\n${error.stack}\`\`\``)
            .setTimestamp()
        request({
            uri: process.env.errorWebhook,
            body: JSON.stringify({
                content: `<@${client.config.discord.ownerId}>`,
                embeds: [embed]
            }),
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        })
    }
})
process.on("uncaughtException", (error) => {
    console.error(`Ошибка ${new Date()}:`, error)
    if (error.stack.includes(`Missing Permissions`) || error.stack.includes(`Missing Access`) || error.stack.includes(`Unknown interaction`) || error.stack.includes(`Regular expression is invalid`) || error.stack.includes(`Unknown Channel`) || error.stack.includes(`Unknown Message`) || error.stack.includes("Target user is not connected to voice") || error.stack.includes("Unknown Member") || error.stack.includes(`ECONNRESET`)) return
    else {
        const embed = new EmbedBuilder()
            .setColor(3093046)
            .setAuthor({ name: `Ошибка ${error.message.slice(0, 245)}` })
            .setDescription(`\`\`\`ml\n${error.stack}\`\`\``)
            .setTimestamp()
        request({
            uri: process.env.errorWebhook,
            body: JSON.stringify({
                content: `<@${client.config.discord.ownerId}>`,
                embeds: [embed]
            }),
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        })
    }
})
client.on(Events.Error, (error) => {
    console.error(`Ошибка ${new Date()}:`, error)
    if (error.stack.includes(`Missing Permissions`) || error.stack.includes(`Missing Access`) || error.stack.includes(`Unknown interaction`) || error.stack.includes(`Regular expression is invalid`) || error.stack.includes(`Unknown Channel`) || error.stack.includes(`Unknown Message`) || error.stack.includes("Target user is not connected to voice") || error.stack.includes("Unknown Member") || error.stack.includes(`ECONNRESET`)) return
    else {
        const embed = new EmbedBuilder()
            .setColor(3093046)
            .setAuthor({ name: `Ошибка ${error.message.slice(0, 245)}` })
            .setDescription(`\`\`\`ml\n${error.stack}\`\`\``)
            .setTimestamp()
        request({
            uri: process.env.errorWebhook,
            body: JSON.stringify({
                content: `<@${client.config.discord.ownerId}>`,
                embeds: [embed]
            }),
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        })
    }
})
client.login(process.env.discordToken)