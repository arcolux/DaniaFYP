const Discord = require("discord.js");
const DiscordTypes = require('discord-api-types/v10');
const channelSchema = require('../../../../../lib/database/Schema/Services/PersonalSpace/channel');

module.exports = {
    data: {
        name: "EditChannelUserLimit",
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

        const limit = parseInt(interaction.fields.getTextInputValue('UserLimit'));
        const database = await channelSchema.findOne({ userId: interaction.user.id, guildId: interaction.guild.id });

        const channel = client.channels.cache.get(database.voiceChannelId);

        if (limit < 0) {
            const NameErrorEmbed = new Discord.EmbedBuilder()
                .setColor('#cc0000')
                .setAuthor({ name: 'Limit Value Error', iconURL: interaction.user.avatarURL() })
                .setDescription('The limit cannot be lower than 0 user.')
                .setTimestamp()
                .setFooter({ text: 'Please choose another new limit.' });
            return interaction.reply({ embeds: [NameErrorEmbed], ephemeral: true });
        }

        if (limit > 99) {
            const NameErrorEmbed = new Discord.EmbedBuilder()
                .setColor('#cc0000')
                .setAuthor({ name: 'Limit Value Error', iconURL: interaction.user.avatarURL() })
                .setDescription('The limit cannot be greater than 99 users.')
                .setTimestamp()
                .setFooter({ text: 'Please choose another new limit.' });
            return interaction.reply({ embeds: [NameErrorEmbed], ephemeral: true });
        }

        if (isNaN(limit)) {
            const NameErrorEmbed = new Discord.EmbedBuilder()
                .setColor('#cc0000')
                .setAuthor({ name: 'Limit Value Error', iconURL: interaction.user.avatarURL() })
                .setDescription('The limit must be a number.')
                .setTimestamp()
                .setFooter({ text: 'Please choose another new limit.' });
            return interaction.reply({ embeds: [NameErrorEmbed], ephemeral: true });
        }

        const PromptEmbed = new Discord.EmbedBuilder()
            .setColor('616def')
            .setAuthor({ name: 'Change Confirmation', iconURL: interaction.user.displayAvatarURL() })
            .setDescription(`Are you sure you want to change the user limit of your channel?`)
            .setFields([
                {
                    name: 'Old User Limit',
                    value: `${channel.userLimit} Users`,
                    inline: true
                },
                {
                    name: 'New User Limit',
                    value: `${limit} Users`,
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
                channel.setUserLimit(limit);
                const ConfirmEmbed = new Discord.EmbedBuilder()
                    .setColor('15D2A7')
                    .setAuthor({ name: 'Channel User Limit Changed', iconURL: interaction.user.displayAvatarURL() })
                    .setDescription(`The channel user limit has been changed to **${limit}**.`)
                    .setTimestamp()
                    .setFooter({ text: `Requested by ${interaction.user.username}` });
                await interaction.editReply({ embeds: [ConfirmEmbed], components: [] });
            } else {
                const CancelEmbed = new Discord.EmbedBuilder()
                    .setColor('0dea6c')
                    .setAuthor({ name: 'Change Cancelled', iconURL: interaction.user.displayAvatarURL() })
                    .setDescription(`The channel user limit has not been changed.`)
                    .setTimestamp()
                    .setFooter({ text: `Requested by ${interaction.user.username}` });
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