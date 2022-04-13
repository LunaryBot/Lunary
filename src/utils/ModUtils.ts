import LunarClient from '../structures/LunarClient';

const az = [ ...'abcdefghijklmnopqrstuvwxyz' ];

class ModUtils {
    static client: LunarClient;

    static async generatePunishmentID(logs: { [key: string]: string }): Promise<string> {
        let id: string = '';
             
        while(!id || logs[id]) {
            const a = (this.client.cases + 1) % 1000000;
            id = az[Math.floor((this.client.cases + 1) / 1000000)].toUpperCase() + '0'.repeat(6 - a.toString().length) + a;
        }
        
        return id;
    }
}

export default ModUtils;