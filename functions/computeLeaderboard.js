async function computeLeaderboard(leaderboard, selection, min) {
    if (leaderboard.length < 1) return [];
    
    const time = selection.split(".")[0];
    const POSITION_EMOJIS = {
        1: '<a:TOP1:869597729960112169>',
        2: '<a:TOP2:869597733021966336>', 
        3: '<a:TOP3:869597729477763113>',
        4: '<a:TOP4:869597732493459526>',
        5: '<a:TOP5:869597731570720898>'
    };
    
    return leaderboard.map((key, index) => {
        const position = index + 1 + min;
        const emoji = POSITION_EMOJIS[position] || '';
        const displayPosition = emoji ? `${emoji}**${position}**` : `**${position}**`;
        
        const getValue = (field) => 
            time === "alltime" ? key[`_${field}`] : key._stats?.[time]?.[field];
            
        return {
            totalxp: getValue('totalxp') || 0,
            seasonLevel: key._seasonLevel,
            seasonTotalXp: key._seasonTotalXp || 0,
            userID: key._userID,
            level: key._level,
            position: displayPosition,
            likes: getValue('likes') || 0,
            messages: getValue('messages') || 0,
            hours: (getValue('hours')?.toFixed(2)) || 0,
            currency: getValue('currency') || 0,
            invites: getValue('invites') || 0,
            bumps: getValue('bumps') || 0,
            rp: getValue('rp') || 0,
            giveawaysCreated: getValue('giveawaysCreated') || 0,
            wormholeTouched: getValue('wormholeTouched') || 0,
            doneQuests: getValue('doneQuests') || 0,
            itemsSoldOnMarketPlace: getValue('itemsSoldOnMarketPlace') || 0,
        };
    });
}
module.exports = computeLeaderboard;