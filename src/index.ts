import { ActivityType, Client } from 'discord.js';
import config from '../config.json';
import { Logger } from './logger';
import init from './events';

export const ToggleableFeatures = new Map<string, boolean>();
ToggleableFeatures.set('presenceVanityRep', config.presenceVanityRep.enabled);
ToggleableFeatures.set('vanityJoinKick', config.vanityJoinKick.enabled);
ToggleableFeatures.set('voiceChatTTS', config.voiceChatTTS.enabled);

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
    Logger.log('MAIN', `Logged in as ${ me.user.username }`);

    if(config.vanity.enabled && config.vanity.link) {
        me.user.setActivity({
            name: `/${ config.vanity.link }`,
            type: ActivityType.Watching
        });
    }
    else {
        me.user.setActivity({
            name: '>~<',
            type: ActivityType.Competing
        });
    }

    Logger.log('MAIN', 'Applied activity.');
});


void init(client);

client.login(process.env.TOKEN || config.token).catch(() => {
    Logger.error('MAIN', `Failed to find token under "process.env.TOKEN" or "config.token"`);
});