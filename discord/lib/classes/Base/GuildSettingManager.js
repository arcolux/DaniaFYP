const cache = {}
const Discord = require('discord.js');
const collection = new Discord.Collection();
const schema = require('../../database/Schema/Settings/guild');

class GuildSettings {

    static schema = schema
    /**
     * @param {ManagerOptions} options 
     */
    constructor(options = {}) {
        this.guild = options.guild
        this.schema = schema
        this.client = options.client
        this.cache = cache
        this.collection = collection
    }

    /**
     * Load all existing data in database and save in cache
     * @param {LoadOptions} options
     */
    async loadData() {
        const db = await schema.find();

        // TODO: Save all data into cache on load

        db.map(database => {
            this.cache[database.id] = database.data
            this.collection.set(database.id, database);
        });
    }

    /**
     * Create a guild data into database collection
     * @returns 
     */
    async createGuildData() {
        return await schema.create({ id: this.guild.id });
    }

    /**
     * Fetch guild data from the database
     * @param {FetchOptions} options
     */
    async fetchGuildData(options = {}) {
        const { create } = options
        const db = await schema.findOne({ id: this.guild.id });

        if (create && !db) {
            return await this.createGuildData();
        } else {
            return await schema.findOne({ id: this.guild.id });
        }
    }

    /**
     * Base structuring for guild settings
     * @param {AssignOptions} options
     */
    async base() {

        const db = await this.fetchGuildData();

        if (!db) {
            const created = await this.createGuildData();
            this.cache[this.guild.id] = created.data
        }

        this.cache[this.guild.id] = db.data; return cache // * { '800974676187807764': { channel: { welcome: {} }, prefix: 'mb!' } }
    }

    /**
     * Guild prefix manager
     * @param {PrefixOptions} options 
     */
    async prefix(options = {}) {

        const { prefix } = options
        const db = await this.fetchGuildData({ create: true });

        // TODO: Change query
        if (prefix) {
            const update = await schema.findOneAndUpdate({
                id: this.guild.id
            }, {
                $set: {
                    data: {
                        prefix
                    }
                }
            }, {
                new: true
            });

            await this.base();
            cache[this.guild.id].prefix = update.data.prefix; return cache
        }

        // TODO: Assign Query

        await this.base();
        cache[this.guild.id].prefix = db.data.prefix; return cache
    }

    /**
     * Update internal prefix cache
     * @param {string} prefix 
     */
    updatePrefixCache(prefix) {
        cache[this.guild.id].prefix = prefix;
    }

}

module.exports = GuildSettings

/**
 * @typedef {object} LoadOptions
 * @property {Discord.Client} client
 */
/**
 * @typedef {object} ManagerOptions
 * @property {Discord.Guild} guild
 * @property {Discord.Client} client
 */
/**
 * @typedef {object} FetchOptions
 * @property {boolean} create
 */
/**
 * @typedef {object} AssignOptions
 * @property {Discord.Message} message
 * @property {string} prefix
 */
/**
 * @typedef {object} PrefixOptions
 * @property {string} prefix
 * @property {boolean} read
 */

// TODO: For Mew Notes :3
/*
I'm trying to create an autocomplete for easier for me to 
type in the future. Seem like alot need to be documented :'
Imma skip this too much to think XD
*/