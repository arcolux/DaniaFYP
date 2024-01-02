require('dotenv').config();
const Discord = require('discord.js');

module.exports = {
    data: {
        name    : "debug",
        aliases : "d",
        minArgs : 0,
        maxArgs : null,
        expectedArgs: 'debug'
    },
    cooldown: {
        time    : 1,
        unit    : "hours",
        status  : false,
    },
    information         : {
        name            : 'debug',
        category        : "Private",
        description     : "Debug options for development",
        commandType     : "Private",
        permissions     : "Developer Only",
        commandUsage    : `debug`,

    },
    authorization: {
        status  : true,
        users   : "747074554089963540",
        roles   : "",
        banned  : "",
        usersError  : "You're not authorize to use this command",
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

        const primary = new Discord.ButtonBuilder()
            .setCustomId("DEBUG_PRIMARY")
            .setStyle(1)
            .setLabel("PRIMARY")
        const secondary = new Discord.ButtonBuilder()
            .setCustomId("DEBUG_SECONDARY")
            .setStyle(2)
            .setLabel("SECONDARY")
        const success = new Discord.ButtonBuilder()
            .setCustomId("DEBUG_SUCCESS")
            .setStyle(3)
            .setLabel("SUCCESS")
        const danger = new Discord.ButtonBuilder()
            .setCustomId("DEBUG_DANGER")
            .setStyle(4)
            .setLabel("DANGER")
        const menu = new Discord.StringSelectMenuBuilder()
            .setCustomId("DEBUG_MENU")
            .setPlaceholder("Select an option")
            .setMaxValues(2)
            .setOptions([
                {
                    label: "Option 1",
                    value: "DEBUG_OPTIONS_ONE",
                },
                {
                    label: "Option 2",
                    value: "DEBUG_OPTIONS_TWO",
                },
                {
                    label: "Option 3",
                    value: "DEBUG_OPTIONS_THREE",
                }
            ])
        const select = new Discord.StringSelectMenuBuilder()
            .setCustomId("DEBUG_MENUS")
            .setPlaceholder("Select an option")
            .setMaxValues(2)
            .setOptions([
                {
                    label: "Option 1",
                    value: "DEBUG_OPTIONS_ONES",
                },
                {
                    label: "Option 2",
                    value: "DEBUG_OPTIONS_TWOS",
                },
                {
                    label: "Option 3",
                    value: "DEBUG_OPTIONS_THREES",
                }
            ])
        const component = new Discord.ActionRowBuilder()
            .addComponents([primary, secondary, success, danger])
        const compmenu = new Discord.ActionRowBuilder()
            .addComponents([menu])
        const compselect = new Discord.ActionRowBuilder()
            .addComponents([select])
        message.channel.send({ content: "Debugging", components: [component, compmenu, compselect] });
    }
}