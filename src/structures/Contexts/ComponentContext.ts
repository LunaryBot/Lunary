import type { ComponentInteraction, Guild, Member, TextBasedChannel, User } from '@discord';
import { ComponentType } from '@discord/types';

import Base from './Base';

class ComponentContext extends Base {
	public interaction: ComponentInteraction;

	get editParent() {
		return this.interaction.editParent.bind(this.interaction);
	}

	get componentType() {
		return this.interaction.componentType;
	}

	get values() {
		return this.interaction.values;
	}
}

class ButtonClickContext extends ComponentContext {
	get componentType(): ComponentType.Button {
		return super.componentType as ComponentType.Button;
	};
}

class SelectMenuContext extends ComponentContext {
	get componentType(): ComponentType.SelectMenu {
		return super.componentType as ComponentType.SelectMenu;
	};

	get values() {
		return super.values as Array<string>;
	}
}

export { ComponentContext, ButtonClickContext, SelectMenuContext };