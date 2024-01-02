const Discord = require('discord.js');
const { Util } = require('../../../util/util');
const ProfileManager = require('./ProfileManager');

class EconomyManager extends ProfileManager {
    /**
     * @param {EconomyManagerOptions} options 
     */
    constructor(options = {}) {
        super()
        this.user = options.user
        this.guild = options.guild
    }

    /**
     * Fetch the user balance from database
     * @param {balanceOptions} options
     */
    async getBalance(options = {}) {
        const { others, pretty, abbreviate } = options
        const db = others ? await this.getProfile({ others }) : await this.getProfile();

        if (pretty) {
            return db.user.economy.balance.toLocaleString();
        } else if (abbreviate) {
            return Util.abbreviateNumber(db.user.economy.balance)
        } else {
            return db.user.economy.balance
        }

    }

    /**
     * 
     * @param {UpdateBalanceOptions} options
     */
    async updateBalance(options = {}) {
        const { user, amount } = options

        const db = user ? await this.getProfile({ others: user, create: true }) : await this.getProfile();

        return {
            collection: await this.schema.findOneAndUpdate({
                'user.id': db.user.id,
                'guild.id': db.guild.id
            }, {
                $inc: {
                    'user.economy.balance': amount
                }
            }, { new: true }),
            amount
        }

    }

    /**
     * Create a progression bar for user balance
     * @param {string} line 
     * @param {string} slider 
     * @returns 
     */
    async createBalanceProgressBar(line, slider) {
        const db = await this.getProfile();

        if (db.user.economy.limit === undefined) {
            const db = await this.schema.findOneAndUpdate({
                'user.id': this.user.id
            }, {
                $set: {
                   "user.economy.limit": 50000 
                }
            }, { upsert: true, new: true });
            return Util.filledProgessBar(db.user.economy.limit, db.user.economy.balance, 10, line, slider)
        }

        return Util.filledProgessBar(db.user.economy.limit, db.user.economy.balance, 10, line, slider);
    }

}

module.exports = EconomyManager

/**
 * @typedef {object} EconomyManagerOptions
 * @property {Discord.User} user
 * @property {Discord.Guild} guild
 */
/**
 * @typedef {object} balanceOptions
 * @property {boolean} abbreviate
 * @property {boolean} pretty
 * @property {Discord.User} others Get balance of another user
 */
/**
 * @typedef {object} UpdateBalanceOptions
 * @property {Discord.User} user The targeted user
 * @property {number} amount Amount to be update
 */