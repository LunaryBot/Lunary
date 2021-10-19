const idRegex = /^\d{18}$/

module.exports = function validateUser(userID, authorID) {
    userID = userID?.replace(/<@!?(\d{18})>/, "$1")
    
    return !userID && idRegex.test(authorID) ? authorID : userID || null
}