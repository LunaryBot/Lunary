import type { ChannelType } from '@discord/types';

import { GuildTextChannel } from './GuildTextChannel';


class GuildNewsChannel extends GuildTextChannel<ChannelType.GuildNews> {}

export { GuildNewsChannel };