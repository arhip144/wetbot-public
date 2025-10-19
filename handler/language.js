const lang = require('../config/lang.json')
const guildLanguages = {}
const loadLanguages = async (client) => {
    for (const guild of client.guilds.cache) {
      const guildId = guild[0]
      const settings = client.cache.settings.get(guildId)
      guildLanguages[guildId] = settings ? settings.language : 'en-US'
    }
  console.log(`Successfully loaded languages.`)
}

const setLanguage = (guildId, language) => {
  guildLanguages[guildId] = language
}

module.exports = (data) => {
  const guildId = data.guildId
  const textId = data.textId
  let locale = data.locale
  if (!lang.translations[textId]) {
    return textId
  }
  if (locale) {
    if (locale === "en-GB") locale = "en-US"
    else if (locale !== "ru" && locale !== "en-US" && locale !== "es-ES" && locale !== "uk") locale = "en-US"
    if (locale === "es-ES" && !lang.translations[textId][locale]) locale = "en-US"
    return lang.translations[textId][locale] || textId
  }
  if (guildLanguages[guildId]) {
    const selectedLanguage = guildLanguages[guildId]
    return lang.translations[textId][selectedLanguage] || textId
  } else return textId
  
}

module.exports.loadLanguages = loadLanguages
module.exports.setLanguage = setLanguage