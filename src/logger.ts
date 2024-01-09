import chalk from 'chalk';

export const Logger = {
    log: (message: unknown, ...optionalData: unknown[]) => {
        console.log(
            `${ chalk.green('LOG') } ${ chalk.bgGreen(`${ new Date().toLocaleString() }`) }`,
            message,
            ...optionalData
        );
    },
    warn: (message: unknown, ...optionalData: unknown[]) => {
        console.log(
            `${ chalk.yellow('WARN') } ${ chalk.bgGreen(`${ new Date().toLocaleString() }`) }`,
            message,
            ...optionalData
        );
    },
    error: (message: unknown, ...optionalData: unknown[]) => {
        console.log(
            `${ chalk.red('ERROR') } ${ chalk.bgGreen(`${ new Date().toLocaleString() }`) }`,
            message,
            ...optionalData
        );
    }
};