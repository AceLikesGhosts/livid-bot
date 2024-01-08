import config from '../../config.json';
const { enabled } = config.voiceChatTTS;

import { ChannelType, TextChannel, User } from 'discord.js';
import { Events } from '../types/Event';

import { AudioPlayerStatus, NoSubscriberBehavior, VoiceConnection, createAudioPlayer, createAudioResource, getVoiceConnection, joinVoiceChannel } from '@discordjs/voice';
import { Logger } from '../logger';

import ngtts from 'node-gtts';
const gtts = new ngtts('en');

/** seconds 👇 */
const DISCONNECT_TIME = 15 * 1000;

let dcTimer: NodeJS.Timeout | null;
let lastSpeaker: User;

export default [
    {
        on: 'messageCreate',
        enabled,
        async listener(message) {
            // don't care! we only want to TTS voice chat channel messages
            if(message.channel.type !== ChannelType.GuildVoice || !message.guild?.id || message.author.bot) {
                return;
            }

            if(config.voiceChatTTS.inVCOnly && !message.member?.voice.channel || message.member?.voice.channel !== message.channel) {
                // Simply react to inform them that their message was not read VIA TTS.
                await message.react(':x:');
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

            let ttsMessage: string;
            if(lastSpeaker === message.author) {
                ttsMessage = message.cleanContent;
            }
            else {
                lastSpeaker = message.author;
                ttsMessage = `${ message.member?.displayName } said ${ message.cleanContent }`;
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