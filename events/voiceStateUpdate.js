const { AchievementType } = require("../enums")
const client = require("../index")
const { EmbedBuilder, Events } = require("discord.js")
const Decimal = require('decimal.js')

// Вспомогательные функции
const isMutedChannel = (settings, channelId) => settings.channels.mutedChannels.includes(channelId);
const isActiveMember = (member) => !member.user.bot && !member.voice.mute;
const getActiveMembers = (channel) => channel?.members.filter(isActiveMember) || new Map();

const calculateMultipliers = (client, channel, profile, type) => {
	if (!channel) return { multiplier: 0, membersMultiplier: 0 };

	let channelMultipliers = client.cache.channels.find(cm => cm.id === channel.id && cm.isEnabled);
	if (!channelMultipliers) {
		channelMultipliers = client.cache.channels.find(cm => cm.id === channel.parentId && cm.isEnabled);
	}

	if (!channelMultipliers) return { multiplier: 0, membersMultiplier: 0 };

	const membersSize = getActiveMembers(channel).size;
	const minSize = channelMultipliers[`${type}_min_members_size`];
	const maxSize = channelMultipliers[`${type}_max_members_size`];

	let adjustedSize = membersSize;
	if (membersSize < minSize) adjustedSize = 0;
	if (membersSize > maxSize) adjustedSize = maxSize;

	return {
		multiplier: channelMultipliers[`${type}_multiplier`],
		membersMultiplier: channelMultipliers[`${type}_multiplier_for_members`] * adjustedSize
	};
};

const calculateReward = (timeDiff, baseRate, boostFunction, multipliers, type) => {
	if (!baseRate) return 0;

	const baseReward = (timeDiff / 1000 / 60) * baseRate;
	const totalMultiplier = multipliers.multiplier + multipliers.membersMultiplier;
	const boost = boostFunction ? boostFunction(totalMultiplier) : 0;

	return baseReward + (baseReward * boost);
};

const handleSessionStart = async (client, userId, guildId, newDate) => {
	const profile = await client.functions.fetchProfile(client, userId, guildId);
	profile.startTime = newDate;
	await profile.save();
};

const handleSessionEnd = async (client, userId, guild, settings, oldState, newState, newDate) => {
	const profile = client.cache.profiles.get(guild.id + userId);
	if (!profile || !profile.startTime) return;

	const member = await guild.members.fetch(userId).catch(() => null);
	if (!member) return;

	client.globalCooldown[`${guild.id}_${userId}`] = Date.now() + 10000;

	try {
		const timeDiff = newDate - profile.startTime;
		const hours = timeDiff / 1000 / 60 / 60;

		if (hours > 100) {
			await resetProfileSession(profile);
			return;
		}

		const { channel } = oldState;
		const rewards = await calculateRewards(client, profile, member, settings, channel, timeDiff, hours, guild.id);

		await applyRewards(profile, rewards, hours);
		await checkAchievements(client, profile, member, guild.id, hours);

		if (!member.roles.cache.hasAny(...settings.roles?.mutedRoles) && !profile.blockActivities?.voice?.items) {
			await dropItems(client, profile, member, channel, hours, guild.id, settings);
		}

		profile.startTime = undefined;
		await profile.save();

	} finally {
		delete client.globalCooldown[`${guild.id}_${userId}`];
	}

	// Сброс статистики сессии если нужно
	if (shouldResetSession(oldState, newState, settings)) {
		await sessionStatsReset({ client, profile, settings, newState });
	}
};

const shouldProcessVoiceState = (oldState, newState, settings) => {
	if (client.blacklist(newState.guild.id, "full_ban", "guilds")) return false;
	if (client.blacklist(newState.id, "full_ban", "users")) return false;
	if (!newState.member || newState.member.user.bot) return false;
	return true;
};

// Основные обработчики сценариев
const voiceScenarios = {
	// Смена канала между неисключенными
	switchUnmutedChannels: async (oldState, newState, settings, newDate) => {
		const oldChannel = oldState.channel;
		const newChannel = newState.channel;

		if (!oldChannel || !newChannel) return false;
		if (isMutedChannel(settings, oldState.channelId) || isMutedChannel(settings, newState.channelId)) return false;
		if (oldState.mute || newState.mute) return false;

		// Обработка ухода из старого канала
		const oldMembers = getActiveMembers(oldChannel);
		if (oldMembers.size >= 1) {
			await handleSessionEnd(client, newState.id, newState.guild, settings, oldState, newState, newDate);
			if (oldMembers.size === 1) {
				await handleSessionEnd(client, oldMembers.first().id, newState.guild, settings, oldState, newState, newDate);
			}
		}

		// Обработка входа в новый канал
		const newMembers = getActiveMembers(newChannel);
		if (newMembers.size === 2) {
			for (const [userId, member] of newMembers) {
				await handleSessionStart(client, userId, newState.guild.id, newDate);
			}
		} else if (newMembers.size > 2) {
			await handleSessionStart(client, newState.id, newState.guild.id, newDate);
		}

		return true;
	},

	// Мьюте/размьюте в канале
	muteToggle: async (oldState, newState, settings, newDate) => {
		if (oldState.channelId !== newState.channelId) return false;
		if (isMutedChannel(settings, newState.channelId)) return false;

		const channel = newState.channel;
		const members = getActiveMembers(channel);

		if (oldState.mute && !newState.mute) { // Размьютился
			if (members.size === 2) {
				for (const [userId, member] of members) {
					await handleSessionStart(client, userId, newState.guild.id, newDate);
				}
			} else if (members.size > 2) {
				await handleSessionStart(client, newState.id, newState.guild.id, newDate);
			}
		} else if (!oldState.mute && newState.mute) { // Замьютился
			if (members.size >= 1) {
				await handleSessionEnd(client, newState.id, newState.guild, settings, oldState, newState, newDate);
				if (members.size === 1) {
					await handleSessionEnd(client, members.first().id, newState.guild, settings, oldState, newState, newDate);
				}
			}
		}

		return true;
	},

	// Вход в неисключенный канал
	joinUnmutedChannel: async (oldState, newState, settings, newDate) => {
		if (oldState.channelId || !newState.channelId) return false;
		if (isMutedChannel(settings, newState.channelId)) return false;

		const members = getActiveMembers(newState.channel);
		if (members.size === 2) {
			for (const [userId, member] of members) {
				await handleSessionStart(client, userId, newState.guild.id, newDate);
			}
		} else if (members.size > 2) {
			await handleSessionStart(client, newState.id, newState.guild.id, newDate);
		}

		return true;
	},

	// Выход из неисключенного канала
	leaveUnmutedChannel: async (oldState, newState, settings, newDate) => {
		if (!oldState.channelId || newState.channelId) return false;
		if (isMutedChannel(settings, oldState.channelId)) return false;
		if (oldState.mute) return false;

		const members = getActiveMembers(oldState.channel);
		if (members.size >= 1) {
			await handleSessionEnd(client, newState.id, newState.guild, settings, oldState, newState, newDate);
			if (members.size === 1) {
				await handleSessionEnd(client, members.first().id, newState.guild, settings, oldState, newState, newDate);
			}
		} else {
			await sessionStatsReset({
				client,
				profile: await client.functions.fetchProfile(client, newState.id, newState.guild.id),
				settings,
				newState
			});
		}

		return true;
	},

	// Переход между исключенным и неисключенным каналом
	switchMutedUnmuted: async (oldState, newState, settings, newDate) => {
		const oldMuted = isMutedChannel(settings, oldState.channelId);
		const newMuted = isMutedChannel(settings, newState.channelId);

		if (oldMuted === newMuted) return false;
		if (oldState.mute || newState.mute) return false;

		if (oldMuted && !newMuted) { // Из исключенного в неисключенный
			const members = getActiveMembers(newState.channel);
			if (members.size === 2) {
				for (const [userId, member] of members) {
					await handleSessionStart(client, userId, newState.guild.id, newDate);
				}
			} else if (members.size > 2) {
				await handleSessionStart(client, newState.id, newState.guild.id, newDate);
			}
		} else if (!oldMuted && newMuted) { // Из неисключенного в исключенный
			const members = getActiveMembers(oldState.channel);
			if (members.size >= 1) {
				await handleSessionEnd(client, newState.id, newState.guild, settings, oldState, newState, newDate);
				if (members.size === 1) {
					await handleSessionEnd(client, members.first().id, newState.guild, settings, oldState, newState, newDate);
				}
			} else {
				await sessionStatsReset({
					client,
					profile: await client.functions.fetchProfile(client, newState.id, newState.guild.id),
					settings,
					newState
				});
			}
		}

		return true;
	}
};

// Основной обработчик
client.on(Events.VoiceStateUpdate, async (oldState, newState) => {
	if (!shouldProcessVoiceState(oldState, newState, client.cache.settings.get(newState.guild.id))) return;

	const settings = client.cache.settings.get(newState.guild.id);
	const newDate = Date.now();

	// Последовательная проверка сценариев
	for (const scenario of Object.values(voiceScenarios)) {
		if (await scenario(oldState, newState, settings, newDate)) {
			return;
		}
	}

	// Обработка выхода из канала с выключенным микрофоном
	if (newState.channelId !== oldState.channelId &&
		((!newState.channel && oldState.channel) ||
			(newState.channel && isMutedChannel(settings, newState.channelId))) &&
		oldState.mute) {
		await sessionStatsReset({
			client,
			profile: await client.functions.fetchProfile(client, newState.id, newState.guild.id),
			settings,
			newState
		});
	}
});

async function calculateRewards(client, profile, member, settings, channel, timeDiff, hours, guildId) {
	const rewards = { xp: 0, currency: 0, rp: 0 };

	if (member.roles.cache.hasAny(...settings.roles?.mutedRoles)) return rewards;

	const rewardTypes = [
		{ type: 'xp', rate: settings.xpForVoice, blocked: profile.blockActivities?.voice?.XP, boost: (mult) => profile.getXpBoost(mult) },
		{ type: 'rp', rate: settings.rpForVoice, blocked: profile.blockActivities?.voice?.RP, boost: (mult) => profile.getRpBoost(mult) },
		{ type: 'currency', rate: settings.curForVoice, blocked: profile.blockActivities?.voice?.CUR, boost: (mult) => profile.getCurBoost(mult) }
	];

	for (const rewardType of rewardTypes) {
		if (rewardType.rate && !rewardType.blocked) {
			const multipliers = calculateMultipliers(client, channel, profile, rewardType.type);
			rewards[rewardType.type] = calculateReward(timeDiff, rewardType.rate, rewardType.boost, multipliers, rewardType.type);
		}
	}

	// Проверка квестов
	const guildQuests = client.cache.quests.filter(quest =>
		quest.guildID === guildId &&
		quest.isEnabled &&
		quest.targets.some(target => target.type === "voice")
	);
	if (guildQuests.size) {
		await profile.addQuestProgression({ type: "voice", amount: hours * 60, object: channel?.id });
	}

	return rewards;
}

async function applyRewards(profile, rewards, hours) {
	profile.hours += hours;
	profile.hoursSession += hours;
	profile.xpSession += rewards.xp;
	profile.rpSession += rewards.rp;
	profile.currencySession += rewards.currency;

	const promises = [];
	if (rewards.xp) promises.push(profile.addXp({ amount: rewards.xp }));
	if (rewards.rp) promises.push(profile.addRp({ amount: rewards.rp }));
	if (rewards.currency > 0) promises.push(profile.addCurrency({ amount: rewards.currency }));

	await Promise.all(promises);
}

async function checkAchievements(client, profile, member, guildId, hours) {
	const achievementTypes = [
		{ type: AchievementType.DailyHours, check: (ach) => profile.hoursSession >= ach.amount },
		{ type: AchievementType.Voice, check: (ach) => profile.hours >= ach.amount }
	];

	for (const achType of achievementTypes) {
		const achievements = client.cache.achievements.filter(e =>
			e.guildID === guildId &&
			e.type === achType.type &&
			e.enabled
		);

		for (const achievement of achievements) {
			if (!profile.achievements?.some(ach => ach.achievmentID === achievement.id) &&
				achType.check(achievement) &&
				!client.tempAchievements[member.user.id]?.includes(achievement.id)) {

				if (!client.tempAchievements[member.user.id]) {
					client.tempAchievements[member.user.id] = [];
				}
				client.tempAchievements[member.user.id].push(achievement.id);
				await profile.addAchievement({ achievement });
			}
		}
	}
}

async function dropItems(client, profile, member, channel, hours, guildId, settings) {
	const multipliers = calculateMultipliers(client, channel, profile, 'luck');
	const bonus = new Decimal(1).plus(profile.getLuckBoost(multipliers.multiplier));

	let items = client.cache.items.filter(item =>
		item.guildID === guildId &&
		!item.temp &&
		item.enabled &&
		item.activities?.voice?.chance
	).map(e => ({
		itemID: e.itemID,
		displayEmoji: e.displayEmoji,
		name: e.name,
		activities: {
			voice: {
				chance: e.activities.voice.chance,
				amountFrom: e.activities.voice.amountFrom,
				amountTo: e.activities.voice.amountTo
			}
		},
		activities_voice_permission: e.activities_voice_permission
	}));

	if (!items.length) return;

	items = client.functions.adjustActivityChanceByLuck(items, bonus, "voice");
	const receivedItems = await processItemDrops(client, items, profile, member, channel, hours);

	if (receivedItems.length) {
		await updateProfileItems(profile, receivedItems);
		await sendItemNotification(client, member, receivedItems, guildId, settings, profile);
	}
}

async function processItemDrops(client, items, profile, member, channel, hours) {
	const receivedItems = [];
	const count = Math.round(hours * 60);

	for (let i = 0; i < count; i++) {
		const baseChance = Math.random() || 1;
		const filteredItems = await filterItemsByPermission(client, items, profile, member, channel);
		const item = drop(filteredItems, baseChance);

		if (item) {
			const amount = client.functions.getRandomNumber(item.activities.voice.amountFrom, item.activities.voice.amountTo);
			await profile.addItem({ itemID: item.itemID, amount });

			const existingItem = receivedItems.find(e => e.itemID === item.itemID);
			if (existingItem) {
				existingItem.amount += amount;
			} else {
				receivedItems.push({
					itemID: item.itemID,
					name: item.name,
					displayEmoji: item.displayEmoji,
					amount: amount,
				});
			}
		}
	}

	return receivedItems;
}

async function filterItemsByPermission(client, items, profile, member, channel) {
	const results = await Promise.all(items.map(async (e) => {
		if (!e.activities_voice_permission) return e;

		const permission = client.cache.permissions.find(p => p.id === e.activities_voice_permission);
		if (!permission) return e;

		const isPassing = permission.for(profile, member, channel);
		return isPassing.value === true ? e : null;
	}));

	return results.filter(Boolean);
}

async function updateProfileItems(profile, receivedItems) {
	for (const receivedItem of receivedItems) {
		const sessionItem = profile.itemsSession?.find(e => e.itemID === receivedItem.itemID);
		if (sessionItem) {
			sessionItem.amount += receivedItem.amount;
		} else {
			if (!profile.itemsSession) profile.itemsSession = [];
			profile.itemsSession.push({
				itemID: receivedItem.itemID,
				amount: receivedItem.amount,
			});
		}
	}
}

async function sendItemNotification(client, member, receivedItems, guildId, settings, profile) {
	if (!settings.channels.itemsNotificationChannelId) return;

	const channel = await member.guild.channels.fetch(settings.channels.itemsNotificationChannelId).catch(() => null);
	if (!channel || !channel.permissionsFor(member.guild.members.me).has("SendMessages")) return;

	const itemStrings = receivedItems.map(item => `**${item.displayEmoji}${item.name}** (${item.amount})`);

	const embed = new EmbedBuilder()
		.setAuthor({ name: member.displayName, iconURL: member.displayAvatarURL() })
		.setDescription(`${client.language({ textId: "Нашел", guildId })}:\n${itemStrings.join("\n")}`)
		.setColor("#2F3236");

	await channel.send({
		content: profile.itemMention ? `<@${member.user.id}>` : ` `,
		embeds: [embed]
	}).catch(() => null);
}

async function sessionStatsReset({ client, profile, settings, newState }) {
	if (!profile || profile.hoursSession < 0.1) return;

	const { member } = newState;
	if (!member) return;

	if (settings.channels?.botChannelId) {
		const channel = member.guild.channels.cache.get(settings.channels.botChannelId);
		if (!channel) {
			const settings = client.cache.settings.get(member.guild.id);
			settings.channels.botChannelId = undefined;
			await settings.save();
		} else if (channel.permissionsFor(newState.guild.members.me)?.has("SendMessages")) {
			await sendSessionSummary(client, profile, member, channel, newState.guild.id, settings);
		}
	}

	await resetProfileSession(profile);
}

async function sendSessionSummary(client, profile, member, channel, guildId, settings) {
	const itemsSessionArray = [];
	if (profile.itemsSession?.length) {
		for (const item of profile.itemsSession) {
			const serverItem = client.cache.items.find(i => i.itemID === item.itemID && !i.temp && i.enabled);
			if (serverItem) {
				itemsSessionArray.push(`> ${serverItem.displayEmoji}****${serverItem.name}**** (${item.amount})`);
			} else {
				itemsSessionArray.push(`> ${client.config.emojis.NO}${client.language({ textId: `Ошибка: неизвестный предмет`, guildId })} (${item.itemID}) (${item.amount})`);
			}
		}
	}

	const genderText = profile.sex === "male" ? "получил" :
		profile.sex === "female" ? "получила" : "получил(-а)";

	const embed = new EmbedBuilder()
		.setAuthor({ name: member.displayName, iconURL: member.displayAvatarURL() })
		.setColor(member.displayHexColor)
		.setDescription(
			`${client.language({ textId: `За общение в голосовом канале ты`, guildId })} ${genderText}:\n` +
			`${client.config.emojis.mic}${profile.hoursSession.toFixed(1)} => ` +
			`${client.config.emojis.XP}${profile.xpSession.toFixed()} ` +
			`${settings.displayCurrencyEmoji}${profile.currencySession.toFixed()} ` +
			`${client.config.emojis.RP}${profile.rpSession.toFixed(2)}\n` +
			`${itemsSessionArray.join("\n")}`
		);

	await channel.send({ embeds: [embed] }).catch(() => null);
}

async function resetProfileSession(profile) {
	profile.itemsSession = [];
	profile.hoursSession = 0;
	profile.xpSession = 0;
	profile.currencySession = 0;
	profile.rpSession = 0;
	await profile.save();
}

function shouldResetSession(oldState, newState, settings) {
	return oldState.channelId !== null &&
		!isMutedChannel(settings, oldState.channelId) &&
		(newState.channelId === null || isMutedChannel(settings, newState.channelId));
}

// Вспомогательные функции для дропа предметов
const lerp = (min, max, roll) => ((1 - roll) * min + roll * max);

const drop = (items, roll) => {
	const chance = lerp(0, 100, roll);
	let current = new Decimal(0);

	for (const item of items) {
		if (current.lte(chance) && current.plus(item.activities.voice.chance).gte(chance)) {
			return item
		}
		current = current.plus(item.activities.voice.chance);
	}
	return null;
};