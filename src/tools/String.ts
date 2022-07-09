String.prototype.shorten = function (length: number): string {
    if (this.length <= length) {
        return this.toString();
    }
    return this.substring(0, length - 3) + '...';
};

String.prototype.toTitleCase = function (): string {
    return this.replace(/\w\S*/g, function (string) { return string.charAt(0).toUpperCase() + string.substr(1).toLowerCase(); });
}

String.prototype.checkSimilarityStrings = function (string: string): number {
    if (this.toString() === string) return 1.0
  
    const len1 = this.toString().length
    const len2 = string.length
  
    const maxDist = ~~(Math.max(len1, len2)/2)-1
    let matches = 0
  
    const hash1 = []
    const hash2 = []
  
    for(var i=0; i<len1; i++) {
        for(var j=Math.max(0, i-maxDist); j<Math.min(len2, i+maxDist+1); j++) {
            if (this.toString().charAt(i) === string.charAt(j) && !hash2[j]) {
                hash1[i] = 1
                hash2[j] = 1
                matches++
                break
            }
        }
    }
  
    if (!matches) return 0.0
  
    let t = 0
    let point = 0
  
    for(var k = 0; k < len1; k++)
        if (hash1[k]) {
            while(!hash2[point]) {
                point++
            }
    
            if (this.toString().charAt(k) !== string.charAt(point++)) { t++ }
        }
  
    t/=2
  
    return ( (matches / len1) + ( matches / len2 ) + (( matches - t ) / matches) ) / 3.0
}