require('dotenv').config();
const Discord = require('discord.js');
const DiscordTypes = require('discord-api-types/v10');

module.exports = {
    data: {
        name: "personal",
        aliases: "",
        minArgs: 0,
        maxArgs: null,
        expectedArgs: "personal",
    },
    path: {
        dir: __dirname,
        file: __filename,
        relative: __filename.replace(process.cwd(), "").replace(/\\/g, "/")
    },
    cooldown: {
        time: 0,
        unit: "",
        type: "",
        status: false,
    },
    information: {
        name: 'personal',
        category: "Settings",
        description: "Send an embed for personal space managemennt",
        commandType: "Private",
        permissions: "Not Available",
        commandUsage: `personal`,

    },
    authorization: {
        status: true,
        users: "747074554089963540",
        roles: "",
        banned: "",
        usersError: "Your're not authorized to use this command",
        rolesError: "",
        bannedError: "",
        permissions: "",
        permissionsError: "",
    },
    /**
     * @param {Discord.Message} message 
     * @param {string[]} arguments
     * @param {string} text
     * @param {Discord.Client} client 
     */
    async execute(message, arguments, text, client) {

        await message.delete();

        const PerosnalEmbed = new Discord.EmbedBuilder()
            .setColor(617142)
            .setAuthor({ name: 'Private Space', iconURL: message.guild.iconURL() })
            .setDescription("You can create a private channel special for you.\nThis channel will be hidden from the public.\nFeel free to navigate using the button below.")
            .setImage("https://media.discordapp.net/attachments/880474481607458877/880476084892758116/f740f7ca9c2eaac9915e648111848d9e.png")
            .setThumbnail("https://media.discordapp.net/attachments/880474481607458877/881051268871749682/Light_Show.gif?width=781&height=586")
        const button = [
            new Discord.ButtonBuilder()
                .setCustomId("BUTTON_VOICE_CREATE_CHANNEL")
                .setStyle(DiscordTypes.ButtonStyle.Primary)
                .setLabel('Create Channel'),
            new Discord.ButtonBuilder()
                .setCustomId('BUTTON_VOICE_AUTHORIZE')
                .setStyle(DiscordTypes.ButtonStyle.Success)
                .setLabel('Authorize'),
            new Discord.ButtonBuilder()
                .setCustomId('BUTTON_VOICE_REVOKE')
                .setStyle(DiscordTypes.ButtonStyle.Danger)
                .setLabel('Revoke'),
            new Discord.ButtonBuilder()
                .setCustomId('BUTTON_VOICE_OPTION')
                .setStyle(DiscordTypes.ButtonStyle.Secondary)
                .setLabel('Options'),
            new Discord.ButtonBuilder()
                .setCustomId('BUTTON_VOICE_DELETE')
                .setStyle(DiscordTypes.ButtonStyle.Danger)
                .setEmoji('🗑'),
        ]
        const component = new Discord.ActionRowBuilder()
            .addComponents(button)
        message.channel.send({ embeds: [PerosnalEmbed], components: [component] });

    }
}