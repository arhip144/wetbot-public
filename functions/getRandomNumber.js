function getRandomNumber(min, max) {
    const minDot = min.toString().split('.')[1]?.length
    const maxDot = max.toString().split('.')[1]?.length
    const fixed = minDot > maxDot ? +minDot : maxDot ? +maxDot : minDot ? +minDot : 0
    if (fixed === 0) return Math.floor(Math.random() * (max - min + 1)) + min
    else return +(Math.random() * (max - min) + min).toFixed(fixed)
}
module.exports = getRandomNumber;