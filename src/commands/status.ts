import { Activity, ActivityOptions, ActivityType, GuildMember, PermissionsBitField, SlashCommandBuilder } from 'discord.js';
import { Command } from '../types/Command';

export default {
    data: new SlashCommandBuilder()
        .setName('status')
        .setDescription('Changes the status of the bot.')
        .setDefaultMemberPermissions(0x8)
        .addStringOption(opt =>
            opt.setName('status_type')
                .setDescription('The type of the status (prefix)')
                .setRequired(true)
                .addChoices(
                    { name: 'Playing', value: ActivityType.Playing.toString() },
                    { name: 'Listening', value: ActivityType.Listening.toString() },
                    { name: 'Watching', value: ActivityType.Watching.toString() },
                    { name: 'Streaming', value: ActivityType.Streaming.toString() },
                )
        )
        .addStringOption(opt =>
            opt.setName('message')
                .setDescription('The message of the status')
                .setMaxLength(150)
                .setRequired(true)
        )
        .addStringOption(opt =>
            opt.setName('url')
                .setDescription('The Twitch URL (agiven Streaming was set as status type)')
                .setRequired(false)
        )
        .toJSON(),
    async execute(interaction) {
        if(!interaction.member) {
            return;
        }

        if(!(interaction.member as GuildMember).permissions.has(PermissionsBitField.Flags.Administrator)) {
            await interaction.reply({
                ephemeral: true, embeds: [{
                    description: ':x: You do not have enough permissions to execute this command.'
                }]
            });
            return;
        }

        const statusType = interaction.options.getString('status_type', true);
        const message = interaction.options.getString('message', true);
        const url = interaction.options.getString('url', false);

        if(statusType === ActivityType.Streaming.toString() && !url) {
            await interaction.reply({
                ephemeral: true, embeds: [{
                    description: `:x: Failed to execute command, missing required argument "url"; the "Streaming" status type requires a valid "https://twitch.tv/,,," link!`
                }]
            });

            return;
        }

        const status = {
            name: message,
            url: url ? url : void 0,
            type: Number(statusType)
        } satisfies ActivityOptions;

        interaction.client.user.setActivity(status);
        await interaction.reply({ ephemeral: true, embeds: [{
            description: `:checkmark: Updated status to ${message}`
        }] })
    },
} satisfies Command;