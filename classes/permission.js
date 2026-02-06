const { parse } = require('date-format-parse')
class Permission {
	constructor(client, permission) {
		this.client = client
		this.id = permission.id
		this.guildID = permission.guildID
		this.name = permission.name
		this.enable = permission.enable
		this.requirements = permission.requirements
	}
	async save() {
		await this.client.permissionSchema.replaceOne({ id: this.id }, Object.assign({}, { ...this, client: undefined }), { upsert: true })
	}
	async delete() {
		await Promise.all(this.client.cache.items.filter(e => e.buyPermission === this.id).map(async item => {
			item.buyPermission = undefined
			await item.save()
		}))
		await Promise.all(this.client.cache.items.filter(e => e.sellPermission === this.id).map(async item => {
			item.sellPermission = undefined
			await item.save()
		}))
		await Promise.all(this.client.cache.items.filter(e => e.openPermission === this.id).map(async item => {
			item.openPermission = undefined
			await item.save()
		}))
		await Promise.all(this.client.cache.items.filter(e => e.activities_message_permission === this.id).map(async item => {
			item.activities_message_permission = undefined
			await item.save()
		}))
		await Promise.all(this.client.cache.items.filter(e => e.activities_voice_permission === this.id).map(async item => {
			item.activities_voice_permission = undefined
			await item.save()
		}))
		await Promise.all(this.client.cache.items.filter(e => e.activities_like_permission === this.id).map(async item => {
			item.activities_like_permission = undefined
			await item.save()
		}))
		await Promise.all(this.client.cache.items.filter(e => e.activities_invite_permission === this.id).map(async item => {
			item.activities_invite_permission = undefined
			await item.save()
		}))
		await Promise.all(this.client.cache.items.filter(e => e.activities_bump_permission === this.id).map(async item => {
			item.activities_bump_permission = undefined
			await item.save()
		}))
		await Promise.all(this.client.cache.items.filter(e => e.activities_fishing_permission === this.id).map(async item => {
			item.activities_fishing_permission = undefined
			await item.save()
		}))
		await Promise.all(this.client.cache.items.filter(e => e.activities_mining_permission === this.id).map(async item => {
			item.activities_mining_permission = undefined
			await item.save()
		}))
		await Promise.all(this.client.cache.items.filter(e => e.usePermission === this.id).map(async item => {
			item.usePermission = undefined
			await item.save()
		}))
		await Promise.all(this.client.cache.items.filter(e => e.transferPermission === this.id).map(async item => {
			item.transferPermission = undefined
			await item.save()
		}))
		await Promise.all(this.client.cache.items.filter(e => e.dropPermission === this.id).map(async item => {
			item.dropPermission = undefined
			await item.save()
		}))
		await Promise.all(this.client.cache.items.filter(e => e.crafts?.some(c => c.permission === this.id)).map(async item => {
			const craft = item.crafts.find(c => { return c.permission === this.id})
			craft.permission = undefined
			await item.save()
		}))
		await this.client.giftSchema.updateMany({ permission: this.id }, { $unset: { permission: 1 } })
		this.client.cache.giveaways.filter(giveaway => giveaway.permission === this.id).forEach(giveaway => {
			delete giveaway.permission
			giveaway.save()
		})
		await Promise.all(this.client.cache.quests.filter(e => e.takePermission === this.id || e.donePermission === this.id).map(async quest => {
			if (quest.takePermission === this.id) {
				quest.takePermission = undefined
			}
			if (quest.donePermission === this.id) {
				quest.donePermission = undefined
			}
			await quest.save()
		}))
		await Promise.all(this.client.cache.roles.filter(e => e.permission === this.id).map(async role => {
            role.permission = undefined
			role.disable()
            await role.save()
        }))
		this.client.cache.wormholes.filter(wormhole => wormhole.permission === this.id).forEach(wormhole => {
			delete wormhole.permission
			wormhole.save()
		})
		this.client.cache.jobs.filter(job => job.action1.permission === this.id).forEach(job => {
			job.action1.permission = undefined
			job.save()
		})
		this.client.cache.jobs.filter(job => job.action2.permission === this.id).forEach(job => {
			job.action2.permission = undefined
			job.save()
		})
		await Promise.all(this.client.cache.settings.filter(settings => settings.customRolePermission === this.id || settings.takeDailyQuestPermission === this.id || settings.giveawayRerollPermission === this.id || settings.giveawayManagerPermission === this.id || settings.auctions_permission === this.id || settings.currency_transfer_permission === this.id || settings.currency_drop_permission === this.id).map(async settings => {
			if (settings.customRolePermission === this.id) {
				settings.customRolePermission = undefined
			}
			if (settings.takeDailyQuestPermission === this.id) {
				settings.takeDailyQuestPermission = undefined
			}
			if (settings.giveawayRerollPermission === this.id) {
				settings.giveawayRerollPermission = undefined
			}
			if (settings.giveawayManagerPermission === this.id) {
				settings.giveawayManagerPermission = undefined
			}
			if (settings.auctions_permission === this.id) {
				settings.auctions_permission = undefined
			}
			if (settings.currency_drop_permission === this.id) {
				settings.currency_drop_permission = undefined
			}
			if (settings.currency_transfer_permission === this.id) {
				settings.currency_transfer_permission = undefined
			}
			await settings.save()
		}))
		await this.client.permissionSchema.deleteOne({ id: this.id })
		await Promise.all(this.client.cache.promocodeAutogenerators.filter(e => e.permission === this.id).map(async autogenerator => {
			autogenerator.permission = undefined
			await autogenerator.save()
		}))
		await Promise.all(this.client.cache.promocodes.filter(e => e.permission === this.id).map(async promocode => {
			promocode.permission = undefined
			await promocode.save()
		}))
		this.client.cache.permissions.delete(this.id)
	}
	for(profile, member, channel, interaction) {
		if (!this.enable) {
			return this._getDisabledResult(interaction);
		}

		const isPassing = { value: true, reasons: [] };
		const now = new Date();
		
		for (const req of this.requirements) {
			const amount = interaction ? this._formatAmount(req, interaction) : [];
			const result = this._checkRequirement(req, profile, member, channel, interaction, amount, now);
			if (!result.passed) {
				isPassing.value = false;
			}
			
			if (interaction && result.reason) {
				isPassing.reasons.push(result.reason);
			}
		}
		return isPassing;
	}

	// Вспомогательные методы
	_formatAmount(req, interaction) {
		const amount = [];
		
		if (req.minAmount !== undefined && req.maxAmount !== undefined && req.minAmount === req.maxAmount) {
			const value = req.id === "MemberSince" 
				? `\`${this.client.functions.transformSecs(this.client, req.maxAmount * 60 * 1000, interaction.guildId, interaction.locale)}\``
				: req.id.includes("multiply") ? `${req.maxAmount * 100}%` : req.maxAmount;
			amount.push(value);
		} else {
			if (req.minAmount !== undefined) {
				const value = req.id === "MemberSince"
					? `\`${this.client.functions.transformSecs(this.client, req.minAmount * 60 * 1000, interaction.guildId, interaction.locale)}\``
					: req.id.includes("multiply") ? `${req.minAmount * 100}%` : req.minAmount;
				amount.push(`${this.client.language({ textId: `от`, guildId: interaction.guildId, locale: interaction.locale })} ${value}`);
			}
			if (req.maxAmount !== undefined) {
				const value = req.id === "MemberSince"
					? `\`${this.client.functions.transformSecs(this.client, req.maxAmount * 60 * 1000, interaction.guildId, interaction.locale)}\``
					: req.id.includes("multiply") ? `${req.maxAmount * 100}%` : req.maxAmount;
				amount.push(`${this.client.language({ textId: `до`, guildId: interaction.guildId, locale: interaction.locale })} ${value}`);
			}
		}
		
		return amount;
	}

	_checkRequirement(req, profile, member, channel, interaction, amount, now) {
		let result = { passed: true, reason: null };
		
		switch (req.id) {
			case "item":
				result = this._checkItemRequirement(req, profile, interaction, amount);
				break;
			case "achievement":
				result = this._checkAchievementRequirement(req, profile, interaction, false);
				break;
			case "achievement-":
				result = this._checkAchievementRequirement(req, profile, interaction, true);
				break;
			case "quest":
				result = this._checkQuestRequirement(req, profile, interaction);
				break;
			case "roles":
				result = this._checkRolesRequirement(req, member, interaction);
				break;
			case "channels":
				result = this._checkChannelsRequirement(req, channel, interaction);
				break;
			case "time":
				result = this._checkTimeRequirement(req, now, interaction);
				break;
			case "day":
				result = this._checkDayRequirement(req, now, interaction);
				break;
			case "MemberSince":
				result = this._checkMemberSinceRequirement(req, member, interaction, amount);
				break;
			case "multiplyXP":
				result = this._checkBoostRequirement(req, profile, channel, interaction, amount);
				break;
			case "multiplyRP":
				result = this._checkBoostRequirement(req, profile, channel, interaction, amount);
				break;
			case "multiplyCUR":
				result = this._checkBoostRequirement(req, profile, channel, interaction, amount);
				break;
			case "multiplyLuck":
				result = this._checkBoostRequirement(req, profile, channel, interaction, amount);
				break;
			default:
				result = this._checkProfilePropertyRequirement(req, profile, interaction, amount);
				break;
		}
		
		return result;
	}

	// Конкретные проверки требований (все синхронные)
	_checkItemRequirement(req, profile, interaction, amount) {
		const userItemAmount = profile.inventory?.find(e => e.itemID === req.itemID)?.amount || 0;
		const passed = userItemAmount >= (req.minAmount ?? -Infinity) && userItemAmount <= (req.maxAmount ?? Infinity);
		let reason = null;
		
		if (interaction) {
			const item = this.client.cache.items.get(req.itemID);
			const emoji = this.client.config.emojis[passed ? 'YES' : 'NO'];
			const itemName = item ? `${item.displayEmoji} ${item.name}` : req.itemID;
			reason = `${emoji} ${this.client.language({ textId: req.id, guildId: interaction.guildId, locale: interaction.locale })} ${itemName} (${amount.join(" ")}). ${this.client.language({ textId: `У тебя`, guildId: interaction.guildId, locale: interaction.locale })}: ${itemName} (${userItemAmount})`;
		}
		
		return { passed, reason };
	}

	_checkAchievementRequirement(req, profile, interaction, negated) {
		const hasAchievement = profile.achievements?.some(e => e.achievmentID === req.achievementID) || false;
		const passed = negated ? !hasAchievement : hasAchievement;
		let reason = null;
		
		if (interaction) {
			const achievement = this.client.cache.achievements.get(req.achievementID);
			const emoji = this.client.config.emojis[passed ? 'YES' : 'NO'];
			const achievementName = achievement ? `${achievement.displayEmoji} ${achievement.name}` : req.achievementID;
			reason = `${emoji} ${this.client.language({ textId: req.id, guildId: interaction.guildId, locale: interaction.locale })} ${achievementName}`;
		}
		
		return { passed, reason };
	}

	_checkQuestRequirement(req, profile, interaction) {
		const questFinished = profile.quests?.some(e => e.questID === req.questID && e.finished) || false;
		const passed = questFinished
		let reason = null;

		if (interaction) {
			const quest = this.client.cache.quests.get(req.questID);
			const emoji = this.client.config.emojis[questFinished ? 'YES' : 'NO'];
			const questName = quest ? `${quest.displayEmoji} ${quest.name}` : req.questID;
			reason = `${emoji} ${this.client.language({ textId: req.id, guildId: interaction.guildId, locale: interaction.locale })} ${questName}`;
		}
		
		return { passed, reason };
	}

	_checkRolesRequirement(req, member, interaction) {
		let passed = false;
		let reason = null;
		
		switch (req.filter) {
			case "hasAll":
				passed = member.roles.cache.hasAll(...req.roles);
				break;
			case "hasAny":
				passed = member.roles.cache.hasAny(...req.roles);
				break;
			case "except":
				passed = !member.roles.cache.hasAny(...req.roles);
				break;
		}
		
		if (interaction) {
			const roleMentions = req.roles.map(e => `<@&${e}>`).join(", ");
			const emoji = this.client.config.emojis[passed ? 'YES' : 'NO'];
			const textId = req.filter === "hasAll" ? "Пользователь должен иметь следующие роли" :
						req.filter === "hasAny" ? "Пользователь должен иметь одну из следующих ролей" :
						"Пользователь не должен иметь одну из следующих ролей";
			
			reason = `${emoji} ${this.client.language({ textId, guildId: interaction.guildId, locale: interaction.locale })}: ${roleMentions}`;
		}
		
		return { passed, reason };
	}

	_checkChannelsRequirement(req, channel, interaction) {
		if (!channel) return false;
		
		const channelInList = req.channels.includes(channel.id);
		const passed = req.filter === "includes" ? channelInList : !channelInList;
		let reason = null;
		
		if (interaction) {
			const channelMentions = req.channels.map(e => `<#${e}>`).join(", ");
			const emoji = this.client.config.emojis[passed ? 'YES' : 'NO'];
			const textId = req.filter === "includes" ? "Канал должен быть одним из" : "Канал не должен быть одним из";
			
			reason = `${emoji} ${this.client.language({ textId, guildId: interaction.guildId, locale: interaction.locale })}: ${channelMentions}`;
		}
		
		return { passed, reason };
	}

	_checkTimeRequirement(req, now, interaction) {
		const startTime = this._parseTime(req.startTime);
		let reason = null;
		let endTime = this._parseTime(req.endTime);
		
		if (endTime < startTime) {
			endTime = this._parseTime(req.endTime, true);
		}
		
		const nowTime = now.getUTCHours() + now.getUTCMinutes() / 60;
		const startHours = startTime.getUTCHours() + startTime.getUTCMinutes() / 60;
		const endHours = endTime.getUTCHours() + endTime.getUTCMinutes() / 60;
		
		let passed;
		if (startHours > endHours) {
			passed = nowTime >= startHours || nowTime <= endHours;
		} else {
			passed = nowTime >= startHours && nowTime <= endHours;
		}
		
		if (interaction) {
			const currentTime = `${now.getUTCHours().toString().padStart(2, '0')}:${now.getUTCMinutes().toString().padStart(2, '0')}`;
			const emoji = this.client.config.emojis[passed ? 'YES' : 'NO'];
			reason = `${emoji} ${this.client.language({ textId: req.id, guildId: interaction.guildId, locale: interaction.locale })} ${req.startTime}-${req.endTime} (UTC). ${this.client.language({ textId: `Сейчас`, guildId: interaction.guildId, locale: interaction.locale })} ${currentTime} (UTC)`;
		}
		
		return { passed, reason };
	}

	_checkDayRequirement(req, now, interaction) {
		const currentDay = now.getDay();
		const passed = req.days.includes(currentDay);
		let reason = null;
		
		if (interaction) {
			const dayNames = this._getDayNames(req.days, interaction);
			const currentDayName = this._getDayName(currentDay, interaction);
			const emoji = this.client.config.emojis[passed ? 'YES' : 'NO'];
			reason = `${emoji} ${this.client.language({ textId: req.id, guildId: interaction.guildId, locale: interaction.locale })}: ${dayNames}. ${this.client.language({ textId: `Сегодня`, guildId: interaction.guildId, locale: interaction.locale })}: ${currentDayName}`;
		}
		
		return { passed, reason };
	}

	_checkMemberSinceRequirement(req, member, interaction, amount) {
		const minutesOnServer = (Date.now() - member.joinedTimestamp) / 1000 / 60;
		const passed = minutesOnServer >= (req.minAmount || 0) && minutesOnServer <= (req.maxAmount || Infinity);
		let reason = null;
		
		if (interaction) {
			const timeOnServer = this.client.functions.transformSecs(this.client, Date.now() - member.joinedTimestamp, interaction.guildId, interaction.locale);
			const emoji = this.client.config.emojis[passed ? 'YES' : 'NO'];
			reason = `${emoji} ${this.client.language({ textId: req.id, guildId: interaction.guildId, locale: interaction.locale })} (${amount.join(" ")}). ${this.client.language({ textId: `Ты на сервере`, guildId: interaction.guildId, locale: interaction.locale })}: \`${timeOnServer}\``;
		}
		
		return { passed, reason };
	}

	_checkBoostRequirement(req, profile, channel, interaction, amount) {
		const channelMultiplier = this._getChannelMultiplier(channel);
		
		// Получаем значение буста
		let boostValue;
		try {
			let methodName;
			switch (req.id) {
				case "multiplyXP":
					methodName = "getXpBoost";
					break;
				case "multiplyRP":
					methodName = "getRpBoost";
					break;
				case "multiplyCUR":
					methodName = "getCurBoost";
					break;
				case "multiplyLuck":
					methodName = "getLuckBoost";
					break;
				default:
					methodName = null;
			}
			if (typeof profile[methodName] === 'function') {
				boostValue = profile[methodName](channelMultiplier);
			} else {
				console.error(`Method ${methodName} not found on profile`);
				boostValue = 0;
			}
		} catch (error) {
			console.error(`Error getting boost for ${req.id}:`, error);
			boostValue = 0;
		}
		
		const passed = boostValue >= (req.minAmount || 0) && boostValue <= (req.maxAmount || Infinity);
		let reason = null;
		
		if (interaction) {
			const currentValue = req.id === "multiplyXP" ? boostValue : boostValue * 100;
			const emoji = this.client.config.emojis[passed ? 'YES' : 'NO'];
			reason = `${emoji} ${this.client.language({ textId: req.id, guildId: interaction.guildId, locale: interaction.locale })} (${amount.join(" ")}). ${this.client.language({ textId: `У тебя`, guildId: interaction.guildId, locale: interaction.locale })}: ${currentValue}${req.id !== "multiplyXP" ? '%' : ''}`;
		}
		return { passed, reason };
	}

	_checkProfilePropertyRequirement(req, profile, interaction, amount) {
		const value = this.getValue(profile, req.id.replace(/\?\./g, '.'), 0);
		const passed = value >= (req.minAmount ?? -Infinity) && value <= (req.maxAmount ?? Infinity);
		let reason = null;
		
		if (interaction) {
			const emoji = this.client.config.emojis[passed ? 'YES' : 'NO'];
			reason = `${emoji} ${this.client.language({ textId: req.id, guildId: interaction.guildId, locale: interaction.locale })} (${amount.join(" ")}). ${this.client.language({ textId: `У тебя`, guildId: interaction.guildId, locale: interaction.locale })}: ${value}`;
		}
		
		return { passed, reason };
	}
	
	// Вспомогательные методы (все синхронные)
	getValue(obj, path, defaultValue = undefined) {
		const keys = path.split('.');
		let current = obj;
		
		for (const key of keys) {
			if (current == null || current[key] === undefined) {
				return defaultValue;
			}
			current = current[key];
		}
		
		return current;
	}
	_parseTime(timeString, addDay = false) {
		const date = parse(timeString + " +00:00", 'HH:mm ZZ');
		if (addDay) {
			date.setDate(date.getDate() + 1);
		}
		return date;
	}

	_getDayNames(days, interaction) {
		const dayMap = {
			'0': this.client.language({ textId: `Воскресенье`, guildId: interaction.guildId, locale: interaction.locale }),
			'1': this.client.language({ textId: `Понедельник`, guildId: interaction.guildId, locale: interaction.locale }),
			'2': this.client.language({ textId: `Вторник`, guildId: interaction.guildId, locale: interaction.locale }),
			'3': this.client.language({ textId: `Среда`, guildId: interaction.guildId, locale: interaction.locale }),
			'4': this.client.language({ textId: `Четверг`, guildId: interaction.guildId, locale: interaction.locale }),
			'5': this.client.language({ textId: `Пятница`, guildId: interaction.guildId, locale: interaction.locale }),
			'6': this.client.language({ textId: `Суббота`, guildId: interaction.guildId, locale: interaction.locale })
		};
		
		return days.map(day => dayMap[day]).join(", ");
	}

	_getDayName(day, interaction) {
		const dayMap = {
			0: this.client.language({ textId: `Воскресенье`, guildId: interaction.guildId, locale: interaction.locale }),
			1: this.client.language({ textId: `Понедельник`, guildId: interaction.guildId, locale: interaction.locale }),
			2: this.client.language({ textId: `Вторник`, guildId: interaction.guildId, locale: interaction.locale }),
			3: this.client.language({ textId: `Среда`, guildId: interaction.guildId, locale: interaction.locale }),
			4: this.client.language({ textId: `Четверг`, guildId: interaction.guildId, locale: interaction.locale }),
			5: this.client.language({ textId: `Пятница`, guildId: interaction.guildId, locale: interaction.locale }),
			6: this.client.language({ textId: `Суббота`, guildId: interaction.guildId, locale: interaction.locale })
		};
		
		return dayMap[day];
	}

	_getChannelMultiplier(channel) {
		if (!channel) return 0;
		
		let ch = this.client.cache.channels.find(ch => ch.id === channel.id && ch.isEnabled);
		if (!ch) {
			ch = this.client.cache.channels.find(ch => ch.id === channel.parentId && ch.isEnabled);
		}
		
		return ch ? ch.luck_multiplier : 0;
	}

	_getDisabledResult(interaction) {
		if (!interaction) return { value: false, reasons: [] };
		
		return {
			value: false,
			reasons: [`${this.client.config.emojis.NO} ${this.client.language({ textId: `Это взаимодействие выключено правом`, guildId: interaction.guildId, locale: interaction.locale })}`]
		};
	}
}
module.exports = Permission