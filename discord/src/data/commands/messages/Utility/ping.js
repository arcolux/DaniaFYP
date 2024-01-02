require('dotenv').config();
const Discord = require('discord.js');
const Duration = require('humanize-duration');
const ProfileManager = require('../../../../../lib/classes/Base/ProfileManager');

module.exports = {
    data: {
        name                : "ping",
        aliases             : "",
        minArgs             : 0,
        maxArgs             : null,
        expectedArgs        : "",
    },
    cooldown: {
        time    : 0,
        unit    : "",
        status  : true,
    },
    information         : {
        name            : 'ping',
        category        : "Utility",
        additional      : '',
        description     : "Check the lactency of the bot",
        commandType     : "Public",
        permissions     : "Not Available",
        commandUsage    : `ping`,

    },
    authorization: {
        status  : false,
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

        const CalcaculatingEmbed = new Discord.EmbedBuilder()
            .setColor("2ce214")
            .setAuthor({ name: "Calculating Ping ..." })
        const initial = await message.channel.send({ embeds: [CalcaculatingEmbed] });

        const profile = new ProfileManager({ user: message.author, guild: message.guild });

        const then = performance.now();
        const data = await profile.schema.create({
            user: {
                id: `${message.author.id}${message.guild.id}`
            }
        });
        const now = performance.now();

        const ResultEmbed = new Discord.EmbedBuilder()
            .setColor("14e24b")
            .setAuthor({ name: "Calculated Ping" })
            .setFields([
                {
                    name: "Response",
                    inline: true,
                    value: `🏓 ${Discord.inlineCode(initial.createdTimestamp - message.createdTimestamp)} ms`
                },
                {
                    name: "API Response",
                    inline: true,
                    value: `🏓 ${Discord.inlineCode(client.ws.ping)} ms`
                },
                {
                    name: '\u200b',
                    value: '\u200b',
                    inline: true
                },
                {
                    name: 'Database Response',
                    value: `🏓 ${Discord.inlineCode(Math.floor(now - then))} ms`,
                    inline: true
                },
                {
                    name: "Client Up Time",
                    inline: true,
                    value: `⏲️ ${Duration(client.uptime, { units: ['d', 'h', 'm', 's'], round: true })}`
                },
            ])
            .setThumbnail(message.author.displayAvatarURL())

        initial.edit({ content: 'Pong u with some data !', embeds: [ResultEmbed] }); await data.delete();

    }
}