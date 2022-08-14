import type { JsonValue } from '@prisma/client';

import { APIEmbed } from '@discord/types';

enum EmbedTypes {
    BAN = 'BAN',
    KICK = 'KICK',
    MUTE = 'MUTE',
    ADV = 'ADV',
}

interface Embed {
    type: keyof typeof EmbedTypes;
    data: APIEmbed;
}

export { EmbedTypes, Embed };