const { EmbedBuilder, AttachmentBuilder, ActionRowBuilder, ButtonBuilder, StringSelectMenuBuilder, ButtonStyle, TextInputStyle, TextInputBuilder, ModalBuilder, InteractionType, Collection, LabelBuilder } = require("discord.js")
const UserRegexp = /usr{(.*?)}/
const TypeRegexp = /type{(.*?)}/
module.exports = {
    name: "rank-set",
    nameLocalizations: {
        "ru": `ранг-установить`,
        "uk": `ранг-встановити`,
        "es-ES": `establecer-rango`
    },
    description: `Set custom settings for rank card`,
    descriptionLocalizations: {
       "ru": `Установить свои свойства для карточки ранга`,
       "uk": `Встановити свої властивості для картки рангу`,
       "es-ES": `Establecer configuraciones personalizadas para la tarjeta de rango`
    },
    dmPermission: false,
    group: `profile-group`,
    cooldowns: new Collection(),
    run: async (client, interaction, args) => {
        if (UserRegexp.exec(interaction.customId) && interaction.user.id !== UserRegexp.exec(interaction.customId)[1]) return interaction.deferUpdate().catch(e => null)
        const flags = []
        if (interaction.isChatInputCommand() || interaction.customId?.includes("eph") || interaction.values?.[0].includes("eph")) flags.push("Ephemeral")
        if (interaction.isChatInputCommand() || interaction.customId?.includes("reply")) await interaction.deferReply({ flags })
        const settings = client.cache.settings.get(interaction.guildId)
        const { member } = interaction
        const profile = await client.functions.fetchProfile(client, member.user.id, interaction.guildId)
        let globalUser = await client.globalProfileSchema.findOne({ userID: member.user.id }).lean()
        let serverCard = false
        if (interaction.isStringSelectMenu()) {
            serverCard = interaction.values[0] === "serverCard"
        }
        else if (!interaction.isChatInputCommand()) {
            serverCard = TypeRegexp.exec(interaction.customId)?.[1] == "serverCard" ? true : false
        }
        const embed = new EmbedBuilder().setColor(3093046).setDescription(`${client.language({ textId: `RGBA цвет можно выбрать на этом сайте`, guildId: interaction.guildId, locale: interaction.locale })}: https://rgbacolorpicker.com/`)
        if (serverCard) {
            if (interaction.customId.includes("image")) {
                const modal = new ModalBuilder()
                    .setCustomId(`rankImage_${interaction.id}`)
                    .setTitle(`${client.language({ textId: `Фон`, guildId: interaction.guildId, locale: interaction.locale })}`)
                    .setLabelComponents([
                        new LabelBuilder()
                            .setLabel(`${client.language({ textId: `Прямая ссылка на фон`, guildId: interaction.guildId, locale: interaction.locale })}`)
                            .setTextInputComponent(
                                new TextInputBuilder()
                                    .setCustomId("link")
                                    .setRequired(false)
                                    .setStyle(TextInputStyle.Paragraph)
                                    .setPlaceholder(`${client.language({ textId: `Рекомендуется изображение 900x300`, guildId: interaction.guildId, locale: interaction.locale })}`)
                                    .setValue(`${settings.rank_card.background || " "}`)
                            ),
                        new LabelBuilder()
                            .setLabel(`${client.language({ textId: `Яркость`, guildId: interaction.guildId, locale: interaction.locale })}`)
                            .setTextInputComponent(
                                new TextInputBuilder()
                                    .setCustomId("brightness")
                                    .setRequired(true)
                                    .setStyle(TextInputStyle.Short)
                                    .setValue(`${settings.rank_card.background_brightness}`)
                                    .setPlaceholder(`0-200`)
                            ),
                        new LabelBuilder()
                            .setLabel(`${client.language({ textId: `Размытие`, guildId: interaction.guildId, locale: interaction.locale })}`)
                            .setTextInputComponent(
                                new TextInputBuilder()
                                    .setRequired(true)
                                    .setStyle(TextInputStyle.Short)
                                    .setValue(`${settings.rank_card.background_blur}`)
                                    .setPlaceholder(`0-100`)
                            )
                    ])
                await interaction.showModal(modal);delete client.globalCooldown[`${interaction.guildId}_${interaction.user.id}`]
                const filter = (i) => i.customId === `rankImage_${interaction.id}` && i.user.id === interaction.user.id
                interaction = await interaction.awaitModalSubmit({ filter, time: 180000 }).catch(e => interaction)
                if (interaction && interaction.type === InteractionType.ModalSubmit) {
                    let boolean = true
                    const modalArgs = {}
                    for (const c of interaction.fields.fields) {
                        if (c.customId !== "link") {
                            if (isNaN(+c.value) || !Number.isInteger(+c.value)) {
                                boolean = false
                                if (!interaction.deferred) await interaction.deferUpdate().catch(e => null)
                                interaction.followUp({ content: `**${c.value}** ${client.language({ textId: `не является целым числом`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
                            }
                            c.value = +c.value
                            if (c.value < 0) modalArgs[c.customId] = 0
                            else if (c.customId === "brightness" && c.value > 200) modalArgs[c.customId] = 200
                            else if (c.customId === "blur" && c.value > 100) modalArgs[c.customId] = 100
                            else modalArgs[c.customId] = c.value 
                        } else modalArgs[c.customId] = c.value
                    }
                    if (modalArgs.link) {
                        const isImageURL = require('image-url-validator').default
                        const image = await isImageURL(modalArgs.link)
                        if (!image) {
                            if (interaction.deferred) await interaction.deferUpdate().catch(e => null)
                            return interaction.followUp({ content: `${client.language({ textId: `Ошибка: ссылка не является прямой ссылкой на фон`, guildId: interaction.guildId, locale: interaction.locale })}\n${client.language({ textId: `Пример ссылки`, guildId: interaction.guildId, locale: interaction.locale })}: **https://cdn.discordapp.com/attachments/964635142889021500/978733897204531260/IMG_0608.jpg**`, flags: ["Ephemeral"] })
                        } else settings.rank_card.background = modalArgs.link    
                    } else settings.rank_card.background = null
                    if (!boolean) return
                    settings.rank_card.background_brightness = modalArgs.brightness
                    settings.rank_card.background_blur = modalArgs.blur
                    await settings.save().catch(e => null)
                    await interaction.deferUpdate().catch(e => null)
                } else return 
            }
            if (interaction.customId.includes("font")) {
                const modal = new ModalBuilder()
                    .setCustomId(`rankFont_${interaction.id}`)
                    .setTitle(`${client.language({ textId: `Цвет шрифта (RGBA)`, guildId: interaction.guildId, locale: interaction.locale })}`)
                    .setLabelComponents([
                        new LabelBuilder()
                            .setLabel(`${client.language({ textId: `Красный цвет (R)`, guildId: interaction.guildId, locale: interaction.locale })}`)
                            .setTextInputComponent(
                                new TextInputBuilder()
                                    .setCustomId("red")
                                    .setRequired(true)
                                    .setStyle(TextInputStyle.Short)
                                    .setValue(`${settings.rank_card.font_color.r}`)
                                    .setPlaceholder(`0-255`)
                            ),
                        new LabelBuilder()
                            .setLabel(`${client.language({ textId: `Зеленый цвет (G)`, guildId: interaction.guildId, locale: interaction.locale })}`)
                            .setTextInputComponent(
                                new TextInputBuilder()
                                    .setCustomId("green")
                                    .setRequired(true)
                                    .setStyle(TextInputStyle.Short)
                                    .setValue(`${settings.rank_card.font_color.g}`)
                                    .setPlaceholder(`0-255`)
                            ),
                        new LabelBuilder()
                            .setLabel(`${client.language({ textId: `Голубой цвет (B)`, guildId: interaction.guildId, locale: interaction.locale })}`)
                            .setTextInputComponent(
                                new TextInputBuilder()
                                    .setCustomId("blue")
                                    .setRequired(true)
                                    .setStyle(TextInputStyle.Short)
                                    .setValue(`${settings.rank_card.font_color.b}`)
                                    .setPlaceholder(`0-255`)
                            ),
                        new LabelBuilder()
                            .setLabel(`${client.language({ textId: `Непрозрачность (A)`, guildId: interaction.guildId, locale: interaction.locale })}`)
                            .setTextInputComponent(
                                new TextInputBuilder()
                                    .setCustomId("alpha")
                                    .setRequired(true)
                                    .setStyle(TextInputStyle.Short)
                                    .setValue(`${settings.rank_card.font_color.a * 100}`)
                                    .setPlaceholder(`0-100`)
                            )
                    ])
                await interaction.showModal(modal);delete client.globalCooldown[`${interaction.guildId}_${interaction.user.id}`]
                const filter = (i) => i.customId === `rankFont_${interaction.id}` && i.user.id === interaction.user.id
                interaction = await interaction.awaitModalSubmit({ filter, time: 180000 }).catch(e => interaction)
                if (interaction && interaction.type === InteractionType.ModalSubmit) {
                    let boolean = true
                    const modalArgs = {}
                    for (const c of interaction.fields.fields) {
                        if (isNaN(+c.value) || !Number.isInteger(+c.value)) {
                            boolean = false
                            if (!interaction.deferred) await interaction.deferUpdate().catch(e => null)
                            interaction.followUp({ content: `**${c.value}** ${client.language({ textId: `не является целым числом`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
                        }
                        c.value = +c.value
                        if (c.value < 0) modalArgs[c.customId] = 0
                        else if (c.customId === "alpha" && c.value > 100) modalArgs[c.customId] = 100
                        else if (c.customId !== "alpha" && c.value > 255) modalArgs[c.customId] = 255
                        else modalArgs[c.customId] = c.value
                    }
                    if (!boolean) return
                    settings.rank_card.font_color.r = modalArgs.red
                    settings.rank_card.font_color.g = modalArgs.green
                    settings.rank_card.font_color.b = modalArgs.blue
                    settings.rank_card.font_color.a = modalArgs.alpha !== null ? modalArgs.alpha / 100 : modalArgs.alpha
                    await settings.save().catch(e => null)
                    await interaction.deferUpdate().catch(e => null)
                } else return  
            }
            if (interaction.customId.includes("xpforeground")) {
                const modal = new ModalBuilder()
                    .setCustomId(`rankxpforeground_${interaction.id}`)
                    .setTitle(`${client.language({ textId: `Цвет линии опыта (RGBA)`, guildId: interaction.guildId, locale: interaction.locale })}`)
                    .setLabelComponents([
                        new LabelBuilder()
                            .setLabel(`${client.language({ textId: `Красный цвет (R)`, guildId: interaction.guildId, locale: interaction.locale })}`)
                            .setTextInputComponent(
                                new TextInputBuilder()
                                    .setCustomId("red")
                                    .setRequired(true)
                                    .setStyle(TextInputStyle.Short)
                                    .setValue(`${settings.rank_card.xp_color.r}`)
                                    .setPlaceholder(`0-255`)
                            ),
                        new LabelBuilder()
                            .setLabel(`${client.language({ textId: `Зеленый цвет (G)`, guildId: interaction.guildId, locale: interaction.locale })}`)
                            .setTextInputComponent(
                                new TextInputBuilder()
                                    .setCustomId("green")
                                    .setRequired(true)
                                    .setStyle(TextInputStyle.Short)
                                    .setValue(`${settings.rank_card.xp_color.g}`)
                                    .setPlaceholder(`0-255`)
                            ),
                        new LabelBuilder()
                            .setLabel(`${client.language({ textId: `Голубой цвет (B)`, guildId: interaction.guildId, locale: interaction.locale })}`)
                            .setTextInputComponent(
                                new TextInputBuilder()
                                    .setCustomId("blue")
                                    .setRequired(true)
                                    .setStyle(TextInputStyle.Short)
                                    .setValue(`${settings.rank_card.xp_color.b}`)
                                    .setPlaceholder(`0-255`)
                            ),
                        new LabelBuilder()
                            .setLabel(`${client.language({ textId: `Непрозрачность (A)`, guildId: interaction.guildId, locale: interaction.locale })}`)
                            .setTextInputComponent(
                                new TextInputBuilder()
                                    .setCustomId("alpha")
                                    .setRequired(true)
                                    .setStyle(TextInputStyle.Short)
                                    .setValue(`${settings.rank_card.xp_color.a * 100}`)
                                    .setPlaceholder(`0-100`)
                            )
                    ])
                await interaction.showModal(modal);delete client.globalCooldown[`${interaction.guildId}_${interaction.user.id}`]
                const filter = (i) => i.customId === `rankxpforeground_${interaction.id}` && i.user.id === interaction.user.id
                interaction = await interaction.awaitModalSubmit({ filter, time: 180000 }).catch(e => interaction)
                if (interaction && interaction.type === InteractionType.ModalSubmit) {
                    let boolean = true
                    const modalArgs = {}
                    for (const c of interaction.fields.fields) {
                        if (isNaN(+c.value) || !Number.isInteger(+c.value)) {
                            boolean = false
                            if (!interaction.deferred) await interaction.deferUpdate().catch(e => null)
                            interaction.followUp({ content: `**${c.value}** ${client.language({ textId: `не является целым числом`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
                        }
                        c.value = +c.value
                        if (c.value < 0) modalArgs[c.customId] = 0
                        else if (c.customId === "alpha" && c.value > 100) modalArgs[c.customId] = 100
                        else if (c.customId !== "alpha" && c.value > 255) modalArgs[c.customId] = 255
                        else modalArgs[c.customId] = c.value
                    }
                    if (!boolean) return
                    settings.rank_card.xp_color.r = modalArgs.red
                    settings.rank_card.xp_color.g = modalArgs.green
                    settings.rank_card.xp_color.b = modalArgs.blue
                    settings.rank_card.xp_color.a = modalArgs.alpha !== null ? modalArgs.alpha / 100 : modalArgs.alpha
                    await settings.save().catch(e => null)
                    await interaction.deferUpdate().catch(e => null)
                } else return 
            }
            if (interaction.customId.includes("xpbackground")) {
                const modal = new ModalBuilder()
                    .setCustomId(`rankxpbackground_${interaction.id}`)
                    .setTitle(`${client.language({ textId: `Цвет фона линии опыта (RGBA)`, guildId: interaction.guildId, locale: interaction.locale })}`)
                    .setLabelComponents([
                        new LabelBuilder()
                            .setLabel(`${client.language({ textId: `Красный цвет (R)`, guildId: interaction.guildId, locale: interaction.locale })}`)
                            .setTextInputComponent(
                                new TextInputBuilder()
                                    .setCustomId("red")
                                    .setRequired(true)
                                    .setStyle(TextInputStyle.Short)
                                    .setValue(`${settings.rank_card.xp_background_color.r}`)
                                    .setPlaceholder(`0-255`)
                            ),
                        new LabelBuilder()
                            .setLabel(`${client.language({ textId: `Зеленый цвет (G)`, guildId: interaction.guildId, locale: interaction.locale })}`)
                            .setTextInputComponent(
                                new TextInputBuilder()
                                    .setCustomId("green")
                                    .setRequired(true)
                                    .setStyle(TextInputStyle.Short)
                                    .setValue(`${settings.rank_card.xp_background_color.g}`)
                                    .setPlaceholder(`0-255`)
                            ),
                        new LabelBuilder()
                            .setLabel(`${client.language({ textId: `Голубой цвет (B)`, guildId: interaction.guildId, locale: interaction.locale })}`)
                            .setTextInputComponent(
                                new TextInputBuilder()
                                    .setCustomId("blue")
                                    .setRequired(true)
                                    .setStyle(TextInputStyle.Short)
                                    .setValue(`${settings.rank_card.xp_background_color.b}`)
                                    .setPlaceholder(`0-255`)
                            ),
                        new LabelBuilder()
                            .setLabel(`${client.language({ textId: `Непрозрачность (A)`, guildId: interaction.guildId, locale: interaction.locale })}`)
                            .setTextInputComponent(
                                new TextInputBuilder()
                                    .setCustomId("alpha")
                                    .setRequired(true)
                                    .setStyle(TextInputStyle.Short)
                                    .setValue(`${settings.rank_card.xp_background_color.a * 100}`)
                                    .setPlaceholder(`0-100`)
                            )
                    ])
                await interaction.showModal(modal);delete client.globalCooldown[`${interaction.guildId}_${interaction.user.id}`]
                const filter = (i) => i.customId === `rankxpbackground_${interaction.id}` && i.user.id === interaction.user.id
                interaction = await interaction.awaitModalSubmit({ filter, time: 180000 }).catch(e => interaction)
                if (interaction && interaction.type === InteractionType.ModalSubmit) {
                    let boolean = true
                    const modalArgs = {}
                    for (const c of interaction.fields.fields) {
                        if (isNaN(+c.value) || !Number.isInteger(+c.value)) {
                            boolean = false
                            if (!interaction.deferred) await interaction.deferUpdate().catch(e => null)
                            interaction.followUp({ content: `**${c.value}** ${client.language({ textId: `не является целым числом`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
                        }
                        c.value = +c.value
                        if (c.value < 0) modalArgs[c.customId] = 0
                        else if (c.customId === "alpha" && c.value > 100) modalArgs[c.customId] = 100
                        else if (c.customId !== "alpha" && c.value > 255) modalArgs[c.customId] = 255
                        else modalArgs[c.customId] = c.value
                    }
                    if (!boolean) return
                    settings.rank_card.xp_background_color.r = modalArgs.red
                    settings.rank_card.xp_background_color.g = modalArgs.green
                    settings.rank_card.xp_background_color.b = modalArgs.blue
                    settings.rank_card.xp_background_color.a = modalArgs.alpha !== null ? modalArgs.alpha / 100 : modalArgs.alpha
                    await settings.save().catch(e => null)
                    await interaction.deferUpdate().catch(e => null)
                } else return 
            }
            if (interaction.customId.includes("default")) {
                if (!interaction.deferred) await interaction.update({ content: interaction.message.content || " ", embeds: interaction.message.embeds, components: [new ActionRowBuilder().addComponents(new ButtonBuilder().setEmoji("⏳").setStyle(ButtonStyle.Secondary).setCustomId(`0`).setDisabled(true))]})
                else await interaction.editReply({ content: interaction.message.content || " ", embeds: interaction.message.embeds, components: [new ActionRowBuilder().addComponents(new ButtonBuilder().setEmoji("⏳").setStyle(ButtonStyle.Secondary).setCustomId(`0`).setDisabled(true))]})
                settings.rank_card.xp_background_color.r = 85
                settings.rank_card.xp_background_color.g = 118
                settings.rank_card.xp_background_color.b = 255
                settings.rank_card.xp_background_color.a = 0.3

                settings.rank_card.xp_color.r = 85
                settings.rank_card.xp_color.g = 118
                settings.rank_card.xp_color.b = 255
                settings.rank_card.xp_color.a = 0.8


                settings.rank_card.font_color.r = 255
                settings.rank_card.font_color.g = 255
                settings.rank_card.font_color.b = 255
                settings.rank_card.font_color.a = 1

                settings.rank_card.background = null
                settings.background_brightness = 100
                settings.background_blur = 0

                await settings.save().catch(e => null)
            }
            const 
            fontColor = `rgba(${settings.rank_card.font_color.r}, ${settings.rank_card.font_color.g}, ${settings.rank_card.font_color.b}, ${settings.rank_card.font_color.a})`,
            backgroundColor = `rgba(${settings.rank_card.xp_background_color.r}, ${settings.rank_card.xp_background_color.g}, ${settings.rank_card.xp_background_color.b}, ${settings.rank_card.xp_background_color.a})`,
            xpColor = `rgba(${settings.rank_card.xp_color.r}, ${settings.rank_card.xp_color.g}, ${settings.rank_card.xp_color.b}, ${settings.rank_card.xp_color.a})`
            const default_fontColor = "rgba(255, 255, 255, 1)"
            const { Canvas, loadImage, FontLibrary } = require('skia-canvas')
            FontLibrary.use("All fonts", [
                "./GamestationCondensed.otf",
              ])
            const fillMixedText = (ctx, args, x, y, maxWidth) => {
                ctx.save()
                args.forEach(({ text, fillStyle, font, fontSize, align }) => {
                    let i = 0
                    do {
                        fontSize--
                        ctx.font = `${fontSize}px ${font}`
                        i++
                        if (i > 100000) throw new Error(`Бесконечный цикл: rank-set:346, maxWidth: ${maxWidth}, args.map(e => e.text).join(""): ${args.map(e => e.text).join("")}`)
                    } while (context.measureText(args.map(e => e.text).join("")).width > maxWidth)
                    ctx.textAlign = align
                    ctx.fillStyle = fillStyle
                    ctx.fillText(text, x, y)
                    if (align === "right") x -= ctx.measureText(text).width
                    else x += ctx.measureText(text).width
                })
                ctx.restore()
            }
            function drawImageProp(ctx, img, x, y, w, h, offsetX, offsetY) {

                if (arguments.length === 2) {
                    x = y = 0
                    w = ctx.canvas.width
                    h = ctx.canvas.height
                }
            
                // default offset is center
                offsetX = typeof offsetX === "number" ? offsetX : 0.5
                offsetY = typeof offsetY === "number" ? offsetY : 0.5
            
                // keep bounds [0.0, 1.0]
                if (offsetX < 0) offsetX = 0
                if (offsetY < 0) offsetY = 0
                if (offsetX > 1) offsetX = 1
                if (offsetY > 1) offsetY = 1
            
                let iw = img.width,
                    ih = img.height,
                    r = Math.min(w / iw, h / ih),
                    nw = iw * r,   // new prop. width
                    nh = ih * r,   // new prop. height
                    cx, cy, cw, ch, ar = 1
            
                // decide which gap to fill    
                if (nw < w) ar = w / nw                             
                if (Math.abs(ar - 1) < 1e-14 && nh < h) ar = h / nh  // updated
                nw *= ar
                nh *= ar
            
                // calc source rectangle
                cw = iw / (nw / w)
                ch = ih / (nh / h)
            
                cx = (iw - cw) * offsetX
                cy = (ih - ch) * offsetY
            
                // make sure source rectangle is valid
                if (cx < 0) cx = 0
                if (cy < 0) cy = 0
                if (cw > iw) cw = iw
                if (ch > ih) ch = ih
            
                // fill image in dest. rectangle
                ctx.drawImage(img, cx, cy, cw, ch,  x, y, w, h)
            }
            const canvas = new Canvas(900, 300)
            const context = canvas.getContext("2d")
            //Background
            const imgBackGround = await loadImage(settings.rank_card.background || './cover_card.png').catch(async e => await loadImage('./cover_card.png'))
            const canvasBackground = new Canvas(900, 300)
            const contextBackground = canvasBackground.getContext("2d")
            contextBackground.fillStyle = "#000"
            contextBackground.fillRect(0, 0, 900, 300)
            contextBackground.filter = `brightness(${settings.rank_card.background_brightness}%) blur(${settings.rank_card.background_blur/10}px)`
            drawImageProp(contextBackground, imgBackGround, 0, 0, 900, 300)
            context.drawImage(canvasBackground, 0, 0, 900, 300)
            //Avatar
            const imgAvatar = await loadImage(member.user.displayAvatarURL({ extension: "png" }))
            const canvasAvatar = new Canvas(175, 175)
            const contextAvatar = canvasAvatar.getContext('2d')
            contextAvatar.beginPath()
            contextAvatar.arc(175/2, 175/2, 175/2, 0, Math.PI * 2, true)
            contextAvatar.closePath()
            contextAvatar.clip()
            contextAvatar.drawImage(imgAvatar, 0, 0, 175, 175)
            context.drawImage(canvasAvatar, 28, 63, 175, 175)
            //EXP LINE
                //BACKGROUND
            context.beginPath()
            context.strokeStyle = backgroundColor
            context.moveTo(246.84, 224)
            context.lineTo(834.75, 224)
            context.lineWidth = 41
            context.lineCap = "round"
            context.stroke()
                //FRONTGROUND
            context.beginPath()
            context.strokeStyle = xpColor
            context.moveTo(246.84, 224)
            const length = 834.75 - 246.84
            const ratio = profile.xp / (profile.level * settings.levelfactor + 100)
            context.lineTo(ratio > 1 ? length * 1 : length * ratio + 246.84, 224)
            context.lineWidth = 41
            context.lineCap = "round"
            context.stroke()
            //EXP
            context.font = `30px All fonts`
            context.textAlign = "right"
            const title = `${Math.floor(profile.xp)}/${profile.level * settings.levelfactor + 100} XP (${Math.floor(Math.floor(profile.xp) / (profile.level * settings.levelfactor + 100) * 100)}%)`
            context.fillStyle = fontColor
            context.fillText(title, 840, 283)
            //RANK LEVEL
            const profiles = client.cache.profiles.filter(e => e.guildID === interaction.guildId).map(e => e).sort((a, b) => b.totalxp - a.totalxp)
            let arguments = [
                { text: `${client.language({ textId: `ранг`, guildId: interaction.guildId, locale: interaction.locale })} `, fillStyle: fontColor, font: "All fonts", fontSize: 20, align: "left" },
                { text: `#${profiles.findIndex(e => e.userID === profile.userID)+1}`, fillStyle: fontColor, font: "All fonts", fontSize: 80, align: "left" },
                { text: ` ${client.language({ textId: `УР`, guildId: interaction.guildId, locale: interaction.locale })}. `, fillStyle: fontColor, font: "All fonts", fontSize: 20, align: "left" },
                { text: profile.level, fillStyle: fontColor, font: "All fonts", fontSize: 80, align: "left" },
            ]
            fillMixedText(context, arguments, 246.84, 190, 300)
            //USERNAME
            arguments = [
                { text: member.displayName, fillStyle: fontColor, font: "All fonts", fontSize: 50, align: "left" },
            ]
            fillMixedText(context, arguments, 246.84, 80, 516)
            //STATS
            arguments = [
                { text: Math.floor(profile.currency), fillStyle: fontColor, font: "All fonts", fontSize: 30, align: "right" },
                { text: `🪙`, fillStyle: fontColor, font: "All fonts", fontSize: 30, align: "right" },
                { text: profile.likes, fillStyle: fontColor, font: "All fonts", fontSize: 30, align: "right" },
                { text: `❤️`, fillStyle: fontColor, font: "All fonts", fontSize: 30, align: "right" },
                { text: profile.messages, fillStyle: fontColor, font: "All fonts", fontSize: 30, align: "right" },
                { text: `✉️`, fillStyle: fontColor, font: "All fonts", fontSize: 30, align: "right" },
                { text: Math.ceil(profile.hours), fillStyle: fontColor, font: "All fonts", fontSize: 30, align: "right" },
                { text: `🎙️`, fillStyle: fontColor, font: "All fonts", fontSize: 30, align: "right" },
            ]
            fillMixedText(context, arguments, 834.75, 190, 350)
            const buffer = await canvas.toBuffer(`png`)
            const attachment = new AttachmentBuilder().setFile(buffer).setName(`${member.user.id}.png`)
            embed.setImage(`attachment://${attachment.name}`)
            embed.setFooter({ text: `${client.language({ textId: `Так выглядит карточка ранга сервера`, guildId: interaction.guildId, locale: interaction.locale })}` })
            embed.setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL() })
            embed.setTitle(`${client.language({ textId: `Карточка ранга`, guildId: interaction.guildId, locale: interaction.locale })}`)
            embed.setFields([
                {
                    name: `${client.language({ textId: `Фон`, guildId: interaction.guildId, locale: interaction.locale })}`,
                    value: settings.rank_card.background ? `${client.language({ textId: `Фон`, guildId: interaction.guildId, locale: interaction.locale })}: ${settings.rank_card.background}\n${client.language({ textId: `Яркость`, guildId: interaction.guildId, locale: interaction.locale })}: ${settings.rank_card.background_brightness}\n${client.language({ textId: `Размытие`, guildId: interaction.guildId, locale: interaction.locale })}: ${settings.rank_card.background_blur}` : `${client.language({ textId: `Фон`, guildId: interaction.guildId, locale: interaction.locale })}: [${client.language({ textId: `стандарт`, guildId: interaction.guildId, locale: interaction.locale })}]\n${client.language({ textId: `Яркость`, guildId: interaction.guildId, locale: interaction.locale })}: ${settings.rank_card.background_brightness}\n${client.language({ textId: `Размытие`, guildId: interaction.guildId, locale: interaction.locale })}: ${settings.rank_card.background_blur}`,
                    inline: true
                },
                {
                    name: `${client.language({ textId: `Цвет шрифта`, guildId: interaction.guildId, locale: interaction.locale })}`,
                    value: fontColor,
                    inline: true
                },
                {
                    name: `${client.language({ textId: `Цвет линии опыта`, guildId: interaction.guildId, locale: interaction.locale })}`,
                    value: xpColor,
                    inline: true
                },
                {
                    name: `${client.language({ textId: `Цвет фона линии опыта`, guildId: interaction.guildId, locale: interaction.locale })}`,
                    value: backgroundColor,
                    inline: true
                },
            ])
            const selectMenu = new StringSelectMenuBuilder().setCustomId(`usr{${interaction.user.id}}cmd{rank-set}`).setOptions([
                {
                    label: `${client.language({ textId: `Карточка`, guildId: interaction.guildId, locale: interaction.locale })} ${member.displayName}`.slice(0, 100),
                    emoji: `👤`,
                    value: `userCard`,
                    default: !serverCard
                }
            ])
            if (member.permissions.has("Administrator")) {
                selectMenu.addOptions([
                    {
                        label: `${client.language({ textId: `Карточка`, guildId: interaction.guildId, locale: interaction.locale })} ${interaction.guild.name}`.slice(0, 100),
                        emoji: `🖥️`,
                        value: `serverCard`,
                        default: serverCard
                    },
                ])
            }
            const buttonFont = new ButtonBuilder().setCustomId(`usr{${interaction.user.id}}cmd{rank-set}type{serverCard}font`).setStyle(ButtonStyle.Primary).setLabel(`${client.language({ textId: `Цвет шрифта`, guildId: interaction.guildId, locale: interaction.locale })}`)
            const buttonXp = new ButtonBuilder().setCustomId(`usr{${interaction.user.id}}cmd{rank-set}type{serverCard}xpforeground`).setStyle(ButtonStyle.Primary).setLabel(`${client.language({ textId: `Цвет линии опыта`, guildId: interaction.guildId, locale: interaction.locale })}`)
            const buttonXpBackground = new ButtonBuilder().setCustomId(`usr{${interaction.user.id}}cmd{rank-set}type{serverCard}xpbackground`).setStyle(ButtonStyle.Primary).setLabel(`${client.language({ textId: `Цвет фона линии опыта`, guildId: interaction.guildId, locale: interaction.locale })}`)
            const buttonImage = new ButtonBuilder().setCustomId(`usr{${interaction.user.id}}cmd{rank-set}type{serverCard}image`).setStyle(ButtonStyle.Primary).setLabel(`${client.language({ textId: `Фон`, guildId: interaction.guildId, locale: interaction.locale })}`)
            const buttonDefault = new ButtonBuilder().setCustomId(`usr{${interaction.user.id}}cmd{rank-set}type{serverCard}default`).setStyle(ButtonStyle.Danger).setLabel(`${client.language({ textId: `По умолчанию`, guildId: interaction.guildId, locale: interaction.locale })}`).setDisabled(
                settings.rank_card.xp_background_color.r === 85
                && settings.rank_card.xp_background_color.g === 118
                && settings.rank_card.xp_background_color.b === 255
                && settings.rank_card.xp_background_color.a === 0.3

                && settings.rank_card.xp_color.r === 85
                && settings.rank_card.xp_color.g === 118
                && settings.rank_card.xp_color.b === 255
                && settings.rank_card.xp_color.a === 0.8

                && settings.rank_card.font_color.r === 255
                && settings.rank_card.font_color.g === 255
                && settings.rank_card.font_color.b === 255
                && settings.rank_card.font_color.a === 1

                && settings.rank_card.background === null
                && settings.rank_card.background_brightness === 100
                && settings.rank_card.background_brightness === 0)
            const firstRow = new ActionRowBuilder().addComponents(selectMenu)
            const secondRow = new ActionRowBuilder().addComponents(buttonFont, buttonXp, buttonXpBackground, buttonImage, buttonDefault)
            if (interaction.replied || interaction.deferred) return interaction.editReply({ 
                embeds: [embed],
                components: [firstRow, secondRow],
                files: [attachment]
            })
            else return interaction.update({ 
                embeds: [embed],
                components: [firstRow, secondRow],
                files: [attachment]
            })
        }
        if (!serverCard) {
            if (!interaction.isChatInputCommand()) {
                if (interaction.customId.includes("image")) {
                    const modal = new ModalBuilder()
                        .setCustomId(`rankImage_${interaction.id}`)
                        .setTitle(`${client.language({ textId: `Фон`, guildId: interaction.guildId, locale: interaction.locale })}`)
                        .setLabelComponents([
                            new LabelBuilder()
                                .setLabel(`${client.language({ textId: `Прямая ссылка на фон`, guildId: interaction.guildId, locale: interaction.locale })}`)
                                .setTextInputComponent(
                                    new TextInputBuilder()
                                        .setCustomId("link")
                                        .setRequired(false)
                                        .setValue(`${profile.rank_card?.background || ""}`)
                                        .setPlaceholder(`${client.language({ textId: `Рекомендуется изображение 900x300`, guildId: interaction.guildId, locale: interaction.locale })}`)
                                        .setStyle(TextInputStyle.Paragraph)
                                ),
                            new LabelBuilder()
                                .setLabel(`${client.language({ textId: `Яркость`, guildId: interaction.guildId, locale: interaction.locale })}`)
                                .setTextInputComponent(
                                    new TextInputBuilder()
                                        .setCustomId("brightness")
                                        .setRequired(false)
                                        .setStyle(TextInputStyle.Short)
                                        .setValue(`${profile.rank_card?.background_brightness !== undefined ? profile.rank_card.background_brightness : ""}`)
                                        .setPlaceholder(`0-200`)
                                ),
                            new LabelBuilder()
                                .setLabel(`${client.language({ textId: `Размытие`, guildId: interaction.guildId, locale: interaction.locale })}`)
                                .setTextInputComponent(
                                    new TextInputBuilder()
                                        .setCustomId("blur")
                                        .setRequired(false)
                                        .setStyle(TextInputStyle.Short)
                                        .setValue(`${profile.rank_card?.background_blur !== undefined ? profile.rank_card.background_blur : ""}`)
                                        .setPlaceholder(`0-100`)
                                )
                        ])
                    await interaction.showModal(modal);delete client.globalCooldown[`${interaction.guildId}_${interaction.user.id}`]
                    const filter = (i) => i.customId === `rankImage_${interaction.id}` && i.user.id === interaction.user.id
                    interaction = await interaction.awaitModalSubmit({ filter, time: 180000 }).catch(e => null)
                    if (interaction) {
                        let boolean = true
                        const modalArgs = {}
                        for (const field of interaction.fields.fields) {
                            if (field.customId !== "link") {
                                if (field.value && (isNaN(+field.value) || !Number.isInteger(+field.value))) {
                                    boolean = false
                                    if (!interaction.deferred) await interaction.deferUpdate().catch(e => null)
                                    interaction.followUp({ content: `**${field.value}** ${client.language({ textId: `не является целым числом`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
                                }
                                if (field.value !== "") field.value = +field.value
                                else field.value = undefined
                                if (!field.value && field.value !== 0) modalArgs[field.customId] = undefined
                                else if (field.value < 0) modalArgs[field.customId] = 0
                                else if (field.customId === "brightness" && field.value > 200) modalArgs[field.customId] = 200
                                else if (field.customId === "blur" && field.value > 100) modalArgs[field.customId] = 100
                                else modalArgs[field.customId] = field.value
                            } else modalArgs[field.customId] = field.value
                        }
                        if (!modalArgs.link && profile.rank_card) {
                            profile.rank_card.background = undefined
                        } else {
                            const isImageURL = require('image-url-validator').default
                            const image = await isImageURL(modalArgs.link)
                            if (!image) {
                                boolean = false
                                if (!interaction.deferred) await interaction.deferUpdate()
                                return interaction.followUp({ content: `${client.language({ textId: `Ошибка: ссылка не является прямой ссылкой на фон`, guildId: interaction.guildId, locale: interaction.locale })}\n${client.language({ textId: `Пример ссылки`, guildId: interaction.guildId, locale: interaction.locale })}: **https://cdn.discordapp.com/attachments/964635142889021500/978733897204531260/IMG_0608.jpg**`, flags: ["Ephemeral"] })
                            } else {
                                if (!profile.rank_card) profile.rank_card = {}
                                profile.rank_card.background = modalArgs.link
                            }
                        }
                        if (!boolean) return
                        if (!profile.rank_card) profile.rank_card = {}
                        profile.rank_card.background_brightness = modalArgs.brightness !== undefined ? modalArgs.brightness : undefined
                        profile.rank_card.background_blur = modalArgs.blur
                        await interaction.deferUpdate().catch(e => null)
                    } else return 
                }
                if (interaction.customId.includes("font")) {
                    const modal = new ModalBuilder()
                        .setCustomId(`rankFont_${interaction.id}`)
                        .setTitle(`${client.language({ textId: `Цвет шрифта (RGBA)`, guildId: interaction.guildId, locale: interaction.locale })}`)
                        .setLabelComponents([
                            new LabelBuilder()
                                .setLabel(`${client.language({ textId: `Красный цвет (R)`, guildId: interaction.guildId, locale: interaction.locale })}`)
                                .setTextInputComponent(
                                    new TextInputBuilder()
                                        .setCustomId("red")
                                        .setRequired(false)
                                        .setStyle(TextInputStyle.Short)
                                        .setValue(`${profile.rank_card?.font_color?.r !== undefined ? profile.rank_card.font_color.r : ""}`)
                                        .setPlaceholder(`0-255`)
                                ),
                            new LabelBuilder()
                                .setLabel(`${client.language({ textId: `Зеленый цвет (G)`, guildId: interaction.guildId, locale: interaction.locale })}`)
                                .setTextInputComponent(
                                    new TextInputBuilder()
                                        .setCustomId("green")
                                        .setRequired(false)
                                        .setStyle(TextInputStyle.Short)
                                        .setValue(`${profile.rank_card?.font_color?.g !== undefined ? profile.rank_card.font_color.g : ""}`)
                                        .setPlaceholder(`0-255`)
                                ),
                            new LabelBuilder()
                                .setLabel(`${client.language({ textId: `Голубой цвет (B)`, guildId: interaction.guildId, locale: interaction.locale })}`)
                                .setTextInputComponent(
                                    new TextInputBuilder()
                                        .setCustomId("blue")
                                        .setRequired(false)
                                        .setStyle(TextInputStyle.Short)
                                        .setValue(`${profile.rank_card?.font_color?.b !== undefined ? profile.rank_card.font_color.b : ""}`)
                                        .setPlaceholder(`0-255`)
                                ),
                            new LabelBuilder()
                                .setLabel(`${client.language({ textId: `Непрозрачность (A)`, guildId: interaction.guildId, locale: interaction.locale })}`)
                                .setTextInputComponent(
                                    new TextInputBuilder()
                                        .setCustomId("alpha")
                                        .setRequired(false)
                                        .setStyle(TextInputStyle.Short)
                                        .setValue(`${profile.rank_card?.font_color?.a !== undefined ? profile.rank_card.font_color.a*100 : ""}`)
                                        .setPlaceholder(`0-100`)
                                )
                        ])
                    await interaction.showModal(modal);delete client.globalCooldown[`${interaction.guildId}_${interaction.user.id}`]
                    const filter = (i) => i.customId === `rankFont_${interaction.id}` && i.user.id === interaction.user.id
                    interaction = await interaction.awaitModalSubmit({ filter, time: 180000 }).catch(e => interaction)
                    if (interaction && interaction.type === InteractionType.ModalSubmit) {
                        let boolean = true
                        const modalArgs = {}
                        for (const c of interaction.fields.fields) {
                            if (c.value && (isNaN(+c.value) || !Number.isInteger(+c.value))) {
                                boolean = false
                                if (!interaction.deferred) await interaction.deferUpdate().catch(e => null)
                                interaction.followUp({ content: `**${c.value}** ${client.language({ textId: `не является целым числом`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
                            }
                            if (c.value !== "") c.value = +c.value
                            else c.value = undefined
                            if (!c.value && c.value !== 0) modalArgs[c.customId] = undefined
                            else if (c.value < 0) modalArgs[c.customId] = 0
                            else if (c.customId === "alpha" && c.value > 100) modalArgs[c.customId] = 100
                            else if (c.customId !== "alpha" && c.value > 255) modalArgs[c.customId] = 255
                            else modalArgs[c.customId] = c.value
                        }
                        if (!boolean) return
                        if (!profile.rank_card) profile.rank_card = { font_color: {} }
                        else if (!profile.rank_card.font_color) profile.rank_card.font_color = {}
                        profile.rank_card.font_color.r = modalArgs.red
                        profile.rank_card.font_color.g = modalArgs.green
                        profile.rank_card.font_color.b = modalArgs.blue
                        profile.rank_card.font_color.a = modalArgs.alpha !== undefined ? modalArgs.alpha / 100 : undefined
                        if (profile.rank_card.font_color.r === undefined && profile.rank_card.font_color.g === undefined && profile.rank_card.font_color.b === undefined && profile.rank_card.font_color.a === undefined) profile.rank_card.font_color = undefined
                        await interaction.deferUpdate().catch(e => null)
                    } else return  
                }
                if (interaction.customId.includes("xpforeground")) {
                    const modal = new ModalBuilder()
                        .setCustomId(`rankxpforeground_${interaction.id}`)
                        .setTitle(`${client.language({ textId: `Цвет линии опыта (RGBA)`, guildId: interaction.guildId, locale: interaction.locale })}`)
                        .setLabelComponents([
                            new LabelBuilder()
                                .setLabel(`${client.language({ textId: `Красный цвет (R)`, guildId: interaction.guildId, locale: interaction.locale })}`)
                                .setTextInputComponent(
                                    new TextInputBuilder()
                                        .setCustomId("red")
                                        .setRequired(false)
                                        .setStyle(TextInputStyle.Short)
                                        .setValue(`${profile.rank_card?.xp_color?.r !== undefined ? profile.rank_card.xp_color.r : ""}`)
                                        .setPlaceholder(`0-255`)
                                ),
                            new LabelBuilder()
                                .setLabel(`${client.language({ textId: `Зеленый цвет (G)`, guildId: interaction.guildId, locale: interaction.locale })}`)
                                .setTextInputComponent(
                                    new TextInputBuilder()
                                        .setCustomId("green")
                                        .setRequired(false)
                                        .setStyle(TextInputStyle.Short)
                                        .setValue(`${profile.rank_card?.xp_color?.g !== undefined ? profile.rank_card.xp_color.g : ""}`)
                                        .setPlaceholder(`0-255`)
                                ),
                            new LabelBuilder()
                                .setLabel(`${client.language({ textId: `Голубой цвет (B)`, guildId: interaction.guildId, locale: interaction.locale })}`)
                                .setTextInputComponent(
                                    new TextInputBuilder()
                                        .setCustomId("blue")
                                        .setRequired(false)
                                        .setStyle(TextInputStyle.Short)
                                        .setValue(`${profile.rank_card?.xp_color?.b !== undefined ? profile.rank_card.xp_color.b : ""}`)
                                        .setPlaceholder(`0-255`)
                                ),
                            new LabelBuilder()
                                .setLabel(`${client.language({ textId: `Непрозрачность (A)`, guildId: interaction.guildId, locale: interaction.locale })}`)
                                .setTextInputComponent(
                                    new TextInputBuilder()
                                        .setCustomId("alpha")
                                        .setRequired(false)
                                        .setStyle(TextInputStyle.Short)
                                        .setValue(`${profile.rank_card?.xp_color?.a !== undefined ? profile.rank_card.xp_color.a*100 : ""}`)
                                        .setPlaceholder(`0-100`)
                                )
                        ])
                    await interaction.showModal(modal);delete client.globalCooldown[`${interaction.guildId}_${interaction.user.id}`]
                    const filter = (i) => i.customId === `rankxpforeground_${interaction.id}` && i.user.id === interaction.user.id
                    interaction = await interaction.awaitModalSubmit({ filter, time: 180000 }).catch(e => interaction)
                    if (interaction && interaction.type === InteractionType.ModalSubmit) {
                        let boolean = true
                        const modalArgs = {}
                        for (const c of interaction.fields.fields) {
                            if (c.value && (isNaN(+c.value) || !Number.isInteger(+c.value))) {
                                boolean = false
                                if (!interaction.deferred) await interaction.deferUpdate().catch(e => null)
                                interaction.followUp({ content: `**${c.value}** ${client.language({ textId: `не является целым числом`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
                            }
                            if (c.value !== "") c.value = +c.value
                            else c.value = undefined
                            if (!c.value && c.value !== 0) modalArgs[c.customId] = undefined
                            else if (c.value < 0) modalArgs[c.customId] = 0
                            else if (c.customId === "alpha" && c.value > 100) modalArgs[c.customId] = 100
                            else if (c.customId !== "alpha" && c.value > 255) modalArgs[c.customId] = 255
                            else modalArgs[c.customId] = c.value
                        }
                        if (!boolean) return
                        if (!profile.rank_card) profile.rank_card = { xp_color: {} }
                        else if (!profile.rank_card.xp_color) profile.rank_card.xp_color = {}
                        profile.rank_card.xp_color.r = modalArgs.red
                        profile.rank_card.xp_color.g = modalArgs.green
                        profile.rank_card.xp_color.b = modalArgs.blue
                        profile.rank_card.xp_color.a = modalArgs.alpha !== undefined ? modalArgs.alpha / 100 : undefined
                        if (profile.rank_card.xp_color.r === undefined && profile.rank_card.xp_color.g === undefined && profile.rank_card.xp_color.b === undefined && profile.rank_card.xp_color.a === undefined) profile.rank_card.xp_color = undefined
                        await interaction.deferUpdate().catch(e => null)
                    } else return 
                }
                if (interaction.customId.includes("xpbackground")) {
                    const modal = new ModalBuilder()
                        .setCustomId(`rankxpbackground_${interaction.id}`)
                        .setTitle(`${client.language({ textId: `Цвет фона линии опыта (RGBA)`, guildId: interaction.guildId, locale: interaction.locale })}`)
                        .setLabelComponents([
                            new LabelBuilder()
                                .setLabel(`${client.language({ textId: `Красный цвет (R)`, guildId: interaction.guildId, locale: interaction.locale })}`)
                                .setTextInputComponent(
                                    new TextInputBuilder()
                                        .setCustomId("red")
                                        .setRequired(false)
                                        .setStyle(TextInputStyle.Short)
                                        .setValue(`${profile.rank_card?.xp_background_color?.r !== undefined ? profile.rank_card.xp_background_color.r : ""}`)
                                        .setPlaceholder(`0-255`)
                                ),
                            new LabelBuilder()
                                .setLabel(`${client.language({ textId: `Зеленый цвет (G)`, guildId: interaction.guildId, locale: interaction.locale })}`)
                                .setTextInputComponent(
                                    new TextInputBuilder()
                                        .setCustomId("green")
                                        .setRequired(false)
                                        .setStyle(TextInputStyle.Short)
                                        .setValue(`${profile.rank_card?.xp_background_color?.g !== undefined ? profile.rank_card.xp_background_color.g : ""}`)
                                        .setPlaceholder(`0-255`)
                                ),
                            new LabelBuilder()
                                .setLabel(`${client.language({ textId: `Голубой цвет (B)`, guildId: interaction.guildId, locale: interaction.locale })}`)
                                .setTextInputComponent(
                                    new TextInputBuilder()
                                        .setCustomId("blue")
                                        .setRequired(false)
                                        .setStyle(TextInputStyle.Short)
                                        .setValue(`${profile.rank_card?.xp_background_color?.b !== undefined ? profile.rank_card.xp_background_color.b : ""}`)
                                        .setPlaceholder(`0-255`)
                                ),
                            new LabelBuilder()
                                .setLabel(`${client.language({ textId: `Непрозрачность (A)`, guildId: interaction.guildId, locale: interaction.locale })}`)
                                .setTextInputComponent(
                                    new TextInputBuilder()
                                        .setCustomId("alpha")
                                        .setRequired(false)
                                        .setStyle(TextInputStyle.Short)
                                        .setValue(`${profile.rank_card?.xp_background_color?.a !== undefined ? profile.rank_card.xp_background_color.a*100 : ""}`)
                                        .setPlaceholder(`0-100`)
                                )
                        ])
                    await interaction.showModal(modal);delete client.globalCooldown[`${interaction.guildId}_${interaction.user.id}`]
                    const filter = (i) => i.customId === `rankxpbackground_${interaction.id}` && i.user.id === interaction.user.id
                    interaction = await interaction.awaitModalSubmit({ filter, time: 180000 }).catch(e => interaction)
                    if (interaction && interaction.type === InteractionType.ModalSubmit) {
                        let boolean = true
                        const modalArgs = {}
                        for (const c of interaction.fields.fields) {
                            if (c.value && (isNaN(+c.value) || !Number.isInteger(+c.value))) {
                                boolean = false
                                if (!interaction.deferred) await interaction.deferUpdate().catch(e => null)
                                interaction.followUp({ content: `**${c.value}** ${client.language({ textId: `не является целым числом`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
                            }
                            if (c.value !== "") c.value = +c.value
                            else c.value = undefined
                            if (!c.value && c.value !== 0) modalArgs[c.customId] = undefined
                            else if (c.value < 0) modalArgs[c.customId] = 0
                            else if (c.customId === "alpha" && c.value > 100) modalArgs[c.customId] = 100
                            else if (c.customId !== "alpha" && c.value > 255) modalArgs[c.customId] = 255
                            else modalArgs[c.customId] = c.value    
                        }
                        if (!boolean) return
                        if (!profile.rank_card) profile.rank_card = { xp_background_color: {} }
                        else if (!profile.rank_card.xp_background_color) profile.rank_card.xp_background_color = {}
                        profile.rank_card.xp_background_color.r = modalArgs.red
                        profile.rank_card.xp_background_color.g = modalArgs.green
                        profile.rank_card.xp_background_color.b = modalArgs.blue
                        profile.rank_card.xp_background_color.a = modalArgs.alpha !== undefined ? modalArgs.alpha / 100 : undefined
                        if (profile.rank_card.xp_background_color.r === undefined && profile.rank_card.xp_background_color.g === undefined && profile.rank_card.xp_background_color.b === undefined && profile.rank_card.xp_background_color.a === undefined) profile.rank_card.xp_background_color = undefined
                        await interaction.deferUpdate().catch(e => null)
                    } else return 
                }
                if (interaction.customId.includes("default")) {
                    if (!interaction.deferred) await interaction.update({ content: interaction.message.content || " ", embeds: interaction.message.embeds, components: [new ActionRowBuilder().addComponents(new ButtonBuilder().setEmoji("⏳").setStyle(ButtonStyle.Secondary).setCustomId(`0`).setDisabled(true))]})
                    else await interaction.editReply({ content: interaction.message.content || " ", embeds: interaction.message.embeds, components: [new ActionRowBuilder().addComponents(new ButtonBuilder().setEmoji("⏳").setStyle(ButtonStyle.Secondary).setCustomId(`0`).setDisabled(true))]})
                    profile.rank_card = undefined
                }
                if (profile.rank_card && !Object.values(profile.rank_card).filter(e => e !== undefined).length) profile.rank_card = undefined
                await profile.save()
            }
            const 
            fontColor = `rgba(${profile.rank_card?.font_color?.r !== undefined ? profile.rank_card.font_color.r : settings.rank_card.font_color.r}, ${profile.rank_card?.font_color?.g !== undefined ? profile.rank_card.font_color.g : settings.rank_card.font_color.g}, ${profile.rank_card?.font_color?.b !== undefined ? profile.rank_card.font_color.b : settings.rank_card.font_color.b}, ${profile.rank_card?.font_color?.a !== undefined ? profile.rank_card.font_color.a : settings.rank_card.font_color.a})`,
            backgroundColor = `rgba(${profile.rank_card?.xp_background_color?.r !== undefined ? profile.rank_card.xp_background_color.r : settings.rank_card.xp_background_color.r}, ${profile.rank_card?.xp_background_color?.g !== undefined ? profile.rank_card.xp_background_color.g : settings.rank_card.xp_background_color.g}, ${profile.rank_card?.xp_background_color?.b !== undefined ? profile.rank_card.xp_background_color.b : settings.rank_card.xp_background_color.b}, ${profile.rank_card?.xp_background_color?.a !== undefined ? profile.rank_card.xp_background_color.a : settings.rank_card.xp_background_color.a})`,
            xpColor = `rgba(${profile.rank_card?.xp_color?.r !== undefined ? profile.rank_card.xp_color.r : settings.rank_card.xp_color.r}, ${profile.rank_card?.xp_color?.g !== undefined ? profile.rank_card.xp_color.g : settings.rank_card.xp_color.g}, ${profile.rank_card?.xp_color?.b !== undefined ? profile.rank_card.xp_color.b : settings.rank_card.xp_color.b}, ${profile.rank_card?.xp_color?.a !== undefined ? profile.rank_card.xp_color.a : settings.rank_card.xp_color.a})`
            const default_fontColor = "rgba(255, 255, 255, 1)"
            const { Canvas, loadImage, FontLibrary } = require('skia-canvas')
            FontLibrary.use("All fonts", [
                "./GamestationCondensed.otf",
              ])
            const fillMixedText = (ctx, args, x, y, maxWidth) => {
                ctx.save()
                args.forEach(({ text, fillStyle, font, fontSize, align }) => {
                    let i = 0
                    do {
                        fontSize--
                        ctx.font = `${fontSize}px ${font}`
                        i++
                        if (i > 100000) throw new Error(`Бесконечный цикл: rank-set:867, maxWidth: ${maxWidth}, args.map(e => e.text).join(""): ${args.map(e => e.text).join("")}`)
                    } while (context.measureText(args.map(e => e.text).join("")).width > maxWidth)
                    ctx.textAlign = align
                    ctx.fillStyle = fillStyle
                    ctx.fillText(text, x, y)
                    if (align === "right") x -= ctx.measureText(text).width
                    else x += ctx.measureText(text).width
                })
                ctx.restore()
            }
            function drawImageProp(ctx, img, x, y, w, h, offsetX, offsetY) {

                if (arguments.length === 2) {
                    x = y = 0
                    w = ctx.canvas.width
                    h = ctx.canvas.height
                }
            
                // default offset is center
                offsetX = typeof offsetX === "number" ? offsetX : 0.5
                offsetY = typeof offsetY === "number" ? offsetY : 0.5
            
                // keep bounds [0.0, 1.0]
                if (offsetX < 0) offsetX = 0
                if (offsetY < 0) offsetY = 0
                if (offsetX > 1) offsetX = 1
                if (offsetY > 1) offsetY = 1
            
                let iw = img.width,
                    ih = img.height,
                    r = Math.min(w / iw, h / ih),
                    nw = iw * r,   // new prop. width
                    nh = ih * r,   // new prop. height
                    cx, cy, cw, ch, ar = 1
            
                // decide which gap to fill    
                if (nw < w) ar = w / nw                             
                if (Math.abs(ar - 1) < 1e-14 && nh < h) ar = h / nh  // updated
                nw *= ar
                nh *= ar
            
                // calc source rectangle
                cw = iw / (nw / w)
                ch = ih / (nh / h)
            
                cx = (iw - cw) * offsetX
                cy = (ih - ch) * offsetY
            
                // make sure source rectangle is valid
                if (cx < 0) cx = 0
                if (cy < 0) cy = 0
                if (cw > iw) cw = iw
                if (ch > ih) ch = ih
            
                // fill image in dest. rectangle
                ctx.drawImage(img, cx, cy, cw, ch,  x, y, w, h)
            }
            const canvas = new Canvas(900, 300)
            const context = canvas.getContext("2d")
            //Background
            const imgBackGround = await loadImage(profile.rank_card?.background || settings.rank_card.background || './cover_card.png').catch(async e => await loadImage('./cover_card.png'))
            const canvasBackground = new Canvas(900, 300)
            const contextBackground = canvasBackground.getContext("2d")
            contextBackground.fillStyle = "#000"
            contextBackground.fillRect(0, 0, 900, 300)
            contextBackground.filter = `brightness(${profile.rank_card?.background_brightness !== undefined ? profile.rank_card.background_brightness : settings.rank_card.background_brightness}%) blur(${profile.rank_card?.background_blur/10 || settings.rank_card.background_blur/10}px)`
            drawImageProp(contextBackground, imgBackGround, 0, 0, 900, 300)
            context.drawImage(canvasBackground, 0, 0, 900, 300)
            //Avatar
            const imgAvatar = await loadImage(member.user.displayAvatarURL({ extension: "png" }))
            const canvasAvatar = new Canvas(175, 175)
            const contextAvatar = canvasAvatar.getContext('2d')
            contextAvatar.beginPath()
            contextAvatar.arc(175/2, 175/2, 175/2, 0, Math.PI * 2, true)
            contextAvatar.closePath()
            contextAvatar.clip()
            contextAvatar.drawImage(imgAvatar, 0, 0, 175, 175)
            context.drawImage(canvasAvatar, 28, 63, 175, 175)
            //EXP LINE
                //BACKGROUND
            context.beginPath()
            context.strokeStyle = backgroundColor
            context.moveTo(246.84, 224)
            context.lineTo(834.75, 224)
            context.lineWidth = 41
            context.lineCap = "round"
            context.stroke()
                //FRONTGROUND
            context.beginPath()
            context.strokeStyle = xpColor
            context.moveTo(246.84, 224)
            const length = 834.75 - 246.84
            const ratio = profile.xp / (profile.level * settings.levelfactor + 100)
            context.lineTo(ratio > 1 ? length * 1 : length * ratio + 246.84, 224)
            context.lineWidth = 41
            context.lineCap = "round"
            context.stroke()
            //EXP
            context.font = `30px All fonts`
            context.textAlign = "right"
            const title = `${Math.floor(profile.xp)}/${profile.level * settings.levelfactor + 100} XP (${Math.floor(Math.floor(profile.xp) / (profile.level * settings.levelfactor + 100) * 100)}%)`
            context.fillStyle = fontColor
            context.fillText(title, 840, 283)
            //RANK LEVEL
            const profiles = client.cache.profiles.filter(e => e.guildID === interaction.guildId).map(e => e).sort((a, b) => b.totalxp - a.totalxp)
            let arguments = [
                { text: `${client.language({ textId: `ранг`, guildId: interaction.guildId, locale: interaction.locale })} `, fillStyle: fontColor, font: "All fonts", fontSize: 20, align: "left" },
                { text: `#${profiles.findIndex(e => e.userID === profile.userID)+1}`, fillStyle: fontColor, font: "All fonts", fontSize: 80, align: "left" },
                { text: ` ${client.language({ textId: `УР`, guildId: interaction.guildId, locale: interaction.locale })}. `, fillStyle: fontColor, font: "All fonts", fontSize: 20, align: "left" },
                { text: profile.level, fillStyle: fontColor, font: "All fonts", fontSize: 80, align: "left" },
            ]
            fillMixedText(context, arguments, 246.84, 190, 300)
            //USERNAME
            arguments = [
                { text: member.displayName, fillStyle: fontColor, font: "All fonts", fontSize: 50, align: "left" },
            ]
            fillMixedText(context, arguments, 246.84, 80, 516)
            //STATS
            arguments = [
                { text: Math.floor(profile.currency), fillStyle: fontColor, font: "All fonts", fontSize: 30, align: "right" },
                { text: `🪙`, fillStyle: fontColor, font: "All fonts", fontSize: 30, align: "right" },
                { text: profile.likes, fillStyle: fontColor, font: "All fonts", fontSize: 30, align: "right" },
                { text: `❤️`, fillStyle: fontColor, font: "All fonts", fontSize: 30, align: "right" },
                { text: profile.messages, fillStyle: fontColor, font: "All fonts", fontSize: 30, align: "right" },
                { text: `✉️`, fillStyle: fontColor, font: "All fonts", fontSize: 30, align: "right" },
                { text: Math.ceil(profile.hours), fillStyle: fontColor, font: "All fonts", fontSize: 30, align: "right" },
                { text: `🎙️`, fillStyle: fontColor, font: "All fonts", fontSize: 30, align: "right" },
            ]
            fillMixedText(context, arguments, 834.75, 190, 350)
            const buffer = await canvas.toBuffer(`png`, { compressionLevel: 3 })
            const attachment = new AttachmentBuilder().setFile(buffer).setName(`${member.user.id}.png`)
            embed.setImage(`attachment://${attachment.name}`)
            embed.setFooter({ text: `${client.language({ textId: `Так выглядит ваша карточка ранга`, guildId: interaction.guildId, locale: interaction.locale })}` })
            embed.setAuthor({ name: member.displayName, iconURL: member.displayAvatarURL() })
            embed.setTitle(`${client.language({ textId: `Карточка ранга`, guildId: interaction.guildId, locale: interaction.locale })}`)
            embed.setFields([
                {
                    name: `${client.language({ textId: `Фон`, guildId: interaction.guildId, locale: interaction.locale })}`,
                    value: profile.rank_card?.background ? `${client.language({ textId: `Фон`, guildId: interaction.guildId, locale: interaction.locale })}: ${profile.rank_card.background}\n${client.language({ textId: `Яркость`, guildId: interaction.guildId, locale: interaction.locale })}: ${profile.rank_card?.background_brightness !== undefined ? profile.rank_card.background_brightness : `[${client.language({ textId: `сервер`, guildId: interaction.guildId, locale: interaction.locale })}]`}\n${client.language({ textId: `Размытие`, guildId: interaction.guildId, locale: interaction.locale })}: ${profile.rank_card?.background_blur !== undefined ? profile.rank_card.background_blur : `[${client.language({ textId: `сервер`, guildId: interaction.guildId, locale: interaction.locale })}]`}` : `${client.language({ textId: `Фон`, guildId: interaction.guildId, locale: interaction.locale })}: [${client.language({ textId: `сервер`, guildId: interaction.guildId, locale: interaction.locale })}]\n${client.language({ textId: `Яркость`, guildId: interaction.guildId, locale: interaction.locale })}: ${profile.rank_card?.background_brightness !== undefined ? profile.rank_card.background_brightness : `[${client.language({ textId: `сервер`, guildId: interaction.guildId, locale: interaction.locale })}]`}\n${client.language({ textId: `Размытие`, guildId: interaction.guildId, locale: interaction.locale })}: ${profile.rank_card?.background_blur !== undefined ? profile.rank_card.background_blur : `[${client.language({ textId: `сервер`, guildId: interaction.guildId, locale: interaction.locale })}]`}`,
                    inline: true
                },
                {
                    name: `${client.language({ textId: `Цвет шрифта`, guildId: interaction.guildId, locale: interaction.locale })}`,
                    value: fontColor,
                    inline: true
                },
                {
                    name: `${client.language({ textId: `Цвет линии опыта`, guildId: interaction.guildId, locale: interaction.locale })}`,
                    value: xpColor,
                    inline: true
                },
                {
                    name: `${client.language({ textId: `Цвет фона линии опыта`, guildId: interaction.guildId, locale: interaction.locale })}`,
                    value: backgroundColor,
                    inline: true
                },
            ])
            const selectMenu = new StringSelectMenuBuilder().setCustomId(`usr{${interaction.user.id}}cmd{rank-set}`).setOptions([
                {
                    label: `${client.language({ textId: `Карточка`, guildId: interaction.guildId, locale: interaction.locale })} ${member.displayName}`.slice(0, 100),
                    emoji: `👤`,
                    value: `userCard`,
                    default: !serverCard
                }
            ])
            if (member.permissions.has("Administrator")) {
                selectMenu.addOptions([
                    {
                        label: `${client.language({ textId: `Карточка`, guildId: interaction.guildId, locale: interaction.locale })} ${interaction.guild.name}`.slice(0, 100),
                        emoji: `🖥️`,
                        value: `serverCard`,
                        default: serverCard
                    },
                ])
            }
            const buttonFont = new ButtonBuilder().setCustomId(`usr{${interaction.user.id}}cmd{rank-set}type{userCard}font`).setStyle(ButtonStyle.Primary).setLabel(`${client.language({ textId: `Цвет шрифта`, guildId: interaction.guildId, locale: interaction.locale })}`)
            const buttonXp = new ButtonBuilder().setCustomId(`usr{${interaction.user.id}}cmd{rank-set}type{userCard}xpforeground`).setStyle(ButtonStyle.Primary).setLabel(`${client.language({ textId: `Цвет линии опыта`, guildId: interaction.guildId, locale: interaction.locale })}`)
            const buttonXpBackground = new ButtonBuilder().setCustomId(`usr{${interaction.user.id}}cmd{rank-set}type{userCard}xpbackground`).setStyle(ButtonStyle.Primary).setLabel(`${client.language({ textId: `Цвет фона линии опыта`, guildId: interaction.guildId, locale: interaction.locale })}`)
            const buttonImage = new ButtonBuilder().setCustomId(`usr{${interaction.user.id}}cmd{rank-set}type{userCard}image`).setStyle(ButtonStyle.Primary).setLabel(`${client.language({ textId: `Фон`, guildId: interaction.guildId, locale: interaction.locale })}`)
            const buttonDefault = new ButtonBuilder().setCustomId(`usr{${interaction.user.id}}cmd{rank-set}type{userCard}default`).setStyle(ButtonStyle.Danger).setLabel(`${client.language({ textId: `По умолчанию`, guildId: interaction.guildId, locale: interaction.locale })}`).setDisabled(
                profile.rank_card?.xp_background_color?.r === undefined
                && profile.rank_card?.xp_background_color?.g === undefined
                && profile.rank_card?.xp_background_color?.b === undefined
                && profile.rank_card?.xp_background_color?.a === undefined

                && profile.rank_card?.xp_color?.r === undefined
                && profile.rank_card?.xp_color?.g === undefined
                && profile.rank_card?.xp_color?.b === undefined
                && profile.rank_card?.xp_color?.a === undefined

                && profile.rank_card?.font_color?.r === undefined
                && profile.rank_card?.font_color?.g === undefined
                && profile.rank_card?.font_color?.b === undefined
                && profile.rank_card?.font_color?.a === undefined

                && profile.rank_card?.background === undefined
                && profile.rank_card?.background_brightness === undefined
                && profile.rank_card?.background_blur === undefined)
            const firstRow = new ActionRowBuilder().addComponents(selectMenu)
            const secondRow = new ActionRowBuilder().addComponents(buttonFont, buttonXp, buttonXpBackground, buttonImage, buttonDefault)
            if (interaction.replied || interaction.deferred) return interaction.editReply({
                embeds: [embed],
                components: [firstRow, secondRow],
                files: [attachment]
            }) 
            else return interaction.update({
                embeds: [embed],
                components: [firstRow, secondRow],
                files: [attachment]
            }) 
        }
    }
}