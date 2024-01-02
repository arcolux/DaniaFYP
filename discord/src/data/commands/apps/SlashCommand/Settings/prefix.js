const Discord = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { PermissionFlagsBits } = require('discord-api-types/v10');
const GuildSettingManager = require('../../../../../../lib/classes/Base/GuildSettingManager');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('prefix')
		.setDescription('Show the prefix of the guild.')
		.addStringOption(option => option.setName('set').setDescription('Change the guild prefix')),
	cooldown: {
		time	: 0,
		unit	: "",
		type	: "",
		status	: false,
	},
	autocomplete: {
		choices: {
			options: [""]
		},
	},
	authorization: {
		status	: false,
		users	: [""],
		roles	: [""],
		banned	: [""],
        usersError  : "",
        rolesError  : "",
        bannedError : "",
        permissions : "",
        permissionsError : "",
	},
	/**
	 * 
	 * @param {Discord.CommandInteraction} interaction 
	 * @param {Discord.Client} client 
	 */
	async execute(interaction, client) {
		
		const set = interaction.options.getString('set');

        const settings = new GuildSettingManager({ guild: interaction.guild, client });
        const prefix = settings.cache[interaction.guild.id].prefix

		if (set) {

			if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {

				const PermissionErrorEmbed = new Discord.EmbedBuilder()
					.setColor("#ff0000")
					.setAuthor({ name: "Permission Error" })
					.setDescription("You don't have the permission to change the prefix of this guild.")
					.setTimestamp()
					.setFooter({ text: 'Manage Server is required to change the prefix', iconURL: interaction.user.displayAvatarURL() });
				return interaction.reply({ embeds: [PermissionErrorEmbed] });
			}

			await settings.prefix({ prefix: set });

			const PrefixChangeEmbed = new Discord.EmbedBuilder()
				.setColor('8623d7')
				.setAuthor({ name: 'Prefix Changed' })
				.setDescription(`The prefix of the guild is now ${set}`)
				.setTimestamp()
				.setFooter({ text: `All message command prefix has been change to ${set}`, iconURL: interaction.user.displayAvatarURL() })
			interaction.reply({ embeds: [PrefixChangeEmbed] });

		} else {
			
			const PrefixEmbed = new Discord.EmbedBuilder()
				.setColor('238fd7')
				.setAuthor({ name: 'Guild Prefix' })
				.setDescription(`The current guild prefix is **${prefix}**`)
				.setTimestamp()
				.setFooter({ text: `Requested by ${interaction.user.username}` })
			interaction.reply({ embeds: [PrefixEmbed] });
		}


	},
}