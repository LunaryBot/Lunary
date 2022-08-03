import type { Snowflake } from '@discord/types';

import Structure from '../Base';


class AbstractGuild extends Structure {
	public readonly id: Snowflake;

	public constructor(client: LunaryClient, id: Snowflake) {
		super(client);

		this.id = id;
	}
}

export { AbstractGuild };