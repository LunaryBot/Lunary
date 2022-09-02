import BitField from '@utils/BitField';
import * as Constants from '@utils/Constants';

type PunishmentFlag = keyof typeof Constants.PunishmentFlags;

class PunishmentFlags extends BitField<PunishmentFlag> {
	public static Flags = Constants.PunishmentFlags;
}

export { PunishmentFlags };