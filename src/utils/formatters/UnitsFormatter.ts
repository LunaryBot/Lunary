const formats = [
	{
		size: 1000000000000,
		abreviation: 'tri',
	},
	{
		size: 1000000000,
		abreviation: 'bi',
	},
	{
		size: 1000000,
		abreviation: 'M',
	},
	{
		size: 1000,
		abreviation: 'K',
	},
]

const numberFormatter = new Intl.NumberFormat('en-US').format

export const UnitsFormatter = (number: number, allownedFormats?: string[]) => {
	let formated: string = ''

	const formatsAllowned = allownedFormats ? formats.filter(({ abreviation }) => allownedFormats.includes(abreviation as any)) : formats
    
	for(let i = 0; i < formatsAllowned.length; i++) {
		const { size, abreviation } = formatsAllowned[i]

		if(number >= size) {
			formated = `${(number / size).toFixed(1)}${abreviation}`

			break
		}
	}

	return formated || numberFormatter(number)
}