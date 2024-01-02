const map = new Map();
const Discord = require('discord.js');
const { Util } = require('../../../../../util/util');
const DiscordTypes = require('discord-api-types/v10');

const fs = require('fs')
const { inspect } = require('util');

module.exports = {
    data: {
        name                : "purge",
        aliases             : "delete",
        minArgs             : 1,
        maxArgs             : null,
        expectedArgs        : "purge <number>",
    },
	path: {
		dir		 : __dirname,
		file	 : __filename,
		relative : __filename.replace(process.cwd(), "").replace(/\\/g, "/")
	},
    cooldown: {
        time    : 0,
        unit    : "",
        type    : "",
        status  : false,
    },
    information         : {
        name            : 'purge',
        category        : "Utility",
        additional       : 'Maximum deletable messages are 500 for each session.',
        description     : "Bulk delete message that is newer than 2 weeks",
        commandType     : "Public",
        permissions     : "Manage Message",
        commandUsage    : `purge <number>`,

    },
    authorization: {
        status  : true,
        users   : "",
        roles   : "",
        banned  : "",
        usersError  : "",
        rolesError  : "",
        bannedError : "",
        permissions : "MANAGE_MESSAGES",
        permissionsError : "You're not authorize to use this command",
    },
    /**
     * @param {Discord.Message} message 
     * @param {string[]} arguments
     * @param {string} text
     * @param {Discord.Client} client 
     */
    async execute(message, arguments, text, client) {

        const messages = [];
        const { arrayChunk, uniqueArray } = Util;
        const { channel } = message;
        const amount = parseInt(arguments[0]);

        if (amount > 500) 
        return message.channel.send({ content: 'Amount cannot exceed 500 messages'})
            .then(message => Util.deleteMessage(message, 5));

        const chunk = chunkBy(amount, 100);

        const FetchingEmbed = new Discord.EmbedBuilder()
            .setColor('DarkBlue')
            .setThumbnail(message.guild.iconURL())
            .setAuthor({ name: 'Fetching Messages', iconURL: message.author.displayAvatarURL() })
            .setDescription('Fetching messages in the channel.\nThis may take awhile depending on count.')
            .setFooter({ text: `Total Fetch Needed: ${amount.toLocaleString()}` }).setTimestamp()
        const prompt = await message.channel.send({ embeds: [FetchingEmbed] });

        for (let i = 0; i < chunk.length; i++) {

            const data = await channel.messages.fetch({ limit: chunk[i], before: map.get(message.author.id) });
            if (data.size === 0) continue
            map.set(message.author.id, data.last().id)

            data.forEach((value, key, map) => {
                messages.push(value);
            })
        }

        map.delete(message.author.id);

        /**
         * This messages data is already 14 days newer
         */
        const filter = uniqueArray(messages.filter(message => fourteenDaysAgo(message.createdTimestamp) === true));

        const DoneFetchEmbed = new Discord.EmbedBuilder()
            .setColor('DarkBlue')
            .setThumbnail(message.guild.iconURL())
            .setAuthor({ name: 'Messages Fetched', iconURL: message.author.displayAvatarURL() })
            .setDescription('Messages has been fetched.\nWaiting for deletion request')
            .setFooter({ text: `Total Fetched: ${filter.length.toLocaleString()}` }).setTimestamp()
        await prompt.edit({ embeds: [DoneFetchEmbed] });

        if (filter.length <= 1)
        return message.channel.send({ content: 'Unable to bulk delete message that is older than 14 days'})

        /**
         * Messages data is seperated into chunks
         */
        const chunked = arrayChunk(100, filter);

        for (let index = 0; index < chunked.length; index++)
        await channel.bulkDelete(chunked[index]).catch(error => console.log(error))

        const DeletedEmbed = new Discord.EmbedBuilder()
            .setColor('DarkBlue')
            .setThumbnail(message.guild.iconURL())
            .setAuthor({ name: 'Messages Deleted', iconURL: message.author.displayAvatarURL() })
            .setDescription('Messages has been deleted from the channel')
            .setFooter({ text: `Total Deleted: ${filter.length.toLocaleString()}` }).setTimestamp()
        await message.channel.send({ embeds: [DeletedEmbed] });

    }
}

/**
 * 
 * @param {number} value 
 * @param {number} limit 
 * @param {any} data - Data to be chunk in
 * @returns 
 */
function chunkBy(value, limit, data) {

    const chunks = Array(Math.floor(value / limit)).fill(limit);
    const remainder = value % limit;

    if (remainder > 0) {
        chunks.push(remainder);
    }
    return chunks;
}

const fourteenDaysAgo = (date) => {
    const week = 1.21e+9
    const weeks = Date.now() - week;

    return date > weeks;
}