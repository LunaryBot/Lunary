import { FastifyReply } from 'fastify';
import { Logger } from 'winston';

import Client from '../structures/LunaryClient';

export {};

declare global {
    interface String {
        shorten(length: number): string;
        toTitleCase(): string;
        checkSimilarityStrings(string: string): number;
        removeAccents(): string;
    }
    
    const logger: Logger;
    type LunaryClient = Client;
    type RequestResponse = FastifyReply;
}