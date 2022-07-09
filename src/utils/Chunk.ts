function chunk(array: any[], size = 1) {
    size = Math.max(toInteger(size), 0)
    const length = array == null ? 0 : array.length
    if (!length || size < 1) {
        return []
    }
    let index = 0
    let resIndex = 0
    const result = new Array(Math.ceil(length / size))
  
    while (index < length) {
        result[resIndex++] = slice(array, index, (index += size))
    }
    return result
}

function slice(array: Array<any>, start: number, end: number) {
    let length = array == null ? 0 : array.length
    if (!length) {
        return []
    }
    start = start == null ? 0 : start
    end = end === undefined ? length : end
  
    if (start < 0) {
        start = -start > length ? 0 : (length + start)
    }
    end = end > length ? length : end
    if (end < 0) {
        end += length
    }
    length = start > end ? 0 : ((end - start) >>> 0)
    start >>>= 0
  
    let index = -1
    const result = new Array(length)
    while (++index < length) {
        result[index] = array[index + start]
    }
    return result
}

function toInteger(value: number) {
    const result = toFinite(value)
    const remainder = result % 1
  
    return remainder ? result - remainder : result
}

function toFinite(value: number) {
    const INFINITY = 1 / 0
    const MAX_INTEGER = 1.7976931348623157e+308
    if (!value) {
      return value === 0 ? value : 0
    }
    value = Number(value)
    if (value === INFINITY || value === -INFINITY) {
        const sign = (value < 0 ? -1 : 1)
        return sign * MAX_INTEGER
    }
    return value === value ? value : 0
}

export default chunk;