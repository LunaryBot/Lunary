import Structure from '../Base';

import type { Snowflake } from 'types/discord';

class AbstractGuild extends Structure {
	public readonly id: Snowflake;

	public constructor(client: LunaryClient, id: Snowflake) {
		super(client);

		this.id = id;
	}
}

export { AbstractGuild };