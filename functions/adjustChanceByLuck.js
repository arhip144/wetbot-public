const Decimal = require('decimal.js')
function adjustChanceByLuck(items, luck, mode) {
    if (luck.gt(1)) {
        items.forEach(i => {
            i.chance = new Decimal(`${i.chance}`).mul(luck)
            if (mode === "multiple") {
                if (i.chance.gt(100)) i.chance = new Decimal(100)
            }
        })
        if (mode === "single") {
            let i = 0
            while (items.reduce((prev, current) => prev.plus(current.chance), new Decimal(0)).gt(100)) {
                i++
                const highest = Math.max(...items.map(e => e.chance))
                const highestElementIndex = items.findIndex(e => e.chance.eq(highest))
                const multiplies = items.filter(e => e.chance.eq(highest)).length
                if (items.filter(e => e.chance.eq(highest)).length === items.filter(e => e.chance.gt(0)).length) {
                    items.forEach(e => {
                        if (e.chance.eq(highest)) e.chance = new Decimal(100).div(multiplies)
                    })
                } else {
                    items[highestElementIndex].chance = (new Decimal(`${highest}`).mul(multiplies).minus(items.reduce((prev, current) => prev.plus(current.chance), new Decimal(0))).plus(100)).div(multiplies)
                    if (items[highestElementIndex].chance.lt(0)) items[highestElementIndex].chance = new Decimal(0)
                }
                if (i > 10000) throw new Error(`Бесконечный цикл сообщения предметы (${interaction.guildId}) удача (${luck.mul(100).minus(100)})`)
            }
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
module.exports = adjustChanceByLuck;