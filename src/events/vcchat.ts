import config from '../../config.json';
const { enabled } = config.voiceChatTTS;

import { ChannelType, InternalDiscordGatewayAdapterCreator, Message, TextChannel, User } from 'discord.js';
import { Events } from '../types/Event';

import { AudioPlayer, AudioPlayerStatus, NoSubscriberBehavior, VoiceConnection, VoiceConnectionStatus, createAudioPlayer, createAudioResource, getVoiceConnection, joinVoiceChannel } from '@discordjs/voice';
import { Logger } from '../logger';

import ngtts from 'node-gtts';
const gtts = new ngtts('en');

/** seconds 👇 */
const DISCONNECT_TIME = 15 * 1000;
const NOT_ALLOWED_ALONE_CHARS = ['!', '(', ')', '[', ']', '¿', '?', '.', ',', ';', ':', '—', '«', '»', '\\'];
const PHONETIC_VERSION = ['exclamation mark', 'left parenthese', 'right parenthese', 'left bracket', 'right bracket', 'question mark', 'question mark', 'period', 'comma', 'semi colon', 'colon', 'hypen', 'left double arrow', 'right double arrow', 'back slash'];

let dcTimer: NodeJS.Timeout | null;
let lastSpeaker: User;

let isSpeaking: boolean = false;
let queue: { message: Message; }[] = [];

/**
 * Takes a message and returns a clean version of the content in
 * order to play it VIA TTS
 */
function parseContent(message: Message): string {
    //<:trolldog:1164159121466073119>
    let content = message.cleanContent; // parses mentions

    if(message.attachments && message.attachments.size >= 1) {
        content += ` ${ message.attachments.size } attachments`;
    }

    const indexOfNotAllowedChar = NOT_ALLOWED_ALONE_CHARS.indexOf(content);
    if(content.length === 1 && indexOfNotAllowedChar !== -1) {
        content = PHONETIC_VERSION[indexOfNotAllowedChar];
    }

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

async function playNextInQueue(): Promise<void> {
    if(queue.length <= 0) {
        Logger.log(`[VcChat]: Hit bottom of queue`);
        return;
    }

    const now = queue.splice(0, 1)[0]; // gets first element, and shifts everything
    Logger.log(`[VcChat]: Playing message from queue (${ now.message.author.username } | ${ now.message.cleanContent })`);
    return play(now.message);
}

function connectToVC(channelId: string, guildId: string, voiceAdapterCreator: InternalDiscordGatewayAdapterCreator): [VoiceConnection, AudioPlayer] {
    const connection: VoiceConnection = getVoiceConnection(channelId)! || joinVoiceChannel({
        channelId: channelId,
        guildId: guildId,
        adapterCreator: voiceAdapterCreator
    });

    if(dcTimer !== null) {
        clearTimeout(dcTimer!);
        dcTimer = null;
    }

    const player = createAudioPlayer({
        behaviors: {
            noSubscriber: NoSubscriberBehavior.Pause,
        },
    });

    return [connection, player];
}

function play(message: Message): void {
    if(isSpeaking) {
        Logger.log(`[VcChat]: Added message by ${ message.author.username } to queue (${ message.cleanContent })`);
        queue.push({ message: message });
        return;
    }
    
    if(dcTimer !== null) {
        clearTimeout(dcTimer!);
        dcTimer = null;
    }

    const [connection, player] = connectToVC(message.channel.id, message.guild!.id, message.guild!.voiceAdapterCreator);

    const content = parseContent(message);
    let ttsMessage: string;

    if(lastSpeaker === message.author) {
        ttsMessage = content;
    }
    else {
        ttsMessage = `${ message.member?.displayName } said ${ content }`;
    };
    lastSpeaker = message.author;

    const resource = createAudioResource(gtts.stream(ttsMessage));

    connection?.subscribe(player);
    Logger.log(`[VcChat]: playing message "${ ttsMessage }" by ${ message.member?.displayName }`);
    player.play(resource);
    isSpeaking = true;

    player.on('stateChange', async (_, state) => {
        if(state.status === AudioPlayerStatus.Idle) {
            isSpeaking = false;
            await playNextInQueue();
            if(connection && connection.state.status !== VoiceConnectionStatus.Destroyed) {
                Logger.log(`[VcChat]: set disconnect timeout to 15 seconds`);
                dcTimer = setTimeout(() => {
                    if(connection.state.status === VoiceConnectionStatus.Destroyed) return Logger.error(`[VcChat]: almost attempted to destory Connection while it's already destroyed, wtf?`);
                    Logger.log(`[VcChat]: disconnected from vc ${ (message.channel as TextChannel)?.name || 'UNKNOWN? (left while playing)' } (${ message.channel.id }, ${ message.guild?.id })`);
                    connection.destroy();
                }, DISCONNECT_TIME);
            }
        }
    });
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

            return play(message);
        },
    }
] satisfies Events<['messageCreate']>;