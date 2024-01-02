const Discord = require("discord.js");
const { MQTTClient } = require('../../../../index');

module.exports = {
    data: {
        name    : "ON",
    },
    cooldown: {
        time    : 0,
        unit    : "",
        status  : false,
    },
    authorization: {
        status  : false,
        users   : "",
        roles   : "",
        banned  : "",
        usersError  : "You're not authorize to use this button",
        rolesError  : "You do not have any roles that are authorized to use this button",
        bannedError : "You have been banned from using this button",
        permissions : "",
        permissionsError : "You do not have the required permissions to use this button",
    },
    /**
     * @param {Discord.ButtonInteraction} interaction 
     * @param {Discord.Client} client 
     */
    execute: async (interaction, client) => {
        await interaction.deferUpdate();
        MQTTClient.publish('ESP32/Dania/LightSwitch', 'ON');
    }
}