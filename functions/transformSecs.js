function transformSecs(client, duration, guildId, locale) {
    let ms = parseInt((duration % 1000) / 100),
    secs = Math.floor((duration / 1000) % 60),
    mins = Math.floor((duration / (1000 * 60)) % 60),
    hrs = Math.floor((duration / (1000 * 60 * 60)) % 24);
    years = Math.floor(duration / (1000 * 60 * 60 * 24) / 365);
    months = Math.floor(duration / (1000 * 60 * 60 * 24 * 30) % 12);
    days = months ? Math.floor(duration / (1000 * 60 * 60 * 24) % 30) : Math.floor(duration / (1000 * 60 * 60 * 24) % 365);
    const array = []
    if (years) array.push(`${years} ${client.language({ textId: `${client.functions.plural(years)}`, guildId: guildId, locale: locale })}`)
    if (months) array.push(`${months} ${client.language({ textId: "мес", guildId: guildId, locale: locale })}.`)
    if (days) array.push(`${days} ${client.language({ textId: "дн", guildId: guildId, locale: locale })}.`)
    if (hrs) array.push(`${hrs} ${client.language({ textId: "HOURS_SMALL", guildId: guildId, locale: locale })}.`)
    if (mins) array.push(`${mins} ${client.language({ textId: "мин", guildId: guildId, locale: locale })}.`)
    if (secs) array.push(`${secs} ${client.language({ textId: "сек", guildId: guildId, locale: locale })}.`)
    return array.join(" ")
}
module.exports = transformSecs;