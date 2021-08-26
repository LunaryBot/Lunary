const fs = require("fs");
const client = require("../../../Lunary");

const router = require("express").Router()
const apis = {}
const apisFiles = fs.readdirSync(__dirname + "/").filter(file => file.endsWith("Api.js"));
for(const api of apisFiles) {
    const base = require(__dirname + `/${api}`)
    const apiName = api.toLowerCase().replace("api.js", "")
    apis[apiName] = base
    router.use(`/${apiName}`, base)
}

client.apis = apis

module.exports = router