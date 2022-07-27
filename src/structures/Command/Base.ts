import { ICommandRequirements, ICommandBase } from '../../@types';
import type { ContextCommand } from './ContextCommand';

class Base {
	public declare client: LunaryClient;
    
	public name: string;
	public dirname?: string | undefined;
	public requirements?: ICommandRequirements | null;
	public cooldown: number;

	constructor(
		client: LunaryClient,
		data: ICommandBase
	) {
		this.name = data.name;
		this.dirname = data.dirname || undefined;
		this.requirements = data.requirements || null;
		this.cooldown = data.cooldown || 0;
        
		Object.defineProperty(this, 'client', {
			value: client,
			enumerable: false,
			writable: false,
		});
	};

	public async run(context: ContextCommand): Promise<any> {}

	public get commandName() {
		return this.name;
	}
}

export default Base;