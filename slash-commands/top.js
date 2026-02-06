const { 
    ButtonBuilder, ButtonStyle, ActionRowBuilder, 
    EmbedBuilder, Collection, ApplicationCommandOptionType, TextInputStyle, 
    ModalBuilder, TextInputBuilder, LabelBuilder 
} = require("discord.js");

// Константы для регулярных выражений
const REGEX = {
    USER: /usr{(.*?)}/,
    LIMIT: /lim{(.*?)}/,
    SELECTION: /sel{(.*?)}/,
    ITEM: /item<(.*?)>/
};

// Константы для валидных selections
const VALID_SELECTIONS = new Set([
    "alltime.totalxp", "alltime.seasonTotalXp", "alltime.hours", "alltime.messages", 
    "alltime.likes", "alltime.currency", "alltime.invites", "alltime.bumps", 
    "alltime.wormholeTouched", "alltime.rp", "alltime.giveawaysCreated", "alltime.doneQuests",
    "weekly.totalxp", "weekly.hours", "weekly.messages", "weekly.likes", "weekly.currency", 
    "weekly.invites", "weekly.bumps", "weekly.wormholeTouched", "weekly.rp", 
    "weekly.giveawaysCreated", "weekly.doneQuests", "yearly.totalxp", "monthly.totalxp", 
    "daily.totalxp", "yearly.hours", "monthly.hours", "daily.hours", "yearly.messages", 
    "monthly.messages", "daily.messages", "yearly.likes", "monthly.likes", "daily.likes", 
    "yearly.currency", "monthly.currency", "daily.currency", "yearly.invites", 
    "monthly.invites", "daily.invites", "yearly.bumps", "monthly.bumps", "daily.bumps", 
    "yearly.wormholeTouched", "monthly.wormholeTouched", "daily.wormholeTouched", 
    "yearly.rp", "monthly.rp", "daily.rp", "yearly.giveawaysCreated", 
    "monthly.giveawaysCreated", "daily.giveawaysCreated", "yearly.doneQuests", 
    "monthly.doneQuests", "daily.doneQuests"
]);

// Локализация команд
const COMMAND_OPTIONS = [
    {
        name: 'statistics',
        nameLocalizations: { 'ru': 'статистика', 'uk': 'статистика', 'es-ES': 'estadísticas' },
        description: 'Top leaders by profile statistics',
        descriptionLocalizations: { 
            'ru': 'Топ лидеров по статистике профиля', 
            'uk': 'Топ лідерів за статистикою профілю', 
            'es-ES': 'Top líderes por estadísticas de perfil' 
        },
        type: ApplicationCommandOptionType.Subcommand,
        options: [
            {
                name: 'selection',
                nameLocalizations: { 'ru': 'выборка', 'uk': 'вибірка', 'es-ES': 'selección' },
                description: 'Parameters of selection',
                descriptionLocalizations: { 
                    'ru': 'Параметры выборки', 
                    'uk': 'Параметри вибірки', 
                    'es-ES': 'Parámetros de selección' 
                },
                type: ApplicationCommandOptionType.String,
                required: true,
                autocomplete: true    
            },
            {
                name: 'ephemeral',
                nameLocalizations: { 'ru': 'эфемерный', 'uk': 'тимчасовий', 'es-ES': 'efímero' },
                description: 'Message visible only for you',
                descriptionLocalizations: { 
                    'ru': 'Сообщение видно только тебе', 
                    'uk': 'Повідомлення видно тільки вам', 
                    'es-ES': 'Mensaje visible solo para ti' 
                },
                type: ApplicationCommandOptionType.Boolean
            }
        ]
    },
    {
        name: 'item',
        nameLocalizations: { 'ru': 'предмет', 'uk': 'предмет', 'es-ES': 'objeto' },
        description: 'Top leaders by item',
        descriptionLocalizations: { 
            'ru': 'Топ лидеров по предмету', 
            'uk': 'Топ лідерів за предметом', 
            'es-ES': 'Top líderes por objeto' 
        },
        type: ApplicationCommandOptionType.Subcommand,
        options: [
            {
                name: 'name',
                nameLocalizations: { 'ru': 'название', 'uk': 'назва', 'es-ES': 'nombre' },
                description: 'Item name',
                descriptionLocalizations: { 
                    'ru': 'Название предмета', 
                    'uk': 'Назва предмету', 
                    'es-ES': 'Nombre del objeto' 
                },
                type: ApplicationCommandOptionType.String,
                autocomplete: true,
                required: true
            },
            {
                name: 'ephemeral',
                nameLocalizations: { 'ru': 'эфемерный', 'uk': 'тимчасовий', 'es-ES': 'efímero' },
                description: 'Message visible only for you',
                descriptionLocalizations: { 
                    'ru': 'Сообщение видно только тебе', 
                    'uk': 'Повідомлення видно тільки вам', 
                    'es-ES': 'Mensaje visible solo para ti' 
                },
                type: ApplicationCommandOptionType.Boolean
            }
        ]
    }
];

module.exports = {
    name: "top",
    nameLocalizations: { "ru": "топ", "uk": "топ", "es-ES": "top" },
    description: "View leaderboard of guild",
    descriptionLocalizations: { 
        "ru": "Посмотреть таблицу лидеров сервера", 
        "uk": "Переглянути таблицю лідерів сервера", 
        "es-ES": "Ver la tabla de clasificación del servidor" 
    },
    options: COMMAND_OPTIONS,
    dmPermission: false,
    group: "general-group",
    cooldowns: new Collection(),

    /**
     * @param {Client} client
     * @param {CommandInteraction} interaction
     * @param {Object[]} args
     */
    run: async (client, interaction, args) => {
        if (interaction.isChatInputCommand()) {
            await handleChatInputCommand(client, interaction, args);
        } else {
            await handleComponentInteraction(client, interaction);
        }
    }
};

/**
 * Обработка текстовой команды
 */
async function handleChatInputCommand(client, interaction, args) {
    if (args.Subcommand === "statistics" && !VALID_SELECTIONS.has(args.selection)) {
        return interaction.reply({ 
            content: `${client.config.emojis.NO}${getLocalizedText(client, interaction, "Выберите выборку из списка")}`, 
            flags: ["Ephemeral"] 
        });
    }

    await interaction.deferReply({ flags: args.ephemeral ? ["Ephemeral"] : undefined });
    await processLeaderboard(client, interaction, args);
}

/**
 * Обработка взаимодействия с компонентами
 */
async function handleComponentInteraction(client, interaction) {
    const components = interaction.message?.components;
    const userId = REGEX.USER.exec(interaction.customId)?.[1];
    
    if (userId !== interaction.user.id) {
        return interaction.deferUpdate().catch(() => null);
    }

    if (interaction.customId.includes("page")) {
        await handlePageModal(client, interaction, components);
    } else {
        await processLeaderboard(client, interaction);
    }
}

/**
 * Обработка модального окна для выбора страницы
 */
async function handlePageModal(client, interaction, components) {
    const modal = createPageModal(client, interaction);
    await interaction.showModal(modal);
    
    delete client.globalCooldown[`${interaction.guildId}_${interaction.user.id}`];
    
    const filter = (i) => i.customId === modal.data.custom_id && i.user.id === interaction.user.id;
    const modalInteraction = await interaction.awaitModalSubmit({ filter, time: 60000 }).catch(() => interaction);
    
    if (!modalInteraction?.isModalSubmit()) return;

    await processPageModalSubmit(client, modalInteraction, components);
}

/**
 * Создание модального окна для выбора страницы
 */
function createPageModal(client, interaction) {
    return new ModalBuilder()
        .setCustomId(`top_page_${interaction.id}`)
        .setTitle(getLocalizedText(client, interaction, "Страница"))
        .setLabelComponents([
            new LabelBuilder()
                .setLabel(getLocalizedText(client, interaction, "Номер страницы"))
                .setTextInputComponent(
                    new TextInputBuilder()
                        .setCustomId("page")
                        .setRequired(true)
                        .setStyle(TextInputStyle.Short)
                )
        ]);
}

/**
 * Обработка отправки модального окна страницы
 */
async function processPageModalSubmit(client, interaction, components) {
    const pageInput = interaction.fields.getTextInputValue("page");
    const page = parseInt(pageInput);
    
    if (isNaN(page) || !Number.isInteger(page)) {
        await interaction.update({ components });
        return interaction.followUp({ 
            content: `${client.config.emojis.NO} **${pageInput}** ${getLocalizedText(client, interaction, "не является целым числом")}`, 
            flags: ["Ephemeral"] 
        });
    }

    const selection = getSelectionFromInteraction(interaction);
    const profiles = await client.functions.fetchLeaderboard(client, interaction.guild.id, selection)
        .then(collection => collection.map(user => user));
    
    const totalPages = Math.ceil(profiles.length / 10);
    
    if (page <= 0 || page > totalPages) {
        await interaction.update({ components });
        return interaction.followUp({ 
            content: `${client.config.emojis.NO} ${getLocalizedText(client, interaction, "Такой страницы не существует")}`, 
            flags: ["Ephemeral"] 
        });
    }

    await processLeaderboard(client, interaction, { page });
}

/**
 * Основная обработка таблицы лидеров
 */
async function processLeaderboard(client, interaction, args = {}) {
    const selection = getSelection(interaction, args);
    let { min = 0, limit = 10 } = calculatePagination(interaction, args);
    
    let profiles = await client.functions.fetchLeaderboard(client, interaction.guild.id, selection)
        .then(collection => collection.map(profile => profile));

    // Обработка поиска пользователя
    if (interaction.customId?.includes("findYourself")) {
        const userIndex = profiles.findIndex(e => (e.userID || e._userID) === interaction.user.id);
        if (userIndex === -1) {
            await interaction.deferUpdate()
            return interaction.followUp({ 
                content: `${client.config.emojis.NO}${getLocalizedText(client, interaction, "Ты не найден в таблице лидеров.")}`, 
                flags: ["Ephemeral"] 
            });
        }
        limit = Math.ceil((userIndex + 1) / 10) * 10;
        min = limit - 10;
    }

    const leaderboardData = await prepareLeaderboardData(client, interaction, profiles, selection, min, limit);
    
    if (interaction.isChatInputCommand()) {
        return interaction.editReply(leaderboardData);
    } else {
        return interaction.update(leaderboardData);
    }
}

/**
 * Получение selection из взаимодействия
 */
function getSelection(interaction, args) {
    if (interaction.isChatInputCommand()) {
        return args.Subcommand === "statistics" ? args.selection : `item<${args.name}>`;
    }
    return REGEX.SELECTION.exec(interaction.customId)?.[1] || "alltime.totalxp";
}

/**
 * Расчет пагинации
 */
function calculatePagination(interaction, args) {
    if (args.page) {
        const limit = args.page * 10;
        return { min: limit - 10, limit };
    }
    
    if (!interaction.isChatInputCommand() && interaction.customId) {
        const limitMatch = REGEX.LIMIT.exec(interaction.customId);
        if (limitMatch) {
            const limit = parseInt(limitMatch[1]);
            return { min: limit - 10, limit };
        }
    }
    
    return { min: 0, limit: 10 };
}

/**
 * Подготовка данных для таблицы лидеров
 */
async function prepareLeaderboardData(client, interaction, profiles, selection, min, limit) {
    const settings = client.cache.settings.get(interaction.guildId);
    const dateText = getDateText(client, interaction, selection);
    const contextText = getContextText(client, interaction, selection);
    
    // Создание компонентов
    const buttons = createPaginationButtons(client, interaction, selection, profiles.length, min, limit);
    const firstRow = new ActionRowBuilder().addComponents(buttons);
    const findYourselfRow = createFindYourselfButton(client, interaction, selection, limit);
    
    let leaderboard = [];
    let item = null;
    
    // Обработка предметов
    if (selection.includes("item")) {
        if (profiles.length) leaderboard = profiles.slice(min, limit);
        item = findItem(client, interaction, selection);
        
        if (!item) {
            const content = `${client.config.emojis.NO}${getLocalizedText(client, interaction, "Предмет не найден")}`;
            return interaction.isChatInputCommand() 
                ? { content } 
                : { content, components: interaction.message?.components };
        }
    } else if (profiles.length) {
        const slicedProfiles = profiles.slice(min, limit);
        leaderboard = await client.functions.computeLeaderboard(slicedProfiles, selection, min);
    }
    
    // Проверка пустой таблицы лидеров
    if (profiles.length < 1) {
        const content = createEmptyLeaderboardMessage(client, interaction, contextText, dateText);
        return { content };
    }
    
    // Создание эмбедов
    const embeds = await createLeaderboardEmbeds(client, interaction, leaderboard, settings, selection, item);
    
    const content = `# ${getLocalizedText(client, interaction, "Таблица лидеров")} ${contextText}${dateText} ${getLocalizedText(client, interaction, "на сервере")} ${interaction.guild.name}`;
    
    return {
        content,
        embeds,
        components: [firstRow, findYourselfRow]
    };
}

/**
 * Создание кнопок пагинации
 */
function createPaginationButtons(client, interaction, selection, totalProfiles, min, limit) {
    const totalPages = Math.ceil(totalProfiles / 10);
    const currentPage = Math.ceil(limit / 10);
    
    const isFirstPage = min === 0;
    const isLastPage = min >= totalProfiles - 10;
    
    return [
        new ButtonBuilder()
            .setEmoji(client.config.emojis.arrowLeft2)
            .setStyle(ButtonStyle.Secondary)
            .setCustomId(`usr{${interaction.user.id}}cmd{top}lim{10}sel{${selection}}1`)
            .setDisabled(isFirstPage),
        new ButtonBuilder()
            .setEmoji(client.config.emojis.arrowLeft)
            .setStyle(ButtonStyle.Secondary)
            .setCustomId(`usr{${interaction.user.id}}cmd{top}lim{${limit - 10}}sel{${selection}}2`)
            .setDisabled(isFirstPage),
        new ButtonBuilder()
            .setLabel(`${currentPage}/${totalPages}`)
            .setStyle(ButtonStyle.Secondary)
            .setCustomId(`usr{${interaction.user.id}}cmd{top} page sel{${selection}}`)
            .setDisabled(totalProfiles <= 10),
        new ButtonBuilder()
            .setEmoji(client.config.emojis.arrowRight)
            .setStyle(ButtonStyle.Secondary)
            .setCustomId(`usr{${interaction.user.id}}cmd{top}lim{${limit + 10}}sel{${selection}}3`)
            .setDisabled(isLastPage),
        new ButtonBuilder()
            .setEmoji(client.config.emojis.arrowRight2)
            .setStyle(ButtonStyle.Secondary)
            .setCustomId(`usr{${interaction.user.id}}cmd{top}lim{${Math.ceil(totalProfiles / 10) * 10}}sel{${selection}}4`)
            .setDisabled(isLastPage)
    ];
}

/**
 * Создание кнопки "Найти себя"
 */
function createFindYourselfButton(client, interaction, selection, limit) {
    return new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setLabel(getLocalizedText(client, interaction, "Найти себя"))
            .setStyle(ButtonStyle.Primary)
            .setCustomId(`usr{${interaction.user.id}}cmd{top}lim{${limit}}sel{${selection}}findYourself`)
    );
}

/**
 * Получение текста даты
 */
function getDateText(client, interaction, selection) {
    const date = new Date();
    
    if (selection.includes("daily")) {
        return ` ${getLocalizedText(client, interaction, "за")} ${formatDate(date)}`;
    }
    
    if (selection.includes("weekly")) {
        const { startOfWeek, endOfWeek } = require("date-fns");
        const startDate = startOfWeek(date, { weekStartsOn: 1 });
        const endDate = endOfWeek(date, { weekStartsOn: 1 });
        return ` ${getLocalizedText(client, interaction, "с")} ${formatDate(startDate)} ${getLocalizedText(client, interaction, "по")} ${formatDate(endDate)}`;
    }
    
    if (selection.includes("monthly")) {
        const months = [
            getLocalizedText(client, interaction, "январь"), getLocalizedText(client, interaction, "февраль"),
            getLocalizedText(client, interaction, "март"), getLocalizedText(client, interaction, "апрель"),
            getLocalizedText(client, interaction, "май"), getLocalizedText(client, interaction, "июнь"),
            getLocalizedText(client, interaction, "июль"), getLocalizedText(client, interaction, "август"),
            getLocalizedText(client, interaction, "сентябрь"), getLocalizedText(client, interaction, "октябрь"),
            getLocalizedText(client, interaction, "ноябрь"), getLocalizedText(client, interaction, "декабрь")
        ];
        return ` ${getLocalizedText(client, interaction, "за")} ${months[date.getMonth()]} ${date.getFullYear()}`;
    }
    
    if (selection.includes("yearly")) {
        return ` ${getLocalizedText(client, interaction, "за")} ${date.getFullYear()} ${getLocalizedText(client, interaction, "год")}`;
    }
    
    if (selection.includes("alltime")) {
        return ` ${getLocalizedText(client, interaction, "за все время")}`;
    }
    
    return "";
}

/**
 * Форматирование даты
 */
function formatDate(date) {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${day}.${month}.${date.getFullYear()}`;
}

/**
 * Получение контекстного текста
 */
function getContextText(client, interaction, selection) {
    if (selection.includes("item")) {
        return getLocalizedText(client, interaction, "по предмету");
    }
    return getLocalizedText(client, interaction, `!${selection.slice(selection.indexOf(".") + 1)}`);
}

/**
 * Поиск предмета
 */
function findItem(client, interaction, selection) {
    const itemId = REGEX.ITEM.exec(selection)[1];
    return client.cache.items.find(e => 
        e.guildID === interaction.guildId && 
        (e.itemID === itemId || e.name.toLowerCase().includes(itemId.toLowerCase()))
    );
}

/**
 * Создание сообщения для пустой таблицы лидеров
 */
function createEmptyLeaderboardMessage(client, interaction, contextText, dateText) {
    return `# ${getLocalizedText(client, interaction, "Таблица лидеров")} ${contextText}${dateText} ${getLocalizedText(client, interaction, "на сервере")} ${interaction.guild.name}\n${client.config.emojis.NO} ${getLocalizedText(client, interaction, "В таблице лидеров пока никого нет")}`;
}

/**
 * Создание эмбедов для таблицы лидеров
 */
async function createLeaderboardEmbeds(client, interaction, leaderboard, settings, selection, item) {
    const embeds = [];
    
    for (const profile of leaderboard) {
        const userId = profile.userID || profile._userID;
        const member = await interaction.guild.members.fetch(userId).catch(() => null);
        const embed = new EmbedBuilder()
            .setTitle(`${profile.position}. ${member?.displayName || `<@${userId}>`} | Lvl 🎖${profile.level || profile._level}${settings.seasonLevelsEnabled ? ` | SLvl ${client.config.emojis.seasonLevel}${profile.seasonLevel || profile._seasonLevel}` : ""}`);
        
        if (!selection.includes("item")) {
            embed.setDescription(createProfileDescription(interaction, profile, settings));
        } else {
            embed.setDescription(createItemProfileDescription(interaction, profile, item));
        }
        
        if (member) {
            embed.setColor(member.displayHexColor || null)
                 .setThumbnail(member.displayAvatarURL() || null);
        }
        
        embeds.push(embed);
    }
    
    return embeds;
}

/**
 * Создание описания профиля
 */
function createProfileDescription(interaction, profile, settings) {
    const { client } = interaction
    const formatNumber = (num) => num < 10000 ? num.toFixed(2) : `${(num/1000).toFixed(0)}K`;
    
    return `${getLocalizedText(client, interaction, "Профиль")}: <@${profile.userID}>\n` +
           `${client.config.emojis.XP}${formatNumber(profile.totalxp)} ` +
           `${settings.seasonLevelsEnabled ? `${client.config.emojis.seasonXP}${formatNumber(profile.seasonTotalXp)} ` : ""}` +
           `${client.config.emojis.mic}${profile.hours.toLocaleString()} ` +
           `${client.config.emojis.message}️${profile.messages.toLocaleString()} ` +
           `${client.config.emojis.heart}${profile.likes.toLocaleString()} ` +
           `${settings.displayCurrencyEmoji}${profile.currency.toLocaleString()} ` +
           `${client.config.emojis.invite}${profile.invites.toLocaleString()} ` +
           `${client.config.emojis.bump} ${profile.bumps.toLocaleString()} ` +
           `${client.config.emojis.giveaway}${profile.giveawaysCreated.toLocaleString()} ` +
           `${client.config.emojis.wormhole}${profile.wormholeTouched.toLocaleString()} ` +
           `${client.config.emojis.RP} ${profile.rp.toLocaleString()} ` +
           `${client.config.emojis.quests}${profile.doneQuests.toLocaleString()}`;
}

/**
 * Создание описания профиля для предметов
 */
function createItemProfileDescription(interaction, profile, item) {
    const { client } = interaction
    return `${getLocalizedText(client, interaction, "Профиль")}: <@${profile._userID}>\n` +
           `${item?.displayEmoji || ""}${item?.name} (${profile.amount?.toLocaleString() || 0})`;
}

/**
 * Вспомогательная функция для локализации текста
 */
function getLocalizedText(client, interaction, textId) {
    return client.language({ 
        textId, 
        guildId: interaction.guildId, 
        locale: interaction.locale 
    });
}

/**
 * Получение selection из interaction для модального окна
 */
function getSelectionFromInteraction(interaction) {
    return REGEX.SELECTION.exec(interaction.customId)?.[1] || "alltime.totalxp";
}