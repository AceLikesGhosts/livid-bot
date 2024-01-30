import { APIApplicationCommandOptionChoice, GuildMember, PermissionsBitField, SlashCommandBuilder } from 'discord.js';
import { Command } from '../types/Command';
import { ToggleableFeatures } from '..';

export default {
    data: new SlashCommandBuilder()
        .setName('toggle')
        .setDescription('Enables or disables a feature of Livid.')
        .setDefaultMemberPermissions(0x8)
        .addStringOption(opt =>
            opt.setName('feature')
                .setDescription('The feature to toggle on or off.')
                .setRequired(true)
                .addChoices(
                    ...Array.from(ToggleableFeatures).map((k) => {
                        // k[0]                == feature name
                        // k[1]['description'] == description
                        // k = [ [ 'name', { enabled: false, description: 'whatever' } ] ]

                        return { name: k[0], value: k[0] };
                    }) as any // ^ APIApplicationCommandOptionChoice<string>[]
                )
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

        const featureName = interaction.options.getString('feature', true);
        const isEnabled = ToggleableFeatures.get(featureName)!;

        await interaction.reply({
            embeds: [{
                title: `Toggled ${ featureName } ${ !isEnabled ? 'on' : 'off' }`,
            }]
        });

        ToggleableFeatures.set(featureName, !isEnabled);
    },
} satisfies Command;