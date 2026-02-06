async function fetchGlobalProfile(client, userID) {
    let user = await client.globalProfileSchema.findOne({ userID: userID })
    if (user) return user
    user = new client.globalProfileSchema({
        userID: userID
    })
    await user.save().catch(e => console.error(e))
    return user
}
module.exports = fetchGlobalProfile;