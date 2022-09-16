import { FastifyReply } from 'fastify';
import { Logger } from 'winston';

import Client from '../structures/LunaryClient';

export {};

declare global {
    interface String {
        checkSimilarityStrings(string: string): number;
        firstCharInLowerCase(): string;
        isLowerCase(): boolean;
        isUpperCase(): boolean;
        removeAccents(): string;
        shorten(length: number): string;
        toTitleCase(): string;
    }

    interface Object {
        static isObject(val: any): boolean;
    }
    
    const logger: Logger;
    type LunaryClient = Client;
    type RequestResponse = FastifyReply;
}