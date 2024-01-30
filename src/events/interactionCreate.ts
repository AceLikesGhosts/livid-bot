import toggle from '../commands/toggle';
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

            switch(interaction.commandName) {
                case 'status': {
                    return void status.execute(interaction as ChatInputCommandInteraction);
                }
                case 'toggle': {
                    return void toggle.execute(interaction as ChatInputCommandInteraction);
                }
            }
        },
    }
] satisfies Events<['interactionCreate']>;