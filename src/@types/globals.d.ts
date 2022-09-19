import { FastifyReply } from 'fastify';
import { Logger } from 'winston';

import Client from '../structures/LunaryClient';

export {};

declare global {
    interface Number {
        formatUnits(allowned?: Array<'K' | 'M' | 'bi' | 'tri'>): string;
    }

    interface Object {
        static isObject(val: any): boolean;
    }

    interface String {
        checkSimilarityStrings(string: string): number;
        firstCharInLowerCase(): string;
        isLowerCase(): boolean;
        isUpperCase(): boolean;
        removeAccents(): string;
        shorten(length: number): string;
        toTitleCase(): string;
    }
    
    const logger: Logger;
    type LunaryClient = Client;
    type RequestResponse = FastifyReply;
}