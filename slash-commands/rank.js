const { ApplicationCommandOptionType, Collection, GuildMember } = require("discord.js")
const { Canvas, loadImage, FontLibrary } = require('skia-canvas')
const MemberRegexp = /mbr{(.*?)}/
module.exports = {
    name: "rank",
    nameLocalizations: {
        "ru": `ранг`,
        "uk": `ранг`,
        "es-ES": `rango`
    },
    description: `View profile card`,
    descriptionLocalizations: {
       "ru": `Посмотреть карточку профиля`,
       "uk": `Переглянути картку профілю`,
       "es-ES": `Ver la tarjeta de perfil`
    },
    options: [
        {
            name: "user",
            nameLocalizations: {
                "ru": `юзер`,
                "uk": `користувач`,
                "es-ES": `usuario`
            },
            description: `View user's card profile`,
            descriptionLocalizations: {
                "ru": `Посмотреть карточку профиля пользователя`,
                "uk": `Переглянути картку профілю користувача`,
                "es-ES": `Ver la tarjeta de perfil del usuario`
            },
            type: ApplicationCommandOptionType.User,
            required: false
        }
    ],
    dmPermission: false,
    group: `profile-group`,
    cooldowns: new Collection(),
    run: async (client, interaction, args) => {
        const flags = []
        if (interaction.customId?.includes("eph") || interaction.values?.[0].includes("eph")) flags.push("Ephemeral")
        if (!interaction.isChatInputCommand() && !interaction.isContextMenuCommand()) {
            if (!interaction.customId.includes("reply")) await interaction.update({ content: interaction.message.content || " ", embeds: interaction.message.embeds, components: [new ActionRowBuilder().addComponents(new ButtonBuilder().setEmoji("⏳").setStyle(ButtonStyle.Secondary).setCustomId(`0`).setDisabled(true))]})
             else await interaction.deferReply({ flags })
        } else await interaction.deferReply({ flags })
        let member
        if (args?.user) member = await interaction.guild.members.fetch(args.user).catch(e => null)
        else if (interaction.isButton() && MemberRegexp.exec(interaction.customId)) member = await interaction.guild.members.fetch(MemberRegexp.exec(interaction.customId)[1]).catch(e => null)
        else if (interaction.isStringSelectMenu() && (MemberRegexp.exec(interaction.customId) || MemberRegexp.exec(interaction.values[0]))) {
            member = await interaction.guild.members.fetch(MemberRegexp.exec(interaction.values[0])?.[1]).catch(e => null)
            if (!(member instanceof GuildMember)) member = await interaction.guild.members.fetch(MemberRegexp.exec(interaction.customId)[1]).catch(e => null)
        }
        else member = interaction.member
        if (!member) {
            return interaction.editReply({ content: `${client.config.emojis.NO}${client.language({ textId: `Пользователь не найден на сервере`, guildId: interaction.guildId, locale: interaction.locale })}`, flags: ["Ephemeral"] })
        }
        const profile = await client.functions.fetchProfile(client, member.user.id, interaction.guildId)
        let globalUser = await client.globalProfileSchema.findOne({ userID: member.user.id }).lean()
        const settings = client.cache.settings.get(interaction.guildId)
        const 
            fontColor = `rgba(${profile.rank_card?.font_color?.r !== undefined ? profile.rank_card.font_color.r : settings.rank_card.font_color.r}, ${profile.rank_card?.font_color?.g !== undefined ? profile.rank_card.font_color.g : settings.rank_card.font_color.g}, ${profile.rank_card?.font_color?.b !== undefined ? profile.rank_card.font_color.b : settings.rank_card.font_color.b}, ${profile.rank_card?.font_color?.a !== undefined ? profile.rank_card.font_color.a : settings.rank_card.font_color.a})`,
            backgroundColor = `rgba(${profile.rank_card?.xp_background_color?.r !== undefined ? profile.rank_card.xp_background_color.r : settings.rank_card.xp_background_color.r}, ${profile.rank_card?.xp_background_color?.g !== undefined ? profile.rank_card.xp_background_color.g : settings.rank_card.xp_background_color.g}, ${profile.rank_card?.xp_background_color?.b !== undefined ? profile.rank_card.xp_background_color.b : settings.rank_card.xp_background_color.b}, ${profile.rank_card?.xp_background_color?.a !== undefined ? profile.rank_card.xp_background_color.a : settings.rank_card.xp_background_color.a})`,
            xpColor = `rgba(${profile.rank_card?.xp_color?.r !== undefined ? profile.rank_card.xp_color.r : settings.rank_card.xp_color.r}, ${profile.rank_card?.xp_color?.g !== undefined ? profile.rank_card.xp_color.g : settings.rank_card.xp_color.g}, ${profile.rank_card?.xp_color?.b !== undefined ? profile.rank_card.xp_color.b : settings.rank_card.xp_color.b}, ${profile.rank_card?.xp_color?.a !== undefined ? profile.rank_card.xp_color.a : settings.rank_card.xp_color.a})`
        const default_fontColor = "rgba(255, 255, 255, 1)"
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
                    if (i > 100000) throw new Error(`Бесконечный цикл: rank:67, maxWidth: ${maxWidth}, args.map(e => e.text).join(""): ${args.map(e => e.text).join("")}`)
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
        const buffer = await canvas.toBuffer(`png`)
        if (interaction.replied || interaction.deferred) {
            return interaction.editReply({ 
                files: [{
                    attachment: buffer,
                    name: `rank_${member.user.id}.png`,
                }] 
            })
        } else return interaction.update({ 
            files: [{
                attachment: buffer,
                name: `rank_${member.user.id}.png`,
            }] 
        })
    }
}