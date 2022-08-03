import type { ChannelType } from '@discord/types';

import { TextBasedChannel } from './Base';


class GroupDMChannel extends TextBasedChannel<ChannelType.GroupDM> {}

export { GroupDMChannel };