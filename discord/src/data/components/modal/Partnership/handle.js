const active = new Map();
const { v4: uuid } = require('uuid');
const fs = require('fs');
const Discord = require("discord.js");
const { Util } = require('../../../../../util/util');
const InviteManager = require('../../../../../lib/classes/Utility/InviteManager');
const partner = require('../../../../../lib/database/Schema/Services/Partnership/partner');

module.exports = {
    data: {
        name: "PartnershipForm",
    },
    cooldown: {
        time: 0,
        unit: '',
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

        // TODO: Check for active request
        if (active.has(interaction.user.id)) {
            const ActiveEmbed = new Discord.EmbedBuilder()
                .setColor('Red')
                .setAuthor({ name: 'Pending Partnership', iconURL: interaction.user.avatarURL() })
                .setDescription('You still have a pending partnership request.\nPlease confirm or cancel your current request before creating a new one.')
            return interaction.reply({ embeds: [ActiveEmbed], ephemeral: true });
        }

        // TODO: Check for valid invite code
        if (!Util.extractInviteCode(data[0].value)) {
            const InviteInvalidEmbed = new Discord.EmbedBuilder()
                .setColor('Red')
                .setAuthor({ name: 'Partnership Application', iconURL: interaction.guild.iconURL() })
                .setDescription('The invite link you provided is invalid.')
                .setFooter({ text: 'Please submit again with a valid invitation link' }).setTimestamp();
            return interaction.reply({ embeds: [InviteInvalidEmbed], ephemeral: true });
        }

        const code = Util.extractInviteCode(data[0].value);
        const raw = await InviteManager.fetchRawInviteData(code);

        await interaction.reply({ content: 'Processing your submitted invite link ...', ephemeral: true });
        await new Promise((resolve, reject) => setTimeout(resolve, 1000));

        if (raw === 429) {
            const RateLimitEmbed = new Discord.EmbedBuilder()
                .setColor('Red')
                .setAuthor({ name: 'Rate Limit', iconURL: interaction.user.displayAvatarURL() })
                .setDescription(Discord.codeBlock('The server is receiving too many request'))
                .setFooter({ text: 'Please try again later'}).setTimestamp()
            return interaction.editReply({ content: null, embeds: [RateLimitEmbed] });
        }

        if (raw === 404) {
            const InvalidInviteEmbed = new Discord.EmbedBuilder()
                .setColor('Red')
                .setAuthor({ name: 'Partnership Application', iconURL: interaction.guild.iconURL() })
                .setDescription('The invite link that you submit is invalid or expired')
                .setFooter({ text: 'Please submit again with a valid invitation link' }).setTimestamp();
            return interaction.editReply({ content: null, embeds: [InvalidInviteEmbed] });
        }

        const invite = new InviteManager(raw);

        if (invite.approximate_member_count < 10) {
            const MemberLimitEmbed = new Discord.EmbedBuilder()
                .setColor('Red')
                .setThumbnail(Util.createIconURL(invite.guild.id, invite.guild.icon))
                .setAuthor({ name: 'Member Requirement' })
                .setDescription(`**${invite.guild.name}** does not meet 10 members and above requirement.`)
            return interaction.editReply({ content: null, embeds: [MemberLimitEmbed] });
        }

        const query = {
            'guild.id': invite.guild.id
        };

        const result = await partner.findOne(query);

        if (result?.guild.partnered) {
            const ExistEmbed = new Discord.EmbedBuilder()
                .setColor('Red')
                .setAuthor({ name: 'Partnership Notice' })
                .setDescription('The server that you entered already partnered with us.')
                .setFooter({ text: 'Please submit again with a different server' }).setTimestamp();
            return interaction.editReply({ content: null, embeds: [ExistEmbed] });
        }

        const pending = result ? result.guild.pending : false

        if (pending) {
            const ExistEmbed = new Discord.EmbedBuilder()
                .setColor('Red')
                .setAuthor({ name: 'Partnership Notice' })
                .setDescription('This server already applied for partnership and still waiting for approval.')
                .setFooter({ text: 'Please submit again with a different server' }).setTimestamp();
            return interaction.editReply({ content: null, embeds: [ExistEmbed] });
        }

        await interaction.editReply({ content: 'Checking your description ...', embeds: [] })
        await new Promise((resolve, reject) => setTimeout(resolve, 1000));

        if (data[1].value.includes('@everyone')) {
            const EveryoneMentionEmbed = new Discord.EmbedBuilder()
                .setColor('Red')
                .setAuthor({ name: 'Everyone Ping Notice', iconURL: interaction.user.displayAvatarURL() })
                .setDescription(`We do not support ${interaction.guild.roles.everyone.toString()} ping`)
                .setFooter({ text: 'Please remove the everyone ping and try again' })
            return interaction.editReply({ content: null, embeds: [EveryoneMentionEmbed] })
        }

        active.set(interaction.user.id, true);

        const ConfirmationEmbed = new Discord.EmbedBuilder()
            .setColor('Green')
            .setAuthor({ name: 'Partnership Application', iconURL: interaction.user.displayAvatarURL() })
            .setDescription(data[1].value)
            .setImage(invite.guild.bannerURL())
            .setFooter({ text: 'Please confirm your parnership description above before submiting.' })
        const buttons = [
            new Discord.ButtonBuilder()
                .setCustomId('PARTNER_CONFIRM')
                .setStyle(Discord.ButtonStyle.Success)
                .setLabel('Confirm'),
            new Discord.ButtonBuilder()
                .setCustomId('PARTNER_CANCEL')
                .setStyle(Discord.ButtonStyle.Secondary)
                .setLabel('Cancel'),
        ]
        const component = new Discord.ActionRowBuilder()
            .addComponents(buttons)
        const prompt = await interaction.editReply({ content: null, embeds: [ConfirmationEmbed], components: [component], fetchReply: true });

        prompt.awaitMessageComponent({ time: 60000, max: 1 }).then(async (i) => {

            const bufferPath = `./lib/assets/data/Buffer/Partnership/Application/${interaction.user.id}-${invite.guild.id}.txt`;

            fs.writeFile(bufferPath, data[1].value, () => {});
            const channel = client.channels.cache.get(client.constant.channel.partnership.manage);

            if (i.customId === 'PARTNER_CONFIRM') {

                // TODO: Map Manipulation

                const SubmitEmbed = new Discord.EmbedBuilder()
                    .setColor('Green')
                    .setAuthor({ name: 'Partnership Application', iconURL: interaction.user.displayAvatarURL() })
                    .setDescription('Your partnership application has been submitted\nYour application will be reviewed and you will be notified via DM')
                    .setFooter({ text: 'Please ensure you enable your DM' }).setTimestamp()
                interaction.editReply({ embeds: [SubmitEmbed], components: [] });

                // TODO: Wait for staff approval and DM user
                active.delete(interaction.user.id);

                await partner.findOneAndUpdate({
                    'user.id': interaction.user.id,
                    'guild.id': invite.guild.id
                }, {
                    'user.id': interaction.user.id,
                    'user.username': interaction.user.username,
                    'guild.id': invite.guild.id,
                    'guild.pending': true,
                    'guild.invite': invite.url
                }, { upsert: true });

                const attachment = new Discord.AttachmentBuilder(`./lib/assets/data/Buffer/Partnership/Application/${interaction.user.id}-${invite.guild.id}.txt`, { name: `${uuid()}.txt` });

                const ApplicationEmbed = new Discord.EmbedBuilder()
                    .setColor('Yellow')
                    .setAuthor({ name: 'Partnership Approval', iconURL: invite.guild.iconURL() })
                    .setDescription('The applicant server description has been attach above.')
                    .setFields([
                        {
                            name: 'Guild ID',
                            value: Discord.codeBlock(invite.guild.id),
                        },
                        {
                            name: 'Applicant ID',
                            value: Discord.codeBlock(interaction.user.id),
                        },
                        {
                            name: 'Guild Name',
                            value: invite.guild.name,
                            inline: true
                        },
                        {
                            name: 'Applicant Name',
                            value: interaction.user.toString(),
                            inline: true
                        },
                        {
                            name: 'Guild Invite',
                            value: invite.url,
                            inline: true
                        },
                    ])
                    .setImage(invite.guild.splashURL())
                const button = [
                    new Discord.ButtonBuilder()
                        .setCustomId('PARTNER_APPROVE')
                        .setStyle(Discord.ButtonStyle.Success)
                        .setLabel('Approve'),
                    new Discord.ButtonBuilder()
                        .setCustomId('PARTNER_DENY')
                        .setStyle(Discord.ButtonStyle.Danger)
                        .setLabel('Deny'),
                    new Discord.ButtonBuilder()
                        .setCustomId('LOAD_DESC')
                        .setStyle(Discord.ButtonStyle.Secondary)
                        .setLabel('Load Description')
                ]
                const comp = new Discord.ActionRowBuilder()
                    .addComponents(button)
                channel.send({ embeds: [ApplicationEmbed], components: [comp], files: [attachment] });

            } else {

                active.delete(interaction.user.id);

                await partner.findOneAndUpdate({
                    'user.id': interaction.user.id,
                    'guild.id': invite.guild.id
                }, {
                    'user.id': interaction.user.id,
                    'user.username': interaction.user.username,
                    'guild.id': invite.guild.id,
                    'guild.pending': false,
                    'guild.invite': invite.url
                }, { upsert: true });

                const CancelEmbed = new Discord.EmbedBuilder()
                    .setColor('Red')
                    .setAuthor({ name: 'Partnership Application', iconURL: interaction.user.displayAvatarURL() })
                    .setDescription('Your partnership application has been cancelled')
                interaction.editReply({ embeds: [CancelEmbed], components: [] });
            }
        }).catch(async (error) => {
            active.delete(interaction.user.id);
            const TimeoutEmbed = new Discord.EmbedBuilder()
                .setColor('Red')
                .setAuthor({ name: 'Partnership Application', iconURL: interaction.user.displayAvatarURL() })
                .setDescription('You took too long to confirm your application. Please initiate the process again')
            await interaction.editReply({ embeds: [TimeoutEmbed], components: [] });
        })

    }
}