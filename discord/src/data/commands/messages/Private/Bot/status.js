const cache = {}
let counter = 0;
const status = [];
const Discord = require('discord.js');
const { PresenceUpdateStatus, ActivityType, ComponentType } = require('discord-api-types/v10')

module.exports = {
    data: {
        name                : "status",
        aliases             : "s",
        minArgs             : 1,
        maxArgs             : null,
        expectedArgs        : "status <content>",
    },
    cooldown: {
        time    : 0,
        unit    : "",
        type    : "",
        status  : false,
    },
    information         : {
        name            : 'status',
        category        : "Private",
        description     : "Set the status of the bot",
        commandType     : "Private",
        permissions     : "Not Available",
        commandUsage    : `status <content>`,

    },
    authorization: {
        status  : true,
        users   : [''],
        roles   : "STAFF",
        banned  : "",
        usersError  : "Your're not authorized to use this command",
        rolesError  : "Your're not authorized to use this command",
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

        if (arguments[0].toLowerCase() === 'edit') {

            const StatusEmbed = new Discord.EmbedBuilder()
                .setColor('Blurple')
                .setAuthor({ name: 'Status Content', iconURL: client.user.displayAvatarURL() })
                .setDescription('Current status content that is been saved')
                .setFields([
                    {
                        name: 'Content',
                        value: status.map((value, index) => `${index + 1} : ${value}\n`).join('') || 'Not Yet Set'
                    }
                ])
                .setFooter({ text: 'To delete a content from the list, please use the button below' })
            const button = new Discord.ButtonBuilder()
                .setCustomId('DELETE_STATUS_CONTENT')
                .setStyle(2)
                .setLabel('Delete Save Content')
            const component = new Discord.ActionRowBuilder()
                .addComponents(button)
            const prompt = await message.channel.send({ embeds: [StatusEmbed], components: [component] });

            prompt.awaitMessageComponent({
                filter: (interaction) => message.author.id === interaction.user.id,
                componentType: ComponentType.Button,
                time: 60000
            }).then((interaction) => {

                if (status.length === 0)
                    return interaction.reply({ content: 'There is no content been save yet.\nPlease use the command to save the status content.', ephemeral: true });

                const FormattingEmbed = new Discord.EmbedBuilder()
                    .setColor('Aqua')
                    .setAuthor({ name: 'Delete Content', iconURL: message.author.displayAvatarURL() })
                    .setDescription('Please send the number of the content into the chat that you want to delete.')
                    .setFields([
                        {
                            name: 'Single Delete Formatting',
                            value: Discord.codeBlock('2'),
                            inline: true
                        },
                        {
                            name: 'Batch Delete Formatting',
                            value: Discord.codeBlock('1, 2, 3, 4, ...'),
                            inline: true
                        }
                    ])
                    .setTimestamp()
                    .setFooter({ text: 'Canceled when no inactivity for 60 seconds' })
                interaction.reply({ embeds: [FormattingEmbed], ephemeral: true });

                const filter = (msg) => msg.author.id === message.author.id
                const collector = message.channel.createMessageCollector({ filter, time: 60000 });

                collector.on('collect', (msg) => {

                    const { content } = msg

                    if (content.includes(',')) {

                        const removeValFromIndex = content.replace(/\s/g, '').split(',').map(value => parseInt(value) - 1);

                        if (removeValFromIndex.includes(NaN)) 
                        return message.channel.send({ content: 'Please only include numbers only'});

                        delete cache[client.user.id]

                        for (let i = removeValFromIndex.length -1; i >= 0; i--) status.splice(removeValFromIndex[i], 1);

                        const StatusEmbed = new Discord.EmbedBuilder()
                            .setColor('Blurple')
                            .setAuthor({ name: 'Status Content', iconURL: client.user.displayAvatarURL() })
                            .setFields([
                                {
                                    name: 'Content',
                                    value: status.map((value, index) => `${index + 1} : ${value}\n`).join('') || 'No Content Has Been Saved'
                                }
                            ])
                            .setFooter({ text: 'Status content has been updated' })
                        message.channel.send({ embeds: [StatusEmbed] }); collector.stop();

                    } else {

                        if (isNaN(content))
                        return message.channel.send({ content: 'Content is not a number' });

                        const value = parseInt(content);

                        if (value > status.length)
                        return message.channel.send({ content: 'Please enter a correct number' });
    
                        delete cache[client.user.id]
    
                        const slice = value - 1
                        const index = status.indexOf(status[slice]);
                        if (index > -1)
                        status.splice(index, 1);
    
                        const StatusEmbed = new Discord.EmbedBuilder()
                            .setColor('Blurple')
                            .setAuthor({ name: 'Status Content', iconURL: client.user.displayAvatarURL() })
                            .setDescription('Current status content that will change interval')
                            .setFields([
                                {
                                    name: 'Content',
                                    value: status.map((value, index) => `${index + 1} : ${value}\n`).join('') || 'No Content Has Been Saved'
                                }
                            ])
                            .setFooter({ text: 'Status content has been updated' })
                        message.channel.send({ embeds: [StatusEmbed] }); collector.stop();
                    }
                    
                })

            }).catch((error) => {
                console.log(error);
            })
        } else {

            const update = () => {

                client.user.setPresence({
                    activities: [
                        {
                            name: status[counter] ? status[counter] : '',
                            type: ActivityType.Streaming,
                            url: "https://www.twitch.tv/mhmi__"
                        }
                    ],
                    status: PresenceUpdateStatus.Idle
                })

                if (++counter >= status.length) counter = 0

                cache[client.user.id] = setTimeout(update, 1000 * 60 * 5);
            }

            if (typeof cache[client.user.id] === 'undefined') {
                status.push(text); update();

                const StatusEmbed = new Discord.EmbedBuilder()
                    .setColor('Blurple')
                    .setAuthor({ name: 'Status Content', iconURL: client.user.displayAvatarURL() })
                    .setDescription('Status content has been saved')
                    .setFields([
                        {
                            name: 'Content',
                            value: status.map((value, index) => `${index + 1} : ${value}\n`).join('')
                        }
                    ])
                message.channel.send({ embeds: [StatusEmbed] });

            } else {
                status.push(text);
    
                const StatusEmbed = new Discord.EmbedBuilder()
                    .setColor('Blurple')
                    .setAuthor({ name: 'Status Content', iconURL: client.user.displayAvatarURL() })
                    .setDescription('Current status content that will change interval')
                    .setFields([
                        {
                            name: 'Content',
                            value: status.map((value, index) => `${index + 1} : ${value}\n`).join('')
                        }
                    ])
                    .setFooter({ text: 'To delete a content from the list, please use the button below'})
                message.channel.send({ embeds: [StatusEmbed] });
    
            }

        }

    }
}