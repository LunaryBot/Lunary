import winston, { Logger, LeveledLogMethod } from 'winston';
import chalk from 'chalk';

const { printf, combine, timestamp, colorize } = winston.format; 

const config = {
	levels: {
		error: 0,
		warn: 1,
		info: 2,
		http: 3,
		debug: 5,
		graphql: 6,
	},
	colors: {
		error: 'red',
		warn: 'yellowBG',
		info: 'green',
		http: 'blue',
		debug: 'yellow',
		graphql: 'magenta',
	},
};

winston.addColors(config.colors);

const logger = winston.createLogger({
	levels: config.levels,
	level: 'graphql',
	transports: [
		new winston.transports.Console({ 
			format: combine(
				colorize({ level: true }),
				winston.format.simple(),
				timestamp(),
				printf(({ level, message, label, timestamp = new Date().toISOString() }) => {
					return `${timestamp} ${level} --- ${label ? `[${chalk.cyan(label)}]:` : ''} ${message}`;
				})
			), 
		}),
		new winston.transports.File({ 
			filename: 'logs/combined.log', 
			format: combine(
				winston.format.simple(),
				timestamp(),
				printf(({ level, message, label, timestamp = new Date().toISOString() }) => {
					return `${timestamp} ${level} --- ${label ? `[${label}]` : ''} ${message}`;
				})
		    ),
		}),
	],
	exitOnError: false,
});

logger.child = () => logger;

// @ts-ignore
global.logger = logger;