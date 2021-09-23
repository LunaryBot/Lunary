const fs = require("fs");
const Locale = require("../structures/Locale");

module.exports = (client) => {
    let locales = fs.readdirSync(__dirname + "/../locales")
    for(let locale of locales) {
        let base = new Locale(locale)
        client.locales.push(base)
    }

    return client.locales
}