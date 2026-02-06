const { ApplicationCommandOptionType, Collection, MessageFlags } = require("discord.js");
const CrashGame = require("../classes/CrashGame");
const { AchievementType, RewardType } = require("../enums");

// Кэшированные регулярные выражения
const idRegexp = /id{(.*?)}/;
const coefficientRegexp = /coefficient\{([-+]?\d*\.?\d+)\}/;
const crashGames = new Collection();

// Константы для оптимизации
const GAME_UPDATE_INTERVAL = 1000;
const COEFFICIENT_FACTOR = 0.1;
const DECIMAL_PLACES = 2;

module.exports = {
    name: 'crash',
    nameLocalizations: { 'ru': 'краш', 'uk': 'краш', 'es-ES': 'crash' },
    description: 'Play Crash',
    descriptionLocalizations: { 'ru': 'Играть в Краш', 'uk': 'Грати в Краш', 'es-ES': 'Jugar al Crash' },
    options: [
        {
            name: 'bet',
            nameLocalizations: { 'ru': 'ставка', 'uk': 'ставка', 'es-ES': 'apuesta' },
            description: 'Place a bet',
            descriptionLocalizations: { 'ru': 'Поставить ставку', 'uk': 'Зробити ставку', 'es-ES': 'Hacer una apuesta' },
            type: ApplicationCommandOptionType.String,
            required: true,
            autocomplete: true
        },
        {
            name: 'amount',
            nameLocalizations: { 'ru': 'количество', 'uk': 'кількість', 'es-ES': 'cantidad' },
            description: 'Bet amount',
            descriptionLocalizations: { 'ru': 'Количество ставки', 'uk': 'Кількість ставки', 'es-ES': 'Cantidad de la apuesta' },
            min_value: 1,
            type: ApplicationCommandOptionType.Integer,
            required: true
        },
        {
            name: 'auto_withdraw',
            nameLocalizations: { 'ru': 'авто_вывод', 'uk': 'авто_висновок', 'es-ES': 'tirada_automática' },
            description: 'Automatic withdrawal of funds',
            descriptionLocalizations: { 'ru': 'Автоматический вывод средств', 'uk': 'Автоматичне виведення коштів', 'es-ES': 'Retiro automático de fondos' },
            type: ApplicationCommandOptionType.Number,
            min_value: 1.01,
            max_value: 100000,
            required: false,
        }
    ],
    dmPermission: false,
    group: 'games-group',
    cooldowns: new Collection(),

    /**
     * @param {Client} client
     * @param {CommandInteraction} interaction
     * @param {String[]} args
     */
    run: async (client, interaction, args) => {
        // Обработка кнопки вывода
        if (interaction.isButton() && interaction.customId.includes("withdraw")) {
            return handleWithdrawButton(client, interaction);
        }

        // Валидация auto_withdraw
        if (args.auto_withdraw && args.auto_withdraw.toString().split('.')[1]?.length > DECIMAL_PLACES) {
            return interaction.reply({ 
                content: client.language({ 
                    textId: 'Количество знаков ставки после точки не должно быть больше 2', 
                    guildId: interaction.guildId, 
                    locale: interaction.locale 
                }), 
                flags: [MessageFlags.Ephemeral] 
            });
        }

        const profile = await client.functions.fetchProfile(client, interaction.user.id, interaction.guildId);
        const settings = client.cache.settings.get(interaction.guildId);
        
        let serverItem, userItem;
        
        // Обработка ставки предметом
        if (args.bet !== "currency") {
            const itemResult = await handleItemBet(client, interaction, args, profile);
            if (itemResult.error) return itemResult.error;
            ({ serverItem, userItem } = itemResult);
        }

        // Проверка баланса
        const balanceCheck = checkBalance(client, interaction, args, profile, userItem, serverItem, settings);
        if (balanceCheck.error) return interaction.reply(balanceCheck.error);

        // Списание ставки
        await deductBet(args, profile, serverItem);

        // Создание и запуск игры
        await startCrashGame(client, interaction, args, serverItem, crashGames);
    }
};

// Вспомогательные функции
async function handleWithdrawButton(client, interaction) {
    const id = idRegexp.exec(interaction.customId)[1];
    const crashGame = crashGames.get(id);
    
    if (crashGame.userId !== interaction.user.id) {
        return interaction.reply({ 
            content: `${client.config.emojis.NO}${client.language({ 
                textId: 'Эта игра не для вас!', 
                guildId: interaction.guildId, 
                locale: interaction.locale 
            })}`, 
            flags: [MessageFlags.Ephemeral] 
        });
    }

    if (!crashGame.rewarded) {
        const coefficient = Number(coefficientRegexp.exec(interaction.customId)[1]);
        crashGame.withdrawCoefficient = coefficient;
        await crashGame.addReward();    
    }

    return interaction.update({
        components: [crashGame.getContainer(interaction)],
        flags: [MessageFlags.IsComponentsV2] 
    });
}

async function handleItemBet(client, interaction, args, profile) {
    const filteredItems = client.cache.items.filter(e => 
        e.guildID === interaction.guildId && 
        !e.temp && 
        e.enabled && 
        e.name.toLowerCase().includes(args.bet.toLowerCase()) && 
        profile.inventory.some(x => x.itemID == e.itemID)
    );

    if (filteredItems.size > 1 && !filteredItems.some(e => e.name.toLowerCase() === args.bet.toLowerCase())) {
        const itemsList = Array.from(filteredItems.values(), item => 
            `> ${item.displayEmoji}**${item.name}**`
        ).join('\n');
        
        return { error: interaction.reply({ 
            content: `${client.config.emojis.block} ${client.language({ 
                textId: 'По вашему запросу было найдено несколько предметов', 
                guildId: interaction.guildId, 
                locale: interaction.locale 
            })}:\n${itemsList}`, 
            flags: [MessageFlags.Ephemeral] 
        }) };
    }

    const serverItem = filteredItems.find(e => e.name.toLowerCase() === args.bet.toLowerCase()) || filteredItems.first();
    if (!serverItem) {
        return { error: interaction.reply({ 
            content: `${client.config.emojis.NO} ${client.language({ 
                textId: 'Предмет не найден', 
                guildId: interaction.guildId, 
                locale: interaction.locale 
            })}.`, 
            flags: [MessageFlags.Ephemeral] 
        }) };
    }

    if (serverItem.notCrashable) {
        return { error: interaction.reply({ 
            content: `${client.config.emojis.NO} ${client.language({ 
                textId: 'Этот предмет нельзя поставить в краше', 
                guildId: interaction.guildId, 
                locale: interaction.locale 
            })}`, 
            flags: [MessageFlags.Ephemeral] 
        }) };
    }

    const userItem = profile.inventory.find(e => e.itemID == serverItem.itemID && e.amount > 0);
    if (!userItem) {
        return { error: interaction.reply({ 
            content: `‼ ${client.language({ 
                textId: 'В инвентаре нет такого предмета', 
                guildId: interaction.guildId, 
                locale: interaction.locale 
            })}: **${serverItem.displayEmoji}${serverItem.name}**`, 
            flags: [MessageFlags.Ephemeral] 
        }) };
    }

    return { serverItem, userItem };
}

function checkBalance(client, interaction, args, profile, userItem, serverItem, settings) {
    const currentBalance = args.bet === "currency" ? profile.currency : userItem?.amount;
    if (currentBalance < args.amount) {
        const serverItemEmoji = args.bet === "currency" ? settings.displayCurrencyEmoji : serverItem?.displayEmoji;
        const serverItemName = args.bet === "currency" ? settings.currencyName : serverItem?.name;
        
        return { error: { 
            content: `${client.config.emojis.NO} ${client.language({ 
                textId: "В инвентаре", 
                guildId: interaction.guildId, 
                locale: interaction.locale 
            })} ${serverItemEmoji}${serverItemName} (${currentBalance})`, 
            flags: [MessageFlags.Ephemeral] 
        } };
    }
    
    return { success: true };
}

async function deductBet(args, profile, serverItem) {
    if (args.bet !== "currency") {
        await profile.subtractItem({ itemID: serverItem.itemID, amount: args.amount });
    } else {
        await profile.subtractCurrency({ amount: args.amount });
    }
    await profile.save();
}

async function startCrashGame(client, interaction, args, serverItem, crashGames) {
    const rewardType = args.bet === "currency" ? RewardType.Currency : RewardType.Item;
    const crashGame = new CrashGame(client, interaction.user.id, interaction.guildId, rewardType, args.amount, serverItem);
    
    crashGames.set(crashGame.id, crashGame);
    if (args.auto_withdraw) crashGame.setAutoWithdraw(args.auto_withdraw);
    crashGame.getCrashPoint();
    
    await interaction.deferReply();
    const startTime = Date.now();
    
    crashGame.gameLoop = setInterval(async () => {
        const elapsedSeconds = (Date.now() - startTime) * 0.001;
        crashGame.currentCoefficient = Number(Math.exp(elapsedSeconds * COEFFICIENT_FACTOR).toFixed(DECIMAL_PLACES));
        
        // Ограничение коэффициента
        if (crashGame.currentCoefficient > crashGame.crashPoint) {
            crashGame.currentCoefficient = crashGame.crashPoint;
        }
        
        // Автоматический вывод
        if (!crashGame.rewarded && 
            !crashGame.withdrawCoefficient && 
            crashGame.autoWithdraw && 
            crashGame.autoWithdraw <= crashGame.crashPoint && 
            crashGame.currentCoefficient >= crashGame.autoWithdraw) {
            
            crashGame.rewarded = true;
            await crashGame.addReward();
        }
        
        // Обновление интерфейса
        const isGameActive = crashGame.currentCoefficient < crashGame.crashPoint;
        if (isGameActive) {
            await updateGameInterface(interaction, crashGame);
        }
        
        // Завершение игры
        if (!isGameActive) {
            clearInterval(crashGame.gameLoop);
            await updateGameInterface(interaction, crashGame);
        }
    }, GAME_UPDATE_INTERVAL);
}

async function updateGameInterface(interaction, crashGame) {
    await interaction.editReply({
        components: [crashGame.getContainer(interaction)],
        flags: [MessageFlags.IsComponentsV2]
    });
}