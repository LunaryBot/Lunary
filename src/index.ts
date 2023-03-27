import 'dotenv/config';
import './tools/Number';
import './tools/Logger';
import './tools/Object';
import './tools/String';

import Client from '@LunaryClient';
import { exec } from 'child_process';
import fs from 'fs';

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
}

process.on('uncaughtExceptionMonitor', (err) => {
	logger.error(err.message, { label: 'Process', details: err.stack });
});

main();