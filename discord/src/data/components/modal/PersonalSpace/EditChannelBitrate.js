const Discord = require("discord.js");
const DiscordTypes = require('discord-api-types/v10');
const channelSchema = require('../../../../../lib/database/Schema/Services/PersonalSpace/channel');

module.exports = {
    data: {
        name: "EditChannelBitRate",
    },
    cooldown: {
        time: 1,
        unit: "minutes",
        status: false,
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

        const bitrate = parseInt(interaction.fields.getTextInputValue('BitRate')) * 1000;
        const database = await channelSchema.findOne({ userId: interaction.user.id, guildId: interaction.guild.id });

        const channel = client.channels.cache.get(database.voiceChannelId);

        if (bitrate < (8 * 1000)) {
            const NameErrorEmbed = new Discord.EmbedBuilder()
                .setColor('#cc0000')
                .setAuthor({ name: 'Bitrate Value Error', iconURL: interaction.user.avatarURL() })
                .setDescription('The bitrate cannot be lower than 8 kbps.')
                .setTimestamp()
                .setFooter({ text: 'Please choose another new bitrate.' });
            return interaction.reply({ embeds: [NameErrorEmbed], ephemeral: true });
        }

        if (bitrate > (128 * 1000)) {
            const NameErrorEmbed = new Discord.EmbedBuilder()
                .setColor('#cc0000')
                .setAuthor({ name: 'Bitrate Value Error', iconURL: interaction.user.avatarURL() })
                .setDescription('The bitrate cannot be greater than 128 kbps.')
                .setTimestamp()
                .setFooter({ text: 'Please choose another new bitrate.' });
            return interaction.reply({ embeds: [NameErrorEmbed], ephemeral: true });
        }

        if (isNaN(bitrate)) {
            const NameErrorEmbed = new Discord.EmbedBuilder()
                .setColor('#cc0000')
                .setAuthor({ name: 'Bitrate Value Error', iconURL: interaction.user.avatarURL() })
                .setDescription('The bitrate must be a number.')
                .setTimestamp()
                .setFooter({ text: 'Please choose another new bitrate.' });
            return interaction.reply({ embeds: [NameErrorEmbed], ephemeral: true });
        }

        const PromptEmbed = new Discord.EmbedBuilder()
            .setColor('616def')
            .setAuthor({ name: 'Change Confirmation', iconURL: interaction.user.displayAvatarURL() })
            .setDescription(`Are you sure you want to change the bitrate of your channel?`)
            .setFields([
                {
                    name: 'Old Bitrate',
                    value: `${channel.bitrate / 1000} kbps`,
                    inline: true
                },
                {
                    name: 'New Bitrate',
                    value: `${bitrate / 1000} kbps`,
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
                channel.setBitrate(bitrate);
                const ConfirmEmbed = new Discord.EmbedBuilder()
                    .setColor('15D2A7')
                    .setAuthor({ name: 'Channel Bitrate Changed', iconURL: interaction.user.displayAvatarURL() })
                    .setDescription(`The channel bitrate has been changed to **${bitrate / 1000}** kbps.`)
                    .setTimestamp()
                    .setFooter({ text: 'You can only change your channel bitrate once per 1 minutes.' });
                await interaction.editReply({ embeds: [ConfirmEmbed], components: [] });
            } else {
                const CancelEmbed = new Discord.EmbedBuilder()
                    .setColor('0dea6c')
                    .setAuthor({ name: 'Change Cancelled', iconURL: interaction.user.displayAvatarURL() })
                    .setDescription(`The channel bitrate has not been changed.`)
                    .setTimestamp()
                    .setFooter({ text: 'You can only change your channel name once per 1 minutes.' });
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