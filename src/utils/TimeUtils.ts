class TimeUtils {
	public static durationToString(ms: number, t: Function) {
		const { days, hours, minutes, seconds, milliseconds } = this.parseMs(ms);

		const m = [];
		if(days) m.push(`${days} ${t(`time:d${days != 1 ? 'd' : ''}`)}`);
		if(hours) m.push(`${hours} ${t(`time:h${hours != 1 ? 'h' : ''}`)}`);
		if(minutes) m.push(`${minutes} ${t(`time:m${minutes != 1 ? 'm' : ''}`)}`);
		if(seconds) m.push(`${seconds} ${t(`time:s${seconds != 1 ? 's' : ''}`)}`);

		let time = '';

		for(let i = 0; i < m.length; i++) {
			if(i == 0 || m.length == 1) time = m[i];
			else if(Number(i) + 1 == m.length) time += ` ${t('time:split')} ${m[i]}`;
			else time += `, ${m[i]}`;
		}

		return time;
	}

	public static parseMs(milliseconds: number) {
		return {
			days: Math.trunc(milliseconds / 86400000),
			hours: Math.trunc(milliseconds / 3600000) % 24,
			minutes: Math.trunc(milliseconds / 60000) % 60,
			seconds: Math.trunc(milliseconds / 1000) % 60,
			milliseconds: Math.trunc(milliseconds) % 1000,
		};
	}
}

export default TimeUtils;