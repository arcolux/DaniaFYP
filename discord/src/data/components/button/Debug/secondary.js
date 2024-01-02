const Discord = require("discord.js");
const CooldownManager = require('../../../../../lib/classes/Base/CooldownManager');

module.exports = {
    data: {
        name    : "DEBUG_SECONDARY",
    },
	path: {
		dir		 : __dirname,
		file	 : __filename,
		relative : __filename.replace(process.cwd(), "").replace(/\\/g, "/")
	},
    cooldown: {
        time    : 1,
        unit    : "minutes",
        status  : true,
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
     * @param {Discord.ButtonInteraction} interaction 
     * @param {Discord.Client} client 
     */
    execute: async (interaction, client) => {

        await CooldownManager.loadCooldownData();
        interaction.reply({ content: 'Cache has been reloaded', ephemeral: true });

    }
}