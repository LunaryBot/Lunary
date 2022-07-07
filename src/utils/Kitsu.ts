import axios, { Axios } from 'axios';

import { KitsuAnimeData } from '../@types/Kitsu';

class Kitsu {
    static baseURL = 'https://kitsu.io/api/edge/';

    static api = new Axios({ baseURL: this.baseURL });

    public static async searchAnime(query: string, offset: number = 0): Promise<Array<KitsuAnimeData>> {
        const response = await this.api.get(`/anime?filter[text]=${query}&page%5Boffset%5D=${offset.toString() ? offset : '0'}`);
        
        const { data } = JSON.parse(response.data);

        return data;
    }
}

export default Kitsu;