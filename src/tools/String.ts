String.prototype.checkSimilarityStrings = function(string: string): number {
	if(this.toString() === string) return 1.0;
  
	const len1 = this.toString().length;
	const len2 = string.length;
  
	const maxDist = ~~(Math.max(len1, len2)/2)-1;
	let matches = 0;
  
	const hash1 = [];
	const hash2 = [];
  
	for(let i=0; i<len1; i++) {
		for(let j=Math.max(0, i-maxDist); j<Math.min(len2, i+maxDist+1); j++) {
			if(this.toString().charAt(i) === string.charAt(j) && !hash2[j]) {
				hash1[i] = 1;
				hash2[j] = 1;
				matches++;
				break;
			}
		}
	}
  
	if(!matches) return 0.0;
  
	let t = 0;
	let point = 0;
  
	for(let k = 0; k < len1; k++)
		if(hash1[k]) {
			while(!hash2[point]) {
				point++;
			}
    
			if(this.toString().charAt(k) !== string.charAt(point++)) { t++; }
		}
  
	t/=2;
  
	return ((matches / len1) + (matches / len2) + ((matches - t) / matches)) / 3.0;
};

String.prototype.firstCharInLowerCase = function() {
	return this.replace(/^./g, (char) => char.toLowerCase());
};

String.prototype.isLowerCase = function() {
	return this.toString().toLowerCase() === this.toString();
};

String.prototype.isUpperCase = function() {
	return this.toString().toUpperCase() === this.toString();
};

String.prototype.removeAccents = function() {
	return this.toString().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
};

String.prototype.shorten = function(length: number): string {
	if(this.length <= length) {
		return this.toString();
	}
	return this.substring(0, length - 3) + '...';
};

String.prototype.toTitleCase = function(): string {
	return this.replace(/\w\S*/g, (string) => string.charAt(0).toUpperCase() + string.substr(1).toLowerCase());
};

String.prototype.wordWrap = function(maxWidth: number) {
	const newLineStr = '\n';
	const done = false;
	let res = '';

	let string = `${this}`;

	while(string.length > maxWidth) {
		let found = false;
		for(let i = maxWidth - 1; i >= 0; i--) {
			if(testWhite(string.charAt(i))) {
				res = res + [string.slice(0, i), newLineStr].join('');
				string = string.slice(i + 1);
				found = true;
				break;
			}
		}
		if(!found) {
			res += [string.slice(0, maxWidth), newLineStr].join('');
			string = string.slice(maxWidth);
		}
	}

	return res + string;
};

function testWhite(x: string) {
	const white = new RegExp(/^\s$/);
	return white.test(x.charAt(0));
}