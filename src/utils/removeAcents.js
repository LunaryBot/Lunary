module.exports = (text) => {
	text = text
		.toLowerCase()
		.replace(new RegExp("[ÀÁÂÃÄÅÆĀĂĄ]", "gi"), "a")
		.replace(new RegExp("[ÈÉÊËĒĖĘĚĔƏ]", "gi"), "e")
		.replace(new RegExp("[ÌÍÎÏİĮĪ]", "gi"), "i")
		.replace(new RegExp("[ÒÓÔÕŒŐØÖ]", "gi"), "o")
		.replace(new RegExp("[ÙÚÛÜŲŰŮŪ]", "gi"), "u")
		.replace(new RegExp("[ŇŅŃÑ]", "gi"), "n")
		.replace(new RegExp("[ŹŻŽ]", "gi"), "z")
		.replace(new RegExp("[ŚŠŞ]", "gi"), "s")
		.replace(new RegExp("[ĎĐ]", "gi"), "d")
		.replace(new RegExp("[ĢĞ]", "gi"), "g")
		.replace(new RegExp("[Ķ]", "gi"), "k")
		.replace(new RegExp("[ĹĻĽŁ]", "gi"), "l")
		.replace(new RegExp("[Ý]", "gi"), "y")
		.replace(new RegExp("[ŤȚŢ]", "gi"), "t")
		.replace(new RegExp("[ŔŘ]", "gi"), "r")
		.replace(new RegExp("[ČĆÇ]", "gi"), "c");
	return text;
};
