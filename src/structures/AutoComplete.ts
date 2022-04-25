import Eris from 'eris';
import LunarCLient from './LunarClient';

interface IAutoCompleteOptions {
    cacheClearInterval?: number;
    disableCache?: boolean;
}

class AutoComplete {
    public declare client: LunarCLient;
    public cache: Map<string, any>;
    public options: IAutoCompleteOptions;
    public interval: NodeJS.Timer | null;

    constructor(client: LunarCLient, data: IAutoCompleteOptions = {}) {
        this.cache = new Map();
        this.options = { ...data };

        if(this.options.disableCache) {
            this.cache.clear();
        } 
        
        if(this.options.cacheClearInterval != 0 && this.options.cacheClearInterval) {
            this.interval = setInterval(() => {
                this.cache.clear();
            }, this.options.cacheClearInterval);
        } else {
            this.interval = null;
        }

        Object.defineProperty(this, 'client', { value: client, enumerable: false });
    }

    public async run(interaction: Eris.AutocompleteInteraction): Promise<any> {}
}

export default AutoComplete;