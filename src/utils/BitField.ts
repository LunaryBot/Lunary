type TBit = number | string | Array<string|number|BitField> | BitField;
type TFLAGS = { [key: string]: number };
type IData = { FLAGS: TFLAGS, defaultBit: number };

class BitField {
	public declare data: IData;
    public bitfield: number;
    public declare FLAGS: TFLAGS;
    public static FLAGS: TFLAGS;
    public static defaultBit: number;

	constructor(bits: TBit = BitField.defaultBit, data: IData) {
		Object.defineProperty(this, 'data', { value: data, enumerable: false });
		Object.defineProperty(this, 'FLAGS', { value: data.FLAGS, enumerable: false });
		
		this.bitfield = BitField.resolve(bits, this.data);
	}

	has(bit: TBit) {
		bit = BitField.resolve(bit, this.data);
		return (this.bitfield & bit) === bit;
	}

	missing(bits: TBit) {
		return new BitField(bits, this.data).remove(this).toArray();
	}

	add(...bits: TBit[]) {
		let total = BitField.defaultBit;
		for (const bit of bits) {
			total |= BitField.resolve(bit, this.data);
		}
		if (Object.isFrozen(this)) return new BitField(this.bitfield | total, this.data);
		this.bitfield |= total;
		return this;
	}

	remove(...bits: TBit[]) {
		let total = BitField.defaultBit;
		for (const bit of bits) {
			total |= BitField.resolve(bit, this.data);
		}
		if (Object.isFrozen(this)) return new BitField(this.bitfield & ~total, this.data);
		this.bitfield &= ~total;
		return this;
	}

	serialize() {
		const serialized: { [key: string]: number } = {};

		for (const [flag, bit] of Object.entries(BitField.FLAGS)) {
            // @ts-ignore
            serialized[flag] = this.has(bit);
        }

		return serialized;
	}

	toArray() {
		return Object.keys(this.FLAGS).filter(bit => this.has(bit));
	}

	toJSON() {
		return typeof this.bitfield === 'number' ? this.bitfield : Number(this.bitfield);
	}

	*[Symbol.iterator]() {
		yield* this.toArray();
	}

	public static get ALL() {
		return Object.values(BitField.FLAGS).reduce((all, p) => all | p, 0);
	}

	public static resolve(bit: TBit, data: IData): number {
		const { defaultBit, FLAGS } = data;
		
		if (typeof bit === 'number' && bit >= defaultBit) return bit;
		if (bit instanceof BitField) return bit.bitfield;
		if (Array.isArray(bit)) return bit.map(p => this.resolve(p, data)).reduce((prev, p) => prev | p, defaultBit);
		if (typeof bit === 'string' && typeof FLAGS[bit] !== 'undefined') return FLAGS[bit];
		throw new Error('BitField Invalid: ' + bit);
	}
}

BitField.FLAGS = {};

BitField.defaultBit = 0;

export default BitField;

export { TBit };