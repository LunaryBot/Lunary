const idRegex = /^\d{17,19}$/

module.exports = function validateUser(userID, authorID) {
    userID = userID?.replace(/<@!?(\d{17,19})>/, "$1")
    
    return !userID && idRegex.test(authorID) ? authorID : userID || null
}