const dateRegex = /(0[1-9]|[12][0-9]|3[01])[-/.](0[1-9]|1[012])[-/.]([0-9]+)/;
const timeRegex = /(([01]?\d|2[0-3]):([0-5]\d?)(:([0-5]\d))?)(\s+)?(am|pm)?/i;

const units = {
	s: ['s', 'sec', 'secs', 'second', 'seconds', 'segundo', 'segundos'],
	m: ['m', 'min', 'mins', 'minute', 'minutes', 'minuto', 'minutos'],
	h: ['h', 'hr', 'hrs', 'hour', 'hours', 'hora', 'horas'],
	d: ['d', 'day', 'days', 'dias', 'dia'],
};

const utitsMs = {
	s: 1 * 1000,
	m: 1 * 1000 * 60,
	h: 1 * 1000 * 60 * 60,
	d: 1 * 1000 * 60 * 60 * 24,
};

class TimeUtils {
	public static dateStringToDate(string: string) {
		let d = '';
        
		if(/-|\//g.test(string)) {
			const match = string.match(dateRegex);
            
			if(match != null) {
				d = `${match[3]}-${match[2]}-${match[1] || new Date().getUTCFullYear()}`;
			}
		}

		if(/:/g.test(string)) {
			const match = string.match(timeRegex);

			if(match != null) {
				d = `${d} ${Number(match[2]) + (match[7] == 'pm' && Number(match[2]) ? 12 : 0)}:${match[3]}:${match[5] || '00'}`;
			}
		}

		return d ? new Date(d) : NaN;
	}

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

	public static getStringTime(string: string) {
		if(/-|\/|:/g.test(string)) {
			return this.dateStringToDate(string);
		} else {
			return this.timeString(string);
		}
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

	public static timeString(string: string) {
		const groups = string.match(/[0-9.]+(\s+)?[a-z]+/gi) as string[];
		if(groups == null) return NaN;
        
		const times = groups.map(function (group: string) {
			const n = group.match(/[0-9.]+/g)?.[0];
			const l = group.match(/[a-z]+/g)?.[0];

			const unit = Object.keys(units).find(x =>  units[x as 'd' | 'h' | 'm'].includes(l as any));

			if(!unit) return NaN;

			return Number(n) * utitsMs[unit as 'd' | 'h' | 'm'];
		});

		if(times.filter(x => !x).length) return NaN;

		return times.reduce((a, b) => a + (b as number), 0);
	}
}

export default TimeUtils;