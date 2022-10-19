import 'dotenv/config';
import './tools/Number';
import './tools/Logger';
import './tools/Object';
import './tools/String';

import Client from '@LunaryClient';
import { exec } from 'child_process';
import fs from 'fs';

import { ProfileTemplateBuilded, ProfileInfos } from './@types';

async function main() {
	if(!fs.existsSync('./locales')) {
		logger.warn('Locales folder not found, creating...', { label: 'Locales' });

		await new Promise((resolve, reject) => {
			exec(`git clone ${process.env.LOCALES_REPOSITORY} ./locales`, (err, stout) => (err ? reject(err) : resolve(stout)));
		});

		logger.info(`Locales cloned from ${process.env.LOCALES_REPOSITORY}`, { label: 'Locales' });
	} else if(process.argv.includes('--update-locales')) {
		logger.warn('Locales folder found, updating...', { label: 'Locales' });

		await new Promise((resolve, reject) => {
			exec('cd locales && git pull', (err, stout) => (err ? reject(err) : resolve(stout)));
		});

		logger.info('Locales updated', { label: 'Locales' });
	}

	const client = new Client(process.env.DISCORD_CLIENT_TOKEN);

	await client.init();

	// const infos: ProfileInfos = {
	// 	avatar: 'https://cdn.discordapp.com/avatars/452618703792766987/689cc5e9c3379d1b3c37551939d53a40.png?size=1024',
	// 	background: 'default',
	// 	bio: 'Developer <3',
	// 	flags: ['HouseBravery', 'lunarDeveloper', 'lunarStaff'],
	// 	luas: 2400000,
	// 	username: 'Bae',
	// 	xp: 100,
	// 	emblem: 'https://cdn.discordapp.com/emojis/885321797380239390.png',
	// };

	// client.templates.find(template => template.type == 0)?.build(infos as ProfileInfos).then(({ buffer }: ProfileTemplateBuilded) => {
	// 	logger.debug('Profile test builded');
	// 	fs.writeFileSync('profile.png', buffer());
	// });
}

process.on('uncaughtExceptionMonitor', (err) => {
	logger.error(err.message, { label: 'Process', details: err.stack });
});

main();