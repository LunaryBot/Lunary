import BitField from '@utils/BitField';
import * as Constants from '@utils/Constants';

type Inventory = keyof typeof Constants.UserInventory;

class UserInventory extends BitField<Inventory> {
	public static Flags = Constants.UserInventory;
}

class UserInventoryUsing extends UserInventory {
	get background() {
		return (this.toArray().find(item => item.startsWith('profileBackground'))  || 'profileBackgroundDefault' as Inventory)?.replace('profileBackground', '').firstCharInLowerCase();
	}

	get pattern() {
		return (this.toArray().find(item => item.startsWith('profilePattern')))?.replace('profilePattern', '').firstCharInLowerCase();
	}

	get profileLayout() {
		return (this.toArray().find(item => item.startsWith('profileLayout')) || 'profileLayoutDefault' as Inventory)?.replace('profileLayout', '').firstCharInLowerCase();
	}

	get emblem(): string | undefined {
		return undefined;
	}
}

export { UserInventory, UserInventoryUsing };