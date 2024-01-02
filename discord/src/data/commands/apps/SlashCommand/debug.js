const Discord = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('debug')
		.setDescription('Not Available'),
	cooldown: {
		time	: 0,
		unit	: '',
		type	: '',
		status	: false,
	},
	autocomplete: {
		choices: {
			options: ['']
		},
	},
	authorization: {
		status	: true,
		users	: [''],
		roles	: [''],
		banned	: [''],
        usersError  : 'User',
        rolesError  : 'Role',
        bannedError : 'Banned',
        permissions : ['KICK_MEMBERS', 'BAN_MEMBERS'],
        permissionsError : 'Permission',
	},
	/**
	 * 
	 * @param {Discord.CommandInteraction} interaction 
	 * @param {Discord.Client} client 
	 */
	async execute(interaction, client) {
		
        interaction.reply({ content: 'Command Received', ephemeral: true });

	},
}