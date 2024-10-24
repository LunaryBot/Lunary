export const loop = (count: number, callback?: (index: number) => any) => {
	for(let i = 0; i <= count; i++) {
		if(callback) {
			callback(i)
		}
	}
}