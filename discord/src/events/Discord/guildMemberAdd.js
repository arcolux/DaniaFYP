const Discord = require('discord.js');
const ProfileManager = require('../../../lib/classes/Base/ProfileManager');

module.exports = {
    data: {
        name: 'guildMemberAdd',
        once: false,
    },
    /**
     * @param {Discord.GuildMember} member 
     * @param {Discord.Client} client 
     */
    execute : async (member, client) => {

        console.log('Member has Joined:', member.user);
        
        // TODO: Create profile data for the guild
        const profile = new ProfileManager({ user: member.user, guild: member.guild });
        await profile.createProfile();

    }
}