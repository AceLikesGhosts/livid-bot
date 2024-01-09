import { ActivityType, type Presence } from 'discord.js';
import chalk from 'chalk';
import { Logger } from '../logger';
import config from '../../config.json';
import { Events } from '../types/Event';
const { enabled, repRoleId } = config.presenceVanityRep;
const { link: vanity } = config.vanity;

const validStates = [`/${ vanity }`, `.gg/${ vanity }`, `gg/${ vanity }`];
const hasPresence = (presence: Presence) => {
    const customActivity = presence.activities.find((activity) => activity.type === ActivityType.Custom);
    for(let i = 0; i < validStates.length; i++) {
        if(customActivity?.state?.includes(validStates[i])) {
            return true;
        }
    }

    return false;
};

export default [
    {
        on: 'presenceUpdate',
        enabled,
        listener: (op, np) => {
            const member = np.member;
            if(!member) {
                Logger.warn(`[Presence]: Recieved presenceUpdate for ${ np } but .member was not found`, np);
                return;
            }

            const newHas = hasPresence(np);
            if(newHas) {
                if(member.roles.cache.has(repRoleId)) {
                    Logger.warn(chalk.yellow(`[Presence]: Discord sent weird data? User had REP_ROLE_ID yet just now added vanity to presence.`));
                    return;
                }

                member.roles.add(repRoleId);
                Logger.log(`[Presence]: Added REP_ROLE_ID to user ${ member.user }`);
                return;
            }

            if(!op) {
                return;
            }

            const oldHas = hasPresence(op);
            if(oldHas && !newHas) {
                if(!member.roles.cache.has(repRoleId)) {
                    Logger.warn(chalk.yellow(`[Presence]: Discord sent weird data? User did not have REP_ROLE_ID yet removed the vanity from their bio with their old having it?`));
                    return;
                }

                member.roles.remove(repRoleId);
                Logger.log(`[Presence]: Removed REP_ROLE_ID from ${ member.user }`);
            }
        }
    }
] satisfies Events<['presenceUpdate']>;