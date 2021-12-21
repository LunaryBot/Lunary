module.exports = function randomCharacters(length, type) {
	let id = "";

	for (let i = 0; i < Number(length); i++) {
		let caracteres = {
			numbers: "0123456789",
			letras: "abcdefghijklmnopqrstuvwxyz",
		};

		let characters;
		if (type == "number") characters = caracteres.numbers;
		else if (type == "letras") characters = caracteres.letras;
		else characters = `${caracteres.numbers}${caracteres.letras}`;

		let result = characters.charAt(
			Math.floor(Math.random() * characters.length)
		);
		let cas = ["upper", "lower"][Math.floor(Math.random() * 2)];
		if (cas == "upper") result = result.toUpperCase();

		id += result;
	}

	return id;
};
