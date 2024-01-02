require('dotenv').config();
const Discord = require('discord.js');
const DiscordTypes = require('discord-api-types/v10');

module.exports = {
    data: {
        name                : "application",
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
        name            : 'application',
        category        : "Private",
        description     : "Moderator application embed",
        commandType     : "Private",
        permissions     : "Not Available",
        commandUsage    : `application`,

    },
    authorization: {
        status  : true,
        users   : "747074554089963540",
        roles   : "",
        banned  : "",
        usersError  : "Your're not authorized to use this command",
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

        await message.delete();

        const PartnershipEmbed = new Discord.EmbedBuilder()
            .setColor('#0099ff')
            .setAuthor({ name: 'Partnership Application', iconURL: message.guild.iconURL() })
            .setDescription()
        const button = new Discord.ButtonBuilder()
            .setCustomId("PARTNER_FORM")
            .setStyle(Discord.ButtonStyle.Primary)
            .setLabel('Apply for Partnership')
        const component = new Discord.ActionRowBuilder()
            .addComponents([button])
        message.channel.send({ embeds: [PartnershipEmbed], components: [component] });

    }
}