import { FastifyReply } from 'fastify';
import { Logger } from 'winston';

import Client from '../structures/LunaryClient';

export {};

declare global {
    const logger: Logger;
}