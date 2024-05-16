type fn = (...args: unknown[]) => unknown

class Collection<ObjectType = unknown> extends Map<string, ObjectType> {
	public limit?: number

	constructor(baseData?: Array<[string, ObjectType]>, limit?: number) {
		super(baseData)

		if(typeof limit === 'number') {
			this.limit = limit
		}
	}

	add(key: string, value: ObjectType) {
		this.set(key, value)

		if(this.limit && this.size > this.limit) {
			const iter = this.keys()
			while(this.size > this.limit) {
				this.delete(iter.next().value)
			}
		}

		return value
	}

	every(func: fn) {
		for(const item of this.values()) {
			if(!func(item)) {
				return false
			}
		}

		return true
	}

	filter(func: fn) {
		const arr = []

		for(const item of this.values()) {
			if(func(item)) {
				arr.push(item)
			}
		}

		return arr
	}

	find(func: fn) {
		for(const item of this.values()) {
			if(func(item)) {
				return item
			}
		}

		return undefined
	}

	map(func: fn) {
		const arr = []

		for(const item of this.values()) {
			arr.push(func(item))
		}

		return arr
	}

	random() {
		const index = Math.floor(Math.random() * this.size)

		const iter = this.values()

		for(let i = 0; i < index; ++i) {
			iter.next()
		}

		return iter.next().value
	}

	reduce(func: fn, initialValue?: unknown) {
		const iter = this.values()

		let val: unknown = iter.next().value

		let result = initialValue === undefined ? iter.next().value : initialValue

		while(val !== undefined) {
			result = func(result, val)
			val = iter.next().value
		}

		return result
	}

	remove(key: string) {
		const item = this.get(key)

		if(!item) {
			return null
		}

		this.delete(key)

		return item
	}

	some(func: fn) {
		for(const item of this.values()) {
			if(func(item)) {
				return true
			}
		}

		return false
	}

	toJSON() {
		const json: { [key: string]: ObjectType } = {}

		for(const [key, item] of this.entries()) {
			json[key] = item
		}

		return json
	}
}

export default Collection