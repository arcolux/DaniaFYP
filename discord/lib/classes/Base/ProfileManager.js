const cache = { data: {} }
const Discord = require('discord.js');
const schema = require('../../database/Schema/Data/profile');

class ProfileManager {
    /**
     * @param {ProfileManagerOptions} options 
     */
    constructor(options = {}) {
        this.user = options.user
        this.guild = options.guild
    }

    schema = schema
    cache = cache

    /**
     * Preload all user data into cache
     */
    static async preLoadUserData() {
        return (await schema.find()).map(database => cache.data[database.user.id] = database), console.log('User Profile Data Reloaded'.green);
    }

    /**
     * Create a user profile
     * @param {ProfileCreateOptions} options
     */
    async createProfile(options = {}) {
        const { others } = options
        const db = others ? await schema.findOne({ 'user.id': others.id }) : await schema.findOne({ 'user.id': this.user.id });
        if (db) return; return others ? await schema.create({ 'user.id': others.id }) : await schema.create({ 'user.id': this.user.id });
    }

    /**
     * Find and delete a user profile
     */
    async deleteProfile() {
        return await schema.findOneAndDelete({
            'user.id': this.user.id
        }, {

        }, (error) => { return error });
    }

    /**
     * Fetch user data from database.
     * @param {ProfileOptions} options
     * @returns 
     */
    async getProfile(options = {}) {
        const { others, create } = options
        const db =  others ? await schema.findOne({ 'user.id': others?.id }) : await schema.findOne({ 'user.id': this.user.id });

        if (create && !db) {
            return await this.createProfile(options);
        } else {
            return db
        }
    }

}

module.exports = ProfileManager

/**
 * @typedef {object} ProfileManagerOptions
 * @property {Discord.User} user - The user of this manager
 * @property {Discord.Guild} guild - The guild of this user belongs too
 */
/**
 * @typedef {object} ProfileOptions
 * @property {Discord.User} others Search other user document
 * @property {boolean} create Create new document when not found
 */
/**
 * @typedef {object} ProfileCreateOptions
 * @property {Discord.User} others Create other user profile instead of this user
 */