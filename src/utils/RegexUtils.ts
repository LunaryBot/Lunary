export class RegexUtils {
	static formartStringToRegex(string: string) {
		return string.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')
	}
}