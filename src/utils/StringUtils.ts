const testWhite = (x: string) => {
	const white = new RegExp(/^\s$/)
	return white.test(x.charAt(0))
}

export class StringUtils {
	static checkSimilarityStrings(stringUno: string, stringTwo: string) {
		if(stringUno === stringTwo) return 1.0
      
		const len1 = stringUno.length
		const len2 = stringTwo.length
      
		const maxDist = ~~(Math.max(len1, len2)/2)-1
		let matches = 0
      
		const hash1 = []
		const hash2 = []
      
		for(let i=0; i<len1; i++) {
			for(let j=Math.max(0, i-maxDist); j<Math.min(len2, i+maxDist+1); j++) {
				if(stringUno.charAt(i) === stringTwo.charAt(j) && !hash2[j]) {
					hash1[i] = 1
					hash2[j] = 1
					matches++
					break
				}
			}
		}
      
		if(!matches) return 0.0
      
		let t = 0
		let point = 0
      
		for(let k = 0; k < len1; k++)
			if(hash1[k]) {
				while(!hash2[point]) {
					point++
				}
        
				if(stringUno.charAt(k) !== stringTwo.charAt(point++)) { t++ }
			}
      
		t/=2
      
		return ((matches / len1) + (matches / len2) + ((matches - t) / matches)) / 3.0
	}

	static firstCharInLowerCase(string: string) {
		return string.replace(/^./g, (char) => char.toLowerCase())
	};

	static isLowerCase(string: string) {
		return string.toLowerCase() === string
	};

	static isUpperCase(string: string) {
		return string.toUpperCase() === string
	};

	static removeAccents(string: string) {
		return string.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
	};

	static shorten(string: string, length: number) {
		if(string.length <= length) {
			return string
		}
		return string.substring(0, length - 3) + '...'
	};

	static toTitleCase(string: string) {
		return string.replace(/\w\S*/g, (x) => x.charAt(0).toUpperCase() + x.substr(1).toLowerCase())
	};

	static wordWrap = function(_string: string, maxWidth: number) {
		const newLineStr = '\n'
		const done = false
		let res = ''

		let string = _string.toString()
    
		while(string.length > maxWidth) {
			let found = false
			for(let i = maxWidth - 1; i >= 0; i--) {
				if(testWhite(string.charAt(i))) {
					res = res + [string.slice(0, i), newLineStr].join('')
					string = string.slice(i + 1)
					found = true
					break
				}
			}
			if(!found) {
				res += [string.slice(0, maxWidth), newLineStr].join('')
				string = string.slice(maxWidth)
			}
		}
    
		return res + string
	}
}