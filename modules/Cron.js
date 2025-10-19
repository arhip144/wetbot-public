const { AchievementType } = require("../enums")
const { SnowflakeUtil, EmbedBuilder } = require("discord.js")
const Cron = require("croner")
const Decimal = require('decimal.js')
module.exports = async function (client) {
	Cron('* * * * *', { timezone: "Atlantic/Azores" }, async () => {
		await Promise.all(client.cache.profiles.filter(profile => profile.roles && profile.roles.some(r => r.until <= new Date())).map(async profile => {
			const guild = client.guilds.cache.get(profile.guildID)
			if (guild) {
				const member = await guild.members.fetch(profile.userID).catch(e => null)
				if (member) {
					await member.roles.remove(profile.roles.filter(e => e.until <= new Date()).map(e => e.id)).catch(e => null)
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
	Cron('*/10 * * * *', { timezone: "Atlantic/Azores" }, async () => {
		const profiles = client.cache.profiles.filter(profile => profile.startTime <= Date.now())
		const date = Date.now()
		console.time(`[${client.shard.ids[0]}] Calculated ${profiles.size} users in voice`)
		await Promise.all(profiles.map(async profile => {
			await UpdateVoiceState(profile, date)
		}))
		console.timeEnd(`[${client.shard.ids[0]}] Calculated ${profiles.size} users in voice`)
	})
	Cron('00 00 04 * * *', { timezone: "Atlantic/Azores" }, async () => {
		const day = new Date().getDate()
		const month = new Date().getMonth() + 1
		const profiles = client.cache.profiles.filter(profile => profile.birthday_day === day && profile.birthday_month === month)
		for (const profile of profiles.map(e => e)) {
			if (!client.blacklist(profile.userID, "full_ban", "users")) {
				const guild = client.guilds.cache.get(profile.guildID)
				if (guild) {
					const member = await guild.members.fetch(profile.userID).catch(e => null)
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
						if (settings.channels.generalChannelId) guild.channels.fetch(settings.channels.generalChannelId).then(channel => channel.send({ content: `<@${profile.userID}>`, embeds: [embed], enforceNonce: true, nonce: nonce, })).catch(e => null)
					}	
				}	
			}
		}
	})
	Cron('00 05 00 * * *', { timezone: "Atlantic/Azores" }, async () => {
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
					let leaderboard = await client.functions.computeLeaderboard(client, profiles, "daily.totalxp", 0)
					const embeds = []
					if (!leaderboard.length) {
						leaderBoardEmbed.setDescription(`${client.language({ textId: "В таблице лидеров никого нет", guildId: guild.id })}!`)
					} else {
						for (const profile of leaderboard) {
							const member = await guild.members.fetch(profile.userID).catch(e => null)
							const embed = new EmbedBuilder()
							embed.setTitle(`${profile.position} ${member?.displayName || `<@${profile.userID}>`} | ${client.language({ textId: `Уровень`, guildId: guild.id })} 🎖${profile.level}`)
							embed.setDescription(`${client.language({ textId: `Профиль`, guildId: guild.id })}: <@${profile.userID}>\n${client.config.emojis.XP}${profile.totalxp < 10000 ? profile.totalxp.toFixed(2) : `${(profile.totalxp/1000).toFixed(0)}K`} ${client.config.emojis.mic}${profile.hours} ${client.config.emojis.message}️${profile.messages} ${client.config.emojis.heart}${profile.likes} ${settings.displayCurrencyEmoji}${(profile.currency).toFixed()} ${client.config.emojis.invite}${profile.invites} ${client.config.emojis.bump} ${profile.bumps} ${client.config.emojis.giveaway}${profile.giveawaysCreated} ${client.config.emojis.wormhole}${profile.wormholeTouched} ${client.config.emojis.RP} ${profile.rp.toFixed(2)} ${client.config.emojis.quests}${profile.doneQuests}`)
							if (member) embed.setThumbnail(member.user.avatarURL())
							if (member) embed.setColor(member.displayHexColor)
							embeds.push(embed)
						}
					}
					guild.channels.fetch(settings.top_report.channelId).then(channel => channel.send({ content: content, embeds: embeds.length ? embeds : [leaderBoardEmbed] })).catch(e => null)
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
	})
	Cron('00 10 00 * * Mon', { timezone: "Atlantic/Azores" }, async () => {
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
					let leaderboard = await client.functions.computeLeaderboard(client, profiles, "weekly.totalxp", 0)
					const embeds = []
					if (!leaderboard.length) {
						leaderBoardEmbed.setDescription(`${client.language({ textId: "В таблице лидеров никого нет", guildId: guild.id })}!`)
					} else {
						for (const profile of leaderboard) {
							const member = await guild.members.fetch(profile.userID).catch(e => null)
							const embed = new EmbedBuilder()
							embed.setTitle(`${profile.position} ${member?.displayName || `<@${profile.userID}>`} | ${client.language({ textId: `Уровень`, guildId: guild.id })} 🎖${profile.level}`)
							embed.setDescription(`${client.language({ textId: `Профиль`, guildId: guild.id })}: <@${profile.userID}>\n${client.config.emojis.XP}${profile.totalxp < 10000 ? profile.totalxp.toFixed(2) : `${(profile.totalxp/1000).toFixed(0)}K`} ${client.config.emojis.mic}${profile.hours} ${client.config.emojis.message}️${profile.messages} ${client.config.emojis.heart}${profile.likes} ${settings.displayCurrencyEmoji}${(profile.currency).toFixed()} ${client.config.emojis.invite}${profile.invites} ${client.config.emojis.bump} ${profile.bumps} ${client.config.emojis.giveaway}${profile.giveawaysCreated} ${client.config.emojis.wormhole}${profile.wormholeTouched} ${client.config.emojis.RP} ${profile.rp.toFixed(2)} ${client.config.emojis.quests}${profile.doneQuests}`)
							if (member) embed.setThumbnail(member.user.avatarURL())
							if (member) embed.setColor(member.displayHexColor)
							embeds.push(embed)
						}
					}
					guild.channels.fetch(settings.top_report.channelId).then(channel => channel.send({ content: content, embeds: embeds.length ? embeds : [leaderBoardEmbed] })).catch(e => null)
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
	})
	Cron('00 15 00 1 * *', { timezone: "Atlantic/Azores" }, async () => {
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
					let leaderboard = await client.functions.computeLeaderboard(client, profiles, `monthly.totalxp`, 0)
					const embeds = []
					if (!leaderboard.length) {
						leaderBoardEmbed.setDescription(`${client.language({ textId: `В таблице лидеров никого нет`, guildId: guild.id })}!`)
					}
					else {
						for (const profile of leaderboard) {
							const member = await guild.members.fetch(profile.userID).catch(e => null)
							const embed = new EmbedBuilder()
							embed.setTitle(`${profile.position} ${member?.displayName || `<@${profile.userID}>`} | ${client.language({ textId: `Уровень`, guildId: guild.id })} 🎖${profile.level}`)
							embed.setDescription(`${client.language({ textId: `Профиль`, guildId: guild.id })}: <@${profile.userID}>\n${client.config.emojis.XP}${profile.totalxp < 10000 ? profile.totalxp.toFixed(2) : `${(profile.totalxp/1000).toFixed(0)}K`} ${client.config.emojis.mic}${profile.hours} ${client.config.emojis.message}️${profile.messages} ${client.config.emojis.heart}${profile.likes} ${settings.displayCurrencyEmoji}${(profile.currency).toFixed()} ${client.config.emojis.invite}${profile.invites} ${client.config.emojis.bump} ${profile.bumps} ${client.config.emojis.giveaway}${profile.giveawaysCreated} ${client.config.emojis.wormhole}${profile.wormholeTouched} ${client.config.emojis.RP} ${profile.rp.toFixed(2)} ${client.config.emojis.quests}${profile.doneQuests}`)
							if (member) embed.setThumbnail(member.user.avatarURL())
							if (member) embed.setColor(member.displayHexColor)
							embeds.push(embed)
						}
					}
					guild.channels.fetch(settings.top_report.channelId).then(channel => channel.send({ content: content, embeds: embeds.length ? embeds : [leaderBoardEmbed] })).catch(e => null)
				} 
			}
		}
	})
	Cron('00 20 00 1 1 *', { timezone: "Atlantic/Azores" }, async () => {
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
					let leaderboard = await client.functions.computeLeaderboard(client, profiles, "yearly.totalxp", 0)
					const embeds = []
					if (!leaderboard.length) {
						leaderBoardEmbed.setDescription(`${client.language({ textId: "В таблице лидеров никого нет", guildId: guild.id })}!`)
					}
					else {
						for (const profile of leaderboard) {
							const member = await guild.members.fetch(profile.userID).catch(e => null)
							const embed = new EmbedBuilder()
							embed.setTitle(`${profile.position} ${member?.displayName || `<@${profile.userID}>`} | ${client.language({ textId: `Уровень`, guildId: guild.id })} 🎖${profile.level}`)
							embed.setDescription(`${client.language({ textId: `Профиль`, guildId: guild.id })}: <@${profile.userID}>\n${client.config.emojis.XP}${profile.totalxp < 10000 ? profile.totalxp.toFixed(2) : `${(profile.totalxp/1000).toFixed(0)}K`} ${client.config.emojis.mic}${profile.hours} ${client.config.emojis.message}️${profile.messages} ${client.config.emojis.heart}${profile.likes} ${settings.displayCurrencyEmoji}${(profile.currency).toFixed()} ${client.config.emojis.invite}${profile.invites} ${client.config.emojis.bump} ${profile.bumps} ${client.config.emojis.giveaway}${profile.giveawaysCreated} ${client.config.emojis.wormhole}${profile.wormholeTouched} ${client.config.emojis.RP} ${profile.rp.toFixed(2)} ${client.config.emojis.quests}${profile.doneQuests}`)
							if (member) embed.setThumbnail(member.user.avatarURL())
							if (member) embed.setColor(member.displayHexColor)
							embeds.push(embed)
						}
					}
					guild.channels.fetch(settings.top_report.channelId).then(channel => channel.send({ content: content, embeds: embeds.length ? embeds : [leaderBoardEmbed] })).catch(e => null)
				} 
			}
		}
	})
	async function UpdateVoiceState(profile, newDate) {
		let guild = client.guilds.cache.get(profile.guildID)
		if (!guild) {
			client.cache.profiles.filter(p => p.guildID === profile.guildID && (p.itemsSession?.length || p.hoursSession !== 0 || p.xpSession !== 0 || p.currencySession !== 0 || p.startTime !== undefined)).forEach(p => {
				p.itemsSession = []
				p.hoursSession = 0
				p.xpSession = 0
				p.currencySession = 0
				p.startTime = undefined
				p.save()
			})
			return 
		}
		const member = await guild.members.fetch(profile.userID).catch(e => null)
		if (!member) {
			profile.itemsSession = undefined
			profile.hoursSession = 0
			profile.xpSession = 0
			profile.currencySession = 0
			profile.startTime = undefined
			return await profile.save()
		}
		if (!member.voice.sessionId) {
			if (client.blacklist(guild.id, "full_ban", "guilds")) {
				client.cache.profiles.filter(p => p.guildID === profile.guildID && (p.itemsSession.length || p.hoursSession !== 0 || p.xpSession !== 0 || p.currencySession !== 0 || p.startTime !== undefined)).forEach(p => {
					p.itemsSession = []
					p.hoursSession = 0
					p.xpSession = 0
					p.currencySession = 0
					p.startTime = undefined
					p.save()
				})
				return 
			}
            if (client.blacklist(profile.userID, "full_ban", "users")) {
				profile.itemsSession = undefined
				profile.hoursSession = 0
				profile.xpSession = 0
				profile.currencySession = 0
				profile.startTime = undefined
				return await profile.save()
			}
        	const settings = client.cache.settings.get(guild.id)
            client.globalCooldown[`${guild.id}_${profile.userID}`] = Date.now() + 30000
            const timeDiff = newDate - profile.startTime
            //appendMsVC
            const hours = timeDiff/1000/60/60
            if (hours <= 1) {
                const rewards = {
                    xp: 0,
                    currency: 0,
                    rp: 0
                }
				const channel = member.voice.channel
                if (!member.roles.cache.hasAny(...settings.roles?.mutedRoles)) {
					if (settings.xpForVoice && !profile.blockActivities?.voice?.XP) {
						let xp_multiplier_for_channel = 0
						let xp_multiplier_for_members = 0
						if (channel) {
							let channelMultipliers = client.cache.channels.find(channelMultipliers => channelMultipliers.id === channel.id && channelMultipliers.isEnabled)
							if (!channelMultipliers) channelMultipliers = client.cache.channels.find(channelMultipliers => channelMultipliers.id === channel.parentId && channelMultipliers.isEnabled)
							if (channelMultipliers) {
								let members_size = channel.members.filter(member => !member.voice.mute && !member.user.bot).size
								if (members_size < channelMultipliers.xp_min_members_size) members_size = 0
								if (members_size > channelMultipliers.xp_max_members_size) members_size = channelMultipliers.xp_max_members_size
								xp_multiplier_for_channel = channelMultipliers.xp_multiplier
								xp_multiplier_for_members = channelMultipliers.xp_multiplier_for_members * members_size
							}   
						}
						const base_xp = timeDiff/1000/60 * settings.xpForVoice
						const xp = base_xp + (base_xp * profile.getXpBoost(xp_multiplier_for_channel + xp_multiplier_for_members))
						if (xp) rewards.xp += xp
					}
					if (settings.rpForVoice && !profile.blockActivities?.voice?.RP) {
						let rp_multiplier_for_channel = 0
						let rp_multiplier_for_members = 0
						if (channel) {
							let channelMultipliers = client.cache.channels.find(channelMultipliers => channelMultipliers.id === channel.id && channelMultipliers.isEnabled)
							if (!channelMultipliers) channelMultipliers = client.cache.channels.find(channelMultipliers => channelMultipliers.id === channel.parentId && channelMultipliers.isEnabled)
							if (channelMultipliers) {
								let members_size = channel.members.filter(member => !member.voice.mute && !member.user.bot).size
								if (members_size < channelMultipliers.rp_min_members_size) members_size = 0
								if (members_size > channelMultipliers.rp_max_members_size) members_size = channelMultipliers.rp_max_members_size
								rp_multiplier_for_channel = channelMultipliers.rp_multiplier
								rp_multiplier_for_channel = channelMultipliers.rp_multiplier_for_members * members_size
							}
						}
						const base_rp = timeDiff/1000/60 * settings.rpForVoice
						const rp = base_rp + (base_rp * profile.getRpBoost(rp_multiplier_for_channel + rp_multiplier_for_members))
						if (rp) rewards.rp += rp
					}
					if (settings.curForVoice && !profile.blockActivities?.voice?.CUR) {
						let cur_multiplier_for_channel = 0
						let cur_multiplier_for_members = 0
						if (channel) {
							let channelMultipliers = client.cache.channels.find(channelMultipliers => channelMultipliers.id === channel.id && channelMultipliers.isEnabled)
							if (!channelMultipliers) channelMultipliers = client.cache.channels.find(channelMultipliers => channelMultipliers.id === channel.parentId && channelMultipliers.isEnabled)
							if (channelMultipliers) {
								let members_size = channel.members.filter(member => !member.voice.mute && !member.user.bot).size
								if (members_size < channelMultipliers.cur_min_members_size) members_size = 0
								if (members_size > channelMultipliers.cur_max_members_size) members_size = channelMultipliers.cur_max_members_size
								cur_multiplier_for_channel = channelMultipliers.cur_multiplier
								cur_multiplier_for_members = channelMultipliers.cur_multiplier_for_members * members_size
							}
						}
						const base_cur = timeDiff/1000/60 * settings.curForVoice
						const cur = base_cur + (base_cur * profile.getCurBoost(cur_multiplier_for_channel + cur_multiplier_for_members))
						if (cur) {
							rewards.currency += cur
						}
					}
					const guildQuests = client.cache.quests.filter(quest => quest.guildID === guild.guildID && quest.isEnabled && quest.targets.some(target => target.type === "voice"))
					if (guildQuests.size) await profile.addQuestProgression("voice", hours*60, channel?.id)
					let achievements = client.cache.achievements.filter(e => e.guildID === guild.id && e.type === AchievementType.DailyHours && e.enabled)
					await Promise.all(achievements.map(async achievement => {
						if (!profile.achievements?.some(ach => ach.achievmentID === achievement.id) && profile.hoursSession >= achievement.amount && !client.tempAchievements[member.user.id]?.includes(achievement.id)) { 
							if (!client.tempAchievements[profile.userID]) client.tempAchievements[member.user.id] = []
							client.tempAchievements[member.user.id].push(achievement.id)
							await profile.addAchievement(achievement)
						}
					}))
					achievements = client.cache.achievements.filter(e => e.guildID === guild.id && e.type === AchievementType.Voice && e.enabled)
					await Promise.all(achievements.map(async achievement => {
						if (!profile.achievements?.some(ach => ach.achievmentID === achievement.id) && profile.hours >= achievement.amount && !client.tempAchievements[member.user.id]?.includes(achievement.id)) {
							if (!client.tempAchievements[profile.userID]) client.tempAchievements[member.user.id] = []
							client.tempAchievements[member.user.id].push(achievement.id)
							await profile.addAchievement(achievement)
						}
					}))
				}
				if (rewards.xp > 1000000000000) rewards.xp = 1000000000000
				profile.hours = hours
				profile.hoursSession += hours
				profile.xpSession += rewards.xp
				profile.rpSession += rewards.rp
				profile.currencySession += rewards.currency
				profile.currency = rewards.currency
				profile.startTime = undefined
				if (rewards.xp) await profile.addXp(rewards.xp)
				if (rewards.rp) await profile.addRp(rewards.rp)
				if (rewards.currency > 0) await profile.addCurrency(rewards.currency)
				if (!member.roles.cache.hasAny(...settings.roles?.mutedRoles) && !profile.blockActivities?.voice?.items) {
					let luck_multiplier_for_channel = 0
					let luck_multiplier_for_members = 0
					if (channel) {
						let channelMultipliers = client.cache.channels.find(channelMultipliers => channelMultipliers.id === channel.id && channelMultipliers.isEnabled)
						if (!channelMultipliers) channelMultipliers = client.cache.channels.find(channelMultipliers => channelMultipliers.id === channel.parentId && channelMultipliers.isEnabled)
						if (channelMultipliers) {
							let members_size = channel.members.filter(member => !member.voice.mute && !member.user.bot).size
							if (members_size < channelMultipliers.luck_min_members_size) members_size = 0
							if (members_size > channelMultipliers.luck_max_members_size) members_size = channelMultipliers.luck_max_members_size
							luck_multiplier_for_channel = channelMultipliers.luck_multiplier
							luck_multiplier_for_members = channelMultipliers.luck_multiplier_for_members * members_size
						}	
					}
					let Items = client.cache.items.filter(item => item.guildID === guild.id && !item.temp && item.enabled && item.activities?.voice?.chance).sort((a, b) => a.activities.voice.chance - b.activities.voice.chance).map(e => { 
						return { itemID: e.itemID, displayEmoji: e.displayEmoji, name: e.name, activities: { voice: { chance: e.activities.voice.chance, amountFrom: e.activities.voice.amountFrom, amountTo: e.activities.voice.amountTo } }, activities_voice_permission: e.activities_voice_permission }
					})
					if (Items.length) {
						const received_items = []
						let count = Math.round((hours*60))
						if (count > 10) count = 10
						const bonus = new Decimal(1).plus(profile.getLuckBoost(luck_multiplier_for_channel))
						Items = client.functions.adjustActivityChanceByLuck(Items, bonus, "voice")
						for (let i = 0; i < count; i++) {
							let base_chance = Math.random()
							if (base_chance === 0) base_chance = 1
							const asyncFilter = async (arr, predicate) => {
								const results = await Promise.all(arr.map(predicate))
								return results.filter((_v, index) => results[index])
							}
							let items = await asyncFilter(Items, async (e) => {
								if (e.activities_voice_permission) {
									const permission = client.cache.permissions.find(i => i.id === e.activities_voice_permission)
									if (permission) {
										const isPassing = permission.for(profile, member, channel)
										if (isPassing.value === true) return e	
									} else return e
								} else return e
							})
							const item = drop(items, base_chance)
							if (item) {
								const amount = client.functions.getRandomNumber(item.activities.voice.amountFrom, item.activities.voice.amountTo)
								await profile.addItem(item.itemID, amount)
								const received_item = received_items.find(e => { return e.itemID === item.itemID })
								if (received_item) received_item.amount += amount
								else {
									received_items.push({
										itemID: item.itemID,
										name: item.name,
										displayEmoji: item.displayEmoji,
										amount: amount,
									})
								}
							}
						}
						if (received_items.length) {
							let index = 0
							for (const received_item of received_items) {
								const sessionItem = profile.itemsSession?.find(e => { return e.itemID === received_item.itemID })
								if (sessionItem) {
									sessionItem.amount += received_item.amount
								} else {
									if (!profile.itemsSession) profile.itemsSession = []
									profile.itemsSession.push({
										itemID: received_item.itemID,
										amount: received_item.amount,
									})
								}
								received_items[index] = `**${received_item.displayEmoji}${received_item.name}** (${received_item.amount})`
								index++
							}
							if (settings.channels.itemsNotificationChannelId) {
								const channel = await guild.channels.fetch(settings.channels.itemsNotificationChannelId).catch(e => null)
								if (channel && channel.permissionsFor(guild.members.me).has("SendMessages")) {
									const embed2 = new EmbedBuilder()
										.setAuthor({ name: member.displayName, iconURL: member.displayAvatarURL() })
										.setDescription(`${client.language({ textId: "Нашел", guildId: guild.id })}:\n${received_items.join("\n")}`)
										.setColor("#2F3236")
									channel.send({ content: profile.itemMention ? `<@${member.user.id}>` : ` `, embeds: [embed2] }).catch(e => null)
								}
							}
						}	
					}
				}
				await profile.save()
            } else {
				profile.itemsSession = undefined
				profile.hoursSession = 0
				profile.xpSession = 0
				profile.currencySession = 0
				profile.startTime = undefined
				await profile.save()
			}
            delete client.globalCooldown[`${guild.id}_${profile.userID}`]
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