import { Snowflake } from '@discord/types';

class Structure<RawType = any> {
	public client: LunaryClient;
	public raw: RawType;

	public readonly id: Snowflake;

	constructor(client: LunaryClient, raw?: RawType) {
		Object.defineProperty(this, 'client', {
			writable: false,
			value: client,
			enumerable: false,
		});

		if(raw) {
			Object.defineProperty(this, 'raw', {
				writable: false,
				value: raw,
				enumerable: false,
			});

			if((raw as any).id) {
				this.id = (raw as any).id;
			}
		}
	}

	get createdAt() {
		return Structure.getCreatedAt(this.id);
	}

	static getCreatedAt(id: Snowflake) {
		return Structure.getDiscordEpoch(id) + 1420070400000;
	}

	static getDiscordEpoch(id: Snowflake) {
		return Math.floor(Number(id) / 4194304);
	}
}

export default Structure;