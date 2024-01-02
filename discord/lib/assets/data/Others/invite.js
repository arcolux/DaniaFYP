const Discord = require('discord.js');
const axios = require('axios').default;
const { Util } = require('../../../../util/util');

/**
 * Get data of a Discord Invite
 * @param {Discord.Client} client
 * @param {string} link A code or a link 
 * @return {Promise<Discord.Invite>}
 */
async function getInviteData(client, link) {

    const code = Discord.Invite.InvitesPattern.exec(link);

    if (!code) return null

    const base = 'https://discord.com/api/v10/invites/'

    const response = await axios.get(`${base}/${code[1]}`);

    return new Discord.Invite(client, response.data);

}

module.exports = {
    getInviteData
}