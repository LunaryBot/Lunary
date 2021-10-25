const setValue = require(__dirname + "/setValue")
const { isObject } = require(__dirname + "/Utils")

module.exports = class ObjRef {
    constructor(obj, sep = "/") {
        if(!isObject(obj) && obj != undefined) throw new Error("<ObjRef> constructor must be a object.")
        this.obj = new Object(obj) || criarObj()
        
        if(typeof sep != "string" && obj != undefined) throw new Error("<ObjRef> constructor separator must be a string.")
        this.sep = sep || "/"
    }
    
    ref(path) {
        if(path && typeof path != "string") throw new Error("<ObjRef>.ref() must be a string.")
        if(!path) path = ""

        const pathValue = refVal(this.obj, path, this.sep)
        return {
            val: () => {
                return pathValue
            },
            set: (value) => {
                if(!path && !isObject(value)) throw new Error("<ObjRef>.ref(...).set() must be a object.")
                else if(!path && isObject(value)) return this.obj = value
                else {
                    setValue(this.obj, path, value, this.sep)
                    return refVal(this.obj, path, this.sep)
                }
            },
            update: (value) => {
                if(!isObject(value)) throw new Error("<ObjRef>.ref(...).update() must be a object.")
                if(!pathValue) {
                    this.obj = setValue(this.obj, path, value, this.sep)
                    return refVal(this.obj, path, this.sep)
                }
                if(!isObject(pathValue)) {
                    this.obj = setValue(this.obj, path, value, this.sep)
                    return refVal(this.obj, path, this.sep)
                }
                Object.keys(value).forEach((key) => {
                    setValue(this.obj, `${path ? `${path}${this.sep}` : ""}${key}`, value[key], this.sep)
                })
                return refVal(this.obj, path, this.sep)
            },
            delete: () => {
                if(!path) return this.obj = criarObj()
                let obj = this.obj
                let array = path.split(this.sep).filter(x => x)
                let _continue = true
                while(array.length > 1 && _continue == true) {
                    let value = array.shift()
                    if(!obj[value]) _continue = false
                    else obj = obj[value] = obj[value] || criarObj()
                }
                if(_continue == true) delete obj[array]
                return this.obj
            }
        }
    }
}

function criarObj() {
    let obj = {}
    return obj
}

function refVal(obj, string, sep = "/") {
    let array = string.split(sep).filter(x => x)
    let valor = obj;
    for(let element of array.filter(x => x)) {
      if(valor) valor = valor[`${element}`]
      else {
        valor = undefined;
        break;
      };
    }

    return valor
}