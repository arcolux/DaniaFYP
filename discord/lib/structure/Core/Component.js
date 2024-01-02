require("colors");

const { glob } = require('glob');
const ASCII = require('ascii-table');
const { promisify } = require('util');

const Discord = require('discord.js');
const { Util } = require("../../../util/util");
const { permissions, cooldown: cooldowns } = require('../../validation/validation.json');

/**
 * Load and register all buttons
 * @param {Discord.Client} client
 */
async function Button(client) {

    const PG = promisify(glob);
    const { noneEmptyStringArray } = Util;
    const Table = new ASCII('Button Loaded');
    Table.setHeading('Status', 'Name', 'Description');

    (await PG(`/src/data/components/button/**/*.js`, { root: process.cwd() })).map(file => {
        
        const path = file.split("\\");
        const button = require(file);
        Table.setHeading('Status', 'Name', 'Description', 'Origin');

        if (!button.data) {
            return Table.addRow('FAILED', null, `MISSING DATA OBJECT`);
        }

        if (!button.data.name) {
            return Table.addRow('FAILED', null, `MISSING NAME`);
        }

        if (button.cooldown.time) {

            if (isNaN(button.cooldown.time)) {
                return Table.addRow('FAILED', button.data.name, 'COOLDOWN MUST BE A NUMBER')
            }

            if (!button.cooldown.unit) {
                return Table.addRow('FAILED', button.data.name, 'MISSING COOLDOWN UNIT');
            }

            if (!cooldowns.includes(button.cooldown.unit)) {
                return Table.addRow('FAILED', button.data.name, 'INVALID COOLDOWN UNIT');
            }

        }

        if (button.authorization) {

            if (typeof button.authorization.status !== 'boolean') {
                return Table.addRow('FAILED', button.data.name, 'AUTHORIZATION STATUS MUST BE A BOOLEAN');
            }

            if (button.authorization.users) {
                if (typeof button.authorization.users === "string") {
                    button.authorization.users = [button.authorization.users];
                }

                if (noneEmptyStringArray(button.authorization.users)) {
                    if (!button.authorization.usersError) {
                        return Table.addRow('FAILED', button.data.name, 'MISSING AUTHORIZATION USERS ERROR');
                    }
                }
            }

            if (button.authorization.roles) {
                if (typeof button.authorization.roles === "string") {
                    button.authorization.roles = [button.authorization.roles];
                }

                if (noneEmptyStringArray(button.authorization.roles)) {
                    if (!button.authorization.rolesError) {
                        return Table.addRow('FAILED', button.data.name, 'MISSING AUTHORIZATION ROLES ERROR');
                    }
                }
            }

            if (button.authorization.banned) {
                if (typeof button.authorization.banned === "string") {
                    button.authorization.banned = [button.authorization.banned];
                }

                if (noneEmptyStringArray(button.authorization.banned)) {
                    if (!button.authorization.bannedError) {
                        return Table.addRow('FAILED', button.data.name, 'MISSING AUTHORIZATION BANNED ERROR');
                    }
                }
            }

            if (button.authorization.permissions) {
                if (typeof button.authorization.permissions === "string") {
                    button.authorization.permissions = [button.authorization.permissions]
                }

                if (noneEmptyStringArray(button.authorization.permissions)) {

                    if (typeof button.authorization.permissions !== "string") {
                        for (const permission of button.authorization.permissions) {
                            if (!permissions.includes(permission)) {
                                return Table.addRow('FAILED', button.data.name, 'INVALID PERMISSIONS');
                            }
                        }
                    }

                    if (button.authorization.permissions) {
                        if (!button.authorization.permissionsError) {
                            return Table.addRow('FAILED', button.data.name, 'MISSING PERMISSION ERROR');
                        }
                    }

                }
            }
        }

        if (!button.execute) {
            return Table.addRow("FAILED", button.data.name, 'MISSING EXECUTE FUNCTION');
        }

        client.button.set(button.data.name, button);
        Table.addRow('SUCCESS', button.data.name, "BUTTON LOADED");
    })

    console.log(Table.toString().green);
}

/**
 * Load all select menu items
 * @param {Discord.Client} client 
 */
async function SelectMenu(client) {

    const PG = promisify(glob)
    const { noneEmptyStringArray } = Util;
    const Table = new ASCII('Select Menu Loaded');
    Table.setHeading('Status', 'Name', 'Description');

    (await PG(`/src/data/components/selectmenu/**/*.js`, { root: process.cwd() })).map(file => {

        const path = file.split("\\");
        const select = require(file);

        if (!select.data) {
            return Table.addRow('FAILED', `MISSING DATA OBJECT`);
        }

        if (!select.data.name) {
            return Table.addRow('FAILED', `MISSING NAME`);
        }

        if (select.cooldown) {

            if (select.cooldown.time) {
                if (isNaN(select.cooldown.time)) {
                    return Table.addRow('FAILED', select.data.name, 'COOLDOWN MUST BE A NUMBER')
                }
    
                if (!select.cooldown.unit) {
                    return Table.addRow('FAILED', select.data.name, 'MISSING COOLDOWN UNIT');
                }
    
                if (!cooldowns.includes(select.cooldown.unit)) {
                    return Table.addRow('FAILED', select.data.name, 'INVALID COOLDOWN UNIT');
                }
    
            }

        }
        
        if (select.authorization) {

            if (typeof select.authorization.status !== 'boolean') {
                return Table.addRow('FAILED', select.data.name, 'AUTHORIZATION STATUS MUST BE A BOOLEAN');
            }

            if (select.authorization.users) {
                if (typeof select.authorization.users === "string") {
                    select.authorization.users = [select.authorization.users];
                }

                if (noneEmptyStringArray(select.authorization.users)) {
                    if (!select.authorization.usersError) {
                        return Table.addRow('FAILED', select.data.name, 'MISSING AUTHORIZATION USERS ERROR');
                    }
                }
            }

            if (select.authorization.roles) {
                if (typeof select.authorization.roles === "string") {
                    select.authorization.roles = [select.authorization.roles];
                }

                if (noneEmptyStringArray(select.authorization.roles)) {
                    if (!select.authorization.rolesError) {
                        return Table.addRow('FAILED', select.data.name, 'MISSING AUTHORIZATION ROLES ERROR');
                    }
                }
            }

            if (select.authorization.banned) {
                if (typeof select.authorization.banned === "string") {
                    select.authorization.banned = [select.authorization.banned];
                }

                if (noneEmptyStringArray(select.authorization.banned)) {
                    if (!select.authorization.bannedError) {
                        return Table.addRow('FAILED', select.data.name, 'MISSING AUTHORIZATION BANNED ERROR');
                    }
                }
            }

            if (select.authorization.permissions) {
                if (typeof select.authorization.permissions === "string") {
                    select.authorization.permissions = [select.authorization.permissions]
                }

                if (noneEmptyStringArray(select.authorization.permissions)) {

                    if (typeof select.authorization.permissions !== "string") {
                        for (const permission of select.authorization.permissions) {
                            if (!permissions.includes(permission)) {
                                return Table.addRow('FAILED', select.data.name, 'INVALID PERMISSIONS');
                            }
                        }
                    }

                    if (select.authorization.permissions) {
                        if (!select.authorization.permissionsError) {
                            return Table.addRow('FAILED', select.data.name, 'MISSING PERMISSION ERROR');
                        }
                    }

                }
            }
        }

        if (!select.execute) {
            return Table.addRow("FAILED", select.data.name, 'MISSING EXECUTE FUNCTION');
        }

        client.select.set(select.data.name, select);
        Table.addRow('SUCCESS', select.data.name, "BUTTON LOADED");

    })

    console.log(Table.toString().green);
}

/**
 * Load modal file and verify it
 * @param {Discord.Client} client 
 */
async function ModalSubmit(client) {

    const PG = promisify(glob)
    const { noneEmptyStringArray } = Util;
    const Table = new ASCII('Modal Submit Loaded');
    Table.setHeading('Status', 'Name', 'Description', 'Origin');

    (await PG(`/src/data/components/modal/**/*.js`, { root: process.cwd() })).map(file => {

        const path = file.split("\\");
        const modal = require(file);

        if (!modal.data) {
            return Table.addRow('FAILED', `MISSING DATA OBJECT`);
        }

        if (!modal.data.name) {
            return Table.addRow('FAILED', `MISSING NAME`);
        }

        if (modal.cooldown && modal.cooldown.time !== 0) {

            const cooldown = modal.cooldown;

            if (isNaN(cooldown.time)) {
                return Table.addRow('FAILED', modal.data.name, 'COOLDOWN MUST BE A NUMBER')
            }

            if (!cooldown.unit) {
                return Table.addRow('FAILED', modal.data.name, 'MISSING COOLDOWN UNIT');
            }

            if (!cooldowns.includes(cooldown.unit)) {
                return Table.addRow('FAILED', modal.data.name, 'INVALID COOLDOWN UNIT');
            }

        }

        if (modal.authorization) {

            if (typeof modal.authorization.status !== 'boolean') {
                return Table.addRow('FAILED', modal.data.name, 'AUTHORIZATION STATUS MUST BE A BOOLEAN');
            }

            if (modal.authorization.users) {
                if (typeof modal.authorization.users === "string") {
                    modal.authorization.users = [modal.authorization.users];
                }

                if (noneEmptyStringArray(modal.authorization.users)) {
                    if (!modal.authorization.usersError) {
                        return Table.addRow('FAILED', modal.data.name, 'MISSING AUTHORIZATION USERS ERROR');
                    }
                }
            }

            if (modal.authorization.roles) {
                if (typeof modal.authorization.roles === "string") {
                    modal.authorization.roles = [modal.authorization.roles];
                }

                if (noneEmptyStringArray(modal.authorization.roles)) {
                    if (!modal.authorization.rolesError) {
                        return Table.addRow('FAILED', modal.data.name, 'MISSING AUTHORIZATION ROLES ERROR');
                    }
                }
            }

            if (modal.authorization.banned) {
                if (typeof modal.authorization.banned === "string") {
                    modal.authorization.banned = [modal.authorization.banned];
                }

                if (noneEmptyStringArray(modal.authorization.banned)) {
                    if (!modal.authorization.bannedError) {
                        return Table.addRow('FAILED', modal.data.name, 'MISSING AUTHORIZATION BANNED ERROR');
                    }
                }
            }

            if (modal.authorization.permissions) {
                if (typeof modal.authorization.permissions === "string") {
                    modal.authorization.permissions = [modal.authorization.permissions]
                }

                if (noneEmptyStringArray(modal.authorization.permissions)) {

                    if (typeof modal.authorization.permissions !== "string") {
                        for (const permission of modal.authorization.permissions) {
                            if (!permissions.includes(permission)) {
                                return Table.addRow('FAILED', modal.data.name, 'INVALID PERMISSIONS');
                            }
                        }
                    }

                    if (modal.authorization.permissions) {
                        if (!modal.authorization.permissionsError) {
                            return Table.addRow('FAILED', modal.data.name, 'MISSING PERMISSION ERROR');
                        }
                    }

                }
            }
        }

        if (!modal.execute) {
            return Table.addRow("FAILED", modal.data.name, 'MISSING EXECUTE FUNCTION');
        }

        client.modal.set(modal.data.name, modal);
        Table.addRow('SUCCESS', modal.data.name, "Modal Submit Loaded");

    })

    console.log(Table.toString().magenta);

}

module.exports = {
    Button,
    SelectMenu,
    ModalSubmit
}