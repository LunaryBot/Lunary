import { TextBasedChannel } from './Base';

import type { ChannelType } from 'types/discord';

class GroupDMChannel extends TextBasedChannel<ChannelType.GroupDM> {}

export { GroupDMChannel };