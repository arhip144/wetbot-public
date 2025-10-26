const { ContainerBuilder, TextDisplayBuilder, SeparatorBuilder, SeparatorSpacingSize, Colors } = require("discord.js")
const { RewardType } = require("../enums")
const uniqid = require('uniqid')
const Decimal = require("decimal.js")
class CrashGame {
    constructor(client, userId, playerCoefficient, betType, betAmount, item) {
        this.client = client
        this.userId = userId
        this.id = uniqid.time()
        this.currentCoefficient = 1
        this.playerCoefficient = playerCoefficient
        this.betType = betType
        this.betAmount = betAmount
        this.betItem = item
    }

    getCrashPoint(houseEdge = 0.01) {
        const MAX = 0xFFFFFFFFFFFFF; // 2^52 (4503599627370496 в десятичной)
        // Генерируем случайное число от 1 до 2^52 - 1
        const random = Math.floor(Math.random() * (MAX - 1)) + 1;
        const point = (MAX * (1 - houseEdge)) / random;
        this.crashPoint = Number(Math.max(1, point).toFixed(2)) // Минимальный множитель = 1
        return this.crashPoint
    }
    getContainer(interaction) {
        const settings = interaction.client.cache.settings.get(interaction.guildId)
        const serverItemEmoji = this.betType === RewardType.Currency ? settings.displayCurrencyEmoji : this.betItem?.displayEmoji
        const serverItemName = this.betType === RewardType.Currency ? settings.currencyName : this.betItem?.name
        return new ContainerBuilder()
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`# 💥${interaction.client.language({ textId: `Краш`, guildId: interaction.guildId, locale: interaction.locale })}`)
            )
            .addSeparatorComponents(
                new SeparatorBuilder()
                    .setDivider(true)
                    .setSpacing(SeparatorSpacingSize.Small)
            )
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent([
                        `**🎲${interaction.client.language({ textId: `Коэффициент игры:`, guildId: interaction.guildId, locale: interaction.locale })}**`,
                        `x${this.crashPoint > this.currentCoefficient ? this.currentCoefficient.toFixed(2) : this.crashPoint.toFixed(2)}`
                    ].join("\n"))
            )
            .addSeparatorComponents(
                new SeparatorBuilder()
                    .setDivider(true)
                    .setSpacing(SeparatorSpacingSize.Small)
            )
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent([
                        `**💰${interaction.client.language({ textId: `Твой коэффициент:`, guildId: interaction.guildId, locale: interaction.locale })}**`,
                        `x${this.playerCoefficient.toFixed(2)}`
                    ].join("\n"))
            )
            .addSeparatorComponents(
                new SeparatorBuilder()
                    .setDivider(true)
                    .setSpacing(SeparatorSpacingSize.Small)
            )
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent([
                        `**${interaction.client.language({ textId: this.playerCoefficient <= this.currentCoefficient ? `🎉Ты выиграл:` : this.crashPoint > this.currentCoefficient ? `💰Выигрыш:` : `💸Ты проиграл:`, guildId: interaction.guildId, locale: interaction.locale })}**`,
                        `${serverItemEmoji}${serverItemName} (${this.betAmount.toLocaleString()}) ➜ ${serverItemEmoji}${serverItemName} (${Number(String(new Decimal(this.betAmount).mul((new Decimal(this.playerCoefficient <= this.currentCoefficient ? this.playerCoefficient : this.crashPoint > this.currentCoefficient ? this.currentCoefficient : 0))))).toLocaleString()})`
                    ].join("\n"))
            )
            .setAccentColor(this.playerCoefficient <= this.currentCoefficient ? Colors.Green : this.crashPoint > this.currentCoefficient ? undefined : Colors.Red)
    }
}
module.exports = CrashGame