import { Axios } from 'axios';

import { KitsuAnimeData, KitsuMangaData } from '../@types/Kitsu';

class Kitsu {
	static baseURL = 'https://kitsu.io/api/edge/';

	static api = new Axios({ baseURL: this.baseURL });

	public static async searchAnime(query: string, offset: number = 0): Promise<Array<KitsuAnimeData>> {
		const response = await this.api.get(`/anime?filter[text]=${query}&page%5Boffset%5D=${offset.toString() ? offset : '0'}`);
        
		const { data } = JSON.parse(response.data);

		return data;
	}

	public static async searchManga(query: string, offset: number = 0): Promise<Array<KitsuMangaData>> {
		const response = await this.api.get(`/manga?filter[text]=${query}&page%5Boffset%5D=${offset.toString() ? offset : '0'}`);
        
		const { data } = JSON.parse(response.data);

		return data;
	}
}

export default Kitsu;