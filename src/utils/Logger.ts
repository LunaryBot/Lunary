import chalk from 'chalk';

interface ILoogerOptions {
    tags: string[];
    date: boolean;
    error?: boolean;
}

class Logger {
    public get log() {
        return Logger.log;
    }

    public static log(message: string, options: ILoogerOptions = { tags: [], date: true, error: false }) {
        const tags = options?.tags?.length > 0 ? chalk.cyan(`[${options.tags?.join('] [')}]`) : '';
        const date = options?.date ? chalk.blue(`[${new Date().toLocaleString()}]`) : '';

        console.log(`${tags} ${date} ${chalk[options?.error ? 'red' : 'magenta'](message)}`);
    };
}

export default Logger;