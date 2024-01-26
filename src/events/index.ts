import type { Awaitable, Client } from 'discord.js';
import { lstatSync, readdirSync } from 'fs';
import { Logger } from '../logger';
import { Events } from '../types/Event';

function walk(directory: string, outData: string[] = []): string[] {
    const files = readdirSync(directory);

    for(let i = 0; i < files.length; i++) {
        const file = files[i];
        let path = `${ directory }/${ file }`;

        if((file.endsWith('.js') || file.endsWith('.ts'))) {
            outData.push(path);
        }
        else if(lstatSync(path).isDirectory()) {
            return walk(directory, outData);
        }
    }

    return outData;
}

export default async function init(client: Client): Promise<void> {
    let files = walk(__dirname);
    files = files.filter((file) => !file.includes('index'));

    Logger.log('Fetched event file paths', files);

    if(files.length === 0) {
        Logger.error('MAIN::EVENTS', 'There were no events to register, skipping init');
        return;
    }

    for(let i = 0; i < files.length; i++) {
        const file = files[i];

        // ew
        const events = (await import(file) as { default: Events<any>; }).default;
        Logger.log(`events:`, events);
        for(let j = 0; j < events.length; j++) {
            const event = events[j];
            
            if(!event.enabled) {
                Logger.log('MAIN::EVENTS', `Skipping event ${ event.on } because it was disabled.`);
                continue;
            }

            Logger.log('MAIN::EVENTS', `Registered event ${ event.on } from ${ file.substr(file.lastIndexOf('/'), file.length) }`);
            client.on(event.on, event.listener.bind(event) as (...args: any) => Awaitable<any>);
        }
    }
}
