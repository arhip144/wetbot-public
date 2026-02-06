async function fetchStatisticsLeaderboard(client, guildID, selection) {
    const [time, field] = selection.split('.');
    
    return client.cache.profiles
        .filter(profile => 
            profile.guildID === guildID && 
            !profile.deleteFromDB && 
            (time !== "alltime" ? profile.stats?.[time]?.[field] > 0 : profile[field] > 0)
        )
        .sort((a, b) => 
            time !== "alltime" 
                ? b.stats[time][field] - a.stats[time][field] 
                : b[field] - a[field]
        );
}
module.exports = fetchStatisticsLeaderboard;