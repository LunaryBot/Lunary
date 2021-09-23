const { existsSync, readFileSync } = require("fs")
const ObjRef = require("../utils/objref/ObjRef")
const yaml = require("js-yaml")

module.exports = class Locale {
    constructor(locale) {
        this.locale = locale
        this.dirname = __dirname.replace("structures", "locales") + `/${locale}`

        this.t = (ref, variables) => {
            const split = `${ref}`.split(":")
            let path =  split[0]
            if(!/^(.*).ya?ml$/.test(path)) path = `${path}.yml`
            path = path.replace(/^\/?(.*)$/, "$1")
            if(!existsSync(this.dirname + `/${path}`)) {
                if(existsSync(this.dirname + `/commands/${path}`)) path = this.dirname + `/commands/${path}`
                else return ":bug:"
            } else path = this.dirname + `/${path}`
            
            const data = yaml.load(readFileSync(path, 'utf8'));
            const val = new ObjRef(data, ".").ref(split.slice(1).join(":")).val()
            
            let output = `${val || ":bug:"}`
            const variablesKeys = Object.keys(variables || {})
            if(val) variablesKeys.map(function(x) {
                let a = variables[x]
                if(!a) return
                    
                let regex = new RegExp(`{${x}}`, 'g')
                output = output.replace(regex, a)
            })
            else return ":bug:"
    
            return output
        }
    } 
}