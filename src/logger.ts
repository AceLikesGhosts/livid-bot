import chalk from 'chalk';

export const Logger = {
    log: (prefix: string, message: unknown, ...optionalData: unknown[]) => {
        console.log(
            `${ chalk.green('LOG') } ${ chalk.bgGreen(`${ new Date().toLocaleString() }`) } ${ chalk.magenta(`[${ prefix }]:`) }`,
            message,
            ...optionalData
        );
    },
    warn: (prefix: string, message: unknown, ...optionalData: unknown[]) => {
        console.log(
            `${ chalk.yellow('WARN') } ${ chalk.bgGreen(`${ new Date().toLocaleString() }`) } ${ chalk.magenta(`[${ prefix }]:`) }`,
            message,
            ...optionalData
        );
    },
    error: (prefix: string, message: unknown, ...optionalData: unknown[]) => {
        console.log(
            `${ chalk.red('ERROR') } ${ chalk.bgGreen(`${ new Date().toLocaleString() }`) } ${ chalk.magenta(`[${ prefix }]:`) }`,
            message,
            ...optionalData
        );
    }
};