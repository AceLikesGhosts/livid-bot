import type { ChatInputCommandInteraction, RESTPostAPIChatInputApplicationCommandsJSONBody } from 'discord.js';

export type Command = {
    data: RESTPostAPIChatInputApplicationCommandsJSONBody,
    execute: (interaction: ChatInputCommandInteraction) => unknown;
};