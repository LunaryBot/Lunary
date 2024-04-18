type TUnicBit<StringType extends string = string, BitFieldType = BitField> = bigint | StringType | BitFieldType;

type TBit<StringType extends string = string, BitFieldType = BitField> = TUnicBit<StringType, BitFieldType> | Array<TUnicBit<StringType, BitFieldType>>;

type TFLAGS = { [key: string]: bigint };

class BitField<StringType extends string = string> {
	public bitfield: bigint
	public resolve: (bit: TBit) => bigint
	public Object: any

	public constructor(bits?: TBit<StringType>) {
		const object = (this.constructor as any)
		const resolve: (bit: TBit) => bigint = object.resolve.bind(this.constructor)

		this.bitfield = resolve(bits || object.defaultBit)

		Object.defineProperty(this, 'resolve', {
			value: resolve,
			enumerable: false,
		})

		Object.defineProperty(this, 'Object', {
			value: object,
			enumerable: false,
		})
	}

	has(bit: TBit<StringType>) {
		bit = this.resolve(bit)
		return (this.bitfield & bit) === bit
	}

	missing(bits: TBit<StringType>): Array<StringType> {
		return new this.Object(bits).remove(this).toArray() as Array<StringType>
	}

	add(...bits: Array<TBit<StringType>>) {
		let total = this.Object.defaultBit
		for(const bit of bits) {
			total |= this.resolve(bit)
		}

		if(Object.isFrozen(this)) return new this.Object(this.bitfield | total)
		this.bitfield |= total
		return this
	}

	remove(...bits: Array<TBit<StringType>>) {
		let total = BitField.defaultBit
		for(const bit of bits) {
			total |= this.resolve(bit)
		}
		if(Object.isFrozen(this)) return new this.Object(this.bitfield & ~total)
		this.bitfield &= ~total
		return this
	}

	serialize() {
		const serialized: { [key: string]: boolean } = {}

		for(const [flag, bit] of Object.entries(this.Object.Flags as TFLAGS)) {
			serialized[flag] = this.has(bit)
		}

		return serialized
	}

	toArray(): Array<StringType> {
		return Object.keys(this.Object.Flags).filter(bit => this.has(bit as any)) as Array<StringType>
	}

	toJSON() {
		return typeof this.bitfield === 'number' ? this.bitfield : Number(this.bitfield)
	}

	*[Symbol.iterator]() {
		yield* this.toArray()
	}

	public static get ALL() {
		return Object.values(BitField.Flags as TFLAGS).reduce((all, p) => all | p, 0n)
	}

	static resolve(bit: TBit): bigint {
		const { defaultBit, Flags } = this
		
		if(typeof bit === 'bigint' && bit >= defaultBit) return bit
		if(bit instanceof BitField) return bit.bitfield
		if(Array.isArray(bit)) return bit.map(p => this.resolve(p)).reduce((prev, p) => prev | p, defaultBit)
		if(typeof bit === 'string' && typeof Flags[bit] !== 'undefined') return Flags[bit]
		throw new Error('BitField Invalid: ' + bit)
	}

	public static Flags: TFLAGS = {}

	public static defaultBit: bigint = 0n
}

export default BitField

export type { TBit }