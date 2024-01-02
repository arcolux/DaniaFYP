const Discord = require('discord.js');
const { PermissionFlagsBits } = require('discord-api-types/v10');
const GuildSettings = require('../../../../../lib/classes/Base/GuildSettingManager');

module.exports = {
    data: {
        name                : "prefix",
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
        name            : 'prefix',
        category        : "Settings",
        description     : "View or change the server prefix",
        commandType     : "Public",
        permissions     : "Not Available",
        commandUsage    : `prefix <new>`,

    },
    authorization: {
        status  : false,
        users   : '',
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

        const set = arguments[0]
        const settings = new GuildSettings({ guild: message.guild, client });
        const prefix = settings.cache[message.guild.id].prefix

        if (set) {

            if (!message.member.permissions.has(PermissionFlagsBits.ManageGuild)) {

                const PermissionErrorEmbed = new Discord.EmbedBuilder()
                    .setColor("#ff0000")
                    .setAuthor({ name: "Permission Error" })
                    .setDescription("You don't have the permission to change the prefix of this guild.")
                    .setTimestamp()
                    .setFooter({ text: 'Manage Server is required to change the prefix', iconURL: message.author.displayAvatarURL() });
                return message.channel.send({ embeds: [PermissionErrorEmbed] });
            }

            await settings.prefix({ prefix: set });

            const PrefixChangeEmbed = new Discord.EmbedBuilder()
                .setColor('8623d7')
                .setAuthor({ name: 'Prefix Changed' })
                .setDescription(`The prefix of the guild is now ${set}`)
                .setTimestamp()
                .setFooter({ text: `All message command prefix has been change to ${set}`, iconURL: message.author.displayAvatarURL() })
            message.channel.send({ embeds: [PrefixChangeEmbed] });
        } else {

            const PrefixEmbed = new Discord.EmbedBuilder()
                .setColor('238fd7')
                .setAuthor({ name: 'Guild Prefix' })
                .setDescription(`The current guild prefix is **${prefix}**`)
                .setTimestamp()
                .setFooter({ text: `Requested by ${message.author.username}` })
            message.channel.send({ embeds: [PrefixEmbed] });
        }

    }
}