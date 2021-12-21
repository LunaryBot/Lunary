class BitField {
	constructor(bits = this.constructor.defaultBit) {
		this.bitfield = this.constructor.resolve(bits);
	}

	any(bit) {
		return (
			(this.bitfield & this.constructor.resolve(bit)) !==
			this.constructor.defaultBit
		);
	}

	equals(bit) {
		return this.bitfield === this.constructor.resolve(bit);
	}

	has(bit) {
		bit = this.constructor.resolve(bit);
		return (this.bitfield & bit) === bit;
	}

	missing(bits, ...hasParams) {
		return new this.constructor(bits).remove(this).toArray(...hasParams);
	}

	freeze() {
		return Object.freeze(this);
	}

	add(...bits) {
		let total = this.constructor.defaultBit;
		for (const bit of bits) {
			total |= this.constructor.resolve(bit);
		}
		if (Object.isFrozen(this))
			return new this.constructor(this.bitfield | total);
		this.bitfield |= total;
		return this;
	}

	remove(...bits) {
		let total = this.constructor.defaultBit;
		for (const bit of bits) {
			total |= this.constructor.resolve(bit);
		}
		if (Object.isFrozen(this))
			return new this.constructor(this.bitfield & ~total);
		this.bitfield &= ~total;
		return this;
	}

	serialize(...hasParams) {
		const serialized = {};
		for (const [flag, bit] of Object.entries(this.constructor.FLAGS))
			serialized[flag] = this.has(bit, ...hasParams);
		return serialized;
	}

	toArray(...hasParams) {
		return Object.keys(this.constructor.FLAGS).filter((bit) =>
			this.has(bit, ...hasParams)
		);
	}

	toJSON() {
		return typeof this.bitfield === "number"
			? this.bitfield
			: this.bitfield.toString();
	}

	valueOf() {
		return this.bitfield;
	}

	*[Symbol.iterator]() {
		yield* this.toArray();
	}

	static resolve(bit) {
		const { defaultBit } = this;
		if (typeof defaultBit === typeof bit && bit >= defaultBit) return bit;
		if (bit instanceof BitField) return bit.bitfield;
		if (Array.isArray(bit))
			return bit
				.map((p) => this.resolve(p))
				.reduce((prev, p) => prev | p, defaultBit);
		if (typeof bit === "string" && typeof this.FLAGS[bit] !== "undefined")
			return this.FLAGS[bit];
		throw new Error("BITFIELD_INVALID");
	}
}

BitField.FLAGS = {};

BitField.defaultBit = 0;

module.exports = BitField;
