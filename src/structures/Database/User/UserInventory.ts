import BitField from '@utils/BitField';
import * as Constants from '@utils/Constants';

type Inventory = keyof typeof Constants.UserInventory;

class UserInventory extends BitField<Inventory> {
	public static Flags = Constants.UserInventory;
}

class UserInventoryUsing extends UserInventory {
	get background() {
		return (this.toArray().find(item => item.startsWith('profileBackground'))  || 'profileBackgroundDefault' as Inventory)?.replace('profileBackground', '').toLowerCase();
	}

	get pattern() {
		return (this.toArray().find(item => item.startsWith('profilePattern')))?.replace('profilePattern', '').toLowerCase();
	}

	get profileLayout() {
		return (this.toArray().find(item => item.startsWith('profileLayout')) || 'profileLayoutDefault' as Inventory)?.replace('profileLayout', '').toLowerCase();
	}
}

export { UserInventory, UserInventoryUsing };