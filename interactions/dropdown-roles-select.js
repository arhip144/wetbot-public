module.exports = {
    name: `dropdown-roles-select`,
    run: async (client, interaction) => {
        const date = new Date()
        if (interaction.isStringSelectMenu()) {
            const profile = await client.functions.fetchProfile(client, interaction.user.id, interaction.guildId)
            if (profile.dropdownCooldowns?.get(interaction.message.id) > date.getTime()) {
                return interaction.reply({ content: `${client.language({ textId: "Выбор следующих ролей возможен", guildId: interaction.guildId, locale: interaction.locale })}: <t:${Math.floor(profile.dropdownCooldowns.get(interaction.message.id) / 1000)}:R>`, flags: ["Ephemeral"] })
            }
            let rolesToAdd = []
            let rolesToRemove = []
            const dropdownDB = await client.dropdownRoleSchema.findOne({ guildID: interaction.guildId, messageID: interaction.message.id }).lean()
            const totalPrice = {
                currency: 0,
                rp: 0,
            }
            await interaction.deferUpdate()
            for (const value of interaction.values) {
                const guildRole = await interaction.guild.roles.fetch(value).catch(() => null)
                if (guildRole) {
                    if (dropdownDB) {
                        const role = dropdownDB.roles[value]
                        if (role) {
                            if (dropdownDB.multi) {
                                if (interaction.member.roles.cache.has(value)) {
                                    interaction.followUp({ content: `${client.config.emojis.NO}**${client.language({ textId: `У тебя уже есть такая роль`, guildId: interaction.guildId, locale: interaction.locale })} <@&${value}>**`, flags: ["Ephemeral"] })
                                } else {
                                    if (!interaction.guild.members.me.permissions.has("ManageRoles") || guildRole.position > interaction.guild.members.me.roles.highest.position) {
                                        interaction.followUp({ content: `${client.config.emojis.NO}**${client.language({ textId: `У меня нет прав для добавления роли`, guildId: interaction.guildId, locale: interaction.locale })}** <@&${guildRole.id}>`, flags: ["Ephemeral"] })
                                    } else {
                                        if (!totalPrice[role.currency]) totalPrice[role.currency] = 0
                                        totalPrice[role.currency] += role.price
                                        rolesToAdd.push(value)    
                                    }
                                }
                            } else {
                                if (interaction.member.roles.cache.has(value)) {
                                    interaction.followUp({ content: `${client.config.emojis.NO}**${client.language({ textId: `У тебя уже есть такая роль`, guildId: interaction.guildId, locale: interaction.locale })} <@&${value}>**`, flags: ["Ephemeral"] })
                                } else {
                                    if (!interaction.guild.members.me.permissions.has("ManageRoles") || guildRole.position > interaction.guild.members.me.roles.highest.position) {
                                        interaction.followUp({ content: `${client.config.emojis.NO}**${client.language({ textId: `У меня нет прав для добавления роли`, guildId: interaction.guildId, locale: interaction.locale })}** <@&${guildRole.id}>`, flags: ["Ephemeral"] })
                                    } else {
                                        if (!totalPrice[role.currency]) totalPrice[role.currency] = 0
                                        totalPrice[role.currency] += role.price
                                        rolesToAdd.push(value)
                                        rolesToRemove.push(...interaction.message.components[0].components[0].options.map(e => e.value).filter(e => e !== value))    
                                    }
                                }
                            }
                        } else {
                            if (dropdownDB.multi) {
                                if (interaction.member.roles.cache.has(value)) {
                                    if (!interaction.guild.members.me.permissions.has("ManageRoles") || guildRole.position > interaction.guild.members.me.roles.highest.position) {
                                        interaction.followUp({ content: `${client.config.emojis.NO}**${client.language({ textId: `У меня нет прав для удаления роли`, guildId: interaction.guildId, locale: interaction.locale })}** <@&${guildRole.id}>`, flags: ["Ephemeral"] })
                                    } else {
                                        rolesToRemove.push(value)    
                                    }
                                }
                                else {
                                    if (!interaction.guild.members.me.permissions.has("ManageRoles") || guildRole.position > interaction.guild.members.me.roles.highest.position) {
                                        interaction.followUp({ content: `${client.config.emojis.NO}**${client.language({ textId: `У меня нет прав для добавления роли`, guildId: interaction.guildId, locale: interaction.locale })}** <@&${guildRole.id}>`, flags: ["Ephemeral"] })
                                    } else {
                                        rolesToAdd.push(value)    
                                    }
                                }
                            } else {
                                if (interaction.member.roles.cache.has(value)) {
                                    interaction.followUp({ content: `${client.config.emojis.NO}**${client.language({ textId: `У тебя уже есть такая роль`, guildId: interaction.guildId, locale: interaction.locale })} <@&${value}>**`, flags: ["Ephemeral"] })
                                } else {
                                    if (!interaction.guild.members.me.permissions.has("ManageRoles") || guildRole.position > interaction.guild.members.me.roles.highest.position) {
                                        interaction.followUp({ content: `${client.config.emojis.NO}**${client.language({ textId: `У меня нет прав для добавления роли`, guildId: interaction.guildId, locale: interaction.locale })}** <@&${guildRole.id}>`, flags: ["Ephemeral"] })
                                    } else {
                                        rolesToAdd.push(value)
                                        rolesToRemove.push(...interaction.message.components[0].components[0].options.map(e => e.value).filter(e => e !== value))    
                                    }
                                }
                            }
                        }
                    } else {
                        if (interaction.member.roles.cache.has(value)) {
                            if (!interaction.guild.members.me.permissions.has("ManageRoles") || guildRole.position > interaction.guild.members.me.roles.highest.position) {
                                interaction.followUp({ content: `${client.config.emojis.NO}**${client.language({ textId: `У меня нет прав для удаления роли`, guildId: interaction.guildId, locale: interaction.locale })}** <@&${guildRole.id}>`, flags: ["Ephemeral"] })
                            } else {
                                rolesToRemove.push(value)    
                            }
                        }
                        else {
                            if (!interaction.guild.members.me.permissions.has("ManageRoles") || guildRole.position > interaction.guild.members.me.roles.highest.position) {
                                interaction.followUp({ content: `${client.config.emojis.NO}**${client.language({ textId: `У меня нет прав для добавления роли`, guildId: interaction.guildId, locale: interaction.locale })}** <@&${guildRole.id}>`, flags: ["Ephemeral"] })
                            } else {
                                rolesToAdd.push(value)    
                            }
                        }
                    }
                } else {
                    interaction.followUp({ content: `${client.config.emojis.NO}**${client.language({ textId: `Этой роли больше не существует`, guildId: interaction.guildId, locale: interaction.locale })} (${value})**`, flags: ["Ephemeral"] })
                }
            }
            if (!dropdownDB.multi && !rolesToAdd.length) rolesToRemove = []
            let canBuy = true
            const totalPrice2 = {}
            for (const value in totalPrice) {
                if (totalPrice[value]) {
                    if (value === "currency") {
                        if (profile[value] - totalPrice[value] < 0) {
                            canBuy = false
                            totalPrice2[value] = totalPrice[value] - profile[value]
                        }
                    } else if (value === "rp") {
                        if (profile[value] - totalPrice[value] < -1000) {
                            canBuy = false
                            totalPrice2[value] = -1000 - (profile[value] - totalPrice[value])
                        }
                    } else {
                        const userItem = profile.inventory.find(e => e.itemID === value)
                        if (!userItem) {
                            canBuy = false
                            totalPrice2[value] = totalPrice[value]
                        } else if (userItem.amount - totalPrice[value] < 0) {
                            canBuy = false
                            totalPrice2[value] = totalPrice[value] - userItem.amount
                        }
                    }
                }
            }
            if (!canBuy) {
                const settings = client.cache.settings.get(interaction.guildId)
                const description = []
                for (const value in totalPrice2) {
                    if (value === "currency") {
                        description.push(`${settings.displayCurrencyEmoji}**${settings.currencyName}** (${totalPrice2[value].toLocaleString()})`)
                    } else
                    if (value === "rp") {
                        description.push(`${client.config.emojis.RP}**${client.language({ textId: `Репутация`, guildId: interaction.guildId, locale: interaction.locale })}** (${totalPrice2[value].toLocaleString()})`)
                    } else {
                        const item = client.cache.items.get(value)
                        description.push(`${item?.displayEmoji || ""}**${item?.name || value}** (${totalPrice2[value].toLocaleString()})`)
                    }
                }
                return interaction.followUp({ content: `${client.config.emojis.NO}${client.language({ textId: `Для выбранных ролей тебе не хватает`, guildId: interaction.guildId, locale: interaction.locale })}:\n${description.join("\n")}`, flags: ["Ephemeral"] })
            }
            for (const role of rolesToAdd) {
                await interaction.member.roles.add(role).catch(e => {
                    if (e.message.includes("Missing Permissions")) {
                        rolesToAdd = rolesToAdd.filter(rl => rl !== role)
                        if (!dropdownDB.multi) rolesToRemove = []
                        interaction.followUp({ content: `${client.config.emojis.NO}**${client.language({ textId: `У меня нет прав для добавления роли`, guildId: interaction.guildId, locale: interaction.locale })}** <@&${role}>`, flags: ["Ephemeral"] })
                    }
                })
            }
            for (const role of rolesToRemove) {
                if (interaction.member.roles.cache.has(role)) {
                    await interaction.member.roles.remove(role).catch(e => {
                        if (e.message.includes("Missing Permissions")) {
                            rolesToRemove = rolesToRemove.filter(rl => rl !== role)
                            interaction.followUp({ content: `${client.config.emojis.NO}**${client.language({ textId: `У меня нет прав для удаления роли`, guildId: interaction.guildId, locale: interaction.locale })}** <@&${role}>`, flags: ["Ephemeral"] })
                        }
                    })    
                } else rolesToRemove = rolesToRemove.filter(rl => rl !== role)
            }
            if (rolesToAdd.length || rolesToRemove.length) {
                if (dropdownDB?.cooldown) {
                    if (!profile.dropdownCooldowns) profile.dropdownCooldowns = new Map()
                    profile.dropdownCooldowns.set(interaction.message.id, date.getTime() + dropdownDB.cooldown * 1000)
                }
                for (const value in totalPrice) {
                    if (totalPrice[value]) {
                        if (value === "currency") {
                            await profile.subtractCurrency({ amount: totalPrice[value] })
                        } else if (value === "rp") {
                            await profile.subtractRp({ amount: totalPrice[value] })
                        } else {
                            await profile.subtractItem({ itemID: value, amount: totalPrice[value] })
                        }
                    }
                }
                await profile.save()
                return interaction.followUp({ content: `${rolesToAdd.length ? `${client.config.emojis.YES}**${client.language({ textId: `Добавлены роли`, guildId: interaction.guildId, locale: interaction.locale })}:** ${rolesToAdd.map(e => `<@&${e}>`).join(", ")}` : ``}\n${rolesToRemove.length ? `${client.config.emojis.YES}**${client.language({ textId: `Удалены роли`, guildId: interaction.guildId, locale: interaction.locale })}:** ${rolesToRemove.map(e => `<@&${e}>`).join(", ")}` : ``}`, flags: ["Ephemeral"] })
            }
        }
    }
}