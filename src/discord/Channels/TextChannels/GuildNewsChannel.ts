import { GuildTextChannel } from './GuildTextChannel';

import type { ChannelType } from '@discord/types';

class GuildNewsChannel extends GuildTextChannel<ChannelType.GuildNews> {}

export { GuildNewsChannel };