require('dotenv').config()
const Discord = require('discord.js');
const { CommandHandler } = require('../../../lib/handler/CommandHandler');

module.exports = {
    data: {
        name: 'messageCreate',
        once: false,
    },
    /**
     * @param {Discord.Message} message 
     * @param {Discord.Client} client 
     */
    execute : async (message, client) => {

        if (message.inGuild()) {
            CommandHandler(message, client);
        }
    }
}