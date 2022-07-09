export interface KitsuAnimeData {
    createdAt: string; // ISO 8601
    updatedAt: string; // ISO 8601
    slug: string;
    synopsis: string;
    coverImageTopOffset: number; // Deprecated
    titles: {
        en: string;
        en_jp: string;
        ja_jp: string;
    };
    canonicalTitle: string;
    averageRating: number;
    userCount: number;
    favoritesCount: number;
    startDate: string;
    endDate: string;
    popularityRank: number;
    ratingRank: number;
    ageRatingGuide: string;
    tba: string;
    posterImage: {
        tiny: string;
        small: string;
        medium: string;
        large: string;
        original: string;
    };
    coverImage: {
        tiny: string;
        small: string;
        medium: string;
        large: string;
        original: string;
    };
    episodeCount: number;
    episodeLength: number;
    youtubeVideoId: string;
    nsfw: boolean;
    description: string;
}

export interface KitsuMangaData {
    createdAt: string; // ISO 8601
    updatedAt: string; // ISO 8601
    slug: string;
    synopsis: string;
    coverImageTopOffset: number; // Deprecated
    titles: {
        en: string;
        en_jp: string;
        ja_jp: string;
    };
    canonicalTitle: string;
    averageRating: number;
    userCount: number;
    favoritesCount: number;
    startDate: string;
    endDate: string;
    popularityRank: number;
    ratingRank: number;
    ageRatingGuide: string;
    tba: string;
    posterImage: {
        tiny: string;
        small: string;
        medium: string;
        large: string;
        original: string;
    };
    coverImage: {
        tiny: string;
        small: string;
        medium: string;
        large: string;
        original: string;
    };
    chapterCount: number;
    volumeCount: number;
    serialization: string;
    nsfw: boolean;
    description: string;
}