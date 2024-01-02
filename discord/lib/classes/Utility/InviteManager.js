const axios = require('axios').default;
const { Util } = require('../../../util/util');

class Invite {
    /**
     * @param {InviteOptions} options 
     */
    constructor(options = {}) {
        this.client = options.client;
        this.data = options.data;
    }

    /**
     * Extract the invite code from the content
     * @param {string} content 
     * @returns {string | null}
     */
    static code(content) {
        return Util.extractInviteCode(content);
    }

    /**
     * Fetch the raw invite data from the API
     * @param {string} inviteCode 
     * @returns {Promise<Invite | number>}
     */
    static async fetchRawInviteData(inviteCode) {
        try {
            const response = await axios.get(`https://discord.com/api/v10/invites/${inviteCode}?with_counts=true`);
            if (response.status !== 200) {
                throw new Error(response.status);
            }
            const data = response.data;
            return new Invite({ data });
        } catch (error) {
            return error.response.status;
        }
    }

    /**
     * The code of this invite link
     * @type {string | null}
     */
    get code() {
        return 'code' in this.data ? this.data.code : null;
    }

    /**
     * The invite link to the guild
     */
    get url() {
        return `https://discord.gg/${this.code}`
    }

    /**
     * The type of the invite
     * @type {number | null}
     */
    get type() {
        return 'type' in this.data ? this.data.type : null;
    }

    /**
     * The expiration date of the invite
     * @type {Date | null}
     */
    get expires_at() {
        return 'expires_at' in this.data ? new Date(this.data.expires_at) : null;
    }

    /**
     * The guild information of the invite
     * @type {RawGuild | null}
     */
    get guild() {
        if ('guild' in this.data) {
            const guildData = this.data.guild;
            return new Guild(guildData);
        }
        return null;
    }

    /**
     * The channel information of the invite
     * @type {RawChannel | null}
     */
    get channel() {
        if ('channel' in this.data) {
            const channelData = this.data.channel;
            return new Channel(channelData);
        }
        return null;
    }

    /**
     * The inviter information of the invite
     * @type {RawChannel | null}
     */
    get inviter() {
        if ('inviter' in this.data) {
            const inviterData = this.data.inviter;
            return new Inviter(inviterData);
        }
        return null;
    }

    /**
     * @type {number}
     */
    get approximate_member_count() {
        if ('approximate_member_count' in this.data) {
            return this.data.approximate_member_count
        }
    }

    /**
     * @type {number}
     */
    get approximate_presence_count() {
        if ('approximate_presence_count' in this.data) {
            return this.data.approximate_presence_count
        }
    }
}

class Guild {
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.splash = data.splash || null;
        this.banner = data.banner || null;
        this.description = data.description || null;
        this.icon = data.icon || null;
        this.features = data.features || [];
        this.verification_level = data.verification_level || null;
        this.vanity_url_code = data.vanity_url_code || null;
        this.nsfw = data.nsfw || false;
        this.nsfw_level = data.nsfw_level || null;
    }

    /**
     * Get the URL of the guild's icon
     * @returns {string | null}
     */
    iconURL() {
        return this.icon ? Util.createIconURL(this.id, this.icon) : null;
    }

    /**
     * Get the URL of the guild's banner
     * @returns {string | null}
     */
    bannerURL() {
        return this.banner ? Util.createBannerURL(this.id, this.banner) : null;
    }

    /**
     * Get the URL of the guild's splash image
     * @returns {string | null}
     */
    splashURL() {
        return this.splash ? Util.createSplashURL(this.id, this.splash) : null;
    }
}

class Channel {
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.type = data.type;
    }
}

class Inviter {
    constructor(data) {
        this.id = data.id;
        this.username = data.username;
        this.avatar = data.avatar || null;
        this.avatar_decoration = data.avatar_decoration || null;
        this.discriminator = data.discriminator || null;
        this.public_flags = data.public_flags || null;
    }

    /**
     * Get the URL of the inviter's display avatar
     * @returns {string | null}
     */
    displayAvatarURL() {
        return this.avatar ? Util.createUserIconURL(this.id, this.avatar) : null;
    }

    
}

module.exports = Invite;

/**
 * @typedef {object} InviteOptions
 * @property {Discord.Client} client
 * @property {object} data - Raw data of the API response
 */

/**
 * @typedef {object} RawGuild
 * @property {string} id
 * @property {string} name
 * @property {string | null} splash
 * @property {string | null} banner
 * @property {string | null} description
 * @property {string | null} icon
 * @property {string[]} features
 * @property {number | null} verification_level
 * @property {string | null} vanity_url_code
 * @property {boolean} nsfw
 * @property {number | null} nsfw_level
 * @property {string} splashURL
 * @property {string} bannerURL
 * @property {string} iconURL
 */

/**
 * @typedef {object} RawChannel
 * @property {string} id
 * @property {string} name
 * @property {string} type
 */

/**
 * @typedef {object} RawInviter
 * @property {string} id
 * @property {string} username
 * @property {string | null} avatar
 * @property {string | null} avatar_decoration
 * @property {string | null} discriminator
 * @property {object | null} public_flags
 */

