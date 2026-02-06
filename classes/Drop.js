class Drop {
    constructor(client, id, userId, type, amount, item) {
        this.client = client
        this.users = new Set()
        this.id = id
        this.userId = userId,
        this.type = type
        this.amount = amount
        this.item = item
    }
}
module.exports = Drop