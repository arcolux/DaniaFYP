require('dotenv').config();
const Discord = require('discord.js');
const { Util } = require('../../../../../../util/util');

module.exports = {
    data: {
        name                : "gq",
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
        time    : 1,
        unit    : "hours",
        status  : false,
    },
    information         : {
        name            : 'gq',
        category        : "Private",
        description     : "Not Provided",
        commandType     : "Private",
        permissions     : "Developer Only",
        commandUsage    : `gq`,

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

        for (let index = 0; index < Infinity; index++) {
            const text = Util.generatePassword(128);
            console.log(text)
            
        }
        
    }
}