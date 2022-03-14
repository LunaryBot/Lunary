module.exports = function calculateLevels(xp, difficulty = 300, startingLvl = 0) {
    const level = ~~(Math.log2(xp / difficulty + 1)) + startingLvl
    const nextLvlXp = difficulty * ((2 ** level) - startingLvl)
  
    return { 
        current: { 
            level, 
            xp 
        }, 
        next: { 
            level: level + 1, 
            xp: nextLvlXp 
        }, 
        toNextLevel: nextLvlXp-xp 
    }
}