
const Discord = require('discord.js');
const asd = require("discord-api-types/v10")

module.exports = {
    data: {
        name: "DEBUG_OPTIONS_ONE",
    },
	path: {
		dir		 : __dirname,
		file	 : __filename,
		relative : __filename.replace(process.cwd(), "").replace(/\\/g, "/")
	},
    cooldown: {
        time: 1,
        unit: "minutes",
        type: "guild",
        status: false,
    },
    authorization: {
        status: true,
        users: "",
        roles: "02",
        banned: "",
        usersError: "You're not authorize to use this command",
        rolesError: "You do not have any roles that are authorized to use this command",
        bannedError: "You have been banned from using this command",
        permissions: "",
        permissionsError: "You do not have the required permissions to use this command",
    },
    /**
     * @param {Discord.SelectMenuInteraction} interaction 
     * @param {Discord.Client} client 
     */
    async execute(interaction, client) {

        interaction.reply({ content: "This is the first debug option" })
            .catch(error => {
                console.log(error)
                interaction.followUp({ content: "This is the first debug option" })
            })


    }
}