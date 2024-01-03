require("colors");
const Discord = require('discord.js');
const Duration = require('humanize-duration');
const abbreviate = require('js-abbreviation-number');
const ordinal = require('ordinal');
const { MessageFlags } = require("discord-api-types/v10");


class Util {

    /**
     * Add spaces between a camel case words
     * 
     * This will automatically capitalize each first letter
     * @param {string} input 
     * @example 'hotWater' => 'Hot Water'
     */
    static separateWords(input) {
        const initial =  input.replace(/([a-z])([A-Z])/g, '$1 $2');
        let words = initial.split(' ');
    
        for (let i = 0; i < words.length; i++) {
            words[i] = words[i][0].toUpperCase() + words[i].substring(1);
        }
    
        // Join the array of words back into a single string.
        return words.join(' ');
    }

    /**
     * Capitalize each first letter of a word in a sentence
     * @param {string} sentence 
     */
    static capitalizeWords(sentence) {
        // Split the sentence into an array of words
        const words = sentence.split(' ');

        // Capitalize the first letter of each word
        const capitalized = words.map(word => {
            return word[0].toUpperCase() + word.slice(1);
        });

        // Join the array of capitalized words into a sentence
        return capitalized.join(' ');
    }

    /**
     * Extract the code and bulk request from a message command
     * @param {string[]} data 
     */
    static getCodeAndBulk(data) {
        const bulk = isNaN(data[data.length - 1]) ? null : data[data.length - 1]
        const code = data.length <= 1 ? data.join(' ') : isNaN(data[data.length - 1]) ? data.join(' ') : data.slice(0, -1).join(' ');
        return { code, bulk }
    }

    /**
     * Sort word in an array base on the occurence letter
     * @param {string[]} input 
     * @param {string} letter 
     */
    static sortWords(input, letter) {
        // Check if any of the words in the input array contain the target letter
        if (!input.some(word => word.toLowerCase().includes(letter.toLowerCase()))) {
            // If no words contain the target letter, return an empty array
            return [];
        }
    
        // Keep a copy of the original array with the words in their original case
        const originalWords = [...input];
    
        // Convert the target letter to lowercase
        letter = letter.toLowerCase();
    
        return originalWords.sort((a, b) => {
            // Find the index of the target letter in the original words
            const aIndex = input[originalWords.indexOf(a)].toLowerCase().indexOf(letter);
            const bIndex = input[originalWords.indexOf(b)].toLowerCase().indexOf(letter);
    
            // If the target letter is present in both words, sort by the index of the first occurrence
            if (aIndex !== -1 && bIndex !== -1) {
                return aIndex - bIndex;
            }
    
            // If the target letter is present in only one of the words, the word with the target letter comes first
            if (aIndex !== -1) {
                return -1;
            }
            if (bIndex !== -1) {
                return 1;
            }
    
            // If the target letter is not present in either word, sort alphabetically by the first letter
            // Use the localeCompare() method to compare the words in a case-insensitive way
            return a.localeCompare(b, undefined, { sensitivity: 'base' });
        });
    }    

    /**
     * @param {Array} array 
     * @param {Array} filter 
     * @returns 
     */
    static filterbyArray(array, filter) {
        return array.filter(key => !filter.includes(key));
    }

    /**
     * Format a date into formatted time
     * * 01:01 AM
     * @param {Date} date 
     * @returns 
     */
    static formatTime(date) {
        let hours = date.getHours();
        let minutes = date.getMinutes();
        const digitize = ('0000' + (hours * 100 + minutes)).slice(-4);
        return digitize.slice(0, 2) + ":" + digitize.slice(2);
    }

    /**
     * Convert 24-hours system into 12-hours system
     * @param {Date} date 
     * @returns 
     */
    static convertTimeSystem(date) {
        let hours = date.getHours();
        let minutes = date.getMinutes();
        const regex = /^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/
        const digitize = ('0000' + (hours * 100 + minutes)).slice(-4);
        const formated = digitize.slice(0, 2) + ":" + digitize.slice(2);
    
        let time = formated.match(regex) || [date]
    
        if (time.length > 1) {
            time = time.slice(1);
            time[5] = +time[0] < 12 ? ' AM' : ' PM';
            time[0] = +time[0] % 12 || 12;
        }
        
        hours = time[0]
        minutes = parseInt(time[2])
        const format = ('0000' + (hours * 100 + minutes)).slice(-4);
    
        return format.slice(0, 2) + ":" + format.slice(2) + time[5]
    }

    static generateRandomColor() {
        let letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
          color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

    /**
     * Use to add balance to a user.
     * Automatically revalue balance according to balance and limit
     * @param {number} limit 
     * @param {number} balance 
     * @param {number} amount 
     */
    static filterLimit(limit, balance, amount) {
        const total = balance + amount
        const exceed = limit - total
    
        if (exceed < 0) 
        return { add: amount + exceed, exceed }
    
        return { add: amount, exceed }
    }

    /**
     * Create a Discord image url
     * @param {string} root 
     * @returns 
     */
    static createImageURL(root, { format = 'webp', size = 4096 } = {}) {
        return `${root}.${format}${size ? `?size=${size}` : ''}`
    }

    /**
     * Create a dynamic Discord user icon url
     * @param {string} id 
     * @param {string} hash 
     * @param {string} format 
     * @param {number} size 
     */
    static createUserIconURL(id, hash, { format, size } = {}) {
        const base = 'https://cdn.discordapp.com'
        if (!hash) return
        if (hash.startsWith('a_')) {
            format = 'gif';
        } else {
            format = 'webp';
        }
        return this.createImageURL(`${base}/avatars/${id}/${hash}`, { format, size });
    }

    /**
     * Create a dynamic Discord guild icon url
     * @param {string} id 
     * @param {string} hash 
     * @param {string} format 
     * @param {number} size 
     */
    static createIconURL(id, hash, { format, size } = {}) {
        const base = 'https://cdn.discordapp.com'
        if (!hash) return
        if (hash.startsWith('a_')) {
            format = 'gif';
        } else {
            format = 'webp';
        }
        return this.createImageURL(`${base}/icons/${id}/${hash}`, { format, size });
    }

    /**
     * Create banner url
     * @param {string} id 
     * @param {string} hash 
     * @param {{ format: string, size: number }} param2 
     * @returns 
     */
    static createBannerURL(id, hash,  { format, size } = {}) {
        const base = 'https://cdn.discordapp.com'
        if (!hash) return 
        if (hash.startsWith('a_')) {
            format = 'gif';
        } else {
            format = 'webp';
        }
        return this.createImageURL(`${base}/banners/${id}/${hash}`, { format, size });
    }

    /**
     * 
     * @param {string} id 
     * @param {string} hash 
     * @param {{ size: number }} param2 
     * @returns 
     */
    static createSplashURL(id, hash, { size } = {}) {
        const base = 'https://cdn.discordapp.com'
        if (!hash) return 
        return this.createImageURL(`${base}/splashes/${id}/${hash}`, { size });
    }

    /**
     * Convert number to it's word base
     * @param {number} num 
     */
    static inWords(num) {
        const a = [
          "",
          "One ",
          "Two ",
          "Three ",
          "Four ",
          "Five ",
          "Six ",
          "Seven ",
          "Eight ",
          "Nine ",
          "Ten ",
          "Eleven ",
          "Twelve ",
          "Thirteen ",
          "Fourteen ",
          "Fifteen ",
          "Sixteen ",
          "Seventeen ",
          "Eighteen ",
          "Nineteen ",
        ];
        const b = [
          "",
          "",
          "Twenty",
          "Thirty",
          "Forty",
          "Fifty",
          "Sixty",
          "Seventy",
          "Eighty",
          "Ninety",
        ];

        if ((num = num.toString()).length > 9) return 'Overflow';
        n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
        if (!n) return; let string = '';
        string += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'Million ' : '';
        string += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'Hundred Thousand ' : '';
        string += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'Thousand ' : '';
        string += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'Hundred ' : '';
        string += (n[5] != 0) ? ((string != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) + 'only ' : '';
        return string;
    }

    /**
     * Create a cooldown for a command
     * locally.
     * * Don't use this method for cooldown more than
     *   24 hours.
     * @param {string} operation
     * @param {string} id 
     * @param {Map} map 
     * @param {number} cooldown
     */
    static cooldown(operation, id, map, cooldown) {

        const time = map.get(id);

        switch (operation) {
            case 'set':
                map.set(id, Date.now() + cooldown);
                setTimeout(() => { map.delete(id) }, cooldown);
            break;

            case 'get':
                return {
                    status: time,
                    remaining: Duration(time - Date.now(), { units: ['y', 'd', 'h', 'm', 's'], round: true })
                }

            case 'delete':
                return map.delete(id);

            default:
                console.log('Invalid Operation')

        }
    }

    /**
     * Remove all duplicate values from an array
     * @param {any[]} array 
     * @returns 
     */
    static uniqueArray(array) {
        return array.filter((item, index) => array.indexOf(item) === index)
    }

    /**
     * Plurarize a string
     * @param {number} count 
     * @param {string} noun 
     * @param {string} suffix 
     * @returns 
     */
    static pluralize(count, noun, suffix = 's') {
        return `${count.toLocaleString()} ${noun}${count !== 1 ? suffix : ''}`;
    }

    /**
     * Check if string is empty
     * @param {string} string 
     */
    static checkForEmptyString(string) {
        if (string === "") {
            return true
        } else {
            return false
        }
    }

    /**
     * Delete message after delay ended
     * @param {Discord.Message} message Message Object
     * @param {number} delay Time to be deleted (In seconds)
     */
    static deleteMessage(message, delay = 10) {
        setTimeout(() => {
            message.delete().catch((error) => {})
        }, 1000 * delay)

        return message
    }

    /**
     * Create a channel member counter in a guild
     * @param {Discord.Guild} guild 
     * @param {string} channelId 
     * @param {string} name 
     */
    static channelMemberCounter(guild, channelId, name = 'Member:') {
        const update = guild.channels.cache.get(channelId);
        if (!update) return
        update.setName(`${name}${guild.memberCount.toLocaleString()}`)
    }

    /**
     * Get server invite from message content
     * @param {string} content 
     * @returns 
     */
    static extractInviteCode(content) {
        const regex = /discord(?:(?:app)?\.com\/invite|\.gg(?:\/invite)?)\/([\w-]{2,255})/gi
        const array = regex.exec(content);
        if (!array) return
        return array[1]
    }

    /**
     * Check for server invite
     * @param {Discord.Guild} guild 
     * @param {string} code 
     * @returns {Promise<boolean>}
     */
    static async serverInvite(guild, code) {
        return await new Promise(resolve => {
            guild.invites.fetch().then(invites => {
                for (const invite of invites) {
                    if (code === invite[0]) {
                        return resolve(true)
                    }
                }

                resolve(false)
            })
        })
    }

    /**
     * Add an ordinal suffix to a provided number
     * @param {number} value 
     */
    static ordinalSuffix(value) {
        return ordinal(value);
    }

    /**
    * Check if array has an empty string value
    * @param {string[]} array 
    * @returns 
    */
    static noneEmptyStringArray(array) {
        if (!array) return
        for (let i = 0; i < array.length; i++) {
            if (array[i] === "") 
            return false;
        }
        return true;
    }

    /**
    * Split array element into sizable chunk
    * @param {number} size 
    * @param {[]} input 
    * @returns 
    */
    static arrayChunk(size, input) {
        return input.reduce((resultArray, item, index) => {
            const chunkIndex = Math.floor(index / size)

            if (!resultArray[chunkIndex]) {
                resultArray[chunkIndex] = []
            }

            resultArray[chunkIndex].push(item)

            return resultArray
        }, [])
    }

    /**
     * Capitalize first letter of a string
     * @param {string} string 
     */
    static capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase()
            + string.slice(1)
    }

    /**
     * Check for any empty string
     * @param {*} string 
     */
    static checkEmptyString(string) {
        if (string === "") {
            return true
        } else {
            return false
        }
    }

    /**
     * Split string into sizable chunk array
     * @param {string} string 
     * @param {number} size 
     */
    static chunkString(string, size) {
        let offset = 0;
        const result = [];
        const chunkSize = Math.ceil(string.length / size);

        for (let i = 0; i < chunkSize; i++) {
            result[i] = string.substring(offset, offset + size);
            offset += size;
        }

        return result;
    }

    /**
     * Create a sliding progresss bar
     * @param {number} total 
     * @param {number} current 
     * @param {number} size 
     * @param {string} line The line design
     * @param {string} slider The moving progress bar design
     * @returns 
     */
    static splitProgressBar(total, current, size = 40, line = '▬', slider = '🔘') {
        if (current > total) {
            const bar = line.repeat(size + 2);
            const percentage = (current / total) * 100;
            return [bar, percentage];
        } else {
            const percentage = current / total;
            const progress = Math.round((size * percentage));
            const emptyProgress = size - progress;
            const progressText = line.repeat(progress).replace(/.$/, slider);
            const emptyProgressText = line.repeat(emptyProgress);
            const bar = progressText + emptyProgressText;
            const calculated = percentage * 100;
            return [bar, calculated];
        }
    }

    /**
     * Create a normal progress bar 
     * @param {number} total 
     * @param {number} current 
     * @param {number} size 
     * @param {string} line 
     * @param {string} slider 
     */
    static filledProgessBar(total, current, size = 40, line = '□', slider = '■') {
        if (current > total) {
            const bar = slider.repeat(size + 2);
            const percentage = (current / total) * 100;
            return [bar, percentage];
        } else {
            const percentage = current / total;
            const progress = Math.round((size * percentage));
            const emptyProgress = size - progress;
            const progressText = slider.repeat(progress);
            const emptyProgressText = line.repeat(emptyProgress);
            const bar = progressText + emptyProgressText;
            const calculated = percentage * 100;
            return [bar, calculated];
        }
    }

    /**
     * 
     * @param {number} value 
     * @returns 
     */
    static abbreviateNumber(value) {
        return abbreviate.abbreviateNumber(value, 2);
    }

    /**
     * Generate a random code 
     * @param {number} minimum 
     */
    static generatePassword(minimum) {
        let length = minimum,
            charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
            returnValue = "";
        for (let i = 0, n = charset.length; i < length; ++i) {
            returnValue += charset.charAt(Math.floor(Math.random() * n));
        }
        return returnValue;
    }
    /**
     * Update the menu after been selected
     * @param {Discord.SelectMenuInteraction} interaction 
     */
    static async updateComponent(interaction) {

        console.log("Updating Component")
        const f = interaction.message.components
            , g = f[0] || null
            , h = f[1] || null
            , i = f[2] || null
            , j = f[3] || null
            , k = f[4] || null
            , l = f[5] || null
        const comp = [g, h, i, j, k, l].filter(x => x !== null)

        if (interaction.message.flags.bitfield === MessageFlags.Ephemeral) {
            return interaction.editReply({ components: comp });
        } else {
            return interaction.message.edit({ components: comp });
        }
    }

    /**
     * Convert number to percentage string
     * @param {number} value
     * @param {number} precision
     */
    static percentage(value, precision = 0) {
        let number;
        if (value === Infinity) {
          number = "∞";
        } else if (value === -Infinity) {
          number = "-∞";
        } else {
          number = (Number(value) * 100).toFixed(precision);
        }
        return number + "%";
      }
      
}

module.exports = {
    Util
}