const { ApplicationCommandOptionType, EmbedBuilder, Collection, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js")
const limitRegexp = /lim{(.*?)}/
const Decimal = require('decimal.js')
module.exports = {
name: 'config',
    nameLocalizations: {
        'ru': `конфиг`,
        'uk': `налаштування`,
        'es-ES': `configuración`
    },
    description: 'Configure fishing, mining, voice items, messages items',
    descriptionLocalizations: {
        'ru': `Настроить рыбалку, майнинг, предметы за войс, предметы за сообщения`,
        'uk': `Налаштувати рибальство, майнінг, предмети за голосову активність, предмети за повідомлення`,
        'es-ES': `Configurar pesca, minería, objetos por voz, objetos por mensajes`
    },
    options: [
        {
            name: 'fishing',
            nameLocalizations: {
                'ru': `рыбалка`,
                'uk': `рибальство`,
                'es-ES': `pesca`
            },
            description: 'Fishing config',
            descriptionLocalizations: {
                'ru': `Конфиг рыбалки`,
                'uk': `Налаштування рибальства`,
                'es-ES': `Configuración de pesca`
            },
            type: ApplicationCommandOptionType.SubcommandGroup,
            options: [
                {
                    name: 'list',
                    nameLocalizations: {
                        'ru': `список`,
                        'uk': `список`,
                        'es-ES': `lista`
                    },
                    description: 'List of all fishing items',
                    descriptionLocalizations: {
                        'ru': `Список всех предметов в рыбалке`,
                        'uk': `Список усіх предметів у рибальстві`,
                        'es-ES': `Lista de todos los objetos de pesca`
                    },
                    type: ApplicationCommandOptionType.Subcommand,
                },
                {
                    name: 'add-edit',
                    nameLocalizations: {
                        'ru': `добавить-изменить`,
                        'uk': `додати-змінити`,
                        'es-ES': `añadir-editar`
                    },
                    description: 'Add item to fishing or edit',
                    descriptionLocalizations: {
                        'ru': `Добавить предмет в рыбалку или изменить`,
                        'uk': `Додати предмет у рибальство або змінити`,
                        'es-ES': `Añadir objeto a la pesca o editar`
                    },
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: 'item',
                            nameLocalizations: {
                                'ru': `предмет`,
                                'uk': `предмет`,
                                'es-ES': `objeto`
                            },
                            description: 'Name of item',
                            descriptionLocalizations: {
                                'ru': `Имя предмета`,
                                'uk': `Назва предмету`,
                                'es-ES': `Nombre del objeto`
                            },
                            minLength: 2,
                            type: ApplicationCommandOptionType.String,
                            autocomplete: true,
                            required: true,
                        },
                        {
                            name: 'chance',
                            nameLocalizations: {
                                'ru': `шанс`,
                                'uk': `шанс`,
                                'es-ES': `probabilidad`
                            },
                            description: 'Chance of catch',
                            descriptionLocalizations: {
                                'ru': `Шанс улова`,
                                'uk': `Шанс вилову`,
                                'es-ES': `Probabilidad de captura`
                            },
                            type: ApplicationCommandOptionType.Number,
                            required: true,
                            min_value: 0,
                            max_value: 100
                        },
                        {
                            name: 'min_amount',
                            nameLocalizations: {
                                'ru': `мин_количество`,
                                'uk': `мін_кількість`,
                                'es-ES': `cantidad_min`
                            },
                            description: 'Minimum amount',
                            descriptionLocalizations: {
                                'ru': `Минимальное количество`,
                                'uk': `Мінімальна кількість`,
                                'es-ES': `Cantidad mínima`
                            },
                            type: ApplicationCommandOptionType.Number,
                            required: true,
                            min_value: 0.01,
                            max_value: 1000
                        },
                        {
                            name: 'max_amount',
                            nameLocalizations: {
                                'ru': `макс_количество`,
                                'uk': `макс_кількість`,
                                'es-ES': `cantidad_max`
                            },
                            description: 'Max amount',
                            descriptionLocalizations: {
                                'ru': `Макс количество`,
                                'uk': `Макс кількість`,
                                'es-ES': `Cantidad máxima`
                            },
                            type: ApplicationCommandOptionType.Number,
                            required: true,
                            min_value: 0.01,
                            max_value: 1000
                        },
                        {
                            name: 'min_xp',
                            nameLocalizations: {
                                'ru': `мин_опыт`,
                                'uk': `мін_досвід`,
                                'es-ES': `exp_min`
                            },
                            description: 'Minimum XP gained per item',
                            descriptionLocalizations: {
                                'ru': `Минимальный получаемый опыт за предмет`,
                                'uk': `Мінімальний отримуваний досвід за предмет`,
                                'es-ES': `Experiencia mínima obtenida por objeto`
                            },
                            type: ApplicationCommandOptionType.Integer,
                            required: true,
                            min_value: 0,
                            max_value: 100000
                        },
                        {
                            name: 'max_xp',
                            nameLocalizations: {
                                'ru': `макс_опыт`,
                                'uk': `макс_досвід`,
                                'es-ES': `exp_max`
                            },
                            description: 'Maximum XP gained per item',
                            descriptionLocalizations: {
                                'ru': `Максимальный получаемый опыт за предмет`,
                                'uk': `Максимальний отримуваний досвід за предмет`,
                                'es-ES': `Experiencia máxima obtenida por objeto`
                            },
                            type: ApplicationCommandOptionType.Integer,
                            required: true,
                            min_value: 0,
                            max_value: 100000
                        }
                    ]
                },
                {
                    name: 'delete',
                    nameLocalizations: {
                        'ru': `удалить`,
                        'uk': `видалити`,
                        'es-ES': `eliminar`
                    },
                    description: 'Delete item from fishing',
                    descriptionLocalizations: {
                        'ru': `Удалить предмет из рыбалки`,
                        'uk': `Видалити предмет з рибальства`,
                        'es-ES': `Eliminar objeto de la pesca`
                    },
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: 'item',
                            nameLocalizations: {
                                'ru': `предмет`,
                                'uk': `предмет`,
                                'es-ES': `objeto`
                            },
                            description: 'Name of item',
                            descriptionLocalizations: {
                                'ru': `Имя предмета`,
                                'uk': `Назва предмету`,
                                'es-ES': `Nombre del objeto`
                            },
                            minLength: 2,
                            type: ApplicationCommandOptionType.String,
                            autocomplete: true,
                            required: true,
                        },
                    ]
                },
                {
                    name: 'delete-all',
                    nameLocalizations: {
                        'ru': `удалить-всё`,
                        'uk': `видалити-все`,
                        'es-ES': `eliminar-todo`
                    },
                    description: 'Delete all items from fishing',
                    descriptionLocalizations: {
                        'ru': `Удалить все предметы из рыбалки`,
                        'uk': `Видалити всі предмети з рибальства`,
                        'es-ES': `Eliminar todos los objetos de la pesca`
                    },
                    type: ApplicationCommandOptionType.Subcommand,
                }
            ]
        },
        {
            name: 'mining',
            nameLocalizations: {
                'ru': `майнинг`,
                'uk': `майнінг`,
                'es-ES': `minería`
            },
            description: 'Mining config',
            descriptionLocalizations: {
                'ru': `Конфиг майнинга`,
                'uk': `Налаштування майнінгу`,
                'es-ES': `Configuración de minería`
            },
            type: ApplicationCommandOptionType.SubcommandGroup,
            options: [
                {
                    name: 'list',
                    nameLocalizations: {
                        'ru': `список`,
                        'uk': `список`,
                        'es-ES': `lista`
                    },
                    description: 'List of all mining items',
                    descriptionLocalizations: {
                        'ru': `Список всех предметов в майнинге`,
                        'uk': `Список усіх предметів у майнінгу`,
                        'es-ES': `Lista de todos los objetos de minería`
                    },
                    type: ApplicationCommandOptionType.Subcommand,
                },
                {
                    name: 'add-edit',
                    nameLocalizations: {
                        'ru': `добавить-изменить`,
                        'uk': `додати-змінити`,
                        'es-ES': `añadir-editar`
                    },
                    description: 'Add item to mining or edit',
                    descriptionLocalizations: {
                        'ru': `Добавить предмет в майнинг или изменить`,
                        'uk': `Додати предмет у майнінг або змінити`,
                        'es-ES': `Añadir objeto a la minería o editar`
                    },
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: 'item',
                            nameLocalizations: {
                                'ru': `предмет`,
                                'uk': `предмет`,
                                'es-ES': `objeto`
                            },
                            description: 'Name of item',
                            descriptionLocalizations: {
                                'ru': `Имя предмета`,
                                'uk': `Назва предмету`,
                                'es-ES': `Nombre del objeto`
                            },
                            minLength: 2,
                            type: ApplicationCommandOptionType.String,
                            autocomplete: true,
                            required: true,
                        },
                        {
                            name: 'chance',
                            nameLocalizations: {
                                'ru': `шанс`,
                                'uk': `шанс`,
                                'es-ES': `probabilidad`
                            },
                            description: 'Chance of catch',
                            descriptionLocalizations: {
                                'ru': `Шанс нахождения`,
                                'uk': `Шанс знаходження`,
                                'es-ES': `Probabilidad de hallazgo`
                            },
                            type: ApplicationCommandOptionType.Number,
                            required: true,
                            min_value: 0,
                            max_value: 100
                        },
                        {
                            name: 'min_amount',
                            nameLocalizations: {
                                'ru': `мин_количество`,
                                'uk': `мін_кількість`,
                                'es-ES': `cantidad_min`
                            },
                            description: 'Minimum amount',
                            descriptionLocalizations: {
                                'ru': `Минимальное количество`,
                                'uk': `Мінімальна кількість`,
                                'es-ES': `Cantidad mínima`
                            },
                            type: ApplicationCommandOptionType.Number,
                            required: true,
                            min_value: 0.01,
                            max_value: 1000
                        },
                        {
                            name: 'max_amount',
                            nameLocalizations: {
                                'ru': `макс_количество`,
                                'uk': `макс_кількість`,
                                'es-ES': `cantidad_max`
                            },
                            description: 'Max amount',
                            descriptionLocalizations: {
                                'ru': `Макс количество`,
                                'uk': `Макс кількість`,
                                'es-ES': `Cantidad máxima`
                            },
                            type: ApplicationCommandOptionType.Number,
                            required: true,
                            min_value: 0.01,
                            max_value: 1000
                        },
                        {
                            name: 'min_xp',
                            nameLocalizations: {
                                'ru': `мин_опыт`,
                                'uk': `мін_досвід`,
                                'es-ES': `exp_min`
                            },
                            description: 'Minimum XP gained per item',
                            descriptionLocalizations: {
                                'ru': `Минимальный получаемый опыт за предмет`,
                                'uk': `Мінімальний отримуваний досвід за предмет`,
                                'es-ES': `Experiencia mínima obtenida por objeto`
                            },
                            type: ApplicationCommandOptionType.Integer,
                            required: true,
                            min_value: 0,
                            max_value: 100000
                        },
                        {
                            name: 'max_xp',
                            nameLocalizations: {
                                'ru': `макс_опыт`,
                                'uk': `макс_досвід`,
                                'es-ES': `exp_max`
                            },
                            description: 'Maximum XP gained per item',
                            descriptionLocalizations: {
                                'ru': `Максимальный получаемый опыт за предмет`,
                                'uk': `Максимальний отримуваний досвід за предмет`,
                                'es-ES': `Experiencia máxima obtenida por objeto`
                            },
                            type: ApplicationCommandOptionType.Integer,
                            required: true,
                            min_value: 0,
                            max_value: 100000
                        }
                    ]
                },
                {
                    name: 'delete',
                    nameLocalizations: {
                        'ru': `удалить`,
                        'uk': `видалити`,
                        'es-ES': `eliminar`
                    },
                    description: 'Delete item from mining',
                    descriptionLocalizations: {
                        'ru': `Удалить предмет из майнинга`,
                        'uk': `Видалити предмет з майнінгу`,
                        'es-ES': `Eliminar objeto de la minería`
                    },
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: 'item',
                            nameLocalizations: {
                                'ru': `предмет`,
                                'uk': `предмет`,
                                'es-ES': `objeto`
                            },
                            description: 'Name of item',
                            descriptionLocalizations: {
                                'ru': `Имя предмета`,
                                'uk': `Назва предмету`,
                                'es-ES': `Nombre del objeto`
                            },
                            minLength: 2,
                            type: ApplicationCommandOptionType.String,
                            autocomplete: true,
                            required: true,
                        },
                    ]
                },
                {
                    name: 'delete-all',
                    nameLocalizations: {
                        'ru': `удалить-всё`,
                        'uk': `видалити-все`,
                        'es-ES': `eliminar-todo`
                    },
                    description: 'Delete all items from mining',
                    descriptionLocalizations: {
                        'ru': `Удалить все предметы из майнинга`,
                        'uk': `Видалити всі предмети з майнінгу`,
                        'es-ES': `Eliminar todos los objetos de la minería`
                    },
                    type: ApplicationCommandOptionType.Subcommand,
                }
            ]
        },
        {
            name: 'voice-items',
            nameLocalizations: {
                'ru': `предметы-войс`,
                'uk': `предмети-голос`,
                'es-ES': `objetos-voz`
            },
            description: 'Voice items config',
            descriptionLocalizations: {
                'ru': `Конфиг предметов за голосовую активность`,
                'uk': `Налаштування предметів за голосову активність`,
                'es-ES': `Configuración de objetos por actividad de voz`
            },
            type: ApplicationCommandOptionType.SubcommandGroup,
            options: [
                {
                    name: 'list',
                    nameLocalizations: {
                        'ru': `список`,
                        'uk': `список`,
                        'es-ES': `lista`
                    },
                    description: 'List of all voice items',
                    descriptionLocalizations: {
                        'ru': `Список всех предметов за голосовую активность`,
                        'uk': `Список усіх предметів за голосову активність`,
                        'es-ES': `Lista de todos los objetos por voz`
                    },
                    type: ApplicationCommandOptionType.Subcommand,
                },
                {
                    name: 'add-edit',
                    nameLocalizations: {
                        'ru': `добавить-изменить`,
                        'uk': `додати-змінити`,
                        'es-ES': `añadir-editar`
                    },
                    description: 'Add item or edit',
                    descriptionLocalizations: {
                        'ru': `Добавить предмет за голосовую активность или изменить`,
                        'uk': `Додати предмет за голосову активність або змінити`,
                        'es-ES': `Añadir objeto por voz o editar`
                    },
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: 'item',
                            nameLocalizations: {
                                'ru': `предмет`,
                                'uk': `предмет`,
                                'es-ES': `objeto`
                            },
                            description: 'Name of item',
                            descriptionLocalizations: {
                                'ru': `Имя предмета`,
                                'uk': `Назва предмету`,
                                'es-ES': `Nombre del objeto`
                            },
                            minLength: 2,
                            type: ApplicationCommandOptionType.String,
                            autocomplete: true,
                            required: true,
                        },
                        {
                            name: 'chance',
                            nameLocalizations: {
                                'ru': `шанс`,
                                'uk': `шанс`,
                                'es-ES': `probabilidad`
                            },
                            description: 'Chance of catch',
                            descriptionLocalizations: {
                                'ru': `Шанс улова`,
                                'uk': `Шанс отримання`,
                                'es-ES': `Probabilidad de obtención`
                            },
                            type: ApplicationCommandOptionType.Number,
                            required: true,
                            min_value: 0,
                            max_value: 100
                        },
                        {
                            name: 'min_amount',
                            nameLocalizations: {
                                'ru': `мин_количество`,
                                'uk': `мін_кількість`,
                                'es-ES': `cantidad_min`
                            },
                            description: 'Minimum amount',
                            descriptionLocalizations: {
                                'ru': `Минимальное количество`,
                                'uk': `Мінімальна кількість`,
                                'es-ES': `Cantidad mínima`
                            },
                            type: ApplicationCommandOptionType.Number,
                            required: true,
                            min_value: 0.01,
                            max_value: 100000
                        },
                        {
                            name: 'max_amount',
                            nameLocalizations: {
                                'ru': `макс_количество`,
                                'uk': `макс_кількість`,
                                'es-ES': `cantidad_max`
                            },
                            description: 'Max amount',
                            descriptionLocalizations: {
                                'ru': `Макс количество`,
                                'uk': `Макс кількість`,
                                'es-ES': `Cantidad máxima`
                            },
                            type: ApplicationCommandOptionType.Number,
                            required: true,
                            min_value: 0.01,
                            max_value: 100000
                        }
                    ]
                },
                {
                    name: 'delete',
                    nameLocalizations: {
                        'ru': `удалить`,
                        'uk': `видалити`,
                        'es-ES': `eliminar`
                    },
                    description: 'Delete item from voice activity',
                    descriptionLocalizations: {
                        'ru': `Удалить предмет из голосовой активности`,
                        'uk': `Видалити предмет з голосової активності`,
                        'es-ES': `Eliminar objeto de la actividad de voz`
                    },
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: 'item',
                            nameLocalizations: {
                                'ru': `предмет`,
                                'uk': `предмет`,
                                'es-ES': `objeto`
                            },
                            description: 'Name of item',
                            descriptionLocalizations: {
                                'ru': `Имя предмета`,
                                'uk': `Назва предмету`,
                                'es-ES': `Nombre del objeto`
                            },
                            minLength: 2,
                            type: ApplicationCommandOptionType.String,
                            autocomplete: true,
                            required: true,
                        },
                    ]
                },
                {
                    name: 'delete-all',
                    nameLocalizations: {
                        'ru': `удалить-всё`,
                        'uk': `видалити-все`,
                        'es-ES': `eliminar-todo`
                    },
                    description: 'Delete all items from voice activity',
                    descriptionLocalizations: {
                        'ru': `Удалить все предметы из голосовой активности`,
                        'uk': `Видалити всі предмети з голосової активності`,
                        'es-ES': `Eliminar todos los objetos de la actividad de voz`
                    },
                    type: ApplicationCommandOptionType.Subcommand,
                }
            ]
        },
        {
            name: 'messages-items',
            nameLocalizations: {
                'ru': `предметы-за-сообщения`,
                'uk': `предмети-за-повідомлення`,
                'es-ES': `objetos-mensajes`
            },
            description: 'Messages items config',
            descriptionLocalizations: {
                'ru': `Конфиг предметов за текстовую активность`,
                'uk': `Налаштування предметів за текстову активність`,
                'es-ES': `Configuración de objetos por mensajes`
            },
            type: ApplicationCommandOptionType.SubcommandGroup,
            options: [
                {
                    name: 'list',
                    nameLocalizations: {
                        'ru': `список`,
                        'uk': `список`,
                        'es-ES': `lista`
                    },
                    description: 'List of all voice items',
                    descriptionLocalizations: {
                        'ru': `Список всех предметов за текстовую активность`,
                        'uk': `Список усіх предметів за текстову активність`,
                        'es-ES': `Lista de todos los objetos por mensajes`
                    },
                    type: ApplicationCommandOptionType.Subcommand,
                },
                {
                    name: 'add-edit',
                    nameLocalizations: {
                        'ru': `добавить-изменить`,
                        'uk': `додати-змінити`,
                        'es-ES': `añadir-editar`
                    },
                    description: 'Add item or edit',
                    descriptionLocalizations: {
                        'ru': `Добавить предмет за текстовую активность или изменить`,
                        'uk': `Додати предмет за текстову активність або змінити`,
                        'es-ES': `Añadir objeto por mensajes o editar`
                    },
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: 'item',
                            nameLocalizations: {
                                'ru': `предмет`,
                                'uk': `предмет`,
                                'es-ES': `objeto`
                            },
                            description: 'Name of item',
                            descriptionLocalizations: {
                                'ru': `Имя предмета`,
                                'uk': `Назва предмету`,
                                'es-ES': `Nombre del objeto`
                            },
                            minLength: 2,
                            type: ApplicationCommandOptionType.String,
                            autocomplete: true,
                            required: true,
                        },
                        {
                            name: 'chance',
                            nameLocalizations: {
                                'ru': `шанс`,
                                'uk': `шанс`,
                                'es-ES': `probabilidad`
                            },
                            description: 'Chance of catch',
                            descriptionLocalizations: {
                                'ru': `Шанс улова`,
                                'uk': `Шанс отримання`,
                                'es-ES': `Probabilidad de obtención`
                            },
                            type: ApplicationCommandOptionType.Number,
                            required: true,
                            min_value: 0,
                            max_value: 100
                        },
                        {
                            name: 'min_amount',
                            nameLocalizations: {
                                'ru': `мин_количество`,
                                'uk': `мін_кількість`,
                                'es-ES': `cantidad_min`
                            },
                            description: 'Minimum amount',
                            descriptionLocalizations: {
                                'ru': `Минимальное количество`,
                                'uk': `Мінімальна кількість`,
                                'es-ES': `Cantidad mínima`
                            },
                            type: ApplicationCommandOptionType.Number,
                            required: true,
                            min_value: 0.01,
                            max_value: 100000
                        },
                        {
                            name: 'max_amount',
                            nameLocalizations: {
                                'ru': `макс_количество`,
                                'uk': `макс_кількість`,
                                'es-ES': `cantidad_max`
                            },
                            description: 'Max amount',
                            descriptionLocalizations: {
                                'ru': `Макс количество`,
                                'uk': `Макс кількість`,
                                'es-ES': `Cantidad máxima`
                            },
                            type: ApplicationCommandOptionType.Number,
                            required: true,
                            min_value: 0.01,
                            max_value: 100000
                        }
                    ]
                },
                {
                    name: 'delete',
                    nameLocalizations: {
                        'ru': `удалить`,
                        'uk': `видалити`,
                        'es-ES': `eliminar`
                    },
                    description: 'Delete item from text activity',
                    descriptionLocalizations: {
                        'ru': `Удалить предмет из текстовой активности`,
                        'uk': `Видалити предмет з текстової активності`,
                        'es-ES': `Eliminar objeto de la actividad de mensajes`
                    },
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: 'item',
                            nameLocalizations: {
                                'ru': `предмет`,
                                'uk': `предмет`,
                                'es-ES': `objeto`
                            },
                            description: 'Name of item',
                            descriptionLocalizations: {
                                'ru': `Имя предмета`,
                                'uk': `Назва предмету`,
                                'es-ES': `Nombre del objeto`
                            },
                            minLength: 2,
                            type: ApplicationCommandOptionType.String,
                            autocomplete: true,
                            required: true,
                        },
                    ]
                },
                {
                    name: 'delete-all',
                    nameLocalizations: {
                        'ru': `удалить-всё`,
                        'uk': `видалити-все`,
                        'es-ES': `eliminar-todo`
                    },
                    description: 'Delete all items from text activity',
                    descriptionLocalizations: {
                        'ru': `Удалить все предметы из текстовой активности`,
                        'uk': `Видалити всі предмети з текстової активності`,
                        'es-ES': `Eliminar todos los objetos de la actividad de mensajes`
                    },
                    type: ApplicationCommandOptionType.Subcommand,
                }
            ]
        }
    ],
    defaultMemberPermissions: "Administrator",
    dmPermission: false,
    group: `admins-group`,
    cooldowns: new Collection(),
    /**
     *
     * @param {Client} client
     * @param {CommandInteraction} interaction
     * @param {String[]} args
     */
    run: async (client, interaction, args) => {
        if (interaction.isChatInputCommand()) await interaction.deferReply({ flags: ["Ephemeral"] })
        let min = 0
        let max = 25
        if (args?.SubcommandGroup === "fishing" || interaction.customId?.includes("fishing")) {
            if (args?.Subcommand === "delete-all") {
                await Promise.all(client.cache.items.filter(item => item.guildID === interaction.guildId && item.activities?.fishing).map(async item => {
                    item.activities.fishing = undefined
                    await item.save()
                }))
                return interaction.editReply({ content: `${client.language({ textId: "Все предметы удалены из рыбалки", guildId: interaction.guildId, locale: interaction.locale })}` })
            }
            if (args?.Subcommand === "delete") {
                if (args.item.length < 2) {
                    return interaction.editReply({ content: `${client.config.emojis.NO}${client.language({ textId: `Запрос содержит менее двух символов`, guildId: interaction.guildId, locale: interaction.locale })}` })  
                }
                let filteredItems = client.cache.items.filter(e => e.guildID === interaction.guildId && e.name.toLowerCase().includes(args.item.toLowerCase()))
                if (filteredItems.size > 1 && !filteredItems.some(e => e.name.toLowerCase() == args.item.toLowerCase())) {
                    let result = ""
                    filteredItems.forEach(item => {
                        result += `> ${item.displayEmoji}**${item.name}**\n`
                    })
                    return interaction.editReply({ content: `${client.config.emojis.block} ${client.language({ textId: `По вашему запросу было найдено несколько предметов`, guildId: interaction.guildId, locale: interaction.locale })}:\n${result}` }) 
                }
                let serverItem
                if (filteredItems.some(e => e.name.toLowerCase() == args.item.toLowerCase())) {
                    serverItem = filteredItems.find(e => e.name.toLowerCase() == args.item.toLowerCase())
                    if (!serverItem) return interaction.editReply({ content: `${client.config.emojis.NO}${client.language({ textId: `Предмет не найден`, guildId: interaction.guildId, locale: interaction.locale })}.` })  
                } else {
                    serverItem = filteredItems.first()
                    if (!serverItem) return interaction.editReply({ content: `${client.config.emojis.NO}${client.language({ textId: `Предмет не найден`, guildId: interaction.guildId, locale: interaction.locale })}.` })  
                }
                if (!serverItem.activities?.fishing) {
                    return interaction.editReply({ content: `${client.config.emojis.NO}${client.language({ textId: `Предмет не находится в рыбалке`, guildId: interaction.guildId, locale: interaction.locale })}.` }) 
                }
                serverItem.activities.fishing = undefined
                await serverItem.save()
                return interaction.editReply({ content: `${client.language({ textId: "Предмет", guildId: interaction.guildId, locale: interaction.locale })}${serverItem.displayEmoji}**${serverItem.name}** ${client.language({ textId: "был удален из рыбалки", guildId: interaction.guildId, locale: interaction.locale })}` })
            }
            let fishingItems = client.cache.items.filter(item => item.guildID === interaction.guildId && item.activities?.fishing?.chance).sort((a, b) => b.activities.fishing.chance - a.activities.fishing.chance).map(e => { 
                return { itemID: e.itemID, displayEmoji: e.displayEmoji, name: e.name, activities: { fishing: { chance: e.activities.fishing.chance, amountFrom: e.activities.fishing.amountFrom, amountTo: e.activities.fishing.amountTo, minxp: e.activities.fishing.minxp, maxxp: e.activities.fishing.maxxp } }, enabled: e.enabled, temp: e.temp, found: e.found }
            })
            if (args?.Subcommand === "list" || interaction.customId?.includes("list")) {
                if (!fishingItems.length) {
                    if (interaction.replied || interaction.deferred) return interaction.editReply({ content: `${client.language({ textId: "На сервере не существует предметов из рыбалки", guildId: interaction.guildId, locale: interaction.locale })}`, embeds: [], components: [] })
                    else return interaction.update({ content: `${client.language({ textId: "На сервере не существует предметов из рыбалки", guildId: interaction.guildId, locale: interaction.locale })}`, embeds: [], components: [] })
                }
                if (!interaction.isChatInputCommand()) {
                    max = +limitRegexp.exec(interaction.customId)?.[1]
                    if (!max) max = 25
                    min = max - 25
                }
                const first_page_btn = new ButtonBuilder().setEmoji(`${client.config.emojis.arrowLeft2}`).setStyle(ButtonStyle.Secondary).setCustomId(`cmd{config}lim{25}fishing list 1`).setDisabled((fishingItems.length <= 25 && min == 0) || (fishingItems.length > 25 && min < 25))
                const previous_page_btn = new ButtonBuilder().setEmoji(`${client.config.emojis.arrowLeft}`).setStyle(ButtonStyle.Secondary).setCustomId(`cmd{config}lim{${max - 25}}fishing list 2`).setDisabled((fishingItems.length <= 25 && min == 0) || (fishingItems.length > 25 && min < 25))
                const next_page_btn = new ButtonBuilder().setEmoji(`${client.config.emojis.arrowRight}`).setStyle(ButtonStyle.Secondary).setCustomId(`cmd{config}lim{${max + 25}}fishing list 3`).setDisabled((fishingItems.length <= 25 && min == 0) || (fishingItems.length > 25 && min >= fishingItems.length - 25))
                const last_page_btn = new ButtonBuilder().setEmoji(`${client.config.emojis.arrowRight2}`).setStyle(ButtonStyle.Secondary).setCustomId(`cmd{config}lim{${fishingItems.length + (fishingItems.length % 25 == 0 ? 0 : 25 - (fishingItems.length % 25))}} fishing list 4`).setDisabled((fishingItems.length <= 25 && min == 0) || (fishingItems.length > 25 && min >= fishingItems.length - 25))
                const embed = new EmbedBuilder()
                    .setAuthor({ name: `${client.language({ textId: "Предметы за рыбалку", guildId: interaction.guildId, locale: interaction.locale })}` })
                    .setColor(3093046)
                const unknown_emoji = await client.functions.getEmoji(client, client.config.emojis.unknown)
                const description = [`🕐 - ${client.language({ textId: `несозданный (временный) предмет`, guildId: interaction.guildId, locale: interaction.locale })}\n🌫️ - ${client.language({ textId: `невидимый предмет (отключенный)`, guildId: interaction.guildId, locale: interaction.locale })}\n${unknown_emoji} - ${client.language({ textId: `неизвестный (неизученный) предмет`, guildId: interaction.guildId, locale: interaction.locale })}`]
                const profile = await client.functions.fetchProfile(client, interaction.user.id, interaction.guildId)
                let luck_multiplier_for_channel = 0
                let channel = client.cache.channels.find(channel => channel.id === interaction.channel.id && channel.isEnabled)
                if (!channel) channel = client.cache.channels.find(channel => channel.id === interaction.channel.parentId && channel.isEnabled)
                if (channel) {
                    luck_multiplier_for_channel = channel.luck_multiplier
                }
                const bonus = new Decimal(1).plus(profile.getLuckBoost(luck_multiplier_for_channel))
                if (bonus < 1 || bonus > 1) description.push(`${client.config.emojis.random}${client.language({ textId: `Удача`, guildId: interaction.guildId, locale: interaction.locale })} ${bonus.mul(100).minus(100)}%`)
                description.push(`${client.language({ textId: `Предметы`, guildId: interaction.guildId, locale: interaction.locale })}:`)
                fishingItems = client.functions.adjustActivityChanceByLuck(fishingItems, bonus, "fishing")
                fishingItems.slice(min, max).forEach(item => {
                    description.push(`${item.temp ? '🕐' : ``}${!item.enabled ? `🌫️` : ``}${!item.found ? unknown_emoji : ``} ${fishingItems.findIndex(e => e.itemID === item.itemID)+1}. ${item.displayEmoji}${item.name} ${item.activities.fishing.amountFrom !== item.activities.fishing.amountTo ? `(${item.activities.fishing.amountFrom}-${item.activities.fishing.amountTo})` :  `(${item.activities.fishing.amountFrom})`} 🎲${item.activities.fishing.chance}% ⭐${item.activities.fishing.minxp !== item.activities.fishing.maxxp ? `${item.activities.fishing.minxp}-${item.activities.fishing.maxxp}` : `${item.activities.fishing.minxp}`} `)
                })
                embed.setDescription(description.join("\n"))
                if (interaction.replied || interaction.deferred) return interaction.editReply({ embeds: [embed], components: [new ActionRowBuilder().addComponents(first_page_btn, previous_page_btn, next_page_btn, last_page_btn)] })
                else return interaction.update({ embeds: [embed], components: [new ActionRowBuilder().addComponents(first_page_btn, previous_page_btn, next_page_btn, last_page_btn)] })
            }
            if (args?.Subcommand === "add-edit") {
                if (args.chance > 100) return interaction.editReply({ content: `${client.language({ textId: "Шанс не может быть", guildId: interaction.guildId, locale: interaction.locale })} > 100` })
                if (args.chance <= 0) return interaction.editReply({ content: `${client.language({ textId: "Шанс не может быть", guildId: interaction.guildId, locale: interaction.locale })} <= 0` })
                if (fishingItems.filter(e => e.name !== args.item).reduce((previousValue, element) => previousValue += element.activities.fishing.chance, 0) + args.chance > 100) return interaction.editReply({ content: `${client.language({ textId: "Сумма шансов всех предметов находящихся в рыбалке не должна превышать 100", guildId: interaction.guildId, locale: interaction.locale })}` })
                if (args.min_amount <= 0) return interaction.editReply({ content: `${client.language({ textId: "Минимальное количество не может быть", guildId: interaction.guildId, locale: interaction.locale })} <= 0` })
                if (args.max_amount <= 0) return interaction.editReply({ content: `${client.language({ textId: "Максимальное количество не может быть", guildId: interaction.guildId, locale: interaction.locale })} <= 0` })
                if (args.min_xp < 0) return interaction.editReply({ content: `${client.language({ textId: "Минимальное количество опыта не может быть", guildId: interaction.guildId, locale: interaction.locale })} < 0` })
                if (args.max_xp < 0) return interaction.editReply({ content: `${client.language({ textId: "Максимальное количество опыта не может быть", guildId: interaction.guildId, locale: interaction.locale })} < 0` })
                if (args.min_xp === 0 && args.max_xp > 0) return interaction.editReply({ content: `${client.language({ textId: "Минимальное количество опыта не может быть равно нулю при максимальном количестве опыта не равным нулю", guildId: interaction.guildId, locale: interaction.locale })} < 0` })
                if (args.min_xp > args.max_xp) return interaction.editReply({ content: `${client.language({ textId: "Минимальное количество опыта не может быть больше максимального количества опыта", guildId: interaction.guildId, locale: interaction.locale })} < 0` })
                const item = client.cache.items.find(item => item.guildID === interaction.guildId && (item.itemID === args.item || item.name.toLowerCase().includes(args.item.toLowerCase())))
                if (!item) return interaction.editReply({ content: `${client.language({ textId: "Предмет", guildId: interaction.guildId, locale: interaction.locale })} (**${args.item}**) ${client.language({ textId: "не найден", guildId: interaction.guildId, locale: interaction.locale })}.` })
                if (!item.activities) item.activities = { fishing: {} }
                else if (!item.activities.fishing) item.activities.fishing = {}
                item.activities.fishing.chance = args.chance
                item.activities.fishing.amountFrom = args.min_amount
                item.activities.fishing.amountTo = args.max_amount
                item.activities.fishing.minxp = args.min_xp
                item.activities.fishing.maxxp = args.max_xp
                await item.save()
                fishingItems = client.cache.items.filter(item => item.guildID === interaction.guildId && item.activities?.fishing?.chance).sort((a, b) => b.activities.fishing.chance - a.activities.fishing.chance)
                const description = [
                    `${client.language({ textId: "Предмет", guildId: interaction.guildId, locale: interaction.locale })} ${item.displayEmoji}**${item.name}** ${client.language({ textId: "добавлен в рыбалку со следующими параметрами", guildId: interaction.guildId, locale: interaction.locale })}:`,
                    `> ${client.language({ textId: "Шанс", guildId: interaction.guildId, locale: interaction.locale })}: ${args.chance}%`,
                    `> ${client.language({ textId: "Минимальное количество за улов", guildId: interaction.guildId, locale: interaction.locale })}: ${args.min_amount}`,
                    `> ${client.language({ textId: "Максимальное количество за улов", guildId: interaction.guildId, locale: interaction.locale })}: ${args.max_amount}`,
                    `> ${client.language({ textId: "Минимальное количество получаемого опыта за улов", guildId: interaction.guildId, locale: interaction.locale })}: ${args.min_xp}`,
                    `> ${client.language({ textId: "Максимальное количество получаемого опыта за улов", guildId: interaction.guildId, locale: interaction.locale })}: ${args.max_xp}`
                ]
                return interaction.editReply({ content: description.join("\n") })
            }
        } 
        if (args?.SubcommandGroup === "mining" || interaction.customId?.includes("mining")) {
            if (args?.Subcommand === "delete-all") {
                await Promise.all(client.cache.items.filter(item => item.guildID === interaction.guildId && item.activities?.mining).map(async item => {
                    item.activities.mining = undefined
                    await item.save()
                }))
                return interaction.editReply({ content: `${client.language({ textId: "Все предметы удалены из майнинга", guildId: interaction.guildId, locale: interaction.locale })}` })
            }
            if (args?.Subcommand === "delete") {
                if (args.item.length < 2) {
                    return interaction.editReply({ content: `${client.config.emojis.NO}${client.language({ textId: `Запрос содержит менее двух символов`, guildId: interaction.guildId, locale: interaction.locale })}` })  
                }
                let filteredItems = client.cache.items.filter(e => e.guildID === interaction.guildId && e.name.toLowerCase().includes(args.item.toLowerCase()))
                if (filteredItems.size > 1 && !filteredItems.some(e => e.name.toLowerCase() == args.item.toLowerCase())) {
                    let result = ""
                    for (const item of filteredItems) {
                        result += `> ${item.displayEmoji}**${item.name}**\n`
                    }
                    return interaction.editReply({ content: `${client.config.emojis.block} ${client.language({ textId: `По вашему запросу было найдено несколько предметов`, guildId: interaction.guildId, locale: interaction.locale })}:\n${result}` }) 
                }
                let serverItem
                if (filteredItems.some(e => e.name.toLowerCase() == args.item.toLowerCase())) {
                    serverItem = filteredItems.find(e => e.name.toLowerCase() == args.item.toLowerCase())
                    if (!serverItem) return interaction.editReply({ content: `${client.config.emojis.NO}${client.language({ textId: `Предмет не найден`, guildId: interaction.guildId, locale: interaction.locale })}.` })  
                } else {
                    serverItem = filteredItems.first()
                    if (!serverItem) return interaction.editReply({ content: `${client.config.emojis.NO}${client.language({ textId: `Предмет не найден`, guildId: interaction.guildId, locale: interaction.locale })}.` })  
                }
                if (!serverItem.activities?.mining) {
                    return interaction.editReply({ content: `${client.config.emojis.NO}${client.language({ textId: `Предмет не находится в майнинге`, guildId: interaction.guildId, locale: interaction.locale })}.` }) 
                }
                serverItem.activities.mining = undefined
                await serverItem.save()
                return interaction.editReply({ content: `${client.language({ textId: "Предмет", guildId: interaction.guildId, locale: interaction.locale })} ${serverItem.displayEmoji}**${serverItem.name}** ${client.language({ textId: "был удален из майнинга", guildId: interaction.guildId, locale: interaction.locale })}` })
            }
            let miningItems = client.cache.items.filter(item => item.guildID === interaction.guildId && item.activities?.mining?.chance).sort((a, b) => b.activities.mining.chance - a.activities.mining.chance).map(e => { 
                return { itemID: e.itemID, displayEmoji: e.displayEmoji, name: e.name, activities: { mining: { chance: e.activities.mining.chance, amountFrom: e.activities.mining.amountFrom, amountTo: e.activities.mining.amountTo, minxp: e.activities.mining.minxp, maxxp: e.activities.mining.maxxp } }, enabled: e.enabled, temp: e.temp, found: e.found }
            })
            if (args?.Subcommand === "list" || interaction.customId?.includes("list")) {
                if (!miningItems.length) {
                    if (interaction.replied || interaction.deferred) return interaction.editReply({ content: `${client.language({ textId: "На сервере не существует предметов из майнинга", guildId: interaction.guildId, locale: interaction.locale })}`, embeds: [], components: [] })
                    else return interaction.update({ content: `${client.language({ textId: "На сервере не существует предметов из майнинга", guildId: interaction.guildId, locale: interaction.locale })}`, embeds: [], components: [] })
                }
                if (!interaction.isChatInputCommand()) {
                    max = +limitRegexp.exec(interaction.customId)?.[1]
                    if (!max) max = 25
                    min = max - 25
                }
                const first_page_btn = new ButtonBuilder().setEmoji(`${client.config.emojis.arrowLeft2}`).setStyle(ButtonStyle.Secondary).setCustomId(`cmd{config}lim{25}mining list 1`).setDisabled((miningItems.length <= 25 && min == 0) || (miningItems.length > 25 && min < 25))
                const previous_page_btn = new ButtonBuilder().setEmoji(`${client.config.emojis.arrowLeft}`).setStyle(ButtonStyle.Secondary).setCustomId(`cmd{config}lim{${max - 25}}mining list 2`).setDisabled((miningItems.length <= 25 && min == 0) || (miningItems.length > 25 && min < 25))
                const next_page_btn = new ButtonBuilder().setEmoji(`${client.config.emojis.arrowRight}`).setStyle(ButtonStyle.Secondary).setCustomId(`cmd{config}lim{${max + 25}}mining list 3`).setDisabled((miningItems.length <= 25 && min == 0) || (miningItems.length > 25 && min >= miningItems.length - 25))
                const last_page_btn = new ButtonBuilder().setEmoji(`${client.config.emojis.arrowRight2}`).setStyle(ButtonStyle.Secondary).setCustomId(`cmd{config}lim{${miningItems.length + (miningItems.length % 25 == 0 ? 0 : 25 - (miningItems.length % 25))}}mining list 4`).setDisabled((miningItems.length <= 25 && min == 0) || (miningItems.length > 25 && min >= miningItems.length - 25))
                const embed = new EmbedBuilder()
                    .setAuthor({ name: `${client.language({ textId: "Предметы за майнинг", guildId: interaction.guildId, locale: interaction.locale })}` })
                    .setColor(3093046)
                const unknown_emoji = await client.functions.getEmoji(client, client.config.emojis.unknown)
                const description = [`🕐 - ${client.language({ textId: `несозданный (временный) предмет`, guildId: interaction.guildId, locale: interaction.locale })}\n🌫️ - ${client.language({ textId: `невидимый предмет (отключенный)`, guildId: interaction.guildId, locale: interaction.locale })}\n${unknown_emoji} - ${client.language({ textId: `неизвестный (неизученный) предмет`, guildId: interaction.guildId, locale: interaction.locale })}`]
                const profile = await client.functions.fetchProfile(client, interaction.user.id, interaction.guildId)
                let luck_multiplier_for_channel = 0
                let channel = client.cache.channels.find(channel => channel.id === interaction.channel.id && channel.isEnabled)
                if (!channel) channel = client.cache.channels.find(channel => channel.id === interaction.channel.parentId && channel.isEnabled)
                if (channel) {
                    luck_multiplier_for_channel = channel.luck_multiplier
                }
                const bonus = new Decimal(1).plus(profile.getLuckBoost(luck_multiplier_for_channel))
                if (bonus < 1 || bonus > 1) description.push(`${client.config.emojis.random}${client.language({ textId: `Удача`, guildId: interaction.guildId, locale: interaction.locale })} ${bonus.mul(100).minus(100)}%`)
                description.push(`${client.language({ textId: `Предметы`, guildId: interaction.guildId, locale: interaction.locale })}:`)
                miningItems = client.functions.adjustActivityChanceByLuck(miningItems, bonus, "mining")
                miningItems.slice(min, max).forEach(item => {
                    description.push(`${item.temp ? '🕐' : ``}${!item.enabled ? `🌫️` : ``}${!item.found ? unknown_emoji : ``} ${miningItems.findIndex(e => e.itemID === item.itemID)+1}. ${item.displayEmoji}${item.name} ${item.activities.mining.amountFrom !== item.activities.mining.amountTo ? `(${item.activities.mining.amountFrom}-${item.activities.mining.amountTo})` :  `(${item.activities.mining.amountFrom})`} 🎲${item.activities.mining.chance}% ⭐${item.activities.mining.minxp !== item.activities.mining.maxxp ? `${item.activities.mining.minxp}-${item.activities.mining.maxxp}` : `${item.activities.mining.minxp}`} `)
                })
                embed.setDescription(description.join("\n"))
                if (interaction.replied || interaction.deferred) return interaction.editReply({ embeds: [embed], components: [new ActionRowBuilder().addComponents(first_page_btn, previous_page_btn, next_page_btn, last_page_btn)] })
                else return interaction.update({ embeds: [embed], components: [new ActionRowBuilder().addComponents(first_page_btn, previous_page_btn, next_page_btn, last_page_btn)] })
            }
            if (args?.Subcommand === "add-edit") {
                if (args.chance > 100) return interaction.editReply({ content: `${client.language({ textId: "Шанс не может быть", guildId: interaction.guildId, locale: interaction.locale })} > 100` })
                if (args.chance <= 0) return interaction.editReply({ content: `${client.language({ textId: "Шанс не может быть", guildId: interaction.guildId, locale: interaction.locale })} <= 0` })
                if (miningItems.filter(e => e.name !== args.item).reduce((previousValue, element) => previousValue += element.activities.mining.chance, 0) + args.chance > 100) return interaction.editReply({ content: `${client.language({ textId: "Сумма шансов всех предметов находящихся в майнинге не должна превышать 100", guildId: interaction.guildId, locale: interaction.locale })}` })
                if (args.min_amount <= 0) return interaction.editReply({ content: `${client.language({ textId: "Минимальное количество не может быть", guildId: interaction.guildId, locale: interaction.locale })} <= 0` })
                if (args.max_amount <= 0) return interaction.editReply({ content: `${client.language({ textId: "Максимальное количество не может быть", guildId: interaction.guildId, locale: interaction.locale })} <= 0` })
                if (args.min_xp < 0) return interaction.editReply({ content: `${client.language({ textId: "Минимальное количество опыта не может быть", guildId: interaction.guildId, locale: interaction.locale })} < 0` })
                if (args.max_xp < 0) return interaction.editReply({ content: `${client.language({ textId: "Максимальное количество опыта не может быть", guildId: interaction.guildId, locale: interaction.locale })} < 0` })
                if (args.min_xp === 0 && args.max_xp > 0) return interaction.editReply({ content: `${client.language({ textId: "Минимальное количество опыта не может быть равно нулю при максимальном количестве опыта не равным нулю", guildId: interaction.guildId, locale: interaction.locale })} < 0` })
                if (args.min_xp > args.max_xp) return interaction.editReply({ content: `${client.language({ textId: "Минимальное количество опыта не может быть больше максимального количества опыта", guildId: interaction.guildId, locale: interaction.locale })} < 0` })
                const item = client.cache.items.find(item => item.guildID === interaction.guildId && (item.itemID === args.item || item.name.toLowerCase().includes(args.item.toLowerCase())))
                if (!item) return interaction.editReply({ content: `${client.language({ textId: "Предмет", guildId: interaction.guildId, locale: interaction.locale })} (**${args.item}**) ${client.language({ textId: "не найден", guildId: interaction.guildId, locale: interaction.locale })}.` })
                if (!item.activities) item.activities = { mining: {} }
                else if (!item.activities.mining) item.activities.mining = {}
                item.activities.mining.chance = args.chance
                item.activities.mining.amountFrom = args.min_amount
                item.activities.mining.amountTo = args.max_amount
                item.activities.mining.minxp = args.min_xp
                item.activities.mining.maxxp = args.max_xp
                await item.save()
                miningItems = client.cache.items.filter(item => item.guildID === interaction.guildId && item.activities?.mining?.chance).sort((a, b) => b.activities.mining.chance - a.activities.mining.chance)
                const description = [
                    `${client.language({ textId: "Предмет", guildId: interaction.guildId, locale: interaction.locale })} ${item.displayEmoji}**${item.name}** ${client.language({ textId: "добавлен в майнинг со следующими параметрами", guildId: interaction.guildId, locale: interaction.locale })}:`,
                    `> ${client.language({ textId: "Шанс", guildId: interaction.guildId, locale: interaction.locale })}: ${args.chance}%`,
                    `> ${client.language({ textId: "Минимальное количество за нахождение", guildId: interaction.guildId, locale: interaction.locale })}: ${args.min_amount}`,
                    `> ${client.language({ textId: "Максимальное количество за нахождение", guildId: interaction.guildId, locale: interaction.locale })}: ${args.max_amount}`,
                    `> ${client.language({ textId: "Минимальное количество получаемого опыта за нахождение", guildId: interaction.guildId, locale: interaction.locale })}: ${args.min_xp}`,
                    `> ${client.language({ textId: "Максимальное количество получаемого опыта за нахождение", guildId: interaction.guildId, locale: interaction.locale })}: ${args.max_xp}`
                ]
                return interaction.editReply({ content: description.join("\n") })
            }
        } 
        if (args?.SubcommandGroup === "voice-items" || interaction.customId?.includes("voice-items")) {
            if (args?.Subcommand === "delete-all") {
                await Promise.all(client.cache.items.filter(item => item.guildID === interaction.guildId && item.activities?.voice).map(async item => {
                    item.activities.voice = undefined
                    await item.save()
                }))
                return interaction.editReply({ content: `${client.language({ textId: "Все предметы удалены из голосовой активности", guildId: interaction.guildId, locale: interaction.locale })}` })
            }
            if (args?.Subcommand === "delete") {
                if (args.item.length < 2) {
                    return interaction.editReply({ content: `${client.config.emojis.NO}${client.language({ textId: `Запрос содержит менее двух символов`, guildId: interaction.guildId, locale: interaction.locale })}` })  
                }
                let filteredItems = client.cache.items.filter(e => e.guildID === interaction.guildId && e.name.toLowerCase().includes(args.item.toLowerCase()))
                if (filteredItems.size > 1 && !filteredItems.some(e => e.name.toLowerCase() == args.item.toLowerCase())) {
                    let result = ""
                    filteredItems.forEach(item => {
                        result += `> ${item.displayEmoji}**${item.name}**\n`
                    })
                    return interaction.editReply({ content: `${client.config.emojis.block} ${client.language({ textId: `По вашему запросу было найдено несколько предметов`, guildId: interaction.guildId, locale: interaction.locale })}:\n${result}` }) 
                }
                let serverItem
                if (filteredItems.some(e => e.name.toLowerCase() == args.item.toLowerCase())) {
                    serverItem = filteredItems.find(e => e.name.toLowerCase() == args.item.toLowerCase())
                    if (!serverItem) return interaction.editReply({ content: `${client.config.emojis.NO}${client.language({ textId: `Предмет не найден`, guildId: interaction.guildId, locale: interaction.locale })}.` })  
                } else {
                    serverItem = filteredItems.first()
                    if (!serverItem) return interaction.editReply({ content: `${client.config.emojis.NO}${client.language({ textId: `Предмет не найден`, guildId: interaction.guildId, locale: interaction.locale })}.` })  
                }
                if (!serverItem.activities?.voice) {
                    return interaction.editReply({ content: `${client.config.emojis.NO}${client.language({ textId: `Предмет не находится в голосовой активности`, guildId: interaction.guildId, locale: interaction.locale })}.` }) 
                }
                serverItem.activities.voice = undefined
                await serverItem.save()
                return interaction.editReply({ content: `${client.language({ textId: "Предмет", guildId: interaction.guildId, locale: interaction.locale })}${serverItem.displayEmoji}**${serverItem.name}** ${client.language({ textId: "был удален из голосовой активности", guildId: interaction.guildId, locale: interaction.locale })}` })
            }
            let items_for_voice = client.cache.items.filter(item => item.guildID === interaction.guildId && item.activities?.voice?.chance).sort((a, b) => b.activities.voice.chance - a.activities.voice.chance).map(e => { 
                return { itemID: e.itemID, displayEmoji: e.displayEmoji, name: e.name, activities: { voice: { chance: e.activities.voice.chance, amountFrom: e.activities.voice.amountFrom, amountTo: e.activities.voice.amountTo } }, enabled: e.enabled, temp: e.temp, found: e.found }
            })
            if (args?.Subcommand === "list" || interaction.customId?.includes("list")) {
                if (!items_for_voice.length) {
                    if (interaction.replied || interaction.deferred) return interaction.editReply({ content: `${client.language({ textId: "На сервере не существует предметов голосовой активности", guildId: interaction.guildId, locale: interaction.locale })}`, embeds: [], components: [] })
                    else return interaction.update({ content: `${client.language({ textId: "На сервере не существует предметов голосовой активности", guildId: interaction.guildId, locale: interaction.locale })}`, embeds: [], components: [] })
                }
                if (!interaction.isChatInputCommand()) {
                    max = +limitRegexp.exec(interaction.customId)?.[1]
                    if (!max) max = 25
                    min = max - 25
                }
                const first_page_btn = new ButtonBuilder().setEmoji(`${client.config.emojis.arrowLeft2}`).setStyle(ButtonStyle.Secondary).setCustomId(`cmd{config}lim{25}voice-items list 1`).setDisabled((items_for_voice.length <= 25 && min == 0) || (items_for_voice.length > 25 && min < 25))
                const previous_page_btn = new ButtonBuilder().setEmoji(`${client.config.emojis.arrowLeft}`).setStyle(ButtonStyle.Secondary).setCustomId(`cmd{config}lim{${max - 25}}voice-items list 2`).setDisabled((items_for_voice.length <= 25 && min == 0) || (items_for_voice.length > 25 && min < 25))
                const next_page_btn = new ButtonBuilder().setEmoji(`${client.config.emojis.arrowRight}`).setStyle(ButtonStyle.Secondary).setCustomId(`cmd{config}lim{${max + 25}}voice-items list 3`).setDisabled((items_for_voice.length <= 25 && min == 0) || (items_for_voice.length > 25 && min >= items_for_voice.length - 25))
                const last_page_btn = new ButtonBuilder().setEmoji(`${client.config.emojis.arrowRight2}`).setStyle(ButtonStyle.Secondary).setCustomId(`cmd{config}lim{${items_for_voice.length + (items_for_voice.length % 25 == 0 ? 0 : 25 - (items_for_voice.length % 25))}}voice-items list 4`).setDisabled((items_for_voice.length <= 25 && min == 0) || (items_for_voice.length > 25 && min >= items_for_voice.length - 25))
                const embed = new EmbedBuilder()
                    .setAuthor({ name: `${client.language({ textId: "Предметы за голосовую активность", guildId: interaction.guildId, locale: interaction.locale })}` })
                    .setColor(3093046)
                const unknown_emoji = await client.functions.getEmoji(client, client.config.emojis.unknown)
                const description = [`🕐 - ${client.language({ textId: `несозданный (временный) предмет`, guildId: interaction.guildId, locale: interaction.locale })}\n🌫️ - ${client.language({ textId: `невидимый предмет (отключенный)`, guildId: interaction.guildId, locale: interaction.locale })}\n${unknown_emoji} - ${client.language({ textId: `неизвестный (неизученный) предмет`, guildId: interaction.guildId, locale: interaction.locale })}`]
                const profile = await client.functions.fetchProfile(client, interaction.user.id, interaction.guildId)
                let luck_multiplier_for_channel = 0
                let channel = client.cache.channels.find(channel => channel.id === interaction.channel.id && channel.isEnabled)
                if (!channel) channel = client.cache.channels.find(channel => channel.id === interaction.channel.parentId && channel.isEnabled)
                if (channel) {
                    luck_multiplier_for_channel = channel.luck_multiplier
                }
                const bonus = new Decimal(1).plus(profile.getLuckBoost(luck_multiplier_for_channel))
                if (bonus < 1 || bonus > 1) description.push(`${client.config.emojis.random}${client.language({ textId: `Удача`, guildId: interaction.guildId, locale: interaction.locale })} ${bonus.mul(100).minus(100)}%`)
                description.push(`${client.language({ textId: `Предметы`, guildId: interaction.guildId, locale: interaction.locale })}:`)
                items_for_voice = client.functions.adjustActivityChanceByLuck(items_for_voice, bonus, "voice")
                items_for_voice.slice(min, max).forEach(item => {
                    description.push(`${item.temp ? '🕐' : ``}${!item.enabled ? `🌫️` : ``}${!item.found ? unknown_emoji : ``} ${items_for_voice.findIndex(e => e.itemID === item.itemID)+1}. ${item.displayEmoji}${item.name} ${item.activities.voice.amountFrom !== item.activities.voice.amountTo ? `(${item.activities.voice.amountFrom}-${item.activities.voice.amountTo})` :  `(${item.activities.voice.amountFrom})`} 🎲${item.activities.voice.chance}%/1${client.language({ textId: `мин`, guildId: interaction.guildId, locale: interaction.locale })}.`)
                })
                embed.setDescription(description.join("\n"))
                if (interaction.replied || interaction.deferred) return interaction.editReply({ embeds: [embed], components: [new ActionRowBuilder().addComponents(first_page_btn, previous_page_btn, next_page_btn, last_page_btn)] })
                else return interaction.update({ embeds: [embed], components: [new ActionRowBuilder().addComponents(first_page_btn, previous_page_btn, next_page_btn, last_page_btn)] })
            }
            if (args?.Subcommand === "add-edit") {
                if (args.chance > 100) return interaction.editReply({ content: `${client.language({ textId: "Шанс не может быть", guildId: interaction.guildId, locale: interaction.locale })} > 100` })
                if (args.chance <= 0) return interaction.editReply({ content: `${client.language({ textId: "Шанс не может быть", guildId: interaction.guildId, locale: interaction.locale })} <= 0` })
                if (items_for_voice.filter(e => e.name !== args.item).reduce((previousValue, element) => previousValue += element.activities.voice.chance, 0) + args.chance > 100) return interaction.editReply({ content: `${client.language({ textId: "Сумма шансов всех предметов выдаваемых за голосовую активность не должна превышать 100", guildId: interaction.guildId, locale: interaction.locale })}` })
                if (args.min_amount <= 0) return interaction.editReply({ content: `${client.language({ textId: "Минимальное количество не может быть", guildId: interaction.guildId, locale: interaction.locale })} <= 0` })
                if (args.max_amount <= 0) return interaction.editReply({ content: `${client.language({ textId: "Максимальное количество не может быть", guildId: interaction.guildId, locale: interaction.locale })} <= 0` })
                const item = client.cache.items.find(item => item.guildID === interaction.guildId && (item.itemID === args.item || item.name.toLowerCase().includes(args.item.toLowerCase())))
                if (!item) return interaction.editReply({ content: `${client.language({ textId: "Предмет", guildId: interaction.guildId, locale: interaction.locale })} (**${args.item}**) ${client.language({ textId: "не найден", guildId: interaction.guildId, locale: interaction.locale })}.` })
                if (!item.activities) item.activities = { voice: {} }
                else if (!item.activities.voice) item.activities.voice = {}
                item.activities.voice.chance = args.chance
                item.activities.voice.amountFrom = args.min_amount
                item.activities.voice.amountTo = args.max_amount
                item.activities.voice.minxp = args.min_xp
                item.activities.voice.maxxp = args.max_xp
                await item.save()
                items_for_voice = client.cache.items.filter(item => item.guildID === interaction.guildId && item.activities?.voice?.chance).sort((a, b) => b.activities.voice.chance - a.activities.voice.chance)
                const description = [
                    `${client.language({ textId: "Предмет", guildId: interaction.guildId, locale: interaction.locale })} ${item.displayEmoji}**${item.name}** ${client.language({ textId: "добавлен в голосовую активность со следующими параметрами", guildId: interaction.guildId, locale: interaction.locale })}:`,
                    `> ${client.language({ textId: "Шанс", guildId: interaction.guildId, locale: interaction.locale })}: ${args.chance}%`,
                    `> ${client.language({ textId: "Минимальное количество за одну минуту голосовой активности", guildId: interaction.guildId, locale: interaction.locale })}: ${args.min_amount}`,
                    `> ${client.language({ textId: "Максимальное количество за одну минуту голосовой активности", guildId: interaction.guildId, locale: interaction.locale })}: ${args.max_amount}`
                ]
                return interaction.editReply({ content: description.join("\n") })
            }
        }
        if (args?.SubcommandGroup === "messages-items" || interaction.customId?.includes("messages-items")) {
            if (args?.Subcommand === "delete-all") {
                await Promise.all(client.cache.items.filter(item => item.guildID === interaction.guildId && item.activities?.message).map(async item => {
                    item.activities.message = undefined
                    await item.save()
                }))
                return interaction.editReply({ content: `${client.language({ textId: "Все предметы удалены из текстовой активности", guildId: interaction.guildId, locale: interaction.locale })}` })
            }
            if (args?.Subcommand === "delete") {
                if (args.item.length < 2) {
                    return interaction.editReply({ content: `${client.config.emojis.NO}${client.language({ textId: `Запрос содержит менее двух символов`, guildId: interaction.guildId, locale: interaction.locale })}` })  
                }
                let filteredItems = client.cache.items.filter(e => e.guildID === interaction.guildId && e.name.toLowerCase().includes(args.item.toLowerCase()))
                if (filteredItems.size > 1 && !filteredItems.some(e => e.name.toLowerCase() == args.item.toLowerCase())) {
                    let result = ""
                    for (const item of filteredItems) {
                        result += `> ${item.displayEmoji}**${item.name}**\n`
                    }
                    return interaction.editReply({ content: `${client.config.emojis.block} ${client.language({ textId: `По вашему запросу было найдено несколько предметов`, guildId: interaction.guildId, locale: interaction.locale })}:\n${result}` }) 
                }
                let serverItem
                if (filteredItems.some(e => e.name.toLowerCase() == args.item.toLowerCase())) {
                    serverItem = filteredItems.find(e => e.name.toLowerCase() == args.item.toLowerCase())
                    if (!serverItem) return interaction.editReply({ content: `${client.config.emojis.NO}${client.language({ textId: `Предмет не найден`, guildId: interaction.guildId, locale: interaction.locale })}.` })  
                } else {
                    serverItem = filteredItems.first()
                    if (!serverItem) return interaction.editReply({ content: `${client.config.emojis.NO}${client.language({ textId: `Предмет не найден`, guildId: interaction.guildId, locale: interaction.locale })}.` })  
                }
                if (!serverItem.activities?.message) {
                    return interaction.editReply({ content: `${client.config.emojis.NO}${client.language({ textId: `Предмет не находится в текстовой активности`, guildId: interaction.guildId, locale: interaction.locale })}.` }) 
                }
                serverItem.activities.message = undefined
                await serverItem.save()
                return interaction.editReply({ content: `${client.language({ textId: "Предмет", guildId: interaction.guildId, locale: interaction.locale })}${serverItem.displayEmoji}**${serverItem.name}** ${client.language({ textId: "был удален из текстовой активности", guildId: interaction.guildId, locale: interaction.locale })}` })
            }
            let items_for_messages = client.cache.items.filter(item => item.guildID === interaction.guildId && item.activities?.message?.chance).sort((a, b) => b.activities.message.chance - a.activities.message.chance).map(e => { 
                return { itemID: e.itemID, displayEmoji: e.displayEmoji, name: e.name, activities: { message: { chance: e.activities.message.chance, amountFrom: e.activities.message.amountFrom, amountTo: e.activities.message.amountTo } }, enabled: e.enabled, temp: e.temp, found: e.found }
            })
            if (args?.Subcommand === "list" || interaction.customId?.includes("list")) {
                if (!items_for_messages.length) {
                    if (interaction.replied || interaction.deferred) return interaction.editReply({ content: `${client.language({ textId: "На сервере не существует предметов текстовой активности", guildId: interaction.guildId, locale: interaction.locale })}`, embeds: [], components: [] })
                    else return interaction.update({ content: `${client.language({ textId: "На сервере не существует предметов текстовой активности", guildId: interaction.guildId, locale: interaction.locale })}`, embeds: [], components: [] })
                }
                if (!interaction.isChatInputCommand()) {
                    max = +limitRegexp.exec(interaction.customId)?.[1]
                    if (!max) max = 25
                    min = max - 25
                }
                const first_page_btn = new ButtonBuilder().setEmoji(`${client.config.emojis.arrowLeft2}`).setStyle(ButtonStyle.Secondary).setCustomId(`cmd{config}lim{25}messages-items list 1`).setDisabled((items_for_messages.length <= 25 && min == 0) || (items_for_messages.length > 25 && min < 25))
                const previous_page_btn = new ButtonBuilder().setEmoji(`${client.config.emojis.arrowLeft}`).setStyle(ButtonStyle.Secondary).setCustomId(`cmd{config}lim{${max - 25}}messages-items list 2`).setDisabled((items_for_messages.length <= 25 && min == 0) || (items_for_messages.length > 25 && min < 25))
                const next_page_btn = new ButtonBuilder().setEmoji(`${client.config.emojis.arrowRight}`).setStyle(ButtonStyle.Secondary).setCustomId(`cmd{config}lim{${max + 25}}messages-items list 3`).setDisabled((items_for_messages.length <= 25 && min == 0) || (items_for_messages.length > 25 && min >= items_for_messages.length - 25))
                const last_page_btn = new ButtonBuilder().setEmoji(`${client.config.emojis.arrowRight2}`).setStyle(ButtonStyle.Secondary).setCustomId(`cmd{config}lim{${items_for_messages.length + (items_for_messages.length % 25 == 0 ? 0 : 25 - (items_for_messages.length % 25))}}messages-items list 4`).setDisabled((items_for_messages.length <= 25 && min == 0) || (items_for_messages.length > 25 && min >= items_for_messages.length - 25))
                const embed = new EmbedBuilder()
                    .setAuthor({ name: `${client.language({ textId: "Предметы за текстовую активность", guildId: interaction.guildId, locale: interaction.locale })}` })
                    .setColor(3093046)
                const unknown_emoji = await client.functions.getEmoji(client, client.config.emojis.unknown)
                const description = [`🕐 - ${client.language({ textId: `несозданный (временный) предмет`, guildId: interaction.guildId, locale: interaction.locale })}\n🌫️ - ${client.language({ textId: `невидимый предмет (отключенный)`, guildId: interaction.guildId, locale: interaction.locale })}\n${unknown_emoji} - ${client.language({ textId: `неизвестный (неизученный) предмет`, guildId: interaction.guildId, locale: interaction.locale })}`]
                const profile = await client.functions.fetchProfile(client, interaction.user.id, interaction.guildId)
                let luck_multiplier_for_channel = 0
                let channel = client.cache.channels.find(channel => channel.id === interaction.channel.id && channel.isEnabled)
                if (!channel) channel = client.cache.channels.find(channel => channel.id === interaction.channel.parentId && channel.isEnabled)
                if (channel) {
                    luck_multiplier_for_channel = channel.luck_multiplier
                }
                const bonus = new Decimal(1).plus(profile.getLuckBoost(`${luck_multiplier_for_channel}`))
                items_for_messages = client.functions.adjustActivityChanceByLuck(items_for_messages, bonus, "message")
                if (bonus.lt(1) || bonus.gt(1)) description.push(`${client.config.emojis.random}${client.language({ textId: `Удача`, guildId: interaction.guildId, locale: interaction.locale })} ${bonus.mul(100).minus(100).toFixed()}%`)
                description.push(`${client.language({ textId: `Предметы`, guildId: interaction.guildId, locale: interaction.locale })}:`)
                items_for_messages.slice(min, max).forEach(item => {
                    description.push(`${item.temp ? '🕐' : ``}${!item.enabled ? `🌫️` : ``}${!item.found ? unknown_emoji : ``} ${items_for_messages.findIndex(e => e.itemID === item.itemID)+1}. ${item.displayEmoji}${item.name} ${item.activities.message.amountFrom !== item.activities.message.amountTo ? `(${item.activities.message.amountFrom}-${item.activities.message.amountTo})` :  `(${item.activities.message.amountFrom})`} 🎲${item.activities.message.chance}%`)
                })
                embed.setDescription(description.join("\n"))
                if (interaction.replied || interaction.deferred) return interaction.editReply({ embeds: [embed], components: [new ActionRowBuilder().addComponents(first_page_btn, previous_page_btn, next_page_btn, last_page_btn)] })
                else return interaction.update({ embeds: [embed], components: [new ActionRowBuilder().addComponents(first_page_btn, previous_page_btn, next_page_btn, last_page_btn)] })
            }
            if (args?.Subcommand === "add-edit") {
                if (args.chance > 100) return interaction.editReply({ content: `${client.language({ textId: "Шанс не может быть", guildId: interaction.guildId, locale: interaction.locale })} > 100` })
                if (args.chance <= 0) return interaction.editReply({ content: `${client.language({ textId: "Шанс не может быть", guildId: interaction.guildId, locale: interaction.locale })} <= 0` })
                if (items_for_messages.filter(e => e.name !== args.item).reduce((previousValue, element) => previousValue += element.activities.message.chance, 0) + args.chance > 100) return interaction.editReply({ content: `${client.language({ textId: "Сумма шансов всех предметов выдаваемых за сообщение не должна превышать 100", guildId: interaction.guildId, locale: interaction.locale })}` })
                if (args.min_amount <= 0) return interaction.editReply({ content: `${client.language({ textId: "Минимальное количество не может быть", guildId: interaction.guildId, locale: interaction.locale })} <= 0` })
                if (args.max_amount <= 0) return interaction.editReply({ content: `${client.language({ textId: "Максимальное количество не может быть", guildId: interaction.guildId, locale: interaction.locale })} <= 0` })
                const item = client.cache.items.find(item => item.guildID === interaction.guildId && (item.itemID === args.item || item.name.toLowerCase().includes(args.item.toLowerCase())))
                if (!item) return interaction.editReply({ content: `${client.language({ textId: "Предмет", guildId: interaction.guildId, locale: interaction.locale })} (**${args.item}**) ${client.language({ textId: "не найден", guildId: interaction.guildId, locale: interaction.locale })}.` })
                if (!item.activities) item.activities = { message: {} }
                else if (!item.activities.message) item.activities.message = {}
                item.activities.message.chance = args.chance
                item.activities.message.amountFrom = args.min_amount
                item.activities.message.amountTo = args.max_amount
                item.activities.message.minxp = args.min_xp
                item.activities.message.maxxp = args.max_xp
                await item.save()
                items_for_messages = client.cache.items.filter(item => item.guildID === interaction.guildId && item.activities?.message?.chance).sort((a, b) => b.activities.message.chance - a.activities.message.chance)
                const description = [
                    `${client.language({ textId: "Предмет", guildId: interaction.guildId, locale: interaction.locale })} ${item.displayEmoji}**${item.name}** ${client.language({ textId: "Предметы за текстовую активность", guildId: interaction.guildId, locale: interaction.locale })}:`,
                    `> ${client.language({ textId: "Шанс", guildId: interaction.guildId, locale: interaction.locale })}: ${args.chance}%`,
                    `> ${client.language({ textId: "Минимальное количество за сообщение", guildId: interaction.guildId, locale: interaction.locale })}: ${args.min_amount}`,
                    `> ${client.language({ textId: "Максимальное количество за сообщение", guildId: interaction.guildId, locale: interaction.locale })}: ${args.max_amount}`
                ]
                return interaction.editReply({ content: description.join("\n") })
            }
        }
    }
}