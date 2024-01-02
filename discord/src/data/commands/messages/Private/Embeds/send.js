const fs = require('fs');
require('dotenv').config();
const Discord = require('discord.js');
const { Util } = require('../../../../../../util/util');

module.exports = {
    data: {
        name                : 'send',
        aliases             : '',
        minArgs             : 0,
        maxArgs             : null,
        expectedArgs        : 'send',
    },
    cooldown: {
        time    : 1,
        unit    : 'hours',
        status  : false,
    },
    information         : {
        name            : 'send',
        category        : 'Private',
        description     : 'Not Available',
        commandType     : 'Private',
        permissions     : 'Developer Only',
        commandUsage    : `send`,

    },
    authorization: {
        status  : false,
        users   : '',
        roles   : '',
        banned  : '',
        usersError  : "You're not authorize to use this command",
        rolesError  : '',
        bannedError : '',
        permissions : '',
        permissionsError : '',
    },
    /**
     * @param {Discord.Message} message 
     * @param {string[]} arguments
     * @param {string} text
     * @param {Discord.Client} client 
     */
    async execute(message, arguments, text, client) {

        await message.delete();
        const brightness = Util.filledProgessBar(255, 0, 12, '⬜', '🟩');

        const ControlEmbed = new Discord.EmbedBuilder()
            .setColor('Green')
            .setAuthor({ name: 'Luminosity Lighting System', iconURL: message.guild.iconURL() })
            .setFields([
                {
                    name: 'Brightness',
                    value: `${brightness[0]} ${Math.floor(brightness[1])}%`,
                    inline: true
                },
                {
                    name: "Light State",
                    value: "💡 | ON"
                }
            ])
            .setImage('https://cdn.discordapp.com/attachments/1096710772752658513/1141705969278140497/98e32998-5b66-4281-aa4d-8c4f45a51e60.jpg?ex=653a578a&is=6527e28a&hm=00eb57ae37581b2d13d7130920669538bc1058a60489643df82e1f83cc69118a&')
            .setFooter({ text: 'Control the light by using the button below.' });
        const button = [
            new Discord.ButtonBuilder()
                .setCustomId('INCREASE_BRIGHTNESS')
                .setStyle(Discord.ButtonStyle.Primary)
                .setEmoji('➕'),
            new Discord.ButtonBuilder()
                .setCustomId('ON')
                .setStyle(Discord.ButtonStyle.Success)
                .setLabel('ON'),
            new Discord.ButtonBuilder()
                .setCustomId('OFF')
                .setStyle(Discord.ButtonStyle.Danger)
                .setLabel('OFF'),
            new Discord.ButtonBuilder()
                .setCustomId('DECREASE_BRIGHTNESS')
                .setStyle(Discord.ButtonStyle.Primary)
                .setEmoji('➖'),
            new Discord.ButtonBuilder()
                .setCustomId("RESET_BRIGHTNESS")
                .setStyle(Discord.ButtonStyle.Secondary)
                .setLabel("Reset")
        ]
        const component = new Discord.ActionRowBuilder()
            .setComponents(button)
        message.channel.send({ embeds: [ControlEmbed], components: [component] });

        fs.readFile('src/data/commands/messages/Private/Embeds/buffer.txt', { encoding: 'utf-8' }, (error, data) => {
        })
    }
}