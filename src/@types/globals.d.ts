import { Logger } from 'winston';
import Apollo from '../server/Apollo';

export {};

declare global {
    interface String {
        shorten(length: number): string;
        toTitleCase(): string;
        checkSimilarityStrings(string: string): number;
    }
    
    var logger: Logger;
}