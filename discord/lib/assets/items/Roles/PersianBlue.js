const Discord = require('discord.js');
const ItemManager = require('../../../../lib/classes/Base/ItemManager');
const EconomyManager = require('../../../../lib/classes/Base/EconomyManager');

module.exports = {
    id          : '1097117507938160710',
    name        : 'Persian Blue',
    code        : 'PSBE',
    type        : 'roles',
    value       : 1,
    aliases     : [''],
    obtainable  : true,
    prices: {
        buy: 300,
        sell: null
    },
    cooldown: {
        time: 0,
        unit: '',
        status: false,
    },
    obtaining: {
        status: true,
        crafting: {},
        how: ''
    },
    information: {
        effect: 'No Effect',
        category: 'Blue Colored Roles',
        consumable: 'No',
        description: 'The basic blue color',
        permissions: 'Not Available',
        requirement: 'Not Available',
    },
    authorization: {
        status: false,
        users: [''],
        roles: [''],
        banned: [''],
        usersError: '',
        rolesError: '',
        bannedError: '',
        permissions: '',
        permissionsError: '',
    },
    /**
     * @param {Discord.Message} message 
     * @param {Discord.Client} client 
     * @param {any} options 
     */
    async use(message, client, options = {}) {},
    /**
     * @param {Discord.Message} message 
     * @param {Discord.Client} client 
     * @param {any} options 
     */
    async buy(message, client, options = {}) {
        const role = message.guild.roles.cache.get(this.data.id);
        const economy = new EconomyManager({ user: message.author, guild: message.guild });
        const member = await message.guild.members.fetch(message.author.id);

        const db = await ItemManager.schema.findOneAndUpdate({
            id: message.author.id,
        }, {
            id: message.author.id,
            $push: {
                'data.roles': role.id
            }
        }, {
            upsert: true
        });

        const ownedRoles = db.data.roles.map(data => message.guild.roles.cache.get(data));
        member.roles.remove(ownedRoles);

        economy.updateBalance({ amount: this.prices.buy * -1 });
        member.roles.add(role);

        const RoleAddedEmbed = new Discord.EmbedBuilder()
            .setColor('Random')
            .setAuthor({ name: 'Role Added', iconURL: message.author.displayAvatarURL() })
            .setDescription('The role has been added to your account')
            .setFooter({ text: `Requested by ${message.author.username}` }).setTimestamp()
        message.channel.send({ embeds: [RoleAddedEmbed] });
    },
    /**
     * @param {Discord.Message} message 
     * @param {Discord.Client} client 
     * @param {any} options 
     */
    async sell(message, client, options = {}) {},
    /**
     * @param {Discord.Message} message 
     * @param {Discord.Client} client 
     * @param {any} options 
     */
    async craft(message, client, options = {}) {},
    /**
     * Checking a requirement for this item
     * @param {Discord.Message} message
     * @param {Discord.Client} client 
     * @returns {boolean}
     */
    async requirement(message, client, options = {}) {
        switch(options.request) {
            case 'buy':
                const db = await new ItemManager(this.data.code, client, message.author).getDatabase();

                if (db) {
                    const roles = db.data.roles
                    const purchased = message.guild.roles.cache.get(this.data.id).toString() || 'Unknown Role'

                    if (roles.includes(this.data.id)) {
                        const OwnedRoleEmbed = new Discord.EmbedBuilder()
                            .setColor('Red')
                            .setAuthor({ name: 'Owning Notice', iconURL: message.author.displayAvatarURL() })
                            .setDescription(`You already purchased ${purchased}`)
                        message.channel.send({ embeds: [OwnedRoleEmbed] }); return true
                    }

                } else {
                    return false
                }
            break
        }
    },
}