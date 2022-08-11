import BitField from '@utils/BitField';
import * as Constants from '@utils/Constants';

type GuildFeature = keyof typeof Constants.UserFeatures;

class UserFeatures extends BitField<GuildFeature> {
	public static Flags = Constants.UserFeatures;
}

export { UserFeatures };