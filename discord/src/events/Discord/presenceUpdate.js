const Discord = require('discord.js');
const { Util } = require("../../../util/util");

module.exports = {
    data: {
        name: 'presenceUpdate',
        once: false,
    },
    path: {
		dir		 : __dirname,
		file	 : __filename,
		relative : __filename.replace(process.cwd(), "").replace(/\\/g, "/")
	},
    /**
     * @param {Discord.Presence} oldPresence 
     * @param {Discord.Presence} newPresence 
     */
    execute : async (oldPresence, newPresence) => {

        

    }
}