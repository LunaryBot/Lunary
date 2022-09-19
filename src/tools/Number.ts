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
];

const formatNumber = new Intl.NumberFormat('en-US').format;

Number.prototype.formatUnits = function(allowned) {
	const number = Number(this);

	let formated: string;
	const formatsAllowned = allowned ? formats.filter(({ abreviation }) => allowned.includes(abreviation as any)) : formats;
    
	for(let i = 0; i < formatsAllowned.length; i++) {
		const { size, abreviation } = formatsAllowned[i];

		if(number >= size) {
			formated = `${(number / size).toFixed(1)}${abreviation}`;

			break;
		}
	}

    // @ts-ignore
	return formated || formatNumber(number);
};