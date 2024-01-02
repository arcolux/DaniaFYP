
const Discord = require('discord.js');

module.exports = {
    data: {
        name: "DEBUG_OPTIONS_TWO",
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
        roles: "",
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

        interaction.reply({ content: "This is the second debug option" })
            .catch(error => {
                console.log(error)
                interaction.followUp({ content: "This is the second debug option" })
            })


    }
}