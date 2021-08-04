const fs = require("fs");
const Language = require("../languages/Language");
const ObjRef = require("../utils/objref/ObjRef");

module.exports = (client) => {
    let langs = fs.readdirSync(__dirname + "/../languages").filter(file => file.split(".").pop() == "json");
    for(let lang of langs) {
        let base = new Language(lang.split(".").shift(), require(__dirname + `/../languages/${lang}`))
        client.langs.push(base)
    }

    return client.langs
}