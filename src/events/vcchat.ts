import config from '../../config.json';
const { enabled } = config.voiceChatTTS;

import { ChannelType, Message, TextChannel, User } from 'discord.js';
import { Events } from '../types/Event';

import { AudioPlayerStatus, NoSubscriberBehavior, VoiceConnection, createAudioPlayer, createAudioResource, getVoiceConnection, joinVoiceChannel } from '@discordjs/voice';
import { Logger } from '../logger';

import ngtts from 'node-gtts';
const gtts = new ngtts('en');

/** seconds 👇 */
const DISCONNECT_TIME = 15 * 1000;

let dcTimer: NodeJS.Timeout | null;
let lastSpeaker: User;

/**
 * Takes a message and returns a clean version of the content in
 * order to play it VIA TTS
 */
function parseContent(message: Message): string {
    //<:trolldog:1164159121466073119>
    let content = message.cleanContent; // parses mentions

    const results = content.match(/<(a:|:)\w+:\d+>/g);
    if(!results) return content;
    for(let i = 0; i < results?.length; i++) {
        const result = results[i];
        const split = result.split(':');
        if(!split[1]) continue;

        content.replace(result, split[1]);
    }

    return content;
}

export default [
    {
        on: 'messageCreate',
        enabled,
        async listener(message) {
            // don't care! we only want to TTS voice chat channel messages
            if(message.channel.type !== ChannelType.GuildVoice || !message.guild?.id || message.author.bot) {
                return;
            }

            if(config.voiceChatTTS.inVCOnly && !message.member?.voice?.channel || message.member?.voice?.channel !== message.channel) {
                // Simply react to inform them that their message was not read VIA TTS.
                Logger.log(`[VcChat]: ${ message.author.username } tried to send a message while not in the voice channel`);
                await message.react('❌');
                return;
            }

            if(config.voiceChatTTS.ttsban.enabled && message.member.roles.cache.has(config.voiceChatTTS.ttsban.roleId)) {
                Logger.log(`[VcChat]: ${ message.author.username } tried to send a message while TTS banned`);
                await message.react('❌');
                return;
            }

            let connection: VoiceConnection = getVoiceConnection(message.channel.id)! || joinVoiceChannel({
                channelId: message.channel.id,
                guildId: message.guild!.id,
                adapterCreator: message.guild!.voiceAdapterCreator
            });

            clearTimeout(dcTimer!);
            dcTimer = null;

            const player = createAudioPlayer({
                behaviors: {
                    noSubscriber: NoSubscriberBehavior.Pause,
                },
            });

            const content = parseContent(message);
            let ttsMessage: string;
            if(lastSpeaker === message.author) {
                ttsMessage = content;
            }
            else {
                lastSpeaker = message.author;
                ttsMessage = `${ message.member?.displayName } said ${ content }`;
            };


            const resource = createAudioResource(gtts.stream(ttsMessage));

            connection?.subscribe(player);
            Logger.log(`playing message "${ ttsMessage }" by ${ message.member?.displayName }`);
            player.play(resource);

            player.on('stateChange', (_, state) => {
                if(state.status === AudioPlayerStatus.Idle) {
                    Logger.log(`set disconnect timeout to 15 seconds`);
                    if(connection) {
                        dcTimer = setTimeout(() => {
                            Logger.log(`disconnected from vc ${ (message.channel as TextChannel).name || 'UNKNOWN? (left while playing)' } (${ message.channel.id }, ${ message.guild?.id })`);
                            connection.destroy();
                        }, DISCONNECT_TIME);
                    }
                }
            });
        },
    }
] satisfies Events<['messageCreate']>;