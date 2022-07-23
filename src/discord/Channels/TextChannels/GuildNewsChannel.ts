import { GuildTextChannel } from './GuildTextChannel';

import type { ChannelType } from 'types/discord';

class GuildNewsChannel extends GuildTextChannel<ChannelType.GuildNews> {}

export { GuildNewsChannel };