import { ActivityType, type Presence } from 'discord.js';
import chalk from 'chalk';
import { Logger } from '../logger';
import config from '../../config.json';
import { Events } from '../types/Event';
import { isAllowedToRunByFeatureToggle } from '.';
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
            if(!isAllowedToRunByFeatureToggle('presenceVanityRep')) return;

            const member = np.member;
            if(!member) {
                Logger.warn('vanityRep', `Recieved presenceUpdate for ${ np } but .member was not found`, np);
                return;
            }

            const newHas = hasPresence(np);
            if(newHas) {
                if(member.roles.cache.has(repRoleId)) {
                    Logger.warn('vanityRep', `${ member.user.username } had vanity rep role yet just added status`, member.roles.cache.has(repRoleId), newHas);
                    return;
                }

                member.roles.add(repRoleId);
                Logger.log('vanityRep', `Added REP_ROLE_ID to user ${ member.user }`);
                return;
            }

            if(!op) {
                return;
            }

            const oldHas = hasPresence(op);
            if(oldHas && !newHas) {
                if(!member.roles.cache.has(repRoleId)) {
                    Logger.warn('vanityRep', `${ member.user.username } did not have vanity rep role yet just removed status`, member.roles.cache.has(repRoleId), newHas);
                    return;
                }

                member.roles.remove(repRoleId);
                Logger.log('vanityRep', `Removed REP_ROLE_ID from ${ member.user.username }`);
            }
        }
    }
] satisfies Events<['presenceUpdate']>;