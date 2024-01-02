require('dotenv').config();
const Discord = require('discord.js');
const DiscordTypes = require('discord-api-types/v10');

module.exports = {
    data: {
        name                : "verify",
        aliases             : "",
        minArgs             : 0,
        maxArgs             : null,
        expectedArgs        : "verify",
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
        name            : 'verify',
        category        : "Private",
        description     : "Send a verification embed with component",
        commandType     : "Private",
        permissions     : "Not Available",
        commandUsage    : `verify`,

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

        const VerifyEmbed = new Discord.EmbedBuilder()
            .setColor('Aqua')
            .setAuthor({ name: 'Verification Request', iconURL: message.guild.iconURL() })
            .setDescription('To process your verification, please use the button below.') 
            .setFooter({ text: 'By verifying yourself, you agree to the rules and regulation that have been provided to you' })
        const button = [
            new Discord.ButtonBuilder()
                .setCustomId('NEWCOMER_VERIFICATION')   
                .setStyle(DiscordTypes.ButtonStyle.Primary)
                .setLabel('Verify'),
            new Discord.ButtonBuilder()
                .setCustomId('NEWCOMER_VERIFICATION_HELP')
                .setStyle(DiscordTypes.ButtonStyle.Secondary)
                .setLabel('Help'),
        ]
        const component = new Discord.ActionRowBuilder()
            .addComponents(button)
        message.channel.send({ embeds: [VerifyEmbed], components: [component] });

    }
}