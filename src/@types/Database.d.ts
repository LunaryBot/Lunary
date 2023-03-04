import type { EmbedType, JsonValue } from '@prisma/client';

import type { APIEmbed, APIMessageActionRowComponent, APIMessageComponent } from '@discord/types';

export interface Embed {
    type: EmbedType;
    guild_id: string;
    content?: string | null;
    embeds?: Array<Omit<APIEmbed, 'type' | 'timestamp'> & { timestamp: boolean }> | null;
}

export interface EmbedBuilded {
    content?: string | null;
    embeds?: Array<Omit<APIEmbed, 'type'>> | null;
    components?: Array<APIMessageActionRowComponent<APIMessageComponent>>;
}