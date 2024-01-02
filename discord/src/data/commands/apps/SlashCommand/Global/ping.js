const Discord = require("discord.js");
const Duration = require("humanize-duration");
const { SlashCommandBuilder } = require("@discordjs/builders");
const ProfileManager = require('../../../../../../lib/classes/Base/ProfileManager');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('View the ping data of the bot'),
    cooldown: {
        time: 0,
        unit: '',
        status: false
    },
    autocomplete: {
        choices: [],
        /**
         * @param {Discord.AutocompleteInteraction} interaction 
         * @param {Discord.Client} client 
         */
        execute(interaction, client) {}
    },
    authorization: {
        status: false,
        users: [""],
        roles: [""],
        banned: [""],
        usersError: "",
        rolesError: "",
        bannedError: "",
        permissions: "",
        permissionsError: "",
    },
	/**
	 * 
	 * @param {Discord.CommandInteraction} interaction 
	 * @param {Discord.Client} client 
	 */
	async execute(interaction, client) {

        const CalcaculatingEmbed = new Discord.EmbedBuilder()
            .setColor("2ce214")
            .setAuthor({ name: "Calculating Ping ..." })
        const initial = await interaction.reply({ embeds: [CalcaculatingEmbed], fetchReply: true });

        const profile = new ProfileManager({ user: interaction.user, guild: interaction.guild });

        const then = performance.now();
        const data = await profile.schema.create({ id: `ping-${profile.user.id}` });
        const now = performance.now();

        const ResultEmbed = new Discord.EmbedBuilder()
            .setColor("14e24b")
            .setAuthor({ name: "Calculated Ping" })
            .setFields([
                {
                    name: "Response",
                    inline: true,
                    value: `${Discord.inlineCode(initial.createdTimestamp - interaction.createdTimestamp)} ms`
                },
                {
                    name: "API Response",
                    inline: true,
                    value: `${Discord.inlineCode(client.ws.ping)} ms`
                },
                {
                    name: "Client Up Time",
                    inline: true,
                    value: Duration(client.uptime, { units: ['d', 'h', 'm', 's'], round: true })
                },
                {
                    name: 'Database Connection',
                    value: `${Math.floor(now - then)} ms`
                }
            ])

        initial.edit({ embeds: [ResultEmbed] }); await data.delete();

	},
}