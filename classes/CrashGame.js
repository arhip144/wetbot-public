const { ContainerBuilder, TextDisplayBuilder, SeparatorBuilder, SeparatorSpacingSize, Colors, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js")
const { RewardType, AchievementType } = require("../enums")
const uniqid = require('uniqid')
const Decimal = require("decimal.js")
class CrashGame {
    constructor(client, userId, guildId, betType, betAmount, item) {
        this.client = client
        this.userId = userId
        this.guildId = guildId
        this.id = uniqid.time()
        this.currentCoefficient = 1
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
        const container =  new ContainerBuilder()
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
                        `x${this.crashPoint > this.currentCoefficient ? this.currentCoefficient : this.crashPoint.toFixed(2)}`
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
                        `**${interaction.client.language({ textId: (this.autoWithdraw <= this.currentCoefficient && this.currentCoefficient <= this.crashPoint) || this.withdrawCoefficient ? `🎉Ты выиграл:` : this.crashPoint > this.currentCoefficient ? `💰Выигрыш:` : `💸Ты проиграл:`, guildId: interaction.guildId, locale: interaction.locale })}**`,
                        `${serverItemEmoji}${serverItemName} (${this.betAmount.toLocaleString()}) × ${!this.withdrawCoefficient && this.autoWithdraw && this.autoWithdraw <= this.currentCoefficient && this.currentCoefficient <= this.crashPoint ? this.autoWithdraw.toFixed(2) : this.crashPoint > this.currentCoefficient && !this.withdrawCoefficient ? this.currentCoefficient : this.withdrawCoefficient ? this.withdrawCoefficient.toFixed(2) : 0} ➜ ${serverItemEmoji}${serverItemName} (${this.multiplyBet()})`
                    ].join("\n"))
            )
            .setAccentColor((this.autoWithdraw && this.autoWithdraw <= this.currentCoefficient && this.currentCoefficient <= this.crashPoint) || this.withdrawCoefficient ? Colors.Green : this.crashPoint > this.currentCoefficient ? undefined : Colors.Red)
        if (this.autoWithdraw) {
            container.spliceComponents(4, 0, 
                [
                    new TextDisplayBuilder()
                        .setContent([
                            `**💰${interaction.client.language({ textId: `Авто-вывод:`, guildId: interaction.guildId, locale: interaction.locale })}**`,
                            `x${this.autoWithdraw.toFixed(2)}`
                        ].join("\n")),
                    new SeparatorBuilder()
                        .setDivider(true)
                        .setSpacing(SeparatorSpacingSize.Small)
                ]
            )
        }
        if (!this.gameIsEnded()) {
            container.addActionRowComponents(
                new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId(`cmd{crash}id{${this.id}}coefficient{${this.currentCoefficient}}withdraw`)
                            .setLabel(`${this.multiplyBet()} (${interaction.client.language({ textId: `Вывести`, guildId: interaction.guildId, locale: interaction.locale })})`)
                            .setEmoji(serverItemEmoji)
                            .setStyle(ButtonStyle.Success)
                    )
            )
        }
        return container
    }
    gameIsEnded() {
        return this.autoWithdraw <= this.currentCoefficient || this.crashPoint <= this.currentCoefficient || this.withdrawCoefficient
    }
    multiplyBet() {
        return Number(String(new Decimal(this.betAmount).mul((new Decimal(!this.withdrawCoefficient && this.autoWithdraw && this.autoWithdraw <= this.currentCoefficient ? +this.autoWithdraw.toFixed(2) : this.withdrawCoefficient ? +this.withdrawCoefficient.toFixed(2) : this.crashPoint > this.currentCoefficient ? this.currentCoefficient : 0))))).toLocaleString()
    }
    setAutoWithdraw(coefficient) {
        this.autoWithdraw = coefficient
    }
    async addReward() {
        const profile = await this.client.functions.fetchProfile(this.client, this.userId, this.guildId)
        if (this.betType === RewardType.Item) {
            await profile.addItem({ itemID: this.betItem.itemID, amount: +`${new Decimal(this.betAmount).mul((new Decimal(this.withdrawCoefficient || this.autoWithdraw)))}` }) 
        } else {
            await profile.addCurrency({ amount: +`${new Decimal(this.betAmount).mul((new Decimal(this.withdrawCoefficient || this.autoWithdraw)))}` })
        }
        const achievements = this.client.cache.achievements.filter(e => e.guildID === this.guildId && e.enabled && e.type === AchievementType.Crash)
        await Promise.all(achievements.map(async achievement => {
            if (!profile.achievements?.some(ach => ach.achievmentID === achievement.id) && (this.withdrawCoefficient || this.autoWithdraw) >= achievement.amount && !this.client.tempAchievements[this.userId]?.includes(achievement.id)) { 
                if (!this.client.tempAchievements[this.userId]) this.client.tempAchievements[this.userId] = []
                this.client.tempAchievements[this.userId].push(achievement.id)
                await profile.addAchievement({ achievement })
            }
        }))
        return await profile.save()
    }
}
module.exports = CrashGame