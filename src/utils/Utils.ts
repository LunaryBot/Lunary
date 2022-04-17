import Eris, { Member } from 'eris';

const units = {
    s: ['s', 'sec', 'secs', 'second', 'seconds', 'segundo', 'segundos'],
    m: ['m', 'min', 'mins', 'minute', 'minutes', 'minuto', 'minutos'],
    h: ['h', 'hr', 'hrs', 'hour', 'hours', 'hora', 'horas'],
    d: ['d', 'day', 'days', 'dias', 'dia'],
};

const utits_ms = {
    s: 1 * 1000,
    m: 1 * 1000 * 60,
    h: 1 * 1000 * 60 * 60,
    d: 1 * 1000 * 60 * 60 * 24,
};

class Utils {
    public static formatSizeUnits(bytes: number | string): string {
        if (typeof bytes === 'string') {
            bytes = parseInt(bytes, 10);
        };

        if (bytes >= 1000000000000000000000000) {
            bytes = (bytes / 1000000000000000000000000).toFixed(1) + 'YB';
        } else if (bytes >= 1000000000000000000000) {
            bytes = (bytes / 1000000000000000000000).toFixed(1) + 'ZB';
        } else if (bytes >= 1000000000000000000) {
            bytes = (bytes / 1000000000000000000).toFixed(1) + 'EB';
        } else if (bytes >= 1000000000000000) {
            bytes = (bytes / 1000000000000000).toFixed(1) + 'PB';
        } else if (bytes >= 1000000000000) {
            bytes = (bytes / 1000000000000).toFixed(1) + 'TB';
        } else if (bytes >= 1000000000) {
            bytes = (bytes / 1000000000).toFixed(1) + 'GB';
        } else if (bytes >= 1000000) {
            bytes = (bytes / 1000000).toFixed(1) + 'MB';
        } else if (bytes >= 1000) {
            bytes = (bytes / 1000).toFixed(1) + 'KB';
        } else if (bytes > 1) {
            bytes = bytes + ' bytes';
        } else if (bytes == 1) {
            bytes = bytes + ' byte';
        } else {
            bytes = '0 bytes';
        };

        return bytes;
    };

    public static highestPosition(member1: Eris.Member, member2: Eris.Member) {
        if (member1.guild.ownerID == member1.id) { return true };
        if (member1.id == member2.id || member1.guild.ownerID == member2.id) { return false };

        const roles = [ ...member1.guild.roles.values() ].sort((a, b) => a.position - b.position);

        member1.roles.sort((a, b) => roles.findIndex(role => role.id == a) - roles.findIndex(role => role.id == b));
        member2.roles.sort((a, b) => roles.findIndex(role => role.id == a) - roles.findIndex(role => role.id == b));

        return roles.findIndex(role => role.id == member1.roles[0]) >= roles.findIndex(role => role.id == member2.roles[0]);
    }

    public static calculateLevels(xp: number, difficulty = 300, startingLvl = 1) {
        const level = ~~(Math.log2(xp / difficulty)) + startingLvl
      
        return { 
            current: { 
                level, 
                xp 
            }, 
            next: level + 1,
        }
    }

    public static durationString(ms: number, t: Function) {
        const { days, hours, minutes, seconds, milliseconds } = this.parseMs(ms);

        let m = [];
        if (days) m.push(`${days} ${t(`time:d${days != 1 ? 'd' : ''}`)}`);
        if (hours) m.push(`${hours} ${t(`time:h${hours != 1 ? 'h' : ''}`)}`);
        if (minutes) m.push(`${minutes} ${t(`time:m${minutes != 1 ? 'm' : ''}`)}`);
        if (seconds) m.push(`${seconds} ${t(`time:s${seconds != 1 ? 's' : ''}`)}`);

        let time = '';

        for (let i = 0; i < m.length; i++) {
            if (i == 0 || m.length == 1) time = m[i];
            else if (Number(i) + 1 == m.length) time += ` ${t('time:split')} ${m[i]}`;
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

    public static timeString(string: string) {
        let groups = string.match(/[0-9.]+(\s+)?[a-z]+/gi) as string[];
        if (groups == null) return NaN;
        
        let times = groups.map(function (group: string) {
            const n = group.match(/[0-9.]+/g)?.[0];
            const l = group.match(/[a-z]+/g)?.[0];

            const unit = Object.keys(units).find(x =>  units[x as 'd' | 'h' | 'm'].includes(l as any));

            if (!unit) return NaN;

            return Number(n) * utits_ms[unit as 'd' | 'h' | 'm'];
        });

        if (times.filter(x => !x).length) return NaN;

        return times.reduce((a, b) => a + (b as number), 0);
    } 
}

export default Utils;