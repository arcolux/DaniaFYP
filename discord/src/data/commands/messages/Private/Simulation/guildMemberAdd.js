require('dotenv').config();
const Discord = require('discord.js');

module.exports = {
    data: {
        name                : "memberjoin",
        aliases             : "mj",
        minArgs             : 0,
        maxArgs             : null,
        expectedArgs        : "",
    },
    cooldown: {
        time    : 0,
        unit    : "",
        status  : false,
    },
    information         : {
        name            : 'ma',
        category        : "Private",
        description     : "Emit a member join",
        commandType     : "Private",
        permissions     : "Developer Only",
        commandUsage    : `ma`,

    },
    authorization: {
        status  : true,
        users   : "747074554089963540",
        roles   : "",
        banned  : "",
        usersError  : "Authentication Required",
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

        client.emit('guildMemberAdd', message.member);
        
    }
}