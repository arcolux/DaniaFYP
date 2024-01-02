
const Discord = require('discord.js');
const { Util } = require("../../util/util");

module.exports = {
    name        : "Rainbow Role Color Changer",
    disabled    : true,
    listener    : "ready",
    description : "Automatically change the color role every 15 minutes",
    /**
     * @param {Discord.Client} client
     */
    async execute(client) {

        const guild = client.guilds.cache.get('800974676187807764');
        const role = guild.roles.cache.get('886421270806298624');

        setInterval(async () => {
            await role.setColor(Util.generateRandomColor())
        }, 1000 * 60 * 15);

    }
}