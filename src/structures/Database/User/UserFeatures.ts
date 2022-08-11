import BitField from '@utils/BitField';
import * as Constants from '@utils/Constants';

type UserFeature = keyof typeof Constants.UserFeatures;

class UserFeatures extends BitField<UserFeature> {
	public static Flags = Constants.UserFeatures;
}

export { UserFeatures };