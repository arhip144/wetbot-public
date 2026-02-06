const { EmbedBuilder } = require("discord.js");
const request = require('request');
require('dotenv').config()
async function sendError(error) {
    if (error.stack.includes(`Missing Permissions`) || error.stack.includes(`Missing Access`) || error.stack.includes(`Unknown interaction`) || error.stack.includes(`Regular expression is invalid`) || error.stack.includes(`Unknown Channel`) || error.stack.includes(`Unknown Message`)) return console.error(error)
    const embed = new EmbedBuilder()
        .setColor(3093046)
        .setAuthor({ name: `Ошибка ${error.message.slice(0, 245)}` })
        .setDescription(`\`\`\`ml\n${error.stack.slice(0, 2000)}\`\`\``)
        .setTimestamp()
    request({
        uri: process.env.errorWebhook,
        body: JSON.stringify({
            content: "<@364726576656678912>",
            embeds: [embed]
        }),
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    console.error(error);
}
module.exports = sendError;