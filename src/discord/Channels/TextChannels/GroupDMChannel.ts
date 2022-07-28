import { TextBasedChannel } from './Base';

import type { ChannelType } from '@discord/types';

class GroupDMChannel extends TextBasedChannel<ChannelType.GroupDM> {}

export { GroupDMChannel };