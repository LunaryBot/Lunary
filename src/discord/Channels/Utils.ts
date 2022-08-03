import {
	APIChannel,
	APIChannelBase,
	APIInteractionDataResolvedChannel,
	ChannelType,
} from '@discord/types';

import type { Guild } from '../Guilds';
import { PermissionOverwrite } from '../Permissions';
  
export type MixChannel<T extends ChannelType, X> = (APIChannelBase<T> | APIInteractionDataResolvedChannel) & X;

export interface GuildChannel {
    guild?: Guild;

    permissionOverwrites: ReadonlyArray<PermissionOverwrite>;

    parentId?: string;
}