require('dotenv').config();
const Discord = require('discord.js');
const DiscordTypes = require('discord-api-types/v10');

module.exports = {
    data: {
        name                : "partner",
        aliases             : "",
        minArgs             : 0,
        maxArgs             : null,
        expectedArgs        : "",
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
        name            : 'partner',
        category        : "Private",
        description     : "Send an embed for partnership application",
        commandType     : "Private",
        permissions     : "Not Available",
        commandUsage    : `partner`,

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
            .setDescription('Please use the button below to apply for partnership')
        const button = new Discord.ButtonBuilder()
            .setCustomId("PARTNER_FORM")
            .setStyle(Discord.ButtonStyle.Primary)
            .setLabel('Apply for Partnership')
        const component = new Discord.ActionRowBuilder()
            .addComponents([button])
        message.channel.send({ embeds: [PartnershipEmbed], components: [component] });

    }
}