const { AchievementType } = require("../enums")
const { SnowflakeUtil, EmbedBuilder } = require("discord.js")
const Cron = require("croner")
const Decimal = require('decimal.js')
module.exports = async function (client) {
	Cron('* * * * *', async () => {
		const guilds = client.guilds.cache.filter(e => e.available).map(e => e.id)
		await Promise.all(client.cache.profiles.filter(profile => profile.roles && profile.roles.some(r => r.until <= new Date())).map(async profile => {
			const guild = client.guilds.cache.get(profile.guildID)
			if (guild) {
				const member = await guild.members.fetch(profile.userID).catch(() => null)
				if (member) {
					await member.roles.remove(profile.roles.filter(e => e.until <= new Date()).map(e => e.id)).catch(() => null)
				}
				const customRoles = client.cache.customRoles.filter(e => profile.roles.filter(e => e.until <= new Date()).map(e => e.id).includes(e.roleId) && e.guildID === guild.id)
				await Promise.all(customRoles.map(async customRole => {
					await guild.roles.delete(customRole.roleId).catch(e => console.error(e))
					await customRole.delete()	
				}))
				profile.roles = profile.roles?.filter(e => e.until > new Date())
				if (!profile.roles?.[0]) profile.roles = undefined
				await profile.save()
			}	
		}))
	})
	Cron('*/10 * * * *', async () => {
		const profiles = client.cache.profiles.filter(profile => profile.startTime <= Date.now())
		const date = Date.now()
		console.time(`[${client.shard.ids[0]}] Calculated ${profiles.size} users in voice`)
		await Promise.all(profiles.map(async profile => {
			await UpdateVoiceState(profile, date)
		}))
		console.timeEnd(`[${client.shard.ids[0]}] Calculated ${profiles.size} users in voice`)
	});
	Cron('00 00 00 * * *', { timezone: "UTC" }, async () => {
		const day = new Date().getDate()
		const month = new Date().getMonth() + 1
		const profiles = client.cache.profiles.filter(profile => profile.birthday_day === day && profile.birthday_month === month)
		for (const profile of profiles.map(e => e)) {
			if (!client.blacklist(profile.userID, "full_ban", "users")) {
				const guild = client.guilds.cache.get(profile.guildID)
				if (guild) {
					const member = await guild.members.fetch(profile.userID).catch(() => null)
					if (member) {
						const embed = new EmbedBuilder()
							.setAuthor({ name: `${client.language({ textId: "День рождения", guildId: guild.id })} ${member.displayName}!`, iconURL: member.displayAvatarURL() })
							.setImage('https://i.imgur.com/8zHoV16.gif')
							.setThumbnail(member.displayAvatarURL())
							.setColor("#2F3236")
						if (profile.birthday_year) {
							embed.setDescription(`${client.config.emojis.tada}${client.language({ textId: "Сегодня свой день рождения празднует", guildId: guild.id })} ${member.displayName}!\n${client.language({ textId: "Ему исполнилось", guildId: guild.id })} ${Math.round((Date.now() - new Date(profile.birthday_year, (profile.birthday_month - 1), profile.birthday_day))/1000/60/60/24/365.25)}!🥳`)
						} else embed.setDescription(`${client.config.emojis.tada}${client.language({ textId: "Сегодня свой день рождения празднует", guildId: guild.id })} ${member.displayName}!🥳`)
						const settings = client.cache.settings.get(guild.id)
						const nonce = SnowflakeUtil.generate().toString()
						if (settings.channels.generalChannelId) guild.channels.fetch(settings.channels.generalChannelId).then(channel => channel.send({ content: `<@${profile.userID}>`, embeds: [embed], enforceNonce: true, nonce: nonce, })).catch(() => null)
					}	
				}	
			}
		}
	});
	Cron('0 5 00 * * *', { timezone: "UTC" }, async () => {
		const guilds = client.guilds.cache.filter(e => e.available && !client.blacklist(e.id, "full_ban", "guilds")).map(e => e.id)
		//DAILY
		const settingsArray = client.cache.settings.filter(settings => guilds.includes(settings.guildID)).map(e => e)
		for (const settings of settingsArray) {
			if (settings.top_report?.daily && settings.top_report?.channelId) {
				const guild = client.guilds.cache.get(settings.guildID)
				if (guild) {
					let profiles = await client.functions.fetchLeaderboard(client, settings.guildID, "daily.totalxp").then(collection => collection.map(profile => profile))
					const leaderBoardEmbed = new EmbedBuilder()
					const newDate = new Date()
					const date = new Date(newDate.setDate(newDate.getDate() - 1))
					let content = `# ${client.language({ textId: "Таблица лидеров за", guildId: guild.id })} ${date.getDate().toString().length < 2 ? `0` + date.getDate().toString() : date.getDate().toString() }.${(date.getMonth() + 1).toString().length < 2 ? 0 + (date.getMonth() + 1).toString() : date.getMonth() + 1 }.${date.getFullYear()} ${client.language({ textId: "на сервере", guildId: guild.id })} ${guild.name}`
					profiles = profiles.slice(0, 10)
					let leaderboard = await client.functions.computeLeaderboard(profiles, "daily.totalxp", 0)
					const embeds = []
					if (!leaderboard.length) {
						leaderBoardEmbed.setDescription(`${client.language({ textId: "В таблице лидеров никого нет", guildId: guild.id })}!`)
					} else {
						for (const profile of leaderboard) {
							const member = await guild.members.fetch(profile.userID).catch(() => null)
							const embed = new EmbedBuilder()
							embed.setTitle(`${profile.position} ${member?.displayName || `<@${profile.userID}>`} | ${client.language({ textId: `Уровень`, guildId: guild.id })} 🎖${profile.level}`)
							embed.setDescription(`${client.language({ textId: `Профиль`, guildId: guild.id })}: <@${profile.userID}>\n${client.config.emojis.XP}${profile.totalxp < 10000 ? profile.totalxp.toFixed(2) : `${(profile.totalxp/1000).toFixed(0)}K`} ${client.config.emojis.mic}${profile.hours} ${client.config.emojis.message}️${profile.messages} ${client.config.emojis.heart}${profile.likes} ${settings.displayCurrencyEmoji}${(profile.currency).toFixed()} ${client.config.emojis.invite}${profile.invites} ${client.config.emojis.bump} ${profile.bumps} ${client.config.emojis.giveaway}${profile.giveawaysCreated} ${client.config.emojis.wormhole}${profile.wormholeTouched} ${client.config.emojis.RP} ${profile.rp.toFixed(2)} ${client.config.emojis.quests}${profile.doneQuests}`)
							if (member) embed.setThumbnail(member.user.avatarURL())
							if (member) embed.setColor(member.displayHexColor)
							embeds.push(embed)
						}
					}
					guild.channels.fetch(settings.top_report.channelId).then(channel => channel.send({ content: content, embeds: embeds.length ? embeds : [leaderBoardEmbed] })).catch(() => null)
				}
			}	
		}
		const guildIDs = Array.from(new Set(client.cache.quests.filter(quest => quest.daily && quest.isEnabled).map(e => e.guildID)))
		await Promise.all(guildIDs.map(async (guildID) => {
			const guild = client.guilds.cache.get(guildID)
			if (guild) {
				const quests = client.cache.quests.filter(quest => quest.daily && quest.guildID === guild.id && quest.targets.length >= 1)
				await Promise.all(quests.map(async quest => {
					if (quest.community) {
						for (const target of quest.targets) {
							target.reached = 0
							target.finished = false
						}
						await quest.save()
					}
					await Promise.all(client.cache.profiles.filter(profile => profile.guildID === guild.id && profile.quests && profile.quests.some(profileQuest => profileQuest.questID === quest.questID)).map(async profile => {
						profile.quests = profile.quests?.filter(profileQuest => profileQuest.questID !== quest.questID)
						if (profile.quests && !profile.quests.length) profile.quests = undefined
						await profile.save()
					}))		
				}))
			}
		}))
	});
	Cron('00 10 00 * * Mon', { timezone: "UTC" }, async () => {
		//WEEKLY
		const guilds = client.guilds.cache.filter(e => e.available && !client.blacklist(e.id, "full_ban", "guilds")).map(e => e.id)
		const settingsArray = client.cache.settings.filter(settings => guilds.includes(settings.guildID)).map(e => e)
		for (const settings of settingsArray) {
			if (settings.top_report?.weekly && settings.top_report?.channelId) {
				const guild = client.guilds.cache.get(settings.guildID)
				if (guild) {
					let profiles = await client.functions.fetchLeaderboard(client, settings.guildID, "weekly.totalxp").then(collection => collection.map(profile => profile))
					const leaderBoardEmbed = new EmbedBuilder()
					const newDate = new Date()
					const date = new Date(newDate.setDate(newDate.getDate() - 1))
					let startOfWeek = require('date-fns/startOfWeek',)
					let endOfWeek = require('date-fns/endOfWeek')
					const start_date = startOfWeek(date, { weekStartsOn: 1 })
					const end_date = endOfWeek(date, { weekStartsOn: 1 })
					let content = `# ${client.language({ textId: "Таблица лидеров c", guildId: guild.id })} ${start_date.getDate().toString().length < 2 ? `0` + start_date.getDate().toString() : start_date.getDate().toString() }.${(start_date.getMonth() + 1).toString().length < 2 ? 0 + (start_date.getMonth() + 1).toString() : start_date.getMonth() + 1 }.${start_date.getFullYear()} ${client.language({ textId: "по", guildId: guild.id })} ${end_date.getDate().toString().length < 2 ? `0` + end_date.getDate().toString() : end_date.getDate().toString() }.${(end_date.getMonth() + 1).toString().length < 2 ? 0 + (end_date.getMonth() + 1).toString() : end_date.getMonth() + 1 }.${end_date.getFullYear()} ${client.language({ textId: "на сервере", guildId: guild.id })} ${guild.name}`
					profiles = profiles.slice(0, 10)
					let leaderboard = await client.functions.computeLeaderboard(profiles, "weekly.totalxp", 0)
					const embeds = []
					if (!leaderboard.length) {
						leaderBoardEmbed.setDescription(`${client.language({ textId: "В таблице лидеров никого нет", guildId: guild.id })}!`)
					} else {
						for (const profile of leaderboard) {
							const member = await guild.members.fetch(profile.userID).catch(() => null)
							const embed = new EmbedBuilder()
							embed.setTitle(`${profile.position} ${member?.displayName || `<@${profile.userID}>`} | ${client.language({ textId: `Уровень`, guildId: guild.id })} 🎖${profile.level}`)
							embed.setDescription(`${client.language({ textId: `Профиль`, guildId: guild.id })}: <@${profile.userID}>\n${client.config.emojis.XP}${profile.totalxp < 10000 ? profile.totalxp.toFixed(2) : `${(profile.totalxp/1000).toFixed(0)}K`} ${client.config.emojis.mic}${profile.hours} ${client.config.emojis.message}️${profile.messages} ${client.config.emojis.heart}${profile.likes} ${settings.displayCurrencyEmoji}${(profile.currency).toFixed()} ${client.config.emojis.invite}${profile.invites} ${client.config.emojis.bump} ${profile.bumps} ${client.config.emojis.giveaway}${profile.giveawaysCreated} ${client.config.emojis.wormhole}${profile.wormholeTouched} ${client.config.emojis.RP} ${profile.rp.toFixed(2)} ${client.config.emojis.quests}${profile.doneQuests}`)
							if (member) embed.setThumbnail(member.user.avatarURL())
							if (member) embed.setColor(member.displayHexColor)
							embeds.push(embed)
						}
					}
					guild.channels.fetch(settings.top_report.channelId).then(channel => channel.send({ content: content, embeds: embeds.length ? embeds : [leaderBoardEmbed] })).catch(() => null)
				} 
			}
		}
		const guildIDs = Array.from(new Set(client.cache.quests.filter(quest => quest.weekly && quest.isEnabled).map(e => e.guildID)))
		await Promise.all(guildIDs.map(async (guildID) => {
			const guild = client.guilds.cache.get(guildID)
			if (guild) {
				const quests = client.cache.quests.filter(quest => quest.weekly && quest.guildID === guild.id && quest.targets.length >= 1)
				await Promise.all(quests.map(async quest => {
					if (quest.community) {
						for (const target of quest.targets) {
							target.reached = 0
							target.finished = false
						}
						await quest.save()
					}
					await Promise.all(client.cache.profiles.filter(profile => profile.guildID === guild.id && profile.quests && profile.quests.some(profileQuest => profileQuest.questID === quest.questID)).map(async profile => {
						profile.quests = profile.quests?.filter(profileQuest => profileQuest.questID !== quest.questID)
						if (profile.quests && !profile.quests.length) profile.quests = undefined
						await profile.save()
					}))
				}))
			}
		}))
	});
	Cron('00 15 00 1 * *', { timezone: "UTC" }, async () => {
		//MONTHLY
		const guilds = client.guilds.cache.filter(e => e.available && !client.blacklist(e.id, "full_ban", "guilds")).map(e => e.id)
		const settingsArray = client.cache.settings.filter(settings => guilds.includes(settings.guildID)).map(e => e)
		for (const settings of settingsArray) {
			if (settings.top_report?.monthly && settings.top_report?.channelId) {
				const guild = client.guilds.cache.get(settings.guildID)
				if (guild) {
					let profiles = await client.functions.fetchLeaderboard(client, settings.guildID, "monthly.totalxp").then(collection => collection.map(profile => profile))
					const leaderBoardEmbed = new EmbedBuilder()
					const newDate = new Date()
					const date = new Date(newDate.setDate(newDate.getDate() - 1))
					let content = `# ${client.language({ textId: `Таблица лидеров за`, guildId: guild.id })} ${date.getMonth() == 0 ? `${client.language({ textId: "январь", guildId: guild.id })}` : date.getMonth() == 1 ? `${client.language({ textId: "февраль", guildId: guild.id })}` : date.getMonth() == 2 ? `${client.language({ textId: "март", guildId: guild.id })}` : date.getMonth() == 3 ? `${client.language({ textId: "апрель", guildId: guild.id })}` : date.getMonth() == 4 ? `${client.language({ textId: "май", guildId: guild.id })}` : date.getMonth() == 5 ? `${client.language({ textId: "июнь", guildId: guild.id })}` : date.getMonth() == 6 ? `${client.language({ textId: "июль", guildId: guild.id })}` : date.getMonth() == 7 ? `${client.language({ textId: "август", guildId: guild.id })}` : date.getMonth() == 8 ? `${client.language({ textId: "сентябрь", guildId: guild.id })}` : date.getMonth() == 9 ? `${client.language({ textId: "октябрь", guildId: guild.id })}` : date.getMonth() == 10 ? `${client.language({ textId: "ноябрь", guildId: guild.id })}` : `${client.language({ textId: "декабрь", guildId: guild.id })}`} ${date.getFullYear()} ${client.language({ textId: `на сервере`, guildId: guild.id })} ${guild.name}`
					profiles = profiles.slice(0, 10)
					let leaderboard = await client.functions.computeLeaderboard(profiles, `monthly.totalxp`, 0)
					const embeds = []
					if (!leaderboard.length) {
						leaderBoardEmbed.setDescription(`${client.language({ textId: `В таблице лидеров никого нет`, guildId: guild.id })}!`)
					}
					else {
						for (const profile of leaderboard) {
							const member = await guild.members.fetch(profile.userID).catch(() => null)
							const embed = new EmbedBuilder()
							embed.setTitle(`${profile.position} ${member?.displayName || `<@${profile.userID}>`} | ${client.language({ textId: `Уровень`, guildId: guild.id })} 🎖${profile.level}`)
							embed.setDescription(`${client.language({ textId: `Профиль`, guildId: guild.id })}: <@${profile.userID}>\n${client.config.emojis.XP}${profile.totalxp < 10000 ? profile.totalxp.toFixed(2) : `${(profile.totalxp/1000).toFixed(0)}K`} ${client.config.emojis.mic}${profile.hours} ${client.config.emojis.message}️${profile.messages} ${client.config.emojis.heart}${profile.likes} ${settings.displayCurrencyEmoji}${(profile.currency).toFixed()} ${client.config.emojis.invite}${profile.invites} ${client.config.emojis.bump} ${profile.bumps} ${client.config.emojis.giveaway}${profile.giveawaysCreated} ${client.config.emojis.wormhole}${profile.wormholeTouched} ${client.config.emojis.RP} ${profile.rp.toFixed(2)} ${client.config.emojis.quests}${profile.doneQuests}`)
							if (member) embed.setThumbnail(member.user.avatarURL())
							if (member) embed.setColor(member.displayHexColor)
							embeds.push(embed)
						}
					}
					guild.channels.fetch(settings.top_report.channelId).then(channel => channel.send({ content: content, embeds: embeds.length ? embeds : [leaderBoardEmbed] })).catch(() => null)
				} 
			}
		}
	});
	Cron('00 20 00 1 1 *', { timezone: "UTC" }, async () => {
		//YEARLY
		const guilds = client.guilds.cache.filter(e => e.available && !client.blacklist(e.id, "full_ban", "guilds")).map(e => e.id)
		const settingsArray = client.cache.settings.filter(settings => guilds.includes(settings.guildID)).map(e => e)
		for (const settings of settingsArray) {
			if (settings.top_report?.yearly && settings.top_report?.channelId) {
				const guild = client.guilds.cache.get(settings.guildID)
				if (guild) {
					let profiles = await client.functions.fetchLeaderboard(client, settings.guildID, "yearly.totalxp").then(collection => collection.map(profile => profile))
					const leaderBoardEmbed = new EmbedBuilder()
					const newDate = new Date()
					const date = new Date(newDate.setDate(newDate.getDate() - 1))
					let content = `# ${client.language({ textId: "Таблица лидеров за", guildId: guild.id })} ${date.getFullYear()} ${client.language({ textId: "год на сервере", guildId: guild.id })} ${guild.name}`
					profiles = profiles.slice(0, 10)
					let leaderboard = await client.functions.computeLeaderboard(profiles, "yearly.totalxp", 0)
					const embeds = []
					if (!leaderboard.length) {
						leaderBoardEmbed.setDescription(`${client.language({ textId: "В таблице лидеров никого нет", guildId: guild.id })}!`)
					}
					else {
						for (const profile of leaderboard) {
							const member = await guild.members.fetch(profile.userID).catch(() => null)
							const embed = new EmbedBuilder()
							embed.setTitle(`${profile.position} ${member?.displayName || `<@${profile.userID}>`} | ${client.language({ textId: `Уровень`, guildId: guild.id })} 🎖${profile.level}`)
							embed.setDescription(`${client.language({ textId: `Профиль`, guildId: guild.id })}: <@${profile.userID}>\n${client.config.emojis.XP}${profile.totalxp < 10000 ? profile.totalxp.toFixed(2) : `${(profile.totalxp/1000).toFixed(0)}K`} ${client.config.emojis.mic}${profile.hours} ${client.config.emojis.message}️${profile.messages} ${client.config.emojis.heart}${profile.likes} ${settings.displayCurrencyEmoji}${(profile.currency).toFixed()} ${client.config.emojis.invite}${profile.invites} ${client.config.emojis.bump} ${profile.bumps} ${client.config.emojis.giveaway}${profile.giveawaysCreated} ${client.config.emojis.wormhole}${profile.wormholeTouched} ${client.config.emojis.RP} ${profile.rp.toFixed(2)} ${client.config.emojis.quests}${profile.doneQuests}`)
							if (member) embed.setThumbnail(member.user.avatarURL())
							if (member) embed.setColor(member.displayHexColor)
							embeds.push(embed)
						}
					}
					guild.channels.fetch(settings.top_report.channelId).then(channel => channel.send({ content: content, embeds: embeds.length ? embeds : [leaderBoardEmbed] })).catch(() => null)
				} 
			}
		}
	})
	async function UpdateVoiceState(profile, newDate) {
		const guild = client.guilds.cache.get(profile.guildID);
		
		// Проверка доступности гильдии и черного списка
		if (!guild || client.blacklist(guild.id, "full_ban", "guilds")) {
			return await resetGuildProfiles(profile.guildID);
		}

		const member = await guild.members.fetch(profile.userID).catch(() => null);
		if (!member) {
			return await resetProfileSession(profile);
		}

		// Если пользователь не в голосовом канале
		if (!member.voice.channelId) {
			return await processVoiceSession(profile, member, newDate);
		}
	}

	// Вспомогательные функции
	async function resetGuildProfiles(guildId) {
		const profilesToReset = client.cache.profiles.filter(p => 
			p.guildID === guildId && 
			hasActiveSession(p)
		);

		const resetPromises = Array.from(profilesToReset.values()).map(profile => 
			resetProfileSession(profile)
		);

		await Promise.all(resetPromises);
	}

	function hasActiveSession(profile) {
		return (profile.itemsSession?.length || 
				profile.hoursSession !== 0 || 
				profile.xpSession !== 0 || 
				profile.currencySession !== 0 || 
				profile.startTime !== undefined);
	}

	async function resetProfileSession(profile) {
		profile.itemsSession = [];
		profile.hoursSession = 0;
		profile.xpSession = 0;
		profile.currencySession = 0;
		profile.startTime = undefined;
		return await profile.save();
	}

	async function processVoiceSession(profile, member, newDate) {
		if (client.blacklist(profile.userID, "full_ban", "users")) {
			return await resetProfileSession(profile);
		}

		const settings = client.cache.settings.get(member.guild.id);
		if (!settings) return;

		// Устанавливаем глобальный кулдаун
		client.globalCooldown[`${member.guild.id}_${profile.userID}`] = Date.now() + 30000;

		try {
			const timeDiff = newDate - profile.startTime;
			const hours = timeDiff / 1000 / 60 / 60;

			if (hours > 1) {
				return await resetProfileSession(profile);
			}

			await calculateAndApplyRewards(profile, member, settings, timeDiff, hours);
			
		} finally {
			delete client.globalCooldown[`${member.guild.id}_${profile.userID}`];
		}
	}

	async function calculateAndApplyRewards(profile, member, settings, timeDiff, hours) {
		const channel = member.voice.channel;
		const isMuted = member.roles.cache.hasAny(...(settings.roles?.mutedRoles || []));
		
		const rewards = await calculateRewards(profile, member, settings, channel, timeDiff, isMuted);
		
		await updateProfileStats(profile, rewards, hours);
		await checkAchievementsAndQuests(profile, member, settings.guildID, hours, channel?.id);
		
		if (!isMuted && !profile.blockActivities?.voice?.items) {
			await processItemDrops(profile, member, channel, hours, settings);
		}
		
		profile.startTime = undefined;
		await profile.save();
	}

	async function calculateRewards(profile, member, settings, channel, timeDiff, isMuted) {
		const rewards = { xp: 0, currency: 0, rp: 0 };
		
		if (isMuted) return rewards;

		const rewardCalculations = [
			{
				type: 'xp',
				rate: settings.xpForVoice,
				blocked: profile.blockActivities?.voice?.XP,
				boost: (mult) => profile.getXpBoost(mult)
			},
			{
				type: 'rp', 
				rate: settings.rpForVoice,
				blocked: profile.blockActivities?.voice?.RP,
				boost: (mult) => profile.getRpBoost(mult)
			},
			{
				type: 'currency',
				rate: settings.curForVoice,
				blocked: profile.blockActivities?.voice?.CUR,
				boost: (mult) => profile.getCurBoost(mult)
			}
		];

		for (const calc of rewardCalculations) {
			if (calc.rate && !calc.blocked) {
				const multipliers = calculateMultipliers(client, channel, profile, calc.type);
				const baseReward = (timeDiff / 1000 / 60) * calc.rate;
				const boostedReward = baseReward + (baseReward * calc.boost(multipliers.multiplier + multipliers.membersMultiplier));
				
				if (boostedReward) {
					rewards[calc.type] += boostedReward;
				}
			}
		}

		return rewards;
	}

	function calculateMultipliers(client, channel, profile, type) {
		if (!channel) return { multiplier: 0, membersMultiplier: 0 };
		
		let channelMultipliers = client.cache.channels.find(cm => cm.id === channel.id && cm.isEnabled);
		if (!channelMultipliers) {
			channelMultipliers = client.cache.channels.find(cm => cm.id === channel.parentId && cm.isEnabled);
		}
		
		if (!channelMultipliers) return { multiplier: 0, membersMultiplier: 0 };
		
		const activeMembers = channel.members.filter(m => !m.voice.mute && !m.user.bot);
		let membersSize = activeMembers.size;
		
		const minSize = channelMultipliers[`${type}_min_members_size`];
		const maxSize = channelMultipliers[`${type}_max_members_size`];
		
		if (membersSize < minSize) membersSize = 0;
		if (membersSize > maxSize) membersSize = maxSize;
		
		return {
			multiplier: channelMultipliers[`${type}_multiplier`],
			membersMultiplier: channelMultipliers[`${type}_multiplier_for_members`] * membersSize
		};
	}

	async function updateProfileStats(profile, rewards, hours) {
		profile.hours += hours;
		profile.hoursSession += hours;
		profile.xpSession += rewards.xp;
		profile.rpSession += rewards.rp;
		profile.currencySession += rewards.currency;

		const updatePromises = [];
		if (rewards.xp) updatePromises.push(profile.addXp({ amount: rewards.xp }));
		if (rewards.rp) updatePromises.push(profile.addRp({ amount: rewards.rp }));
		if (rewards.currency > 0) updatePromises.push(profile.addCurrency({ amount: rewards.currency }));

		await Promise.all(updatePromises);
	}

	async function checkAchievementsAndQuests(profile, member, guildId, hours, channelId) {
		// Проверка квестов
		const guildQuests = client.cache.quests.filter(quest => 
			quest.guildID === guildId && 
			quest.isEnabled && 
			quest.targets.some(target => target.type === "voice")
		);
		
		if (guildQuests.size) {
			await profile.addQuestProgression({ type: "voice", amount: hours * 60, object: channelId });
		}

		// Проверка достижений
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

	async function processItemDrops(profile, member, channel, hours, settings) {
		const multipliers = calculateMultipliers(client, channel, profile, 'luck');
		const bonus = new Decimal(1).plus(profile.getLuckBoost(multipliers.multiplier));
		
		let items = client.cache.items.filter(item => 
			item.guildID === member.guild.id && 
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
		const receivedItems = await dropItems(profile, member, channel, items, hours);
		
		if (receivedItems.length) {
			await updateSessionItems(profile, receivedItems);
			await sendItemNotification(member, receivedItems, settings, profile);
		}
	}

	async function dropItems(profile, member, channel, items, hours) {
		const receivedItems = [];
		let count = Math.min(Math.round(hours * 60), 10); // Ограничение 10 дропов
		
		const filteredItems = await filterItemsByPermission(items, profile, member, channel);
		
		for (let i = 0; i < count; i++) {
			const baseChance = Math.random() || 1;
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

	async function filterItemsByPermission(items, profile, member, channel) {
		const results = await Promise.all(items.map(async (item) => {
			if (!item.activities_voice_permission) return item;
			
			const permission = client.cache.permissions.find(p => p.id === item.activities_voice_permission);
			if (!permission) return item;
			
			const isPassing = permission.for(profile, member, channel);
			return isPassing.value === true ? item : null;
		}));
		
		return results.filter(Boolean);
	}

	async function updateSessionItems(profile, receivedItems) {
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

	async function sendItemNotification(member, receivedItems, settings, profile) {
		if (!settings.channels.itemsNotificationChannelId) return;
		
		const channel = await member.guild.channels.fetch(settings.channels.itemsNotificationChannelId).catch(() => null);
		if (!channel || !channel.permissionsFor(member.guild.members.me).has("SendMessages")) return;
		
		const itemStrings = receivedItems.map(item => `**${item.displayEmoji}${item.name}** (${item.amount})`);
		
		const embed = new EmbedBuilder()
			.setAuthor({ name: member.displayName, iconURL: member.displayAvatarURL() })
			.setDescription(`${client.language({ textId: "Нашел", guildId: member.guild.id })}:\n${itemStrings.join("\n")}`)
			.setColor("#2F3236");
		
		await channel.send({ 
			content: profile.itemMention ? `<@${member.user.id}>` : ` `, 
			embeds: [embed] 
		}).catch(() => null);
	}

	async function avcsUpdate(avc) {
		const guild = client.guilds.cache.get(avc.guildID)
		if (guild) {
			if (client.blacklist(guild.id, "full_ban", "guilds")) return avc.remove()
				const settings = client.cache.settings.get(guild.id)
			if (settings) {
				const orbits = guild.channels.cache.filter(channel => channel.parentId && channel.parentId == settings.categories?.joinToCreateCategoryId && channel.id !== settings.channels.joinToCreateChannelId && channel.members.size === 0 && new Date - channel.createdAt > 1000 && channel.type === ChannelType.GuildVoice)
				orbits.forEach(orbit => {
					avc.remove()
					orbit.delete().catch(() => null)
				})
			} else avc.remove()
		}
	}
}
const lerp = (min, max, roll) => ((1 - roll) * min + roll * max)
const drop = (items, roll) => {
	const chance = lerp(0, 100, roll)
	let current = new Decimal(0)
	for (const item of items) {
		if (current.lte(chance) && current.plus(item.activities.voice.chance).gte(chance)) {
			return item
		}
		current = current.plus(item.activities.voice.chance)
	}
}