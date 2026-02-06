const Permission = require("../classes/permission.js")
const Job = require("../classes/job.js")
const Giveaway = require("../classes/giveaway.js")
const Wormhole = require("../classes/wormhole.js")
const Profile = require("../classes/profile.js")
const Item = require("../classes/item.js")
const Achievement = require("../classes/achievement.js")
const IncomeRole = require("../classes/IncomeRole")
const ChannelMultipliers = require("../classes/channelMultipliers")
const Promocode = require("../classes/promocode")
const Autogenerator = require("../classes/promocodeAutogenerator")
const Lot = require("../classes/Lot")
const Settings = require("../classes/Settings")
const { Collection } = require("discord.js")
const Quest = require("../classes/Quest.js")
const emojiSelectorSchema = require("../schemas/emojiSelectorSchema.js")
const EmojiSelector = require("../classes/EmojiSelector.js")
const auctionSchema = require("../schemas/auctionSchema.js")
const Auction = require("../classes/Auction.js")
const CustomRole = require("../classes/CustomRole.js")
const customRoleSchema = require("../schemas/customRoleSchema.js")

const cache = {
    settings: new Collection(),
    permissions: new Collection(),
    jobs: new Collection(),
    giveaways: new Collection(),
    wormholes: new Collection(),
    profiles: new Collection(),
    webhooks: new Collection(),
    items: new Collection(),
    invites: new Collection(),
    achievements: new Collection(),
    roles: new Collection(),
    channels: new Collection(),
    promocodes: new Collection(),
    promocodeAutogenerators: new Collection(),
    lots: new Collection(),
    quests: new Collection(),
    emojiSelectors: new Collection(),
    auctions: new Collection(),
    customRoles: new Collection(),
    blackjack: new Collection(),
    ready: false
}

// Конфигурация загрузки кэша
const cacheConfig = [
    {
        name: "settings",
        schema: client => client.settingsSchema,
        collection: cache.settings,
        class: Settings,
        key: "guildID",
        postProcess: null
    },
    {
        name: "permissions",
        schema: client => client.permissionSchema,
        collection: cache.permissions,
        class: Permission,
        key: "id",
        postProcess: null
    },
    {
        name: "jobs",
        schema: client => client.jobSchema,
        collection: cache.jobs,
        class: Job,
        key: "id",
        postProcess: null
    },
    {
        name: "giveaways",
        schema: client => client.giveawaySchema,
        collection: cache.giveaways,
        class: Giveaway,
        key: "giveawayID",
        postProcess: null
    },
    {
        name: "wormholes",
        schema: client => client.wormholeSchema,
        collection: cache.wormholes,
        class: Wormhole,
        key: "wormholeID",
        postProcess: null
    },
    {
        name: "income roles",
        schema: client => client.roleSchema,
        collection: cache.roles,
        class: IncomeRole,
        key: "id",
        postProcess: null
    },
    {
        name: "profiles",
        schema: client => client.profileSchema,
        collection: cache.profiles,
        class: Profile,
        key: (item, client) => `${item.guildID}${item.userID}`,
        postProcess: null
    },
    {
        name: "items",
        schema: client => client.itemSchema,
        collection: cache.items,
        class: Item,
        key: "itemID",
        postProcess: null
    },
    {
        name: "achievements",
        schema: client => client.achievementSchema,
        collection: cache.achievements,
        class: Achievement,
        key: "id",
        postProcess: null
    },
    {
        name: "channels",
        schema: client => client.channelMultipliersSchema,
        collection: cache.channels,
        class: ChannelMultipliers,
        key: "id",
        postProcess: null
    },
    {
        name: "promocodes",
        schema: client => client.promocodeSchema,
        collection: cache.promocodes,
        class: Promocode,
        key: (item, client) => `${item.code}_${item.guildID}`,
        postProcess: null
    },
    {
        name: "autogenerators",
        schema: client => client.promocodeAutogeneratorSchema,
        collection: cache.promocodeAutogenerators,
        class: Autogenerator,
        key: "id",
        postProcess: null
    },
    {
        name: "lots",
        schema: client => client.marketSchema,
        collection: cache.lots,
        class: Lot,
        key: "lotID",
        postProcess: (item) => {
            if (item.lifeTime) item.setTimeoutDelete();
        }
    },
    {
        name: "quests",
        schema: client => client.questSchema,
        collection: cache.quests,
        class: Quest,
        key: "questID",
        postProcess: null
    },
    {
        name: "emoji selectors",
        schema: () => emojiSelectorSchema,
        collection: cache.emojiSelectors,
        class: EmojiSelector,
        key: "id",
        postProcess: (item) => {
            if (item.deleteDate) item.setTimeoutDelete();
        }
    },
    {
        name: "auctions",
        schema: () => auctionSchema,
        collection: cache.auctions,
        class: Auction,
        key: "id",
        postProcess: (item) => {
            if (item.status === "started" && item.endDate) item.setTimeoutEnd();
            if (item.status === "finished" && item.deleteDate) item.setTimeoutDelete();
        }
    },
    {
        name: "custom roles",
        schema: () => customRoleSchema,
        collection: cache.customRoles,
        class: CustomRole,
        key: "id",
        postProcess: (item) => {
            if ((item.status === "moderation" || item.status === "editing") && item.deleteDate) {
                item.setTimeoutDelete();
            }
        }
    }
];

// Универсальная функция загрузки данных в кэш
const loadCacheData = async (client, config) => {
    console.time(`Successfully cached ${config.name}`);
    
    const guilds = client.guilds.cache.filter(e => e.available).map(e => e.id);
    const schema = typeof config.schema === 'function' ? config.schema(client) : config.schema;
    
    const data = await schema.find({ guildID: { $in: guilds } }).lean();
    
    await Promise.all(data.map(item => {
        const instance = new config.class(client, item);
        const key = typeof config.key === 'function' ? config.key(item, client) : item[config.key];
        
        config.collection.set(key, instance);
        
        if (config.postProcess) {
            config.postProcess(instance);
        }
    }));
    
    console.timeEnd(`Successfully cached ${config.name}`);
};

// Основная функция загрузки кэша
const loadCache = async (client) => {
    // Параллельная загрузка независимых коллекций
    const independentCollections = cacheConfig.filter(config => 
        !['profiles', 'lots', 'emoji selectors', 'auctions', 'custom roles'].includes(config.name)
    );
    
    const dependentCollections = cacheConfig.filter(config => 
        ['profiles', 'lots', 'emoji selectors', 'auctions', 'custom roles'].includes(config.name)
    );
    
    // Загружаем независимые коллекции параллельно
    await Promise.all(independentCollections.map(config => 
        loadCacheData(client, config).catch(error => {
            console.error(`Error loading ${config.name}:`, error);
        })
    ));
    
    // Загружаем зависимые коллекции последовательно
    for (const config of dependentCollections) {
        await loadCacheData(client, config).catch(error => {
            console.error(`Error loading ${config.name}:`, error);
        });
    }
    
    // Загрузка эмодзи
    await client.application.emojis.fetch();
    cache.ready = true;
};

// Функция для обновления конкретной записи в кэше
const updateCacheItem = (client, schemaName, data) => {
    const config = cacheConfig.find(c => c.name === schemaName);
    if (!config) {
        console.warn(`Unknown schema: ${schemaName}`);
        return;
    }
    
    const instance = new config.class(client, data);
    const key = typeof config.key === 'function' ? config.key(data, client) : data[config.key];
    
    config.collection.set(key, instance);
    
    if (config.postProcess) {
        config.postProcess(instance);
    }
};

// Функция для удаления записи из кэша
const removeCacheItem = (schemaName, key) => {
    const config = cacheConfig.find(c => c.name === schemaName);
    if (!config) {
        console.warn(`Unknown schema: ${schemaName}`);
        return;
    }
    
    config.collection.delete(key);
};

// Функция для получения данных из кэша
const getFromCache = (schemaName, key) => {
    const config = cacheConfig.find(c => c.name === schemaName);
    if (!config) {
        console.warn(`Unknown schema: ${schemaName}`);
        return null;
    }
    
    return config.collection.get(key);
};

// Функция для очистки кэша гильдии
const clearGuildCache = (guildId) => {
    for (const config of cacheConfig) {
        const keysToDelete = [];
        
        config.collection.forEach((item, key) => {
            if (item.guildID === guildId) {
                keysToDelete.push(key);
            }
        });
        
        keysToDelete.forEach(key => config.collection.delete(key));
    }
};

module.exports = { 
    cache,
    loadCache,
    updateCacheItem,
    removeCacheItem,
    getFromCache,
    clearGuildCache
};