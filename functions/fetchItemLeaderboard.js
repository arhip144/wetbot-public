const ITEM_REGEXP = /item<(.*?)>/;
async function fetchItemLeaderboard(client, guildID, selection) {
    const itemID = ITEM_REGEXP.exec(selection)[1];
    
    return client.cache.profiles
        .filter(profile => 
            profile.guildID === guildID && 
            !profile.deleteFromDB && 
            profile.inventory.some(item => item.itemID === itemID)
        )
        .map(profile => {
            const amount = profile.inventory.find(e => e.itemID === itemID).amount;
            return { ...profile, amount };
        })
        .sort((a, b) => b.amount - a.amount)
        .map((profile, index) => ({
            ...profile,
            position: index + 1
        }));
}
module.exports = fetchItemLeaderboard;