const Discord = require("discord.js");
const DiscordTypes = require('discord-api-types/v10');
const channelSchema = require('../../../../../lib/database/Schema/Services/PersonalSpace/channel');

module.exports = {
    data: {
        name: "EditChannelName",
    },
    cooldown: {
        time: 1,
        unit: "minutes",
        status: true,
    },
    authorization: {
        status: false,
        users: "",
        roles: "",
        banned: "",
        usersError: "",
        rolesError: "",
        bannedError: "",
        permissions: "",
        permissionsError: "",
    },
    /**
     * @param {Discord.ModalSubmitInteraction} interaction 
     * @param {Discord.TextInputComponent[]} data
     * @param {Discord.Client} client 
     */
    execute: async (interaction, data, client) => {

        const name = interaction.fields.getTextInputValue('ChannelName');
        const database = await channelSchema.findOne({ userId: interaction.user.id, guildId: interaction.guild.id });

        const channel = client.channels.cache.get(database.voiceChannelId);

        if (name.length > 124) {
            const NameErrorEmbed = new Discord.EmbedBuilder()
                .setColor('#cc0000')
                .setAuthor({ name: 'Naming Error', iconURL: interaction.user.avatarURL() })
                .setDescription('The channel name cannot be longer than 124 characters.')
                .setTimestamp()
                .setFooter({ text: 'Please choose another new name.' });
            return interaction.reply({ embeds: [NameErrorEmbed], ephemeral: true });
        }

        const PromptEmbed = new Discord.EmbedBuilder()
            .setColor('616def')
            .setAuthor({ name: 'Change Confirmation', iconURL: interaction.user.displayAvatarURL() })
            .setDescription(`Are you sure you want to change the name of your channel?`)
            .setFields([
                {
                    name: 'Old Name',
                    value: `${channel.name}`,
                    inline: true
                },
                {
                    name: 'New Name',
                    value: `﹕✿﹕${name}`,
                    inline: true
                }
            ])
            .setTimestamp()
            .setFooter({ text: 'You have 30 seconds to confirm this action.' });
        const buttons = [
            new Discord.ButtonBuilder()
                .setCustomId('confirm')
                .setStyle(DiscordTypes.ButtonStyle.Primary)
                .setLabel('Confirm'),
            new Discord.ButtonBuilder()
                .setCustomId('cancel')
                .setStyle(DiscordTypes.ButtonStyle.Secondary)
                .setLabel('Cancel'),
        ]
        const component = new Discord.ActionRowBuilder()
            .addComponents(buttons)
        const prompt = await interaction.reply({ embeds: [PromptEmbed], components: [component], fetchReply: true, ephemeral: true });

        prompt.awaitMessageComponent({
            time: 30000,
            filter: (i) => i.user.id === interaction.user.id,
            componentType: DiscordTypes.ComponentType.Button,
        }).then(async (i) => {
            if (i.customId === 'confirm') {
                channel.setName(`﹕✿﹕${name}`);
                const ConfirmEmbed = new Discord.EmbedBuilder()
                    .setColor('15D2A7')
                    .setAuthor({ name: 'Channel Name Changed', iconURL: interaction.user.displayAvatarURL() })
                    .setDescription(`The channel name has been changed to **﹕✿﹕${name}**`)
                    .setTimestamp()
                    .setFooter({ text: 'You can only change your channel name once per 1 minute.' });
                await interaction.editReply({ embeds: [ConfirmEmbed], components: [] });
            } else {
                const CancelEmbed = new Discord.EmbedBuilder()
                    .setColor('0dea6c')
                    .setAuthor({ name: 'Change Cancelled', iconURL: interaction.user.displayAvatarURL() })
                    .setDescription(`The channel name has not been changed.`)
                    .setTimestamp()
                    .setFooter({ text: 'You can only change your channel name once per 1 minute.' });
                await interaction.editReply({ embeds: [CancelEmbed], components: [] });
            }
        }).catch(() => {
            const TimeoutEmbed = new Discord.EmbedBuilder()
                .setColor('#CC3300')
                .setAuthor({ name: 'Timeout' })
                .setDescription(`No response received`)
                .setTimestamp()
                .setFooter({ text: `Please try again`, iconURL: displayAvatar })
            return interaction.editReply({ embeds: [TimeoutEmbed], components: [] });
        });
    }
}