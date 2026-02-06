const Decimal = require('decimal.js')
function adjustActivityChanceByLuck(items, luck, activity) {
    if (luck.gt(1)) {
        items.forEach(i => {
            i.activities[activity].chance = new Decimal(`${i.activities[activity].chance}`).mul(luck)
        })
        let i = 0
        while (items.reduce((prev, current) => prev.plus(current.activities[activity].chance), new Decimal(0)).gt(100)) {
            i++
            const highest = Math.max(...items.map(e => e.activities[activity].chance))
            const highestElementIndex = items.findIndex(e => e.activities[activity].chance.eq(highest))
            const multiplies = items.filter(e => e.activities[activity].chance.eq(highest)).length
            if (items.filter(e => e.activities[activity].chance.eq(highest)).length === items.filter(e => e.activities[activity].chance.gt(0)).length) {
                items.forEach(e => {
                    if (e.activities[activity].chance.eq(highest)) e.activities[activity].chance = new Decimal(100).div(multiplies)
                })
            } else {
                items[highestElementIndex].activities[activity].chance = (new Decimal(`${highest}`).mul(multiplies).minus(items.reduce((prev, current) => prev.plus(current.activities[activity].chance), new Decimal(0))).plus(100)).div(multiplies)
                if (items[highestElementIndex].activities[activity].chance.lt(0)) items[highestElementIndex].activities[activity].chance = new Decimal(0)
            }
            if (i > 10000) throw new Error(`Бесконечный цикл сообщения предметы (${interaction.guildId}) удача (${luck.mul(100).minus(100)})`)
        }
    }
    if (luck.lt(1)) {
        items.forEach(i => {
            i.activities[activity].chance = new Decimal(i.activities[activity].chance).mul(luck)
            if (i.activities[activity].chance.lt(0)) i.activities[activity].chance = new Decimal(0)
        })
    }
    return items
}
module.exports = adjustActivityChanceByLuck;