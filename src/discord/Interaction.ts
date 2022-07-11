import { APIInteraction } from 'discord-api-types/v10';

class Interaction {
	public readonly id: string;
	public readonly token: string;

	public applicationId: string;
	public type: 1 | 2 | 3 | 4 | 5;
	public version: number;
	public acknowledged: boolean;

	constructor(data: APIInteraction) {
		Object.defineProperty(this, 'id', {
			writable: false,
			value: data.id,
		});

		Object.defineProperty(this, 'token', {
			enumerable: false,
			writable: false,
			value: data.token,
		});

		this.applicationId = data.application_id;
		this.type = data.type;
		this.version = data.version;
		this.acknowledged = false;
	}
}

export default Interaction;