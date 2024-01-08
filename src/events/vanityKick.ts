import type { Vanity } from 'discord.js';
import { Events } from '../types/Event';
import { Logger } from '../logger';
import { vanityJoinKick } from '../../config.json';
const { enabled, guildId } = vanityJoinKick;

let vanity: Vanity;

export default [
    {
        on: 'guildMemberAdd',
        enabled,
        async listener(member) {
            // wasn't our guild with vanity/what we're watching, we don't care!
            if(member.guild.id !== guildId) return;

            const currentVanity = await member.guild.fetchVanityData();

            if(vanity.uses < currentVanity.uses) {
                // assume this is the newest join via invite
                Logger.log(`[VanityKick]: Overriding old vanity with new`, vanity, currentVanity);
                vanity = currentVanity;

                Logger.log(`[VanityKick]: ${ member.user.username } joined via Vanity`);

                await member.send({
                    embeds: [{
                        title: 'Vanity joining is not permitted',
                        description: `At the moment, joining through /${ vanity.code } is not permitted, if you know someone **WITHIN** the server ask them for a personal invite.`,
                        footer: {
                            text: `@ ${ new Date().toUTCString() } via ${ member.client.user.username }`
                        }
                    }]
                }).catch(() => Logger.error(`Failed to send message to ${member.user.username}`));
                await member.kick(`Joined through Vanity.`);
                return;
            }

            Logger.log(`[VanityKick]: ${member.user.username} joined via none vanity invite`);
        },
    },
    {
        on: 'ready',
        enabled,
        async listener(client) {
            Logger.log('[VanityKick]: Fetching guild');
            const guild = await client.guilds.fetch(guildId);
            if(!guild) {
                throw new Error(`[VanityKick]: Failed to fetch guild with id ${ guildId }`);
            }

            Logger.log(`[VanityKick]: Fetching vanity for ${ guild.name }`);
            vanity = await guild.fetchVanityData();
            Logger.log(`[VanityKick]: Fetched and bound vanity (${ vanity.uses } uses, /${ vanity.code })`);
        },
    }
] as Events<['guildMemberAdd', 'ready']>;