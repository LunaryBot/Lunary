import BitField from './BitField';
import * as Constants from './Constants';

type GuildFeature = keyof typeof Constants.GuildFeatures;

class GuildFeatures extends BitField<GuildFeature> {
	public static Flags = Constants.GuildFeatures;
}

export default GuildFeatures;