import BitField from '@utils/BitField';
import * as Constants from '@utils/Constants';

type GuildFeature = keyof typeof Constants.GuildFeatures;

class GuildFeatures extends BitField<GuildFeature> {
	public static Flags = Constants.GuildFeatures;
}

export { GuildFeatures };