const ObjRef = require("../utils/objref/ObjRef")

module.exports = class Language {
    constructor(lang, obj) {
        this.lang = lang
        this.obj = new ObjRef(obj)
        this.t = (ref, variabes = {}) => {
            let val = this.obj.ref(ref).val()
            let variabesKeys = Object.keys(variabes)
    
            let output = val
            if(val) variabesKeys.map(function(x) {
                let a = variabes[x]
                if(!a) return
                
                let regex = new RegExp(`{${x}}`, 'g')
                output = output.replace(regex, a)
            })
            
            return output || ":bug:"
        }
    }
}