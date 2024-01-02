const ms = require('ms');
require('dotenv').config();
const Discord = require('discord.js');
const Duration = require('humanize-duration');
const { Util } = require('../../../../../util/util');
const { ComponentType } = require('discord-api-types/v10');
const GuildSettings = require('../../../../../lib/classes/Base/GuildSettingManager');

module.exports = {
    data: {
        name                : "help",
        aliases             : "h",
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
        name            : 'help',
        category        : "Utility",
        description     : "Open a help menu",
        commandType     : "Public",
        permissions     : "Not Available",
        commandUsage    : `help [command]`,

    },
    authorization: {
        status  : true,
        users   : "",
        roles   : "",
        banned  : "",
        usersError  : "",
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

        let page = 0;
        const DefaultEmbed = [];
        const paginationEmbed = [];
        const private = ['Private'];
        const settings = new GuildSettings(message.guild, client);

        const prefixes = settings.cache[message.guild.id].prefix;

        const f = Discord.codeBlock;
        const { arrayChunk,
            uniqueArray,
            capitalizeFirstLetter, 
            checkEmptyString ,
            generateRandomColor,
            filterbyArray
        } = Util;

        if (arguments.length < 1) {
    
            const commandInformation = client.messages.map(data => data.information);
            const commandCategory = commandInformation.map(data => data.category);
            const category = filterbyArray(uniqueArray(commandCategory), private);
    
            for (let i = 0; i < category.length; i++) {
                const categoryCommand = commandInformation.filter(data => data.category === category[i]);
                
                DefaultEmbed.push(categoryCommand);
            }

            const InitialEmbed = new Discord.EmbedBuilder()
                .setColor('8623d7')
                .setAuthor({ name: 'Help Menu', iconURL: client.user.avatarURL() })
                .setDescription(`${f(`Prefix: ${prefixes}`)}\n**More Command Info:**\n${f(`${prefixes}help [command]`)}\n**Notes:**\n\n🔘 : Command Category\n🔺 : Available Command\n\nPlease use the button below to navigate the help menu.`)
                .setTimestamp()
                .setFooter({ text: `Page 1 of ${DefaultEmbed.length + 1}`})
            paginationEmbed.push(InitialEmbed);

            for (let i = 0; i < category.length; i++) {
                const categoryCommand = DefaultEmbed[i].map(data => data);
                const input = categoryCommand.map((data, index) => `🔺 ${data.name} : \`${data.description}\``)
                const PageEmbed = new Discord.EmbedBuilder()
                    .setColor(generateRandomColor())
                    .setAuthor({ name: 'Help Menu', iconURL: client.user.avatarURL() })
                    .setDescription(`${f(`Prefix: ${prefixes}`)}\n**More Command Info:**\n${f(`${prefixes}help [command]`)}`)
                    .setFields([
                        {
                            name: `🔘 ${category[i]}`,
                            value: input.join('\n'),
                        }
                    ])
                    .setTimestamp()
                    .setFooter({ text: `Navigating Page ${i + 2} of ${DefaultEmbed.length + 1}`})
                paginationEmbed.push(PageEmbed);
            }
    
            const component = new Discord.ActionRowBuilder()
            .addComponents([
                new Discord.ButtonBuilder()
                    .setLabel("◀️")
                    .setStyle(1)
                    .setCustomId("L"),
                new Discord.ButtonBuilder()
                    .setLabel("▶️")
                    .setStyle(1)
                    .setCustomId("R"),
            ])
            const prompt = await message.channel.send({ embeds: [paginationEmbed[0]], components: [component] });
    
            const filter = (interaction) => message.author.id === interaction.user.id
            const collector = prompt.createMessageComponentCollector({ filter, componentType: ComponentType.Button, time: 1000 * 60 * 5 });
    
            collector.on("collect", (interaction) => {
    
                switch (interaction.customId) {
    
                    case 'L':
                        page--
    
                        if (page === -1) {
                            interaction.deferUpdate();
                            return page = 0
                        }
    
                        interaction.deferUpdate();
                        prompt.edit({ embeds: [paginationEmbed[page]] });
                    break
    
                    case 'R':
                        page++
    
                        if (page === paginationEmbed.length) {
                            interaction.deferUpdate()
                            return page = paginationEmbed.length - 1
                        }
    
                        interaction.deferUpdate();
                        prompt.edit({ embeds: [paginationEmbed[page]] });
                        break
    
                }
            })
        } else {
            // TODO: Help menu for each command
            const command = client.messages.get(arguments[0]) || client.messages.find(alias => alias.data.aliases && alias.data.aliases.includes(arguments[0]));

            if (private.includes(command.information.category)) {
                const PrivateEmbed = new Discord.EmbedBuilder()
                    .setColor('Red')
                    .setAuthor({ name: 'Private Command' })
                    .setDescription('This command is a private command')
                return message.channel.send({ embeds: [PrivateEmbed] });
            }

            if (command.information.commandType === 'Private') {
                const PrivateEmbed = new Discord.EmbedBuilder()
                    .setColor('Red')
                    .setAuthor({ name: 'Private Command' })
                    .setDescription('This command is a private command')
                return message.channel.send({ embeds: [PrivateEmbed] });
            }

            if (!command) {
                const InvalidCommandEmbed = new Discord.EmbedBuilder()
                    .setColor('#e91e1e')
                    .setAuthor({ name: 'Help Menu' })
                    .setDescription('The command you entered does not exist.')
                return message.channel.send({ embeds: [InvalidCommandEmbed] });
            }

            function cooldownData(data) {
                if (data.cooldown.status) {
                    const time = ms(data.cooldown.time + " " + data.cooldown.unit);
                    const cooldown = Duration(time, { units: ['y', 'd', 'h', 'm', 's'], round: true })
                    return `🔺 ${cooldown}`
                } else {
                    return false
                }
            }

            function requiredRoleData(data) {

                if (checkEmptyString(data.authorization.roles)) {
                    return false
                } else if (!data.authorization.status) {
                    return false
                } else {
                    const role = data.authorization.roles.map(data => {
                        const a = message.guild.roles.cache.get(data)
                        ,     b = message.guild.roles.cache.find(role => role.name === data)
                        return a || b
                    })
    
                    const filter = role.filter(data => data !== undefined);
    
                    const roles = filter.map(role => role.toString())
                    return `🔺 ${roles.join(', ')}`
                }

            }
            const rrd = requiredRoleData(command);

            console.log(rrd)

            const CommandEmbed = new Discord.EmbedBuilder()
                .setColor('Random')
                .setAuthor({ name: `${capitalizeFirstLetter(command.data.name)} Command`, iconURL: message.guild.iconURL({ dynamic: true }) })
                .setDescription(`**Command Usage:**\n${f(`${prefixes}${command.information.commandUsage}`)}\n**Command Description:**\n${f(command.information.description)}\n**Additional Description:**\n${f(command.information.additional || 'Not Available')}`)
                .setFields([
                    {
                        name: `🔘 Category`,
                        value: `🔺 ${command.information.category}`,
                        inline: true
                    },
                    {
                        name: `🔘 Command Cooldown`,
                        value: cooldownData(command) || `🔺 None`,
                        inline: true
                    },
                    {
                        name: `🔘 Command Type`,
                        value: `🔺 ${command.information.commandType}`,
                        inline: true
                    },
                    {
                        name: `🔘 Command Permissions`,
                        value: `🔺 ${command.information.permissions}`,
                        inline: true
                    },
                    {
                        name: `🔘 Required Roles`,
                        value: rrd ? rrd : `🔺 None`,
                        inline: true
                    },
                    {
                        name: `🔘 Command Aliases`,
                        value: `🔺 ${command.data.aliases?.join(', ') || 'None'}`,
                        inline: true
                    }
                ])
            return message.channel.send({ embeds: [CommandEmbed] });
        }
    }
}