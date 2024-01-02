const cache = {
    commands: {
        user: {},
    },
    item: {
        user: {},
    },
    item: {
        user: {},
    }
}
const ms = require('ms');
const Discord = require('discord.js');
const Duration = require('humanize-duration');
const schema = require('../../database/Schema/cooldown');

class CooldownManager {
    /**
     * 
     * @param {Discord.User} user 
     * @param {Discord.Guild} guild 
     * @param {CooldownOptions} options
     */
    constructor(options = {}) {
        this.user = options.user
        this.guild = options.guild
        this.schema = schema
        this.cache = cache
    }

    /**
     * Cache of this manager
     */
    static cache = cache

    /**
     * Load all save cooldown when the system start
     */
    static async loadCooldownData() {
        console.log('Loading Cooldown Data')
        const db = await schema.find();
        db.map(database => cache.commands.user[database.userId] = database.commands.user.data);
        db.map(database => cache.item.user[database.userId] = database.components.user.data);
        console.log('Cooldown Data has been reloaded')
    }


    /**
     * Get a cooldown depending on type
     * @param {string} name
     * @param {CooldownDataOptions} cooldown
     */
    async checkCommandCooldown(name, cooldown) {

        if (cooldown.status === false) return;

        if (cache.commands.user[this.user.id]) {

            const temporary = {}
            const commands = cache.commands.user[this.user.id]

            if (!commands[name]) {
                
                temporary[name] = new Date();
                Object.assign(commands, temporary);

                await this.schema.findOneAndUpdate({
                    userId: this.user.id
                }, {
                    $set: {
                        commands: {
                            user: {
                                data: commands
                            }
                        }
                    }
                })

                return { active: false, remaining: null }

            }

            const now = new Date().getTime();
            const then = new Date(commands[name]).getTime();
            const time = ms(cooldown.time + ' ' + cooldown.unit);
            const remaining = Duration(Math.abs(now - then - time), { units: ['y', 'd', 'h', 'm', 's'], round: true });

            if (now >= (then + time)) {
                
                commands[name] = new Date();

                await this.schema.findOneAndUpdate({
                    userId: this.user.id
                }, {
                    commands: {
                        user: {
                            data: commands
                        }
                    }
                })

                return { active: false, remaining: null }

            } else {

                return { active: true, remaining }

            }

        } else {

            const commands = {}
            const temporary = {}
            const db = await this.schema.findOne({ userId: this.user.id });

            if (!db) {

                commands[name] = new Date();

                await this.schema.create({
                    userId: this.user.id,
                    commands: {
                        user: {
                            data: commands
                        }
                    }
                });

                cache.commands.user[this.user.id] = commands

                return { active: false, remaining: null }
            }

            if (!cache.commands.user[this.user.id]) {

                temporary[name] = new Date();
                cache.commands.user[this.user.id] = temporary

                await this.schema.findOneAndUpdate({
                    userId: this.user.id
                }, {
                    $set: {
                        commands: {
                            user: {
                                data: cache.commands.user[this.user.id]
                            }
                        }
                    }
                })

                return { active: false, remaining: null }
            }

        }
    }

    /**
     * Handling a component cooldown
     * @param {string} name 
     * @param {CooldownDataOptions} cooldown 
     * @returns 
     */
    async checkComponentCooldown(name, cooldown) {

        if (cooldown.status === false) return;

        if (cache.item.user[this.user.id]) {

            const temporary = {}
            const component = cache.item.user[this.user.id]

            if (!component[name]) {
                
                temporary[name] = new Date();
                Object.assign(component, temporary);

                await this.schema.findOneAndUpdate({
                    userId: this.user.id
                }, {
                    $set: {
                        components: {
                            user: {
                                data: component
                            }
                        }
                    }
                })

                return { active: false, remaining: null }

            }

            const now = new Date().getTime();
            const then = new Date(component[name]).getTime();
            const time = ms(cooldown.time + ' ' + cooldown.unit);
            const remaining = Duration(Math.abs(now - then - time), { units: ['y', 'd', 'h', 'm', 's'], round: true });

            if (now >= (then + time)) {
                
                component[name] = new Date();

                await this.schema.findOneAndUpdate({
                    userId: this.user.id
                }, {
                    components: {
                        user: {
                            data: component
                        }
                    }
                })

                return { active: false, remaining: null }

            } else {

                return { active: true, remaining }

            }

        } else {

            const component = {}
            const temporary = {}
            const db = await this.schema.findOne({ userId: this.user.id });

            if (!db) {

                component[name] = new Date();

                await this.schema.create({
                    userId: this.user.id,
                    components: {
                        user: {
                            data: component
                        }
                    }
                });

                cache.item.user[this.user.id] = component

                return { active: false, remaining: null }
            }

            if (!cache.item.user[this.user.id]) {

                temporary[name] = new Date();
                cache.item.user[this.user.id] = temporary

                await this.schema.findOneAndUpdate({
                    userId: this.user.id
                }, {
                    $set: {
                        components: {
                            user: {
                                data: cache.commands.user[this.user.id]
                            }
                        }
                    }
                })

                return { active: false, remaining: null }
            }

        }
    }

    /**
     * Handling an item cooldown
     * @param {string} name 
     * @param {*} cooldown 
     */
    async checkItemCooldown(name, cooldown) {

        if (cooldown.status === false) return;

        if (cache.item.user[this.user.id]) {

            const temporary = {}
            const items = cache.item.user[this.user.id]

            if (!items[name]) {
                
                temporary[name] = new Date();
                Object.assign(items, temporary);

                await this.schema.findOneAndUpdate({
                    userId: this.user.id
                }, {
                    $set: {
                        components: {
                            user: {
                                data: items
                            }
                        }
                    }
                })

                return { active: false, remaining: null }

            }

            const now = new Date().getTime();
            const then = new Date(items[name]).getTime();
            const time = ms(cooldown.time + ' ' + cooldown.unit);
            const remaining = Duration(Math.abs(now - then - time), { units: ['y', 'd', 'h', 'm', 's'], round: true });

            if (now >= (then + time)) {
                
                items[name] = new Date();

                await this.schema.findOneAndUpdate({
                    userId: this.user.id
                }, {
                    components: {
                        user: {
                            data: items
                        }
                    }
                })

                return { active: false, remaining: null }

            } else {

                return { active: true, remaining }

            }

        } else {

            const component = {}
            const temporary = {}
            const db = await this.schema.findOne({ userId: this.user.id });

            if (!db) {

                component[name] = new Date();

                await this.schema.create({
                    userId: this.user.id,
                    components: {
                        user: {
                            data: component
                        }
                    }
                });

                cache.item.user[this.user.id] = component

                return { active: false, remaining: null }
            }

            if (!cache.item.user[this.user.id]) {

                temporary[name] = new Date();
                cache.item.user[this.user.id] = temporary

                await this.schema.findOneAndUpdate({
                    userId: this.user.id
                }, {
                    $set: {
                        components: {
                            user: {
                                data: cache.commands.user[this.user.id]
                            }
                        }
                    }
                })

                return { active: false, remaining: null }
            }

        }
    }

    /**
     * Reset a save cooldown then update the database
     * @param {string} target 
     * @param {string} type 
     */
    async resetCommandCooldown(target, type) {
        const data = {}
        const db = await this.schema.findOne({ userId: this.user.id });

        if (!db) return null

        Object.assign(data, db.commands);

        if (type === 'user') {
            // TODO: Checking is property exist
            if (data.user.data[target] === undefined) return
            delete data.user.data[target]
        } else if (type === 'guild') {
            if (data.guild.data[this.guild.id][target] === undefined) return
            delete data.guild.data[this.guild.id][target] 
        }

    }
}

module.exports = CooldownManager

/**
 * @typedef {object} CacheData
 * @property {} command
 * @property {} component
 */

/**
 * @typedef {object} CooldownOptions
 * @property {Discord.User} user
 * @property {Discord.Guild} guild
 */
/**
 * @typedef {object} CooldownDataOptions
 * @property {number} time
 * @property {string} unit
 * @property {string} type
 * @property {boolean} status
 */