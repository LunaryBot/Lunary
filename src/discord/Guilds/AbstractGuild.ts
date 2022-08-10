import { Snowflake } from '@discord/types';

import Structure from '../Base';

class AbstractGuild<GuildRawType = { id: Snowflake }> extends Structure<GuildRawType> {
	public readonly id: Snowflake;

	public constructor(client: LunaryClient, id: Snowflake) {
		super(client, { id } as any);

		this.id = id;
	}
}

export { AbstractGuild };