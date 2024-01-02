const { glob } = require("glob");
const { promisify } = require("util");

const ASCII = require("ascii-table");
const Discord = require("discord.js");
const { events } = require("../../validation/validation.json"); 

/**
 * @param {Discord.Client} client 
 */
module.exports = async (client) => {

    const PG = promisify(glob);
    const Table = new ASCII("Features Loaded");
    Table.setHeading("Status", "Name", "Description");

    (await PG(`/src/features/**/*.js`, { root: process.cwd() })).map((file) => {

        const feature = require(file);

        if (!feature.name) {
            return Table.addRow("FAILED", null, "MISSING NAME")
        }
        if (!feature.listener) {
            return Table.addRow("FAILED", feature.name, "MISSING LISTENER NAME")
        }
        if (!events.includes(feature.listener)) {
            return Table.addRow("FAILED", feature.name, "INVALID LISTERNER NAME")
        } 
        if (feature.disabled) {
            return Table.addRow("DISABLED", feature.name, "THE FEATURE CURRENTLY DISABLED")
        }
        if (!feature.description) {
            return Table.addRow("FAILED", feature.name, "MISSING DESCRIPTION")
        }
        if (!feature.execute) {
            return Table.addRow("FAILED", feature.name, "MISSING EXECUTE FUNCTION")
        }

        client.feature.set(feature.name, feature);
        Table.addRow("SUCCESSFUL", feature.name, "FEATURE LOADED");
        client.on(feature.listener, (...args) => feature.execute(...args, client));
        
    })

    console.log(Table.toString().magenta);
}