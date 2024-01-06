import status from '../commands/status';
import { Events } from '../types/Event';
import type { ChatInputCommandInteraction } from 'discord.js';

// TODO: proper command listener
export default [
    {
        on: 'interactionCreate',
        enabled: true,
        listener(interaction) {
            if(!interaction.isChatInputCommand() && !interaction.isCommand()) {
                return;
            }

            if(interaction.commandName === 'status') {
                return void status.execute(interaction as ChatInputCommandInteraction);
            }
        },
    }
] satisfies Events<['interactionCreate']>;