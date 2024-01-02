const Discord = require("discord.js");
const Builders = require("@discordjs/builders");

module.exports = {
    data: new Builders.ContextMenuCommandBuilder()
        .setName('User Info')
        .setType(2),
	path: {
		dir		 : __dirname,
		file	 : __filename,
		relative : __filename.replace(process.cwd(), "").replace(/\\/g, "/")
	},
    /**
     * @param {Discord.ContextMenuInteraction} interaction
     * @param {Discord.Client} client
     */
    async execute(interaction, client) { 
        const member = interaction.guild.members.cache.get(interaction.targetId)
        const user = await client.users.fetch(member.id, { force: true });

        const FlagEmoji = {
            HOUSE_BRAVERY: '<:bravery:980886650328608788>',
            HOUSE_BRILLIANCE: '<:brilliance:899050860338900992>',
            HOUSE_BALANCE: '<:balance:980886680535973938>',
        }

        const badge = member.user.flags.toArray().map(flag => FlagEmoji[flag]);

        await interaction.deferReply({ ephemeral: true });

        const embedResponse = new Discord.EmbedBuilder()
        .setColor(member.roles.color?.hexColor || "RANDOM")
        .setAuthor({ name: member.user.tag, iconURL: member.user.displayAvatarURL({ dynamic: true }) })
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
        .setDescription(Discord.codeBlock(member.user.id))
        .setFields([
            {
                name: 'Server Nickname',
                value: `${member.nickname || 'None'}`,
            },
            {
                name: 'Joined Discord',
                value: `<t:${Math.floor(new Date(member.user.createdTimestamp).getTime() / 1000).toString()}:R>`,
                inline: true
            },
            {
                name: 'Joined Server',
                value: `<t:${Math.floor(new Date(member.joinedTimestamp).getTime() / 1000).toString()}:R>`,
                inline: true
            },
            {
                name: 'Discord Badge',
                value: `${badge.join(' ') || 'None'}`,
                inline: true
            },
        ])
        .setImage(user.bannerURL({ dynamic: true, size: 4096 }))

        
        interaction.editReply({ embeds: [embedResponse], ephemeral: true })
    }
}