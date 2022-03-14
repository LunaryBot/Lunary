String.prototype.removeAccents = function () {
	let text = `${this}`;
	text = text.replace(new RegExp('[ÁÀÂÃ]', 'gi'), 'a');
	text = text.replace(new RegExp('[ÉÈÊ]', 'gi'), 'e');
	text = text.replace(new RegExp('[ÍÌÎ]', 'gi'), 'i');
	text = text.replace(new RegExp('[ÓÒÔÕ]', 'gi'), 'o');
	text = text.replace(new RegExp('[ÚÙÛ]', 'gi'), 'u');
	text = text.replace(new RegExp('[Ç]', 'gi'), 'c');
	return text;
};
