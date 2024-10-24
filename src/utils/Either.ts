export type Either<L, R> = Left<L, R> | Right<L, R>

export const Either = {
	left<L, R>(value: L): Either<L, R> {
		return new Left(value)
	},
	
	right<L, R>(value: R): Either<L, R> {
		return new Right(value)
	},
}

export class Left<L, R> {
	readonly value: L
  
	constructor(value: L) {
		this.value = value
	}
  
	isRight(): this is Right<L, R> {
		return false
	}
  
	isLeft(): this is Left<L, R> {
		return true
	}
}

export class Right<L, R> {
	readonly value: R
  
	constructor(value: R) {
		this.value = value
	}
  
	isRight(): this is Right<L, R> {
		return true
	}
  
	isLeft(): this is Left<L, R> {
		return false
	}
}