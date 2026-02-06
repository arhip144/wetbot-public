const { EmbedBuilder, ContainerBuilder, TextDisplayBuilder, SectionBuilder, ThumbnailBuilder, SeparatorBuilder, MessageFlags, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js")
const profileSchema = require("../schemas/profileSchema.js")
const { RewardType, AchievementType } = require("../enums/index")
const Decimal = require("decimal.js")
const lt = require('long-timeout')
const uniqid = require('uniqid')
function createStatSetter(propertyName) {
    return function(value) {
        const oldValue = this[`_${propertyName}`] || 0;
        const difference = value - oldValue;
        this[`_${propertyName}`] = value;
        if (difference !== 0) {
            const stats = this.stats ||= {};
            const periods = ['daily', 'weekly', 'monthly', 'yearly'];
            for (const period of periods) {
                const periodObj = stats[period] ||= { [propertyName]: 0 };
                periodObj[propertyName] = (periodObj[propertyName] || 0) + difference;
            }
        }
    }
}
class Profile {
	constructor(client, profile) {
        this._client = client
        this._userID = profile.userID
        this._guildID = profile.guildID
        this._totalxp = profile.totalxp
        this._seasonTotalXp = profile.seasonTotalXp
        this._xp = profile.xp
        this._seasonXp = profile.seasonXp
        this._xpSession = profile.xpSession
        this._rpSession = profile.rpSession
        this._level = profile.level
        this._seasonLevel = profile.seasonLevel
        this._messages = profile.messages
        this._hours = profile.hours
        this._rp = profile.rp
        this._hoursSession = profile.hoursSession
        this._likes = profile.likes
        this._currency = profile.currency
        this._currencySession = profile.currencySession
        this._currencySpent = profile.currencySpent
        this._itemsSession = profile.itemsSession
        this._invites = profile.invites
        this._startTime = profile.startTime
        this._inviterInfo = profile.inviterInfo
        this._bio = profile.bio
        this._birthday_day = profile.birthday_day
        this._birthday_month = profile.birthday_month
        this._birthday_year = profile.birthday_year
        this._image = profile.image
        this._bumps = profile.bumps
        this._giveawaysCreated = profile.giveawaysCreated
        this._multiplyXP = profile.multiplyXP
        this._multiplyXPTime = profile.multiplyXPTime
        this._multiplyCUR = profile.multiplyCUR
        this._multiplyCURTime = profile.multiplyCURTime
        this._multiplyLuck = profile.multiplyLuck
        this._multiplyLuckTime = profile.multiplyLuckTime
        this._multiplyRP = profile.multiplyRP
        this._multiplyRPTime = profile.multiplyRPTime
        this._daysStreak = profile.daysStreak
        this._lastDaily = profile.lastDaily
        this._lastLike = profile.lastLike
        this._fishing = profile.fishing
        this._mining = profile.mining
        this._maxDaily = profile.maxDaily
        this._wormholeTouched = profile.wormholeTouched
        this._doneQuests = profile.doneQuests
        this._itemsSoldOnMarketPlace = profile.itemsSoldOnMarketPlace
        this._inventory = profile.inventory
        this._achievements = profile.achievements
        this._roles = profile.roles
        this._quests = profile.quests
        this._blockActivities = profile.blockActivities
        this._vk = profile.vk
        this._tiktok = profile.tiktok
        this._steam = profile.steam
        this._instagram = profile.instagram
        this._isHiden = profile.isHiden
        this._joinDateIsHiden = profile.joinDateIsHiden
        this._achievementsHiden = profile.achievementsHiden
        this._sex = profile.sex
        this._hideSex = profile.hideSex
        this._marry = profile.marry
        this._marryDate = profile.marryDate
        this._trophies = profile.trophies
        this._trophyHide = profile.trophyHide
        this._deleteFromDB = profile.deleteFromDB
        this._rank_card = profile.rank_card
        this._itemsOpened = profile.itemsOpened
        this._wormholesSpawned = profile.wormholesSpawned
        this._itemsReceived = profile.itemsReceived
        this._itemsCrafted = profile.itemsCrafted
        this._itemsUsed = profile.itemsUsed
        this._itemsBoughtInShop = profile.itemsBoughtInShop
        this._itemsBoughtOnMarket = profile.itemsBoughtOnMarket
        this._itemsSold = profile.itemsSold
        this._roleIncomeCooldowns = profile.roleIncomeCooldowns ? new Map(Object.entries(profile.roleIncomeCooldowns)) : undefined
        this._dailyLimits = profile.dailyLimits
        this._weeklyLimits = profile.weeklyLimits
        this._monthlyLimits = profile.monthlyLimits
        this._dropdownCooldowns = profile.dropdownCooldowns ? new Map(Object.entries(profile.dropdownCooldowns)) : undefined
        this._levelMention = profile.levelMention
        this._achievementMention = profile.achievementMention
        this._itemMention = profile.itemMention
        this._roleIncomeMention = profile.roleIncomeMention
        this._inviteJoinMention = profile.inviteJoinMention
        this._inviteLeaveMention = profile.inviteLeaveMention
        this._jobsCooldowns = profile.jobsCooldowns ? new Map(Object.entries(profile.jobsCooldowns)) : undefined
        this._allJobsCooldown = profile.allJobsCooldown
        this._itemsCooldowns = profile.itemsCooldowns ? new Map(Object.entries(profile.itemsCooldowns)) : undefined
        this._stats = profile.stats
        this._boosts = profile.boosts
        this._works = profile.works
        this._inventoryRoles = profile.inventoryRoles
        this._giveawayWins = profile.giveawayWins
        this._socialLinksHidden = profile.socialLinksHidden
        this._rolesHidden = profile.rolesHidden
        this._bioHidden = profile.bioHidden
        this._bannerHidden = profile.bannerHidden
        this._birthdateHidden = profile.birthdateHidden
        this._birthYearHidden = profile.birthYearHidden
        this._thumbnailHidden = profile.thumbnailHidden
        this._thumbnail = profile.thumbnail
        this._profileLikes = profile.profileLikes
        this._usersWhoLiked = profile.usersWhoLiked
        this._promocodesUsed = profile.promocodesUsed
        this._autoIncomeExpire = profile.autoIncomeExpire
        this._settings_open_ephemeral = profile.settings_open_ephemeral
        this._settings_open_always_maximum = profile.settings_open_always_maximum
        this._settings_open_disallow_luck = profile.settings_open_disallow_luck
        this._settings_open_always_active = profile.settings_open_always_active
        this._timeouts = {
            autoIncome: null,
            nextIncome: null,
            deleteFromDb: null
        }
        if (this._autoIncomeExpire && this._autoIncomeExpire > new Date()) {
            this.setAutoIncomeTimeout()
        } else if (this._autoIncomeExpire <= new Date()) {
            this._autoIncomeExpire = undefined
            this.save()
        }
        if (this._deleteFromDB) {
            this.setDeleteFromDbTimeout()
        }
	}

    get timeouts() { return this._timeouts }

    get client() { return this._client }

    get guildID() { return this._guildID }

    get userID() { return this._userID }

    get messages() { return this._messages || 0 }
    set messages(value) { createStatSetter('messages').call(this, value) }

    get totalxp() { return this._totalxp || 0 }
    set totalxp(value) { createStatSetter('totalxp').call(this, value) }

    get seasonTotalXp() { return this._seasonTotalXp || 0 }
    set seasonTotalXp(value) { this._seasonTotalXp = value }

    get xp() { return this._xp || 0 }
    set xp(value) { this._xp = value }

    get level() { return this._level || 0 }
    set level(value) { this._level = value }

    get seasonLevel() { return this._seasonLevel || 0 }
    set seasonLevel(value) { this._seasonLevel = value }

    get seasonXp() { return this._seasonXp || 0 }
    set seasonXp(value) { this._seasonXp = value }

    get xpSession() { return this._xpSession || 0 }
    set xpSession(value) { this._xpSession = value }

    get rpSession() { return this._rpSession || 0 }
    set rpSession(value) { this._rpSession = value }

    get hours() { return this._hours || 0 }
    set hours(value) { createStatSetter('hours').call(this, value) }

    get rp() { return this._rp || 0 }
    set rp(value) { createStatSetter('rp').call(this, value) }

    get hoursSession() { return this._hoursSession || 0 }
    set hoursSession(value) { this._hoursSession = value }

    get likes() { return this._likes || 0 }
    set likes(value) { createStatSetter('likes').call(this, value) }

    get currency() { return this._currency || 0 }
    set currency(value) { createStatSetter('currency').call(this, value) }

    get currencySession() { return this._currencySession || 0 }
    set currencySession(value) { this._currencySession = value }

    get currencySpent() { return this._currencySpent || 0 }
    set currencySpent(value) { this._currencySpent = value }

    get itemsSession() { return this._itemsSession || [] }
    set itemsSession(value) { this._itemsSession = value }

    get invites() { return this._invites || 0 }
    set invites(value) { createStatSetter('invites').call(this, value) }

    get startTime() { return this._startTime }
    set startTime(value) { this._startTime = value }

    get inviterInfo() { return this._inviterInfo }
    set inviterInfo(value) { this._inviterInfo = value }

    get bumps() { return this._bumps || 0 }
    set bumps(value) { createStatSetter('bumps').call(this, value) }

    get giveawaysCreated() { return this._giveawaysCreated || 0 }
    set giveawaysCreated(value) { createStatSetter('giveawaysCreated').call(this, value) }

    get multiplyXP() { return this._multiplyXP || 0 }
    set multiplyXP(value) { this._multiplyXP = value }

    get multiplyCUR() { return this._multiplyCUR || 0 }
    set multiplyCUR(value) { this._multiplyCUR = value }

    get multiplyLuck() { return this._multiplyLuck || 0 }
    set multiplyLuck(value) { this._multiplyLuck = value }

    get multiplyRP() { return this._multiplyRP || 0 }
    set multiplyRP(value) { this._multiplyRP = value }

    get fishing() { return this._fishing || 0 }
    set fishing(value) { this._fishing = value }

    get mining() { return this._mining || 0 }
    set mining(value) { this._mining = value }

    get maxDaily() { return this._maxDaily || 0 }
    set maxDaily(value) { this._maxDaily = value }

    get wormholeTouched() { return this._wormholeTouched || 0 }
    set wormholeTouched(value) { createStatSetter('wormholeTouched').call(this, value) }

    get doneQuests() { return this._doneQuests || 0 }
    set doneQuests(value) { createStatSetter('doneQuests').call(this, value) }

    get itemsSoldOnMarketPlace() { return this._itemsSoldOnMarketPlace || 0 }
    set itemsSoldOnMarketPlace(value) { createStatSetter('itemsSoldOnMarketPlace').call(this, value) }

    get itemsOpened() { return this._itemsOpened || 0 }
    set itemsOpened(value) { this._itemsOpened = value }

    get wormholesSpawned() { return this._wormholesSpawned || 0 }
    set wormholesSpawned(value) { this._wormholesSpawned = value }
    
    get itemsReceived() { return this._itemsReceived || 0 }
    set itemsReceived(value) { this._itemsReceived = value }

    get itemsCrafted() { return this._itemsCrafted || 0 }
    set itemsCrafted(value) { this._itemsCrafted = value }

    get itemsUsed() { return this._itemsUsed || 0 }
    set itemsUsed(value) { this._itemsUsed = value }

    get itemsBoughtInShop() { return this._itemsBoughtInShop || 0 }
    set itemsBoughtInShop(value) { this._itemsBoughtInShop = value }

    get itemsBoughtOnMarket() { return this._itemsBoughtOnMarket || 0 }
    set itemsBoughtOnMarket(value) { this._itemsBoughtOnMarket = value }

    get itemsSold() { return this._itemsSold || 0 }
    set itemsSold(value) { this._itemsSold = value }

    get lastDaily() { return this._lastDaily || new Date(Date.now() - 86400000) }
    set lastDaily(value) { this._lastDaily = value }

    get lastLike() { return this._lastLike || new Date(Date.now() - 86400000) }
    set lastLike(value) { this._lastLike = value }

    get boosts() { return this._boosts || 0 }
    set boosts(value) { this._boosts = value }

    get works() { return this._works || 0 }
    set works(value) { this._works = value }

    get giveawayWins() { return this._giveawayWins || 0 }
    set giveawayWins(value) { this._giveawayWins = value }

    get profileLikes() { return this._profileLikes || 0 }
    set profileLikes(value) { this._profileLikes = value }

    get promocodesUsed() { return this._promocodesUsed || 0 }
    set promocodesUsed(value) { this._promocodesUsed = value }

    get bio() { return this._bio || '' }
    set bio(value) { this._bio = value }
    
    get birthday_day() { return this._birthday_day }
    set birthday_day(value) { this._birthday_day = value }
    
    get birthday_month() { return this._birthday_month }
    set birthday_month(value) { this._birthday_month = value }
    
    get birthday_year() { return this._birthday_year }
    set birthday_year(value) { this._birthday_year = value }
    
    get image() { return this._image }
    set image(value) { this._image = value }
    
    get multiplyXPTime() { return this._multiplyXPTime }
    set multiplyXPTime(value) { this._multiplyXPTime = value }
    
    get multiplyCURTime() { return this._multiplyCURTime }
    set multiplyCURTime(value) { this._multiplyCURTime = value }
    
    get multiplyLuckTime() { return this._multiplyLuckTime }
    set multiplyLuckTime(value) { this._multiplyLuckTime = value }
    
    get multiplyRPTime() { return this._multiplyRPTime }
    set multiplyRPTime(value) { this._multiplyRPTime = value }
    
    get daysStreak() { return this._daysStreak || 0 }
    set daysStreak(value) { this._daysStreak = value }
    
    get inventory() { return this._inventory }
    set inventory(value) { this._inventory = value }
    
    get achievements() { return this._achievements }
    set achievements(value) { this._achievements = value }
    
    get roles() { return this._roles }
    set roles(value) { this._roles = value }
    
    get quests() { return this._quests }
    set quests(value) { this._quests = value }
    
    get blockActivities() { return this._blockActivities }
    set blockActivities(value) { this._blockActivities = value }
    
    get vk() { return this._vk }
    set vk(value) { this._vk = value }
    
    get tiktok() { return this._tiktok }
    set tiktok(value) { this._tiktok = value }
    
    get steam() { return this._steam }
    set steam(value) { this._steam = value }
    
    get instagram() { return this._instagram }
    set instagram(value) { this._instagram = value }
    
    get isHiden() { return this._isHiden || false }
    set isHiden(value) { this._isHiden = value }
    
    get joinDateIsHiden() { return this._joinDateIsHiden || false }
    set joinDateIsHiden(value) { this._joinDateIsHiden = value }
    
    get achievementsHiden() { return this._achievementsHiden || false }
    set achievementsHiden(value) { this._achievementsHiden = value }
    
    get sex() { return this._sex }
    set sex(value) { this._sex = value }
    
    get hideSex() { return this._hideSex || false }
    set hideSex(value) { this._hideSex = value }
    
    get marry() { return this._marry }
    set marry(value) { this._marry = value }
    
    get marryDate() { return this._marryDate }
    set marryDate(value) { this._marryDate = value }
    
    get trophies() { return this._trophies }
    set trophies(value) { this._trophies = value }
    
    get trophyHide() { return this._trophyHide || false }
    set trophyHide(value) { this._trophyHide = value }
    
    get deleteFromDB() { return this._deleteFromDB }
    set deleteFromDB(value) { this._deleteFromDB = value }
    
    get rank_card() { return this._rank_card }
    set rank_card(value) { this._rank_card = value }
    
    get roleIncomeCooldowns() { return this._roleIncomeCooldowns }
    set roleIncomeCooldowns(value) { this._roleIncomeCooldowns = value instanceof Map ? value : new Map(Object.entries(value || {})) }
    
    get dailyLimits() { return this._dailyLimits }
    set dailyLimits(value) { this._dailyLimits = value }
    
    get weeklyLimits() { return this._weeklyLimits }
    set weeklyLimits(value) { this._weeklyLimits = value }
    
    get monthlyLimits() { return this._monthlyLimits }
    set monthlyLimits(value) { this._monthlyLimits = value }
    
    get dropdownCooldowns() { return this._dropdownCooldowns }
    set dropdownCooldowns(value) { this._dropdownCooldowns = value instanceof Map ? value : new Map(Object.entries(value || {})) }
    
    get levelMention() { return this._levelMention || false }
    set levelMention(value) { this._levelMention = value }
    
    get achievementMention() { return this._achievementMention || false }
    set achievementMention(value) { this._achievementMention = value }
    
    get itemMention() { return this._itemMention || false }
    set itemMention(value) { this._itemMention = value }
    
    get roleIncomeMention() { return this._roleIncomeMention || false }
    set roleIncomeMention(value) { this._roleIncomeMention = value }
    
    get inviteJoinMention() { return this._inviteJoinMention || false }
    set inviteJoinMention(value) { this._inviteJoinMention = value }
    
    get inviteLeaveMention() { return this._inviteLeaveMention || false }
    set inviteLeaveMention(value) { this._inviteLeaveMention = value }
    
    get jobsCooldowns() { return this._jobsCooldowns }
    set jobsCooldowns(value) { this._jobsCooldowns = value instanceof Map ? value : new Map(Object.entries(value || {})) }
    
    get allJobsCooldown() { return this._allJobsCooldown }
    set allJobsCooldown(value) { this._allJobsCooldown = value }
    
    get itemsCooldowns() { return this._itemsCooldowns }
    set itemsCooldowns(value) { this._itemsCooldowns = value instanceof Map ? value : new Map(Object.entries(value || {})) }
    
    get stats() { return this._stats }
    set stats(value) { this._stats = value }
    
    get inventoryRoles() { return this._inventoryRoles }
    set inventoryRoles(value) { this._inventoryRoles = value }
    
    get socialLinksHidden() { return this._socialLinksHidden || false }
    set socialLinksHidden(value) { this._socialLinksHidden = value }
    
    get rolesHidden() { return this._rolesHidden || false }
    set rolesHidden(value) { this._rolesHidden = value }
    
    get bioHidden() { return this._bioHidden || false }
    set bioHidden(value) { this._bioHidden = value }
    
    get bannerHidden() { return this._bannerHidden || false }
    set bannerHidden(value) { this._bannerHidden = value }
    
    get birthdateHidden() { return this._birthdateHidden || false }
    set birthdateHidden(value) { this._birthdateHidden = value }
    
    get birthYearHidden() { return this._birthYearHidden || false }
    set birthYearHidden(value) { this._birthYearHidden = value }
    
    get thumbnailHidden() { return this._thumbnailHidden || false }
    set thumbnailHidden(value) { this._thumbnailHidden = value }
    
    get thumbnail() { return this._thumbnail }
    set thumbnail(value) { this._thumbnail = value }
    
    get usersWhoLiked() { return this._usersWhoLiked }
    set usersWhoLiked(value) { this._usersWhoLiked = value }
    
    get autoIncomeExpire() { return this._autoIncomeExpire }
    set autoIncomeExpire(value) { this._autoIncomeExpire = value }
    
    get settings_open_ephemeral() { return this._settings_open_ephemeral || false }
    set settings_open_ephemeral(value) { this._settings_open_ephemeral = value }
    
    get settings_open_always_maximum() { return this._settings_open_always_maximum || false }
    set settings_open_always_maximum(value) { this._settings_open_always_maximum = value }
    
    get settings_open_disallow_luck() { return this._settings_open_disallow_luck || false }
    set settings_open_disallow_luck(value) { this._settings_open_disallow_luck = value }
    
    get settings_open_always_active() { return this._settings_open_always_active || false }
    set settings_open_always_active(value) { this._settings_open_always_active = value }
    
    clearAutoIncomeTimeout() {
        lt.clearTimeout(this.timeouts.autoIncome)
        delete this.timeouts.autoIncome
        if (this.timeouts.nextIncome) {
            lt.clearTimeout(this.timeouts.nextIncome)
            delete this.timeouts.nextIncome
        }
    }
    setDeleteFromDbTimeout() {
        this.timeouts.deleteFromDb = lt.setTimeout(async () => {
            const guild = this.client.guilds.cache.get(this.guildID)
            const member = await guild.members.fetch(this.userID).catch(() => null)
            if (!member) return this.delete()
            this.deleteFromDB = undefined
            this.clearDeleteFromDbTimeout()
            this.save()   
        }, this.deleteFromDB.getTime() - Date.now())
    }
    clearDeleteFromDbTimeout() {
        lt.clearTimeout(this.timeouts.deleteFromDb)
        delete this.timeouts.deleteFromDb
    }
    async save() {
        const { _timeouts, _client, ...clone } = this
        const keys = Object.keys(clone)
        let hasStatsChanges = false
        const statsChanges = {}
        for (const key of keys) {
            const value = clone[key]
            if (key.startsWith("_")) {
                const newKey = key.slice(1)
                clone[newKey] = value
                delete clone[key]
                if (newKey === "stats" && value && typeof value === 'object') {
                    this._processStats(value, statsChanges)
                    hasStatsChanges = true
                }
            } 
            else if (value === 0) {
                clone[key] = undefined
            } 
            else if (key === "stats" && value && typeof value === 'object') {
                this._processStats(value, statsChanges)
                hasStatsChanges = true
            }
        }
        if (hasStatsChanges) {
            for (const [key, value] of Object.entries(statsChanges)) {
                clone.stats[key] = value
            }
        }
		await profileSchema.replaceOne({ userID: clone.userID, guildID: clone.guildID }, clone, { upsert: true })
	}
    async delete() {
        const { timeouts } = this
        if (timeouts.autoIncome) lt.clearTimeout(timeouts.autoIncome)
        if (timeouts.nextIncome) lt.clearTimeout(timeouts.nextIncome)
        const { userID, guildID, client } = this
        const cacheKey = guildID + userID
        await Promise.all([
            profileSchema.deleteOne({ userID, guildID }),
            client.cache.profiles.delete(cacheKey)
        ])
	}
    async setAutoIncomeTimeout() {
        const now = Date.now();
        const autoIncomeExpireTime = this.autoIncomeExpire.getTime();
        
        // Устанавливаем таймер автоматического окончания дохода
        this.timeouts.autoIncome = lt.setTimeout(() => {
            this._clearIncomeTimeouts();
            this.autoIncomeExpire = undefined;
        }, Math.max(0, autoIncomeExpireTime - now));

        // Устанавливаем таймер следующего дохода, если его нет
        if (!this.timeouts.nextIncome) {
            const nextIncomeTimeout = this._calculateNextIncomeTimeout(now);
            if (nextIncomeTimeout > 0) {
                this.timeouts.nextIncome = lt.setTimeout(async () => {
                    await this.getIncome();
                }, nextIncomeTimeout);
            }
        }
    }
    async getIncome(interaction) {
        const { guildID, userID, client } = this;
        const guild = client.guilds.cache.get(guildID);
        if (!guild) return this._handleNoGuild();

        const settings = client.cache.settings.find(s => s.guildID === guildID);
        if (!settings) return;

        const member = await guild.members.fetch(userID).catch(() => null);
        if (!member) return this._handleNoMember();

        // Получаем и фильтруем роли
        const roles = await this._getFilteredRoles(guild, member);
        
        // Обрабатываем доход
        const result = await this._processRolesIncome(roles, member, settings, interaction);
        
        // Управление таймерами
        this._manageIncomeTimers();
        
        return result;
    }
    /**
     * Добавляет опыт пользователю
     * @param {Object} params - Параметры функции
     * @param {number} params.amount - Количество опыта
     * @param {boolean} [params.save=true] - Сохранять ли в базу данных
     * @param {boolean} [params.noSeasonXP=false] - Без сезонного опыта
     * @param {boolean} [params.noLogs=false] - Без логирования
     * @param {boolean} [params.noNotification=false] - Без уведомлений
     * @returns {Promise<void>}
     */
    async addXp({ amount = 1, save = false, noSeasonXP = false, noLogs = false, noNotification = false }) {
        if (amount < 0) return this.subtractXp(+amount, save, noNotification, noLogs);
        
        const { guildID, userID, client } = this;
        const settings = client.cache.settings.get(guildID);
        if (!settings) return;

        // Расчет опыта
        this.totalxp += amount;

        // Расчет уровней
        await this._processLevelUps({ noNotification, noLogs });

        this.xp = this._getCurrentXp(this.totalxp, settings.levelfactor)

        // Квесты для опыта
        const expQuests = this.client.cache.quests.filter(quest => 
            quest.guildID === this.guildID && 
            quest.isEnabled && 
            quest.targets.some(target => target.type === "exp")
        );
        if (expQuests.size) {
            await this.addQuestProgression({ type: "exp", amount, noNotification });
        }

        // Сезонный опыт
        if (settings.seasonLevelsEnabled && !noSeasonXP) {
            // Расчет сезонного опыта
            this.seasonTotalXp += amount;
            this.seasonXp = this._getCurrentXp(this.seasonTotalXp, settings.seasonLevelfactor)

            // Расчет сезонных уровней
            await this._processSeasonLevelUps({ noNotification });

            // Квесты для сезонного опыта
            const seasonXpQuests = this.client.cache.quests.filter(quest => 
                quest.guildID === this.guildID && 
                quest.isEnabled && 
                quest.targets.some(target => target.type === "seasonXp")
            );
            if (seasonXpQuests.size) {
                await this.addQuestProgression({ type: "seasonXp", amount, noNotification });
            }
        }

        // Сохранение
        if (save) {
            await this.save();
        }

        //Логирование
        if (!noLogs) {
            client.emit("economyLogCreate", guildID, 
                `${client.language({ textId: "Изменение опыта", guildId: guildID })} (${amount}) ${client.language({ textId: "для", guildId: guildID })} <@${userID}>`
            );
        }
    }
    /**
     * Вычитает указанное количество опыта у пользователя и обрабатывает связанные системные события
     * 
     * Метод выполняет комплексную операцию по вычитанию опыта, включая:
     * - Вычитание основного и сезонного опыта (если включено)
     * - Пересчет уровней и обработку понижения уровня
     * - Обновление ролей уровня при понижении
     * - Отправку уведомлений пользователю
     * - Логирование операции
     * 
     * @async
     * @param {Object} options - Объект с настройками операции
     * @param {number} [options.amount=1] - Количество опыта для вычитания. Должно быть положительным числом
     * @param {boolean} [options.save=false] - Если true, изменения сохраняются в базу данных
     * @param {boolean} [options.noNotification=false] - Если true, уведомления пользователю не отправляются
     * @param {boolean} [options.noLogs=false] - Если true, операция не логируется в системе
     * @returns {Promise<void>}
     * @throws {Error} Когда настройки гильдии не найдены или возникают ошибки при сохранении/обработке
     * 
     * @fires Client#economyLogCreate - Событие логирования экономических операций
     * 
     * @see _subtractRegularXp
     * @see _subtractSeasonXp  
     * @see _processSeasonLevelUps
     * @see _processLevelRoles
     * @see _sendLevelNotification
     */
    async subtractXp({ amount = 1, save = false, noNotification = false, noLogs = false }) {
        const { guildID, userID, client } = this;
        const settings = client.cache.settings.get(guildID);
        if (!settings) return;

        const oldLevel = this.level;
        
        // Вычитание основного опыта
        this._subtractRegularXp(amount);
        
        // Вычитание сезонного опыта
        if (settings.seasonLevelsEnabled) {
            this._subtractSeasonXp(amount);
            // Расчет сезонных уровней
            await this._processSeasonLevelUps({ noNotification });
        }

        // Уведомления об изменении уровня
        const levelDecreased = this.level < oldLevel;
        if (levelDecreased) {
            const guild = this.client.guilds.cache.get(this.guildID);
            const member = await guild.members.fetch(this.userID).catch(() => null);
            // Обработка ролей уровня
            const roleChanges = await this._processLevelRoles(guild, member, settings);
            if (!noNotification) await this._sendLevelNotification(roleChanges)
        }

        if (save) {
            await this.save();
        }

        // Логирование
        client.emit("economyLogCreate", guildID, 
            `${client.language({ textId: "Изменение опыта", guildId: guildID })} (-${amount}) ${client.language({ textId: "для", guildId: guildID })} <@${userID}>`
        );
    }
    /**
     * Устанавливает точное значение опыта пользователя, автоматически вычисляя разницу
     * 
     * Метод интеллектуально устанавливает указанное количество опыта, определяя 
     * необходимость добавления или вычитания опыта для достижения целевого значения.
     * 
     * @async
     * @param {Object} options - Параметры установки опыта
     * @param {number} [options.amount=1] - Целевое количество опыта для установки
     * @param {boolean} [options.save=false] - Сохранять ли изменения в базе данных
     * @param {boolean} [options.noNotification=false] - Отключить уведомления пользователя
     * @param {boolean} [options.noLogs=false] - Отключить логирование операции
     * @returns {Promise<void>}
     * @throws {Error} Если возникают ошибки при вызове addXp или subtractXp
     * @example
     * // Установить точно 1000 опыта
     * await profile.setXp({ amount: 1000, save: true });
     * 
     * // Установить 500 опыта без уведомлений
     * await profile.setXp({ 
     *   amount: 500, 
     *   noNotification: true 
     * });
     * 
     * // Сбросить опыт до 1 без логирования
     * await profile.setXp({ 
     *   amount: 1, 
     *   noLogs: true 
     * });
     */
    async setXp({ amount = 1, save = false, noNotification = false, noLogs = false }) {
        if (this.totalxp > amount) await this.subtractXp({ amount: this.totalxp - amount, save, noNotification, noLogs })
        if (this.totalxp < amount) await this.addXp({ amount: amount - this.totalxp, save, noNotification, noLogs })
        return
    }
    /**
     * Добавляет уровни пользователю с пересчетом опыта и обработкой связанных систем
     * 
     * Метод выполняет комплексное добавление уровней, включая:
     * - Увеличение уровня пользователя
     * - Пересчет общего опыта по арифметической прогрессии
     * - Обработку квестов, связанных с уровнями
     * - Обновление ролей уровня и отправку уведомлений
     * - Добавление сезонных уровней (если применимо)
     * 
     * @async
     * @param {Object} options - Параметры добавления уровней
     * @param {number} [options.amount=1] - Количество уровней для добавления
     * @param {boolean} [options.save=false] - Сохранять ли изменения в базе данных
     * @param {boolean} [options.noNotification=false] - Отключить уведомления пользователя
     * @returns {Promise<void>}
     * @throws {Error} Если настройки гильдии не найдены или возникают ошибки при сохранении
     * 
     * @example
     * // Добавить 5 уровней с сохранением
     * await profile.addLevel({ amount: 5, save: true });
     * 
     * // Добавить 1 уровень без уведомлений
     * await profile.addLevel({ noNotification: true });
     * 
     * // Массовое добавление уровней
     * await profile.addLevel({ amount: 10, save: true, noNotification: false });
     */
    async addLevel({ amount = 1, save = false, noNotification = false }) {
        const { guildID, client } = this;
        const settings = client.cache.settings.find(s => s.guildID === guildID);
        if (!settings) return;

        const oldLevel = this.level;
        const targetLevel = oldLevel + amount;
        
        if (amount > 0) {
            this.level = targetLevel;
            const LEVEL_FACTOR = settings.levelfactor;
            const startXp = oldLevel * LEVEL_FACTOR + 100;
            const totalXpToAdd = (amount / 2) * (2 * startXp + (amount - 1) * LEVEL_FACTOR);
            this.totalxp += totalXpToAdd;
        }

        // Обработка квестов
        const hasLevelQuests = this.client.cache.quests.some(quest => 
            quest.guildID === guildID && 
            quest.isEnabled && 
            quest.targets.some(target => target.type === "level")
        );
        
        if (hasLevelQuests) {
            await this.addQuestProgression({ type: "level", amount, noNotification });
        }

        if (this.level > oldLevel) {
            // Обработка ролей уровня
            const roleChanges = await this._processLevelRoles();

            await Promise.all([
                !noNotification ? this._sendLevelNotification(roleChanges) : null,
                this.addSeasonLevel({ amount, noNotification })
            ].filter(Boolean));
        } else {
            await this.addSeasonLevel({ amount, noNotification });
        }

        if (save) await this.save();
    }
    /**
     * Вычитает уровни у пользователя с пересчетом опыта и обработкой связанных систем
     * 
     * Метод выполняет комплексное вычитание уровней, включая:
     * - Уменьшение уровня пользователя (не ниже 1)
     * - Пересчет общего опыта по формуле арифметической прогрессии
     * - Корректировку текущего опыта в пределах нового уровня
     * - Обновление ролей уровня и отправку уведомлений
     * 
     * @async
     * @param {Object} options - Параметры вычитания уровней
     * @param {number} [options.amount=1] - Количество уровней для вычитания
     * @param {boolean} [options.save=false] - Сохранять ли изменения в базе данных
     * @param {boolean} [options.noNotification=false] - Отключить уведомления пользователя
     * @returns {Promise<void>}
     * @throws {Error} Если настройки гильдии не найдены или возникают ошибки при сохранении
     * 
     * @example
     * // Вычесть 3 уровня с сохранением
     * await profile.subtractLevel({ amount: 3, save: true });
     * 
     * // Вычесть 1 уровень без уведомлений
     * await profile.subtractLevel({ noNotification: true });
     * 
     * // Вычесть 5 уровней (не ниже 1)
     * await profile.subtractLevel({ amount: 5, save: true, noNotification: false });
     */
    async subtractLevel({ amount = 1, save = false }) {
        const { guildID, client } = this;
        const settings = client.cache.settings.get(guildID);
        if (!settings || amount <= 0) return;

        const oldLevel = this.level;
        const targetLevel = Math.max(1, oldLevel - amount);
        
        if (targetLevel < oldLevel) {
            const LEVEL_FACTOR = settings.levelfactor;
            const levelsToRemove = oldLevel - targetLevel;
            
            // Вычисляем сумму XP для удаления (от targetLevel+1 до oldLevel)
            const startLevel = targetLevel + 1;
            const endLevel = oldLevel;
            
            // Сумма уровней: Σ(i=start to end) i = (end*(end+1) - start*(start-1))/2
            const sumLevels = (endLevel * (endLevel + 1) - startLevel * (startLevel - 1)) / 2;
            
            // Сумма XP для удаления: FACTOR * sumLevels + 100 * levelsToRemove
            const totalXpToRemove = LEVEL_FACTOR * sumLevels + 100 * levelsToRemove;
            
            // Обновляем значения
            this.level = targetLevel;
            this.totalxp -= Math.max(0, totalXpToRemove);
            
            // Корректируем текущий XP
            const currentLevelXp = this.level * LEVEL_FACTOR + 100;
            this.xp = Math.min(this.xp, currentLevelXp);
        }

        if (this.level < oldLevel) {
            // Обработка ролей уровня
            const roleChanges = await this._processLevelRoles();
            if (!noNotification) {
                // Отправка уведомления
                await this._sendLevelNotification(roleChanges);
            }
        }

        if (save) await this.save();
    }
    /**
     * Устанавливает точное значение уровня профиля, автоматически вычисляя разницу
     * 
     * Метод интеллектуально устанавливает указанный уровень, определяя 
     * необходимость добавления или вычитания уровней для достижения целевого значения.
     * Если текущий уровень выше целевого - вызывается subtractLevel, 
     * если ниже - addLevel.
     * 
     * @async
     * @param {Object} options - Параметры установки уровня
     * @param {number} [options.amount=1] - Целевое значение уровня для установки
     * @param {boolean} [options.save=false] - Сохранять ли изменения в базе данных
     * @returns {Promise<void>}
     * @throws {Error} Если возникают ошибки при вызове addLevel или subtractLevel
     * @example
     * // Установить точно 10 уровень
     * await profile.setLevel({ amount: 10, save: true });
     * 
     * // Установить 5 уровень
     * await profile.setLevel({ amount: 5 });
     * 
     * // Сбросить уровень до 1
     * await profile.setLevel({ amount: 1, save: true });
     * 
     * // Повысить до максимального уровня
     * await profile.setLevel({ amount: 100, save: true });
     */
    async setLevel({ amount = 1, save = false }) {
        if (this.level > amount) await this.subtractLevel({ amount: this.level - amount, save })
        if (this.level < amount) await this.addLevel({ amount: amount - this.level, save })
        return
    }
    /**
     * Добавляет сезонные уровни пользователю с пересчетом сезонного опыта
     * 
     * Метод выполняет добавление сезонных уровней, включая:
     * - Увеличение сезонного уровня и пересчет сезонного опыта по арифметической прогрессии
     * - Обработку квестов, связанных с сезонными уровнями
     * - Отправку уведомлений о повышении сезонного уровня
     * - Обработку достижений сезонных уровней
     * 
     * @async
     * @param {Object} options - Параметры добавления сезонных уровней
     * @param {number} [options.amount=1] - Количество сезонных уровней для добавления
     * @param {boolean} [options.save=false] - Сохранять ли изменения в базе данных
     * @param {boolean} [options.noNotification=false] - Отключить уведомления пользователя
     * @returns {Promise<void>}
     * @throws {Error} Если настройки гильдии не найдены или возникают ошибки при сохранении
     * 
     * @example
     * // Добавить 3 сезонных уровня с сохранением
     * await profile.addSeasonLevel({ amount: 3, save: true });
     * 
     * // Добавить 1 сезонный уровень без уведомлений
     * await profile.addSeasonLevel({ noNotification: true });
     * 
     * // Массовое добавление сезонных уровней
     * await profile.addSeasonLevel({ amount: 5, save: true, noNotification: false });
     */
    async addSeasonLevel({ amount = 1, save = false, noNotification = false }) {
        const { guildID, client } = this;
        const settings = client.cache.settings.get(guildID);
        if (!settings || !settings.seasonLevelsEnabled || amount <= 0) return;

        const oldSeasonLevel = this.seasonLevel;
        const targetLevel = oldSeasonLevel + amount;
        
        if (amount > 0) {
            const LEVEL_FACTOR = settings.seasonLevelfactor;
            const startXp = oldSeasonLevel * LEVEL_FACTOR + 100;
            const totalXpToAdd = (amount / 2) * (2 * startXp + (amount - 1) * LEVEL_FACTOR);
            this.seasonLevel = targetLevel;
            this.seasonTotalXp += totalXpToAdd;
            this.seasonXp = this._getCurrentXp(this.seasonTotalXp, settings.seasonLevelfactor)
        }

        const hasSeasonLevelQuests = client.cache.quests.some(quest => 
            quest.guildID === guildID && 
            quest.isEnabled && 
            quest.targets.some(target => target.type === "seasonLevel")
        );
        
        if (hasSeasonLevelQuests) {
            await this.addQuestProgression({ type: "seasonLevel", amount, noNotification });
        }

        // Уведомление
        if (!noNotification) {
            await this._sendSeasonLevelNotification();
        }
        if (this.seasonLevel > oldSeasonLevel) await this._processSeasonLevelAchievements(noNotification)

        if (save) await this.save();
    }
    /**
     * Устанавливает точное значение сезонного уровня профиля, автоматически вычисляя разницу
     * 
     * Метод интеллектуально устанавливает указанный сезонный уровень, определяя 
     * необходимость добавления или вычитания сезонных уровней для достижения целевого значения.
     * Если текущий сезонный уровень выше целевого - вызывается subtractSeasonLevel, 
     * если ниже - addSeasonLevel.
     * 
     * @async
     * @param {Object} options - Параметры установки сезонного уровня
     * @param {number} [options.amount=1] - Целевое значение сезонного уровня для установки
     * @param {boolean} [options.save=false] - Сохранять ли изменения в базе данных
     * @returns {Promise<void>}
     * @throws {Error} Если возникают ошибки при вызове addSeasonLevel или subtractSeasonLevel
     * @example
     * // Установить точно 15 сезонный уровень
     * await profile.setSeasonLevel({ amount: 15, save: true });
     * 
     * // Установить 5 сезонный уровень
     * await profile.setSeasonLevel({ amount: 5 });
     * 
     * // Сбросить сезонный уровень до 1
     * await profile.setSeasonLevel({ amount: 1, save: true });
     * 
     * // Установить высокий сезонный уровень
     * await profile.setSeasonLevel({ amount: 50, save: true });
     */
    async setSeasonLevel({ amount = 1, save = false }) {
        if (this.seasonLevel > amount) return await this.subtractSeasonLevel({ amount: this.seasonLevel - amount, save })
        if (this.seasonLevel < amount) return await this.addSeasonLevel({ amount: amount - this.seasonLevel, save })
        return
    }
    /**
     * Вычитает сезонные уровни у профиля с пересчетом сезонного опыта
     * 
     * Метод выполняет вычитание сезонных уровней, включая:
     * - Уменьшение сезонного уровня (не ниже 1)
     * - Пересчет сезонного опыта по формуле арифметической прогрессии
     * - Корректировку текущего сезонного опыта в пределах нового уровня
     * - Отправку уведомлений о понижении сезонного уровня
     * 
     * @async
     * @param {Object} options - Параметры вычитания сезонных уровней
     * @param {number} [options.amount=1] - Количество сезонных уровней для вычитания
     * @param {boolean} [options.save=false] - Сохранять ли изменения в базе данных
     * @returns {Promise<void>}
     * @throws {Error} Если настройки гильдии не найдены или возникают ошибки при сохранении
     * 
     * @example
     * // Вычесть 3 сезонных уровня с сохранением
     * await profile.subtractSeasonLevel({ amount: 3, save: true });
     * 
     * // Вычесть 1 сезонный уровень
     * await profile.subtractSeasonLevel({ amount: 1 });
     * 
     * // Вычесть 5 сезонных уровней (не ниже 1)
     * await profile.subtractSeasonLevel({ amount: 5, save: true });
     */
    async subtractSeasonLevel({ amount = 1, save = false }) {
        const { guildID, client } = this;
        const settings = client.cache.settings.get(guildID);
        if (!settings || amount <= 0) return;

        const oldSeasonLevel = this.seasonLevel;
        const targetLevel = Math.max(1, oldSeasonLevel - amount); // Минимальный уровень 1
        
        // Оптимизированный расчет с помощью математических формул
        if (targetLevel < oldSeasonLevel) {
            const LEVEL_FACTOR = settings.seasonLevelfactor;
            const levelsToRemove = oldSeasonLevel - targetLevel;
            
            // Вычисляем сумму XP для удаления (от targetLevel+1 до oldSeasonLevel)
            const startLevel = targetLevel + 1;
            const endLevel = oldSeasonLevel;
            
            // Сумма уровней: Σ(i=start to end) i = (end*(end+1) - start*(start-1))/2
            const sumLevels = (endLevel * (endLevel + 1) - startLevel * (startLevel - 1)) / 2;
            
            // Сумма XP для удаления: FACTOR * sumLevels + 100 * levelsToRemove
            const totalXpToRemove = LEVEL_FACTOR * sumLevels + 100 * levelsToRemove;
            
            // Обновляем значения
            this.seasonLevel = targetLevel;
            this.seasonTotalXp -= Math.max(0, totalXpToRemove);
            
            // Корректируем текущий сезонный XP
            this.seasonXp = this._getCurrentXp(this.seasonTotalXp, settings.seasonLevelfactor)
        }

        // Уведомление только если уровень изменился
        if (this.seasonLevel < oldSeasonLevel) {
            await this._sendSeasonLevelNotification();
        }

        if (save) await this.save();
    }
    getRequiredXp(level, factor) {
        return level * factor + 100;
    }
    /**
     * Добавляет валюту пользователю с обработкой связанных систем
     * 
     * Метод выполняет комплексное добавление валюты, включая:
     * - Увеличение количества валюты у пользователя
     * - Автоматическое перенаправление на subtractCurrency при отрицательном amount
     * - Логирование экономических операций
     * - Обработку квестов, связанных с получением валюты
     * - Проверку и выдача достижений за накопление валюты
     * - Временное хранение обработанных достижений для избежания дублирования
     * 
     * @async
     * @param {Object} options - Параметры добавления валюты
     * @param {number} [options.amount=1] - Количество валюты для добавления (при отрицательном значении вызывает subtractCurrency)
     * @param {boolean} [options.save=false] - Сохранять ли изменения в базе данных
     * @param {boolean} [options.withoutAchievement=false] - Отключить проверку достижений
     * @param {boolean} [options.noLogs=false] - Отключить логирование операции
     * @param {boolean} [options.noNotification=false] - Отключить уведомления пользователя
     * @returns {Promise<void>}
     * @throws {Error} Если возникают ошибки при сохранении или обработке достижений
     * 
     * @example
     * // Добавить 100 валюты с сохранением
     * await profile.addCurrency({ amount: 100, save: true });
     * 
     * // Добавить 50 валюты без достижений и логов
     * await profile.addCurrency({ 
     *   amount: 50, 
     *   withoutAchievement: true, 
     *   noLogs: true 
     * });
     * 
     * // Добавить 10 валюты без уведомлений
     * await profile.addCurrency({ 
     *   amount: 10, 
     *   noNotification: true 
     * });
     */
    async addCurrency({ amount = 1, save = false, withoutAchievement = false, noLogs = false, noNotification = false }) {
        if (amount < 0) return this.subtractCurrency({ amount, save });
        
        this.currency += amount;
        
        // Логирование
        if (!noLogs) {
            this.client.emit("economyLogCreate", this.guildID, 
                `${this.client.language({ textId: "Изменение валюты", guildId: this.guildID })} (${amount}) ${this.client.language({ textId: "для", guildId: this.guildID })} <@${this.userID}>`
            );
        }
        
        const { guildID, userID, client } = this;
        
        // Квесты
        const guildQuests = client.cache.quests.filter(quest => 
            quest.guildID === guildID && 
            quest.isEnabled && 
            quest.targets.some(target => target.type === "currency")
        );
        
        if (guildQuests.size && amount !== 0) {
            await this.addQuestProgression({ type: "currency", amount, noNotification });
        }
        
        // Достижения
        if (!withoutAchievement) {
            const achievements = client.cache.achievements.filter(achievement => 
                achievement.guildID === guildID && 
                achievement.type === AchievementType.Currency && 
                achievement.enabled
            );
            
            const userAchievements = this.achievements || [];
            const tempAchievements = client.tempAchievements[userID] || [];
            
            const achievementsToAdd = achievements.filter(achievement => 
                !userAchievements.some(ach => ach.achievmentID === achievement.id) &&
                this.currency >= achievement.amount &&
                !tempAchievements.includes(achievement.id)
            );
            
            if (achievementsToAdd.length > 0) {
                // Инициализация временных достижений
                if (!client.tempAchievements[userID]) {
                    client.tempAchievements[userID] = [];
                }
                
                // Добавляем ID во временный список
                achievementsToAdd.forEach(achievement => {
                    client.tempAchievements[userID].push(achievement.id);
                });
                
                // Добавляем достижения параллельно
                await Promise.all(
                    achievementsToAdd.map(achievement => 
                        this.addAchievement({ achievement, noLogs, noNotification })
                    )
                );
            }
        }
        
        // Сохранение
        if (save) await this.save();
    }
    /**
     * Вычитает валюту у пользователя с обработкой связанных систем
     * 
     * Метод выполняет комплексное вычитание валюты, включая:
     * - Уменьшение количества валюты у пользователя
     * - Увеличение счетчика потраченной валюты (если не отключено)
     * - Логирование экономических операций
     * - Обработку квестов, связанных с тратой валюты
     * - Проверку и выдача достижений за потраченную валюту
     * - Временное хранение обработанных достижений для избежания дублирования
     * 
     * @async
     * @param {Object} options - Параметры вычитания валюты
     * @param {number} [options.amount=1] - Количество валюты для вычитания
     * @param {boolean} [options.save=false] - Сохранять ли изменения в базе данных
     * @param {boolean} [options.noCurrencySpent=false] - Отключить увеличение счетчика потраченной валюты
     * @returns {Promise<void>}
     * @throws {Error} Если возникают ошибки при сохранении или обработке достижений
     * 
     * @example
     * // Вычесть 50 валюты с сохранением
     * await profile.subtractCurrency({ amount: 50, save: true });
     * 
     * // Вычесть 25 валюты без учета в статистике потраченной валюты
     * await profile.subtractCurrency({ 
     *   amount: 25, 
     *   noCurrencySpent: true 
     * });
     * 
     * // Вычесть 100 валюты с полной обработкой
     * await profile.subtractCurrency({ 
     *   amount: 100, 
     *   save: true 
     * });
     */
    async subtractCurrency({ amount = 1, save = false, noCurrencySpent = false }) {
        this.currency -= amount;
        if (!noCurrencySpent) this.currencySpent += amount;
        
        const { guildID, userID, client } = this;
        
        // Логирование
        this.client.emit("economyLogCreate", guildID, 
            `${client.language({ textId: "Изменение валюты", guildId: guildID })} (-${amount}) ${client.language({ textId: "для", guildId: guildID })} <@${userID}>`
        );
        
        // Квесты
        const guildQuests = client.cache.quests.filter(quest => 
            quest.guildID === guildID && 
            quest.isEnabled && 
            quest.targets.some(target => target.type === "currencySpent")
        );
        
        if (guildQuests.size && amount !== 0) {
            await this.addQuestProgression({ type: "currencySpent", amount });
        }
        
        // Достижения
        const achievements = client.cache.achievements.filter(achievement => 
            achievement.guildID === guildID && 
            achievement.type === AchievementType.CurrencySpent && 
            achievement.enabled
        );
        
        if (achievements.size > 0) {
            const userAchievements = this.achievements || [];
            const tempAchievements = client.tempAchievements[userID] || [];
            
            const achievementsToAdd = achievements.filter(achievement => 
                !userAchievements.some(ach => ach.achievmentID === achievement.id) &&
                this.currencySpent >= achievement.amount &&
                !tempAchievements.includes(achievement.id)
            );
            
            if (achievementsToAdd.length > 0) {
                // Инициализация временных достижений
                if (!client.tempAchievements[userID]) {
                    client.tempAchievements[userID] = [];
                }
                
                // Добавляем ID во временный список
                achievementsToAdd.forEach(achievement => {
                    client.tempAchievements[userID].push(achievement.id);
                });
                
                // Добавляем достижения параллельно
                await Promise.all(
                    achievementsToAdd.map(achievement => this.addAchievement({ achievement }))
                );
            }
        }
        
        if (save) await this.save();
    }
    /**
     * Добавляет прогресс для квестов пользователя по указанному типу
     * 
     * Метод выполняет обработку прогресса квестов, включая:
     * - Проверку доступности пользователя (не в муте)
     * - Обработку индивидуальных квестов пользователя
     * - Обработку комьюнити квестов гильдии
     * - Автоматическое сохранение изменений при необходимости
     * 
     * @async
     * @param {Object} options - Параметры добавления прогресса квестов
     * @param {string} options.type - Тип квеста для прогресса (например: "level", "currency", "message" и т.д.)
     * @param {number} [options.amount=1] - Количество прогресса для добавления
     * @param {Object} [options.object] - Дополнительный объект данных, связанный с прогрессом
     * @param {boolean} [options.save=false] - Сохранять ли изменения в базе данных
     * @param {boolean} [options.noNotification=false] - Отключить уведомления о выполнении квестов
     * @returns {Promise<void>}
     * @throws {Error} Если возникают ошибки при обработке квестов или сохранении
     * 
     * @example
     * // Добавить прогресс для квестов типа "message"
     * await profile.addQuestProgression({ 
     *   type: "message", 
     *   amount: 1, 
     *   save: true 
     * });
     * 
     * // Добавить прогресс для квестов типа "currency" с дополнительными данными
     * await profile.addQuestProgression({ 
     *   type: "currency", 
     *   amount: 100,
     *   object: { currencyType: "gold" },
     *   noNotification: true 
     * });
     * 
     * // Добавить прогресс для квестов типа "level" без уведомлений
     * await profile.addQuestProgression({ 
     *   type: "level", 
     *   amount: 5,
     *   save: true,
     *   noNotification: true 
     * });
     */
    async addQuestProgression({ type, amount = 1, object, save = false, noNotification = false }) {
        const { guildID, userID, client } = this;
        const guild = client.guilds.cache.get(guildID);
        if (!guild) return;

        const member = await guild.members.fetch(userID).catch(() => null);
        if (!member) return;

        const settings = client.cache.settings.find(s => s.guildID === guildID);
        if (settings?.roles?.mutedRoles && member.roles.cache.hasAny(...settings.roles.mutedRoles)) {
            return;
        }

        // Обработка обычных квестов
        await this._processIndividualQuests(type, amount, object, guild, member, noNotification);
        
        // Обработка комьюнити квестов
        await this._processCommunityQuests(type, amount, object, guild, member);
        
        if (save) await this.save();
    }
    /**
     * Добавляет достижение пользователю с выдачей наград и уведомлений
     * 
     * Метод выполняет комплексную выдачу достижения, включая:
     * - Поиск объекта достижения по ID (если передан не объект)
     * - Проверку дублирования достижения
     * - Проверку доступности пользователя (не в муте)
     * - Логирование получения достижения
     * - Выдачу наград за достижение (валюта, роли, предметы)
     * - Проверку достижения "Получить все достижения"
     * - Отправку уведомлений в специальный канал
     * 
     * @async
     * @param {Object} options - Параметры добавления достижения
     * @param {string|Object} options.achievement - ID достижения или объект достижения
     * @param {boolean} [options.save=false] - Сохранять ли изменения в базе данных
     * @param {boolean} [options.noLogs=false] - Отключить логирование операции
     * @param {boolean} [options.noNotification=false] - Отключить уведомления о получении достижения
     * @returns {Promise<void>}
     * @throws {Error} Если возникают ошибки при выдаче наград или сохранении
     * 
     * @example
     * // Добавить достижение по ID с сохранением
     * await profile.addAchievement({ 
     *   achievement: "achievement_001", 
     *   save: true 
     * });
     * 
     * // Добавить достижение по объекту без логов и уведомлений
     * await profile.addAchievement({ 
     *   achievement: achievementObject,
     *   noLogs: true,
     *   noNotification: true 
     * });
     * 
     * // Добавить достижение с полной обработкой
     * await profile.addAchievement({ 
     *   achievement: "veteran_player",
     *   save: true 
     * });
     */
    async addAchievement({ achievement, save = false, noLogs = false, noNotification = false }) {
        // Получаем объект достижения если передан ID
        if (typeof achievement !== "object") {
            achievement = this.client.cache.achievements.find(ach => ach.id === achievement && ach.enabled);
            if (!achievement) return;
        }

        // Проверяем, есть ли уже это достижение
        if (this.achievements?.some(e => e.achievmentID === achievement.id)) return;

        const { guildID, userID, client } = this;
        const guild = client.guilds.cache.get(guildID);
        if (!guild) return;

        const member = await guild.members.fetch(userID).catch(() => null);
        if (!member) return;

        const settings = client.cache.settings.find(s => s.guildID === guildID);
        if (settings?.roles?.mutedRoles && member.roles.cache.hasAny(...settings.roles.mutedRoles)) {
            return;
        }

        // Логирование получения достижения
        if (!noLogs) {
            client.emit("economyLogCreate", guildID, 
                `<@${userID}> (${member.user.username}) ${client.language({ textId: "получил достижение", guildId: guild.id })} ${achievement.displayEmoji}${achievement.name} (${achievement.id})`
            );
        }

        // Выдача наград
        const rewardArray = await this._processAchievementRewards(achievement, guild, member, settings, noLogs, noNotification);
        
        // Добавляем достижение
        if (!this.achievements) this.achievements = [];
        this.achievements.push({ achievmentID: achievement.id });

        // Проверяем достижение "Получить все достижения"
        await this._checkGetAllAchievements(achievement, noLogs, noNotification);

        // Уведомление в канал
        if (!noNotification && settings.channels?.achievmentsNotificationChannelId) {
            await this._sendAchievementNotification(member, guild, settings, achievement, rewardArray);
        }

        if (save) await this.save();
    }
    /**
     * Удаляет достижение у пользователя
     * 
     * Метод выполняет удаление достижения из профиля пользователя, включая:
     * - Определение ID достижения (из объекта или строки)
     * - Поиск и удаление достижения из массива достижений пользователя
     * - Очистку массива достижений при его опустошении
     * - Автоматическое сохранение изменений при необходимости
     * 
     * @async
     * @param {Object} options - Параметры удаления достижения
     * @param {string|Object} options.achievement - ID достижения или объект достижения для удаления
     * @param {boolean} [options.save=false] - Сохранять ли изменения в базе данных
     * @returns {Promise<void>}
     * 
     * @example
     * // Удалить достижение по ID с сохранением
     * await profile.delAchievement({ 
     *   achievement: "achievement_001", 
     *   save: true 
     * });
     * 
     * // Удалить достижение по объекту
     * await profile.delAchievement({ 
     *   achievement: achievementObject 
     * });
     * 
     * // Удалить достижение без сохранения
     * await profile.delAchievement({ 
     *   achievement: "invalid_achievement" 
     * });
     */
    async delAchievement({ achievement, save = false }) {
        const achievementId = typeof achievement === "object" ? achievement.id : achievement;
        
        if (!this.achievements) return;
        
        const index = this.achievements.findIndex(e => e.achievmentID === achievementId);
        if (index === -1) return;
        
        // Удаляем один элемент вместо фильтрации всего массива
        this.achievements.splice(index, 1);
        
        // Очищаем массив если пустой
        if (this.achievements.length === 0) {
            this.achievements = undefined;
        }
        
        if (save) await this.save();
    }
    /**
     * Добавляет репутацию пользователю с ограничением и обработкой достижений
     * 
     * Метод выполняет добавление репутации, включая:
     * - Увеличение репутации с ограничением максимум 1000
     * - Автоматическое перенаправление на subtractRp при отрицательном amount
     * - Проверку и блокировку при достижении максимальной репутации (1000)
     * - Обработку достижений, связанных с репутацией
     * - Логирование изменения репутации с обработкой ошибок
     * 
     * @async
     * @param {Object} options - Параметры добавления репутации
     * @param {number} [options.amount=1] - Количество репутации для добавления (при отрицательном значении вызывает subtractRp)
     * @param {boolean} [options.save=false] - Сохранять ли изменения в базе данных
     * @param {boolean} [options.withoutAchievement=false] - Отключить проверку достижений
     * @param {boolean} [options.noLogs=false] - Отключить логирование операции
     * @param {boolean} [options.noNotification=false] - Отключить уведомления пользователя
     * @returns {Promise<void>}
     * @throws {Error} Если возникают ошибки при сохранении или обработке достижений
     * 
     * @example
     * // Добавить 10 репутации с сохранением
     * await profile.addRp({ amount: 10, save: true });
     * 
     * // Добавить 5 репутации без достижений
     * await profile.addRp({ 
     *   amount: 5, 
     *   withoutAchievement: true 
     * });
     * 
     * // Добавить репутацию без логов и уведомлений
     * await profile.addRp({ 
     *   amount: 15, 
     *   noLogs: true, 
     *   noNotification: true 
     * });
     * 
     * // Попытка добавить репутацию при максимальном значении (не выполнится)
     * await profile.addRp({ amount: 50 }); // Если rp >= 1000
     */
    async addRp({ amount = 1, save = false, withoutAchievement = false, noLogs = false, noNotification = false }) {
        if (amount < 0) return this.subtractRp({ amount, save, withoutAchievement });
        if (this.rp >= 1000) return
        const { guildID, userID, client } = this;
        
        // Добавляем репутацию с ограничением
        this.rp += Math.min(1000, amount);
        if  (this.rp > 1000) this.rp = 1000
        
        // Обработка достижений
        if (!withoutAchievement) {
            await this._processRpAchievements(noLogs, noNotification);
        }
        
        // Логирование
        if (!noLogs) {
            try {
                client.emit("economyLogCreate", guildID, 
                    `${client.language({ textId: "Изменение репутации", guildId: guildID })} (${amount}) ${client.language({ textId: "для", guildId: guildID })} <@${userID}>`
                );
            } catch (err) {
                console.error(err);
            }
        }
        
        if (save) await this.save();
    }
    /**
     * Вычитает репутацию у пользователя с ограничением и обработкой достижений
     * 
     * Метод выполняет вычитание репутации, включая:
     * - Уменьшение репутации с ограничением минимум -1000
     * - Логирование изменения репутации с обработкой ошибок
     * - Обработку достижений, связанных с репутацией
     * - Автоматическое сохранение изменений при необходимости
     * 
     * @async
     * @param {Object} options - Параметры вычитания репутации
     * @param {number} [options.amount=1] - Количество репутации для вычитания
     * @param {boolean} [options.save=false] - Сохранять ли изменения в базе данных
     * @param {boolean} [options.withoutAchievement=false] - Отключить проверку достижений
     * @returns {Promise<void>}
     * @throws {Error} Если возникают ошибки при сохранении или обработке достижений
     * 
     * @example
     * // Вычесть 10 репутации с сохранением
     * await profile.subtractRp({ amount: 10, save: true });
     * 
     * // Вычесть 5 репутации без обработки достижений
     * await profile.subtractRp({ 
     *   amount: 5, 
     *   withoutAchievement: true 
     * });
     * 
     * // Вычесть 25 репутации
     * await profile.subtractRp({ amount: 25 });
     * 
     * // Вычесть большую сумму (ограничится до -1000)
     * await profile.subtractRp({ amount: 1500, save: true });
     */
    async subtractRp({ amount = 1, save = false, withoutAchievement = false }) {
        const { guildID, userID, client } = this;
        
        // Вычитаем репутацию с ограничением
        this.rp -= Math.max(-1000, amount);
        if (this.rp < -1000) this.rp = -1000
        
        // Логирование
        try {
            client.emit("economyLogCreate", guildID, 
                `${client.language({ textId: "Изменение репутации", guildId: guildID })} (-${amount}) ${client.language({ textId: "для", guildId: guildID })} <@${userID}>`
            );
        } catch (err) {
            console.error(err);
        }
        
        // Обработка достижений
        if (!withoutAchievement) {
            await this._processRpAchievements();
        }
        
        if (save) await this.save();
    }
    /**
     * Добавляет предмет в инвентарь пользователя с обработкой связанных систем
     * 
     * Метод выполняет комплексное добавление предмета, включая:
     * - Поиск и валидацию предмета в кэше
     * - Инициализацию инвентаря при необходимости
     * - Добавление нового предмета или увеличение количества существующего
     * - Выдачу наград за первый полученный предмет
     * - Логирование операции изменения инвентаря
     * - Отметку предмета как найденного
     * - Обработку достижений, связанных с предметами
     * - Обновление прогресса квестов на получение предметов
     * - Увеличение счетчика полученных предметов
     * - Обработку достижений за общее количество полученных предметов
     * 
     * @async
     * @param {Object} options - Параметры добавления предмета
     * @param {string} options.itemID - ID предмета для добавления
     * @param {number} [options.amount=1] - Количество предметов для добавления
     * @param {boolean} [options.withoutAchievement=false] - Отключить проверку достижений
     * @param {boolean} [options.save=false] - Сохранять ли изменения в базе данных
     * @param {boolean} [options.noLogs=false] - Отключить логирование операции
     * @param {boolean} [options.noNotification=false] - Отключить уведомления пользователя
     * @returns {Promise<void>}
     * @throws {Error} Если предмет не найден или возникают ошибки при сохранении
     * 
     * @example
     * // Добавить 1 предмет по ID с сохранением
     * await profile.addItem({ 
     *   itemID: "sword_001", 
     *   save: true 
     * });
     * 
     * // Добавить 5 предметов без достижений и логов
     * await profile.addItem({ 
     *   itemID: "potion_health",
     *   amount: 5,
     *   withoutAchievement: true,
     *   noLogs: true 
     * });
     * 
     * // Добавить предмет с полной обработкой
     * await profile.addItem({ 
     *   itemID: "rare_artifact",
     *   amount: 1,
     *   save: true 
     * });
     */
    async addItem({ itemID, amount = 1, withoutAchievement = false, save = false, noLogs = false, noNotification = false }) {
        const { guildID, userID, client } = this;
        
        // Находим предмет
        const item = client.cache.items.find(item => 
            item.itemID === itemID && 
            item.guildID === guildID && 
            !item.temp && 
            item.enabled
        );
        if (!item) throw new Error(`Предмет не найден (Параметры itemID: ${itemID} guildID: ${guildID})`);

        // Инициализируем инвентарь
        if (!this.inventory) this.inventory = [];
        
        const userItem = this.inventory.find(element => element.itemID === itemID);
        const isNewItem = !userItem;

        // Добавляем предмет
        if (isNewItem) {
            this.inventory.push({ itemID, amount });
            await this._processFirstItemRewards(item, noLogs, noNotification);
        } else {
            userItem.amount = +`${new Decimal(userItem.amount).plus(amount)}`;
        }

        // Логирование
        if (!noLogs) {
            client.emit("economyLogCreate", guildID, 
                `${client.language({ textId: "Изменение инвентаря", guildId: guildID })} (${item.displayEmoji}${item.name} (${item.itemID}) (${amount})) ${client.language({ textId: "для", guildId: guildID })} <@${userID}>`
            );
        }

        // Отмечаем предмет как найденный
        if (!item.found) {
            item.found = true;
            await item.save();
        }

        // Обработка достижений
        if (!withoutAchievement) {
            await this._processItemAchievements(itemID, noLogs, noNotification);
        }

        // Квесты
        const quests = client.cache.quests.filter(quest => 
            quest.guildID === guildID && 
            quest.isEnabled && 
            quest.targets.some(target => target.type === "itemsReceived")
        );
        if (quests.size) {
            await this.addQuestProgression({ type: "itemsReceived", amount, object: itemID, noNotification });
        }

        // Обновляем счетчик полученных предметов
        this.itemsReceived += amount;

        // Достижения для полученных предметов
        await this._processItemsReceivedAchievements(noLogs, noNotification);

        if (save) await this.save();
    }
    /**
     * Вычитает предмет из инвентаря пользователя или создает запись с отрицательным количеством
     * 
     * Метод выполняет вычитание предмета из инвентаря, включая:
     * - Инициализацию инвентаря при необходимости
     * - Поиск существующего предмета в инвентаре
     * - Уменьшение количества существующего предмета с использованием точной арифметики Decimal
     * - Создание новой записи с отрицательным количеством, если предмет не найден
     * - Автоматическое сохранение изменений при необходимости
     * 
     * @async
     * @param {Object} options - Параметры вычитания предмета
     * @param {string} options.itemID - ID предмета для вычитания
     * @param {number} [options.amount=1] - Количество предметов для вычитания
     * @param {boolean} [options.save=false] - Сохранять ли изменения в базе данных
     * @returns {Promise<void>}
     * 
     * @example
     * // Вычесть 1 предмет по ID с сохранением
     * await profile.subtractItem({ 
     *   itemID: "potion_health", 
     *   save: true 
     * });
     * 
     * // Вычесть 3 предмета
     * await profile.subtractItem({ 
     *   itemID: "arrow",
     *   amount: 3 
     * });
     * 
     * // Вычесть предмет, которого нет в инвентаре (создаст отрицательную запись)
     * await profile.subtractItem({ 
     *   itemID: "nonexistent_item",
     *   amount: 5,
     *   save: true 
     * });
     */
    async subtractItem({ itemID, amount = 1, save = false }) {
        // Инициализируем инвентарь если нужно
        if (!this.inventory) this.inventory = [];
        
        // Находим предмет
        const itemIndex = this.inventory.findIndex(e => e.itemID === itemID);
        
        if (itemIndex !== -1) {
            // Обновляем существующий предмет
            const userItem = this.inventory[itemIndex];
            userItem.amount = +`${new Decimal(userItem.amount).minus(amount)}`;
        } else {
            // Добавляем новый предмет с отрицательным количеством
            this.inventory.push({
                itemID: itemID,
                amount: -amount
            });
        }
        
        if (save) await this.save();
    }
    /**
     * Добавляет бамп пользователю с обработкой квестов и достижений
     * 
     * Метод выполняет комплексное добавление бампов, включая:
     * - Увеличение счетчика бампов пользователя
     * - Обработку квестов, связанных с бамперами
     * - Проверку и выдача достижений за количество бампов
     * - Использование временного хранилища достижений для избежания дублирования
     * - Параллельное выполнение всех операций для оптимизации производительности
     * - Автоматическое сохранение изменений при необходимости
     * 
     * @async
     * @param {boolean} [save=false] - Сохранять ли изменения в базе данных
     * @returns {Promise<void>}
     * @throws {Error} Если возникают ошибки при обработке квестов или достижений
     * 
     * @example
     * // Добавить бамп с сохранением
     * await profile.addBump(true);
     * 
     * // Добавить бамп без сохранения
     * await profile.addBump();
     * 
     * // Добавить бамп с автоматической обработкой квестов и достижений
     * await profile.addBump(true);
     */
    async addBump(save) {
        const { guildID, userID, client } = this;
        
        this.bumps += 1;

        // Создаем все промисы сразу
        const promises = [];

        // Квесты
        const hasBumpQuests = client.cache.quests.some(quest => 
            quest.guildID === guildID && 
            quest.isEnabled && 
            quest.targets.some(target => target.type === "bump")
        );
        if (hasBumpQuests) {
            promises.push(this.addQuestProgression({ type: "bump", amount: 1 }));
        }

        // Достижения
        const achievements = client.cache.achievements.filter(achievement => 
            achievement.guildID === guildID && 
            achievement.type === AchievementType.Bump && 
            achievement.enabled
        );

        const achievementsToAdd = achievements.filter(achievement => 
            !this.achievements?.some(ach => ach.achievmentID === achievement.id) &&
            this.bumps >= achievement.amount &&
            !client.tempAchievements[userID]?.includes(achievement.id)
        );

        if (achievementsToAdd.length > 0) {
            client.tempAchievements[userID] = client.tempAchievements[userID] || [];
            achievementsToAdd.forEach(achievement => {
                client.tempAchievements[userID].push(achievement.id);
            });
            
            promises.push(...achievementsToAdd.map(achievement => this.addAchievement({ achievement })));
        }

        // Выполняем все операции параллельно
        if (promises.length > 0) {
            await Promise.all(promises);
        }

        if (save) await this.save();
    }
    getXpBoost(sum) { return this._getBoost('xp', sum); }
    getCurBoost(sum) { return this._getBoost('cur', sum); }
    getRpBoost(sum) { return this._getBoost('rp', sum); }
    getLuckBoost(sum) { return this._getBoost('luck', sum); }
    getXpBoostTime() { return this._getBoostTime('xp'); }
    getCurBoostTime() { return this._getBoostTime('cur'); }
    getRpBoostTime() { return this._getBoostTime('rp'); }
    getLuckBoostTime() { return this._getBoostTime('luck'); }
    /**
     * Добавляет или сбрасывает квест для пользователя
     * 
     * Метод выполняет управление квестами пользователя, включая:
     * - Инициализацию массива квестов при необходимости
     * - Различную логику для комьюнити и обычных квестов
     * - Для комьюнити квестов: простое добавление если не существует
     * - Для обычных квестов: сброс прогресса существующего квеста или создание нового
     * - Сброс всех целей и статуса выполнения для существующих обычных квестов
     * - Автоматическое сохранение изменений при необходимости
     * 
     * @async
     * @param {Object} quest - Объект квеста для добавления
     * @param {string} quest.questID - ID квеста
     * @param {boolean} quest.community - Флаг комьюнити квеста
     * @param {Array} [quest.targets] - Массив целей квеста
     * @param {boolean} [save=false] - Сохранять ли изменения в базе данных
     * @returns {Promise<void>}
     * 
     * @example
     * // Добавить обычный квест с сохранением
     * await profile.addQuest({
     *   questID: "daily_quest_001",
     *   community: false,
     *   targets: [
     *     { targetID: "kill_monsters", reached: 0, finished: false },
     *     { targetID: "collect_items", reached: 0, finished: false }
     *   ]
     * }, true);
     * 
     * // Добавить комьюнити квест
     * await profile.addQuest({
     *   questID: "community_event",
     *   community: true
     * });
     * 
     * // Сбросить существующий обычный квест
     * await profile.addQuest(existingQuest, true);
     */
    async addQuest(quest, save) {
        if (!quest) return;

        // Инициализируем массив квестов если нужно
        if (!this.quests) this.quests = [];

        const questIndex = this.quests.findIndex(e => e.questID === quest.questID);
        const questExists = questIndex >= 0;

        if (quest.community) {
            // Для комьюнити квестов просто добавляем если не существует
            if (!questExists) {
                this.quests.push({
                    questID: quest.questID,
                });
            }
        } else {
            // Для обычных квестов
            if (questExists) {
                // Сбрасываем существующий квест
                const existingQuest = this.quests[questIndex];
                existingQuest.finished = false;
                existingQuest.finishedDate = undefined;
                
                // Сбрасываем все цели квеста
                if (existingQuest.targets) {
                    existingQuest.targets.forEach(target => {
                        target.reached = 0;
                        target.finished = false;
                    });
                }
            } else {
                // Создаем новый квест
                this.quests.push({
                    questID: quest.questID,
                    targets: quest.targets?.map(target => ({
                        targetID: target.targetID,
                        reached: 0,
                        finished: false,
                    })) || [],
                    finished: false
                });
            }
        }

        if (save) await this.save();
    }
    /**
     * Удаляет квест из списка квестов пользователя
     * 
     * Метод выполняет удаление квеста, включая:
     * - Поддержку передачи как объекта квеста, так и ID квеста
     * - Эффективный поиск квеста с использованием findIndex
     * - Удаление одного элемента без фильтрации всего массива
     * - Очистку массива квестов при его опустошении
     * - Автоматическое сохранение изменений при необходимости
     * 
     * @async
     * @param {Object|string} quest - Объект квеста или ID квеста для удаления
     * @param {boolean} [save=false] - Сохранять ли изменения в базе данных
     * @returns {Promise<void>}
     * 
     * @example
     * // Удалить квест по ID с сохранением
     * await profile.delQuest("daily_quest_001", true);
     * 
     * // Удалить квест по объекту
     * await profile.delQuest(questObject);
     * 
     * // Удалить квест без сохранения
     * await profile.delQuest("expired_quest");
     * 
     * // Удалить квест и очистить массив если он последний
     * await profile.delQuest("last_quest", true);
     */
    async delQuest(quest, save) {
        if (!this.quests?.length) return;

        const questId = typeof quest === 'object' ? quest.questID : quest;
        const initialLength = this.quests.length;
        
        // Используем findIndex для более эффективного поиска
        const questIndex = this.quests.findIndex(e => e.questID === questId);
        
        if (questIndex !== -1) {
            // Удаляем один элемент вместо фильтрации всего массива
            this.quests.splice(questIndex, 1);
            
            // Очищаем массив если он пустой
            if (initialLength === 1) {
                this.quests = undefined;
            }
        }

        if (save) await this.save();
    }
    /**
     * Добавляет роль в инвентарь ролей пользователя или увеличивает количество существующей
     * 
     * Метод управляет инвентарем ролей пользователя, включая:
     * - Инициализацию массива inventoryRoles при необходимости
     * - Поиск существующей роли по ID и времени действия (ms)
     * - Увеличение количества существующей роли
     * - Добавление новой роли с уникальным идентификатором
     * - Генерацию уникального ID для каждой новой записи роли
     * 
     * @param {Object} options - Параметры добавления роли
     * @param {string} options.id - ID роли для добавления
     * @param {number} [options.amount=1] - Количество ролей для добавления
     * @param {number} [options.ms] - Время действия роли в миллисекундах (опционально)
     * @returns {void}
     * 
     * @example
     * // Добавить 1 роль с временем действия
     * profile.addRole({ 
     *   id: "premium_role", 
     *   ms: 2592000000 // 30 дней
     * });
     * 
     * // Добавить 3 роли без времени действия
     * profile.addRole({ 
     *   id: "vip_role",
     *   amount: 3 
     * });
     * 
     * // Увеличить количество существующей роли
     * profile.addRole({ 
     *   id: "premium_role",
     *   ms: 2592000000,
     *   amount: 2 
     * });
     */
    addRole({ id, amount = 1, ms }) {
        // Инициализируем массив если нужно
        if (!this.inventoryRoles) this.inventoryRoles = [];
        
        // Используем findIndex для получения индекса
        const roleIndex = this.inventoryRoles.findIndex(e => e.id === id && e.ms === ms);
        
        if (roleIndex !== -1) {
            // Обновляем существующую роль
            this.inventoryRoles[roleIndex].amount += amount;
        } else {
            // Добавляем новую роль
            this.inventoryRoles.push({ 
                id, 
                amount, 
                ms, 
                uniqId: uniqid.time() 
            });
        }
    }
    /**
     * Вычитает роль из инвентаря ролей пользователя или удаляет ее при нулевом количестве
     * 
     * Метод управляет уменьшением количества ролей в инвентаре, включая:
     * - Проверку существования массива inventoryRoles
     * - Поиск роли по ID и времени действия (ms)
     * - Уменьшение количества существующей роли
     * - Удаление роли из инвентаря при достижении количества 0 или меньше
     * - Очистку массива inventoryRoles при его опустошении
     * 
     * @param {Object} options - Параметры вычитания роли
     * @param {string} options.id - ID роли для вычитания
     * @param {number} [options.amount=1] - Количество ролей для вычитания
     * @param {number} [options.ms] - Время действия роли в миллисекундах (для идентификации конкретной роли)
     * @returns {void}
     * 
     * @example
     * // Вычесть 1 роль с временем действия
     * profile.subtractRole({ 
     *   id: "premium_role", 
     *   ms: 2592000000 
     * });
     * 
     * // Вычесть 2 роли без времени действия
     * profile.subtractRole({ 
     *   id: "vip_role",
     *   amount: 2 
     * });
     * 
     * // Вычесть роль и удалить ее из инвентаря (если количество станет 0)
     * profile.subtractRole({ 
     *   id: "temporary_role",
     *   ms: 86400000,
     *   amount: 1 
     * });
     */
    subtractRole({ id, amount = 1, ms }) {
        if (!this.inventoryRoles?.length) return;
        
        // Находим индекс и элемент за одну операцию
        const roleIndex = this.inventoryRoles.findIndex(e => e.id === id && e.ms === ms);
        
        if (roleIndex !== -1) {
            const inventoryRole = this.inventoryRoles[roleIndex];
            inventoryRole.amount -= amount;
            
            if (inventoryRole.amount <= 0) {
                // Удаляем элемент по индексу
                this.inventoryRoles.splice(roleIndex, 1);
                
                // Очищаем массив если он пустой
                if (this.inventoryRoles.length === 0) {
                    this.inventoryRoles = undefined;
                }
            }
        }
    }
    _clearIncomeTimeouts() {
        if (this.timeouts.nextIncome) {
            lt.clearTimeout(this.timeouts.nextIncome);
            this.timeouts.nextIncome = null;
        }
        if (this.timeouts.autoIncome) {
            lt.clearTimeout(this.timeouts.autoIncome);
            this.timeouts.autoIncome = null;
        }
    }
    _calculateNextIncomeTimeout(now = Date.now()) {
        if (!this.roleIncomeCooldowns?.size) return 0;
        
        let minTimeout = Infinity;
        
        for (const cooldownTime of this.roleIncomeCooldowns.values()) {
            const timeout = cooldownTime - now;
            if (timeout > 0 && timeout < minTimeout) {
                minTimeout = timeout;
            }
        }
        
        return minTimeout !== Infinity ? minTimeout : 0;
    }
    async _getFilteredRoles(guild, member) {
        let roles = this.client.cache.roles
            .filter(role => role.guildID === guild.id && role.isEnabled)
            .sort(a => a.type === "static" ? 1 : -1);

        // Параллельная проверка разрешений
        const roleChecks = await Promise.all(
            roles.map(async (role) => {
                if (!role.permission) return role;
                
                const permission = this.client.cache.permissions.find(p => p.id === role.permission);
                if (!permission) return role;
                
                const isPassing = await permission.for(this, member);
                return isPassing.value === true ? role : null;
            })
        );

        return roleChecks.filter(role => role !== null);
    }
    async _processRolesIncome(roles, member, settings, interaction) {
        const income = {};
        const totalIncome = { xp: 0, cur: 0, rp: 0, items: {} };
        const modifier = { xp: 0, cur: 0, rp: 0 };
        let pass = false;
        let notification = true;
        const userRP = this.rp;

        const now = Date.now();
        
        // Предзагружаем все роли гильдии
        const guildRoles = new Map();
        await Promise.all(
            roles.map(async (role) => {
                const guildRole = await member.guild.roles.fetch(role.id).catch(() => null);
                if (guildRole) guildRoles.set(role.id, guildRole);
            })
        );

        for (const roleIncome of roles) {
            const guildRole = guildRoles.get(roleIncome.id);
            if (!guildRole) {
                await this._cleanupRoleCooldown(roleIncome.id);
                continue;
            }

            if (!member.roles.cache.has(roleIncome.id)) {
                await this._cleanupRoleCooldown(roleIncome.id);
                continue;
            }

            // Проверка кулдауна
            const cooldownEnd = this.roleIncomeCooldowns?.get(guildRole.id);
            if (cooldownEnd && cooldownEnd > now) {
                income[guildRole.id] = { cooldown: cooldownEnd };
                continue;
            }

            // Исправляем минимальный кулдаун
            if (roleIncome.cooldown < 0.16) {
                roleIncome.cooldown = 0.16;
                await roleIncome.save();
            }

            pass = true;
            
            if (roleIncome.type === "static") {
                await this._processStaticIncome(roleIncome, guildRole, modifier, totalIncome, income, userRP, settings, interaction);
                await this._setRoleCooldown(roleIncome, guildRole);
                if (roleIncome.notification) notification = true;
            } else if (roleIncome.type === "dynamic") {
                this._processDynamicModifiers(roleIncome, modifier);
            }
        }

        await this.save();

        const totalIncomeDisplay = interaction ? this._formatTotalIncome(totalIncome, settings, interaction) : [];
        
        return { income, pass, notification, totalIncome: totalIncomeDisplay };
    }
    async _processStaticIncome(roleIncome, guildRole, modifier, totalIncome, income, userRP, settings, interaction) {
        const incomeEntries = [];

        // Обработка XP
        if (roleIncome.xp) {
            const amount = this._calculateAmount(roleIncome.xp, modifier.xp);
            totalIncome.xp += amount;
            incomeEntries.push({ type: 'xp', amount, method: amount > 0 ? 'addXp' : 'subtractXp' });
        }

        // Обработка валюты
        if (roleIncome.cur) {
            const amount = this._calculateAmount(roleIncome.cur, modifier.cur);
            totalIncome.cur += amount;
            incomeEntries.push({ type: 'cur', amount, method: amount > 0 ? 'addCurrency' : 'subtractCurrency' });
        }

        // Обработка репутации
        if (roleIncome.rp) {
            const amount = this._calculateAmount(roleIncome.rp, modifier.rp);
            totalIncome.rp += amount;
            if ((amount > 0 && userRP < 1000 && userRP >= -1000) || (amount < 0 && userRP <= 1000 && userRP > -1000)) {
                incomeEntries.push({ type: 'rp', amount, method: amount > 0 ? 'addRp' : 'subtractRp' });
            }
        }

        // Обработка предметов
        if (roleIncome.items?.length) {
            for (const itemIncome of roleIncome.items) {
                const item = this.client.cache.items.find(e => 
                    e.itemID === itemIncome.itemID && e.enabled && !e.temp
                );
                if (!item) continue;

                const amount = this._calculateAmount(itemIncome.amount, modifier[itemIncome.itemID] || 0);
                totalIncome.items[item.itemID] = (totalIncome.items[item.itemID] || 0) + amount;
                
                incomeEntries.push({ 
                    type: 'item', 
                    amount, 
                    method: amount > 0 ? 'addItem' : 'subtractItem',
                    itemId: item.itemID,
                    item
                });
            }
        }

        // Параллельное выполнение всех операций с доходом
        await Promise.all(
            incomeEntries.map(async (entry) => {
                const absAmount = Math.abs(entry.amount);
                if (entry.type === 'item') {
                    await this[entry.method]({ itemID: entry.itemId, amount: absAmount });
                } else {
                    await this[entry.method]({ amount: absAmount });
                }
                
                // Форматирование для вывода
                if (interaction && entry.amount !== 0) {
                    this._formatIncomeDisplay(income, guildRole.id, entry, settings, interaction, modifier);
                }
            })
        );
    }
    _processDynamicModifiers(roleIncome, modifier) {
        if (roleIncome.xp) modifier.xp += roleIncome.xp;
        if (roleIncome.cur) modifier.cur += roleIncome.cur;
        if (roleIncome.rp) modifier.rp += roleIncome.rp;
        
        if (roleIncome.items?.length) {
            for (const itemIncome of roleIncome.items) {
                const item = this.client.cache.items.find(e => 
                    e.itemID === itemIncome.itemID && e.enabled && !e.temp
                );
                if (item) {
                    modifier[item.itemID] = (modifier[item.itemID] || 0) + itemIncome.amount;
                }
            }
        }
    }
    _calculateAmount(base, modifier) {
        return base + base * (modifier / 100);
    }
    _formatIncomeDisplay(income, roleId, entry, settings, interaction, modifier) {
        if (!income[roleId]) income[roleId] = {};
        
        const modValue = entry.type === 'item' ? (modifier[entry.itemId] || 0) : modifier[entry.type];
        const modText = modValue > 0 ? ` +${modValue}%` : modValue < 0 ? ` ${modValue}%` : "";
        
        let displayText = "";
        switch (entry.type) {
            case 'xp':
                displayText = `${this.client.config.emojis.XP}**${this.client.language({ textId: "Опыт", guildId: interaction.guildId, locale: interaction.locale })}** (${entry.amount.toLocaleString()}${modText})`;
                income[roleId].xp = displayText;
                break;
            case 'cur':
                displayText = `${settings.displayCurrencyEmoji}**${settings.currencyName}** (${entry.amount.toLocaleString()}${modText})`;
                income[roleId].cur = displayText;
                break;
            case 'rp':
                displayText = `${this.client.config.emojis.RP}**${this.client.language({ textId: "Репутация", guildId: interaction.guildId, locale: interaction.locale })}** (${entry.amount.toLocaleString()}${modText})`;
                income[roleId].rp = displayText;
                break;
            case 'item':
                if (!income[roleId].items) income[roleId].items = [];
                displayText = `${entry.item.displayEmoji}**${entry.item.name}** (${entry.amount.toLocaleString()}${modText})`;
                income[roleId].items.push(displayText);
                break;
        }
    }
    _formatTotalIncome(totalIncome, settings, interaction) {
        const result = [];
        
        if (totalIncome.xp) {
            result.push(`• ${this.client.config.emojis.XP}**${this.client.language({ textId: "Опыт", guildId: interaction.guildId, locale: interaction.locale })}** (${totalIncome.xp.toLocaleString()})`);
        }
        if (totalIncome.rp) {
            result.push(`• ${this.client.config.emojis.RP}**${this.client.language({ textId: "Репутация", guildId: interaction.guildId, locale: interaction.locale })}** (${totalIncome.rp.toLocaleString()})`);
        }
        if (totalIncome.cur) {
            result.push(`• ${settings.displayCurrencyEmoji}**${settings.currencyName}** (${totalIncome.cur.toLocaleString()})`);
        }
        
        Object.keys(totalIncome.items).forEach(itemID => {
            const item = this.client.cache.items.find(e => e.itemID === itemID && e.enabled && !e.temp);
            if (item) {
                result.push(`• ${item.displayEmoji}**${item.name}** (${totalIncome.items[itemID].toLocaleString()})`);
            }
        });
        
        return result;
    }
    _setRoleCooldown(roleIncome, guildRole) {
        if (!this.roleIncomeCooldowns) this.roleIncomeCooldowns = new Map();
        const cooldownMs = (roleIncome.cooldown || 1) * 60 * 60 * 1000;
        this.roleIncomeCooldowns.set(guildRole.id, Date.now() + cooldownMs);
    }
    async _cleanupRoleCooldown(roleId) {
        if (this.roleIncomeCooldowns?.has(roleId)) {
            this.roleIncomeCooldowns.delete(roleId);
            await this.save();
        }
    }
    _manageIncomeTimers() {
        if (!this.autoIncomeExpire || !this.roleIncomeCooldowns?.size) return;
        
        const timeouts = Array.from(this.roleIncomeCooldowns.values())
            .map(value => value - Date.now())
            .filter(value => value > 0);
        
        if (timeouts.length === 0) return;
        
        const timeout = Math.min(...timeouts);
        this.timeouts.nextIncome = lt.setTimeout(async () => {
            await this.getIncome();
        }, timeout);
    }
    _handleNoGuild() {
        if (this.autoIncomeExpire) {
            this.autoIncomeExpire = undefined;
            this.clearAutoIncomeTimeout();
            return this.save();
        }
    }
    _handleNoMember() {
        if (this.autoIncomeExpire) {
            this.autoIncomeExpire = undefined;
            this.clearAutoIncomeTimeout();
            return this.save();
        }
    }
    _processStats(stats, changes) {
        for (const [key, value] of Object.entries(stats)) {
            if (value === 0) {
                changes[key] = undefined
            }
        }
    }
    _subtractRegularXp(amount) {
        const settings = this.client.cache.settings.get(this.guildID);
        if (this.totalxp <= amount) {
            this.xp = 0;
            this.level = 1;
            this.totalxp = 0;
            return
        }
        this.totalxp -= amount;
        this.level = this._getCurrentLevel(this.totalxp, settings.levelfactor);
        this.xp = this._getCurrentXp(this.totalxp, settings.levelfactor);
    }
    _subtractSeasonXp(amount) {
        const settings = this.client.cache.settings.get(this.guildID);
        if (this.seasonTotalXp <= amount) {
            this.seasonXp = 0;
            this.seasonLevel = 1;
            this.seasonTotalXp = 0;
            return
        }
        this.seasonTotalXp -= amount;
        this.seasonXp = this._getCurrentXp(this.seasonTotalXp, settings.seasonLevelfactor);
    }
    async _processLevelUps({ noNotification, noLogs }) {
        const settings = this.client.cache.settings.get(this.guildID)
        const oldLevel = this.level
        this.level = this._getCurrentLevel(this.totalxp, settings.levelfactor)
        const levelUps = this.level - oldLevel

        if (levelUps > 0) {
            const guild = this.client.guilds.cache.get(this.guildID);
            const member = await guild.members.fetch(this.userID).catch(() => null);
            if (!noLogs) {
                // Логирование
                this.client.emit("economyLogCreate", this.guildID, 
                    `<@${member.user.id}> (${member.user.username}) ${this.client.language({ textId: "получил уровень", guildId: this.guildID })} 🎖${this.level}`
                );     
            }
            // Квесты для уровней
            const levelQuests = this.client.cache.quests.filter(quest => 
                quest.guildID === this.guildID && 
                quest.isEnabled && 
                quest.targets.some(target => target.type === "level")
            );
            if (levelQuests.size) {
                await this.addQuestProgression({ type: "level", amount: levelUps, noNotification });
            }
            // Обработка ролей уровня
            const roleChanges = await this._processLevelRoles();

            // Обработка достижений уровня
            await this._processLevelAchievements(noNotification, noLogs);

            if (!noNotification) {
                // Отправка уведомления
                await this._sendLevelNotification(roleChanges);
            }
        }
    }
    async _processSeasonLevelUps({ noNotification }) {
        const settings = this.client.cache.settings.get(this.guildID)
        const oldLevel = this.seasonLevel
        this.seasonLevel = this._getCurrentLevel(this.seasonTotalXp, settings.seasonLevelfactor)
        const levelUps = this.seasonLevel - oldLevel
        
        // Квесты для сезонных уровней
        if (levelUps > 0) {
            const seasonLevelQuests = this.client.cache.quests.filter(quest => 
                quest.guildID === this.guildID && 
                quest.isEnabled && 
                quest.targets.some(target => target.type === "seasonLevel")
            );
            
            if (seasonLevelQuests.size) {
                await this.addQuestProgression({ type: "seasonLevel", amount: levelUps, noNotification });
            }

            const achievements = this.client.cache.achievements.filter(e => e.guildID === this.guildID && e.type === AchievementType.SeasonLevel && e.enabled)
            await Promise.all(achievements.map(async achievement => {
                if (!this.achievements?.some(ach => ach.achievmentID === achievement.id) && this.seasonLevel >= achievement.amount && !this.client.tempAchievements[this.userID]?.includes(achievement.id)) { 
                    if (!this.client.tempAchievements[this.userID]) this.client.tempAchievements[this.userID] = []
                    this.client.tempAchievements[this.userID].push(achievement.id)
                    await this.addAchievement({ achievement, noNotification })
                }    
            }))
        } else if (levelUps < 0 && !noNotification) {
            await this._sendSeasonLevelNotification()
        }
    }
    _getCurrentLevel(totalXp, factor) {
        const a = factor / 2;
        const b = 100 - factor / 2;
        const c = -totalXp;
        const discriminant = b * b - 4 * a * c;
        const rawLevel = (-b + Math.sqrt(discriminant)) / (2 * a);
        const exactXpForLevel = (Math.floor(rawLevel)) * (factor * (Math.floor(rawLevel) + 1) / 2 + 100);
        if (totalXp >= exactXpForLevel) {
            return Math.floor(rawLevel) + 1;
        } else {
            return Math.floor(rawLevel);
        }
    }
    _getCurrentXp(totalXp, factor) {
        const level = this._getCurrentLevel(totalXp, factor)
        const xpForCurrentLevel = (level - 1) * (factor * level / 2 + 100);
        return totalXp - xpForCurrentLevel;
    }
    async _processIndividualQuests(type, amount, object, guild, member, noNotification) {
        const guildQuests = this.client.cache.quests.filter(quest => 
            quest.guildID === this.guildID && 
            quest.isEnabled && 
            !quest.community
        );
        
        if (!guildQuests.size) return;

        const activeQuests = this.quests?.filter(quest => 
            !quest.finished && 
            guildQuests.some(gq => gq.questID == quest.questID && 
                gq.targets.some(t => t.type === type && 
                    quest.targets?.some(et => et.targetID === t.targetID && !et.finished)
                )
            )
        ) || [];

        for (const quest of activeQuests) {
            const guildQuest = guildQuests.find(gq => gq.questID == quest.questID);
            if (!guildQuest) continue;

            let hasUpdates = false;
            
            for (const target of quest.targets) {
                if (target.finished) continue;
                
                const guildQuestTarget = guildQuest.targets.find(t => t.targetID == target.targetID);
                if (!guildQuestTarget || guildQuestTarget.type !== type) continue;
                
                if (!this._isTargetMatch(guildQuestTarget, object)) continue;
                
                target.reached = Math.min(target.reached + amount, guildQuestTarget.amount);
                hasUpdates = true;
                
                if (target.reached >= guildQuestTarget.amount) {
                    target.finished = true;
                    if (!noNotification) {
                        await this._sendQuestNotification(member, guild, guildQuest, guildQuestTarget);
                    }
                }
            }
            
            if (hasUpdates) {
                await this.save();
            }
        }
    }
    async _processCommunityQuests(type, amount, object) {
        const communityQuests = this.client.cache.quests.filter(quest => 
            quest.guildID === this.guildID && 
            quest.isEnabled && 
            quest.community && 
            quest.active
        );
        
        if (!communityQuests.size) return;

        const savePromises = [];
        
        for (const [questId, quest] of communityQuests) {
            let hasUpdates = false;
            for (const target of quest.targets) {
                if (target.finished) continue;
                
                if (!this._isTargetMatch(target, object) || target.type !== type) continue;
                
                target.reached = Math.min(target.reached + amount, target.amount);
                hasUpdates = true;
                
                if (target.reached >= target.amount) {
                    target.finished = true;
                }
            }
            
            if (hasUpdates) {
                savePromises.push(quest.save());
            }
        }
        
        if (savePromises.length > 0) {
            await Promise.all(savePromises);
        }
    }
    _isTargetMatch(target, object) {
        if (!target.object) return true;
        if (!object) return false;
        return target.object === object;
    }
    async _sendQuestNotification(member, guild, guildQuest, guildQuestTarget) {
        const description = guildQuest.getDescription(guildQuestTarget);
        const imageURL = await this.client.functions.getEmojiURL(this.client, guildQuest.emoji);
        
        const container = new ContainerBuilder()
            .addTextDisplayComponents([
                new TextDisplayBuilder()
                    .setContent(`-# ${this.client.language({ textId: "Сервер", guildId: guild.id })} ${guild.name}`)
            ]);
        
        const content = [
            `# ${guildQuest.name}`,
            `## ${this.client.language({ textId: "Подзадача выполнена", guildId: guild.id })}`
        ].join("\n");
        
        if (imageURL) {
            container.addSectionComponents([
                new SectionBuilder()
                    .addTextDisplayComponents([new TextDisplayBuilder().setContent(content)])
                    .setThumbnailAccessory(new ThumbnailBuilder().setURL(imageURL))
            ]);
        } else {
            container.addTextDisplayComponents([new TextDisplayBuilder().setContent(content)]);
        }
        
        container.addSeparatorComponents(new SeparatorBuilder())
            .addTextDisplayComponents([new TextDisplayBuilder().setContent(description)])
            .addSeparatorComponents(new SeparatorBuilder())
            .addActionRowComponents([
                new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setLabel(guild.name)
                        .setStyle(ButtonStyle.Link)
                        .setURL(`https://discord.com/channels/${guild.id}`)
                )
            ]);
        
        member?.send({ components: [container], flags: [MessageFlags.IsComponentsV2] })
            .catch(() => {});
    }
    async _processAchievementRewards(achievement, guild, member, settings, noLogs, noNotification) {
        const rewardArray = [];
        const rewardPromises = [];

        for (const reward of achievement.rewards) {
            switch (reward.type) {
                case RewardType.Currency:
                    rewardPromises.push(
                        this.addCurrency({ amount: reward.amount, withoutAchievement: true, noLogs, noNotification })
                            .then(() => rewardArray.push(`${settings.displayCurrencyEmoji}**${settings.currencyName}** (${reward.amount})`))
                    );
                    break;

                case RewardType.Experience:
                    rewardPromises.push(
                        this.addXp({ amount: reward.amount, noLogs, noNotification })
                            .then(() => rewardArray.push(`${this.client.config.emojis.XP}**${this.client.language({ textId: "Опыт", guildId: guild.id })}** (${reward.amount})`))
                    );
                    break;

                case RewardType.Reputation:
                    rewardPromises.push(
                        this.addRp({ amount: reward.amount, withoutAchievement: true, noLogs, noNotification })
                            .then(() => rewardArray.push(`${this.client.config.emojis.RP}**${this.client.language({ textId: "Репутация", guildId: guild.id })}** (${reward.amount})`))
                    );
                    break;

                case RewardType.Item:
                    const rewardItem = this.client.cache.items.find(item => 
                        item.itemID === reward.id && 
                        item.guildID === guild.id && 
                        !item.temp && 
                        item.enabled
                    );
                    if (rewardItem) {
                        rewardPromises.push(
                            this.addItem({ itemID: reward.id, amount: reward.amount, withoutAchievement: true, noLogs, noNotification })
                                .then(() => rewardArray.push(`> ${rewardItem.displayEmoji}**${rewardItem.name}** (${reward.amount})`))
                        );
                    }
                    break;

                case RewardType.Role:
                    rewardPromises.push(
                        this._processRoleReward(reward, guild, member, achievement, noLogs)
                            .then(roleAdded => {
                                if (roleAdded) rewardArray.push(`<@&${reward.id}>`);
                            })
                    );
                    break;
            }
        }

        await Promise.all(rewardPromises);
        return rewardArray;
    }
    async _processRoleReward(reward, guild, member, achievement, noLogs) {
        try {
            const guild_role = await guild.roles.fetch(reward.id).catch(() => null);
            if (!guild_role) return false;

            const me = guild.members.me;
            if (!me || me.roles.highest.position <= guild_role.position) return false;

            await member.roles.add(reward.id);
            
            if (!noLogs) {
                this.client.emit("economyLogCreate", this.guildID, 
                    `${this.client.language({ textId: "Изменение ролей", guildId: guild.id })} (+<@&${reward.id}>) ${this.client.language({ textId: "для", guildId: guild.id })} <@${this.userID}> (${member.user.username}) ${this.client.language({ textId: "за награду достижения", guildId: guild.id })} ${achievement.displayEmoji}${achievement.name} (${achievement.id})`
                );
            }
            return true;
        } catch (err) {
            console.error(err);
            if (!noLogs) {
                this.client.emit("economyLogCreate", this.guildID, 
                    `${this.client.language({ textId: "Не удалось добавить роль", guildId: guild.id })} (<@&${reward.id}>) ${this.client.language({ textId: "для", guildId: guild.id })} <@${this.userID}> (${member.user.username}) ${this.client.language({ textId: "за награду достижения", guildId: guild.id })} ${achievement.displayEmoji}${achievement.name} (${achievement.id}): ${err.message}`
                );
            }
            return false;
        }
    }
    async _checkGetAllAchievements(currentAchievement, noLogs, noNotification) {
        const getAllAchievement = this.client.cache.achievements.find(e => 
            e.guildID === this.guildID && 
            e.type === AchievementType.GetAllAchievements && 
            e.enabled
        );

        if (!getAllAchievement || currentAchievement.id === getAllAchievement.id) return;

        const guildAchievements = this.client.cache.achievements.filter(e => 
            e.guildID === this.guildID && 
            e.id !== getAllAchievement.id
        );

        const hasAllAchievements = guildAchievements.size > 0 && 
            Array.from(guildAchievements.values()).every(ach => 
                this.achievements?.find(userAch => userAch.achievmentID === ach.id)
            );

        if (hasAllAchievements && 
            !this.achievements.some(ach => ach.achievmentID === getAllAchievement.id) &&
            !this.client.tempAchievements[this.userID]?.includes(getAllAchievement.id)) {
            
            this.client.tempAchievements[this.userID] = this.client.tempAchievements[this.userID] || [];
            this.client.tempAchievements[this.userID].push(getAllAchievement.id);
            
            await this.addAchievement({ getAllAchievement, noLogs, noNotification });
        }
    }
    async _sendAchievementNotification(member, guild, settings, achievement, rewardArray) {
        try {
            const channel = await guild.channels.fetch(settings.channels.achievmentsNotificationChannelId);
            if (!channel) return;

            const description = this.client.functions.getAchievementDescription(achievement, undefined, undefined, settings, { guildId: guild.id }, member);
            
            const newAchNotifEmbed = new EmbedBuilder()
                .setColor(member.displayHexColor)
                .setAuthor({ 
                    name: `${member.displayName} ${this._getAchievementVerb()} ${this.client.language({ textId: "новое достижение", guildId: guild.id })}!`, 
                    iconURL: member.displayAvatarURL() 
                })
                .addFields([{ 
                    name: `${this.client.language({ textId: "Достижение", guildId: guild.id })}:`, 
                    value: `${achievement.displayEmoji}${achievement.name} › ${description}${
                        rewardArray.length ? `\n${this.client.language({ textId: "Награда", guildId: guild.id })}:\n${rewardArray.join('\n')}` : ''
                    }` 
                }]);

            const content = this.achievementMention ? `<@${member.user.id}>` : ' ';
            await channel.send({ content, embeds: [newAchNotifEmbed] });
        } catch (error) {
            console.error('Failed to send achievement notification:', error);
        }
    }
    _getAchievementVerb() {
        switch (this.sex) {
            case "male": return this.client.language({ textId: "получил", guildId: this.guildID });
            case "female": return this.client.language({ textId: "получила", guildId: this.guildID });
            default: return this.client.language({ textId: "получил(-а)", guildId: this.guildID });
        }
    }
    async _processRpAchievements(noLogs, noNotification) {
        const achievements = this.client.cache.achievements.filter(achievement => 
            achievement.guildID === this.guildID && 
            achievement.type === AchievementType.Rp && 
            achievement.enabled
        );
        
        if (achievements.size === 0) return;
        
        const userAchievements = this.achievements || [];
        const tempAchievements = this.client.tempAchievements[this.userID] || [];
        
        const achievementsToAdd = achievements.filter(achievement => {
            if (userAchievements.some(ach => ach.achievmentID === achievement.id)) return false;
            if (tempAchievements.includes(achievement.id)) return false;
            
            // Проверка условия достижения
            return achievement.amount > 0 ? this.rp >= achievement.amount : this.rp <= achievement.amount;
        });
        
        if (achievementsToAdd.length === 0) return;
        
        // Инициализируем временные достижения
        if (!this.client.tempAchievements[this.userID]) {
            this.client.tempAchievements[this.userID] = [];
        }
        
        // Добавляем ID во временный список
        achievementsToAdd.forEach(achievement => {
            this.client.tempAchievements[this.userID].push(achievement.id);
        });
        
        // Добавляем достижения параллельно
        await Promise.all(
            achievementsToAdd.map(achievement => 
                this.addAchievement({ achievement, noLogs, noNotification })
            )
        );
    }
    async _processFirstItemRewards(item, noLogs, noNotification) {
        const settings = this.client.cache.settings.find(s => s.guildID === this.guildID);
        if (!settings) return;

        const hasXpReward = settings.xpForFirstFoundItem && !this.blockActivities?.item?.XP;
        const hasCurrencyReward = settings.curForFirstFoundItem && !this.blockActivities?.item?.CUR;
        
        if (!hasXpReward && !hasCurrencyReward) return;

        const rewards = [];
        const rewardPromises = [];

        if (hasXpReward) {
            rewardPromises.push(
                this.addXp({ amount: settings.xpForFirstFoundItem, noLogs, noNotification })
                    .then(() => rewards.push(`> ${this.client.config.emojis.XP}**${this.client.language({ textId: "Опыт", guildId: this.guildID })}** ${settings.xpForFirstFoundItem}`))
            );
        }

        if (hasCurrencyReward) {
            rewardPromises.push(
                this.addCurrency({ amount: settings.curForFirstFoundItem, noLogs })
                    .then(() => rewards.push(`> ${settings.displayCurrencyEmoji}**${settings.currencyName}** ${settings.curForFirstFoundItem}`))
            );
        }

        await Promise.all(rewardPromises);

        if (rewards.length > 0 && !noNotification) {
            await this._sendFirstItemNotification(item, settings, rewards);
        }
    }
    async _sendFirstItemNotification(item, settings, rewards) {
        const guild = this.client.guilds.cache.get(this.guildID);
        if (!guild) return;

        const member = await guild.members.fetch(this.userID).catch(() => null);
        if (!member || !settings.channels?.itemsNotificationChannelId) return;

        const channel = await guild.channels.fetch(settings.channels.itemsNotificationChannelId).catch(() => null);
        if (!channel || !channel.permissionsFor(guild.members.me)?.has("SendMessages")) return;

        const embed = new EmbedBuilder()
            .setAuthor({ name: member.displayName, iconURL: member.displayAvatarURL() })
            .setColor(item.hex || "#2F3236")
            .setDescription(
                `${this.client.language({ textId: "За первое нахождение", guildId: this.guildID })} ${item.displayEmoji}**${item.name}** ${this.client.language({ textId: "ты", guildId: this.guildID })} ${this._getRewardVerb()}:\n${rewards.join("\n")}`
            );

        const content = this.itemMention ? `<@${member.user.id}>` : ' ';
        channel.send({ content, embeds: [embed] }).catch(() => {});
    }
    async _processItemAchievements(itemID, noLogs, noNotification) {
        const achievements = this.client.cache.achievements.filter(achievement => 
            achievement.guildID === this.guildID && 
            achievement.type === AchievementType.Item && 
            achievement.enabled
        );

        const achievementsToAdd = achievements.filter(achievement => 
            achievement.items.includes(itemID) &&
            !this.achievements?.some(ach => ach.achievmentID === achievement.id) &&
            !this.client.tempAchievements[this.userID]?.includes(achievement.id)
        );

        if (achievementsToAdd.length > 0) {
            this.client.tempAchievements[this.userID] = this.client.tempAchievements[this.userID] || [];
            
            achievementsToAdd.forEach(achievement => {
                this.client.tempAchievements[this.userID].push(achievement.id);
            });

            await Promise.all(
                achievementsToAdd.map(achievement => 
                    this.addAchievement({ achievement, noLogs, noNotification })
                )
            );
        }

        // Проверяем достижение "Все предметы"
        await this._checkAllItemsAchievement(noLogs, noNotification);
    }
    async _checkAllItemsAchievement(noLogs, noNotification) {
        const achievement = this.client.cache.achievements.find(e => 
            e.guildID === this.guildID && 
            e.type === AchievementType.Items && 
            e.enabled
        );
        if (!achievement) return;

        const items = this.client.cache.items.filter(item => 
            item.guildID === this.guildID && 
            item.enabled && 
            !item.temp
        );

        const hasAllItems = items.size > 0 && 
            Array.from(items.values()).every(item => 
                this.inventory?.find(ui => ui.itemID === item.itemID)
            );

        if (hasAllItems && 
            !this.achievements?.some(ach => ach.achievmentID === achievement.id) &&
            !this.client.tempAchievements[this.userID]?.includes(achievement.id)) {
            
            this.client.tempAchievements[this.userID] = this.client.tempAchievements[this.userID] || [];
            this.client.tempAchievements[this.userID].push(achievement.id);
            
            await this.addAchievement({ achievement, noLogs, noNotification });
        }
    }
    async _processItemsReceivedAchievements(noLogs, noNotification) {
        const achievements = this.client.cache.achievements.filter(achievement => 
            achievement.guildID === this.guildID && 
            achievement.type === AchievementType.ItemsReceived && 
            achievement.enabled
        );

        const achievementsToAdd = achievements.filter(achievement => 
            this.itemsReceived >= achievement.amount &&
            !this.achievements?.some(ach => ach.achievmentID === achievement.id) &&
            !this.client.tempAchievements[this.userID]?.includes(achievement.id)
        );

        if (achievementsToAdd.length > 0) {
            this.client.tempAchievements[this.userID] = this.client.tempAchievements[this.userID] || [];
            
            achievementsToAdd.forEach(achievement => {
                this.client.tempAchievements[this.userID].push(achievement.id);
            });

            await Promise.all(
                achievementsToAdd.map(achievement => 
                    this.addAchievement({ achievement, noLogs, noNotification })
                )
            );
        }
    }
    _getRewardVerb() {
        switch (this.sex) {
            case "male": return this.client.language({ textId: "получил", guildId: this.guildID });
            case "female": return this.client.language({ textId: "получила", guildId: this.guildID });
            default: return this.client.language({ textId: "получил(-а)", guildId: this.guildID });
        }
    }
    async _processLevelRoles() {
        const settings = this.client.cache.settings.get(this.guildID)
        const guild = this.client.guilds.cache.get(this.guildID);
        const member = await guild.members.fetch(this.userID).catch(() => null);
        if (!settings.levelsRoles?.length) return { added: [], removed: [] };

        const rolesAdd = settings.levelsRoles.filter(role => 
            this.level >= role.levelFrom && 
            (!role.levelTo || role.levelTo > this.level) && 
            !member.roles.cache.has(role.roleId)
        );

        const rolesRemove = settings.levelsRoles.filter(role => 
            (role.levelTo <= this.level || role.levelFrom > this.level) && 
            member.roles.cache.has(role.roleId)
        );

        const addedRoles = [];
        const removedRoles = [];
        
        const me = guild.members.me;
        if (!me) return { added: [], removed: [] };

        // Параллельная обработка добавления ролей
        const addPromises = rolesAdd.map(async (role) => {
            const guildRole = await guild.roles.fetch(role.roleId).catch(() => null);
            if (!guildRole || me.roles.highest.position <= guildRole.position) return;
            
            await member.roles.add(guildRole.id).catch(() => null);
            addedRoles.push(guildRole);
        });

        // Параллельная обработка удаления ролей
        const removePromises = rolesRemove.map(async (role) => {
            const guildRole = await guild.roles.fetch(role.roleId).catch(() => null);
            if (!guildRole || me.roles.highest.position <= guildRole.position) return;
            
            await member.roles.remove(guildRole.id).catch(() => null);
            removedRoles.push(guildRole);
        });

        await Promise.all([...addPromises, ...removePromises]);

        return { 
            added: addedRoles, 
            removed: removedRoles 
        };
    }
    async _sendLevelNotification(roleChanges) {
        const settings = this.client.cache.settings.get(this.guildID)
        const guild = this.client.guilds.cache.get(this.guildID);
        const member = await guild.members.fetch(this.userID).catch(() => null);
        const { added, removed } = roleChanges;
        const hasRoleChanges = added.length > 0 || removed.length > 0;
        
        const requiredXp = this.level * settings.levelfactor + 100;
        const progressPercent = Math.floor((this.xp / requiredXp) * 100);
        
        const levelVerb = this._getLevelVerb();
        
        const embed = new EmbedBuilder()
            .setColor(member.displayHexColor)
            .setFooter({ 
                text: `${this.client.language({ textId: "До следующего уровня", guildId: guild.id })} ⭐${this.xp.toFixed()}/${requiredXp} XP (${progressPercent}%)` 
            });

        if (hasRoleChanges) {
            embed.setAuthor({ 
                name: `${member.displayName} ${levelVerb} ${this.client.language({ textId: "уровень", guildId: guild.id })} 🎖${this.level}!`, 
                iconURL: member.displayAvatarURL() 
            });

            if (added.length > 0) {
                embed.addFields([{ 
                    name: `${this.client.language({ textId: "Добавлены роли", guildId: guild.id })}:`, 
                    value: added.map(role => `\n> <@&${role.id}>`).join('') 
                }]);
            }

            if (removed.length > 0) {
                embed.addFields([{ 
                    name: `${this.client.language({ textId: "Удалены роли", guildId: guild.id })}:`, 
                    value: removed.map(role => `\n> <@&${role.id}>`).join('') 
                }]);
            }
        } else {
            embed.setFooter({ 
                text: `${member.displayName} ${levelVerb} ${this.client.language({ textId: "уровень", guildId: guild.id })} 🎖${this.level}!\n${this.client.language({ textId: "До следующего уровня", guildId: guild.id })} ⭐${this.xp.toFixed()}/${requiredXp} XP (${progressPercent}%)`, 
                iconURL: member.displayAvatarURL() 
            });
        }

        // Отправляем в канал если настроен
        if (settings.channels?.levelNotificationChannelId) {
            const channel = await guild.channels.fetch(settings.channels.levelNotificationChannelId).catch(() => null);
            if (channel) {
                const content = this.levelMention ? `<@${member.user.id}>` : ' ';
                await channel.send({ content, embeds: [embed] }).catch(() => null);
            }
        }
    }
    async _sendSeasonLevelNotification() {
        const settings = this.client.cache.settings.get(this.guildID)
        const guild = this.client.guilds.cache.get(this.guildID);
        const member = await guild.members.fetch(this.userID).catch(() => null);
        const requiredXp = this.seasonLevel * settings.seasonLevelfactor + 100;
        const progressPercent = Math.floor((this.seasonXp / requiredXp) * 100);
        
        const levelVerb = this._getLevelVerb();
        
        const embed = new EmbedBuilder()
            .setColor(member.displayHexColor)
            .setFooter({ 
                text: `${this.client.language({ textId: "До следующего сезонного уровня", guildId: guild.id })} ⭐${this.seasonXp.toFixed()}/${requiredXp} XP (${progressPercent}%)` 
            });

        embed.setFooter({ 
            text: `${member.displayName} ${levelVerb} ${this.client.language({ textId: "сезонный уровень", guildId: guild.id })} 🎖${this.seasonLevel}!\n${this.client.language({ textId: "До следующего сезонного уровня", guildId: guild.id })} ⭐${this.seasonXp.toFixed()}/${requiredXp} XP (${progressPercent}%)`, 
            iconURL: member.displayAvatarURL() 
        });

        // Отправляем в канал если настроен
        if (settings.channels?.levelNotificationChannelId) {
            const channel = await guild.channels.fetch(settings.channels.levelNotificationChannelId).catch(() => null);
            if (channel) {
                const content = this.levelMention ? `<@${member.user.id}>` : ' ';
                await channel.send({ content, embeds: [embed] }).catch(() => null);
            }
        }
    }
    async _processLevelAchievements(noNotification, noLogs) {
        const achievements = this.client.cache.achievements.filter(achievement => 
            achievement.guildID === this.guildID && 
            achievement.type === AchievementType.Level && 
            achievement.enabled
        );

        const achievementsToAdd = achievements.filter(achievement => 
            this.level >= achievement.amount &&
            !this.achievements?.some(ach => ach.achievmentID === achievement.id) &&
            !this.client.tempAchievements[this.userID]?.includes(achievement.id)
        );

        if (achievementsToAdd.length > 0) {
            this.client.tempAchievements[this.userID] = this.client.tempAchievements[this.userID] || [];
            
            achievementsToAdd.forEach(achievement => {
                this.client.tempAchievements[this.userID].push(achievement.id);
            });

            await Promise.all(
                achievementsToAdd.map(achievement => this.addAchievement({ achievement, noLogs, noNotification }))
            );
        }
    }
    _getLevelVerb() {
        switch (this.sex) {
            case "male": return this.client.language({ textId: "получил", guildId: this.guildID });
            case "female": return this.client.language({ textId: "получила", guildId: this.guildID });
            default: return this.client.language({ textId: "получил(-а)", guildId: this.guildID });
        }
    }
    async _processSeasonLevelAchievements(noNotification, noLogs) {
        const guild = this.client.guilds.cache.get(this.guildID)
        if (guild) {
            const achievements = this.client.cache.achievements.filter(e => e.guildID === this.guildID && e.type === AchievementType.SeasonLevel && e.enabled)
            await Promise.all(achievements.map(async achievement => {
                if (!this.achievements?.some(ach => ach.achievmentID === achievement.id) && this.seasonLevel >= achievement.amount && !this.client.tempAchievements[this.userID]?.includes(achievement.id)) { 
                    if (!this.client.tempAchievements[this.userID]) this.client.tempAchievements[this.userID] = []
                    this.client.tempAchievements[this.userID].push(achievement.id)
                    await this.addAchievement({ achievement, noNotification, noLogs })
                }    
            }))
        }
    }
    _getBoost(type, sum) {
        const settings = this.client.cache.settings.get(this.guildID);
        if (!settings) return 0;

        const now = Date.now();
        const typeMap = {
            xp: { profile: 'multiplyXP', time: 'multiplyXPTime', global: 'xp_booster' },
            cur: { profile: 'multiplyCUR', time: 'multiplyCURTime', global: 'cur_booster' },
            rp: { profile: 'multiplyRP', time: 'multiplyRPTime', global: 'rp_booster' },
            luck: { profile: 'multiplyLuck', time: 'multiplyLuckTime', global: 'luck_booster' }
        };

        const { profile: profileProp, time: timeProp, global: globalProp } = typeMap[type];
        
        // Профильный бустер
        const profileTime = this[timeProp];
        const profileBooster = (profileTime && new Date(profileTime).getTime() > now) ? (this[profileProp] || 0) : 0;
        
        // Глобальный бустер
        const globalBooster = settings[globalProp];
        const globalValue = (globalBooster && (!globalBooster.until || new Date(globalBooster.until).getTime() > now)) 
            ? (globalBooster.multiplier || 0) 
            : 0;

        if (!settings.global_boosters_stacking) {
            return Math.max(profileBooster, globalValue, sum || 0);
        } else {
            let booster = profileBooster + globalValue;
            if (sum) booster += sum;
            return booster;
        }
    }
    _getBoostTime(type) {
        const settings = this.client.cache.settings.get(this.guildID);
        if (!settings) return undefined;

        const now = Date.now();
        const typeMap = {
            xp: { profile: 'multiplyXP', time: 'multiplyXPTime', global: 'xp_booster' },
            cur: { profile: 'multiplyCUR', time: 'multiplyCURTime', global: 'cur_booster' },
            rp: { profile: 'multiplyRP', time: 'multiplyRPTime', global: 'rp_booster' },
            luck: { profile: 'multiplyLuck', time: 'multiplyLuckTime', global: 'luck_booster' }
        };

        const { profile: profileProp, time: timeProp, global: globalProp } = typeMap[type];
        
        const profileTime = this[timeProp] ? new Date(this[timeProp]).getTime() : 0;
        const globalTime = settings[globalProp]?.until ? new Date(settings[globalProp].until).getTime() : 0;
        
        const profileBooster = (profileTime > now) ? (this[profileProp] || 0) : 0;
        const globalBooster = (globalTime > now) ? (settings[globalProp]?.multiplier || 0) : 0;

        if (!settings.global_boosters_stacking) {
            if (profileBooster > globalBooster && profileTime > now) {
                return profileTime;
            } else if (globalTime > now) {
                return globalTime;
            }
            return undefined;
        } else {
            const times = [];
            if (profileTime > now) times.push(profileTime);
            if (globalTime > now) times.push(globalTime);
            
            return times.length > 0 ? Math.min(...times) : undefined;
        }
    }
}
module.exports = Profile