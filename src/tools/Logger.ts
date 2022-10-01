import chalk from 'chalk';
import winston from 'winston';

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
};

const logger = winston.createLogger({
	levels: config.levels,
	level: 'info',
	transports: [
		new winston.transports.Console({ 
			format: combine(
				colorize({ level: true }),
				winston.format.simple(),
				timestamp(),
				printf(({ level, message, label, timestamp = new Date().toISOString(), details }) => {
					return `${timestamp} ${level} --- ${label ? `[${chalk.cyan(label)}]:` : ''} ${message}${details ? `\n${details}` : ''}`;
				})
			), 
		}),
		new winston.transports.File({ 
			filename: 'logs/combined.log', 
			format: combine(
				winston.format.simple(),
				timestamp(),
				printf(({ level, message, label, timestamp = new Date().toISOString(), details }) => {
					return `${timestamp} ${level} --- ${label ? `[${label}]` : ''} ${message}${details ? `\n${details}` : ''}`;
				})
		    ),
		}),
	],
	exitOnError: false,
});

logger.child = () => logger;

Object.defineProperty(global, 'logger', {
	value: logger,
});