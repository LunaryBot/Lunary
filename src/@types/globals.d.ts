import { Logger } from 'winston';
import Apollo from '../server/Apollo';

interface MyLogger extends Logger {
    readonly graphql: LeveledLogMethod;
}

export {};

declare global {
    interface String {
        shorten(length: number): string;
        toTitleCase(): string;
        checkSimilarityStrings(string: string): number;
    }
    
    var logger: MyLogger;
}