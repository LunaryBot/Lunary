import BitField from '@utils/BitField';
import * as Constants from '@utils/Constants';

type UserFlag = keyof typeof Constants.UserFlags;

class UserFlags extends BitField<UserFlag> {
	public static Flags = Constants.UserFlags;
}

export { UserFlags };