async function fetchLeaderboard(client, guildID, selection) {
    if (selection.includes("item")) {
        return client.functions.fetchItemLeaderboard(client, guildID, selection);
    }
    return client.functions.fetchStatisticsLeaderboard(client, guildID, selection);
}
module.exports = fetchLeaderboard;