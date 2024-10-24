export type ColorHexComplex = `#${string}`;

const hexRegex = /^#[0-9A-F]{6}$/i
const hexWithTransparency = /^#[0-9A-F]{6}[0-9a-f]{0,2}$/i

export class ColorUtils {
	static isHex(string: string, supportTransparent: boolean = false) {
		const regex = supportTransparent ? hexWithTransparency : hexRegex

		return regex.test(string)
	}
} 