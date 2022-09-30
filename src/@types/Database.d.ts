import type { EmbedType, JsonValue } from '@prisma/client';

import { APIEmbed } from '@discord/types';

export interface Embed {
    type: EmbedType;
    guild_id: string;
    content?: string | null;
    embeds?: Array<Omit<APIEmbed, 'type' | 'timestamp'> & { timestamp: boolean }> | null;
}

export interface EmbedBuilded {
    content?: string | null;
    embeds?: Array<Omit<APIEmbed, 'type'>> | null;
}