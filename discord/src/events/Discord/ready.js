const Discord   = require('discord.js');
const mongo     = require('../../../lib/database/mongo');
const CooldownManager = require('../../../lib/classes/Base/CooldownManager');
const GuildSettings = require('../../../lib/classes/Base/GuildSettingManager');
const ProfileManager = require('../../../lib/classes/Base/ProfileManager');

module.exports = {
    data: {
        name: 'ready',
        once: true,
    },
    /**
     * @param {Discord.Client} client 
     */
    execute: async (client) => {

        console.log(`Connected as ${client.user.tag}`);
        const settings = new GuildSettings({ client });
        await mongo(); 
        await settings.loadData({ client });
        await ProfileManager.preLoadUserData();
        await CooldownManager.loadCooldownData();
    }
}