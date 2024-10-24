export const trim = (strings: TemplateStringsArray, ...placeholders: unknown[]) => {
	const withSpace = strings.reduce((result, string, i) => (result + placeholders[i - 1] + string))
	const withoutSpace = withSpace.replace(/^\s*/gm, '')
	return withoutSpace
}