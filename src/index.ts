import { ActivityType, Client } from 'discord.js';
import config from '../config.json';
import { Logger } from './logger';
import init from './events';

const client = new Client({
    intents: [
        'GuildMembers',
        'GuildPresences',
        'GuildInvites',
        'Guilds',
        'GuildVoiceStates',
        'GuildMessages',
        'MessageContent'
    ]
});

client.on('ready', (me) => {
    Logger.log(`Logged in as ${ me.user.username }`);
    me.user.setActivity({
        name: `/${ config.presenceVanityRep.vanity }`,
        type: ActivityType.Watching
    });
    Logger.log('Applied activity.');
});


void init(client);

client.login(process.env.TOKEN || config.token).catch(() => {
    Logger.error(`Failed to find token under "process.env.TOKEN" or "config.token"`);
});