const map = new Map();
const fs = require('fs');
const _ = require('lodash');
const Discord = require('discord.js');
const { Util } = require('../../../../../util/util');
const DiscordType = require('discord-api-types/v10');

/**
 * @type {CacheData}
 */
const cache = { embeds: {}, session: {}, active: {} }

module.exports = {
    data: {
        name                : "embed",
        aliases             : "",
        minArgs             : 0,
        maxArgs             : null,
        expectedArgs        : "",
    },
    cooldown: {
        time    : 0,
        unit    : "",
        type    : "",
        status  : false,
    },
    information         : {
        name            : 'embed',
        category        : "Utility",
        description     : "Create an embed",
        commandType     : "Public",
        permissions     : "Not Available",
        commandUsage    : `embed`,

    },
    authorization: {
        status  : false,
        users   : '',
        roles   : "",
        banned  : "",
        usersError  : "You cannot use this command",
        rolesError  : "",
        bannedError : "",
        permissions : "",
        permissionsError : "",
    },
    /**
     * @param {Discord.Message} message 
     * @param {string[]} arguments
     * @param {string} text
     * @param {Discord.Client} client 
     */
    async execute(message, arguments, text, client) {

        if (map.has(message.author.id) && map.get(message.author.id) === message.channel.id) {
            const ActiveEmbed = new Discord.EmbedBuilder()
                .setColor('Red')
                .setAuthor({ name: 'Active Editor' })
                .setDescription('An editor is still active\nPlease stop it or complete it before making a new one')
            return message.channel.send({ embeds: [ActiveEmbed] })
                .then(message => Util.deleteMessage(message, 5));
        }


        const EditingEmbedBuilder = new Discord.EmbedBuilder()
            .setColor('Random')
            .setAuthor({ name: 'Editing Preview' })
        const SessionEmbed = new Discord.EmbedBuilder()
            .setColor('Red')
            .setAuthor({ name: 'Session Tracker' })
            .setDescription('There is no active session')
            .setFooter({ text: 'Please use the select menu below for editor selection' })
        const button = [
            new Discord.ButtonBuilder()
                .setCustomId('COMPLETE_EMBED_EDITOR')
                .setStyle(3)
                .setLabel('Complete'),
            new Discord.ButtonBuilder()
                .setCustomId('STOP_EMBED_EDITOR')
                .setStyle(4)
                .setLabel('Stop'),
            new Discord.ButtonBuilder()
                .setCustomId('CANCEL_EDITOR_SESSION')
                .setStyle(1)
                .setLabel('Cancel Session'),
        ]
        const menu = [
            new Discord.StringSelectMenuBuilder()
                .setCustomId('EMBED_EDITOR_MENU')
                .setPlaceholder('Select Editor')
                .setOptions(
                    {
                        label: 'Author Name',
                        value: 'EMBED_AUTHOR_NAME_EDITOR',
                    },
                    {
                        label: 'Author URL',
                        value: 'EMBED_AUTHOR_URL_EDITOR',
                    },
                    {
                        label: 'Author Icon',
                        value: 'EMBED_AUTHOR_ICON_EDITOR'
                    },
                    {
                        label: 'Embed Title',
                        value: 'EMBED_TITLE_EDITOR'
                    },
                    {
                        label: 'Embed Description',
                        value: 'EMBED_DESC_EDITOR'
                    },
                    {
                        label: 'Title URL',
                        value: 'EMBED_TITLE_URL_EDITOR',
                    },
                    {
                        label: 'Embed Color',
                        value: 'EMBED_COLOR_EDITOR'
                    },
                    {
                        label: 'Embed Image',
                        value: 'EMBED_IMAGE_EDITOR',
                    },
                    {
                        label: 'Embed Thumbnail Image',
                        value: 'EMBED_THUMBNAIL_IMAGE_EDITOR'
                    },
                    {
                        label: 'Embed Footer Text',
                        value: 'EMBED_FOOTER_TEXT_EDITOR'
                    },
                    {
                        label: 'Embed Footer Icon Image',
                        value: 'EMBED_FOOTER_ICON_EDITOR'
                    },
                    {
                        label: 'Embed Timestamp',
                        value: 'EMBED_TIMESTAMP_EDITOR'
                    }
                )
        ]
        const a = new Discord.ActionRowBuilder()
            .addComponents(button)
        const b = new Discord.ActionRowBuilder()
            .addComponents(menu)
        const initial = await message.channel.send({ embeds: [EditingEmbedBuilder, SessionEmbed], components: [b, a] });

        const data = initial.embeds[0]
        cache.embeds[message.author.id] = data

        const filter = (interaction) => {
            if (interaction.user.id === message.author.id)
            return true
            else {
                interaction.reply({ content: 'Only author can use this interaction', ephemeral: true });
                return false
            }
        }
        const collector = initial.createMessageComponentCollector({ filter, idle: 1000 * 60 * 20 });

        collector.on('collect', async (interaction) => {

            console.log(interaction.customId);

            map.set(message.author.id, message.channel.id);

            if (interaction instanceof Discord.ButtonInteraction) {
                const customId = interaction.customId

                switch (customId) {
                    case 'COMPLETE_EMBED_EDITOR':

                        // TODO: Check for active session
                        if (cache.active[message.author.id]) {
                            const ActiveEmbed = new Discord.EmbedBuilder()
                                .setColor('Red')
                                .setAuthor({ name: 'Active Session' })
                                .setDescription('An editor session is still active.\nPlease complete the session or cancel it.')
                            return interaction.reply({ embeds: [ActiveEmbed], ephemeral: true })
                        }
 
                        // TODO: Prevent user from sending default embed
                        if (_.isEqual(cache.embeds[message.author.id], initial.embeds[0])) {
                            const NoChangesEmbed = new Discord.EmbedBuilder()
                                .setColor('Red')
                                .setAuthor({ name: 'No Changes' })
                                .setDescription('You did not make any changes to the embed yet')
                            return interaction.reply({ embeds: [NoChangesEmbed], ephemeral: true });
                        }

                        interaction.deferUpdate();
                        cache.session[message.author.id] = customId
                        const CompleteEmbed = Discord.EmbedBuilder.from(cache.embeds[message.author.id])

                        const ConfirmationEmbed = new Discord.EmbedBuilder()
                            .setColor('Blurple')
                            .setAuthor({ name: 'Complete Embed' })
                            .setDescription('Nice! Where should I send this embed to?')
                            .setFields([
                                {
                                    name: 'Channel Mention',
                                    value: `Mention the channel into the chat\nExample: ${message.channel.toString()}`,
                                    inline: true
                                },
                                {
                                    name: 'Channel ID',
                                    value: `Input the target channel ID into the chat\nExample: ${message.channel.id}`,
                                    inline: true
                                }
                            ])
                            .setFooter({ text: 'This will automatically send the message into the mentioned channel' })
                        const prompt = await message.channel.send({ embeds: [ConfirmationEmbed] });

                        const filter = m => m.author.id === message.author.id
                        const complete = message.channel.createMessageCollector({ filter, idle: 1000 * 60 });

                        complete.on('collect', async (msg) => {

                            const { content } = msg

                            if (content.toLowerCase() === 'cancel') {
                                complete.stop();
                                Util.deleteMessage(msg, 0.1);
                                prompt.delete().catch(error => {});
                                return cache.session[message.author.id] = false
                            }

                            const a = msg.mentions.channels.first()
                            ,     b = msg.guild.channels.cache.find((channel => channel.id === content))
                            ,     c = msg.guild.channels.cache.find((channel => channel.name === content))
                            const channel = a || b || c

                            if (!channel) {
                                const InvalidChannel = new Discord.EmbedBuilder()
                                    .setColor('Red')
                                    .setAuthor({ name: 'Invalid Channel' })
                                    .setDescription('The input that you provide is not a channel')
                                return msg.channel.send({ embeds: [InvalidChannel] });
                            }

                            Util.deleteMessage(prompt, 0.1);
                            Util.deleteMessage(initial, 0.1);
                            await channel.send({ embeds: [CompleteEmbed] });
                            cache.session[message.author.id] = false

                            const SentEmbed = new Discord.EmbedBuilder()
                                .setColor('Blurple')
                                .setAuthor({ name: 'Embed Sent' })
                                .setDescription('The embed that you created has been sent')
                            msg.channel.send({ embeds: [SentEmbed] }); complete.stop();
                        });

                        complete.on('end', (collected, reason) => {});
                    break;

                    case 'STOP_EMBED_EDITOR':

                        if (cache.active[message.author.id]) {
                            const ActiveEmbed = new Discord.EmbedBuilder()
                                .setColor('Red')
                                .setAuthor({ name: 'Active Session' })
                                .setDescription('An editor session is still active.\nPlease complete the session or cancel it.')
                            return interaction.reply({ embeds: [ActiveEmbed], ephemeral: true })
                        }

                        cache.session[message.author.id] = customId

                        const StopConfirmationEmbed = new Discord.EmbedBuilder()
                            .setColor('DarkGreen')
                            .setAuthor({ name: 'Confirmation' })
                            .setDescription('Are you sure you want to stop this editor.\nYour changes will be lost and cannot be recovered.')
                        const button = [
                            new Discord.ButtonBuilder()
                                .setCustomId('STOP_CONFIRM')
                                .setStyle(DiscordType.ButtonStyle.Danger)
                                .setLabel('Confirm'),
                            new Discord.ButtonBuilder()
                                .setCustomId('STOP_CANCEL')
                                .setStyle(DiscordType.ButtonStyle.Secondary)
                                .setLabel('Cancel'),
                            
                        ]
                        const component = new Discord.ActionRowBuilder()
                            .addComponents(button);
                        const stop = await interaction.reply({ embeds: [StopConfirmationEmbed], components: [component], ephemeral: true, fetchReply: true });

                        stop.awaitMessageComponent({
                            componentType: DiscordType.ComponentType.Button
                        }).then(i => {
                            if (i.customId === 'STOP_CONFIRM') {
                                collector.stop();
                                i.deferUpdate();
                                map.delete(message.author.id);
                                Util.deleteMessage(initial, 0.1);
                                cache.session[message.author.id] = false
                                const StopEmbed = new Discord.EmbedBuilder()
                                    .setColor('DarkBlue')
                                    .setAuthor({ name: 'Session Stop' })
                                    .setDescription('The editor has been stopped successfuly')
                                i.channel.send({ embeds: [StopEmbed], ephemeral: true })
                            } else if (i.customId === 'STOP_CANCEL') {
                                cache.session[message.author.id] = false
                                const StopEmbed = new Discord.EmbedBuilder()
                                    .setColor('DarkBlue')
                                    .setAuthor({ name: 'Stop Cancelled' })
                                    .setDescription('You can continue using the editor')
                                interaction.editReply({ embeds: [StopEmbed], components: [], ephemeral: true })
                            }
                        })

                    break

                    case 'CANCEL_EDITOR_SESSION':
                        if (!cache.session[message.author.id]) {
                            const NotActiveSessionEmbed = new Discord.EmbedBuilder()
                                .setColor('Red')
                                .setAuthor({ name: 'No Active Session' })
                                .setDescription('The is no active editor.\nUse the select menu to activate one.')
                            return interaction.reply({ embeds: [NotActiveSessionEmbed], ephemeral: true });
                        }
                    break;
                }

                return;
            } else if (interaction instanceof Discord.StringSelectMenuBuilder) {
                
                const value = interaction.values[0]

                if (cache.session[interaction.user.id]) {
                    const ActiveSessionEmbed = new Discord.EmbedBuilder()
                        .setColor('Red')
                        .setAuthor({ name: 'Active Session' })
                        .setDescription('A session is still active, please complete it before editing others')
                    return interaction.reply({ embeds: [ActiveSessionEmbed], ephemeral: true });
                }
    
                // TODO: Load the edited embed
                const EditedEmbed = Discord.EmbedBuilder.from(cache.embeds[message.author.id])
    
                switch(value) {

                    case 'EMBED_AUTHOR_NAME_EDITOR':
                        interaction.deferUpdate();
                        cache.active[message.author.id] = true
                        cache.session[interaction.user.id] = value
                        callback({ cache, initial, message, value });

                        const AuthorNameEditorEmbed = new Discord.EmbedBuilder()
                            .setColor('Blurple')
                            .setAuthor({ name: 'Session Tracker' })
                            .setDescription('Author Name Editor is active\n**Enter the text into the chat**')
                            .setFields([
                                {
                                    name: 'Optional',
                                    value: 'Type `none` empty author name',
                                    inline: true
                                },
                                {
                                    name: 'Cancellation',
                                    value: 'Type `cancel` to cancel this section editor',
                                    inline: true
                                }
                            ])
                        initial.edit({ embeds: [EditedEmbed, AuthorNameEditorEmbed] });
                    break;

                    case 'EMBED_AUTHOR_URL_EDITOR':
                        interaction.deferUpdate();
                        cache.active[message.author.id] = true
                        cache.session[interaction.user.id] = value
                        callback({ cache, initial, message, value });

                        const AuthorURLEditorEmbed = new Discord.EmbedBuilder()
                        .setColor('Blurple')
                        .setAuthor({ name: 'Session Tracker' })
                        .setDescription('Author URL Editor is active\n**Please send a valid url for the user to click**')
                        .setFields([
                            {
                                name: 'Optional',
                                value: 'Type `none` for none linked author',
                                inline: true
                            },
                            {
                                name: 'Cancellation',
                                value: 'Type `cancel` to cancel this section editor',
                                inline: true
                            }
                        ])
                        initial.edit({ embeds: [EditedEmbed, AuthorURLEditorEmbed] });
                    break

                    case 'EMBED_AUTHOR_ICON_EDITOR':
                        interaction.deferUpdate();
                        cache.active[message.author.id] = true
                        cache.session[interaction.user.id] = value
                        callback({ cache, initial, message, value });
    
                        const AuthorIconEditorEmbed = new Discord.EmbedBuilder()
                            .setColor('Blurple')
                            .setAuthor({ name: 'Session Tracker' })
                            .setDescription('Author Icon Editor is active\n**Upload an image file or a url into the chat**')
                            .setFields([
                                {
                                    name: 'Optional',
                                    value: 'Type `none` for empty author icon',
                                    inline: true
                                },
                                {
                                    name: 'Cancellation',
                                    value: 'Type `cancel` to cancel this section editor',
                                    inline: true
                                }
                            ])
                        initial.edit({ embeds: [EditedEmbed, AuthorIconEditorEmbed] });
                    break;

                    case 'EMBED_TITLE_EDITOR':
                        interaction.deferUpdate();
                        cache.active[message.author.id] = true
                        cache.session[interaction.user.id] = value
                        callback({ cache, initial, message, value });
    
                        const TitleEditorEmbed = new Discord.EmbedBuilder()
                            .setColor('Blurple')
                            .setAuthor({ name: 'Session Tracker' })
                            .setDescription('Title Editor is active\n**Enter your title into the chat**')
                            .setFields([
                                {
                                    name: 'Optional',
                                    value: 'Type `none` for empty description',
                                    inline: true
                                },
                                {
                                    name: 'Cancellation',
                                    value: 'Type `cancel` to cancel this section editor',
                                    inline: true
                                }
                            ])
                        initial.edit({ embeds: [EditedEmbed, TitleEditorEmbed] });
                    break;

                    case 'EMBED_DESC_EDITOR':
                        interaction.deferUpdate();
                        cache.active[message.author.id] = true
                        cache.session[interaction.user.id] = value
                        callback({ cache, initial, message, value });
    
                        const DescriptionEditorEmbed = new Discord.EmbedBuilder()
                            .setColor('Blurple')
                            .setAuthor({ name: 'Session Tracker' })
                            .setDescription('Description Editor is active\n**Enter your description into the chat**')
                            .setFields([
                                {
                                    name: 'Optional',
                                    value: 'Type `none` for empty description',
                                    inline: true
                                },
                                {
                                    name: 'Cancellation',
                                    value: 'Type `cancel` to cancel this section editor',
                                    inline: true
                                }
                            ])
                        initial.edit({ embeds: [EditedEmbed, DescriptionEditorEmbed] });
                    break;

                    case 'EMBED_TITLE_URL_EDITOR':
                        interaction.deferUpdate();
                        cache.active[message.author.id] = true
                        cache.session[interaction.user.id] = value
                        callback({ cache, initial, message, value });
    
                        const TitleURLEditorEmbed = new Discord.EmbedBuilder()
                            .setColor('Blurple')
                            .setAuthor({ name: 'Session Tracker' })
                            .setDescription('Title URL Editor is active\n**Enter your url into the chat**')
                            .setFields([
                                {
                                    name: 'Optional',
                                    value: 'Type `none` for none linked title',
                                    inline: true
                                },
                                {
                                    name: 'Cancellation',
                                    value: 'Type `cancel` to cancel this section editor',
                                    inline: true
                                }
                            ])
                        initial.edit({ embeds: [EditedEmbed, TitleURLEditorEmbed] });
                    break

                    case 'EMBED_COLOR_EDITOR':
                        interaction.deferUpdate();
                        cache.active[message.author.id] = true
                        cache.session[interaction.user.id] = value
                        callback({ cache, initial, message, value });
    
                        const ColorEditorEmbed = new Discord.EmbedBuilder()
                            .setColor('Blurple')
                            .setAuthor({ name: 'Active Session' })
                            .setDescription('Color Editor is active\n**Enter a HEX Color Code into the chat**\nConsider use [this](https://htmlcolorcodes.com/) for a valid color codes.')
                            .setFields([
                                {
                                    name: 'Optional',
                                    value: 'Type `none` for colorless embed',
                                    inline: true
                                },
                                {
                                    name: 'Cancellation',
                                    value: 'Type `cancel` to cancel this section editor',
                                    inline: true
                                }
                            ])
                        initial.edit({ embeds: [EditedEmbed, ColorEditorEmbed] });
                    break;

                    case 'EMBED_IMAGE_EDITOR':
                        interaction.deferUpdate();
                        cache.active[message.author.id] = true
                        cache.session[interaction.user.id] = value
                        callback({ cache, initial, message, value });
    
                        const ImageEditorEmbed = new Discord.EmbedBuilder()
                            .setColor('Blurple')
                            .setAuthor({ name: 'Active Session' })
                            .setDescription('Image Editor is active')
                            .setFields([
                                {
                                    name: 'Optional',
                                    value: 'Type `none` for none attached image',
                                    inline: true
                                },
                                {
                                    name: 'Cancellation',
                                    value: 'Type `cancel` to cancel this section editor',
                                    inline: true
                                }
                            ])
                            .setFooter({ text: 'Upload an image or enter an url'})
                        initial.edit({ embeds: [EditedEmbed, ImageEditorEmbed] });
                    break;

                    case 'EMBED_THUMBNAIL_IMAGE_EDITOR':
                        interaction.deferUpdate();
                        cache.active[message.author.id] = true
                        cache.session[interaction.user.id] = value
                        callback({ cache, initial, message, value });
    
                        const ThumbnailEditorEmbed = new Discord.EmbedBuilder()
                            .setColor('Blurple')
                            .setAuthor({ name: 'Active Session' })
                            .setDescription('Thumbnail Image Editor is active')
                            .setFields([
                                {
                                    name: 'Optional',
                                    value: 'Type `none` for none attached thumbnail',
                                    inline: true
                                },
                                {
                                    name: 'Cancellation',
                                    value: 'Type `cancel` to cancel this section editor',
                                    inline: true
                                }
                            ])
                            .setFooter({ text: 'Upload an image or enter an url'})
                        initial.edit({ embeds: [EditedEmbed, ThumbnailEditorEmbed] });
                    break;

                    case 'EMBED_FOOTER_TEXT_EDITOR':
                        interaction.deferUpdate();
                        cache.active[message.author.id] = true
                        cache.session[interaction.user.id] = value
                        callback({ cache, initial, message, value });
    
                        const FooterTextEditorEmbed = new Discord.EmbedBuilder()
                            .setColor('Blurple')
                            .setAuthor({ name: 'Active Session' })
                            .setDescription('Footer Text Editor is active')
                            .setFields([
                                {
                                    name: 'Optional',
                                    value: 'Type `none` for empty footer',
                                    inline: true
                                },
                                {
                                    name: 'Cancellation',
                                    value: 'Type `cancel` to cancel this section editor',
                                    inline: true
                                }
                            ])
                            .setFooter({ text: 'Enter your text into the chat'})
                        initial.edit({ embeds: [EditedEmbed, FooterTextEditorEmbed] });
                    break;

                    case 'EMBED_FOOTER_ICON_EDITOR':
                        interaction.deferUpdate();
                        cache.active[message.author.id] = true
                        cache.session[interaction.user.id] = value
                        callback({ cache, initial, message, value });
    
                        const FooterIconEditorEmbed = new Discord.EmbedBuilder()
                            .setColor('Blurple')
                            .setAuthor({ name: 'Active Session' })
                            .setDescription('Footer Icon Image Editor is active')
                            .setFields([
                                {
                                    name: 'Optional',
                                    value: 'Type `none` for none attached footer icon',
                                    inline: true
                                },
                                {
                                    name: 'Cancellation',
                                    value: 'Type `cancel` to cancel this section editor',
                                    inline: true
                                }
                            ])
                            .setFooter({ text: 'Upload an image or enter an url'})
                        initial.edit({ embeds: [EditedEmbed, FooterIconEditorEmbed] });
                    break;

                    case 'EMBED_TIMESTAMP_EDITOR':
                        interaction.deferUpdate();
                        cache.active[message.author.id] = true
                        cache.session[interaction.user.id] = value
                        callback({ cache, initial, message, value });
    
                        const TimestamptEditorEmbed = new Discord.EmbedBuilder()
                            .setColor('Blurple')
                            .setAuthor({ name: 'Active Session' })
                            .setDescription('Timestamp Editor is active\nPlease use [this](https://www.epochconverter.com/) tool for valid date format.\nUse the keyword `now` for now current time and date')
                            .setFields([
                                {
                                    name: 'Optional',
                                    value: 'Type `none` for empty timestamp',
                                    inline: true
                                },
                                {
                                    name: 'Cancellation',
                                    value: 'Type `cancel` to cancel this section editor',
                                    inline: true
                                }
                            ])
                            .setFooter({ text: 'Enter a valid date'})
                        initial.edit({ embeds: [EditedEmbed, TimestamptEditorEmbed] });
                    break;
    
                }
            }

        })
    }
}

/**
 * 
 * @param {CallbackOptions} options 
 */
function callback(options = {}) {

    const { cache, initial, message, value } = options
    const filter = (m) => m.author.id === message.author.id;
    let embed = Discord.EmbedBuilder.from(cache.embeds[message.author.id]);
    const collector = message.channel.createMessageCollector({ filter, idle: 1000 * 60 * 10 });

    const NotActiveSessionEmbed = new Discord.EmbedBuilder()
        .setColor('Red')
        .setAuthor({ name: 'Active Session' })
        .setDescription('There is no active session')
        .setFooter({ text: 'Please use the select menu below for editor selection' })
    const EmbedFormattingErrorEmbed = new Discord.EmbedBuilder()
        .setColor('Red')
        .setAuthor({ name: 'Formatting Error' })
        .setDescription('You need to have at least 1 field in this embed')
    
    initial.awaitMessageComponent({
        filter: interaction => message.author.id === interaction.user.id,
        idle: 1000 * 60 * 10,
    }).then(interaction => {
        if (interaction.customId === 'CANCEL_EDITOR_SESSION') {
            collector.stop();
            interaction.deferUpdate();
            cache.active[message.author.id] = false
            cache.session[message.author.id] = false
            initial.edit({ embeds: [embed, NotActiveSessionEmbed] });
        }
    })

    collector.on('collect', async (m) => {

        if (cache.session[message.author.id] === false) return

        const content = m.content
        Util.deleteMessage(m, 0.1);

        switch(value) {

            case 'EMBED_AUTHOR_NAME_EDITOR':

                if (content.toLowerCase() === 'none') {

                    const data = embed.setAuthor({ name: null });

                    return await initial.edit({ embeds: [data, NotActiveSessionEmbed] })
                        .then(data => {
                            cache.active[message.author.id] = false
                            cache.embeds[message.author.id] = data.embeds[0]
                            return collector.stop(), cache.session[message.author.id] = false
                        })
                        .catch(error => {
                            if (error.code === 50035) {
                                message.channel.send({ embeds: [EmbedFormattingErrorEmbed] })
                                    .then(message => Util.deleteMessage(message))
                            }
                        })
                }
        
                if (content.toLowerCase() === 'cancel') {
                    const LastSavedEmbed = Discord.EmbedBuilder.from(cache.embeds[message.author.id]);
                    initial.edit({ embeds: [LastSavedEmbed, NotActiveSessionEmbed] });
                    return collector.stop(), cache.session[message.author.id] = false, cache.active[message.author.id] = false;
                }

                embed.setAuthor({ 
                    name: content,
                    iconURL: embed.data.author?.icon_url || null,
                    url: embed.data.author?.url || null
                });
                await initial.edit({ content: null, embeds: [embed, NotActiveSessionEmbed] });
                cache.embeds[message.author.id] = embed; cache.active[message.author.id] = false;
                collector.stop(); cache.session[message.author.id] = false; cache.active[message.author.id] = false

            break;

            case 'EMBED_AUTHOR_URL_EDITOR':

                if (m.content.toLowerCase() === 'none') {

                    const data = embed.setAuthor({
                        name: embed.data.author?.name || null,
                        url: null,
                        iconURL: embed.data.author?.icon_url || null,
                    });

                    return await initial.edit({ embeds: [data, NotActiveSessionEmbed] })
                        .then(data => {
                            cache.active[message.author.id] = false
                            cache.embeds[message.author.id] = data.embeds[0]
                            return collector.stop(), cache.session[message.author.id] = false
                        })
                        .catch(error => {
                            if (error.code === 50035) {
                                message.channel.send({ embeds: [EmbedFormattingErrorEmbed] })
                                    .then(message => Util.deleteMessage(message))
                            }
                        })
                }
        
                if (m.content.toLowerCase() === 'cancel') {
                    const LastSavedEmbed = Discord.EmbedBuilder.from(cache.embeds[message.author.id]);
                    await initial.edit({ embeds: [LastSavedEmbed, NotActiveSessionEmbed] });
                    return collector.stop(), cache.session[message.author.id] = false, cache.active[message.author.id] = false;
                }
        
                const validAuthorUrl = isValidHttpUrl(content);
        
                if (!validAuthorUrl) {
                    const InvalidURLEmbed = new Discord.EmbedBuilder()
                        .setColor('Red')
                        .setAuthor({ name: 'Invalid URL Format' })
                        .setDescription('Please ensure your url format is valid')
                    return message.channel.send({ embeds: [InvalidURLEmbed] })
                        .then(message => Util.deleteMessage(message, 5));
                }
        
                embed.setAuthor({
                    name: embed.data.author?.name,
                    url: content,
                    iconURL: embed.data.author.icon_url || null,
                });
                cache.active[message.author.id] = false;
                await initial.edit({ content: null, embeds: [embed, NotActiveSessionEmbed] });
                cache.embeds[message.author.id] = embed; collector.stop(); cache.session[message.author.id] = false
        
            break;

            case 'EMBED_AUTHOR_ICON_EDITOR':

                if (m.content.toLowerCase() === 'none') {

                    const data = embed.setAuthor({
                        name: embed.data.author?.name || null,
                        url: embed.data.author?.url || null,
                        iconURL: null,
                    });

                    return await initial.edit({ embeds: [data, NotActiveSessionEmbed] })
                        .then(data => {
                            cache.active[message.author.id] = false
                            cache.embeds[message.author.id] = data.embeds[0]
                            return collector.stop(), cache.session[message.author.id] = false
                        })
                        .catch(error => {
                            if (error.code === 50035) {
                                message.channel.send({ embeds: [EmbedFormattingErrorEmbed] })
                                    .then(message => Util.deleteMessage(message))
                            }
                        })
                }
        
                if (m.content.toLowerCase() === 'cancel') {
                    const LastSavedEmbed = Discord.EmbedBuilder.from(cache.embeds[message.author.id]);
                    await initial.edit({ embeds: [LastSavedEmbed, NotActiveSessionEmbed] });
                    return collector.stop(), cache.session[message.author.id] = false, cache.active[message.author.id] = false;
                }
        
                const icon = verifyAttachmentType(m);
        
                if (!icon) {
                    const InvalidImageEmbed = new Discord.EmbedBuilder()
                        .setColor('Red')
                        .setAuthor({ name: 'Invalid Format', iconURL: message.author.displayAvatarURL() })
                        .setDescription('There was no image found in the message')
                    return message.channel.send({ embeds: [InvalidImageEmbed] })
                        .then(message => Util.deleteMessage(message));
                }
        
                const format = icon.type === 'image' ? icon.data.url : icon.data 
        
                embed.setAuthor({
                    name: embed.data.author?.name || null,
                    iconURL: format,
                    url: embed.data.author?.url || null
                });
                cache.active[message.author.id] = false;
                await initial.edit({ content: null, embeds: [embed, NotActiveSessionEmbed] });
                cache.embeds[message.author.id] = embed; collector.stop(); cache.session[message.author.id] = false
            break;

            case 'EMBED_TITLE_EDITOR':

                if (m.content.toLowerCase() === 'none') {

                    const data = embed.setTitle(null);

                    return await initial.edit({ embeds: [data, NotActiveSessionEmbed] })
                        .then(data => {
                            cache.active[message.author.id] = false
                            cache.embeds[message.author.id] = data.embeds[0]
                            return collector.stop(), cache.session[message.author.id] = false
                        })
                        .catch(error => {
                            if (error.code === 50035) {
                                message.channel.send({ embeds: [EmbedFormattingErrorEmbed] })
                                    .then(message => Util.deleteMessage(message))
                            }
                        })
                }
        
                if (m.content.toLowerCase() === 'cancel') {
                    const LastSavedEmbed = Discord.EmbedBuilder.from(cache.embeds[message.author.id]);
                    await initial.edit({ embeds: [LastSavedEmbed, NotActiveSessionEmbed] });
                    return collector.stop(), cache.session[message.author.id] = false, cache.active[message.author.id] = false;
                }

                if (content.length > 256) {
                    const LengthErrorEmbed = new Discord.EmbedBuilder()
                        .setColor('Red')
                        .setAuthor({ name: 'Character Exceed' })
                        .setDescription('This field can only contain up to **256** characters at max')
                    return message.channel.send({ embeds: [LengthErrorEmbed] })
                        .then(message => Util.deleteMessage(message, 5));
                }

                embed.setTitle(content);
                cache.active[message.author.id] = false;
                await initial.edit({ content: null, embeds: [embed, NotActiveSessionEmbed] });
                cache.embeds[message.author.id] = embed; collector.stop(); cache.session[message.author.id] = false

            break;

            case 'EMBED_DESC_EDITOR':

                if (m.content.toLowerCase() === 'none') {

                    const data = embed.setDescription(null);

                    return await initial.edit({ embeds: [data, NotActiveSessionEmbed] })
                        .then(data => {
                            cache.active[message.author.id] = false
                            cache.embeds[message.author.id] = data.embeds[0]
                            return collector.stop(), cache.session[message.author.id] = false
                        })
                        .catch(error => {
                            if (error.code === 50035) {
                                message.channel.send({ embeds: [EmbedFormattingErrorEmbed] })
                                    .then(message => Util.deleteMessage(message))
                            }
                        })
                }
        
                if (m.content.toLowerCase() === 'cancel') {
                    const LastSavedEmbed = Discord.EmbedBuilder.from(cache.embeds[message.author.id]);
                    await initial.edit({ embeds: [LastSavedEmbed, NotActiveSessionEmbed] });
                    return collector.stop(), cache.session[message.author.id] = false, cache.active[message.author.id] = false;
                }

                if (content.length > 4096) {
                    const LengthErrorEmbed = new Discord.EmbedBuilder()
                        .setColor('Red')
                        .setAuthor({ name: 'Character Exceed' })
                        .setDescription('This field can only contain up to **4096** characters at max')
                    return message.channel.send({ embeds: [LengthErrorEmbed] })
                        .then(message => Util.deleteMessage(message, 5));
                }

                // TODO: Save text into a text file
                const bufferPath = `./lib/assets/data/Buffer/EmbedBuilder/${message.author.id}.txt`;

                fs.writeFile(bufferPath, content, (error) => {});

                // TODO: Read the text file
                fs.readFile(bufferPath, 'utf-8', async (err, data) => {
                    embed.setDescription(data);
                    await initial.edit({ embeds: [embed, NotActiveSessionEmbed] });
                    cache.embeds[message.author.id] = embed; cache.active[message.author.id] = false;
                    collector.stop(); cache.session[message.author.id] = false, fs.unlink(bufferPath, (error) => {});
                })

            break;

            case 'EMBED_TITLE_URL_EDITOR':

                if (m.content.toLowerCase() === 'none') {

                    const data = embed.setURL(null);

                    return await initial.edit({ embeds: [data, NotActiveSessionEmbed] })
                        .then(data => {
                            cache.active[message.author.id] = false
                            cache.embeds[message.author.id] = data.embeds[0]
                            return collector.stop(), cache.session[message.author.id] = false
                        })
                        .catch(error => {
                            if (error.code === 50035) {
                                message.channel.send({ embeds: [EmbedFormattingErrorEmbed] })
                                    .then(message => Util.deleteMessage(message))
                            }
                        })
                }
        
                if (m.content.toLowerCase() === 'cancel') {
                    const LastSavedEmbed = Discord.EmbedBuilder.from(cache.embeds[message.author.id]);
                    await initial.edit({ embeds: [LastSavedEmbed, NotActiveSessionEmbed] });
                    return collector.stop(), cache.session[message.author.id] = false, cache.active[message.author.id] = false;
                }

                const validTitleURL = isValidHttpUrl(content);

                if (!validTitleURL) {
                    const InvalidURLEmbed = new Discord.EmbedBuilder()
                        .setColor('Red')
                        .setAuthor({ name: 'Invalid URL Format' })
                        .setDescription('Please ensure your url format is valid')
                    return message.channel.send({ embeds: [InvalidURLEmbed] })
                        .then(message => Util.deleteMessage(message, 5));
                }

                embed.setURL(content);
                cache.active[message.author.id] = false;
                await initial.edit({ content: null, embeds: [embed, NotActiveSessionEmbed] });
                cache.embeds[message.author.id] = embed; collector.stop(); cache.session[message.author.id] = false

            break;

            case 'EMBED_COLOR_EDITOR':

                if (m.content.toLowerCase() === 'none') {

                    const data = embed.setColor(null);

                    return await initial.edit({ embeds: [data, NotActiveSessionEmbed] })
                        .then(data => {
                            cache.active[message.author.id] = false
                            cache.embeds[message.author.id] = data.embeds[0]
                            return collector.stop(), cache.session[message.author.id] = false
                        })
                }
        
                if (m.content.toLowerCase() === 'cancel') {
                    const LastSavedEmbed = Discord.EmbedBuilder.from(cache.embeds[message.author.id]);
                    await initial.edit({ embeds: [LastSavedEmbed, NotActiveSessionEmbed] });
                    return collector.stop(), cache.session[message.author.id] = false, cache.active[message.author.id] = false;
                }

                const validColors = /^#[0-9A-F]{6}$/i.test(content);
                const validColorNoHash =  /^#[0-9A-F]{6}$/i.test(content);

                if (!validColors) {
                    const InvalidColorCodeEmbed = new Discord.EmbedBuilder()
                        .setColor('Red')
                        .setAuthor({ name: 'Invalid Color Code' })
                        .setDescription('Please refer to [this](https://htmlcolorcodes.com/) for valid color code.')
                    return message.channel.send({ embeds: [InvalidColorCodeEmbed] })
                        .then(message => Util.deleteMessage(message, 12));
                }

                embed.setColor(content);
                cache.active[message.author.id] = false;
                await initial.edit({ content: null, embeds: [embed, NotActiveSessionEmbed] });
                cache.embeds[message.author.id] = embed; collector.stop(); cache.session[message.author.id] = false

            break;

            case 'EMBED_IMAGE_EDITOR':

                if (m.content.toLowerCase() === 'none') {

                    const data = embed.setImage(null);

                    return await initial.edit({ embeds: [data, NotActiveSessionEmbed] })
                        .then(data => {
                            cache.active[message.author.id] = false
                            cache.embeds[message.author.id] = data.embeds[0]
                            return collector.stop(), cache.session[message.author.id] = false
                        })
                        .catch(error => {
                            if (error.code === 50035) {
                                message.channel.send({ embeds: [EmbedFormattingErrorEmbed] })
                                    .then(message => Util.deleteMessage(message))
                            }
                        })
                }
        
                if (m.content.toLowerCase() === 'cancel') {
                    const LastSavedEmbed = Discord.EmbedBuilder.from(cache.embeds[message.author.id]);
                    await initial.edit({ embeds: [LastSavedEmbed, NotActiveSessionEmbed] });
                    return collector.stop(), cache.session[message.author.id] = false, cache.active[message.author.id] = false;
                }

                const embedImage = verifyAttachmentType(m);
                const imageFormated = embedImage.type === 'image' ? embedImage.data.url : embedImage.data

                embed.setImage(imageFormated);
                cache.active[message.author.id] = false;
                await initial.edit({ content: null, embeds: [embed, NotActiveSessionEmbed] });
                cache.embeds[message.author.id] = embed; collector.stop(); cache.session[message.author.id] = false

            break;

            case 'EMBED_THUMBNAIL_IMAGE_EDITOR':
                if (m.content.toLowerCase() === 'none') {

                    const data = embed.setThumbnail(null);

                    return await initial.edit({ embeds: [data, NotActiveSessionEmbed] })
                        .then(data => {
                            cache.active[message.author.id] = false
                            cache.embeds[message.author.id] = data.embeds[0]
                            return collector.stop(), cache.session[message.author.id] = false
                        })
                        .catch(error => {
                            if (error.code === 50035) {
                                message.channel.send({ embeds: [EmbedFormattingErrorEmbed] })
                                    .then(message => Util.deleteMessage(message))
                            }
                        })
                }
        
                if (m.content.toLowerCase() === 'cancel') {
                    const LastSavedEmbed = Discord.EmbedBuilder.from(cache.embeds[message.author.id]);
                    await initial.edit({ embeds: [LastSavedEmbed, NotActiveSessionEmbed] });
                    return collector.stop(), cache.session[message.author.id] = false, cache.active[message.author.id] = false;
                }

                const thumbnailImage = verifyAttachmentType(m);
                const thumbnailFormated = thumbnailImage.type === 'image' ? thumbnailImage.data.url : thumbnailImage.data

                embed.setThumbnail(thumbnailFormated);
                cache.active[message.author.id] = false;
                await initial.edit({ content: null, embeds: [embed, NotActiveSessionEmbed] });
                cache.embeds[message.author.id] = embed; collector.stop(); cache.session[message.author.id] = false
            break;

            case 'EMBED_FOOTER_TEXT_EDITOR':
                if (m.content.toLowerCase() === 'none') {

                    const data = embed.setFooter({
                        text: null,
                        iconURL: embed.data.footer?.icon_url || null,
                    });

                    return await initial.edit({ embeds: [data, NotActiveSessionEmbed] })
                        .then(data => {
                            cache.active[message.author.id] = false
                            cache.embeds[message.author.id] = data.embeds[0]
                            return collector.stop(), cache.session[message.author.id] = false
                        })
                        .catch(error => {
                            if (error.code === 50035) {
                                message.channel.send({ embeds: [EmbedFormattingErrorEmbed] })
                                    .then(message => Util.deleteMessage(message))
                            }
                        })
                }
        
                if (m.content.toLowerCase() === 'cancel') {
                    const LastSavedEmbed = Discord.EmbedBuilder.from(cache.embeds[message.author.id]);
                    await initial.edit({ embeds: [LastSavedEmbed, NotActiveSessionEmbed] });
                    return collector.stop(), cache.session[message.author.id] = false, cache.active[message.author.id] = false;
                }

                if (content.length > 2048) {
                    const LengthErrorEmbed = new Discord.EmbedBuilder()
                        .setColor('Red')
                        .setAuthor({ name: 'Character Exceed' })
                        .setDescription('This field can only contain up to **2048** characters at max')
                    return message.channel.send({ embeds: [LengthErrorEmbed] })
                        .then(message => Util.deleteMessage(message, 5));
                }

                embed.setFooter({
                    text: content,
                    iconURL: embed.data.footer?.icon_url || null,
                });
                cache.active[message.author.id] = false;
                await initial.edit({ content: null, embeds: [embed, NotActiveSessionEmbed] });
                cache.embeds[message.author.id] = embed; collector.stop(); cache.session[message.author.id] = false

            break;

            case 'EMBED_FOOTER_ICON_EDITOR':
                if (m.content.toLowerCase() === 'none') {

                    const data = embed.setFooter({
                        text: embed.data.footer?.text || null,
                        iconURL: null,
                    });

                    return await initial.edit({ embeds: [data, NotActiveSessionEmbed] })
                        .then(data => {
                            cache.active[message.author.id] = false
                            cache.embeds[message.author.id] = data.embeds[0]
                            return collector.stop(), cache.session[message.author.id] = false
                        })
                        .catch(error => {
                            if (error.code === 50035) {
                                message.channel.send({ embeds: [EmbedFormattingErrorEmbed] })
                                    .then(message => Util.deleteMessage(message))
                            }
                        })
                }
        
                if (m.content.toLowerCase() === 'cancel') {
                    const LastSavedEmbed = Discord.EmbedBuilder.from(cache.embeds[message.author.id]);
                    await initial.edit({ embeds: [LastSavedEmbed, NotActiveSessionEmbed] });
                    return collector.stop(), cache.session[message.author.id] = false, cache.active[message.author.id] = false;
                }

                const footerIconImage = verifyAttachmentType(m);
                const footerIconFormated = footerIconImage.type === 'image' ? footerIconImage.data.url : footerIconImage.data

                embed.setFooter({
                    text: embed.data.footer?.text || null,
                    iconURL: footerIconFormated,
                })
                cache.active[message.author.id] = false;
                await initial.edit({ content: null, embeds: [embed, NotActiveSessionEmbed] });
                cache.embeds[message.author.id] = embed; collector.stop(); cache.session[message.author.id] = false
            break;

            case 'EMBED_TIMESTAMP_EDITOR':
                if (m.content.toLowerCase() === 'none') {

                    const data = embed.setTimestamp(null)

                    return await initial.edit({ embeds: [data, NotActiveSessionEmbed] })
                        .then(data => {
                            cache.active[message.author.id] = false
                            cache.embeds[message.author.id] = data.embeds[0]
                            return collector.stop(), cache.session[message.author.id] = false
                        })
                        .catch(error => {
                            if (error.code === 50035) {
                                message.channel.send({ embeds: [EmbedFormattingErrorEmbed] })
                                    .then(message => Util.deleteMessage(message))
                            }
                        })
                }
        
                if (m.content.toLowerCase() === 'cancel') {
                    const LastSavedEmbed = Discord.EmbedBuilder.from(cache.embeds[message.author.id]);
                    await initial.edit({ embeds: [LastSavedEmbed, NotActiveSessionEmbed] });
                    return collector.stop(), cache.session[message.author.id] = false, cache.active[message.author.id] = false;
                }

                // TODO: Parse Date
                if (content.toLowerCase() === 'now') {
                    embed.setTimestamp();
                    cache.active[message.author.id] = false;
                    await initial.edit({ content: null, embeds: [embed, NotActiveSessionEmbed] });
                    return cache.embeds[message.author.id] = embed, collector.stop(), cache.session[message.author.id] = false
                }

                const date = Date.parse(content);

                if (isNaN(date)) {
                    const InvalidDateEmbed = new Discord.EmbedBuilder()
                        .setColor('Red')
                        .setAuthor({ name: 'Invalid Date Format' })
                        .setDescription('Please ensure your format is correct or use [this](https://www.epochconverter.com/) tool.')
                    return message.channel.send({ embeds: [InvalidDateEmbed] })
                        .then(message => Util.deleteMessage(message, 12))
                }

                embed.setTimestamp(date);
                cache.active[message.author.id] = false;
                await initial.edit({ content: null, embeds: [embed, NotActiveSessionEmbed] });
                cache.embeds[message.author.id] = embed, collector.stop(), cache.session[message.author.id] = false

            break;

        }

    })

    collector.on('end', async (collected, reason) => {
        if (reason === 'idle') {
            cache.active[message.author.id] = false;
            cache.session[message.author.id] = false;
            await initial.edit({ content: null, embeds: [embed, NotActiveSessionEmbed] });
        }
    });

}

/**
 * 
 * @param {Discord.Message} message 
 */
function verifyAttachmentType(message) {
    const image = ['image/jpeg', 'image/png', 'image/gif']

    if (isValidHttpUrl(message.content)) 
    return { type: 'url', data: message.content }

    if (message.attachments.size) {
        const attachment = message.attachments.first()
        if (!image.includes(attachment.contentType)) {
            return false
        }

        return { type: 'image', data: attachment }
    }

    return false
}

function isValidHttpUrl(string) {
    let url;
    try {
        url = new URL(string);
    } catch (error) {
        return false;
    }
    return url.protocol === "http:" || url.protocol === "https:";
}

/**
 * @typedef {object} CacheData
 * @property {Discord.Embed} embeds - The save embed
 * @property {string | boolean} session - Current running session
 * @property {boolean} active - Whether the editor is active or not
 */

/**
 * @typedef {object} SessionOptions
 * @property {string} value - Current session
 * @property {CacheData} cache
 * @property {Discord.Message} message
 */

/**
 * @typedef {object} CallbackOptions
 * @property {object} cache
 * @property {Discord.Message} message
 * @property {string} value
 * @property {Discord.Message} initial
 */  